const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate } = require('../middleware/auth');

// Get count of upcoming events - This should be before the ID route to avoid conflicts
router.get('/count/upcoming', eventController.getUpcomingEventsCount);

// Create a new event - requires authentication
router.post('/', authenticate, eventController.createEvent);

// Get all events
router.get('/', eventController.getAllEvents);

// Get event by ID
router.get('/:id', eventController.getEventById);

// Update event - requires authentication
router.put('/:id', authenticate, eventController.updateEvent);

// Delete event - requires authentication
router.delete('/:id', authenticate, eventController.deleteEvent);

// Register for an event - requires authentication
router.post('/:id/register', authenticate, eventController.registerForEvent);

// Get event attendees
router.get('/:id/attendees', eventController.getEventAttendees);

module.exports = router;