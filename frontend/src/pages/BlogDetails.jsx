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
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch blog details
  const fetchBlog = async () => {
    try {
      const res = await API.get(`/blogs/${id}`);
      setBlog(res.data);

      // Initialize followers
      if (res.data.author?.followers) {
        setFollowersCount(res.data.author.followers.length);
        setIsFollowing(
          currentUser
            ? res.data.author.followers.includes(currentUser._id)
            : false
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error fetching blog");
    }
  };

  // Fetch comments
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

  // Like blog
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

  // Dislike blog
  const handleDislike = async () => {
    try {
      const res = await API.post(
        `/blogs/${id}/dislike`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setBlog(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error disliking blog");
    }
  };

  // Follow/Unfollow author
  const handleFollow = async () => {
    try {
      const res = await API.post(
        `/blogs/${id}/follow`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setFollowersCount(res.data.followersCount);
      setIsFollowing(res.data.isFollowing);
    } catch (err) {
      alert(err.response?.data?.message || "Error following author");
    }
  };

  // Share blog (copy link and increase count)
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
      await API.post(`/blogs/${id}/share`);
      setBlog(prev => ({ ...prev, shares: (prev.shares || 0) + 1 }));
    } catch (err) {
      alert("Error sharing blog");
    }
  };

  // Add comment
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
    <div className="flex justify-center min-h-screen bg-darkBg px-4 py-20">
      <motion.div
        className="w-full max-w-3xl p-6 bg-darkBg rounded-2xl shadow-neon animated-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Blog Title */}
        <motion.h1
          className="text-4xl font-bold text-neonBlue mb-2 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {blog.title}
        </motion.h1>

        {/* Author & Follow */}
        <div className="text-center mb-4 flex justify-center items-center space-x-2">
          <p className="text-graySoft">by {blog.author?.name}</p>
          {currentUser && blog.author?._id !== currentUser._id && (
            <motion.button
              onClick={handleFollow}
              whileHover={{ scale: 1.05, boxShadow: "0 0 10px #39ff14" }}
              className={`px-3 py-1 rounded transition-shadow duration-300 ${
                isFollowing ? "bg-neonGreen text-darkBg shadow-neon" : "bg-gray-700 text-white"
              }`}
            >
              {isFollowing ? `Following (${followersCount})` : `Follow (${followersCount})`}
            </motion.button>
          )}
        </div>

        {/* Blog Image */}
        {blog.image && (
          <motion.img
            src={`https://ecell-blog-project.onrender.com/api/blogs/image/${blog.image}`}
            alt={blog.title}
            className="w-full object-contain rounded-xl mb-4"
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
              whileHover={{ scale: 1.05, boxShadow: "0 0 10px #39ff14" }}
              className="bg-neonGreen text-darkBg px-4 py-2 rounded shadow-neon transition-shadow duration-300"
            >
              Edit Blog
            </motion.button>
          </motion.div>
        )}

        {/* Like / Dislike / Share Buttons */}
        <motion.div className="mt-4 flex items-center justify-center space-x-4">
          <motion.button
            onClick={handleLike}
            whileHover={{ scale: 1.05, boxShadow: "0 0 10px #ff00ff" }}
            className={`px-3 py-1 rounded transition-shadow duration-300 ${
              blog.likes?.includes(currentUser?._id)
                ? "bg-neonPink text-darkBg shadow-neon"
                : "bg-gray-700 text-white"
            }`}
          >
            ❤️ {blog.likes?.length || 0} Like
          </motion.button>

          <motion.button
            onClick={handleDislike}
            whileHover={{ scale: 1.05, boxShadow: "0 0 10px #ff0000" }}
            className={`px-3 py-1 rounded transition-shadow duration-300 ${
              blog.dislikes?.includes(currentUser?._id)
                ? "bg-red-600 text-white shadow-neon"
                : "bg-gray-700 text-white"
            }`}
          >
            👎 {blog.dislikes?.length || 0} Dislike
          </motion.button>

          <motion.button
            onClick={handleShare}
            whileHover={{ scale: 1.05, boxShadow: "0 0 10px #00ffff" }}
            className="px-3 py-1 rounded bg-neonBlue text-darkBg shadow-neon"
          >
            🔗 Share {blog.shares || 0}
          </motion.button>
        </motion.div>

        {/* Comments */}
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
                className="flex-1 border p-2 rounded bg-darkBg text-white placeholder-gray-400"
              />
              <motion.button
                onClick={handleComment}
                whileHover={{ scale: 1.05, boxShadow: "0 0 10px #00ffff" }}
                className="bg-neonBlue text-darkBg px-4 py-2 rounded shadow-neon transition-shadow duration-300"
              >
                Comment
              </motion.button>
            </div>
          )}
        </div>

        {/* Neon Glow & Animated Border */}
        <style jsx>{`
          .bg-darkBg { background-color: #0a0a0a; }
          .text-darkBg { color: #0a0a0a; }
          .shadow-neon {
            box-shadow: 0 0 10px #0ff, 0 0 20px #0ff, 0 0 30px #0ff;
          }
          .animated-border {
            border: 4px solid;
            border-radius: 1rem;
            border-image-slice: 1;
            border-image-source: linear-gradient(270deg, #ff00ff, #00ffff, #39ff14, #ff00ff);
            animation: borderGradient 6s linear infinite;
          }
          @keyframes borderGradient {
            0% { border-image-source: linear-gradient(270deg, #ff00ff, #00ffff, #39ff14, #ff00ff); }
            20% { border-image-source: linear-gradient(270deg, #00ffff, #39ff14, #ff00ff, #00ffff); }
            40% { border-image-source: linear-gradient(270deg, #39ff14, #ff00ff, #00ffff, #39ff14); }
            60% { border-image-source: linear-gradient(270deg, #ff00ff, #ffbf00, #00ffff, #ff00ff); }
            80% { border-image-source: linear-gradient(270deg, #00ffff, #ff00ff, #39ff14, #00ffff); }
            100% { border-image-source: linear-gradient(270deg, #ff00ff, #00ffff, #39ff14, #ff00ff); }
          }
        `}</style>
      </motion.div>
    </div>
  );
};

export default BlogDetails;
