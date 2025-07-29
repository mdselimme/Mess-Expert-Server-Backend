const { Router } = require('express');
const router = Router();

const authenticateToken = require("../../middleware/authenticateToken");
const getMessName = require("../MemberAdd/getgroupname");


router.get("/:messId/mess-name", authenticateToken, getMessName);


module.exports = router