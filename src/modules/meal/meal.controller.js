const pool = require("../../config/db");


// Add Meal
const addMeal = async (req, res) => {
  try {
    const { meal_number, member_id, mess_id } = req.body;

    if (!meal_number || !member_id || !mess_id) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Current date only (server time)
    const today = new Date().toISOString().split("T")[0];

    const result = await pool.query(
      `INSERT INTO Meals (date, meal_number, member_id, mess_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (date, member_id, mess_id) 
       DO UPDATE SET 
         meal_number = EXCLUDED.meal_number
       RETURNING xmax = 0 AS inserted`,
      [today, meal_number, member_id, mess_id]
    );
    const wasInserted = result.rows[0].inserted;
    res.status(201).json({ message: wasInserted ? "Meal added successfully" : "Meal updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};


// Get Meals (filter support)
const getMeals = async (req, res) => {
  try {
    const { mess_id, year, month } = req.query;

    if (!mess_id || !year || !month) {
      return res.status(400).json({ message: "mess_id, year, and month are required" });
    }

    const result = await pool.query(
      `
      SELECT m.date,
             json_agg(
                 json_build_object(
                     'member_id', mem.member_id,
                     'member_name', mem.name,
                     'meal_number', m.meal_number
                 ) ORDER BY mem.name
             ) AS meals
      FROM Meals m
      JOIN Members mem ON m.member_id = mem.member_id
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
    console.error("GetMeals Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const MealController = { addMeal, getMeals }

module.exports = MealController;
