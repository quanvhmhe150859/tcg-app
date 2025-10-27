import { useEffect } from "react";
import { Outlet } from "react-router-dom";

export default function EmptyLayout() {
  useEffect(() => {
    document.body.classList.remove("dark-container")
    document.body.classList.add("bg-gray-900");
    return () => document.body.classList.remove("bg-gray-900");
  }, []);

  return (
    <div className="app">
      <Outlet />
    </div>
  );
}
