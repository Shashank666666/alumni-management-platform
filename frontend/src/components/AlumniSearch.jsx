import React, { useState, useEffect } from 'react';
import './AlumniSearch.css';

const AlumniSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/alumni/search?q=${encodeURIComponent(searchTerm)}`);
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to search alumni');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setError('');
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <h2>Find Alumni</h2>
        <p>Search our alumni network by name, company, degree, or location</p>
      </div>
      
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-container">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, company, degree, location..."
            className="search-input"
          />
          {searchTerm && (
            <button 
              type="button" 
              onClick={clearSearch}
              className="clear-button"
            >
              ✕
            </button>
          )}
        </div>
        <button type="submit" disabled={loading} className="search-button">
          {loading ? (
            <>
              <span className="spinner"></span>
              Searching...
            </>
          ) : 'Search'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          <div className="error-icon">⚠</div>
          <h3>Search Error</h3>
          <p>{error}</p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="search-results">
          <div className="results-header">
            <h3>Search Results ({searchResults.length})</h3>
            <p>Found {searchResults.length} alumni matching "{searchTerm}"</p>
          </div>
          <div className="results-grid">
            {searchResults.map((alumnus) => (
              <div key={alumnus.id} className="result-card">
                <div className="result-header">
                  <div className="result-avatar">
                    {alumnus.first_name.charAt(0)}{alumnus.last_name.charAt(0)}
                  </div>
                  <div className="result-info">
                    <div className="result-name">
                      {alumnus.first_name} {alumnus.last_name}
                    </div>
                    <div className="result-year">
                      Class of {alumnus.graduation_year}
                    </div>
                  </div>
                </div>
                <div className="result-details">
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
                  {alumnus.city && (
                    <div className="detail-item">
                      <strong>Location:</strong> {alumnus.city}
                      {alumnus.state ? `, ${alumnus.state}` : ''}
                    </div>
                  )}
                </div>
                <div className="result-actions">
                  <button className="contact-btn">
                    Contact
                  </button>
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
        </div>
      )}

      {searchTerm && searchResults.length === 0 && !loading && !error && (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No Results Found</h3>
          <p>No alumni found matching "{searchTerm}"</p>
          <button className="retry-btn" onClick={clearSearch}>
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
};

export default AlumniSearch;