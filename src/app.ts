import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import {getGoogleTrends} from "./modules/googleTrend.js";
import {getPoints, getUserInfo, progressBar, search, wait} from "./modules/utils.js";
import {config} from "./modules/config.js";
import {Page} from "puppeteer";
import {Response} from "./modules/Dashboard.js";
import colors from "ansi-colors";

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
 * Open promotions links
 * @param client - The puppeteer client
 * @param userInfo - The user info
 */
const promoAction = async (client: Page, userInfo: Response) => {
    const bar = progressBar("Ouverture des promotions", 100);

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
 * Get Google Trend and make research on Bing on PC and mobile agent
 * @param client - The puppeteer client
 * @param nbTends - The number of trends to get
 */
const searchAction = async (client: Page, nbTends: number) => {
    const bar = progressBar("Recherche des tendances Google (PC et mobile)", nbTends);

    const googleTrendTab = await getGoogleTrends(client, nbTends);

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
        bar.update(nbTrends * 2);
        bar.stop();
    } else {
        console.log("Aucune tendance Google n'a été trouvée");
    }
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
            let userInfo = await getUserInfo(page);

            // Get points before
            const pointBefore = await getPoints(userInfo);
            console.log(`Points avant l'utilisation du script : ${colors.cyan(String(pointBefore))}`);

            await promoAction(page, userInfo);

            await searchAction(page, 100);

            await page.setUserAgent(config.userAgent.pc);

            // Update user info
            userInfo = await getUserInfo(page);
            const pointAfter = await getPoints(userInfo);
            console.log(`Points après l'utilisation du script : ${colors.cyan(String(pointAfter))} | Gain : ${colors.green(String(pointAfter - pointBefore))}`);
            await browser.close();
            console.log("Fin du script");
        });
}

app();
