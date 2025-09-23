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
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Admin Panel</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Users</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td className="p-2 border">{u.name}</td>
                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border">{u.role}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleDeleteUser(u._id)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
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
        <h2 className="text-2xl font-semibold mb-2">Blogs</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Author</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map(b => (
              <tr key={b._id}>
                <td className="p-2 border">{b.title}</td>
                <td className="p-2 border">{b.author.name}</td>
                <td className="p-2 border flex space-x-2">
                  <Link
                    to={`/blog/${b._id}/edit`}
                    className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                  >
                    Edit
                  </Link>
                  {(currentUser._id === b.author._id || currentUser.role === "admin") && (
                    <button
                      onClick={() => handleDeleteBlog(b._id, b.author._id)}
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
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
