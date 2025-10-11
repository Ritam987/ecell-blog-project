import React, { useEffect, useState } from "react";
import API from "../utils/api";
import { getToken, getUser } from "../utils/auth";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BlogCard from "../components/BlogCard";
import { FaRobot } from "react-icons/fa"; // Robot icon

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [chatOpen, setChatOpen] = useState(false); // chatbot toggle
  const currentUser = getUser();
  const navigate = useNavigate();

  const fetchBlogs = async () => {
    try {
      const res = await API.get("/blogs");
      setBlogs(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error fetching blogs");
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      await API.delete(`/blogs/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setBlogs((prev) => prev.filter((b) => b._id !== id));
      alert("Blog deleted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting blog");
    }
  };

  // Framer Motion variants for staggered list
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Toggle chatbot
  const toggleChatbot = () => setChatOpen((prev) => !prev);

  return (
    <motion.div
      className="min-h-screen bg-darkBg p-6 relative"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <h1 className="text-4xl font-bold text-neonBlue mb-6">All Blogs</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <motion.div key={blog._id} variants={itemVariants}>
            <BlogCard blog={blog} />

            {/* Action Buttons if current user is author */}
            {currentUser && blog.author._id === currentUser._id && (
              <div className="mt-2 flex space-x-2">
                <motion.button
                  onClick={() => navigate(`/blog/${blog._id}/edit`)}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 10px #39ff14" }}
                  className="bg-neonGreen text-darkBg px-3 py-1 rounded shadow-neon transition-shadow duration-300"
                >
                  Edit
                </motion.button>
                <motion.button
                  onClick={() => handleDelete(blog._id)}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 10px #ff00ff" }}
                  className="bg-neonPink text-darkBg px-3 py-1 rounded shadow-neon transition-shadow duration-300"
                >
                  Delete
                </motion.button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Floating Animated Chatbot Icon */}
      <motion.div
        onClick={toggleChatbot}
        className="fixed bottom-6 right-6 w-16 h-16 bg-neonBlue text-darkBg rounded-full shadow-neon cursor-pointer flex items-center justify-center z-50"
        whileHover={{ scale: 1.2, rotate: [0, 10, -10, 0] }}
        animate={{ y: [0, -10, 0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <FaRobot size={32} />
      </motion.div>

      {/* You can render your actual chatbot component here */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-darkBg border border-neonBlue rounded-xl shadow-neon p-4 z-50">
          {/* Chatbot UI goes here */}
          <p className="text-white text-center mt-8">Chatbot Placeholder</p>
        </div>
      )}
    </motion.div>
  );
};

export default Home;
