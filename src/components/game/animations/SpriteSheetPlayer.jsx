import React, { useState, useEffect } from 'react';
import { loadCharacter } from '../lib/characterLoader';
import SpriteSheetPlayerCore from './SpriteSheetPlayerCore';

const SpriteSheetPlayer = ({ characterName, defaultAction = "idle", flipped = false }) => {
  const [characterData, setCharacterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    loadCharacter(characterName)
      .then(data => {
        if (mounted) {
          setCharacterData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { mounted = false; };
  }, [characterName]);

  if (loading) return <div className="p-6 text-center text-gray-600">Đang tải <strong>{characterName}</strong>...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Lỗi: {error}</div>;

  return <SpriteSheetPlayerCore characterData={characterData} defaultAction={defaultAction} flipped={flipped} />;
};

export default SpriteSheetPlayer;