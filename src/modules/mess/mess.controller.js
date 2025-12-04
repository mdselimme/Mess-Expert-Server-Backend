const pool = require("../../config/db");



// Create mess and assign user as admin
const createMess = async (req, res) => {
    const { name, location } = req.body;
    const userId = req.user.id;

    try {
        await pool.query('BEGIN');

        // Get or create member for this user
        let memberResult = await pool.query(
            'SELECT member_id, role FROM Members WHERE user_id = $1',
            [userId]
        );

        let memberId;
        if (memberResult.rows.length === 0) {
            const userResult = await pool.query('SELECT username, email FROM users WHERE id = $1', [userId]);
            const user = userResult.rows[0];
            const newMember = await pool.query(
                `INSERT INTO Members (name, phone_number, email, role, joining_date, user_id)
         VALUES ($1, 'your phone number', $2, 'admin', CURRENT_DATE, $3) RETURNING member_id`,
                [user.username, user.email, userId]
            );
            memberId = newMember.rows[0].member_id;
        } else {
            // Update existing member to admin role
            await pool.query(
                'UPDATE Members SET role = $1 WHERE member_id = $2',
                ['admin', memberResult.rows[0].member_id]
            );
            memberId = memberResult.rows[0].member_id;
        }

        // Create the mess
        const mess = await pool.query(
            `INSERT INTO Mess (name, location, admin_id)
       VALUES ($1, $2, $3)
       RETURNING mess_id`,
            [name, location, memberId]
        );

        // Add admin to MemberMess
        await pool.query(
            `INSERT INTO MemberMess (member_id, mess_id) VALUES ($1, $2)`,
            [memberId, mess.rows[0].mess_id]
        );

        await pool.query('COMMIT');
        res.status(201).json({
            message: 'Mess created successfully',
            messId: mess.rows[0].mess_id,
            adminId: memberId
        });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to create mess' });
    }
};

const addMemberToMess = async (req, res) => {
    const { messId } = req.params;
    const { email } = req.body;
    const adminUserId = req.user.id;

    if (!email) {
        return res.status(400).json({ error: 'Email is required to add a member' });
    }

    try {
        await pool.query('BEGIN');

        // Check if requester is admin
        const adminCheck = await pool.query(
            `SELECT m.admin_id, mem.member_id
       FROM Mess m
       JOIN Members mem ON mem.user_id = $1
       WHERE m.mess_id = $2`,
            [adminUserId, messId]
        );

        if (adminCheck.rows.length === 0 || adminCheck.rows[0].admin_id !== adminCheck.rows[0].member_id) {
            return res.status(403).json({ error: 'Only mess admin can add members' });
        }

        // Check if user exists
        const userCheck = await pool.query(
            'SELECT id, username, email FROM users WHERE email = $1',
            [email]
        );

        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'User not found. Please ensure the user is registered first.' });
        }

        const user = userCheck.rows[0];
        let memberId;

        // Check if user is already a member
        const existingMember = await pool.query(
            'SELECT member_id FROM Members WHERE user_id = $1',
            [user.id]
        );

        if (existingMember.rows.length > 0) {
            memberId = existingMember.rows[0].member_id;
        } else {
            // Create new member record for the user
            const newMember = await pool.query(
                `INSERT INTO Members (name, phone_number, email, joining_date, user_id)
         VALUES ($1, 'phone-number', $2, CURRENT_DATE, $3) RETURNING member_id`,
                [user.username, user.email, user.id]
            );
            memberId = newMember.rows[0].member_id;
        }

        // Check if member is already in this mess
        const existingMessMember = await pool.query(
            'SELECT * FROM MemberMess WHERE member_id = $1 AND mess_id = $2',
            [memberId, messId]
        );

        if (existingMessMember.rows.length > 0) {
            await pool.query('ROLLBACK');
            return res.status(400).json({ error: 'Member is already in this mess' });
        }

        // Add to MemberMess
        await pool.query(
            `INSERT INTO MemberMess (member_id, mess_id) VALUES ($1, $2)`,
            [memberId, messId]
        );

        await pool.query('COMMIT');
        res.status(201).json({
            message: 'Member added successfully',
            memberId,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to add member' });
    }
};

