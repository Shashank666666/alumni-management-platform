const Event = require('../models/Event');
const db = require('../config/db');

const eventModel = new Event(db);

// Create a new event
exports.createEvent = (req, res) => {
  const eventData = req.body;
  
  // Basic validation - require all fields
  if (!eventData.title || !eventData.event_date || !eventData.description || 
      !eventData.location || !eventData.max_attendees || !eventData.registration_deadline) {
    return res.status(400).json({
      error: 'All fields are required: title, description, event date, location, max attendees, and registration deadline'
    });
  }
  
  // Set the organizer to the authenticated user
  eventData.organizer_id = req.user.id;
  
  eventModel.create(eventData, (err, result) => {
    if (err) {
      return res.status(500).json({
        error: 'Error creating event'
      });
    }
    
    res.status(201).json({
      message: 'Event created successfully',
      eventId: result.insertId
    });
  });
};

// Get all events
exports.getAllEvents = (req, res) => {
  eventModel.getAll((err, results) => {
    if (err) {
      return res.status(500).json({
        error: 'Error retrieving events'
      });
    }
    
    res.json(results);
  });
};

// Get event by ID
exports.getEventById = (req, res) => {
  const { id } = req.params;
  
  eventModel.getById(id, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: 'Error retrieving event'
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({
        error: 'Event not found'
      });
    }
    
    res.json(results[0]);
  });
};

// Update event
exports.updateEvent = (req, res) => {
  const { id } = req.params;
  const eventData = req.body;
  
  eventModel.update(id, eventData, (err, result) => {
    if (err) {
      return res.status(500).json({
        error: 'Error updating event'
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Event not found'
      });
    }
    
    res.json({
      message: 'Event updated successfully'
    });
  });
};

// Delete event
exports.deleteEvent = (req, res) => {
  const { id } = req.params;
  
  eventModel.delete(id, (err, result) => {
    if (err) {
      return res.status(500).json({
        error: 'Error deleting event'
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Event not found'
      });
    }
    
    res.json({
      message: 'Event deleted successfully'
    });
  });
};

// Register for an event
exports.registerForEvent = (req, res) => {
  const registrationData = req.body;
  
  // Basic validation
  if (!registrationData.event_id || !registrationData.alumni_id) {
    return res.status(400).json({
      error: 'Event ID and Alumni ID are required'
    });
  }
  
  eventModel.registerForEvent(registrationData, (err, result) => {
    if (err) {
      return res.status(500).json({
        error: 'Error registering for event'
      });
    }
    
    res.status(201).json({
      message: 'Registered for event successfully'
    });
  });
};

// Get event attendees
exports.getEventAttendees = (req, res) => {
  const { id } = req.params;
  
  eventModel.getEventAttendees(id, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: 'Error retrieving event attendees'
      });
    }
    
    res.json(results);
  });
};

// Get count of upcoming events
exports.getUpcomingEventsCount = (req, res) => {
  eventModel.getUpcomingEventsCount((err, results) => {
    if (err) {
      return res.status(500).json({
        error: 'Error retrieving upcoming events count'
      });
    }
    
    res.json({ count: results[0].count });
  });
};
