# User Authentication Test Cases & Error Scenarios

This document outlines various test cases and error handling scenarios for the user authentication flow (login and sign-up).

---

### A. Requesting the Verification Code

These scenarios cover the first step of authentication: requesting an SMS verification code. The API endpoint for sending a code should differentiate between `login` and `signup` intents to provide accurate feedback.

1.  **TC-REQ-01: Login with an Unregistered Number**
    *   **Description:** A user enters a phone number not present in the database and clicks "Send Code" in the "Login" view.
    *   **Expected Behavior:** The backend checks for the number, finds it doesn't exist, and returns an error. The SMS code is not sent.
    *   **Frontend Message:** "This phone number is not registered. Please sign up first."

2.  **TC-REQ-02: Sign-up with a Registered Number**
    *   **Description:** A user enters an existing phone number and clicks "Send Code" in the "Sign Up" view.
    *   **Expected Behavior:** The backend checks for the number, finds it already exists, and returns an error. The SMS code is not sent.
    *   **Frontend Message:** "This phone number is already registered. Please log in."

3.  **TC-REQ-03: Invalid Phone Number Format**
    *   **Description:** The user enters a syntactically incorrect phone number (e.g., "123", "abc").
    *   **Expected Behavior:**
        *   **Frontend:** Immediate validation shows an error without an API call.
        *   **Backend:** If the request is sent, the backend re-validates and rejects it.
    *   **Frontend Message:** "Please enter a valid phone number."

4.  **TC-REQ-04: SMS Service Failure**
    *   **Description:** The backend fails to communicate with the Aliyun SMS service (e.g., service is down, API keys are invalid).
    *   **Expected Behavior:** The backend catches the API error and returns a failure response. The "Resend" countdown timer should not start.
    *   **Frontend Message:** "Failed to send verification code. Please try again later."

5.  **TC-REQ-05: Rate Limiting Abuse**
    *   **Description:** A user or bot makes multiple requests for a verification code to the same phone number in a short period.
    *   **Expected Behavior:** The backend enforces a rate limit (e.g., 1 request per 60 seconds per number) and rejects requests that exceed the limit.
    *   **Frontend Message:** "You are requesting too frequently. Please try again in a moment."

---

### B. Submitting the Form (Login/Sign-up)

These scenarios cover the final step: submitting the phone number and verification code.

1.  **TC-SUB-01: Incorrect Verification Code**
    *   **Description:** The user enters a verification code that does not match the one stored for their phone number.
    *   **Expected Behavior:** The backend rejects the authentication attempt.
    *   **Frontend Message:** "The verification code is incorrect."

2.  **TC-SUB-02: Expired Verification Code**
    *   **Description:** The user submits the correct code but after its expiration time (e.g., > 10 minutes).
    *   **Expected Behavior:** The backend checks the code's timestamp, finds it expired, and rejects the authentication attempt.
    *   **Frontend Message:** "Your verification code has expired. Please request a new one."

---

### C. General UI/UX and System Scenarios

1.  **TC-GEN-01: Network or Server Errors**
    *   **Description:** A generic network failure occurs (e.g., no internet connection), or the backend returns an unexpected 500-level error.
    *   **Expected Behavior:** The frontend API call fails, and a generic error message is displayed to the user.
    *   **Frontend Message:** "Something went wrong. Please check your connection or try again later."

2.  **TC-GEN-02: UI State Confusion**
    *   **Description:** A user (1) enters Phone Number A and successfully requests a code, (2) without refreshing, changes the input to Phone Number B, and (3) enters the code they received for number A, then clicks "Login".
    *   **Expected Behavior:** The frontend sends Phone Number B and the code for A to the backend. The backend will attempt to validate the code against number B, which will fail.
    *   **Frontend Message:** "The verification code is incorrect." (Same as TC-SUB-01).
