/**
 * Wait for a given amount of time
 * @param {number} ms - The amount of time to wait in milliseconds
 * @returns {Promise} - A promise that resolves after the given amount of time
 */
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
