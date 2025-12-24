import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import { connectDB } from './config.js';
import morgan from 'morgan';
import cors from 'cors';
const app = express();

// middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(helmet());

// Database Connect
connectDB();

// import all pages path
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import appointmentRoutes from './routes/appointment.js';
import recordRoutes from './routes/recordRoutes.js';
import uploadRoutes from './routes/upload.js';
import paymentRoutes from './routes/payment.js';
import medicalHistoryRoutes from './routes/historyUpload.js';
import doctorRoutes from './routes/doctor.js';
import aiRoutes from './routes/ai.js';
import ratingRoutes from './routes/ratingRoutes.js';
/// routes \\\
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/patient/history', medicalHistoryRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ratings', ratingRoutes);
const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
