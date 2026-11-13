// Entry point of the Express API
require('dotenv').config({ quiet: true });
const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const claimRoutes = require('./routes/claimRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ---------- Middleware ----------
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json()); // parse JSON request bodies

// Uploaded photos are served as static files, e.g. /uploads/123.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- Routes ----------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/admin', adminRoutes);

// Any other /api route that does not exist
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ---------- Error handler ----------
// Express 5 sends errors thrown in async controllers here automatically.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Multer errors (file too large) and our own file-type error
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 2 MB or smaller' : err.message;
    return res.status(400).json({ message });
  }
  // Mongoose validation errors (missing field, value not in enum, etc.)
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ message });
  }
  // Invalid MongoDB id like /api/items/abc
  if (err.name === 'CastError') {
    return res.status(404).json({ message: 'Resource not found' });
  }
  console.error(err);
  res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
});

// ---------- Start ----------
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
