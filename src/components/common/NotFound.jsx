import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white text-center">
      <h1 className="text-6xl font-bold text-red-400 mb-4">404</h1>
      <p className="text-lg mb-6">Trang bạn đang truy cập không tồn tại hoặc đã bị xóa.</p>
      <button
        onClick={() => navigate("/")}
        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition"
      >
        Quay lại trang chủ
      </button>
    </div>
  );
}
