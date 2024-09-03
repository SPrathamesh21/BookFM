const express = require('express');
const router = express.Router();
const { getBookById, getBooks, getSearchedEbooks } = require('../controllers/userController');

// Route to get all books
router.get('/get-books', getBooks);

// Route to get a book by ID
router.get('/get-book/:bookId', getBookById);

router.get('/search-ebooks', getSearchedEbooks);

module.exports = router;
