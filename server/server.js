const express = require('express');
const cors = require('cors'); // Import the cors package
const sequelize = require('./database'); // Your Sequelize instance
const User = require('./models/User'); // Your User model
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const crypto = require('crypto'); // For generating refresh token
const axios = require('axios'); // For Aliyun ASR
const RPCClient = require('@alicloud/pop-core'); // For Aliyun ASR Token
const multer = require('multer');
const OSS = require('ali-oss');
const path = require('path');
const { calculateWordCount, calculateRecordingDuration } = require('./utils/transcription');
const { refineText } = require('./utils/refiner');
const { sendVerificationSms } = require('./utils/sms');
const TranscriptionRecord = require('./models/TranscriptionRecord');
const { default: PQueue } = require('p-queue');

// Load environment variables (ensure .env file is set up with JWT_SECRET)
require('dotenv').config(); 

const IS_PROD = process.env.NODE_ENV === 'production';

// Primary OSS client (uses internal in prod for uploads)
const ossClient = new OSS({
  region: process.env.ALIYUN_OSS_REGION,
  accessKeyId: process.env.ALIYUN_ENTERPRISE_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALIYUN_ENTERPRISE_ACCESS_KEY_SECRET,
  bucket: process.env.ALIYUN_OSS_BUCKET,
  internal: IS_PROD,
});

// Separate OSS client for generating external signed URLs (always external)
const signingOssClient = new OSS({
  region: process.env.ALIYUN_OSS_REGION,
  accessKeyId: process.env.ALIYUN_ENTERPRISE_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALIYUN_ENTERPRISE_ACCESS_KEY_SECRET,
  bucket: process.env.ALIYUN_OSS_BUCKET,
  internal: false,  // Ensure public-facing URLs
});

const app = express();
const PORT = process.env.PORT || 3001; // Port for the backend server

// Setup multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Setup CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN 
    : 'http://localhost:5173', // Allow Vite dev server in dev
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));

app.use(express.json()); // Middleware to parse JSON bodies
// Middleware for Aliyun ASR - must be placed before auth routes if they don't use it
app.use(express.raw({ type: 'audio/wav', limit: '10mb' }));

// IMPORTANT: This will now fetch from your .env file. 
// Ensure JWT_SECRET is defined there with a strong, unique secret!
const JWT_SECRET = process.env.JWT_SECRET || 'FALLBACK_SECRET_REPLACE_AND_USE_DOTENV'; 
const JWT_EXPIRES_IN = '15m'; // Access token expires in 15 minutes
const REFRESH_TOKEN_EXPIRES_IN_DAYS = 30; // Refresh token expires in 30 days

// In-memory store for rate limiting SMS requests.
// Production-ready apps should use a persistent store like Redis.
const smsRequestTimestamps = {};

// --- ASR Queue for Rate Limiting ---
// Use p-queue to limit concurrency and rate for Aliyun ASR service
// This creates a queue that will process a maximum of ASR_QPS_LIMIT
// requests every second (1000ms).
const asrQueue = new PQueue({
  interval: 1000,
  intervalCap: parseInt(process.env.ASR_QPS_LIMIT, 10) || 2, // Convert env var to number, default to 2
});

// --- Aliyun ASR (Speech-to-Text) Configuration ---
const ALIYUN_ASR_APP_KEY = process.env.ALIYUN_ASR_APP_KEY;
let asrAccessToken = null;
let asrTokenExpiry = null;

async function getAsrAccessToken() {
  if (asrAccessToken && asrTokenExpiry && asrTokenExpiry > new Date()) {
    return asrAccessToken;
  }
  try {
    const client = new RPCClient({
      accessKeyId: process.env.ALIYUN_ASR_ACCESS_KEY_ID,
      accessKeySecret: process.env.ALIYUN_ASR_ACCESS_KEY_SECRET,
      // This is the regional endpoint for the token service.
      // When called from an ECS in the same region (cn-shanghai), this request will be routed over the internal network.
      endpoint: 'https://nls-meta.cn-shanghai.aliyuncs.com',
      apiVersion: '2019-02-28',
    });
    const result = await client.request('CreateToken', {}, { method: 'POST' });
    if (result && result.Token && result.Token.Id && result.Token.ExpireTime) {
      asrAccessToken = result.Token.Id;
      asrTokenExpiry = new Date(result.Token.ExpireTime * 1000);
      console.log('New Aliyun ASR token obtained, expires at:', asrTokenExpiry);
      return asrAccessToken;
    } else {
      throw new Error('Invalid token response structure from Aliyun.');
    }
  } catch (error) {
    console.error('Error getting Aliyun ASR access token:', error);
    asrAccessToken = null;
    asrTokenExpiry = null;
    throw error;
  }
}

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    console.log('[Auth Debug] No token provided, returning 401');
    return res.sendStatus(401);
  }

  console.log('[Auth Debug] Verifying token:', token.substring(0, 10) + '...'); // Log partial token for debugging

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('[Auth Debug] Token verification failed:', err.message);
      return res.sendStatus(403);
    }
    req.user = user;
    console.log('[Auth Debug] Token verified successfully for user:', user.userId);
    next();
  });
}

