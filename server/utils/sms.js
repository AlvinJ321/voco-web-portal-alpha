const Dysmsapi = require('@alicloud/dysmsapi20170525');
const OpenApi = require('@alicloud/openapi-client');
const Util = require('@alicloud/tea-util');

require('dotenv').config();

// Create a function to initialize the client
function createSmsClient() {
  const accessKeyId = process.env.ALIYUN_ENTERPRISE_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALIYUN_ENTERPRISE_ACCESS_KEY_SECRET;

  if (!accessKeyId || !accessKeySecret) {
    throw new Error('Aliyun SMS credentials are not configured in environment variables.');
  }

  const config = new OpenApi.Config({
    accessKeyId,
    accessKeySecret,
    endpoint: process.env.ALIYUN_SMS_ENDPOINT || 'dysmsapi.aliyuncs.com',
  });
  return new Dysmsapi.default(config);
}

async function sendVerificationSms(phoneNumber, verificationCode) {
  // If MOCK_SMS is true, just log the code and exit.
  if (process.env.MOCK_SMS === 'true') {
    console.log(`MOCK SMS MODE: Verification code for ${phoneNumber} is: ${verificationCode}`);
    return;
  }

  try {
    const client = createSmsClient(); // Initialize client on-demand

    const sendSmsRequest = new Dysmsapi.SendSmsRequest({
      phoneNumbers: phoneNumber,
      signName: process.env.ALIYUN_SMS_SIGN_NAME,
      templateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE,
      templateParam: `{"code":"${verificationCode}"}`,
    });

    const runtime = new Util.RuntimeOptions({
      readTimeout: 10000,
      connectTimeout: 10000,
    });

    const response = await client.sendSmsWithOptions(sendSmsRequest, runtime);
    console.log(`Successfully sent SMS to ${phoneNumber}. Response:`, JSON.stringify(response));

    // Check Aliyun's response code
    if (response.body.code !== 'OK') {
      console.error('Aliyun SMS API returned an error:', response.body.message);
      // Create a more informative error
      const error = new Error(`Failed to send SMS: ${response.body.message}`);
      error.code = response.body.code; // Attach Aliyun's error code
      throw error;
    }

  } catch (error) {
    // Log the full error from the SDK or our custom error
    console.error(`Failed to send SMS to ${phoneNumber}`, error);
    // Re-throw the error to be caught by the calling function in server.js
    throw error;
  }
}

module.exports = {
  sendVerificationSms,
}; 