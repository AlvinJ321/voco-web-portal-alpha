# Development Session Summary

This document outlines the key features implemented, challenges faced, and solutions applied during the development session for the Voco web portal.

## 1. High-Level Achievements

- **Enhanced Homepage UI:** The initial homepage was redesigned for better aesthetics and usability.
- **Full-Stack User Profile Management:** A complete feature was built allowing users to update their profile information, including their username and a profile photo.
- **Cloud Storage Integration:** Implemented a robust and secure file upload system using Aliyun Object Storage Service (OSS) for persistent storage of user avatars.
- **Advanced State Management:** Refactored the frontend application to ensure a single source of truth for user data, providing a consistent and bug-free user experience across components.

---

## 2. Detailed Implementation and Debugging Journey

### Phase 1: Initial UI and Profile Page Scaffolding

- **Problem:** The homepage elements were too small, and the layout needed improvement. The user profile page was a static placeholder.
- **Solution:**
    - Increased the size of text and buttons on the homepage using Tailwind CSS utility classes.
    - Implemented the basic structure of the User Profile page, including a file input for photo uploads and a text input for the username.
    - Added initial state management within the `UserProfile.tsx` component using `useState`.

### Phase 2: Backend API and Database Setup

- **Problem:** The frontend had no way to save user profile changes. The database schema was incomplete.
- **Initial API Implementation:**
    - Created a `PUT /api/profile` endpoint in `server.js` to handle updates.
    - Added an `authenticateToken` middleware to secure the endpoint.
- **Database Schema Mismatch:**
    - **Issue:** Updates were failing silently. Investigation revealed the database model used `userName` (camelCase) while the API endpoint was trying to update `username` (lowercase).
    - **Solution:** Corrected the field name in the API endpoint to match the `User` model.
- **Missing `avatarUrl` Column:**
    - **Issue:** The server was crashing with a `SQLITE_ERROR: no such column: avatarUrl` because the database schema had not been updated after the `User` model was changed in the code.
    - **Solution:** Manually added the `avatarUrl` column to the `users` table using the `sqlite3` command-line tool (`ALTER TABLE users ADD COLUMN avatarUrl VARCHAR(255);`).

### Phase 3: Aliyun OSS Integration for Persistent File Storage

- **Problem:** User-uploaded photos were only stored in server memory temporarily and were lost after the request, making the feature non-functional.
- **Solution:** We decided to implement a proper cloud storage solution.
    1.  **Bucket Creation:** Guided the user to create a private Aliyun OSS bucket. The decision was made to keep it private and use **Signed URLs** for secure access, which is a security best practice.
    2.  **SDK Installation:** Installed the `ali-oss` npm package in the `server` project.
    3.  **Configuration:**
        - Initialized the OSS client in `server.js` using credentials from a `.env` file.
        - Updated the `/api/upload-avatar` endpoint to upload file buffers received from `multer` directly to the OSS bucket. The permanent object key (e.g., `avatars/user-id-timestamp.png`) is stored in the database.
    4.  **Signed URL Generation:** Modified the `GET /api/profile` endpoint to generate a temporary, expiring, signed URL for the `avatarUrl`. This allows the frontend to display the image from the private bucket securely.

### Phase 4: Debugging the OSS Connection

- **Issue 1: Access Denied:** The server returned a `403 AccessDeniedError` when trying to upload.
    - **Cause:** The RAM user's Access Key lacked the necessary permissions to write to the OSS bucket.
    - **Solution:** Instructed the user to attach the `AliyunOSSFullAccess` policy to their RAM user in the Aliyun console.
- **Issue 2: DNS Not Found:** The server returned an `ENOTFOUND` error.
    - **Cause:** A typo was found in the `ALIYUN_OSS_REGION` variable within the `.env` file (`oss-cn-shang` instead of `oss-cn-shanghai`).
    - **Solution:** Corrected the typo in the `.env` file.

### Phase 5: Advanced Frontend State Management & UX Polish

- **Problem 1: Stale Header Avatar:** After updating a profile picture, the small avatar in the top-right header menu did not update.
    - **Cause:** The user state was managed locally within `UserProfile.tsx` and was not shared with the parent `App.tsx` component.
    - **Solution:** "Lifted the state up" to `App.tsx`, making it the single source of truth for user data. `App.tsx` now fetches the user profile and passes the data down as props to both `UserMenu.tsx` and `UserProfile.tsx`. A callback function (`onProfileUpdate`) was passed to `UserProfile.tsx` to trigger a data refresh in `App.tsx` after a successful update.
- **Problem 2: Re-saving Broke the Avatar:** Clicking the "Save" button a second time would break the avatar permanently.
    - **Cause:** The frontend was sending the temporary *signed URL* back to the backend instead of the permanent *object key*.
    - **Solution:** The backend API was modified to send both the `avatarUrl` (signed) and a new `avatarKey` (permanent). The frontend was updated to store this `avatarKey` and send it back on subsequent saves, fixing the data corruption issue.
- **Problem 3: Disruptive Success Alert:** A JavaScript `alert()` on successful save was a poor user experience.
    - **Solution:** Removed the `alert()` and replaced it with a temporary, green success message ("个人资料更新成功!") that appears below the "Save" button for 3 seconds.
- **Problem 4: UI Inconsistencies:** A redundant header in the user dropdown menu was removed, and font sizes were standardized for a cleaner look.

---

This comprehensive approach took the feature from a basic concept to a fully functional, secure, and user-friendly component of the application. 