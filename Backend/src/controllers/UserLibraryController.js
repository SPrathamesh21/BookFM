const UserLibrary = require('../models/UserLibrary');
const Book = require('../models/AdminbookModel');

exports.addToLibrary = async (req, res) => {
  const { userId, bookId } = req.body;

  if (!userId || !bookId) {
    return res.status(400).json({ success: false, message: 'Invalid input data' });
  }
  
  try {
    // Check if the book is already in the user's library
    const existingEntry = await UserLibrary.findOne({ userId, bookId });

    if (existingEntry) {
      // Return a 200 status with a different message
      return res.status(200).json({ success: false, message: 'Book is already in your library' });
    }

    // Add the book to the user's library
    const newEntry = new UserLibrary({ userId, bookId });
    await newEntry.save();
    // Increment the book count
    await Book.findByIdAndUpdate(bookId, { $inc: { count: 1 } });
    res.status(201).json({ success: true, message: 'Book added to your library successfully' });
  } catch (error) {
    console.error('Error adding book to library:', error);
    res.status(500).json({ success: false, message: 'Failed to add book to library' });
  }
};

exports.getUserLibrary = async (req, res) => {
  const { userId } = req.params;

  try {
    const userLibraryEntries = await UserLibrary.find({ userId }).populate('bookId');
    const books = userLibraryEntries.map(entry => entry.bookId);

    res.status(200).json(books);
  } catch (error) {
    console.error('Error fetching user library:', error);
    res.status(500).json({ message: 'Failed to fetch user library' });
  }
};
