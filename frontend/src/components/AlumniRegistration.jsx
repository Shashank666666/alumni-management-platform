import React, { useState } from 'react';
import './AlumniRegistration.css';

const AlumniRegistration = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    graduation_year: '',
    degree: '',
    major: '',
    current_job_title: '',
    current_company: '',
    linkedin_profile: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    bio: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.first_name || !formData.last_name || !formData.email) {
      setSubmitError('First name, last name, and email are required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setSubmitError('');
      
      // Register the user through the auth endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, create a generic error response
        data = { error: `Server returned ${response.status}: ${response.statusText}` };
      }

      if (response.ok) {
        setSubmitSuccess(true);
        
        // Instead of automatically logging in, redirect to login page after a short delay
        // Call the onRegistrationSuccess function passed from App.jsx
        if (typeof onRegistrationSuccess === 'function') {
          setTimeout(() => {
            onRegistrationSuccess();
          }, 2000); // Redirect after 2 seconds
        }
        
        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          phone: '',
          graduation_year: '',
          degree: '',
          major: '',
          current_job_title: '',
          current_company: '',
          linkedin_profile: '',
          address: '',
          city: '',
          state: '',
          country: '',
          postal_code: '',
          bio: ''
        });
      } else {
        setSubmitError(data.error || 'Failed to register alumni');
      }
    } catch (error) {
      console.error('Registration error:', error); // Log the actual error for debugging
      setSubmitError(`Network error: ${error.message}. Please check your connection and try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-header">
        <h2>Join Our Alumni Network</h2>
        <p>Connect with fellow alumni and stay updated with events and opportunities</p>
      </div>
      
      {submitSuccess && (
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h3>Registration Successful!</h3>
          <p>Thank you for joining our alumni network. You'll receive a confirmation email shortly.</p>
          <p>You will be redirected to the login page to sign in with your new account.</p>
        </div>
      )}
      
      {submitError && (
        <div className="error-message">
          <div className="error-icon">⚠</div>
          <h3>Registration Failed</h3>
          <p>{submitError}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name *</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                placeholder="Enter your first name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="last_name">Last Name *</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a password"
                minLength="6"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(123) 456-7890"
              />
            </div>
            <div className="form-group">
              <label htmlFor="graduation_year">Graduation Year *</label>
              <input
                type="number"
                id="graduation_year"
                name="graduation_year"
                value={formData.graduation_year}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear()}
                required
                placeholder="YYYY"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Professional Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="major">Major</label>
              <input
                type="text"
                id="major"
                name="major"
                value={formData.major}
                onChange={handleChange}
                placeholder="Your field of study"
              />
            </div>
            <div className="form-group">
              <label htmlFor="current_job_title">Current Job Title</label>
              <input
                type="text"
                id="current_job_title"
                name="current_job_title"
                value={formData.current_job_title}
                onChange={handleChange}
                placeholder="Your current position"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="current_company">Current Company</label>
              <input
                type="text"
                id="current_company"
                name="current_company"
                value={formData.current_company}
                onChange={handleChange}
                placeholder="Your current employer"
              />
            </div>
            <div className="form-group">
              <label htmlFor="linkedin_profile">LinkedIn Profile</label>
              <input
                type="url"
                id="linkedin_profile"
                name="linkedin_profile"
                value={formData.linkedin_profile}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Contact Information</h3>
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              placeholder="Street address"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Country"
              />
            </div>
            <div className="form-group">
              <label htmlFor="postal_code">Postal Code</label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                placeholder="ZIP/Postal code"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>About You</h3>
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              placeholder="Tell us about your interests, achievements, and what you're looking for in the alumni network..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isSubmitting} className="submit-btn">
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Registering...
              </>
            ) : 'Complete Registration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AlumniRegistration;