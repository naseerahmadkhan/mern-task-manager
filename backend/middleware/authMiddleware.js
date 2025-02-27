const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate users using JWT
 */
const authMiddleware = async (req, res, next) => {
  // Extract the token from the Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // If no token is provided, deny access
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user associated with the token, excluding the password field
    req.user = await User.findById(decoded.id).select('-password');

    // If user is not found, deny access
    if (!req.user) return res.status(401).json({ message: 'User not found' });

    // Proceed to the next middleware/controller
    next();
  } catch (err) {
    // Log and return an error if token verification fails
    logger.error('Token verification failed:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
