import {Bar} from "cli-progress";
import colors from "ansi-colors";
import {Page} from "puppeteer";
import {Response} from "./Dashboard";

/**
 * Wait for a given amount of time
 * @param {number} ms - The amount of time to wait in milliseconds
 * @returns {Promise} - A promise that resolves after the given amount of time
 */
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
 * @param client - The puppeteer client
 * @param {string} query - The query to search
 */
export const Bingsearch = async (client: Page, query: string | undefined) => {
    await client.goto(`https://www.bing.com/search?q=${query}`);
    const random = Math.floor(Math.random() * 6000) + 1000;
    await wait(random);
};

/**
 * Get user info
 * @param client - The puppeteer client
 * @returns {Promise<Response>} - A promise that resolves after the login
 */
export const getUserInfo = async (client: Page): Promise<Response> => {
    const response = await client.goto('https://rewards.bing.com/api/getuserinfo?type=1&X-Requested-With=XMLHttpRequest');
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
 */
export const getPoints = async (userInfo: Response) => {
    return userInfo.dashboard.userStatus.availablePoints
}