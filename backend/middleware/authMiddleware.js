import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // find the user (could be doctor or patient, based on role)
      const user = await User.findById(decoded.id).select('-passwordHash');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      req.user = user; // attach user (with role info) to request
      next();
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  } else {
    return res
      .status(401)
      .json({ message: 'Not authorized, no token provided' });
  }
};
