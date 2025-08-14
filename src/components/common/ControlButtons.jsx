import { useOrientation } from "../context/OrientationContext";

export default function ControlButtons() {
  const { orientation, setOrientation } = useOrientation();

  return (
    <div className="flex justify-center gap-4 mt-2 w-full">
      {/* Nút dọc */}
      <button
        onClick={() => setOrientation("vertical")}
        className={`floating-button ${
          orientation === "vertical"
            ? "selected-tab shadow-lg shadow-purple-400"
            : ""
        }`}
      >
        <img
          src="/icons/vertical.png"
          alt="Dọc"
          className="transform scale-350"
        />
      </button>

      {/* Nút ngang */}
      <button
        onClick={() => setOrientation("horizontal")}
        className={`floating-button ${
          orientation === "horizontal"
            ? "selected-tab shadow-lg shadow-purple-400"
            : ""
        }`}
      >
        <img
          src="/icons/horizontal.png"
          alt="Ngang"
          className="transform scale-350"
        />
      </button>
    </div>
  );
}
