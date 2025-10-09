import React from "react";

const Footer = () => {
  return (
    <footer className="bg-darkBg p-4 text-center relative">
      <p className="text-neonBlue font-bold text-lg animate-neonGlow">
        &copy; {new Date().getFullYear()} E-Cell Blogging Website
      </p>

      {/* Neon glow shadow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full shadow-neon rounded"></div>
      </div>

      <style jsx>{`
        .text-neonBlue {
          color: #00ffff;
          text-shadow:
            0 0 5px #00ffff,
            0 0 10px #00ffff,
            0 0 20px #00ffff,
            0 0 40px #00ffff;
        }

        .animate-neonGlow {
          animation: neonPulse 1.5s infinite alternate;
        }

        @keyframes neonPulse {
          from {
            text-shadow:
              0 0 5px #00ffff,
              0 0 10px #00ffff,
              0 0 20px #00ffff,
              0 0 40px #00ffff;
          }
          to {
            text-shadow:
              0 0 10px #00ffff,
              0 0 20px #00ffff,
              0 0 30px #00ffff,
              0 0 60px #00ffff;
          }
        }

        .shadow-neon {
          box-shadow:
            0 0 10px #00ffff,
            0 0 20px #00ffff,
            0 0 30px #00ffff,
            0 0 40px #00ffff inset;
          border-radius: 4px;
        }

        .bg-darkBg {
          background-color: #111; /* dark background for neon */
        }
      `}</style>
    </footer>
  );
};

export default Footer;
