// Hàm thêm card vào localStorage
export function addCardsToLocalStorage(result, gameType, spinMode) {
  // Chỉ cho phép lưu nếu spinMode = "paid"
  if(spinMode === null) {
    localStorage.setItem("spinMode", "free");
  }
  if (spinMode === "free") {
    return;
  }
  // Đọc dữ liệu hiện tại
  const stored = localStorage.getItem("cards");
  const allCards = stored ? JSON.parse(stored) : { pokemon: [], yugioh: [] };

  // Đảm bảo luôn có 2 key
  if (!allCards.pokemon) allCards.pokemon = [];
  if (!allCards.yugioh) allCards.yugioh = [];

  // Xác định mảng nào sẽ lưu (pokemon / yugioh)
  const targetArray = gameType === "pokemon" ? allCards.pokemon : allCards.yugioh;

  // Thêm từng card vào
  result.forEach((card) => {
    // Chuẩn hóa id → cardID
    const cardID = card.id || card.cardId;
    const idx = targetArray.findIndex((c) => c.cardID === cardID);

    if (idx !== -1) {
      targetArray[idx].quantity += 1;
    } else {
      targetArray.push({ cardID, quantity: 1 });
    }
  });

  // Lưu lại vào localStorage
  localStorage.setItem("cards", JSON.stringify(allCards));
}
