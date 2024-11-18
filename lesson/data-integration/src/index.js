import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';
import csvtojson from 'csvtojson';
import { randomUUID } from 'node:crypto';

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
  async function* (source) {
    for await (const data of source) {
      console.log('data', data);
    }
  }
);