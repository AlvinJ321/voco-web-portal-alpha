const { sendFeedbackEmails } = require('./utils/email');

// Test feedback data that matches the expected structure
const testFeedbackData = {
  id: 1001,
  userId: 88,
  contactEmail: "user@example.com", // Replace with your test email
  issueType: "bug_report",
  description: "软件打开就闪退，无法录音。",
  appVersion: "v1.2.0",
  osVersion: "macOS 14.1",
  deviceModel: "MacBook Pro M1",
  cpuArch: "Apple Silicon",
  systemMemory: "16 GB",
  inputDeviceName: "AirPods Pro",
  inputSampleRate: 44100,
  micPermissionStatus: "Authorized"
};

// Run the test
async function testEmail() {
  console.log('Testing feedback email sending...');
  console.log('Feedback data:', testFeedbackData);
  
  try {
    const result = await sendFeedbackEmails(testFeedbackData);
    console.log('✓ Emails sent successfully:', result);
  } catch (error) {
    console.error('✗ Error sending emails:', error);
    process.exit(1);
  }
}

testEmail();
