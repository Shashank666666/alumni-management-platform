class Alumni {
  constructor(db) {
    this.db = db;
  }

  // Create a new alumni record
  create(alumniData, callback) {
    const query = `
      INSERT INTO alumni (
        first_name, last_name, email, password_hash, phone, graduation_year, degree, major,
        current_job_title, current_company, linkedin_profile, address, city,
        state, country, postal_code, profile_picture, bio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      alumniData.first_name,
      alumniData.last_name,
      alumniData.email,
      alumniData.password_hash || null,
      alumniData.phone,
      alumniData.graduation_year,
      alumniData.degree,
      alumniData.major,
      alumniData.current_job_title,
      alumniData.current_company,
      alumniData.linkedin_profile,
      alumniData.address,
      alumniData.city,
      alumniData.state,
      alumniData.country,
      alumniData.postal_code,
      alumniData.profile_picture || null,
      alumniData.bio
    ];

    this.db.query(query, values, callback);
  }

  // Get all alumni
  getAll(callback) {
    const query = 'SELECT * FROM alumni WHERE is_active = TRUE ORDER BY last_name, first_name';
    this.db.query(query, callback);
  }

  // Get alumni by ID
  getById(id, callback) {
    const query = 'SELECT * FROM alumni WHERE id = ? AND is_active = TRUE';
    this.db.query(query, [id], callback);
  }

  // Get alumni by email
  getByEmail(email, callback) {
    const query = 'SELECT * FROM alumni WHERE email = ? AND is_active = TRUE';
    this.db.query(query, [email], callback);
  }

  // Update alumni record
  update(id, alumniData, callback) {
    const query = `
      UPDATE alumni SET
        first_name = ?, last_name = ?, email = ?, phone = ?, graduation_year = ?,
        degree = ?, major = ?, current_job_title = ?, current_company = ?,
        linkedin_profile = ?, address = ?, city = ?, state = ?, country = ?,
        postal_code = ?, profile_picture = ?, bio = ?, last_updated = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const values = [
      alumniData.first_name,
      alumniData.last_name,
      alumniData.email,
      alumniData.phone,
      alumniData.graduation_year,
      alumniData.degree,
      alumniData.major,
      alumniData.current_job_title,
      alumniData.current_company,
      alumniData.linkedin_profile,
      alumniData.address,
      alumniData.city,
      alumniData.state,
      alumniData.country,
      alumniData.postal_code,
      alumniData.profile_picture || null,
      alumniData.bio,
      id
    ];

    this.db.query(query, values, callback);
  }

  // Delete alumni (soft delete)
  delete(id, callback) {
    const query = 'UPDATE alumni SET is_active = FALSE WHERE id = ?';
    this.db.query(query, [id], callback);
  }

  // Search alumni
  search(searchTerm, callback) {
    const query = `
      SELECT * FROM alumni 
      WHERE is_active = TRUE 
      AND (
        first_name LIKE ? OR 
        last_name LIKE ? OR 
        email LIKE ? OR 
        degree LIKE ? OR 
        major LIKE ? OR 
        current_company LIKE ? OR 
        city LIKE ? OR 
        state LIKE ?
      )
      ORDER BY last_name, first_name
    `;
    
    const searchValue = `%${searchTerm}%`;
    const values = [
      searchValue, searchValue, searchValue, searchValue,
      searchValue, searchValue, searchValue, searchValue
    ];
    
    this.db.query(query, values, callback);
  }

  // Get count of all active alumni
  getCount(callback) {
    const query = 'SELECT COUNT(*) as count FROM alumni WHERE is_active = TRUE';
    this.db.query(query, callback);
  }
}

module.exports = Alumni;