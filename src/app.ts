import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import {getGoogleTrends} from './modules/googleTrend.js';
import {
    acceptCookies,
    Bingsearch,
    getPoints,
    getUserInfo,
    progressBar,
    promoLogin,
    wait,
    waitRandom
} from './modules/utils.js';
import {config} from './modules/config.js';
import {Page} from 'puppeteer';
import {apiResponse} from './modules/Dashboard.js';
import colors from 'ansi-colors';

/**
 * Login to Bing
 * @param page - The puppeteer page
 * @returns {Promise<void>} - A promise that resolves after the login
 */
const loginAction = async (page: Page): Promise<void> => {
    console.log('Connexion à Bing');

    await page.goto('https://rewards.bing.com/');

    await page.waitForSelector(`input[name='loginfmt']`);
    await page.type(`input[name='loginfmt']`, config.bing.username);
    await page.click(`input[id='idSIButton9']`);
    await wait(2000);

    await page.waitForSelector(`input[name='passwd']`);
    await page.type(`input[name="passwd"]`, config.bing.password);
    await page.click(`input[id="idSIButton9"]`);
    await wait(3000);

    // Vérification de l'authentification à 2 facteurs
    const twoFactorAuth = await page.$(`input[name="otc"]`);
    if (twoFactorAuth != null) {
        await page.close();
        throw new Error("Le compte Bing possède une authentification à 2 facteurs, veuillez la désactiver");
    }

    // Vérification d'une popup pour rester connecté
    const stayConnected = await page.$(`input[id="idSIButton9"]`);
    if (stayConnected != null) {
        await page.click(`input[id="idSIButton9"]`);
        await wait(2000);
    }

    // Vérification de la présence d'un bandeau de cookies
    const cookiesBannerDiv = await page.$(`div[id="cookieConsentContainer"]`);
    if (cookiesBannerDiv != null) {
        await page.click('#wcpConsentBannerCtrl button:nth-child(1)');
        await wait(2000);
    }

    // Vérification de la connexion
    const pageTitle = await page.title();
    if (pageTitle !== "Microsoft Rewards") {
        await page.close();
        throw new Error("Erreur lors de la connexion à Bing");
    } else {
        console.log("Connexion à Bing réussie");
        await wait(10000);
    }
};

/**
 * DailySetPromotions
 * @param page - The puppeteer page
 * @param userInfo - The user info
 * @returns {Promise<void>} - A promise that resolves after the DailySetPromotions
 */
const  dailySetPromotions = async (page: Page, userInfo: apiResponse): Promise<void> => {
    const todayDate = new Date().toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'});
    const dailySetPromotions = userInfo.dashboard.dailySetPromotions[todayDate];

    if (dailySetPromotions == null) {
        console.log(colors.red("Aucune promotion quotidienne n'est disponible"));
        return;
    }

    const promotions = dailySetPromotions.filter((promo) => !promo.complete && promo.pointProgressMax > 0 && promo.isGiveEligible);
    const nbPromo = promotions.length;
    if (nbPromo === 0) {
        console.log(colors.yellow("Vous avez déjà gagné les points quotidiens des promotions quotidiennes"));
        return;
    }

    const bar = progressBar("Ouverture des promotions quotidiennes", nbPromo);

    for (let i = 0; i < nbPromo; i++) {
        bar.update(i);
        await page.goto(promotions[i]!.destinationUrl);

        // Vérification de la présence d'une popup de cookies
        await acceptCookies(page);

        // vérification d'une possible demande de connexion
        await promoLogin(page);

        switch (promotions[i]!.promotionType) {
            // Si le type de la promotion est une simple url
            case "urlreward":
                break;

            // Si le type de la promotion est un quiz
            case "quiz":
                // vérification de si le quiz est un sondage
                if (promotions[i]!.title.includes("Sondage")) {
                    // reponse 0 ou 1 (aléatoire)
                    const reponse = ["btoption0", "btoption1"][Math.floor(Math.random() * 2)];
                    await page.click(`#btoption${reponse}`);
                } else if (promotions[i]!.title.includes("Quiz")) {
                    // Tant que le quiz n'est pas fini TODO
                    while (await page.$(`div[id="quizCompleteContainer"]`) == null) {
                        //Tant que les rqMCredits ne sont pas chargés
                        let rqMCreditsBefore = await page.$(`div[id="rqMCredits"]`);
                        let rqMCreditsAfter = await page.$(`div[id="rqMCredits"]`);

                        while (rqMCreditsBefore == rqMCreditsAfter) {
                            for (let i = 1; i < 8; i++) {
                                await page.click(`div[id="rqM${i}"]`);
                                await waitRandom(1000, 2000);
                                rqMCreditsAfter = await page.$(`div[id="rqMCredits"]`);
                                if (rqMCreditsBefore != rqMCreditsAfter) {
                                    break;
                                }
                            }
                        }
                    }
                }
            break;
        }
        await waitRandom(4000, 6000);
    }
    bar.update(nbPromo);
    bar.stop();
};

/**
 * Open promotions links
 * @param page - The puppeteer page
 * @param userInfo - The user info
 * @returns {Promise<void>} - A promise that resolves after the promotions links opening
 */
