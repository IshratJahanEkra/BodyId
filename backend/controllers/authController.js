import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import generateBodyId from '../utils/bodyId.js';
const { compare, genSalt, hash } = bcrypt;

// Helper: generate JWT token
function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
}

// Register new user
export async function register(req, res) {
  try {
    const { role, name, nid, bmdcId, email, phone, password } = req.body;

    // Validate required fields based on role
    if (!role || !name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (role === 'patient' && !nid) {
      return res.status(400).json({ message: 'Patients must provide NID' });
    }

    if (role === 'doctor' && !bmdcId) {
      return res.status(400).json({ message: 'Doctors must provide BMDC ID' });
    }

    // Check if NID already exists (for patients)
    if (nid) {
      const existingNid = await User.findOne({ nid });
      if (existingNid) return res.status(400).json({ message: 'NID already exists' });
    }

    // Check if BMDC ID already exists (for doctors)
    if (bmdcId) {
      const existingBmdc = await User.findOne({ bmdcId });
      if (existingBmdc) return res.status(400).json({ message: 'BMDC ID already exists' });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res.status(400).json({ message: 'Email already exists' });

    // Hash password
    const salt = await genSalt(10);
    const passwordHash = await hash(password, salt);

    // Prepare user data
    // Prepare user data
    const userData = { role, name, nid, bmdcId, email, phone, passwordHash };

    // If patient, generate BODY-ID
    if (role === 'patient') {
      let tries = 0;
      let bodyId;
      do {
        bodyId = generateBodyId();
        const exists = await User.findOne({ bodyId });
        if (!exists) break;
        tries++;
      } while (tries < 5);
      userData.bodyId = bodyId;
    }

    // Save user
    const user = new User(userData);
    await user.save();

    // Generate JWT
    const token = signToken(user);

    // Return response
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        nid: user.nid,
        email: user.email,
        role: user.role,
        bodyId: user.bodyId,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Login existing user
export async function login(req, res) {
  try {
    const { nid, bmdcId, password } = req.body;
    // Client can send either nid OR bmdcId depending on what the user typed.
    // Or we can expect a generic 'identifier' field?
    // Let's stick to specific fields for clarity or handle both.

    const identifier = nid || bmdcId;

    if (!identifier || !password)
      return res.status(400).json({ message: 'Missing ID or password' });

    const normalizedId = identifier.trim();

    // Try finding by NID first, then BMDC
    let user = await User.findOne({ nid: normalizedId });
    if (!user) {
      user = await User.findOne({ bmdcId: normalizedId });
    }

    if (!user) {
      console.log('Login attempt failed: User not found for ID:', normalizedId);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if the user is trying to login with correct ID type for their role?
    // Actually, if we found the user, that's enough. A doctor won't have an NID in our system used for login if they registered with BMDC.
    // Wait, did we remove NID for doctors? Yes, it's sparse.
    // So patient uses NID, doctor uses BMDC. Uniqueness guarantees no overlap hopefully?
    // NID and BMDC formats might differ, but strings are strings.

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Login attempt failed: Password mismatch for ID:', normalizedId);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = signToken(user);

    console.log('Login successful for:', normalizedId, 'Role:', user.role);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        nid: user.nid,
        email: user.email,
        role: user.role,
        bodyId: user.bodyId,
        bmdcId: user.bmdcId,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}
