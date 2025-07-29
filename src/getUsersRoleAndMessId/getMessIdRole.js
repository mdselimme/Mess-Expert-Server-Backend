const pool = require("../config/db");

const GetMessId = async (req, res) => {
    const userId = req.user.id; // From authenticateToken middleware

    try {
        const query = `
            SELECT 
                MM.mess_id,
                M.role
            FROM Members M
            JOIN MemberMess MM ON M.member_id = MM.member_id
            WHERE M.user_id = $1
            LIMIT 1;
        `;

        const result = await pool.query(query, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No mess or role found for this user." });
        }

        const { mess_id, role } = result.rows[0];

        return res.status(200).json({
            messId: mess_id,
            role: role
        });
    } catch (error) {
        console.error("Error getting mess ID and role:", error.message);
        return res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = GetMessId;
