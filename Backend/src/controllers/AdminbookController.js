const path = require('path');
const fs = require('fs')
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const Book = require('../models/AdminbookModel');

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
      EPUBbase64: { id: undefined, filename: undefined } // Ensure EPUBbase64 is updated later
    });

    // Wait for file upload to complete
    uploadStream.on('finish', async () => {
      newBook.EPUBbase64 = {
        id: uploadStream.id, // Assign the ObjectId
        filename: bookFile.originalname // Assign the filename
      };
      await newBook.save(); // Save the book document with EPUBbase64 field updated
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


const getAllBooks = async (req, res) => {
  const { offset = 0, limit = 10 } = req.query;
  try {
    const limitNumber = parseInt(limit, 10);
    const offsetNumber = parseInt(offset, 10);

    // Validate limit and offset
    if (isNaN(limitNumber) || isNaN(offsetNumber) || limitNumber <= 0 || offsetNumber < 0) {
      return res.status(400).json({ error: "Offset must be a non-negative integer and limit must be a positive integer." });
    }

    // Fetch the book list with pagination
    const bookList = await Book.find()
      .sort({ _id: 1 }) // Ensure consistent order
      .skip(offsetNumber)
      .limit(limitNumber);

    // Get the total count of documents in the collection
    const totalCount = await Book.countDocuments();
    const hasMore = (offsetNumber + limitNumber) < totalCount;

    res.status(200).json({
      bookList,
      hasMore
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: "An error occurred while fetching book data." });
  }
};

// Get ebook by ID
const getEbookById = async (req, res) => {
  try {
    const ebook = await Book.findById(req.params.id);
    if (!ebook) return res.status(404).json({ message: 'Ebook not found' });
    res.json(ebook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const updateEbook = async (req, res) => {
  try {
    const { title, author, description, category } = req.body;
    const coverImages = req.body.coverImages; // Handle Base64-encoded images
    const ebookFile = req.file; // Handle EPUB file

    // Validate required fields
    if (!title || !author || !description || !category || !coverImages) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Convert coverImages to an array if it's a single image or not in the correct format
    let parsedCoverImages;
    try {
      parsedCoverImages = JSON.parse(coverImages);
    } catch (error) {
      // If parsing fails, assume it's already an array
      parsedCoverImages = Array.isArray(coverImages) ? coverImages : [coverImages];
    }

    // Find the book by ID
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Handle EPUB file upload to GridFS if a new file is provided
    let epubFileId = book.EPUBbase64 ? book.EPUBbase64.id : undefined;
    if (ebookFile) {
      if (ebookFile.mimetype !== 'application/epub+zip') {
        return res.status(400).json({ error: 'Invalid file type. Please upload an EPUB file.' });
      }

      const bucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'epubs',
        chunkSizeBytes: 13 * 1024 * 1024,
      });

      const uploadStream = bucket.openUploadStream(ebookFile.originalname);
      uploadStream.end(ebookFile.buffer);

      uploadStream.on('finish', async () => {
        epubFileId = uploadStream.id; // Get the ID of the uploaded EPUB file

        // Update book details
        book.bookName = title;
        book.author = author;
        book.description = description;
        book.category = category;
        book.coverImages = parsedCoverImages; // Replace cover images

        // Update EPUB file if a new one was uploaded
        if (epubFileId) {
          book.EPUBbase64 = {
            id: epubFileId,
            filename: ebookFile.originalname,
          };
        }

        await book.save(); // Save the updated book document
        res.status(200).json({ message: 'Book updated successfully', book });
      });

      uploadStream.on('error', (error) => {
        console.error('Error uploading EPUB file:', error);
        res.status(500).json({ error: 'An error occurred while uploading the EPUB file' });
      });
    } else {
      // If no new EPUB file is uploaded, just update other book details
      book.bookName = title;
      book.author = author;
      book.description = description;
      book.category = category;
      book.coverImages = parsedCoverImages; // Replace cover images

      await book.save(); // Save the updated book document
      res.status(200).json({ message: 'Book updated successfully', book });
    }

  } catch (error) {
    console.error('Error updating ebook:', error);
    res.status(500).json({ error: 'An error occurred while updating the book' });
  }
};


module.exports = { addBook, getAllBooks, updateEbook, getEbookById};
