const Alumni = require('./backend/models/Alumni');
const db = require('./backend/config/db');

const alumniModel = new Alumni(db);

// Test data
const testData = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone: '123-456-7890',
  graduation_year: 2020,
  degree: 'Computer Science',
  major: 'Software Engineering',
  current_job_title: 'Software Developer',
  current_company: 'Tech Corp',
  linkedin_profile: 'https://linkedin.com/in/johndoe',
  address: '123 Main St',
  city: 'New York',
  state: 'NY',
  country: 'USA',
  postal_code: '10001',
  bio: 'Software developer with 5 years of experience.'
};

alumniModel.create(testData, (err, result) => {
  if (err) {
    console.error('Error creating alumni:', err);
  } else {
    console.log('Alumni created successfully:', result);
  }
  
  // Close the database connection
  db.end();
});