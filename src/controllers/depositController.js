const pool = require("../config/db");

const Deposit = async (req, res) => {
    try {
        const requester_id = req.user.id;

        // Get member_id and role in one query (checking requester admin or not)
        const result3 = await pool.query("SELECT member_id, role FROM Members WHERE user_id = $1", [requester_id]);

        if (result3.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Requester is not a member!"
            });
        }

        const { member_id: requester_member_id, role: requester_role } = result3.rows[0];

        if (requester_role !== "admin") {
            return res.status(403).json({
                success: false,
                error: "Only admin can add deposits!"
            });
        }

        // Get mess_id
        const result5 = await pool.query("SELECT mess_id FROM MemberMess WHERE member_id = $1", [requester_member_id]);

        if (result5.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Mess not found for this member!"
            });
        }

        const mess_id = result5.rows[0].mess_id;

        const { username, amount, date, text } = req.body;

        if (!username || !date || isNaN(amount) || !text) {
            return res.status(400).json({
                success: false,
                error: "Invalid input: username, date, amount or note missing/invalid."
            });
        }

        // Get user_id from username
        const result1 = await pool.query("SELECT id FROM users WHERE username = $1", [username]);

        if (result1.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: "User not found!"
            });
        }

        const userId = result1.rows[0].id;

        // Get member_id for that user
        const result2 = await pool.query("SELECT member_id FROM Members WHERE user_id = $1", [userId]);

        if (result2.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Member not found!"
            });
        }

        const member_id = result2.rows[0].member_id;

        // Insert deposit
        const result = await pool.query(
            "INSERT INTO deposits (member_id, mess_id, amount, date, note) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [member_id, mess_id, amount, date, text]
        );

        if (result.rows.length === 0) {
            return res.status(500).json({
                success: false,
                error: "Failed to store deposit in database!"
            });
        }

        const data = result.rows[0];

        return res.status(200).json({
            success: true,
            message: "Successfully stored deposit!",
            data
        });

    } catch (error) {
        console.error("Deposit Error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
            details: error.message
        });
    }
};

module.exports = { Deposit };
