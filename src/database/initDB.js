const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

const schema = fs.readFileSync(path.join(__dirname, '../models/messExpertSchema.sql')).toString();

pool.query(schema)
  .then(() => {
    console.log("Database schema created successfully.");
    process.exit();
  })
  .catch(err => {
    console.error("Error creating schema", err);
    process.exit(1);
  });
