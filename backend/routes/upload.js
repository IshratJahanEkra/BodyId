// backend/routes/upload.js
import express from 'express';
import { upload, uploadToCloudinary } from '../utils/upload.js';

const router = express.Router();

// Single file upload
router.post('/single', upload.single('file'), async (req, res) => {
  try {
    const result = await uploadToCloudinary(req.file.buffer, 'user-files');
    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
