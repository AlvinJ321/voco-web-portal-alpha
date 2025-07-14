# Refactoring the Aliyun SMS Integration

This document summarizes the process of refactoring the Aliyun SMS integration to resolve an issue where the service was stuck in "mock" mode.

## Problem

The initial implementation for sending verification codes was located directly within `server/server.js`. The logic to switch between the real Aliyun service and a mock service was based on the following condition:

`if (process.env.NODE_ENV === 'development' || process.env.MOCK_SMS === 'true')`

Because the server was typically run with `NODE_ENV=development`, the mock service was always used, even when the `MOCK_SMS` environment variable was disabled. This made it impossible to test the real Aliyun SMS service in a development environment.

Additionally, a separate issue was discovered during the investigation: an unused dependency, `@alicloud/nls-filetrans-2018-08-17`, was present in `server/package.json` and causing `npm install` to fail.

## Solution

The solution involved a code refactoring to improve modularity and fix the faulty logic.

1.  **Created a Dedicated SMS Utility**: A new file was created at `server/utils/sms.js` to encapsulate all logic related to sending SMS messages via the Aliyun Dysmsapi.

2.  **Corrected the Mock Mode Logic**: Inside this new utility, the logic for enabling mock mode was simplified to check *only* for the `MOCK_SMS` environment variable:
    `if (process.env.MOCK_SMS === 'true')`

3.  **Refactored the Server**: `server/server.js` was modified to remove the inline SMS client and logic. It now imports and calls the `sendVerificationSms` function from the new utility. This makes the main server file cleaner and delegates the responsibility of sending SMS to the appropriate module.

4.  **Removed Unused Dependency**: The `@alicloud/nls-filetrans-2018-08-17` package was removed from `server/package.json`, which resolved the `npm install` error.

## Outcome

The SMS service integration is now more robust and easier to maintain. The decision to use the real or mock service is now correctly and exclusively controlled by the `MOCK_SMS` environment variable, allowing for proper testing in all environments. 