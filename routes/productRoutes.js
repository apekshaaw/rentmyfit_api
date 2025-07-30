const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Routes
router.post('/', authMiddleware, upload.single('image'), productController.createProduct);
router.get('/', productController.getProducts);
router.delete('/:id', authMiddleware, productController.deleteProduct);
router.put('/:id', authMiddleware, upload.single('image'), productController.updateProduct);

module.exports = router;
