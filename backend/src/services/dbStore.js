import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '..', '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'vivu_database.json');

const INITIAL_DB = {
  users: [],
  profiles: [],
  stories: [],
  messages: [],
  circles: [],
  friendRequests: [],
  friendships: [],
  notifications: []
};

class DatabaseStore {
  constructor() {
    this.data = { ...INITIAL_DB };
    this.isLoaded = false;
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        if (raw.trim()) {
          const parsed = JSON.parse(raw);
          this.data = {
            users: Array.isArray(parsed.users) ? parsed.users : [],
            profiles: Array.isArray(parsed.profiles) ? parsed.profiles : [],
            stories: Array.isArray(parsed.stories) ? parsed.stories : [],
            messages: Array.isArray(parsed.messages) ? parsed.messages : [],
            circles: Array.isArray(parsed.circles) ? parsed.circles : [],
            friendRequests: Array.isArray(parsed.friendRequests) ? parsed.friendRequests : [],
            friendships: Array.isArray(parsed.friendships) ? parsed.friendships : [],
            notifications: Array.isArray(parsed.notifications) ? parsed.notifications : []
          };
          this.isLoaded = true;
          this.sanitize();
          console.log(`[DB Engine] Đã nạp thành công Database từ đĩa: ${this.data.users.length} tài khoản, ${this.data.profiles.length} hồ sơ, ${this.data.messages.length} tin nhắn, ${this.data.friendships.length} quan hệ bạn bè.`);
          return;
        }
      }

      // Khởi tạo file mới nếu chưa có
      this.saveToDisk();
      this.isLoaded = true;
      console.log('[DB Engine] Đã khởi tạo mới file Database tại:', DB_FILE);
    } catch (err) {
      console.error('[DB Engine] Lỗi khi nạp database:', err.message);
      this.data = { ...INITIAL_DB };
    }
  }

  // Tự động thanh lọc các bản ghi rác của khách vãng lai (client-xxx), chỉ giữ lại tài khoản đã đăng ký hợp lệ
  sanitize() {
    try {
      const validUserIds = new Set(this.data.users.map(u => u.id));
      const prevProfilesCount = this.data.profiles.length;
      const prevMessagesCount = this.data.messages.length;

      // 1. Chỉ giữ hồ sơ của tài khoản đã đăng ký (loại bỏ toàn bộ client-xxx)
      this.data.profiles = this.data.profiles.filter(p => p.id && validUserIds.has(p.id) && !p.id.startsWith('client-'));

      // 2. Chỉ giữ tin nhắn giữa các tài khoản đã đăng ký
      this.data.messages = this.data.messages.filter(m => {
        if (!m.sender || !validUserIds.has(m.sender)) return false;
        if (m.conversation_id && m.conversation_id.includes('client-')) return false;
        return true;
      });

      // 3. Chỉ giữ lời mời kết bạn giữa các tài khoản đã đăng ký
      this.data.friendRequests = this.data.friendRequests.filter(r => {
        return r.sender_id && validUserIds.has(r.sender_id) && r.receiver_id && validUserIds.has(r.receiver_id);
      });

      // 4. Chỉ giữ quan hệ bạn bè hợp lệ
      this.data.friendships = this.data.friendships.filter(f => {
        if (Array.isArray(f.users) && f.users.every(uid => validUserIds.has(uid))) return true;
        if (f.user_a_id && f.user_b_id && validUserIds.has(f.user_a_id) && validUserIds.has(f.user_b_id)) return true;
        return false;
      });

      // 5. Chỉ giữ stories của tài khoản đã đăng ký
      this.data.stories = this.data.stories.filter(s => {
        const creatorId = s.host_id || s.hostId || s.user_id;
        return !creatorId || validUserIds.has(creatorId);
      });

      const removedProfiles = prevProfilesCount - this.data.profiles.length;
      const removedMessages = prevMessagesCount - this.data.messages.length;
      if (removedProfiles > 0 || removedMessages > 0) {
        console.log(`[DB Sanitizer] Đã thanh lọc: loại bỏ ${removedProfiles} hồ sơ khách vãng lai, ${removedMessages} tin nhắn rác.`);
        this.saveToDisk();
      }
    } catch (sErr) {
      console.warn('[DB Sanitizer] Lỗi thanh lọc:', sErr.message);
    }
  }

  saveToDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const serialized = JSON.stringify(this.data, null, 2);
      // Ghi nguyên tử qua file tạm duy nhất để tránh race condition trên Windows
      const tempFile = `${DB_FILE}.${process.pid}.${Date.now()}.${Math.random().toString(36).substring(2, 6)}.tmp`;
      fs.writeFileSync(tempFile, serialized, 'utf-8');
      try {
        fs.renameSync(tempFile, DB_FILE);
      } catch (renameErr) {
        // Fallback ghi trực tiếp nếu Windows tạm thời khóa file đích
        fs.writeFileSync(DB_FILE, serialized, 'utf-8');
        try { fs.unlinkSync(tempFile); } catch (u) {}
      }
    } catch (err) {
      console.error('[DB Engine] Lỗi khi ghi database xuống đĩa:', err.message);
    }
  }

  reloadFromDisk() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        if (raw.trim()) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.users)) {
            // Giữ lại các user mới tạo trong memory và hợp nhất với trên đĩa
            const diskUsers = parsed.users;
            const diskUserMap = new Map(diskUsers.map(u => [u.id || u.email, u]));
            this.data.users.forEach(u => {
              if (!diskUserMap.has(u.id || u.email)) {
                diskUsers.push(u);
              }
            });
            this.data.users = diskUsers;
          }
        }
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
    this.saveToDisk();
  }
}

export const dbStore = new DatabaseStore();

