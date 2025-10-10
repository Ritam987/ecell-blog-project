const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tags: [String],
    image: { type: mongoose.Schema.Types.ObjectId, ref: "blogImages" }, // store GridFS file ID
    likesCount: { type: Number, default: 0 },
    dislikesCount: { type: Number, default: 0 },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);



