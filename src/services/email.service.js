import AWS from 'aws-sdk';
import nodemailer from 'nodemailer';

const { AWS_SES_ENDPOINT, EMAIL_FROM = 'NoPass.me Authenticator <noreply@nopass.me>' } = process.env;

const ses = new AWS.SES({
  endpoint: AWS_SES_ENDPOINT ? new AWS.Endpoint(AWS_SES_ENDPOINT) : undefined,
});

const transporter = nodemailer.createTransport({ SES: ses });

export default class EmailService {

  /**
   * Send the account verification email
   *
   * @param {String} to
   * @param {String} subject
   * @param {String} html
   */
  static async sendEmail(to, subject, html) {
    // don't send emails when running in local mode
    if (process.env.IS_OFFLINE === 'true') {
      console.log({ to, subject, html });
      return;
    }

    await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });
  }

}
