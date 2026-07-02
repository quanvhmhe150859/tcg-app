import { test, expect } from '@playwright/test';

// Đổi cổng port này thành cổng thực tế mà Server C# của bạn đang chạy ở Bước 1 nhé
const BACKEND_URL = 'https://tcg-backend-83ha.onrender.com'; 

test.describe('Automation Test cho CardsPokemonController API', () => {

  // Test Case 1: Kiểm tra API endpoint [HttpGet("search")]
  test('Endpoint /search - Lọc theo superType và giới hạn số lượng bài trả về', async ({ request }) => {
    
    // Gửi request GET kèm theo query params giống như trong code C# yêu cầu
    const response = await request.get(`${BACKEND_URL}/api/CardsPokemon/search`, {
      params: {
        superType: 'Pokémon',
        limit: 5
      }
    });

    // 1. Kiểm tra Status Code trả về phải là 200 OK
    expect(response.status()).toBe(200);

    // 2. Chuyển đổi dữ liệu nhận được sang dạng JSON
    const cards = await response.json();

    // 3. Kiểm tra tính đúng đắn của dữ liệu
    expect(Array.isArray(cards)).toBeTruthy(); // Phải trả về một danh sách (List<Card>)
    expect(cards.length).toBeLessThanOrEqual(5); // Số lượng không được vượt quá limit = 5
  });


  // Test Case 2: Kiểm tra API endpoint [HttpGet] (Hàm phân trang và tìm kiếm)
  test('Endpoint mặc định - Phân trang thành công và cấu trúc data trả về đúng chuẩn', async ({ request }) => {
    
    const response = await request.get(`${BACKEND_URL}/api/CardsPokemon`, {
      params: {
        page: 1,
        pageSize: 10,
        orderBy: 'asc'
      }
    });

    expect(response.status()).toBe(200);

    const result = await response.json();

    // Kiểm tra cấu trúc object nặc danh mà bạn return ở cuối hàm C#
    expect(result).toHaveProperty('page', 1);
    expect(result).toHaveProperty('pageSize', 10);
    expect(result).toHaveProperty('totalCount');
    expect(result).toHaveProperty('totalPages');
    expect(result).toHaveProperty('data'); // Đây là mảng chứa danh sách card

    // Kiểm tra các field của object card nằm trong mảng data
    if (result.data.length > 0) {
      const firstCard = result.data[0];
      expect(firstCard).toHaveProperty('id');
      expect(firstCard).toHaveProperty('name');
      expect(firstCard).toHaveProperty('rarity');
      expect(firstCard).toHaveProperty('imageUrl');
    }
  });

});

test.describe('Automation Test Nâng Cao - Logic Nghiệp Vụ API', () => {

  // Kịch bản 1: Kiểm tra tính chính xác tuyệt đối của bộ lọc (Data Validation)
  test('Endpoint /search - Dữ liệu trả về phải khớp hoàn toàn với Bộ Lọc truyền vào', async ({ request }) => {
    const filterType = 'Lightning';
    const filterRarity = 'Common';

    const response = await request.get(`${BACKEND_URL}/api/CardsPokemon/search`, {
      params: {
        type: filterType,
        rarity: filterRarity,
        limit: 10
      }
    });

    expect(response.status()).toBe(200);
    const cards = await response.json();

    // Nếu DB có dữ liệu thỏa mãn, duyệt qua từng item để test chất lượng data
    if (cards.length > 0) {
      for (const card of cards) {
        // Kiểm tra Rarity từ backend trả về bắt buộc phải đúng chuẩn 'Common'
        expect(card.rarity).toBe(filterRarity);
        
        // Vì CardTypes là một mảng object trong C#, kiểm tra xem có chứa Type cần lọc không
        // (Lưu ý: Nếu API /search của bạn ẩn CardTypes đi, bạn có thể kiểm tra các thuộc tính khác)
        if (card.cardTypes) {
          const hasType = card.cardTypes.some(t => t.type === filterType);
          expect(hasType).toBeTruthy();
        }
      }
    }
  });


  // Kịch bản 2: Kiểm tra Thuật toán Sắp xếp (Sorting Alphabet)
  test('Endpoint mặc định - Kiểm tra tính năng sắp xếp orderBy=desc và orderBy=asc', async ({ request }) => {
    
    // 1. Gọi API lấy theo thứ tự giảm dần (Z-A)
    const resDesc = await request.get(`${BACKEND_URL}/api/CardsPokemon`, {
      params: { page: 1, pageSize: 5, orderBy: 'desc' }
    });
    const dataDesc = await resDesc.json();

    // 2. Gọi API lấy theo thứ tự tăng dần (A-Z)
    const resAsc = await request.get(`${BACKEND_URL}/api/CardsPokemon`, {
      params: { page: 1, pageSize: 5, orderBy: 'asc' }
    });
    const dataAsc = await resAsc.json();

    if (dataDesc.data.length > 1 && dataAsc.data.length > 1) {
      const firstCardDesc = dataDesc.data[0].name.toLowerCase();
      const firstCardAsc = dataAsc.data[0].name.toLowerCase();

      // Thẻ đầu tiên của danh sách DESC phải có chữ cái lớn hơn hoặc bằng thẻ đầu tiên của danh sách ASC
      // Ví dụ: 'Pikachu' (Desc) > 'Charizard' (Asc)
      expect(firstCardDesc.localeCompare(firstCardAsc)).劇 >= 0; 
    }
  });


  // Kịch bản 3: Kiểm tra tính logic toán học của Phân Trang (Math Pagination)
  test('Endpoint mặc định - Công thức tính tổng số trang phải chính xác', async ({ request }) => {
    const pageSize = 5;
    
    const response = await request.get(`${BACKEND_URL}/api/CardsPokemon`, {
      params: { page: 1, pageSize: pageSize }
    });
    
    const result = await response.json();
    
    const totalCount = result.totalCount;
    const totalPages = result.totalPages;

    // Tính toán số trang mong muốn dựa trên tổng số item thực tế trong DB của bạn
    const expectedPages = Math.ceil(totalCount / pageSize);

    // Kiểm tra xem backend của bạn tính toán thuộc tính `totalPages` có khớp với công thức không
    expect(totalPages).toBe(expectedPages);
    
    // Đảm bảo số lượng phần tử trả về trong mảng `data` không được vượt quá `pageSize` công bố
    expect(result.data.length).toBeLessThanOrEqual(pageSize);
  });


  // Kịch bản 4: Kiểm tra tính Ngẫu Nhiên (Random Randomness) của tính năng Gacha
  test('Endpoint /search - Hai lần gacha liên tiếp không được trả về kết quả giống hệt nhau (Tính ngẫu nhiên)', async ({ request }) => {
    
    // Gọi lượt quay thứ nhất
    const res1 = await request.get(`${BACKEND_URL}/api/CardsPokemon/search`, {
      params: { limit: 3 }
    });
    const roll1 = await res1.json();

    // Gọi lượt quay thứ hai liền sau đó
    const res2 = await request.get(`${BACKEND_URL}/api/CardsPokemon/search`, {
      params: { limit: 3 }
    });
    const roll2 = await res2.json();

    if (roll1.length === 3 && roll2.length === 3) {
      // Lấy danh sách ID của 2 lượt quay
      const ids1 = roll1.map(c => c.id).join(',');
      const ids2 = roll2.map(c => c.id).join(',');

      // Kiểm tra chuỗi ID: Thuật toán random chuẩn thì tỉ lệ 2 lượt quay ra chuỗi ID giống khít nhau là rất thấp
      expect(ids1).not.toBe(ids2);
    }
  });

});