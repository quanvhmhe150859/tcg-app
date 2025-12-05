// src/layouts/MainLayout.jsx
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import HamburgerMenu from "../components/ui/HamburgerMenu";
import ScrollToTopButton from "../components/ui/ScrollToTopButton";
import Header from "./Header";
import Footer from "./Footer";
import FloatingButtons from "./FloatingButtons"; // Component mới

export default function MainLayout() {
  return (
    <div className="app">
      <Toaster position="top-center" reverseOrder={false} />
      <HamburgerMenu />
      <ScrollToTopButton />

      {/* Header */}
      <Header />

      {/* 4 nút nổi - đã được tách riêng */}
      <FloatingButtons />

      {/* Nội dung trang */}
      <Outlet />

      {/* Footer */}
      <Footer />
    </div>
  );
}