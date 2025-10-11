import React from "react";

const Footer = () => {
  return (
    <footer className="bg-darkBg text-center py-6 border-t border-neonBlue space-y-2">
      <p className="text-neonBlue font-semibold">
        &copy; {new Date().getFullYear()} E-Cell Blogging Website
      </p>
      <p className="text-white">
        Email:{" "}
        <a href="mailto:bcroyecell2025@gmail.com" className="text-neonPink hover:underline">
          bcroyecell2025@gmail.com
        </a>
      </p>
      <p className="text-white">
        Contact:{" "}
        <a href="tel:+919064451589" className="text-neonPink hover:underline">
          9064451589
        </a>
      </p>

      <style jsx>{`
        .bg-darkBg {
          background-color: #111; /* dark background matching site */
        }
        .text-neonBlue {
          color: #00ffff;
          text-shadow: 0 0 5px #00ffff, 0 0 10px #00ffff;
        }
        .text-neonPink {
          color: #ff00ff;
        }
        .border-neonBlue {
          border-color: #00ffff;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
