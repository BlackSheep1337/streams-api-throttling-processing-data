import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';
import csvtojson from 'csvtojson';
import { randomUUID } from 'node:crypto';
import { log, makeRequest } from './util.js';
import ThrottleRequest from './throttle.js';

const throttle = new ThrottleRequest({
  objectMode: true,
  requestsPerSecond: 5,
});

const dataProcessor = Transform({
  objectMode: true,
  transform(chunk, enc, callaback) {
    const now = performance.now();
    const jsonData = chunk.toString().replace(/\d/g, now);
    const data = JSON.parse(jsonData);
    data.id = randomUUID();

    return callaback(null, JSON.stringify(data));
  }
});

await pipeline(
  createReadStream('big.csv'),
  csvtojson(),
  dataProcessor,
  throttle,
  async function* (source) {
    let counter = 0;
    for await (const data of source) {
      log(`processed ${++counter} items...`);
      console.log(`processed ${++counter} items... - ${new Date().toISOString()}`)
      const status = await makeRequest(data);
      if (status !== 200) {
        throw new Error(`oops! reached rate limit, - status ${status}`);
      }
    }
  }
);