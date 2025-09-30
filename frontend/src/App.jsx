import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateBlog from "./pages/CreateBlog";
import EditBlog from "./pages/EditBlog"; // Edit Blog page
import BlogDetails from "./pages/BlogDetails";
import AdminPanel from "./pages/AdminPanel";

// Chatbot
import Chatbot from "./components/Chatbot";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="min-h-[80vh]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create" element={<CreateBlog />} />
          <Route path="/blog/:id" element={<BlogDetails />} />
          <Route path="/blog/:id/edit" element={<EditBlog />} /> {/* Edit Route */}
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
      <Footer />
      {/* Chatbot Widget */}
      <Chatbot />
    </BrowserRouter>
  );
}

export default App;
