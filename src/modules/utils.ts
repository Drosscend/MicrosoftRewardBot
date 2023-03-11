import {Bar} from "cli-progress";
import colors from "ansi-colors";

/**
 * Wait for a given amount of time
 * @param {number} ms - The amount of time to wait in milliseconds
 * @returns {Promise} - A promise that resolves after the given amount of time
 */
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Create a progress bar
 * @param title - The title of the progress bar
 * @param nbTrends - The number of trends to get
 * @returns {Bar} - The progress bar
 */
export const progressBar = (title: string, nbTrends: number) : Bar => {
    const bar = new Bar({
        format: `${title} |` + colors.cyan('{bar}') + '| {percentage}% || {value}/{total}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });
    bar.start(nbTrends, 0);
    return bar;
}