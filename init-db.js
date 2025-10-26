const mysql = require('mysql2');
const fs = require('fs');

// Database connection for root user (without specifying database)
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
});

// Read the schema file
const schema = fs.readFileSync('./backend/config/schema.sql', 'utf8');

// Split the schema into individual statements
const statements = schema.split(';').filter(stmt => stmt.trim() !== '');

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL as root.');

  // Execute each statement
  executeStatements(statements, 0);
});

function executeStatements(statements, index) {
  if (index >= statements.length) {
    console.log('Database initialization complete.');
    connection.end();
    return;
  }

  const statement = statements[index].trim() + ';';
  
  if (statement.length > 1) {
    console.log(`Executing: ${statement.substring(0, 50)}...`);
    
    connection.query(statement, (err, results) => {
      if (err) {
        console.error('Error executing statement:', err.message);
      } else {
        console.log('Statement executed successfully.');
      }
      executeStatements(statements, index + 1);
    });
  } else {
    executeStatements(statements, index + 1);
  }
}