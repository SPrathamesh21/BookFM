const express = require('express');
const multer = require('multer');
const { addBook, getAllBooks, updateEbook, getEbookById, searchBooks } = require('../controllers/AdminbookController');
const router = express.Router();

// Set up storage for multer to handle EPUB files
const multerMemoryStorage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: multerMemoryStorage });

// Route to handle book addition and file upload
router.post('/add', upload.single('bookFile'), addBook);

router.get('/get_edit_data',getAllBooks);

router.get('/get_ebook/:id',getEbookById);
// Route to update ebook
router.put('/update_ebook/:id', upload.single('ebookFile'), updateEbook);

router.get('/search', searchBooks);



module.exports = router;
