// src/components/BlogCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const BlogCard = ({ blog }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="blog-card bg-darkBg rounded-2xl shadow-neon border border-neonBlue p-4 transition-all duration-300 cursor-pointer"
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
        /* Normal title state */
        .blog-title {
          color: #00ffff;
          text-shadow: 0 0 4px #00ffff40;
          transition: all 0.6s ease;
        }

        /* When hovering the entire card, make the title glow */
        .blog-card:hover .blog-title {
          color: #39ff14;
          text-shadow: 0 0 10px #00ffff, 0 0 20px #39ff14, 0 0 30px #ff00ff;
          transform: scale(1.05);
        }

        /* Smooth fade-out when leaving the card */
        .blog-card:not(:hover) .blog-title {
          animation: fadeOutTitle 0.8s ease forwards;
        }

        @keyframes fadeOutTitle {
          from {
            color: #39ff14;
            text-shadow: 0 0 20px #00ffff, 0 0 30px #39ff14, 0 0 50px #ff00ff;
          }
          to {
            color: #00ffff;
            text-shadow: 0 0 4px #00ffff40;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default BlogCard;
