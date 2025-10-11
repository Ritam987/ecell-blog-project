// src/components/BlogCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const BlogCard = ({ blog }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="bg-darkBg rounded-2xl shadow-neon border border-neonBlue p-4 transition-all duration-300 cursor-pointer"
      whileHover={{ scale: 1.03 }}
      onClick={() => navigate(`/blog/${blog._id}`)}
    >
      {blog.image && (
        <img
          src={`https://ecell-blog-project.onrender.com/api/blogs/image/${blog.image}`}
          alt={blog.title}
          className="w-full h-48 object-cover rounded-xl mb-3"
        />
      )}

      <h2 className="blog-title text-2xl font-bold text-neonBlue mb-2 text-center">
        {blog.title}
      </h2>

      <p className="text-graySoft text-center line-clamp-3">{blog.content}</p>

      <style jsx>{`
        .blog-title {
          text-shadow: 0 0 5px #00ffff;
          transition: 
            text-shadow 0.6s ease,
            color 0.6s ease,
            transform 0.4s ease;
        }

        /* Hover glow */
        .blog-title:hover {
          color: #39ff14;
          transform: scale(1.05);
          text-shadow: 0 0 10px #00ffff, 0 0 20px #39ff14, 0 0 30px #ff00ff;
        }

        /* Smooth fade-out after hover */
        .blog-title:not(:hover) {
          animation: fadeOutGlow 0.8s ease forwards;
        }

        @keyframes fadeOutGlow {
          from {
            text-shadow: 0 0 20px #ff00ff, 0 0 30px #39ff14, 0 0 50px #00ffff;
            color: #39ff14;
          }
          to {
            text-shadow: 0 0 5px #00ffff;
            color: #00ffff;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default BlogCard;
