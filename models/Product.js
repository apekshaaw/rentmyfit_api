const mongoose = require('mongoose');
const upload = require('../middlewares/uploadMiddleware');


const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: Number,
  category: { type: String, enum: ['clothing', 'shoes'], required: true },
  sizes: [String],
  imageUrl: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
