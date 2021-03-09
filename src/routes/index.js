import express from 'express';
import Promise from 'bluebird';

import verify from './verify';
import generic from './generic';

const routes = [

  ...verify,

  // this must be the last item in the routes definition
  ...generic,
];

export default function createRouter() {
  const router = express.Router();

  routes.forEach(r => {
    router[r.method.toLowerCase()](r.path, async (req, res, next) => {
      try {
        await Promise.each(r.validators || [], v => v(req, res));
        const data = await r.handler(req, res);
        if (res.headersSent) return;
        return res.status(r.statusCode || 200).json(data);
      }
      catch (err) {
        return next(err);
      }
    });
  });

  return router;
}
