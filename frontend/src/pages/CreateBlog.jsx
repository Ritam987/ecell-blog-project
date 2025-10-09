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
    formData.append(
      "tags",
      tags ? tags.split(",").map((t) => t.trim()) : []
    );
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
    <div className="flex items-center justify-center min-h-screen bg-darkBg px-4">
      <div className="w-full max-w-xl p-6 rounded-md neon-bg shadow-neon border-neonBlue border-2">
        <h1 className="text-2xl font-bold mb-4 text-neonBlue">Create Blog</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-2 border-neonBlue p-2 rounded bg-darkBg text-white focus:outline-none focus:border-neonPink"
            required
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border-2 border-neonBlue p-2 rounded h-40 bg-darkBg text-white focus:outline-none focus:border-neonPink"
            required
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full border-2 border-neonBlue p-2 rounded bg-darkBg text-white focus:outline-none focus:border-neonPink"
          />

          {/* Neon-style file chooser */}
          <div>
            <input
              type="file"
              id="fileInput"
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
            <label
              htmlFor="fileInput"
              className="inline-block px-4 py-2 rounded cursor-pointer text-darkBg bg-neonBlue font-semibold 
                         animate-neonGlow shadow-neon transition-all duration-300"
            >
              {image ? "Change File" : "Choose File"}
            </label>
          </div>

          {/* Preview image with neon border */}
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-md mt-2 border-4 border-neonBlue shadow-neon animate-neonGlow"
            />
          )}

          <button
            type="submit"
            className="w-full bg-neonPink text-darkBg px-4 py-2 rounded font-semibold shadow-neon animate-neonGlow hover:scale-105 transition-all duration-300"
          >
            Create
          </button>
        </form>

        {/* Neon glow animations */}
        <style jsx>{`
          .darkBg { background-color: #0a0a0a; }
          .bg-darkBg { background-color: #0a0a0a; }
          .text-darkBg { color: #0a0a0a; }
          .bg-neonBlue { background-color: #0ff; }
          .border-neonBlue { border-color: #0ff; }
          .bg-neonPink { background-color: #ff00ff; }
          .text-neonBlue { color: #0ff; }
          .text-neonPink { color: #ff00ff; }
          .shadow-neon { box-shadow: 0 0 10px #0ff, 0 0 20px #0ff; }
          @keyframes neonGlow {
            0%, 100% { box-shadow: 0 0 5px #0ff, 0 0 10px #0ff, 0 0 20px #0ff; }
            50% { box-shadow: 0 0 20px #0ff, 0 0 30px #0ff, 0 0 40px #0ff; }
          }
          .animate-neonGlow {
            animation: neonGlow 1.5s infinite alternate;
          }
          .neon-bg { background-color: #0a0a0a; }
        `}</style>
      </div>
    </div>
  );
};

export default CreateBlog;
