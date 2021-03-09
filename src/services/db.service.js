import AWS from 'aws-sdk';
import { getNowString } from '../helpers';

const { AWS_DYNAMODB_ENDPOINT, AWS_DYNAMODB_TABLE: TableName } = process.env;

const documentClient = new AWS.DynamoDB.DocumentClient({
  endpoint: AWS_DYNAMODB_ENDPOINT ? new AWS.Endpoint(AWS_DYNAMODB_ENDPOINT) : undefined,
});

export default class DbService {

  /**
   * Save a new auth code entry
   *
   * @param {String} data.target_type
   * @param {String} data.requester_id
   * @param {String} data.target
   * @param {Number} data.expires_in
   * @param {String} data.code
   */
  static async saveAuthCode(data) {
    const { requester_id, target, target_type = 'email', expires_in, code } = data;
    // expires_at defines TTL and must be a unix timestamp
    const expires_at = Math.floor(Date.now() / 1000) + expires_in;
    const created_at = getNowString();

    const PK = `requester#${requester_id}`;
    const SK = `target#${target_type}#${target}#${created_at}`;
    const params = {
      TableName,
      Item: {
        PK,
        SK,
        class: 'auth_code',
        target_type,
        target,
        code,
        expires_in,
        expires_at,
        created_at,
      },
    };
    await documentClient.put(params).promise();
  }


  /**
   * Retrieve the latest auth_code for a given target
   *
   * @param {String} data.requester_id
   * @param {String} data.target
   * @param {String} data.target_type
   * @returns {AuthCodeModel}
   */
  static async getLatestAuthCode(data) {
    const { requester_id, target, target_type } = data;
    const PK = `requester#${requester_id}`;
    const SK = `target#${target_type}#${target}#`;
    const params = {
      TableName,
      ExpressionAttributeNames: {
        '#PK': 'PK',
        '#SK': 'SK',
      },
      ExpressionAttributeValues: {
        ':PK': PK,
        ':SK': SK,
      },
      KeyConditionExpression: '#PK = :PK and begins_with(#SK, :SK)',
      ScanIndexForward: false,
      Limit: 1,
    };
    const { Items, Count } = await documentClient.query(params).promise();
    if (!Count) return;
    return Items[0];
  }

}
