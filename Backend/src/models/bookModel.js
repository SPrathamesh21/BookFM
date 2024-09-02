const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  bookName: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  dateAdded: { type: Date, required: true },
  coverImages: [String],
  EPUBbase64: { type: mongoose.Schema.Types.ObjectId, ref: 'epubs' }
});

const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);

module.exports = Book;
