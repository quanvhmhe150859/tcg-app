import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import RandomCards from "./components/RandomCards";
import AdminSettings from "./components/AdminSettings";
import HamburgerMenu from "./components/HamburgerMenu";
import DarkModeToggle from "./components/DarkModeToggle";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <HamburgerMenu />
        <DarkModeToggle />
        <Routes>
          <Route path="/" element={<RandomCards />} />
          <Route path="/admin" element={<AdminSettings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
