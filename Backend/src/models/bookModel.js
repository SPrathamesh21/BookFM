const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  bookName: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String, required: true },
  dateAdded: { type: Date, required: true },
  coverImages: [String], // Array of Base64-encoded image strings
  PDFbase64: { type: mongoose.Schema.Types.ObjectId, ref: 'pdfs' }, // GridFS ObjectId reference
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
