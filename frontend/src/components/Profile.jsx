import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile = ({ currentUser, onUpdateProfile }) => {
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
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
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize profile data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      // Fetch the full profile data from the API
      fetchProfileData(currentUser.id);
    }
  }, [currentUser]);

  const fetchProfileData = async (userId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/alumni/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setProfileData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          graduation_year: data.graduation_year || '',
          degree: data.degree || '',
          major: data.major || '',
          current_job_title: data.current_job_title || '',
          current_company: data.current_company || '',
          linkedin_profile: data.linkedin_profile || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || '',
          postal_code: data.postal_code || '',
          bio: data.bio || ''
        });
      } else {
        setError('Failed to load profile data');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      const response = await fetch(`/api/alumni/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      if (response.ok) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        // Call the onUpdateProfile function to update the user data in the parent component
        if (onUpdateProfile) {
          onUpdateProfile(profileData);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original data
    fetchProfileData(currentUser.id);
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (isLoading && !profileData.first_name) {
    return (
      <div className="profile-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>My Profile</h2>
        {!isEditing && (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>
      
      {error && (
        <div className="error-message">
          <div className="error-icon">⚠</div>
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <div className="success-icon">✓</div>
          <p>{success}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="profile-section">
          <h3>Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name *</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={profileData.first_name}
                onChange={handleChange}
                required
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label htmlFor="last_name">Last Name *</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={profileData.last_name}
                onChange={handleChange}
                required
                disabled={!isEditing}
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
                value={profileData.email}
                onChange={handleChange}
                required
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="graduation_year">Graduation Year *</label>
              <input
                type="number"
                id="graduation_year"
                name="graduation_year"
                value={profileData.graduation_year}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear()}
                required
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label htmlFor="degree">Degree</label>
              <input
                type="text"
                id="degree"
                name="degree"
                value={profileData.degree}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>Professional Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="major">Major</label>
              <input
                type="text"
                id="major"
                name="major"
                value={profileData.major}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label htmlFor="current_job_title">Current Job Title</label>
              <input
                type="text"
                id="current_job_title"
                name="current_job_title"
                value={profileData.current_job_title}
                onChange={handleChange}
                disabled={!isEditing}
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
                value={profileData.current_company}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label htmlFor="linkedin_profile">LinkedIn Profile</label>
              <input
                type="url"
                id="linkedin_profile"
                name="linkedin_profile"
                value={profileData.linkedin_profile}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>Contact Information</h3>
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={profileData.address}
              onChange={handleChange}
              rows="2"
              disabled={!isEditing}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={profileData.city}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                name="state"
                value={profileData.state}
                onChange={handleChange}
                disabled={!isEditing}
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
                value={profileData.country}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label htmlFor="postal_code">Postal Code</label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                value={profileData.postal_code}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>About You</h3>
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={profileData.bio}
              onChange={handleChange}
              rows="4"
              disabled={!isEditing}
            />
          </div>
        </div>

        {isEditing && (
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Profile;