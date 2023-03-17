import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import {getGoogleTrends} from "./modules/googleTrend.js";
import {getPoints, getUserInfo, progressBar, Bingsearch, wait, waitRandom} from "./modules/utils.js";
import {config} from "./modules/config.js";
import {Page} from "puppeteer";
import {Response} from "./modules/Dashboard.js";
import colors from "ansi-colors";

/**
 * Login to Bing
 * @param client - The puppeteer client
 * @returns {Promise<void>} - A promise that resolves after the login
 */
const loginAction = async (client: Page): Promise<void> => {
    console.log("Connexion à Bing");

    await client.goto('https://rewards.bing.com/');

    await client.waitForSelector(`input[name="loginfmt"]`);
    await client.type(`input[name="loginfmt"]`, config.bing.username);
    await client.click(`input[id="idSIButton9"]`);
    await wait(2000);

    await client.waitForSelector(`input[name="passwd"]`);
    await client.type(`input[name="passwd"]`, config.bing.password);
    await client.click(`input[id="idSIButton9"]`);
    await wait(3000);

    // Vérification de l'authentification à 2 facteurs
    const twoFactorAuth = await client.$(`input[name="otc"]`);
    if (twoFactorAuth != null) {
        await client.close();
        throw new Error("Le compte Bing possède une authentification à 2 facteurs, veuillez la désactiver");
    }

    // Vérification d'une popup pour rester connecté
    const stayConnected = await client.$(`input[id="idSIButton9"]`);
    if (stayConnected != null) {
        await client.click(`input[id="idSIButton9"]`);
        await wait(2000);
    }

    // Vérification de la connexion
    const pageTitle = await client.title();
    if (pageTitle !== "Microsoft Rewards") {
        await client.close();
        throw new Error("Erreur lors de la connexion à Bing");
    } else {
        console.log("Connexion à Bing réussie");
        await wait(10000);
    }
};

/**
 * DailySetPromotions
 * @param client - The puppeteer client
 * @param userInfo - The user info
 * @returns {Promise<void>} - A promise that resolves after the DailySetPromotions
 */
const dailySetPromotions = async (client: Page, userInfo: Response): Promise<void> => {
    const todayDate = new Date().toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'});
    const dailySetPromotions = userInfo.dashboard.dailySetPromotions[todayDate];

    if (dailySetPromotions != null) {
        const promotions = dailySetPromotions.filter((promo) => !promo.complete && promo.pointProgressMax > 0 && promo.isGiveEligible);
        const nbPromo = promotions.length;

        if (nbPromo === 0) {
            console.log(colors.yellow("Vous avez déjà gagné les points quotidiens des promotions quotidiennes"));
            return;
        }

        const bar = progressBar("Ouverture des promotions quotidiennes", nbPromo);

        for (let i = 0; i < nbPromo; i++) {
            await waitRandom(1500, 2500);
            bar.update(i);

            if (promotions[i]!.promotionType === "urlreward") {
                await client.goto(promotions[i]!.destinationUrl);
            } else if (promotions[i]!.promotionType === "quiz") {
                // vérification de si le quiz est un sondage
                if (promotions[i]!.title.includes("Sondage")) {
                    await client.goto(promotions[i]!.destinationUrl);

                    // vérification d'une demande de connexion en récupérant le bouton de connexion
                    const login = await client.$(`a[target="_top"]`);

                    if (login) {
                        await client.click(`a[target="_top"]`);
                        await wait(1000);
                        await client.waitForSelector(`#i0118`);
                        await client.type(`#i0118`, config.bing.password);
                        await client.click(`#idSIButton9`);
                        await wait(1000);
                    }

                    // reponse 1 ou 2 (aléatoire)
                    const reponse = Math.floor(Math.random() * 2) + 1;
                    await client.click(`#btoption${reponse}`);
                }
            }
        }
    }
}

/**
 * Open promotions links
 * @param client - The puppeteer client
 * @param userInfo - The user info
 * @returns {Promise<void>} - A promise that resolves after the promotions links opening
 */
const promoAction = async (client: Page, userInfo: Response): Promise<void> => {
    const morePromotionsObject = userInfo.dashboard.morePromotions.filter(
        (promo) => !promo.complete && promo.promotionType === "urlreward" && promo.pointProgressMax > 0
    );

    const nbPromo = morePromotionsObject.length;

    if (nbPromo === 0) {
        console.log(colors.yellow("Vous avez déjà gagné les points des promotions"));
        return;
    }

    const bar = progressBar("Ouverture des promotions", nbPromo);

    for (let i = 0; i < nbPromo; i++) {
        bar.update(i);
        await client.goto(morePromotionsObject[i]!.destinationUrl);
        await waitRandom(2000, 3000);
    }

    bar.update(nbPromo);
    bar.stop();
}

