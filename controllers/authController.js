const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const pool = require('../config/db');

dotenv.config();

// Token generator
const generateToken = (user,rememberMe) =>
  jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: rememberMe ? '7d' : '1d', // Duration for rememberMe
  });

// Set token cookie
const setTokenCookie = (res, token,rememberMe) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: rememberMe? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
  });
};

// Register
const register = async (req, res) => {
  const { username, email, password, confirmPassword ,rememberMe} = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const userExists = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: 'Username or email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = generateToken(user,rememberMe);
    setTokenCookie(res, token,rememberMe);

    res.status(201).json({
      message: 'User registered successfully',
      user,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login
const login = async (req, res) => {
  const { email, password ,rememberMe } = req.body;
  
  if (!email || !password)
    return res.status(400).json({ message: 'All fields are required' });

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0)
      return res.status(401).json({ message: 'Invalid email or password' });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = generateToken(user,rememberMe);
    setTokenCookie(res, token ,rememberMe);

    res.json({
      message: 'Login successful',
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout
const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  });
  res.json({ message: 'Logged out successfully' });
};

// Middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

module.exports = { register, login, logout, checkAuth };
