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
        'INSERT INTO users (fullname, username, email, password) VALUES ($1, $2, $3, $4) RETURNING id, username, email',
        [fullName, username, email, hashedPassword]
    );

    const user = userResult.rows[0];


    // Create member record
    await pool.query(
        `INSERT INTO members (name, phone_number, image, joining_date, user_id)
     VALUES ($1, $2, $3, CURRENT_DATE, $4)`,
        [fullName, "01700000000", "https://i.ibb.co/M5C3p0pd/user-image.png", user.id]
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
    const query = `
            SELECT 
            MM.mess_id,
            M.role
            FROM Members M
            JOIN MemberMess MM ON M.member_id = MM.member_id
            WHERE M.user_id = $1
            ORDER BY MM.joined_at DESC LIMIT 1;
        `;
    console.log(memberResult.rows[0])
    const result2 = await pool.query(query, [user.id]);
    const membersMessIdRole = result2.rows[0];

    // generate token adn setTokenCookie 
    const token = generateToken(user, rememberMe);
    setTokenCookie(res, token, rememberMe);
    // password  remove
    const { password: _, ...rest } = result.rows[0];
    console.log(rest)
    // merge member and user object 
    const userResult = { ...rest, ...memberResult.rows[0], ...membersMessIdRole };
    console.log(userResult)
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


    if (memberResult.rows.length === 0) {
        throw new AppError(StatusCodes.NOT_FOUND, 'No member record found for this user');
    }
    const member = memberResult.rows[0];

    // get mess_ids from member mess
    const messMemberships = await pool.query(
        'SELECT mess_id FROM membermess WHERE member_id = $1',
        [member.member_id]
    );
    // const messId = messMemberships.rows.map(row => row.mess_id) //multiple mess
    const messId = messMemberships.rows.map(row => row.mess_id)[0] || null; // one mess
    // password  remove
    const { password: _, ...rest } = user;
    // merge member and user object 
    const userResult = { ...memberResult.rows[0], ...rest, mess_id: messId };
    return userResult;
};

// User password reset 
const userPasswordResetService = async (payload, decodedToken) => {
    // data find form body 
    const { oldPassword, newPassword } = payload;
    //user find from db
    const userFind = await pool.query('SELECT * FROM users WHERE id = $1', [decodedToken.id]);
    // if user not exit 
    if (!userFind.rows[0]) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid User Id')
    }
    const user = userFind.rows[0];
    // old and user password compare 
    const passwordCheck = await bcrypt.compare(oldPassword, user.password);
    // if password not match 
    if (!passwordCheck) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid Old Password.')
    }
    // if old password and new password same 
    if (oldPassword === newPassword) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Old Password and New Password is same. Try with a new password.')
    }
    // new password hash 
    const newHashPassword = await bcrypt.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND));
    // password reset result 
    const result = await pool.query('UPDATE users SET password = $1 WHERE email = $2', [newHashPassword, decodedToken.email]);
    // return result 
    return result.rows[0];
};


const AuthServices = {
    logInUser,
    createAnUser,
    getMyDataByToken,
    userPasswordResetService
}
module.exports = AuthServices;