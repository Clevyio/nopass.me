import serverless from 'serverless-http';
import app from './index';

export async function handler(event, context) {
  const wrapper = serverless(app);
  return wrapper(event, context);
}
