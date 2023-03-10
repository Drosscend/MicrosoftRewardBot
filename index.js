const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const dotenv = require('dotenv')
dotenv.config();

const google = require('./getGoogleTrend.js');

const REWARD_PAGE_URL = 'https://rewards.bing.com/';
const BING_USERNAME = process.env.BING_USERNAME;
const BING_PASSWORD = process.env.BING_PASSWORD;

/**
 * Wait for a given amount of time
 * @param {number} ms - The amount of time to wait in milliseconds
 * @returns {Promise} - A promise that resolves after the given amount of time
 */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Make research on Bing
 * @param {Page} page - The page to use
 * @param {string} query - The query to search
 */
const search = async (page, query) => {
    await page.goto(`https://www.bing.com/search?q=${query}`);
    await page.waitForSelector(".b_algo");
    await wait(1000);
};

const bingLogin = async (page) => {
    await page.type('#i0116', BING_USERNAME);
    await page.click('#idSIButton9');
    await page.waitForSelector('#i0118');
    await page.type('#i0118', BING_PASSWORD);
    await wait(500);
    await page.click('#idSIButton9');
    await page.waitForNavigation();
    await page.click('#idSIButton9');
    await page.waitForNavigation();
    console.log('Logged in');
};

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    const page = await browser.newPage();
    page.setViewport({ width: 1200, height: 700 });
    await page.setDefaultNavigationTimeout(60000);

    // await page.goto(REWARD_PAGE_URL);

    // Login
    // await bingLogin(page);

    const googleTrendTab = await google.getTrends(page)

    await googleTrendTab.forEach(element => {
        search(page, element.title)
    });

    await browser.close();
})();