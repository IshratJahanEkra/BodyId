import Appointment from '../models/Appointment.js';
import Record from '../models/Record.js';
import User from '../models/User.js';
import Rating from '../models/Rating.js';

// Get all appointments assigned to this doctor
export async function getDoctorAppointments(req, res) {
  try {
    const doctorId = req.user._id; // req.user populated by protect middleware
    const appointments = await Appointment.find({ doctorId })
      .populate('patientId', 'name email bodyId')
      .populate('attachedRecordIds')
      .populate('attachedMedicalHistoryIds');
    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Confirm appointment
export async function confirmAppointment(req, res) {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: 'Appointment not found' });

    appointment.status = 'confirmed';
    await appointment.save();
    res.json({ message: 'Appointment confirmed', appointment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Reject appointment
export async function rejectAppointment(req, res) {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: 'Appointment not found' });

    appointment.status = 'rejected';
    await appointment.save();
    res.json({ message: 'Appointment rejected', appointment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Add doctor notes / prescription URL to appointment
export async function addVisitNotes(req, res) {
  try {
    const { doctorNotes, prescriptionUrl } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: 'Appointment not found' });

    appointment.doctorNotes = doctorNotes || appointment.doctorNotes;
    appointment.prescriptionUrl =
      prescriptionUrl || appointment.prescriptionUrl;
    appointment.status = 'completed';
    await appointment.save();
    res.json({ message: 'Visit notes added', appointment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Get patient records via BODY-ID (appointment context)
export async function getPatientRecords(req, res) {
  try {
    const { bodyId } = req.params;

    // Ensure doctor has an appointment with this patient
    const patient = await User.findOne({ bodyId, role: 'patient' });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const appointments = await Appointment.find({
      doctorId: req.user._id,
      patientId: patient._id,
    });

    if (!appointments.length)
      return res
        .status(403)
        .json({ message: 'No permission to access patient records' });

    const records = await Record.find({ patientId: patient._id });
    res.json({ patient: patient.name, records });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Get anonymous ratings for this doctor
export async function getDoctorRatings(req, res) {
  try {
    const doctorId = req.params.doctorId;
    const ratings = await Rating.find({ doctorId }).select('-patientId -__v'); // hide patientId
    res.json({ ratings });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}
