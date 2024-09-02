const express = require('express');
const router = express.Router();
const { getBookById, getBooks } = require('../controllers/userController');

// Route to get all books
router.get('/get-books', getBooks);

// Route to get a book by ID
router.get('/get-book/:bookId', getBookById);

module.exports = router;
