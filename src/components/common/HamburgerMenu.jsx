import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ControlButtons from "./ControlButtons";
import "./HamburgerMenu.css";

const HamburgerMenu = () => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState({
    pokemon: false,
    yugioh: false,
  });

  const toggleExpand = (section) => {
    setExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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
                  <Link to="/" onClick={() => setOpen(false)}>
                    ⚙️ Settings
                  </Link>
                </li>
                <li>
                  <Link
                    to=""
                    onClick={(e) => {
                      e.preventDefault();
                      toggleExpand("pokemon");
                    }}
                    className="flex items-center"
                  >
                    🏠 <span className="rainbow-text font-bold">Pokémon</span>{" "}
                    {expanded.pokemon ? "▼" : "▶"}
                  </Link>
                  <AnimatePresence>
                    {expanded.pokemon && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="submenu"
                      >
                        <li>
                          <Link
                            to="/pokemon"
                            onClick={() => setOpen(false)}
                            className="submenu-item"
                          >
                            🎰 Pokémon Gacha
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/pokemonls"
                            onClick={() => setOpen(false)}
                            className="submenu-item"
                          >
                            📋 Pokémon List
                          </Link>
                        </li>
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
                <li>
                  <Link
                    to=""
                    onClick={(e) => {
                      e.preventDefault();
                      toggleExpand("yugioh");
                    }}
                    className="flex items-center"
                  >
                    🏠 <span className="rainbow-text font-bold">Yu-Gi-Oh!</span>{" "}
                    {expanded.yugioh ? "▼" : "▶"}
                  </Link>
                  <AnimatePresence>
                    {expanded.yugioh && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="submenu"
                      >
                        <li>
                          <Link
                            to="/yugioh"
                            onClick={() => setOpen(false)}
                            className="submenu-item"
                          >
                            🎰 Yu-Gi-Oh! Gacha
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/yugiohls"
                            onClick={() => setOpen(false)}
                            className="submenu-item"
                          >
                            📋 Yu-Gi-Oh! List
                          </Link>
                        </li>
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
                <li>
                  <Link to="/game" onClick={() => setOpen(false)}>
                    🧩 Game
                  </Link>
                </li>
              </ul>
            </div>            
            <div className="absolute inset-x-0 bottom-0 p-3">
              <ControlButtons />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HamburgerMenu;
