import crypto from 'crypto';

/**
 * Generate the current timestamp and convert it to ISO string format
 *
 * @returns {String}
 */
export function getNowString() {
  return (new Date()).toISOString();
}

/**
 * Generate a random number between min (included) and max (excluded)
 *
 * @param {integer} min
 * @param {integer} max
 * @returns {integer}
 */
export function generateRandomCode(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Generate the default email content for the code verification
 *
 * @returns {String}
 */
export function getDefaultContent() {
  return '<h1>Hello 👋</h1>\n\n<p>Your authentication code is <b>%code%</b>.</p>\n\n<p>Stay safe on the internet!</p><p>The <a href="https://nopass.me">NoPass.me</a> team</p>';
}

/**
 * Retrieve the requester_id based on the request parameters.
 * For now, we are using API Gateway api keys as an authentication method.
 * NOTE: this is perhaps not too great, but it will do nicely for now!
 */
export function getRequesterId(req) {
  return req.requestContext.identity.apiKey;
}


/**
 * Hash a given string to prevent storing user data in clear text.
 * If an encryption key is provided, use it, otherwise still hash the data.
 * Output is base64 encoded.
 *
 * @param {String} string
 * @returns {String}
 */
export function hash(string) {
  const { ENCRYPTION_SECRET, ENCRYPTION_ALGORITHM = 'sha256' } = process.env;
  return (ENCRYPTION_SECRET
    ? crypto.createHmac(ENCRYPTION_ALGORITHM, ENCRYPTION_SECRET)
    : crypto.createHash(ENCRYPTION_ALGORITHM))
    .update(string, 'utf-8')
    .digest('base64');
}
