const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./backend/config/db');
const alumniRoutes = require('./backend/routes/alumniRoutes');
const eventRoutes = require('./backend/routes/eventRoutes');
const fundraisingRoutes = require('./backend/routes/fundraisingRoutes');
const messageRoutes = require('./backend/routes/messageRoutes');
const authRoutes = require('./backend/routes/authRoutes');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = 6001; // Use port 6001 instead of 5001

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Alumni Management Platform API' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/fundraising', fundraisingRoutes);
app.use('/api/messages', messageRoutes);

// Test database connection
app.get('/test-db', (req, res) => {
  db.query('SELECT 1 + 1 AS solution', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Database connection successful', results });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});