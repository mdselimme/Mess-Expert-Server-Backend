const app = require("./src/app/app");
const dotenv = require("dotenv");
const pool = require("./src/config/db");
dotenv.config();

const PORT = process.env.PORT || 5000;

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



