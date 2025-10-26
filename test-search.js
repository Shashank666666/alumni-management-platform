const Alumni = require('./backend/models/Alumni');
const db = require('./backend/config/db');

const alumniModel = new Alumni(db);

// Test search
alumniModel.search('John', (err, results) => {
  if (err) {
    console.error('Error searching alumni:', err);
  } else {
    console.log('Search results:', results);
  }
  
  // Close the database connection
  db.end();
});