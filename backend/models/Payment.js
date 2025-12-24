import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const paymentSchema = new Schema({
  appointmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
  },

  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  provider: {
    type: String,
    enum: ['stripe', 'paypal', 'bkash', 'nagad', 'fake'],
    default: 'fake',
  },

  transactionId: {
    type: String,
    required: true,
  },

  paid: {
    type: Boolean,
    default: false,
  },

  status: {
    type: String,
    enum: ['initiated', 'success', 'failed'],
    default: 'initiated',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Payment = models.Payment || model('Payment', paymentSchema);

export default Payment;
