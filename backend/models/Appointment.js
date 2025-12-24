// backend/models/Appointment.js
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const paymentSchema = new Schema(
  {
    amount: { type: Number, default: 0 },
    provider: { type: String, default: 'manual' },
    paid: { type: Boolean, default: false },
    paymentId: { type: String, default: null },
  },
  { _id: false }
);

const appointmentSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bodyId: { type: String, required: true },
    requestedAt: { type: Date, default: Date.now },
    scheduledAt: { type: Date, required: true },

    status: {
      type: String,
      enum: [
        'pending',
        'paid',
        'confirmed',
        'completed',
        'rejected',
        'cancelled',
      ],
      default: 'pending',
    },

    payment: paymentSchema,

    attachedRecordIds: [
      { type: Schema.Types.ObjectId, ref: 'Record', default: [] },
    ],

    attachedMedicalHistoryIds: [
      { type: Schema.Types.ObjectId, ref: 'MedicalHistory', default: [] },
    ],

    doctorNotes: { type: String, default: '' },
    prescriptionUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

const Appointment =
  models.Appointment || model('Appointment', appointmentSchema);

export default Appointment;
