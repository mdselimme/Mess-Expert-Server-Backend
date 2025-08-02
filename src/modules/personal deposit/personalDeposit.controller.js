const pool = require("../../config/db");

const PersonalDeposit = async (req, res) => {

    const userId = req.user.id;

    const { personal_depo_description, personal_depo_amount } = req.body;

    if (!personal_depo_description || !personal_depo_amount) {
        return res.status(400).json({
            success: false,
            message: "Description and amount are required"
        });
    }

    try {
        const result = await pool.query(
            "INSERT INTO personal_deposits (user_id, description, amount, deposit_date) VALUES ($1, $2, $3, NOW()) RETURNING *",
            [userId, personal_depo_description, personal_depo_amount]
        );

        return res.status(201).json({
            success: true,
            message: "Personal deposit added successfully",
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating personal deposit:', error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

module.exports = PersonalDeposit;