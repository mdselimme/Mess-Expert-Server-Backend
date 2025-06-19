const express = require('express');
const router = express.Router();
const { createMess, addMemberToMess } = require('../controllers/messController');
const  authenticateToken = require('../middleware/authenticateToken');

// Only authenticated users can create a mess or add members
router.post('/create', authenticateToken, createMess);
router.post('/:messId/add-member', authenticateToken, addMemberToMess);

module.exports = router;
  