// src/components/BlogCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const BlogCard = ({ blog }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="bg-darkBg rounded-2xl shadow-neon border border-neonBlue p-4 hover:shadow-neon-lg transition-all duration-300 cursor-pointer"
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

      {/* Title with smooth hover glow */}
      <h2 className="blog-title text-2xl font-bold text-neonBlue mb-2 text-center">
        {blog.title}
      </h2>

      <p className="text-graySoft text-center line-clamp-3">{blog.content}</p>

      {/* Smooth fade in/out neon animation */}
      <style jsx>{`
        .blog-title {
          text-shadow: 0 0 5px #00ffff;
          transition: 
            text-shadow 0.6s ease-in-out,
            color 0.6s ease-in-out,
            transform 0.4s ease;
        }

        .blog-title:hover {
          color: #39ff14;
          transform: scale(1.03);
          animation: glowPulse 1.5s ease-in-out infinite alternate;
        }

        @keyframes glowPulse {
          0% {
            text-shadow: 0 0 8px #00ffff, 0 0 15px #39ff14, 0 0 25px #ff00ff;
          }
          100% {
            text-shadow: 0 0 20px #ff00ff, 0 0 35px #00ffff, 0 0 50px #39ff14;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default BlogCard;
