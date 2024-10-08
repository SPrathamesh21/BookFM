const path = require('path');
const fs = require('fs')
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const Book = require('../models/AdminbookModel');
const moment = require('moment-timezone');
const Notification =require('../models/AdminNotification');
const User = require('../models/User');
const PDFParser = require('pdf-parse');
const EPUB = require('epub'); // Import the epub library


// Function to count words in a text
const countWords = (text) => {
  return text.split(/\s+/).filter(Boolean).length;
};

// Function to extract text from PDF
const extractTextFromPDF = async (pdfBuffer) => {
  const data = await PDFParser(pdfBuffer);
  return data.text;
};

// Function to extract text from epub
const extractTextFromEPUB = async (epubBuffer) => {
  return new Promise((resolve, reject) => {
    const epubFilePath = path.join(__dirname, 'temp.epub');

    // Write the buffer to a temporary EPUB file
    fs.writeFileSync(epubFilePath, epubBuffer);

    // Parse the EPUB file
    const epub = new EPUB(epubFilePath);
    epub.on('end', async () => {
      let extractedText = '';

      // Array of promises to handle each chapter text extraction
      const chapterPromises = epub.flow.map((chapter) => {
        return new Promise((chapterResolve, chapterReject) => {
          epub.getChapter(chapter.id, (err, text) => {
            if (err) {
              return chapterReject(err);
            }
            extractedText += text; // Append chapter text
            chapterResolve();
          });
        });
      });

      // Wait for all chapter text to be extracted
      await Promise.all(chapterPromises);

      // Clean up and remove the temporary EPUB file
      fs.unlinkSync(epubFilePath);

      resolve(extractedText); // Resolve the full extracted text
    });

    epub.on('error', (error) => {
      reject(error);
    });

    epub.parse(); // Start parsing the EPUB file
  });
};


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

    let wordCount = 0;

    // Extract text and count words based on file type
    if (bookFile.mimetype === 'application/pdf') {
      const text = await extractTextFromPDF(bookFile.buffer);
      wordCount = countWords(text);
    } else if (bookFile.mimetype === 'application/epub+zip') {
      const text = await extractTextFromEPUB(bookFile.buffer);
      wordCount = countWords(text);
    }
    

    // Handle file upload to GridFS
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'epubs',
      chunkSizeBytes: 1 * 1024 * 1024
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
  EPUBbase64: { id: undefined, filename: undefined }, // Ensure EPUBbase64 is updated later
  wordCount // Add word count to the document

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
    const { title, author, description, category, coverImages,recommendedByCabin } = req.body;
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
      chunkSizeBytes: 1 * 1024 * 1024,
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

          let wordCount = 0;

          // Count words based on file type
          if (fileType === 'application/pdf') {
            const text = await extractTextFromPDF(ebookFile.buffer);
            wordCount = countWords(text);
          } else if (fileType === 'application/epub+zip') {
            const text = await extractTextFromEPUB(ebookFile.buffer);
            wordCount = countWords(text);
          }

          // Update book details
          book.bookName = title;
          book.author = author;
          book.description = description;
          book.category = category;
          book.coverImages = parsedCoverImages;
          book.recommendedByCabin = recommendedByCabin; // Replace cover images
          book.wordCount = wordCount;

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
      book.coverImages = parsedCoverImages;
      book.recommendedByCabin=recommendedByCabin // Replace cover images

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
    const { title, description, files } = req.body;

    if (!title || !description || !files) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create a new notification
    const newNotification = new Notification({
      title,
      description,
      files
    });

    // Save the notification
    await newNotification.save();

    // Fetch all users
    const users = await User.find();

    // Update each user with the new notification
    await Promise.all(users.map(async (user) => {
      user.notifications.push({ notificationId: newNotification._id, read: false });
      await user.save();
    }));

    res.status(201).json({ success: true, message: 'Notification created successfully', notification: newNotification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { addBook, getAllBooks, updateEbook, getEbookById, searchBooks, createNotification};
