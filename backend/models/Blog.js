const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tags: [String],
    mediaId: { type: mongoose.Schema.Types.ObjectId }, // GridFS file ID
    mediaType: { type: String, enum: ["image", "video"] }, // Type of media
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
