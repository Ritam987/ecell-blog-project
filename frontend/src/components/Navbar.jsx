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

  const linkVariants = {
    hover: { scale: 1.1, color: "#ff00ff", textShadow: "0 0 8px #ff00ff" },
  };

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 w-11/12 md:w-4/5 z-50 bg-darkBg bg-opacity-80 backdrop-blur-lg rounded-3xl border-2 border-neonBlue shadow-neon p-4">
      <div className="flex justify-between items-center">
        <Link to="/" className="font-bold text-2xl text-neonBlue animate-glow flex items-center gap-2">
          <img src="/logo.jpg" alt="Logo" className="w-8 h-8 rounded-full" />
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
                className="bg-neonPink px-3 py-1 rounded-2xl shadow-neon transition-shadow duration-300"
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

      {/* Neon glow styles */}
      <style jsx>{`
        .bg-darkBg { background-color: #0a0a0a; }
        .text-neonBlue { color: #0ff; }
        .bg-neonPink { background-color: #ff00ff; }
        .shadow-neon {
          box-shadow: 0 0 10px #0ff, 0 0 20px #ff00ff, 0 0 30px #39ff14;
        }
        @keyframes neonGlow {
          0%, 100% { text-shadow: 0 0 5px #0ff, 0 0 10px #0ff, 0 0 20px #0ff; }
          50% { text-shadow: 0 0 20px #0ff, 0 0 30px #ff00ff, 0 0 40px #39ff14; }
        }
        .animate-glow {
          animation: neonGlow 1.5s infinite alternate;
        }
      `}</style>
    </nav>
  );
}
