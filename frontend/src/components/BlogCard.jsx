import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const BlogCard = ({ blog }) => {
  return (
    <motion.div
      className="bg-cardBg rounded-2xl shadow-neon p-4 mb-6 transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, boxShadow: "0 0 15px #ff00ff, 0 0 25px #00ffff" }}
      transition={{ duration: 0.3 }}
    >
      {blog.image && (
        <img
          src={`https://ecell-blog-project.onrender.com/api/blogs/image/${blog.image}`}
          alt={blog.title}
          className="w-full h-64 object-cover rounded-xl mb-4"
        />
      )}
      <h2 className="text-neonBlue text-2xl font-bold mb-2">{blog.title}</h2>
      <p className="text-graySoft mb-2">By {blog.author.name}</p>
      <motion.div whileHover={{ scale: 1.05 }}>
        <Link
          to={`/blog/${blog._id}`}
          className="text-neonPink hover:underline font-semibold"
        >
          Read More
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default BlogCard;
