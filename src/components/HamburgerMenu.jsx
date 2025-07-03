import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const HamburgerMenu = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          top: 15,
          left: 15,
          background: "transparent",
          border: "none",
          fontSize: "2rem",
          zIndex: 1002,
          cursor: "pointer",
        }}
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
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "#000",
              zIndex: 1000,
            }}
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
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "200px",
              height: "100vh",
              background: "#333",
              color: "#fff",
              padding: "2rem 1rem",
              zIndex: 1001,
              boxShadow: "2px 0 6px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ marginTop: "3rem", marginLeft: "1rem" }}>
              <h3>📂 Menu</h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                <li>
                  <Link
                    to="/"
                    style={{ color: "#fff", textDecoration: "none" }}
                    onClick={() => setOpen(false)}
                  >
                    🏠 Trang chính
                  </Link>
                </li>
                <li style={{ marginTop: "1rem" }}>
                  <Link
                    to="/admin"
                    style={{ color: "#fff", textDecoration: "none" }}
                    onClick={() => setOpen(false)}
                  >
                    ⚙️ Trang admin
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
