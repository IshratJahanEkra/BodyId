// backend/utils/ocr.js
/**
 * Google Cloud Vision API OCR Utility
 * Extracts text from medical report images
 */

import { ImageAnnotatorClient } from '@google-cloud/vision';

// Initialize Google Cloud Vision client
let visionClient = null;

try {
  // Initialize client with credentials from environment variable
  // GOOGLE_APPLICATION_CREDENTIALS should point to your service account JSON file
  // Or use GOOGLE_CLOUD_PROJECT_ID and GOOGLE_CLOUD_KEY_FILE
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    visionClient = new ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    console.log('✅ Google Cloud Vision initialized with service account credentials');
  } else if (process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_CLOUD_KEY_FILE) {
    visionClient = new ImageAnnotatorClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
    });
    console.log('✅ Google Cloud Vision initialized with project ID and key file');
  } else if (process.env.GOOGLE_CLOUD_API_KEY) {
    // Note: API key method may not work for all features
    // For production, use service account credentials
    visionClient = new ImageAnnotatorClient({
      apiKey: process.env.GOOGLE_CLOUD_API_KEY,
    });
    console.log('✅ Google Cloud Vision initialized with API key');
  } else {
    console.warn('⚠️  Google Cloud Vision API credentials not found. OCR will not be available.');
    console.warn('   Set GOOGLE_APPLICATION_CREDENTIALS, GOOGLE_CLOUD_PROJECT_ID, or GOOGLE_CLOUD_API_KEY in .env');
    console.warn('   Server will start, but AI Doctor feature will not work until credentials are configured.');
  }
} catch (error) {
  console.warn('⚠️  Google Cloud Vision client initialization failed:', error.message);
  console.warn('   OCR functionality will be limited. Please set up Google Cloud credentials.');
  console.warn('   Server will start, but AI Doctor feature will not work until credentials are configured.');
  visionClient = null;
}

/**
 * Extract text from image using OCR
 * @param {Buffer} imageBuffer - Image file buffer
 * @returns {Promise<string>} - Extracted text
 */
export async function extractTextFromImage(imageBuffer) {
  if (!visionClient) {
    throw new Error(
      'Google Cloud Vision API is not configured. Please set up GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CLOUD_API_KEY in your environment variables.'
    );
  }

  try {
    // Perform text detection
    const [result] = await visionClient.textDetection({
      image: { content: imageBuffer },
    });

    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      throw new Error('No text found in the image');
    }

    // The first element contains the full text
    const fullText = detections[0].description || '';

    if (!fullText || fullText.trim().length === 0) {
      throw new Error('No readable text extracted from the image');
    }

    return fullText.trim();
  } catch (error) {
    console.error('OCR Error:', error);

    // Provide helpful error messages
    if (error.message.includes('credentials')) {
      throw new Error(
        'Google Cloud Vision API credentials are invalid or missing. Please check your environment variables.'
      );
    }

    if (error.message.includes('quota') || error.message.includes('billing')) {
      throw new Error(
        'Google Cloud Vision API quota exceeded or billing not enabled. Please check your Google Cloud account.'
      );
    }

    throw new Error(`OCR extraction failed: ${error.message}`);
  }
}

/**
 * Validate if the image is a valid medical document format
 * @param {Buffer} imageBuffer - Image file buffer
 * @param {string} mimeType - MIME type of the image
 * @returns {Promise<boolean>} - Whether the image is valid
 */
export async function validateMedicalImage(imageBuffer, mimeType) {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

  if (!allowedTypes.includes(mimeType)) {
    return false;
  }

  // Basic validation - check if file is not empty
  if (!imageBuffer || imageBuffer.length === 0) {
    return false;
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (imageBuffer.length > maxSize) {
    return false;
  }

  return true;
}

