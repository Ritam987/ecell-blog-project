import React, { useEffect, useState } from "react";
import API from "../utils/api";
import { getToken, getUser } from "../utils/auth";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const [blogs, setBlogs] = useState([]);
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

  const getMediaUrl = (blog) => {
    if (!blog.mediaId) return null;
    return `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://ecell-blog-project.onrender.com'}/api/blogs/media/${blog.mediaId}`;
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-4">All Blogs</h1>
      {blogs.map((blog) => (
        <div key={blog._id} className="border p-4 rounded shadow-md">
          {/* Display image or video if available */}
          {blog.mediaId && blog.mediaType === "image" && (
            <img
              src={getMediaUrl(blog)}
              alt={blog.title}
              className="w-full h-48 object-cover rounded mb-3"
            />
          )}
          {blog.mediaId && blog.mediaType === "video" && (
            <video
              src={getMediaUrl(blog)}
              controls
              className="w-full h-48 object-cover rounded mb-3"
            />
          )}
          <h2 className="text-2xl font-semibold">{blog.title}</h2>
          <p className="text-gray-700">by {blog.author.name}</p>
          <p className="mt-2">{blog.content.slice(0, 200)}...</p>
          <div className="mt-3 flex space-x-2">
            <Link
              to={`/blog/${blog._id}`}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Read More
            </Link>
            {/* Show Edit and Delete if current user is author */}
            {currentUser && blog.author._id === currentUser._id && (
              <>
                <button
                  onClick={() => navigate(`/blog/${blog._id}/edit`)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(blog._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Home;
