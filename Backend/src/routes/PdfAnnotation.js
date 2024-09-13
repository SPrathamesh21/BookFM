const express = require('express');
const router = express.Router();
const { saveAnnotations, getAnnotations } = require('../controllers/PdfAnnotation');

// Route to save annotations (both highlights and notes)
router.post('/pdf/annotations/:bookId', saveAnnotations);

// Route to get annotations by userId and bookId
router.get('/pdf/annotations/:userId/:bookId', getAnnotations);

module.exports = router;
