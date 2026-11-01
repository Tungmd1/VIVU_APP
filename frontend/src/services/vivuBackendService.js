import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  STORIES: 'vivu_stories_cache',
  CIRCLES: 'vivu_custom_circles_cache',
  MESSAGES: 'vivu_messages_cache',
  USER_STATUS: 'vivu_user_status_cache'
};

// Kênh đồng bộ thời gian thực giữa các Tab trình duyệt / Cửa sổ (Native BroadcastChannel)
const vivuChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('vivu_realtime_sync') 
  : null;

/**
 * Service quản lý dữ liệu VIVU (Dual-Mode: Supabase Cloud & Local Storage Fallback)
 */
export const vivuBackendService = {
  isConfigured: () => isSupabaseConfigured,

  // ==================== 1. STORY (ĐỒNG BỘ CÔNG KHAI TOÀN BỘ NGƯỜI DÙNG) ====================

  /**
   * Lấy danh sách Story (từ Supabase Cloud hoặc Local Storage)
   */
  async getStories(fallbackStories = []) {
    if (!isSupabaseConfigured) {
      try {
        const cached = localStorage.getItem(STORAGE_KEYS.STORIES);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Lỗi đọc cache local stories:', e);
      }
      return fallbackStories;
    }

    try {
      const { data, error } = await supabase
        .from('hangout_stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        return data.map(row => ({
          id: row.id,
          hostName: row.host_name || 'Người dùng VIVU',
          hostAvatar: row.host_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          category: row.category || 'moment',
          title: row.title,
          description: row.description,
          address: row.address || 'Vị trí trên bản đồ',
          plannedAt: row.planned_at || 'Vừa xong',
          distance: 'Gần bạn',
          latOffset: row.lat_offset ?? 0,
          lngOffset: row.lng_offset ?? 0,
          realLat: row.lat ?? null,
          realLng: row.lng ?? null,
          expiresIn: row.expires_in || 'Còn 3 giờ',
          image: row.image || null,
          privacy: row.privacy || 'public'
        }));
      }
      return fallbackStories;
    } catch (err) {
      console.warn('Lỗi fetch Supabase Stories, chuyển sang fallback:', err.message);
      return fallbackStories;
    }
  },

  /**
   * Đăng Story mới lên hệ thống (Công khai cho toàn bộ người dùng)
   */
  async createStory(newStory) {
    // 1. Đồng bộ lên Supabase Cloud (nếu đã cấu hình)
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('hangout_stories')
          .insert([{
            id: newStory.id,
            host_name: newStory.hostName,
            host_avatar: newStory.hostAvatar,
            category: newStory.category || 'moment',
            title: newStory.title,
            description: newStory.description,
            address: newStory.address,
            planned_at: newStory.plannedAt,
            lat: newStory.realLat,
            lng: newStory.realLng,
            lat_offset: 0,
            lng_offset: 0,
            expires_in: newStory.expiresIn,
            image: newStory.image || null,
            privacy: newStory.privacy || 'public'
          }])
          .select();

        if (error) console.warn('Lỗi insert Supabase Story:', error.message);
      } catch (e) {
        console.warn('Lỗi gọi Supabase insert story:', e);
      }
    }

    // 2. Lưu vào Local Storage Cache để bất kỳ tab nào cũng đọc được
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.STORIES) || '[]');
      const updated = [newStory, ...current.filter(s => s.id !== newStory.id)];
      localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(updated));
    } catch (e) {
      console.warn('Lỗi lưu story vào localStorage:', e);
    }

    // 3. Phát sóng tức thì qua BroadcastChannel tới toàn bộ các tab trình duyệt
    if (vivuChannel) {
      try {
        vivuChannel.postMessage({ type: 'STORY_CREATED', story: newStory });
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }

    return newStory;
  },

  /**
   * Đăng ký nhận Story mới thời gian thực (Supabase Realtime + BroadcastChannel + Storage Event)
   */
  subscribeStories(onNewStory) {
    const cleanups = [];

    // 1. Supabase Cloud Realtime Pub/Sub
    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('realtime:hangout_stories')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'hangout_stories' },
          (payload) => {
            if (payload.new && onNewStory) {
              const row = payload.new;
              onNewStory({
                id: row.id,
                hostName: row.host_name || 'Người dùng VIVU',
                hostAvatar: row.host_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                category: row.category || 'moment',
                title: row.title,
                description: row.description,
                address: row.address || 'Vị trí trên bản đồ',
                plannedAt: row.planned_at || 'Vừa xong',
                distance: 'Gần bạn',
                latOffset: row.lat_offset ?? 0,
                lngOffset: row.lng_offset ?? 0,
                realLat: row.lat,
                realLng: row.lng,
                expiresIn: row.expires_in || 'Còn 3 giờ',
                image: row.image || null,
                privacy: row.privacy || 'public'
              });
            }
          }
        )
        .subscribe();
      cleanups.push(() => supabase.removeChannel(channel));
    }

    // 2. BroadcastChannel: Đồng bộ ngay lập tức giữa mọi cửa sổ / tab đang mở
    if (vivuChannel) {
      const handleBroadcast = (event) => {
        if (event.data?.type === 'STORY_CREATED' && event.data.story && onNewStory) {
          onNewStory(event.data.story);
        }
      };
      vivuChannel.addEventListener('message', handleBroadcast);
      cleanups.push(() => vivuChannel.removeEventListener('message', handleBroadcast));
    }

    // 3. Storage Event: Đồng bộ khi các tab khác ghi vào localStorage
    if (typeof window !== 'undefined') {
      const handleStorage = (e) => {
        if (e.key === STORAGE_KEYS.STORIES && e.newValue) {
          try {
            const list = JSON.parse(e.newValue);
            if (Array.isArray(list) && list.length > 0 && onNewStory) {
              onNewStory(list[0]);
            }
          } catch (_) {}
        }
      };
      window.addEventListener('storage', handleStorage);
      cleanups.push(() => window.removeEventListener('storage', handleStorage));
    }

    return () => {
      cleanups.forEach(fn => fn());
    };
  },

  // ==================== 2. ĐỒNG BỘ VỊ TRÍ GPS THẬT ====================

  /**
   * Cập nhật vị trí GPS thật của người dùng
   */
  async updateLocation(userId, coords, customStatus = '') {
    if (!coords || !coords.lat || !coords.lng) return;

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('profiles')
          .upsert({
            id: userId || 'user-me',
            full_name: 'Bạn',
            lat: coords.lat,
            lng: coords.lng,
            custom_status: customStatus,
            last_seen_at: new Date().toISOString()
          });
      } catch (err) {
        console.warn('Lỗi updateLocation lên Supabase:', err.message);
      }
    }
  },

  // ==================== 3. TIN NHẮN MESSENGER ====================

  /**
   * Gửi tin nhắn mới
   */
  async sendMessage(conversationId, message) {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('messages')
          .insert([{
            id: message.id,
            conversation_id: conversationId,
            sender: message.sender,
            sender_name: message.senderName,
            text: message.text,
            image: message.image || null,
            created_at: new Date().toISOString()
          }]);
      } catch (err) {
        console.warn('Lỗi gửi tin nhắn Supabase:', err.message);
      }
    }
    return message;
  },

  /**
   * Đăng ký nhận tin nhắn mới thời gian thực (Supabase Realtime)
   */
  subscribeMessages(conversationId, onNewMessage) {
    if (!isSupabaseConfigured || !conversationId) return () => {};

    const channel = supabase
      .channel(`realtime:messages:${conversationId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          if (payload.new && onNewMessage) {
            onNewMessage(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // ==================== 4. NHÓM TỰ TẠO (CUSTOM CIRCLES) ====================

  /**
   * Lấy danh sách nhóm do người dùng tự tạo
   */
  async getCustomCircles(fallbackCircles = []) {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.CIRCLES);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Lỗi đọc cache nhóm tự tạo:', e);
    }
    return fallbackCircles;
  },

  /**
   * Lưu nhóm tự tạo mới
   */
  saveCustomCircle(circle) {
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.CIRCLES) || '[]');
      const updated = [circle, ...current.filter(c => c.id !== circle.id)];
      localStorage.setItem(STORAGE_KEYS.CIRCLES, JSON.stringify(updated));
    } catch (e) {
      console.warn('Lỗi lưu nhóm vào localStorage:', e);
    }
  }
};
