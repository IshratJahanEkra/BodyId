import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const MedicalHistorySchema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description: String,
  fileUrl: String,
  uploadedAt: { type: Date, default: Date.now },
});

const MedicalHistory =
  models.MedicalHistory || model('MedicalHistory', MedicalHistorySchema);

export default MedicalHistory;
