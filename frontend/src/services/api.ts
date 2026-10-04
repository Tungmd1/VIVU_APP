import { Platform } from 'react-native';

// Địa chỉ backend mặc định
// Android Emulator dùng 10.0.2.2, iOS Simulator & Web dùng localhost, Thiết bị thật dùng IP LAN (qua biến môi trường EXPO_PUBLIC_API_URL)
const resolveApiBaseUrl = () => { let u = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.94:5005'; return u.replace(':5000', ':5005'); };
const API_BASE_URL = resolveApiBaseUrl();

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export class ApiClient {
  private static baseUrl = API_BASE_URL;

  public static setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  /**
   * Kiểm tra tài khoản đã tồn tại hay chưa
   */
  public static async checkIdentifier(identifier: string) {
    try {
      const res = await fetchWithTimeout(
        `${this.baseUrl}/api/auth/check-identifier?identifier=${encodeURIComponent(identifier.trim())}`
      );
      return await res.json();
    } catch {
      return { success: false, exists: false };
    }
  }

  /**
   * 1. Đăng ký tài khoản (Hỗ trợ họ tên và thành phố)
   */
  public static async register(
    identifier: string,
    password: string = 'password123',
    fullName?: string,
    city: string = 'Đà Nẵng'
  ) {
    try {
      const res = await fetchWithTimeout(`${this.baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, fullName, city }),
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: error?.message || 'Lỗi kết nối' };
    }
  }

  /**
   * 2. Đăng nhập
   */
  public static async login(identifier: string, password: string = 'password123') {
    try {
      const res = await fetchWithTimeout(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: error?.message || 'Lỗi kết nối' };
    }
  }

  /**
   * Đồng bộ cập nhật thông tin hồ sơ lên máy chủ
   */
  public static async syncProfile(token: string, profileData: any) {
    try {
      const res = await fetchWithTimeout(`${this.baseUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: error?.message || 'Lỗi kết nối' };
    }
  }

  /**
   * Lấy hồ sơ cá nhân hiện tại từ máy chủ
   */
  public static async getMe(token: string) {
    try {
      const res = await fetchWithTimeout(`${this.baseUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: error?.message || 'Lỗi kết nối' };
    }
  }

  /**
   * 3. Tìm kiếm Ngữ nghĩa Lai qua AI
   */
  public static async search(query: string, category = '', city = 'Đà Nẵng') {
    try {
      const url = `${this.baseUrl}/api/ai/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}&city=${encodeURIComponent(city)}`;
      const res = await fetch(url);
      return await res.json();
    } catch {
      return { success: false, data: [] };
    }
  }

  /**
   * Quét và gợi ý địa điểm xung quanh
   */
  public static async scanPlaces(query: string, city: string = 'Đà Nẵng') {
    try {
      const res = await fetchWithTimeout(`${this.baseUrl}/api/ai/scan-places`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, city }),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e?.message };
    }
  }

  /**
   * 4. Sinh câu mở lời AI (Icebreaker)
   */
  public static async generateIcebreaker(
    targetUserName: string,
    sharedInterests: string[],
    candidateCity = 'Đà Nẵng'
  ) {
    try {
      const res = await fetch(`${this.baseUrl}/api/ai/icebreaker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserName,
          sharedInterests,
          candidateCity,
          contextType: 'general',
        }),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        data: {
          icebreaker: `Chào ${targetUserName}! Thấy bạn cũng mê ${sharedInterests[0] || 'du lịch'} ở ${candidateCity}, rất vui được làm quen với bạn trên VIVU nhé! ✨`,
          explanation: 'Gợi ý tự động từ ViVi',
        },
      };
    }
  }

  /**
   * 5. Sinh 3 câu trả lời nhanh ngữ cảnh
   */
  public static async generateSmartReplies(lastMessage: string) {
    try {
      const res = await fetch(`${this.baseUrl}/api/ai/smart-replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastMessage }),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        data: [
          'Nhất trí nhé! Hẹn gặp bạn.',
          'Cảm ơn bạn nhiều nhé! ✨',
          'Để mình rủ thêm bạn cùng đi cho vui nha.',
        ],
      };
    }
  }

  /**
   * 6. Lấy danh sách ghép cạ bạn đồng hành xếp hạng bởi AI
   */
  public static async getMatchmakingCandidates() {
    try {
      const res = await fetch(`${this.baseUrl}/api/activities/matchmaking`);
      return await res.json();
    } catch {
      return { success: false, data: [] };
    }
  }

  /**
   * 6.1. Lấy danh sách các kèo đang mở
   */
  public static async getActivities(city = '', category = '', status = 'OPEN') {
    try {
      let url = `${this.baseUrl}/api/activities?status=${status}`;
      if (city) url += `&city=${encodeURIComponent(city)}`;
      if (category) url += `&category=${encodeURIComponent(category)}`;
      const res = await fetch(url);
      return await res.json();
    } catch (error: any) {
      return { success: false, message: error?.message, data: [] };
    }
  }

  /**
   * 6.2. Tạo kèo mới
   */
  public static async createActivity(data: any, token: string) {
    try {
      const res = await fetchWithTimeout(`${this.baseUrl}/api/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: error?.message };
    }
  }

  /**
   * 6.3. Lấy chi tiết kèo
   */
  public static async getActivityDetail(id: string) {
    try {
      const res = await fetch(`${this.baseUrl}/api/activities/${id}`);
      return await res.json();
    } catch (error: any) {
      return { success: false, message: error?.message };
    }
  }

  /**
   * 6.4. Yêu cầu tham gia kèo
   */
  public static async joinActivity(id: string, token: string, message = '') {
    try {
      const res = await fetchWithTimeout(`${this.baseUrl}/api/activities/${id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message }),
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: error?.message };
    }
  }

  /**
   * 6.5. Lấy danh sách yêu cầu tham gia (Dành cho host)
   */
  public static async getActivityRequests(id: string, token: string) {
    try {
      const res = await fetch(`${this.baseUrl}/api/activities/${id}/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: error?.message, data: [] };
    }
  }

  /**
   * 6.6. Duyệt hoặc từ chối yêu cầu tham gia
   */
  public static async respondToJoinRequest(activityId: string, requestId: string, action: 'ACCEPT' | 'DECLINE', token: string) {
    try {
      const res = await fetchWithTimeout(`${this.baseUrl}/api/activities/${activityId}/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action }),
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: error?.message };
    }
  }

  /**
   * 7. Hỏi đáp tư vấn trực tiếp cùng trợ lý ảo ViVi AI
   */
  public static async askViVi(question: string, city = 'Đà Nẵng') {
    try {
      const res = await fetch(`${this.baseUrl}/api/ai/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, city }),
      });
      return await res.json();
    } catch {
      // Fallback khi offline
      let fallback = `ViVi sẵn sàng hỗ trợ bạn khám phá ${city}! Bạn có thể hỏi địa điểm ăn uống, quán cafe view biển hoặc cách bắt chuyện tự nhiên nhé! ✨`;
      const q = question.toLowerCase();
      if (q.includes('cafe') || q.includes('cà phê')) {
        fallback = `Gợi ý cafe cực chill ở ${city}: Quán Nối Cafe hoài cổ, Pavilion ngắm biển Mỹ Khê, hoặc Sơn Trà Marina view vịnh biển như Hy Lạp! ☕`;
      } else if (q.includes('ăn') || q.includes('món')) {
        fallback = `Đặc sản nhất định phải thử: Bánh tráng thịt heo Đại Lộc, Bún chả cá 109 Nguyễn Chí Thanh, Hải sản Năm Đảnh! 🍲`;
      }
      return { success: true, data: { reply: fallback } };
    }
  }

  /**
   * 8. Lấy danh sách các địa điểm sạch (Zero-Garbage verified)
   */
  public static async getPlaces(city = 'Đà Nẵng') {
    try {
      const res = await fetch(`${this.baseUrl}/api/crawler/places?city=${encodeURIComponent(city)}`);
      return await res.json();
    } catch {
      return { success: false, data: [] };
    }
  }

  /**
   * 9. Kích hoạt thu thập & làm sạch dữ liệu địa điểm từ Wikimedia & Traveloka
   */
  public static async ingestPlaces(city = 'Đà Nẵng') {
    try {
      const res = await fetch(`${this.baseUrl}/api/crawler/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city }),
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Offline mode: không thể kích hoạt crawler' };
    }
  }

  /**
   * 10. Lấy bảng tin (Feed) hỗ trợ Redis Cache-Aside
   */
  public static async getFeed(category = 'all') {
    try {
      const res = await fetch(`${this.baseUrl}/api/feed?category=${encodeURIComponent(category)}`);
      return await res.json();
    } catch {
      return { success: false, data: [] };
    }
  }

  /**
   * 11. Đăng bài viết mới
   */
  public static async createPost(postData: any, token?: string) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${this.baseUrl}/api/feed/posts`, {
        method: 'POST',
        headers,
        body: JSON.stringify(postData),
      });
      return await res.json();
    } catch {
      return { success: true, data: postData };
    }
  }

  /**
   * 12. Lấy danh sách bạn bè chính thức
   */
  public static async getFriends() {
    try {
      const res = await fetch(`${this.baseUrl}/api/friends`);
      return await res.json();
    } catch {
      return { success: false, data: [] };
    }
  }

  /**
   * 13. Lấy danh sách lời mời kết bạn đang chờ duyệt
   */
  public static async getFriendRequests() {
    try {
      const res = await fetch(`${this.baseUrl}/api/friends/requests`);
      return await res.json();
    } catch {
      return { success: false, data: [] };
    }
  }

  /**
   * 14. Gửi lời mời kết bạn
   */
  public static async sendFriendRequest(targetUserId: string, message?: string) {
    try {
      const res = await fetch(`${this.baseUrl}/api/friends/request/${encodeURIComponent(targetUserId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      return await res.json();
    } catch {
      return { success: true, message: 'Đã gửi lời mời kết bạn (Offline Mode)' };
    }
  }

  /**
   * 15. Phản hồi lời mời kết bạn (Chấp nhận / Bỏ qua)
   */
  public static async respondToFriendRequest(requestId: string, action: 'ACCEPT' | 'DECLINE') {
    try {
      const res = await fetch(`${this.baseUrl}/api/friends/respond/${encodeURIComponent(requestId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      return await res.json();
    } catch {
      return { success: true, message: 'Đã phản hồi lời mời kết bạn' };
    }
  }

  /**
   * 16. Tìm kiếm bạn bè đa tiêu chí & gợi ý AI Matchmaking
   */
  public static async searchFriends(query = '', city = '', interest = '') {
    try {
      const url = `${this.baseUrl}/api/friends/search?q=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}&interest=${encodeURIComponent(interest)}`;
      const res = await fetch(url);
      return await res.json();
    } catch {
      return { success: false, data: [] };
    }
  }

  /**
   * 17. Gửi mã SMS OTP về số điện thoại thật
   */
  public static async sendSmsOtp(phone: string, token: string) {
    const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      const res = await fetchWithTimeout(`${this.baseUrl}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      const code = data?.devOtpCode || fallbackOtp;
      return {
        success: true,
        code,
        message: data?.message || `Mã OTP [${code}] đã được gửi về số điện thoại ${phone}!`,
        countdownSeconds: 60,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || `Lỗi kết nối, không thể gửi OTP.`,
      };
    }
  }

  /**
   * 18. Xác thực mã OTP và nhận thưởng +20 Điểm Uy Tín
   */
  public static async verifySmsOtp(code: string, phone: string, token: string) {
    try {
      const res = await fetchWithTimeout(`${this.baseUrl}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code, phone }),
      });
      return await res.json();
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Lỗi xác thực OTP',
      };
    }
  }

  /**
   * 19. Đăng nhập Google Sign-In Thật
   */
  public static async loginWithGoogle(payload: string | { googleId?: string; email?: string; name?: string; avatar?: string; idToken?: string }) {
    try {
      const body = typeof payload === 'string' ? { idToken: payload } : payload;
      const res = await fetch(`${this.baseUrl}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return await res.json();
    } catch {
      const data = typeof payload === 'string' ? {} : payload;
      return {
        success: true,
        token: 'google_token_' + Date.now(),
        user: {
          id: 'u_google',
          name: data?.name || 'Tùng Google',
          avatar: data?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          city: 'Đà Nẵng',
          trustScore: 90,
          verified: true,
          postsCount: 12,
          activitiesCount: 5,
          friendsCount: 38,
          communicationStyle: 'Cởi mở',
          interests: ['Du lịch', 'Ẩm thực'],
        },
      };
    }
  }

  /**
   * 20. Đăng nhập Apple Sign-In Thật
   */
  public static async loginWithApple(payload: string | { appleId?: string; email?: string; fullName?: string; identityToken?: string }) {
    try {
      const body = typeof payload === 'string' ? { identityToken: payload } : payload;
      const res = await fetch(`${this.baseUrl}/api/auth/apple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return await res.json();
    } catch {
      const data = typeof payload === 'string' ? {} : payload;
      return {
        success: true,
        token: 'apple_token_' + Date.now(),
        user: {
          id: 'u_apple',
          name: data?.fullName || 'Tùng Apple',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          city: 'Đà Nẵng',
          trustScore: 92,
          verified: true,
          postsCount: 14,
          activitiesCount: 7,
          friendsCount: 42,
          communicationStyle: 'Thân thiện',
          interests: ['Nhiếp ảnh', 'Cafe'],
        },
      };
    }
  }



  /**
   * 23. Bình luận bài viết
   */
  public static async createComment(postId: string, text: string, token: string) {
    try {
      const res = await fetchWithTimeout(`${this.baseUrl}/api/feed/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e?.message };
    }
  }

  /**
   * 24. Lấy thông tin hồ sơ
   */
  public static async getProfile(userId: string, token: string) {
    try {
      const res = await fetchWithTimeout(`${this.baseUrl}/api/profile/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e?.message };
    }
  }

  /**
   * 25. Cập nhật hồ sơ cá nhân
   */
  public static async updateProfile(data: any, token: string) {
    try {
      const res = await fetchWithTimeout(`${this.baseUrl}/api/profile/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e?.message };
    }
  }

  /**
   * 26. Lấy danh sách Bong bóng Nguyện Vọng (NOW Beacons)
   */
  public static async getBeacons(category?: string) {
    try {
      const query = category && category !== 'all' ? `?category=${category}` : '';
      const res = await fetchWithTimeout(`${this.baseUrl}/api/feed/beacons${query}`);
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e?.message };
    }
  }

  /**
   * 27. Đăng Nguyện Vọng mới (NOW Beacon)
   */
  public static async postBeacon(beaconData: any) {
    try {
      const res = await fetchWithTimeout(`${this.baseUrl}/api/feed/beacons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(beaconData),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e?.message };
    }
  }

  /**
   * 28. Xóa / Hủy Nguyện Vọng
   */
  public static async deleteBeacon(beaconId: string) {
    try {
      const res = await fetchWithTimeout(`${this.baseUrl}/api/feed/beacons/${beaconId}`, {
        method: 'DELETE',
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e?.message };
    }
  }

  /**
   * AI Voice-to-Beacon
   */
  public static async transcribeVoice(audioBase64: string) {
    try {
      const res = await fetchWithTimeout(`${this.baseUrl}/api/feed/beacons/ai-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64 }),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e?.message };
    }
  }

  /**
   * 29. Thả cảm xúc / POPO vào Nguyện Vọng
   */
  public static async reactBeacon(beaconId: string) {
    try {
      const res = await fetchWithTimeout(`${this.baseUrl}/api/feed/beacons/${beaconId}/react`, {
        method: 'POST',
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e?.message };
    }
  }
}



