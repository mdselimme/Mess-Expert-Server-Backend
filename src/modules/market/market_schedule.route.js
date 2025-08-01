const { Router } = require('express');
const authenticateToken = require('../../middleware/authenticateToken');
const MarketScheduleController = require('./market_schedule.controller');
const router = Router()


router.get("/:messId/:userRole", authenticateToken, MarketScheduleController);

const MarketScheduleRoute = router;

module.exports = MarketScheduleRoute;