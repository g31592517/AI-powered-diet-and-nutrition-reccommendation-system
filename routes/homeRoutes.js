const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// Home page route
router.get('/', homeController.getHome);

// Contact form submission
router.post('/contact', homeController.submitContact);

// Newsletter subscription
router.post('/newsletter', homeController.subscribeNewsletter);

// Health check
router.get('/health', homeController.healthCheck);

module.exports = router;
