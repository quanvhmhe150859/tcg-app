import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import RandomCards from "./components/pokemon/RandomCardsPokemon";
import YugiohRoll from "./components/yugioh/RandomCardsYugioh";
import AdminSettings from "./components/setting/AdminSettings";
import HamburgerMenu from "./components/common/HamburgerMenu";
import DarkModeToggle from "./components/common/DarkModeToggle";
import "./App.css";

function setFavicon(iconUrl) {
  const link =
    document.querySelector("link[rel*='icon']") || document.createElement("link");

  link.type = "image/svg+xml";
  link.href = iconUrl;

  document.head.appendChild(link);
}

function FaviconUpdater() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/pokemon")) {
      setFavicon("/pokemon-icon.svg");
      document.title = "Pokémon TCG";
    } else if (location.pathname.startsWith("/yugioh")) {
      setFavicon("/yugioh-icon.png");
      document.title = "Yu-Gi-Oh! TCG";
    } else {
      // fallback
      setFavicon("/vite.svg");
      document.title = "TCG";
    }
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <div className="app">
        <HamburgerMenu />
        <DarkModeToggle />
        <FaviconUpdater />
        <Routes>
          <Route path="/" element={<AdminSettings />} />
          <Route path="/pokemon" element={<RandomCards />} />
          <Route path="/yugioh" element={<YugiohRoll />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
