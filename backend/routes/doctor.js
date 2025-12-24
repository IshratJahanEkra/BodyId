import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getDoctorAppointments,
  confirmAppointment,
  rejectAppointment,
  addVisitNotes,
  getPatientRecords,
  getDoctorRatings,
} from '../controllers/doctorController.js';

const router = express.Router();

// All routes protected, only logged-in doctor
router.use(protect);

// Appointments
router.get('/appointments', getDoctorAppointments);
router.post('/appointments/:id/confirm', confirmAppointment);
router.post('/appointments/:id/reject', rejectAppointment);
router.post('/appointments/:id/notes', addVisitNotes);

// Patient Records
router.get('/patients/:bodyId/records', getPatientRecords);

// Ratings
router.get('/ratings/:doctorId', getDoctorRatings);

export default router;
