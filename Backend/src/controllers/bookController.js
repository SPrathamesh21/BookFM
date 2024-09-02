const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const Book = require('../models/BookModel');

const addBook = async (req, res) => {
  try {
    const { bookName, author, description, dateAdded, category } = req.body;
    const coverImages = req.body.coverImages; // Already Base64-encoded images
    const bookFile = req.file; // Handle EPUB file

    // Check for required fields
    if (!bookName || !author || !description || !dateAdded || !category || !coverImages || !bookFile) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate EPUB file
    if (bookFile.mimetype !== 'application/epub+zip') {
      return res.status(400).json({ error: 'Invalid file type. Please upload an EPUB file.' });
    }

    // Handle file upload to GridFS
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'epubs',
      chunkSizeBytes: 13 * 1024 * 1024
    });

    const uploadStream = bucket.openUploadStream(bookFile.originalname);
    uploadStream.end(bookFile.buffer);

    // Create new book document
    const newBook = new Book({
      bookName,
      author,
      description,
      category, // Added category
      dateAdded: new Date(dateAdded),
      coverImages,
      EPUBbase64: undefined // Ensure EPUBbase64 is updated later
    });

    // Save book to database
    await newBook.save();

    // Wait for file upload to complete
    uploadStream.on('finish', async () => {
      newBook.EPUBbase64 = uploadStream.id; // Update with the EPUB GridFS ID
      await newBook.save(); // Update the book document with the EPUB GridFS ID
      res.status(201).json({ message: 'Book added successfully', book: newBook });
    });

    uploadStream.on('error', (error) => {
      console.error('Error uploading EPUB file:', error);
      res.status(500).json({ error: 'An error occurred while uploading the EPUB file' });
    });

  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ error: 'An error occurred while adding the book' });
  }
};

module.exports = { addBook };
