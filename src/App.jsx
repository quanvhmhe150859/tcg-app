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
          <HamburgerMenu darkMode={darkMode} setDarkMode={setDarkMode} />
        <nav>
          <button onClick={() => setDarkMode(!darkMode)} style={{ float: "right" }}>
            {darkMode ? "☀️" : "🌙"}
          </button>
        </nav>
        <Routes>
          <Route path="/" element={<RandomCards darkMode={darkMode} />} />
          <Route path="/admin" element={<AdminSettings darkMode={darkMode} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
