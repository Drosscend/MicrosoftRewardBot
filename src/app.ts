import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import {getGoogleTrends} from "./modules/googleTrend.js";
import {wait} from "./modules/utils.js";
import {config} from "./modules/config.js";
import {Page} from "puppeteer";
import {Response} from "./modules/Dashboard.js";
import {Bar} from "cli-progress";
import colors from "ansi-colors";

/**
 * Make research on Bing
 * @param client - The puppeteer client
 * @param {string} query - The query to search
 */
const search = async (client: Page, query: string | undefined) => {
    await client.goto(`https://www.bing.com/search?q=${query}`);
    await wait(500);
};

/**
 * Get Google Trend and make research on Bing on PC and mobile agent
 * @param client - The puppeteer client
 */
const searchAction = async (client: Page) => {
    // Search progress bar
    const bar = new Bar({
        format: 'Recherche des tendances Google (PC et mobile) |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });

    const googleTrendTab = await getGoogleTrends(client, 100);

    if (googleTrendTab != null) {
        const nbTrends = googleTrendTab.length;
        bar.start(nbTrends * 2, 0);
        await client.setUserAgent(config.userAgent.pc);
        for (let i = 0; i < nbTrends; i++) {
            bar.update(i);
            await search(client, googleTrendTab[i])
        }

        await client.setUserAgent(config.userAgent.mobile);
        for (let i = 0; i < nbTrends; i++) {
            bar.update(i + nbTrends);
            await search(client, googleTrendTab[i]);
        }
        bar.stop();
    } else {
        console.log("Aucune tendance Google n'a été trouvée");
    }
}

/**
 * Login to Bing
 * @param client - The puppeteer client
 * @returns {Promise<void>} - A promise that resolves after the login
 */
const loginAction = async (client: Page) => {
    console.log("Connexion à Bing");

    await client.goto('https://rewards.bing.com/');
    await client.waitForSelector(`input[name="loginfmt"]`);
    await client.type(`input[name="loginfmt"]`, config.bing.username);
    await client.click(`input[id="idSIButton9"]`);
    await wait(2000);

    await client.waitForSelector(`input[name="passwd"]`);
    await client.type(`input[name="passwd"]`, config.bing.password);
    await client.click(`input[id="idSIButton9"]`);
    await wait(2000);

    console.log("Connexion à Bing réussie");
};

/**
 * Get user info
 * @param client - The puppeteer client
 * @returns {Promise<Response>} - A promise that resolves after the login
 */
const getUserInfo = async (client: Page): Promise<Response> => {
    await client.goto('https://rewards.bing.com/api/getuserinfo?type=1&X-Requested-With=XMLHttpRequest');
    const response = await client.$('pre');
    if (response == null) {
        throw new Error('No response');
    }
    const text = await response.getProperty('textContent');
    const json = await text.jsonValue();
    return JSON.parse(json!);
}

/**
 * Open promotions links
 * @param client - The puppeteer client
 * @param userInfo - The user info
 */
const getmorePromo = async (client: Page, userInfo: Response) => {
    const bar = new Bar({
        format: 'Ouverture des promotions |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });

    const morePromotionsObject = userInfo.dashboard.morePromotions;

    const nbPromo = morePromotionsObject.length;
    bar.start(nbPromo, 0);

    for (let i = 0; i < nbPromo; i++) {
        bar.update(i);
        if (!morePromotionsObject[i]!.complete && morePromotionsObject[i]!.isGiveEligible) {
            await client.goto(morePromotionsObject[i]!.destinationUrl);
        }
    }
    bar.update(nbPromo);
    bar.stop();
}

/**
 * Get today promotion
 * @param userInfo - The user info
 * @returns {Promise<Promotion[]>} - A promise containt the 3 today promotion
 */
// const getToDayPromotion = async (userInfo: Response): Promise<Promotion[]> => {
//     return userInfo.dashboard.dailySetPromotions[0]!;
// }

/**
 * Get points
 * @param userInfo - The user info
 */
const getPoints = async (userInfo: Response) => {
    return userInfo.dashboard.userStatus.availablePoints
}

/**
 * Main function
 */
const app = () => {
    puppeteer
        .use(StealthPlugin())
        .use(AdblockerPlugin({blockTrackers: true}))
        .launch(
            {
                headless: config.puppeteer.headless,
                args: config.puppeteer.args,
                executablePath: config.puppeteer.executablePath,
            }
        )
        .then(async browser => {
            const page = await browser.newPage();
            await page.setViewport({width: 1200, height: 700});
            await page.setDefaultNavigationTimeout(60000);
            await page.setUserAgent(config.userAgent.pc);

            //Login
            await loginAction(page);

            // Get user info
            const userInfo = await getUserInfo(page);

            // Get points before
            const pointBefore = await getPoints(userInfo);
            console.log(`Points avant l'utilisation du script : ${pointBefore}`);

            // Get more promotions
            await getmorePromo(page, userInfo);

            // Get Google Trend
            await searchAction(page);

            // Set user agent to default
            await page.setUserAgent(config.userAgent.pc);

            const pointAfter = await getPoints(userInfo);
            console.log(`Points après l'utilisation du script : ${pointAfter} | (${pointAfter - pointBefore} points lors de l'utilisation du script)`);
            await browser.close();
            console.log("Fin du script");
        });
}

app();

