const axios = require('axios');

// Test data for registration
const testData = {
  first_name: 'Jane',
  last_name: 'Smith',
  email: 'jane.smith@example.com',
  phone: '987-654-3210',
  graduation_year: 2019,
  degree: 'Business Administration',
  major: 'Marketing',
  current_job_title: 'Marketing Manager',
  current_company: 'Marketing Solutions Inc',
  linkedin_profile: 'https://linkedin.com/in/janesmith',
  address: '456 Oak Ave',
  city: 'Los Angeles',
  state: 'CA',
  country: 'USA',
  postal_code: '90210',
  bio: 'Marketing professional with 6 years of experience.'
};

async function testRegistration() {
  try {
    const response = await axios.post('http://localhost:5000/api/alumni', testData);
    console.log('Registration successful:', response.data);
  } catch (error) {
    console.error('Registration failed:', error.response ? error.response.data : error.message);
  }
}

testRegistration();