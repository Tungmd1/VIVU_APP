import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiClient } from '../services/api';

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export interface FriendItem {
  id: string;
  name: string;
  nickname?: string; // Biệt danh riêng
  familyRole?: string; // Vai trò gia đình: 'Mẹ', 'Bố', 'Em trai', 'Chị gái', 'Con'...
  avatar: string;
  phone?: string;
  latitude: number;
  longitude: number;
  status: 'online' | 'chilling' | 'working' | 'moving';
  statusText?: string;
  batteryLevel: number;
  isFriend: boolean;
  isLover?: boolean;
  isFamily?: boolean;
  beacon?: {
    emoji: string;
    content: string;
    remainingTime: string;
    category?: string;
  };
}

export interface MatchedUser {
  id: string;
  name: string;
  nickname?: string;
  avatar: string;
  distanceKm: number;
  matchScore: number; // 85 - 99%
  intentCategory: string; // 'cafe' | 'sport' | 'food' | 'study' | 'travel'
  intentText: string;
  intentEmoji: string;
  isFriend: boolean;
  batteryLevel?: number;
}

export interface SocialCircle {
  id: string;
  name: string;
  type: 'social' | 'friends' | 'lover' | 'family' | 'group';
  icon: string;
  color: string;
  memberIds: string[]; // danh sách friend IDs
  isCustom?: boolean;
  description?: string;
}

interface CircleState {
  circles: SocialCircle[];
  activeCircleId: string;
  friends: FriendItem[];
  showCreateCircleModal: boolean;
  selectedFriendDetail: FriendItem | null;
  selectedManageCircle: SocialCircle | null;

  // 1. Tùy chỉnh riêng cho mục XÃ HỘI & TÂM TRẠNG CÙNG NGUYỆN VỌNG
  socialMood: 'happy' | 'normal' | 'bad'; // 'happy' (vui vẻ, tìm bạn mới) | 'normal' (bình thường, chỉ bạn bè) | 'bad' (tồi tệ, tắt thông báo)
  socialOpenDoor: boolean; // Chế độ mở cửa đón nhận bạn bè mới
  socialTodayGoal: string; // 'cafe' | 'travel' | 'sport' | 'food' | 'study' | 'all'
  socialDistanceRadius: number;
  showSameIntentModal: boolean;
  notificationBanner: {
    title: string;
    subtitle: string;
    icon: string;
    type: 'happy' | 'normal' | 'bad';
    visible: boolean;
  } | null;

  setSocialMood: (mood: 'happy' | 'normal' | 'bad') => void;
  setSocialOpenDoor: (open: boolean) => void;
  setSocialTodayGoal: (goal: string) => void;
  setShowSameIntentModal: (show: boolean) => void;
  dismissNotificationBanner: () => void;
  getSameIntentMatches: (coords: { latitude: number; longitude: number }, beacons: any[]) => MatchedUser[];
  socialCategoryFilter: string; // 'all' | 'cafe' | 'sport' | 'food' | 'study' | 'travel'
  socialOnlineOnly: boolean;

  setSocialDistanceRadius: (km: number) => void;
  setSocialCategoryFilter: (cat: string) => void;
  setSocialOnlineOnly: (onlineOnly: boolean) => void;

  // 2. Tùy chỉnh riêng cho mục NGƯỜI YÊU
  loverAnniversaryDate: string; // YYYY-MM-DD
  setLoverAnniversaryDate: (date: string) => Promise<void>;

  // 3. Quản lý chung
  setActiveCircleId: (id: string) => void;
  setShowCreateCircleModal: (show: boolean) => void;
  setSelectedFriendDetail: (friend: FriendItem | null) => void;
  setSelectedManageCircle: (circle: SocialCircle | null) => void;

  createCircle: (data: {
    name: string;
    type: 'group' | 'family' | 'lover';
    icon: string;
    color: string;
    memberIds: string[];
    description?: string;
  }) => Promise<SocialCircle>;

