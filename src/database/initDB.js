const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const schema = fs.readFileSync(path.join(__dirname, '../dbSchemaModels/messExpertSchema.sql')).toString();

pool.query(schema)
  .then(() => {
    console.log("Database schema created successfully.");
    process.exit();
  })
  .catch(err => {
    console.error("Error creating schema", err);
    process.exit(1);
  });