/**
 * Get Google Trend and make research on Bing on PC and mobile agent
 * @param client - The puppeteer client
 * @param nbTends - The number of trends to get
 * @param userInfo - The user info
 * @returns {Promise<void>} - A promise that resolves after the research
 */
const searchAction = async (client: Page, nbTends: number, userInfo: Response): Promise<void> => {
    // Vérification de la possibilité de gagner d'autres points
    const pointsPC = userInfo.dashboard.userStatus.counters.pcSearch[0]?.complete
    const pointsMobile = userInfo.dashboard.userStatus.counters.mobileSearch[0]?.complete
    if (pointsPC && pointsMobile) {
        console.log(colors.yellow("Vous avez déjà gagné les points quotidiens de recherche Bing sur PC et mobile"));
        return;
    }

    const googleTrendTab = await getGoogleTrends(client, nbTends);

    if (googleTrendTab != null) {
        if (!pointsPC) {
            const bar = progressBar("Recherche des tendances Google sur PC", nbTends);

            await client.setUserAgent(config.userAgent.pc);
            for (let i = 0; i < nbTends; i++) {
                bar.update(i);
                await Bingsearch(client, googleTrendTab[i])
            }

            bar.update(nbTends);
            bar.stop();
        }

        if (!pointsMobile) {
            const bar = progressBar("Recherche des tendances Google sur mobile", nbTends);

            await client.setUserAgent(config.userAgent.mobile);
            for (let i = 0; i < nbTends; i++) {
                bar.update(i);
                await Bingsearch(client, googleTrendTab[i]);
            }

            bar.update(nbTends);
            bar.stop();
        }

        await client.setUserAgent(config.userAgent.pc);
    } else {
        console.log("Aucune tendance Google n'a été trouvée");
    }
}

/**
 * Welcome message
 */
const showWelcomeMessage = (): void => {
    console.log(colors.white("Bienvenue sur ce scpript permettant de gagner des points Bing"));
    console.log(colors.white("Ce script est open source et disponible sur GitHub : https://github.com/Drosscend/MiscrosoftRewardBot"));
    console.log(colors.white("Vous pouvez me contacter sur discord si vous avez des questions ou des remarques Drosscend#6715"));
    console.log(colors.white("J'ai réalisé ce script pour mettre en pratiques mes connaissances en TypeScript et pour m'amuser"));
    console.log(colors.red("Ce script est à utiliser à vos risques et périls"));
    console.log("--------------------------------------------");
    // Affichage de la configuration
    console.log(colors.white("Configuration :"));
    console.log(colors.white(`- Utilisateur : ${colors.green(config.bing.username)}`));
    console.log(colors.white(`- Mode headless : ${config.puppeteer.headless ? colors.green("Actif") : colors.red("Inactif")}`));
    console.log(colors.white(`- Nombre de tendances Google à rechercher : ${colors.green(config.gooogleTrends.nbBingSearch.toString())}`));
    console.log(colors.white(`- Réalisation des promotions du jour : ${config.app.doDailySetPromotions ? colors.green("Actif") : colors.red("Inactif")}`));
    console.log(colors.white(`- Réalisation des promotions supplémentaires : ${config.app.doDailySetPromotions ? colors.green("Actif") : colors.red("Inactif")}`));
    console.log(colors.white(`- Réalisation des recherches Bing : ${config.app.doDailySetPromotions ? colors.green("Actif") : colors.red("Inactif")}`));
    console.log("--------------------------------------------");
}

/**
 * Main function
 */
const app = (): void => {
    showWelcomeMessage();

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
            // set up page
            const page = await browser.newPage();
            await page.setViewport({width: 910, height: 1080});
            page.setDefaultNavigationTimeout(60000);
            page.setDefaultTimeout(60000);
            await page.setUserAgent(config.userAgent.pc);

            //Login
            await loginAction(page);

            // Get user info
            let userInfo = await getUserInfo(page);

            // Get points before
            const pointBefore = await getPoints(userInfo);
            console.log(`Points avant l'utilisation du script : ${colors.cyan(String(pointBefore))}`);

            // DailySetPromotions
            if (config.app.doDailySetPromotions) await dailySetPromotions(page, userInfo);

            // Promotions
            if (config.app.doMorePromotions) await promoAction(page, userInfo);

            // Search
            if (config.app.doDailySearch) await searchAction(page, config.gooogleTrends.nbBingSearch, userInfo);

            // Update user info
            userInfo = await getUserInfo(page);
            const pointAfter = await getPoints(userInfo);

            console.log(`Points après l'utilisation du script : ${colors.cyan(String(pointAfter))} | Gain : ${colors.green(String(pointAfter - pointBefore))}`);

            await browser.close();
            console.log("Fin du script");
        });
}

app();
