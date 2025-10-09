import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../utils/api";
import { motion } from "framer-motion";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await API.post("/auth/register", { name, email, password });
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-darkBg">
      <div className="w-full max-w-md p-6 bg-darkBg border border-neonBlue rounded shadow-neon">
        <h2 className="text-3xl font-bold mb-6 text-neonBlue text-center">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-neonPink">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-darkBg border border-neonPink px-3 py-2 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neonPink transition-all duration-300"
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-neonGreen">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-darkBg border border-neonGreen px-3 py-2 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neonGreen transition-all duration-300"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-neonBlue">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-darkBg border border-neonBlue px-3 py-2 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neonBlue transition-all duration-300"
              placeholder="Enter your password"
              required
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-neonBlue text-darkBg px-4 py-2 rounded shadow-neon hover:shadow-neonHover transition-all duration-300"
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px #00fff7" }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? "Registering..." : "Register"}
          </motion.button>
        </form>

        <p className="mt-4 text-white text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-neonPink hover:text-neonBlue">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
