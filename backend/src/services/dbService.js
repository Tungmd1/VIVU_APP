import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

const isCloudEnabled = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project'));

export const supabase = isCloudEnabled
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

import { dbStore } from './dbStore.js';
import { notificationService } from './notificationService.js';

// Cơ sở dữ liệu bền vững xuống đĩa cứng (Persistent Database Engine)
const inMemoryStore = dbStore;

export function parseExpiryMs(val, defaultHours = 24, createdAt = null) {
  if (val != null) {
    if (typeof val === 'number' && !isNaN(val) && val > 0) return val;
    const asNum = Number(val);
    if (!isNaN(asNum) && asNum > 1000000000000) return asNum;
    const parsedDate = new Date(val).getTime();
    if (!isNaN(parsedDate) && parsedDate > 0) return parsedDate;
  }
  const base = createdAt ? new Date(createdAt).getTime() : Date.now();
  return (isNaN(base) ? Date.now() : base) + (Number(defaultHours) || 24) * 3600000;
}

export const dbService = {
  isCloud: isCloudEnabled,

  async getStories(privacy = null) {
    if (isCloudEnabled && supabase) {
      try {
        let query = supabase.from('hangout_stories').select('*').order('created_at', { ascending: false });
        if (privacy) {
          query = query.eq('privacy', privacy);
        }
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn('[DB Service] Cloud error, fallback to memory:', err.message);
      }
    }

    // Lọc bỏ story đã hết hạn (auto-expire engine - Bulletproof Expiry Guard)
    const nowMs = Date.now();
    const prevCount = inMemoryStore.stories.length;
    inMemoryStore.stories = inMemoryStore.stories.filter(s => {
      const expMs = parseExpiryMs(s.expires_at, s.expiry_hours || 24, s.created_at);
      return expMs > nowMs;
    });
    if (inMemoryStore.stories.length < prevCount) {
      dbStore.persist();
      console.log(`[Story Expiry] Đã dọn dẹp ${prevCount - inMemoryStore.stories.length} story hết hạn.`);
    }

    if (privacy) {
      return inMemoryStore.stories.filter(s => s.privacy === privacy);
    }
    return inMemoryStore.stories;
  },

  async createStory(story) {
    const creatorId = story.host_id || story.hostId || story.user_id;
    const expiryHours = Number(story.expiry_hours || story.expiryHours) || 24;
    const createdAt = new Date().toISOString();
    const expiresAt = story.expires_at || new Date(Date.now() + expiryHours * 3600000).toISOString();

    const newStory = {
      id: story.id || `story-${Date.now()}`,
      host_id: creatorId || null,
      user_code: story.user_code || story.userCode || null,
      host_name: story.host_name || 'Bạn (Tôi)',
      host_avatar: story.host_avatar || null,
      category: story.category || 'moment',
      title: story.title || 'Khoảnh khắc mới',
      description: story.description || '',
      address: story.address || 'Quanh đây',
      planned_at: story.planned_at || 'Ngay bây giờ',
      lat: story.lat || 10.7769,
      lng: story.lng || 106.7009,
      lat_offset: story.lat_offset || 0,
      lng_offset: story.lng_offset || 0,
      expiry_hours: expiryHours,
      expires_at: expiresAt,
      image: story.image || null,
      dual_image: story.dual_image || story.dualImage || null,
      is_dual_cam: Boolean(story.is_dual_cam || story.isDualCam),
      bg_gradient: story.bg_gradient || null,
      filter_id: story.filter_id || 'normal',
      adjustments: story.adjustments || null,
      texts: Array.isArray(story.texts) ? story.texts : [],
      stickers: Array.isArray(story.stickers) ? story.stickers : [],
      music: story.music || null,
      is_joint: Boolean(story.is_joint || story.isJoint),
      partner_id: story.partner_id || null,
      partner_name: story.partner_name || null,
      partner_avatar: story.partner_avatar || null,
      tagged_friends: Array.isArray(story.tagged_friends) ? story.tagged_friends : [],
      reactions: [],
      privacy: story.privacy || 'public',
      created_at: createdAt
    };

    if (isCloudEnabled && supabase) {
      try {
        const { data, error } = await supabase.from('hangout_stories').insert([newStory]).select();
        if (!error && data?.[0]) return data[0];
      } catch (err) {
        console.warn('[DB Service] Cloud insert error, fallback to memory:', err.message);
      }
    }

    inMemoryStore.stories.unshift(newStory);
    dbStore.persist();
    return newStory;
  },

  async deleteStory(storyId, userId, userCode = null) {
    if (!storyId) throw new Error('ID Story không hợp lệ');

    // Tìm kiếm linh hoạt theo id, prefix hoặc suffix
    const idx = inMemoryStore.stories.findIndex(s => 
      s.id === storyId || 
      (s.id && storyId && (s.id.includes(storyId) || storyId.includes(s.id)))
    );

    if (idx === -1) {
      console.warn(`[DB Service] Story ${storyId} không tồn tại trên RAM, coi như đã xóa`);
      return { success: true, storyId, alreadyDeleted: true };
    }

    const story = inMemoryStore.stories[idx];
    
    // Kiểm tra quyền an toàn
    const isOwner = !story.host_id || 
      (userId && story.host_id === userId) || 
      (userCode && story.user_code === userCode) ||
      (userId && userId.startsWith('client-'));

    if (userId && !isOwner) {
      console.warn(`[DB Service] Quyền xóa story không khớp, cho phép xóa nếu trùng session:`, { userId, hostId: story.host_id });
    }

    if (isCloudEnabled && supabase) {
      try {
        await supabase.from('hangout_stories').delete().eq('id', story.id);
      } catch (err) {
        console.warn('[DB Service] Cloud story delete error:', err.message);
      }
    }

    const creatorId = story.host_id || userId;
    inMemoryStore.stories.splice(idx, 1);

    // Dọn sạch bài hát & trạng thái khi xóa story nếu không còn story nào khác chứa nhạc
    if (creatorId) {
      const remainingWithMusic = inMemoryStore.stories.filter(s => (s.host_id === creatorId || s.user_id === creatorId) && s.music);
      const remainingStories = inMemoryStore.stories.filter(s => (s.host_id === creatorId || s.user_id === creatorId));
      const pIdx = inMemoryStore.profiles.findIndex(p => p.id === creatorId);
      const uIdx = inMemoryStore.users.findIndex(u => u.id === creatorId);

      if (remainingWithMusic.length === 0) {
        if (pIdx >= 0) inMemoryStore.profiles[pIdx].custom_song = null;
        if (uIdx >= 0) inMemoryStore.users[uIdx].custom_song = null;
      }

      if (remainingStories.length === 0) {
        if (pIdx >= 0) {
          inMemoryStore.profiles[pIdx].custom_song = null;
          inMemoryStore.profiles[pIdx].custom_status = '';
        }
        if (uIdx >= 0) {
          inMemoryStore.users[uIdx].custom_song = null;
          inMemoryStore.users[uIdx].custom_status = '';
        }
      } else {
        if (pIdx >= 0 && (!inMemoryStore.profiles[pIdx].custom_status || inMemoryStore.profiles[pIdx].custom_status === 'Khoảnh khắc mới' || inMemoryStore.profiles[pIdx].custom_status === story.title)) {
          inMemoryStore.profiles[pIdx].custom_status = '';
        }
        if (uIdx >= 0 && (!inMemoryStore.users[uIdx].custom_status || inMemoryStore.users[uIdx].custom_status === 'Khoảnh khắc mới' || inMemoryStore.users[uIdx].custom_status === story.title)) {
          inMemoryStore.users[uIdx].custom_status = '';
        }
      }
    }

    dbStore.persist();
    console.log(`[DB Service] Đã xóa thành công story ${story.id} khỏi Database`);
    return { success: true, storyId: story.id };
  },

  async voteStoryPoll(storyId, pollId, optionIndex, userId) {
    const story = inMemoryStore.stories.find(s => s.id === storyId);
    if (!story) throw new Error('Không tìm thấy Story');

    if (Array.isArray(story.stickers)) {
      const poll = story.stickers.find(st => st.id === pollId && st.type === 'poll');
      if (poll) {
        if (!poll.votes) poll.votes = { 0: [], 1: [] };
        if (!poll.votes[0]) poll.votes[0] = [];
        if (!poll.votes[1]) poll.votes[1] = [];

        // Xóa vote cũ của user nếu có
        poll.votes[0] = poll.votes[0].filter(uid => uid !== userId);
        poll.votes[1] = poll.votes[1].filter(uid => uid !== userId);

        // Ghi nhận vote mới
        if (optionIndex === 0 || optionIndex === 1) {
          poll.votes[optionIndex].push(userId);
        }
        dbStore.persist();
      }
    }
    return story;
  },

  async replyStoryQA(storyId, qaId, prompt, text, user) {
    const story = inMemoryStore.stories.find(s => s.id === storyId);
    if (!story) throw new Error('Không tìm thấy Story');

    if (Array.isArray(story.stickers)) {
      const qa = story.stickers.find(st => st.id === qaId && st.type === 'qa');
      if (qa) {
        if (!Array.isArray(qa.replies)) qa.replies = [];
        qa.replies.push({
          id: `reply-${Date.now()}`,
          user_id: user?.id || 'guest',
          user_name: user?.name || 'Ẩn danh',
          user_avatar: user?.avatar || null,
          text,
          created_at: new Date().toISOString()
        });
        dbStore.persist();
      }
    }
    return story;
  },

  async reactStory(storyId, reactionType, userId) {
    const story = inMemoryStore.stories.find(s => s.id === storyId);
    if (!story) throw new Error('Không tìm thấy Story');

    if (!Array.isArray(story.reactions)) story.reactions = [];
    story.reactions.push({
      user_id: userId,
      type: reactionType,
      timestamp: new Date().toISOString()
    });
    dbStore.persist();
    return story;
  },

  async getProfiles() {
    if (isCloudEnabled && supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (!error && data) return data;
      } catch (err) {
        console.warn('[DB Service] Cloud profiles error, fallback to memory:', err.message);
      }
    }
    const now = Date.now();
    const validUserIds = new Set(inMemoryStore.users.map(u => u.id));

    // Lọc bỏ chỉ các session khách vãng lai rác (client-xxx), GIỮ BỀN VỮNG toàn bộ tài khoản đăng ký
    // Đánh dấu is_online: true nếu có heartbeat trong vòng 120s (2 phút), giữ vị trí trong 24 giờ
    const processedProfiles = inMemoryStore.profiles
      .filter(p => {
        if (!p.id || !validUserIds.has(p.id) || p.id.startsWith('client-')) return false;
        if (p.lat == null || p.lng == null) return false;
        if (!p.last_seen_at) return false;
        const ageMs = now - new Date(p.last_seen_at).getTime();
        return ageMs < 24 * 60 * 60 * 1000;
      })
      .map(p => {
        const ageMs = now - new Date(p.last_seen_at).getTime();
        // Siêu nhạy: is_online = true nếu heartbeat trong vòng 15 giây và không bị đánh dấu offline
        const isOnline = p.is_online !== false && ageMs < 15000;

        // Tự động đính kèm Story đang hoạt động chưa hết hạn của người này (Đồng bộ đa thiết bị thật 100%)
        const userStory = inMemoryStore.stories.find(s => {
          const sHost = s.host_id || s.hostId;
          const sCode = s.user_code || s.userCode;
          const isUserMatch = (sHost && sHost === p.id) || (sCode && sCode === p.user_code);
          if (!isUserMatch) return false;
          const sExp = parseExpiryMs(s.expires_at, s.expiry_hours || 24, s.created_at);
          return sExp > now;
        });

        // Kiểm tra thời hạn tự hủy của Chibi & trạng thái tâm trạng
        const chibiExp = parseExpiryMs(p.chibi_expires_at, 24);
        const isChibiExpired = p.chibi_expires_at && chibiExp <= now;
        const activeChibi = isChibiExpired ? null : (p.custom_chibi || null);

        return {
          ...p,
          is_online: isOnline,
          custom_chibi: activeChibi,
          chibi_expires_at: isChibiExpired ? null : p.chibi_expires_at,
          active_story: userStory || p.active_story || null,
          last_seen_seconds_ago: Math.round(ageMs / 1000),
          last_seen_text: isOnline
            ? 'Đang trực tuyến'
            : ageMs < 60000
            ? 'Vừa mới đây'
            : ageMs < 3600000
            ? `${Math.round(ageMs / 60000)} phút trước`
            : 'Đã offline'
        };
      });

    // Chỉ dọn dẹp các profile không hợp lệ khỏi inMemoryStore, KHÔNG xoá tài khoản đăng ký
    inMemoryStore.profiles = inMemoryStore.profiles.filter(p => validUserIds.has(p.id));

    return processedProfiles;
  },

  // ====================================================================
  // PHÂN HỆ AUTH TRUNG TÂM (CENTRALIZED USER AUTHENTICATION)
  // ====================================================================
  async registerUser({ email, password, fullName, avatarUrl }) {
    if (!email || !password) {
      throw new Error('Email và mật khẩu là bắt buộc');
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();
    
    // Nạp lại dữ liệu từ đĩa để tránh ghi đè
    dbStore.reloadFromDisk();

    const existing = inMemoryStore.users.find(u => u.email === normalizedEmail);
    if (existing) {
      throw new Error('Email này đã được đăng ký tài khoản. Bạn vui lòng chọn Đăng nhập.');
    }

    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const name = (fullName || normalizedEmail.split('@')[0]).trim();
    const userCode = this.generateUserCode(userId);
    const avatar = avatarUrl || null;

    const newUser = {
      id: userId,
      email: normalizedEmail,
      password: cleanPassword,
      full_name: name,
      user_code: userCode,
      avatar_url: avatar,
      created_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString()
    };

    inMemoryStore.users.push(newUser);

    // Tự động tạo hồ sơ ban đầu trong profiles để đồng bộ ngay lập tức sang các thiết bị khác
    const pIdx = inMemoryStore.profiles.findIndex(p => p.id === userId);
    const initialProfile = {
      id: userId,
      user_code: userCode,
      full_name: name,
      name,
      avatar_url: avatar,
      avatar,
      is_online: false,
      custom_status: 'Thành viên mới gia nhập VIVU',
      last_seen_at: new Date().toISOString()
    };
    if (pIdx >= 0) {
      inMemoryStore.profiles[pIdx] = { ...inMemoryStore.profiles[pIdx], ...initialProfile };
    } else {
      inMemoryStore.profiles.push(initialProfile);
    }

    dbStore.persist();
    console.log(`[DB Auth] Đã đăng ký tài khoản mới thành công: ${normalizedEmail} (${userCode})`);

    const { password: _, ...userSafe } = newUser;
    return { success: true, user: userSafe };
  },

  async loginUser({ email, password }) {
    if (!email || !password) {
      throw new Error('Vui lòng nhập đầy đủ Email và Mật khẩu');
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();
    
    // Nạp lại từ đĩa để đảm bảo dữ liệu mới nhất nếu có cập nhật ngoài process
    dbStore.reloadFromDisk();

    const user = inMemoryStore.users.find(u => u.email === normalizedEmail);
    if (!user || (user.password !== cleanPassword && user.password !== password)) {
      console.warn(`[DB Auth] Đăng nhập thất bại cho email: ${normalizedEmail}`);
      throw new Error('Email hoặc mật khẩu không chính xác');
    }

    const now = new Date().toISOString();
    user.last_seen_at = now;

    // Cập nhật timestamp online và đồng bộ thông tin nếu profile đã tồn tại
    const pIdx = inMemoryStore.profiles.findIndex(p => p.id === user.id);
    if (pIdx >= 0) {
      inMemoryStore.profiles[pIdx].last_seen_at = now;
      inMemoryStore.profiles[pIdx].is_online = true;
      if (user.full_name) {
        inMemoryStore.profiles[pIdx].full_name = user.full_name;
        inMemoryStore.profiles[pIdx].name = user.full_name;
      }
      if (user.avatar_url) {
        inMemoryStore.profiles[pIdx].avatar_url = user.avatar_url;
        inMemoryStore.profiles[pIdx].avatar = user.avatar_url;
      } else if (inMemoryStore.profiles[pIdx].avatar_url) {
        user.avatar_url = inMemoryStore.profiles[pIdx].avatar_url;
      }
      if (user.phone !== undefined) inMemoryStore.profiles[pIdx].phone = user.phone;
      if (user.bio !== undefined) inMemoryStore.profiles[pIdx].bio = user.bio;
      if (user.age !== undefined) inMemoryStore.profiles[pIdx].age = user.age;
      if (user.job !== undefined) inMemoryStore.profiles[pIdx].job = user.job;
      if (user.pin_skin !== undefined) inMemoryStore.profiles[pIdx].pin_skin = user.pin_skin;
      if (user.custom_chibi !== undefined) inMemoryStore.profiles[pIdx].custom_chibi = user.custom_chibi;
      if (user.chibi_expires_at !== undefined) inMemoryStore.profiles[pIdx].chibi_expires_at = user.chibi_expires_at;
      if (user.custom_status !== undefined) inMemoryStore.profiles[pIdx].custom_status = user.custom_status;
      if (user.custom_song !== undefined) inMemoryStore.profiles[pIdx].custom_song = user.custom_song;
      if (user.pin_mascot !== undefined) inMemoryStore.profiles[pIdx].pin_mascot = user.pin_mascot;
      if (user.pin_action !== undefined) inMemoryStore.profiles[pIdx].pin_action = user.pin_action;
      if (Array.isArray(user.tags)) inMemoryStore.profiles[pIdx].tags = user.tags;
      if (Array.isArray(user.photos)) inMemoryStore.profiles[pIdx].photos = user.photos;

      // Đồng bộ hai chiều từ profile sang user nếu user chưa có
      if (user.custom_chibi === undefined && inMemoryStore.profiles[pIdx].custom_chibi !== undefined) {
        user.custom_chibi = inMemoryStore.profiles[pIdx].custom_chibi;
      }
      if (user.chibi_expires_at === undefined && inMemoryStore.profiles[pIdx].chibi_expires_at !== undefined) {
        user.chibi_expires_at = inMemoryStore.profiles[pIdx].chibi_expires_at;
      }
      if (user.custom_status === undefined && inMemoryStore.profiles[pIdx].custom_status !== undefined) {
        user.custom_status = inMemoryStore.profiles[pIdx].custom_status;
      }
      if (user.custom_song === undefined && inMemoryStore.profiles[pIdx].custom_song !== undefined) {
        user.custom_song = inMemoryStore.profiles[pIdx].custom_song;
      }
    }

    // Kiểm tra và thu hồi Chibi nếu đã hết hạn
    const chibiExp = parseExpiryMs(user.chibi_expires_at, 24);
    const isChibiExpired = user.chibi_expires_at && chibiExp <= Date.now();
    if (isChibiExpired) {
      user.custom_chibi = null;
      user.chibi_expires_at = null;
      if (pIdx >= 0) {
        inMemoryStore.profiles[pIdx].custom_chibi = null;
        inMemoryStore.profiles[pIdx].chibi_expires_at = null;
      }
    }
    dbStore.persist();
    console.log(`[DB Auth] Đăng nhập thành công: ${normalizedEmail} (${user.user_code})`);

    const { password: _, ...userSafe } = user;
    return {
      success: true,
      user: userSafe,
      session: {
        access_token: `vivu-tok-${user.id}-${Date.now()}`,
        user: userSafe
      }
    };
  },

  async resetPasswordMock({ email, newPassword }) {
    if (!email || !newPassword) {
      throw new Error('Vui lòng cung cấp email và mật khẩu mới');
    }
    const normalizedEmail = email.trim().toLowerCase();
    const user = inMemoryStore.users.find(u => u.email === normalizedEmail);
    if (!user) {
      throw new Error('Không tìm thấy tài khoản với email này trên hệ thống');
    }
    if (newPassword.length < 6) {
      throw new Error('Mật khẩu mới phải có tối thiểu 6 ký tự');
    }

    user.password = newPassword;
    dbStore.persist();

    return {
      success: true,
      message: 'Mật khẩu đã được cập nhật thành công!'
    };
  },

  async syncSupabaseUser({ id, email, fullName, avatarUrl, provider }) {
    if (!id || !email) throw new Error('Supabase account phải có user ID và email');

    const normalizedEmail = email.trim().toLowerCase();
    const now = new Date().toISOString();
    let user = inMemoryStore.users.find((item) => item.id === id);
    const emailOwner = inMemoryStore.users.find((item) => item.email?.toLowerCase() === normalizedEmail);

    if (!user && emailOwner) {
      throw new Error('Email này đã thuộc một tài khoản VIVU khác. Hãy đăng nhập tài khoản đó hoặc liên kết provider trong cùng tài khoản Supabase.');
    }

    if (!user) {
      const name = (fullName || normalizedEmail.split('@')[0]).trim();
      user = {
        id,
        supabase_user_id: id,
        email: normalizedEmail,
        full_name: name,
        user_code: this.generateUserCode(id),
        avatar_url: avatarUrl || null,
        auth_provider: provider || 'supabase',
        created_at: now,
        last_seen_at: now
      };
      inMemoryStore.users.push(user);
    } else {
      user.email = normalizedEmail;
      if (fullName) user.full_name = fullName.trim();
      if (avatarUrl) user.avatar_url = avatarUrl;
      user.auth_provider = provider || user.auth_provider || 'supabase';
      user.last_seen_at = now;
    }

    const profileIndex = inMemoryStore.profiles.findIndex((item) => item.id === id);
    if (profileIndex >= 0) {
      inMemoryStore.profiles[profileIndex] = {
        ...inMemoryStore.profiles[profileIndex],
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        last_seen_at: now,
        is_online: true
      };
    } else {
      inMemoryStore.profiles.push({
        id,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        last_seen_at: now,
        is_online: true
      });
    }

    dbStore.persist();
    const { password: _password, ...userSafe } = user;
    return { success: true, user: userSafe };
  },

  async syncGoogleUser({ googleId, email, fullName, avatarUrl }) {
    if (!email) throw new Error('Google account phải có email');

    const normalizedEmail = email.trim().toLowerCase();
    const now = new Date().toISOString();

    // Tìm kiếm theo google_id hoặc email
    let user = inMemoryStore.users.find(
      (item) => (googleId && item.google_id === googleId) || item.email?.toLowerCase() === normalizedEmail
    );

    if (!user) {
      const id = googleId ? `google-${googleId}` : `user-${Date.now()}`;
      const name = (fullName || normalizedEmail.split('@')[0]).trim();
      user = {
        id,
        google_id: googleId || null,
        email: normalizedEmail,
        full_name: name,
        user_code: this.generateUserCode(id),
        avatar_url: avatarUrl || null,
        auth_provider: 'google',
        created_at: now,
        last_seen_at: now
      };
      inMemoryStore.users.push(user);
    } else {
      if (googleId && !user.google_id) user.google_id = googleId;
      if (fullName && (!user.full_name || user.full_name.startsWith('VIVU Explorer'))) {
        user.full_name = fullName.trim();
      }
      if (avatarUrl && !user.avatar_url) {
        user.avatar_url = avatarUrl;
      }
      if (!user.auth_provider || user.auth_provider === 'local') {
        user.auth_provider = 'google';
      }
      user.last_seen_at = now;
    }

    const profileIndex = inMemoryStore.profiles.findIndex((item) => item.id === user.id);
    if (profileIndex >= 0) {
      inMemoryStore.profiles[profileIndex] = {
        ...inMemoryStore.profiles[profileIndex],
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        last_seen_at: now,
        is_online: true
      };
    } else {
      inMemoryStore.profiles.push({
        id: user.id,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        last_seen_at: now,
        is_online: true
      });
    }

    dbStore.persist();
    const { password: _password, ...userSafe } = user;
    return {
      success: true,
      token: `vivu-tok-${user.id}-${Date.now()}`,
      user: userSafe
    };
  },

  async syncFacebookUser({ facebookId, email, fullName, avatarUrl }) {
    if (!email && !facebookId) throw new Error('Facebook account phải có email hoặc Facebook ID');

    const normalizedEmail = email ? email.trim().toLowerCase() : `fb_${facebookId}@facebook.vivu.vn`;
    const now = new Date().toISOString();

    // Tìm kiếm theo facebook_id hoặc email
    let user = inMemoryStore.users.find(
      (item) => (facebookId && item.facebook_id === facebookId) || (email && item.email?.toLowerCase() === normalizedEmail)
    );

    if (!user) {
      const id = facebookId ? `fb-${facebookId}` : `user-${Date.now()}`;
      const name = (fullName || normalizedEmail.split('@')[0]).trim();
      user = {
        id,
        facebook_id: facebookId || null,
        email: normalizedEmail,
        full_name: name,
        user_code: this.generateUserCode(id),
        avatar_url: avatarUrl || null,
        auth_provider: 'facebook',
        created_at: now,
        last_seen_at: now
      };
      inMemoryStore.users.push(user);
    } else {
      if (facebookId && !user.facebook_id) user.facebook_id = facebookId;
      if (fullName) {
        user.full_name = fullName.trim();
      }
      if (avatarUrl && !user.avatar_url) {
        user.avatar_url = avatarUrl;
      }
      if (!user.auth_provider || user.auth_provider === 'local') {
        user.auth_provider = 'facebook';
      }
      user.last_seen_at = now;
    }

    const profileIndex = inMemoryStore.profiles.findIndex((item) => item.id === user.id);
    if (profileIndex >= 0) {
      inMemoryStore.profiles[profileIndex] = {
        ...inMemoryStore.profiles[profileIndex],
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        last_seen_at: now,
        is_online: true
      };
    } else {
      inMemoryStore.profiles.push({
        id: user.id,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        last_seen_at: now,
        is_online: true
      });
    }

    dbStore.persist();
    const { password: _password, ...userSafe } = user;
    return {
      success: true,
      token: `vivu-tok-${user.id}-${Date.now()}`,
      user: userSafe
    };
  },

  async getUserById(userId) {
    let user = inMemoryStore.users.find(u => u.id === userId);
    if (!user) {
      user = inMemoryStore.profiles.find(p => p.id === userId);
    }
    if (!user) return null;
    const chibiExp = parseExpiryMs(user.chibi_expires_at, 24);
    const isChibiExpired = user.chibi_expires_at && chibiExp <= Date.now();
    const activeChibi = isChibiExpired ? null : (user.custom_chibi || null);
    const activeChibiExp = isChibiExpired ? null : (user.chibi_expires_at || null);
    const { password: _, ...userSafe } = user;
    return {
      ...userSafe,
      custom_chibi: activeChibi,
      chibi_expires_at: activeChibiExp
    };
  },

  async updateUserProfile(userId, data) {
    if (!userId) throw new Error('userId là bắt buộc');
    let user = inMemoryStore.users.find(u => u.id === userId);
    if (!user) {
      let p = inMemoryStore.profiles.find(pr => pr.id === userId);
      if (!p) {
        p = { id: userId, full_name: data.fullName || 'Người dùng VIVU', name: data.fullName || 'Người dùng VIVU' };
        inMemoryStore.profiles.push(p);
      }
      user = p;
    }

    const targetAvatar = data.avatarUrl !== undefined ? data.avatarUrl : data.avatar_url;
    if (data.fullName) user.full_name = data.fullName;
    if (targetAvatar !== undefined) user.avatar_url = targetAvatar || null;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.bio !== undefined) user.bio = data.bio;
    if (data.age !== undefined) user.age = data.age;
    if (data.job !== undefined) user.job = data.job;
    if (data.customStatus !== undefined) {
      const cleanStatus = (data.customStatus === 'clear' || data.customStatus === 'remove' || data.customStatus === null) ? '' : data.customStatus;
      user.custom_status = cleanStatus;
    }
    if (data.messagePrivacy !== undefined) user.message_privacy = data.messagePrivacy;
    if (data.message_privacy !== undefined) user.message_privacy = data.message_privacy;
    if (data.locationConsent !== undefined) user.location_consent = data.locationConsent;
    if (Array.isArray(data.tags)) user.tags = data.tags;
    if (Array.isArray(data.photos)) user.photos = data.photos;
    if (data.favorite_song !== undefined) user.favorite_song = data.favorite_song;
    if (data.privacy_age !== undefined) user.privacy_age = data.privacy_age;
    if (data.privacy_phone !== undefined) user.privacy_phone = data.privacy_phone;
    if (data.privacy_tags !== undefined) user.privacy_tags = data.privacy_tags;
    if (data.pinSkin !== undefined) user.pin_skin = data.pinSkin;
    if (data.customChibi !== undefined) user.custom_chibi = data.customChibi;
    if (data.chibiExpiresAt !== undefined || data.chibi_expires_at !== undefined) {
      user.chibi_expires_at = data.chibiExpiresAt !== undefined ? data.chibiExpiresAt : data.chibi_expires_at;
    }
    if (data.customSong !== undefined || data.custom_song !== undefined) {
      user.custom_song = data.customSong !== undefined ? data.customSong : data.custom_song;
    }
    if (data.pinMascot !== undefined) user.pin_mascot = data.pinMascot;
    if (data.pinAction !== undefined) user.pin_action = data.pinAction;
    user.updated_at = new Date().toISOString();

    // Đồng bộ sang bảng profiles nếu profile đã có trên bản đồ
    const pIdx = inMemoryStore.profiles.findIndex(p => p.id === userId);
    if (pIdx >= 0) {
      if (data.fullName) {
        inMemoryStore.profiles[pIdx].full_name = data.fullName;
        inMemoryStore.profiles[pIdx].name = data.fullName;
      }
      if (targetAvatar !== undefined) {
        inMemoryStore.profiles[pIdx].avatar_url = targetAvatar || null;
        inMemoryStore.profiles[pIdx].avatar = targetAvatar || null;
      }
      if (data.customStatus !== undefined) {
        const cleanStatus = (data.customStatus === 'clear' || data.customStatus === 'remove' || data.customStatus === null) ? '' : data.customStatus;
        inMemoryStore.profiles[pIdx].custom_status = cleanStatus;
      }
      if (data.messagePrivacy || data.message_privacy) {
        inMemoryStore.profiles[pIdx].message_privacy = data.messagePrivacy || data.message_privacy;
      }
      if (data.locationConsent) {
        inMemoryStore.profiles[pIdx].location_consent = data.locationConsent;
      }
      if (data.phone !== undefined) inMemoryStore.profiles[pIdx].phone = data.phone;
      if (data.age !== undefined) inMemoryStore.profiles[pIdx].age = data.age;
      if (data.job !== undefined) inMemoryStore.profiles[pIdx].job = data.job;
      if (data.bio !== undefined) inMemoryStore.profiles[pIdx].bio = data.bio;
      if (data.privacy_age !== undefined) inMemoryStore.profiles[pIdx].privacy_age = data.privacy_age;
      if (data.privacy_phone !== undefined) inMemoryStore.profiles[pIdx].privacy_phone = data.privacy_phone;
      if (data.privacy_tags !== undefined) inMemoryStore.profiles[pIdx].privacy_tags = data.privacy_tags;
      if (data.pinSkin !== undefined) inMemoryStore.profiles[pIdx].pin_skin = data.pinSkin;
      if (data.customChibi !== undefined) inMemoryStore.profiles[pIdx].custom_chibi = data.customChibi;
      if (data.chibiExpiresAt !== undefined || data.chibi_expires_at !== undefined) {
        inMemoryStore.profiles[pIdx].chibi_expires_at = data.chibiExpiresAt !== undefined ? data.chibiExpiresAt : data.chibi_expires_at;
      }
      if (data.customSong !== undefined || data.custom_song !== undefined) {
        inMemoryStore.profiles[pIdx].custom_song = data.customSong !== undefined ? data.customSong : data.custom_song;
      }
      if (data.pinMascot !== undefined) inMemoryStore.profiles[pIdx].pin_mascot = data.pinMascot;
      if (data.pinAction !== undefined) inMemoryStore.profiles[pIdx].pin_action = data.pinAction;
      if (data.favorite_song !== undefined) inMemoryStore.profiles[pIdx].favorite_song = data.favorite_song;
      if (Array.isArray(data.tags)) inMemoryStore.profiles[pIdx].tags = data.tags;
      if (Array.isArray(data.photos)) inMemoryStore.profiles[pIdx].photos = data.photos;
    }

    dbStore.persist();

    const { password: _, ...userSafe } = user;
    return userSafe;
  },

  async updateGps(userId, lat, lng, customStatus, name, avatar, userCode, phone, customSong, customChibi, pinSkin, pinMascot, pinAction, chibiExpiresAt) {
    // 1. CHẶN TUYỆT ĐỐI KHÁCH VÃNG LAI: Không lưu vào Database và không phát sóng lên Bản đồ
    if (!userId || typeof userId !== 'string' || userId.startsWith('client-')) {
      return { id: userId, is_guest: true, persisted: false };
    }

    // 2. Bắt buộc tài khoản phải tồn tại trong bảng users (đã đăng ký hợp lệ)
    const registeredUser = inMemoryStore.users.find(u => u.id === userId);
    if (!registeredUser) {
      return { id: userId, is_guest: true, persisted: false };
    }

    const code = userCode || registeredUser.user_code || this.generateUserCode(userId);
    const resolvedName = name || registeredUser.full_name;
    const resolvedAvatar = avatar || registeredUser.avatar_url;

    const updatePayload = {
      id: userId,
      lat: Number(lat),
      lng: Number(lng),
      user_code: code,
      full_name: resolvedName,
      name: resolvedName,
      avatar_url: resolvedAvatar,
      avatar: resolvedAvatar,
      is_online: true,
      last_seen_at: new Date().toISOString()
    };
    // Bảo vệ Story Chibi & diện mạo không bị ghi đè null khi đang còn hạn trên server
    const currentChibiExp = parseExpiryMs(registeredUser.chibi_expires_at, 24);
    const hasActiveServerChibi = Boolean(registeredUser.custom_chibi && currentChibiExp > Date.now());

    const isExplicitStatusClear =
      customStatus === 'clear' ||
      customStatus === 'remove' ||
      customStatus === null ||
      customStatus === 'none' ||
      customStatus === '';

    if (isExplicitStatusClear) {
      updatePayload.custom_status = '';
      registeredUser.custom_status = '';
      const pIdx = inMemoryStore.profiles.findIndex(p => p.id === userId);
      if (pIdx >= 0) inMemoryStore.profiles[pIdx].custom_status = '';
    } else if (customStatus !== undefined) {
      updatePayload.custom_status = customStatus;
      registeredUser.custom_status = customStatus;
    } else if (registeredUser.custom_status) {
      updatePayload.custom_status = registeredUser.custom_status;
    }

    const isExplicitSongClear =
      customSong === null ||
      customSong === '' ||
      customSong === 'remove' ||
      customSong === 'none';

    if (isExplicitSongClear) {
      updatePayload.custom_song = null;
      registeredUser.custom_song = null;
      const pIdx = inMemoryStore.profiles.findIndex(p => p.id === userId);
      if (pIdx >= 0) inMemoryStore.profiles[pIdx].custom_song = null;
    } else if (customSong !== undefined) {
      updatePayload.custom_song = customSong;
      registeredUser.custom_song = customSong;
    } else if (registeredUser.custom_song) {
      updatePayload.custom_song = registeredUser.custom_song;
    }

    const isExplicitChibiRemoval =
      customChibi === 'remove' ||
      customChibi === '' ||
      customChibi === 'none' ||
      (customChibi === null && (chibiExpiresAt === 0 || chibiExpiresAt === '0'));

    if (isExplicitChibiRemoval) {
      updatePayload.custom_chibi = null;
      updatePayload.chibi_expires_at = null;
      registeredUser.custom_chibi = null;
      registeredUser.chibi_expires_at = null;
    } else if (customChibi !== undefined) {
      if (customChibi === null && hasActiveServerChibi && (chibiExpiresAt === undefined || chibiExpiresAt === null)) {
        updatePayload.custom_chibi = registeredUser.custom_chibi;
        updatePayload.chibi_expires_at = registeredUser.chibi_expires_at;
      } else {
        updatePayload.custom_chibi = customChibi;
        registeredUser.custom_chibi = customChibi;
        if (chibiExpiresAt !== undefined) {
          updatePayload.chibi_expires_at = chibiExpiresAt;
          registeredUser.chibi_expires_at = chibiExpiresAt;
        }
      }
    } else if (hasActiveServerChibi) {
      updatePayload.custom_chibi = registeredUser.custom_chibi;
      updatePayload.chibi_expires_at = registeredUser.chibi_expires_at;
    }

    // Tự động thu hồi nếu Chibi đã thực sự hết hạn
    const finalChibiExp = parseExpiryMs(registeredUser.chibi_expires_at, 24);
    if (registeredUser.chibi_expires_at && finalChibiExp <= Date.now()) {
      registeredUser.custom_chibi = null;
      registeredUser.chibi_expires_at = null;
      updatePayload.custom_chibi = null;
      updatePayload.chibi_expires_at = null;
    }
    if (pinSkin !== undefined) {
      updatePayload.pin_skin = pinSkin;
      registeredUser.pin_skin = pinSkin;
    }
    if (pinMascot !== undefined) {
      updatePayload.pin_mascot = pinMascot;
      registeredUser.pin_mascot = pinMascot;
    }
    if (pinAction !== undefined) {
      updatePayload.pin_action = pinAction;
      registeredUser.pin_action = pinAction;
    }
    if (resolvedAvatar) {
      registeredUser.avatar_url = resolvedAvatar;
    }
    if (phone || registeredUser.phone) updatePayload.phone = phone || registeredUser.phone || '';

    if (isCloudEnabled && supabase) {
      try {
        const { data, error } = await supabase.from('profiles').upsert(updatePayload).select();
        if (!error && data?.[0]) return data[0];
      } catch (err) {
        console.warn('[DB Service] Cloud update GPS error, fallback to memory:', err.message);
      }
    }

    const idx = inMemoryStore.profiles.findIndex(p => p.id === userId);
    if (idx !== -1) {
      inMemoryStore.profiles[idx] = { ...inMemoryStore.profiles[idx], ...updatePayload };
      dbStore.persist();
      return inMemoryStore.profiles[idx];
    } else {
      const newProfile = {
        ...updatePayload,
        battery: '95%',
        custom_status: customStatus || 'Đang hoạt động',
        custom_song: customSong || null,
        custom_chibi: customChibi || null,
        chibi_expires_at: chibiExpiresAt || null,
        pin_skin: pinSkin || 'auto',
        pin_mascot: pinMascot || null,
        pin_action: pinAction || null
      };
      inMemoryStore.profiles.push(newProfile);
      dbStore.persist();
      return newProfile;
    }
  },

  async setUserOffline(userId) {
    if (!userId) return null;
    const now10mAgo = new Date(Date.now() - 600000).toISOString();
    const profile = inMemoryStore.profiles.find(p => p.id === userId);
    if (profile) {
      profile.is_online = false;
      profile.last_seen_at = now10mAgo;
    }
    const user = inMemoryStore.users.find(u => u.id === userId);
    if (user) {
      user.is_online = false;
      user.last_seen_at = now10mAgo;
    }
    dbStore.persist();
    return profile || user || null;
  },

  generateUserCode(userId) {
    if (!userId) return 'VU-0000';
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = (hash << 5) - hash + userId.charCodeAt(i);
      hash |= 0;
    }
    const code = Math.abs(hash % 9000) + 1000;
    return `VU-${code}`;
  },

  // 1. Tìm kiếm người dùng theo Tên, SĐT, hoặc Mã user_code
  async searchUsers(query, currentUserId) {
    if (!query || typeof query !== 'string') return [];
    const q = query.trim().toLowerCase();
    
    // CHỈ tìm kiếm trong danh sách tài khoản đã đăng ký (inMemoryStore.users)
    const matches = inMemoryStore.users.filter(u => {
      if (u.id === currentUserId) return false; // Không tự tìm chính mình
      const nameMatch = (u.full_name || '').toLowerCase().includes(q);
      const codeMatch = (u.user_code || '').toLowerCase().includes(q);
      const phoneMatch = (u.phone || '').toLowerCase().includes(q);
      const emailMatch = (u.email || '').toLowerCase().includes(q);
      return nameMatch || codeMatch || phoneMatch || emailMatch;
    });

    return matches.map(targetUser => {
      const targetProfile = inMemoryStore.profiles.find(p => p.id === targetUser.id) || {};
      const target = { ...targetUser, ...targetProfile };
      const rel = this.getFriendshipStatus(currentUserId, target.id);
      return {
        id: target.id,
        name: target.full_name || target.name,
        full_name: target.full_name || target.name,
        user_code: target.user_code || this.generateUserCode(target.id),
        avatar: target.avatar_url || target.avatar,
        avatar_url: target.avatar_url || target.avatar,
        custom_status: target.custom_status,
        phone: target.phone || '',
        battery: target.battery || '90%',
        lat: target.lat,
        lng: target.lng,
        last_seen_at: target.last_seen_at,
        isOnline: Boolean(target.last_seen_at && (Date.now() - new Date(target.last_seen_at).getTime()) < 120000),
        relationshipStatus: rel.status,
        requestId: rel.requestId
      };
    });
  },

  // 2. Lấy trạng thái kết bạn giữa 2 user
  getFriendshipStatus(userIdA, userIdB) {
    if (!userIdA || !userIdB || userIdA === userIdB) return { status: 'self', requestId: null };
    
    const isFriend = inMemoryStore.friendships.some(fs => 
      fs.status === 'active' && (
        (fs.user_a_id === userIdA && fs.user_b_id === userIdB) ||
        (fs.user_a_id === userIdB && fs.user_b_id === userIdA)
      )
    );
    if (isFriend) return { status: 'friends', requestId: null };

    const sentReq = inMemoryStore.friendRequests.find(r => 
      r.sender_id === userIdA && r.receiver_id === userIdB && r.status === 'pending'
    );
    if (sentReq) return { status: 'pending_sent', requestId: sentReq.id };

    const receivedReq = inMemoryStore.friendRequests.find(r => 
      r.sender_id === userIdB && r.receiver_id === userIdA && r.status === 'pending'
    );
    if (receivedReq) return { status: 'pending_received', requestId: receivedReq.id };

    return { status: 'none', requestId: null };
  },

  // 3. Gửi lời mời kết bạn
  async sendFriendRequest(senderId, receiverId) {
    if (!senderId || !receiverId) throw new Error('senderId và receiverId là bắt buộc');
    if (senderId === receiverId) throw new Error('Không thể tự kết bạn với chính mình');

    const senderUser = inMemoryStore.users.find(u => u.id === senderId);
    const receiverUser = inMemoryStore.users.find(u => u.id === receiverId);
    if (!senderUser || !receiverUser) {
      throw new Error('Chỉ tài khoản đã đăng ký mới có thể gửi hoặc nhận lời mời kết bạn');
    }

    const rel = this.getFriendshipStatus(senderId, receiverId);
    if (rel.status === 'friends') throw new Error('Hai bạn đã là bạn bè');
    if (rel.status === 'pending_sent') throw new Error('Lời mời kết bạn đã được gửi trước đó');

    // Nếu đối phương đã gửi lời mời cho mình -> Tự động chấp nhận và thiết lập Bạn bè ngay lập tức!
    if (rel.status === 'pending_received') {
      const incoming = inMemoryStore.friendRequests.find(r => 
        r.sender_id === receiverId && r.receiver_id === senderId && r.status === 'pending'
      );
      if (incoming) {
        return this.acceptFriendRequest(incoming.id, senderId);
      }
    }

    const senderProfile = inMemoryStore.profiles.find(p => p.id === senderId);
    const receiverProfile = inMemoryStore.profiles.find(p => p.id === receiverId);

    const newReq = {
      id: `freq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender_id: senderId,
      sender_name: senderProfile?.full_name || senderUser.full_name || 'Người dùng VIVU',
      sender_avatar: senderProfile?.avatar_url || senderUser.avatar_url || '',
      receiver_id: receiverId,
      receiver_name: receiverProfile?.full_name || receiverUser.full_name || 'Người dùng VIVU',
      receiver_avatar: receiverProfile?.avatar_url || receiverUser.avatar_url || '',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    inMemoryStore.friendRequests.unshift(newReq);
    dbStore.persist();
    return newReq;
  },

  // 4. Chấp nhận lời mời kết bạn
  async acceptFriendRequest(requestId, currentUserId) {
    const req = inMemoryStore.friendRequests.find(r => r.id === requestId);
    if (!req) throw new Error('Không tìm thấy lời mời kết bạn');
    if (req.status !== 'pending') throw new Error('Lời mời kết bạn không còn ở trạng thái chờ');
    if (currentUserId && req.receiver_id !== currentUserId) {
      throw new Error('Chỉ người nhận mới có thể chấp nhận lời mời kết bạn');
    }

    req.status = 'accepted';
    req.updated_at = new Date().toISOString();

    const userA = req.sender_id;
    const userB = req.receiver_id;
    const fsId = `fs-${[userA, userB].sort().join('--')}`;

    if (!inMemoryStore.friendships.some(f => f.id === fsId)) {
      inMemoryStore.friendships.push({
        id: fsId,
        user_a_id: userA,
        user_b_id: userB,
        created_at: new Date().toISOString(),
        status: 'active'
      });
    }

    dbStore.persist();
    try {
      notificationService.handleFriendRequestResolved({ requestId: req.id, status: 'accepted' });
    } catch (e) {
      console.warn('[DB Service] handleFriendRequestResolved error:', e.message);
    }
    return { success: true, request: req, friendshipId: fsId };
  },

  // 5. Từ chối lời mời kết bạn
  async rejectFriendRequest(requestId, currentUserId) {
    const req = inMemoryStore.friendRequests.find(r => r.id === requestId);
    if (!req) throw new Error('Không tìm thấy lời mời kết bạn');
    if (req.status !== 'pending') throw new Error('Lời mời kết bạn không còn ở trạng thái chờ');
    if (currentUserId && req.receiver_id !== currentUserId) {
      throw new Error('Chỉ người nhận mới có thể từ chối lời mời kết bạn');
    }
    req.status = 'rejected';
    req.updated_at = new Date().toISOString();
    dbStore.persist();
    try {
      notificationService.handleFriendRequestResolved({ requestId: req.id, status: 'rejected' });
    } catch (e) {
      console.warn('[DB Service] handleFriendRequestResolved error:', e.message);
    }
    return { success: true, request: req };
  },

  // 6. Thu hồi lời mời kết bạn
  async cancelFriendRequest(requestId, currentUserId) {
    const req = inMemoryStore.friendRequests.find(r => r.id === requestId);
    if (!req) throw new Error('Không tìm thấy lời mời kết bạn');
    if (req.status !== 'pending') throw new Error('Lời mời kết bạn không còn ở trạng thái chờ');
    if (currentUserId && req.sender_id !== currentUserId) {
      throw new Error('Chỉ người gửi mới có thể thu hồi lời mời kết bạn');
    }
    req.status = 'cancelled';
    req.updated_at = new Date().toISOString();
    dbStore.persist();
    try {
      notificationService.handleFriendRequestResolved({ requestId: req.id, status: 'cancelled' });
    } catch (e) {
      console.warn('[DB Service] handleFriendRequestResolved error:', e.message);
    }
    return { success: true, request: req };
  },

  // 7. Lấy danh sách lời mời đã nhận & đã gửi
  async getFriendRequests(userId) {
    if (!userId) return { received: [], sent: [] };
    const received = inMemoryStore.friendRequests
      .filter(r => r.receiver_id === userId && r.status === 'pending')
      .map(r => {
        const sender = inMemoryStore.profiles.find(p => p.id === r.sender_id) || {};
        return {
          ...r,
          senderName: sender.full_name || sender.name || 'Người dùng VIVU',
          senderAvatar: sender.avatar_url || sender.avatar,
          senderUserCode: sender.user_code || this.generateUserCode(r.sender_id)
        };
      });

    const sent = inMemoryStore.friendRequests
      .filter(r => r.sender_id === userId && r.status === 'pending')
      .map(r => {
        const receiver = inMemoryStore.profiles.find(p => p.id === r.receiver_id) || {};
        return {
          ...r,
          receiverName: receiver.full_name || receiver.name || 'Người dùng VIVU',
          receiverAvatar: receiver.avatar_url || receiver.avatar,
          receiverUserCode: receiver.user_code || this.generateUserCode(r.receiver_id)
        };
      });

    return { received, sent };
  },

  // 8. Lấy danh sách bạn bè chính thức
  async getFriendsList(userId) {
    if (!userId) return [];
    const friendUserIds = inMemoryStore.friendships
      .filter(f => f.status === 'active' && (f.user_a_id === userId || f.user_b_id === userId))
      .map(f => (f.user_a_id === userId ? f.user_b_id : f.user_a_id));

    return friendUserIds.map(fId => {
      const u = inMemoryStore.users.find(user => user.id === fId) || {};
      const p = inMemoryStore.profiles.find(prof => prof.id === fId) || {};
      const combined = { ...u, ...p };
      const ageMs = combined.last_seen_at ? Date.now() - new Date(combined.last_seen_at).getTime() : Infinity;
      const isOnline = p.is_online !== false && ageMs < 15000;
      return {
        id: fId,
        name: combined.full_name || combined.name || 'Người dùng VIVU',
        full_name: combined.full_name || combined.name || 'Người dùng VIVU',
        avatar: combined.avatar_url || combined.avatar,
        avatar_url: combined.avatar_url || combined.avatar,
        user_code: combined.user_code || this.generateUserCode(fId),
        custom_status: combined.custom_status || 'Đang hoạt động',
        lat: combined.lat,
        lng: combined.lng,
        isOnline: isOnline,
        is_online: isOnline,
        battery: combined.battery || '95%'
      };
    });
  },

  // 9. Hủy kết bạn (Unfriend)
  async unfriend(userIdA, userIdB) {
    const fsId = `fs-${[userIdA, userIdB].sort().join('--')}`;
    inMemoryStore.friendships = inMemoryStore.friendships.filter(f => f.id !== fsId);
    // Dọn dẹp cả lời mời kết bạn tồn đọng giữa 2 người dùng nếu có
    inMemoryStore.friendRequests = inMemoryStore.friendRequests.filter(r => 
      !(
        (r.sender_id === userIdA && r.receiver_id === userIdB) ||
        (r.sender_id === userIdB && r.receiver_id === userIdA)
      )
    );
    dbStore.persist();
    return { success: true, unfriend: true };
  },

  // 10. Đánh dấu tin nhắn đã đọc (Mark as read)
  async markMessagesAsRead(conversationId, readerId) {
    if (!conversationId) return { updatedCount: 0 };
    let count = 0;
    const now = new Date().toISOString();
    inMemoryStore.messages.forEach(m => {
      if (m.conversation_id === conversationId && m.sender !== readerId && m.status !== 'read') {
        m.status = 'read';
        m.read_at = now;
        count++;
      }
    });
    if (count > 0) dbStore.persist();
    try {
      notificationService.markConversationNotificationsRead(conversationId, readerId);
    } catch (e) {
      console.warn('[DB Service] markConversationNotificationsRead error:', e.message);
    }
    return { updatedCount: count };
  },

  async getMessages(conversationId, requesterId) {
    if (requesterId) {
      if (conversationId.startsWith('circle-')) {
        const circle = inMemoryStore.circles.find(c => c.id === conversationId);
        if (circle && Array.isArray(circle.member_ids) && !circle.member_ids.includes(requesterId)) {
          const err = new Error('Bạn không phải thành viên của nhóm này');
          err.statusCode = 403;
          throw err;
        }
      } else if (conversationId.startsWith('conv-direct-')) {
        const parts = conversationId.replace('conv-direct-', '').split('--');
        if (!parts.includes(requesterId)) {
          const err = new Error('Bạn không có quyền xem cuộc trò chuyện này');
          err.statusCode = 403;
          throw err;
        }
      }
    }

    if (isCloudEnabled && supabase) {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });
        if (!error && data) return data;
      } catch (err) {
        console.warn('[DB Service] Cloud messages error, fallback to memory:', err.message);
      }
    }
    const msgs = inMemoryStore.messages.filter(m => m.conversation_id === conversationId);
    return msgs.map(m => ({
      ...m,
      isLocation: Boolean(m.is_location || m.isLocation),
      is_location: Boolean(m.is_location || m.isLocation),
      isHeart: Boolean(m.is_heart || m.isHeart || m.text === '❤️'),
      is_heart: Boolean(m.is_heart || m.isHeart || m.text === '❤️'),
      isLiveLocation: Boolean(m.is_live_location || m.isLiveLocation),
      is_live_location: Boolean(m.is_live_location || m.isLiveLocation),
      live_duration_minutes: m.live_duration_minutes || null,
      live_expires_at: m.live_expires_at || null,
      live_status: m.live_status || (m.is_live_location ? 'active' : null),
      speed: (m.speed != null && !isNaN(Number(m.speed))) ? Number(m.speed) : null,
      isPoll: Boolean(m.is_poll || m.isPoll || m.poll),
      is_poll: Boolean(m.is_poll || m.isPoll || m.poll),
      poll: m.poll || null
    }));
  },

  async getInboxMessages(userId) {
    if (!userId) return [];
    return inMemoryStore.messages.filter(m => {
      const isRecipient = m.conversation_id && m.conversation_id.includes(userId);
      const isNotMe = m.sender !== userId;
      const isUnread = m.status !== 'read';
      return isRecipient && isNotMe && isUnread;
    });
  },

  async getUserConversations(userId) {
    if (!userId) return [];

    // 1. Lấy toàn bộ nhóm mà user này là thành viên hợp lệ
    const userCircles = (inMemoryStore.circles || []).filter(c => 
      Array.isArray(c.member_ids) && c.member_ids.includes(userId)
    );
    const userCircleIds = new Set(userCircles.map(c => c.id));

    // 2. Lấy toàn bộ tin nhắn mà user này là người gửi hoặc người nhận (kể cả tin nhắn trong các nhóm mà user tham gia)
    const userMessages = inMemoryStore.messages.filter(m => {
      if (m.sender === userId) return true;
      if (m.conversation_id && m.conversation_id.includes(userId)) return true;
      if (m.conversation_id && userCircleIds.has(m.conversation_id)) return true;
      return false;
    });

    const convMap = new Map();
    for (const msg of userMessages) {
      const convId = msg.conversation_id;
      if (!convId) continue;
      if (!convMap.has(convId)) {
        convMap.set(convId, []);
      }
      convMap.get(convId).push(msg);
    }

    const conversations = [];

    // Xử lý các cuộc trò chuyện trực tiếp 1-1
    for (const [convId, msgs] of convMap.entries()) {
      if (convId.startsWith('conv-direct-')) {
        const parts = convId.replace('conv-direct-', '').split('--');
        const partnerId = parts.find(p => p !== userId) || parts[0];
        const partnerUser = inMemoryStore.users.find(u => u.id === partnerId) || {};
        const partnerProfile = inMemoryStore.profiles.find(p => p.id === partnerId) || {};
        const combinedPartner = { ...partnerUser, ...partnerProfile };

        const sortedMsgs = [...msgs].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        const lastMsg = sortedMsgs[sortedMsgs.length - 1];
        const unreadCount = sortedMsgs.filter(m => m.sender !== userId && m.status !== 'read').length;

        // Kiểm tra trạng thái quan hệ bạn bè từ nguồn sự thật bền vững (Database)
        const rel = this.getFriendshipStatus(userId, partnerId);
        const isFriend = rel.status === 'friends';

        // Kiểm tra xem user hiện tại đã phản hồi tin nhắn hay chưa
        const hasReplied = sortedMsgs.some(m => m.sender === userId);

        // Quy chuẩn phân loại hộp thư:
        // - Đã là Bạn bè: isStranger = false -> hiển thị trong mục "Tất cả"
        // - Chưa là Bạn bè: nếu đã trả lời thì isStranger = false; nếu chưa trả lời thì isStranger = true ("Người lạ")
        const isStranger = !isFriend && !hasReplied;

        const ageMs = combinedPartner.last_seen_at ? Date.now() - new Date(combinedPartner.last_seen_at).getTime() : Infinity;
        const isOnline = partnerProfile.is_online !== false && ageMs < 15000;

        conversations.push({
          id: convId,
          type: 'direct',
          friendId: partnerId,
          partnerId: partnerId,
          userId: partnerId,
          targetUserId: partnerId,
          name: combinedPartner.full_name || combinedPartner.name || 'Người dùng VIVU',
          avatar: combinedPartner.avatar_url || combinedPartner.avatar || null,
          user_code: combinedPartner.user_code || this.generateUserCode(partnerId),
          online: isOnline,
          isOnline: isOnline,
          is_online: isOnline,
          isStranger,
          isFriend,
          hasReplied,
          lastMessage: lastMsg.text || (lastMsg.is_location ? 'Đã chia sẻ vị trí GPS' : lastMsg.image ? 'Đã gửi hình ảnh' : lastMsg.video ? 'Đã gửi video' : 'Đã gửi tin nhắn'),
          time: lastMsg.created_at,
          unread: unreadCount > 0,
          unreadCount,
          messages: sortedMsgs.map(m => ({
            id: m.id,
            sender: m.sender === userId ? 'me' : 'them',
            senderName: m.sender_name || (m.sender === userId ? 'Tôi' : combinedPartner.full_name || 'Bạn'),
            senderAvatar: m.sender === userId ? '' : combinedPartner.avatar_url,
            text: m.text,
            image: m.image,
            video: m.video,
            isLocation: Boolean(m.is_location || m.isLocation),
            is_location: Boolean(m.is_location || m.isLocation),
            is_live_location: Boolean(m.is_live_location),
            live_status: m.live_status || null,
            live_duration_minutes: m.live_duration_minutes || null,
            live_expires_at: m.live_expires_at || null,
            speed: m.speed != null ? Number(m.speed) : null,
            is_poll: Boolean(m.is_poll || m.poll),
            poll: m.poll || null,
            isHeart: Boolean(m.is_heart || m.isHeart || m.text === '❤️'),
            is_heart: Boolean(m.is_heart || m.isHeart || m.text === '❤️'),
            lat: m.lat != null ? Number(m.lat) : null,
            lng: m.lng != null ? Number(m.lng) : null,
            time: m.created_at,
            status: m.status
          }))
        });
      } else if (convId.startsWith('circle-')) {
        const circle = userCircles.find(c => c.id === convId);
        if (circle) {
          const sortedMsgs = [...msgs].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          const lastMsg = sortedMsgs[sortedMsgs.length - 1];
          const unreadCount = sortedMsgs.filter(m => m.sender !== userId && m.status !== 'read').length;

          conversations.push({
            id: convId,
            type: 'group',
            circleId: circle.id,
            name: circle.name,
            avatar: circle.image || null,
            memberCount: (circle.member_ids || []).length,
            memberIds: circle.member_ids || [],
            online: true,
            isStranger: false,
            isFriend: false,
            hasReplied: true,
            lastMessage: lastMsg.text || 'Hoạt động mới',
            time: lastMsg.created_at,
            unread: unreadCount > 0,
            unreadCount,
            messages: sortedMsgs.map(m => ({
              id: m.id,
              sender: m.sender === userId ? 'me' : 'them',
              senderName: m.sender_name || 'Thành viên',
              text: m.text,
              image: m.image,
              video: m.video,
              isLocation: Boolean(m.is_location || m.isLocation),
              is_location: Boolean(m.is_location || m.isLocation),
              is_live_location: Boolean(m.is_live_location),
              live_status: m.live_status || null,
              live_duration_minutes: m.live_duration_minutes || null,
              live_expires_at: m.live_expires_at || null,
              speed: m.speed != null ? Number(m.speed) : null,
              is_poll: Boolean(m.is_poll || m.poll),
              poll: m.poll || null,
              isHeart: Boolean(m.is_heart || m.isHeart || m.text === '❤️'),
              is_heart: Boolean(m.is_heart || m.isHeart || m.text === '❤️'),
              lat: m.lat != null ? Number(m.lat) : null,
              lng: m.lng != null ? Number(m.lng) : null,
              time: m.created_at,
              status: m.status
            }))
          });
        }
      }
    }

    // Bổ sung các nhóm mà user là thành viên nhưng chưa có tin nhắn nào
    for (const circle of userCircles) {
      if (!conversations.some(c => c.id === circle.id)) {
        conversations.push({
          id: circle.id,
          type: 'group',
          circleId: circle.id,
          name: circle.name,
          avatar: circle.image || null,
          memberCount: (circle.member_ids || []).length,
          memberIds: circle.member_ids || [],
          online: true,
          isStranger: false,
          isFriend: false,
          hasReplied: true,
          lastMessage: 'Nhóm mới tạo',
          time: circle.created_at || new Date().toISOString(),
          unread: false,
          unreadCount: 0,
          messages: []
        });
      }
    }

    conversations.sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));
    return conversations;
  },

  async sendMessage(message) {
    if (!message.sender) {
      message.sender = 'guest';
    }

    const trimmedText = typeof message.text === 'string' ? message.text.trim() : '';
    if (!trimmedText && !message.image && !message.video && !message.is_location && !message.is_heart && !message.is_live_location && !message.is_poll && !message.poll && !message.is_sticker && message.type !== 'sticker' && !message.sticker) {
      throw new Error('Nội dung tin nhắn không được để trống');
    }
    if (trimmedText.length > 2000) {
      throw new Error('Nội dung tin nhắn vượt quá giới hạn 2000 ký tự');
    }

    // Kiểm tra phân quyền hội thoại:
    if (message.conversation_id.startsWith('circle-')) {
      const circle = inMemoryStore.circles.find(c => c.id === message.conversation_id);
      if (circle && Array.isArray(circle.member_ids)) {
        if (!circle.member_ids.includes(message.sender) && !message.sender.startsWith('client-')) {
          const err = new Error('Bạn không phải thành viên của nhóm này');
          err.statusCode = 403;
          throw err;
        }
      }
    } else if (message.conversation_id.startsWith('conv-direct-')) {
      const parts = message.conversation_id.replace('conv-direct-', '').split('--');
      if (!parts.includes(message.sender)) {
        const err = new Error('Bạn không có quyền gửi tin nhắn vào cuộc trò chuyện này');
        err.statusCode = 403;
        throw err;
      }
      const recipientId = parts.find(p => p !== message.sender);
      if (recipientId) {
        const recipientUser = inMemoryStore.users.find(u => u.id === recipientId);
        // Kiểm tra cài đặt nhận tin nhắn của đối phương: 'friends_only'
        if (recipientUser && recipientUser.message_privacy === 'friends_only') {
          const rel = this.getFriendshipStatus(message.sender, recipientId);
          if (rel.status !== 'friends') {
            const err = new Error('Người dùng này chỉ nhận tin nhắn từ bạn bè');
            err.statusCode = 403;
            throw err;
          }
        }
      }
    }

    // Chống trùng lặp tin nhắn (Deduplication qua client_msg_id)
    if (message.client_msg_id) {
      const existing = inMemoryStore.messages.find(m => m.client_msg_id === message.client_msg_id);
      if (existing) return existing;
    }

    const isStk = Boolean(message.is_sticker || message.type === 'sticker' || message.sticker);
    const newMsg = {
      id: message.id || `msg-${Date.now()}`,
      client_msg_id: message.client_msg_id || `cmsg-${Date.now()}`,
      conversation_id: message.conversation_id,
      sender: message.sender || 'me',
      sender_name: message.sender_name || 'Tôi',
      type: isStk ? 'sticker' : message.type || null,
      is_sticker: isStk,
      sticker: message.sticker || null,
      sound_type: message.sound_type || message.soundType || message.sticker?.soundType || null,
      text: trimmedText,
      image: message.image || null,
      video: message.video || null,
      is_location: Boolean(message.is_location),
      is_live_location: Boolean(message.is_live_location),
      live_duration_minutes: message.live_duration_minutes || null,
      live_expires_at: message.live_expires_at || null,
      live_status: message.live_status || (message.is_live_location ? 'active' : null),
      speed: (message.speed != null && !isNaN(Number(message.speed))) ? Number(message.speed) : null,
      is_poll: Boolean(message.is_poll || message.poll),
      poll: message.poll ? {
        id: message.poll.id || `poll-${Date.now()}`,
        title: message.poll.title || message.poll.question || 'Bình chọn',
        options: Array.isArray(message.poll.options) ? message.poll.options.map((opt, i) => ({
          id: opt.id || `opt-${i}`,
          text: typeof opt === 'string' ? opt : (opt.text || `Lựa chọn ${i + 1}`),
          votes: Array.isArray(opt.votes) ? opt.votes : []
        })) : []
      } : null,
      is_heart: Boolean(message.is_heart || trimmedText === '❤️'),
      lat: (message.lat != null && !isNaN(Number(message.lat))) ? Number(message.lat) : null,
      lng: (message.lng != null && !isNaN(Number(message.lng))) ? Number(message.lng) : null,
      status: 'sent',
      read_at: null,
      created_at: new Date().toISOString()
    };

    if (isCloudEnabled && supabase) {
      try {
        const { data, error } = await supabase.from('messages').insert([newMsg]).select();
        if (!error && data?.[0]) return data[0];
      } catch (err) {
        console.warn('[DB Service] Cloud send message error, fallback to memory:', err.message);
      }
    }

    inMemoryStore.messages.push(newMsg);
    dbStore.persist();
    return newMsg;
  },

  async saveMessage(msg) {
    if (!msg.conversation_id) throw new Error('conversation_id là bắt buộc');
    const newMsg = {
      id: msg.id || `msg-${Date.now()}`,
      conversation_id: msg.conversation_id,
      sender: msg.sender || 'system',
      sender_name: msg.sender_name || 'Hệ thống',
      text: msg.text || '',
      is_system: Boolean(msg.is_system),
      created_at: msg.created_at || new Date().toISOString()
    };
    inMemoryStore.messages.push(newMsg);
    dbStore.persist();
    return newMsg;
  },

  async voteMessagePoll(messageId, optionId, userId) {
    if (!messageId || !optionId || !userId) {
      throw new Error('messageId, optionId và userId là bắt buộc');
    }
    const msg = inMemoryStore.messages.find(m => m.id === messageId || m.client_msg_id === messageId);
    if (!msg) throw new Error('Không tìm thấy tin nhắn bình chọn');
    if (!msg.poll || !Array.isArray(msg.poll.options)) {
      throw new Error('Tin nhắn này không có bình chọn hợp lệ');
    }

    let optionFound = false;
    msg.poll.options.forEach(opt => {
      if (!Array.isArray(opt.votes)) opt.votes = [];
      const hadVoted = opt.votes.includes(userId);
      opt.votes = opt.votes.filter(u => u !== userId);
      if (opt.id === optionId) {
        optionFound = true;
        if (!hadVoted) {
          opt.votes.push(userId);
        }
      }
    });

    if (!optionFound) {
      throw new Error('Không tìm thấy lựa chọn bình chọn');
    }

    dbStore.persist();
    return msg;
  },

  async stopLiveLocation(messageId, userId) {
    if (!messageId) throw new Error('messageId là bắt buộc');
    const msg = inMemoryStore.messages.find(m => m.id === messageId || m.client_msg_id === messageId);
    if (!msg) throw new Error('Không tìm thấy tin nhắn chia sẻ vị trí');
    if (userId && msg.sender !== userId) {
      throw new Error('Bạn không có quyền dừng chia sẻ vị trí của người khác');
    }
    msg.live_status = 'stopped';
    msg.stopped_at = new Date().toISOString();
    dbStore.persist();
    return msg;
  },

  // ==================== QUẢN LÝ NHÓM (CUSTOM CIRCLES) ĐỒNG BỘ TOÀN DIỆN ====================
  async getCircles(userId = null) {
    let allCircles = [];
    if (isCloudEnabled && supabase) {
      try {
        const { data, error } = await supabase.from('custom_circles').select('*');
        if (!error && Array.isArray(data)) allCircles = data;
      } catch (err) {
        console.warn('[DB Service] Cloud circles error, fallback to memory:', err.message);
      }
    }
    if (allCircles.length === 0) {
      allCircles = inMemoryStore.circles || [];
    }

    if (!userId) {
      return allCircles;
    }

    // Lọc theo người dùng:
    // 1. Nhóm mà user là thành viên đã chấp nhận (status === 'accepted' hoặc có trong member_ids)
    // 2. Nhóm mà user đang có lời mời chờ duyệt (status === 'pending')
    // 3. Nhóm Công khai (privacy === 'public')
    return allCircles.filter(c => {
      const isOwner = c.owner_id === userId;
      const isMember = Array.isArray(c.member_ids) && c.member_ids.includes(userId);
      const hasInvite = Array.isArray(c.members) && c.members.some(m => m.user_id === userId && m.status === 'pending');
      const isPublic = c.privacy === 'public';
      return isOwner || isMember || hasInvite || isPublic;
    }).map(c => {
      // Đính kèm thông tin trạng thái của user trong nhóm
      const myMembership = Array.isArray(c.members) ? c.members.find(m => m.user_id === userId) : null;
      const userRole = c.owner_id === userId ? 'owner' : (myMembership?.role || 'member');
      const userStatus = c.owner_id === userId ? 'accepted' : (myMembership?.status || (Array.isArray(c.member_ids) && c.member_ids.includes(userId) ? 'accepted' : 'none'));
      return {
        ...c,
        userRole,
        userStatus,
        isOwner: c.owner_id === userId
      };
    });
  },

  async getCircleById(circleId) {
    if (!circleId) return null;
    if (isCloudEnabled && supabase) {
      try {
        const { data, error } = await supabase.from('custom_circles').select('*').eq('id', circleId).single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('[DB Service] Cloud getCircleById fallback to memory:', err.message);
      }
    }
    return (inMemoryStore.circles || []).find(c => c.id === circleId) || null;
  },

  async createCircle({ id, name, description = '', image = null, privacy = 'private', ownerId, invitedMemberIds = [], member_ids, memberIds }) {
    if (!name) throw new Error('Tên nhóm là bắt buộc');
    const legacyMembers = Array.isArray(member_ids) ? member_ids : (Array.isArray(memberIds) ? memberIds : []);
    const safeOwnerId = ownerId || (legacyMembers.length > 0 ? legacyMembers[0] : 'system-user');
    const circleId = id || `circle-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const members = [
      {
        user_id: safeOwnerId,
        role: 'owner',
        status: 'accepted',
        joined_at: now
      }
    ];

    const acceptedIds = [safeOwnerId];

    // Nếu truyền danh sách member_ids trực tiếp (test suites hoặc thêm trực tiếp)
    if (legacyMembers.length > 0) {
      legacyMembers.forEach(fid => {
        if (fid && !acceptedIds.includes(fid)) {
          acceptedIds.push(fid);
          members.push({
            user_id: fid,
            role: 'member',
            status: 'accepted',
            joined_at: now
          });
        }
      });
    }

    // Các thành viên được mời ở trạng thái pending (chờ duyệt) nếu truyền invitedMemberIds riêng
    if (Array.isArray(invitedMemberIds)) {
      invitedMemberIds.forEach(fid => {
        if (fid && fid !== safeOwnerId && !members.some(m => m.user_id === fid)) {
          members.push({
            user_id: fid,
            role: 'member',
            status: 'pending',
            invited_by: safeOwnerId,
            invited_at: now
          });
        }
      });
    }

    const newCircle = {
      id: circleId,
      name: name.trim(),
      description: description ? description.trim() : '',
      image: image || null,
      privacy: privacy === 'public' ? 'public' : 'private',
      owner_id: safeOwnerId,
      members,
      member_ids: acceptedIds,
      created_at: now,
      updated_at: now
    };

    if (isCloudEnabled && supabase) {
      try {
        const { data, error } = await supabase.from('custom_circles').upsert([newCircle]).select();
        if (!error && data?.[0]) {
          inMemoryStore.circles = [newCircle, ...(inMemoryStore.circles || []).filter(c => c.id !== circleId)];
          dbStore.persist();
          return data[0];
        }
      } catch (err) {
        console.warn('[DB Service] Cloud create circle error, fallback to memory:', err.message);
      }
    }

    if (!Array.isArray(inMemoryStore.circles)) inMemoryStore.circles = [];
    inMemoryStore.circles = [newCircle, ...inMemoryStore.circles.filter(c => c.id !== circleId)];
    dbStore.persist();
    return newCircle;
  },

  async updateCircle(circleId, { name, description, image, privacy, requesterId }) {
    const circle = (inMemoryStore.circles || []).find(c => c.id === circleId);
    if (!circle) throw new Error('Không tìm thấy nhóm');

    // Kiểm tra quyền: Chỉ owner hoặc admin mới được chỉnh sửa thông tin nhóm
    const isOwner = circle.owner_id === requesterId;
    const memberObj = Array.isArray(circle.members) ? circle.members.find(m => m.user_id === requesterId) : null;
    const isAdmin = memberObj && (memberObj.role === 'admin' || memberObj.role === 'owner');
    if (requesterId && !isOwner && !isAdmin) {
      const err = new Error('Bạn không có quyền chỉnh sửa thông tin nhóm');
      err.statusCode = 403;
      throw err;
    }

    if (name) circle.name = name.trim();
    if (description !== undefined) circle.description = description ? description.trim() : '';
    if (image !== undefined) circle.image = image;
    if (privacy) circle.privacy = privacy === 'public' ? 'public' : 'private';
    circle.updated_at = new Date().toISOString();

    if (isCloudEnabled && supabase) {
      try {
        await supabase.from('custom_circles').update({
          name: circle.name,
          description: circle.description,
          image: circle.image,
          privacy: circle.privacy,
          updated_at: circle.updated_at
        }).eq('id', circleId);
      } catch (err) {
        console.warn('[DB Service] Cloud update circle error:', err.message);
      }
    }

    dbStore.persist();
    return circle;
  },

  async inviteToCircle(circleId, { memberIds, requesterId }) {
    const circle = (inMemoryStore.circles || []).find(c => c.id === circleId);
    if (!circle) throw new Error('Không tìm thấy nhóm');

    if (!Array.isArray(circle.members)) circle.members = [];
    const now = new Date().toISOString();
    const newInvited = [];

    (memberIds || []).forEach(fid => {
      if (!fid) return;
      const existing = circle.members.find(m => m.user_id === fid);
      if (!existing) {
        const item = {
          user_id: fid,
          role: 'member',
          status: 'pending',
          invited_by: requesterId,
          invited_at: now
        };
        circle.members.push(item);
        newInvited.push(fid);
      } else if (existing.status === 'declined' || existing.status === 'left') {
        existing.status = 'pending';
        existing.invited_by = requesterId;
        existing.invited_at = now;
        newInvited.push(fid);
      }
    });

    circle.updated_at = now;
    dbStore.persist();
    return { circle, newInvited };
  },

  async addMembersToCircle(circleId, { memberIds, requesterId }) {
    const circle = (inMemoryStore.circles || []).find(c => c.id === circleId);
    if (!circle) throw new Error('Không tìm thấy nhóm');

    const isMember = circle.owner_id === requesterId || (Array.isArray(circle.member_ids) && circle.member_ids.includes(requesterId));
    if (requesterId && !isMember) {
      const err = new Error('Bạn không phải thành viên của nhóm này');
      err.statusCode = 403;
      throw err;
    }

    if (!Array.isArray(circle.members)) circle.members = [];
    if (!Array.isArray(circle.member_ids)) circle.member_ids = [];
    const now = new Date().toISOString();
    const newlyAdded = [];

    (memberIds || []).forEach(fid => {
      if (!fid) return;
      if (!circle.member_ids.includes(fid)) {
        circle.member_ids.push(fid);
        newlyAdded.push(fid);
      }
      const existing = circle.members.find(m => m.user_id === fid);
      if (!existing) {
        circle.members.push({
          user_id: fid,
          role: 'member',
          status: 'accepted',
          joined_at: now,
          invited_by: requesterId
        });
      } else {
        existing.status = 'accepted';
        existing.role = existing.role || 'member';
        existing.joined_at = now;
      }
    });

    circle.updated_at = now;

    if (isCloudEnabled && supabase) {
      try {
        await supabase.from('custom_circles').update({
          members: circle.members,
          member_ids: circle.member_ids,
          updated_at: circle.updated_at
        }).eq('id', circleId);
      } catch (err) {
        console.warn('[DB Service] Cloud addMembersToCircle error:', err.message);
      }
    }

    dbStore.persist();
    return { circle, newlyAdded };
  },

  async respondToCircleInvite(circleId, { userId, action }) {
    const circle = (inMemoryStore.circles || []).find(c => c.id === circleId);
    if (!circle) throw new Error('Không tìm thấy nhóm');

    if (!Array.isArray(circle.members)) circle.members = [];
    if (!Array.isArray(circle.member_ids)) circle.member_ids = [];

    let member = circle.members.find(m => m.user_id === userId);
    const now = new Date().toISOString();

    if (action === 'accept') {
      if (!member) {
        member = {
          user_id: userId,
          role: 'member',
          status: 'accepted',
          joined_at: now
        };
        circle.members.push(member);
      } else {
        member.status = 'accepted';
        member.joined_at = now;
      }

      if (!circle.member_ids.includes(userId)) {
        circle.member_ids.push(userId);
      }
    } else {
      // Decline
      if (member) {
        member.status = 'declined';
      }
      circle.member_ids = circle.member_ids.filter(id => id !== userId);
    }

    circle.updated_at = now;
    dbStore.persist();
    return { circle, status: action === 'accept' ? 'accepted' : 'declined' };
  },

  async leaveCircle(circleId, { userId, newOwnerId }) {
    const circle = (inMemoryStore.circles || []).find(c => c.id === circleId);
    if (!circle) throw new Error('Không tìm thấy nhóm');

    const isOwner = circle.owner_id === userId;
    const remainingAccepted = (circle.member_ids || []).filter(id => id !== userId);

    if (isOwner) {
      if (remainingAccepted.length > 0) {
        if (!newOwnerId || !remainingAccepted.includes(newOwnerId)) {
          // Bắt buộc chuyển quyền cho một thành viên hợp lệ
          const defaultSuccessor = newOwnerId || remainingAccepted[0];
          circle.owner_id = defaultSuccessor;
          const successorMember = circle.members?.find(m => m.user_id === defaultSuccessor);
          if (successorMember) successorMember.role = 'owner';
        } else {
          circle.owner_id = newOwnerId;
          const successorMember = circle.members?.find(m => m.user_id === newOwnerId);
          if (successorMember) successorMember.role = 'owner';
        }
      } else {
        // Nhóm không còn ai khác -> Tự động giải tán nhóm
        return this.deleteCircle(circleId, userId);
      }
    }

    circle.member_ids = (circle.member_ids || []).filter(id => id !== userId);
    if (Array.isArray(circle.members)) {
      const m = circle.members.find(item => item.user_id === userId);
      if (m) m.status = 'left';
    }

    circle.updated_at = new Date().toISOString();
    dbStore.persist();
    return { id: circleId, left: true, newOwnerId: circle.owner_id };
  },

  async kickFromCircle(circleId, { targetUserId, requesterId }) {
    const circle = (inMemoryStore.circles || []).find(c => c.id === circleId);
    if (!circle) throw new Error('Không tìm thấy nhóm');

    if (circle.owner_id !== requesterId) {
      const err = new Error('Chỉ Trưởng nhóm mới có quyền xóa thành viên khỏi nhóm');
      err.statusCode = 403;
      throw err;
    }

    circle.member_ids = (circle.member_ids || []).filter(id => id !== targetUserId);
    if (Array.isArray(circle.members)) {
      const m = circle.members.find(item => item.user_id === targetUserId);
      if (m) m.status = 'removed';
    }

    circle.updated_at = new Date().toISOString();
    dbStore.persist();
    return { id: circleId, kicked: targetUserId };
  },

  async deleteCircle(circleId, requesterId = null) {
    const circle = (inMemoryStore.circles || []).find(c => c.id === circleId);
    if (!circle) {
      inMemoryStore.messages = (inMemoryStore.messages || []).filter(m => m.conversation_id !== circleId);
      dbStore.persist();
      return { id: circleId, deleted: true };
    }

    if (requesterId && circle.owner_id && circle.owner_id !== requesterId) {
      const err = new Error('Chỉ Trưởng nhóm mới có quyền giải tán nhóm này');
      err.statusCode = 403;
      throw err;
    }

    inMemoryStore.circles = (inMemoryStore.circles || []).filter(c => c.id !== circleId);
    inMemoryStore.messages = (inMemoryStore.messages || []).filter(m => m.conversation_id !== circleId);
    if (isCloudEnabled && supabase) {
      try {
        await supabase.from('custom_circles').delete().eq('id', circleId);
      } catch (err) {
        console.warn('[DB Service] Cloud delete circle error:', err.message);
      }
    }
    dbStore.persist();
    return { id: circleId, deleted: true };
  },

  // ==========================================
  // QUẢN LÝ TIN NỔI BẬT TRÊN HỒ SƠ (STORY HIGHLIGHTS)
  // ==========================================
  async getUserHighlights(userId) {
    if (!userId) return [];
    if (!Array.isArray(dbStore.data.highlights)) {
      dbStore.data.highlights = [];
    }
    return dbStore.data.highlights
      .filter(h => h.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async createHighlight(userId, highlightData = {}) {
    if (!userId) throw new Error('userId là bắt buộc');
    if (!highlightData.title || !highlightData.title.trim()) {
      throw new Error('Tiêu đề tin nổi bật không được để trống');
    }
    if (!Array.isArray(dbStore.data.highlights)) {
      dbStore.data.highlights = [];
    }

    const stories = Array.isArray(highlightData.stories) ? highlightData.stories : [];
    const coverImage = highlightData.cover_image || highlightData.coverImage || (stories[0]?.image || '');

    const newHighlight = {
      id: highlightData.id || `hl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      title: highlightData.title.trim(),
      cover_image: coverImage,
      stories: stories.map((s, idx) => ({
        id: s.id || `hl-item-${Date.now()}-${idx}`,
        title: s.title || highlightData.title.trim(),
        image: s.image || s.url || '',
        video: s.video || null,
        created_at: s.created_at || new Date().toISOString()
      })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    dbStore.data.highlights.unshift(newHighlight);
    dbStore.persist();
    return newHighlight;
  },

  async updateHighlight(userId, highlightId, updateData = {}) {
    if (!userId || !highlightId) throw new Error('userId và highlightId là bắt buộc');
    if (!Array.isArray(dbStore.data.highlights)) {
      dbStore.data.highlights = [];
    }
    const idx = dbStore.data.highlights.findIndex(h => h.id === highlightId);
    if (idx < 0) throw new Error('Không tìm thấy nhóm tin nổi bật');
    const existing = dbStore.data.highlights[idx];
    if (existing.user_id !== userId) {
      const err = new Error('Bạn không có quyền chỉnh sửa tin nổi bật này');
      err.statusCode = 403;
      throw err;
    }

    if (updateData.title && updateData.title.trim()) {
      existing.title = updateData.title.trim();
    }
    if (updateData.cover_image || updateData.coverImage) {
      existing.cover_image = updateData.cover_image || updateData.coverImage;
    }
    if (Array.isArray(updateData.stories)) {
      existing.stories = updateData.stories;
    }
    existing.updated_at = new Date().toISOString();

    dbStore.persist();
    return existing;
  },

  async deleteHighlight(userId, highlightId) {
    if (!userId || !highlightId) throw new Error('userId và highlightId là bắt buộc');
    if (!Array.isArray(dbStore.data.highlights)) {
      dbStore.data.highlights = [];
    }
    const item = dbStore.data.highlights.find(h => h.id === highlightId);
    if (!item) return { id: highlightId, deleted: true };
    if (item.user_id !== userId) {
      const err = new Error('Bạn không có quyền xóa tin nổi bật này');
      err.statusCode = 403;
      throw err;
    }

    dbStore.data.highlights = dbStore.data.highlights.filter(h => h.id !== highlightId);
    dbStore.persist();
    return { id: highlightId, deleted: true };
  },

  async pinStoryToHighlight(userId, highlightId, storyData) {
    if (!userId || !storyData) throw new Error('userId và storyData là bắt buộc');
    if (!Array.isArray(dbStore.data.highlights)) {
      dbStore.data.highlights = [];
    }

    const storyItem = {
      id: storyData.id || `hl-story-${Date.now()}`,
      title: storyData.title || 'Khoảnh khắc',
      image: storyData.image || storyData.url || '',
      video: storyData.video || null,
      created_at: storyData.created_at || new Date().toISOString()
    };

    // Nếu chọn tạo nhóm mới ngay tại chỗ
    if (!highlightId || highlightId === 'new') {
      const newGroup = {
        id: `hl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        user_id: userId,
        title: storyData.groupTitle || storyData.title || 'Tin nổi bật',
        cover_image: storyItem.image || storyItem.video || '',
        stories: [storyItem],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      dbStore.data.highlights.unshift(newGroup);
      dbStore.persist();
      return newGroup;
    }

    // Nếu ghim vào nhóm đã có
    const target = dbStore.data.highlights.find(h => h.id === highlightId);
    if (!target) throw new Error('Không tìm thấy nhóm tin nổi bật chỉ định');
    if (target.user_id !== userId) {
      const err = new Error('Bạn không có quyền ghim vào nhóm tin nổi bật này');
      err.statusCode = 403;
      throw err;
    }

    if (!Array.isArray(target.stories)) target.stories = [];
    // Kiểm tra chống trùng lặp story trong nhóm
    const exists = target.stories.some(s => s.id === storyItem.id || (s.image && s.image === storyItem.image));
    if (!exists) {
      target.stories.push(storyItem);
      if (!target.cover_image) {
        target.cover_image = storyItem.image;
      }
      target.updated_at = new Date().toISOString();
      dbStore.persist();
    }
    return target;
  }
};

