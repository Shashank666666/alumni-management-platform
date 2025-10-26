const express = require('express');
const router = express.Router();
const alumniController = require('../controllers/alumniController');

// Get alumni count - This should be before the ID route to avoid conflicts
router.get('/count', alumniController.getAlumniCount);

// Create a new alumni
router.post('/', alumniController.createAlumni);

// Get all alumni
router.get('/', alumniController.getAllAlumni);

// Search alumni
router.get('/search', alumniController.searchAlumni);

// Get alumni by ID
router.get('/:id', alumniController.getAlumniById);

// Update alumni
router.put('/:id', alumniController.updateAlumni);

// Delete alumni
router.delete('/:id', alumniController.deleteAlumni);

module.exports = router;