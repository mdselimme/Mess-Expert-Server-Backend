const express = require("express");
const router = express.Router();
const { Deposit } = require("../controllers/depositController");
const authenticateToken = require("../middleware/authenticateToken");

router.post("/deposit", authenticateToken, Deposit);

module.exports = router;
