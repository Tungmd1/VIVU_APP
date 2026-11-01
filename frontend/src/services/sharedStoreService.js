/**
 * sharedStoreService - Quản lý tương tác chéo giữa các tài khoản (Cross-Account Store)
 * Lưu trữ danh sách tài khoản, quan hệ bạn bè, tin nhắn 2 chiều và stories dùng chung trong LocalStorage
 */

const USERS_KEY = 'vivu_all_accounts_directory';
const FRIENDSHIPS_KEY = 'vivu_shared_friendships';
const MESSAGES_KEY = 'vivu_shared_conversations_v2';
const STORIES_KEY = 'vivu_shared_stories_v2';

// Danh sách các tài khoản trong thư mục dùng chung (Không còn dữ liệu mock)
const DEFAULT_ACCOUNTS = [];

class SharedStoreService {
  constructor() {
    this.init();
  }

  init() {
    // Khởi tạo thư mục tài khoản nếu chưa có
    try {
      const existing = localStorage.getItem(USERS_KEY);
      if (!existing) {
        localStorage.setItem(USERS_KEY, JSON.stringify([]));
      }
    } catch {}
  }

  // Lấy tất cả tài khoản
  getAllAccounts() {
    try {
      const saved = localStorage.getItem(USERS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  }

  // Đăng ký thêm tài khoản vào thư mục chung
  registerAccount(user) {
    if (!user) return;
    const accounts = this.getAllAccounts();
    const userId = user.id || `user-${Date.now()}`;
    const meta = user.user_metadata || {};
    
    const existingIndex = accounts.findIndex(a => a.id === userId || a.email === user.email);
    const accountData = {
      id: userId,
      email: user.email || `${userId}@vivu.vn`,
      name: meta.full_name || user.email?.split('@')[0] || 'Người dùng VIVU',
      avatar: meta.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userId)}`,
      job: meta.job || 'Thành viên VIVU',
      age: meta.age || 22,
      bio: meta.bio || 'Thành viên mới gia nhập VIVU',
      tags: meta.tags || ['DạoPhố'],
      latOffset: 0,
      lngOffset: 0
    };

    if (existingIndex >= 0) {
      accounts[existingIndex] = { ...accounts[existingIndex], ...accountData };
    } else {
      accounts.push(accountData);
    }

    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(accounts));
    } catch {}
  }

  // Lấy danh sách bạn bè của userId
  getFriends(userId) {
    try {
      const friendships = JSON.parse(localStorage.getItem(FRIENDSHIPS_KEY) || '[]');
      const accounts = this.getAllAccounts();

      const friendIds = friendships
        .filter(f => f.status === 'accepted' && (f.user1Id === userId || f.user2Id === userId))
        .map(f => (f.user1Id === userId ? f.user2Id : f.user1Id));

      return accounts.filter(a => friendIds.includes(a.id));
    } catch {
      return [];
    }
  }

  // Kết bạn giữa 2 user
  toggleFriendship(fromUserId, toUserId) {
    try {
      let friendships = JSON.parse(localStorage.getItem(FRIENDSHIPS_KEY) || '[]');
      const index = friendships.findIndex(
        f => (f.user1Id === fromUserId && f.user2Id === toUserId) ||
             (f.user1Id === toUserId && f.user2Id === fromUserId)
      );

      if (index >= 0) {
        // Hủy kết bạn
        friendships.splice(index, 1);
        localStorage.setItem(FRIENDSHIPS_KEY, JSON.stringify(friendships));
        return { isFriend: false };
      } else {
        // Tạo bạn bè
        friendships.push({
          id: `friendship-${Date.now()}`,
          user1Id: fromUserId,
          user2Id: toUserId,
          status: 'accepted',
          createdAt: new Date().toISOString()
        });
        localStorage.setItem(FRIENDSHIPS_KEY, JSON.stringify(friendships));
        return { isFriend: true };
      }
    } catch {
      return { isFriend: false };
    }
  }

  // Kiểm tra tình trạng bạn bè
  checkIsFriend(userId1, userId2) {
    try {
      const friendships = JSON.parse(localStorage.getItem(FRIENDSHIPS_KEY) || '[]');
      return friendships.some(
        f => f.status === 'accepted' &&
             ((f.user1Id === userId1 && f.user2Id === userId2) ||
              (f.user1Id === userId2 && f.user2Id === userId1))
      );
    } catch {
      return false;
    }
  }

  // Gửi tin nhắn giữa 2 user
  sendMessage({ fromUser, toUserId, text, image, video, isLocation, lat, lng }) {
    try {
      let conversations = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '{}');
      const pairKey = [fromUser.id, toUserId].sort().join('__');

      if (!conversations[pairKey]) {
        conversations[pairKey] = [];
      }

      const newMsg = {
        id: `msg-${Date.now()}`,
        senderId: fromUser.id,
        senderName: fromUser.name || fromUser.user_metadata?.full_name || 'Bạn',
        senderAvatar: fromUser.avatar || fromUser.user_metadata?.avatar_url,
        receiverId: toUserId,
        text,
        image,
        video,
        isLocation,
        lat,
        lng,
        createdAt: new Date().toISOString(),
        time: 'Vừa xong'
      };

      conversations[pairKey].push(newMsg);
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(conversations));
      return newMsg;
    } catch (e) {
      console.warn('Lỗi lưu tin nhắn:', e);
      return null;
    }
  }

  // Lấy tin nhắn giữa 2 user
  getConversationMessages(userId1, userId2) {
    try {
      const conversations = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '{}');
      const pairKey = [userId1, userId2].sort().join('__');
      return conversations[pairKey] || [];
    } catch {
      return [];
    }
  }
}

export const sharedStore = new SharedStoreService();
