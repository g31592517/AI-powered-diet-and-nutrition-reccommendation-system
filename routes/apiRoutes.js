const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

// API test endpoint
router.get('/test', apiController.test);

// Nutrition data endpoints
router.get('/nutrition', apiController.getNutritionData);

// Recipe endpoints
router.get('/recipes', apiController.getRecipes);

// Specialist endpoints
router.get('/specialists', apiController.getSpecialists);

// Chat endpoints handled directly in app.js for minimal setup

module.exports = router;
