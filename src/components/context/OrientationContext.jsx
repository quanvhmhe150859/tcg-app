import { createContext, useContext, useState } from "react";

const OrientationContext = createContext();

export function OrientationProvider({ children }) {
  // Khởi tạo trực tiếp từ localStorage
  const [orientation, setOrientation] = useState(() => {
    return localStorage.getItem("buttonOrientation") || "vertical";
  });

  // Cập nhật localStorage mỗi khi orientation đổi
  const changeOrientation = (value) => {
    setOrientation(value);
    localStorage.setItem("buttonOrientation", value);
  };

  return (
    <OrientationContext.Provider value={{ orientation, setOrientation: changeOrientation }}>
      {children}
    </OrientationContext.Provider>
  );
}

export function useOrientation() {
  return useContext(OrientationContext);
}
