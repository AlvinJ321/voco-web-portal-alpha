# Session Summary: Debugging Deployment and Authentication

This document summarizes a debugging session that resolved a series of cascading issues, beginning with a non-functional download button and ending with a full authentication system overhaul.

### 1. Problem: Download Button Ineffective

*   **Symptom:** The "Download Mac Version" button did nothing when clicked in production.
*   **Root Cause:** The `Voco.dmg` file, while present on the host server, was not being copied into the Docker container where the application was running.
*   **Solution:** We modified the `server/Dockerfile` to replace the ambiguous `COPY . .` command with explicit `COPY` instructions for all necessary files and directories, including `downloads/`.

### 2. Problem: Docker Build Failures

*   **Symptom:** The `docker build` command was failing on the server.
*   **Root Cause:**
    1.  The `seeders` directory was empty locally, so Git did not track it. The `Dockerfile`'s command to copy it then failed because the directory didn't exist on the server.
    2.  A formatting issue in the deployment script's `cat` command was creating an invalid `.env` file.
*   **Solution:**
    1.  We added a `.gitkeep` file to the `seeders` directory to ensure Git tracked it.
    2.  We corrected the formatting in the deployment script's "here document" (`<< 'ENV'`).

### 3. Problem: Application Crash on Startup

*   **Symptom:** `docker logs` showed the application was crashing immediately upon starting.
*   **Root Cause:**
    1.  The `DATABASE_URL` environment variable was `undefined` because the deployment script was not passing the `.env` file to the container.
    2.  After fixing that, the URL was still invalid because it was wrapped in quotes (`"..."`) inside the `.env` file.
*   **Solution:**
    1.  We added the `--env-file /opt/voco/server/.env` flag to the `docker run` command in the deployment script.
    2.  We removed the quotes from around the variable values in the `.env` file creation step.

### 4. Problem: Full Authentication System Failure

*   **Symptom:** After fixing the server crashes, the frontend was either stuck in an infinite reload loop or all actions failed with a `401 Unauthorized` error after login.
*   **Root Cause:** The entire authentication system, based on Bearer Tokens in `localStorage`, had several issues:
    1.  The `fetch` logic for the download was overly complex and failing silently.
    2.  A `401` error for a logged-out user would trigger a page reload, causing an infinite loop.
    3.  After login, the server was setting `Secure` cookies which the browser refused to send back over an insecure `http://` connection.
*   **Solution: Complete Auth System Overhaul:**
    1.  We converted the entire application to use **secure, `httpOnly` cookies** for authentication.
    2.  `server.js` was updated to use `cookie-parser` and set/read cookies. The `cookie-parser` dependency was installed.
    3.  `src/api.ts` was updated to remove all `localStorage` logic and to automatically send credentials.
    4.  `src/App.tsx` was simplified to remove token management and use a simple `window.open` for the download.
    5.  The infinite reload loop was fixed by changing the `apiFetch` error handling.
    6.  The final `401` errors were fixed by changing the cookie setting in `server.js` from `secure: true` to `secure: false`, making it compatible with the current `http://` setup.

### Outcome

All identified issues were resolved, and all code changes were pushed to GitHub. The application is now fully functional in its production environment. We also created a new guide, `deployment/production-https-setup.md`, to document the steps for a future migration to a public domain with HTTPS. 