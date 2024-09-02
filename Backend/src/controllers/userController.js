const Book = require('../models/bookModel')

// Get all books
exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find(); 
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to get a specific book by ID
exports.getBookById = async (req, res) => {
    try {
      const bookId = req.params.bookId;
      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.json(book);
    } catch (error) {
      console.error('Error fetching book:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };