const pool = require("../../config/db");


const ExpensesAdd = async (req, res) => {
    try {
        const requesterId = req.user.id;
        //checking admin or not

        const result1 = await pool.query(
            "SELECT member_id, role FROM Members WHERE user_id = $1",
            [requesterId]
        );

        if (result1.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Requester not a member"
            });
        }

        const data = result1.rows[0];
        const requesterMemberId = data.member_id;

        if (!requesterMemberId) {
            return res.status(403).json({  // ⬅️ was 401
                success: false,
                error: error.message || "requester not found"
            });
        }

        if (data.role !== "admin") {
            return res.status(403).json({  // ⬅️ was 401
                success: false,
                error: "requester not admin"
            });
        }

        //inserting data into database
        const { username, amount, description, category } = req.body;
        let { date, is_settled } = req.body;

        if (!date) {
            date = new Date();
        }

        if (typeof is_settled !== "boolean") {
            is_settled = false;
        }

        if (isNaN(amount) || !amount || !username || !description || !category) {
            return res.status(400).json({
                success: false,
                error: "invalid input"
            });
        }

        // getting userId
        const result2 = await pool.query("SELECT id FROM users WHERE username = $1", [username]);

        if (result2.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: "User Id not found"
            });
        }

        const expensorId = result2.rows[0].id;

        //getting memberId and messId
        const result3 = await pool.query("SELECT member_id FROM Members WHERE user_id = $1", [expensorId]);

        if (result3.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Member Id of the expensor not found"
            });
        }

        const expensorMemberId = result3.rows[0].member_id;

        //getting mess id of the expensor
        const result5 = await pool.query("SELECT mess_id FROM MemberMess WHERE member_id = $1", [expensorMemberId]);

        if (result5.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Mess Id of the expensor not found"
            });
        }

        const expensorMessId = result5.rows[0].mess_id;

        //getting requester messId and validating this is the same mess
        const result7 = await pool.query("SELECT mess_id FROM MemberMess WHERE member_id = $1", [requesterMemberId]);

        if (result7.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Mess Id of requester not found"
            });
        }

        const requesterMessId = result7.rows[0].mess_id;

        if (requesterMessId !== expensorMessId) {
            return res.status(403).json({  // ⬅️ was 400
                success: false,
                error: "Requester and Expensor not in the same Mess"
            });
        }

        //inserting all data
        const result6 = await pool.query(
            "INSERT INTO Expenses (mess_id, member_id, category, amount , date, description, is_settled) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [expensorMessId, expensorMemberId, category, amount, date, description, is_settled]
        );

        if (result6.rows.length === 0) {
            return res.status(500).json({  // ⬅️ was 404
                success: false,
                error: "Cant insert expense data in Db"
            });
        }

        return res.status(201).json({  // ⬅️ was 200
            success: true,
            data: result6.rows[0]
        });

    } catch (error) {
        console.error("Database error:", error);

        return res.status(500).json({
            success: false,
            error: "Internal server error",
            details: error.message
        });
    }
};


const ExpenseController = { ExpensesAdd };

module.exports = ExpenseController;
