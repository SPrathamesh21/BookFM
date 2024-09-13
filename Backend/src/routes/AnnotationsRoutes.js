const express = require('express');
const router = express.Router();
const { saveAnnotations, getAnnotations } = require('../controllers/Annotations');

// Create or update highlights and notes
router.post('/annotations/:bookId', saveAnnotations);

// Get highlights and notes for a specific book
router.get('/annotations/:userId/:bookId', getAnnotations);

module.exports = router;
