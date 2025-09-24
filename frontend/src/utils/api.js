import axios from "axios";

// Create Axios instance for backend API
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://ecell-blog-project.onrender.com/api",
});

// Attach JWT token to every request if available
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
}, (error) => {
  return Promise.reject(error);
});

export default API;
