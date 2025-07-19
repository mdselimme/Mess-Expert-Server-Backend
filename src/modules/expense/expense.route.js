const { Router } = require('express');
const authenticateToken = require('../../middleware/authenticateToken');
const ExpenseController = require('./expense.controller');
const router = Router()


router.post("/expenses", authenticateToken, ExpenseController.ExpensesAdd);

const ExpenseRoute = router;

module.exports = ExpenseRoute;