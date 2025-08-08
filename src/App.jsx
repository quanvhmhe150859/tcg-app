import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import RandomCardsPokemon from "./components/pokemon/RandomCardsPokemon";
import PokemonCardList from "./components/pokemon/CardsListPokemon";

import RandomCardsYugioh from "./components/yugioh/RandomCardsYugioh";
import YugiohCardList from "./components/yugioh/CardsListYugioh";

import TextStatGame from "./game/AutoGame"

import AdminSettings from "./components/setting/AdminSettings";
import HamburgerMenu from "./components/common/HamburgerMenu";
import DarkModeToggle from "./components/common/DarkModeToggle";
import ScrollToTopButton from "./components/common/ScrollToTopButton";
import MusicToggleButton from "./components/common/MusicToggleButton";
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
        <ScrollToTopButton />
        <MusicToggleButton />
        <Routes>
          <Route path="/" element={<AdminSettings />} />
          <Route path="/pokemon" element={<RandomCardsPokemon />} />
          <Route path="/pokemonls" element={<PokemonCardList />} />
          <Route path="/yugioh" element={<RandomCardsYugioh />} />
          <Route path="/yugiohls" element={<YugiohCardList />} />
          <Route path="/game" element={<TextStatGame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