// Get mess members
const getMessMembers = async (req, res) => {
    const { messId } = req.params;
    const userId = req.user.id;

    try {
        // Check if user is a member of this mess
        const memberCheck = await pool.query(
            `SELECT m.member_id, m.role
             FROM Members m
             JOIN MemberMess mm ON m.member_id = mm.member_id
             WHERE m.user_id = $1 AND mm.mess_id = $2`,
            [userId, messId]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Not a member of this mess' });
        }

        const members = await pool.query(
            `SELECT m.member_id, m.name, m.email, m.phone_number, m.role, m.joining_date
             FROM Members m
             JOIN MemberMess mm ON m.member_id = mm.member_id
             WHERE mm.mess_id = $1
             ORDER BY m.role DESC, m.joining_date ASC`,
            [messId]
        );

        res.json({
            members: members.rows,
            total_members: members.rows.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to get mess members' });
    }
};

function getMonthDateRange(month) {
    const [year, mon] = month.split('-');
    const start = `${year}-${mon}-01`;
    const end = new Date(year, parseInt(mon), 0); // last day of month
    return { start, end: end.toISOString().slice(0, 10) };
}

const findValue = async (messId, start, end) => {
    const totalMeal = await pool.query(
        `SELECT COUNT(*) AS total 
             FROM Meals 
             WHERE mess_id=$1 AND date BETWEEN $2 AND $3`,
        [messId, start, end]
    );

    const totalMealCost = await pool.query(
        `SELECT COALESCE(SUM(amount),0) AS total
             FROM Expenses 
             WHERE mess_id=$1 AND date BETWEEN $2 AND $3 AND category='mess'`,
        [messId, start, end]
    );

    const mealRate = totalMeal.rows[0].total > 0 ? (parseFloat(totalMealCost.rows[0].total) / parseFloat(totalMeal.rows[0].total)).toFixed(2) : '0.00';
    return { totalMeal, totalMealCost, mealRate };
}

const getMessSummary = async (req, res) => {
    const { messId } = req.params;
    const { month } = req.query;
    if (!month) return res.status(400).json({ error: 'month is required (YYYY-MM)' });
    const { start, end } = getMonthDateRange(month);
    try {
        const totalDeposit = await pool.query(
            `SELECT COALESCE(SUM(amount),0) AS total 
             FROM Deposits 
             WHERE mess_id=$1 AND date BETWEEN $2 AND $3`,
            [messId, start, end]
        );

        const { totalMeal, totalMealCost, mealRate } = await findValue(messId, start, end);

        const messBalance = (parseFloat(totalDeposit.rows[0].total) - parseFloat(totalMealCost.rows[0].total)).toFixed(2);

        // Other costs
        const indivOtherQ = await pool.query(
            `SELECT COALESCE(SUM(amount),0) AS total 
             FROM Expenses 
             WHERE mess_id=$1 AND date BETWEEN $2 AND $3 AND category='individual'`,
            [messId, start, end]
        );
        const sharedOtherQ = await pool.query(
            `SELECT COALESCE(SUM(amount),0) AS total 
             FROM Expenses 
             WHERE mess_id=$1 AND date BETWEEN $2 AND $3 AND category='shared'`,
            [messId, start, end]
        );
        res.json({
            messBalance,
            totalDeposit: parseFloat(totalDeposit.rows[0].total),
            messTotalMeal: parseFloat(totalMeal.rows[0].total),
            messTotalMealCost: parseFloat(totalMealCost.rows[0].total),
            messMealRate: parseFloat(mealRate),
            totalIndividualOtherCost: parseFloat(indivOtherQ.rows[0].total),
            totalSharedOtherCost: parseFloat(sharedOtherQ.rows[0].total)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to get mess summary' });
    }
};

const getAllMemberSummary = async (req, res) => {
    const { messId } = req.params;
    const { month } = req.query;
    if (!month) return res.status(400).json({ error: 'month is required (YYYY-MM)' });
    const { start, end } = getMonthDateRange(month);
    try {
        const members = await pool.query(
            `SELECT m.member_id, m.name 
             FROM Members m
             JOIN MemberMess mm ON m.member_id = mm.member_id
             WHERE mm.mess_id = $1`, [messId]
        );
        const results = [];
        for (const member of members.rows) {
            const [tMeal, tDeposit, tIndiv, tShared] = await Promise.all([
                pool.query(`SELECT COUNT(*) AS total 
                            FROM Meals 
                            WHERE member_id=$1 AND mess_id=$2 AND date BETWEEN $3 AND $4`,
                    [member.member_id, messId, start, end]),
                pool.query(`SELECT COALESCE(SUM(amount),0) AS total 
                            FROM Deposits 
                            WHERE member_id=$1 AND mess_id=$2 AND date BETWEEN $3 AND $4`,
                    [member.member_id, messId, start, end]),
                pool.query(`SELECT COALESCE(SUM(amount),0) AS total 
                            FROM Expenses 
                            WHERE member_id=$1 AND mess_id=$2 AND date BETWEEN $3 AND $4 AND category='individual'`,
                    [member.member_id, messId, start, end]),
                pool.query(`SELECT COALESCE(SUM(amount),0) AS total 
                            FROM Expenses 
                            WHERE member_id=$1 AND mess_id=$2 AND date BETWEEN $3 AND $4 AND category='shared'`,
                    [member.member_id, messId, start, end]),
            ]);

            const { totalMeal, totalMealCost, mealRate } = await findValue(messId, start, end);

            const meal = parseFloat(tMeal.rows[0].total);
            const deposit = parseFloat(tDeposit.rows[0].total);
            const indivOther = parseFloat(tIndiv.rows[0].total);
            const sharedOther = parseFloat(tShared.rows[0].total);
            const mealCost = meal > 0 ? meal * mealRate : '0.00';
            const totalCost = mealCost + indivOther + sharedOther;
            const balance = deposit - totalCost;
            results.push({
                name: member.name,
                totalMeal: meal,
                mealCost,
                sharedOtherCost: sharedOther,
                individualOtherCost: indivOther,
                totalCost,
                deposit,
                balance
            });
        }
        res.json({ members: results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to get all member summary' });
    }
};

const getPersonalSummary = async (req, res) => {
    const { messId } = req.params;
    const { month } = req.query;
    const userId = req.user.id;
    if (!month) return res.status(400).json({ error: 'month is required (YYYY-MM)' });
    const { start, end } = getMonthDateRange(month);
    try {
        const member = await pool.query(
            `SELECT m.member_id, m.name
             FROM Members m
             JOIN MemberMess mm ON m.member_id = mm.member_id
             WHERE m.user_id = $1 AND mm.mess_id = $2`, [userId, messId]
        );

        if (member.rows.length === 0) return res.status(403).json({ error: 'Not a member of this mess' });
        const member_id = member.rows[0].member_id;

        const [tMeal, tDeposit, tIndiv, tShared] = await Promise.all([
            pool.query(`SELECT COUNT(*) AS total 
                            FROM Meals 
                            WHERE member_id=$1 AND mess_id=$2 AND date BETWEEN $3 AND $4`,
                [member_id, messId, start, end]),
            pool.query(`SELECT COALESCE(SUM(amount),0) AS total 
                            FROM Deposits 
                            WHERE member_id=$1 AND mess_id=$2 AND date BETWEEN $3 AND $4`,
                [member_id, messId, start, end]),
            pool.query(`SELECT COALESCE(SUM(amount),0) AS total 
                            FROM Expenses 
                            WHERE member_id=$1 AND mess_id=$2 AND date BETWEEN $3 AND $4 AND category='individual'`,
                [member_id, messId, start, end]),
            pool.query(`SELECT COALESCE(SUM(amount),0) AS total 
                            FROM Expenses 
                            WHERE member_id=$1 AND mess_id=$2 AND date BETWEEN $3 AND $4 AND category='shared'`,
                [member_id, messId, start, end]),
        ]);

        const { totalMeal, totalMealCost, mealRate } = await findValue(messId, start, end);

        const meal = parseFloat(tMeal.rows[0].total);
        const deposit = parseFloat(tDeposit.rows[0].total);
        const indivOther = parseFloat(tIndiv.rows[0].total);
        const sharedOther = parseFloat(tShared.rows[0].total);
        const mealCost = meal > 0 ? meal * mealRate : '0.00';
        const totalCost = mealCost + indivOther + sharedOther;
        const balance = deposit - totalCost;
        res.json({
            name: member.name,
            totalMeal: meal,
            mealCost,
            sharedOtherCost: sharedOther,
            individualOtherCost: indivOther,
            totalCost,
            deposit,
            balance
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to get personal summary' });
    }
};


const MessController = {
    createMess,
    addMemberToMess,
    getMessMembers,
    getMessSummary,
    getAllMemberSummary,
    getPersonalSummary
};

module.exports = MessController;