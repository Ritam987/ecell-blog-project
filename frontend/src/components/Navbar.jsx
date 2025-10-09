import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  // Framer Motion variants for link hover
  const linkVariants = {
    hover: { scale: 1.1, color: "#ff00ff", textShadow: "0 0 8px #ff00ff" },
  };

  return (
    <nav className="bg-cardBg text-textLight p-4 shadow-neon fixed w-full z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="font-bold text-lg flex items-center gap-2">
          <img
            src="/logo.jpg" // Replace with your logo path
            alt="Logo"
            className="w-8 h-8 rounded-full"
          />
          E-CELL
        </Link>

        <div className="flex gap-4 items-center">
          <motion.div variants={linkVariants} whileHover="hover">
            <Link to="/">Home</Link>
          </motion.div>

          {user ? (
            <>
              <motion.div variants={linkVariants} whileHover="hover">
                <Link to="/create">Create Post</Link>
              </motion.div>
              <motion.div variants={linkVariants} whileHover="hover">
                <Link to="/admin">Admin</Link>
              </motion.div>
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.1, boxShadow: "0 0 10px #ff00ff" }}
                className="bg-neonPink px-3 py-1 rounded shadow-neon transition-shadow duration-300"
              >
                Logout
              </motion.button>
            </>
          ) : (
            <>
              <motion.div variants={linkVariants} whileHover="hover">
                <Link to="/login">Login</Link>
              </motion.div>
              <motion.div variants={linkVariants} whileHover="hover">
                <Link to="/register">Register</Link>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
