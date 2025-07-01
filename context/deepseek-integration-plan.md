### Summary of the Plan

Our goal is to integrate the Aliyun Bailian service to refine transcribed text while minimizing API costs. We will achieve this by using the `session_id` feature provided by the Bailian API to maintain conversational context without repeatedly sending the system prompt.

**The plan consists of three main steps:**

1.  **Install Dependencies:** Add the `@alicloud/bailian` SDK to the `server/package.json` file and install it.

2.  **Create a Refiner Service:** We will create a new file, `server/utils/refiner.js`. This service will be responsible for:
    *   **Session Management:** Maintaining an in-memory cache that maps a `userId` to a Bailian API `session_id`.
    *   **Session Expiration:** Automatically clearing a user's session from the cache after a period of inactivity (e.g., 60 minutes).
    *   **Smart API Calls:**
        *   For a user's **first request** in a session, it will send the **full system prompt** to the Bailian API and store the `session_id` that is returned.
        *   For all **subsequent requests** in the same session, it will send only the **new text and the stored `session_id`**, saving token costs.

3.  **Update the API Endpoint:** We will modify the existing `/api/speech` endpoint in `server/server.js`. After receiving the transcribed text from the Aliyun ASR service, it will pass the text and `userId` to our new refiner service and return the final, polished text to the client. 