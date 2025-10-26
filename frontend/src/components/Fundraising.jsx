import React, { useState, useEffect } from 'react';
import './Fundraising.css';

const Fundraising = ({ currentUser }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Add success state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_amount: '',
    start_date: '',
    end_date: ''
  });
  const [donationData, setDonationData] = useState({
    amount: '',
    payment_method: 'credit_card',
    is_anonymous: false
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/fundraising');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      } else {
        // Try to get error details from response
        let errorMessage = 'Failed to fetch campaigns';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || `Failed to fetch campaigns (${response.status})`;
        } catch (e) {
          // If we can't parse JSON, use status text
          errorMessage = `Failed to fetch campaigns (${response.status}: ${response.statusText})`;
        }
        setError(errorMessage);
      }
    } catch (error) {
      setError(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const selectCampaign = (campaign) => {
    setActiveCampaign(campaign);
    fetchDonations(campaign.id);
  };

  const fetchDonations = async (campaignId) => {
    // Validate campaignId
    if (!campaignId) {
      setError('Invalid campaign ID');
      return;
    }
    
    // Validate currentUser if it exists
    if (currentUser && !currentUser.id) {
      setError('Invalid user data');
      return;
    }
    
    try {
      // Use user-specific endpoint if currentUser exists, otherwise use general endpoint
      const endpoint = currentUser && currentUser.id ? 
        `/api/fundraising/${campaignId}/donations/user/${currentUser.id}` :
        `/api/fundraising/${campaignId}/donations`;
        
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setDonations(data);
      } else {
        // Try to get error details from response
        let errorMessage = 'Failed to fetch donations';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || `Failed to fetch donations (${response.status})`;
        } catch (e) {
          // If we can't parse JSON, use status text
          errorMessage = `Failed to fetch donations (${response.status}: ${response.statusText})`;
        }
        setError(errorMessage);
      }
    } catch (error) {
      setError(`Network error: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDonationChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    
    // For the amount field, ensure it doesn't exceed the remaining amount
    if (name === 'amount' && activeCampaign) {
      // Handle empty input
      if (newValue === '') {
        // Allow empty input
      } else {
        const numValue = parseFloat(newValue);
        if (!isNaN(numValue)) {
          const goalAmount = parseFloat(activeCampaign.goal_amount);
          const raisedAmount = parseFloat(activeCampaign.raised_amount);
          
          // Check for valid numbers
          if (!isNaN(goalAmount) && !isNaN(raisedAmount)) {
            const remainingAmount = goalAmount - raisedAmount;
            
            // Ensure it doesn't exceed remaining amount
            // Account for floating point precision issues
            if (numValue > remainingAmount && Math.abs(numValue - remainingAmount) >= 0.01) {
              newValue = remainingAmount.toString();
            }
            // Ensure it's not negative
            else if (numValue < 0) {
              newValue = "0";
            }
          }
        }
        // If it's not a valid number, we'll let the validation handle it
      }
    }
    
    setDonationData({
      ...donationData,
      [name]: newValue
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/fundraising', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          goal_amount: parseFloat(formData.goal_amount),
          created_by: currentUser?.id || 1 // Use current user ID or fallback to 1
        }),
      });

      if (response.ok) {
        // Reset form and refresh campaigns
        setFormData({
          title: '',
          description: '',
          goal_amount: '',
          start_date: '',
          end_date: ''
        });
        setShowCreateForm(false);
        fetchCampaigns();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create campaign');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const handleDonationSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that donation amount is provided
    if (!donationData.amount || donationData.amount.trim() === '') {
      setError('Please enter a donation amount');
      return;
    }
    
    const donationAmount = parseFloat(donationData.amount);
    
    // Validate that donation amount is a valid number
    if (isNaN(donationAmount)) {
      setError('Please enter a valid donation amount');
      return;
    }
    
    // Validate that donation amount is at least 1
    if (donationAmount < 1) {
      setError('Donation amount must be at least $1.00');
      return;
    }
    
    // Check if the campaign goal has already been reached
    if (isCampaignGoalReached(activeCampaign)) {
      setError('This campaign has already reached its goal. No more donations can be accepted.');
      return;
    }
    
    // Check if the donation amount would exceed the campaign goal
    const goalAmount = parseFloat(activeCampaign.goal_amount);
    const raisedAmount = parseFloat(activeCampaign.raised_amount);
    
    // Check for valid numbers
    if (isNaN(goalAmount) || isNaN(raisedAmount)) {
      setError('Invalid campaign data');
      return;
    }
    
    const remainingAmount = goalAmount - raisedAmount;
    
    // Allow donations up to the exact remaining amount
    if (remainingAmount >= 0.01 && remainingAmount < 1.00 && donationAmount >= 1.00) {
      // Allow the donation to proceed as it will complete the campaign
      // The backend will validate that the donation is at least $1.00
    }
    // Check if the donation amount would exceed the campaign goal (normal case)
    else if (donationAmount > remainingAmount) {
      // Special case: Allow donations that exactly match the remaining amount
      // to complete the campaign, regardless of how small the remaining amount is
      if (Math.abs(donationAmount - remainingAmount) < 0.01) { // Account for floating point precision
        // Allow the donation to proceed
      }
      // Special case: If remaining amount is essentially zero, reject the donation
      else if (remainingAmount < 0.01) {
        // If remaining is essentially zero, reject the donation
        setError('This campaign has already reached its goal. No more donations can be accepted.');
        return;
      } else {
        setError(`Donation amount ($${donationAmount.toFixed(2)}) exceeds the remaining campaign goal ($${remainingAmount.toFixed(2)}). Maximum donation allowed: ${formatCurrency(remainingAmount)}`);
        return;
      }
    }

    try {
      const response = await fetch('/api/fundraising/donate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaign_id: activeCampaign.id,
          alumni_id: currentUser?.id || 1, // Use current user ID or fallback to 1
          amount: donationAmount,
          payment_method: donationData.payment_method,
          is_anonymous: donationData.is_anonymous
        }),
      });

      if (response.ok) {
        // Reset donation form and refresh campaign data
        setDonationData({
          amount: '',
          payment_method: 'credit_card',
          is_anonymous: false
        });
        setError(''); // Clear any previous errors
        setSuccess('Donation successful! Thank you for your contribution.'); // Set success message
        
        fetchCampaigns(); // Refresh to update raised amount
        fetchDonations(activeCampaign.id); // Refresh donations list
        
        // Redirect to campaign list after a brief delay to show success message
        setTimeout(() => {
          setSuccess(''); // Clear success message
          setActiveCampaign(null); // This will go back to the campaign list
        }, 1000); // Redirect after 1 second
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to process donation');
        setSuccess(''); // Clear success message if there's an error
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateProgress = (raised, goal) => {
    // Convert to numbers to ensure proper calculation
    const raisedNum = parseFloat(raised);
    const goalNum = parseFloat(goal);
    
    // Check for valid numbers
    if (isNaN(raisedNum) || isNaN(goalNum) || goalNum <= 0) {
      return 0;
    }
    
    return Math.min(100, Math.round((raisedNum / goalNum) * 100));
  };

  const isCampaignGoalReached = (campaign) => {
    // Convert to numbers to ensure proper comparison
    const raisedAmount = parseFloat(campaign.raised_amount);
    const goalAmount = parseFloat(campaign.goal_amount);
    
    // Check for valid numbers
    if (isNaN(raisedAmount) || isNaN(goalAmount)) {
      return false;
    }
    
    // Account for floating point precision issues
    // If the difference is less than 0.01, consider the goal reached
    const difference = goalAmount - raisedAmount;
    return difference < 0.01;
  };

  const calculateRemainingAmount = (campaign) => {
    // Convert to numbers to ensure proper calculation
    const goalAmount = parseFloat(campaign.goal_amount);
    const raisedAmount = parseFloat(campaign.raised_amount);
    
    // Check for valid numbers
    if (isNaN(goalAmount) || isNaN(raisedAmount)) {
      return 0;
    }
    
    const remaining = goalAmount - raisedAmount;
    
    // Ensure we don't return negative values due to floating point precision issues
    // If remaining is very small (< 0.01), consider it as 0
    if (remaining < 0.01) {
      return 0;
    }
    
    return remaining;
  };

  // New function to check if donation is possible
  const isDonationPossible = (campaign) => {
    if (isCampaignGoalReached(campaign)) {
      return false;
    }
    
    const remainingAmount = calculateRemainingAmount(campaign);
    // Allow donations even if remaining amount is less than $1.00
    return remainingAmount > 0;
  };

  if (loading) {
    return <div className="loading">Loading campaigns...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <div className="error-content">
          <span className="error-icon">⚠</span>
          <span className="error-text">Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fundraising-container">
      <div className="fundraising-header">
        <h2>Fundraising Campaigns</h2>
        <button 
          className="create-campaign-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create Campaign'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleSubmit} className="campaign-form">
          <h3>Create New Campaign</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Campaign Title *</label>
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
              <label htmlFor="goal_amount">Goal Amount ($) *</label>
              <input
                type="number"
                id="goal_amount"
                name="goal_amount"
                value={formData.goal_amount}
                onChange={handleChange}
                min="1"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_date">Start Date *</label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="end_date">End Date *</label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn">
            Create Campaign
          </button>
        </form>
      )}

      {activeCampaign ? (
        <div className="campaign-detail">
          <button 
            className="back-btn"
            onClick={() => setActiveCampaign(null)}
          >
            ← Back to Campaigns
          </button>
          
          <div className="campaign-info">
            <h3>{activeCampaign.title}</h3>
            <p className="campaign-description">{activeCampaign.description}</p>
            
            <div className="campaign-stats">
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${calculateProgress(activeCampaign.total_raised, activeCampaign.goal_amount)}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {formatCurrency(activeCampaign.total_raised)} raised of {formatCurrency(activeCampaign.goal_amount)} goal
                  ({calculateProgress(activeCampaign.total_raised, activeCampaign.goal_amount)}%)
                </div>
              </div>
              
              <div className="campaign-dates">
                <p><strong>Start Date:</strong> {new Date(activeCampaign.start_date).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> {new Date(activeCampaign.end_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          <div className="donation-section">
            <h4>Make a Donation</h4>
            {success && (
              <div className="success-message">
                <div className="success-content">
                  <span className="success-icon">✓</span>
                  <span className="success-text">{success}</span>
                </div>
              </div>
            )}
            {isCampaignGoalReached(activeCampaign) ? (
              <div className="goal-reached-message">
                <div className="goal-reached-content">
                  <span className="celebration-icon">🎉</span>
                  <span className="goal-reached-text">This campaign has reached its goal! Thank you for your support.</span>
                </div>
              </div>
            ) : !isDonationPossible(activeCampaign) ? (
              <div className="goal-reached-message">
                <div className="goal-reached-content">
                  <span className="celebration-icon">🎉</span>
                  <span className="goal-reached-text">This campaign is complete! No more donations can be accepted.</span>
                </div>
              </div>
            ) : (
              <>
                <div className="remaining-amount">
                  Remaining amount to reach goal: {formatCurrency(calculateRemainingAmount(activeCampaign))}
                  {calculateRemainingAmount(activeCampaign) < 1 && (
                    <span className="small-amount-note"> 
                      {" "}You can donate this exact amount to complete the campaign.
                    </span>
                  )}
                </div>
                <form onSubmit={handleDonationSubmit} className="donation-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="amount">Amount ($) *</label>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={donationData.amount}
                        onChange={handleDonationChange}
                        min="0.01"
                        step="0.01"
                        max={calculateRemainingAmount(activeCampaign)}
                        required
                      />
                      {calculateRemainingAmount(activeCampaign) < 1 && calculateRemainingAmount(activeCampaign) > 0 && (
                        <div className="warning-message">
                          The remaining amount for this campaign is only {formatCurrency(calculateRemainingAmount(activeCampaign))}. 
                          You can donate at least $1.00 to complete the campaign.
                        </div>
                      )}
                      {calculateRemainingAmount(activeCampaign) < 0.01 && calculateRemainingAmount(activeCampaign) > 0 && (
                        <div className="warning-message">
                          This campaign is almost complete. Donating any amount will complete the campaign.
                        </div>
                      )}
                      {calculateRemainingAmount(activeCampaign) === 0 && (
                        <div className="warning-message">
                          This campaign has reached its goal. No more donations can be accepted.
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="payment_method">Payment Method</label>
                      <select
                        id="payment_method"
                        name="payment_method"
                        value={donationData.payment_method}
                        onChange={handleDonationChange}
                      >
                        <option value="credit_card">Credit Card</option>
                        <option value="paypal">PayPal</option>
                        <option value="bank_transfer">Bank Transfer</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="is_anonymous"
                        checked={donationData.is_anonymous}
                        onChange={handleDonationChange}
                      />
                      Make this donation anonymous
                    </label>
                  </div>
                  
                  <button type="submit" className="donate-btn">
                    Donate Now
                  </button>
                </form>

              </>
            )}
          </div>
          
          <div className="donations-list">
            <h4>Your Donations ({donations.length})</h4>
            {donations.length === 0 ? (
              <p>You haven't made any donations to this campaign yet.</p>
            ) : (
              <div className="donations">
                {donations.map((donation) => (
                  <div key={donation.id} className="donation-item">
                    <div className="donation-info">
                      <div className="donor-name">
                        {donation.is_anonymous ? 'Anonymous' : (currentUser?.first_name + ' ' + currentUser?.last_name)}
                      </div>
                      <div className="donation-amount">
                        {formatCurrency(donation.amount)}
                      </div>
                    </div>
                    <div className="donation-date">
                      {new Date(donation.donation_date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="campaigns-list">
          {campaigns.length === 0 ? (
            <p>No fundraising campaigns found.</p>
          ) : (
            campaigns.map((campaign) => (
              <div key={campaign.id} className="campaign-card">
                <div className="campaign-header">
                  <h3>{campaign.title}</h3>
                  <div className="campaign-goal">
                    Goal: {formatCurrency(campaign.goal_amount)}
                  </div>
                </div>
                
                <p className="campaign-description">
                  {campaign.description.substring(0, 150)}
                  {campaign.description.length > 150 ? '...' : ''}
                </p>
                
                <div className="campaign-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${calculateProgress(campaign.total_raised, campaign.goal_amount)}%` }}
                    ></div>
                  </div>
                  <div className="progress-info">
                    <span className="raised-amount">
                      {formatCurrency(campaign.total_raised)} raised
                    </span>
                    <span className="donation-count">
                      {campaign.donation_count} donations
                    </span>
                  </div>
                </div>
                
                <div className="campaign-footer">
                  <div className="campaign-dates">
                    Ends: {new Date(campaign.end_date).toLocaleDateString()}
                  </div>
                  <button 
                    className={`view-btn ${isCampaignGoalReached(campaign) ? 'completed' : ''}`}
                    onClick={() => selectCampaign(campaign)}
                    disabled={isCampaignGoalReached(campaign)}
                  >
                    {isCampaignGoalReached(campaign) ? 'Completed' : 'View Details'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Fundraising;