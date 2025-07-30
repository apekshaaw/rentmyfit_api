const express = require('express');
const {
  registerUser,
  loginUser,
  loginAdmin,       
  getDashboard,
} = require('../controllers/authController');

const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Existing routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/dashboard', authMiddleware, getDashboard);
router.post('/admin-login', loginAdmin);

module.exports = router;
