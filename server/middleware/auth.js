// Checks the "Authorization: Bearer <token>" header and loads the logged-in user
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // throws if invalid or expired
    req.user = await User.findById(decoded.id); // password is excluded by the schema
    if (!req.user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = protect;
