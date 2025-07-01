import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RandomCards from "./components/RandomCards";
import AdminSettings from "./components/AdminSettings";
import HamburgerMenu from "./components/HamburgerMenu";

const App = () => {
  return (
    <Router>
      <HamburgerMenu />
      <Routes>
        <Route path="/" element={<RandomCards />} />
        <Route path="/admin" element={<AdminSettings />} />
      </Routes>
    </Router>
  );
};

export default App;
