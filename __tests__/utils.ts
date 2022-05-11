function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @param methods An array of methods for benchmarking
 * @param inputs An array of inputs. These will be zippered to the methods
 * @param iterations The number of iterations to run to find the average
 * @param message An array of identifier message for similar functions. Useful when methods share names
 * @param delay An optional delay for APIs that may throttle if called too quickly
 * Example:
 * import { resolveName, resolveName_ethers } from './ens';
 * import { benchmark } from './utils'
 *
 * const methods = [resolveName, resolveName_ethers];
 * const inputs = [['0x809fa673fe2ab515faa168259cb14e2bedebf68e'], ['0x809fa673fe2ab515faa168259cb14e2bedebf68e']];
 * benchmark(methods, inputs, 3);
 *
 * Then run:
 *
 * yarn benchmark
 */
export async function benchmark(methods, inputs, iterations, identifiers, delay = 0) {
  for (let i = 0; i < methods.length; i++) {
    console.log(`\nMETHOD: ${methods[i].name}`);
    console.log(`NOTE: ${identifiers[i]}`);
    console.log(`NUM. CALLS: ${iterations}`);
    console.log(`DELAY: ${delay === 0 ? 'NONE' : `${delay} ms`}`);
    console.log('-------------------------------');
    let sum = 0;
    const callTimes: number[] = [];
    for (let j = 0; j < iterations; j++) {
      const t0 = performance.now();
      await methods[i](...inputs[i]);
      const t1 = performance.now();
      const duration = t1 - t0;
      console.log(`Call duration:\t${Math.floor(duration)} ms`);
      sum += duration;
      callTimes.push(duration);
      await sleep(delay);
    }
    const average = sum / iterations;
    console.log(`\nAVERAGE\t:\t${Math.floor(average)} ms`);
    console.log(`SLOWEST\t:\t${Math.floor(Math.max(...callTimes))} ms`);
    console.log(`FASTEST\t:\t${Math.floor(Math.min(...callTimes))} ms\n`);
  }
}
