const express = require('express');
const { register, login, logout, checkAuth } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/check', checkAuth);

module.exports = router;