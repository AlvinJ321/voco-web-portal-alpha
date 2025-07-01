const axios = require('axios');

const userSessions = new Map();
const SESSION_TIMEOUT = 60 * 60 * 1000; // 60 minutes in milliseconds

async function refineText(userId, text) {
  // Validate required environment variables from the official documentation
  if (!process.env.DASHSCOPE_API_KEY) {
    console.error('Missing DashScope API Key');
    throw new Error('Please set the environment variable: DASHSCOPE_API_KEY');
  }
  if (!process.env.BAILIAN_APP_ID) {
    console.error('Missing Bailian App ID');
    throw new Error('Please set the environment variable: BAILIAN_APP_ID');
  }

  const apiKey = process.env.DASHSCOPE_API_KEY;
  const appId = process.env.BAILIAN_APP_ID;
  
  // Use private endpoint from environment variable if available, otherwise default to public endpoint
  const baseUrl = process.env.DASHSCOPE_API_BASE_URL || 'https://dashscope.aliyuncs.com/api/v1';
  const url = `${baseUrl}/apps/${appId}/completion`;

  let session = userSessions.get(userId);

  // Clean up expired sessions before proceeding
  if (session && Date.now() - session.lastActivity > SESSION_TIMEOUT) {
    userSessions.delete(userId);
    session = null;
    console.log(`Session expired for user ${userId}`);
  }

  const sessionId = session ? session.sessionId : undefined;

  // Construct the request body as per the API documentation
  const requestBody = {
    input: {
      prompt: text,
    },
    parameters: {},
  };

  if (sessionId) {
    requestBody.session_id = sessionId;
    console.log(`Continuing session ${sessionId} for user ${userId}`);
  } else {
    console.log(`Starting new session for user ${userId}`);
  }

  try {
    const response = await axios.post(url, requestBody, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30-second timeout for the API call
    });

    const responseData = response.data;
    
    // Check for a successful response and valid output
    if (response.status === 200 && responseData.output && responseData.output.text) {
      const newSessionId = responseData.output.session_id;
      
      // Update session with the new ID and activity time
      if (newSessionId) {
          userSessions.set(userId, {
            sessionId: newSessionId,
            lastActivity: Date.now(),
          });
      }

      return responseData.output.text;
    } else {
      console.error('DashScope API returned an unexpected response:', responseData);
      return text; // Fallback to original text
    }
  } catch (error) {
    const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error(`Error calling DashScope API: ${errorMessage}`);
    return text; // Fallback to original text on any error
  }
}

module.exports = { refineText }; 