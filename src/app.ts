import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import {getGoogleTrends} from "./modules/googleTrend.js";
import {wait} from "./modules/utils.js";
import {config} from "./modules/config.js";
import {Page} from "puppeteer";
import {Response} from "./modules/Dashboard.js";

/**
 * Make research on Bing
 * @param client - The puppeteer client
 * @param {string} query - The query to search
 */
const search = async (client: Page, query: string | undefined) => {
    await client.goto(`https://www.bing.com/search?q=${query}`);
    await wait(2000);
};

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
 * Get Google Trend and make research on Bing on PC and mobile agent
 * @param client - The puppeteer client
 */
const searchAction = async (client: Page) => {
    const googleTrendTab = await getGoogleTrends(client, 100);
    if (googleTrendTab != null) {
        console.log("Recherche des tendances Google avec un user agent PC");
        await client.setUserAgent(config.userAgent.pc);
        for (let i = 0; i < googleTrendTab.length; i++) {
            await search(client, googleTrendTab[i])
        }
        console.log("Recherche des tendances Google avec un user agent mobile");
        await client.setUserAgent(config.userAgent.mobile);
        for (let i = 0; i < googleTrendTab.length; i++) {
            await search(client, googleTrendTab[i]);
        }
    } else {
        console.log("Aucune tendance Google n'a été trouvée");
    }
}

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
    console.log("Ouverture des promotions");
    const morePromotionsObject = userInfo.dashboard.morePromotions;
    for (let i = 0; i < morePromotionsObject.length; i++) {
        if (!morePromotionsObject[i]!.complete && morePromotionsObject[i]!.isGiveEligible) {
            console.log(`Ouverture de la page ${morePromotionsObject[i]!.attributes.title} pour obtenir ${morePromotionsObject[i]!.pointProgress} points`);
            await client.goto(morePromotionsObject[i]!.destinationUrl);
        }
    }
    console.log("Fin de l'ouverture des promotions");
}

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
            console.log("Récupération des informations de l'utilisateur");
            const userInfo = await getUserInfo(page);

            // Get points before
            const pointBefore = await getPoints(userInfo);
            console.log(`Vous avez ${pointBefore} points avant la recherche`);

            // Get more promotions
            await getmorePromo(page, userInfo);

            // Get points after
            console.log("Vous avez maintenant " + await getPoints(userInfo) + " points");

            // Get Google Trend
            await searchAction(page);

            // Get points after
            console.log("Vous avez maintenant " + await getPoints(userInfo) + " points");

            // Set user agent to default
            await page.setUserAgent(config.userAgent.pc);

            const pointAfter = await getPoints(userInfo);
            console.log(`Vous avez ${pointAfter} points après la recherche`);
            console.log(`Vous avez gagné ${pointAfter - pointBefore} points`);
            await browser.close();
            console.log("Fin du script");
        });
}

app();

