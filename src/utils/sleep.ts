import { promisify } from 'util';

/**
 * Delay execution for a given time, useful to avoid throughput issues when processing large amounts of data.
 *
 * How to use: https://github.com/matheusicaro/matheusicaro-node-framework/tree/master?tab=readme-ov-file#sleep
 *
 * @param delay: in milliseconds
 *
 * @example
 * ```
 *  await sleep(1000) // sleep for 1 second
 * ```
 */
const sleep = promisify(setTimeout);

export { sleep };
