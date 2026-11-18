import test, { describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbService } from '../src/services/dbService.js';
import { dbStore } from '../src/services/dbStore.js';
import { profileController } from '../src/controllers/profileController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../uploads');

describe('VIVU Phase 1: Upload Infrastructure & Story Highlights Persistence Suite', () => {
  const userA = { id: 'test-user-hl-alpha', full_name: 'Alpha Highlights Tester' };
  const userB = { id: 'test-user-hl-beta', full_name: 'Beta Highlights Tester' };

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
          lat: 16.0544,
          lng: 108.2022
        });
      }
    });

    if (!Array.isArray(dbStore.data.highlights)) {
      dbStore.data.highlights = [];
    }
  });

  beforeEach(() => {
    // Clean up highlights for test users before each test
    dbStore.data.highlights = dbStore.data.highlights.filter(
      h => h.user_id !== userA.id && h.user_id !== userB.id
    );
  });

  // ==========================================
  // 1. HIGHLIGHTS CRUD & PERMISSIONS IN DBSERVICE
  // ==========================================
  describe('dbService Highlights Management', () => {
    test('Tạo nhóm tin nổi bật mới thành công với tiêu đề và ảnh bìa', async () => {
      const created = await dbService.createHighlight(userA.id, {
        title: 'Chuyến đi Đà Nẵng',
        coverImage: '/uploads/highlights/danang.jpg',
        stories: [
          { id: 'story-1', image: '/uploads/highlights/danang-1.jpg', title: 'Cầu Rồng' },
          { id: 'story-2', image: '/uploads/highlights/danang-2.jpg', title: 'Bà Nà Hills' }
        ]
      });

      assert.ok(created.id, 'Nhóm mới phải có ID');
      assert.equal(created.user_id, userA.id);
      assert.equal(created.title, 'Chuyến đi Đà Nẵng');
      assert.equal(created.cover_image, '/uploads/highlights/danang.jpg');
      assert.equal(created.stories.length, 2);

      // Kiểm tra lấy danh sách
      const list = await dbService.getUserHighlights(userA.id);
      assert.equal(list.length, 1);
      assert.equal(list[0].id, created.id);
    });

    test('Chặn tạo tin nổi bật khi thiếu tiêu đề hoặc userId', async () => {
      await assert.rejects(
        () => dbService.createHighlight('', { title: 'Hợp lệ' }),
        /userId là bắt buộc/
      );

      await assert.rejects(
        () => dbService.createHighlight(userA.id, { title: '   ' }),
        /Tiêu đề tin nổi bật không được để trống/
      );
    });

    test('Cập nhật tin nổi bật của chính mình thành công', async () => {
      const created = await dbService.createHighlight(userA.id, {
        title: 'Tiêu đề cũ',
        stories: [{ id: 'story-old', image: '/uploads/chat/old.jpg' }]
      });

      const updated = await dbService.updateHighlight(userA.id, created.id, {
        title: 'Tiêu đề mới đã đổi',
        coverImage: '/uploads/highlights/new-cover.jpg'
      });

      assert.equal(updated.title, 'Tiêu đề mới đã đổi');
      assert.equal(updated.cover_image, '/uploads/highlights/new-cover.jpg');

      const current = (await dbService.getUserHighlights(userA.id))[0];
      assert.equal(current.title, 'Tiêu đề mới đã đổi');
    });

    test('Bảo mật đa tài khoản: User B không thể sửa tin nổi bật của User A', async () => {
      const created = await dbService.createHighlight(userA.id, {
        title: 'Bộ sưu tập riêng của A'
      });

      await assert.rejects(
        () => dbService.updateHighlight(userB.id, created.id, { title: 'B cố tình sửa' }),
        (err) => {
          assert.equal(err.statusCode, 403);
          assert.match(err.message, /không có quyền chỉnh sửa/);
          return true;
        }
      );
    });

    test('Bảo mật đa tài khoản: User B không thể xóa tin nổi bật của User A', async () => {
      const created = await dbService.createHighlight(userA.id, {
        title: 'Bộ sưu tập của A'
      });

      await assert.rejects(
        () => dbService.deleteHighlight(userB.id, created.id),
        (err) => {
          assert.equal(err.statusCode, 403);
          assert.match(err.message, /không có quyền xóa/);
          return true;
        }
      );

      // Xác nhận tin vẫn tồn tại
      const list = await dbService.getUserHighlights(userA.id);
      assert.equal(list.length, 1);
    });

    test('Xóa tin nổi bật của chính mình thành công', async () => {
      const created = await dbService.createHighlight(userA.id, {
        title: 'Bộ sưu tập sắp xóa'
      });

      const res = await dbService.deleteHighlight(userA.id, created.id);
      assert.equal(res.deleted, true);

      const list = await dbService.getUserHighlights(userA.id);
      assert.equal(list.length, 0);
    });

    test('Ghim Story vào nhóm đã có và ngăn chặn trùng lặp', async () => {
      const created = await dbService.createHighlight(userA.id, {
        title: 'Check-in Quán Cafe',
        stories: [{ id: 'cf-1', image: '/uploads/highlights/cf1.jpg' }]
      });

      // Ghim story thứ 2
      const res = await dbService.pinStoryToHighlight(userA.id, created.id, {
        id: 'cf-2',
        image: '/uploads/highlights/cf2.jpg',
        title: 'Ly bạc xỉu'
      });

      assert.equal(res.stories.length, 2);
      assert.equal(res.stories[1].id, 'cf-2');

      // Thử ghim lại chính story đó -> Không bị trùng lặp
      const resDuplicate = await dbService.pinStoryToHighlight(userA.id, created.id, {
        id: 'cf-2',
        image: '/uploads/highlights/cf2.jpg'
      });
      assert.equal(resDuplicate.stories.length, 2, 'Không được tăng số lượng khi story đã tồn tại trong nhóm');
    });

    test('Ghim Story tạo nhóm mới ngay lập tức (highlightId = new)', async () => {
      const newGroup = await dbService.pinStoryToHighlight(userA.id, 'new', {
        id: 'story-instant',
        image: '/uploads/chat/instant.jpg',
        title: 'Hoàng hôn Sơn Trà',
        groupTitle: 'Hoàng Hôn Biển'
      });

      assert.ok(newGroup.id);
      assert.equal(newGroup.user_id, userA.id);
      assert.equal(newGroup.title, 'Hoàng Hôn Biển');
      assert.equal(newGroup.stories.length, 1);
      assert.equal(newGroup.cover_image, '/uploads/chat/instant.jpg');
    });

    test('Bảo mật đa tài khoản: User B không thể ghim Story vào nhóm của User A', async () => {
      const created = await dbService.createHighlight(userA.id, {
        title: 'Nhóm của A'
      });

      await assert.rejects(
        () => dbService.pinStoryToHighlight(userB.id, created.id, {
          id: 'b-story',
          image: '/uploads/chat/b.jpg'
        }),
        (err) => {
          assert.equal(err.statusCode, 403);
          assert.match(err.message, /không có quyền ghim/);
          return true;
        }
      );
    });
  });

  // ==========================================
  // 2. PROFILE CONTROLLER HTTP RESPONSES
  // ==========================================
  describe('profileController REST Endpoints', () => {
    const mockRes = () => {
      const res = {
        _status: 200,
        _data: null,
        status(code) {
          this._status = code;
          return this;
        },
        json(payload) {
          this._data = payload;
          return this;
        }
      };
      return res;
    };

    test('GET /api/profile/:userId/highlights trả về 200 kèm danh sách', async () => {
      await dbService.createHighlight(userA.id, { title: 'Test 1' });
      await dbService.createHighlight(userA.id, { title: 'Test 2' });

      const req = { params: { userId: userA.id } };
      const res = mockRes();
      const next = (err) => { throw err; };

      await profileController.getHighlights(req, res, next);
      assert.equal(res._status, 200);
      assert.equal(res._data.success, true);
      assert.equal(res._data.data.length, 2);
    });

    test('POST /api/profile/:userId/highlights trả về 201 khi tạo thành công', async () => {
      const req = {
        params: { userId: userA.id },
        body: { title: 'REST Created Highlight', coverImage: '/uploads/chat/cover.jpg' }
      };
      const res = mockRes();

      await profileController.createHighlight(req, res);
      assert.equal(res._status, 201);
      assert.equal(res._data.success, true);
      assert.equal(res._data.data.title, 'REST Created Highlight');
    });

    test('POST /api/profile/:userId/highlights trả về 400 khi thiếu tiêu đề', async () => {
      const req = {
        params: { userId: userA.id },
        body: { title: '' }
      };
      const res = mockRes();

      await profileController.createHighlight(req, res);
      assert.equal(res._status, 400);
      assert.equal(res._data.success, false);
    });

    test('DELETE trả về 403 khi xóa tin của người khác', async () => {
      const created = await dbService.createHighlight(userA.id, { title: 'A Highlight' });

      const req = {
        params: { userId: userB.id, highlightId: created.id }
      };
      const res = mockRes();

      await profileController.deleteHighlight(req, res);
      assert.equal(res._status, 403);
      assert.equal(res._data.success, false);
      assert.match(res._data.message, /không có quyền/);
    });
  });

  // ==========================================
  // 3. UPLOAD DIRECTORY & STATIC DISK VALIDATION
  // ==========================================
  describe('Static Upload Infrastructure (VPS Optimization)', () => {
    test('Các thư mục lưu trữ tĩnh backend/uploads/chat và highlights phải tồn tại', () => {
      const chatDir = path.join(uploadsDir, 'chat');
      const highlightsDir = path.join(uploadsDir, 'highlights');

      assert.ok(fs.existsSync(chatDir), 'backend/uploads/chat phải tồn tại');
      assert.ok(fs.existsSync(highlightsDir), 'backend/uploads/highlights phải tồn tại');
    });

    test('Ghi và đọc tệp giả lập trong thư mục uploads đảm bảo tính toàn vẹn', () => {
      const testFilePath = path.join(uploadsDir, 'chat', 'test-probe.txt');
      fs.writeFileSync(testFilePath, 'vivu-static-probe', 'utf8');

      assert.ok(fs.existsSync(testFilePath));
      const content = fs.readFileSync(testFilePath, 'utf8');
      assert.equal(content, 'vivu-static-probe');

      // Dọn dẹp
      fs.unlinkSync(testFilePath);
      assert.ok(!fs.existsSync(testFilePath));
    });
  });
});
