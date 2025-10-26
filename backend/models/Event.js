class Event {
  constructor(db) {
    this.db = db;
  }

  // Create a new event
  create(eventData, callback) {
    const query = `
      INSERT INTO events (
        title, description, event_date, location, organizer_id, 
        max_attendees, registration_deadline
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      eventData.title,
      eventData.description || null,
      eventData.event_date,
      eventData.location || null,
      eventData.organizer_id,
      eventData.max_attendees || null,
      eventData.registration_deadline || null
    ];

    this.db.query(query, values, callback);
  }

  // Get all events
  getAll(callback) {
    const query = `
      SELECT e.*, 
             CONCAT(a.first_name, ' ', a.last_name) as organizer_name
      FROM events e
      LEFT JOIN alumni a ON e.organizer_id = a.id
      ORDER BY e.event_date DESC
    `;
    this.db.query(query, callback);
  }

  // Get event by ID
  getById(id, callback) {
    const query = `
      SELECT e.*, 
             CONCAT(a.first_name, ' ', a.last_name) as organizer_name
      FROM events e
      LEFT JOIN alumni a ON e.organizer_id = a.id
      WHERE e.id = ?
    `;
    this.db.query(query, [id], callback);
  }

  // Update event
  update(id, eventData, callback) {
    const query = `
      UPDATE events SET
        title = ?, description = ?, event_date = ?, location = ?,
        organizer_id = ?, max_attendees = ?, registration_deadline = ?
      WHERE id = ?
    `;
    
    const values = [
      eventData.title,
      eventData.description || null,
      eventData.event_date,
      eventData.location || null,
      eventData.organizer_id,
      eventData.max_attendees || null,
      eventData.registration_deadline || null,
      id
    ];

    this.db.query(query, values, callback);
  }

  // Delete event
  delete(id, callback) {
    const query = 'DELETE FROM events WHERE id = ?';
    this.db.query(query, [id], callback);
  }

  // Register for an event
  registerForEvent(registrationData, callback) {
    const query = `
      INSERT INTO event_registrations (event_id, alumni_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE attendance_status = 'registered'
    `;
    
    const values = [
      registrationData.event_id,
      registrationData.alumni_id
    ];

    this.db.query(query, values, callback);
  }

  // Get event attendees
  getEventAttendees(eventId, callback) {
    const query = `
      SELECT er.*, 
             CONCAT(a.first_name, ' ', a.last_name) as attendee_name,
             a.email, a.current_company, a.current_job_title
      FROM event_registrations er
      JOIN alumni a ON er.alumni_id = a.id
      WHERE er.event_id = ? AND er.attendance_status = 'registered'
    `;
    
    this.db.query(query, [eventId], callback);
  }

  // Get count of upcoming events
  getUpcomingEventsCount(callback) {
    const query = `
      SELECT COUNT(*) as count
      FROM events
      WHERE event_date > NOW()
    `;
    
    this.db.query(query, callback);
  }
}

module.exports = Event;