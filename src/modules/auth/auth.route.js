const { Router } = require('express');
const AuthController = require('./auth.controller');


const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/check', AuthController.checkAuth);


const AuthRouter = router;

module.exports = AuthRouter;