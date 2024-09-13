const express = require('express');
const router = express.Router();
const { getBookById, getBooks, getSearchedEbooks } = require('../controllers/userController');
const { sendOtp, verifyOtpAndSignup, resendOtp, login } = require('../controllers/otpController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { getNotifications, updateNotification, getEpubFile } = require('../controllers/userController');// Route to get all books
router.get('/get-books', getBooks);

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
