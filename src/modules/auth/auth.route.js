const { Router } = require('express');
const AuthController = require('./auth.controller');
const authenticateToken = require('../../middleware/authenticateToken');


const router = Router();

// Register a user 
router.post('/register', AuthController.userRegister);
//Logged in a user
router.post('/login', AuthController.logInUser);
//logged out an user
router.post('/logout', AuthController.userLogOut);

//Reset Password
router.patch("/reset-password",
    authenticateToken,
    AuthController.userPasswordReset);

//Update User Data
router.patch("/update-userData",
    authenticateToken,
    AuthController.userDataUpdate);

//Auth Check user
router.get('/check', AuthController.checkAuth);
//My User find
router.get('/get-me',
    authenticateToken,
    AuthController.getMyDataByToken);

// Update profile  
router.patch('/update-profile', authenticateToken, AuthController.updateUserProfile);

const AuthRouter = router;

module.exports = AuthRouter;