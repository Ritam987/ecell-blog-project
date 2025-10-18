const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, 
    },
    text: {
      type: String,
      required: true,
    },
    authorName: {
      type: String,
      default: "Deleted User", 
    },
  },
  { timestamps: true }
);

// 🧠 Virtual field to safely display author name
commentSchema.virtual("displayAuthor").get(function () {
  if (!this.user) return "Deleted User";
  return this.authorName || "Unknown User";
});

module.exports = mongoose.model("Comment", commentSchema);

