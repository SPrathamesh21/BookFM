const express = require('express');
const multer = require('multer');
const { addBook } = require('../controllers/bookController');
const router = express.Router();

// Set up storage for multer to handle EPUB files
const multerMemoryStorage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: multerMemoryStorage });

// Route to handle book addition and file upload
router.post('/add', upload.single('bookFile'), addBook);

module.exports = router;
