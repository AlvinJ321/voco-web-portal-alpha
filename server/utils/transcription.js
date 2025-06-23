/**
 * Utility functions for transcription-related calculations
 */

/**
 * Calculate word count from transcription text
 * Treats one Chinese character as one word, one English word as one word
 * @param {string} text - The transcription text
 * @returns {number} - The word count
 */
function calculateWordCount(text) {
  if (!text) return 0;
  
  // Split by whitespace to get English words
  const words = text.split(/\s+/);
  
  // Count Chinese characters (they don't have spaces between them)
  let chineseCharCount = 0;
  for (const word of words) {
    // Match Chinese characters using Unicode range
    const chineseChars = word.match(/[\u4e00-\u9fa5]/g);
    if (chineseChars) {
      chineseCharCount += chineseChars.length;
    }
  }
  
  // Count non-Chinese words (English words)
  const englishWordCount = words.filter(word => !/[\u4e00-\u9fa5]/.test(word)).length;
  
  return chineseCharCount + englishWordCount;
}

/**
 * Calculate recording duration from audio buffer
 * @param {Buffer} audioBuffer - The audio buffer
 * @returns {number} - Duration in seconds
 */
function calculateRecordingDuration(audioBuffer) {
  if (!audioBuffer || audioBuffer.length < 44) return 0; // WAV header is 44 bytes
  
  // Read WAV header
  const numChannels = audioBuffer.readUInt16LE(22); // Bytes 22-23: Number of channels
  const sampleRate = audioBuffer.readUInt32LE(24); // Bytes 24-27: Sample rate
  const bitsPerSample = audioBuffer.readUInt16LE(34); // Bytes 34-35: Bits per sample
  
  // Verify format matches Aliyun ASR requirements
  if (sampleRate !== 16000) {
    console.warn(`Warning: Sample rate ${sampleRate}Hz doesn't match required 16000Hz`);
  }
  if (bitsPerSample !== 16) {
    console.warn(`Warning: ${bitsPerSample}-bit audio doesn't match required 16-bit`);
  }
  if (numChannels !== 1) {
    console.warn(`Warning: ${numChannels} channels doesn't match required mono (1 channel)`);
  }
  
  // Calculate duration
  const bytesPerSample = bitsPerSample / 8;
  const dataSize = audioBuffer.length - 44; // Subtract header size
  const numSamples = dataSize / (bytesPerSample * numChannels);
  return numSamples / sampleRate;
}

module.exports = {
  calculateWordCount,
  calculateRecordingDuration
}
