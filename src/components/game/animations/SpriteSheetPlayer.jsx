// SpriteSheetPlayer.jsx
import React, {
  useState,
  useEffect,
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react";
import { loadCharacter } from "../lib/characterLoader";
import { AVAILABLE_CHARACTERS } from "../lib/characters";
import SpriteSheetPlayerCore from "./SpriteSheetPlayerCore";

const SpriteSheetPlayer = forwardRef(
  (
    {
      characterName,
      defaultAction = "idle",
      flipped = false,
      distance,
      health = 1,
      ...rest
    },
    ref
  ) => {
    const [characterData, setCharacterData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedName, setSelectedName] = useState(null);
    const coreRef = useRef(null);

    // Lưu trạng thái health trước đó
    const prevHealthRef = useRef(health);

    const isRandom = characterName === "random";
    const finalCharacterName = isRandom ? selectedName : characterName;

    // RANDOM KHI KHỞI TẠO
    useEffect(() => {
      if (isRandom && !selectedName) {
        const newName =
          AVAILABLE_CHARACTERS[
            Math.floor(Math.random() * AVAILABLE_CHARACTERS.length)
          ];
        setSelectedName(newName);
      }
    }, [isRandom, selectedName]);

    // CHỈ RANDOM KHI HỒI MÁU (từ 0 → > 0)
    useEffect(() => {
      const prevHealth = prevHealthRef.current;
      const currentHealth = health;

      if (isRandom && prevHealth === 0 && currentHealth > 0) {
        // Hồi sinh → chọn nhân vật mới
        const newName =
          AVAILABLE_CHARACTERS[
            Math.floor(Math.random() * AVAILABLE_CHARACTERS.length)
          ];
        setSelectedName(newName);
      }

      prevHealthRef.current = currentHealth;
    }, [health, isRandom]);

    // RESET KHI KHÔNG DÙNG RANDOM
    useEffect(() => {
      if (!isRandom) {
        setSelectedName(null);
      }
    }, [isRandom]);

    // LOAD CHARACTER
    useEffect(() => {
      let mounted = true;
      if (!finalCharacterName) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      loadCharacter(finalCharacterName)
        .then((data) => {
          if (mounted) {
            setCharacterData(data);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (mounted) {
            setError(err.message);
            setLoading(false);
          }
        });

      return () => {
        mounted = false;
      };
    }, [finalCharacterName]);

    // FORWARD REF
    useImperativeHandle(
      ref,
      () => ({
        playAction: (action) => coreRef.current?.playAction(action),
        toggleAutoAttack: () => coreRef.current?.toggleAutoAttack(),
        stopAutoAttack: () => coreRef.current?.stopAutoAttack(),
        getState: () => coreRef.current?.getState?.() || {},
        // FORWARD getElement()
        getElement: () => coreRef.current?.getElement?.(),
      }),
      []
    );

    if (loading)
      return (
        <div className="p-6 text-center text-gray-600 animate-pulse">
          Đang tải...
        </div>
      );
    if (error)
      return <div className="p-6 text-center text-red-600">Lỗi: {error}</div>;
    if (!characterData)
      return (
        <div className="p-6 text-center text-gray-600">Không có dữ liệu</div>
      );

    return (
      <SpriteSheetPlayerCore
        ref={coreRef}
        characterData={characterData}
        defaultAction={defaultAction}
        flipped={flipped}
        distance={distance}
        health={health}
        characterName={finalCharacterName}
      />
    );
  }
);

SpriteSheetPlayer.displayName = "SpriteSheetPlayer";
export default SpriteSheetPlayer;
