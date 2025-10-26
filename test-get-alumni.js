const Alumni = require('./backend/models/Alumni');
const db = require('./backend/config/db');

const alumniModel = new Alumni(db);

alumniModel.getAll((err, results) => {
  if (err) {
    console.error('Error getting alumni:', err);
  } else {
    console.log('Alumni retrieved successfully:', results);
  }
  
  // Close the database connection
  db.end();
});