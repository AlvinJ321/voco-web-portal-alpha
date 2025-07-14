# Task: Implement Secure Download for Application Files

To ensure that only authenticated users can download the application file (`.dmg` for Mac), we need to implement a secure download mechanism instead of serving it from the `public` directory.

## Backend (Server)

1.  **Create a private directory for downloads:**
    *   Create a new directory `server/downloads`.
    *   Place the `Voco.dmg` file inside `server/downloads`.
    *   Ensure this directory is not publicly accessible.

2.  **Create a secure download endpoint:**
    *   In `server/server.js` (or wherever routes are defined), create a new endpoint, e.g., `/api/download/mac`.

3.  **Add authentication middleware:**
    *   Protect the `/api/download/mac` endpoint with authentication middleware to ensure only logged-in users can access it.

4.  **Implement file streaming:**
    *   Inside the endpoint handler, after the user is authenticated:
        *   Construct the file path to `Voco.dmg` in `server/downloads`.
        *   Use `res.download()` or a streaming equivalent in Express to send the file to the client. This will trigger a file download prompt in the browser.

## Frontend (Client)

1.  **Update the download click handler:**
    *   In `src/App.tsx`, modify the `handleDownloadClick` function for the Mac download button.
    *   Instead of creating an `<a>` tag with a direct link, it should now make a `GET` request to the new secure endpoint (`/api/download/mac`).
    *   The request should include the authentication token in the headers.
    *   The Windows download button can be disabled or remain as is, but it won't be functional for secure downloads yet.

2.  **Handle the file download:**
    *   The browser will automatically handle the file download when it receives the file stream from the server with the correct `Content-Disposition` header (which `res.download()` sets automatically). 