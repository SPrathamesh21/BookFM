const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const Book = require('../models/BookModel');

const addBook = async (req, res) => {
  try {
    const { bookName, author, description, dateAdded } = req.body;
    const coverImages = req.body.coverImages; // Already Base64-encoded images

    if (!bookName || !author || !description || !dateAdded || !coverImages || !req.file) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Handle PDF file upload to GridFS
    const pdfFile = req.file;

    // Create new book document
    const newBook = new Book({
      bookName,
      author,
      description,
      dateAdded: new Date(dateAdded),
      coverImages,
    });

    // Save book to database
    await newBook.save();

    // Upload PDF to GridFS
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'pdfs',
    });

    const uploadStream = bucket.openUploadStream(pdfFile.originalname);
    uploadStream.end(pdfFile.buffer);

    // Wait for PDF upload to complete
    uploadStream.on('finish', async () => {
      newBook.PDFbase64 = uploadStream.id;
      await newBook.save(); // Update the book document with the PDF GridFS ID
      res.status(201).json({ message: 'Book added successfully', book: newBook });
    });

    uploadStream.on('error', (error) => {
      console.error('Error uploading PDF:', error);
      res.status(500).json({ error: 'An error occurred while uploading the PDF' });
    });

  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ error: 'An error occurred while adding the book' });
  }
};

module.exports = { addBook };