  updateCircle: (
    circleId: string,
    data: Partial<Pick<SocialCircle, 'name' | 'icon' | 'color' | 'description'>>
  ) => Promise<void>;

  deleteCircle: (circleId: string) => Promise<void>;
  addMembersToCircle: (circleId: string, friendIds: string[]) => Promise<void>;
  removeMemberFromCircle: (circleId: string, friendId: string) => Promise<void>;

  // Quản lý bạn bè: Thêm bạn bè mới (3 cách: Link/ID, Xem hồ sơ, E-Drop)
  showEDropModal: boolean;
  setShowEDropModal: (show: boolean) => void;
  addFriend: (data: {
    id?: string;
    name: string;
    phone?: string;
    nickname?: string;
    avatar?: string;
  }) => Promise<FriendItem>;
  addFriendByLinkOrId: (input: string) => Promise<{ success: boolean; message: string; friend?: FriendItem }>;
  removeFriend: (friendId: string) => Promise<void>;
  setFriendNickname: (friendId: string, nickname: string) => Promise<void>;
  setFamilyRole: (friendId: string, role: string) => Promise<void>;

  setLover: (friendId: string) => Promise<void>;
  toggleFamilyMember: (friendId: string, role?: string) => Promise<void>;

  loadPersistedCircles: () => Promise<void>;
  fetchFriendsFromApi: () => Promise<void>;
}

const STORAGE_CIRCLES_KEY = 'vivu_custom_social_circles_v4';
const STORAGE_FRIENDS_OVERRIDE_KEY = 'vivu_friends_override_v4';
const STORAGE_SETTINGS_KEY = 'vivu_circle_settings_v4';

// Danh sách bạn bè mẫu phong phú quanh Đà Nẵng
const INITIAL_FRIENDS: FriendItem[] = [
  {
    id: 'f_thaomy',
    name: 'Thảo My',
    nickname: 'Bé iu ❤️',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    latitude: 16.0528,
    longitude: 108.2085,
    status: 'online',
    statusText: 'Đang đợi cafe Bạch Đằng ☕',
    batteryLevel: 92,
    isFriend: true,
    isLover: true,
    beacon: {
      emoji: '💖',
      content: 'Đang đợi người yêu đón đi dạo biển đêm nè ✨',
      remainingTime: 'Còn 35 phút',
      category: 'cafe',
    },
  },
  {
    id: 'f_lananh',
    name: 'Lan Anh (VIVU VIP)',
    nickname: 'Chị Cả 👑',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    latitude: 16.0612,
    longitude: 108.2245,
    status: 'online',
    statusText: 'Đang ở bãi biển Mỹ Khê 🏖️',
    batteryLevel: 88,
    isFriend: true,
    beacon: {
      emoji: '☕',
      content: 'Ai cafe ngắm biển Mỹ Khê chiều nay không?',
      remainingTime: 'Còn 45 phút',
      category: 'cafe',
    },
  },
  {
    id: 'f_tuankiet',
    name: 'Tuấn Kiệt',
    nickname: 'Kiệt Phượt Thủ 🏍️',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    latitude: 16.0685,
    longitude: 108.2140,
    status: 'moving',
    statusText: 'Đang lướt xe dạo phố 🏍️',
    batteryLevel: 74,
    isFriend: true,
    beacon: {
      emoji: '🏍️',
      content: 'Lên đỉnh Bàn Cờ ngắm hoàng hôn, cạ nào vi vu không?',
      remainingTime: 'Còn 90 phút',
      category: 'travel',
    },
  },
  {
    id: 'f_minhduc',
    name: 'Minh Đức (Em trai)',
    nickname: 'Cu Bo 👦',
    familyRole: 'Em trai',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    latitude: 16.0495,
    longitude: 108.1985,
    status: 'online',
    statusText: 'Đang học bài ở thư viện 📚',
    batteryLevel: 65,
    isFriend: true,
    isFamily: true,
  },
  {
    id: 'f_melan',
    name: 'Mẹ Lan',
    nickname: 'Mẹ Yêu 🏡',
    familyRole: 'Mẹ',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    latitude: 16.0470,
    longitude: 108.1960,
    status: 'chilling',
    statusText: 'Đang ở nhà nấu cơm 🏡',
    batteryLevel: 96,
    isFriend: true,
    isFamily: true,
  },
  {
    id: 'f_hoanglong',
    name: 'Hoàng Long',
    nickname: 'Long Smash 🏸',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    latitude: 16.0415,
    longitude: 108.2120,
    status: 'online',
    statusText: 'Sân cầu lông Tuyên Sơn 🏸',
    batteryLevel: 82,
    isFriend: true,
    beacon: {
      emoji: '🏸',
      content: 'Thiếu 1 bạn giao lưu cầu lông đôi nam-nữ!',
      remainingTime: 'Còn 60 phút',
      category: 'sport',
    },
  },
  {
    id: 'f_ngoctram',
    name: 'Ngọc Trâm',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    latitude: 16.0740,
    longitude: 108.2215,
    status: 'working',
    statusText: 'Làm việc tại The Cup Cafe 💻',
    batteryLevel: 51,
    isFriend: true,
  },
];

