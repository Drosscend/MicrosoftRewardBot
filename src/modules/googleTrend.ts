import {Page} from "puppeteer";
import {progressBar, wait} from "./utils.js";
import {config} from "./config.js";

const baseURL = config.gooogleTrends.baseURL;
const countryCode = config.gooogleTrends.countryCode;
const category = config.gooogleTrends.category;

/**
 * Get Google Trends
 * @param page - The puppeteer client
 * @param nbTrends - The number of trends to get
 * @returns {Promise<*>} - A promise that resolves with the Google Trends
 */
export const getGoogleTrends = async (page: Page, nbTrends: number): Promise<string[]> => {
    const URL = `${baseURL}/trends/trendingsearches/realtime?geo=${countryCode}&category=${category}&hl=fr`;

    await page.goto(URL);
    await page.waitForSelector(".feed-item");

    const bar = progressBar("Récupération des tendances Google", nbTrends);
    const maxTrends = nbTrends;
    let trends: string[] = [];

    while (trends.length < maxTrends) {
        bar.update(trends.length)
        await wait(2000);

        // Récupérer les tendances actuelles
        const currentTrends = await page.evaluate(() => {
            const trends: string[] = [];
            const trendItems = document.querySelectorAll(".feed-item");
            trendItems.forEach((item) => {
                const title = item.querySelector(".title");
                if (title) {
                    const query = title.textContent
                        ?.replace(/[^a-zA-Z0-9\s]/g, "")
                        .replace(/\s+/g, " ")
                        .trim();
                    if (query && query.length > 0) {
                        trends.push(query);
                    }
                }
            });
            return trends;
        });

        // Ajouter les tendances actuelles à la liste totale des tendances
        trends = trends.concat(currentTrends);

        if (trends.length >= maxTrends) break;

        await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
        });

        // Vérifier s'il reste des tendances à charger
        const isNextPage = await page.$(".feed-load-more-button");
        if (!isNextPage) break;

        // Charger plus de tendances
        await page.click(".feed-load-more-button");
    }
    bar.update(maxTrends);
    bar.stop();
    return trends.slice(0, maxTrends)
}