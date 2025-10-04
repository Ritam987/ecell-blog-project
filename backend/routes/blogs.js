const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const mongoose = require("mongoose");
const multer = require("multer");

const router = express.Router();

// Multer memory storage for GridFS
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// GridFS bucket
let blogImagesBucket;
mongoose.connection.once("open", () => {
  blogImagesBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "blogImages",
  });
});

// ------------------- ROUTES ------------------- //

// CREATE BLOG with image upload
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    let imageId = null;

    if (req.file) {
      const uploadStream = blogImagesBucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
      });
      uploadStream.end(req.file.buffer);
      imageId = uploadStream.id;
    }

    const blog = new Blog({
      title,
      content,
      tags: Array.isArray(tags) ? tags : tags?.split(","),
      image: imageId,
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

// GET BLOG IMAGE
router.get("/image/:id", async (req, res) => {
  try {
    const _id = new mongoose.Types.ObjectId(req.params.id);
    const downloadStream = blogImagesBucket.openDownloadStream(_id);

    downloadStream.on("data", (chunk) => res.write(chunk));
    downloadStream.on("error", () => res.status(404).json({ message: "Image not found" }));
    downloadStream.on("end", () => res.end());
  } catch (err) {
    console.error("Get image error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE BLOG
router.put("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Allow the author OR an admin to edit
    if (blog.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedBlog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE BLOG
router.delete("/:id", auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Unauthorized" });

    // Delete associated image in GridFS
    if (blog.image) {
      blogImagesBucket.delete(blog.image, (err) => {
        if (err) console.error("Image deletion error:", err);
      });
    }

    // Delete all comments
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

