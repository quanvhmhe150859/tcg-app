import React, { Suspense, lazy, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import "./i18n";

import MainLayout from "./layouts/MainLayout";
import EmptyLayout from "./layouts/EmptyLayout";

// Lazy load các trang
const RandomCardsPokemon = lazy(() => import("./components/pokemon/RandomCardsPokemon"));
const ListCardsPokemon = lazy(() => import("./components/pokemon/ListCardsPokemon"));
const OwnedPokemonCards = lazy(() => import("./components/pokemon/OwnedPokemonCards"));
const RandomCardsYugioh = lazy(() => import("./components/yugioh/RandomCardsYugioh"));
const ListCardsYugioh = lazy(() => import("./components/yugioh/ListCardsYugioh"));
const OwnedYugiohCards = lazy(() => import("./components/yugioh/OwnedYugiohCards"));
const CharacterSelection = lazy(() => import("./game/CharacterSelection"));
const BattleGame = lazy(() => import("./game/BattleGame"));
const Chatbot = lazy(() => import("./bot/Chatbot"));
const ImageGenerator = lazy(() => import("./bot/Artbot"));
const AdminSettings = lazy(() => import("./components/setting/AdminSettings"));
const NotFound = lazy(() => import("./components/common/NotFound"));

// === FaviconUpdater giữ nguyên ===
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

export default function App() {
  return (
    <Router>
      <FaviconUpdater />
      <Suspense fallback={<div className="text-center text-white mt-8">Loading...</div>}>
        <Routes>
          {/* 🧭 Layout chính */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<AdminSettings />} />
            <Route path="/pokemon" element={<RandomCardsPokemon />} />
            <Route path="/pokemonls" element={<ListCardsPokemon />} />
            <Route path="/pokemonowned" element={<OwnedPokemonCards />} />
            <Route path="/yugioh" element={<RandomCardsYugioh />} />
            <Route path="/yugiohls" element={<ListCardsYugioh />} />
            <Route path="/yugiohowned" element={<OwnedYugiohCards />} />
            <Route path="/characterselection" element={<CharacterSelection />} />
            <Route path="/game" element={<BattleGame />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/imagegenerator" element={<ImageGenerator />} />
          </Route>

          {/* ⚠️ Layout rỗng - chỉ dành cho trang đặc biệt */}
          <Route element={<EmptyLayout />}>
            <Route path="/404" element={<NotFound />} />
          </Route>

          {/* Route fallback */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
