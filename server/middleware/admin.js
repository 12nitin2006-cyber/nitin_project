// Use after the auth middleware: only lets admins through
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Admin access only' });
};

module.exports = adminOnly;
