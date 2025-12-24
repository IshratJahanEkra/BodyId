// backend/models/Rating.js
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const ratingSchema = new Schema({
  doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
  stars: { type: Number, min: 0, max: 5, required: true },
  comment: { type: String },
  anonymous: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Rating = models.Rating || model('Rating', ratingSchema);
export default Rating;
