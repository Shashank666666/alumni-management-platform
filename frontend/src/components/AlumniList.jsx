import React, { useState, useEffect } from 'react';
import './AlumniList.css';

const AlumniList = ({ onRefresh }) => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/alumni');
      if (response.ok) {
        const data = await response.json();
        setAlumni(data);
        // Call onRefresh callback if provided
        if (onRefresh) {
          onRefresh(data);
        }
      } else {
        setError('Failed to fetch alumni data');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="alumni-list-container">
        <div className="list-header">
          <h2>Alumni Directory</h2>
          <p>Connecting you with fellow alumni from across the globe</p>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading alumni profiles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alumni-list-container">
        <div className="list-header">
          <h2>Alumni Directory</h2>
          <p>Connecting you with fellow alumni from across the globe</p>
        </div>
        <div className="error-state">
          <div className="error-icon">⚠</div>
          <h3>Unable to Load Alumni</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchAlumni}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="alumni-list-container">
      <div className="list-header">
        <h2>Alumni Directory</h2>
        <p>Connecting you with fellow alumni from across the globe</p>
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-number">{alumni.length}</span>
            <span className="stat-label">Alumni</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {[...new Set(alumni.map(a => a.graduation_year))].length}
            </span>
            <span className="stat-label">Graduation Years</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {[...new Set(alumni.map(a => a.current_company).filter(Boolean))].length}
            </span>
            <span className="stat-label">Companies</span>
          </div>
        </div>
      </div>
      
      {alumni.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No Alumni Found</h3>
          <p>Be the first to join our alumni network!</p>
          <button className="primary-btn">Register Now</button>
        </div>
      ) : (
        <div className="alumni-grid">
          {alumni.map((alumnus) => (
            <div key={alumnus.id} className="alumni-card">
              <div className="alumni-header">
                <div className="alumni-avatar">
                  {alumnus.first_name.charAt(0)}{alumnus.last_name.charAt(0)}
                </div>
                <div className="alumni-info">
                  <div className="alumni-name">
                    {alumnus.first_name} {alumnus.last_name}
                  </div>
                  <div className="alumni-year">
                    Class of {alumnus.graduation_year}
                  </div>
                </div>
              </div>
              <div className="alumni-details">
                {alumnus.current_job_title && (
                  <div className="detail-item">
                    <strong>Position:</strong> {alumnus.current_job_title}
                  </div>
                )}
                {alumnus.current_company && (
                  <div className="detail-item">
                    <strong>Company:</strong> {alumnus.current_company}
                  </div>
                )}
                {alumnus.degree && (
                  <div className="detail-item">
                    <strong>Degree:</strong> {alumnus.degree}
                  </div>
                )}
                {alumnus.email && (
                  <div className="detail-item">
                    <strong>Email:</strong> {alumnus.email}
                  </div>
                )}
                {alumnus.city && (
                  <div className="detail-item">
                    <strong>Location:</strong> {alumnus.city}
                    {alumnus.state ? `, ${alumnus.state}` : ''}
                  </div>
                )}
              </div>
              <div className="alumni-actions">
                {alumnus.linkedin_profile && (
                  <a 
                    href={alumnus.linkedin_profile} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="linkedin-btn"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlumniList;