import React from "react";

const Footer = () => {
  return (
    <footer className="bg-blue-600 text-white p-4 text-center">
      &copy; {new Date().getFullYear()} E-Cell Blogging Website
    </footer>
  );
};

export default Footer;
