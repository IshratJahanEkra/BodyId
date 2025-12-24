import express from 'express';
import {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all appointments
router.get('/', protect, getAllAppointments);

// Create new appointment
router.post('/', protect, createAppointment);

// Get appointment by ID
router.get('/:id', protect, getAppointmentById);

// Update appointment status
router.put('/:id', protect, updateAppointmentStatus);

export default router;
