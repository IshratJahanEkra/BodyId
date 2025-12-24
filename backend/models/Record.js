// backend/models/Record.js
import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: { type: String },
  description: { type: String },
  fileUrl: { type: String, required: true },
  filePublicId: { type: String }, // cloudinary public id (for deletion)
  fileType: { type: String },
  sharedWith: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

const Record = mongoose.models.Record || mongoose.model('Record', recordSchema);
export default Record;
