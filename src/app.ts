import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import {getGoogleTrends} from './modules/googleTrend.js';
import {
    acceptCookies,
    Bingsearch,
    getPoints,
    getUserInfo,
    progressBar,
    promoLogin,
    wait,
    waitRandom
} from './modules/utils.js';
import {config} from './modules/config.js';
import {Page} from 'puppeteer';
import {apiResponse} from './modules/Dashboard.js';
import colors from 'ansi-colors';

/**
 * Login to Bing
 * @param page - The puppeteer page
 * @returns {Promise<void>} - A promise that resolves after the login
 */
const loginAction = async (page: Page): Promise<void> => {
    console.log("Login to Bing...");

    await page.goto('https://rewards.bing.com/');

    await page.waitForSelector(`input[name='loginfmt']`);
    await page.type(`input[name='loginfmt']`, config.bing.username);
    await page.click(`input[id='idSIButton9']`);
    await wait(2000);

    await page.waitForSelector(`input[name='passwd']`);
    await page.type(`input[name="passwd"]`, config.bing.password);
    await page.click(`input[id="idSIButton9"]`);
    await wait(3000);

    // 2-factor authentication verification
    const twoFactorAuth = await page.$(`input[name="otc"]`);
    if (twoFactorAuth != null) {
        await page.close();
        throw new Error("Bing account has 2-factor authentication, please disable it");
    }

    // Checking a popup to stay connected
    const stayConnected = await page.$(`input[id="idSIButton9"]`);
    if (stayConnected != null) {
        await page.click(`input[id="idSIButton9"]`);
        await wait(2000);
    }

    // Checking for the presence of a cookie banner
    const cookiesBannerDiv = await page.$(`div[id="cookieConsentContainer"]`);
    if (cookiesBannerDiv != null) {
        console.log("Accepting cookies...");
        await page.waitForSelector(`#wcpConsentBannerCtrl button:nth-child(1)`);
        await page.click('#wcpConsentBannerCtrl button:nth-child(1)');
        await wait(2000);
    }

    // Checking the connection
    const pageTitle = await page.title();
    if (pageTitle !== "Microsoft Rewards") {
        await page.close();
        throw new Error("Bing login failed");
    } else {
        console.log("Bing login successful");
        await wait(10000);
    }
};

/**
 * DailySetPromotions
 * @param page - The puppeteer page
 * @param userInfo - The user info
 * @returns {Promise<void>} - A promise that resolves after the DailySetPromotions
 */
const  dailySetPromotions = async (page: Page, userInfo: apiResponse): Promise<void> => {
    const todayDate = new Date().toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'});
    const dailySetPromotions = userInfo.dashboard.dailySetPromotions[todayDate];

    if (dailySetPromotions == null) {
        console.log(colors.red("No dailySetPromotions found"));
        return;
    }

    const promotions = dailySetPromotions.filter((promo) => !promo.complete && promo.pointProgressMax > 0 && promo.isGiveEligible);
    const nbPromo = promotions.length;
    if (nbPromo === 0) {
        console.log(colors.yellow("You have already completed all the dailySetPromotions"));
        return;
    }

    const bar = progressBar("Opening dailySetPromotions", nbPromo);

    for (let i = 0; i < nbPromo; i++) {
        bar.update(i);
        await page.goto(promotions[i]!.destinationUrl);

        // Checking for a cookie popup
        await acceptCookies(page);

        // Checking for a possible connection request
        await promoLogin(page);

        switch (promotions[i]!.promotionType) {
            // If the promotion type is a search, do nothing
            case "urlreward":
                break;

            // If the promotion type is a quiz, check if it's a poll or a quiz
            case "quiz":
                // Check if the quiz is a survey
                if (promotions[i]!.pointProgressMax === 10) {
                    // answer 0 or 1 (random)
                    const reponse = ["btoption0", "btoption1"][Math.floor(Math.random() * 2)];
                    // Check if the div with the id of the answer exists
                    const answer = await page.$(`#${reponse}`);
                    if (answer != null) {
                        await page.click(`#${reponse}`);
                    }
                }

                else if (promotions[i]!.pointProgressMax === 30) {
                    // TODO
                    // As long as the quiz is not finished
                    while (await page.$(`div[id="quizCompleteContainer"]`) == null) {
                        //Tant que les rqMCredits ne sont pas chargés
                        let rqMCreditsBefore = await page.$(`div[id="rqMCredits"]`);
                        let rqMCreditsAfter = await page.$(`div[id="rqMCredits"]`);

                        while (rqMCreditsBefore == rqMCreditsAfter) {
                            for (let i = 1; i < 8; i++) {
                                await page.click(`div[id="rqM${i}"]`);
                                await waitRandom(1000, 2000);
                                rqMCreditsAfter = await page.$(`div[id="rqMCredits"]`);
                                if (rqMCreditsBefore != rqMCreditsAfter) {
                                    break;
                                }
                            }
                        }
                    }
                }

                else if (promotions[i]!.pointProgressMax === 50) {
                    break;
                }
            break;
        }
        await waitRandom(4000, 6000);
    }
    bar.update(nbPromo);
    bar.stop();
};

