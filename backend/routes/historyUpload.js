import express from 'express';
const router = express.Router();

import { upload } from '../utils/upload.js';
import {
  uploadMedicalHistory,
  getMedicalHistory,
  getMedicalHistoryById,
} from '../controllers/historyUploaderControllers.js';
import { protect } from '../middleware/authMiddleware.js';

// All routes require authentication
router.use(protect);

// Get all medical history for logged-in patient
router.get('/', getMedicalHistory);

// Get single medical history by ID
router.get('/:id', getMedicalHistoryById);

// Upload medical history
router.post('/upload', upload.single('historyFile'), uploadMedicalHistory);

export default router;
