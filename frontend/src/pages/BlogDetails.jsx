import React, { useState, useEffect } from "react";
import API from "../utils/api";
import { useParams, useNavigate } from "react-router-dom";
import { getUser, getToken } from "../utils/auth";

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getUser();
  const [blog, setBlog] = useState({});
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  const fetchBlog = async () => {
    try {
      const res = await API.get(`/blogs/${id}`);
      setBlog(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error fetching blog");
    }
  };

  const fetchComments = async () => {
    try {
      const res = await API.get(`/blogs/${id}/comments`);
      setComments(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error fetching comments");
    }
  };

  useEffect(() => {
    fetchBlog();
    fetchComments();
  }, [id]);

  const handleLike = async () => {
    try {
      const res = await API.post(
        `/blogs/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setBlog(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error liking blog");
    }
  };

  const handleComment = async () => {
    if (!commentText) return;
    try {
      await API.post(
        `/blogs/${id}/comment`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setCommentText("");
      fetchComments();
    } catch (err) {
      alert(err.response?.data?.message || "Error posting comment");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
      <h1 className="text-3xl font-bold">{blog.title}</h1>
      <p className="text-gray-600 mb-4">by {blog.author?.name}</p>

      {/* Display Image if exists */}
      {blog.image && (
        <img
          src={`https://ecell-blog-project.onrender.com/api/blogs/image/${blog.image}`}
          alt={blog.title}
          className="w-full object-contain"
        />
      )}

      <p className="mt-2">{blog.content}</p>

      {/* Edit button visible only for author */}
      {currentUser && blog.author?._id === currentUser._id && (
        <div className="mt-4">
          <button
            onClick={() => navigate(`/blog/${blog._id}/edit`)}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Edit Blog
          </button>
        </div>
      )}

      <div className="mt-4 flex items-center space-x-4">
        <button
          onClick={handleLike}
          className={`px-3 py-1 rounded ${
            blog.likes?.includes(currentUser?._id)
              ? "bg-red-600 text-white"
              : "bg-gray-200"
          }`}
        >
          ❤️ {blog.likes?.length || 0} Like
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Comments</h2>
        <div className="space-y-2 mb-4">
          {comments.map((c) => (
            <div key={c._id} className="border p-2 rounded">
              <p className="font-semibold">{c.user.name}</p>
              <p>{c.text}</p>
            </div>
          ))}
        </div>

        {currentUser && (
          <div className="flex space-x-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment"
              className="flex-1 border p-2 rounded"
            />
            <button
              onClick={handleComment}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Comment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogDetails;
