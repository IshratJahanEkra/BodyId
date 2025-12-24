// backend/controllers/aiController.js
/**
 * AI Doctor Controller
 * Handles medical report upload, OCR extraction, and AI analysis
 */

import { extractTextFromImage, validateMedicalImage } from '../utils/ocr.js';
import { analyzeMedicalText, analyzePrescriptionSafety } from '../utils/aiAnalysis.js';
import { uploadToCloudinary } from '../utils/upload.js';
import Record from '../models/Record.js';
import MedicalHistory from '../models/MedicalHistory.js';

/**
 * @desc Check prescription safety against medical history
 * @route POST /api/ai/check-prescription-safety
 * @access Private
 */
export async function checkPrescriptionSafety(req, res) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No prescription image uploaded.' });
    }

    // 1. OCR Extraction
    let prescriptionText;
    try {
      prescriptionText = await extractTextFromImage(file.buffer);
    } catch (ocrError) {
      return res.status(500).json({ message: 'OCR failed', error: ocrError.message });
    }

    // 2. Fetch Medical History
    const userId = req.user._id;
    const [records, medicalHistories] = await Promise.all([
      Record.find({ patientId: userId }).select('title description tags'),
      MedicalHistory.find({ patient: userId }).select('description'),
    ]);

    // Aggregate medical history
    let historySummary = records
      .map((r) => `${r.title}: ${r.description} (Tags: ${r.tags.join(', ')})`)
      .join('\n');
    historySummary += '\n' + medicalHistories.map((h) => h.description).join('\n');

    if (!historySummary.trim()) {
      historySummary = 'No previous medical history found for this patient.';
    }

    // 3. AI Safety Analysis
    const safetyReminder = await analyzePrescriptionSafety(
      prescriptionText,
      historySummary
    );

    res.status(200).json({
      message: 'Prescription analyzed for safety',
      safetyReminder,
      extractedText: prescriptionText.substring(0, 200) + '...',
    });
  } catch (error) {
    console.error('Check Prescription Safety Error:', error);
    res.status(500).json({ message: 'Failed to check prescription safety', error: error.message });
  }
}

/**
 * @desc Analyze medical report image
 * @route POST /api/ai/analyze-report
 * @access Private
 */
export async function analyzeMedicalReport(req, res) {
  try {
    // Check if file is uploaded
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        message: 'No file uploaded. Please upload a medical report image.',
      });
    }

    // Validate file type and size
    const isValid = await validateMedicalImage(file.buffer, file.mimetype);
    if (!isValid) {
      return res.status(400).json({
        message:
          'Invalid file format. Please upload a JPEG, PNG, or PDF file (max 10MB).',
      });
    }

    // Step 1: Extract text using OCR
    let extractedText;
    try {
      console.log('Starting OCR extraction...');
      extractedText = await extractTextFromImage(file.buffer);
      console.log('OCR extraction successful. Text length:', extractedText.length);
    } catch (ocrError) {
      console.error('OCR Error:', ocrError);
      return res.status(500).json({
        message: 'Failed to extract text from image',
        error: ocrError.message,
        suggestion:
          'Please ensure the image is clear and readable. Check Google Cloud Vision API configuration.',
      });
    }

    if (!extractedText || extractedText.trim().length < 10) {
      return res.status(400).json({
        message:
          'Insufficient text extracted from image. Please ensure the image is clear and contains readable text.',
      });
    }

    // Step 2: Upload image to Cloudinary for storage (optional)
    let imageUrl = null;
    try {
      const cloudinaryResult = await uploadToCloudinary(
        file.buffer,
        `bodyid/${req.user.bodyId || req.user._id}/ai-reports`
      );
      imageUrl = cloudinaryResult.secure_url;
    } catch (uploadError) {
      console.warn('Cloudinary upload failed:', uploadError);
      // Continue without storing image - not critical
    }

    // Step 3: Analyze extracted text using OpenAI
    let analysisResult;
    try {
      console.log('Starting AI analysis...');
      analysisResult = await analyzeMedicalText(extractedText);
      console.log('AI analysis successful');
    } catch (aiError) {
      console.error('AI Analysis Error:', aiError);

      // If OpenAI fails, provide fallback analysis
      console.log('Using fallback analysis...');
      analysisResult = fallbackAnalysis(extractedText);

      // Still return the extracted text and basic analysis
      return res.status(200).json({
        message: 'Text extracted successfully. AI analysis unavailable.',
        warning: 'OpenAI API is not configured or unavailable. Basic analysis provided.',
        extractedText: extractedText.substring(0, 500) + '...', // First 500 chars
        analysis: analysisResult,
        imageUrl: imageUrl,
      });
    }

    // Step 4: Return comprehensive results
    res.status(200).json({
      message: 'Medical report analyzed successfully',
      extractedText: extractedText.substring(0, 500) + '...', // First 500 chars for preview
      fullTextLength: extractedText.length,
      analysis: analysisResult,
      imageUrl: imageUrl,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analyze Medical Report Error:', error);
    res.status(500).json({
      message: 'Failed to analyze medical report',
      error: error.message,
    });
  }
}

/**
 * @desc Get analysis history (if you want to store analyses)
 * @route GET /api/ai/history
 * @access Private
 */
export async function getAnalysisHistory(req, res) {
  try {
    // This is a placeholder - you can implement a model to store analysis history
    // For now, return empty array
    res.status(200).json({
      message: 'Analysis history retrieved',
      history: [],
    });
  } catch (error) {
    console.error('Get Analysis History Error:', error);
    res.status(500).json({
      message: 'Failed to retrieve analysis history',
      error: error.message,
    });
  }
}

