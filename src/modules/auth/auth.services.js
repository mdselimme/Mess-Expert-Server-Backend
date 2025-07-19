const pool = require("../../config/db");
const bcrypt = require('bcrypt');
const AppError = require("../../errorHelpers/AppError");
const { StatusCodes } = require("http-status-codes");
const { generateToken, setTokenCookie } = require("../../utils/usersToken");
const envVars = require("../../config/env");



// Create An User
const createAnUser = async (payload) => {
    const { fullName, username, email, password } = payload;

    if (!username || !email || !password || !fullName) {
        throw new AppError(StatusCodes.BAD_REQUEST, "All fields are required.");
    }

    const userExists = await pool.query(
        'SELECT id FROM users WHERE username = $1 OR email = $2',
        [username, email]
    );

    if (userExists.rows.length > 0) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Email Already In Use.");
    }

    if (userExists.rows.length > 0) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Username Already In Use.");
    }

    const hashedPassword = await bcrypt.hash(password, Number(envVars.BCRYPT_SALT_ROUND));

    // Start a transaction
    await pool.query('BEGIN');

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


};


// Login User 
const logInUser = async (res, payload) => {

    const { email, password, rememberMe } = payload;

    if (!email || !password) {
        throw new AppError(StatusCodes.BAD_REQUEST, "All fields are required.");
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (!result.rows[0]) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid User Email')
    }

    const user = result.rows[0];
    // password compare 
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Invalid User Password");
    }
    // get member by user id 
    const memberResult = await pool.query('SELECT * FROM members WHERE user_id = $1', [user.id]);
    // generate token adn setTokenCookie 
    const token = generateToken(user, rememberMe);
    setTokenCookie(res, token, rememberMe);
    // password  remove
    const { password: _, ...rest } = result.rows[0];
    // merge member and user object 
    const userResult = { ...rest, ...memberResult.rows[0] };
    // user and accessToken
    return {
        user: userResult,
        accessToken: token
    }
};


// Get User Data By Token 
const getMyDataByToken = async (payload) => {

    const userFind = await pool.query('SELECT * FROM users WHERE id = $1', [payload]);

    if (!userFind.rows[0]) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid User Id')
    }
    const user = userFind.rows[0];
    // get member by user id 
    const memberResult = await pool.query('SELECT * FROM members WHERE user_id = $1', [user.id]);
    // password  remove
    const { password: _, ...rest } = user;
    // merge member and user object 
    const userResult = { ...rest, ...memberResult.rows[0] };
    return userResult;
};

const AuthServices = { logInUser, createAnUser, getMyDataByToken }
module.exports = AuthServices;