const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register a new user
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user and return JWT token
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in .env");
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        wishlist: user.wishlist || [],
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Admin-only login
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  const ADMIN_EMAIL = "admin@rentmyfit.com";
  const ADMIN_PASSWORD = "admin1234";

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Unauthorized: Invalid admin credentials' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in .env");
    }

    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      token,
      user: {
        id: "admin_001",
        name: "Admin",
        email: ADMIN_EMAIL,
        isAdmin: true,
      },
    });
  } catch (err) {
    console.error("Admin Login Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user dashboard
exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.status(200).json({ message: 'Welcome to dashboard!', user });
  } catch (err) {
    console.error("Dashboard Fetch Error:", err);
    res.status(500).json({ message: 'Failed to fetch dashboard' });
  }
};

// ✅ Add to Wishlist
exports.toggleWishlist = async (req, res) => {
  const { productId } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const index = user.wishlist.indexOf(productId);

    if (index > -1) {
      // Product already in wishlist → remove
      user.wishlist.splice(index, 1);
    } else {
      // Not in wishlist → add
      user.wishlist.push(productId);
    }

    await user.save();

    res.status(200).json({
      message: index > -1 ? 'Removed from wishlist' : 'Added to wishlist',
      wishlist: user.wishlist,
    });
  } catch (err) {
    console.error("Toggle Wishlist Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};


// ✅ Get Wishlist
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('wishlist');
    res.status(200).json(user.wishlist);
  } catch (err) {
    console.error("Get Wishlist Error:", err);
    res.status(500).json({ message: 'Failed to fetch wishlist' });
  }
};

// ================== CART CONTROLLERS ==================

// ✅ Get Cart
exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('cart.product');
    res.status(200).json(user.cart);
  } catch (err) {
    console.error("Get Cart Error:", err);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
};

// ✅ Add to Cart
exports.addToCart = async (req, res) => {
  const { productId } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const existingItem = user.cart.find(item => item.product.toString() === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cart.push({ product: productId, quantity: 1 });
    }

    await user.save();

    res.status(200).json({ message: 'Product added to cart', cart: user.cart });
  } catch (err) {
    console.error("Add to Cart Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Update Quantity
exports.updateCartQuantity = async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const item = user.cart.find(item => item.product.toString() === productId);
    if (!item) return res.status(404).json({ message: 'Item not in cart' });

    item.quantity = quantity;
    await user.save();

    res.status(200).json({ message: 'Cart updated', cart: user.cart });
  } catch (err) {
    console.error("Update Cart Quantity Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Remove Single Item
exports.removeFromCart = async (req, res) => {
  const { productId } = req.params;

  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.cart = user.cart.filter(item => item.product.toString() !== productId);
    await user.save();

    res.status(200).json({ message: 'Product removed from cart', cart: user.cart });
  } catch (err) {
    console.error("Remove From Cart Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Clear Cart
exports.clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.cart = [];
    await user.save();

    res.status(200).json({ message: 'Cart cleared', cart: user.cart });
  } catch (err) {
    console.error("Clear Cart Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

