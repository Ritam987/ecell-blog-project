const express = require("express");
const auth = require("../middleware/auth");
const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const multer = require("multer");

const router = express.Router();

// Multer memory storage (store file in buffer)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// CREATE BLOG with image upload
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const image = req.file
      ? { data: req.file.buffer, contentType: req.file.mimetype }
      : null;

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

    // Convert image buffer to base64 for frontend
    const blogsWithImages = blogs.map((b) => {
      const blogObj = b.toObject();
      if (b.image && b.image.data) {
        blogObj.image = `data:${b.image.contentType};base64,${b.image.data.toString("base64")}`;
      } else {
        blogObj.image = null;
      }
      return blogObj;
    });

    res.status(200).json(blogsWithImages);
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

    const blogObj = blog.toObject();
    if (blog.image && blog.image.data) {
      blogObj.image = `data:${blog.image.contentType};base64,${blog.image.data.toString("base64")}`;
    } else {
      blogObj.image = null;
    }

    res.status(200).json(blogObj);
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

    if (req.file) {
      blog.image = { data: req.file.buffer, contentType: req.file.mimetype };
    }

    Object.assign(blog, req.body);
    await blog.save();

    const blogObj = blog.toObject();
    if (blog.image && blog.image.data) {
      blogObj.image = `data:${blog.image.contentType};base64,${blog.image.data.toString("base64")}`;
    } else {
      blogObj.image = null;
    }

    res.status(200).json(blogObj);
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

    await Comment.deleteMany({ blog: blog._id });
    await Blog.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Blog and associated comments deleted successfully" });
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
