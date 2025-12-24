import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

export async function createAppointment(req, res) {
  try {
    const {
      doctorId,
      scheduledAt,
      attachedRecordIds,
      attachedMedicalHistoryIds,
    } = req.body;

    if (!doctorId || !scheduledAt) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Use authenticated user as patient
    const patientId = req.user._id;

    if (!req.user.bodyId) {
      return res.status(400).json({
        message: 'Patient must have a bodyId to create appointment',
      });
    }

    // Find doctor
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (!doctor.consultationFee || doctor.consultationFee <= 0) {
      return res.status(400).json({ message: 'Invalid appointment fee' });
    }

    // Validate scheduled date is in the future
    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate < new Date()) {
      return res.status(400).json({
        message: 'Scheduled date must be in the future',
      });
    }

    // Create appointment
    const appointment = new Appointment({
      patientId,
      doctorId,
      bodyId: req.user.bodyId,
      requestedAt: new Date(),
      scheduledAt: scheduledDate,
      status: 'pending',
      payment: {
        amount: doctor.consultationFee,
        provider: 'stripe',
        paid: false,
        paymentId: null,
      },
      attachedRecordIds: Array.isArray(attachedRecordIds)
        ? attachedRecordIds
        : attachedRecordIds
        ? [attachedRecordIds]
        : [],
      attachedMedicalHistoryIds: Array.isArray(attachedMedicalHistoryIds)
        ? attachedMedicalHistoryIds
        : attachedMedicalHistoryIds
        ? [attachedMedicalHistoryIds]
        : [],
    });

    await appointment.save();

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment,
    });
  } catch (err) {
    console.error('Create Appointment Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

export async function getAllAppointments(req, res) {
  try {
    const { role, _id: userId } = req.user;

    let query = {};

    if (role === 'doctor') {
      // Only fetch appointments for this doctor
      query.doctorId = userId;
    } else if (role === 'patient') {
      // Only fetch appointments for this patient
      query.patientId = userId;
    } else {
      return res.status(403).json({ message: 'Unauthorized role' });
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email')
      .populate('attachedRecordIds')
      .populate('attachedMedicalHistoryIds')
      .sort({ createdAt: -1 });

    if (!appointments || appointments.length === 0) {
      return res
        .status(200)
        .json({ message: 'No appointments found', appointment: [] });
    }

    return res.status(200).json({
      message: 'Appointments fetched successfully',
      appointment: appointments,
    });
  } catch (error) {
    console.error('Get All Appointments Error:', error);
    return res.status(500).json({
      message: 'Server error while fetching appointments',
      error: error.message,
    });
  }
}

export async function updateAppointmentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    // Validate status
    const allowedStatuses = [
      'pending',
      'paid',
      'confirmed',
      'completed',
      'rejected',
      'cancelled',
    ];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status value',
        allowedStatuses,
      });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check authorization - only doctor can update status
    // if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     message: 'Only doctors and admins can update appointment status'
    //   });
    // }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({
      message: 'Appointment status updated successfully',
      appointment,
    });
  } catch (err) {
    console.error('Update Appointment Status Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

export async function getAppointmentById(req, res) {
  try {
    const { id } = req.params;
    const { role, _id: userId } = req.user;

    const appointment = await Appointment.findById(id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email')
      .populate('attachedRecordIds')
      .populate('attachedMedicalHistoryIds');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check authorization - users can only see their own appointments
    if (
      role === 'patient' &&
      appointment.patientId._id.toString() !== userId.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (
      role === 'doctor' &&
      appointment.doctorId._id.toString() !== userId.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({
      message: 'Appointment fetched successfully',
      appointment,
    });
  } catch (err) {
    console.error('Get Appointment Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}