const DEFAULT_CIRCLES: SocialCircle[] = [
  {
    id: 'social',
    name: 'Xã hội',
    type: 'social',
    icon: '🌐',
    color: '#3B82F6',
    memberIds: [],
    description: 'Bản đồ công cộng: Tất cả tín hiệu & người dùng xung quanh bạn',
  },
  {
    id: 'friends',
    name: 'Bạn bè',
    type: 'friends',
    icon: '👥',
    color: '#10B981',
    memberIds: [],
    description: 'Chỉ hiển thị trạng thái và vị trí của những người bạn đã kết bạn',
  },
  {
    id: 'lover',
    name: 'Người yêu',
    type: 'lover',
    icon: '💖',
    color: '#EC4899',
    memberIds: ['f_thaomy'],
    description: 'Không gian đôi lứa riêng tư cho hai người',
  },
  {
    id: 'family',
    name: 'Gia đình',
    type: 'family',
    icon: '👨‍👩‍👧',
    color: '#F59E0B',
    memberIds: ['f_minhduc', 'f_melan'],
    description: 'Vòng tròn kết nối an tâm của các thành viên gia đình',
  },
  {
    id: 'group_phuot',
    name: 'Hội Phượt',
    type: 'group',
    icon: '🏕️',
    color: '#8B5CF6',
    memberIds: ['f_lananh', 'f_tuankiet'],
    isCustom: true,
    description: 'Hội anh em vi vu phượt Đà Nẵng - Hải Vân',
  },
];

