const baseURL = `https://trends.google.com`;
const countryCode = "FR";
const category = "all";

const fillTrendsDataFromPage = async (page) => {
    // charger la page
    while (true) {
        const isNextPage = await page.$(".feed-load-more-button");
        if (!isNextPage) break;
        await page.click(".feed-load-more-button");
        await page.waitForTimeout(2000);
    }
    const dataFromPage = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".feed-item")).map((item) => {
            const title = item.querySelector(".title").innerText.replace("•", "");
            const query = title.replace(/ /g, "+");
            return { query };
        } );
    }, baseURL);
    return dataFromPage;
}

getTrends = async (page) => {
    const URL = `${baseURL}/trends/trendingsearches/realtime?geo=${countryCode}&category=${category}&hl=fr`;

    await page.goto(URL);
    await page.waitForSelector(".feed-item");

    return await fillTrendsDataFromPage(page);
}

module.exports = {
    getTrends
};