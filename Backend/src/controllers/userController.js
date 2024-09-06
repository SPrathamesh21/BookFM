const Book = require('../models/AdminbookModel')
const User = require('../models/User')
const Notification = require('../models/AdminNotification'); 

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

// Controller to get notification data
exports.getNotifications = async (req, res) => {
  try {
    // Find notifications associated with the user
    const notifications = await Notification.find({}).sort({ dateAdded: -1 });
    
    const userNotifications = notifications.map(notification => {
      // Find the user's read status
      const readStatus = notification.readStatus.find(status => status.userId.toString() === req.user.userId.toString());
      return {
        ...notification.toObject(),
        read: readStatus ? readStatus.read : false
      };
    });

    const unreadCount = userNotifications.filter(notification => !notification.read).length;
    
    res.status(200).json({ notifications: userNotifications, unreadCount });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Controller to update the read status of a notification
// controllers/notificationController.js

exports.updateNotification = async (req, res) => {
  const { id } = req.params;  // Notification ID
  const { read } = req.body;  // Read status
  const userId = req.user.userId;  // Authenticated user ID

  if (!id || typeof read !== 'boolean') {
    return res.status(400).json({ success: false, message: 'Invalid data' });
  }

  try {
    // Step 1: Check if the user has an existing entry in the readStatus array
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Check if the readStatus already exists for this user
    const existingReadStatus = notification.readStatus.find(status => status.userId.equals(userId));

    if (existingReadStatus) {
      // If the readStatus exists, update it
      existingReadStatus.read = read;
    } else {
      // If it doesn't exist, add a new entry to the readStatus array
      notification.readStatus.push({ userId, read });
    }

    // Save the updated notification
    const updatedNotification = await notification.save();

    // Step 2: Update the user's notification read status
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, 'notifications.notificationId': id },  // Find the user with the notification
      { $set: { 'notifications.$.read': read } },  // Update the read status of the specific notification
      { new: true }  // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User notification not found' });
    }

    res.json({
      success: true,
      message: 'Notification status updated successfully',
      data: { notification: updatedNotification, user: updatedUser }
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


