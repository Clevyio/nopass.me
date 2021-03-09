import VerifyController from '../controllers/verify.controller';
import VerifyValidator from '../validators/verify.validator';

export default [
  {
    method: 'POST',
    path: '/verify/init',
    handler: VerifyController.init,
    validators: [
      VerifyValidator.initRequest,
    ],
  },
  {
    method: 'POST',
    path: '/verify/validate',
    handler: VerifyController.validate,
    validators: [
      VerifyValidator.validateRequest,
    ],
  },
];
