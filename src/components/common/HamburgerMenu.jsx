import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./HamburgerMenu.css"; // 👈 import file css

const HamburgerMenu = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="hamburger-button w-10 h-10 flex items-center justify-center text-xl hover:bg-gray-200 rounded"
        aria-label="Toggle menu"
      >
        {open ? "❌" : "☰"}
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="hamburger-overlay"
          />
        )}
      </AnimatePresence>

      {/* Side Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="hamburger-menu"
          >
            <div className="hamburger-menu-content">
              <h1 className="text-2xl font-bold">📂 Menu</h1>
              <ul>
                <li>
                  <Link to="/pokemon" onClick={() => setOpen(false)}>
                    🏠 Trang Pokémon
                  </Link>
                </li>
                <li>
                  <Link to="/yugioh" onClick={() => setOpen(false)}>
                    🏠 Trang Yu-Gi-Oh!
                  </Link>
                </li>
                <li>
                  <Link to="/" onClick={() => setOpen(false)}>
                    ⚙️ Trang Admin
                  </Link>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HamburgerMenu;
