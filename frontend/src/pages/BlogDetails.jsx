import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";
import { getUser, getToken } from "../utils/auth";
import { motion } from "framer-motion";

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getUser();
  const [blog, setBlog] = useState({});
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  const fetchBlog = async () => {
    try {
      const res = await API.get(`/blogs/${id}`);
      setBlog(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error fetching blog");
    }
  };

  const fetchComments = async () => {
    try {
      const res = await API.get(`/blogs/${id}/comments`);
      setComments(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error fetching comments");
    }
  };

  useEffect(() => {
    fetchBlog();
    fetchComments();
  }, [id]);

  const handleLike = async () => {
    try {
      const res = await API.post(
        `/blogs/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setBlog(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error liking blog");
    }
  };

  const handleComment = async () => {
    if (!commentText) return;
    try {
      await API.post(
        `/blogs/${id}/comment`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setCommentText("");
      fetchComments();
    } catch (err) {
      alert(err.response?.data?.message || "Error posting comment");
    }
  };

  const commentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex justify-center min-h-screen bg-darkBg px-4 pt-24">
      <motion.div
        className="w-full max-w-3xl p-6 bg-darkBg rounded-2xl shadow-neon animated-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Blog Heading */}
        <motion.h1
          className="text-4xl font-bold text-neonBlue mb-2 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {blog.title}
        </motion.h1>
        <p className="text-graySoft mb-4 text-center">by {blog.author?.name}</p>

        {/* Blog Image */}
        {blog.image && (
          <motion.img
            src={`https://ecell-blog-project.onrender.com/api/blogs/image/${blog.image}`}
            alt={blog.title}
            className="w-full object-contain rounded-xl mb-4 border-2 shadow-neon"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          />
        )}

        {/* Blog Content */}
        <motion.p
          className="mt-2 text-graySoft"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {blog.content}
        </motion.p>

        {/* Edit Button */}
        {currentUser && blog.author?._id === currentUser._id && (
          <motion.div className="mt-4 text-center">
            <motion.button
              onClick={() => navigate(`/blog/${blog._id}/edit`)}
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px #39ff14" }}
              className="bg-neonGreen text-darkBg px-4 py-2 rounded shadow-neon transition-shadow duration-300"
            >
              Edit Blog
            </motion.button>
          </motion.div>
        )}

        {/* Like Button */}
        <motion.div className="mt-4 flex items-center justify-center space-x-4">
          <motion.button
            onClick={handleLike}
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px #ff00ff" }}
            className={`px-3 py-1 rounded transition-shadow duration-300 ${
              blog.likes?.includes(currentUser?._id)
                ? "bg-neonPink text-darkBg shadow-neon"
                : "bg-gray-700 text-white"
            }`}
          >
            ❤️ {blog.likes?.length || 0} Like
          </motion.button>
        </motion.div>

        {/* Comments Section */}
        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-neonBlue mb-2 text-center">
            Comments
          </h2>
          <motion.div className="space-y-2 mb-4" initial="hidden" animate="visible">
            {comments.map((c) => (
              <motion.div
                key={c._id}
                className="border p-2 rounded shadow-neon bg-cardBg"
                variants={commentVariants}
              >
                <p className="font-semibold text-neonPink">
                  {c.user?.name || c.authorName || "Deleted User"}
                </p>
                <p className="text-graySoft">{c.text}</p>
              </motion.div>
            ))}
          </motion.div>

          {currentUser && (
            <div className="flex space-x-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment"
                className="flex-1 border p-2 rounded bg-darkBg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neonPink"
              />
              <motion.button
                onClick={handleComment}
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px #00ffff" }}
                className="bg-neonBlue text-darkBg px-4 py-2 rounded shadow-neon transition-shadow duration-300"
              >
                Comment
              </motion.button>
            </div>
          )}
        </div>

        {/* Neon glow animation */}
        <style jsx>{`
          .bg-darkBg { background-color: #0a0a0a; }
          .text-darkBg { color: #0a0a0a; }
          .shadow-neon {
            box-shadow: 0 0 10px #0ff, 0 0 20px #0ff, 0 0 30px #0ff;
          }
          .animated-border {
            border: 4px solid;
            border-image-slice: 1;
            border-width: 4px;
            border-image-source: linear-gradient(
              270deg,
              #ff00ff,
              #00ffff,
              #39ff14,
              #ffea00,
              #ff00ff
            );
            animation: animatedBorder 4s linear infinite;
          }
          @keyframes animatedBorder {
            0% { border-image-source: linear-gradient(270deg, #ff00ff, #00ffff, #39ff14, #ffea00, #ff00ff); }
            25% { border-image-source: linear-gradient(270deg, #00ffff, #39ff14, #ffea00, #ff00ff, #00ffff); }
            50% { border-image-source: linear-gradient(270deg, #39ff14, #ffea00, #ff00ff, #00ffff, #39ff14); }
            75% { border-image-source: linear-gradient(270deg, #ffea00, #ff00ff, #00ffff, #39ff14, #ffea00); }
            100% { border-image-source: linear-gradient(270deg, #ff00ff, #00ffff, #39ff14, #ffea00, #ff00ff); }
          }
        `}</style>
      </motion.div>
    </div>
  );
};

export default BlogDetails;
