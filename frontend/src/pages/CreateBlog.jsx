import React, { useState } from "react";
import API from "../utils/api";
import { getToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const CreateBlog = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  // Handle image preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      alert("Title and Content are required!");
      return;
    }

    try {
      // FormData for multipart/form-data
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append(
        "tags",
        tags ? tags.split(",").map((t) => t.trim()) : []
      );
      if (image) formData.append("image", image);

      // Send to backend
      await API.post("/blogs", formData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Blog created successfully!");
      navigate("/"); // Redirect to home
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error creating blog");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-4">Create Blog</h1>
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
        <input
          type="file"
          onChange={handleImageChange}
          className="w-full"
          accept="image/*"
        />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-md mt-2"
          />
        )}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create
        </button>
      </form>
    </div>
  );
};

export default CreateBlog;
