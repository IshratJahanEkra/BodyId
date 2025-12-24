// backend/routes/ai.js
/**
 * AI Doctor Routes
 * Handles medical report analysis endpoints
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../utils/upload.js';
import {
  analyzeMedicalReport,
  getAnalysisHistory,
  checkPrescriptionSafety,
} from '../controllers/aiController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @route POST /api/ai/analyze-report
 * @desc Analyze medical report image using OCR and AI
 * @access Private
 * @body multipart/form-data with 'reportImage' field
 */
router.post(
  '/analyze-report',
  upload.single('reportImage'),
  analyzeMedicalReport
);

/**
 * @route POST /api/ai/check-prescription-safety
 * @desc Check prescription safety against medical history
 * @access Private
 * @body multipart/form-data with 'prescription' field
 */
router.post(
  '/check-prescription-safety',
  upload.single('prescription'),
  checkPrescriptionSafety
);

/**
 * @route GET /api/ai/history
 * @desc Get user's analysis history
 * @access Private
 */
router.get('/history', getAnalysisHistory);

export default router;

