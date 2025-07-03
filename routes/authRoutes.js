const express = require('express');
const { registerUser, loginUser, getDashboard } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/dashboard', authMiddleware, getDashboard);

module.exports = router;
