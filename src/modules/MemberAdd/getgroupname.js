const pool = require("../../config/db");

const getMessName = async (req, res) => {
    const { messId } = req.params;

    try {
        const result = await pool.query("SELECT name FROM mess WHERE mess_id = $1", [messId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Mess not found"
            });
        }

        const messName = result.rows[0].name;

        return res.status(200).json({
            success: true,
            message: "Successfully fetched mess name",
            data: {
                messId,
                messName
            }
        });
    } catch (error) {
        console.error("Error fetching mess name:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};



module.exports = getMessName;