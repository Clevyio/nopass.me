import createHttpError from 'http-errors';
import DbService from '../services/db.service';
import {
  generateRandomCode,
  getDefaultContent,
  getRequesterId,
  hash,
} from '../helpers';
import EmailService from '../services/email.service';

const { DEBUG } = process.env;

const MAX_VALIDITY_IN_SECONDS = 7 * 24 * 3600; // 7 days, expressed in seconds

export default class VerifyController {

  /**
   * Initiate an account verification request
   *
   * @param {*} req
   */
  static async init(req) {
    const {
      target, // email address of target account to verify
      target_type = 'email', // only email is supported for now
      expires_in = 300, // by default, auth codes expire after 300s (5 minutes)
      subject = 'Your NoPass.me Authorization Code', // configurable subject line for the email
      content = getDefaultContent(), // default string content of the email template to send
    } = req.body;

    /**
     * The code should be a random 6-digit number
     */
    const code = generateRandomCode(100_000, 1_000_000);
    const text = content.replace(/\%code\%/g, code);

    try {

      /**
       * To prevent security issues, we don't need to store any personal data
       * or the actual auth code that was generated. We only need to make sure
       * that when we need to compare, we can generate the same hash to compare
       * the values.
       *
       * This data expires after max 7 days and is removed by a TTL mechanism
       * shortly after. It is safe enough to not hash+salt the data,
       * we just need to make it non-reversible.
       */
      const hashed_target = hash(target);
      const hashed_code = hash(`${code}`);

      const requester_id = getRequesterId(req);

      await DbService.saveAuthCode({
        requester_id,
        target: hashed_target,
        target_type,
        expires_in: Math.min(expires_in, MAX_VALIDITY_IN_SECONDS),
        code: hashed_code,
      });

      /**
       * For now, only `email` target_type is supported
       */
      if (target_type === 'email') await EmailService.sendEmail(target, subject, text);

      return { success: true };

    }
    catch (err) {
      if (DEBUG === 'true') console.error(err);
      throw createHttpError(err.message);
    }
  }

  /**
   * Validate a given code.
   *
   * Error cases shouldn't be too detailed in order to prevent account enumeration.
   * Either the request is valid or it isn't, that's all the information we need to return.
   *
   * @param {*} req
   */
  static async validate(req) {
    const {
      target,
      target_type = 'email',
      code,
    } = req.body;

    /**
     * Only the hashed data is ever compared. We don't care about the original data
     * and did not even save it in the database for security reasons.
     */
    const hashed_email = hash(target);
    const hashed_code = hash(`${code}`);

    const requester_id = getRequesterId(req);

    try {
      const saved = await DbService.getLatestAuthCode({
        requester_id,
        target_type,
        target: hashed_email,
      });

      /**
       * This input doesn't even match an entry in the database. Maybe:
       * - the user tries to guess a code and makes a second try
       * - there was never any auth code generated in the first place
       * - the code expired and was wiped by the TTL mechanism
       * - wrong target or target type
       */
      if (!saved) throw new Error('No match');

      /**
       * Once retrieved, every entry is wiped immediately, whether the input was correct or not.
       * Never let users guess authorization codes!
       */
      await DbService.removeEntry(saved.PK, saved.SK).catch(_ => { });

      /**
       * This scenario can happen for multiple reasons:
       * - the code expired and was not yet wiped by the TTL mechanism
       */
      const now = Math.floor(Date.now() / 1000);
      if (saved.expires_at < now) throw new Error('Expired code');

      /**
       * We have a match, but the given code does not match:
       * - the user typed in a wrong code
       * - the encryption key was changed
       * - the hash function gave a different result for some other reason
       */
      if (hashed_code !== saved.code) throw new Error('Invalid code');

      return { success: true };
    }
    catch (err) {
      if (DEBUG === 'true') console.error(err);

      /**
       * Any error case should just return an undescript, generic unsuccessful
       * validation message, to prevent account enumeration and other nasty security
       * issues that it could lead to.
       */
      return { success: false };
    }
  }

}
