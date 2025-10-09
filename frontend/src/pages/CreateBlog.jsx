import React, { useState } from "react";
import API from "../utils/api";
import { getToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const CreateBlog = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

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
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("tags", tags ? tags.split(",").map((t) => t.trim()) : []);
    if (image) formData.append("image", image);

    try {
      await API.post("/blogs", formData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Blog created successfully!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error creating blog");
    }
  };

  return (
    <motion.div
      className="max-w-xl mx-auto mt-10 bg-darkBg p-6 rounded-lg shadow-neon"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-2xl font-bold mb-4 text-neonBlue">Create Blog</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-neonBlue bg-darkBg text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-neonBlue"
          required
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border border-neonBlue bg-darkBg text-white p-2 rounded h-40 focus:outline-none focus:ring-2 focus:ring-neonBlue"
          required
        />
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full border border-neonBlue bg-darkBg text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-neonBlue"
        />
        <input
          type="file"
          onChange={handleImageChange}
          className="w-full text-white"
          accept="image/*"
        />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-md mt-2 border border-neonBlue"
          />
        )}
        <motion.button
          type="submit"
          className="bg-neonBlue text-darkBg px-4 py-2 rounded shadow-neon transition-all duration-300"
          whileHover={{ scale: 1.05, boxShadow: "0 0 10px #39ff14" }}
          whileTap={{ scale: 0.95 }}
        >
          Create
        </motion.button>
      </form>
    </motion.div>
  );
};

export default CreateBlog;
