import bodyParser from 'body-parser';
import express from 'express';
import { createWriteStream } from 'node:fs';

import rateLimit from 'express-rate-limit';


const limiter = rateLimit({
  windowMs: 1000, // 1 seg
  max: 10, // Limit each IP to 10 requests per `window` (here, per 1 sec)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const output = createWriteStream('output.ndjson');
const app = express();
app.use(bodyParser.json());
app.use(limiter);
const PORT = 3000;

app.post('/', async (req, res) => {
  console.log('data', req.body)
  output.write(JSON.stringify(req.body) + "\n");
  return res.send('ok!!!');
});

app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
})

/**
  curl \
  -X POST \
  --data '{"name":"alex", "age": 33}' \
  -H 'content-type: application/json' \
  localhost:3000
 */