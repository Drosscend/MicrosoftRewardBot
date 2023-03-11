import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import {getGoogleTrends} from "./modules/googleTrend.js";
import {wait} from "./modules/utils.js";
import {config} from "./modules/config.js";
// import {Dashboard} from "./modules/Dashboard.js";
import {Page} from "puppeteer";

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
 */
// const getUserInfo = async (client: Page): Promise<any> => {
//     await client.goto('https://rewards.bing.com/api/getuserinfo?type=1&X-Requested-With=XMLHttpRequest');
//     const response = await client.evaluate(() => {
//         return document.querySelector('pre')?.innerHTML;
//     });
//     return JSON.parse(response!);
// }

// const getmorePromo = async (userInfo: any) => {
//     const morePromotionsObject = userInfo?.dashboard?.userStatus?.morePromotions;
//     // morePromotions est un tableau d'objet
//     // récupére le lien "destination" qui est dans morePromotions [] -> attributes -> destination
//     // Si le tableau est vide, on ne fait rien
//     if (morePromotionsObject.length > 0) {
//         for (let i = 0; i < morePromotionsObject.length; i++) {
//             const destination = morePromotionsObject[i].attributes.destination;
//             console.log(destination);
//             //await client.goto(destination);
//         }
//     }
// }

/**
 * Main function
 */
const main = () => {
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
            // const userInfo = await getUserInfo(page);
            // if (userInfo != null) {
            //     console.log("Points Bing avant : " + userInfo.userStatus.availablePoints);
            // }

            // Get more promotions
            // await getmorePromo(userInfo);

            // Get Google Trend
            await searchAction(page);

            // Set user agent to default
            await page.setUserAgent(config.userAgent.pc);

            await browser.close();
            console.log("Fin du script");
        });
}

main();

