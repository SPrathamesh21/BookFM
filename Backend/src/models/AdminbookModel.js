const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  bookName: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  dateAdded: { type: String, required: true },
  recommendedByCabin:{type: String, required:true},
  coverImages: [String], // Array of Base64-encoded image strings
  recommendedByCabin:{type:String,required: true},
  EPUBbase64: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'epubs', required: true }, 
    filename: { type: String, required: true } 
  },
  count: { type: Number, default: 0 } 
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
