import React, { useEffect, useState } from "react";
import API from "../utils/api";
import { getToken } from "../utils/auth";
import { Link } from "react-router-dom";

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

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6">
      {blogs.map((blog) => (
        <div key={blog._id} className="bg-white p-6 rounded shadow-md">
          {blog.image && (
            <img
              src={`https://ecell-blog-project.onrender.com/api/blogs/image/${blog.image}`}
              alt={blog.title}
              className="w-full h-64 object-cover rounded mb-4"
            />
          )}
          <h2 className="text-2xl font-bold">{blog.title}</h2>
          <p className="text-sm text-gray-500">
            By {blog.author.name} | {new Date(blog.createdAt).toLocaleDateString()}
          </p>
          <p className="mt-2">{blog.content.slice(0, 200)}...</p>
          <p className="mt-2 text-blue-500">Tags: {blog.tags.join(", ")}</p>
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={() => handleLike(blog._id)}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Like ({blog.likes.length})
            </button>
            <Link
              to={`/blogs/${blog._id}`}
              className="text-blue-600 hover:underline"
            >
              Read more
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlogList;

this is the bloglist.jsx just make the cards animated
