const { Router } = require('express');
const authenticateToken = require('../../middleware/authenticateToken');
const MessController = require('./mess.controller');
const router = Router();


// Only authenticated users can create a mess or add members
router.post('/create', authenticateToken, MessController.createMess);
router.post('/:messId/add-member', authenticateToken, MessController.addMemberToMess);
router.get('/:messId/summary', authenticateToken, MessController.getMessSummary);
router.get('/:messId/members/summary', authenticateToken, MessController.getAllMemberSummary);
router.get('/:messId/member/me/summary', authenticateToken, MessController.getPersonalSummary);


const MessRoute = router;

module.exports = MessRoute;
