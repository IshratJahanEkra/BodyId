
import Rating from '../models/Rating.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

/**
 * @desc Create a new rating for a doctor
 * @route POST /api/ratings
 * @access Private (Patient)
 */
export async function createRating(req, res) {
    try {
        const { doctorId, appointmentId, stars, comment } = req.body;
        const patientId = req.user.id; // from auth middleware

        // Validate inputs
        if (!doctorId || !appointmentId || stars === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (stars < 0 || stars > 5) {
            return res.status(400).json({ message: 'Stars must be between 0 and 5' });
        }

        // Check appointment validity
        const appointment = await Appointment.findOne({
            _id: appointmentId,
            patientId: patientId,
            doctorId: doctorId,
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found or invalid' });
        }

        // Ideally only completed appointments can be rated
        // Allow rating for both completed and confirmed (post-consultation assumption) appointments
        if (appointment.status !== 'completed' && appointment.status !== 'confirmed') {
            return res.status(400).json({ message: 'Appointment must be completed or confirmed to rate' });
        }

        // Check if duplicate
        const existingRating = await Rating.findOne({ appointmentId });
        if (existingRating) {
            return res.status(400).json({ message: 'You have already rated this appointment' });
        }

        // Create Rating
        const rating = new Rating({
            doctorId,
            patientId,
            appointmentId,
            stars,
            comment,
            anonymous: true // force anonymous as per requirement
        });

        await rating.save();

        // Update Doctor's average rating
        const doctor = await User.findById(doctorId);
        if (doctor) {
            const totalRatings = doctor.totalRatings || 0;
            const currentAvg = doctor.averageRating || 0;

            // Calculate new average
            // New Avg = ((Old Avg * Old Count) + New Star) / (Old Count + 1)
            const newTotal = totalRatings + 1;
            const newAvg = ((currentAvg * totalRatings) + stars) / newTotal;

            doctor.totalRatings = newTotal;
            doctor.averageRating = Number(newAvg.toFixed(2)); // Round to 2 decimals
            await doctor.save();
        }

        res.status(201).json({ message: 'Rating submitted successfully', rating });

    } catch (error) {
        console.error('Create Rating Error:', error);
        res.status(500).json({ message: 'Failed to submit rating', error: error.message });
    }
}

/**
 * @desc Get ratings for a doctor
 * @route GET /api/ratings/:doctorId
 * @access Public (or Private)
 */
export async function getDoctorRatings(req, res) {
    try {
        const { doctorId } = req.params;

        const ratings = await Rating.find({ doctorId }).sort({ createdAt: -1 });

        // Anonymize response if needed, although schema has anonymous=true
        // We can map to hide patient specific details distinct from 'anonymous'
        const cleanRatings = ratings.map(r => ({
            _id: r._id,
            stars: r.stars,
            comment: r.comment,
            createdAt: r.createdAt,
            anonymous: true
        }));

        res.status(200).json({ ratings: cleanRatings });

    } catch (error) {
        console.error('Get Ratings Error:', error);
        res.status(500).json({ message: 'Failed to fetch ratings', error: error.message });
    }
}
