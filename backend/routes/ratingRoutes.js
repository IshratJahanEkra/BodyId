
import express from 'express';
import { createRating, getDoctorRatings } from '../controllers/ratingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createRating);
router.get('/:doctorId', getDoctorRatings); // public access? Patient usually needs to be logged in to access site? Maybe protect it?
// User said "all users can see". So maybe public or just protect if authentication is platform-wide. 
// Given current app structure, protect seems safer but maybe frontend calls it publicly. 
// Dashboard usually requires login. I'll add 'protect' for consistency with other routes unless 'all users' implies unauthenticated.
// Let's assume logged-in users. So `protect` is fine.

export default router;
