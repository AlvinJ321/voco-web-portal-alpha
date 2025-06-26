# Aliyun Credential Separation and Reversion Guide

This document summarizes the changes made to use a personal Aliyun account for Automatic Speech Recognition (ASR) and an enterprise account for all other services (e.g., OSS, SMS). It also provides instructions on how to revert the ASR service back to using the enterprise account.

---

## Summary of Implemented Changes (会话总结)

The primary goal was to split Aliyun credentials within the web server to reduce the costs associated with the ASR service by using a personal account for it.

### 1. Code Modifications (代码修改)

- **File Modified**: `server/server.js`
- **Logic**: The server application was updated to initialize Aliyun clients with two different sets of credentials.
  - The `Dysmsapi` (SMS) and `OSS` clients are configured to use the **enterprise** account credentials.
  - The `RPCClient` inside the `getAsrAccessToken` function, which generates tokens for the ASR service, is configured to use the **personal** account credentials.

### 2. Environment Variable Changes (环境变量变更)

To support this separation, the following environment variables were introduced and should be configured in your `.env` files:

- **For Enterprise Account (OSS & SMS):**
  - `ALIYUN_ENTERPRISE_ACCESS_KEY_ID`
  - `ALIYUN_ENTERPRISE_ACCESS_KEY_SECRET`

- **For Personal Account (ASR):**
  - `ALIYUN_ASR_ACCESS_KEY_ID`
  - `ALIYUN_ASR_ACCESS_KEY_SECRET`
  - `ALIYUN_ASR_APP_KEY` (previously `ALIYUN_APP_KEY`)

---

## How to Revert ASR to Use the Enterprise Account (如何将ASR切换回企业版账户)

If you need to switch the ASR service back to using the enterprise account, follow these two steps:

### Step 1: Update Environment Variables

Ensure your environment file (`.env`) contains the App Key for your enterprise ASR service. You might want to name it clearly, for example:

```
ALIYUN_ENTERPRISE_ASR_APP_KEY=your_enterprise_app_key
```

Then, in `server/server.js`, adjust the `ALIYUN_ASR_APP_KEY` constant to read from this new variable.

**Change this:**
```javascript
const ALIYUN_ASR_APP_KEY = process.env.ALIYUN_ASR_APP_KEY;
```

**To this:**
```javascript
const ALIYUN_ASR_APP_KEY = process.env.ALIYUN_ENTERPRISE_ASR_APP_KEY;
```

### Step 2: Modify ASR Token Generation in `server/server.js`

In the `server/server.js` file, locate the `getAsrAccessToken` function. You need to change the `RPCClient` initialization to use the enterprise account's Access Key and Secret.

**Change this section:**
```javascript
// server/server.js in getAsrAccessToken()

const client = new RPCClient({
  accessKeyId: process.env.ALIYUN_ASR_ACCESS_KEY_ID, // Personal Key
  accessKeySecret: process.env.ALIYUN_ASR_ACCESS_KEY_SECRET, // Personal Secret
  // ...
});
```

**To this:**
```javascript
// server/server.js in getAsrAccessToken()

const client = new RPCClient({
  accessKeyId: process.env.ALIYUN_ENTERPRISE_ACCESS_KEY_ID, // Enterprise Key
  accessKeySecret: process.env.ALIYUN_ENTERPRISE_ACCESS_KEY_SECRET, // Enterprise Secret
  // ...
});
```

After making these changes and restarting the server, the ASR service will authenticate using your enterprise Aliyun account credentials. 