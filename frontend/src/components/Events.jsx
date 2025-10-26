import React, { useState, useEffect } from 'react';
import './Events.css';

const Events = ({ currentUser }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    max_attendees: '',
    registration_deadline: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Get the auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        setError('Failed to fetch events');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Add the current user as the organizer
    const eventData = {
      ...formData
      // organizer_id will be set by the backend from the authenticated user
    };
    
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        // Reset form and refresh events
        setFormData({
          title: '',
          description: '',
          event_date: '',
          location: '',
          max_attendees: '',
          registration_deadline: ''
        });
        setShowCreateForm(false);
        fetchEvents();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create event');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="events-container">
      <div className="events-header">
        <h2>Alumni Events</h2>
        <button 
          className="create-event-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create Event'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleSubmit} className="event-form">
          <h3>Create New Event</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Event Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="event_date">Event Date *</label>
              <input
                type="datetime-local"
                id="event_date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="max_attendees">Max Attendees *</label>
              <input
                type="number"
                id="max_attendees"
                name="max_attendees"
                value={formData.max_attendees}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="registration_deadline">Registration Deadline *</label>
            <input
              type="datetime-local"
              id="registration_deadline"
              name="registration_deadline"
              value={formData.registration_deadline}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Create Event
          </button>
        </form>
      )}

      {events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <div className="events-list">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-header">
                <h3>{event.title}</h3>
                <div className="event-date">
                  {formatDate(event.event_date)}
                </div>
              </div>
              <div className="event-details">
                {event.description && (
                  <p className="event-description">{event.description}</p>
                )}
                {event.location && (
                  <p className="event-location">
                    <strong>Location:</strong> {event.location}
                  </p>
                )}
                <div className="event-info">
                  {event.organizer_name && (
                    <p><strong>Organizer:</strong> {event.organizer_name}</p>
                  )}
                  {event.max_attendees && (
                    <p><strong>Capacity:</strong> {event.max_attendees} attendees</p>
                  )}
                </div>
                {event.registration_deadline && (
                  <p className="registration-deadline">
                    <strong>Registration Deadline:</strong> {formatDate(event.registration_deadline)}
                  </p>
                )}
              </div>
              <div className="event-actions">
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;