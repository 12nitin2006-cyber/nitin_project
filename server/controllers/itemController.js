const fs = require('fs');
const path = require('path');
const Item = require('../models/Item');
const Claim = require('../models/Claim');

const PAGE_SIZE = 9;

// Delete an uploaded photo from disk (ignore errors if it is already gone)
const deleteImage = (imageUrl) => {
  if (!imageUrl) return;
  const filePath = path.join(__dirname, '..', imageUrl); // imageUrl looks like /uploads/abc.jpg
  fs.unlink(filePath, () => {});
};

// Escape special characters so user input is safe inside a RegExp
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/items?search=&type=&category=&location=&page=
const getItems = async (req, res) => {
  const { search, type, category, location } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

  // Build the filter step by step; every filter is optional and they all combine
  const filter = {};
  if (search) filter.$text = { $search: search }; // uses the text index on title + description
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (location) filter.location = { $regex: escapeRegex(location), $options: 'i' }; // partial, case-insensitive

  const total = await Item.countDocuments(filter);
  const items = await Item.find(filter)
    .populate('postedBy', 'name')
    .sort({ createdAt: -1 }) // newest first
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE);

  res.json({ items, page, totalPages: Math.ceil(total / PAGE_SIZE) || 1, total });
};

// GET /api/items/mine  (protected)
const getMyItems = async (req, res) => {
  const items = await Item.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
  res.json(items);
};

// GET /api/items/:id
const getItemById = async (req, res) => {
  const item = await Item.findById(req.params.id).populate('postedBy', 'name');
  if (!item) return res.status(404).json({ message: 'Item not found' });
  res.json(item);
};

// POST /api/items  (protected, multipart form)
const createItem = async (req, res) => {
  const { title, description, category, type, location, date } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    const item = await Item.create({
      title,
      description,
      category,
      type,
      location,
      date,
      imageUrl,
      postedBy: req.user._id,
    });
    res.status(201).json(item);
  } catch (error) {
    deleteImage(imageUrl); // validation failed, so the uploaded photo is not needed
    throw error; // the error handler in server.js sends the 400 response
  }
};

// PUT /api/items/:id  (owner only)
const updateItem = async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });

  if (item.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'You can only edit your own posts' });
  }

  // Only copy the fields a student is allowed to change
  const fields = ['title', 'description', 'category', 'type', 'location', 'date'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) item[field] = req.body[field];
  });

  // A new photo replaces the old one
  if (req.file) {
    deleteImage(item.imageUrl);
    item.imageUrl = `/uploads/${req.file.filename}`;
  }

  await item.save(); // runs the schema validators again
  res.json(item);
};

// DELETE /api/items/:id  (owner or admin)
const deleteItem = async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });

  const isOwner = item.postedBy.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not allowed to delete this post' });
  }

  await Claim.deleteMany({ item: item._id }); // remove its claims too
  await item.deleteOne();
  deleteImage(item.imageUrl);

  res.json({ message: 'Item deleted' });
};

module.exports = { getItems, getMyItems, getItemById, createItem, updateItem, deleteItem };
