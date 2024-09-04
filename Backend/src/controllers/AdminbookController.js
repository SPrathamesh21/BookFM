const path = require('path');
const fs = require('fs')
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const Book = require('../models/AdminbookModel');
const moment = require('moment-timezone');
const Notification =require('../models/AdminNotification')

//add books 
const addBook = async (req, res) => {
  try {
    const { bookName, author, description, category, recommendedByCabin } = req.body;
    const coverImages = req.body.coverImages; // Already Base64-encoded images
    const bookFile = req.file; // Handle EPUB file

    // Check for required fields
    if (!bookName || !author || !description || !category || !coverImages || !bookFile) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    

    // Handle file upload to GridFS
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'epubs',
      chunkSizeBytes: 13 * 1024 * 1024
    });

    const uploadStream = bucket.openUploadStream(bookFile.originalname);
    uploadStream.end(bookFile.buffer);

    const currentISTTime = moment.tz('Asia/Kolkata').format('Do MMM YYYY hh:mm A');

// Create new book document
const newBook = new Book({
  bookName,
  author,
  description,
  category, // Added category
  dateAdded: currentISTTime, // Use formatted IST time
  coverImages,
  recommendedByCabin,
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


//Get All Books
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


//Update the Books
const updateEbook = async (req, res) => {
  try {
    const { title, author, description, category, coverImages } = req.body;
    const ebookFile = req.file; // Handle EPUB/PDF file

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

    // Handle file upload to GridFS if a new file is provided
    let fileId = book.EPUBbase64 ? book.EPUBbase64.id : undefined;
    let fileType = book.EPUBbase64 ? book.EPUBbase64.type : undefined;

    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'epubs',
      chunkSizeBytes: 13 * 1024 * 1024,
    });

    if (ebookFile) {
      if (ebookFile.mimetype === 'application/epub+zip' || ebookFile.mimetype === 'application/pdf') {
        // Delete old file from GridFS if it exists and is valid
        if (fileId) {
          try {
            await bucket.delete(fileId);
          } catch (error) {
            if (error.message.includes('File not found for id')) {
              console.warn(`File not found for id: ${fileId}. Continuing with upload.`);
            } else {
              throw error; // Re-throw any other error
            }
          }
        }

        // Upload new file to GridFS
        const uploadStream = bucket.openUploadStream(ebookFile.originalname);
        uploadStream.end(ebookFile.buffer);

        uploadStream.on('finish', async () => {
          fileId = uploadStream.id; // Get the ID of the uploaded file
          fileType = ebookFile.mimetype;

          // Update book details
          book.bookName = title;
          book.author = author;
          book.description = description;
          book.category = category;
          book.coverImages = parsedCoverImages; // Replace cover images

          // Update file information if a new one was uploaded
          if (fileId) {
            book.EPUBbase64 = {
              id: fileId,
              filename: ebookFile.originalname,
              type: fileType, // Store the file type
            };
          }

          await book.save(); // Save the updated book document
          res.status(200).json({ message: 'Book updated successfully', book });
        });

        uploadStream.on('error', (error) => {
          console.error('Error uploading file:', error);
          res.status(500).json({ error: 'An error occurred while uploading the file' });
        });
      } else {
        return res.status(400).json({ error: 'Invalid file type. Please upload an EPUB or PDF file.' });
      }
    } else {
      // If no new file is uploaded, just update other book details
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



// Search books based on query
const searchBooks = async (req, res) => {
  const { query } = req.query;
  console.log('query', query)
  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    // Perform a case-insensitive search on the title field
    const books = await Book.find({
      $or: [
          { bookName: { $regex: query, $options: 'i' } },
          { author: { $regex: query, $options: 'i' } }
      ]
  }).select('bookName author _id');

    res.json(books);
  } catch (error) {
    console.error('Error searching books:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new notification
const createNotification = async (req, res) => {
  try {
    const { title, description } = req.body;
    const files = req.body.files; // Assuming Base64-encoded files are sent
    if (!title || !description || !files) {
      return res.status(200).json({ error: 'All fields are required' });
    }

    // Create a new notification
    const newNotification = new Notification({
      title,
      description,
      files, // Store Base64 strings or paths
    });

    await newNotification.save();

    res.status(201).json({ success: true, message: 'Notification created successfully', notification: newNotification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { addBook, getAllBooks, updateEbook, getEbookById, searchBooks, createNotification};
