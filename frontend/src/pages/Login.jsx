import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      const { user, token } = res.data;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      navigate("/"); 
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-darkBg">
      <div className="w-full max-w-md p-6 bg-darkBg border border-neonBlue rounded-md shadow-neon">
        <h2 className="text-2xl font-bold mb-4 text-neonBlue text-center">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border border-neonBlue bg-darkBg text-white rounded placeholder-neonBlue focus:outline-none focus:ring-2 focus:ring-neonBlue transition-all duration-300"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border border-neonBlue bg-darkBg text-white rounded placeholder-neonBlue focus:outline-none focus:ring-2 focus:ring-neonBlue transition-all duration-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded bg-neonBlue text-darkBg hover:bg-neonPink hover:text-darkBg transition-all duration-300 shadow-neon animate-neonGlow"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
