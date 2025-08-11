const jwt = require("jsonwebtoken");
const envVars = require("../config/env");


// Token generator
const generateToken = (user, rememberMe) =>
    jwt.sign({ id: user.id, username: user.username, email: user.email },
        envVars.JWT_SECRET, {
        expiresIn: rememberMe ? '7d' : '1d', // Duration for rememberMe
    });

// Set token cookie
const setTokenCookie = (res, token, rememberMe) => {
    res.cookie('accessToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    });
};


module.exports = { generateToken, setTokenCookie }