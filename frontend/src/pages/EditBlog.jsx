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
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <div className="flex items-center justify-center min-h-screen bg-darkBg px-4">
      <div className="w-full max-w-xl p-6 rounded-lg neon-bg shadow-neon border border-neonBlue">
        <h1 className="text-2xl font-bold text-neonBlue mb-4">Edit Blog</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-2 border-neonBlue p-2 rounded bg-darkBg text-white placeholder-gray-400 focus:outline-none focus:border-neonPink"
            required
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border-2 border-neonBlue p-2 rounded h-40 bg-darkBg text-white placeholder-gray-400 focus:outline-none focus:border-neonPink"
            required
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full border-2 border-neonBlue p-2 rounded bg-darkBg text-white placeholder-gray-400"
          />

          {currentImage && !preview && (
            <img
              src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://ecell-blog-project.onrender.com'}${currentImage}`}
              alt="Current"
              className="w-full h-48 object-cover rounded mb-2 border-2 border-neonBlue shadow-neon"
            />
          )}

          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded mb-2 border-2 border-neonPink shadow-neon"
            />
          )}

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
              className="inline-block bg-darkBg text-neonBlue px-4 py-2 rounded cursor-pointer
                         hover:bg-neonBlue hover:text-darkBg transition-all duration-300 shadow-neon animate-glow"
            >
              {image ? "Change File" : "Choose File"}
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-neonBlue text-darkBg px-4 py-2 rounded shadow-neon hover:shadow-neonHover transition-all duration-300"
          >
            Update
          </button>
        </form>

        {/* Neon glow animation */}
        <style jsx>{`
          .neon-bg { background-color: #0a0a0a; }
          .shadow-neon {
            box-shadow: 0 0 10px #39ff14, 0 0 20px #39ff14, 0 0 30px #39ff14;
          }
          .shadow-neonHover:hover {
            box-shadow: 0 0 15px #39ff14, 0 0 25px #39ff14, 0 0 35px #39ff14;
          }
          .animate-glow {
            animation: neonGlow 1.5s infinite alternate;
          }
          @keyframes neonGlow {
            from {
              box-shadow: 0 0 5px #39ff14, 0 0 10px #39ff14, 0 0 20px #39ff14;
            }
            to {
              box-shadow: 0 0 15px #39ff14, 0 0 30px #39ff14, 0 0 45px #39ff14;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default EditBlog;
