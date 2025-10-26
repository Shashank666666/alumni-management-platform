const express = require('express');
const router = express.Router();
const fundraisingController = require('../controllers/fundraisingController');

// Create a new campaign
router.post('/', fundraisingController.createCampaign);

// Get all campaigns
router.get('/', fundraisingController.getAllCampaigns);

// Get total donations raised across all campaigns
router.get('/total-raised', fundraisingController.getTotalDonations);

// Create a donation
router.post('/donate', fundraisingController.createDonation);

// Get campaign by ID (must be after specific routes like /total-raised)
router.get('/:id', fundraisingController.getCampaignById);

// Get all campaign donations
router.get('/:id/donations', fundraisingController.getCampaignDonations);

// Get user-specific campaign donations
router.get('/:id/donations/user/:userId', fundraisingController.getUserCampaignDonations);

// Update campaign
router.put('/:id', fundraisingController.updateCampaign);

// Delete campaign
router.delete('/:id', fundraisingController.deleteCampaign);

module.exports = router;