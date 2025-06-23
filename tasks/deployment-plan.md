# Voco Web Portal Deployment Plan

This document outlines the strategy for deploying the Voco web application and preparing the Electron desktop application for a production environment.

## Phase 1: Web Portal Deployment (Backend & Frontend)

The web portal consists of a Node.js backend and a React frontend. The recommended approach is to host them on separate, specialized platforms (e.g., backend on Heroku/DigitalOcean, frontend on Vercel/Netlify) for better scalability and developer experience.

### 1. Identify Configurable Variables

All environment-specific values should be managed using environment variables, not hardcoded.

#### Backend (`server/`)

Create a `.env` file in the `server/` directory for local development. For production, these variables must be set in your hosting provider's dashboard.

```bash
# .env file for the server
# Server Configuration
PORT=3001
NODE_ENV=production
JWT_SECRET=your-super-strong-and-long-random-jwt-secret

# Database URL (Example for PostgreSQL)
# For local SQLite, this might be unused if sequelize defaults to the config file.
DATABASE_URL="postgresql://user:password@host:port/database"

# Aliyun Credentials
ALIYUN_ACCESS_KEY_ID=your_aliyun_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_aliyun_access_key_secret
ALIYUN_APP_KEY=your_aliyun_asr_app_key

# Aliyun OSS Configuration
ALIYUN_OSS_REGION=your_oss_region
ALIYUN_OSS_BUCKET=your_oss_bucket_name

# The URL of your deployed frontend application
CORS_ORIGIN=https://your-frontend-app-url.com
```

#### Frontend (`/`)

The frontend uses a relative path `const API_BASE_URL = '/api';` to connect to the backend. This is a robust method that relies on the hosting provider to proxy requests. No `.env` file is strictly needed for the `API_BASE_URL` itself if using this proxy strategy.

### 2. Database Migration Plan

The application currently uses SQLite and `sequelize.sync()`, which is convenient for development but not robust for production.

**Recommendation: Migrate to a managed PostgreSQL or MySQL database.**

**Migration Steps:**

1.  **Provision a Database:** Create a new PostgreSQL database on a managed service (e.g., AWS RDS, Heroku Postgres, DigitalOcean Managed Databases).
2.  **Install DB Driver:** Add the appropriate Node.js driver to the backend's `package.json`:
    ```bash
    # In server/ directory
    npm install pg pg-hstore
    ```
3.  **Update Database Connection:** Modify `server/database.js` to connect to your new PostgreSQL database using the `DATABASE_URL` environment variable.
    ```javascript
    // server/database.js
    const { Sequelize } = require('sequelize');
    require('dotenv').config();

    const sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false // This may be needed depending on your provider
        }
      },
      logging: false
    });

    module.exports = sequelize;
    ```
4.  **Introduce a Migration Tool (Recommended):** Instead of `sequelize.sync()`, use a dedicated migration tool like `sequelize-cli` or `umzug`. This gives you precise control over schema changes and makes updates reliable.
    - **Initial Migration:** Create a migration script that defines the `Users` and `TranscriptionRecords` tables.
    - **Data Seeding:** Run a script to transfer any existing data from your SQLite database to the new production database if necessary.

### 3. Backend Deployment (Example: Heroku)

1.  **Prepare `package.json`:** Ensure a `start` script exists and specify the node version.
    ```json
    // server/package.json
    "scripts": {
      "start": "node server.js",
      // ...
    },
    "engines": {
      "node": "18.x" // Or your desired Node.js version
    }
    ```
2.  **Push to GitHub:** Ensure the `server` directory is part of a GitHub repository.
3.  **Create Heroku App:** Create a new application on Heroku.
4.  **Connect Repo & Deploy:** Connect your GitHub repository and enable automatic deploys from the `main` branch.
5.  **Configure Environment Variables:** In the Heroku app's "Settings" -> "Config Vars", add all the environment variables listed in Step 1.
6.  **Provision Database:** Add the "Heroku Postgres" add-on. This will automatically set the `DATABASE_URL` config var.
7.  **Run Migrations:** If using a migration tool, run the migration command via the Heroku CLI or by adding it as a `heroku-postbuild` script in `package.json`.

### 4. Frontend Deployment (Example: Vercel)

1.  **Push to GitHub:** Your root project directory should be a GitHub repository.
2.  **Create Vercel Project:** Import the GitHub repository into Vercel.
3.  **Configure Project:** Vercel will automatically detect it as a Vite project. The default build command (`npm run build`) and output directory (`dist`) are correct.
4.  **Configure Rewrites for API Proxy:** Create a `vercel.json` file in the root of your project to proxy API requests to your backend.

    ```json
    // vercel.json
    {
      "rewrites": [
        {
          "source": "/api/:path*",
          "destination": "https://your-heroku-backend-app-name.herokuapp.com/api/:path*"
        }
      ]
    }
    ```
    *Replace the `destination` URL with your actual deployed backend URL.*
5.  **Deploy:** Vercel will build and deploy the frontend. The `CORS_ORIGIN` on your backend must be updated to the URL Vercel provides (e.g., `https://your-project.vercel.app`).

## Phase 2: Electron App Update

The Electron app must be updated to point to the new production server instead of `localhost`.

### 1. Configuration Changes

1.  **Locate API Endpoint:** Find the file in the Electron app's source code where the backend URL is defined.
2.  **Use Environment Variables:** Implement a system to distinguish between development and production.
    ```javascript
    // Example in Electron's main process or a config file
    const isDev = process.env.NODE_ENV !== 'production';
    const API_URL = isDev ? 'http://localhost:3001' : 'https://your-heroku-backend-app-name.herokuapp.com';
    ```
3.  **Build Process:** Ensure your Electron build process (e.g., using `electron-builder`) correctly sets `NODE_ENV=production` when creating a production package.

### 2. Build and Release

- Re-build the Electron application for all target platforms (Windows, macOS, Linux).
- Distribute the updated application to your users.

## Post-Deployment Checklist

- [ ] Verify user authentication (signup, login, refresh token) works on the deployed web app.
- [ ] Test Aliyun integrations (SMS, file upload, speech-to-text).
- [ ] Confirm the updated Electron app can communicate with the production backend.
- [ ] Set up monitoring and logging for the backend application (e.g., using Heroku's built-in tools or a service like Sentry/LogRocket).
- [ ] Establish a regular backup schedule for the production database. 