## Aliyun API Integration Task List

**1. Backend/API Integration (Conceptual)**

*This section assumes a Node.js backend or serverless functions will be used for secure Aliyun API calls. If the intention is to call Aliyun directly from the frontend, this will need adjustment and careful consideration of security implications for API keys.*

- [x] **Research Aliyun Services:**
    - [x] Identify the Aliyun service for SMS verification (e.g., Alibaba Cloud SMS service or Dysmsapi). Refer to [Aliyun Dysmsapi Documentation](https://next.api.aliyun.com/api/Dysmsapi/2017-05-25/SendSms).
    - [x] Identify the Aliyun service for user management/authentication. **Decision:** Opted for a custom solution using a database for user storage and Dysmsapi for phone verification, instead of Aliyun IDaaS, for simplicity.
- [x] **Set up Aliyun Account & Services:**
    - [x] Ensure an Aliyun account is available (assumed for POC).
    - [x] Configure the chosen SMS service (create templates, get API keys). For testing, the `SignName` "阿里云短信测试" and `TemplateCode` "SMS_154950909" can be used as per the provided screenshot and [API explorer](https://next.api.aliyun.com/api/Dysmsapi/2017-05-25/SendSms?tab=DEMO). (Verified via POC)
    - [x] Configure the chosen authentication service or set up a database if building a custom user management solution. **Done:** Initialized SQLite database (`voco_app.sqlite`) using Sequelize ORM. Defined `User` model (`userId`, `phoneNumber`, `userName`, `verificationCode`, `verificationCodeExpiresAt`). Basic server setup in `server/server.js` to sync model.
- [x] **Develop Backend Endpoints (if applicable):**
    - [x] Create an endpoint `/api/send-verification-code` (POC as `/test-send-sms`):
        - [x] Takes `PhoneNumbers` (user's phone number) as input.
        - [x] Calls Aliyun Dysmsapi `SendSms` action (see [SDK examples](https://next.api.aliyun.com/api-tools/sdk/Dysmsapi?version=2017-05-25&language=typescript-tea&tab=primer-doc)) with:
            - [x] `PhoneNumbers`: User-provided phone number.
            - [x] `SignName`: "阿里云短信测试" (for testing, as per screenshot).
            - [x] `TemplateCode`: "SMS_154950909" (for testing, as per screenshot).
            - [x] `TemplateParam`: JSON string like `{"code":"<generated_6_digit_code>"}` (generate a random 6-digit code, e.g., "123456").
        - [x] Stores the generated 6-digit code and phone number (with expiry) in the SQLite database using Sequelize.
    - [x] Create an endpoint `/api/signup`:
        - [x] Takes phone number, verification code (and optional userName) as input.
        - [x] Verifies the code against the stored one in DB and checks expiry.
        - [x] If valid, marks user as verified (clears code), updates userName if provided. (User record already exists from send-code step or is updated).
        - [x] Returns a success response/session token. (JWT implemented, expires in 30d. User to set strong JWT_SECRET in .env)
    - [x] Create an endpoint `/api/login`:
        - [x] Implemented using phone + verification code flow.
        - [x] Reuses `/api/send-verification-code` (implicitly, user calls it first).
        - [x] Takes phone number and verification code as input.
        - [x] Verifies the code against DB and checks expiry.
        - [x] If valid, issues a session token. (JWT implemented, expires in 30d. User to set strong JWT_SECRET in .env)
    - [x] Integrate actual Aliyun SMS API call into /api/send-verification-code endpoint (currently mocked).
- [x] **Secure API Keys:**
    - [x] Store Aliyun API keys securely (e.g., environment variables, secrets management service). Do NOT hardcode them in the frontend. (Done with `.env` for POC)

**2. Frontend Integration (React/TypeScript)**

- [x] **Install Aliyun SDK (if direct frontend calls are made, otherwise Axios/fetch for backend calls):**
    - [x] If any Aliyun services are to be called directly from the frontend (not generally recommended for services requiring secret keys), install the relevant Aliyun SDK for JavaScript. (Decided against this approach).
    - [x] Otherwise, `axios` or `fetch` will be used to call your backend APIs. (Done using `fetch`).
- [x] **Modify `SignUpModal.tsx`:** (Renamed to `AuthModal.tsx`)
    - [x] **Send Verification Code:**
        - [x] Update `handleSendVerification`:
            - [x] Call your backend endpoint (`/api/send-verification-code`) with the phone number.
            - [x] Handle success (e.g., show message "Code sent") and error responses (e.g., "Invalid phone number", "API error").
    - [x] **Submit Sign-up:**
        - [x] Update `handleSubmit` (or rename to `handleSignUpSubmit`):
            - [x] Call your backend endpoint (`/api/signup`) with phone and verification code.
            - [x] On success from the backend, call the `onSuccess` prop (which updates `isAuthenticated` in `App.tsx`).
            - [x] Handle errors (e.g., "Invalid code", "User already exists", "API error").
- [x] **Create `LoginModal.tsx` (or enhance `SignUpModal.tsx`):**
    - [x] **Option A: New `LoginModal.tsx` component:** (Chose Option B)
        - [ ] Similar structure to `SignUpModal.tsx`.
        - [ ] Inputs: Phone number and verification code (or password).
        - [ ] "Send Verification Code" button (if using code-based login) that calls `/api/send-verification-code`.
        - [ ] "Login" button that calls `/api/login`.
        - [ ] Props: `onClose`, `onSuccess` (to set `isAuthenticated`).
    - [x] **Option B: Enhance `SignUpModal.tsx`:**
        - [x] Add a state to toggle between "Sign Up" and "Login" modes.
        - [x] Conditionally render form fields and button text based on the mode.
        - [x] Call appropriate backend endpoints (`/api/signup` or `/api/login`).
- [x] Implement frontend API calls to trigger actual SMS verification via backend.
- [x] **Update `App.tsx`:**
    - [x] Add state for showing the Login modal (e.g., `isLoginOpen`, `setIsLoginOpen`).
    - [x] Add a "Login" button/link in the header or near the sign-up trigger.
    - [x] Pass `setIsAuthenticated` (or a handler that calls it) to the Login modal's `onSuccess` prop.
    - [x] Potentially manage user session/token received from the backend (e.g., store in local storage, use in subsequent API calls).
- [x] **User Context/Session Management:**
    - [x] Consider using React Context or a state management library (like Zustand, Redux) to manage authentication state and user information globally if it needs to be accessed by many components. (Decided on basic `localStorage` for now).
    - [x] Store the session token securely (e.g., HttpOnly cookie if using backend rendering, or carefully in local storage for SPAs, though this has XSS risks). (Done with `localStorage`).
    - [x] Implement logout functionality: clear the session token and update `isAuthenticated` state.
    - [x] (Future Enhancement) Investigate and implement a robust "remember me" functionality using refresh tokens alongside JWTs for enhanced security and better long-term session management.
- [x] **Error Handling and User Feedback:**
    - [x] Provide clear feedback to the user for all API interactions (e.g., loading states, success messages, error messages).
    - [x] Use a consistent way to display notifications/toasts.
- [ ] **Download application installer for signed in user**
    - [ ] Given user is signed in, when he clicked the download Mac version, start downloading .dmg file. when he clicked Download windows version, start downloading windows installer
- [ ] **"Try it now" Feature:**
    - [ ] Re-enable the "Try it now" button.
    - [ ] Implement the UI for the "Try it now" page (`src/components/TryItNow.tsx`).
    - [ ] Implement the core functionality (e.g., voice input, text display).

**3. General**

- [ ] **Configuration:**
    - [ ] If you have different environments (dev, staging, prod), manage Aliyun API endpoints and any frontend-specific configurations accordingly.
- [ ] **Testing:**
    - [ ] Test the sign-up flow thoroughly.
    - [ ] Test the login flow thoroughly.
    - [ ] Test error conditions (invalid input, API errors, incorrect verification codes).
    - [ ] Test session persistence (if applicable).
    - [ ] **Create Automation Test Suite:** Develop an automated test script (e.g., using Jest and Supertest) to cover all scenarios in `test-case/tc-user-authentication.md`.
- [ ] **Security Considerations (Recap):**
    - [ ] **Never expose Aliyun secret keys on the frontend.** Backend mediation is crucial.
    - [ ] Protect against CSRF if using cookie-based sessions.
    - [ ] Validate all inputs on both client and server sides.
- [ ] **Implement rate limiting on SMS sending and login attempts to prevent abuse.** 