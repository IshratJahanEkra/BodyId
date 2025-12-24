import MedicalHistory from '../models/MedicalHistory.js';
import { uploadToCloudinary } from '../utils/upload.js';

export const uploadMedicalHistory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File missing' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'medical_history');

    const history = await MedicalHistory.create({
      patient: req.user.id,
      description: req.body.description,
      fileUrl: result.secure_url,
    });

    res.json({ success: true, history });
  } catch (err) {
    console.error('Upload Medical History Error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

/**
 * @desc Get all medical history for logged-in patient
 * @route GET /api/patient/history
 * @access Private
 */
export const getMedicalHistory = async (req, res) => {
  try {
    const patientId = req.user.id;
    const histories = await MedicalHistory.find({ patient: patientId })
      .sort({ uploadedAt: -1 });

    res.status(200).json({
      message: 'Medical history fetched successfully',
      count: histories.length,
      histories,
    });
  } catch (err) {
    console.error('Get Medical History Error:', err);
    res.status(500).json({
      message: 'Failed to fetch medical history',
      error: err.message,
    });
  }
};

/**
 * @desc Get single medical history by ID
 * @route GET /api/patient/history/:id
 * @access Private
 */
export const getMedicalHistoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user.id;

    const history = await MedicalHistory.findOne({
      _id: id,
      patient: patientId,
    });

    if (!history) {
      return res.status(404).json({
        message: 'Medical history not found or not accessible',
      });
    }

    res.status(200).json({
      message: 'Medical history fetched successfully',
      history,
    });
  } catch (err) {
    console.error('Get Medical History Error:', err);
    res.status(500).json({
      message: 'Failed to fetch medical history',
      error: err.message,
    });
  }
};
