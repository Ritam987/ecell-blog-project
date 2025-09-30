import React from "react";
import { Link } from "react-router-dom";

const BlogCard = ({ blog }) => {
  return (
    <div className="bg-white shadow-md rounded-md p-4 mb-4">
      {blog.image && <img src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://ecell-blog-project.onrender.com'}/blogs/file/${blog.imageId}`} alt={blog.title} className="w-full h-64 object-cover rounded-md mb-2" />}
      <h2 className="text-xl font-bold mb-2">{blog.title}</h2>
      <p className="text-gray-600 mb-2">By {blog.author.name}</p>
      <Link to={`/blog/${blog._id}`} className="text-blue-500 hover:underline">Read More</Link>
    </div>
  );
};

export default BlogCard;
