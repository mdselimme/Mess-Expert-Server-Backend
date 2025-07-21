const jwt = require('jsonwebtoken');
const AppError = require('../errorHelpers/AppError');
const { StatusCodes } = require('http-status-codes');
const envVars = require('../config/env');
const catchAsync = require('../utils/catchAsync');


// MiddleWare for verify Jwt 
const authenticateToken = catchAsync(async (req, res, next) => {
    const token = req.cookies?.accessToken;

    if (!token) {
        throw new AppError(StatusCodes.FORBIDDEN, "User Not Authenticated. Token is missing.")
        // return res.status(401).json({ message: 'Not authenticated. Token missing in cookies.' });
    }
    const decoded = jwt.verify(token, envVars.JWT_SECRET);

    req.id = decoded.id;
    req.user = decoded; 

    next();
})

module.exports = authenticateToken;