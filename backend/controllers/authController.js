const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Alumni = require('../models/Alumni');
const db = require('../config/db');

const alumniModel = new Alumni(db);

// Secret key for JWT (in production, use environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'alumni_connect_secret_key';

// Login controller
exports.login = (req, res) => {
  const { email, password } = req.body;
  
  // Basic validation
  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required'
    });
  }
  
  // Find alumni by email
  alumniModel.getByEmail(email, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: 'Error retrieving user data'
      });
    }
    
    // Check if user exists
    if (results.length === 0) {
      return res.status(401).json({
        error: 'No account found with this email address'
      });
    }
    
    const alumni = results[0];
    
    // Check if password_hash exists
    if (!alumni.password_hash) {
      return res.status(401).json({
        error: 'No account found with this email address'
      });
    }
    
    // Compare hashed passwords
    const isPasswordValid = bcrypt.compareSync(password, alumni.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Incorrect password'
      });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { 
        id: alumni.id, 
        email: alumni.email,
        first_name: alumni.first_name,
        last_name: alumni.last_name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return success response with token
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: alumni.id,
        first_name: alumni.first_name,
        last_name: alumni.last_name,
        email: alumni.email
      }
    });
  });
};

// Register controller
exports.register = (req, res) => {
  const alumniData = req.body;
  
  // Basic validation
  if (!alumniData.first_name || !alumniData.last_name || !alumniData.email || !alumniData.password) {
    return res.status(400).json({
      error: 'First name, last name, email, and password are required'
    });
  }
  
  // Validate password strength
  if (alumniData.password.length < 6) {
    return res.status(400).json({
      error: 'Password must be at least 6 characters long'
    });
  }
  
  // Hash password before saving
  alumniData.password_hash = bcrypt.hashSync(alumniData.password, 10);
  
  // Remove plain text password from alumniData
  delete alumniData.password;
  
  alumniModel.create(alumniData, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          error: 'An alumni with this email already exists'
        });
      }
      return res.status(500).json({
        error: 'Error creating alumni record'
      });
    }
    
    // Create JWT token for newly registered user
    const token = jwt.sign(
      { 
        id: result.insertId, 
        email: alumniData.email,
        first_name: alumniData.first_name,
        last_name: alumniData.last_name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: result.insertId,
        first_name: alumniData.first_name,
        last_name: alumniData.last_name,
        email: alumniData.email
      }
    });
  });
};

// Logout controller
exports.logout = (req, res) => {
  // With JWT, logout is typically handled on the client side
  // by removing the token from storage
  res.json({
    message: 'Logout successful'
  });
};