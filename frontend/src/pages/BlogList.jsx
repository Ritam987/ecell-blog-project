import React, { useEffect, useState } from "react";
import API from "../utils/api";
import { getToken } from "../utils/auth";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);

  const fetchBlogs = async () => {
    try {
      const res = await API.get("/blogs");
      setBlogs(res.data);
    } catch (err) {
      console.error("Error fetching blogs:", err.response || err);
      alert("Failed to fetch blogs");
    }
  };

  const handleLike = async (id) => {
    try {
      await API.post(`/blogs/${id}/like`, null, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      fetchBlogs(); // refresh blogs
    } catch (err) {
      console.error("Like error:", err.response || err);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Entrance animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6 px-4">
      {blogs.map((blog) => (
        <motion.div
          key={blog._id}
          className="p-6 rounded-2xl border-4 shadow-neon cursor-pointer neon-border"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5 }}
        >
          {blog.image && (
            <img
              src={`https://ecell-blog-project.onrender.com/api/blogs/image/${blog.image}`}
              alt={blog.title}
              className="w-full h-64 object-cover rounded mb-4 border-2 shadow-neon neon-border-img"
            />
          )}
          <h2 className="text-2xl font-bold text-neonBlue mb-1">{blog.title}</h2>
          <p className="text-graySoft text-sm mb-2">
            By {blog.author.name} | {new Date(blog.createdAt).toLocaleDateString()}
          </p>
          <p className="text-white mb-2">{blog.content.slice(0, 200)}...</p>
          <p className="text-neonPink mb-4">Tags: {blog.tags.join(", ")}</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleLike(blog._id)}
              className="bg-neonBlue text-darkBg px-3 py-1 rounded shadow-neon hover:shadow-neonHover transition-all duration-300"
            >
              Like ({blog.likes.length})
            </button>
            <Link
              to={`/blogs/${blog._id}`}
              className="text-neonBlue hover:underline"
            >
              Read more
            </Link>
          </div>
        </motion.div>
      ))}

      {/* Neon glow animation styles */}
      <style jsx>{`
        .bg-darkBg { background-color: #0a0a0a; }
        .text-darkBg { color: #0a0a0a; }
        .text-neonBlue { color: #0ff; }
        .text-neonPink { color: #ff00ff; }
        .bg-neonBlue { background-color: #0ff; }

        .shadow-neon {
          box-shadow: 0 0 10px #0ff, 0 0 20px #ff00ff, 0 0 30px #39ff14;
        }
        .shadow-neonHover:hover {
          box-shadow: 0 0 15px #0ff, 0 0 30px #ff00ff, 0 0 45px #39ff14;
        }

        /* Continuous neon border animation */
        @keyframes borderGradient {
          0% { border-color: #0ff; }
          25% { border-color: #ff00ff; }
          50% { border-color: #39ff14; }
          75% { border-color: #ff0; }
          100% { border-color: #0ff; }
        }
        .neon-border {
          background-color: #0a0a0a;
          border-color: #0ff;
          animation: borderGradient 4s infinite linear;
        }
        .neon-border-img {
          border-color: #ff00ff;
          animation: borderGradient 4s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default BlogList;
