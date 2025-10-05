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

// Community hub page
router.get('/community', (req, res) => {
    res.render('community');
});

module.exports = router;
