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
  getProfile,   
  updateProfile,  
} = require('../controllers/authController');

const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 

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

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, upload.single('profileImage'), updateProfile);



module.exports = router;
