import cors from 'cors';
import morgan from 'morgan';
import express from 'express';
import bodyParser from 'body-parser';

import createRouter from './routes';

const app = express();

app.disable('x-powered-by');
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(cors());

app.use(morgan('tiny'));

const { STAGE } = process.env;

try {
  const router = createRouter();
  app.use(`/${STAGE}`, router);
}
catch (err) {
  console.error(err);
}

// `next` parameter must be present
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);
  if (res.headersSent) return;
  return res.status(err.status || err.statusCode || 500).send(err);
}
app.use(errorHandler);

export default app;
