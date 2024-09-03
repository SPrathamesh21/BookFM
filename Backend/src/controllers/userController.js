const Book = require('../models/AdminbookModel')

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

  exports.getSearchedEbooks = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        // Find books where the bookName or author contains the query string
        const suggestions = await Book.find({
            $or: [
                { bookName: { $regex: query, $options: 'i' } },
                { author: { $regex: query, $options: 'i' } }
            ]
        }).select('bookName author _id');

        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};