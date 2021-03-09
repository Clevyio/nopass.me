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
        expires_in,
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
    console.log(req);
    const {
      target,
      target_type = 'email',
      code,
    } = req.body;

    const hashed_email = hash(target);
    const hashed_code = hash(`${code}`);

    const requester_id = getRequesterId(req);

    let saved;
    try {
      saved = await DbService.getLatestAuthCode({
        requester_id,
        target_type,
        target: hashed_email,
      });

      /**
       * This scenario can happen for multiple reasons:
       * - no request was ever made for this account
       * - the code expired and was cleaned by TTL
       * - the encryption key was changed
       */
      const now = Math.floor(Date.now() / 1000);
      if (!saved || saved.expires_at < now) throw new Error('Expired code');

      /**
       * We have a match, but the given code does not match:
       * - either the user typed in a wrong code
       * - or the hash function gave a different result for some reason
       */
      if (hashed_code !== saved.code) throw new Error('Invalid input');

      return { success: true };
    }
    catch (err) {
      if (DEBUG === 'true') console.error(err);

      /**
       * Any invalid input should invalidate the corresponding saved entry immediately
       */
      if (saved) await DbService.removeEntry(saved.PK, saved.SK).catch(_ => { });

      /**
       * Any error case should just return an undescript, generic unsuccessful
       * validation message, to prevent account enumeration and other nasty security
       * issues that it could lead to.
       */
      return { success: false };
    }
  }

}
