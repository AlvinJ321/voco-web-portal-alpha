# ASR QPS Rate Limiting and Queuing

This document outlines the problem, solution, and analysis for implementing a robust rate-limiting and queuing mechanism for the Aliyun Automatic Speech Recognition (ASR) service.

## 1. The Problem

The application's integration with Aliyun's ASR service must adhere to a strict Queries Per Second (QPS) limit. The core requirements are:

1.  **Account-Wide Limit:** The QPS limit is tied to the Aliyun account, not the user's IP address. All requests from our server share the same limit.
2.  **Configurable Limit:** The limit differs based on the subscription plan. The trial version allows 2 QPS, while the commercial version allows 200 QPS. The implementation must easily accommodate this change without code modification.
3.  **Request Queuing:** When requests exceed the QPS limit, they should not be rejected with an error. Instead, they must be placed in a queue and processed in a first-in, first-out (FIFO) order as processing capacity becomes available.

## 2. Solution Evolution & Final Approach

The solution evolved as the requirements were clarified.

### Initial Idea (Incorrect): `express-rate-limit`

The initial thought was to use the standard `express-rate-limit` library.

*   **Attempt 1 (Per-IP):** This was quickly identified as incorrect because the limit is account-wide.
*   **Attempt 2 (Global Limit):** This solved the per-IP issue by using a constant key. However, this library's fundamental behavior is to **reject** (drop) requests that exceed the limit by sending a `429 Too Many Requests` error. This failed the queuing requirement.

### Final Solution: `p-queue` Library

The correct and final solution uses the `p-queue` library, which is specifically designed for managing concurrency with rate-limiting capabilities.

1.  **Central Queue:** A single, global instance of `p-queue` is created when the server starts.

2.  **Configuration:** The queue is configured to match the QPS requirement.
    *   **`interval`**: `1000` (milliseconds, i.e., 1 second).
    *   **`intervalCap`**: This defines the maximum number of tasks to run within the `interval`. Its value will be sourced from an environment variable, `ASR_QPS_LIMIT`, with a safe default (e.g., 2). This allows for easy switching between trial and commercial limits (`ASR_QPS_LIMIT=2` or `ASR_QPS_LIMIT=200`).

3.  **Endpoint Logic:** The `/api/speech` endpoint logic is modified:
    *   Instead of making a direct call to the Aliyun ASR API, the entire processing logic is wrapped in a function and added as a task to the `p-queue` instance.
    *   The user's HTTP request connection is held open while the task waits in the queue.
    *   The queue processes tasks concurrently up to the `intervalCap` limit, ensuring that within any 1-second window, no more than `ASR_QPS_LIMIT` requests are initiated.
    *   Once the task is executed and the result from Aliyun is received, the response is sent back to the waiting client.

## 3. Analysis

### How it Fulfills Requirements
*   **Configurable QPS:** The limit is controlled via an environment variable, requiring no code changes to switch plans.
*   **Queuing:** `p-queue` inherently provides a FIFO queue for tasks that exceed the `intervalCap`, fulfilling the "no-drop" requirement.
*   **Concurrency:** It correctly handles the "200 QPS" scenario by allowing up to 200 concurrent requests to be *started* within a one-second window, not by processing them serially one-by-one.

### Important Considerations
*   **Client-Side Timeouts:** Because the server holds the HTTP connection open while a request is queued, long wait times could lead to the client's request timing out. This is a necessary trade-off for this server-side queuing model.
*   **Single Server Instance:** This solution is scoped to a single server instance. If the application is deployed across multiple servers (load balancing), a shared queue (e.g., backed by Redis) would be required to enforce the global, account-wide limit accurately. The current implementation uses an in-memory queue. 