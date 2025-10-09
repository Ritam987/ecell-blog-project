import React, { useEffect, useState } from "react";
import API from "../utils/api";
import { Link } from "react-router-dom";
import { getUser } from "../utils/auth";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const currentUser = getUser();

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error fetching users");
    }
  };

  const fetchBlogs = async () => {
    try {
      const res = await API.get("/blogs");
      setBlogs(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error fetching blogs");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchBlogs();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await API.delete(`/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting user");
    }
  };

  const handleDeleteBlog = async (id, authorId) => {
    if (!window.confirm("Delete this blog?")) return;
    if (currentUser._id !== authorId && currentUser.role !== "admin") {
      return alert("You are not authorized to delete this blog");
    }
    try {
      await API.delete(`/blogs/${id}`);
      setBlogs(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting blog");
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8 bg-darkBg text-white min-h-screen">
      <h1 className="text-4xl font-bold text-neonBlue mb-6">Admin Panel</h1>

      <section>
        <h2 className="text-3xl font-semibold text-neonPink mb-4">Users</h2>
        <table className="w-full border border-neonBlue">
          <thead>
            <tr className="bg-darkBg border-b border-neonBlue">
              <th className="p-2 border border-neonBlue">Name</th>
              <th className="p-2 border border-neonBlue">Email</th>
              <th className="p-2 border border-neonBlue">Role</th>
              <th className="p-2 border border-neonBlue">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="hover:bg-gray-900">
                <td className="p-2 border border-neonBlue">{u.name}</td>
                <td className="p-2 border border-neonBlue">{u.email}</td>
                <td className="p-2 border border-neonBlue">{u.role}</td>
                <td className="p-2 border border-neonBlue">
                  <button
                    onClick={() => handleDeleteUser(u._id)}
                    className="bg-neonRed text-darkBg px-2 py-1 rounded shadow-neon hover:shadow-neonHover transition-all duration-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-3xl font-semibold text-neonGreen mb-4">Blogs</h2>
        <table className="w-full border border-neonGreen">
          <thead>
            <tr className="bg-darkBg border-b border-neonGreen">
              <th className="p-2 border border-neonGreen">Title</th>
              <th className="p-2 border border-neonGreen">Author</th>
              <th className="p-2 border border-neonGreen">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map(b => (
              <tr key={b._id} className="hover:bg-gray-900">
                <td className="p-2 border border-neonGreen">{b.title}</td>
                <td className="p-2 border border-neonGreen">{b.author.name}</td>
                <td className="p-2 border border-neonGreen flex space-x-2">
                  <Link
                    to={`/blog/${b._id}/edit`}
                    className="bg-neonBlue text-darkBg px-2 py-1 rounded shadow-neon hover:shadow-neonHover transition-all duration-300"
                  >
                    Edit
                  </Link>
                  {(currentUser._id === b.author._id || currentUser.role === "admin") && (
                    <button
                      onClick={() => handleDeleteBlog(b._id, b.author._id)}
                      className="bg-neonRed text-darkBg px-2 py-1 rounded shadow-neon hover:shadow-neonHover transition-all duration-300"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminPanel;