export const useCircleStore = create<CircleState>((set, get) => ({
  circles: DEFAULT_CIRCLES,
  activeCircleId: 'social',
  friends: INITIAL_FRIENDS,
  showCreateCircleModal: false,
  selectedFriendDetail: null,
  selectedManageCircle: null,

  socialMood: 'happy',
  socialOpenDoor: true,
  socialTodayGoal: 'cafe',
  socialDistanceRadius: 5,
  showSameIntentModal: false,
  notificationBanner: {
    title: '🎉 Tìm thấy cạ cứng cùng nguyện vọng!',
    subtitle: 'Thảo My & Lan Anh cũng muốn đi cafe & dạo phố hôm nay.',
    icon: '🥳',
    type: 'happy',
    visible: true,
  },

  setSocialMood: (mood) => {
    let banner = null;
    let openDoor = get().socialOpenDoor;

    if (mood === 'happy') {
      openDoor = true;
      banner = {
        title: '🎉 Bạn đang rất vui vẻ & Mở cửa kết nối!',
        subtitle: 'Hệ thống đang tích cực gợi ý các cạ cứng có cùng nguyện vọng.',
        icon: '🥳',
        type: 'happy' as const,
        visible: true,
      };
    } else if (mood === 'normal') {
      openDoor = false;
      banner = {
        title: '😊 Tâm trạng bình thường (Chế độ Bạn Bè)',
        subtitle: 'Chỉ gửi thông báo từ những người bạn đã kết nối thân thiết.',
        icon: '☕',
        type: 'normal' as const,
        visible: true,
      };
    } else {
      openDoor = false;
      banner = {
        title: '🌙 Chế độ Yên Tĩnh (Ngày mệt mỏi)',
        subtitle: 'Đã tắt toàn bộ thông báo hôm nay để bạn nghỉ ngơi thư giãn.',
        icon: '🌧️',
        type: 'bad' as const,
        visible: true,
      };
    }

    set({ socialMood: mood, socialOpenDoor: openDoor, notificationBanner: banner });
    AsyncStorage.setItem(
      'vivu_mood_settings_v1',
      JSON.stringify({ mood, openDoor, goal: get().socialTodayGoal })
    ).catch(() => {});
  },

  setSocialOpenDoor: (open) => {
    set({ socialOpenDoor: open });
  },

  setSocialTodayGoal: (goal) => {
    set({ socialTodayGoal: goal });
  },

  setShowSameIntentModal: (show) => {
    set({ showSameIntentModal: show });
  },

  dismissNotificationBanner: () => {
    if (get().notificationBanner) {
      set({ notificationBanner: { ...get().notificationBanner!, visible: false } });
    }
  },

  getSameIntentMatches: (coords, beacons) => {
    const mood = get().socialMood;
    const openDoor = get().socialOpenDoor;
    const todayGoal = get().socialTodayGoal;
    const friends = get().friends;

    // NẾU LÀ NGÀY TỒI TỆ: Không gợi ý ai
    if (mood === 'bad') {
      return [];
    }

    const matches: MatchedUser[] = [];

    // 1. Quét từ beacons (người thật đang treo nguyện vọng)
    beacons.forEach((b: any) => {
      const dist = calculateDistanceKm(coords.latitude, coords.longitude, b.latitude, b.longitude);
      const isSameCategory = todayGoal === 'all' || b.category === todayGoal || todayGoal === 'cafe';

      // Nếu tâm trạng là bình thường: CHỈ nhận bạn bè
      const isFriend = friends.some((f) => f.id === b.userId);
      if (mood === 'normal' && !isFriend) return;

      // Tính điểm hòa hợp (Match score 85% - 99%)
      let score = 88;
      if (isSameCategory) score += 7;
      if (dist <= 3) score += 4;
      score = Math.min(score, 99);

      matches.push({
        id: b.userId || b.id,
        name: b.userName,
        avatar: b.userAvatar,
        distanceKm: dist,
        matchScore: score,
        intentCategory: b.category,
        intentText: b.content,
        intentEmoji: b.emoji || '✨',
        isFriend,
        batteryLevel: b.batteryLevel,
      });
    });

    // 2. Quét thêm bạn bè có cùng tâm trạng đi chơi
    friends.forEach((f) => {
      if (matches.some((m) => m.id === f.id)) return;
      if (mood === 'normal' && !f.isFriend) return;
      if (mood === 'happy' && !openDoor && !f.isFriend) return;

      const dist = calculateDistanceKm(coords.latitude, coords.longitude, f.latitude, f.longitude);
      const hasBeacon = !!f.beacon;

      matches.push({
        id: f.id,
        name: f.name,
        nickname: f.nickname,
        avatar: f.avatar,
        distanceKm: dist,
        matchScore: hasBeacon ? 96 : 89,
        intentCategory: f.beacon?.category || 'cafe',
        intentText: f.beacon?.content || 'Đang rảnh rỗi, tìm cạ đi dạo phố cùng!',
        intentEmoji: f.beacon?.emoji || '☕',
        isFriend: f.isFriend,
        batteryLevel: f.batteryLevel,
      });
    });

    // Sắp xếp theo độ hòa hợp cao nhất
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  },
  socialCategoryFilter: 'all',
  socialOnlineOnly: false,
  loverAnniversaryDate: '2025-02-14',

  setSocialDistanceRadius: (km) => {
    set({ socialDistanceRadius: km });
    AsyncStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify({
      radius: km,
      anniversary: get().loverAnniversaryDate,
    })).catch(() => {});
  },

  setSocialCategoryFilter: (cat) => set({ socialCategoryFilter: cat }),
  setSocialOnlineOnly: (onlineOnly) => set({ socialOnlineOnly: onlineOnly }),

  setLoverAnniversaryDate: async (date) => {
    set({ loverAnniversaryDate: date });
    try {
      await AsyncStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify({
        radius: get().socialDistanceRadius,
        anniversary: date,
      }));
    } catch (e) {}
  },

  setActiveCircleId: (id) => set({ activeCircleId: id }),
  setShowCreateCircleModal: (show) => set({ showCreateCircleModal: show }),
  setSelectedFriendDetail: (friend) => set({ selectedFriendDetail: friend }),
  setSelectedManageCircle: (circle) => set({ selectedManageCircle: circle }),

  createCircle: async ({ name, type, icon, color, memberIds, description }) => {
    const newCircle: SocialCircle = {
      id: `group_${Date.now()}`,
      name: name.trim(),
      type,
      icon,
      color,
      memberIds: memberIds || [],
      isCustom: true,
      description: description?.trim() || `Hội nhóm ${name.trim()}`,
    };

    const updated = [...get().circles, newCircle];
    set({ circles: updated, activeCircleId: newCircle.id });

    try {
      const customOnly = updated.filter((c) => c.isCustom);
      await AsyncStorage.setItem(STORAGE_CIRCLES_KEY, JSON.stringify(customOnly));
    } catch (e) {
      console.warn('[CircleStore] Lỗi lưu custom circles:', e);
    }

    return newCircle;
  },

  updateCircle: async (circleId, data) => {
    const updated = get().circles.map((c) => {
      if (c.id === circleId) {
        return { ...c, ...data };
      }
      return c;
    });

    set({ circles: updated });
    if (get().selectedManageCircle?.id === circleId) {
      set({ selectedManageCircle: { ...get().selectedManageCircle!, ...data } });
    }

    try {
      const customOnly = updated.filter((c) => c.isCustom);
      await AsyncStorage.setItem(STORAGE_CIRCLES_KEY, JSON.stringify(customOnly));
    } catch (e) {
      console.warn('[CircleStore] Lỗi cập nhật circle:', e);
    }
  },

  deleteCircle: async (circleId) => {
    const current = get().circles;
    const target = current.find((c) => c.id === circleId);
    if (!target || !target.isCustom) return;

    const updated = current.filter((c) => c.id !== circleId);
    const nextActive = get().activeCircleId === circleId ? 'social' : get().activeCircleId;

    set({
      circles: updated,
      activeCircleId: nextActive,
      selectedManageCircle: null,
    });

    try {
      const customOnly = updated.filter((c) => c.isCustom);
      await AsyncStorage.setItem(STORAGE_CIRCLES_KEY, JSON.stringify(customOnly));
    } catch (e) {
      console.warn('[CircleStore] Lỗi xóa custom circle:', e);
    }
  },

  addMembersToCircle: async (circleId, friendIds) => {
    const updated = get().circles.map((c) => {
      if (c.id === circleId) {
        const setIds = new Set([...c.memberIds, ...friendIds]);
        return { ...c, memberIds: Array.from(setIds) };
      }
      return c;
    });

    set({ circles: updated });
    if (get().selectedManageCircle?.id === circleId) {
      const target = updated.find((c) => c.id === circleId);
      if (target) set({ selectedManageCircle: target });
    }

    try {
      const customOnly = updated.filter((c) => c.isCustom);
      await AsyncStorage.setItem(STORAGE_CIRCLES_KEY, JSON.stringify(customOnly));
    } catch (e) {
      console.warn('[CircleStore] Lỗi thêm thành viên:', e);
    }
  },

  removeMemberFromCircle: async (circleId, friendId) => {
    const updated = get().circles.map((c) => {
      if (c.id === circleId) {
        return { ...c, memberIds: c.memberIds.filter((id) => id !== friendId) };
      }
      return c;
    });

    set({ circles: updated });
    if (get().selectedManageCircle?.id === circleId) {
      const target = updated.find((c) => c.id === circleId);
      if (target) set({ selectedManageCircle: target });
    }

    try {
      const customOnly = updated.filter((c) => c.isCustom);
      await AsyncStorage.setItem(STORAGE_CIRCLES_KEY, JSON.stringify(customOnly));
    } catch (e) {
      console.warn('[CircleStore] Lỗi xóa thành viên:', e);
    }
  },

  showEDropModal: false,
  setShowEDropModal: (show) => set({ showEDropModal: show }),

  // THÊM BẠN BÈ MỚI (Hỗ trợ chỉ định ID hoặc tự sinh ID)
  addFriend: async ({ id, name, phone, nickname, avatar }) => {
    const friendId = id || `friend_${Date.now()}`;

    // Kiểm tra xem đã kết bạn chưa
    const existing = get().friends.find((f) => f.id === friendId || f.name.toLowerCase() === name.trim().toLowerCase());
    if (existing) {
      const updatedExisting = get().friends.map((f) => (f.id === existing.id ? { ...f, isFriend: true } : f));
      set({ friends: updatedExisting });
      await AsyncStorage.setItem(STORAGE_FRIENDS_OVERRIDE_KEY, JSON.stringify(updatedExisting)).catch(() => {});
      return existing;
    }

    const newFriend: FriendItem = {
      id: friendId,
      name: name.trim(),
      phone: phone?.trim(),
      nickname: nickname?.trim() || undefined,
      avatar:
        avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      latitude: 16.0544 + (Math.random() - 0.5) * 0.03,
      longitude: 108.2022 + (Math.random() - 0.5) * 0.03,
      status: 'online',
      statusText: 'Vừa kết nối bạn bè 👋',
      batteryLevel: 92,
      isFriend: true,
    };

    const updated = [newFriend, ...get().friends];
    set({ friends: updated });

    try {
      await AsyncStorage.setItem(STORAGE_FRIENDS_OVERRIDE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('[CircleStore] Lỗi lưu bạn bè mới:', e);
    }

    return newFriend;
  },

  // CÁCH 1: THÊM BẠN QUA DÁN LIÊN KẾT HOẶC MÃ ĐỊNH DANH (ID)
  addFriendByLinkOrId: async (input: string) => {
    const raw = input.trim();
    if (!raw) {
      return { success: false, message: 'Vui lòng dán liên kết hoặc mã ID!' };
    }

    // Trích xuất ID từ link ví dụ: https://vivu.app/u/070336645 hoặc vivu.me/070336645
    let identifier = raw;
    const urlMatch = raw.match(/(?:\/u\/|id=|\/user\/)([^/?&#]+)/i);
    if (urlMatch && urlMatch[1]) {
      identifier = urlMatch[1];
    }

    // Kiểm tra trong danh sách bạn bè hiện tại
    const alreadyFriend = get().friends.find(
      (f) => f.id === identifier || f.phone === identifier || f.name.toLowerCase() === identifier.toLowerCase()
    );
    if (alreadyFriend && alreadyFriend.isFriend) {
      return {
        success: true,
        message: `${alreadyFriend.nickname || alreadyFriend.name} đã có trong danh sách bạn bè của bạn rồi!`,
        friend: alreadyFriend,
      };
    }

    // Tra cứu qua API Backend hoặc cơ sở dữ liệu
    try {
      const res = await ApiClient.checkIdentifier(identifier);
      if (res && res.exists) {
        const added = await get().addFriend({
          id: identifier,
          name: res.name || 'Người dùng VIVU',
          phone: identifier,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        });
        return {
          success: true,
          message: `Đã tìm thấy và kết bạn thành công với ${added.name}!`,
          friend: added,
        };
      }
    } catch (e) {}

    // Fallback: Tạo kết bạn mới từ mã liên kết
    const displayName = identifier.length > 10 ? `Bạn ${identifier.slice(0, 6)}...` : `Bạn ${identifier}`;
    const newFriend = await get().addFriend({
      id: identifier,
      name: displayName,
      phone: identifier.match(/^[0-9]+$/) ? identifier : undefined,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    });

    return {
      success: true,
      message: `Đã kết bạn thành công qua liên kết với ${newFriend.name}!`,
      friend: newFriend,
    };
  },

  // XÓA BẠN BÈ (HỦY KẾT BẠN)
  removeFriend: async (friendId) => {
    const updatedFriends = get().friends.filter((f) => f.id !== friendId);
    // Gỡ khỏi tất cả nhóm nếu có
    const updatedCircles = get().circles.map((c) => ({
      ...c,
      memberIds: c.memberIds.filter((id) => id !== friendId),
    }));

    set({
      friends: updatedFriends,
      circles: updatedCircles,
      selectedFriendDetail: null,
    });

    try {
      await AsyncStorage.setItem(STORAGE_FRIENDS_OVERRIDE_KEY, JSON.stringify(updatedFriends));
      const customOnly = updatedCircles.filter((c) => c.isCustom);
      await AsyncStorage.setItem(STORAGE_CIRCLES_KEY, JSON.stringify(customOnly));
    } catch (e) {
      console.warn('[CircleStore] Lỗi xóa bạn bè:', e);
    }
  },

  setFriendNickname: async (friendId, nickname) => {
    const cleanNick = nickname.trim();
    const updatedFriends = get().friends.map((f) => {
      if (f.id === friendId) {
        return { ...f, nickname: cleanNick || undefined };
      }
      return f;
    });

    set({ friends: updatedFriends });
    if (get().selectedFriendDetail?.id === friendId) {
      set({
        selectedFriendDetail: {
          ...get().selectedFriendDetail!,
          nickname: cleanNick || undefined,
        },
      });
    }

    try {
      await AsyncStorage.setItem(STORAGE_FRIENDS_OVERRIDE_KEY, JSON.stringify(updatedFriends));
    } catch (e) {
      console.warn('[CircleStore] Lỗi lưu biệt danh:', e);
    }
  },

  setFamilyRole: async (friendId, role) => {
    const cleanRole = role.trim();
    const updatedFriends = get().friends.map((f) => {
      if (f.id === friendId) {
        return { ...f, familyRole: cleanRole || undefined, isFamily: true };
      }
      return f;
    });

    // Đảm bảo có trong circle family
    const familyCircle = get().circles.find((c) => c.id === 'family');
    const updatedCircles = get().circles.map((c) => {
      if (c.id === 'family' && !c.memberIds.includes(friendId)) {
        return { ...c, memberIds: [...c.memberIds, friendId] };
      }
      return c;
    });

    set({ friends: updatedFriends, circles: updatedCircles });
    try {
      await AsyncStorage.setItem(STORAGE_FRIENDS_OVERRIDE_KEY, JSON.stringify(updatedFriends));
    } catch (e) {
      console.warn('[CircleStore] Lỗi đặt vai trò gia đình:', e);
    }
  },

  setLover: async (friendId) => {
    const target = get().friends.find((f) => f.id === friendId);
    const willBeLover = !target?.isLover;

    const updatedFriends = get().friends.map((f) => ({
      ...f,
      isLover: f.id === friendId ? willBeLover : false,
    }));

    const updatedCircles = get().circles.map((c) => {
      if (c.id === 'lover') {
        return { ...c, memberIds: willBeLover ? [friendId] : [] };
      }
      return c;
    });

    set({ friends: updatedFriends, circles: updatedCircles });
    try {
      await AsyncStorage.setItem(STORAGE_FRIENDS_OVERRIDE_KEY, JSON.stringify(updatedFriends));
    } catch (e) {
      console.warn('[CircleStore] Lỗi set lover:', e);
    }
  },

  toggleFamilyMember: async (friendId, role) => {
    const target = get().friends.find((f) => f.id === friendId);
    const willBeFamily = !target?.isFamily;

    const updatedFriends = get().friends.map((f) => {
      if (f.id === friendId) {
        return {
          ...f,
          isFamily: willBeFamily,
          familyRole: willBeFamily ? role || f.familyRole || 'Người thân' : undefined,
        };
      }
      return f;
    });

    const updatedCircles = get().circles.map((c) => {
      if (c.id === 'family') {
        const newMembers = willBeFamily
          ? [...new Set([...c.memberIds, friendId])]
          : c.memberIds.filter((id) => id !== friendId);
        return { ...c, memberIds: newMembers };
      }
      return c;
    });

    set({ friends: updatedFriends, circles: updatedCircles });
    try {
      await AsyncStorage.setItem(STORAGE_FRIENDS_OVERRIDE_KEY, JSON.stringify(updatedFriends));
    } catch (e) {
      console.warn('[CircleStore] Lỗi toggle family:', e);
    }
  },

  loadPersistedCircles: async () => {
    try {
      // 1. Circles
      const rawCircles = await AsyncStorage.getItem(STORAGE_CIRCLES_KEY);
      if (rawCircles) {
        const parsedCustom: SocialCircle[] = JSON.parse(rawCircles);
        const defaultBase = DEFAULT_CIRCLES.filter((c) => !c.isCustom);
        const combined = [...defaultBase];
        parsedCustom.forEach((custom) => {
          if (!combined.some((x) => x.id === custom.id)) {
            combined.push(custom);
          }
        });
        if (!combined.some((x) => x.id === 'group_phuot')) {
          combined.push(DEFAULT_CIRCLES.find((c) => c.id === 'group_phuot')!);
        }
        set({ circles: combined });
      }

      // 2. Friends
      const rawFriends = await AsyncStorage.getItem(STORAGE_FRIENDS_OVERRIDE_KEY);
      if (rawFriends) {
        const parsedFriends: FriendItem[] = JSON.parse(rawFriends);
        if (parsedFriends && parsedFriends.length > 0) {
          set({ friends: parsedFriends });
        }
      }

      // 3. Settings (Radius, Anniversary)
      const rawSettings = await AsyncStorage.getItem(STORAGE_SETTINGS_KEY);
      if (rawSettings) {
        const parsedSettings = JSON.parse(rawSettings);
        if (parsedSettings.radius !== undefined) {
          set({ socialDistanceRadius: parsedSettings.radius });
        }
        if (parsedSettings.anniversary) {
          set({ loverAnniversaryDate: parsedSettings.anniversary });
        }
      }
    } catch (e) {
      console.warn('[CircleStore] Lỗi tải dữ liệu lưu trữ:', e);
    }
  },

  fetchFriendsFromApi: async () => {
    try {
      const res = await ApiClient.getFriends();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const apiFriends: FriendItem[] = res.data.map((u: any, idx: number) => ({
          id: u.id || `api_f_${idx}`,
          name: u.name || 'Bạn bè',
          avatar:
            u.avatar ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          latitude: u.latitude || 16.0544 + (Math.random() - 0.5) * 0.04,
          longitude: u.longitude || 108.2022 + (Math.random() - 0.5) * 0.04,
          status: 'online',
          statusText: 'Đang online',
          batteryLevel: 85,
          isFriend: true,
        }));

        const existingIds = new Set(apiFriends.map((f) => f.id));
        const keptInitial = get().friends.filter((f) => !existingIds.has(f.id));
        set({ friends: [...apiFriends, ...keptInitial] });
      }
    } catch (e) {
      console.log('[CircleStore] Dùng danh sách bạn bè mẫu phong phú.');
    }
  },
}));
