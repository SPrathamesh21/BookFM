const Book = require('../models/AdminbookModel')
const User = require('../models/User')
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

// Add a book to favorites
exports.addFavoriteBook = async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    const user = await User.findById(userId);
   
    if (!user.favorites.includes(bookId)) {
      user.favorites.push(bookId);
      await user.save();
    }

    res.status(200).json({ success: true, message: 'Book added to favorites.' });
  } catch (error) {
    console.log('addFavoriteError: ', error)
    res.status(500).json({ success: false, message: 'Failed to add book to favorites.', error });
  }
};

// Remove a book from favorites
exports.removeFavoriteBook = async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    const user = await User.findById(userId);

    user.favorites = user.favorites.filter(favBookId => favBookId.toString() !== bookId);

    await user.save();

    res.status(200).json({ success: true, message: 'Book removed from favorites.' });
  } catch (error) {
    console.log('removeFavoriteError: ', error)
    res.status(500).json({ success: false, message: 'Failed to remove book from favorites.', error });
  }
};

// Get favorite books
exports.getFavoriteBooks = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('favorites');

    res.status(200).json({ success: true, favorites: user.favorites });
  } catch (error) {
    console.log('get favorites', error)
    res.status(500).json({ success: false, message: 'Failed to get favorite books.', error });
  }
};