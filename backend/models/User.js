// backend/models/User.js
import mongoose from 'mongoose';
const { Schema, models, model } = mongoose;
import { genSalt, hash, compare } from 'bcrypt';

const userSchema = new Schema(
  {
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      required: true,
    },
    name: { type: String, required: true, trim: true },
    nid: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple users to have undefined NID
      trim: true,
    },
    bmdcId: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple users to have undefined BMDC ID
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    bodyId: { type: String, unique: true, sparse: true },
    language: { type: String, enum: ['en', 'bn'], default: 'en' },
    specialty: { type: String },
    licenseDocUrl: { type: String },
    verified: { type: Boolean, default: false },
    consultationFee: { type: Number, default: 800 },
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Note: Password is already hashed in the controller before saving
// This pre-save hook is not needed since we hash in authController.js
// Keeping it commented out to avoid double-hashing
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('passwordHash')) return next();
//   const salt = await genSalt(10);
//   this.passwordHash = await hash(this.passwordHash, salt);
//   next();
// });

userSchema.methods.comparePassword = async function (plain) {
  return compare(plain, this.passwordHash);
};

const User = models.User || model('User', userSchema);
export default User;
