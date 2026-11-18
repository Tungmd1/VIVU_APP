import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { dbService } from '../src/services/dbService.js';
import { dbStore } from '../src/services/dbStore.js';

describe('VIVU Story, Music & Mood Deletion Persistence Suite', () => {
  const testUserId = `user-del-test-${Date.now()}`;
  const testEmail = `deltest.${Date.now()}@vivu.vn`;

  test('0. Thiết lập tài khoản test với trạng thái và bài hát ban đầu', async () => {
    const user = {
      id: testUserId,
      email: testEmail,
      full_name: 'Deletion Tester',
      user_code: 'VU-DEL01',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      custom_status: 'Tâm trạng ban đầu',
      custom_song: { id: 'song-1', title: 'See Tình', artist: 'Hoàng Thùy Linh' }
    };
    dbStore.users.push(user);
    dbStore.profiles.push({
      id: testUserId,
      name: 'Deletion Tester',
      full_name: 'Deletion Tester',
      lat: 16.0678,
      lng: 108.2208,
      is_online: true,
      custom_status: 'Tâm trạng ban đầu',
      custom_song: { id: 'song-1', title: 'See Tình', artist: 'Hoàng Thùy Linh' }
    });
    dbStore.persist();

    const fetched = await dbService.getUserById(testUserId);
    assert.equal(fetched.custom_status, 'Tâm trạng ban đầu');
    assert.equal(fetched.custom_song.title, 'See Tình');
  });

  test('1. updateGps với chuỗi rỗng customStatus="" phải xóa sạch tâm trạng, KHÔNG được khôi phục trạng thái cũ', async () => {
    await dbService.updateGps(
      testUserId,
      16.0678,
      108.2208,
      '', // Gửi chuỗi rỗng để gỡ tâm trạng
      'Deletion Tester',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      'VU-DEL01',
      '0901234567',
      null // Gửi null để gỡ bài hát
    );

    const user = dbStore.users.find(u => u.id === testUserId);
    const profile = dbStore.profiles.find(p => p.id === testUserId);
    const fetched = await dbService.getUserById(testUserId);

    assert.equal(user.custom_status, '', 'User custom_status trong DB phải là chuỗi rỗng');
    assert.equal(profile.custom_status, '', 'Profile custom_status trong DB phải là chuỗi rỗng');
    assert.equal(fetched.custom_status, '', 'getUserById phải trả về custom_status rỗng');
    assert.equal(user.custom_song, null, 'User custom_song phải là null');
    assert.equal(profile.custom_song, null, 'Profile custom_song phải là null');
    assert.equal(fetched.custom_song, null, 'getUserById phải trả về custom_song null');
  });

  test('2. Tạo Story có nhạc, sau đó xóa Story -> CSDL phải tự động dọn sạch nhạc và trạng thái trên cả users và profiles', async () => {
    // Tạo Story có nhạc
    const story = await dbService.createStory({
      host_id: testUserId,
      user_id: testUserId,
      title: 'Khoảnh khắc biển',
      image: 'https://images.unsplash.com/photo-story-test',
      music: { id: 'song-2', title: 'Waiting For You', artist: 'MONO' }
    });
    assert.ok(story.id);

    // Cập nhật nhạc vào user và profile
    await dbService.updateUserProfile(testUserId, {
      customSong: { id: 'song-2', title: 'Waiting For You', artist: 'MONO' },
      customStatus: 'Khoảnh khắc biển'
    });

    const beforeDelUser = await dbService.getUserById(testUserId);
    assert.equal(beforeDelUser.custom_song.title, 'Waiting For You');

    // Tiến hành xóa Story
    const delResult = await dbService.deleteStory(story.id, testUserId, 'VU-DEL01');
    assert.equal(delResult.success, true);

    // Kiểm tra Story đã biến mất khỏi RAM và CSDL
    const storyInDb = dbStore.stories.find(s => s.id === story.id);
    assert.equal(storyInDb, undefined, 'Story phải bị xóa khỏi CSDL');

    // Kiểm tra custom_song và custom_status phải bị dọn sạch trên cả users và profiles
    const userAfter = dbStore.users.find(u => u.id === testUserId);
    const profileAfter = dbStore.profiles.find(p => p.id === testUserId);
    const fetchedAfter = await dbService.getUserById(testUserId);

    assert.equal(userAfter.custom_song, null, 'User custom_song phải là null sau khi xóa Story');
    assert.equal(profileAfter.custom_song, null, 'Profile custom_song phải là null sau khi xóa Story');
    assert.equal(fetchedAfter.custom_song, null, 'getUserById custom_song phải là null');
    assert.equal(userAfter.custom_status, '', 'User custom_status phải rỗng sau khi xóa Story');
    assert.equal(profileAfter.custom_status, '', 'Profile custom_status phải rỗng sau khi xóa Story');
  });
});
