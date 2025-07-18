const { Router } = require('express');
const AuthController = require('./auth.controller');


const router = Router();

router.post('/register', AuthController.userRegister);
router.post('/login', AuthController.logInUser);
router.post('/logout', AuthController.userLogOut);
router.get('/check', AuthController.checkAuth);


const AuthRouter = router;

module.exports = AuthRouter;