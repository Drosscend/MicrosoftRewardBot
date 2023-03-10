import dotenv from 'dotenv';
import puppeteer from 'puppeteer-extra';
// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// Add adblocker plugin to block all ads and trackers (saves bandwidth)
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import {getEdgePath} from "edge-paths";
import {GoogleTrends} from "./googleTrend.js";
import {Page} from 'puppeteer';

dotenv.config();

puppeteer.use(StealthPlugin())

puppeteer.use(AdblockerPlugin({blockTrackers: true}))

if (process.env['BING_USERNAME'] === undefined || process.env['BING_PASSWORD'] === undefined) {
    throw new Error('BING_USERNAME and BING_PASSWORD must be set in .env file');
}
const BING_USERNAME = process.env['BING_USERNAME'];
const BING_PASSWORD = process.env['BING_PASSWORD'];
// Define user-agents
const PC_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.183 Safari/537.36 Edg/86.0.622.63'
const MOBILE_USER_AGENT = 'Mozilla/5.0 (Linux; Android 10; Pixel 3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0. 3945.79 Mobile Safari/537.36'

/**
 * Wait for a given amount of time
 * @param {number} ms - The amount of time to wait in milliseconds
 * @returns {Promise} - A promise that resolves after the given amount of time
 */
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Make research on Bing
 * @param client - The puppeteer client
 * @param {string} query - The query to search
 */
const search = async (client: Page, query: string | undefined) => {
    await client.goto(`https://www.bing.com/search?q=${query}`);
    await wait(1000);
};

/**
 * Login to Bing
 * @param client - The puppeteer client
 * @returns {Promise<void>} - A promise that resolves after the login
 */
const loginAction = async (client: Page) => {
    await client.goto('https://rewards.bing.com/');
    await client.waitForSelector(`input[name="loginfmt"]`);
    await client.type(`input[name="loginfmt"]`, BING_USERNAME);
    await client.click(`input[id="idSIButton9"]`);
    await wait(2000);

    await client.waitForSelector(`input[name="passwd"]`);
    await client.type(`input[name="passwd"]`, BING_PASSWORD);
    await client.click(`input[id="idSIButton9"]`);
    await wait(2000);

    console.log("Connexion à Bing réussie");
};

/**
 * Get Google Trend and make research on Bing on PC and mobile agent
 * @param client - The puppeteer client
 */
const searchAction = async (client: Page) => {
    const googleTrends = new GoogleTrends();
    const googleTrendTab = await googleTrends.getGoogleTrends(client, 60);
    if (googleTrendTab != null) {
        console.log("Recherche des tendances Google avec un user agent PC");
        await client.setUserAgent(PC_USER_AGENT);
        for (let i = 0; i < googleTrendTab.length; i++) {
            await search(client, googleTrendTab[i]?.query);
        }
        console.log("Recherche des tendances Google avec un user agent mobile");
        await client.setUserAgent(MOBILE_USER_AGENT);
        for (let i = 0; i < googleTrendTab.length; i++) {
            await search(client, googleTrendTab[i]?.query);
        }
    } else {
        console.log("Aucune tendance Google n'a été trouvée");
    }
}

/**
 * Get user info
 * @param client - The puppeteer client
 */
const getUserInfo = async (client: Page) => {
    await client.goto('https://rewards.bing.com/api/getuserinfo?type=1&X-Requested-With=XMLHttpRequest');
    const response = await client.evaluate(() => {
        return document.querySelector('pre')?.innerHTML;
    });
    if (response != null) {
        return JSON.parse(response);
    }
    return null;
}


/**
 * Main function
 * @param productionMode - If true, the browser will be launched in headless mode
 */
const main = (productionMode: boolean) => {
    puppeteer.launch({
        headless: productionMode,
        ignoreDefaultArgs: ['--disable-extensions'],
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath: getEdgePath()
    }).then(async browser => {
        const Page = await browser.newPage();
        await Page.setViewport({width: 1200, height: 700});
        await Page.setDefaultNavigationTimeout(60000);
        await Page.setUserAgent(PC_USER_AGENT);

        //Login
        await loginAction(Page);

        // Get user info
        const userInfo = await getUserInfo(Page);
        if (userInfo != null) {
            console.log("Points Bing avant : " + userInfo?.dashboard?.userStatus?.availablePoints);
        }

        await wait(100000);

        // Get Google Trend
        await searchAction(Page);

        // Set user agent to default
        await Page.setUserAgent(PC_USER_AGENT);

        await browser.close();
        console.log("Fin du script");
    });
}

main(false);

