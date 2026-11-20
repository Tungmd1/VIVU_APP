import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '..', '..', 'data');
const isTestEnv = process.env.NODE_ENV === 'test' || process.argv.some(arg => arg.includes('test'));
const DB_FILE = process.env.VIVU_DB_FILE || (isTestEnv ? path.join(DATA_DIR, 'vivu_test_database.json') : path.join(DATA_DIR, 'vivu_database.json'));
const DB_BAK_FILE = process.env.VIVU_DB_BAK_FILE || (isTestEnv ? path.join(DATA_DIR, 'vivu_test_database.json.bak') : path.join(DATA_DIR, 'vivu_database.json.bak'));

const INITIAL_DB = {
  users: [],
  profiles: [],
  stories: [],
  messages: [],
  circles: [],
  friendRequests: [],
  friendships: [],
  notifications: [],
  highlights: [],
  archivedConversations: [],
  savedPlaces: []
};

class DatabaseStore {
  constructor() {
    this.data = { ...INITIAL_DB };
    this.isLoaded = false;
    this._isWriting = false;
    this._pendingWrite = false;
    this._pendingResolvers = [];
    this.init();
  }

  loadRawJson(filePath) {
    if (!fs.existsSync(filePath)) return null;
    let retries = 5;
    let delay = 25;
    while (retries > 0) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        if (!raw || !raw.trim() || raw.includes('\u0000')) {
          return null;
        }
        return JSON.parse(raw);
      } catch (err) {
        retries--;
        if (err.code === 'EBUSY' || err.code === 'EPERM' || err.code === 'EACCES') {
          if (retries === 0) {
            console.warn(`[DB Engine] Không thể đọc ${filePath} do tài nguyên đang bận (${err.code}):`, err.message);
            return null;
          }
          const end = Date.now() + delay;
          while (Date.now() < end) {}
          delay = Math.min(delay * 2, 150);
        } else if (err instanceof SyntaxError) {
          if (retries === 0) {
            console.warn(`[DB Engine] Lỗi cú pháp JSON trong ${filePath}:`, err.message);
            return null;
          }
          const end = Date.now() + delay;
          while (Date.now() < end) {}
          delay = Math.min(delay * 2, 150);
        } else {
          console.warn(`[DB Engine] Lỗi khi nạp ${filePath}:`, err.message);
          return null;
        }
      }
    }
    return null;
  }

  // Tự động dọn dẹp các tệp .tmp mồ côi khi khởi động
  cleanupTempFiles() {
    try {
      if (!fs.existsSync(DATA_DIR)) return;
      const files = fs.readdirSync(DATA_DIR);
      for (const file of files) {
        if (file.endsWith('.tmp')) {
          try {
            fs.unlinkSync(path.join(DATA_DIR, file));
          } catch (_) {}
        }
      }
    } catch (_) {}
  }

  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      this.cleanupTempFiles();

      let parsed = this.loadRawJson(DB_FILE);
      if (!parsed && fs.existsSync(DB_BAK_FILE)) {
        console.warn('[DB Engine] Đang cố gắng phục hồi từ file sao lưu .bak...');
        parsed = this.loadRawJson(DB_BAK_FILE);
        if (parsed) {
          console.log('[DB Engine] Phục hồi thành công từ file sao lưu .bak!');
        }
      }

      if (parsed) {
        this.data = {
          users: Array.isArray(parsed.users) ? parsed.users : [],
          profiles: Array.isArray(parsed.profiles) ? parsed.profiles : [],
          stories: Array.isArray(parsed.stories) ? parsed.stories : [],
          messages: Array.isArray(parsed.messages) ? parsed.messages : [],
          circles: Array.isArray(parsed.circles) ? parsed.circles : [],
          friendRequests: Array.isArray(parsed.friendRequests) ? parsed.friendRequests : [],
          friendships: Array.isArray(parsed.friendships) ? parsed.friendships : [],
          notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
          highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
          archivedConversations: Array.isArray(parsed.archivedConversations) ? parsed.archivedConversations : [],
          savedPlaces: Array.isArray(parsed.savedPlaces) ? parsed.savedPlaces : []
        };
        this.isLoaded = true;
        const modified = this.sanitize();
        if (modified) {
          this.saveToDisk();
        }
        console.log(`[DB Engine] Đã nạp thành công Database: ${this.data.users.length} tài khoản, ${this.data.profiles.length} hồ sơ, ${this.data.messages.length} tin nhắn, ${this.data.friendships.length} quan hệ bạn bè.`);
        return;
      }

      // Khởi tạo file mới nếu chưa có
      this.saveToDiskSync();
      this.isLoaded = true;
      console.log('[DB Engine] Đã khởi tạo mới file Database tại:', DB_FILE);
    } catch (err) {
      console.error('[DB Engine] Lỗi khi nạp database:', err.message);
      this.data = { ...INITIAL_DB };
    }
  }

  // Tự động thanh lọc các bản ghi rác của khách vãng lai (client-xxx), tài khoản mockup/test rác và lời mời mồ côi
  sanitize() {
    try {
      const isTestRun = process.env.NODE_ENV === 'test' || process.argv.some(arg => arg.includes('test'));
      let prevUserCount = Array.isArray(this.data.users) ? this.data.users.length : 0;

      // 0. Tự động loại bỏ các tài khoản mockup/test rác (nếu không phải môi trường test nội bộ)
      if (!isTestRun && Array.isArray(this.data.users)) {
        const isMockUser = (u) => {
          if (!u) return true;
          const id = String(u.id || '');
          const email = String(u.email || '').toLowerCase();
          if (id.startsWith('test-') || id.startsWith('notif-user-') || id.startsWith('user-circ-') || id.startsWith('user-test-')) return true;
          if (email.endsWith('@vivu.vn') || email.includes('prof_') || email.includes('iso@') || email.includes('example.com')) return true;
          return false;
        };
        this.data.users = this.data.users.filter(u => !isMockUser(u));
        if (this.data.users.length < prevUserCount) {
          console.log(`[DB Sanitizer] Đã thanh lọc ${prevUserCount - this.data.users.length} tài khoản mockup/test rác.`);
        }
      }

      const validUserIds = new Set(this.data.users.map(u => u.id));
      const prevProfilesCount = this.data.profiles.length;
      const prevMessagesCount = this.data.messages.length;

      // 1. Chỉ giữ hồ sơ của tài khoản đã đăng ký (loại bỏ toàn bộ client-xxx và user rác)
      this.data.profiles = this.data.profiles.filter(p => p.id && validUserIds.has(p.id) && !p.id.startsWith('client-'));

      // 2. Chỉ giữ tin nhắn giữa các tài khoản đã đăng ký hợp lệ
      this.data.messages = this.data.messages.filter(m => {
        if (!m.sender || !validUserIds.has(m.sender)) return false;
        if (m.conversation_id && m.conversation_id.includes('client-')) return false;
        return true;
      });

      // 3. Chỉ giữ lời mời kết bạn giữa các tài khoản đã đăng ký hợp lệ
      this.data.friendRequests = this.data.friendRequests.filter(r => {
        return r.sender_id && validUserIds.has(r.sender_id) && r.receiver_id && validUserIds.has(r.receiver_id);
      });

      // 4. Chỉ giữ quan hệ bạn bè hợp lệ giữa các tài khoản đã đăng ký
      this.data.friendships = this.data.friendships.filter(f => {
        if (Array.isArray(f.users) && f.users.every(uid => validUserIds.has(uid))) return true;
        if (f.user_a_id && f.user_b_id && validUserIds.has(f.user_a_id) && validUserIds.has(f.user_b_id)) return true;
        return false;
      });

      // 5. Chỉ giữ nhóm (circles) thuộc về tài khoản đã đăng ký hợp lệ
      if (Array.isArray(this.data.circles)) {
        this.data.circles = this.data.circles.filter(c => {
          if (!c.owner_id || !validUserIds.has(c.owner_id)) return false;
          if (Array.isArray(c.member_ids)) {
            c.member_ids = c.member_ids.filter(id => validUserIds.has(id));
          }
          if (Array.isArray(c.members)) {
            c.members = c.members.filter(m => validUserIds.has(m.id || m.userId));
          }
          return true;
        });
      }

      // 6. Chỉ giữ stories còn hạn của tài khoản đã đăng ký hợp lệ
      const nowMs = Date.now();
      this.data.stories = this.data.stories.filter(s => {
        const creatorId = s.host_id || s.hostId || s.user_id;
        const expMs = s.expires_at ? new Date(s.expires_at).getTime() : 0;
        if (expMs && expMs <= nowMs) return false;
        return creatorId && validUserIds.has(creatorId);
      });

      // 7. Thanh lọc thông báo rác, lỗi undefined & lời mời kết bạn mồ côi (orphaned friend requests)
      if (Array.isArray(this.data.notifications)) {
        const validFriendReqIds = new Set(
          (this.data.friendRequests || [])
            .filter(r => r.status === 'pending')
            .map(r => r.id)
        );
        const validCircleIds = new Set((this.data.circles || []).map(c => c.id));

        const prevNotifCount = this.data.notifications.length;
        this.data.notifications = this.data.notifications.filter(n => {
          if (!n || !n.to_user_id || !validUserIds.has(n.to_user_id)) return false;
          if (n.from_user_id && !validUserIds.has(n.from_user_id)) return false;

          // Loại bỏ thông báo kết bạn bị lỗi hoặc mồ côi (không có requestId, body chứa undefined, hoặc requestId đã kết thúc)
          if (n.type === 'friend_request') {
            if (!n.action_data?.requestId) return false;
            if (n.body && (n.body.includes('undefined') || n.body.includes('null'))) return false;
            if (!validFriendReqIds.has(n.action_data.requestId)) return false;
          }

          // Loại bỏ thông báo nhóm nếu nhóm không còn tồn tại
          if (n.type === 'group_invite') {
            if (!n.action_data?.circleId || !validCircleIds.has(n.action_data.circleId)) return false;
          }

          return true;
        });

        if (this.data.notifications.length < prevNotifCount) {
          console.log(`[DB Sanitizer] Đã loại bỏ ${prevNotifCount - this.data.notifications.length} thông báo mồ côi/rác.`);
        }
      }

      // Đảm bảo cấu trúc savedPlaces luôn hợp lệ
      if (!Array.isArray(this.data.savedPlaces)) {
        this.data.savedPlaces = [];
      }

      const removedProfiles = prevProfilesCount - this.data.profiles.length;
      const removedMessages = prevMessagesCount - this.data.messages.length;
      if (removedProfiles > 0 || removedMessages > 0) {
        console.log(`[DB Sanitizer] Đã thanh lọc: loại bỏ ${removedProfiles} hồ sơ khách vãng lai, ${removedMessages} tin nhắn rác.`);
      }

      const hasChanges = (removedProfiles > 0 || removedMessages > 0 || prevUserCount > this.data.users.length);
      return hasChanges;
    } catch (sErr) {
      console.warn('[DB Sanitizer] Lỗi thanh lọc:', sErr.message);
      return false;
    }
  }

  // Quản lý Write Queue
  _enqueueWrite() {
    if (this._isWriting) {
      this._pendingWrite = true;
      return new Promise((resolve, reject) => {
        this._pendingResolvers.push({ resolve, reject });
      });
    }

    this._isWriting = true;
    const currentPromise = this._performAtomicWrite()
      .then(() => {
        this._isWriting = false;
        if (this._pendingWrite) {
          this._pendingWrite = false;
          const resolvers = this._pendingResolvers;
          this._pendingResolvers = [];
          return this._enqueueWrite().then(() => {
            resolvers.forEach(r => r.resolve());
          }).catch(err => {
            resolvers.forEach(r => r.reject(err));
          });
        }
      })
      .catch(err => {
        this._isWriting = false;
        console.error('[DB Engine] Lỗi ghi database xuống đĩa:', err.message);
        if (this._pendingWrite) {
          this._pendingWrite = false;
          const resolvers = this._pendingResolvers;
          this._pendingResolvers = [];
          resolvers.forEach(r => r.reject(err));
        }
      });

    // Bắt lỗi ngầm tránh UnhandledPromiseRejection khi gọi fire-and-forget
    currentPromise.catch(() => {});
    return currentPromise;
  }

  async _performAtomicWrite() {
    if (!fs.existsSync(DATA_DIR)) {
      await fs.promises.mkdir(DATA_DIR, { recursive: true });
    }
    if (!this.data || !Array.isArray(this.data.users)) {
      console.warn('[DB Engine] Dữ liệu trong bộ nhớ không hợp lệ, hủy ghi đĩa.');
      return;
    }

    const serialized = JSON.stringify(this.data, null, 2);
    const tempFile = path.join(
      DATA_DIR,
      `.${path.basename(DB_FILE)}.${process.pid}.${Date.now()}.${Math.random().toString(36).substring(2, 6)}.tmp`
    );

    try {
      // 1. Ghi toàn bộ vào file tạm
      await fs.promises.writeFile(tempFile, serialized, 'utf-8');

      // 2. Sao lưu file hiện tại sang .bak an toàn
      try {
        if (fs.existsSync(DB_FILE)) {
          await fs.promises.copyFile(DB_FILE, DB_BAK_FILE);
        }
      } catch (_) {}

      // 3. Đổi tên nguyên tử (Atomic Rename) với retry bất đồng bộ trên Windows
      let retries = 8;
      let delay = 20;
      while (retries > 0) {
        try {
          await fs.promises.rename(tempFile, DB_FILE);
          return;
        } catch (renameErr) {
          retries--;
          if (renameErr.code === 'EBUSY' || renameErr.code === 'EPERM' || renameErr.code === 'EACCES') {
            if (retries === 0) {
              // Cứu cánh cuối: copy đè
              await fs.promises.copyFile(tempFile, DB_FILE);
              return;
            }
            await new Promise(r => setTimeout(r, delay));
            delay = Math.min(delay * 2, 200);
          } else {
            throw renameErr;
          }
        }
      }
    } finally {
      // Đảm bảo luôn xóa tệp tạm nếu còn tồn tại
      try {
        if (fs.existsSync(tempFile)) {
          await fs.promises.unlink(tempFile);
        }
      } catch (_) {}
    }
  }

  // Phiên bản đồng bộ chỉ dùng khi khởi tạo file mới lần đầu trong constructor
  saveToDiskSync() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!this.data || !Array.isArray(this.data.users)) return;

      const serialized = JSON.stringify(this.data, null, 2);
      const tempFile = path.join(
        DATA_DIR,
        `.${path.basename(DB_FILE)}.${process.pid}.${Date.now()}.${Math.random().toString(36).substring(2, 6)}.tmp`
      );
      fs.writeFileSync(tempFile, serialized, 'utf-8');
      try {
        if (fs.existsSync(DB_FILE)) {
          fs.copyFileSync(DB_FILE, DB_BAK_FILE);
        }
      } catch (_) {}
      try {
        fs.renameSync(tempFile, DB_FILE);
      } catch (_) {
        try {
          fs.copyFileSync(tempFile, DB_FILE);
        } finally {
          try { fs.unlinkSync(tempFile); } catch (_) {}
        }
      }
    } catch (err) {
      console.error('[DB Engine] Lỗi ghi đồng bộ:', err.message);
    }
  }

  saveToDisk() {
    return this._enqueueWrite();
  }

  reloadFromDisk() {
    try {
      let parsed = this.loadRawJson(DB_FILE);
      if (!parsed && fs.existsSync(DB_BAK_FILE)) {
        parsed = this.loadRawJson(DB_BAK_FILE);
      }
      if (parsed && Array.isArray(parsed.users)) {
        // Hợp nhất tài khoản giữa memory và đĩa (không bao giờ xóa mất user trong memory)
        const diskUsers = parsed.users;
        const diskUserMap = new Map(diskUsers.map(u => [u.id || u.email, u]));
        this.data.users.forEach(u => {
          if (!diskUserMap.has(u.id || u.email)) {
            diskUsers.push(u);
          }
        });
        this.data.users = diskUsers;
      }
    } catch (e) {
      console.warn('[DB Engine] reloadFromDisk warning:', e.message);
    }
  }

  // Truy xuất các bảng
  get users() { return this.data.users; }
  set users(val) { this.data.users = val; this.saveToDisk(); }

  get profiles() { return this.data.profiles; }
  set profiles(val) { this.data.profiles = val; this.saveToDisk(); }

  get stories() { return this.data.stories; }
  set stories(val) { this.data.stories = val; this.saveToDisk(); }

  get messages() { return this.data.messages; }
  set messages(val) { this.data.messages = val; this.saveToDisk(); }

  get circles() { return this.data.circles; }
  set circles(val) { this.data.circles = val; this.saveToDisk(); }

  get friendRequests() { return this.data.friendRequests; }
  set friendRequests(val) { this.data.friendRequests = val; this.saveToDisk(); }

  get friendships() { return this.data.friendships; }
  set friendships(val) { this.data.friendships = val; this.saveToDisk(); }

  get notifications() { return this.data.notifications || []; }
  set notifications(val) { this.data.notifications = val; this.saveToDisk(); }

  get archivedConversations() { return this.data.archivedConversations || []; }
  set archivedConversations(val) { this.data.archivedConversations = val; this.saveToDisk(); }

  get savedPlaces() { return this.data.savedPlaces || []; }
  set savedPlaces(val) { this.data.savedPlaces = val; this.saveToDisk(); }

  scheduleSave() {
    if (this._saveTimer) return;
    this._saveTimer = setTimeout(() => {
      this._saveTimer = null;
      this.saveToDisk();
    }, 200);
  }

  // Thông báo cập nhật dữ liệu để ghi đĩa ngay lập tức
  persist() {
    if (this._saveTimer) {
      clearTimeout(this._saveTimer);
      this._saveTimer = null;
    }
    return this.saveToDisk();
  }
}

export const dbStore = new DatabaseStore();

