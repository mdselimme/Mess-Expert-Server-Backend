const pool = require("../../config/db");


// Add Meal
const addMeal = async (req, res) => {
    try {
        const { member_id, mess_id, date, meal_type } = req.body;

        if (!member_id || !mess_id || !date || !meal_type) {
            return res.status(400).json({ message: "All fields are required" });
        }

        await pool.query(
            `INSERT INTO Meals (member_id, mess_id, date, meal_type)
       VALUES ($1, $2, $3, $4)`,
            [member_id, mess_id, date, meal_type]
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
        const { mess_id, member_id, date } = req.query;

        let baseQuery = `SELECT * FROM Meals WHERE 1=1`;
        let values = [];
        let count = 1;

        if (mess_id) {
            baseQuery += ` AND mess_id = $${count++}`;
            values.push(mess_id);
        }
        if (member_id) {
            baseQuery += ` AND member_id = $${count++}`;
            values.push(member_id);
        }
        if (date) {
            baseQuery += ` AND date = $${count++}`;
            values.push(date);
        }

        const result = await pool.query(baseQuery, values);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error" });
    }
};

const MealController = { addMeal, getMeals }

module.exports = MealController;
