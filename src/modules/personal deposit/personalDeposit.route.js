const { Router } = require('express');
const authenticateToken = require('../../middleware/authenticateToken');
const PersonalDepositController = require('./personalDeposit.controller');
const router = Router()


router.post("/deposit", authenticateToken, PersonalDepositController);

const PersonalDepositRoute = router;

module.exports = PersonalDepositRoute;