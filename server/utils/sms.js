const Dysmsapi = require('@alicloud/dysmsapi20170525');
const OpenApi = require('@alicloud/openapi-client');
const Util = require('@alicloud/tea-util');

require('dotenv').config();

const IS_PROD = process.env.NODE_ENV === 'production';

const config = new OpenApi.Config({
  accessKeyId: process.env.ALIYUN_ENTERPRISE_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALIYUN_ENTERPRISE_ACCESS_KEY_SECRET,
  endpoint: IS_PROD ? 'dysmsapi.cn-shanghai.aliyuncs.com' : 'dysmsapi.aliyuncs.com',
});
const client = new Dysmsapi.default(config);

async function sendVerificationSms(phoneNumber, verificationCode) {
  // If MOCK_SMS is true, just log the code and exit.
  if (process.env.MOCK_SMS === 'true') {
    console.log(`MOCK SMS MODE: Verification code for ${phoneNumber} is: ${verificationCode}`);
    return;
  }

  const sendSmsRequest = new Dysmsapi.SendSmsRequest({
    phoneNumbers: phoneNumber,
    signName: process.env.ALIYUN_SMS_SIGN_NAME || "阿里云短信测试",
    templateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE || "SMS_154950909",
    templateParam: `{"code":"${verificationCode}"}`,
  });

  const runtime = new Util.RuntimeOptions({
    readTimeout: 10000,
    connectTimeout: 10000,
  });

  try {
    await client.sendSmsWithOptions(sendSmsRequest, runtime);
    console.log(`Successfully sent SMS to ${phoneNumber}`);
  } catch (error) {
    console.error(`Failed to send SMS to ${phoneNumber}`, error);
    // Re-throw the error to be caught by the calling function in server.js
    throw error;
  }
}

module.exports = {
  sendVerificationSms,
}; 