import {Page} from "puppeteer";

export class GoogleTrends {
    private readonly baseURL: string;
    private readonly countryCode: string;
    private readonly category: string;

    constructor() {
        this.baseURL = `https://trends.google.com`;
        this.countryCode = "FR";
        this.category = "all";
    }

    /**
     * Fill the trends data from the page
     * @returns {Promise<*>} - A promise that resolves with the trends data
     * @param client
     */
    async fillTrendsDataFromPage(client: Page) {
        // Charger la page
        const maxTrends = 40;
        let trends: ({ query: string | undefined } | null)[] = [];

        while (trends.length < maxTrends) {
            // Récupérer les tendances actuelles
            const currentTrends = await client.evaluate(() => {
                return Array.from(document.querySelectorAll(".feed-item")).map((item) => {
                    const title = item.querySelector(".title");
                    if (!title) return null;
                    const query = title.textContent?.replace(/[^a-zA-Z0-9 ]/g, "");
                    return {query};
                });
            });

            // Ajouter les tendances actuelles à la liste totale des tendances
            trends = trends.concat(currentTrends);

            // Vérifier s'il reste des tendances à charger
            const isNextPage = await client.$(".feed-load-more-button");
            if (!isNextPage || trends.length >= maxTrends) break;

            // Charger plus de tendances
            await client.click(".feed-load-more-button");
            await client.waitForTimeout(2000);
        }

        // Récupérer les 40 premières tendances
        return trends.slice(0, maxTrends);
    }

    /**
     * Get Google Trends
     * @returns {Promise<*>} - A promise that resolves with the Google Trends
     * @param client
     */
    async getGoogleTrends(client: Page) {
        const URL = `${this.baseURL}/trends/trendingsearches/realtime?geo=${this.countryCode}&category=${this.category}&hl=fr`;

        await client.goto(URL);
        await client.waitForSelector(".feed-item");

        return await this.fillTrendsDataFromPage(client);
    }

}