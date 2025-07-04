import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import RandomCards from "./components/RandomCards";
import AdminSettings from "./components/AdminSettings";
import HamburgerMenu from "./components/HamburgerMenu";

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    document.body.className = darkMode ? "dark-container" : "light-container";
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <Router>
      <div className="app">
        <HamburgerMenu />
        <nav>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{ float: "right", background: "var(--color-button-bg)" }}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </nav>
        <Routes>
          <Route path="/" element={<RandomCards />} />
          <Route path="/admin" element={<AdminSettings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
