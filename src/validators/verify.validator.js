import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import createHttpError from 'http-errors';


export default class VerifyValidator {

  static async initRequest(req) {
    const schema = {
      type: 'object',
      required: ['target'],
      properties: {
        target: {
          type: 'string',
          format: 'email',
        },
        target_type: {
          type: 'string',
          enum: ['email'],
        },
        expires_in: {
          type: 'integer',
          minimum: 0,
          maximum: 604_800, // 7 days, in seconds
        },
        subject: {
          type: 'string',
          maxLength: 256,
        },
        content: {
          type: 'string',
          pattern: '\%code\%',
          maxLength: 1000,
        },
      },
    };

    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv, ['email']);
    if (!ajv.validate(schema, req.body)) {
      throw createHttpError(400, ajv.errorsText(ajv.errors, { separator: ', ' }));
    }
  }

  static async validateRequest(req) {
    const schema = {
      type: 'object',
      required: ['target', 'code'],
      properties: {
        target: {
          type: 'string',
          format: 'email',
        },
        target_type: {
          type: 'string',
          enum: ['email'],
        },
        code: {
          oneOf: [
            { type: 'integer' },
            { type: 'string' },
          ],
        },
      },
    };

    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv, ['email']);
    if (!ajv.validate(schema, req.body)) {
      throw createHttpError(400, ajv.errorsText(ajv.errors, { separator: ', ' }));
    }
  }

}
