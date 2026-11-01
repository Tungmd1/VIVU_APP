import React, { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from 'react';
import confetti from 'canvas-confetti';
import { useGeolocation } from './hooks/useGeolocation';
import { vivuBackendService } from './services/vivuBackendService';
import { apiClient } from './services/apiClient';

// Import các Module Components
import MapboxCanvas from './components/map/MapboxCanvas';
import UnifiedDynamicIsland from './components/layout/UnifiedDynamicIsland';
import RadarDistanceSelector from './components/map/RadarDistanceSelector';
import NavigationBanner from './components/map/NavigationBanner';
import GpsStatusBanner from './components/map/GpsStatusBanner';
import VivuBottomDock from './components/layout/VivuBottomDock';
import UserLocationSheet from './components/layout/UserLocationSheet';
import FriendDetailSheet from './components/layout/FriendDetailSheet';
import StoryStudioModal from './components/story/StoryStudioModal';
import StoryViewerModal from './components/story/StoryViewerModal';
import GuestProfileModal from './components/profile/GuestProfileModal';
import CreateCircleModal from './components/circle/CreateCircleModal';
import MessengerChatView from './components/chat/MessengerChatView';
import CreatePollModal from './components/chat/CreatePollModal';
import CallOverlayModal from './components/chat/CallOverlayModal';
import ProfilePageView from './components/profile/ProfilePageView';
import EditProfileModal from './components/profile/EditProfileModal';
import SettingsModal from './components/profile/SettingsModal';
import MemeTrollModal from './components/meme/MemeTrollModal';
import MemeScreenTakeover from './components/meme/MemeScreenTakeover';
import AppLockOverlay from './components/profile/AppLockOverlay';
import RadarNotificationDrawer from './components/map/RadarNotificationDrawer';
import MobileQrModal from './components/common/MobileQrModal';
import FriendshipManagerModal from './components/friends/FriendshipManagerModal';
import NotificationDrawer from './components/common/NotificationDrawer';
import NotificationBellButton from './components/common/NotificationBellButton';
import { useSocket } from './hooks/useSocket';
import { safeGetItem, safeSetItem } from './utils/safeStorage';

// Import Phân hệ Xác thực (Auth System)
import { useAuth } from './hooks/useAuth';
import AuthGateView from './components/auth/AuthGateView';
import ResetPasswordModal from './components/auth/ResetPasswordModal';
import TopLeftUserAvatar from './components/common/TopLeftUserAvatar';
import TopAppLogo from './components/common/TopAppLogo';
import BumpUserAvatar from './components/common/BumpUserAvatar';
import { VivuPermissionGate, VivuIntroScreen } from './components/intro';
import RightFriendshipPanel from './components/friends/RightFriendshipPanel';
import AccountSwitcherModal from './components/profile/AccountSwitcherModal';
const SpatialBumpModal3D = lazy(() => import('./components/bump/SpatialBumpModal3D'));
import ProximityBumpBanner from './components/bump/ProximityBumpBanner';
import { useProximityDetector } from './hooks/useProximityDetector';

// Hàm phát chuông thông báo ding-dong vui tai qua Web Audio API (Yêu cầu 5)
const playDingDongSound = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // Nốt 1: Re (D5 - 587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // Vuốt lên nốt La (A5)
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);
  } catch (e) {
    console.log('AudioContext notification status:', e);
  }
};

// Hàm phát âm thanh tin nhắn đến chuyên biệt "Ting-Ting" (Pop Chime) qua Web Audio API
// Âm sắc bổng trong trẻo, êm dịu, ngắn gọn (0.2s), hoàn toàn phân biệt với tiếng chuông radar Ding-dong
const playMessageNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Nốt 1: Mi (E6 - 1318.5 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1318.5, now);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.1);

    // Nốt 2: La (A6 - 1760 Hz) gõ sau 0.08s
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1760, now + 0.08);
    gain2.gain.setValueAtTime(0.25, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.28);
  } catch (e) {
    console.log('AudioContext message notification error:', e);
  }
};

