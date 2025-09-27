const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const upload = require("../utils/upload");

const router = express.Router();

// CREATE BLOG with image upload
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const blog = new Blog({
      title,
      content,
      tags: Array.isArray(tags) ? tags : tags?.split(","),
      image,
      author: req.user._id,
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    console.error("Create blog error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL BLOGS
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (err) {
    console.error("Get blogs error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET SINGLE BLOG
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("author", "name email");
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.status(200).json(blog);
  } catch (err) {
    console.error("Get single blog error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE BLOG
router.put("/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    if (req.file) blog.image = `/uploads/${req.file.filename}`;

    Object.assign(blog, req.body);
    await blog.save();
    res.status(200).json(blog);
  } catch (err) {
    console.error("Update blog error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE BLOG
router.delete("/:id", auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (err) {
    console.error("Delete blog error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// LIKE BLOG
router.post("/:id/like", auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const userIdStr = req.user._id.toString();
    if (blog.likes.map(l => l.toString()).includes(userIdStr)) {
      blog.likes = blog.likes.filter((id) => id.toString() !== userIdStr);
    } else {
      blog.likes.push(req.user._id);
    }

    await blog.save();
    res.status(200).json(blog);
  } catch (err) {
    console.error("Like blog error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ADD COMMENT
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = new Comment({ blog: blog._id, user: req.user._id, text: req.body.text });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET COMMENTS
router.get("/:id/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ blog: req.params.id }).populate("user", "name email");
    res.status(200).json(comments);
  } catch (err) {
    console.error("Get comments error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
