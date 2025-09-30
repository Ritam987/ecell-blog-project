import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";
import { getToken } from "../utils/auth";

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null); // New image file
  const [preview, setPreview] = useState(null); // Image preview
  const [currentImage, setCurrentImage] = useState(null); // Existing image

  // Fetch blog details
  const fetchBlog = async () => {
    try {
      const res = await API.get(`/blogs/${id}`);
      setTitle(res.data.title);
      setContent(res.data.content);
      setTags(res.data.tags.join(","));
      setCurrentImage(res.data.image);
    } catch (err) {
      alert(err.response?.data?.message || "Error fetching blog");
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [id]);

  // Handle image selection and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  // Submit updated blog
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!title.trim() || !content.trim()) {
      alert("Title and Content cannot be empty");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("tags", tags.split(","));
    if (image) formData.append("image", image);

    try {
      await API.put(`/blogs/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Blog updated successfully!");
      navigate(`/blog/${id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Error updating blog");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-4">Edit Blog</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border p-2 rounded h-40"
          required
        />
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full border p-2 rounded"
        />

        {/* Existing image */}
        {currentImage && !preview && (
          <img
            src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://ecell-blog-project.onrender.com'}/blogs/file/${blog.imageId}`}
            alt="Current"
            className="w-full h-48 object-cover rounded mb-2"
          />
        )}

        {/* Preview of new image */}
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded mb-2"
          />
        )}

        <input
          type="file"
          onChange={handleImageChange}
          className="w-full"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Update
        </button>
      </form>
    </div>
  );
};

export default EditBlog;
