const FundraisingCampaign = require('../models/FundraisingCampaign');
const db = require('../config/db');

const campaignModel = new FundraisingCampaign(db);

// Create a new campaign
exports.createCampaign = (req, res) => {
  const campaignData = req.body;
  
  // Basic validation
  if (!campaignData.title || !campaignData.goal_amount) {
    return res.status(400).json({
      error: 'Campaign title and goal amount are required'
    });
  }
  
  campaignModel.create(campaignData, (err, result) => {
    if (err) {
      return res.status(500).json({
        error: 'Error creating campaign'
      });
    }
    
    res.status(201).json({
      message: 'Campaign created successfully',
      campaignId: result.insertId
    });
  });
};

// Get all campaigns
exports.getAllCampaigns = (req, res) => {
  campaignModel.getAll((err, results) => {
    if (err) {
      return res.status(500).json({
        error: 'Error retrieving campaigns'
      });
    }
    
    res.json(results);
  });
};

// Get campaign by ID
exports.getCampaignById = (req, res) => {
  const { id } = req.params;
  
  campaignModel.getById(id, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: 'Error retrieving campaign'
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }
    
    res.json(results[0]);
  });
};

// Update campaign
exports.updateCampaign = (req, res) => {
  const { id } = req.params;
  const campaignData = req.body;
  
  campaignModel.update(id, campaignData, (err, result) => {
    if (err) {
      return res.status(500).json({
        error: 'Error updating campaign'
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }
    
    res.json({
      message: 'Campaign updated successfully'
    });
  });
};

// Delete campaign
exports.deleteCampaign = (req, res) => {
  const { id } = req.params;
  
  campaignModel.delete(id, (err, result) => {
    if (err) {
      return res.status(500).json({
        error: 'Error deleting campaign'
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }
    
    res.json({
      message: 'Campaign deleted successfully'
    });
  });
};

// Get campaign donations
exports.getCampaignDonations = (req, res) => {
  const { id } = req.params;
  
  campaignModel.getCampaignDonations(id, (err, results) => {
    if (err) {
      console.error('Error retrieving campaign donations:', err);
      return res.status(500).json({
        error: 'Error retrieving campaign donations: ' + err.message
      });
    }
    
    res.json(results);
  });
};

// Get user-specific campaign donations
exports.getUserCampaignDonations = (req, res) => {
  const { id, userId } = req.params;
  
  // Validate parameters
  if (!id || !userId) {
    return res.status(400).json({
      error: 'Campaign ID and User ID are required'
    });
  }
  
  campaignModel.getUserCampaignDonations(id, userId, (err, results) => {
    if (err) {
      console.error('Error retrieving user campaign donations:', err);
      return res.status(500).json({
        error: 'Error retrieving user campaign donations: ' + err.message
      });
    }
    
    res.json(results);
  });
};

// Create a donation
exports.createDonation = (req, res) => {
  const donationData = req.body;
  
  // Basic validation
  if (!donationData.campaign_id || !donationData.alumni_id || !donationData.amount) {
    return res.status(400).json({
      error: 'Campaign ID, Alumni ID, and amount are required'
    });
  }
  
  // Convert amount to float and validate it's at least 1
  const donationAmount = parseFloat(donationData.amount);
  
  if (isNaN(donationAmount)) {
    return res.status(400).json({
      error: 'Invalid donation amount. Please enter a valid number.'
    });
  }
  
  if (donationAmount < 1) {
    return res.status(400).json({
      error: 'Donation amount must be at least $1.00'
    });
  }
  
  // First, get the campaign details to check the goal amount and current raised amount
  const campaignQuery = `
    SELECT goal_amount, raised_amount
    FROM fundraising_campaigns
    WHERE id = ?
  `;
  
  db.query(campaignQuery, [donationData.campaign_id], (campaignErr, campaignResults) => {
    if (campaignErr) {
      return res.status(500).json({
        error: 'Error retrieving campaign information'
      });
    }
    
    if (campaignResults.length === 0) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }
    
    const campaign = campaignResults[0];
    const goalAmount = parseFloat(campaign.goal_amount);
    const currentRaisedAmount = parseFloat(campaign.raised_amount);
    
    // Check if the campaign goal has already been reached
    if (currentRaisedAmount >= goalAmount) {
      return res.status(400).json({
        error: 'This campaign has already reached its goal. No more donations can be accepted.'
      });
    }
    
    // Calculate remaining amount
    const remainingAmount = goalAmount - currentRaisedAmount;
    
    // Check if remaining amount is essentially zero (due to floating point precision)
    if (remainingAmount < 0.01) {
      return res.status(400).json({
        error: 'This campaign has already reached its goal. No more donations can be accepted.'
      });
    }
    
    console.log(`Campaign goal: ${goalAmount}, Raised: ${currentRaisedAmount}, Remaining: ${remainingAmount}`);
    
    // Special case: If remaining amount is very small but >= $0.01 and < $1.00, 
    // allow donations of at least $1.00 to complete the campaign
    if (remainingAmount >= 0.01 && remainingAmount < 1.00 && donationAmount >= 1.00) {
      console.log('Allowing donation of at least $1.00 to complete campaign with small remaining amount');
      // Allow the donation to proceed as it will complete the campaign
    }
    // Check if the donation would exceed the campaign goal (normal case)
    else if (donationAmount > remainingAmount) {
      console.log(`Donation amount ${donationAmount} exceeds remaining amount ${remainingAmount}`);
      // Special case: Allow donations that exactly match the remaining amount
      // to complete the campaign, regardless of how small the remaining amount is
      if (Math.abs(donationAmount - remainingAmount) < 0.01) { // Account for floating point precision
        console.log('Allowing donation that exactly matches remaining amount');
        // Allow the donation to proceed as it will complete the campaign
      } 
      // Special case: If remaining amount is essentially zero, reject the donation
      else if (remainingAmount < 0.01) {
        console.log('Remaining amount is essentially zero, rejecting donation');
        return res.status(400).json({
          error: 'This campaign has already reached its goal. No more donations can be accepted.'
        });
      } else {
        console.log('Rejecting donation as it exceeds remaining amount');
        return res.status(400).json({
          error: `Donation amount ($${donationAmount.toFixed(2)}) exceeds the remaining campaign goal ($${remainingAmount.toFixed(2)}). Maximum donation allowed: $${remainingAmount.toFixed(2)}`
        });
      }
    }

    // Proceed with creating the donation
    const query = `
      INSERT INTO donations (
        campaign_id, alumni_id, amount, payment_method, transaction_id, is_anonymous
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      donationData.campaign_id,
      donationData.alumni_id,
      donationAmount,
      donationData.payment_method || null,
      donationData.transaction_id || null,
      donationData.is_anonymous || false
    ];
    
    db.query(query, values, (err, result) => {
      if (err) {
        return res.status(500).json({
          error: 'Error creating donation'
        });
      }
      
      // Update the raised amount in the campaign
      const updateQuery = `
        UPDATE fundraising_campaigns fc
        SET raised_amount = (
          SELECT COALESCE(SUM(d.amount), 0)
          FROM donations d
          WHERE d.campaign_id = fc.id
        )
        WHERE fc.id = ?
      `;
      
      db.query(updateQuery, [donationData.campaign_id], (updateErr) => {
        if (updateErr) {
          console.error('Error updating campaign raised amount:', updateErr);
        }
        
        res.status(201).json({
          message: 'Donation created successfully',
          donationId: result.insertId
        });
      });
    });
  });
};

// Get total donations raised across all campaigns
exports.getTotalDonations = (req, res) => {
  const query = `
    SELECT COALESCE(SUM(amount), 0) as total_raised
    FROM donations
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error retrieving total donations:', err);
      return res.status(500).json({
        error: 'Error retrieving total donations: ' + err.message
      });
    }
    
    const totalRaised = results[0]?.total_raised || 0;
    res.json({
      total_raised: totalRaised
    });
  });
};
