const axios = require('axios');

async function testApiSearch() {
  try {
    // Test the API endpoint directly
    const response = await axios.get('http://localhost:5000/api/alumni/search?q=John');
    console.log('API search successful:', response.data);
  } catch (error) {
    console.error('API search failed:', error.response ? error.response.data : error.message);
  }
}

testApiSearch();