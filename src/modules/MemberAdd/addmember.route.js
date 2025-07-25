const { Router } = require('express');
const router = Router();
const MemberAdd = require("../MemberAdd/memberadd");
const authenticateToken = require("../../middleware/authenticateToken");
const getMessName = require("../MemberAdd/getgroupname");

router.post("/:messId/add-member", authenticateToken, MemberAdd.MemberAdd, getMessName);

const AddMemberRoute = router;

module.exports = AddMemberRoute;