const express = require('express');
const router = express.Router();
const { getBookById, getBooks, getSearchedEbooks } = require('../controllers/userController');
const { sendOtp, verifyOtpAndSignup, resendOtp, login } = require('../controllers/otpController');

// Route to get all books
router.get('/get-books', getBooks);

// Route to get a book by ID
router.get('/get-book/:bookId', getBookById);

router.get('/search-ebooks', getSearchedEbooks);

router.post('/send-otp', sendOtp);
router.post('/verify-otp-and-signup', verifyOtpAndSignup);
router.post('/resend-otp', resendOtp);

router.post('/login', login);

module.exports = router;
