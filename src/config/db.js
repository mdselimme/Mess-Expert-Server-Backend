// Database connection
const Pool = require("pg").Pool;
const dotenv = require("dotenv");
const envVars = require("./env");
dotenv.config();

const pool = new Pool({
  user: envVars.DB_USER,
  host: envVars.DB_HOST,
  database: envVars.DB_NAME,
  password: envVars.DB_PASSWORD,
  port: envVars.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});




// -----------------------------------------
//supabase database linkup



module.exports = pool;

