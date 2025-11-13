import React, {
  useState,
  useEffect,
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react";
import { loadCharacter } from "../lib/characterLoader";
import SpriteSheetPlayerCore from "./SpriteSheetPlayerCore";

const SpriteSheetPlayer = forwardRef(
  ({ characterName, defaultAction = "idle", flipped = false }, ref) => {
    const [characterData, setCharacterData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const coreRef = useRef(null);

    useEffect(() => {
      let mounted = true;
      setLoading(true);
      setError(null);

      loadCharacter(characterName)
        .then((data) => {
          if (mounted) {
            console.log("✅ Loaded character:", characterName, data); // Debug
            setCharacterData(data);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (mounted) {
            console.error("❌ Load character error:", err);
            setError(err.message);
            setLoading(false);
          }
        });

      return () => {
        mounted = false;
      };
    }, [characterName]);

    // 🔥 FORWARD REF - ĐÃ FIX
    // SpriteSheetPlayer.jsx
    // Chỉ cần update useImperativeHandle
    useImperativeHandle(
      ref,
      () => ({
        playAction: (action) => coreRef.current?.playAction(action),
        toggleAutoAttack: () => coreRef.current?.toggleAutoAttack(), // 🔥 Tên mới
        stopAutoAttack: () => coreRef.current?.stopAutoAttack(),
        getState: () => coreRef.current?.getState?.() || {},
      }),
      []
    );

    if (loading)
      return (
        <div className="p-6 text-center text-gray-600 animate-pulse">
          Đang tải <strong>{characterName}</strong>...
        </div>
      );
    if (error)
      return (
        <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg">
          Lỗi: {error}
        </div>
      );
    if (!characterData)
      return (
        <div className="p-6 text-center text-gray-600">
          Không tìm thấy dữ liệu
        </div>
      );

    return (
      <SpriteSheetPlayerCore
        ref={coreRef}
        characterData={characterData}
        defaultAction={defaultAction}
        flipped={flipped}
      />
    );
  }
);

SpriteSheetPlayer.displayName = "SpriteSheetPlayer";
export default SpriteSheetPlayer;
