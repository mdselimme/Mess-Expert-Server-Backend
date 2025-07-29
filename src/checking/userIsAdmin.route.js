const { Router } = require('express');
const router = Router();
const checkUserAdminOfCureentMess = require("../checking/userIsAdmin");
const authenticateToken = require("../middleware/authenticateToken");

router.get("/:messId/admin-check", authenticateToken, checkUserAdminOfCureentMess);

const CheckAdminOfMessRoute = router;

module.exports = CheckAdminOfMessRoute;