/**
 * Open promotions links
 * @param page - The puppeteer page
 * @param userInfo - The user info
 * @returns {Promise<void>} - A promise that resolves after the promotions links opening
 */
const promoAction = async (page: Page, userInfo: apiResponse): Promise<void> => {
    const morePromotionsObject = userInfo.dashboard.morePromotions.filter(
        (promo) => !promo.complete && promo.promotionType === "urlreward" && promo.pointProgressMax > 0
    );

    const nbPromo = morePromotionsObject.length;

    if (nbPromo === 0) {
        console.log(colors.yellow("You have already completed all the promotions"));
        return;
    }

    const bar = progressBar("Opening promotions", nbPromo);

    for (let i = 0; i < nbPromo; i++) {
        bar.update(i);
        await page.goto(morePromotionsObject[i]!.destinationUrl);
        await acceptCookies(page);
        await waitRandom(4000, 5000);
    }

    bar.update(nbPromo);
    bar.stop();
}

/**
 * Get Google Trend and make research on Bing on PC and mobile agent
 * @param page - The puppeteer page
 * @param userInfo - The user info
 * @returns {Promise<void>} - A promise that resolves after the research
 */
const searchAction = async (page: Page, userInfo: apiResponse): Promise<void> => {
    // Check if the user has already completed the daily search
    const desktopSearchPointsState = userInfo.dashboard.userStatus.counters.pcSearch[0]?.complete
    const mobileSearchPointsState = userInfo.dashboard.userStatus.counters.mobileSearch ? userInfo.dashboard.userStatus.counters.mobileSearch[0]?.complete : false;
    if (desktopSearchPointsState && mobileSearchPointsState) {
        console.log(colors.yellow("You have already completed the daily search (PC and mobile)"));
        return;
    }

    const googleTrendArrayOfQuery = await getGoogleTrends(page, config.gooogleTrends.nbBingSearch);

    if (googleTrendArrayOfQuery == null) {
        console.log(colors.red("No Google Trend found"));
        return;
    }

    if (!desktopSearchPointsState) {
        // Calcul of the number of points to get
        const pcSearch = userInfo.dashboard.userStatus.counters.pcSearch[0];
        if (pcSearch == null) {
            console.log(colors.red("No pcSearch found"));
            return;
        }
        const pointsRemaining = pcSearch.pointProgressMax - pcSearch.pointProgress;

        // Calculation of the number of searches to be done: pointsRemaining / points earned per search
        const PCnbTends = Math.floor(pointsRemaining / config.app.nbPtsPerSearch);

        const bar = progressBar("Bing search on PC", PCnbTends);

        // Reduction of the search table
        googleTrendArrayOfQuery.slice(0, PCnbTends)

        await page.setUserAgent(config.userAgent.pc);
        for (let i = 0; i < PCnbTends; i++) {
            bar.update(i);
            await Bingsearch(page, googleTrendArrayOfQuery[i])
        }

        bar.update(PCnbTends);
        bar.stop();
    } else {
        console.log(colors.yellow("You have already completed the daily search (PC)"));
    }

    if (!mobileSearchPointsState) {
        const pcSearch = userInfo.dashboard.userStatus.counters.mobileSearch[0];
        if (pcSearch == null) {
            console.log(colors.red("No pcSearch found"));
            return;
        }
        const pointsRemaining = pcSearch.pointProgressMax - pcSearch.pointProgress;

        // Calculation of the number of searches to be done: pointsRemaining / points earned per search
        const MobilenbTends = Math.floor(pointsRemaining / config.app.nbPtsPerSearch);

        const bar = progressBar("Bing search on mobile", MobilenbTends);

        // Reduction of the search table
        googleTrendArrayOfQuery.slice(0, MobilenbTends)

        await page.setUserAgent(config.userAgent.mobile);
        for (let i = 0; i < MobilenbTends; i++) {
            bar.update(i);
            await Bingsearch(page, googleTrendArrayOfQuery[i]);
        }

        bar.update(MobilenbTends);
        bar.stop();
    } else {
        console.log(colors.yellow("You have already completed the daily search (mobile)"));
    }

    await page.setUserAgent(config.userAgent.pc);
}

