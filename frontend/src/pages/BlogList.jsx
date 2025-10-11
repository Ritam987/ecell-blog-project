import React, { useEffect, useState } from "react";
import API from "../utils/api";
import { getToken } from "../utils/auth";
import { Link, useLocation } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [searchText, setSearchText] = useState("");
  const query = useQuery();

  const fetchBlogs = async () => {
    try {
      const res = await API.get("/blogs");
      setBlogs(res.data);
      setFilteredBlogs(res.data);
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

  // Listen to query parameter for search (from navbar)
  useEffect(() => {
    const q = query.get("query") || "";
    setSearchText(q);
  }, [query]);

  // Filter blogs based on searchText (title, author, tags)
  useEffect(() => {
    if (!searchText) {
      setFilteredBlogs(blogs);
    } else {
      const lowerSearch = searchText.toLowerCase();
      const filtered = blogs.filter(
        (blog) =>
          blog.title.toLowerCase().includes(lowerSearch) ||
          blog.author.name.toLowerCase().includes(lowerSearch) ||
          (blog.tags && blog.tags.some((tag) => tag.toLowerCase().includes(lowerSearch)))
      );
      setFilteredBlogs(filtered);
    }
  }, [searchText, blogs]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6">
      {/* Optional Search Input inside BlogList */}
      <div className="mb-6 flex justify-center relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl pointer-events-none" />
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search blogs by title, author, or tag..."
          className="w-full max-w-md pl-10 border p-2 rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredBlogs.length === 0 && (
        <p className="text-center text-gray-500">
          No blogs found matching your search.
        </p>
      )}

      {filteredBlogs.map((blog) => (
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
            By {blog.author.name} |{" "}
            {new Date(blog.createdAt).toLocaleDateString()}
          </p>
          <p className="mt-2">{blog.content.slice(0, 200)}...</p>
          <p className="mt-2 text-blue-500">Tags: {blog.tags.join(", ")}</p>
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={() => handleLike(blog._id)}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors duration-300"
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
