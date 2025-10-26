const Alumni = require('../models/Alumni');
const db = require('../config/db');

const alumniModel = new Alumni(db);

// Create a new alumni
exports.createAlumni = (req, res) => {
  const alumniData = req.body;
  
  // Basic validation
  if (!alumniData.first_name || !alumniData.last_name || !alumniData.email) {
    return res.status(400).json({
      error: 'First name, last name, and email are required'
    });
  }
  
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
    
    res.status(201).json({
      message: 'Alumni created successfully',
      alumniId: result.insertId
    });
  });
};

// Get all alumni
exports.getAllAlumni = (req, res) => {
  alumniModel.getAll((err, results) => {
    if (err) {
      return res.status(500).json({
        error: 'Error retrieving alumni records'
      });
    }
    
    res.json(results);
  });
};

// Get alumni by ID
exports.getAlumniById = (req, res) => {
  const { id } = req.params;
  
  alumniModel.getById(id, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: 'Error retrieving alumni record'
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({
        error: 'Alumni not found'
      });
    }
    
    res.json(results[0]);
  });
};

// Update alumni
exports.updateAlumni = (req, res) => {
  const { id } = req.params;
  const alumniData = req.body;
  
  alumniModel.update(id, alumniData, (err, result) => {
    if (err) {
      return res.status(500).json({
        error: 'Error updating alumni record'
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Alumni not found'
      });
    }
    
    res.json({
      message: 'Alumni updated successfully'
    });
  });
};

// Delete alumni (soft delete)
exports.deleteAlumni = (req, res) => {
  const { id } = req.params;
  
  alumniModel.delete(id, (err, result) => {
    if (err) {
      return res.status(500).json({
        error: 'Error deleting alumni record'
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Alumni not found'
      });
    }
    
    res.json({
      message: 'Alumni deleted successfully'
    });
  });
};

// Search alumni
exports.searchAlumni = (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({
      error: 'Search term is required'
    });
  }
  
  alumniModel.search(q, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: 'Error searching alumni records'
      });
    }
    
    res.json(results);
  });
};

// Get alumni count
exports.getAlumniCount = (req, res) => {
  alumniModel.getCount((err, results) => {
    if (err) {
      return res.status(500).json({
        error: 'Error retrieving alumni count'
      });
    }
    
    res.json({ count: results[0].count });
  });
};
