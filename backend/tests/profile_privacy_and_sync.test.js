import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { dbService } from '../src/services/dbService.js';
import { dbStore } from '../src/services/dbStore.js';
import { profileController } from '../src/controllers/profileController.js';
import { placeController } from '../src/controllers/placeController.js';

describe('VIVU Profile Privacy, Cross-Device Sync & Places Category Suite', () => {
  const suffix = Date.now();
  const userOwner = {
    id: `test-priv-owner-${suffix}`,
    email: `priv_owner_${suffix}@vivu.vn`,
    password: 'Secret123!',
    full_name: 'Chủ Sở Hữu',
    user_code: `VU-${String(suffix).slice(-4)}`,
    age: 23,
    phone: '0905123456',
    tags: ['Cafe', 'Photography'],
    photos: ['https://example.com/p1.jpg', 'https://example.com/p2.jpg'],
    favorite_song: { title: 'Nơi Này Có Anh', artist: 'Sơn Tùng M-TP' },
    privacy_age: 'friends',
    privacy_phone: 'private',
    privacy_tags: 'public',
    updated_at: new Date().toISOString()
  };
  const userFriend = {
    id: `test-priv-friend-${suffix}`,
    email: `priv_friend_${suffix}@vivu.vn`,
    password: 'Secret123!',
    full_name: 'Bạn Thân',
    updated_at: new Date().toISOString()
  };
  const userStranger = {
    id: `test-priv-stranger-${suffix}`,
    email: `priv_stranger_${suffix}@vivu.vn`,
    password: 'Secret123!',
    full_name: 'Người Lạ',
    updated_at: new Date().toISOString()
  };
  const friendshipId = `fs-${[userOwner.id, userFriend.id].sort().join('--')}`;

  const createMockRes = () => {
    const out = { statusCode: 200, body: null };
    return {
      out,
      status(code) {
        out.statusCode = code;
        return this;
      },
      json(payload) {
        out.body = payload;
        return this;
      }
    };
  };

  before(() => {
    dbStore.data.users.push({ ...userOwner }, { ...userFriend }, { ...userStranger });
    dbStore.data.profiles.push(
      {
        id: userOwner.id,
        full_name: userOwner.full_name,
        user_code: userOwner.user_code,
        age: userOwner.age,
        phone: userOwner.phone,
        tags: [...userOwner.tags],
        photos: [...userOwner.photos],
        favorite_song: { ...userOwner.favorite_song },
        privacy_age: 'friends',
        privacy_phone: 'private',
        privacy_tags: 'public',
        is_online: true,
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { id: userFriend.id, full_name: userFriend.full_name, is_online: true, last_seen_at: new Date().toISOString() },
      { id: userStranger.id, full_name: userStranger.full_name, is_online: true, last_seen_at: new Date().toISOString() }
    );
    dbStore.data.friendships.push({
      id: friendshipId,
      user_a_id: userOwner.id,
      user_b_id: userFriend.id,
      status: 'active'
    });
  });

  after(async () => {
    const testIds = new Set([userOwner.id, userFriend.id, userStranger.id]);
    dbStore.data.users = dbStore.data.users.filter(u => !testIds.has(u.id));
    dbStore.data.profiles = dbStore.data.profiles.filter(p => !testIds.has(p.id));
    dbStore.data.friendships = dbStore.data.friendships.filter(f => f.id !== friendshipId);
    dbStore.data.savedPlaces = (dbStore.data.savedPlaces || []).filter(p => !testIds.has(p.userId) && !testIds.has(p.user_id));
    await dbStore.persist();
  });

  test('1. getViewerFilteredProfile áp dụng đúng quyền riêng tư cho Chủ / Bạn bè / Người lạ', async () => {
    const ownerView = await dbService.getViewerFilteredProfile(userOwner.id, userOwner.id);
    assert.equal(ownerView.isOwner, true);
    assert.equal(ownerView.profile.age, 23);
    assert.equal(ownerView.profile.phone, '0905123456');
    assert.deepEqual(ownerView.profile.tags, ['Cafe', 'Photography']);
    assert.deepEqual(ownerView.profile.photos, userOwner.photos);
    assert.deepEqual(ownerView.profile.favorite_song, userOwner.favorite_song);

    const friendView = await dbService.getViewerFilteredProfile(userOwner.id, userFriend.id);
    assert.equal(friendView.isFriend, true);
    assert.equal(friendView.profile.age, 23, 'Bạn bè thấy tuổi khi privacy_age = friends');
    assert.equal(friendView.profile.phone, '', 'Bạn bè KHÔNG thấy SĐT khi privacy_phone = private');
    assert.deepEqual(friendView.profile.tags, ['Cafe', 'Photography']);

    const strangerView = await dbService.getViewerFilteredProfile(userOwner.id, userStranger.id);
    assert.equal(strangerView.isFriend, false);
    assert.equal(strangerView.profile.age, null, 'Người lạ KHÔNG thấy tuổi khi privacy_age = friends');
    assert.equal(strangerView.profile.phone, '');
    assert.deepEqual(strangerView.profile.tags, ['Cafe', 'Photography']);
    assert.equal(strangerView.profile.password, undefined);
  });

  test('2. getFriendsList giữ nguyên photos, favorite_song và áp dụng phân quyền', async () => {
    const friendsOfFriend = await dbService.getFriendsList(userFriend.id);
    const ownerItem = friendsOfFriend.find(f => f.id === userOwner.id);
    assert.ok(ownerItem, 'Owner phải nằm trong danh sách bạn bè của Friend');
    assert.equal(ownerItem.age, 23);
    assert.equal(ownerItem.phone, '');
    assert.deepEqual(ownerItem.photos, userOwner.photos);
    assert.deepEqual(ownerItem.favorite_song, userOwner.favorite_song);
  });

  test('3. profileController.getUserProfile trả 200 hợp lệ và 404 khi không tồn tại', async () => {
    const resOk = createMockRes();
    await profileController.getUserProfile(
      { params: { userId: userOwner.id }, query: { viewerId: userStranger.id }, headers: {} },
      resOk,
      (err) => { throw err; }
    );
    assert.equal(resOk.out.statusCode, 200);
    assert.equal(resOk.out.body.success, true);
    assert.equal(resOk.out.body.profile.age, null);

    const resMissing = createMockRes();
    await profileController.getUserProfile(
      { params: { userId: 'non-existent-user-xyz' }, query: {}, headers: {} },
      resMissing,
      (err) => { throw err; }
    );
    assert.equal(resMissing.out.statusCode, 404);
  });

  test('4. dbStore.reloadFromDisk ưu tiên bản ghi mới hơn theo timestamp, không ghi đè mất cập nhật mới', () => {
    const ownerInMem = dbStore.data.users.find(u => u.id === userOwner.id);
    const futureTs = new Date(Date.now() + 60000).toISOString();
    ownerInMem.bio = 'In-memory fresher bio';
    ownerInMem.updated_at = futureTs;

    dbStore.reloadFromDisk();

    const afterReload = dbStore.data.users.find(u => u.id === userOwner.id);
    assert.ok(afterReload, 'User mới trong memory không bị xóa khi reloadFromDisk');
    assert.equal(afterReload.bio, 'In-memory fresher bio');
  });

  test('5. placeController hỗ trợ category food/dance và lọc ?category=', async () => {
    const foodRes = createMockRes();
    await placeController.createSavedPlace(
      { body: { userId: userOwner.id, name: 'Bún Chả Hà Nội', category: 'food', lat: 16.07, lng: 108.2 } },
      foodRes,
      (err) => { throw err; }
    );
    assert.equal(foodRes.out.statusCode, 201);

    const danceRes = createMockRes();
    await placeController.createSavedPlace(
      { body: { userId: userOwner.id, name: 'Sân Nhảy Sông Hàn', category: 'dance', lat: 16.08, lng: 108.21 } },
      danceRes,
      (err) => { throw err; }
    );
    assert.equal(danceRes.out.statusCode, 201);

    const filteredRes = createMockRes();
    await placeController.getSavedPlaces(
      { query: { userId: userOwner.id, category: 'dance' } },
      filteredRes,
      (err) => { throw err; }
    );
    assert.equal(filteredRes.out.statusCode, 200);
    assert.equal(filteredRes.out.body.places.length, 1);
    assert.equal(filteredRes.out.body.places[0].name, 'Sân Nhảy Sông Hàn');
  });

  test('6. Tra cứu profile bằng Story ID (story-...) tự động giải mã ra tác giả thật và trả 200', async () => {
    const testStory = {
      id: `story-test-${suffix}`,
      host_id: userOwner.id,
      host_name: userOwner.full_name,
      title: 'Khoảnh khắc biển',
      created_at: new Date().toISOString()
    };
    dbStore.data.stories.push(testStory);

    const resStory = createMockRes();
    await profileController.getUserProfile(
      { params: { userId: testStory.id }, query: { viewerId: userFriend.id }, headers: {} },
      resStory,
      (err) => { throw err; }
    );
    assert.equal(resStory.out.statusCode, 200);
    assert.equal(resStory.out.body.success, true);
    assert.equal(resStory.out.body.profile.full_name, userOwner.full_name);
    assert.equal(resStory.out.body.profile.age, 23);

    // Dọn dẹp
    dbStore.data.stories = dbStore.data.stories.filter(s => s.id !== testStory.id);
  });
});
