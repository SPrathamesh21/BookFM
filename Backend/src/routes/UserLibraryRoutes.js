const express = require('express');
const { addToLibrary, getUserLibrary,  } = require('../controllers/UserLibraryController');
const router = express.Router();

router.post('/add-to-library', addToLibrary);
router.get('/get-user-library/:userId', getUserLibrary);

module.exports = router;
