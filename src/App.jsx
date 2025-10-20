import React, { Suspense, lazy, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import HamburgerMenu from "./components/common/HamburgerMenu";
import DarkModeToggle from "./components/common/DarkModeToggleButton";
import LanguageSwitcher from "./components/common/LanguageSwitcherButton";
import MusicToggleButton from "./components/common/MusicToggleButton";
import TicketCount from "./components/common/TicketCount";
import ScrollToTopButton from "./components/common/ScrollToTopButton";
import "./App.css";
import "./i18n";
import { useOrientation } from "./components/context/OrientationContext";

// ⚡ Lazy load tất cả các trang
const RandomCardsPokemon = lazy(() =>
  import("./components/pokemon/RandomCardsPokemon")
);
const ListCardsPokemon = lazy(() =>
  import("./components/pokemon/ListCardsPokemon")
);
const OwnedPokemonCards = lazy(() =>
  import("./components/pokemon/OwnedPokemonCards")
);

const RandomCardsYugioh = lazy(() =>
  import("./components/yugioh/RandomCardsYugioh")
);
const ListCardsYugioh = lazy(() =>
  import("./components/yugioh/ListCardsYugioh")
);
const OwnedYugiohCards = lazy(() =>
  import("./components/yugioh/OwnedYugiohCards")
);

const CharacterSelection = lazy(() => import("./game/CharacterSelection"));
const BattleGame = lazy(() => import("./game/BattleGame"));
const Chatbot = lazy(() => import("./bot/Chatbot"));
const ImageGenerator = lazy(() => import("./bot/Artbot"));
const AdminSettings = lazy(() => import("./components/setting/AdminSettings"));

const NotFound = lazy(() => import("./components/common/NotFound"));

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
    { id: 4, component: <TicketCount /> },
  ];

  return (
    <Router>
      <div className="app">
        <FaviconUpdater />

        <Toaster position="top-center" reverseOrder={false} />

        <>
          <HamburgerMenu />
          <ScrollToTopButton />

          {/* Các nút nổi */}
          {buttons.map((btn, i) => {
            const style =
              orientation === "vertical"
                ? { top: `${15 + i * 60}px`, right: "15px" }
                : { top: "15px", right: `${15 + i * 60}px` };
            return (
              <div key={btn.id} className="fixed z-999" style={style}>
                {btn.component}
              </div>
            );
          })}
        </>

        {/* ⚙️ Suspense hiển thị khi đang load trang */}
        <Suspense
          fallback={
            <div className="text-center text-white mt-8">Loading...</div>
          }
        >
          <Routes>
            <Route path="/" element={<AdminSettings />} />

            <Route path="/pokemon" element={<RandomCardsPokemon />} />
            <Route path="/pokemonls" element={<ListCardsPokemon />} />
            <Route path="/pokemonowned" element={<OwnedPokemonCards />} />
            <Route path="/yugioh" element={<RandomCardsYugioh />} />
            <Route path="/yugiohls" element={<ListCardsYugioh />} />
            <Route path="/yugiohowned" element={<OwnedYugiohCards />} />

            <Route
              path="/characterselection"
              element={<CharacterSelection />}
            />
            <Route path="/game" element={<BattleGame />} />

            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/imagegenerator" element={<ImageGenerator />} />

            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
