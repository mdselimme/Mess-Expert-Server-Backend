const pool = require("../../config/db");


// Add Meal
const addMeal = async (req, res) => {
    try {
        const { date, meal_number, member_id, mess_id } = req.body;

        if (!date || !meal_number || !member_id || !mess_id) {
            return res.status(400).json({ message: "All fields are required" });
        }

        await pool.query(
            `INSERT INTO Meals (date, meal_number, member_id, mess_id)
             VALUES ($1, $2, $3, $4)`,
            [date, meal_number, member_id, mess_id]
        );

        res.status(201).json({ message: 'Meal added successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error" });
    }
};

// Get Meals (filter support)
const getMeals = async (req, res) => {
    try {
        const { mess_id, date } = req.query;

        if (!mess_id || !date) {
            return res.status(400).json({ message: "mess_id and date are required" });
        }

        const year = new Date(date).getFullYear();
        const month = new Date(date).getMonth() + 1;

        const result = await pool.query(
            `
            SELECT m.date,
                   json_agg(
                       json_build_object(
                           'member_id', mem.id,
                           'member_name', mem.name,
                           'meal_number', m.meal_number
                       ) ORDER BY mem.name
                   ) AS meals
            FROM Meals m
            JOIN Members mem ON m.member_id = mem.id
            WHERE m.mess_id = $1
              AND EXTRACT(YEAR FROM m.date) = $2
              AND EXTRACT(MONTH FROM m.date) = $3
            GROUP BY m.date
            ORDER BY m.date
            `,
            [mess_id, year, month]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error" });
    }
};

const MealController = { addMeal, getMeals }

module.exports = MealController;
