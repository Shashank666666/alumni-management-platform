class FundraisingCampaign {
  constructor(db) {
    this.db = db;
  }

  // Create a new campaign
  create(campaignData, callback) {
    const query = `
      INSERT INTO fundraising_campaigns (
        title, description, goal_amount, start_date, end_date, created_by
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      campaignData.title,
      campaignData.description,
      campaignData.goal_amount,
      campaignData.start_date,
      campaignData.end_date,
      campaignData.created_by
    ];

    this.db.query(query, values, callback);
  }

  // Get all campaigns
  getAll(callback) {
    const query = `
      SELECT fc.*, 
             CONCAT(a.first_name, ' ', a.last_name) as creator_name,
             COUNT(d.id) as donation_count,
             COALESCE(SUM(d.amount), 0) as total_raised
      FROM fundraising_campaigns fc
      LEFT JOIN alumni a ON fc.created_by = a.id
      LEFT JOIN donations d ON fc.id = d.campaign_id
      GROUP BY fc.id
      ORDER BY fc.created_at DESC
    `;
    this.db.query(query, callback);
  }

  // Get campaign by ID
  getById(id, callback) {
    const query = `
      SELECT fc.*, 
             CONCAT(a.first_name, ' ', a.last_name) as creator_name,
             COUNT(d.id) as donation_count,
             COALESCE(SUM(d.amount), 0) as total_raised
      FROM fundraising_campaigns fc
      LEFT JOIN alumni a ON fc.created_by = a.id
      LEFT JOIN donations d ON fc.id = d.campaign_id
      WHERE fc.id = ?
      GROUP BY fc.id
    `;
    this.db.query(query, [id], callback);
  }

  // Update campaign
  update(id, campaignData, callback) {
    const query = `
      UPDATE fundraising_campaigns SET
        title = ?, description = ?, goal_amount = ?, 
        start_date = ?, end_date = ?
      WHERE id = ?
    `;
    
    const values = [
      campaignData.title,
      campaignData.description,
      campaignData.goal_amount,
      campaignData.start_date,
      campaignData.end_date,
      id
    ];

    this.db.query(query, values, callback);
  }

  // Delete campaign
  delete(id, callback) {
    const query = 'DELETE FROM fundraising_campaigns WHERE id = ?';
    this.db.query(query, [id], callback);
  }

  // Get campaign donations
  getCampaignDonations(campaignId, callback) {
    const query = `
      SELECT d.*, 
             CONCAT(a.first_name, ' ', a.last_name) as donor_name,
             a.email
      FROM donations d
      JOIN alumni a ON d.alumni_id = a.id
      WHERE d.campaign_id = ?
      ORDER BY d.donation_date DESC
    `;
    
    this.db.query(query, [campaignId], callback);
  }

  // Get user-specific campaign donations
  getUserCampaignDonations(campaignId, userId, callback) {
    const query = `
      SELECT d.*, 
             CONCAT(a.first_name, ' ', a.last_name) as donor_name,
             a.email
      FROM donations d
      JOIN alumni a ON d.alumni_id = a.id
      WHERE d.campaign_id = ? AND d.alumni_id = ?
      ORDER BY d.donation_date DESC
    `;
    
    this.db.query(query, [campaignId, userId], callback);
  }
}

module.exports = FundraisingCampaign;