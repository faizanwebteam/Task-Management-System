// components/Footer.jsx

import React from "react";

function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-300 text-center py-3 fixed bottom-0 w-full shadow-inner">
      <p className="text-xs sm:text-sm md:text-sm lg:text-base px-2">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-white">Task Management System</span> — Built with{" "}
        <span className="text-red-500">❤️</span> using{" "}
        <span className="text-indigo-400 font-medium">MERN</span>
      </p>
    </footer>
  );
}

export default Footer;
