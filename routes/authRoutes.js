const express = require('express');
const {
  registerUser,
  loginUser,
  loginAdmin,
  getDashboard,
  getWishlist,        
  toggleWishlist, 
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,      
} = require('../controllers/authController');

const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// ✅ Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin-login', loginAdmin);
router.get('/dashboard', authMiddleware, getDashboard);

// ✅ Wishlist routes (protected)
router.get('/wishlist', authMiddleware, getWishlist);
router.post('/wishlist', authMiddleware, toggleWishlist);
// router.delete('/wishlist/:productId', authMiddleware, removeFromWishlist);

// ✅ Cart routes (protected)
router.get('/cart', authMiddleware, getCart);
router.post('/cart', authMiddleware, addToCart);
router.patch('/cart', authMiddleware, updateCartQuantity);
router.delete('/cart/:productId', authMiddleware, removeFromCart);
router.delete('/cart', authMiddleware, clearCart);


module.exports = router;
