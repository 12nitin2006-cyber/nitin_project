const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Create a JWT that stores the user's id, valid for 7 days
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Only send safe fields to the client (never the password)
const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(400).json({ message: 'Email is already registered' });
  }

  // role is not taken from the body, so nobody can register as admin
  const user = await User.create({ name, email, password });
  res.status(201).json({ token: generateToken(user._id), user: userResponse(user) });
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // password has select: false, so we ask for it here to compare
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({ token: generateToken(user._id), user: userResponse(user) });
};

// GET /api/auth/me  (protected)
const getMe = async (req, res) => {
  res.json({ user: userResponse(req.user) });
};

module.exports = { register, login, getMe };
