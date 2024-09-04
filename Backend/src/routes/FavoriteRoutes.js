const express = require('express');
const { addFavoriteBook, removeFavoriteBook, getFavoriteBooks } = require('../controllers/userController');
const router = express.Router();

router.post('/add-favorite', addFavoriteBook);
router.post('/remove-favorite', removeFavoriteBook);
router.get('/get-favorites/:userId', getFavoriteBooks);

module.exports = router;
