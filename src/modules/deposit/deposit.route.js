const { Router } = require("express");
const router = Router();
const DepositController = require("./deposit.controller");
const authenticateToken = require("../../middleware/authenticateToken");

router.post("/deposit", authenticateToken, DepositController.createADeposit);

const DepositRoute = router;

module.exports = DepositRoute;
