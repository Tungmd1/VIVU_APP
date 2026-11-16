import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { dbService } from '../src/services/dbService.js';
import { dbStore } from '../src/services/dbStore.js';

describe('VIVU Profile, Avatar, Pin Icons, Live Location, Poll & Circle Test Suite', () => {
  const userA = {
    id: `test-prof-a-${Date.now()}`,
    email: `prof_a_${Date.now()}@vivu.vn`,
    password: 'Password123!',
    full_name: 'Nguyễn Văn A'
  };

  const userB = {
    id: `test-prof-b-${Date.now()}`,
    email: `prof_b_${Date.now()}@vivu.vn`,
    password: 'Password123!',
    full_name: 'Trần Thị B'
  };

  const userC = {
    id: `test-prof-c-${Date.now()}`,
    email: `prof_c_${Date.now()}@vivu.vn`,
    password: 'Password123!',
    full_name: 'Lê Văn C'
  };

  before(async () => {
    // Đăng ký 3 tài khoản thử nghiệm vào dbStore
    const regA = await dbService.registerUser(userA);
    userA.id = regA.user.id;
    const regB = await dbService.registerUser(userB);
    userB.id = regB.user.id;
    const regC = await dbService.registerUser(userC);
    userC.id = regC.user.id;

    // Cập nhật vị trí GPS hợp lệ cho hồ sơ để có thể chia sẻ vị trí và tạo nhóm
    await dbService.updateGps(userA.id, 16.07116, 108.19949, 'Sẵn sàng', userA.full_name, null, 'VU-1001');
    await dbService.updateGps(userB.id, 16.07200, 108.20000, 'Online', userB.full_name, null, 'VU-1002');
    await dbService.updateGps(userC.id, 16.08000, 108.21000, 'Busy', userC.full_name, null, 'VU-1003');

    // Thiết lập quan hệ bạn bè giữa userA và userB
    await dbService.sendFriendRequest(userA.id, userB.id);
    const requests = await dbService.getFriendRequests(userB.id);
    const reqFromA = (requests.received || []).find(r => r.sender_id === userA.id);
    if (reqFromA) {
      await dbService.acceptFriendRequest(reqFromA.id, userB.id);
    }
  });

  describe('1. Profile Persistence (Lưu trữ hồ sơ bền vững)', () => {
    it('Cập nhật SĐT, tuổi, nghề nghiệp, tiểu sử và lưu bền vững vào Database', async () => {
      const updateData = {
        fullName: 'Nguyễn Văn A Đẹp Trai',
        phone: '0901234567',
        age: 24,
        job: 'Kỹ sư phần mềm',
        bio: 'Yêu thích lập trình và phượt Đà Nẵng',
        customStatus: 'Đang code VIVU',
        favorite_song: 'Không Thể Say - HIEUTHUHAI',
        tags: ['#CafeĐêm', '#DạoPhố']
      };

      const updated = await dbService.updateUserProfile(userA.id, updateData);
      assert.equal(updated.full_name, 'Nguyễn Văn A Đẹp Trai');
      assert.equal(updated.phone, '0901234567');
      assert.equal(updated.age, 24);
      assert.equal(updated.job, 'Kỹ sư phần mềm');
      assert.equal(updated.bio, 'Yêu thích lập trình và phượt Đà Nẵng');

      // Tải lại dữ liệu trực tiếp từ Database
      const fetched = await dbService.getUserById(userA.id);
      assert.equal(fetched.phone, '0901234567');
      assert.equal(fetched.age, 24);
      assert.equal(fetched.job, 'Kỹ sư phần mềm');
      assert.equal(fetched.bio, 'Yêu thích lập trình và phượt Đà Nẵng');
    });

    it('Đăng xuất rồi đăng nhập lại: Dữ liệu hồ sơ không bao giờ bị mất', async () => {
      const loginRes = await dbService.loginUser({
        email: userA.email,
        password: userA.password
      });

      assert.equal(loginRes.success, true);
      assert.equal(loginRes.user.phone, '0901234567');
      assert.equal(loginRes.user.age, 24);
      assert.equal(loginRes.user.job, 'Kỹ sư phần mềm');
      assert.equal(loginRes.user.bio, 'Yêu thích lập trình và phượt Đà Nẵng');
    });
  });

  describe('2. Avatar & Profile Sync (Đồng bộ avatar và thông tin hiển thị)', () => {
    it('Đổi avatar_url đồng bộ tức thì sang thông tin user và profile trên bản đồ', async () => {
      const newAvatar = 'https://images.unsplash.com/photo-test-avatar-123';
      await dbService.updateUserProfile(userA.id, { avatarUrl: newAvatar });

      const userCheck = await dbService.getUserById(userA.id);
      assert.equal(userCheck.avatar_url, newAvatar);

      const profiles = await dbService.getProfiles();
      const profA = profiles.find(p => p.id === userA.id);
      if (profA) {
        assert.equal(profA.avatar_url || profA.avatar, newAvatar);
      }
    });

    it('Đăng xuất và đăng nhập lại: Avatar vẫn tồn tại nguyên vẹn trên cả User object và Profile trên bản đồ', async () => {
      const loginRes = await dbService.loginUser({ email: userA.email, password: userA.password });
      assert.ok(loginRes.user);
      assert.equal(loginRes.user.avatar_url, 'https://images.unsplash.com/photo-test-avatar-123');

      const profiles = await dbService.getProfiles();
      const profA = profiles.find(p => p.id === userA.id);
      assert.ok(profA);
      assert.equal(profA.avatar_url || profA.avatar, 'https://images.unsplash.com/photo-test-avatar-123');
    });
  });

  describe('3. Pin Skin & Chibi Isolation (Cô lập icon ghim/giọt nước giữa các tài khoản)', () => {
    it('User A đổi icon ghim không bao giờ đè lên User B', async () => {
      await dbService.updateUserProfile(userA.id, {
        pinSkin: 'pink_neon',
        customChibi: 'chibi-cup-milk-tea',
        pinMascot: 'mascot-duck',
        pinAction: 'dance'
      });

      await dbService.updateUserProfile(userB.id, {
        pinSkin: 'cyan_glow',
        customChibi: 'chibi-astronaut',
        pinMascot: null,
        pinAction: null
      });

      const userACheck = await dbService.getUserById(userA.id);
      const userBCheck = await dbService.getUserById(userB.id);

      assert.equal(userACheck.pin_skin, 'pink_neon');
      assert.equal(userACheck.custom_chibi, 'chibi-cup-milk-tea');
      assert.equal(userACheck.pin_mascot, 'mascot-duck');

      assert.equal(userBCheck.pin_skin, 'cyan_glow');
      assert.equal(userBCheck.custom_chibi, 'chibi-astronaut');
      assert.equal(userBCheck.pin_mascot, null);
    });

    it('Chibi có thời hạn tự hủy (chibiExpiresAt): Còn hạn thì hiển thị, hết hạn thì tự động thu hồi', async () => {
      // 1. Cập nhật vị trí GPS với Chibi có hạn còn 2 giờ
      const futureExpiry = new Date(Date.now() + 2 * 3600 * 1000).toISOString();
      await dbService.updateGps(
        userA.id,
        16.0544,
        108.2022,
        'Vui vẻ yêu đời',
        userA.full_name,
        userA.avatar_url,
        userA.user_code,
        userA.phone,
        null,
        'water-happy',
        'auto',
        null,
        null,
        futureExpiry
      );

      let profiles = await dbService.getProfiles();
      let profA = profiles.find(p => p.id === userA.id);
      assert.ok(profA);
      assert.equal(profA.custom_chibi, 'water-happy');
      assert.equal(profA.chibi_expires_at, futureExpiry);

      // 2. Cập nhật Chibi đã quá hạn (trong quá khứ)
      const pastExpiry = new Date(Date.now() - 1000).toISOString();
      await dbService.updateGps(
        userA.id,
        16.0544,
        108.2022,
        'Đã hết hạn',
        userA.full_name,
        userA.avatar_url,
        userA.user_code,
        userA.phone,
        null,
        'water-tired',
        'auto',
        null,
        null,
        pastExpiry
      );

      profiles = await dbService.getProfiles();
      profA = profiles.find(p => p.id === userA.id);
      assert.ok(profA);
      // Tự động thu hồi Chibi đã quá hạn
      assert.equal(profA.custom_chibi, null);
    });
  });

  describe('4. Live Location Sharing (Chia sẻ vị trí trực tiếp)', () => {
    let liveMessageId;

    it('Gửi tin nhắn vị trí trực tiếp với trạng thái active và thời hạn hết hạn', async () => {
      const convId = `conv-direct-${[userA.id, userB.id].sort().join('--')}`;
      const expiresAt = new Date(Date.now() + 15 * 60000).toISOString();
      const msg = await dbService.sendMessage({
        conversation_id: convId,
        sender: userA.id,
        sender_name: userA.full_name,
        text: 'Đang chia sẻ vị trí',
        is_live_location: true,
        live_duration_minutes: 15,
        live_expires_at: expiresAt,
        lat: 16.07116,
        lng: 108.19949,
        speed: 18.5
      });

      assert.equal(msg.is_live_location, true);
      assert.equal(msg.live_status, 'active');
      assert.equal(msg.speed, 18.5);
      assert.equal(msg.lat, 16.07116);
      assert.equal(msg.lng, 108.19949);
      liveMessageId = msg.id;
    });

    it('Người lạ (User C) không có quyền dừng chia sẻ vị trí của User A', async () => {
      await assert.rejects(
        async () => {
          await dbService.stopLiveLocation(liveMessageId, userC.id);
        },
        /Bạn không có quyền dừng chia sẻ vị trí của người khác/
      );
    });

    it('Chính chủ (User A) dừng chia sẻ vị trí: chuyển trạng thái sang stopped', async () => {
      const stoppedMsg = await dbService.stopLiveLocation(liveMessageId, userA.id);
      assert.equal(stoppedMsg.live_status, 'stopped');
      assert.ok(stoppedMsg.stopped_at);
    });
  });

  describe('5. Chat Poll Creation & Interactive Voting (Bình chọn trong chat)', () => {
    let pollMessageId;

    it('Gửi tin nhắn bình chọn với tiêu đề và các phương án', async () => {
      const convId = `conv-direct-${[userA.id, userB.id].sort().join('--')}`;
      const pollMsg = await dbService.sendMessage({
        conversation_id: convId,
        sender: userA.id,
        sender_name: userA.full_name,
        text: '[BÌNH CHỌN]: Tối nay ăn gì?',
        is_poll: true,
        poll: {
          id: `poll-${Date.now()}`,
          title: 'Tối nay ăn gì?',
          options: [
            { id: 'opt-1', text: 'Bún bò Huế', votes: [] },
            { id: 'opt-2', text: 'Mì Quảng', votes: [] },
            { id: 'opt-3', text: 'Cơm tấm', votes: [] }
          ]
        }
      });

      assert.equal(pollMsg.is_poll, true);
      assert.equal(pollMsg.poll.title, 'Tối nay ăn gì?');
      assert.equal(pollMsg.poll.options.length, 3);
      pollMessageId = pollMsg.id;
    });

    it('User A biểu quyết cho lựa chọn 1 (Bún bò Huế)', async () => {
      const votedMsg = await dbService.voteMessagePoll(pollMessageId, 'opt-1', userA.id);
      const opt1 = votedMsg.poll.options.find(o => o.id === 'opt-1');
      assert.ok(opt1.votes.includes(userA.id));
      assert.equal(opt1.votes.length, 1);
    });

    it('User B biểu quyết cho lựa chọn 2 (Mì Quảng)', async () => {
      const votedMsg = await dbService.voteMessagePoll(pollMessageId, 'opt-2', userB.id);
      const opt1 = votedMsg.poll.options.find(o => o.id === 'opt-1');
      const opt2 = votedMsg.poll.options.find(o => o.id === 'opt-2');

      assert.equal(opt1.votes.length, 1);
      assert.equal(opt2.votes.length, 1);
      assert.ok(opt2.votes.includes(userB.id));
    });

    it('User A đổi ý chuyển vote sang lựa chọn 2: Vote ở lựa chọn 1 bị hủy, lựa chọn 2 tăng lên 2', async () => {
      const votedMsg = await dbService.voteMessagePoll(pollMessageId, 'opt-2', userA.id);
      const opt1 = votedMsg.poll.options.find(o => o.id === 'opt-1');
      const opt2 = votedMsg.poll.options.find(o => o.id === 'opt-2');

      assert.equal(opt1.votes.length, 0);
      assert.equal(opt2.votes.length, 2);
      assert.ok(opt2.votes.includes(userA.id));
      assert.ok(opt2.votes.includes(userB.id));
    });
  });

  describe('6. Circle Creation with Friends (Tạo nhóm với bạn bè)', () => {
    let createdCircle;

    it('Tạo nhóm với danh sách bạn bè đã chọn: Lưu bền vững và thêm thành viên', async () => {
      createdCircle = await dbService.createCircle({
        name: 'Hội Cạ Cứng Đà Nẵng',
        ownerId: userA.id,
        memberIds: [userB.id]
      });

      assert.ok(createdCircle.id);
      assert.equal(createdCircle.name, 'Hội Cạ Cứng Đà Nẵng');
      assert.equal(createdCircle.owner_id, userA.id);
      assert.ok(createdCircle.member_ids.includes(userA.id));
      assert.ok(createdCircle.member_ids.includes(userB.id));
    });

    it('Thành viên nhóm có quyền xem và gửi tin nhắn vào nhóm', async () => {
      const groupMsg = await dbService.sendMessage({
        conversation_id: createdCircle.id,
        sender: userB.id,
        sender_name: userB.full_name,
        text: 'Chào cả nhóm nhé!'
      });

      assert.equal(groupMsg.text, 'Chào cả nhóm nhé!');
      assert.equal(groupMsg.conversation_id, createdCircle.id);
    });

    it('Người ngoài (User C) bị chặn 403 khi cố gửi tin nhắn vào nhóm', async () => {
      await assert.rejects(
        async () => {
          await dbService.sendMessage({
            conversation_id: createdCircle.id,
            sender: userC.id,
            sender_name: userC.full_name,
            text: 'Cho mình vào nhóm với'
          });
        },
        /Bạn không phải thành viên của nhóm này/
      );
    });
  });

  describe('7. Story Persistence Across Logout & Re-login Cycle (Bảo toàn Story qua chu kỳ đăng xuất - đăng nhập)', () => {
    let createdStoryId;

    it('User đăng Story với thời hạn 24h: Lưu bền vững vào cơ sở dữ liệu', async () => {
      const story = await dbService.createStory({
        host_id: userA.id,
        user_code: userA.user_code,
        host_name: userA.full_name,
        host_avatar: userA.avatar_url,
        title: 'Cà phê sáng Đà Nẵng',
        description: 'Ngắm cầu Rồng',
        image: 'https://images.unsplash.com/photo-test-cafe-123',
        expiry_hours: 24,
        category: 'cafe',
        lat: 16.06,
        lng: 108.22
      });

      assert.ok(story.id);
      assert.equal(story.host_id, userA.id);
      assert.equal(story.title, 'Cà phê sáng Đà Nẵng');
      assert.ok(story.expires_at);
      createdStoryId = story.id;

      const allStories = await dbService.getStories();
      const found = allStories.find(s => s.id === createdStoryId);
      assert.ok(found);
      assert.equal(found.title, 'Cà phê sáng Đà Nẵng');
    });

    it('User đăng xuất (offline) rồi đăng nhập lại: Story còn hạn vẫn tồn tại nguyên vẹn 100%', async () => {
      // 1. Giả lập đăng xuất
      await dbService.setUserOffline(userA.id);

      // 2. Kiểm tra danh sách stories của hệ thống
      const storiesAfterLogout = await dbService.getStories();
      const foundAfterLogout = storiesAfterLogout.find(s => s.id === createdStoryId);
      assert.ok(foundAfterLogout, 'Story phải được bảo toàn khi user đăng xuất nếu còn thời hạn');
      assert.equal(foundAfterLogout.host_id, userA.id);

      // 3. Giả lập đăng nhập lại (online lại)
      await dbService.updateGps(
        userA.id,
        16.06,
        108.22,
        'Online trở lại',
        userA.full_name,
        userA.avatar_url,
        userA.user_code,
        userA.phone
      );

      const storiesAfterLogin = await dbService.getStories();
      const foundAfterLogin = storiesAfterLogin.find(s => s.id === createdStoryId);
      assert.ok(foundAfterLogin, 'Story vẫn tồn tại đầy đủ sau khi đăng nhập lại');
      assert.equal(foundAfterLogin.image, 'https://images.unsplash.com/photo-test-cafe-123');
    });

    it('Story quá hạn tự động bị lọc bỏ, không tồn tại vĩnh viễn', async () => {
      const expiredStory = await dbService.createStory({
        host_id: userA.id,
        title: 'Story cũ đã hết hạn',
        expires_at: new Date(Date.now() - 5000).toISOString(),
        expiry_hours: 1
      });

      const allStories = await dbService.getStories();
      const foundExpired = allStories.find(s => s.id === expiredStory.id);
      assert.equal(foundExpired, undefined, 'Story quá hạn phải bị loại bỏ khỏi danh sách');
    });
  });

  describe('8. Story Chibi & Status Persistence Across Logout & Re-login Cycle', () => {
    it('User đăng Story Chibi (24h) kèm tâm trạng và bài hát: lưu trữ bền vững', async () => {
      const futureExp = Date.now() + 24 * 3600 * 1000;
      await dbService.updateGps(
        userA.id,
        16.06,
        108.22,
        'Đang vi vu khắp phố',
        userA.full_name,
        userA.avatar_url,
        userA.user_code,
        userA.phone,
        { id: 'song-1', title: 'Bật Tình Yêu Lên', artist: 'Tăng Duy Tân' },
        'tease',
        'dark_neon',
        null,
        null,
        futureExp
      );

      const userProfile = await dbService.getUserById(userA.id);
      assert.ok(userProfile);
      assert.equal(userProfile.custom_chibi, 'tease');
      assert.equal(userProfile.custom_status, 'Đang vi vu khắp phố');
      assert.ok(userProfile.custom_song);
      assert.equal(userProfile.chibi_expires_at, futureExp);
    });

    it('User đăng xuất rồi đăng nhập lại: Story Chibi và tâm trạng còn hạn được phục hồi 100%', async () => {
      // 1. Đăng xuất (offline)
      await dbService.setUserOffline(userA.id);

      // 2. Đăng nhập lại
      const loginRes = await dbService.loginUser({
        email: userA.email,
        password: userA.password
      });

      assert.ok(loginRes.success);
      assert.ok(loginRes.user);
      assert.equal(loginRes.user.custom_chibi, 'tease', 'Chibi phải tồn tại sau khi đăng nhập lại');
      assert.equal(loginRes.user.custom_status, 'Đang vi vu khắp phố', 'Tâm trạng phải tồn tại');
      assert.ok(loginRes.user.chibi_expires_at, 'Thời hạn tự hủy phải được bảo tồn');

      // 3. getUserById cũng trả về Chibi hợp lệ
      const refreshed = await dbService.getUserById(userA.id);
      assert.equal(refreshed.custom_chibi, 'tease');
    });

    it('Chibi quá hạn tự hủy tự động trả về null khi đăng nhập lại', async () => {
      const pastExp = Date.now() - 10000; // Đã hết hạn 10s trước
      await dbService.updateGps(
        userA.id,
        16.06,
        108.22,
        'Hết hạn rồi',
        userA.full_name,
        userA.avatar_url,
        userA.user_code,
        userA.phone,
        null,
        'angry',
        'auto',
        null,
        null,
        pastExp
      );

      // Khi đăng nhập lại hoặc lấy profile
      const userAfterExp = await dbService.getUserById(userA.id);
      assert.equal(userAfterExp.custom_chibi, null, 'Chibi hết hạn phải tự động thu hồi về null');
      assert.equal(userAfterExp.chibi_expires_at, null);
    });
  });
});
