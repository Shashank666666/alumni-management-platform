const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'alumni_platform_secret_key';

// Authentication middleware
const authenticate = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  // Check if token exists
  if (!token) {
    return res.status(401).json({
      error: 'Access denied. No token provided.'
    });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid token.'
    });
  }
};

module.exports = { authenticate };