const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verifies JWT and attaches user to req
const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
  if (!token)
    return res.status(401).json({ message: "No token, not authorised" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch {
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

// Role guard — use after protect
const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: "Access denied for this role" });
    next();
  };

module.exports = { protect, requireRole };
