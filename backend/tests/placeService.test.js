import test, { describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbService } from '../src/services/dbService.js';
import { dbStore } from '../src/services/dbStore.js';
import { placeController } from '../src/controllers/placeController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../uploads');
const placesUploadDir = path.join(uploadsDir, 'places');

describe('VIVU Milestone 3: Saved Places Management & Persistence Suite', () => {
  const userA = { id: 'test-user-places-alpha', full_name: 'Alpha Places Tester' };
  const userB = { id: 'test-user-places-beta', full_name: 'Beta Places Tester' };

  before(() => {
    // Ensure test users exist in dbStore
    [userA, userB].forEach(u => {
      if (!dbStore.users.some(x => x.id === u.id)) {
        dbStore.users.push(u);
      }
      if (!dbStore.profiles.some(x => x.id === u.id)) {
        dbStore.profiles.push({
          id: u.id,
          full_name: u.full_name,
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          lat: 10.7769,
          lng: 106.7009
        });
      }
    });

    if (!Array.isArray(dbStore.data.savedPlaces)) {
      dbStore.data.savedPlaces = [];
    }

    // Ensure uploads/places directory exists
    if (!fs.existsSync(placesUploadDir)) {
      fs.mkdirSync(placesUploadDir, { recursive: true });
    }
  });

  beforeEach(() => {
    // Clean up saved places for test users before each test
    dbStore.data.savedPlaces = dbStore.data.savedPlaces.filter(
      p => p.userId !== userA.id && p.userId !== userB.id && p.user_id !== userA.id && p.user_id !== userB.id
    );
  });

  after(async () => {
    // Clean up test users and persist
    dbStore.data.savedPlaces = dbStore.data.savedPlaces.filter(
      p => p.userId !== userA.id && p.userId !== userB.id && p.user_id !== userA.id && p.user_id !== userB.id
    );
    await dbStore.persist();
  });

  // ==========================================
  // 1. DBSERVICE SAVED PLACES CRUD
  // ==========================================
  describe('dbService Saved Places CRUD', () => {
    test('1. Tạo địa điểm đã lưu thành công với đầy đủ thuộc tính', async () => {
      const placeData = {
        userId: userA.id,
        name: 'Quán Cà Phê Góc Phố',
        category: 'cafe_dating',
        notes: 'Nơi hẹn hò kỷ niệm lần đầu',
        lat: 10.7765,
        lng: 106.7005,
        image: '/uploads/places/places-test-1.jpg'
      };

      const created = await dbService.createSavedPlace(placeData);
      assert.ok(created.id, 'Phải có id duy nhất');
      assert.match(created.id, /^place-/, 'id phải có prefix place-');
      assert.equal(created.userId, userA.id);
      assert.equal(created.name, 'Quán Cà Phê Góc Phố');
      assert.equal(created.category, 'cafe_dating');
      assert.equal(created.notes, 'Nơi hẹn hò kỷ niệm lần đầu');
      assert.equal(created.lat, 10.7765);
      assert.equal(created.lng, 106.7005);
      assert.equal(created.image, '/uploads/places/places-test-1.jpg');
      assert.ok(created.created_at);
      assert.ok(created.updated_at);
    });

    test('2. Chặn tạo địa điểm khi thiếu tên hoặc tọa độ không hợp lệ', async () => {
      // Thiếu userId
      await assert.rejects(
        () => dbService.createSavedPlace({ name: 'A', lat: 10, lng: 10 }),
        /userId là bắt buộc/
      );

      // Thiếu tên
      await assert.rejects(
        () => dbService.createSavedPlace({ userId: userA.id, name: '', lat: 10, lng: 10 }),
        /Tên địa điểm là bắt buộc/
      );

      // Tọa độ vĩ độ (lat) vượt quá phạm vi
      await assert.rejects(
        () => dbService.createSavedPlace({ userId: userA.id, name: 'Place 1', lat: 95, lng: 106 }),
        /Vĩ độ \(lat\) không hợp lệ/
      );

      // Tọa độ kinh độ (lng) thiếu
      await assert.rejects(
        () => dbService.createSavedPlace({ userId: userA.id, name: 'Place 1', lat: 10 }),
        /Kinh độ \(lng\) không hợp lệ/
      );
    });

    test('3. Lấy danh sách địa điểm theo user và sắp xếp mới nhất trước', async () => {
      const p1 = await dbService.createSavedPlace({
        userId: userA.id,
        name: 'Địa điểm 1',
        category: 'dining',
        lat: 10.7,
        lng: 106.7
      });
      // Giả lập độ trễ nhỏ để time khác biệt
      p1.created_at = new Date(Date.now() - 5000).toISOString();

      const p2 = await dbService.createSavedPlace({
        userId: userA.id,
        name: 'Địa điểm 2',
        category: 'sightseeing',
        lat: 10.8,
        lng: 106.8
      });

      // Tạo thêm 1 địa điểm cho user B
      await dbService.createSavedPlace({
        userId: userB.id,
        name: 'Địa điểm của User B',
        category: 'music',
        lat: 10.9,
        lng: 106.9
      });

      const listA = await dbService.getSavedPlaces(userA.id);
      assert.equal(listA.length, 2, 'User A phải có 2 địa điểm');
      assert.equal(listA[0].id, p2.id, 'Địa điểm mới hơn phải xếp trước');
      assert.equal(listA[1].id, p1.id);

      const listB = await dbService.getSavedPlaces(userB.id);
      assert.equal(listB.length, 1, 'User B chỉ có 1 địa điểm');
      assert.equal(listB[0].name, 'Địa điểm của User B');
    });

    test('4. Cập nhật thông tin địa điểm đã lưu của chính mình', async () => {
      const place = await dbService.createSavedPlace({
        userId: userA.id,
        name: 'Phở 24',
        category: 'dining',
        notes: 'Ăn sáng ngon',
        lat: 10.77,
        lng: 106.70
      });

      const updated = await dbService.updateSavedPlace(place.id, {
        name: 'Phở Thìn Hà Nội',
        notes: 'Nước dùng đậm đà',
        category: 'dining',
        image: '/uploads/places/pho.jpg'
      }, userA.id);

      assert.equal(updated.name, 'Phở Thìn Hà Nội');
      assert.equal(updated.notes, 'Nước dùng đậm đà');
      assert.equal(updated.image, '/uploads/places/pho.jpg');
    });

    test('5. Bảo mật đa tài khoản: User B không thể sửa địa điểm của User A', async () => {
      const place = await dbService.createSavedPlace({
        userId: userA.id,
        name: 'Bí mật của A',
        lat: 10.77,
        lng: 106.70
      });

      await assert.rejects(
        () => dbService.updateSavedPlace(place.id, { name: 'B chiếm đoạt' }, userB.id),
        (err) => err.statusCode === 403 || err.message.includes('không có quyền')
      );
    });

    test('6. Xóa địa điểm: User B bị chặn 403, User A xóa thành công', async () => {
      const place = await dbService.createSavedPlace({
        userId: userA.id,
        name: 'Địa điểm sắp xóa',
        lat: 10.77,
        lng: 106.70
      });

      // User B cố tình xóa -> bị chặn
      await assert.rejects(
        () => dbService.deleteSavedPlace(place.id, userB.id),
        (err) => err.statusCode === 403 || err.message.includes('không có quyền')
      );

      // User A xóa -> thành công
      const delRes = await dbService.deleteSavedPlace(place.id, userA.id);
      assert.equal(delRes.success, true);

      // Kiểm tra lại trong DB
      const list = await dbService.getSavedPlaces(userA.id);
      assert.ok(!list.some(p => p.id === place.id), 'Địa điểm đã bị xóa');
    });
  });

  // ==========================================
  // 2. CONTROLLER REST ENDPOINTS
  // ==========================================
  describe('placeController REST Endpoints', () => {
    const mockRes = () => {
      const res = {
        _status: 200,
        _json: null,
        status(code) { this._status = code; return this; },
        json(data) { this._json = data; return this; }
      };
      return res;
    };

    test('GET /api/places trả về danh sách địa điểm', async () => {
      await dbService.createSavedPlace({
        userId: userA.id,
        name: 'Nhà Hát Thành Phố',
        category: 'sightseeing',
        lat: 10.7766,
        lng: 106.7032
      });

      const req = { query: { userId: userA.id } };
      const res = mockRes();
      await placeController.getSavedPlaces(req, res, (err) => { throw err; });

      assert.equal(res._status, 200);
      assert.equal(res._json.success, true);
      assert.ok(Array.isArray(res._json.places));
      assert.ok(res._json.places.length >= 1);
    });

    test('POST /api/places tạo địa điểm mới trả về 201', async () => {
      const req = {
        body: {
          userId: userA.id,
          name: 'Phố Đi Bộ Bùi Viện',
          category: 'dancing',
          notes: 'Nhộn nhịp về đêm',
          lat: 10.7675,
          lng: 106.6934
        }
      };
      const res = mockRes();
      await placeController.createSavedPlace(req, res, (err) => { throw err; });

      assert.equal(res._status, 201);
      assert.equal(res._json.success, true);
      assert.ok(res._json.place.id);
      assert.equal(res._json.place.category, 'dancing');
    });

    test('POST /api/places từ chối danh mục không hợp lệ với mã 400', async () => {
      const req = {
        body: {
          userId: userA.id,
          name: 'Sai danh mục',
          category: 'invalid_category_xyz',
          lat: 10.77,
          lng: 106.70
        }
      };
      const res = mockRes();
      await placeController.createSavedPlace(req, res, (err) => { throw err; });

      assert.equal(res._status, 400);
      assert.equal(res._json.success, false);
      assert.match(res._json.message, /Danh mục không hợp lệ/);
    });

    test('POST /api/places từ chối thiếu tên hoặc thiếu tọa độ với mã 400', async () => {
      const req = {
        body: {
          userId: userA.id,
          name: '',
          lat: 10.77,
          lng: 106.70
        }
      };
      const res = mockRes();
      await placeController.createSavedPlace(req, res, (err) => { throw err; });

      assert.equal(res._status, 400);
      assert.equal(res._json.success, false);
    });

    test('PUT /api/places/:id trả về 200 khi cập nhật thành công', async () => {
      const place = await dbService.createSavedPlace({
        userId: userA.id,
        name: 'Hồ Con Rùa',
        category: 'sightseeing',
        lat: 10.7826,
        lng: 106.6961
      });

      const req = {
        params: { id: place.id },
        body: {
          userId: userA.id,
          name: 'Công Viên Hồ Con Rùa',
          notes: 'Ăn bánh tráng trộn'
        }
      };
      const res = mockRes();
      await placeController.updateSavedPlace(req, res, (err) => { throw err; });

      assert.equal(res._status, 200);
      assert.equal(res._json.success, true);
      assert.equal(res._json.place.name, 'Công Viên Hồ Con Rùa');
    });

    test('DELETE /api/places/:id trả về 403 khi xóa địa điểm của người khác', async () => {
      const place = await dbService.createSavedPlace({
        userId: userA.id,
        name: 'Chợ Bến Thành',
        lat: 10.7725,
        lng: 106.6980
      });

      const req = {
        params: { id: place.id },
        body: { userId: userB.id }
      };
      const res = mockRes();
      await placeController.deleteSavedPlace(req, res, (err) => { throw err; });

      assert.equal(res._status, 403);
      assert.equal(res._json.success, false);
    });
  });

  // ==========================================
  // 3. THỰC HIỆN GHI ĐĨA VẬT LÝ & DATABASE STORE
  // ==========================================
  describe('Disk Persistence & Real Database File Verification', () => {
    test('Địa điểm đã lưu được ghi và tồn tại thực tế trong tệp database', async () => {
      const testPlace = await dbService.createSavedPlace({
        userId: userA.id,
        name: 'Bảo Tàng Chứng Tích Chiến Tranh',
        category: 'sightseeing',
        notes: 'Di tích lịch sử ý nghĩa',
        lat: 10.7794,
        lng: 106.6922
      });

      // Kích hoạt ghi đĩa
      await dbStore.persist();

      // Kiểm tra trong memory dbStore
      const inMemoryItem = dbStore.data.savedPlaces.find(p => p.id === testPlace.id);
      assert.ok(inMemoryItem, 'Phải tồn tại trong dbStore memory');

      // Tải trực tiếp tệp JSON từ đĩa
      dbStore.reloadFromDisk();
      assert.ok(dbStore.data.savedPlaces.some(p => p.id === testPlace.id), 'Phải tồn tại sau khi đọc lại');
    });

    test('Thư mục upload places tồn tại và ghi/đọc tệp thành công', () => {
      assert.ok(fs.existsSync(placesUploadDir), 'Thư mục backend/uploads/places phải tồn tại');

      const testFilename = `test-places-${Date.now()}.txt`;
      const testFilePath = path.join(placesUploadDir, testFilename);
      const testPayload = 'VIVU_SAVED_PLACES_UPLOAD_VERIFICATION';

      fs.writeFileSync(testFilePath, testPayload, 'utf-8');
      assert.ok(fs.existsSync(testFilePath), 'Tệp thử nghiệm phải được ghi xuống đĩa');

      const readBack = fs.readFileSync(testFilePath, 'utf-8');
      assert.equal(readBack, testPayload);

      // Dọn dẹp tệp thử nghiệm
      fs.unlinkSync(testFilePath);
      assert.ok(!fs.existsSync(testFilePath));
    });
  });
});
