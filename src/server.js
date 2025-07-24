const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = require("./app/app");
const pool = require("./config/db");
const envVars = require("./config/env");


const PORT = envVars.PORT || 5000;

let server;

const mainServer = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Connected to the database successfully at:', result.rows[0].now);
    server = app.listen(PORT, () => {
      console.log(`server has started on port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error.message);
  }
};

mainServer();



