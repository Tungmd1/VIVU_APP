import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { dbService } from '../src/services/dbService.js';
import { dbStore } from '../src/services/dbStore.js';

describe('VIVU Facebook Sign-In Suite', () => {
  const testFbEmail = `test.fb.${Date.now()}@facebook.vivu.vn`;
  const testFbId = `fbid-${Date.now()}`;

  test('1. Đăng nhập Facebook tài khoản mới -> Tạo user có auth_provider="facebook" và user_code hợp lệ', async () => {
    const res = await dbService.syncFacebookUser({
      facebookId: testFbId,
      email: testFbEmail,
      fullName: 'Facebook Explorer',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    });

    assert.equal(res.success, true);
    assert.ok(res.token);
    assert.ok(res.user);
    assert.equal(res.user.email, testFbEmail);
    assert.equal(res.user.auth_provider, 'facebook');
    assert.ok(res.user.user_code && res.user.user_code.startsWith('VU-'));

    // Kiểm tra trong dbStore
    const userInStore = dbStore.users.find(u => u.facebook_id === testFbId);
    assert.ok(userInStore);
    assert.equal(userInStore.auth_provider, 'facebook');

    // Kiểm tra profile online
    const profileInStore = dbStore.profiles.find(p => p.id === userInStore.id);
    assert.ok(profileInStore);
    assert.equal(profileInStore.is_online, true);
  });

  test('2. Đăng nhập lại với cùng Facebook ID -> Đồng bộ user cũ, không sinh bản sao trùng', async () => {
    const prevCount = dbStore.users.length;
    const res = await dbService.syncFacebookUser({
      facebookId: testFbId,
      email: testFbEmail,
      fullName: 'Facebook Explorer (Updated)',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'
    });

    assert.equal(res.success, true);
    assert.equal(dbStore.users.length, prevCount);
    assert.equal(res.user.facebook_id, testFbId);
    assert.equal(res.user.full_name, 'Facebook Explorer (Updated)');
  });

  test('3. Lỗi khi thiếu cả email lẫn Facebook ID', async () => {
    await assert.rejects(
      async () => {
        await dbService.syncFacebookUser({
          email: '',
          facebookId: ''
        });
      },
      /Facebook account phải có email hoặc Facebook ID/
    );
  });
});