// Function to generate a random 6-digit code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Async function to initialize database and start server
async function initializeAndStartServer() {
  try {
    // Test the database connection
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');

    // Sync all defined models to the DB. 
    // This creates the table if it doesn't exist (and does nothing if it already exists)
    // In production, we should use sync() without force: true to preserve data
    
    // First sync User model
    await User.sync();
    console.log('User table has been synchronized.');

    // Then sync TranscriptionRecord model
    await TranscriptionRecord.sync();
    console.log('TranscriptionRecord table has been synchronized.');

    // Test endpoint to create a transcription record
    app.post('/api/test-transcription', authenticateToken, async (req, res) => {
      try {
        const record = await TranscriptionRecord.create({
          transactionId: `TEST-${Date.now()}`,
          userId: req.user.userId,
          recordingDuration: 30,
          wordCount: 50,
          status: 'success'
        });

        res.json({
          success: true,
          message: 'Test transcription record created',
          record
        });
      } catch (error) {
        console.error('Error creating test record:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to create test record',
          error: error.message
        });
      }
    });

    // Test endpoint to get all transcription records for the authenticated user
    app.get('/api/transcriptions', authenticateToken, async (req, res) => {
      try {
        const records = await TranscriptionRecord.findAll({
          where: { userId: req.user.userId },
          order: [['createdAt', 'DESC']], // Most recent first
          include: [{
            model: User,
            attributes: ['userName', 'phoneNumber'] // Include user info
          }]
        });
        
        res.json({
          success: true,
          records: records.map(record => ({
            transactionId: record.transactionId,
            userName: record.User.userName,
            phoneNumber: record.User.phoneNumber,
            recordingDuration: record.recordingDuration,
            wordCount: record.wordCount,
            status: record.status,
            createdAt: record.createdAt
          }))
        });
      } catch (error) {
        console.error('Error fetching transcription records:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch transcription records',
          error: error.message
        });
      }
    });

    // Endpoint for avatar upload
    app.post('/api/upload-avatar', authenticateToken, upload.single('file'), async (req, res) => {
      if (!req.file) {
        return res.status(400).send('No file uploaded.');
      }
      try {
        // Create a unique object name for the file
        const objectName = `avatars/${req.user.userId}-${Date.now()}${path.extname(req.file.originalname)}`;
        
        // Upload the file buffer to OSS
        const result = await ossClient.put(objectName, req.file.buffer);

        // The URL returned here is the internal OSS URL, but we'll return the object name
        // to be stored in the database.
        res.status(200).json({ avatarUrl: objectName });
      } catch (error) {
        console.error('Error uploading to OSS:', error);
        res.status(500).json({ message: 'Failed to upload file.' });
      }
    });

    // --- Profile Endpoints ---
    app.get('/api/profile', authenticateToken, async (req, res) => {
      try {
        const user = await User.findByPk(req.user.userId, {
          attributes: ['userId', 'phoneNumber', 'userName', 'avatarUrl']
        });
        if (!user) {
          return res.status(404).json({ message: 'User not found.' });
        }

        let signedAvatarUrl = null;
        if (user.avatarUrl) {
          // Use the signing client to generate an external signed URL
          signedAvatarUrl = signingOssClient.signatureUrl(user.avatarUrl, { expires: 3600 });
        }

        res.json({
          userId: user.userId,
          phoneNumber: user.phoneNumber,
          username: user.userName,
          avatarUrl: signedAvatarUrl, // Temporary URL for display
          avatarKey: user.avatarUrl,  // Permanent key for state management
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Error fetching profile' });
      }
    });

    app.put('/api/profile', authenticateToken, async (req, res) => {
      try {
        const { username, avatarUrl } = req.body;
        const user = await User.findByPk(req.user.userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found.' });
        }

        user.userName = username;
        if (avatarUrl) {
          user.avatarUrl = avatarUrl;
        }
        await user.save();
        
        let signedAvatarUrl = null;
        if (user.avatarUrl) {
          // Use the signing client to generate an external signed URL
          signedAvatarUrl = signingOssClient.signatureUrl(user.avatarUrl, { expires: 3600 });
        }

        res.json({
          userId: user.userId,
          phoneNumber: user.phoneNumber,
          username: user.userName,
          avatarUrl: signedAvatarUrl, // Temporary URL for display
          avatarKey: user.avatarUrl,  // Permanent key for state management
        });
      } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
      }
    });

    // --- Secure Download Endpoint ---

         app.get('/api/download/mac', authenticateToken, (req, res) => {
          console.log('[Debug] __dirname:', __dirname);
          console.log('[Debug] process.cwd():', process.cwd());
          const filePath = path.join(__dirname, 'downloads', 'Voco.dmg');
          const fs = require('fs');

          console.log('[Debug] Full resolved filePath:', filePath);
          console.log('[Debug] existsSync result:', fs.existsSync(filePath));

          // ADD: Debugging logs
          console.log('[Debug] Request received for download. User:', req.user);  // Confirms auth
          console.log('[Debug] Calculated filePath:', filePath);

          // Additional diagnostic: Try to list files in downloads/ to verify accessibility
          try {
            const downloadsDir = path.join(__dirname, 'downloads');
            const files = fs.readdirSync(downloadsDir);
            console.log('[Debug] Downloads directory:', downloadsDir);
            console.log('[Debug] Files in downloads:', files);
          } catch (err) {
            console.log('[Debug] Error reading downloads directory:', err.message);
          }
          
          if (fs.existsSync(filePath)) {
            console.log('[Debug] File exists and is accessible.');
          } else {
            console.log('[Debug] File does not exist or inaccessible at:', filePath);
            return res.status(404).send({ message: 'File not found.' });
          }
   
          res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          res.set('Pragma', 'no-cache');
          res.set('Expires', '0');
          
          res.download(filePath, 'Voco.dmg', (err) => {
            if (err) {
              console.error('Error downloading file:', err);
              if (!res.headersSent) {
                res.status(404).send({ message: 'File not found or error during download.' });
              }
            }
          });
        });

    // --- Aliyun ASR (Speech-to-Text) Endpoint ---
    app.post('/api/speech', authenticateToken, async (req, res) => {
      console.log('[Server] Received audio data, size:', req.body.length);
      const shouldRefine = req.query.refine === 'true';

      if (!ALIYUN_ASR_APP_KEY) {
        return res.status(500).json({ error: 'Server configuration error: Aliyun AppKey is missing' });
      }

      try {
        // Add the ASR processing logic to the queue.
        // The request will be held open until this task is processed.
        const transcript = await asrQueue.add(async () => {
          const token = await getAsrAccessToken();
          const audioData = req.body;

          // Select Aliyun endpoint based on environment
          const asrEndpoint = IS_PROD
            ? 'http://nls-gateway-cn-shanghai-internal.aliyuncs.com'
            : 'https://nls-gateway.cn-shanghai.aliyuncs.com';
          const fullUrl = `${asrEndpoint}/stream/v1/asr?appkey=${ALIYUN_ASR_APP_KEY}&format=wav&sample_rate=16000&enable_punctuation_prediction=true&enable_inverse_text_normalization=true&enable_voice_detection=true`;

          const aliyunResponse = await axios.post(fullUrl, audioData, {
            headers: {
              'X-NLS-Token': token,
              'Content-Type': 'application/octet-stream',
            },
            timeout: 15000,
          });

          if (aliyunResponse.data && aliyunResponse.data.status === 20000000 && aliyunResponse.data.result) {
            const originalTranscript = aliyunResponse.data.result;

            let transcriptToReturn = originalTranscript;
            if (shouldRefine) {
              // Refine the transcript using the new service
              console.log('[Server] Refining transcript for user:', req.user.userId);
              transcriptToReturn = await refineText(req.user.userId, originalTranscript);
            }
            
            // Calculate recording duration and word count from original transcript
            const recordingDuration = calculateRecordingDuration(audioData);
            const wordCount = calculateWordCount(originalTranscript);

            // Create transcription record with original data
            await TranscriptionRecord.create({
              transactionId: `TR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              userId: req.user.userId,
              recordingDuration: Math.round(recordingDuration),
              wordCount,
              status: 'success'
            });

            return transcriptToReturn; // Return the original or refined transcript
          } else {
            console.error('[Server] Aliyun ASR error:', aliyunResponse.data);
            
            // Create failed transcription record
            await TranscriptionRecord.create({
              transactionId: `TR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              userId: req.user.userId,
              recordingDuration: Math.round(calculateRecordingDuration(audioData)),
              wordCount: 0,
              status: 'failed'
            });

            // Throw an error to be caught by the outer catch block
            throw new Error(aliyunResponse.data.message || 'Speech recognition failed');
          }
        });

        res.json({ transcript });

      } catch (error) {
        console.error('[Server] Error in /api/speech endpoint:', error.response ? error.response.data : error.message);
        
        // This part now primarily catches errors from the queuing logic itself or re-throws from the task
        
        // Check if a failed record was already created inside the queue task
        // This is a simplification; a more robust solution might pass a unique ID
        // to avoid double-logging, but for this context, it's acceptable.
        if (!res.headersSent) {
          try {
            await TranscriptionRecord.create({
              transactionId: `TR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              userId: req.user.userId,
              recordingDuration: Math.round(calculateRecordingDuration(req.body)),
              wordCount: 0,
              status: 'failed'
            });
          } catch (recordError) {
            console.error('[Server] Failed to create transcription record after queue error:', recordError);
          }

          res.status(500).json({ error: error.message || 'Internal server error during speech recognition' });
        }
      }
    });

    // Endpoint to send verification code
    app.post('/api/send-verification-code', async (req, res) => {
      const { phoneNumber, intent } = req.body; // 'intent' can be 'login' or 'signup'

      if (!phoneNumber) {
        return res.status(400).json({ message: 'Phone number is required.' });
      }

      try {
        const user = await User.findOne({ where: { phoneNumber } });

        // --- Rate Limiting ---
        const now = new Date();
        if (user && user.verificationCodeExpiresAt && now < user.verificationCodeExpiresAt) {
          const timeLeft = Math.ceil((user.verificationCodeExpiresAt - now) / 1000);
          if (timeLeft > 540) { // If less than 60 seconds have passed since last code
            return res.status(429).json({ 
              message: 'You are requesting too frequently. Please try again in a moment.',
              timeLeft: Math.ceil(timeLeft - 540) // Return seconds until next code can be requested
            });
          }
        }

        // Scenario: Trying to log in with a number that doesn't exist.
        if (intent === 'login' && !user) {
          return res.status(404).json({ message: 'This phone number is not registered. Please sign up first.' });
        }

        // Scenario: Trying to sign up with a number that is already registered.
        // We check if verificationCode is null, which implies the user completed a previous registration.
        if (intent === 'signup' && user && user.verificationCode === null) {
          return res.status(409).json({ message: 'This phone number is already registered. Please log in.' });
        }

        const verificationCode = generateVerificationCode();
        const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await sendVerificationSms(phoneNumber, verificationCode);

        if (user) {
          // Update existing user's verification code and expiry
          user.verificationCode = verificationCode;
          user.verificationCodeExpiresAt = verificationCodeExpiresAt;
          await user.save();
        } else {
          // Create a new user record (only happens in signup flow for a new number)
          await User.create({
            phoneNumber,
            verificationCode,
            verificationCodeExpiresAt,
          });
        }

        res.status(200).json({ message: 'Verification code sent successfully.' });

      } catch (error) {
        console.error('Error sending verification code:', error);
        if (error.code && error.message) { // Aliyun SDK error
          console.error('Aliyun API Error:', error.message);
          return res.status(500).json({ message: 'Failed to send verification code. Please try again later.' });
        }
        res.status(500).json({ message: 'An internal error occurred.' });
      }
    });

    // Endpoint for user sign-up / login
    app.post('/api/verify', async (req, res) => {
      const { phoneNumber, verificationCode, userName, intent } = req.body; // intent: 'signup' or 'login'

      if (!phoneNumber || !verificationCode) {
        return res.status(400).json({ message: 'Phone number and verification code are required.' });
      }

      try {
        const user = await User.findOne({ where: { phoneNumber } });

        if (!user) {
          // This case should ideally be caught by the send-code logic, but as a safeguard:
          return res.status(404).json({ message: 'Please request a verification code first.' });
        }

        if (user.verificationCode !== verificationCode) {
          return res.status(400).json({ message: 'The verification code is incorrect.' });
        }

        if (new Date() > new Date(user.verificationCodeExpiresAt)) {
          return res.status(400).json({ message: 'Your verification code has expired. Please request a new one.' });
        }

        // --- Verification successful, now handle login vs. signup specifics ---

        // Clear the verification code now that it has been used
        user.verificationCode = null;
        user.verificationCodeExpiresAt = null; 
        
        // If signing up, set the username if provided
        if (intent === 'signup' && userName) {
          user.userName = userName;
        }

        // Generate tokens for the session
        const accessToken = jwt.sign(
          { userId: user.userId, phoneNumber: user.phoneNumber },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        const refreshToken = crypto.randomBytes(64).toString('hex');
        user.refreshToken = refreshToken;
        user.refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);

        await user.save(); // Save all changes (cleared code, tokens, possibly username)

        res.status(200).json({
          message: intent === 'signup' ? 'User signed up successfully.' : 'User logged in successfully.',
          accessToken,
          refreshToken,
          user: {
            id: user.userId,
            phoneNumber: user.phoneNumber,
            userName: user.userName,
          }
        });

      } catch (error) {
        console.error(`Error during ${intent}:`, error);
        res.status(500).json({ message: `An error occurred during ${intent}.` });
      }
    });

    // DEPRECATED ROUTE: /api/signup
    app.post('/api/signup', (req, res) => {
      res.status(410).json({ message: "This endpoint is deprecated. Please use /api/verify with intent 'signup'." });
    });

    // DEPRECATED ROUTE: /api/login
    app.post('/api/login', (req, res) => {
        res.status(410).json({ message: "This endpoint is deprecated. Please use /api/verify with intent 'login'." });
    });

    // Endpoint to get current user's profile
    app.get('/api/me', async (req, res) => {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization header is missing or malformed.' });
      }

      const token = authHeader.split(' ')[1];

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findByPk(decoded.userId, {
          attributes: ['userId', 'phoneNumber', 'userName'] // Specify fields to return
        });

        if (!user) {
          return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json(user);
      } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
          return res.status(401).json({ message: 'Invalid token.' });
        }
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching user profile.' });
      }
    });

    // Endpoint to refresh the access token
    app.post('/api/refresh-token', async (req, res) => {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token is required.' });
      }

      try {
        const user = await User.findOne({ where: { refreshToken } });

        if (!user) {
          return res.status(403).json({ message: 'Invalid refresh token.' });
        }

        if (new Date() > new Date(user.refreshTokenExpiresAt)) {
          // Invalidate the token in the database
          user.refreshToken = null;
          user.refreshTokenExpiresAt = null;
          await user.save();
          return res.status(403).json({ message: 'Refresh token has expired. Please log in again.' });
        }

        // Token is valid, issue a new access token
        const newAccessToken = jwt.sign(
          { userId: user.userId, phoneNumber: user.phoneNumber },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(200).json({
          accessToken: newAccessToken,
        });

      } catch (error) {
        console.error('Error during token refresh:', error);
        res.status(500).json({ message: 'Failed to refresh token.' });
      }
    });

    // Endpoint for user logout
    app.post('/api/logout', async (req, res) => {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        // Can't do anything if we don't know which token to invalidate
        return res.status(400).json({ message: 'Refresh token is required.' });
      }

      try {
        const user = await User.findOne({ where: { refreshToken } });
        if (user) {
          // Invalidate the refresh token
          user.refreshToken = null;
          user.refreshTokenExpiresAt = null;
          await user.save();
        }
        // Always return success to prevent leaking information about which tokens are valid
        res.status(200).json({ message: 'Logout successful.' });
      } catch (error) {
        console.error('Error during logout:', error);
        // Avoid sending detailed error messages here
        res.status(500).json({ message: 'Logout failed.' });
      }
    });

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Unable to connect to the database or start the server:', error);
    process.exit(1); // Exit the process with an error code
  }
}

// Call the function to initialize and start
initializeAndStartServer(); 