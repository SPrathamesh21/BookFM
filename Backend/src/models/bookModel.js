const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  bookName: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // Added category field
  dateAdded: { type: Date, required: true },
  coverImages: [String], // Array of Base64-encoded image strings
  EPUBbase64: { type: mongoose.Schema.Types.ObjectId, ref: 'epubs' } // GridFS ObjectId reference for EPUB
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
