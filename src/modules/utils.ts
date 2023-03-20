import {Bar} from 'cli-progress';
import colors from 'ansi-colors';
import {Page} from 'puppeteer';
import {apiResponse} from './Dashboard.js';
import {config} from './config.js';

/**
 * Wait for a given amount of time
 * @param {number} ms - The amount of time to wait in milliseconds
 * @returns {Promise} - A promise that resolves after the given amount of time
 */
export const wait = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait for a given amount of time between min and max
 * @param {number} min - The minimum amount of time to wait in milliseconds
 * @param {number} max - The maximum amount of time to wait in milliseconds
 * @returns {Promise} - A promise that resolves after the given amount of time
 */
export const waitRandom = (min: number, max: number): Promise<void> => {
    const random = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise((resolve) => setTimeout(resolve, random));
}

/**
 * Create a progress bar
 * @param title - The title of the progress bar
 * @param total - The number of trends to get
 * @returns {Bar} - The progress bar
 */
export const progressBar = (title: string, total: number): Bar => {
    const bar = new Bar({
        format: `${title} |` + colors.cyan('{bar}') + '| {percentage}% || {value}/{total}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });
    bar.start(total, 0);
    return bar;
}

/**
 * Make research on Bing
 * @param page - The puppeteer client
 * @param {string} query - The query to search
 * @returns {Promise<void>} - A promise that resolves after the search
 */
export const Bingsearch = async (page: Page, query: string | undefined): Promise<void> => {
    await page.goto(`https://www.bing.com/search?q=${query}`);
    await waitRandom(4000, 6000);
};

/**
 * Get user info
 * @param page - The puppeteer client
 * @returns {Promise<apiResponse>} - A promise that resolves after the login
 */
export const getUserInfo = async (page: Page): Promise<apiResponse> => {
    const response = await page.goto('https://rewards.bing.com/api/getuserinfo?type=1&X-Requested-With=XMLHttpRequest');

    if (response) {
        if (!response.ok()) {
            throw new Error(`Failed to get user info: ${response.status()} - ${response.statusText()}`);
        }
        const body = await response.text();
        return JSON.parse(body);
    } else {
        throw new Error('Failed to get user info');
    }
}

/**
 * Get points
 * @param userInfo - The user info
 * @returns {number} - The number of points
 */
export const getPoints = async (userInfo: apiResponse): Promise<number> => {
    return userInfo.dashboard.userStatus.availablePoints
}

/**
 * Login to Bing
 * @param page - The puppeteer client
 * @returns {Promise<void>} - A promise that resolves after the login
 */
export const promoLogin = async (page: Page): Promise<void> => {
    const login = await page.$(`a[target="_top"]`);
    if (login) {
        await page.click(`a[target='_top']`);
        await wait(1000);
        await page.waitForSelector(`#i0118`);
        await page.type(`#i0118`, config.bing.password);
        await page.click(`#idSIButton9`);
        await wait(1000);
    }
}

/**
 * Accept cookies
 * @param page - The puppeteer page
 */
export const acceptCookies = async (page: Page): Promise<void> => {
    // Vérification de la présence d'une popup de cookies
    const cookiesBannerDiv = await page.$(`div[id="bnp_cookie_banner"]`);
    if (cookiesBannerDiv != null) {
        await page.click(`#bnp_btn_accept`);
        await wait(2000);
    }
}

export const checkIfLoggedIn = async (page: Page): Promise<boolean> => {
    const rewardsDashboard = await page.$(`div[id="rewards-dashboard"]`)
    return !!rewardsDashboard;

}