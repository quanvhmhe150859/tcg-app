import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import RandomCardsPokemon from "./components/pokemon/RandomCardsPokemon";
import ListCardsPokemon from "./components/pokemon/ListCardsPokemon";

import RandomCardsYugioh from "./components/yugioh/RandomCardsYugioh";
import ListCardsYugioh from "./components/yugioh/ListCardsYugioh";

import TextStatGame from "./game/AutoGame";

import AdminSettings from "./components/setting/AdminSettings";
import HamburgerMenu from "./components/common/HamburgerMenu";
import DarkModeToggle from "./components/common/DarkModeToggle";
import ScrollToTopButton from "./components/common/ScrollToTopButton";
import MusicToggleButton from "./components/common/MusicToggleButton";
import "./App.css";
import LanguageSwitcher from "./components/common/LanguageSwitcher";
import "./i18n";
import { useOrientation } from "./components/context/OrientationContext";

function setFavicon(iconUrl) {
  const link =
    document.querySelector("link[rel*='icon']") ||
    document.createElement("link");

  link.type = "image/svg+xml";
  link.href = iconUrl;

  document.head.appendChild(link);
}

function FaviconUpdater() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/pokemon")) {
      setFavicon("/icons/pokemon-icon.svg");
      document.title = "Pokémon TCG";
    } else if (location.pathname.startsWith("/yugioh")) {
      setFavicon("/icons/yugioh-icon.png");
      document.title = "Yu-Gi-Oh! TCG";
    } else if (location.pathname.startsWith("/game")) {
      setFavicon("/icons/game-icon.png");
      document.title = "Game";
    } else {
      setFavicon("/icons/vite-icon.svg");
      document.title = "TCG";
    }
  }, [location.pathname]);

  return null;
}

function App() {
  const { orientation } = useOrientation();

  const buttons = [
    { id: 1, component: <DarkModeToggle /> },
    { id: 2, component: <LanguageSwitcher /> },
    { id: 3, component: <MusicToggleButton /> },
  ];

  return (
    <Router>
      <div className="app">
        <FaviconUpdater />
        <HamburgerMenu />
        <ScrollToTopButton />

        <>
          {buttons.map((btn, i) => {
            const offset = 15 + i * 60; // khoảng cách 60px mỗi nút
            const style =
              orientation === "vertical"
                ? { top: `${15 + i * 60}px`, right: "15px" }
                : { top: "15px", right: `${15 + i * 60}px` };

            return (
              <div
                key={btn.id}
                className="fixed z-999"
                style={style}
              >
                {btn.component}
              </div>
            );
          })}
        </>

        <Routes>
          <Route path="/" element={<AdminSettings />} />
          <Route path="/pokemon" element={<RandomCardsPokemon />} />
          <Route path="/pokemonls" element={<ListCardsPokemon />} />
          <Route path="/yugioh" element={<RandomCardsYugioh />} />
          <Route path="/yugiohls" element={<ListCardsYugioh />} />
          <Route path="/game" element={<TextStatGame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
