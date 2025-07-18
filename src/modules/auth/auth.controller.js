const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');
const envVars = require('../../config/env');
const catchAsync = require('../../utils/catchAsync');
const sendResponse = require('../../utils/sendResponse');
const { StatusCodes } = require('http-status-codes');
const AuthServices = require('./auth.services');


// Create An User 
const userRegister = catchAsync(async (req, res, next) => {

    await AuthServices.createAnUser(req.body);

    // send response
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "User Account Create Successfully.",
        data: null,
        success: true,
    })
});

// Log In User Account 
const logInUser = catchAsync(async (req, res, next) => {

    const payload = req.body;

    const usersResult = await AuthServices.logInUser(res, payload)

    // send response
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "User logged in Successfully.",
        data: usersResult,
        success: true,
    })
});

// User Log Out 
const userLogOut = catchAsync(async (req, res, next) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: envVars.NODE_ENV === 'production',
        sameSite: envVars.NODE_ENV === 'production' ? 'none' : 'strict',
    });
    // send response
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "User logged Out Successfully.",
        data: null,
        success: true,
    })
});

// Middleware
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, envVars.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token error:', err);
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Check Auth
const checkAuth = [
    verifyToken,
    (req, res) => {
        res.json({ id: req.user.id, username: req.user.username });
    },
];

const AuthController = { userLogOut, userRegister, checkAuth, logInUser };

module.exports = AuthController;
