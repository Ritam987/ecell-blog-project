const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    // Support both "Bearer <token>" and "<token>"
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7).trim()
      : authHeader.trim();

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Find user from decoded token
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach simplified user info to request for easy role/id access
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role, // ensure role is available
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    res.status(500).json({ message: "Server error in authentication" });
  }
};

module.exports = auth;
