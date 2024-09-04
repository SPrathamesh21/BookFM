const mongoose = require('mongoose');

const userLibrarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  dateAdded: {
    type: Date,
    default: Date.now
  }
});

const UserLibrary = mongoose.model('UserLibrary', userLibrarySchema);

module.exports = UserLibrary;
