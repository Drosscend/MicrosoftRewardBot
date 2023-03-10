export class GoogleTrends {

    constructor() {
        this.baseURL = `https://trends.google.com`;
        this.countryCode = "FR";
        this.category = "all";
    }

    /**
     * Fill the trends data from the page
     * @param page - The puppeteer page
     * @returns {Promise<*>} - A promise that resolves with the trends data
     */
    async fillTrendsDataFromPage(page) {
        // Charger la page
        const maxTrends = 40;
        let trends = [];

        while (trends.length < maxTrends) {
            // Récupérer les tendances actuelles
            const currentTrends = await page.evaluate(() => {
                return Array.from(document.querySelectorAll(".feed-item")).map((item) => {
                    const title = item.querySelector(".title");
                    const query = title.innerText.replace(/[^a-zA-Z0-9 ]/g, "");
                    return {query};
                });
            });

            // Ajouter les tendances actuelles à la liste totale des tendances
            trends = [...trends, ...currentTrends];

            // Vérifier s'il reste des tendances à charger
            const isNextPage = await page.$(".feed-load-more-button");
            if (!isNextPage || trends.length >= maxTrends) break;

            // Charger plus de tendances
            await page.click(".feed-load-more-button");
            await page.waitForTimeout(2000);
        }

        // Récupérer les 40 premières tendances
        return trends.slice(0, maxTrends);
    }

    /**
     * Get Google Trends
     * @param page - The puppeteer page
     * @returns {Promise<*>} - A promise that resolves with the Google Trends
     */
    async getGoogleTrends(page) {
        const URL = `${this.baseURL}/trends/trendingsearches/realtime?geo=${this.countryCode}&category=${this.category}&hl=fr`;

        await page.goto(URL);
        await page.waitForSelector(".feed-item");

        return await this.fillTrendsDataFromPage(page);
    }

}