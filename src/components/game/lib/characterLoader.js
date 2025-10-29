const characterCache = new Map();

/**
 * Load nhân vật theo tên (dynamic import)
 * @param {string} name - Tên file JSON (ví dụ: "demon")
 * @returns {Promise<Object>} - Dữ liệu nhân vật
 */
export const loadCharacter = async (name) => {
  if (characterCache.has(name)) {
    return characterCache.get(name);
  }

  try {
    // Dynamic import → chỉ load khi cần
    const module = await import(`../data/characters/${name}.json`);
    const data = module.default || module;
    characterCache.set(name, data);
    return data;
  } catch (err) {
    console.error(`[CharacterLoader] Không tìm thấy: ${name}.json`, err);
    throw new Error(`Nhân vật "${name}" không tồn tại`);
  }
};

// Optional: Preload nhiều nhân vật
export const preloadCharacters = async (names) => {
  return Promise.all(names.map(loadCharacter));
};