const express = require('express')
const router = express.Router()
const { ExpensesAdd } = require("../controllers/expensesController");
const authenticateToken = require("../middleware/authenticateToken");

router.post("/expenses", authenticateToken, ExpensesAdd);

module.exports = router;