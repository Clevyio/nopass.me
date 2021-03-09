import createHttpError from 'http-errors';

async function redirect(req, res) {
  return res.redirect(301, 'https://nopass.me');
}

async function healthcheck(req, res) {
  return res.json({ online: true });
}

async function catchall() {
  throw createHttpError(404);
}

export default [
  {
    method: 'GET',
    path: '/',
    handler: redirect,
  },
  {
    method: 'GET',
    path: '/health',
    handler: healthcheck,
  },
  {
    method: 'ALL',
    path: '/*',
    handler: catchall,
  },

];
