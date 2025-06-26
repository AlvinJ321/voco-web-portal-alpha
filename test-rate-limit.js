const axios = require('axios');
const fs = require('fs');

// --- CONFIGURATION ---
// PASTE YOUR JWT ACCESS TOKEN HERE
const JWT_TOKEN = 'PASTE_YOUR_JWT_ACCESS_TOKEN_HERE';

const API_ENDPOINT = 'http://localhost:3001/api/speech';
const AUDIO_FILE_PATH = './test-sample.wav'; // Path to your sample wav file
const NUMBER_OF_REQUESTS = 5; // Send 5 requests to test a limit of 2 QPS

// --- SCRIPT ---

if (JWT_TOKEN === 'PASTE_YOUR_JWT_ACCESS_TOKEN_HERE') {
  console.error('Error: Please paste your JWT access token into the script.');
  process.exit(1);
}

// Function to send a single request
async function sendRequest(id) {
  try {
    console.log(`[Request ${id}] Starting at ${new Date().toLocaleTimeString()}`);
    const audioBuffer = fs.readFileSync(AUDIO_FILE_PATH);

    const startTime = Date.now();
    const response = await axios.post(API_ENDPOINT, audioBuffer, {
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'audio/wav',
      },
    });
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log(`[Request ${id}] SUCCESS at ${new Date().toLocaleTimeString()} (took ${duration.toFixed(2)}s)`);
    return response.data;
  } catch (error) {
    console.error(`[Request ${id}] FAILED:`, error.response ? error.response.data : error.message);
  }
}

// Main function to run the test
async function runTest() {
  console.log(`--- Starting test with ${NUMBER_OF_REQUESTS} concurrent requests ---`);

  const requests = [];
  for (let i = 1; i <= NUMBER_OF_REQUESTS; i++) {
    requests.push(sendRequest(i));
  }

  // Wait for all requests to complete
  await Promise.all(requests);

  console.log('--- Test finished ---');
}

runTest(); 