export default function App() {
  const { 
    location, 
    loading: gpsLoading, 
    error: gpsError,
    permissionGranted,
    permissionDenied,
    requestLocation, 
    clearLocation,
    setManualCoords, 
    locationSource, 
    cityName, 
    isFallback 
  } = useGeolocation();
  
  // Trạng thái Xác thực & Phiên làm việc (Auth State)
  const {
    user,
    session,
    isAuthenticated,
    isLoading: isAuthLoading,
    isSubmitting: isAuthSubmitting,
    authError,
    clearError: clearAuthError,
    login,
    register,
    loginOAuth,
    forgotPassword,
    changePassword,
    updateProfile,
    logout
  } = useAuth();

  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  // Rule 22: Vào thẳng bản đồ 3D tức thì, không hiển thị cổng chặn quyền làm chớp màn hình
  const [isPermissionGateOpen, setIsPermissionGateOpen] = useState(false);
  // Khởi động Video Intro: Phát 1 lần đầu tiên mỗi phiên (sessionStorage) hoặc khi người dùng bấm xem lại
  const [isIntroPlaying, setIsIntroPlaying] = useState(() => {
    try {
      const hasPlayed = sessionStorage.getItem('vivu_intro_played');
      return !hasPlayed;
    } catch {
      return false;
    }
  });

  // Xử lý khi người dùng cấp đủ 3 quyền bắt buộc (GPS thật, Âm thanh, Camera)
  const handlePermissionsGranted = () => {
    setIsPermissionGateOpen(false);
    setIsIntroPlaying(true);
    if (requestLocation) requestLocation();
  };

  // Xử lý khi video intro chạy xong: lưu cờ sessionStorage, chuyển mượt mà vào Bản đồ 3D
  const handleIntroFinished = () => {
    try {
      sessionStorage.setItem('vivu_intro_played', 'true');
    } catch {}
    setIsIntroPlaying(false);
  };

  // Điều khoản Vị trí tự động chấp thuận (Không chặn cổng xác nhận bước 2)
  const [isLocationTermsAccepted, setIsLocationTermsAccepted] = useState(true);

  const handleAcceptLocationTerms = async () => {
    setIsLocationTermsAccepted(true);
    try {
      localStorage.setItem('vivu_location_terms_accepted', 'true');
    } catch (e) {
      console.warn('Lỗi lưu terms consent:', e);
    }
    if (user?.id) {
      await apiClient.updateUserProfile(user.id, {
        locationConsent: {
          version: '1.0',
          acceptedAt: new Date().toISOString()
        }
      });
    }
  };

  // Cài đặt quyền nhận tin nhắn ('everyone' hoặc 'friends_only')
  const [messagePrivacy, setMessagePrivacy] = useState(() => user?.message_privacy || 'everyone');
  const handleUpdateMessagePrivacy = async (privacy) => {
    setMessagePrivacy(privacy);
    if (user?.id) {
      await apiClient.updateUserProfile(user.id, { messagePrivacy: privacy });
    }
  };

  // 4. BẢNG MÀU CHỦ ĐẠO THEME ACCENT (HÀI HÒA RESEND DARK MONOCHROME)
  const THEME_ACCENT_MAP = useMemo(() => ({
    cyan: { hex: '#0EA5E9', rgb: '14, 165, 233', hover: '#38BDF8', text: '#000000' },
    emerald: { hex: '#10B981', rgb: '16, 185, 129', hover: '#34D399', text: '#000000' },
    violet: { hex: '#8B5CF6', rgb: '139, 92, 246', hover: '#A78BFA', text: '#FFFFFF' },
    rose: { hex: '#F43F5E', rgb: '244, 63, 94', hover: '#FB7185', text: '#FFFFFF' },
    amber: { hex: '#F59E0B', rgb: '245, 158, 11', hover: '#FBBF24', text: '#000000' },
    white: { hex: '#FFFFFF', rgb: '255, 255, 255', hover: '#EAEAEA', text: '#000000' },
  }), []);

  const [themeAccent, setThemeAccent] = useState(() => {
    try {
      return localStorage.getItem('vivu_theme_accent') || 'cyan';
    } catch {
      return 'cyan';
    }
  });

  const applyThemeAccent = useCallback((accentId) => {
    const cfg = THEME_ACCENT_MAP[accentId] || THEME_ACCENT_MAP.cyan;
    setThemeAccent(accentId);
    try {
      localStorage.setItem('vivu_theme_accent', accentId);
    } catch (e) {
      console.warn('Lỗi lưu theme accent:', e);
    }
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--accent-color', cfg.hex);
      root.style.setProperty('--accent-color-rgb', cfg.rgb);
      root.style.setProperty('--accent-hover', cfg.hover);
      root.style.setProperty('--accent-text', cfg.text);
      root.style.setProperty('--accent-glow', `rgba(${cfg.rgb}, 0.35)`);
      root.style.setProperty('--accent-border', `rgba(${cfg.rgb}, 0.45)`);
      root.style.setProperty('--accent-subtle', `rgba(${cfg.rgb}, 0.12)`);
    }
  }, [THEME_ACCENT_MAP]);

  useEffect(() => {
    applyThemeAccent(themeAccent);
  }, [themeAccent, applyThemeAccent]);

  // Quản lý trạng thái mở Panel Kết bạn & Lời mời cạnh phải
  const [isRightFriendshipPanelOpen, setIsRightFriendshipPanelOpen] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      setIsAuthModalOpen(true);
    }
  }, [user, isAuthLoading]);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [ghostMode, setGhostMode] = useState(false);

  // Tab điều hướng chính: 'social' (Xã Hội), 'friends' (Bạn Bè), 'chat' (Tin Nhắn), 'profile' (Tôi)
  const [activeTab, setActiveTab] = useState('social');
  const [radarDistance, setRadarDistance] = useState(3); // km: 1, 3, 5, 10, 'all'
  const [isAdjustingRadius, setIsAdjustingRadius] = useState(false);
  const [isRadarScanning, setIsRadarScanning] = useState(false);
  const [radarPingNotification, setRadarPingNotification] = useState(null);
  const [isQuickSnapOpen, setIsQuickSnapOpen] = useState(false);
  const [trollTargetUser, setTrollTargetUser] = useState(null);
  const [activeTakeoverMeme, setActiveTakeoverMeme] = useState(null);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [radarNotificationsHistory, setRadarNotificationsHistory] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [isMobileQrOpen, setIsMobileQrOpen] = useState(false);
  const [publicTunnelUrl, setPublicTunnelUrl] = useState('');
  const [isFriendshipManagerOpen, setIsFriendshipManagerOpen] = useState(false);
  const [pendingFriendRequests, setPendingFriendRequests] = useState([]);
  const lastSeenFriendRequestIdRef = useRef(new Set());
  const lastSeenNearbyPeerIdRef = useRef(new Set());
  const [incomingMessageToast, setIncomingMessageToast] = useState(null);
  const seenMessageIdsRef = useRef(new Set());

  // 3D Spatial Bump (Cụm ly khi gặp nhau < 15m)
  const [isBumpModalOpen, setIsBumpModalOpen] = useState(false);
  const [activeBumpData, setActiveBumpData] = useState(null);
  const [dismissedBumpPeerId, setDismissedBumpPeerId] = useState(null);

  // Tự động nhận diện đường link công khai Cloudflare Tunnel
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.origin.includes('trycloudflare.com')) {
      setPublicTunnelUrl(window.location.origin);
    } else {
      apiClient.getTunnelUrl().then(url => {
        if (url) setPublicTunnelUrl(url);
      });
    }
  }, []);

  // Story tương tác 3D & Hồ sơ khách
  const [selectedInteractiveStory, setSelectedInteractiveStory] = useState(null);
  const [selectedGuestProfile, setSelectedGuestProfile] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [myStoryReactions, setMyStoryReactions] = useState({});

  // Quản lý Modal Đăng Story khoảnh khắc
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userCustomStatus, setUserCustomStatus] = useState('');

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCreateCircleModalOpen, setIsCreateCircleModalOpen] = useState(false);
  const [isCreatePollModalOpen, setIsCreatePollModalOpen] = useState(false);
  const [isNavigationActive, setIsNavigationActive] = useState(false);
  const [navTarget, setNavTarget] = useState(null);
  const [callingState, setCallingState] = useState(null);

  // Lắng nghe Magic Link recovery
  useEffect(() => {
    if (window.location.hash.includes('type=recovery')) {
      setIsResetPasswordOpen(true);
    }
  }, []);

  // Cử chỉ vuốt từ mép trái màn hình sang phải để mở Camera Story (như Instagram)
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    const handleTouchStart = (e) => {
      if (e.touches && e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    };
    const handleTouchEnd = (e) => {
      if (e.changedTouches && e.changedTouches.length === 1) {
        const deltaX = e.changedTouches[0].clientX - startX;
        const deltaY = Math.abs(e.changedTouches[0].clientY - startY);
        // Vuốt từ mép trái (< 50px) sang phải (> 85px) với độ lệch dọc nhỏ
        if (startX < 50 && deltaX > 85 && deltaY < 65) {
          setIsCreateModalOpen(true);
        }
      }
    };
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Danh mục thể loại
  const categories = [
    { id: 'all', label: 'Tất cả', iconClass: 'bi-grid-fill' },
    { id: 'cafe', label: 'Cà phê', iconClass: 'bi-cup-hot-fill' },
    { id: 'moment', label: 'Khoảnh khắc', iconClass: 'bi-camera-reels-fill' }
  ];

  // Danh sách Stories thật từ người dùng (Không còn mock)
  const [stories, setStories] = useState([]);

  // Danh sách Bạn bè thật (Không còn mock)
  const [friends, setFriends] = useState([]);
  const [nearbyOnlinePeers, setNearbyOnlinePeers] = useState([]);

  // Nhóm riêng (Custom Circles) & Bộ lọc Nhóm trên Bản Đồ (Rule 9 GEMINI.md)
  const [customCircles, setCustomCircles] = useState([]);
  const [activeCircleFilter, setActiveCircleFilter] = useState(null);

  // Hội thoại chat thật tải từ server
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);

  // Định danh người dùng: CHỈ lấy ID khi đã đăng nhập, KHÔNG tự tạo client-xxx ngẫu nhiên
  const currentUserId = user?.id || null;

  // Tải danh sách hội thoại chuẩn từ database server
  const refreshConversations = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const serverConvs = await apiClient.getUserConversations(currentUserId);
      if (Array.isArray(serverConvs)) {
        setConversations(serverConvs);
        // Nạp toàn bộ ID tin nhắn hiện có vào seenMessageIdsRef để không bao giờ gửi lại thông báo cho tin nhắn cũ khi reload app
        serverConvs.forEach(c => {
          if (Array.isArray(c.messages)) {
            c.messages.forEach(m => {
              if (m.id) seenMessageIdsRef.current.add(m.id);
            });
          }
        });
      }
    } catch (e) {
      console.warn('[Conversations Sync] Error:', e.message);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      refreshConversations();
    }
  }, [currentUserId, refreshConversations]);

  // Mã người dùng duy nhất (VU-XXXX): Đọc trực tiếp từ tài khoản đăng nhập
  const currentUserCode = useMemo(() => {
    if (user?.user_metadata?.user_code) return user.user_metadata.user_code;
    if (user?.user_code) return user.user_code;
    return null;
  }, [user]);

  const currentUserName = useMemo(() => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'Khách VIVU';
  }, [user]);

  // Quản lý Avatar hiện tại: Gắn chặt theo tài khoản đang đăng nhập, ổn định 100% không render lại ngẫu nhiên
  const [customAvatar, setCustomAvatar] = useState(null);

  const currentUserAvatar = useMemo(() => {
    if (customAvatar) return customAvatar;
    if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
    if (user?.avatar_url) return user.avatar_url;
    return null; // Không dùng ảnh mẫu Unsplash, để null để hiển thị avatar nền trắng icon người
  }, [customAvatar, user]);

  // Thông báo tổng hợp (Lời mời kết bạn, chấp nhận, tương tác)
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Khởi tạo kết nối Socket.IO realtime
  const { socketRef, isConnected: isSocketConnected } = useSocket(currentUserId);

  // CÔ LẬP DỮ LIỆU: Khi đổi tài khoản hoặc đăng xuất, reset sạch toàn bộ state
  useEffect(() => {
    setFriends([]);
    setStories([]);
    setConversations([]);
    setActiveConversationId(null);
    setPendingFriendRequests([]);
    setNotifications([]);
    setUnreadNotificationsCount(0);
    setCustomAvatar(null);
    seenMessageIdsRef.current.clear();
    lastSeenFriendRequestIdRef.current.clear();
    lastSeenNearbyPeerIdRef.current.clear();
    setNearbyOnlinePeers([]);
  }, [user?.id]);

  // Tải danh sách thông báo và nhóm riêng khi người dùng đăng nhập
  useEffect(() => {
    if (!currentUserId) {
      setNotifications([]);
      setUnreadNotificationsCount(0);
      setCustomCircles([]);
      setActiveCircleFilter(null);
      return;
    }
    apiClient.getNotifications(currentUserId).then(data => {
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadNotificationsCount(data.filter(n => !n.read).length);
      }
    });
    apiClient.getCircles(currentUserId).then(circles => {
      if (Array.isArray(circles)) {
        setCustomCircles(circles);
      }
    });
  }, [currentUserId]);

  // LẮNG NGHE SỰ KIỆN SOCKET.IO REALTIME
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // 1. Đối phương offline tức thì (đóng tab/thoát link) -> Xóa ngay giọt nước và bubble khỏi Xã hội, chuyển sang chế độ ẩn ở Bạn bè
    const handleUserOffline = ({ userId }) => {
      console.log(`[Socket.IO Client] [OFFLINE] Đối phương đã thoát: ${userId}`);
      setNearbyOnlinePeers(prev => prev.filter(p => p.id !== userId));
      // Ở tab Xã Hội: Xóa giọt nước và story của người này khi họ offline
      setStories(prev => prev.filter(s => s.id !== `live-peer-${userId}` && s.hostId !== userId));
      // Ở tab Bạn Bè: Vẫn giữ bạn bè nhưng đánh dấu isOnline: false (Chế độ ẩn)
      setFriends(prev => prev.map(f => f.id === userId ? { ...f, isOnline: false } : f));
    };

    // 2. Tọa độ GPS peer cập nhật realtime
    const handlePeerUpdate = (peerData) => {
      if (!peerData || peerData.id === currentUserId) return;
      setNearbyOnlinePeers(prev => {
        const idx = prev.findIndex(p => p.id === peerData.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...peerData, isOnline: true };
          return updated;
        }
        return [...prev, { ...peerData, isOnline: true }];
      });
      setFriends(prev => prev.map(f => f.id === peerData.id ? { ...f, ...peerData, isOnline: true } : f));
    };

    // 3. Nhận thông báo mới realtime (Idempotent merge by notif.id & chống gửi lại tin đã đọc)
    const handleNotificationNew = (notif) => {
      setNotifications(prev => {
        const map = new Map(prev.map(n => [n.id, n]));
        map.set(notif.id, notif);
        const updated = Array.from(map.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setUnreadNotificationsCount(updated.filter(n => !n.read && n.status !== 'cancelled').length);
        return updated;
      });

      // CHỐNG GỬI LẠI THÔNG BÁO CHO TIN NHẮN ĐÃ ĐỌC:
      // Bỏ qua nếu thông báo đã đọc hoặc unread_count <= 0
      if (notif.read || (notif.unread_count != null && notif.unread_count <= 0)) {
        return;
      }

      // Bỏ qua nếu đang trực tiếp mở xem cuộc trò chuyện này
      if (notif.type === 'new_message' && notif.action_data?.conversationId) {
        if (activeTab === 'chat' && activeConversationId === notif.action_data.conversationId) {
          if (currentUserId) {
            apiClient.markMessagesAsRead(notif.action_data.conversationId, currentUserId);
          }
          return;
        }
      }

      playDingDongSound();

      // Hiển thị toast thông báo nổi
      setIncomingMessageToast({
        id: notif.id,
        senderName: notif.title || 'Thông báo mới',
        senderAvatar: notif.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        text: notif.body,
        isNotification: true,
        action: () => {
          if (notif.type === 'new_message' && notif.action_data?.conversationId) {
            setActiveConversationId(notif.action_data.conversationId);
            setActiveTab('chat');
          } else if (notif.type === 'friend_request') {
            setIsRightFriendshipPanelOpen(true);
          } else {
            setIsNotificationsDrawerOpen(true);
          }
        }
      });
    };

    // 4. Đồng bộ trạng thái thông báo realtime giữa các thiết bị
    const handleNotificationSync = (syncNotif) => {
      setNotifications(prev => {
        const map = new Map(prev.map(n => [n.id, n]));
        const existing = map.get(syncNotif.id);
        if (existing) {
          map.set(syncNotif.id, { ...existing, ...syncNotif });
        } else {
          map.set(syncNotif.id, syncNotif);
        }
        const updated = Array.from(map.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setUnreadNotificationsCount(updated.filter(n => !n.read && n.status !== 'cancelled').length);
        return updated;
      });
    };

    // 5. Xóa thông báo realtime khi bị hủy/từ chối
    const handleNotificationDeleted = ({ id, requestId }) => {
      setNotifications(prev => {
        const updated = prev.filter(n => {
          if (id && n.id === id) return false;
          if (requestId && n.action_data?.requestId === requestId) return false;
          return true;
        });
        setUnreadNotificationsCount(updated.filter(n => !n.read && n.status !== 'cancelled').length);
        return updated;
      });
    };

    // 6. Kết bạn thành công 2 chiều -> Cả 2 cùng nhận thông báo + cập nhật danh sách bạn bè
    const handleFriendAccepted = async ({ request, friendshipId }) => {
      playDingDongSound();
      confetti({ particleCount: 50, spread: 70 });
      if (currentUserId) {
        const [fl, reqs, notifs] = await Promise.all([
          apiClient.getFriendsList(currentUserId),
          apiClient.getFriendRequests(currentUserId),
          apiClient.getNotifications(currentUserId)
        ]);
        if (fl) setFriends(fl);
        if (reqs?.received) setPendingFriendRequests(reqs.received);
        if (Array.isArray(notifs)) {
          setNotifications(notifs);
          setUnreadNotificationsCount(notifs.filter(n => !n.read && n.status !== 'cancelled').length);
        }
      }
    };

    // 7. Nhận lời mời kết bạn mới
    const handleIncomingFriendRequest = (req) => {
      playDingDongSound();
      setPendingFriendRequests(prev => {
        if (prev.some(r => r.id === req.id)) return prev;
        return [req, ...prev];
      });
    };

    // 8. Hủy kết bạn
    const handleUnfriended = ({ userId }) => {
      setFriends(prev => prev.filter(f => f.id !== userId));
    };

    // 9. Đối phương đã đọc tin nhắn trong cuộc trò chuyện (Cập nhật Đã xem tức thì)
    const handleChatRead = ({ conversationId }) => {
      setConversations(prev => prev.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            messages: (c.messages || []).map(m => m.sender === 'me' ? { ...m, status: 'read' } : m)
          };
        }
        return c;
      }));
    };

    // 10. Sự kiện Cụm Ly 3D (Spatial Bump Trigger) từ Socket.IO
    const handleBumpTrigger = (bumpData) => {
      console.log('[Socket.IO Client] [BUMP] Nhận sự kiện Cụm Ly 3D:', bumpData);
      setActiveBumpData(bumpData);
      setIsBumpModalOpen(true);
      if (bumpData.story) {
        setStories(prev => {
          if (prev.some(s => s.id === bumpData.story.id)) return prev;
          return [bumpData.story, ...prev];
        });
      }
    };

    // 11. Sự kiện Lời mời vào nhóm mới từ bạn bè (CIRCLE:INVITE)
    const handleCircleInvite = (data) => {
      console.log('[Socket.IO Client] [CIRCLE:INVITE]', data);
      playDingDongSound();
      if (data?.circle) {
        setCustomCircles(prev => {
          if (prev.some(c => c.id === data.circle.id)) return prev;
          return [data.circle, ...prev];
        });
      }
    };

    // 12. Sự kiện Thành viên mới tham gia nhóm (CIRCLE:MEMBER_JOINED)
    const handleCircleMemberJoined = (data) => {
      console.log('[Socket.IO Client] [CIRCLE:MEMBER_JOINED]', data);
      if (data?.circle) {
        setCustomCircles(prev => prev.map(c => c.id === data.circle.id ? { ...c, ...data.circle } : c));
        setConversations(prev => prev.map(conv => {
          if (conv.id === data.circle.id || conv.circleId === data.circle.id) {
            return {
              ...conv,
              memberCount: (data.circle.member_ids || []).length,
              memberIds: data.circle.member_ids || []
            };
          }
          return conv;
        }));
      }
    };

    // 13. Sự kiện Thành viên rời nhóm (CIRCLE:MEMBER_LEFT)
    const handleCircleMemberLeft = (data) => {
      console.log('[Socket.IO Client] [CIRCLE:MEMBER_LEFT]', data);
      setCustomCircles(prev => prev.map(c => {
        if (c.id === data.circleId) {
          return {
            ...c,
            member_ids: (c.member_ids || []).filter(id => id !== data.leftUserId),
            owner_id: data.newOwnerId || c.owner_id
          };
        }
        return c;
      }));
    };

    // 14. Sự kiện Thành viên bị xóa khỏi nhóm (CIRCLE:MEMBER_KICKED)
    const handleCircleMemberKicked = (data) => {
      console.log('[Socket.IO Client] [CIRCLE:MEMBER_KICKED]', data);
      if (data.targetUserId === currentUserId) {
        setCustomCircles(prev => prev.filter(c => c.id !== data.circleId));
        setConversations(prev => prev.filter(c => c.id !== data.circleId && c.circleId !== data.circleId));
        setActiveCircleFilter(prev => prev?.id === data.circleId ? null : prev);
      } else {
        setCustomCircles(prev => prev.map(c => {
          if (c.id === data.circleId) {
            return {
              ...c,
              member_ids: (c.member_ids || []).filter(id => id !== data.targetUserId)
            };
          }
          return c;
        }));
      }
    };

    // 15. Sự kiện Giải tán nhóm (CIRCLE:DISBANDED)
    const handleCircleDisbanded = (data) => {
      console.log('[Socket.IO Client] [CIRCLE:DISBANDED]', data);
      setCustomCircles(prev => prev.filter(c => c.id !== data.circleId));
      setConversations(prev => prev.filter(c => c.id !== data.circleId && c.circleId !== data.circleId));
      setActiveCircleFilter(prev => prev?.id === data.circleId ? null : prev);
    };

    // 16. Sự kiện Cập nhật thông tin nhóm (CIRCLE:UPDATED)
    const handleCircleUpdated = (data) => {
      if (data?.circle) {
        setCustomCircles(prev => prev.map(c => c.id === data.circle.id ? { ...c, ...data.circle } : c));
        setConversations(prev => prev.map(conv => {
          if (conv.id === data.circle.id || conv.circleId === data.circle.id) {
            return {
              ...conv,
              name: data.circle.name,
              avatar: data.circle.image || conv.avatar
            };
          }
          return conv;
        }));
      }
    };

    socket.on('user:offline', handleUserOffline);
    socket.on('gps:peer-update', handlePeerUpdate);
    socket.on('notification:new', handleNotificationNew);
    socket.on('notification:sync', handleNotificationSync);
    socket.on('notification:deleted', handleNotificationDeleted);
    socket.on('friend:accepted', handleFriendAccepted);
    socket.on('friend-request:incoming', handleIncomingFriendRequest);
    socket.on('friend:unfriended', handleUnfriended);
    socket.on('chat:read', handleChatRead);
    socket.on('spatial:bump-trigger', handleBumpTrigger);
    socket.on('circle:invite', handleCircleInvite);
    socket.on('circle:member_joined', handleCircleMemberJoined);
    socket.on('circle:member_left', handleCircleMemberLeft);
    socket.on('circle:member_kicked', handleCircleMemberKicked);
    socket.on('circle:disbanded', handleCircleDisbanded);
    socket.on('circle:updated', handleCircleUpdated);

    return () => {
      socket.off('user:offline', handleUserOffline);
      socket.off('gps:peer-update', handlePeerUpdate);
      socket.off('notification:new', handleNotificationNew);
      socket.off('notification:sync', handleNotificationSync);
      socket.off('notification:deleted', handleNotificationDeleted);
      socket.off('friend:accepted', handleFriendAccepted);
      socket.off('friend-request:incoming', handleIncomingFriendRequest);
      socket.off('friend:unfriended', handleUnfriended);
      socket.off('chat:read', handleChatRead);
      socket.off('spatial:bump-trigger', handleBumpTrigger);
      socket.off('circle:invite', handleCircleInvite);
      socket.off('circle:member_joined', handleCircleMemberJoined);
      socket.off('circle:member_left', handleCircleMemberLeft);
      socket.off('circle:member_kicked', handleCircleMemberKicked);
      socket.off('circle:disbanded', handleCircleDisbanded);
      socket.off('circle:updated', handleCircleUpdated);
    };
  }, [socketRef.current, currentUserId]);

  // Hành động thao tác thông báo
  const handleMarkNotificationRead = async (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
    await apiClient.markNotificationAsRead(notifId);
  };

  const handleMarkAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadNotificationsCount(0);
    if (currentUserId) {
      await apiClient.markAllNotificationsAsRead(currentUserId);
    }
  };

  const handleAcceptFriendRequestFromNotification = async (requestId, fromUserId) => {
    if (!currentUserId) return;
    const res = await apiClient.acceptFriendRequest(requestId, currentUserId);
    if (res?.success) {
      confetti({ particleCount: 60, spread: 80 });
      const [fl, reqs, notifs] = await Promise.all([
        apiClient.getFriendsList(currentUserId),
        apiClient.getFriendRequests(currentUserId),
        apiClient.getNotifications(currentUserId)
      ]);
      if (fl) setFriends(fl);
      if (reqs?.received) setPendingFriendRequests(reqs.received);
      if (Array.isArray(notifs)) {
        setNotifications(notifs);
        setUnreadNotificationsCount(notifs.filter(n => !n.read).length);
      }
    }
  };

  const handleRejectFriendRequestFromNotification = async (requestId) => {
    if (!currentUserId) return;
    await apiClient.rejectFriendRequest(requestId, currentUserId);
    const reqs = await apiClient.getFriendRequests(currentUserId);
    if (reqs?.received) setPendingFriendRequests(reqs.received);
  };

  const handleDeleteNotification = async (notifId) => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
    await apiClient.deleteNotification(notifId);
  };


  // Rule 11: Đọc an toàn GPS thiết bị thực tế (Không dùng Đà Nẵng mặc định)
  const userLng = location?.lng ?? location?.longitude ?? null;
  const userLat = location?.lat ?? location?.latitude ?? null;

  // Tính tọa độ cho story & bạn bè (Tự động loại bỏ story đã hết hạn - Feature 3)
  const liveStories = useMemo(() => {
    const now = Date.now();
    return stories
      .filter(s => {
        if (!s.expires_at) return true;
        return new Date(s.expires_at).getTime() > now;
      })
      .map(s => ({
        ...s,
        realLat: s.realLat != null ? s.realLat : (userLat != null ? Number((userLat + (s.latOffset || 0)).toFixed(6)) : null),
        realLng: s.realLng != null ? s.realLng : (userLng != null ? Number((userLng + (s.lngOffset || 0)).toFixed(6)) : null)
      }));
  }, [stories, userLat, userLng]);

  const myActiveStory = useMemo(() => {
    return liveStories.find(s => {
      if (!s) return false;
      if (currentUserId && (s.hostId === currentUserId || s.id === currentUserId || s.host_id === currentUserId)) return true;
      if (s.isOwnerStory === true) return true;
      return false;
    }) || null;
  }, [liveStories, currentUserId]);

  const liveFriends = useMemo(() => {
    return friends.map(f => ({
      ...f,
      realLat: f.realLat != null ? f.realLat : (userLat != null ? Number((userLat + (f.latOffset || 0)).toFixed(6)) : null),
      realLng: f.realLng != null ? f.realLng : (userLng != null ? Number((userLng + (f.lngOffset || 0)).toFixed(6)) : null)
    }));
  }, [friends, userLat, userLng]);

  // Nhận diện tài khoản đối phương đang đứng cùng tọa độ (< 60m)
  const coLocatedPeer = useMemo(() => {
    if (!userLat || !userLng || !Array.isArray(nearbyOnlinePeers)) return null;
    return nearbyOnlinePeers.find(p => {
      const pLat = Number(p.lat);
      const pLng = Number(p.lng);
      if (isNaN(pLat) || isNaN(pLng)) return false;
      const R = 6371;
      const dLat = (pLat - userLat) * (Math.PI / 180);
      const dLon = (pLng - userLng) * (Math.PI / 180);
      const a = Math.sin(dLat / 2)**2 + Math.cos(userLat * Math.PI / 180) * Math.cos(pLat * Math.PI / 180) * Math.sin(dLon / 2)**2;
      const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return distKm < 0.06;
    });
  }, [nearbyOnlinePeers, userLat, userLng]);

  // Danh sách CHỈ CHỨA các BẠN BÈ THỰC SỰ ĐANG ONLINE cho tính năng Cụng Ly (Không dành cho người lạ)
  const allNearbyOnlineFriends = useMemo(() => {
    if (!Array.isArray(friends) || friends.length === 0) return [];

    // Map các tài khoản online thời gian thực đã được server ghi nhận
    const onlinePeerMap = new Map();
    if (Array.isArray(nearbyOnlinePeers)) {
      for (const p of nearbyOnlinePeers) {
        if (p.id && (p.is_online === true || p.isOnline === true)) {
          onlinePeerMap.set(p.id, p);
        }
      }
    }

    const friendList = [];
    for (const f of friends) {
      if (!f || !f.id || f.id === currentUserId) continue;

      // CHỈ XÉT NHỮNG NGƯỜI ĐÃ LÀ BẠN BÈ VÀ ĐANG ONLINE
      const isOnline = f.isOnline === true || f.is_online === true || onlinePeerMap.has(f.id);
      if (!isOnline) continue;

      const onlineData = onlinePeerMap.get(f.id);
      const actualLat = onlineData?.lat ?? (f.realLat != null ? f.realLat : f.lat);
      const actualLng = onlineData?.lng ?? (f.realLng != null ? f.realLng : f.lng);

      if (typeof actualLat === 'number' && typeof actualLng === 'number' && !isNaN(actualLat) && !isNaN(actualLng)) {
        friendList.push({
          ...f,
          ...(onlineData || {}),
          isOnline: true,
          isFriend: true,
          realLat: Number(actualLat),
          realLng: Number(actualLng)
        });
      }
    }

    return friendList;
  }, [friends, nearbyOnlinePeers, currentUserId]);

  const handleInitiateBump = useCallback((friend) => {
    if (!friend) return;
    const socket = socketRef.current;
    const safeLat = userLat ?? 10.7769;
    const safeLng = userLng ?? 106.7009;

    const payload = {
      targetUserId: friend.id,
      targetName: friend.name || friend.full_name || 'Bạn bè',
      targetAvatar: friend.avatar || friend.avatar_url,
      senderName: currentUserName,
      senderAvatar: currentUserAvatar,
      lat: safeLat,
      lng: safeLng
    };

    if (socket && socket.connected) {
      socket.emit('spatial:bump-initiate', payload);
    } else {
      // Local fallback
      setActiveBumpData({
        initiatorId: currentUserId,
        initiatorName: currentUserName,
        initiatorAvatar: currentUserAvatar,
        targetUserId: friend.id,
        targetName: friend.name || friend.full_name,
        targetAvatar: friend.avatar || friend.avatar_url,
        isInitiator: true
      });
      setIsBumpModalOpen(true);
    }
  }, [currentUserId, currentUserName, currentUserAvatar, userLat, userLng, socketRef]);

  // Quét cự ly siêu gần (< 15m) & Cảm biến Lắc Điện Thoại (Shake-to-Bump) - CHỈ DÀNH CHO BẠN BÈ ĐANG ONLINE
  const { nearbyFriend, nearbyDistanceMeters } = useProximityDetector({
    userLat,
    userLng,
    friends: allNearbyOnlineFriends.filter(p => p.id !== dismissedBumpPeerId),
    onTriggerBump: handleInitiateBump
  });



  // ĐỒNG BỘ GPS THỜI GIAN THỰC ĐA THIẾT BỊ (CHỈ DÀNH CHO TÀI KHOẢN ĐÃ ĐĂNG KÝ)
  // Chỉ tài khoản đã đăng nhập mới phát sóng GPS lên server và nhìn thấy nhau trên Bản đồ
  useEffect(() => {
    if (!userLat || !userLng || !currentUserId) return;

    let isMounted = true;

    const syncHeartbeat = async () => {
      // NẾU TAB ĐANG BỊ ẨN HOẶC KHÓA MÀN HÌNH -> KHÔNG PHÁT SÓNG GPS ĐỂ TRÁNH GIỮ ONLINE ẢO
      if (document.hidden) return;

      try {
        // 1. CHỈ gửi toạ độ thực lên server khi đã đăng nhập (currentUserId hợp lệ)
        if (currentUserId && currentUserId.startsWith('user-')) {
          await apiClient.updateGps(
            currentUserId,
            userLat,
            userLng,
            userCustomStatus,
            currentUserName,
            currentUserAvatar,
            currentUserCode
          );
        }

        // 2. Kéo danh sách toàn bộ các tài khoản đã đăng ký đang online
        const profiles = await apiClient.getProfiles();
        if (!isMounted || !Array.isArray(profiles)) return;

        // CHỈ LẤY CÁC TÀI KHOẢN ĐÃ ĐĂNG KÝ VÀ ĐANG THỰC SỰ ONLINE (is_online === true)
        const onlineOtherProfiles = profiles.filter(p => {
          return p.id && p.id !== currentUserId && p.id.startsWith('user-') && p.lat != null && p.lng != null && p.is_online === true;
        });

        const activePeerIds = new Set(onlineOtherProfiles.map(p => p.id));
        setNearbyOnlinePeers(onlineOtherProfiles);

        // Thông báo thời gian thực khi phát hiện người dùng thật đang trực tuyến kề bên
        onlineOtherProfiles.forEach(p => {
          if (!lastSeenNearbyPeerIdRef.current.has(p.id)) {
            lastSeenNearbyPeerIdRef.current.add(p.id);
            playMessageNotificationSound();
            const pName = p.full_name || p.name || 'Người dùng VIVU';
            setIncomingMessageToast({
              id: `peer-toast-${p.id}`,
              senderName: pName,
              senderAvatar: p.avatar_url || p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              text: `Đang trực tuyến gần bạn (${p.user_code || ''})! Nhấn để xem vị trí.`,
              isFriendRequest: false,
              action: () => {
                if (window.__vivu_map) {
                  window.__vivu_map.flyTo({
                    center: [Number(p.lng), Number(p.lat)],
                    zoom: 16.5,
                    pitch: 35,
                    duration: 900
                  });
                }
              }
            });
          }
        });

        // 3. KÉO DANH SÁCH BẠN BÈ THẬT SỰ CỦA CHÍNH TÀI KHOẢN NÀY TỪ DATABASE
        if (currentUserId && currentUserId.startsWith('user-')) {
          try {
            const acceptedFriends = await apiClient.getFriendsList(currentUserId);
            if (Array.isArray(acceptedFriends)) {
              const mappedFriends = acceptedFriends.map(af => {
                const livePeer = profiles.find(p => p.id === af.id);
                const isPeerOnline = livePeer ? (livePeer.is_online === true) : false;
                return {
                  ...af,
                  realLat: livePeer?.lat != null ? Number(livePeer.lat) : af.lat,
                  realLng: livePeer?.lng != null ? Number(livePeer.lng) : af.lng,
                  isOnline: isPeerOnline,
                  battery: livePeer?.battery || '95%',
                  lastSeenLocation: livePeer?.custom_status || af.custom_status || (isPeerOnline ? 'Đang hoạt động' : 'Đã offline'),
                  title: livePeer?.custom_status || af.custom_status || 'Bạn bè VIVU',
                  userCode: livePeer?.user_code || af.user_code || ''
                };
              });
              setFriends(mappedFriends);
            }
          } catch (fErr) {
            console.warn('[Friends Sync Error]:', fErr?.message);
          }
        } else {
          setFriends([]);
        }

        // 4. Đồng bộ các nick online vào Mapbox Stories & LOẠI BỎ TRIỆT ĐỂ MỌI GHIM OFFLINE
        setStories(prevStories => {
          let hasChange = false;
          // Loại bỏ toàn bộ ghim live-peer- hoặc story của tài khoản đã offline khỏi Tab Xã Hội
          let updated = prevStories.filter(s => {
            // BẢO VỆ STORY CỦA CHÍNH MÌNH (Không bao giờ bị xóa khỏi radar của mình)
            if (s.hostId === currentUserId || s.isOwnerStory || (s.userCode && s.userCode === currentUserCode)) {
              return true;
            }
            if (s.id?.startsWith('live-peer-')) {
              if (!s.hostId || !s.hostId.startsWith('user-') || !activePeerIds.has(s.hostId)) {
                hasChange = true;
                return false;
              }
            } else if (s.hostId && s.hostId.startsWith('user-')) {
              if (!activePeerIds.has(s.hostId)) {
                hasChange = true;
                return false;
              }
            }
            return true;
          });

          onlineOtherProfiles.forEach(p => {
            const pLat = Number(p.lat);
            const pLng = Number(p.lng);
            const pName = p.full_name || p.name || 'Người dùng VIVU';
            const pAvatar = p.avatar_url || p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
            const pStatus = p.custom_status || 'Đang trực tuyến gần bạn';
            const sId = `live-peer-${p.id}`;
            const existingIdx = updated.findIndex(s => s.id === sId || s.hostId === p.id);
            if (existingIdx >= 0) {
              const cur = updated[existingIdx];
              if (cur.realLat !== pLat || cur.realLng !== pLng || cur.hostAvatar !== pAvatar || cur.hostName !== pName) {
                hasChange = true;
                updated[existingIdx] = {
                  ...cur,
                  hostName: pName,
                  hostAvatar: pAvatar,
                  title: pStatus,
                  realLat: pLat,
                  realLng: pLng,
                  userCode: p.user_code || '',
                  isOnline: true
                };
              }
            } else {
              hasChange = true;
              updated.unshift({
                id: sId,
                hostId: p.id,
                hostName: pName,
                hostAvatar: pAvatar,
                title: pStatus,
                description: `Đang trực tuyến (${p.user_code || ''})`,
                address: 'Gần vị trí của Bạn',
                distanceText: 'Cách bạn vài mét',
                realLat: pLat,
                realLng: pLng,
                privacy: 'public',
                userCode: p.user_code || '',
                isOnline: true
              });
            }
          });
          return hasChange ? updated : prevStories;
        });


          // Đồng bộ trạng thái online và avatar cho các hội thoại 1-1
          setConversations(prevConvs => {
            let updatedConvs = [...prevConvs];
            let convChanged = false;

            onlineOtherProfiles.forEach(p => {
              const pName = p.full_name || p.name || 'Người dùng VIVU';
              const pAvatar = p.avatar_url || p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
              const directConvId = apiClient.getDirectConversationId(currentUserId, p.id);
              const existingIdx = updatedConvs.findIndex(c => c.id === directConvId || c.friendId === p.id);

              if (existingIdx >= 0) {
                const cur = updatedConvs[existingIdx];
                if (!cur.online || cur.name !== pName || cur.avatar !== pAvatar) {
                  convChanged = true;
                  updatedConvs[existingIdx] = {
                    ...cur,
                    id: directConvId,
                    name: pName,
                    avatar: pAvatar,
                    online: true
                  };
                }
              }
            });

            return convChanged ? updatedConvs : prevConvs;
          });

        // 3. Đồng bộ các Story thực sự từ Backend Server nếu có bài đăng mới
        try {
          const remoteStories = await apiClient.getStories();
          if (Array.isArray(remoteStories)) {
            // Cập nhật activeStory vào danh sách bạn bè
            setFriends(prevFriends => {
              return prevFriends.map(f => {
                const friendStory = remoteStories.find(rs => 
                  (rs.host_id && rs.host_id === f.id) || 
                  (rs.user_code && rs.user_code === f.user_code) || 
                  (rs.host_name && (rs.host_name === f.name || rs.host_name === f.full_name))
                );
                return {
                  ...f,
                  activeStory: friendStory || f.activeStory || null
                };
              });
            });

            // Gộp Story vào danh sách Stories (Hợp nhất theo Rule 30)
            setStories(prevStories => {
              let updated = [...prevStories];
              let hasNew = false;
              remoteStories.forEach(rs => {
                // Kiểm tra xem bài Story này có thuộc về một tài khoản đã có giọt nước hay không
                const peerIdx = updated.findIndex(s => 
                  (rs.host_id && (s.hostId === rs.host_id || s.id === `live-peer-${rs.host_id}`)) ||
                  (rs.user_code && s.userCode && s.userCode === rs.user_code) ||
                  (rs.host_name && (s.hostName === rs.host_name || s.name === rs.host_name))
                );

                if (peerIdx >= 0) {
                  // ĐÃ TỒN TẠI GIỌT NƯỚC CỦA NGƯỜI NÀY -> HỢP NHẤT VÀO 1 GIỌT NƯỚC DUY NHẤT (Rule 30)
                  const cur = updated[peerIdx];
                  if (!cur.activeStory || cur.activeStory.id !== rs.id) {
                    hasNew = true;
                    updated[peerIdx] = {
                      ...cur,
                      activeStory: rs,
                      storyTitle: rs.title,
                      storyDescription: rs.description,
                      category: rs.category || cur.category || 'moment',
                      image: rs.image || cur.image || null,
                      music: rs.music || cur.music || null,
                      video: rs.video || cur.video || null,
                      title: rs.title || cur.title
                    };
                  }
                } else {
                  // Nếu là bài story của chính mình HOẶC của người khác đang online
                  const isOwnerStory = rs.host_id === currentUserId || (currentUserCode && rs.user_code === currentUserCode);
                  const isHostOnline = isOwnerStory || (rs.host_id && activePeerIds.has(rs.host_id));
                  if (isHostOnline) {
                    const sId = rs.id || `remote-${rs.created_at}`;
                    if (!updated.some(s => s.id === sId)) {
                      hasNew = true;
                      updated.unshift({
                        id: sId,
                        hostId: rs.host_id || null,
                        userCode: rs.user_code || '',
                        hostName: rs.host_name,
                        hostAvatar: rs.host_avatar,
                        activeStory: rs,
                        isOwnerStory: isOwnerStory,
                        category: rs.category || 'moment',
                        title: rs.title,
                        description: rs.description,
                        address: rs.address || 'Quanh đây',
                        realLat: rs.lat,
                        realLng: rs.lng,
                        image: rs.image || null,
                        dual_image: rs.dual_image || null,
                        texts: rs.texts || [],
                        stickers: rs.stickers || [],
                        music: rs.music || null,
                        video: rs.video || null,
                        privacy: rs.privacy || 'public',
                        isOnline: true
                      });
                    }
                  }
                }
              });
              return hasNew ? updated : prevStories;
            });
          }
        } catch (storyErr) {
          // Im lặng nếu mạng bận
        }

        // 4. Định kỳ đồng bộ Lời mời kết bạn đến thời gian thực
        try {
          const reqs = await apiClient.getFriendRequests(currentUserId);
          if (reqs && Array.isArray(reqs.received)) {
            setPendingFriendRequests(reqs.received);
            reqs.received.forEach(req => {
              if (!lastSeenFriendRequestIdRef.current.has(req.id)) {
                lastSeenFriendRequestIdRef.current.add(req.id);
                playMessageNotificationSound();
                setIncomingMessageToast({
                  id: `fr-toast-${req.id}`,
                  senderName: req.senderName || 'Người dùng VIVU',
                  senderAvatar: req.senderAvatar,
                  text: 'Đã gửi cho bạn một lời mời kết bạn! Nhấn để xem.',
                  isFriendRequest: true,
                  action: () => setIsFriendshipManagerOpen(true)
                });
              }
            });
          }
        } catch (frErr) {
          // Im lặng nếu mạng bận
        }
      } catch (syncErr) {
        console.warn('[VIVU Heartbeat Sync] Status:', syncErr?.message);
      }
    };

    // Chạy đồng bộ ngay lập tức
    syncHeartbeat();

    // Vòng lặp định kỳ mỗi 3.5 giây
    const heartbeatTimer = setInterval(syncHeartbeat, 3500);

    // Lắng nghe sự kiện người dùng ẩn tab / khóa màn hình hoặc mở lại tab
    const handleVisibilityOrFocus = () => {
      if (document.hidden) {
        if (currentUserId) {
          apiClient.setOffline(currentUserId);
        }
      } else {
        syncHeartbeat();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      isMounted = false;
      clearInterval(heartbeatTimer);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [user?.id, user?.email, user?.user_metadata, userLat, userLng, userCustomStatus, currentUserId, currentUserName, currentUserAvatar]);

  // LẮNG NGHE & ĐỒNG BỘ TIN NHẮN THỜI GIAN THỰC (REALTIME CHAT POLLING)
  // Giúp 2 thiết bị (PC & Điện thoại) nhận tin nhắn tức thì của nhau trong phòng chat
  useEffect(() => {
    if (!activeConversationId) return;

    let isMounted = true;
    const pollMessages = async () => {
      try {
        const serverMsgs = await apiClient.getMessages(activeConversationId);
        if (!isMounted || !Array.isArray(serverMsgs)) return;

        setConversations(prevConvs => {
          const convIdx = prevConvs.findIndex(c => c.id === activeConversationId);
          if (convIdx < 0) return prevConvs;

          const curConv = prevConvs[convIdx];
          const curMessages = curConv.messages || [];

          let hasNewIncoming = false;
          const formattedServerMsgs = serverMsgs.map(m => {
            const isMe = m.sender === currentUserId || m.sender === 'me';
            const wasPresent = curMessages.some(old => old.id === m.id || (m.client_msg_id && old.client_msg_id === m.client_msg_id));
            if (!isMe && !wasPresent) {
              hasNewIncoming = true;
            }
            return {
              id: m.id || m.client_msg_id,
              client_msg_id: m.client_msg_id,
              sender: isMe ? 'me' : 'them',
              senderName: m.sender_name || (isMe ? 'Bạn' : curConv.name),
              text: m.text || '',
              image: m.image || null,
              video: m.video || null,
              isHeart: Boolean(m.is_heart || m.isHeart || m.text === '❤️'),
              isLocation: Boolean(m.is_location || m.isLocation),
              lat: m.lat,
              lng: m.lng,
              time: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'
            };
          });

          if (formattedServerMsgs.length > 0 && (formattedServerMsgs.length !== curMessages.length || hasNewIncoming)) {
            if (hasNewIncoming) {
              playDingDongSound();
            }
            const updated = [...prevConvs];
            const lastM = formattedServerMsgs[formattedServerMsgs.length - 1];
            updated[convIdx] = {
              ...curConv,
              lastMessage: lastM ? (lastM.text || (lastM.image ? 'Đã gửi hình ảnh' : lastM.isLocation ? 'Đã chia sẻ vị trí' : 'Tin nhắn mới')) : curConv.lastMessage,
              messages: formattedServerMsgs
            };
            return updated;
          }
          return prevConvs;
        });
      } catch (e) {
        console.warn('[Message Poll Error]:', e);
      }
    };

    pollMessages();
    const msgInterval = setInterval(pollMessages, 1500);

    return () => {
      isMounted = false;
      clearInterval(msgInterval);
    };
  }, [activeConversationId, currentUserId]);

  // THÔNG BÁO TIN NHẮN ĐẾN TOÀN CỤC (GLOBAL INBOX NOTIFICATION LISTENER)
  // Giúp người dùng dù đang ở bất kỳ màn hình nào (Bản đồ, Xã hội, Bạn bè, Tôi)
  // cũng nhận được thông báo nổi + âm thanh tin nhắn "Ting-Ting" riêng biệt khi có người nhắn tới!
  useEffect(() => {
    if (!currentUserId) return;

    let isMounted = true;
    const checkGlobalInbox = async () => {
      try {
        const inboxMsgs = await apiClient.getInboxMessages(currentUserId);
        if (!isMounted || !Array.isArray(inboxMsgs) || inboxMsgs.length === 0) return;

        inboxMsgs.forEach(msg => {
          // Bỏ qua tin nhắn do chính mình gửi hoặc tin nhắn đã đọc
          if (msg.sender === currentUserId || msg.sender === 'me' || msg.status === 'read') return;

          // Nếu tin nhắn này chưa từng thông báo
          if (!seenMessageIdsRef.current.has(msg.id)) {
            seenMessageIdsRef.current.add(msg.id);

            // Cập nhật cuộc hội thoại và đánh dấu unread
            setConversations(prevConvs => {
              const directConvId = msg.conversation_id;
              const idx = prevConvs.findIndex(c => c.id === directConvId);
              const previewText = msg.text || (msg.image ? 'Đã gửi hình ảnh' : msg.video ? 'Đã gửi video' : msg.is_location ? 'Đã chia sẻ vị trí GPS' : 'Tin nhắn mới');
              const isViewingThisConv = activeTab === 'chat' && activeConversationId === directConvId;
              
              if (idx >= 0) {
                const cur = prevConvs[idx];
                const updated = [...prevConvs];
                const msgExists = cur.messages?.some(m => m.id === msg.id || (m.text === msg.text && Math.abs(new Date(m.time).getTime() - Date.now()) < 5000));
                const incomingItem = {
                  id: msg.id || `msg-${Date.now()}`,
                  sender: msg.sender === currentUserId ? 'me' : 'them',
                  senderName: msg.sender_name || cur.name,
                  text: msg.text,
                  image: msg.image,
                  video: msg.video,
                  isLocation: msg.is_location,
                  lat: msg.lat,
                  lng: msg.lng,
                  time: 'Vừa xong'
                };
                updated[idx] = {
                  ...cur,
                  lastMessage: previewText,
                  time: 'Vừa xong',
                  unread: isViewingThisConv ? false : true,
                  messages: msgExists ? cur.messages : [...(cur.messages || []), incomingItem]
                };
                return updated;
              } else {
                // Người gửi chưa có cuộc trò chuyện trước đó -> Thêm mới vào danh sách
                // Kiểm tra xem người này có trong danh sách bạn bè không
                const isFriend = friends.some(f => f.id === msg.sender || f.name === msg.sender_name);
                const newStrangerMsg = {
                  id: msg.id || `msg-${Date.now()}`,
                  sender: 'other',
                  senderName: msg.sender_name || 'Người dùng VIVU',
                  text: msg.text,
                  image: msg.image,
                  video: msg.video,
                  isLocation: msg.is_location,
                  lat: msg.lat,
                  lng: msg.lng,
                  time: 'Vừa xong'
                };
                const newConv = {
                  id: directConvId,
                  name: msg.sender_name || 'Người dùng VIVU',
                  avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(msg.sender || 'user')}`,
                  type: 'direct',
                  friendId: msg.sender,
                  online: true,
                  isStranger: !isFriend,
                  hasReplied: false,
                  lastMessage: previewText,
                  time: 'Vừa xong',
                  unread: isViewingThisConv ? false : true,
                  messages: [newStrangerMsg]
                };
                return [newConv, ...prevConvs];
              }
            });

            // Nếu người dùng KHÔNG đang xem trực tiếp cuộc trò chuyện này -> Phát âm thanh chuông tin nhắn và hiện Toast nổi!
            const isViewingThisChat = activeTab === 'chat' && activeConversationId === msg.conversation_id;
            if (!isViewingThisChat) {
              playMessageNotificationSound();
              setIncomingMessageToast({
                id: msg.id,
                conversationId: msg.conversation_id,
                senderName: msg.sender_name || 'Bạn bè VIVU',
                senderAvatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(msg.sender || 'user')}`,
                text: msg.text || (msg.is_location ? 'Đã chia sẻ vị trí GPS với bạn' : msg.image ? 'Đã gửi cho bạn một hình ảnh' : 'Đã gửi tin nhắn mới'),
                time: 'Vừa xong'
              });
              setTimeout(() => {
                setIncomingMessageToast(null);
              }, 6000);
            }
          }
        });
      } catch (err) {
        // Im lặng nếu mạng bận
      }
    };

    const inboxInterval = setInterval(checkGlobalInbox, 2500);
    return () => {
      isMounted = false;
      clearInterval(inboxInterval);
    };
  }, [currentUserId, activeTab, activeConversationId]);

  // ĐỒNG BỘ THỜI GIAN THỰC TIN NHẮN 2 CHIỀU KHI ĐANG MỞ PHÒNG CHAT (POLLING 1.5s)
  useEffect(() => {
    if (!activeConversationId) return;

    let isMounted = true;
    const fetchChatMessages = async () => {
      try {
        const msgs = await apiClient.getMessages(activeConversationId);
        if (!isMounted || !Array.isArray(msgs)) return;

        setConversations(prevConvs => {
          return prevConvs.map(c => {
            if (c.id === activeConversationId) {
              const mapped = msgs.map(m => ({
                id: m.id || m.client_msg_id,
                client_msg_id: m.client_msg_id,
                sender: (m.sender === currentUserId || m.sender === 'me') ? 'me' : 'them',
                senderName: m.sender_name || (m.sender === currentUserId ? 'Bạn' : c.name),
                text: m.text || '',
                image: m.image,
                video: m.video,
                isHeart: Boolean(m.is_heart || m.isHeart || m.text === '❤️'),
                isLocation: Boolean(m.is_location || m.isLocation),
                lat: m.lat,
                lng: m.lng,
                time: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'
              }));
              const lastM = mapped[mapped.length - 1];
              return {
                ...c,
                unread: false,
                lastMessage: lastM ? (lastM.isHeart || lastM.text === '❤️' ? '❤️ Đã thả một trái tim' : lastM.image ? 'Đã gửi hình ảnh' : lastM.video ? 'Đã gửi video' : lastM.isLocation ? '📍 Đã chia sẻ vị trí GPS' : lastM.text || 'Tin nhắn mới') : c.lastMessage,
                messages: mapped
              };
            }
            return c;
          });
        });
      } catch (e) {
        // Im lặng
      }
    };

    fetchChatMessages();
    const chatInterval = setInterval(fetchChatMessages, 1500);
    return () => {
      isMounted = false;
      clearInterval(chatInterval);
    };
  }, [activeConversationId, currentUserId]);

  // CẬP NHẬT ẢNH ĐẠI DIỆN HỒ SƠ & ĐỒNG BỘ TỨC THÌ LÊN GIỌT NƯỚC BẢN ĐỒ VÀ MÁY KHÁC
  const handleDirectUpdateAvatar = async (newAvatar, newPhotos) => {
    // 1. Cập nhật state cục bộ ngay lập tức để giọt nước đổi avatar tức thì
    setActiveUserAvatar(newAvatar);
    safeSetItem('vivu_user_avatar', newAvatar);

    // Cập nhật ngay ảnh đại diện cho các Story chính chủ đang hiển thị
    setStories(prev => prev.map(s => {
      if (s.hostId === currentUserId || s.isOwnerStory) {
        return { ...s, hostAvatar: newAvatar };
      }
      return s;
    }));

    // 2. Cập nhật vào Auth Profile & Metadata
    try {
      await updateProfile({
        fullName: currentUserName,
        avatarUrl: newAvatar,
        customStatus: userCustomStatus,
        photos: newPhotos
      });
    } catch (e) {
      console.warn('Lỗi lưu auth profile:', e);
    }

    // 3. Phát sóng tức thì tọa độ kèm Avatar mới lên Backend Server
    try {
      await apiClient.updateGps(
        currentUserId,
        userLat,
        userLng,
        userCustomStatus,
        currentUserName,
        newAvatar,
        currentUserCode
      );
    } catch (e) {
      console.warn('Lỗi broadcast GPS avatar:', e);
    }

    confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
  };

  // Quét Radar thủ công
  const handleTriggerRadarScan = () => {
    setIsRadarScanning(true);
    setTimeout(() => {
      setIsRadarScanning(false);
      const targetList = activeTab === 'friends' ? liveFriends : liveStories;
      if (targetList.length > 0) {
        const topItem = targetList[0];
        setRadarPingNotification({
          title: activeTab === 'friends' ? 'Radar phát hiện bạn bè gần bạn' : 'Radar phát hiện bài đăng mới',
          subtitle: `${topItem.hostName || topItem.name} vừa xuất hiện trong bán kính quét`,
          item: topItem
        });
        playDingDongSound();
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.2 } });
        setTimeout(() => setRadarPingNotification(null), 5000);
      }
    }, 1200);
  };

  // Thả phản ứng cảm xúc Story
  const handleStoryReaction = (storyId, reactionType) => {
    setMyStoryReactions(prev => ({
      ...prev,
      [storyId]: reactionType
    }));
    confetti({ particleCount: 35, spread: 45 });
    apiClient.reactStory(storyId, reactionType, currentUserId);
  };

  // Bình chọn Poll trên Story
  const handleVoteStoryPoll = (storyId, pollId, optionIndex) => {
    apiClient.voteStoryPoll(storyId, pollId, optionIndex, currentUserId);
    setStories(prev => prev.map(s => {
      if (s.id !== storyId) return s;
      const updatedStickers = (s.stickers || []).map(st => {
        if (st.id !== pollId || st.type !== 'poll') return st;
        const v0 = (st.votes?.[0] || []).filter(u => u !== currentUserId);
        const v1 = (st.votes?.[1] || []).filter(u => u !== currentUserId);
        if (optionIndex === 0) v0.push(currentUserId);
        if (optionIndex === 1) v1.push(currentUserId);
        return { ...st, votes: { 0: v0, 1: v1 } };
      });
      return { ...s, stickers: updatedStickers };
    }));
  };

  // Trả lời hộp Q&A trên Story
  const handleReplyStoryQA = (storyId, qaId, prompt, text) => {
    const targetStory = stories.find(s => s.id === storyId);
    apiClient.replyStoryQA(storyId, qaId, prompt, text, {
      id: currentUserId,
      name: currentUserName,
      avatar: currentUserAvatar
    });

    if (targetStory) {
      handleStoryDirectChat(targetStory, `[Câu hỏi Q&A: "${prompt}"]: ${text}`);
    }
  };

  // Nhắn tin trực tiếp từ Story hoặc Hồ sơ khách
  const handleStoryDirectChat = (story, replyText = null) => {
    setSelectedInteractiveStory(null);
    setSelectedGuestProfile(null);
    const hostName = story.hostName || story.host_name || story.name;
    const hostAvatar = story.hostAvatar || story.host_avatar || story.avatar;
    const peerId = story.hostId || story.host_id || story.id;
    const directConvId = peerId ? apiClient.getDirectConversationId(currentUserId, peerId) : `conv-${Date.now()}`;

    let conv = conversations.find(c => c.id === directConvId || c.name === hostName || (peerId && c.friendId === peerId));
    if (!conv) {
      const isFriend = friends.some(f => f.name === hostName || (peerId && f.id === peerId));
      conv = {
        id: directConvId,
        name: hostName,
        avatar: hostAvatar,
        type: 'direct',
        friendId: peerId,
        online: true,
        isStranger: !isFriend,
        hasReplied: false,
        lastMessage: replyText ? `Phản hồi story: ${replyText}` : `Bắt đầu trò chuyện: "${story.title || 'Xin chào'}"`,
        time: 'Vừa xong',
        messages: [
          {
            id: `msg-${Date.now()}`,
            sender: 'them',
            senderName: hostName,
            text: `Chào bạn! Mình là ${hostName}, rất vui được kết nối trên VIVU!`
          }
        ]
      };
      setConversations(prev => [conv, ...prev]);
    }

    if (replyText) {
      handleSendMessage({
        conversationId: conv.id,
        text: `[Phản hồi Story "${story.title || 'Khoảnh khắc'}"]: ${replyText}`
      });
    }

    setActiveConversationId(conv.id);
    setActiveTab('chat');
  };

  // Kết bạn / Hủy kết bạn
  const handleStoryToggleFriend = async (story) => {
    const hostName = story.hostName || story.host_name || story.name;
    const targetUserId = story.hostId || story.host_id || story.id;
    const isAlreadyFriend = friends.some(f => (targetUserId && f.id === targetUserId) || f.name === hostName);
    
    if (isAlreadyFriend) {
      if (targetUserId && currentUserId) {
        try {
          await apiClient.unfriend(currentUserId, targetUserId);
        } catch (e) {
          console.warn('unfriend error:', e);
        }
      }
      setFriends(prev => prev.filter(f => f.name !== hostName && f.id !== targetUserId));
    } else {
      if (targetUserId && currentUserId && targetUserId !== currentUserId) {
        try {
          await apiClient.sendFriendRequest(currentUserId, targetUserId);
        } catch (e) {
          console.warn('sendFriendRequest error:', e);
        }
      }
      const newFriend = {
        id: targetUserId || `friend-${Date.now()}`,
        name: hostName,
        avatar: story.hostAvatar || story.host_avatar || story.avatar,
        battery: '98%',
        realLat: story.realLat,
        realLng: story.realLng,
        latOffset: story.latOffset || 0.002,
        lngOffset: story.lngOffset || 0.002
      };
      setFriends(prev => [...prev, newFriend]);
      confetti({ particleCount: 45, spread: 60 });
    }
  };

  // Xử lý tạo Story mới Pro (Hỗ trợ Camera Pro, Dual Cam, Text Gradient, Nhạc, Poll, Sticker)
  const handleCreateNewStory = async (storyData) => {
    const isFriendsOnly = activeTab === 'friends' || storyData.privacy === 'friends';
    const newStory = {
      id: `story-${Date.now()}`,
      hostId: currentUserId,
      userCode: currentUserCode,
      hostName: currentUserName || user?.user_metadata?.full_name || 'Bạn (Tôi)',
      hostAvatar: currentUserAvatar,
      isOwnerStory: true,
      category: storyData.category || 'moment',
      title: storyData.title || 'Khoảnh khắc mới',
      description: storyData.description || '',
      image: storyData.image || null,
      dual_image: storyData.dual_image || storyData.dualImage || null,
      is_dual_cam: Boolean(storyData.is_dual_cam || storyData.isDualCam),
      bg_gradient: storyData.bg_gradient || null,
      filter_id: storyData.filter_id || 'normal',
      adjustments: storyData.adjustments || null,
      texts: storyData.texts || [],
      stickers: storyData.stickers || [],
      music: storyData.music || null,
      tagged_friends: storyData.tagged_friends || [],
      address: storyData.address || location?.cityName || 'Vị trí GPS của Bạn',
      distanceText: 'Ngay tại vị trí của bạn',
      realLat: userLat,
      realLng: userLng,
      latOffset: 0,
      lngOffset: 0,
      expiry_hours: storyData.expiry_hours || 24,
      expires_at: new Date(Date.now() + (storyData.expiry_hours || 24) * 3600000).toISOString(),
      privacy: isFriendsOnly ? 'friends' : (storyData.privacy || 'public')
    };

    setStories(prev => [newStory, ...prev]);
    setIsCreateModalOpen(false);
    confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
    setActiveTab(isFriendsOnly ? 'friends' : 'social');

    // Đồng bộ story mới lên backend server để các thiết bị khác nhận được
    await apiClient.createStory({
      host_id: currentUserId,
      user_code: currentUserCode,
      host_name: currentUserName,
      host_avatar: currentUserAvatar,
      category: newStory.category,
      title: newStory.title,
      description: newStory.description,
      address: newStory.address,
      lat: userLat,
      lng: userLng,
      image: newStory.image,
      dual_image: newStory.dual_image,
      is_dual_cam: newStory.is_dual_cam,
      bg_gradient: newStory.bg_gradient,
      filter_id: newStory.filter_id,
      adjustments: newStory.adjustments,
      texts: newStory.texts,
      stickers: newStory.stickers,
      music: newStory.music,
      tagged_friends: newStory.tagged_friends,
      expiry_hours: newStory.expiry_hours,
      privacy: newStory.privacy
    });
  };



  // YÊU CẦU 5: XỬ LÝ POST LIỀN TỪ QUICK SNAP CAMERA LÊN STORY (ĐỒNG BỘ VỚI CÁC TRANG KHÁC)
  const handleQuickSnapPost = (snapData) => {
    const newStory = {
      id: `story-snap-${Date.now()}`,
      hostId: currentUserId,
      userCode: currentUserCode,
      hostName: currentUserName,
      hostAvatar: currentUserAvatar,
      isOwnerStory: true,
      category: 'moment',
      title: snapData.caption || 'Khoảnh khắc chụp liền',
      description: snapData.caption || 'Chụp liền từ VIVU Quick Snap Camera',
      image: snapData.image,
      address: 'Vị trí GPS của Bạn',
      distanceText: 'Ngay tại vị trí của bạn',
      realLat: userLat,
      realLng: userLng,
      latOffset: 0,
      lngOffset: 0,
      privacy: 'public'
    };

    setStories(prev => [newStory, ...prev]);
    setIsQuickSnapOpen(false);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
    setActiveTab('social');

    apiClient.createStory({
      host_id: currentUserId,
      user_code: currentUserCode,
      host_name: currentUserName,
      host_avatar: currentUserAvatar,
      category: 'moment',
      title: newStory.title,
      description: newStory.description,
      address: location?.cityName || 'Vị trí GPS của bạn',
      lat: userLat,
      lng: userLng,
      image: snapData.image,
      privacy: 'public'
    });
  };

  // Gửi tin nhắn trong Chat (Đồng bộ tức thì lên Backend để thiết bị kia nhận được)
  const handleSendMessage = ({ conversationId, text, image, video, isLocation, lat, lng }) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      senderName: currentUserName,
      text,
      image,
      video,
      isLocation,
      lat,
      lng,
      time: 'Vừa xong'
    };

    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          isStranger: false,
          hasReplied: true,
          lastMessage: text || (image ? 'Đã gửi hình ảnh' : video ? 'Đã gửi video' : isLocation ? 'Đã chia sẻ vị trí GPS' : 'Đã gửi tin nhắn'),
          time: 'Vừa xong',
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));

    // Gửi lên backend server
    apiClient.sendMessage({
      conversationId,
      text,
      image,
      video,
      isLocation,
      lat,
      lng,
      sender: currentUserId,
      sender_name: currentUserName
    });
  };

  // Thả tim nhanh (Đồng bộ tức thì lên Backend để lưu vĩnh viễn & không bị biến mất khi polling)
  const handleSendQuickHeart = () => {
    if (!activeConversationId) return;
    const newMsg = {
      id: `msg-heart-${Date.now()}`,
      client_msg_id: `cmsg-heart-${Date.now()}`,
      sender: 'me',
      senderName: currentUserName,
      text: '❤️',
      isHeart: true,
      is_heart: true,
      time: 'Vừa xong'
    };

    setConversations(prev => prev.map(c => {
      if (c.id === activeConversationId) {
        return {
          ...c,
          isStranger: false,
          hasReplied: true,
          lastMessage: '❤️ Đã thả một trái tim',
          time: 'Vừa xong',
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));

    // Gửi lên backend để lưu vào database & thông báo cho người nhận
    apiClient.sendMessage({
      conversationId: activeConversationId,
      text: '❤️',
      isHeart: true,
      is_heart: true,
      sender: currentUserId,
      sender_name: currentUserName
    });

    confetti({ particleCount: 30, spread: 50 });
  };

  // Xóa lịch sử trò chuyện
  const handleClearChatHistory = () => {
    setConversations(prev => prev.map(c => ({
      ...c,
      messages: [],
      lastMessage: 'Lịch sử trò chuyện đã được xóa'
    })));
  };

  // ==================== CÁC HÀM XỬ LÝ NHÓM (CUSTOM CIRCLES) ĐỒNG BỘ ====================
  const handleCreateCircle = async (circlePayload) => {
    try {
      const created = await apiClient.createCircle({
        ...circlePayload,
        ownerId: currentUserId,
        creatorName: currentUserName,
        creatorAvatar: currentUserAvatar
      });
      if (created) {
        setCustomCircles(prev => [created, ...prev.filter(c => c.id !== created.id)]);
        setIsCreateCircleModalOpen(false);
        // Thêm vào danh sách cuộc trò chuyện ngay để hiển thị trong Chat
        setConversations(prev => {
          if (prev.some(conv => conv.id === created.id)) return prev;
          return [
            {
              id: created.id,
              type: 'group',
              circleId: created.id,
              name: created.name,
              avatar: created.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(created.name)}`,
              memberCount: (created.member_ids || []).length,
              memberIds: created.member_ids || [],
              online: true,
              lastMessage: `Bạn đã tạo nhóm "${created.name}"`,
              time: created.created_at || new Date().toISOString(),
              unread: false,
              unreadCount: 0,
              messages: []
            },
            ...prev
          ];
        });
        confetti({ particleCount: 45, spread: 60 });
      }
    } catch (err) {
      console.warn('Lỗi tạo nhóm:', err);
      throw err;
    }
  };

  const handleAddMembersToCircle = async (circleId, memberIds) => {
    try {
      const res = await apiClient.addMembersToCircle(circleId, {
        memberIds,
        requesterId: currentUserId,
        inviterName: currentUserName
      });
      if (res?.data) {
        const updated = res.data;
        setCustomCircles(prev => prev.map(c => c.id === circleId ? { ...c, ...updated } : c));
        setConversations(prev => prev.map(conv => {
          if (conv.id === circleId || conv.circleId === circleId) {
            return {
              ...conv,
              memberCount: (updated.member_ids || []).length,
              memberIds: updated.member_ids || [],
              lastMessage: `${currentUserName} đã thêm ${memberIds.length} thành viên vào nhóm`
            };
          }
          return conv;
        }));
        confetti({ particleCount: 35, spread: 50 });
      }
    } catch (e) {
      console.warn('Lỗi thêm thành viên vào nhóm:', e);
    }
  };

  const handleInviteMembersToCircle = async (circleId, memberIds) => {
    return handleAddMembersToCircle(circleId, memberIds);
  };

  const handleAcceptGroupInvite = async (circleId, notif) => {
    try {
      const res = await apiClient.respondToCircleInvite(circleId, {
        userId: currentUserId,
        action: 'accept',
        userName: currentUserName
      });
      if (res?.data) {
        const updatedCircle = res.data;
        setCustomCircles(prev => [updatedCircle, ...prev.filter(c => c.id !== circleId)]);
        setConversations(prev => {
          if (prev.some(c => c.id === circleId)) return prev;
          return [
            {
              id: circleId,
              type: 'group',
              circleId: circleId,
              name: updatedCircle.name,
              avatar: updatedCircle.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(updatedCircle.name)}`,
              memberCount: (updatedCircle.member_ids || []).length,
              memberIds: updatedCircle.member_ids || [],
              online: true,
              lastMessage: 'Bạn đã tham gia nhóm',
              time: new Date().toISOString(),
              unread: false,
              unreadCount: 0,
              messages: []
            },
            ...prev
          ];
        });
        confetti({ particleCount: 40, spread: 50 });
      }
    } catch (e) {
      console.warn('Lỗi chấp nhận lời mời nhóm:', e);
    }
  };

  const handleRejectGroupInvite = async (circleId, notif) => {
    try {
      await apiClient.respondToCircleInvite(circleId, {
        userId: currentUserId,
        action: 'decline',
        userName: currentUserName
      });
    } catch (e) {
      console.warn('Lỗi từ chối lời mời nhóm:', e);
    }
  };

  const handleLeaveCircle = async (circleId) => {
    try {
      await apiClient.leaveCircle(circleId, {
        userId: currentUserId,
        userName: currentUserName
      });
      setCustomCircles(prev => prev.filter(c => c.id !== circleId));
      setConversations(prev => prev.filter(c => c.id !== circleId && c.circleId !== circleId));
      setActiveCircleFilter(prev => prev?.id === circleId ? null : prev);
    } catch (e) {
      console.warn('Lỗi rời nhóm:', e);
    }
  };

  const handleKickMember = async (circleId, targetUserId, targetUserName) => {
    try {
      await apiClient.kickFromCircle(circleId, {
        targetUserId,
        requesterId: currentUserId,
        targetUserName
      });
      setCustomCircles(prev => prev.map(c => {
        if (c.id === circleId) {
          return {
            ...c,
            member_ids: (c.member_ids || []).filter(id => id !== targetUserId),
            members: (c.members || []).map(m => m.user_id === targetUserId ? { ...m, status: 'removed' } : m)
          };
        }
        return c;
      }));
    } catch (e) {
      console.warn('Lỗi xóa thành viên:', e);
    }
  };

  const handleDisbandCircle = async (circleId) => {
    try {
      await apiClient.deleteCircle(circleId, currentUserId);
      setCustomCircles(prev => prev.filter(c => c.id !== circleId));
      setConversations(prev => prev.filter(c => c.id !== circleId && c.circleId !== circleId));
      setActiveCircleFilter(prev => prev?.id === circleId ? null : prev);
    } catch (e) {
      console.warn('Lỗi giải tán nhóm:', e);
    }
  };

  const handleViewCircleOnMap = (circleOrId) => {
    let circleObj = typeof circleOrId === 'object' ? circleOrId : customCircles.find(c => c.id === circleOrId);
    if (!circleObj && typeof circleOrId === 'string') {
      circleObj = { id: circleOrId, name: 'Nhóm', member_ids: [] };
    }
    if (circleObj) {
      setActiveCircleFilter(circleObj);
      setActiveTab('social');
    }
  };

  // Định vị lại trung tâm GPS người dùng
  const handleRecenterMap = () => {
    if (window.__vivu_map) {
      const userLng = Number(location?.lng ?? location?.longitude ?? 108.2192);
      const userLat = Number(location?.lat ?? location?.latitude ?? 16.0388);
      window.__vivu_map.flyTo({
        center: [userLng, userLat],
        zoom: 16.2,
        pitch: 35,
        duration: 900
      });
    }
  };

  // Trạng thái biến hình thông minh phong cách Apple Dynamic Island
  const activeIslandAlert = incomingMessageToast
    ? {
        type: 'message',
        id: incomingMessageToast.id || 'msg-toast',
        title: incomingMessageToast.senderName || 'Tin nhắn mới',
        subtitle: incomingMessageToast.text || incomingMessageToast.content || 'Đã gửi cho bạn một tin nhắn',
        avatar: incomingMessageToast.senderAvatar,
        badge: incomingMessageToast.isFriendRequest ? 'Lời mời kết bạn' : 'Tin nhắn mới',
        badgeColor: incomingMessageToast.isFriendRequest ? '#FF2A85' : '#00E5FF',
        onClick: () => {
          if (incomingMessageToast.action) {
            incomingMessageToast.action();
          } else if (incomingMessageToast.isFriendRequest) {
            setIsFriendshipManagerOpen(true);
          } else {
            setActiveTab('chat');
            if (incomingMessageToast.conversationId) {
              setActiveConversationId(incomingMessageToast.conversationId);
            } else {
              setActiveConversationId(null);
            }
          }
          setIncomingMessageToast(null);
        },
        onDismiss: () => setIncomingMessageToast(null)
      }
    : radarPingNotification
    ? {
        type: 'radar',
        id: radarPingNotification.id || 'radar-alert',
        title: radarPingNotification.item?.hostName || radarPingNotification.title || 'Radar Story',
        subtitle: radarPingNotification.subtitle || radarPingNotification.item?.title || 'Khoảnh khắc mới xuất hiện gần bạn',
        avatar: radarPingNotification.item?.hostAvatar || radarPingNotification.item?.avatar,
        badge: 'Radar GPS',
        badgeColor: '#10FFA0',
        onClick: () => {
          if (radarPingNotification.item) {
            setSelectedInteractiveStory(radarPingNotification.item);
          }
          setRadarPingNotification(null);
        },
        onDismiss: () => setRadarPingNotification(null)
      }
    : null;

  // Đã xóa Auth Gate cưỡng chế màn hình đen. 
  // Ứng dụng tự động vào thẳng Bản đồ 3D (Chế độ Khách), không bao giờ bị chớp đen màn hình khi mở trên điện thoại.

  return (
    <div className="fixed inset-0 w-screen h-[100dvh] overflow-hidden overscroll-none select-none font-sans text-white bg-[#07090E]">
      
      {/* 0.1 LOGO VIVU ĐỘC LẬP Ở GÓC TRÁI TRÊN CÙNG */}
      {(activeTab === 'social' || activeTab === 'friends' || activeTab === 'map') && (
        <TopAppLogo 
          onClick={handleRecenterMap} 
        />
      )}

      {/* 0.2 VIVU DYNAMIC ISLAND THÔNG MINH (NỞ TO RA KHI CÓ THÔNG BÁO / TIN NHẮN) */}
      {(activeTab === 'social' || activeTab === 'friends' || activeTab === 'map' || activeIslandAlert) && (
        <UnifiedDynamicIsland
          radarDistance={radarDistance}
          onSelectRadarDistance={(d) => setRadarDistance(d)}
          onAdjustingRadius={setIsAdjustingRadius}
          isScanning={isRadarScanning}
          onTriggerScan={handleTriggerRadarScan}
          unreadNotificationsCount={unreadNotificationsCount}
          onOpenNotifications={() => setIsNotificationsDrawerOpen(true)}
          friendsCount={friends.length}
          pendingFriendRequestsCount={pendingFriendRequests.length}
          onOpenFriends={() => setIsRightFriendshipPanelOpen(true)}
          activeAlert={activeIslandAlert}
          onDismissAlert={() => {
            setIncomingMessageToast(null);
            setRadarPingNotification(null);
          }}
        />
      )}

      {/* 0.3 ẢNH ĐẠI DIỆN ĐỘC LẬP PHONG CÁCH BUMP Ở GÓC PHẢI TRÊN CÙNG */}
      {(activeTab === 'social' || activeTab === 'friends' || activeTab === 'map') && (
        <BumpUserAvatar
          userAvatar={currentUserAvatar}
          userName={currentUserName}
          userCode={currentUserCode}
          isOnline={Boolean(currentUserId)}
          onClick={() => setIsUserMenuOpen(true)}
        />
      )}

      {/* 0.2 PANEL KẾT NỐI & BẠN BÈ Ở CẠNH PHẢI MÀN HÌNH */}
      <RightFriendshipPanel
        isOpen={isRightFriendshipPanelOpen}
        onClose={() => setIsRightFriendshipPanelOpen(false)}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        currentUserCode={currentUserCode}
        currentUserAvatar={currentUserAvatar}
        nearbyPeers={nearbyOnlinePeers}
        friends={friends}
        onRequestHandled={async () => {
          if (currentUserId) {
            const reqs = await apiClient.getFriendRequests(currentUserId);
            if (reqs?.received) setPendingFriendRequests(reqs.received);
            const fl = await apiClient.getFriendsList(currentUserId);
            if (fl) setFriends(fl);
          }
        }}
        onStartChatWithUser={(targetUser) => {
          setIsRightFriendshipPanelOpen(false);
          handleStoryDirectChat(targetUser);
        }}
      />

      {/* 1. BẢN ĐỒ MAPBOX STREETS-V12 TRUNG TÂM (SỐNG ĐỘNG ĐẦY MÀU SẮC) */}
      <MapboxCanvas
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        userLat={userLat}
        userLng={userLng}
        userCustomStatus={userCustomStatus}
        userAvatar={currentUserAvatar}
        gpsLoading={gpsLoading}
        location={location}
        onRequestLocation={requestLocation}
        activeTab={activeTab}
        viewMode={activeTab}
        stories={liveStories}
        friends={liveFriends}
        radarDistance={radarDistance}
        isAdjustingRadius={isAdjustingRadius}
        isRadarScanning={isRadarScanning}
        isNavigationActive={isNavigationActive}
        navTarget={navTarget}
        activeCircleFilter={activeCircleFilter}
        onClearCircleFilter={() => setActiveCircleFilter(null)}
        onOpenStoryDetail={(story) => setSelectedInteractiveStory(story)}
        onOpenStoryChat={handleStoryDirectChat}
        onOpenFriendDetail={setSelectedFriend}
        onOpenGuestProfile={(profile) => setSelectedGuestProfile(profile)}
        onOpenUserMenu={() => setIsUserMenuOpen(true)}
        onOpenCreateStory={() => setIsCreateModalOpen(true)}
        onOpenQuickSnap={() => setIsQuickSnapOpen(true)}
        onOpenMemeTroll={(target) => setTrollTargetUser(target)}
        onSetManualLocation={setManualCoords}
      />

      {/* BANNER THÔNG BÁO VỊ TRÍ THỰC TẾ (GPS THẬT) */}
      {(activeTab === 'social' || activeTab === 'friends') && (
        <GpsStatusBanner
          locationSource={locationSource}
          cityName={cityName}
          isFallback={isFallback}
          onRequestGps={requestLocation}
          isScanning={gpsLoading}
        />
      )}

      {/* 2.0 NÚT CHUÔNG THÔNG BÁO NỔI CHO CÁC TAB KHÔNG PHẢI MAP */}
      {activeTab !== 'social' && activeTab !== 'friends' && !(activeTab === 'chat' && activeConversationId !== null) && (
        <div className="fixed top-4 right-4 z-40">
          <NotificationBellButton
            unreadCount={unreadNotificationsCount}
            onClick={() => setIsNotificationsDrawerOpen(true)}
            isOpen={isNotificationsDrawerOpen}
          />
        </div>
      )}

      {/* 2.05 BANNER PHÁT HIỆN BẠN BÈ Ở CẬN (< 15M) & ĐANG ONLINE - CHẠM HOẶC LẮC ĐIỆN THOẠI ĐỂ CỤNG LY 3D */}
      {(activeTab === 'social' || activeTab === 'friends') && 
        nearbyFriend && 
        (nearbyFriend.isOnline === true || nearbyFriend.is_online === true || nearbyFriend.online === true) && 
        !isBumpModalOpen && (
        <ProximityBumpBanner
          nearbyFriend={nearbyFriend}
          distanceMeters={nearbyDistanceMeters}
          onTriggerBump={() => handleInitiateBump(nearbyFriend)}
          onDismiss={() => setDismissedBumpPeerId(nearbyFriend.id)}
        />
      )}

      {/* 2.1 HUY HIỆU CỤM: THÔNG BÁO CÓ NGƯỜI ĐANG ĐỨNG CÙNG VỊ TRÍ TRONG TAB XÃ HỘI */}
      {activeTab === 'social' && coLocatedPeer && (
        <div 
          onClick={() => {
            if (window.__vivu_map) {
              window.__vivu_map.flyTo({
                center: [Number(coLocatedPeer.lng), Number(coLocatedPeer.lat)],
                zoom: 17,
                pitch: 35,
                duration: 900
              });
            }
          }}
          className="fixed top-28 left-1/2 -translate-x-1/2 z-40 px-3 py-1 bg-[#18181B]/95 border border-amber-500/40 rounded-full shadow-lg backdrop-blur-md flex items-center gap-2 text-white text-[11px] font-semibold cursor-pointer hover:scale-105 active:scale-95 transition-all select-none"
          title="Bấm để phóng to và định vị người này"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span>Có {coLocatedPeer.full_name || coLocatedPeer.name} ({coLocatedPeer.user_code}) đang ở cùng vị trí với bạn</span>
          <i className="bi bi-crosshair text-amber-400"></i>
        </div>
      )}

      {/* 2.2 THẺ GỢI Ý KẾT BẠN NHANH KHI Ở TAB BẠN BÈ MÀ CHƯA CÓ BẠN BÈ */}
      {activeTab === 'friends' && liveFriends.length === 0 && nearbyOnlinePeers.length > 0 && (
        <div className="fixed top-28 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-40 p-3 bg-[#151619]/95 border border-amber-500/40 rounded-2xl shadow-xl backdrop-blur-md animate-fade-in flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-amber-400">
              <img src={nearbyOnlinePeers[0].avatar_url || nearbyOnlinePeers[0].avatar} alt="peer" className="w-full h-full object-cover" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-black"></span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">
                {nearbyOnlinePeers[0].full_name || nearbyOnlinePeers[0].name} <span className="text-[10px] text-amber-400 font-mono font-normal">({nearbyOnlinePeers[0].user_code})</span>
              </p>
              <p className="text-[11px] text-neutral-400 truncate">Đang online cùng vị trí với bạn</p>
            </div>
          </div>
          <button
            onClick={async () => {
              const targetId = nearbyOnlinePeers[0].id;
              if (currentUserId && targetId) {
                try {
                  await apiClient.sendFriendRequest(currentUserId, targetId);
                  setIncomingMessageToast({
                    id: `fr-sent-${Date.now()}`,
                    senderName: 'Hệ thống VIVU',
                    text: `Đã gửi lời mời kết bạn đến ${nearbyOnlinePeers[0].full_name || nearbyOnlinePeers[0].name}!`,
                    isFriendRequest: false
                  });
                } catch (e) {
                  console.warn(e);
                }
              }
            }}
            className="shrink-0 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1 cursor-pointer"
          >
            <i className="bi bi-person-plus-fill"></i>
            <span>Kết bạn</span>
          </button>
        </div>
      )}

      {/* 3. BANNER CHỈ ĐƯỜNG NỔI (KHI KÍCH HOẠT CHỈ ĐƯỜNG TỪ CHAT HOẶC MAP) */}
      {isNavigationActive && (
        <NavigationBanner
          navTarget={navTarget}
          onClose={() => setIsNavigationActive(false)}
        />
      )}

      {/* BANNER GỢI Ý CHUYỂN LINK HTTPS TUNNEL ĐỂ BẬT GPS TRÊN DI ĐỘNG */}
      {typeof window !== 'undefined' && 
        window.location.protocol === 'http:' && 
        !window.location.hostname.includes('localhost') && 
        publicTunnelUrl && 
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && (
        <a
          href={publicTunnelUrl}
          className="fixed top-2 left-1/2 -translate-x-1/2 z-60 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-[0_4px_16px_rgba(14,165,233,0.4)] border border-white/20 active:scale-95 transition-all"
        >
          <i className="bi bi-geo-alt-fill text-amber-300"></i>
          <span>Dùng link HTTPS để bật GPS chính xác</span>
          <i className="bi bi-arrow-right-short text-base"></i>
        </a>
      )}

      {/* 5. THANH DOCK ĐÁY BÓNG MỜ TRONG SUỐT (ẨN HOÀN TOÀN KHI ĐANG MỞ PHÒNG CHAT ĐỂ TỐI ĐA KHÔNG GIAN BÀN PHÍM) */}
      <VivuBottomDock
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'chat' && activeConversationId) {
            setActiveConversationId(null);
          }
        }}
        onOpenCreateStory={() => setIsCreateModalOpen(true)}
        unreadCount={conversations.filter(c => c.unread).length}
        className={activeTab === 'chat' && activeConversationId ? 'hidden' : ''}
      />

      {/* 6. TRÌNH XEM STORY TOÀN MÀN HÌNH TƯƠNG TÁC CAO CẤP */}
      {selectedInteractiveStory && (
        <StoryViewerModal
          story={selectedInteractiveStory}
          onClose={() => setSelectedInteractiveStory(null)}
          onOpenStoryChat={handleStoryDirectChat}
          onVotePoll={handleVoteStoryPoll}
          onReplyQA={handleReplyStoryQA}
          onReact={handleStoryReaction}
          userLat={userLat}
          userLng={userLng}
          currentUserId={currentUserId}
        />
      )}

      {/* 7. MODAL XEM HỒ SƠ CÁ NHÂN KHÁCH PHONG CÁCH TINDER CARD (YÊU CẦU 2) */}
      {selectedGuestProfile && (
        <GuestProfileModal
          isOpen={Boolean(selectedGuestProfile)}
          profile={selectedGuestProfile}
          onClose={() => setSelectedGuestProfile(null)}
          isFriend={friends.some(f => (selectedGuestProfile.id && f.id === selectedGuestProfile.id) || (selectedGuestProfile.hostId && f.id === selectedGuestProfile.hostId) || f.name === (selectedGuestProfile.hostName || selectedGuestProfile.name))}
          onDirectChat={(profile) => {
            setSelectedGuestProfile(null);
            handleStoryDirectChat(profile);
          }}
          onToggleFriend={(profile) => {
            handleStoryToggleFriend(profile);
          }}
          onOpenMemeTroll={(profile) => {
            setSelectedGuestProfile(null);
            setTrollTargetUser(profile);
          }}
          onStartNavigation={(profile) => {
            setSelectedGuestProfile(null);
            setNavTarget(profile);
            setIsNavigationActive(true);
            setActiveTab('social');
          }}
        />
      )}

      {/* 7.1 MODAL QUẢN LÝ KẾT BẠN & TÌM KIẾM NGƯỜI DÙNG */}
      <FriendshipManagerModal
        isOpen={isFriendshipManagerOpen}
        onClose={() => setIsFriendshipManagerOpen(false)}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        currentUserAvatar={currentUserAvatar}
        currentUserCode={currentUserCode}
        onStartChatWithUser={(targetUser) => {
          setIsFriendshipManagerOpen(false);
          handleStoryDirectChat(targetUser);
        }}
        onRequestHandled={() => {
          refreshConversations();
          apiClient.getFriendsList(currentUserId).then(list => {
            if (Array.isArray(list)) {
              setFriends(prev => {
                let updated = [...prev];
                list.forEach(item => {
                  const idx = updated.findIndex(f => f.id === item.id);
                  if (idx >= 0) {
                    updated[idx] = {
                      ...updated[idx],
                      name: item.name,
                      avatar: item.avatar,
                      user_code: item.user_code
                    };
                  } else {
                    updated.unshift({
                      id: item.id,
                      name: item.name,
                      avatar: item.avatar,
                      user_code: item.user_code,
                      battery: '98%',
                      realLat: item.lat || userLat,
                      realLng: item.lng || userLng,
                      lastSeenLocation: 'Bạn bè VIVU',
                      title: 'Bạn bè VIVU'
                    });
                  }
                });
                return updated;
              });
            }
          });
          apiClient.getFriendRequests(currentUserId).then(reqs => {
            if (reqs && reqs.received) {
              setPendingFriendRequests(reqs.received);
            }
          });
          apiClient.getNotifications(currentUserId).then(notifs => {
            if (Array.isArray(notifs)) {
              setNotifications(notifs);
              setUnreadNotificationsCount(notifs.filter(n => !n.read).length);
            }
          });
        }}
      />

      {/* 8. BOTTOM SHEET CHI TIẾT BẠN BÈ */}
      {selectedFriend && (
        <FriendDetailSheet
          friend={selectedFriend}
          userLat={userLat}
          userLng={userLng}
          onClose={() => setSelectedFriend(null)}
          onOpenDirectChat={(f) => {
            setSelectedFriend(null);
            handleStoryDirectChat(f);
          }}
          onOpenMemeTroll={(f) => {
            setSelectedFriend(null);
            setTrollTargetUser(f);
          }}
          onStartNavigation={(f) => {
            setNavTarget(f);
            setSelectedFriend(null);
            setIsNavigationActive(true);
            setActiveTab('friends');
          }}
        />
      )}

      {/* 9. BOTTOM SHEET VỊ TRÍ CỦA BẠN */}
      <UserLocationSheet
        isOpen={isUserMenuOpen}
        userLat={userLat}
        userLng={userLng}
        locationAccuracy={location?.accuracy}
        userCustomStatus={userCustomStatus}
        userAvatar={currentUserAvatar}
        onClose={() => setIsUserMenuOpen(false)}
        onOpenCreateStory={() => setIsCreateModalOpen(true)}
        onSelectStatus={(status) => {
          setUserCustomStatus(status);
          confetti({ particleCount: 25, spread: 40 });
        }}
        onRequestLocation={requestLocation}
        onOpenProfile={() => setActiveTab('profile')}
      />

      {/* 11. MODAL SOẠN THẢO STORY KHOẢNH KHẮC & CAMERA PRO (UNIFIED) */}
      <StoryStudioModal
        isOpen={isCreateModalOpen || isQuickSnapOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsQuickSnapOpen(false);
        }}
        onSubmitStory={handleCreateNewStory}
        userLocationName={cityName || "Vị trí GPS của Bạn"}
        userLat={userLat}
        userLng={userLng}
        friends={friends}
      />

      {/* 12. MODAL TẠO NHÓM MỚI */}
      <CreateCircleModal
        isOpen={isCreateCircleModalOpen}
        onClose={() => setIsCreateCircleModalOpen(false)}
        friends={friends}
        onCreateCircle={handleCreateCircle}
      />

      {/* 13. MODAL TẠO BÌNH CHỌN LỊCH HẸN */}
      <CreatePollModal
        isOpen={isCreatePollModalOpen}
        onClose={() => setIsCreatePollModalOpen(false)}
        onCreatePoll={({ title, options }) => {
          if (!activeConversationId) return;
          const newMsg = {
            id: `msg-poll-${Date.now()}`,
            sender: 'me',
            senderName: 'Bạn',
            text: `Đã mở bình chọn: "${title}"`,
            hasPoll: true,
            customPoll: {
              id: `poll-${Date.now()}`,
              title,
              isClosed: false,
              options,
              userVoted: null
            }
          };
          setConversations(prev => prev.map(c => {
            if (c.id === activeConversationId) {
              return {
                ...c,
                lastMessage: `Bình chọn: ${title}`,
                messages: [...c.messages, newMsg]
              };
            }
            return c;
          }));
          setIsCreatePollModalOpen(false);
        }}
      />

      {/* 14. GIẢ LẬP CUỘC GỌI */}
      <CallOverlayModal
        callingState={callingState}
        onEndCall={() => setCallingState(null)}
      />

      {/* 15. TAB TIN NHẮN MESSENGER (CHỈ ĐƯỜNG TRỰC TIẾP TRONG KHUNG TIN NHẮN) */}
      {activeTab === 'chat' && (
        <MessengerChatView
          conversations={conversations}
          activeConversationId={activeConversationId}
          setActiveConversationId={(id) => {
            setActiveConversationId(id);
            if (id) {
              apiClient.markMessagesAsRead(id, currentUserId);
              setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: false, unreadCount: 0 } : c));
              setNotifications(prev => {
                const updated = prev.map(n => {
                  if (n.type === 'new_message' && n.action_data?.conversationId === id) {
                    return { ...n, read: true, unread_count: 0 };
                  }
                  return n;
                });
                setUnreadNotificationsCount(updated.filter(n => !n.read && n.status !== 'cancelled').length);
                return updated;
              });
            }
          }}
          messages={conversations.find(c => c.id === activeConversationId)?.messages || []}
          friends={friends}
          stories={liveStories}
          myActiveStory={myActiveStory}
          onOpenCreateStory={() => setIsCreateModalOpen(true)}
          onOpenStoryDetail={(story) => setSelectedInteractiveStory(story)}
          onToggleRightFriendshipPanel={() => setIsRightFriendshipPanelOpen(prev => !prev)}
          pendingFriendRequestsCount={pendingFriendRequests.length}
          userLat={userLat}
          userLng={userLng}
          userAvatar={currentUserAvatar}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          currentUserCode={currentUserCode}
          onSendMessage={handleSendMessage}
          onSendQuickHeart={handleSendQuickHeart}
          onStartCall={(conv, type) => setCallingState({ name: conv.name, avatar: conv.avatar, type, status: 'Đang kết nối...' })}
          onOpenCreateCircle={() => setIsCreateCircleModalOpen(true)}
          onDeleteCircle={handleDisbandCircle}
          onAddMembers={handleAddMembersToCircle}
          onInviteMembers={handleInviteMembersToCircle}
          onLeaveGroup={handleLeaveCircle}
          onKickMember={handleKickMember}
          onViewCircleOnMap={handleViewCircleOnMap}
          onOpenMapForStory={(msg) => {
            setActiveTab('social');
            setActiveConversationId(null);
            const targetLat = Number(msg?.lat ?? msg?.realLat);
            const targetLng = Number(msg?.lng ?? msg?.realLng);
            if (!isNaN(targetLat) && !isNaN(targetLng) && window.__vivu_map) {
              setTimeout(() => {
                window.__vivu_map.flyTo({
                  center: [targetLng, targetLat],
                  zoom: 16.8,
                  pitch: 35,
                  duration: 900
                });
              }, 300);
            }
          }}
          onBackToMap={() => {
            setActiveTab('social');
            setActiveConversationId(null);
          }}
          onStartNavigation={(target) => {
            setNavTarget(target);
            setIsNavigationActive(true);
            setActiveTab('social');
            setActiveConversationId(null);
            const targetLat = Number(target?.realLat ?? target?.lat);
            const targetLng = Number(target?.realLng ?? target?.lng);
            if (!isNaN(targetLat) && !isNaN(targetLng) && window.__vivu_map) {
              setTimeout(() => {
                window.__vivu_map.flyTo({
                  center: [targetLng, targetLat],
                  zoom: 16.8,
                  pitch: 35,
                  duration: 900
                });
              }, 300);
            }
          }}
          onOpenDirectChat={handleStoryDirectChat}
        />
      )}

      {/* 16. TAB TÔI (PROFILE TINDER CARD) */}
      {activeTab === 'profile' && (
        <ProfilePageView
          user={{
            ...user,
            id: currentUserId,
            user_metadata: {
              ...user?.user_metadata,
              full_name: currentUserName,
              avatar_url: currentUserAvatar
            }
          }}
          isAuthenticated={isAuthenticated}
          onOpenLogin={() => setIsAuthModalOpen(true)}
          onLogout={logout}
          friends={friends}
          stories={stories}
          customCircles={customCircles}
          userCustomStatus={userCustomStatus}
          location={location}
          userCode={currentUserCode}
          onOpenCreateCircle={() => setIsCreateCircleModalOpen(true)}
          onSelectCircleOnMap={handleViewCircleOnMap}
          onBackToMap={() => setActiveTab('social')}
          onRequestLocation={requestLocation}
          onOpenEditProfile={() => setIsEditProfileOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAccountSwitcher={() => setIsAccountSwitcherOpen(true)}
          onUpdateAvatar={handleDirectUpdateAvatar}
          onOpenRightFriendshipPanel={() => setIsRightFriendshipPanelOpen(true)}
          onDirectChat={handleStoryDirectChat}
          onStartCall={(target) => handleStartCall('voice', target)}
          onTriggerBump={(target) => handleTriggerBumpWithUser(target)}
          onOpenMemeTroll={(target) => setTrollTargetUser(target)}
          onStartNavigation={(target) => {
            setNavTarget(target);
            setIsNavigationActive(true);
            setActiveTab('social');
          }}
        />
      )}

      {/* 17. MODAL CÀI ĐẶT & CẤU HÌNH HỆ THỐNG */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onLogout={() => {
          clearLocation();
          logout();
        }}
        onLockApp={() => setIsAppLocked(true)}
        onClearChatHistory={handleClearChatHistory}
        onOpenChangePassword={() => setIsResetPasswordOpen(true)}
        ghostMode={ghostMode}
        onToggleGhostMode={() => setGhostMode(prev => !prev)}
        messagePrivacy={messagePrivacy}
        onUpdateMessagePrivacy={handleUpdateMessagePrivacy}
        currentThemeAccent={themeAccent}
        onSelectThemeAccent={async (accentId) => {
          applyThemeAccent(accentId);
          if (user?.id) {
            await apiClient.updateUserProfile(user.id, { themeAccent: accentId });
          }
        }}
        onReplayIntro={() => setIsIntroPlaying(true)}
      />

      {/* 17b. MODAL CHUYỂN ĐỔI NHANH TÀI KHOẢN (ACCOUNT SWITCHER) */}
      <AccountSwitcherModal
        isOpen={isAccountSwitcherOpen}
        onClose={() => setIsAccountSwitcherOpen(false)}
        currentUser={user}
        onSwitchAccount={async (acc) => {
          if (acc?.email) {
            await login(acc.email, acc.password || 'vivu123');
          }
          setIsAccountSwitcherOpen(false);
        }}
      />

      {/* 18. MÀN HÌNH KHÓA TRANG / APP LOCK */}
      <AppLockOverlay
        isLocked={isAppLocked}
        onUnlock={() => setIsAppLocked(false)}
        user={user}
      />

      {/* 19. MODAL CHỈNH SỬA HỒ SƠ */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={user}
        currentStatus={userCustomStatus}
        onSaveProfile={async (profileData) => {
          const res = await updateProfile(profileData);
          if (res?.success) {
            if (profileData.customStatus) setUserCustomStatus(profileData.customStatus);
            if (profileData.avatarUrl) setCustomAvatar(profileData.avatarUrl);
            confetti({ particleCount: 40, spread: 60 });
          }
        }}
        isSubmitting={isAuthSubmitting}
      />

      {/* 20. MODAL ĐỔI MẬT KHẨU */}
      {/* 20. MODAL XÁC THỰC (ĐĂNG NHẬP / ĐĂNG KÝ) */}
      {isAuthModalOpen && (
        <AuthGateView
          onLogin={async (email, pass) => {
            const res = await login(email, pass);
            if (res?.success) setIsAuthModalOpen(false);
            return res;
          }}
          onRegister={register}
          onForgotPassword={forgotPassword}
          isSubmitting={isAuthSubmitting}
          authError={authError}
          onClearError={clearAuthError}
          onClose={isAuthenticated ? () => setIsAuthModalOpen(false) : undefined}
        />
      )}

      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        onClose={() => {
          setIsResetPasswordOpen(false);
          window.location.hash = '';
        }}
        onSubmit={changePassword}
        isSubmitting={isAuthSubmitting}
      />



      {/* 22. DRAWER LỊCH SỬ THÔNG BÁO RADAR PING */}
      <RadarNotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={radarNotificationsHistory}
        onSelectStory={(story) => {
          setIsNotificationDrawerOpen(false);
          setSelectedInteractiveStory(story);
        }}
        onClearAll={() => setRadarNotificationsHistory([])}
      />



      {/* 23. DRAWER THÔNG BÁO TỔNG HỢP VIVU (REALTIME NOTIFICATIONS & FRIEND REQUESTS) */}
      <NotificationDrawer
        isOpen={isNotificationsDrawerOpen}
        onClose={() => setIsNotificationsDrawerOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onAcceptFriendRequest={handleAcceptFriendRequestFromNotification}
        onRejectFriendRequest={handleRejectFriendRequestFromNotification}
        onAcceptGroupInvite={handleAcceptGroupInvite}
        onRejectGroupInvite={handleRejectGroupInvite}
        onDeleteNotification={handleDeleteNotification}
        onOpenChat={(targetUserId) => {
          setIsNotificationsDrawerOpen(false);
          handleStoryDirectChat(targetUserId);
        }}
        onOpenFriendRequests={() => {
          setIsNotificationsDrawerOpen(false);
          setIsFriendshipManagerOpen(true);
        }}
        onOpenConversation={(convId) => {
          setIsNotificationsDrawerOpen(false);
          setActiveConversationId(convId);
          setActiveTab('chat');
        }}
      />


      <MobileQrModal
        isOpen={isMobileQrOpen}
        onClose={() => setIsMobileQrOpen(false)}
        publicUrl={publicTunnelUrl}
        lanUrl="http://192.168.1.163:5173/"
      />

      {/* 24. MODAL CỤM LY KHÔNG GIAN 3D THREE.JS (SPATIAL BUMP) - LAZY LOADED */}
      <Suspense fallback={null}>
        {isBumpModalOpen && (
          <SpatialBumpModal3D
            isOpen={isBumpModalOpen}
            onClose={() => setIsBumpModalOpen(false)}
            initiatorName={activeBumpData?.initiatorName || currentUserName}
            initiatorAvatar={activeBumpData?.initiatorAvatar || currentUserAvatar}
            targetName={activeBumpData?.targetName || 'Bạn bè'}
            targetAvatar={activeBumpData?.targetAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
            isInitiator={activeBumpData?.initiatorId === currentUserId}
          />
        )}
      </Suspense>

      {/* 25. Rule 22: Cổng cấp quyền tự động tắt, vào thẳng bản đồ 3D */}
      {isPermissionGateOpen && (
        <VivuPermissionGate onGranted={handlePermissionsGranted} />
      )}

      {/* 26. MÀN HÌNH VIDEO INTRO KHỞI ĐỘNG WEB APP (CÓ ÂM THANH) */}
      {isIntroPlaying && (
        <VivuIntroScreen onFinished={handleIntroFinished} />
      )}

      {/* 27. MODAL NÉM MEME TROLL BẠN BÈ KHI GIỮ GIỌT NƯỚC 2 GIÂY */}
      {trollTargetUser && (
        <MemeTrollModal
          isOpen={Boolean(trollTargetUser)}
          targetUser={trollTargetUser}
          currentUserId={currentUserId}
          onClose={() => setTrollTargetUser(null)}
          onMemeSent={({ meme, targetUser }) => {
            setActiveTakeoverMeme({
              meme,
              senderName: currentUserName || 'Bạn'
            });
            // Gửi thông báo thời gian thực qua socket
            try {
              if (socketRef.current?.connected) {
                socketRef.current.emit('meme_troll', {
                  senderId: currentUserId,
                  senderName: currentUserName,
                  targetId: targetUser.id || targetUser.hostId,
                  meme
                });
              }
            } catch {}
          }}
        />
      )}

      {/* 28. HIỆU ỨNG MEME BAY LƯỢN TOÀN MÀN HÌNH (SCREEN TAKEOVER) */}
      {activeTakeoverMeme && (
        <MemeScreenTakeover
          meme={activeTakeoverMeme.meme}
          senderName={activeTakeoverMeme.senderName}
          onDismiss={() => setActiveTakeoverMeme(null)}
        />
      )}

    </div>
  );
}
