const express = require("express");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const upload = require("../utils/upload");

const router = express.Router();

// GridFS
const { GridFSBucket } = mongoose.mongo;
let gfs;
mongoose.connection.once("open", () => {
  gfs = new GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
});

// CREATE BLOG with image upload (stored in MongoDB)
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const imageId = req.file ? req.file.id : null;

    const blog = new Blog({
      title,
      content,
      tags: Array.isArray(tags) ? tags : tags?.split(","),
      imageId,
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

// SERVE BLOG IMAGE (GridFS)
router.get("/file/:id", async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const files = await mongoose.connection.db
      .collection("uploads.files")
      .find({ _id: fileId })
      .toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    res.set("Content-Type", files[0].contentType);
    gfs.openDownloadStream(fileId).pipe(res);
  } catch (err) {
    console.error("Get file error:", err);
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
      // delete old file if exists
      if (blog.imageId) {
        gfs.delete(new mongoose.Types.ObjectId(blog.imageId), (err) => {
          if (err) console.error("Error deleting old image:", err);
        });
      }
      blog.imageId = req.file.id;
    }

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

    // Delete all comments associated with this blog
    await Comment.deleteMany({ blog: blog._id });

    // Delete the blog image from GridFS if exists
    if (blog.imageId) {
      gfs.delete(new mongoose.Types.ObjectId(blog.imageId), (err) => {
        if (err) console.error("Error deleting image:", err);
      });
    }

    // Delete the blog itself
    await Blog.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Blog, image, and associated comments deleted successfully" });
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
    if (blog.likes.map((l) => l.toString()).includes(userIdStr)) {
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

    const comment = new Comment({
      blog: blog._id,
      user: req.user._id,
      text: req.body.text,
    });
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
    const comments = await Comment.find({ blog: req.params.id }).populate(
      "user",
      "name email"
    );
    res.status(200).json(comments);
  } catch (err) {
    console.error("Get comments error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
