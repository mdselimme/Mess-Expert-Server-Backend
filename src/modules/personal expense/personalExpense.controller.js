const pool = require('../../config/db');

const PersonalExpense = async (req, res) => {
    const userId = req.user.id;

    const { personal_expense_description, personal_expense_amount } = req.body;

    if (!personal_expense_description || !personal_expense_amount) {
        return res.status(400).json({
            success: false,
            message: "Description and amount are required"
        });
    }

    try {
        const result = await pool.query(
            "INSERT INTO personal_expenses (user_id, description, amount, expense_date) VALUES ($1, $2, $3, NOW()) RETURNING *",
            [userId, personal_expense_description, personal_expense_amount]
        );

        return res.status(201).json({
            success: true,
            message: "Personal expense added successfully",
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating personal expense:', error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

module.exports = PersonalExpense;