import { Outlet } from "react-router-dom";

export default function EmptyLayout() {
  return (
    <div className="app bg-gray-900 text-white">
      <Outlet />
    </div>
  );
}
