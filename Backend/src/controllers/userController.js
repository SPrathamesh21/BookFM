const Book = require('../models/AdminbookModel')
const User = require('../models/User')
const Notification = require('../models/AdminNotification');
const UserLibrary = require('../models/UserLibrary');
const mongoose = require('mongoose');
const { GridFSBucket, ObjectId } = require('mongodb');

// Initialize GridFS once connection is open
let gfsBucket;

mongoose.connection.once('open', () => {
  gfsBucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'epubs' // Ensure it matches the name used for uploading files
  });
});


// Get all books
exports.getBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * parseInt(limit);
    const books = await Book.find()
      .skip(skip)
      .limit(parseInt(limit));
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getBooksByCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * parseInt(limit);

    // Group books by category and only include categories with 5 or more books
    const categoriesWithBooks = await Book.aggregate([
      {
        $group: {
          _id: "$category",  // Group by category field
          books: { $push: "$$ROOT" },  // Collect all books in each category
          count: { $sum: 1 }  // Count the number of books in each category
        }
      },
      {
        $match: {
          count: { $gte: 5 }  // Only include categories with 5 or more books
        }
      },
      {
        $limit: 2  // Limit the number of categories to 2
      },
      {
        $project: {
          _id: 1,
          books: { $slice: ["$books", skip, parseInt(limit)] },  // Pagination for books within categories
          count: 1
        }
      }
    ]);

    res.status(200).json(categoriesWithBooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecommededBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * parseInt(limit);

    // Filter for recommended books
    const books = await Book.find({ recommendedByCabin: 'Yes' })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMostReadBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * parseInt(limit);

    // Filter for books with count greater than or equal to 3 and sort by count in descending order
    const books = await Book.find({ count: { $gte: 1 } })
      .sort({ count: -1 })  // Sort in descending order based on count
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to get a specific book by ID
exports.getBookById = async (req, res) => {
  try {
    const bookId = req.params.bookId;
    console.log('bookId', bookId)
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
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * parseInt(limit);
    const user = await User.findById(userId)
                                    .skip(skip)
                                    .limit(parseInt(limit))
                                    .populate('favorites')
    res.status(200).json({ success: true, favorites: user.favorites });
  } catch (error) {
    console.log('get favorites', error)
    res.status(500).json({ success: false, message: 'Failed to get favorite books.', error });
  }
};


exports.getFilteredFavoriteBooks = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * parseInt(limit);
    const users = await User.findById(userId)
    console.log('users', users)
    // Fetch the user and populate their favorites
    const user = await User.findById(userId).populate({
      path: 'favorites',
      options: {
        skip: skip,
        limit: parseInt(limit),
      }
    });
    console.log('userIDD', user)
    if (!user || !user.favorites) {
      console.log('sdfklsjdf')
      return res.status(404).json({ success: false, message: 'User or favorites not found.' });
    }

    // Fetch all books to count categories
    const allBooks = await Book.find();

    // Count books in each category
    const categoryCounts = {};
    allBooks.forEach(book => {
      const categories = Array.isArray(book.category) ? book.category : [book.category];
      categories.forEach(cat => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    });

    // Filter favorite books that are in the user library
    const userLibrary = await UserLibrary.find({ userId }).populate('bookId');
    const libraryBookIds = userLibrary.map(entry => entry.bookId._id.toString());

    const filteredFavoriteBooks = user.favorites.filter(book =>
      libraryBookIds.includes(book._id.toString())
    );

    // Only include books from categories with at least 5 books in the books model
    const filteredBooksByCategory = filteredFavoriteBooks.filter(book => {
      const categories = Array.isArray(book.category) ? book.category : [book.category];
      return categories.some(cat => categoryCounts[cat] >= 5);
    });

    // Ensure there are at least 2 different categories in favorites
    const categoriesInFavorites = new Set(
      filteredBooksByCategory.flatMap(book => {
        const categories = Array.isArray(book.category) ? book.category : [book.category];
        return categories;
      })
    );

    if (categoriesInFavorites.size >= 2) {
      res.status(200).json({ success: true, favorites: filteredBooksByCategory });
    } else {
      res.status(200).json({ success: true, favorites: [] });
    }

  } catch (error) {
    console.error('Error fetching favorite books:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch favorite books.', error });
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

exports.ThirdCategory = async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const skip = (page - 1) * parseInt(limit);

    // Find books based on query
    const books = await Book.find({category: category})
                            .skip(skip)
                            .limit(parseInt(limit));

    res.status(200).json(books);
  } catch (error) {
    
    res.status(500).json({ message: error.message });
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

// Endpoint to fetch the EPUB file
exports.getEpubFile = async (req, res) => {
  try {
    const fileId = req.params.id; // Get the fileId from the request params
    const objectId = new ObjectId(fileId); // Convert fileId to an ObjectId

    // Find the file metadata in the epubs.files collection
    const file = await mongoose.connection.db.collection('epubs.files').findOne({ _id: objectId });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    // console.log('file: ', file)
    // Create a read stream to download the binary data from GridFS
    const readStream = gfsBucket.openDownloadStream(objectId);

    // Set headers to tell the browser that the file is an EPUB
    res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
    res.setHeader('Content-Type', 'application/epub+zip'); // MIME type for EPUB files

    // Pipe the binary data to the response
    readStream.pipe(res);
    // readStream.on('data', (chunk) => {
    //   console.log('Chunk received:', chunk);  // Each chunk of the binary file
    // });

    // Handle streaming errors
    readStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      res.status(500).json({ message: 'Error streaming file' });
    });

  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