/**
 * Welcome message
 */
const showWelcomeMessage = (): void => {
    console.log(colors.white("Welcome to this scpript to earn Bing points"));
    console.log(colors.white("This script is open source and available on GitHub : https://github.com/Drosscend/MicrosoftRewardBot"));
    console.log(colors.white("You can contact me on discord (Drosscend#6715) if you have any questions or remarks"));
    console.log(colors.white("I made this script to practice my TypeScript knowledge and to have fun"));
    console.log(colors.red("This script is to be used at your own risk"));
    console.log("--------------------------------------------");
    // Display of the configuration
    console.log(colors.white("Configuration :"));
    console.log(colors.white(`- User : ${colors.green(config.bing.username)}`));
    console.log(colors.white(`- Headless mode : ${config.puppeteer.headless ? colors.green("Active") : colors.red("Inactive")}`));
    console.log(colors.white(`- Number of Google trends to search : ${colors.green(config.gooogleTrends.nbBingSearch.toString())}`));
    console.log(colors.white(`- Realization of the day's promotions : ${config.app.doDailySetPromotions ? colors.green("Active") : colors.red("Inactive")}`));
    console.log(colors.white(`- Realization of additional promotions : ${config.app.doMorePromotions ? colors.green("Active") : colors.red("Inactive")}`));
    console.log(colors.white(`- Performing Bing searches : ${config.app.doDailySearch ? colors.green("Active") : colors.red("Inactive")}`));
    console.log("--------------------------------------------");
}


(async () => {
    showWelcomeMessage();

    puppeteer
        .use(StealthPlugin())
        .use(AdblockerPlugin({blockTrackers: false}))
        .launch(
            {
                headless: config.puppeteer.headless,
                args: config.puppeteer.args,
                executablePath: config.puppeteer.executablePath,
            }
        )
        .then(async browser => {
            // Set up browser and page.
            const page = await browser.newPage();
            await page.setViewport({width: 1920, height: 1080});
            page.setDefaultNavigationTimeout(60000);
            page.setDefaultTimeout(60000);
            await page.setUserAgent(config.userAgent.pc);

            // Login
            await loginAction(page);

            // Get user info
            let userInfo = await getUserInfo(page);

            // Get points before
            const pointBefore = await getPoints(userInfo);
            console.log(`Points before using the script : ${colors.cyan(String(pointBefore))}`);

            // DailySetPromotions
            if (config.app.doDailySetPromotions) await dailySetPromotions(page, userInfo);

            // Promotions
            if (config.app.doMorePromotions) await promoAction(page, userInfo);

            // Search
            if (config.app.doDailySearch) await searchAction(page, userInfo);

            // Update user info
            userInfo = await getUserInfo(page);
            const pointAfter = await getPoints(userInfo);

            console.log(`Points after using the script : ${colors.cyan(String(pointAfter))} | Profit : ${colors.green(String(pointAfter - pointBefore))}`);

            await browser.close();
            console.log("End of the script");
        });
})();
