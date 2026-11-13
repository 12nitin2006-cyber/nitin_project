const mongoose = require('mongoose');

// Fixed list of categories, also used by the frontend dropdowns
const CATEGORIES = ['Electronics', 'ID Card', 'Books', 'Bottles', 'Keys', 'Clothing', 'Bags', 'Other'];

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: [100, 'Title can be at most 100 characters'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description can be at most 1000 characters'],
    },
    category: { type: String, enum: CATEGORIES, required: [true, 'Category is required'] },
    type: { type: String, enum: ['lost', 'found'], required: [true, 'Type is required'] },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    date: { type: Date, required: [true, 'Date is required'] },
    imageUrl: { type: String },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['open', 'claimed'], default: 'open' },
  },
  { timestamps: true }
);

// Text index so we can search inside title and description
itemSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Item', itemSchema);
module.exports.CATEGORIES = CATEGORIES;
