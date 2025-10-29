import React, { useState } from 'react';
import SpriteSheetPlayer from './SpriteSheetPlayer';

// Danh sách nhân vật (có thể fetch từ server sau)
const CHARACTERS = [
  'demon', 'knight', 'wizard', 'archer', 'goblin',
  'slime', 'dragon', 'skeleton', 'ninja', 'priest'
];

function SpriteSheetDemo() {
  const [selected, setSelected] = useState('demon');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Sprite Animation Playground
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn nhân vật:
          </label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            {CHARACTERS.map(name => (
              <option key={name} value={name}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <SpriteSheetPlayer characterName={selected} />
      </div>
    </div>
  );
}

export default SpriteSheetDemo;