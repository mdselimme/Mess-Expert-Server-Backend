const { Router } = require('express');
const authenticateToken = require('../../middleware/authenticateToken');
const PersonalExpenseController = require('./personalExpense.controller');
const router = Router()


router.post("/expense", authenticateToken, PersonalExpenseController);

const PersonalExpenseRoute = router;

module.exports = PersonalExpenseRoute;