const express = require('express');
const router = express.Router();
const { getBookById, getBooks, getSearchedEbooks, getRecommededBooks,ThirdCategory,getMostReadBooks, getBooksByCategories, getNotifications, updateNotification, getEpubFile, getFilteredFavoriteBooks } = require('../controllers/userController');
const { sendOtp, verifyOtpAndSignup, resendOtp, login } = require('../controllers/otpController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/get-books', getBooks);
router.get('/get-recommended-books', getRecommededBooks);
router.get('/get-third-carousel', ThirdCategory);
router.get('/get-books-by-category', getBooksByCategories);
router.get('/get-most-read-books', getMostReadBooks)
router.get('/get-filtered-favorite-books/:userId', getFilteredFavoriteBooks)
// Route to get a book by ID
router.get('/get-book/:bookId', getBookById);

router.get('/search-ebooks', getSearchedEbooks);

router.post('/send-otp', sendOtp);
router.post('/verify-otp-and-signup', verifyOtpAndSignup);
router.post('/resend-otp', resendOtp);

router.post('/login', login);
// GET route to check authentication status
router.get('/check-auth', authenticateToken, (req, res) => {
    res.json({ isAuthenticated: true, user: req.user });
});
// POST route for user logout
router.post('/logout', (req, res) => {
    res.clearCookie('authToken');
    res.json({ message: "Logged out successfully" });
});

//GET  Route for notification data
router.get('/notifications', authenticateToken, getNotifications);
router.put('/notifications/:id', authenticateToken, updateNotification);

router.get('/file/:id', getEpubFile);

module.exports = router;
