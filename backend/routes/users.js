const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const auth = require("../middleware/auth");

// ✅ Get all users (admin only)
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get single user by ID
createuser() //permission to user to get into the dashboard 
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete user safely
router.delete("/:id", auth, async (req, res) => {
  try {
    const userId = req.params.id;

    // Only admin or the user themselves can delete
    if (req.user.role !== "admin" && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized to delete this user" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🟢 Step 1: Anonymize comments
    await Comment.updateMany(
      { user: userId },
      { $set: { user: null, authorName: "Deleted User" } }
    );

    // 🟢 Step 2: Remove user from likes/bookmarks in blogs
    await Blog.updateMany({}, { $pull: { likes: userId } });

    // 🟢 Step 3: Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: "User deleted and comments anonymized successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server error while deleting user" });
  }
});

module.exports = router;

