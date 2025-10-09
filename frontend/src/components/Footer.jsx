import React from "react";

const Footer = () => {
  return (
    <footer className="bg-darkBg text-neonBlue p-4 text-center shadow-neon mt-8">
      &copy; {new Date().getFullYear()} E-Cell Blogging Website
    </footer>
  );
};

export default Footer;
