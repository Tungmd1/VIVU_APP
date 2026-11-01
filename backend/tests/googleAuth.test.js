import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { dbService } from '../src/services/dbService.js';
import { dbStore } from '../src/services/dbStore.js';

describe('VIVU Google Sign-In & Multi-Tier Auth Suite', () => {
  const testGoogleEmail = `test.google.${Date.now()}@gmail.com`;
  const testGoogleId = `gid-${Date.now()}`;

  test('1. Đăng nhập Google tài khoản mới -> Tạo user có auth_provider="google" và user_code hợp lệ', async () => {
    const res = await dbService.syncGoogleUser({
      googleId: testGoogleId,
      email: testGoogleEmail,
      fullName: 'Google Explorer',
      avatarUrl: 'https://lh3.googleusercontent.com/a/test-avatar'
    });

    assert.equal(res.success, true);
    assert.ok(res.token);
    assert.ok(res.user);
    assert.equal(res.user.email, testGoogleEmail);
    assert.equal(res.user.auth_provider, 'google');
    assert.ok(res.user.user_code && res.user.user_code.startsWith('VU-'));
    assert.equal(res.user.avatar_url, 'https://lh3.googleusercontent.com/a/test-avatar');

    // Kiểm tra trong dbStore
    const userInStore = dbStore.users.find(u => u.email === testGoogleEmail);
    assert.ok(userInStore);
    assert.equal(userInStore.google_id, testGoogleId);
    assert.equal(userInStore.auth_provider, 'google');

    // Kiểm tra profile online
    const profileInStore = dbStore.profiles.find(p => p.id === userInStore.id);
    assert.ok(profileInStore);
    assert.equal(profileInStore.is_online, true);
  });

  test('2. Đăng nhập lại với cùng email Google -> Đồng bộ user cũ, không sinh bản sao trùng', async () => {
    const prevCount = dbStore.users.length;
    const res = await dbService.syncGoogleUser({
      googleId: testGoogleId,
      email: testGoogleEmail,
      fullName: 'Google Explorer (Updated)',
      avatarUrl: 'https://lh3.googleusercontent.com/a/test-avatar-updated'
    });

    assert.equal(res.success, true);
    assert.equal(dbStore.users.length, prevCount);
    assert.equal(res.user.email, testGoogleEmail);
    assert.equal(res.user.google_id, testGoogleId);
  });

  test('3. Liên kết Google với tài khoản đã tồn tại qua email thường', async () => {
    const localEmail = `local.user.${Date.now()}@vivu.vn`;
    const localUser = {
      id: `local-${Date.now()}`,
      email: localEmail,
      full_name: 'Local Existing User',
      auth_provider: 'local',
      created_at: new Date().toISOString()
    };
    dbStore.users.push(localUser);

    const res = await dbService.syncGoogleUser({
      googleId: `gid-linked-${Date.now()}`,
      email: localEmail,
      fullName: 'Local User (Linked Google)',
      avatarUrl: 'https://lh3.googleusercontent.com/a/linked'
    });

    assert.equal(res.success, true);
    assert.equal(res.user.id, localUser.id);
    assert.equal(res.user.auth_provider, 'google');
  });

  test('4. Lỗi khi thiếu email Google', async () => {
    await assert.rejects(
      async () => {
        await dbService.syncGoogleUser({
          googleId: 'no-email-id',
          email: ''
        });
      },
      /Google account phải có email/
    );
  });
});
