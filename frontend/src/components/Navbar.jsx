import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, removeToken } from "../utils/auth";

const Navbar = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
      <div className="text-2xl font-bold">
        <Link to="/">E-Cell Blog</Link>
      </div>

      <div className="flex items-center space-x-4">
        <Link to="/" className="hover:underline">
          Home
        </Link>

        {user && (
          <>
            <Link to="/create" className="hover:underline">
              Create Blog
            </Link>

            {user.role === "admin" && (
              <Link to="/admin" className="hover:underline">
                Admin Panel
              </Link>
            )}

            <span className="font-semibold">{user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        )}

        {!user && (
          <>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/register" className="hover:underline">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
