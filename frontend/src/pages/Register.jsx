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
    <div className="max-w-md mx-auto mt-10 p-6 bg-darkBg border border-neonBlue rounded shadow-neon">
      <h2 className="text-3xl font-bold mb-6 text-neonBlue">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-neonPink">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-neonPink bg-darkBg px-3 py-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-neonPink"
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-neonGreen">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-neonGreen bg-darkBg px-3 py-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-neonGreen"
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-neonBlue">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-neonBlue bg-darkBg px-3 py-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-neonBlue"
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

      <p className="mt-4 text-white">
        Already have an account?{" "}
        <Link to="/login" className="text-neonPink hover:text-neonBlue">
          Login
        </Link>
      </p>
    </div>
  );
}
