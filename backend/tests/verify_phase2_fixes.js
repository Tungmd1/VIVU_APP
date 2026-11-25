import assert from 'node:assert/strict';
import { dbService } from '../src/services/dbService.js';
import { dbStore } from '../src/services/dbStore.js';

async function runPhase2Verification() {
  console.log('--- BẮT ĐẦU KIỂM THỬ HỆ THỐNG GIAI ĐOẠN 2 ---');

  const suffix = Date.now();
  const testUserA = {
    id: `user-real-a-${suffix}`,
    email: `real_a_${suffix}@vivu.vn`,
    full_name: 'Mai Đức Tùng',
    user_code: `VU-${String(suffix).slice(-4)}`,
    age: 22,
    job: 'Kỹ Sư Phần Mềm',
    bio: 'Đam mê khám phá công nghệ và du lịch dạo phố',
    avatar_url: 'https://example.com/avatar_tung.jpg',
    is_online: true,
    last_seen_at: new Date().toISOString()
  };

  const testUserB = {
    id: `user-real-b-${suffix}`,
    email: `real_b_${suffix}@vivu.vn`,
    full_name: 'Nguyễn Văn Bạn',
    user_code: `VU-B${String(suffix).slice(-3)}`,
    is_online: true,
    last_seen_at: new Date().toISOString()
  };

  dbStore.data.users.push({ ...testUserA }, { ...testUserB });
  dbStore.data.profiles.push(
    {
      id: testUserA.id,
      full_name: testUserA.full_name,
      user_code: testUserA.user_code,
      age: testUserA.age,
      job: testUserA.job,
      bio: testUserA.bio,
      avatar_url: testUserA.avatar_url,
      is_online: true,
      last_seen_at: new Date().toISOString()
    },
    {
      id: testUserB.id,
      full_name: testUserB.full_name,
      user_code: testUserB.user_code,
      is_online: true,
      last_seen_at: new Date().toISOString()
    }
  );

  // 1. Kiểm thử Story -> Tác giả thật
  console.log('[Test 1] Đăng Story & Kiểm tra hồ sơ thật từ Story ID');
  const story = await dbService.createStory({
    host_id: testUserA.id,
    title: 'Hồ Gươm sáng sớm',
    mediaUrl: 'https://example.com/hoguom.jpg'
  });
  assert.ok(story.id);
  assert.equal(story.host_id, testUserA.id);
  assert.equal(story.host_name, 'Mai Đức Tùng');

  // Tra cứu qua chính story.id
  const profileFromStoryId = await dbService.getViewerFilteredProfile(story.id, testUserB.id);
  assert.ok(profileFromStoryId);
  assert.equal(profileFromStoryId.profile.full_name, 'Mai Đức Tùng');
  assert.equal(profileFromStoryId.profile.age, 22);
  assert.equal(profileFromStoryId.profile.job, 'Kỹ Sư Phần Mềm');
  assert.equal(profileFromStoryId.profile.bio, 'Đam mê khám phá công nghệ và du lịch dạo phố');
  console.log('✅ Test 1 Đạt: Story ID giải mã ra hồ sơ thật 100%, không bị 404 hoặc mockup!');

  // 2. Kiểm thử Tạo nhóm Chờ xác nhận (Pending Confirmation)
  console.log('[Test 2] Tạo nhóm với bạn bè chưa xác nhận');
  const circle = await dbService.createCircle({
    name: 'Team Cà Phê Sáng',
    ownerId: testUserA.id,
    invitedMemberIds: [testUserB.id],
    requireConfirmation: true
  });
  assert.equal(circle.status, 'pending_confirmation');
  assert.equal(circle.isPendingConfirmation, true);
  assert.deepEqual(circle.member_ids, [testUserA.id]);
  const memberB = circle.members.find(m => m.user_id === testUserB.id);
  assert.ok(memberB);
  assert.equal(memberB.status, 'pending');

  // Kiểm tra danh sách cuộc trò chuyện: nhóm pending không xuất hiện trong inbox chính
  const convsA = await dbService.getUserConversations(testUserA.id);
  const hasCircleInConvs = convsA.some(c => c.circleId === circle.id || c.id === circle.id);
  assert.equal(hasCircleInConvs, false, 'Nhóm pending_confirmation không được mở chat inbox trước');
  console.log('✅ Test 2 Đạt: Nhóm ở trạng thái pending_confirmation, không kích hoạt thành viên ảo!');

  // 3. Kiểm thử Chấp nhận lời mời -> Nhóm kích hoạt chính thức
  console.log('[Test 3] Bạn B chấp nhận lời mời -> Kích hoạt nhóm active');
  const acceptRes = await dbService.respondToCircleInvite(circle.id, testUserB.id, 'accept');
  assert.equal(acceptRes.activatedNow, true);
  assert.equal(acceptRes.circle.status, 'active');
  assert.ok(acceptRes.circle.member_ids.includes(testUserB.id));
  console.log('✅ Test 3 Đạt: Nhóm chuyển sang active ngay khi có người đầu tiên đồng ý!');

  // 4. Kiểm thử GPS Speed & Live Location Update
  console.log('[Test 4] Cập nhật GPS kèm tốc độ & đồng bộ tin nhắn Live Location');
  const liveMsg = {
    id: `live-msg-${suffix}`,
    sender: testUserA.id,
    text: 'Đang chia sẻ vị trí trực tiếp',
    is_live_location: true,
    lat: 16.05,
    lng: 108.20,
    speed: 0,
    live_expires_at: new Date(Date.now() + 3600000).toISOString(),
    created_at: new Date().toISOString()
  };
  dbStore.data.messages.push(liveMsg);

  const updatedGps = await dbService.updateGps(
    testUserA.id,
    16.055,
    108.205,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    28.5
  );
  assert.equal(updatedGps.speed, 28.5);
  const updatedMsg = dbStore.data.messages.find(m => m.id === liveMsg.id);
  assert.equal(updatedMsg.speed, 28.5);
  assert.equal(updatedMsg.lat, 16.055);
  console.log('✅ Test 4 Đạt: Vận tốc GPS 28.5 km/h được đồng bộ tự động vào thẻ Live Location!');

  // Dọn dẹp
  dbStore.data.users = dbStore.data.users.filter(u => u.id !== testUserA.id && u.id !== testUserB.id);
  dbStore.data.profiles = dbStore.data.profiles.filter(p => p.id !== testUserA.id && p.id !== testUserB.id);
  dbStore.data.stories = dbStore.data.stories.filter(s => s.id !== story.id);
  dbStore.data.circles = dbStore.data.circles.filter(c => c.id !== circle.id);
  dbStore.data.messages = dbStore.data.messages.filter(m => m.id !== liveMsg.id);
  await dbStore.persist();

  console.log('--- TOÀN BỘ 4 HẠNG MỤC TEST HOÀN TẤT THÀNH CÔNG 100% ---');
}

runPhase2Verification().catch(err => {
  console.error('LỖI KIỂM THỬ:', err);
  process.exit(1);
});
