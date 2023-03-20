import {getEdgePath} from 'edge-paths';
import dotenv from 'dotenv';

dotenv.config();

if (process.env['BING_USERNAME'] === undefined || process.env['BING_PASSWORD'] === undefined) {
    throw new Error('BING_USERNAME and BING_PASSWORD must be set in .env file');
}

export const config = {
    bing: {
        username: process.env['BING_USERNAME'],
        password: process.env['BING_PASSWORD'],
    },
    puppeteer: {
        headless: false,
        executablePath: getEdgePath(),
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
    gooogleTrends: {
        baseURL: 'https://trends.google.com',
        countryCode: 'FR',
        category: 'all',
        nbBingSearch: 100,
    },
    userAgent: {
        pc: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.0.0',
        mobile: 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36 Edg/111.0.0.0',
    },
    app: {
        nbPtsPerSearch: 3,
        doDailySetPromotions: false,
        doMorePromotions: true,
        doDailySearch: true,
    }
}

