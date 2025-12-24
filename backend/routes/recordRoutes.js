import express from 'express';
import multer from 'multer';
import {
  getRecords,
  uploadRecord,
  getRecord,
  deleteRecord,
  shareRecord,
  unshareRecord,
  getSharedRecords,
} from '../controllers/recordController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// multer setup for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/records/upload
router.post('/upload', protect, upload.single('file'), uploadRecord);
router.get('/', protect, getRecords);
router.get('/shared', protect, getSharedRecords);
router.post('/:recordId/share', protect, shareRecord);
router.delete('/:recordId/share/:doctorBmdcId', protect, unshareRecord);
router.get('/:recordId', protect, getRecord);
router.delete('/:recordId', protect, deleteRecord);
export default router;
