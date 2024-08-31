const express = require('express');
const multer = require('multer');
const { addBook } = require('../controllers/bookController');
const router = express.Router();

// Set up storage for multer to handle PDF files
const multerMemoryStorage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: multerMemoryStorage });

// Route to handle book addition and PDF upload
router.post('/add', upload.single('pdfFile'), addBook);

module.exports = router;
