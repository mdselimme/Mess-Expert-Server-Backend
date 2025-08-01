const pool = require("../../config/db");

const MarketSchedule = async (req, res) => {
    const requesterId = req.user.id;

    // Assuming the messid , user role is passed in the request params

    //using params

    const { messId, userRole } = req.params;

    if (!messId || !userRole) {
        return res.status(400).json({
            success: false,
            message: "Mess ID and user role are required"
        });
    }

    if (userRole !== 'admin') {
        return res.status(403).json({
            success: false,
            message: "You do not have permission to access this resource"
        });
    }

    //checked requester is admin of the current mess


    // now getting the userid using the username from frontend of the user did the market
    const { userName } = req.body;

    if (!userName) {
        return res.status(400).json({
            success: false,
            message: "User name is required"
        });
    }

    try {
        const userResult = await pool.query("SELECT id FROM users WHERE username = $1", [userName]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const userId = userResult.rows[0].id;    //user id of the user who did the market

        const result = await pool.query("INSERT INTO market_schedule (mess_id, user_id, market_date) VALUES ($1, $2, NOW()) RETURNING *", [messId, userId]);

        if (result.rows.length === 0) {
            return res.status(500).json({
                success: false,
                message: "Failed to create market schedule"
            });
        }

        return res.status(201).json({
            success: true,
            message: "Market schedule created successfully",
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error creating market schedule:', error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });


    }

}

module.exports = MarketSchedule;