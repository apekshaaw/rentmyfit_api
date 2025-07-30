const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

// ✅ Create product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, sizes } = req.body;

    // Validate image
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // ✅ Generate full image URL
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // ✅ Validate sizes (must be valid JSON array string)
    let parsedSizes;
    try {
      parsedSizes = JSON.parse(sizes);
      if (!Array.isArray(parsedSizes)) {
        return res.status(400).json({ message: 'Sizes must be an array' });
      }
    } catch (err) {
      return res.status(400).json({ message: 'Sizes must be a valid JSON array' });
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      sizes: parsedSizes,
      imageUrl,
      createdBy: req.user?.id, // Optional: if you're tracking admin
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('❌ Product creation error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, sizes } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // ✅ Parse sizes
    let parsedSizes;
    try {
      parsedSizes = JSON.parse(sizes);
      if (!Array.isArray(parsedSizes)) {
        return res.status(400).json({ message: 'Sizes must be an array' });
      }
    } catch (err) {
      return res.status(400).json({ message: 'Sizes must be a valid JSON array' });
    }

    // ✅ Handle optional image update
    if (req.file) {
      // Delete old image if it exists
      const oldImage = path.basename(product.imageUrl);
      const oldImagePath = path.join(__dirname, '..', 'uploads', oldImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }

      // Set new image URL
      product.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    // ✅ Update other fields
    product.name = name;
    product.description = description;
    product.price = price;
    product.category = category;
    product.sizes = parsedSizes;

    await product.save();
    res.status(200).json(product);
  } catch (err) {
    console.error('❌ Update product error:', err);
    res.status(500).json({ message: 'Error updating product', error: err.message });
  }
};


// ✅ Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('❌ Get products error:', err);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

// ✅ Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // ✅ Delete image file if it exists
    const imageName = path.basename(product.imageUrl); // safer path
    const filePath = path.join(__dirname, '..', 'uploads', imageName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Product.findByIdAndDelete(id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('❌ Delete product error:', err);
    res.status(500).json({ message: 'Error deleting product' });
  }
};
