const { Router } = require('express');
const router = Router();
const MealController = require('./meal.controller');

router.post('/', MealController.addMeal);
router.get('/', MealController.getMeals);


const MealRoute = router;

module.exports = MealRoute;
