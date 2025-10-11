import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch } from "react-icons/fi";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef(null);

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchText.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchText.trim())}`);
      setSearchText("");
      setSearchOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const linkVariants = {
    hover: { scale: 1.1, color: "#ff00ff", textShadow: "0 0 8px #ff00ff" },
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-darkBg bg-opacity-90 backdrop-blur-md border-b-2 border-neonBlue shadow-neon py-4 px-8 flex justify-between items-center">
      {/* Left: Logo + Search Icon */}
      <div className="flex items-center gap-4 relative">
        <Link
          to="/"
          className="font-bold text-2xl text-neonBlue animate-glow flex items-center gap-2"
        >
          <img src="/logo.jpg" alt="Logo" className="w-8 h-8 rounded-full" />
          E-CELL
        </Link>

        {/* Search Icon */}
        <motion.div
          className="cursor-pointer text-gray-400 z-50"
          onClick={() => setSearchOpen((prev) => !prev)}
          whileHover={{
            scale: 1.2,
            color: "#00ffff",
            textShadow: "0 0 8px #00ffff",
          }}
        >
          <FiSearch size={24} />
        </motion.div>

        {/* Search Box */}
        <AnimatePresence>
          {searchOpen && (
            <motion.form
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 250 }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSearchSubmit}
              ref={inputRef}
              className="absolute left-10 top-0 flex items-center bg-darkBg border border-neonBlue rounded overflow-hidden"
            >
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search blogs..."
                className="w-full px-3 py-1 bg-darkBg text-white outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 bg-neonBlue text-darkBg hover:bg-neonPink transition-colors"
              >
                Search
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Right Links */}
      <div className="flex gap-6 items-center">
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

      <style jsx>{`
        .bg-darkBg {
          background-color: #0a0a0a;
        }
        .text-neonBlue {
          color: #0ff;
        }
        .bg-neonPink {
          background-color: #ff00ff;
        }
        .shadow-neon {
          box-shadow: 0 0 8px #0ff, 0 0 16px #ff00ff, 0 0 24px #39ff14;
        }
        @keyframes neonGlow {
          0%,
          100% {
            text-shadow: 0 0 5px #0ff, 0 0 10px #0ff, 0 0 20px #0ff;
          }
          50% {
            text-shadow: 0 0 15px #0ff, 0 0 25px #ff00ff, 0 0 35px #39ff14;
          }
        }
        .animate-glow {
          animation: neonGlow 1.5s infinite alternate;
        }
      `}</style>
    </nav>
  );
}
