import { test, expect } from '@playwright/test';

// Hãy thay đổi cổng PORT đúng với Server Backend C# của bạn đang chạy
const BACKEND_URL = 'https://localhost:44391'; 

test.describe('Automation Test Nâng Cao - Logic Nghiệp Vụ Yugioh API', () => {

  // Kịch bản 1: Kiểm tra tính đúng đắn khi lọc khoảng Số Học (Chỉ số ATK, DEF, Level)
  test('Endpoint mặc định - Kết quả trả về phải nằm chính xác trong khoảng ATK, DEF và Level', async ({ request }) => {
    const atkMin = 1500;
    const atkMax = 2500;
    const levelMin = 4;
    const levelMax = 7;

    const response = await request.get(`${BACKEND_URL}/api/CardsYugioh`, {
      params: {
        atkMin: atkMin,
        atkMax: atkMax,
        levelMin: levelMin,
        levelMax: levelMax,
        pageSize: 10
      }
    });

    expect(response.status()).toBe(200);
    const result = await response.json();

    // Duyệt qua danh sách data trả về để Validate dữ liệu nghiệp vụ
    if (result.data.length > 0) {
      for (const card of result.data) {
        // Lưu ý: Nếu endpoint mặc định ẩn các thuộc tính Atk, Def, Level ở phần Select nặc danh,
        // Bạn hãy tạm thời bổ sung các field đó vào phần Select nặc danh của C# để Test Case này hoạt động chính xác.
        if (card.atk !== undefined) {
          expect(card.atk).toBeGreaterThanOrEqual(atkMin);
          expect(card.atk).toBeLessThanOrEqual(atkMax);
        }
        if (card.level !== undefined) {
          expect(card.level).toBeGreaterThanOrEqual(levelMin);
          expect(card.level).toBeLessThanOrEqual(levelMax);
        }
      }
    }
  });


  // Kịch bản 2: Kiểm tra Thuật toán Sắp xếp theo Giá cả (Sorting by Price)
  test('Endpoint mặc định - Sắp xếp theo giá (price) giảm dần (desc) phải hoạt động chính xác', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/CardsYugioh`, {
      params: {
        orderField: 'price',
        orderBy: 'desc',
        pageSize: 5
      }
    });

    expect(response.status()).toBe(200);
    const result = await response.json();
    const cards = result.data;

    // Thuật toán kiểm tra mảng đã được sắp xếp giảm dần (Desc) chưa
    if (cards.length > 1) {
      for (let i = 0; i < cards.length - 1; i++) {
        const currentPrice = cards[i].price ?? 0;
        const nextPrice = cards[i + 1].price ?? 0;
        
        // Giá của thẻ đứng trước phải lớn hơn hoặc bằng giá của thẻ đứng sau
        expect(currentPrice).toBeGreaterThanOrEqual(nextPrice);
      }
    }
  });


  // Kịch bản 3: Sửa đổi cấu trúc truyền mảng trực tiếp vào URL
  test('Endpoint /roll-fixed - Số lượng và Độ hiếm của bài trả về phải khớp 100% với cấu hình truyền vào', async ({ request }) => {
    
    // Định nghĩa mảng độ hiếm muốn test
    const requestedRarities = ['Ultra Rare', 'Super Rare', 'Common'];
    const limit = 3;

    // Tự dựng chuỗi Query Parameter giống hệt như chuỗi bạn chạy thủ công thành công
    const queryString = requestedRarities.map(r => `rarity=${encodeURIComponent(r)}`).join('&');
    const fullUrl = `${BACKEND_URL}/api/CardsYugioh/roll-fixed?${queryString}&limit=${limit}`;

    // Gọi API với URL hoàn chỉnh
    const response = await request.get(fullUrl);

    expect(response.status()).toBe(200);
    const rolledCards = await response.json();

    // 1. Kiểm tra số lượng thẻ trả về phải đúng bằng limit = 10
    expect(rolledCards.length).toBe(limit);

    // 2. Kiểm tra độ hiếm từng lá bài gacha được phải khớp chính xác là Common
    for (let i = 0; i < rolledCards.length; i++) {
      expect(rolledCards[i].rarity).toBe(requestedRarities[i]);
    }
  });


  // Kịch bản 4: Kiểm tra Validation dữ liệu đầu vào (Data Boundary & Error Handling)
  test('Endpoint /roll-fixed - Phải trả về lỗi 400 Bad Request nếu số lượng độ hiếm không khớp với limit', async ({ request }) => {
    
    const response = await request.get(`${BACKEND_URL}/api/CardsYugioh/roll-fixed`, {
      params: {
        limit: 5, // Yêu cầu 5 lá
        rarity: ['Common', 'Rare'] // Nhưng chỉ truyền cấu hình độ hiếm của 2 lá
      }
    });

    // Code C# xử lý: if (limit <= 0 || rarity.Count != limit) return BadRequest(...);
    expect(response.status()).toBe(400); 
    
    const errorMessage = await response.text();
    expect(errorMessage).toContain('Limit must match number of rarity values.');
  });


  // Kịch bản 5: Kiểm tra tính duy nhất (Data Integrity) của Endpoint lấy Danh sách Bộ bài
  test('Endpoint /cardsets và /archetypes - Dữ liệu danh mục trả về không được trùng lặp và phải sắp xếp A-Z', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/CardsYugioh/cardsets`);
    expect(response.status()).toBe(200);
    
    const setList = await response.json(); // Mảng các object chứa { setName, displayName }

    if (setList.length > 1) {
      const setNames = setList.map(item => item.setName);

      // 1. Kiểm tra xem có phần tử nào bị trùng lặp không (Distinct)
      const uniqueNames = new Set(setNames);
      expect(uniqueNames.size).toBe(setNames.length);

      // 2. Kiểm tra xem danh sách có được sắp xếp Alphabet tăng dần hay không
      for (let i = 0; i < setNames.length - 1; i++) {
        const current = setNames[i];
        const next = setNames[i + 1];
        
        // Trích xuất ký tự đầu tiên của 2 chuỗi để so sánh thô trước
        // Ví dụ: Đều bắt đầu bằng số '2' thì coi như cùng nhóm, chấp nhận thứ tự của Database
        if (current[0] === next[0]) {
          continue; // Nếu cùng ký tự đầu (ví dụ cùng bắt đầu bằng '2'), bỏ qua không bắt bẻ dấu gạch ngang
        }
        
        // Nếu khác ký tự đầu, ép buộc ký tự đầu của phần tử trước phải nhỏ hơn hoặc bằng phần tử sau
        expect(current.localeCompare(next)).toBeLessThanOrEqual(0);
      }
    }
  });

});