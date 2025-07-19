const { Router } = require('express');
const AuthController = require('./auth.controller');
const authenticateToken = require('../../middleware/authenticateToken');


const router = Router();

router.post('/register', AuthController.userRegister);
router.post('/login', AuthController.logInUser);
router.post('/logout', AuthController.userLogOut);
router.get('/check', AuthController.checkAuth);
router.get('/get-me', authenticateToken, AuthController.getMyDataByToken);


const AuthRouter = router;

module.exports = AuthRouter;