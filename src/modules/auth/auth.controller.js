const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');
const envVars = require('../../config/env');

// Token generator
const generateToken = (user, rememberMe) =>
    jwt.sign({ id: user.id, username: user.username }, envVars.JWT_SECRET, {
        expiresIn: rememberMe ? '7d' : '1d', // Duration for rememberMe
    });

// Set token cookie
const setTokenCookie = (res, token, rememberMe) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: envVars.NODE_ENV === 'production',
        sameSite: envVars.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    });
};

// Register
const register = async (req, res) => {

    console.log(req.body)

    const { fullName, username, email, password, rememberMe } = req.body;

    if (!username || !email || !password || !fullName) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const userExists = await pool.query(
            'SELECT id FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (userExists.rows.length > 0) {
            throw new Error("Username or email already in use")
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Start a transaction
        await pool.query('BEGIN');

        try {
            // Create user
            const userResult = await pool.query(
                'INSERT INTO users (fullName, username, email, password) VALUES ($1, $2, $3, $4) RETURNING id, username, email',
                [fullName, username, email, hashedPassword]
            );

            const user = userResult.rows[0];

            // Create member record
            await pool.query(
                `INSERT INTO Members (name, phone_number,
         image, joining_date, user_id)
          VALUES ($1,'your phone number1', $2, CURRENT_DATE, $3)`,
                [username, 'https://i.ibb.co/M5C3p0pd/user-image.png', user.id]
            );

            await pool.query('COMMIT');

            const token = generateToken(user, rememberMe);
            setTokenCookie(res, token, rememberMe);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                user,
            });
        } catch (err) {
            await pool.query('ROLLBACK');
            throw (err)
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            user: null,
        });
    }
};

// Login
const login = async (req, res) => {
    const { email, password, rememberMe } = req.body;

    if (!email || !password)
        return res.status(400).json({ message: 'All fields are required' });

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            throw new Error('Invalid User Email')
        }
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new Error("Invalid User Password");
        }

        const token = generateToken(user, rememberMe);
        setTokenCookie(res, token, rememberMe);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: { id: user.id, username: user.username, email: user.email, token: token }, //mahtab- returned token to use in postman
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            user: null,
        });
    }
};

// Logout
const logout = (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: envVars.NODE_ENV === 'production',
            sameSite: envVars.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        res.status(200).json({
            success: true,
            message: 'Log Out successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

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

const AuthController = { register, login, logout, checkAuth };

module.exports = AuthController;
