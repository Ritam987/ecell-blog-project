import React from "react";

const Footer = () => {
  return (
    <footer className="bg-darkBg text-center py-4 border-t border-neonBlue">
      <p className="text-neonBlue font-semibold">
        &copy; {new Date().getFullYear()} E-Cell Blogging Website
      </p>

      <style jsx>{`
        .bg-darkBg {
          background-color: #111; /* dark background matching site */
        }
        .text-neonBlue {
          color: #00ffff;
          text-shadow:
            0 0 5px #00ffff,
            0 0 10px #00ffff;
        }
        .border-neonBlue {
          border-color: #00ffff;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
