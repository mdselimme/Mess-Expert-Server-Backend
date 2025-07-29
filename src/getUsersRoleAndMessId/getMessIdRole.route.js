const { Router } = require("express");
const router = Router();
const authenticateToken = require("../middleware/authenticateToken");
const GetMessIdRole = require("./getMessIdRole"); // adjust path if needed

// Route to get messId and role for the authenticated user
router.get("/users-messid-role", authenticateToken, GetMessIdRole);

const GetMessIdRoleRoute = router;

module.exports = GetMessIdRoleRoute;