const promoAction = async (page: Page, userInfo: apiResponse): Promise<void> => {
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
        await page.goto(morePromotionsObject[i]!.destinationUrl);
        await waitRandom(2000, 3000);
    }

    bar.update(nbPromo);
    bar.stop();
}

/**
 * Get Google Trend and make research on Bing on PC and mobile agent
 * @param page - The puppeteer page
 * @param userInfo - The user info
 * @returns {Promise<void>} - A promise that resolves after the research
 */
const searchAction = async (page: Page, userInfo: apiResponse): Promise<void> => {
    // Vérification de la possibilité de gagner d'autres points
    const pointsPC = userInfo.dashboard.userStatus.counters.pcSearch[0]?.complete
    const pointsMobile = userInfo.dashboard.userStatus.counters.mobileSearch ? userInfo.dashboard.userStatus.counters.mobileSearch[0]?.complete : false;
    if (pointsPC && pointsMobile) {
        console.log(colors.yellow("Vous avez déjà gagné les points quotidiens de recherche Bing sur PC et mobile"));
        return;
    }

    const googleTrendTab = await getGoogleTrends(page, config.gooogleTrends.nbBingSearch);

    if (googleTrendTab != null) {
        if (!pointsPC) {
            // Calcul points restant à gagné : points max - points actuels
            const pointProgressMax = userInfo.dashboard.userStatus.counters.pcSearch[0]?.pointProgressMax!
            const pointProgress = userInfo.dashboard.userStatus.counters.pcSearch[0]?.pointProgress!
            const pointsRestants = pointProgressMax - pointProgress;

            // Calcul du nombre de recherche à faire : pointsRestants / points gagnables par recherche
            const PCnbTends = Math.floor(pointsRestants / config.app.nbPtsPerSearch);

            const bar = progressBar("Recherche des tendances Google sur PC", PCnbTends);

            // Réduction du tableau de recherche si le nombre de recherche est supérieur au nombre de tendances
            googleTrendTab.slice(0, PCnbTends)

            await page.setUserAgent(config.userAgent.pc);
            for (let i = 0; i < PCnbTends; i++) {
                bar.update(i);
                await Bingsearch(page, googleTrendTab[i])
            }

            bar.update(PCnbTends);
            bar.stop();
        } else {
            console.log(colors.yellow("Vous avez déjà gagné les points quotidiens de recherche Bing sur PC"));
        }

        if (!pointsMobile) {
            // Calcul points restant à gagné : points max - points actuels
            const pointProgressMax = userInfo.dashboard.userStatus.counters.mobileSearch[0]?.pointProgressMax!
            const pointProgress = userInfo.dashboard.userStatus.counters.mobileSearch[0]?.pointProgress!
            const pointsRestants = pointProgressMax - pointProgress;

            // Calcul du nombre de recherche à faire : pointsRestants / points gagnables par recherche
            const MobilenbTends = Math.floor(pointsRestants / config.app.nbPtsPerSearch);

            const bar = progressBar("Recherche des tendances Google sur mobile", MobilenbTends);

            // Réduction du tableau de recherche si le nombre de recherche est supérieur au nombre de tendances
            googleTrendTab.slice(0, MobilenbTends)

            await page.setUserAgent(config.userAgent.mobile);
            for (let i = 0; i < MobilenbTends; i++) {
                bar.update(i);
                await Bingsearch(page, googleTrendTab[i]);
            }

            bar.update(MobilenbTends);
            bar.stop();
        } else {
            console.log(colors.yellow("Vous avez déjà gagné les points quotidiens de recherche Bing sur mobile"));
        }

        await page.setUserAgent(config.userAgent.pc);
    } else {
        console.log("Aucune tendance Google n'a été trouvée");
    }
}

/**
 * Welcome message
 */
const showWelcomeMessage = (): void => {
    console.log(colors.white("Bienvenue sur ce scpript permettant de gagner des points Bing"));
    console.log(colors.white("Ce script est open source et disponible sur GitHub : https://github.com/Drosscend/MicrosoftRewardBot"));
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


(async () => {
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
            let nbTry = 0;
            const maxTries = 3;
            while (nbTry < maxTries) {
                nbTry++;
                try {
                    await loginAction(page);
                    break; // Sort de la boucle si la connexion est réussie
                } catch (e) {
                    console.log(colors.red(`Une erreur est survenue lors de la connexion, nous allons réessayer : ${nbTry}/${maxTries}`));
                    if (nbTry === maxTries) {
                        console.log(colors.red("Impossible de se connecter, il est possible que l'erreur vienne de nous ou alors de votre compte"));
                        process.exit(1);
                    }
                    await new Promise((resolve) => setTimeout(resolve, 5000)); // Attendre avant la prochaine tentative
                }
            }

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
            if (config.app.doDailySearch) await searchAction(page, userInfo);

            // Update user info
            userInfo = await getUserInfo(page);
            const pointAfter = await getPoints(userInfo);

            console.log(`Points après l'utilisation du script : ${colors.cyan(String(pointAfter))} | Gain : ${colors.green(String(pointAfter - pointBefore))}`);

            await browser.close();
            console.log("Fin du script");
        });
})();
