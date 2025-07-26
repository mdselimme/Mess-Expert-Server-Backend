const { Router } = require('express');
const router = Router();
const MemberAdd = require("../MemberAdd/memberadd");
const authenticateToken = require("../../middleware/authenticateToken");

router.post("/add-member", authenticateToken, MemberAdd.MemberAdd);

const AddMemberRoute = router;

module.exports = AddMemberRoute;