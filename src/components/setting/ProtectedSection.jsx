import { useState } from "react";
import api from "../../utils/api";

export default function ProtectedSection({ children }) {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/auth/login", { password });

      const data = res.data;
      localStorage.setItem("jwt", data.token);
      setUnlocked(true);
    } catch (err) {
      alert("Đăng nhập thất bại");
    }
  };

  return (
    <div className="relative">
      {/* Nội dung chính, bị mờ nếu chưa unlocked */}
      <div
        className={`${
          !unlocked ? "blur-[2px] brightness-75 pointer-events-none" : ""
        }`}
      >
        {children}
      </div>

      {/* Overlay nếu chưa login */}
      {!unlocked && (
        <form
          onSubmit={handleLogin}
          className="absolute left-1/2 top-1/2 w-1/2 h-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm flex 
          flex-col justify-center items-center p-4 gap-3 rounded shadow-md"
        >
          <p className="font-semibold text-black">Nhập mật khẩu:</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded px-3 py-1 text-black"
            placeholder="Password..."
          />
          <button
            type="submit"
            className="bg-black text-white px-4 py-1 rounded"
          >
            Xác nhận
          </button>
        </form>
      )}
    </div>
  );
}
