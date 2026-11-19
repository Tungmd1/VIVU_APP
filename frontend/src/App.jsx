import { DEFAULT_WHITE_PERSON_AVATAR, getSafeAvatar } from './utils/avatarUtils';
import React, { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from 'react';
// Thay thế pháo hoa canvas-confetti bằng phản hồi rung tactile nhẹ nhàng (Tuân thủ Mục 9 plan.md)
const confetti = () => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate([20, 35]); } catch {}
  }
};
import { useGeolocation } from './hooks/useGeolocation';
import { vivuBackendService } from './services/vivuBackendService';
import { apiClient } from './services/apiClient';

// Import các Module Components
import GoogleMapView from './components/map/GoogleMapView';
import UnifiedDynamicIsland from './components/layout/UnifiedDynamicIsland';
import RadarDistanceSelector from './components/map/RadarDistanceSelector';
import NavigationBanner from './components/map/NavigationBanner';
import GpsStatusBanner from './components/map/GpsStatusBanner';
import VivuBottomDock from './components/layout/VivuBottomDock';
import UserLocationSheet from './components/layout/UserLocationSheet';
import QuickStatusSheet from './components/story/QuickStatusSheet';
import FriendDetailSheet from './components/layout/FriendDetailSheet';
import StoryStudioModal from './components/story/StoryStudioModal';
import UnifiedCreationStudioModal from './components/story/UnifiedCreationStudioModal';
import StoryViewerModal from './components/story/StoryViewerModal';
import GuestProfileModal from './components/profile/GuestProfileModal';
import UserProfileViewModal from './components/profile/UserProfileViewModal';
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
import PinWardrobeModal from './components/profile/PinWardrobeModal';
import { useSocket } from './hooks/useSocket';
import { safeGetItem, safeSetItem, safeRemoveItem } from './utils/safeStorage';
import { storyAudioPlayer } from './data/trendingSongs';

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

import { getSharedAudioContext } from './utils/audioContextManager';

// Hàm phát chuông thông báo ding-dong vui tai qua Web Audio API (Dùng Singleton AudioContext để chống crash thiết bị di động)
const playDingDongSound = () => {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;
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

// Hàm phát âm thanh tin nhắn đến chuyên biệt "Ting-Ting" (Pop Chime) qua Web Audio API (Dùng Singleton AudioContext)
// Âm sắc bổng trong trẻo, êm dịu, ngắn gọn (0.2s), hoàn toàn phân biệt với tiếng chuông radar Ding-dong
const playMessageNotificationSound = () => {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;
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

  // Rule 11: Đọc an toàn GPS thiết bị thực tế (Không dùng Đà Nẵng mặc định)
  const userLng = location?.lng ?? location?.longitude ?? null;
  const userLat = location?.lat ?? location?.latitude ?? null;
  
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

  // Định danh & thông tin người dùng cơ sở (khai báo sớm nhất tránh lỗi TDZ initialization)
  const currentUserId = user?.id || null;

  const currentUserCode = useMemo(() => {
    if (user?.user_metadata?.user_code) return user.user_metadata.user_code;
    if (user?.user_code) return user.user_code;
    return null;
  }, [user]);

  const currentUserName = useMemo(() => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.full_name) return user.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'Khách VIVU';
  }, [user]);

  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  // Cổng cấp quyền sử dụng: Rule 22 luôn vào thẳng bản đồ 3D không khóa màn hình
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
  const [radarDistance, setRadarDistance] = useState(5); // Tự động quét bán kính 5km mặc định
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
  const [isBumpMyReady, setIsBumpMyReady] = useState(false);
  const [isBumpPeerReady, setIsBumpPeerReady] = useState(false);
  const [isBumpClinkTriggered, setIsBumpClinkTriggered] = useState(false);

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
  const [selectedInteractiveStoryList, setSelectedInteractiveStoryList] = useState([]);
  const [selectedStoryInitialIndex, setSelectedStoryInitialIndex] = useState(0);
  const [selectedGuestProfile, setSelectedGuestProfile] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [userProfileOriginSource, setUserProfileOriginSource] = useState('map');
  const [myStoryReactions, setMyStoryReactions] = useState({});

  // Quản lý Modal Đăng Story khoảnh khắc
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userCustomStatus, setUserCustomStatus] = useState(() => {
    try {
      const saved = localStorage.getItem('vivu_user_custom_status');
      if (saved === 'Khoảnh khắc mới' || saved === 'Tâm trạng') {
        localStorage.removeItem('vivu_user_custom_status');
        return '';
      }
      return saved || '';
    } catch { return ''; }
  });
  const [userCustomSong, setUserCustomSong] = useState(() => {
    try {
      const savedStatus = localStorage.getItem('vivu_user_custom_status');
      if (savedStatus === 'Khoảnh khắc mới' || savedStatus === 'Tâm trạng') {
        localStorage.removeItem('vivu_user_custom_song');
        return null;
      }
      const scopedKey = Object.keys(localStorage).find(k => k.startsWith('vivu_user_custom_song_'));
      const saved = scopedKey ? localStorage.getItem(scopedKey) : localStorage.getItem('vivu_user_custom_song');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [userCustomChibiExpiresAt, setUserCustomChibiExpiresAt] = useState(() => {
    try {
      const scopedKey = currentUserId ? `vivu_user_custom_chibi_expires_${currentUserId}` : null;
      const savedExp = scopedKey ? localStorage.getItem(scopedKey) : null;
      return savedExp ? Number(savedExp) : null;
    } catch { return null; }
  });
  const [userCustomChibi, setUserCustomChibi] = useState(() => {
    try {
      const scopedExpKey = currentUserId ? `vivu_user_custom_chibi_expires_${currentUserId}` : null;
      const savedExp = Number(scopedExpKey ? localStorage.getItem(scopedExpKey) : null);
      if (savedExp && Date.now() > savedExp) {
        if (scopedExpKey) localStorage.removeItem(scopedExpKey);
        if (currentUserId) localStorage.removeItem(`vivu_user_custom_chibi_${currentUserId}`);
        return null;
      }
      const scopedKey = currentUserId ? `vivu_user_custom_chibi_${currentUserId}` : null;
      return scopedKey ? localStorage.getItem(scopedKey) : null;
    } catch { return null; }
  });
  const [userPinSkin, setUserPinSkin] = useState('auto');
  const [userPinMascot, setUserPinMascot] = useState(null);
  const [userPinAction, setUserPinAction] = useState(null);
  const [isPinWardrobeOpen, setIsPinWardrobeOpen] = useState(false);

  // Đồng bộ diện mạo ghim (Pin Skin, Chibi Mascot, Hành động, Bài hát) cô lập theo từng tài khoản (Rule 26)
  useEffect(() => {
    if (currentUserId && !currentUserId.startsWith('client-')) {
      try {
        const accSkin = user?.pin_skin || localStorage.getItem(`vivu_user_pin_skin_${currentUserId}`) || 'auto';
        const accChibi = user?.custom_chibi || localStorage.getItem(`vivu_user_custom_chibi_${currentUserId}`) || null;
        const accExp = Number(user?.chibi_expires_at || localStorage.getItem(`vivu_user_custom_chibi_expires_${currentUserId}`) || null);
        const isExp = accExp && Date.now() > accExp;
        const accMascot = user?.pin_mascot || localStorage.getItem(`vivu_user_pin_mascot_${currentUserId}`) || null;
        const accAction = user?.pin_action || localStorage.getItem(`vivu_user_pin_action_${currentUserId}`) || null;
        const accSongRaw = user?.custom_song || localStorage.getItem(`vivu_user_custom_song_${currentUserId}`) || null;
        let accSong = null;
        if (accSongRaw) {
          accSong = typeof accSongRaw === 'object' ? accSongRaw : JSON.parse(accSongRaw);
        }

        setUserPinSkin(accSkin);
        setUserCustomChibi(isExp ? null : accChibi);
        setUserCustomChibiExpiresAt(isExp ? null : (accExp || null));
        setUserPinMascot(accMascot);
        setUserPinAction(accAction);
        if (accSong) setUserCustomSong(accSong);
      } catch {}
    } else {
      setUserPinSkin('auto');
      setUserCustomChibi(null);
      setUserCustomChibiExpiresAt(null);
      setUserPinMascot(null);
      setUserPinAction(null);
    }
  }, [currentUserId, user?.id, user?.pin_skin, user?.custom_chibi, user?.chibi_expires_at, user?.pin_mascot, user?.pin_action, user?.custom_song]);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isQuickStatusSheetOpen, setIsQuickStatusSheetOpen] = useState(false);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
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

  // Danh sách Stories thật từ người dùng (Khởi tạo từ cache an toàn nếu có)
  const [stories, setStories] = useState(() => {
    try {
      const scopedListKey = currentUserId ? `vivu_user_active_stories_${currentUserId}` : null;
      const cachedList = (scopedListKey ? localStorage.getItem(scopedListKey) : null) || localStorage.getItem('vivu_user_active_stories');
      if (cachedList) {
        const parsedList = JSON.parse(cachedList);
        if (Array.isArray(parsedList)) {
          const now = Date.now();
          const valid = parsedList.filter(s => !s.expires_at || new Date(s.expires_at).getTime() > now);
          if (valid.length > 0) {
            return valid.map(s => ({ ...s, isOwnerStory: true, activeStory: s }));
          }
        }
      }
      const scopedKey = currentUserId ? `vivu_user_active_story_${currentUserId}` : null;
      const cached = (scopedKey ? localStorage.getItem(scopedKey) : null) || localStorage.getItem('vivu_user_active_story');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && (!parsed.expires_at || new Date(parsed.expires_at).getTime() > Date.now())) {
          return [{ ...parsed, isOwnerStory: true, activeStory: parsed }];
        }
      }
    } catch {}
    return [];
  });

  // Danh sách Bạn bè thật (Không còn mock)
  const [friends, setFriends] = useState([]);
  const [nearbyOnlinePeers, setNearbyOnlinePeers] = useState([]);

  // Nhóm riêng (Custom Circles) & Bộ lọc Nhóm trên Bản Đồ (Rule 9 GEMINI.md)
  const [customCircles, setCustomCircles] = useState([]);
  const [activeCircleFilter, setActiveCircleFilter] = useState(null);

  const handleSyncFromPhone = useCallback(() => {
    if (!nearbyOnlinePeers || nearbyOnlinePeers.length === 0) {
      setIncomingMessageToast({
        id: 'sync-phone-empty-' + Date.now(),
        senderName: 'VIVU GPS',
        senderAvatar: DEFAULT_WHITE_PERSON_AVATAR,
        text: 'Chưa phát hiện thiết bị điện thoại nào đang online gần bạn để đồng bộ.',
        isFriendRequest: false
      });
      return;
    }
    const phonePeer = nearbyOnlinePeers[0];
    const targetLat = Number(phonePeer.realLat ?? phonePeer.lat);
    const targetLng = Number(phonePeer.realLng ?? phonePeer.lng);
    if (isNaN(targetLat) || isNaN(targetLng)) return;
    setManualCoords(targetLat, targetLng, 'Đồng bộ từ điện thoại (' + (phonePeer.full_name || phonePeer.name) + ')');
    setIncomingMessageToast({
      id: 'sync-phone-success-' + Date.now(),
      senderName: 'VIVU GPS',
      senderAvatar: phonePeer.avatar_url || phonePeer.avatar || DEFAULT_WHITE_PERSON_AVATAR,
      text: 'Đã đồng bộ vị trí thành công theo ' + (phonePeer.full_name || phonePeer.name) + '!',
      isFriendRequest: false
    });
    if (window.__vivu_map) {
      try {
        window.__vivu_map.flyTo([targetLat, targetLng], 16.5);
      } catch {}
    }
  }, [nearbyOnlinePeers, setManualCoords]);

  // Hội thoại chat thật tải từ server
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);

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

  // Quản lý Avatar hiện tại: Gắn chặt theo tài khoản đang đăng nhập, ổn định 100% không render lại ngẫu nhiên
  const [customAvatar, setCustomAvatar] = useState(() => {
    try {
      if (currentUserId && !currentUserId.startsWith('client-')) {
        return localStorage.getItem(`vivu_user_avatar_${currentUserId}`) || null;
      }
      return null;
    } catch {
      return null;
    }
  });

  const currentUserAvatar = useMemo(() => {
    if (customAvatar) return customAvatar;
    if (user?.avatar_url) return user.avatar_url;
    if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
    if (currentUserId && !currentUserId.startsWith('client-')) {
      try {
        const scoped = localStorage.getItem(`vivu_user_avatar_${currentUserId}`);
        if (scoped) return scoped;
        const scopedProfileRaw = localStorage.getItem(`vivu_user_profile_data_${currentUserId}`);
        if (scopedProfileRaw) {
          const parsed = JSON.parse(scopedProfileRaw);
          const av = parsed.avatarUrl || parsed.avatar_url;
          if (av) return av;
        }
      } catch {}
    }
    try {
      const globalProfileRaw = localStorage.getItem('vivu_user_profile_data');
      if (globalProfileRaw) {
        const parsed = JSON.parse(globalProfileRaw);
        if ((!parsed.userId || parsed.userId === currentUserId) && (parsed.avatarUrl || parsed.avatar_url)) {
          return parsed.avatarUrl || parsed.avatar_url;
        }
      }
      const unscoped = localStorage.getItem('vivu_user_avatar');
      if (unscoped) return unscoped;
    } catch {}
    return null; // Không dùng ảnh mẫu Unsplash, để null để hiển thị avatar nền trắng icon người
  }, [customAvatar, user, currentUserId]);

  // Thông báo tổng hợp (Lời mời kết bạn, chấp nhận, tương tác)
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Khởi tạo kết nối Socket.IO realtime
  const { socketRef, socket, isConnected: isSocketConnected } = useSocket(currentUserId);

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

    // CHỈ dọn sạch diện mạo ghim và cache toàn cục khi thực sự đăng xuất (!user?.id)
    if (!user?.id) {
      setUserPinSkin('auto');
      setUserCustomChibi(null);
      setUserCustomChibiExpiresAt(null);
      setUserPinMascot(null);
      setUserPinAction(null);
      setUserCustomSong(null);
      setUserCustomStatus('');
      safeRemoveItem('vivu_user_name');
      safeRemoveItem('vivu_user_profile_data');
      safeRemoveItem('vivu_user_custom_status');
      safeRemoveItem('vivu_user_custom_song');
      safeRemoveItem('vivu_user_custom_chibi');
      safeRemoveItem('vivu_user_custom_chibi_expires');
      safeRemoveItem('vivu_user_pin_skin');
      safeRemoveItem('vivu_user_pin_mascot');
      safeRemoveItem('vivu_user_pin_action');
    }
  }, [user?.id]);

  // TỰ ĐỘNG PHỤC HỒI (REHYDRATE) AVATAR & THÔNG TIN HỒ SƠ SAU KHI ĐĂNG NHẬP / TẢI LẠI TRANG
  useEffect(() => {
    if (!currentUserId || currentUserId.startsWith('client-')) return;
    try {
      const scopedAvatar = localStorage.getItem(`vivu_user_avatar_${currentUserId}`);
      if (scopedAvatar) {
        setCustomAvatar(scopedAvatar);
        return;
      }
      const scopedProfileRaw = localStorage.getItem(`vivu_user_profile_data_${currentUserId}`);
      if (scopedProfileRaw) {
        const parsed = JSON.parse(scopedProfileRaw);
        const av = parsed.avatarUrl || parsed.avatar_url;
        if (av) {
          setCustomAvatar(av);
          try { localStorage.setItem(`vivu_user_avatar_${currentUserId}`, av); } catch {}
          return;
        }
      }
      const userAv = user?.avatar_url || user?.user_metadata?.avatar_url;
      if (userAv) {
        setCustomAvatar(userAv);
        try { localStorage.setItem(`vivu_user_avatar_${currentUserId}`, userAv); } catch {}
        return;
      }
      apiClient.getMe(currentUserId).then(serverUser => {
        if (serverUser && (serverUser.avatar_url || serverUser.avatar)) {
          const remoteAv = serverUser.avatar_url || serverUser.avatar;
          setCustomAvatar(remoteAv);
          try {
            localStorage.setItem(`vivu_user_avatar_${currentUserId}`, remoteAv);
            localStorage.setItem('vivu_user_avatar', remoteAv);
          } catch {}
        }
      }).catch(() => {});
    } catch (e) {
      console.warn('[App] Lỗi rehydrate avatar:', e);
    }
  }, [currentUserId, user?.id, user?.avatar_url, user?.user_metadata?.avatar_url]);

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

  // TỰ ĐỘNG PHỤC HỒI (REHYDRATE) STORY CỦA TÀI KHOẢN & TOÀN BỘ STORY CÒN HẠN TỪ DATABASE
  useEffect(() => {
    if (!currentUserId || currentUserId.startsWith('client-')) return;

    let isMounted = true;
    const now = Date.now();

    // Tầng 1: Phục hồi tức thì từ Scoped LocalStorage
    try {
      const scopedKey = `vivu_user_active_story_${currentUserId}`;
      const savedRaw = localStorage.getItem(scopedKey) || localStorage.getItem('vivu_user_active_story');
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        const expTime = parsed.expires_at 
          ? (typeof parsed.expires_at === 'number' ? parsed.expires_at : (Number(parsed.expires_at) || new Date(parsed.expires_at).getTime())) 
          : (parsed.created_at ? new Date(parsed.created_at).getTime() + (parsed.expiry_hours || 24) * 3600000 : 0);
        if (expTime > now && (parsed.hostId === currentUserId || parsed.host_id === currentUserId || parsed.isOwnerStory)) {
          const ownerStory = { ...parsed, isOwnerStory: true, activeStory: parsed };
          setStories(prev => {
            if (prev.some(s => s.id === ownerStory.id)) return prev;
            return [ownerStory, ...prev];
          });
          localStorage.setItem('vivu_user_active_story', JSON.stringify(ownerStory));
        } else if (expTime && expTime <= now) {
          localStorage.removeItem(scopedKey);
          localStorage.removeItem('vivu_user_active_story');
        }
      }
    } catch (e) {}

    // Tầng 2: Đồng bộ trực tiếp toàn bộ Story còn hạn từ Backend Server Database
    apiClient.getStories().then(remoteStories => {
      if (!isMounted || !Array.isArray(remoteStories)) return;
      const validStories = remoteStories
        .filter(rs => {
          if (!rs) return false;
          const expMs = rs.expires_at 
            ? (typeof rs.expires_at === 'number' ? rs.expires_at : (Number(rs.expires_at) || new Date(rs.expires_at).getTime())) 
            : (rs.created_at ? new Date(rs.created_at).getTime() + (rs.expiry_hours || 24) * 3600000 : 0);
          return expMs > now;
        })
        .map(rs => {
          const isOwner = (rs.host_id === currentUserId || rs.hostId === currentUserId);
          const mapped = {
            ...rs,
            id: rs.id,
            hostId: rs.host_id || rs.hostId,
            host_id: rs.host_id || rs.hostId,
            isOwnerStory: isOwner,
            activeStory: rs,
            realLat: rs.lat,
            realLng: rs.lng,
            lat: rs.lat,
            lng: rs.lng,
            image: rs.image || null,
            dual_image: rs.dual_image || null,
            music: rs.music || null,
            expires_at: rs.expires_at,
            created_at: rs.created_at,
            expiry_hours: rs.expiry_hours || 24
          };
          return mapped;
        });

      const ownerStoriesFromServer = validStories.filter(s => s.isOwnerStory);
      if (currentUserId && !currentUserId.startsWith('client-')) {
        if (ownerStoriesFromServer.length === 0) {
          // Backend không còn Story nào của chủ tài khoản -> Xóa sạch bộ nhớ đệm Story
          try {
            localStorage.removeItem('vivu_user_active_story');
            localStorage.removeItem('vivu_user_active_stories');
            localStorage.removeItem(`vivu_user_active_story_${currentUserId}`);
            localStorage.removeItem(`vivu_user_active_stories_${currentUserId}`);
          } catch {}
        } else {
          try {
            localStorage.setItem(`vivu_user_active_stories_${currentUserId}`, JSON.stringify(ownerStoriesFromServer));
            localStorage.setItem('vivu_user_active_stories', JSON.stringify(ownerStoriesFromServer));
            localStorage.setItem(`vivu_user_active_story_${currentUserId}`, JSON.stringify(ownerStoriesFromServer[0]));
            localStorage.setItem('vivu_user_active_story', JSON.stringify(ownerStoriesFromServer[0]));
          } catch {}
        }
      }

      setStories(prev => {
        const filteredPrev = (ownerStoriesFromServer.length === 0 && currentUserId)
          ? prev.filter(s => s.hostId !== currentUserId && s.host_id !== currentUserId && !s.isOwnerStory)
          : prev;
        const existingIds = new Set(validStories.map(s => s.id));
        const remainingPrev = filteredPrev.filter(s => !existingIds.has(s.id));
        return [...validStories, ...remainingPrev];
      });
    }).catch(() => {});

    return () => { isMounted = false; };
  }, [currentUserId]);

  // TỰ ĐỘNG PHỤC HỒI (REHYDRATE) STORY CHIBI, TÂM TRẠNG, BÀI HÁT & DIỆN MẠO GHIM SAU KHI ĐĂNG NHẬP (Rule 47 & 49)
  useEffect(() => {
    if (!currentUserId || currentUserId.startsWith('client-')) return;

    let isMounted = true;
    const now = Date.now();

    // Tầng 1: Phục hồi tức thì từ Scoped LocalStorage (0ms latency, không chớp ghim)
    try {
      const scopedChibiKey = `vivu_user_custom_chibi_${currentUserId}`;
      const scopedExpKey = `vivu_user_custom_chibi_expires_${currentUserId}`;
      const scopedStatusKey = `vivu_user_custom_status_${currentUserId}`;
      const scopedSongKey = `vivu_user_custom_song_${currentUserId}`;
      const scopedSkinKey = `vivu_user_pin_skin_${currentUserId}`;
      const scopedMascotKey = `vivu_user_pin_mascot_${currentUserId}`;
      const scopedActionKey = `vivu_user_pin_action_${currentUserId}`;

      const savedExp = Number(user?.chibi_expires_at || localStorage.getItem(scopedExpKey) || null);
      const isExp = savedExp && savedExp <= now;
      const savedChibi = isExp ? null : (user?.custom_chibi || localStorage.getItem(scopedChibiKey) || null);

      if (isExp) {
        localStorage.removeItem(scopedChibiKey);
        localStorage.removeItem(scopedExpKey);
        localStorage.removeItem('vivu_user_custom_chibi');
        localStorage.removeItem('vivu_user_custom_chibi_expires');
      }

      const rawStatus = user?.custom_status || localStorage.getItem(scopedStatusKey) || '';
      const cleanSavedStatus = (rawStatus === 'clear' || rawStatus === 'remove' || rawStatus === 'Khoảnh khắc mới' || rawStatus === 'Tâm trạng') ? '' : rawStatus;
      const savedSongRaw = user?.custom_song || localStorage.getItem(scopedSongKey) || null;
      let savedSong = null;
      if (savedSongRaw) {
        savedSong = typeof savedSongRaw === 'object' ? savedSongRaw : JSON.parse(savedSongRaw);
      }
      const savedSkin = user?.pin_skin || localStorage.getItem(scopedSkinKey) || 'auto';
      const savedMascot = user?.pin_mascot || localStorage.getItem(scopedMascotKey) || null;
      const savedAction = user?.pin_action || localStorage.getItem(scopedActionKey) || null;

      if (savedChibi) {
        setUserCustomChibi(savedChibi);
        setUserCustomChibiExpiresAt(savedExp || null);
      } else {
        setUserCustomChibi(null);
        setUserCustomChibiExpiresAt(null);
      }
      if (cleanSavedStatus) {
        setUserCustomStatus(cleanSavedStatus);
      } else {
        setUserCustomStatus('');
      }
      if (savedSong) {
        setUserCustomSong(savedSong);
      } else {
        setUserCustomSong(null);
      }
      setUserPinSkin(savedSkin || 'auto');
      setUserPinMascot(savedMascot || null);
      setUserPinAction(savedAction || null);
    } catch (e) {
      console.warn('[App] Lỗi nạp nhanh Story Chibi từ cache:', e);
    }

    // Tầng 2: Đồng bộ từ Database Backend Server
    apiClient.getMe(currentUserId).then(serverUser => {
      if (!isMounted || !serverUser) return;
      const expMs = serverUser.chibi_expires_at 
        ? (typeof serverUser.chibi_expires_at === 'number' ? serverUser.chibi_expires_at : (Number(serverUser.chibi_expires_at) || new Date(serverUser.chibi_expires_at).getTime())) 
        : null;
      const isExp = expMs && expMs <= Date.now();
      const serverChibi = isExp ? null : (serverUser.custom_chibi || null);

      if (serverChibi) {
        setUserCustomChibi(serverChibi);
        setUserCustomChibiExpiresAt(expMs);
        try {
          localStorage.setItem(`vivu_user_custom_chibi_${currentUserId}`, serverChibi);
          if (expMs) {
            localStorage.setItem(`vivu_user_custom_chibi_expires_${currentUserId}`, String(expMs));
          }
        } catch {}
      } else {
        setUserCustomChibi(null);
        setUserCustomChibiExpiresAt(null);
        try {
          localStorage.removeItem(`vivu_user_custom_chibi_${currentUserId}`);
          localStorage.removeItem(`vivu_user_custom_chibi_expires_${currentUserId}`);
        } catch {}
      }
      const cleanServerStatus = (serverUser.custom_status === 'clear' || serverUser.custom_status === 'remove' || serverUser.custom_status === 'Khoảnh khắc mới' || serverUser.custom_status === 'Tâm trạng') ? '' : (serverUser.custom_status || '');
      if (cleanServerStatus) {
        setUserCustomStatus(cleanServerStatus);
        try {
          localStorage.setItem(`vivu_user_custom_status_${currentUserId}`, cleanServerStatus);
        } catch {}
      } else {
        setUserCustomStatus('');
        try { 
          localStorage.removeItem(`vivu_user_custom_status_${currentUserId}`); 
          localStorage.removeItem('vivu_user_custom_status'); 
        } catch {}
      }
      if (serverUser.custom_song) {
        setUserCustomSong(serverUser.custom_song);
        try {
          const songStr = typeof serverUser.custom_song === 'object' ? JSON.stringify(serverUser.custom_song) : String(serverUser.custom_song);
          localStorage.setItem(`vivu_user_custom_song_${currentUserId}`, songStr);
        } catch {}
      } else {
        setUserCustomSong(null);
        try { localStorage.removeItem(`vivu_user_custom_song_${currentUserId}`); } catch {}
      }
      setUserPinSkin(serverUser.pin_skin || 'auto');
      setUserPinMascot(serverUser.pin_mascot || null);
      setUserPinAction(serverUser.pin_action || null);
      try {
        if (serverUser.pin_skin) localStorage.setItem(`vivu_user_pin_skin_${currentUserId}`, serverUser.pin_skin);
        if (serverUser.pin_mascot) localStorage.setItem(`vivu_user_pin_mascot_${currentUserId}`, serverUser.pin_mascot);
        else localStorage.removeItem(`vivu_user_pin_mascot_${currentUserId}`);
        if (serverUser.pin_action) localStorage.setItem(`vivu_user_pin_action_${currentUserId}`, serverUser.pin_action);
        else localStorage.removeItem(`vivu_user_pin_action_${currentUserId}`);
      } catch {}
    }).catch(() => {});

    return () => { isMounted = false; };
  }, [currentUserId]);

  // LẮNG NGHE SỰ KIỆN SOCKET.IO REALTIME
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // 1. Đối phương offline tức thì (đóng tab/thoát link) -> Xóa ngay giọt nước và bubble khỏi Xã hội, chuyển sang chế độ ẩn ở Bạn bè
    const handleUserOffline = ({ userId }) => {
      console.log(`[Socket.IO Client] [OFFLINE] Đối phương đã thoát: ${userId}`);
      setNearbyOnlinePeers(prev => prev.filter(p => p.id !== userId));
      // Ở tab Xã Hội: Xóa giọt nước và story live của người này khi họ offline
      setStories(prev => prev.filter(s => s.hostId !== userId && s.host_id !== userId && !s.id?.startsWith('live-peer-')));
      // Ở tab Bạn Bè: Đánh dấu triệt để tất cả cờ isOnline, is_online, online = false
      setFriends(prev => prev.map(f => f.id === userId ? { ...f, isOnline: false, is_online: false, online: false } : f));
      // Cập nhật cả danh sách tin nhắn hội thoại
      setConversations(prev => prev.map(c => c.friendId === userId ? { ...c, online: false, isOnline: false, is_online: false } : c));
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
        senderAvatar: notif.avatar || DEFAULT_WHITE_PERSON_AVATAR,
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

    // 10. Sự kiện Cụm Ly 3D (Spatial Bump Handshake Protocol) từ Socket.IO
    const handleBumpTrigger = (bumpData) => {
      console.log('[Socket.IO Client] [BUMP] Nhận sự kiện Cụm Ly 3D:', bumpData);
      setActiveBumpData(bumpData);
      setIsBumpMyReady(false);
      setIsBumpPeerReady(false);
      setIsBumpClinkTriggered(false);
      setIsBumpModalOpen(true);
      if (bumpData.story) {
        setStories(prev => {
          if (prev.some(s => s.id === bumpData.story.id)) return prev;
          return [bumpData.story, ...prev];
        });
      }
    };

    const handleBumpPeerReady = (data) => {
      console.log('[Socket.IO Client] [BUMP] Đối phương đã sẵn sàng chạm ly:', data);
      setIsBumpPeerReady(true);
    };

    const handleBumpClink = (data) => {
      console.log('[Socket.IO Client] [BUMP] 🎉 CẢ 2 BÊN ĐÃ SẴN SÀNG -> CỤNG LY THÀNH CÔNG:', data);
      setIsBumpClinkTriggered(true);
      if (data?.jointStory) {
        setStories(prev => {
          if (prev.some(s => s.id === data.jointStory.id)) return prev;
          return [data.jointStory, ...prev];
        });
      }
    };

    const handleBumpPeerCancelled = (data) => {
      console.log('[Socket.IO Client] [BUMP] Đối phương đã đóng/hủy cụng ly:', data);
      setIsBumpModalOpen(false);
      setIsBumpMyReady(false);
      setIsBumpPeerReady(false);
      setIsBumpClinkTriggered(false);
      setIncomingMessageToast({
        id: 'bump-cancelled-' + Date.now(),
        senderName: 'VIVU Spatial Bump',
        senderAvatar: DEFAULT_WHITE_PERSON_AVATAR,
        text: 'Đối phương đã đóng cửa sổ Cụng Ly.',
        isNotification: true
      });
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

    const handleTrollReceive = (data) => {
      if (!data || !data.meme) return;
      setActiveTakeoverMeme({
        meme: data.meme,
        quote: data.quote || data.meme.caption || '',
        senderName: data.senderName || 'Một người bạn',
        senderUser: data.senderUser || {
          id: data.senderId,
          name: data.senderName || 'Một người bạn',
          avatar: data.senderAvatar || ''
        },
        targetUser: data.targetUser || null
      });
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
    socket.on('spatial:bump-peer-ready', handleBumpPeerReady);
    socket.on('spatial:bump-clink', handleBumpClink);
    socket.on('spatial:bump-peer-cancelled', handleBumpPeerCancelled);
    socket.on('circle:invite', handleCircleInvite);
    socket.on('circle:member_joined', handleCircleMemberJoined);
    socket.on('circle:member_left', handleCircleMemberLeft);
    socket.on('circle:member_kicked', handleCircleMemberKicked);
    socket.on('circle:disbanded', handleCircleDisbanded);
    socket.on('circle:updated', handleCircleUpdated);
    socket.on('troll:receive', handleTrollReceive);
    socket.on('meme_troll', handleTrollReceive);

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
      socket.off('spatial:bump-peer-ready', handleBumpPeerReady);
      socket.off('spatial:bump-clink', handleBumpClink);
      socket.off('spatial:bump-peer-cancelled', handleBumpPeerCancelled);
      socket.off('circle:invite', handleCircleInvite);
      socket.off('circle:member_joined', handleCircleMemberJoined);
      socket.off('circle:member_left', handleCircleMemberLeft);
      socket.off('troll:receive', handleTrollReceive);
      socket.off('meme_troll', handleTrollReceive);
      socket.off('circle:member_kicked', handleCircleMemberKicked);
      socket.off('circle:disbanded', handleCircleDisbanded);
      socket.off('circle:updated', handleCircleUpdated);
    };
  }, [socket, currentUserId]);

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

  const handleAcceptFriendRequestFromNotification = async (requestId, fromUserId, notifId) => {
    if (!currentUserId) return;
    try {
      if (requestId) {
        const res = await apiClient.acceptFriendRequest(requestId, currentUserId);
        if (res?.success) {
          confetti({ particleCount: 60, spread: 80 });
        }
      }
    } catch (e) {
      console.warn('Accept friend request error:', e);
    }
    if (notifId) {
      setNotifications(prev => prev.filter(n => n.id !== notifId));
      try {
        await apiClient.deleteNotification(notifId);
      } catch {}
    }
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
  };

  const handleRejectFriendRequestFromNotification = async (requestId, notifId) => {
    if (!currentUserId) return;
    try {
      if (requestId) {
        await apiClient.rejectFriendRequest(requestId, currentUserId);
      }
    } catch (e) {
      console.warn('Reject friend request error:', e);
    }
    if (notifId) {
      setNotifications(prev => prev.filter(n => n.id !== notifId));
      try {
        await apiClient.deleteNotification(notifId);
      } catch {}
    }
    const [reqs, notifs] = await Promise.all([
      apiClient.getFriendRequests(currentUserId),
      apiClient.getNotifications(currentUserId)
    ]);
    if (reqs?.received) setPendingFriendRequests(reqs.received);
    if (Array.isArray(notifs)) {
      setNotifications(notifs);
      setUnreadNotificationsCount(notifs.filter(n => !n.read).length);
    }
  };

  const handleDeleteNotification = async (notifId) => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
    await apiClient.deleteNotification(notifId);
  };

  // Tính tọa độ cho story & bạn bè (Tự động loại bỏ story đã hết hạn - Feature 3)
  const liveStories = useMemo(() => {
    const now = Date.now();
    return stories
      .filter(s => {
        if (!s) return false;
        if (!s.expires_at) return true;
        const expMs = typeof s.expires_at === 'number' ? s.expires_at : (Number(s.expires_at) || new Date(s.expires_at).getTime());
        return expMs > now;
      })
      .map(s => {
        const rawLat = s.realLat != null ? Number(s.realLat) : (s.lat != null ? Number(s.lat) : (userLat != null ? Number((userLat + (s.latOffset || 0)).toFixed(6)) : 10.7769));
        const rawLng = s.realLng != null ? Number(s.realLng) : (s.lng != null ? Number(s.lng) : (userLng != null ? Number((userLng + (s.lngOffset || 0)).toFixed(6)) : 106.7009));
        const isOwner = Boolean(
          (currentUserId && (s.hostId === currentUserId || s.host_id === currentUserId || s.id === currentUserId)) ||
          s.isOwnerStory === true ||
          (currentUserCode && s.userCode && s.userCode === currentUserCode)
        );
        return {
          ...s,
          hostId: s.hostId || s.host_id || null,
          host_id: s.host_id || s.hostId || null,
          isOwnerStory: isOwner,
          realLat: rawLat,
          realLng: rawLng,
          lat: rawLat,
          lng: rawLng
        };
      });
  }, [stories, userLat, userLng, currentUserId, currentUserCode]);

  const myActiveStory = useMemo(() => {
    const found = liveStories.find(s => {
      if (!s) return false;
      if (currentUserId && (s.hostId === currentUserId || s.id === currentUserId || s.host_id === currentUserId)) return true;
      if (s.isOwnerStory === true) return true;
      return false;
    });
    if (found) return found;
    // Fallback tức thì từ Scoped LocalStorage nếu còn hạn
    try {
      const scopedKey = currentUserId ? `vivu_user_active_story_${currentUserId}` : null;
      const cachedRaw = (scopedKey ? localStorage.getItem(scopedKey) : null) || localStorage.getItem('vivu_user_active_story');
      if (cachedRaw) {
        const parsed = JSON.parse(cachedRaw);
        const expTime = parsed.expires_at ? new Date(parsed.expires_at).getTime() : 0;
        if (expTime > Date.now() && (!currentUserId || parsed.hostId === currentUserId || parsed.host_id === currentUserId || parsed.isOwnerStory)) {
          return { ...parsed, isOwnerStory: true, activeStory: parsed };
        }
      }
    } catch {}
    return null;
  }, [liveStories, currentUserId]);

  const liveFriends = useMemo(() => {
    return friends.map(f => {
      const latVal = f.realLat != null ? Number(f.realLat) : (f.lat != null ? Number(f.lat) : (userLat != null ? Number((userLat + (f.latOffset || 0)).toFixed(6)) : 16.0387));
      const lngVal = f.realLng != null ? Number(f.realLng) : (f.lng != null ? Number(f.lng) : (userLng != null ? Number((userLng + (f.lngOffset || 0)).toFixed(6)) : 108.2193));
      const fName = f.hostName || f.name || f.full_name || 'Bạn bè VIVU';
      const fAvatar = f.hostAvatar || f.avatar || f.avatar_url || null;
      return {
        ...f,
        realLat: latVal,
        realLng: lngVal,
        lat: latVal,
        lng: lngVal,
        hostName: fName,
        name: fName,
        hostAvatar: fAvatar,
        avatar: fAvatar,
        isOnline: Boolean(f.isOnline || f.is_online)
      };
    });
  }, [friends, userLat, userLng]);

  // Đếm số người lân cận trong bán kính Radar 5km (hoặc khoảng cách đang chọn)
  const radarResultsCount = useMemo(() => {
    const safeUserLat = userLat != null ? Number(userLat) : 10.7769;
    const safeUserLng = userLng != null ? Number(userLng) : 106.7009;
    const allItems = [...liveFriends, ...liveStories, ...nearbyOnlinePeers];
    const uniqueIds = new Set();
    let count = 0;
    const R = 6371;

    allItems.forEach(item => {
      if (!item) return;
      const itemId = item.id || item.hostId || item.host_id;
      if (!itemId || itemId === currentUserId || uniqueIds.has(itemId)) return;
      uniqueIds.add(itemId);
      const lat = item.realLat ?? item.lat;
      const lng = item.realLng ?? item.lng;
      if (lat != null && lng != null && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
        if (radarDistance === 'all') {
          count++;
        } else {
          const dLat = (Number(lat) - safeUserLat) * (Math.PI / 180);
          const dLon = (Number(lng) - safeUserLng) * (Math.PI / 180);
          const a = Math.sin(dLat / 2) ** 2 + Math.cos(safeUserLat * Math.PI / 180) * Math.cos(Number(lat) * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
          const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          if (distKm <= Number(radarDistance)) count++;
        }
      }
    });
    return count;
  }, [liveFriends, liveStories, nearbyOnlinePeers, userLat, userLng, currentUserId, radarDistance]);

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

  // Xử lý gửi tín hiệu sẵn sàng Cụng Ly (Mutual Handshake Ready)
  const handleBumpReady = useCallback(() => {
    if (!activeBumpData) return;
    setIsBumpMyReady(true);
    const partnerId = activeBumpData.initiatorId === currentUserId
      ? (activeBumpData.targetUserId || activeBumpData.targetId)
      : activeBumpData.initiatorId;

    if (socket && socket.connected) {
      socket.emit('spatial:bump-ready', {
        targetUserId: partnerId,
        sessionId: activeBumpData.sessionId
      });
    }
  }, [activeBumpData, currentUserId, socket]);

  // Xử lý đóng Modal Cụng Ly & thông báo hủy cho đối phương nếu chưa cụng ly
  const handleCloseBumpModal = useCallback(() => {
    if (isBumpModalOpen && activeBumpData && !isBumpClinkTriggered) {
      const partnerId = activeBumpData.initiatorId === currentUserId
        ? (activeBumpData.targetUserId || activeBumpData.targetId)
        : activeBumpData.initiatorId;
      if (partnerId && socket && socket.connected) {
        socket.emit('spatial:bump-cancel', { targetUserId: partnerId });
      }
    }
    setIsBumpModalOpen(false);
    setIsBumpMyReady(false);
    setIsBumpPeerReady(false);
    setIsBumpClinkTriggered(false);
  }, [isBumpModalOpen, activeBumpData, isBumpClinkTriggered, currentUserId, socket]);



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
        if (currentUserId && (currentUserId.startsWith('user-') || currentUserId.startsWith('client-'))) {
          let safeChibi = userCustomChibi;
          let safeChibiExp = userCustomChibiExpiresAt;
          if (!safeChibi && currentUserId) {
            try {
              const expRaw = localStorage.getItem(`vivu_user_custom_chibi_expires_${currentUserId}`);
              const expTime = expRaw ? Number(expRaw) : null;
              if (expTime && expTime > Date.now()) {
                safeChibi = localStorage.getItem(`vivu_user_custom_chibi_${currentUserId}`) || null;
                safeChibiExp = expTime;
              }
            } catch {}
          }
          let safeStatus = (userCustomStatus === 'Khoảnh khắc mới' || userCustomStatus === 'Tâm trạng') ? '' : userCustomStatus;
          if (!safeStatus && currentUserId) {
            try {
              safeStatus = localStorage.getItem(`vivu_user_custom_status_${currentUserId}`) || '';
            } catch {}
          }

          await apiClient.updateGps(
            currentUserId,
            userLat,
            userLng,
            safeStatus,
            currentUserName,
            currentUserAvatar,
            currentUserCode,
            user?.phone,
            userCustomSong,
            safeChibi,
            userPinSkin,
            userPinMascot,
            userPinAction,
            safeChibiExp
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
              senderAvatar: p.avatar_url || p.avatar || DEFAULT_WHITE_PERSON_AVATAR,
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
                const fLat = livePeer?.lat != null ? Number(livePeer.lat) : (af.lat != null ? Number(af.lat) : 10.7769);
                const fLng = livePeer?.lng != null ? Number(livePeer.lng) : (af.lng != null ? Number(af.lng) : 106.7009);
                const fName = af.name || af.full_name || livePeer?.full_name || 'Bạn bè VIVU';
                const fAvatar = getSafeAvatar(af.avatar || af.avatar_url || livePeer?.avatar_url);
                return {
                  ...af,
                  id: af.id,
                  hostId: af.id,
                  name: fName,
                  hostName: fName,
                  avatar: fAvatar,
                  hostAvatar: fAvatar,
                  realLat: fLat,
                  realLng: fLng,
                  lat: fLat,
                  lng: fLng,
                  isOnline: isPeerOnline,
                  battery: livePeer?.battery || '95%',
                  lastSeenLocation: livePeer?.last_seen_text || (isPeerOnline ? 'Đang hoạt động' : 'Đã offline'),
                  custom_status: livePeer?.custom_status || af.custom_status || '',
                  title: livePeer?.custom_status || af.custom_status || (isPeerOnline ? 'Đang trực tuyến' : 'Đã offline'),
                  userCode: livePeer?.user_code || af.user_code || '',
                  isFriend: true
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

        // 4. Đồng bộ Story thật: Loại bỏ story hết hạn & triệt tiêu hoàn toàn Story mockup (live-peer)
        setStories(prevStories => {
          let hasChange = false;
          // Loại bỏ toàn bộ ghim live-peer- hoặc story của tài khoản đã hết hạn
          let updated = prevStories.filter(s => {
            // Loại bỏ hoàn toàn mọi story mockup live-peer-
            if (s.id?.startsWith('live-peer-')) {
              hasChange = true;
              return false;
            }
            // BẢO VỆ STORY CỦA CHÍNH MÌNH (Không bao giờ bị xóa khỏi radar của mình)
            if (s.hostId === currentUserId || s.isOwnerStory || (s.userCode && s.userCode === currentUserCode)) {
              return true;
            }
            if (s.expires_at) {
              // BẢO VỆ STORY THẬT: Chỉ loại bỏ khi thời hạn thực sự đã hết
              const expMs = typeof s.expires_at === 'number' ? s.expires_at : (Number(s.expires_at) || new Date(s.expires_at).getTime());
              if (expMs && expMs <= Date.now()) {
                hasChange = true;
                return false;
              }
              return true;
            } else if (s.hostId && s.hostId.startsWith('user-')) {
              if (!activePeerIds.has(s.hostId)) {
                hasChange = true;
                return false;
              }
            }
            return true;
          });

          // TUYỆT ĐỐI KHÔNG TỰ ĐỘNG CHÈN MOCKUP STORY CHO NGƯỜI DÙNG ONLINE
          // Người dùng online không có story đã được đưa vào nearbyOnlinePeers và hiển thị chuẩn qua nonStoryOnlinePeers.
          return hasChange ? updated : prevStories;
        });


          // Đồng bộ trạng thái online và avatar cho các hội thoại 1-1
          setConversations(prevConvs => {
            let updatedConvs = [...prevConvs];
            let convChanged = false;

            onlineOtherProfiles.forEach(p => {
              const pName = p.full_name || p.name || 'Người dùng VIVU';
              const pAvatar = p.avatar_url || p.avatar || DEFAULT_WHITE_PERSON_AVATAR;
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
                  (rs.host_id && (s.hostId === rs.host_id || s.host_id === rs.host_id || s.id === rs.host_id)) ||
                  (rs.user_code && s.userCode && s.userCode === rs.user_code) ||
                  (rs.host_name && (s.hostName === rs.host_name || s.name === rs.host_name))
                );

                if (peerIdx >= 0) {
                  // ĐÃ TỒN TẠI GIỌT NƯỚC CỦA NGƯỜI NÀY -> HỢP NHẤT VÀO 1 GIỌT NƯỚC DUY NHẤT (Rule 30)
                  const cur = updated[peerIdx];
                  const isCurOwner = cur.isOwnerStory || (currentUserId && (cur.hostId === currentUserId || cur.host_id === currentUserId));
                  const curCreated = new Date(cur.created_at || cur.createdAt || 0).getTime();
                  const rsCreated = new Date(rs.created_at || rs.createdAt || 0).getTime();

                  // Nếu là bài của chính mình và bài cục bộ mới hơn hoặc bài remote thiếu ảnh -> Giữ nguyên bài cục bộ
                  if (isCurOwner && curCreated > rsCreated && cur.image) {
                    return;
                  }

                  if (!cur.activeStory || cur.activeStory.id !== rs.id || cur.image !== rs.image) {
                    hasNew = true;
                    const mergedStory = {
                      ...cur,
                      hostId: rs.host_id || cur.hostId,
                      host_id: rs.host_id || cur.host_id,
                      userCode: rs.user_code || cur.userCode,
                      activeStory: rs,
                      storyTitle: rs.title,
                      storyDescription: rs.description,
                      category: rs.category || cur.category || 'moment',
                      image: rs.image || cur.image || null,
                      dual_image: rs.dual_image || cur.dual_image || null,
                      music: rs.music || cur.music || null,
                      video: rs.video || cur.video || null,
                      title: rs.title || cur.title,
                      expires_at: rs.expires_at || cur.expires_at,
                      created_at: rs.created_at || cur.created_at,
                      expiry_hours: rs.expiry_hours || cur.expiry_hours || 24,
                      isOwnerStory: Boolean(isCurOwner || rs.host_id === currentUserId)
                    };
                    updated[peerIdx] = mergedStory;
                    if (isCurOwner && currentUserId) {
                      try {
                        localStorage.setItem(`vivu_user_active_story_${currentUserId}`, JSON.stringify(mergedStory));
                        localStorage.setItem('vivu_user_active_story', JSON.stringify(mergedStory));
                      } catch {}
                    }
                  }
                } else {
                  // Đưa Story thực tế từ xa lên bản đồ (Bất kể thời điểm heartbeat, đảm bảo đồng bộ 100%)
                  const isOwnerStory = rs.host_id === currentUserId || (currentUserCode && rs.user_code === currentUserCode);
                  const sId = rs.id || `remote-${rs.created_at}`;
                  if (!updated.some(s => s.id === sId || s.hostId === rs.host_id || s.host_id === rs.host_id)) {
                    hasNew = true;
                    const unshiftedStory = {
                      id: sId,
                      hostId: rs.host_id || null,
                      host_id: rs.host_id || null,
                      userCode: rs.user_code || '',
                      hostName: rs.host_name,
                      hostAvatar: rs.host_avatar || (rs.user_code ? DEFAULT_WHITE_PERSON_AVATAR : null),
                      activeStory: rs,
                      isOwnerStory: isOwnerStory,
                      category: rs.category || 'moment',
                      title: rs.title,
                      description: rs.description,
                      address: rs.address || 'Quanh đây',
                      realLat: rs.lat,
                      realLng: rs.lng,
                      lat: rs.lat,
                      lng: rs.lng,
                      image: rs.image || null,
                      dual_image: rs.dual_image || null,
                      texts: rs.texts || [],
                      stickers: rs.stickers || [],
                      music: rs.music || null,
                      video: rs.video || null,
                      privacy: rs.privacy || 'public',
                      expires_at: rs.expires_at,
                      created_at: rs.created_at,
                      expiry_hours: rs.expiry_hours || 24,
                      isOnline: true
                    };
                    updated.unshift(unshiftedStory);
                    if (isOwnerStory && currentUserId) {
                      try {
                        localStorage.setItem(`vivu_user_active_story_${currentUserId}`, JSON.stringify(unshiftedStory));
                        localStorage.setItem('vivu_user_active_story', JSON.stringify(unshiftedStory));
                      } catch {}
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

    // Vòng lặp định kỳ (Giãn chu kỳ khi có Socket.IO để bảo vệ pin và chống crash RAM thiết bị di động)
    const heartbeatTimer = setInterval(syncHeartbeat, isSocketConnected ? 8000 : 4000);

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
  }, [user?.id, user?.email, user?.user_metadata, userLat, userLng, userCustomStatus, currentUserId, currentUserName, currentUserAvatar, userCustomSong, userCustomChibi, userCustomChibiExpiresAt, userPinSkin, userPinMascot, userPinAction, isSocketConnected]);

  // Bộ đếm định kỳ tự động thu hồi Chibi khi hết thời gian tự hủy
  useEffect(() => {
    if (!userCustomChibiExpiresAt) return;
    const interval = setInterval(() => {
      if (Date.now() > userCustomChibiExpiresAt) {
        setUserCustomChibi(null);
        setUserCustomChibiExpiresAt(null);
        try {
          if (currentUserId) {
            localStorage.removeItem(`vivu_user_custom_chibi_${currentUserId}`);
            localStorage.removeItem(`vivu_user_custom_chibi_expires_${currentUserId}`);
          }
          localStorage.removeItem('vivu_user_custom_chibi');
          localStorage.removeItem('vivu_user_custom_chibi_expires');
        } catch {}
        if (currentUserId && userLat && userLng) {
          apiClient.updateGps(currentUserId, userLat, userLng, userCustomStatus || '', currentUserName, currentUserAvatar, currentUserCode, user?.phone, userCustomSong, null, userPinSkin, userPinMascot, userPinAction, null);
        }
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [userCustomChibiExpiresAt, currentUserId, userLat, userLng, userCustomStatus, currentUserName, currentUserAvatar, currentUserCode, user?.phone, userCustomSong, userPinSkin, userPinMascot, userPinAction]);

  // Tự động dọn sạch bài hát & trạng thái mồ côi nếu người dùng không còn Story nào
  useEffect(() => {
    // 1. Nếu trạng thái đang là tiêu đề mặc định của Story cũ, dọn sạch ngay
    if (userCustomStatus === 'Khoảnh khắc mới' || userCustomStatus === 'Tâm trạng') {
      setUserCustomStatus('');
      setUserCustomSong(null);
      safeRemoveItem('vivu_user_custom_status');
      safeRemoveItem('vivu_user_custom_song');
      try {
        localStorage.removeItem('vivu_user_custom_status');
        localStorage.removeItem('vivu_user_custom_song');
      } catch {}
      if (currentUserId && userLat && userLng) {
        apiClient.updateGps(
          currentUserId,
          userLat,
          userLng,
          '',
          currentUserName,
          currentUserAvatar,
          currentUserCode,
          user?.phone,
          null,
          userCustomChibi,
          userPinSkin,
          userPinMascot,
          userPinAction
        ).catch(() => {});
      }
      return;
    }

    // Chỉ dọn dẹp active story khi Story thực tế trong bộ nhớ đã hết hạn (expTime <= now)
    try {
      const scopedKey = currentUserId ? `vivu_user_active_story_${currentUserId}` : null;
      const cached = (scopedKey ? localStorage.getItem(scopedKey) : null) || localStorage.getItem('vivu_user_active_story');
      if (cached) {
        const parsed = JSON.parse(cached);
        const expTime = parsed.expires_at ? new Date(parsed.expires_at).getTime() : 0;
        if (expTime && expTime <= Date.now()) {
          safeRemoveItem('vivu_user_active_story');
          localStorage.removeItem('vivu_user_active_story');
          if (scopedKey) localStorage.removeItem(scopedKey);
        }
      }
    } catch {}
  }, [stories, currentUserId, userCustomSong, userCustomStatus, userCustomChibi, userPinSkin, userPinMascot, userPinAction, userLat, userLng]);

  // LẮNG NGHE & ĐỒNG BỘ TIN NHẮN THỜI GIAN THỰC (REALTIME CHAT POLLING)
  // Giúp 2 thiết bị (PC & Điện thoại) nhận tin nhắn tức thì của nhau trong phòng chat
  useEffect(() => {
    if (!activeConversationId) return;

    let isMounted = true;
    const pollMessages = async () => {
      if (document.hidden) return;
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
              ...m,
              id: m.id || m.client_msg_id,
              client_msg_id: m.client_msg_id,
              sender: isMe ? 'me' : 'them',
              senderName: m.sender_name || (isMe ? 'Bạn' : curConv.name),
              text: m.text || '',
              image: m.image || null,
              video: m.video || null,
              isHeart: Boolean(m.is_heart || m.isHeart || m.text === '❤️'),
              is_heart: Boolean(m.is_heart || m.isHeart || m.text === '❤️'),
              isLocation: Boolean(m.is_location || m.isLocation),
              is_location: Boolean(m.is_location || m.isLocation),
              isLiveLocation: Boolean(m.is_live_location || m.isLiveLocation),
              is_live_location: Boolean(m.is_live_location || m.isLiveLocation),
              live_status: m.live_status || (m.is_live_location ? 'active' : null),
              live_duration_minutes: m.live_duration_minutes || null,
              live_expires_at: m.live_expires_at || null,
              speed: (m.speed != null && !isNaN(Number(m.speed))) ? Number(m.speed) : null,
              isPoll: Boolean(m.is_poll || m.isPoll || m.poll),
              is_poll: Boolean(m.is_poll || m.isPoll || m.poll),
              poll: m.poll || null,
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
    const msgInterval = setInterval(pollMessages, isSocketConnected ? 5000 : 2000);

    return () => {
      isMounted = false;
      clearInterval(msgInterval);
    };
  }, [activeConversationId, currentUserId, isSocketConnected]);

  // THÔNG BÁO TIN NHẮN ĐẾN TOÀN CỤC (GLOBAL INBOX NOTIFICATION LISTENER)
  // Giúp người dùng dù đang ở bất kỳ màn hình nào (Bản đồ, Xã hội, Bạn bè, Tôi)
  // cũng nhận được thông báo nổi + âm thanh tin nhắn "Ting-Ting" riêng biệt khi có người nhắn tới!
  useEffect(() => {
    if (!currentUserId) return;

    let isMounted = true;
    const checkGlobalInbox = async () => {
      if (document.hidden) return;
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
                  avatar: DEFAULT_WHITE_PERSON_AVATAR,
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
                senderAvatar: DEFAULT_WHITE_PERSON_AVATAR,
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

    const inboxInterval = setInterval(checkGlobalInbox, isSocketConnected ? 8000 : 3000);
    return () => {
      isMounted = false;
      clearInterval(inboxInterval);
    };
  }, [currentUserId, activeTab, activeConversationId, isSocketConnected]);

  // ĐỒNG BỘ THỜI GIAN THỰC TIN NHẮN 2 CHIỀU KHI ĐANG MỞ PHÒNG CHAT (POLLING 1.5s)
  useEffect(() => {
    if (!activeConversationId) return;

    let isMounted = true;
    const fetchChatMessages = async () => {
      if (document.hidden) return;
      try {
        const msgs = await apiClient.getMessages(activeConversationId);
        if (!isMounted || !Array.isArray(msgs)) return;

        setConversations(prevConvs => {
          return prevConvs.map(c => {
            if (c.id === activeConversationId) {
              const mapped = msgs.map(m => {
                const isMe = (m.sender === currentUserId || m.sender === 'me');
                return {
                  ...m,
                  id: m.id || m.client_msg_id,
                  client_msg_id: m.client_msg_id,
                  sender: isMe ? 'me' : 'them',
                  senderName: m.sender_name || (isMe ? 'Bạn' : c.name),
                  text: m.text || '',
                  image: m.image,
                  video: m.video,
                  isHeart: Boolean(m.is_heart || m.isHeart || m.text === '❤️'),
                  is_heart: Boolean(m.is_heart || m.isHeart || m.text === '❤️'),
                  isLocation: Boolean(m.is_location || m.isLocation),
                  is_location: Boolean(m.is_location || m.isLocation),
                  isLiveLocation: Boolean(m.is_live_location || m.isLiveLocation),
                  is_live_location: Boolean(m.is_live_location || m.isLiveLocation),
                  live_status: m.live_status || (m.is_live_location ? 'active' : null),
                  live_duration_minutes: m.live_duration_minutes || null,
                  live_expires_at: m.live_expires_at || null,
                  speed: (m.speed != null && !isNaN(Number(m.speed))) ? Number(m.speed) : null,
                  isPoll: Boolean(m.is_poll || m.isPoll || m.poll),
                  is_poll: Boolean(m.is_poll || m.isPoll || m.poll),
                  poll: m.poll || null,
                  lat: m.lat,
                  lng: m.lng,
                  time: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'
                };
              });
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
    const chatInterval = setInterval(fetchChatMessages, isSocketConnected ? 4000 : 1500);
    return () => {
      isMounted = false;
      clearInterval(chatInterval);
    };
  }, [activeConversationId, currentUserId, isSocketConnected]);

  // CẬP NHẬT ẢNH ĐẠI DIỆN HỒ SƠ & ĐỒNG BỘ TỨC THÌ LÊN GIỌT NƯỚC BẢN ĐỒ VÀ MÁY KHÁC
  const handleDirectUpdateAvatar = async (newAvatar, newPhotos) => {
    const finalAvatar = newAvatar || null;
    // 1. Cập nhật state cục bộ ngay lập tức để giọt nước đổi avatar tức thì
    setCustomAvatar(finalAvatar);
    if (finalAvatar) {
      safeSetItem('vivu_user_avatar', finalAvatar);
      if (currentUserId) {
        safeSetItem(`vivu_user_avatar_${currentUserId}`, finalAvatar);
      }
    } else {
      safeRemoveItem('vivu_user_avatar');
      if (currentUserId) {
        safeRemoveItem(`vivu_user_avatar_${currentUserId}`);
      }
    }

    // Cập nhật ngay ảnh đại diện cho các Story chính chủ đang hiển thị
    setStories(prev => prev.map(s => {
      if (s.hostId === currentUserId || s.isOwnerStory) {
        return { ...s, hostAvatar: finalAvatar || '' };
      }
      return s;
    }));

    // 2. Cập nhật vào Auth Profile & Metadata (Giữ nguyên các trường thông tin cá nhân hiện có)
    try {
      const scopedKey = currentUserId && !currentUserId.startsWith('client-') ? `vivu_user_profile_data_${currentUserId}` : null;
      const existingRaw = (scopedKey ? localStorage.getItem(scopedKey) : null) || localStorage.getItem('vivu_user_profile_data');
      const existing = existingRaw ? JSON.parse(existingRaw) : {};
      const updatedProfile = {
        ...existing,
        userId: currentUserId,
        fullName: currentUserName || existing.fullName,
        avatarUrl: finalAvatar || '',
        avatar_url: finalAvatar || '',
        customStatus: userCustomStatus || existing.customStatus,
        photos: newPhotos || existing.photos
      };
      safeSetItem('vivu_user_profile_data', JSON.stringify(updatedProfile));
      if (scopedKey) {
        safeSetItem(scopedKey, JSON.stringify(updatedProfile));
      }
      await updateProfile(updatedProfile);
    } catch (e) {
      console.warn('Lỗi lưu auth profile:', e);
    }

    // 3. Phát sóng tức thì tọa độ kèm Avatar mới lên Backend Server
    try {
      if (currentUserId && userLat && userLng) {
        await apiClient.updateGps(
          currentUserId,
          userLat,
          userLng,
          userCustomStatus,
          currentUserName,
          finalAvatar || '',
          currentUserCode,
          user?.phone,
          userCustomSong,
          userCustomChibi,
          userPinSkin,
          userPinMascot,
          userPinAction
        );
      }
    } catch (e) {
      console.warn('Lỗi broadcast GPS avatar:', e);
    }

    if (finalAvatar) {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
    }
  };

  // Quét Radar thủ công
  // Cập nhật đầy đủ thông tin Hồ Sơ Cá Nhân (Họ tên, Bio, SĐT, Tuổi, Avatar, Trạng thái, Quyền riêng tư)
  const handleUpdateFullProfile = async (profileData) => {
    try {
      if (profileData.avatarUrl !== undefined) {
        const finalAvatar = profileData.avatarUrl || null;
        setCustomAvatar(finalAvatar);
        if (finalAvatar) {
          safeSetItem('vivu_user_avatar', finalAvatar);
          if (currentUserId) safeSetItem(`vivu_user_avatar_${currentUserId}`, finalAvatar);
        } else {
          safeRemoveItem('vivu_user_avatar');
          if (currentUserId) safeRemoveItem(`vivu_user_avatar_${currentUserId}`);
        }
        setStories(prev => prev.map(s => {
          if (s.hostId === currentUserId || s.isOwnerStory) {
            return { ...s, hostAvatar: finalAvatar || '' };
          }
          return s;
        }));
      }
      if (profileData.fullName) {
        safeSetItem('vivu_user_name', profileData.fullName);
      }
      if (profileData.customStatus) {
        setUserCustomStatus(profileData.customStatus);
        safeSetItem('vivu_user_custom_status', profileData.customStatus);
      }
      // Lưu tức thì vào bộ nhớ độc lập để trang cá nhân hiển thị ngay lập tức
      try {
        const targetId = profileData.userId || currentUserId;
        const scopedKey = targetId && targetId !== 'guest' ? `vivu_user_profile_data_${targetId}` : null;
        const existingRaw = localStorage.getItem('vivu_user_profile_data');
        const existing = existingRaw ? JSON.parse(existingRaw) : {};
        const merged = {
          ...existing,
          ...profileData,
          fullName: profileData.fullName || existing.fullName || currentUserName,
          avatarUrl: profileData.avatarUrl !== undefined ? profileData.avatarUrl : (existing.avatarUrl || currentUserAvatar)
        };
        localStorage.setItem('vivu_user_profile_data', JSON.stringify(merged));
        if (scopedKey) localStorage.setItem(scopedKey, JSON.stringify(merged));
      } catch {}

      const res = await updateProfile({ ...profileData, userId: profileData.userId || currentUserId });
      if (res && res.success !== false) {
        setRadarPingNotification('Đã lưu thông tin hồ sơ thành công!');
        confetti({ particleCount: 30, spread: 50 });
      } else {
        setRadarPingNotification('Đã lưu thông tin hồ sơ!');
      }
    } catch (e) {
      console.warn('Lỗi updateProfile:', e);
      setRadarPingNotification('Đã lưu thông tin hồ sơ!');
    }
    syncHeartbeat();
  };

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

  // Mở trình xem Story từng cái một (Multi-Story Carousel Navigation)
  const handleOpenStoryViewer = (targetStory) => {
    if (!targetStory) return;
    const actual = targetStory.activeStory || targetStory;
    const hostId = actual.hostId || actual.host_id || actual.id;
    const userCode = actual.userCode || actual.user_code;
    const isOwner = Boolean(
      (currentUserId && (hostId === currentUserId || targetStory.id === currentUserId)) ||
      (currentUserCode && (userCode === currentUserCode)) ||
      actual.isOwnerStory ||
      targetStory.isOwnerStory
    );

    // Gom toàn bộ story của người này
    const matchedStories = liveStories.filter(s => {
      if (!s) return false;
      const curActual = s.activeStory || s;
      if (isOwner) {
        return Boolean(
          (currentUserId && (curActual.host_id === currentUserId || curActual.hostId === currentUserId || s.hostId === currentUserId || s.id === currentUserId)) ||
          (currentUserCode && (curActual.user_code === currentUserCode || curActual.userCode === currentUserCode || s.userCode === currentUserCode)) ||
          s.isOwnerStory ||
          curActual.isOwnerStory
        );
      }
      if (hostId && (curActual.host_id === hostId || curActual.hostId === hostId || s.hostId === hostId || s.id === hostId)) return true;
      if (userCode && (curActual.user_code === userCode || curActual.userCode === userCode || s.userCode === userCode)) return true;
      return false;
    });

    const finalStoryList = matchedStories.length > 0 ? matchedStories : [targetStory];
    const foundIndex = finalStoryList.findIndex(s => {
      const sId = s.id || s.activeStory?.id;
      const targetId = targetStory.id || actual.id;
      return sId === targetId;
    });

    setSelectedInteractiveStory(targetStory);
    setSelectedInteractiveStoryList(finalStoryList);
    setSelectedStoryInitialIndex(foundIndex >= 0 ? foundIndex : 0);
  };

  // Xóa Story khỏi ứng dụng và cơ sở dữ liệu (Hỗ trợ tùy chọn lưu trữ Kho Kỷ Niệm)
  const handleDeleteStory = async (targetStoryOrId, { preserveInArchive = false } = {}) => {
    const storyId = typeof targetStoryOrId === 'string' 
      ? targetStoryOrId 
      : (targetStoryOrId?.id || targetStoryOrId?.activeStory?.id);
    if (!storyId) return;

    const archiveKey = `vivu_user_story_archive_${currentUserId || 'guest'}`;

    if (preserveInArchive) {
      try {
        const saved = localStorage.getItem(archiveKey);
        let list = saved ? JSON.parse(saved) : [];
        const storyObj = typeof targetStoryOrId === 'object' 
          ? targetStoryOrId 
          : stories.find(s => s.id === storyId || s.activeStory?.id === storyId);
        
        if (storyObj) {
          const actual = storyObj.activeStory || storyObj;
          const itemToArchive = {
            id: actual.id || `archived-${Date.now()}`,
            image: actual.image || actual.memeImage || actual.dual_image,
            video: actual.video || null,
            title: actual.title || 'Khoảnh khắc',
            description: actual.description || '',
            created_at: actual.created_at || new Date().toISOString(),
            archived_at: new Date().toISOString()
          };
          list = [itemToArchive, ...list.filter(item => item.id !== itemToArchive.id)];
          localStorage.setItem(archiveKey, JSON.stringify(list));
        }
      } catch (e) {
        console.warn('[Archive save error]:', e);
      }
    } else {
      // Xóa vĩnh viễn khỏi cả Kho Lưu Trữ
      try {
        const saved = localStorage.getItem(archiveKey);
        if (saved) {
          let list = JSON.parse(saved);
          list = list.filter(item => item.id !== storyId);
          localStorage.setItem(archiveKey, JSON.stringify(list));
        }
      } catch (e) {}
    }

    // Gỡ khỏi danh sách Story hiển thị trên bản đồ 3D
    setStories(prev => prev.filter(s => s.id !== storyId && s.activeStory?.id !== storyId));

    // 1. Tính toán danh sách Multi-Story còn lại của người dùng
    let remainingOwnerStories = [];
    try {
      const scopedListKey = currentUserId ? `vivu_user_active_stories_${currentUserId}` : null;
      const rawList = (scopedListKey ? localStorage.getItem(scopedListKey) : null) || localStorage.getItem('vivu_user_active_stories');
      if (rawList) {
        const parsed = JSON.parse(rawList);
        if (Array.isArray(parsed)) {
          remainingOwnerStories = parsed.filter(s => s.id !== storyId && s.activeStory?.id !== storyId);
        }
      }
    } catch {}

    if (remainingOwnerStories.length === 0) {
      // Đã xóa hết 100% Story -> Dọn sạch triệt để mọi khóa Story, Song và Status
      const keysToClean = [
        'vivu_user_active_story',
        'vivu_user_active_stories',
        'vivu_user_custom_song',
        'vivu_user_custom_status'
      ];
      if (currentUserId) {
        keysToClean.push(
          `vivu_user_active_story_${currentUserId}`,
          `vivu_user_active_stories_${currentUserId}`,
          `vivu_user_custom_song_${currentUserId}`,
          `vivu_user_custom_status_${currentUserId}`
        );
      }
      keysToClean.forEach(k => {
        try {
          localStorage.removeItem(k);
          safeRemoveItem(k);
        } catch {}
      });

      // Dừng phát nhạc ngay lập tức khi xóa Story
      try {
        storyAudioPlayer.stop();
      } catch {}

      setUserCustomSong(null);
      setUserCustomStatus('');

      // Cập nhật Profile và GPS xóa sạch nhạc và tâm trạng trên Backend
      try {
        await updateProfile({ customStatus: 'clear', custom_song: null });
      } catch {}

      try {
        await apiClient.updateGps(
          currentUserId,
          userLat,
          userLng,
          'clear',
          currentUserName,
          currentUserAvatar,
          currentUserCode,
          user?.phone,
          null,
          userCustomChibi,
          userPinSkin,
          userPinMascot,
          userPinAction,
          userCustomChibiExpiresAt
        );
      } catch (e) {
        console.warn('Lỗi dọn sạch nhạc story GPS:', e);
      }
    } else {
      // Vẫn còn Story khác trong chuỗi Multi-Story -> Cập nhật lại cache
      try {
        localStorage.setItem('vivu_user_active_stories', JSON.stringify(remainingOwnerStories));
        if (currentUserId) {
          localStorage.setItem(`vivu_user_active_stories_${currentUserId}`, JSON.stringify(remainingOwnerStories));
        }
        const newest = remainingOwnerStories[0];
        localStorage.setItem('vivu_user_active_story', JSON.stringify(newest));
        if (currentUserId) {
          localStorage.setItem(`vivu_user_active_story_${currentUserId}`, JSON.stringify(newest));
        }

        const remainingSong = remainingOwnerStories.find(s => s.music || s.activeStory?.music)?.music || null;
        if (!remainingSong) {
          setUserCustomSong(null);
          try {
            localStorage.removeItem('vivu_user_custom_song');
            if (currentUserId) localStorage.removeItem(`vivu_user_custom_song_${currentUserId}`);
            storyAudioPlayer.stop();
          } catch {}
          await updateProfile({ custom_song: null }).catch(() => {});
          await apiClient.updateGps(
            currentUserId,
            userLat,
            userLng,
            userCustomStatus || '',
            currentUserName,
            currentUserAvatar,
            currentUserCode,
            user?.phone,
            null,
            userCustomChibi,
            userPinSkin,
            userPinMascot,
            userPinAction,
            userCustomChibiExpiresAt
          ).catch(() => {});
        }
      } catch {}
    }

    // Gửi request DELETE lên backend server
    await apiClient.deleteStory(storyId, currentUserId, currentUserCode);
  };

  // Nhắn tin trực tiếp từ Story hoặc Hồ sơ khách
  // Mở hồ sơ người dùng toàn màn hình với nhận diện nguồn gốc (Origin-Aware)
  const handleOpenUserProfile = (profile, originSource = 'map') => {
    setUserProfileOriginSource(originSource);
    setSelectedUserProfile(profile);
  };

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
      setRadarPingNotification(`Đã hủy kết bạn với ${hostName}`);
    } else {
      if (targetUserId && currentUserId && targetUserId !== currentUserId) {
        try {
          await apiClient.sendFriendRequest(currentUserId, targetUserId);
        } catch (e) {
          console.warn('sendFriendRequest error:', e);
        }
      }
      // Không tự ý add vào friends khi mới chỉ gửi lời mời kết bạn!
      setRadarPingNotification(`Đã gửi lời mời kết bạn đến ${hostName}`);
      confetti({ particleCount: 30, spread: 50 });
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
      created_at: new Date().toISOString(),
      privacy: isFriendsOnly ? 'friends' : (storyData.privacy || 'public')
    };
    newStory.activeStory = newStory;

    setStories(prev => {
      const updated = [newStory, ...prev.filter(s => s.id !== newStory.id)];
      try {
        const ownerActiveList = updated.filter(s => s.isOwnerStory || s.hostId === currentUserId);
        localStorage.setItem('vivu_user_active_stories', JSON.stringify(ownerActiveList));
        if (currentUserId && !currentUserId.startsWith('client-')) {
          localStorage.setItem(`vivu_user_active_stories_${currentUserId}`, JSON.stringify(ownerActiveList));
        }
      } catch {}
      return updated;
    });
    try {
      localStorage.setItem('vivu_user_active_story', JSON.stringify(newStory));
      if (currentUserId && !currentUserId.startsWith('client-')) {
        localStorage.setItem(`vivu_user_active_story_${currentUserId}`, JSON.stringify(newStory));
      }
      const archiveKey = `vivu_user_story_archive_${currentUserId || 'guest'}`;
      const savedArch = localStorage.getItem(archiveKey);
      let archList = savedArch ? JSON.parse(savedArch) : [];
      const itemToArchive = {
        id: newStory.id,
        image: newStory.image || newStory.dual_image,
        video: null,
        title: newStory.title || 'Khoảnh khắc mới',
        description: newStory.description || '',
        created_at: newStory.created_at || new Date().toISOString()
      };
      archList = [itemToArchive, ...archList.filter(item => item.id !== itemToArchive.id)];
      localStorage.setItem(archiveKey, JSON.stringify(archList));
    } catch {}
    // Đồng bộ suy nghĩ và bài hát nhạc nền vào ghim giọt nước của BẠN (Chỉ lưu nếu có nội dung thực, không lưu tiêu đề mặc định)
    const rawNote = (storyData.texts && storyData.texts[0]?.text) || storyData.description || '';
    const statusNote = (rawNote && rawNote !== 'Khoảnh khắc mới' && rawNote !== 'Tâm trạng') ? rawNote : '';
    if (statusNote) {
      setUserCustomStatus(statusNote);
      try {
        localStorage.setItem("vivu_user_custom_status", statusNote);
        if (currentUserId) localStorage.setItem(`vivu_user_custom_status_${currentUserId}`, statusNote);
      } catch {}
    }
    if (storyData.music) {
      setUserCustomSong(storyData.music);
      try {
        const songStr = JSON.stringify(storyData.music);
        localStorage.setItem("vivu_user_custom_song", songStr);
        if (currentUserId) localStorage.setItem(`vivu_user_custom_song_${currentUserId}`, songStr);
      } catch {}
    }
    if (currentUserId && userLat && userLng) {
      apiClient.updateGps(
        currentUserId,
        userLat,
        userLng,
        statusNote || userCustomStatus,
        currentUserName,
        currentUserAvatar,
        currentUserCode,
        user?.phone,
        storyData.music || userCustomSong,
        userCustomChibi,
        userPinSkin,
        userPinMascot,
        userPinAction,
        userCustomChibiExpiresAt
      );
    }

    setIsCreateModalOpen(false);
    confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
    setActiveTab(isFriendsOnly ? 'friends' : 'social');

    // Đồng bộ story mới lên backend server để các thiết bị khác nhận được
    await apiClient.createStory({
      id: newStory.id,
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
      expires_at: newStory.expires_at,
      created_at: newStory.created_at,
      privacy: newStory.privacy
    });
  };

  // Luồng đăng thống nhất Studio VIVU (Giai đoạn 2): Đăng Story, Tâm trạng, Nhạc và Chibi cùng lúc
  const handleUnifiedStudioSubmit = async ({ storyPayload, customStatus, customSong, customChibi, chibiExpiresAt, statusExpiryHours }) => {
    // 1. Nếu có nội dung Story
    if (storyPayload) {
      await handleCreateNewStory(storyPayload);
    }

    // 2. Cập nhật Tâm trạng suy nghĩ
    if (customStatus !== undefined && customStatus !== null) {
      setUserCustomStatus(customStatus);
      try {
        localStorage.setItem("vivu_user_custom_status", customStatus);
        if (currentUserId) localStorage.setItem(`vivu_user_custom_status_${currentUserId}`, customStatus);
      } catch {}
    }

    // 3. Cập nhật Nhạc nền
    if (customSong !== undefined) {
      setUserCustomSong(customSong);
      try {
        const songStr = customSong ? JSON.stringify(customSong) : '';
        if (songStr) {
          localStorage.setItem("vivu_user_custom_song", songStr);
          if (currentUserId) localStorage.setItem(`vivu_user_custom_song_${currentUserId}`, songStr);
        } else {
          localStorage.removeItem("vivu_user_custom_song");
          if (currentUserId) localStorage.removeItem(`vivu_user_custom_song_${currentUserId}`);
        }
      } catch {}
    }

    // 4. Cập nhật Linh vật Chibi Mascot
    if (customChibi !== undefined) {
      setUserCustomChibi(customChibi);
      setUserCustomChibiExpiresAt(chibiExpiresAt || null);
      try {
        if (customChibi) {
          localStorage.setItem("vivu_user_custom_chibi", customChibi);
          if (chibiExpiresAt) localStorage.setItem("vivu_user_chibi_expires_at", String(chibiExpiresAt));
          if (currentUserId) {
            localStorage.setItem(`vivu_user_custom_chibi_${currentUserId}`, customChibi);
            if (chibiExpiresAt) localStorage.setItem(`vivu_user_chibi_expires_at_${currentUserId}`, String(chibiExpiresAt));
          }
        } else {
          localStorage.removeItem("vivu_user_custom_chibi");
          localStorage.removeItem("vivu_user_chibi_expires_at");
          if (currentUserId) {
            localStorage.removeItem(`vivu_user_custom_chibi_${currentUserId}`);
            localStorage.removeItem(`vivu_user_chibi_expires_at_${currentUserId}`);
          }
        }
      } catch {}
    }

    // 5. Đồng bộ vị trí & thông tin Profile lên Backend
    if (currentUserId && userLat && userLng) {
      const finalChibi = customChibi === null ? 'remove' : (customChibi !== undefined ? customChibi : userCustomChibi);
      const finalChibiExp = customChibi === null ? 0 : (chibiExpiresAt !== undefined ? chibiExpiresAt : userCustomChibiExpiresAt);
      apiClient.updateGps(
        currentUserId,
        userLat,
        userLng,
        customStatus !== undefined ? customStatus : userCustomStatus,
        currentUserName,
        currentUserAvatar,
        currentUserCode,
        user?.phone,
        customSong !== undefined ? customSong : userCustomSong,
        finalChibi,
        userPinSkin,
        userPinMascot,
        userPinAction,
        finalChibiExp
      );
    }
  };

  // Hàm gỡ bỏ Chibi mascot tức thì khỏi ghim bản đồ
  const handleRemoveChibi = async () => {
    setUserCustomChibi(null);
    setUserCustomChibiExpiresAt(null);
    try {
      localStorage.removeItem("vivu_user_custom_chibi");
      localStorage.removeItem("vivu_user_chibi_expires_at");
      if (currentUserId) {
        localStorage.removeItem(`vivu_user_custom_chibi_${currentUserId}`);
        localStorage.removeItem(`vivu_user_chibi_expires_at_${currentUserId}`);
      }
    } catch {}
    if (currentUserId && userLat && userLng) {
      await apiClient.updateGps(
        currentUserId,
        userLat,
        userLng,
        userCustomStatus,
        currentUserName,
        currentUserAvatar,
        currentUserCode,
        user?.phone,
        userCustomSong,
        'remove',
        userPinSkin,
        userPinMascot,
        userPinAction,
        0
      );
    }
  };

  // Hàm gỡ bỏ tâm trạng suy nghĩ tức thì khỏi ghim bản đồ
  const handleClearCustomStatus = async () => {
    setUserCustomStatus('');
    try {
      localStorage.removeItem("vivu_user_custom_status");
      if (currentUserId) {
        localStorage.removeItem(`vivu_user_custom_status_${currentUserId}`);
      }
    } catch {}
    if (currentUserId) {
      updateProfile({ customStatus: 'clear' }).catch(() => {});
      if (userLat && userLng) {
        await apiClient.updateGps(
          currentUserId,
          userLat,
          userLng,
          'clear',
          currentUserName,
          currentUserAvatar,
          currentUserCode,
          user?.phone,
          userCustomSong,
          userCustomChibi,
          userPinSkin,
          userPinMascot,
          userPinAction,
          userCustomChibiExpiresAt
        );
      }
    }
  };

  // Hàm lưu trạng thái tâm trạng từ UserLocationSheet đồng bộ tức thì lên CSDL & Bản đồ
  const handleSaveLocationSheetStatus = async (status) => {
    const trimmed = (status || '').trim();
    if (!trimmed) {
      await handleClearCustomStatus();
      return;
    }
    setUserCustomStatus(trimmed);
    try {
      localStorage.setItem("vivu_user_custom_status", trimmed);
      if (currentUserId) {
        localStorage.setItem(`vivu_user_custom_status_${currentUserId}`, trimmed);
      }
    } catch {}
    if (currentUserId) {
      updateProfile({ customStatus: trimmed }).catch(() => {});
      if (userLat && userLng) {
        await apiClient.updateGps(
          currentUserId,
          userLat,
          userLng,
          trimmed,
          currentUserName,
          currentUserAvatar,
          currentUserCode,
          user?.phone,
          userCustomSong,
          userCustomChibi,
          userPinSkin,
          userPinMascot,
          userPinAction,
          userCustomChibiExpiresAt
        );
      }
    }
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
      expiry_hours: 24,
      expires_at: new Date(Date.now() + 24 * 3600000).toISOString(),
      created_at: new Date().toISOString(),
      privacy: 'public'
    };
    newStory.activeStory = newStory;

    setStories(prev => {
      const updated = [newStory, ...prev.filter(s => s.id !== newStory.id)];
      try {
        const ownerActiveList = updated.filter(s => s.isOwnerStory || s.hostId === currentUserId);
        localStorage.setItem('vivu_user_active_stories', JSON.stringify(ownerActiveList));
        if (currentUserId && !currentUserId.startsWith('client-')) {
          localStorage.setItem(`vivu_user_active_stories_${currentUserId}`, JSON.stringify(ownerActiveList));
        }
      } catch {}
      return updated;
    });
    try {
      localStorage.setItem('vivu_user_active_story', JSON.stringify(newStory));
      if (currentUserId && !currentUserId.startsWith('client-')) {
        localStorage.setItem(`vivu_user_active_story_${currentUserId}`, JSON.stringify(newStory));
      }
    } catch {}
    setIsQuickSnapOpen(false);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
    setActiveTab('social');

    apiClient.createStory({
      id: newStory.id,
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
      expiry_hours: newStory.expiry_hours,
      expires_at: newStory.expires_at,
      created_at: newStory.created_at,
      privacy: 'public'
    });
  };

  // Gửi tin nhắn trong Chat (Đồng bộ tức thì lên Backend để thiết bị kia nhận được)
  const handleSendMessage = ({ 
    conversationId, 
    text, 
    image, 
    video, 
    isLocation, 
    is_location, 
    isLiveLocation, 
    is_live_location, 
    liveDurationMinutes, 
    live_duration_minutes, 
    isPoll, 
    is_poll, 
    poll, 
    lat, 
    lng 
  }) => {
    const isLive = Boolean(isLiveLocation || is_live_location);
    const hasPoll = Boolean(isPoll || is_poll || poll);
    const now = new Date().toISOString();
    const duration = Number(liveDurationMinutes || live_duration_minutes || 15);
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      senderName: currentUserName,
      text,
      image,
      video,
      isLocation: Boolean(isLocation || is_location),
      is_location: Boolean(isLocation || is_location),
      isLiveLocation: isLive,
      is_live_location: isLive,
      live_duration_minutes: isLive ? duration : null,
      live_status: isLive ? 'active' : null,
      live_expires_at: isLive ? new Date(Date.now() + duration * 60000).toISOString() : null,
      is_poll: hasPoll,
      poll: poll || null,
      lat,
      lng,
      created_at: now,
      time: 'Vừa xong'
    };

    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          isStranger: false,
          hasReplied: true,
          lastMessage: hasPoll ? `Bình chọn: ${poll?.title || text}` : isLive ? 'Đã chia sẻ vị trí trực tiếp' : text || (image ? 'Đã gửi hình ảnh' : video ? 'Đã gửi video' : isLocation ? 'Đã chia sẻ vị trí GPS' : 'Đã gửi tin nhắn'),
          time: 'Vừa xong',
          messages: [...(c.messages || []), newMsg]
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
      isLocation: Boolean(isLocation || is_location),
      isLiveLocation: isLive,
      liveDurationMinutes: isLive ? duration : null,
      liveExpiresAt: newMsg.live_expires_at,
      isPoll: hasPoll,
      poll: poll || null,
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
      const effectiveOwnerId = currentUserId || user?.id || 'user-me';
      const created = await apiClient.createCircle({
        ...circlePayload,
        ownerId: effectiveOwnerId,
        creatorName: currentUserName,
        creatorAvatar: currentUserAvatar
      });
      if (created) {
        setCustomCircles(prev => [created, ...prev.filter(c => c.id !== created.id)]);
        setIsCreateCircleModalOpen(false);
        // Thêm vào danh sách cuộc trò chuyện ngay để hiển thị trong Chat
        const welcomeText = (created.member_ids || []).length > 1
          ? `Bạn đã tạo nhóm "${created.name}" và mời ${(created.member_ids || []).length - 1} bạn bè`
          : `Bạn đã tạo nhóm "${created.name}"`;
        const initialMsg = {
          id: `msg-sys-${Date.now()}`,
          sender: 'system',
          senderName: 'Hệ thống',
          text: welcomeText,
          is_system: true,
          created_at: created.created_at || new Date().toISOString(),
          time: 'Vừa xong'
        };
        const newGroupConv = {
          id: created.id,
          type: 'group',
          circleId: created.id,
          name: created.name,
          avatar: created.image || DEFAULT_WHITE_PERSON_AVATAR,
          memberCount: (created.member_ids || []).length,
          memberIds: created.member_ids || [],
          online: true,
          lastMessage: welcomeText,
          time: created.created_at || new Date().toISOString(),
          unread: false,
          unreadCount: 0,
          messages: [initialMsg]
        };
        setConversations(prev => [newGroupConv, ...prev.filter(conv => conv.id !== created.id)]);
        setActiveTab('chat');
        setActiveConversationId(created.id);
        confetti({ particleCount: 45, spread: 60 });
        setRadarPingNotification(`Đã tạo nhóm "${created.name}" thành công!`);
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
              avatar: updatedCircle.image || DEFAULT_WHITE_PERSON_AVATAR,
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
      if (activeConversationId === circleId) {
        setActiveConversationId(null);
      }
      setRadarPingNotification('Đã xóa nhóm thành công!');
    } catch (e) {
      console.warn('Lỗi giải tán nhóm:', e);
      setRadarPingNotification('Không thể xóa nhóm');
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
            handleOpenStoryViewer(radarPingNotification.item);
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
      
      {/* 0.1 LOGO VIVU ĐỘC LẬP Ở GÓC TRÁI TRÊN CÙNG (Ẩn khi đang xem hồ sơ người khác) */}
      {(activeTab === 'social' || activeTab === 'friends' || activeTab === 'map') && !selectedUserProfile && !selectedGuestProfile && (
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
          resultsCount={radarResultsCount}
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

      {/* 0.3 ẢNH ĐẠI DIỆN ĐỘC LẬP Ở GÓC PHẢI TRÊN CÙNG: Nhấn chuyển hướng thẳng đến trang cá nhân của bạn */}
      {(activeTab === 'social' || activeTab === 'friends' || activeTab === 'map') && !selectedUserProfile && !selectedGuestProfile && (
        <BumpUserAvatar
          userAvatar={currentUserAvatar}
          userName={currentUserName}
          userCode={currentUserCode}
          isOnline={Boolean(currentUserId)}
          onClick={() => setActiveTab('profile')}
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

      {/* 1. BẢN ĐỒ GOOGLE MAPS ĐƯỜNG PHỐ & VỆ TINH HYBRID (ZERO-CRASH, 2D SỐNG ĐỘNG) */}
      <GoogleMapView
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        userLat={userLat}
        userLng={userLng}
        userCustomStatus={userCustomStatus}
        userCustomSong={userCustomSong}
        userCustomChibi={userCustomChibi}
        userCustomChibiExpiresAt={userCustomChibiExpiresAt}
        userPinSkin={userPinSkin}
        userPinMascot={userPinMascot}
        userPinAction={userPinAction}
        userAvatar={currentUserAvatar}
        gpsLoading={gpsLoading}
        location={location}
        onRequestLocation={requestLocation}
        activeTab={activeTab}
        viewMode={activeTab}
        stories={liveStories}
        friends={liveFriends}
        onlinePeers={nearbyOnlinePeers}
        radarDistance={radarDistance}
        isAdjustingRadius={isAdjustingRadius}
        isRadarScanning={isRadarScanning}
        isNavigationActive={isNavigationActive}
        navTarget={navTarget}
        activeCircleFilter={activeCircleFilter}
        onClearCircleFilter={() => setActiveCircleFilter(null)}
        onOpenStoryDetail={handleOpenStoryViewer}
        onOpenStoryChat={handleStoryDirectChat}
        onOpenUserProfile={(profile) => handleOpenUserProfile(profile, 'map')}
        onOpenFriendDetail={setSelectedFriend}
        onOpenGuestProfile={(profile) => setSelectedGuestProfile(profile)}
        onOpenUserMenu={() => setIsUserMenuOpen(true)}
        onOpenProfile={() => setActiveTab('profile')}
        onOpenCreateStory={() => setIsCreateModalOpen(true)}
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
        className={((activeTab === 'chat' && activeConversationId) || isQuickStatusSheetOpen || isPinWardrobeOpen || isUserMenuOpen) ? 'hidden' : ''}
      />

      {/* 6. TRÌNH XEM STORY TOÀN MÀN HÌNH TƯƠNG TÁC CAO CẤP (MULTI-STORY & DELETE) */}
      {selectedInteractiveStory && (
        <StoryViewerModal
          story={selectedInteractiveStory}
          storyList={selectedInteractiveStoryList}
          initialIndex={selectedStoryInitialIndex}
          onClose={() => {
            setSelectedInteractiveStory(null);
            setSelectedInteractiveStoryList([]);
          }}
          onOpenStoryChat={handleStoryDirectChat}
          onOpenUserProfile={(p) => handleOpenUserProfile(p, 'story')}
          onVotePoll={handleVoteStoryPoll}
          onReplyQA={handleReplyStoryQA}
          onReact={handleStoryReaction}
          onDeleteStory={handleDeleteStory}
          userLat={userLat}
          userLng={userLng}
          currentUserId={currentUserId}
          currentUserCode={currentUserCode}
        />
      )}

      {/* 6.9 MODAL XEM HỒ SƠ TOÀN MÀN HÌNH BẠN BÈ HOẶC NGƯỜI LẠ TRÊN BẢN ĐỒ */}
      {selectedUserProfile && (
        <UserProfileViewModal
          isOpen={Boolean(selectedUserProfile)}
          profile={selectedUserProfile}
          originSource={userProfileOriginSource}
          allFriends={friends}
          onClose={() => setSelectedUserProfile(null)}
          isFriend={friends.some(f => (selectedUserProfile.id && f.id === selectedUserProfile.id) || (selectedUserProfile.hostId && f.id === selectedUserProfile.hostId) || (selectedUserProfile.userId && f.id === selectedUserProfile.userId) || f.name === (selectedUserProfile.hostName || selectedUserProfile.name || selectedUserProfile.fullName))}
          onDirectChat={(profile) => {
            setSelectedUserProfile(null);
            handleStoryDirectChat(profile);
          }}
          onToggleFriend={(profile) => {
            handleStoryToggleFriend(profile);
          }}
          onStartNavigation={(profile) => {
            setSelectedUserProfile(null);
            setNavTarget(profile);
            setIsNavigationActive(true);
            setActiveTab('social');
          }}
          onOpenStoryDetail={handleOpenStoryViewer}
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
        onOpenUserProfile={(p) => handleOpenUserProfile(p, 'friends')}
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
          onOpenStoryDetail={handleOpenStoryViewer}
          onOpenUserProfile={(p) => {
            setSelectedFriend(null);
            handleOpenUserProfile(p, 'map');
          }}
          onOpenDirectChat={(f) => {
            setSelectedFriend(null);
            handleStoryDirectChat(f);
          }}
          onStartNavigation={(f) => {
            setNavTarget(f);
            setSelectedFriend(null);
            setIsNavigationActive(true);
            setActiveTab('friends');
          }}
        />
      )}


      {/* 10. BOTTOM SHEET CẬP NHẬT TRẠNG THÁI SUY NGHĨ (APPLE MUSIC STREAM) */}
      <QuickStatusSheet
        isOpen={isQuickStatusSheetOpen}
        onClose={() => setIsQuickStatusSheetOpen(false)}
        userCustomStatus={userCustomStatus}
        userCustomSong={userCustomSong}
        userCustomChibi={userCustomChibi}
        userCustomChibiExpiresAt={userCustomChibiExpiresAt}
        userPinSkin={userPinSkin}
        userPinMascot={userPinMascot}
        userPinAction={userPinAction}
        userAvatar={currentUserAvatar}
        onOpenPinWardrobe={() => {
          setIsQuickStatusSheetOpen(false);
          setIsPinWardrobeOpen(true);
        }}
        onSelectStatus={(status, song, chibiId, expiresAt, expiryHours) => {
          const isClearStatus = !status || status === 'clear' || status === 'remove';
          const resolvedStatus = isClearStatus ? '' : status;
          const isRemoveChibi = !chibiId || chibiId === 'remove';
          const resolvedChibi = isRemoveChibi ? null : chibiId;
          const resolvedExp = isRemoveChibi ? null : (expiresAt || null);

          setUserCustomStatus(resolvedStatus);
          setUserCustomSong(song || null);
          setUserCustomChibi(resolvedChibi);
          setUserCustomChibiExpiresAt(resolvedExp);
          try {
            if (currentUserId && !currentUserId.startsWith('client-')) {
              if (resolvedStatus) {
                localStorage.setItem(`vivu_user_custom_status_${currentUserId}`, resolvedStatus);
                localStorage.setItem('vivu_user_custom_status', resolvedStatus);
              } else {
                localStorage.removeItem(`vivu_user_custom_status_${currentUserId}`);
                localStorage.removeItem('vivu_user_custom_status');
              }
              if (song) {
                const songStr = typeof song === 'object' ? JSON.stringify(song) : String(song);
                localStorage.setItem(`vivu_user_custom_song_${currentUserId}`, songStr);
                localStorage.setItem('vivu_user_custom_song', songStr);
              } else {
                localStorage.removeItem(`vivu_user_custom_song_${currentUserId}`);
                localStorage.removeItem('vivu_user_custom_song');
              }
              if (resolvedChibi) {
                localStorage.setItem(`vivu_user_custom_chibi_${currentUserId}`, resolvedChibi);
                localStorage.setItem('vivu_user_custom_chibi', resolvedChibi);
              } else {
                localStorage.removeItem(`vivu_user_custom_chibi_${currentUserId}`);
                localStorage.removeItem('vivu_user_custom_chibi');
              }
              if (resolvedExp) {
                localStorage.setItem(`vivu_user_custom_chibi_expires_${currentUserId}`, String(resolvedExp));
                localStorage.setItem('vivu_user_custom_chibi_expires', String(resolvedExp));
              } else {
                localStorage.removeItem(`vivu_user_custom_chibi_expires_${currentUserId}`);
                localStorage.removeItem('vivu_user_custom_chibi_expires');
              }
            }
          } catch {}
          if (currentUserId) {
            updateProfile({ 
              customStatus: isClearStatus ? 'clear' : resolvedStatus, 
              customChibi: isRemoveChibi ? 'remove' : resolvedChibi, 
              chibi_expires_at: resolvedExp,
              custom_song: song || null
            }).catch(() => {});
            if (userLat && userLng) {
              const safeChibi = isRemoveChibi ? 'remove' : resolvedChibi;
              const safeExp = resolvedChibi ? (resolvedExp || 0) : 0;
              const safeStatusParam = isClearStatus ? 'clear' : resolvedStatus;
              apiClient.updateGps(currentUserId, userLat, userLng, safeStatusParam, currentUserName, currentUserAvatar, currentUserCode, user?.phone, song || null, safeChibi, userPinSkin, userPinMascot, userPinAction, safeExp);
            }
          }
          confetti({ particleCount: 25, spread: 40 });
        }}
      />

      {/* 11. BOTTOM SHEET VỊ TRÍ CỦA BẠN */}
      <UserLocationSheet
        isOpen={isUserMenuOpen}
        userLat={userLat}
        userLng={userLng}
        locationAccuracy={location?.accuracy}
        userCustomStatus={userCustomStatus}
        userCustomSong={userCustomSong}
        userCustomChibi={userCustomChibi}
        userCustomChibiExpiresAt={userCustomChibiExpiresAt}
        userPinSkin={userPinSkin}
        userPinMascot={userPinMascot}
        userPinAction={userPinAction}
        userAvatar={currentUserAvatar}
        userName={currentUserName}
        userCode={currentUserCode}
        onClose={() => setIsUserMenuOpen(false)}
        onOpenCreateStory={() => setIsCreateModalOpen(true)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
        onOpenQuickStatus={() => {
          setIsUserMenuOpen(false);
          setIsQuickStatusSheetOpen(true);
        }}
        onOpenPinWardrobe={() => {
          setIsUserMenuOpen(false);
          setIsPinWardrobeOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={logout}
        onSelectStatus={handleSaveLocationSheetStatus}
        onClearStatus={handleClearCustomStatus}
        onClearSong={() => {
          storyAudioPlayer.stop();
          setUserCustomSong(null);
          safeRemoveItem('vivu_user_custom_song');
          try { 
            localStorage.removeItem('vivu_user_custom_song'); 
            if (currentUserId) localStorage.removeItem(`vivu_user_custom_song_${currentUserId}`);
          } catch {}
          if (currentUserId) {
            updateProfile({ custom_song: null }).catch(() => {});
            if (userLat && userLng) {
              apiClient.updateGps(currentUserId, userLat, userLng, userCustomStatus || '', currentUserName, currentUserAvatar, currentUserCode, user?.phone, null, userCustomChibi, userPinSkin, userPinMascot, userPinAction, userCustomChibiExpiresAt);
            }
          }
          confetti({ particleCount: 20, spread: 35 });
        }}
        onRemoveChibi={handleRemoveChibi}
        onRequestLocation={requestLocation}
      />

      {/* 11.2 TỦ ĐỒ GHIM BẢN ĐỒ & BỘ CHIBI FB/ZALO (ZENLY 3D) */}
      <PinWardrobeModal
        isOpen={isPinWardrobeOpen}
        onClose={() => setIsPinWardrobeOpen(false)}
        currentPinSkin={userPinSkin}
        currentMascot={userPinMascot}
        currentAction={userPinAction}
        userAvatar={currentUserAvatar}
        userName={currentUserName}
        onSavePinConfig={(config) => {
          const nextSkin = config.pinSkin || 'auto';
          const nextMascot = config.pinMascot || null;
          const nextAction = config.pinAction || null;
          setUserPinSkin(nextSkin);
          setUserPinMascot(nextMascot);
          setUserPinAction(nextAction);
          try {
            if (currentUserId && !currentUserId.startsWith('client-')) {
              localStorage.setItem(`vivu_user_pin_skin_${currentUserId}`, nextSkin);
              if (nextMascot) localStorage.setItem(`vivu_user_pin_mascot_${currentUserId}`, nextMascot);
              else localStorage.removeItem(`vivu_user_pin_mascot_${currentUserId}`);
              if (nextAction) localStorage.setItem(`vivu_user_pin_action_${currentUserId}`, nextAction);
              else localStorage.removeItem(`vivu_user_pin_action_${currentUserId}`);
            }
          } catch {}

          if (currentUserId) {
            updateProfile({ pinSkin: nextSkin, pinMascot: nextMascot, pinAction: nextAction }).catch(() => {});
            if (userLat && userLng) {
              apiClient.updateGps(
                currentUserId,
                userLat,
                userLng,
                userCustomStatus,
                currentUserName,
                currentUserAvatar,
                currentUserCode,
                user?.phone,
                userCustomSong,
                userCustomChibi,
                nextSkin,
                nextMascot,
                nextAction
              ).catch(() => {});
            }
          }

          try {
            confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
          } catch {}
        }}
      />

      {/* 11. MODAL SÁNG TẠO THỐNG NHẤT STUDIO VIVU (GIAI ĐOẠN 2) */}
      <UnifiedCreationStudioModal
        isOpen={isCreateModalOpen || isQuickSnapOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsQuickSnapOpen(false);
        }}
        onSubmitAll={handleUnifiedStudioSubmit}
        userLocationName={cityName || "Vị trí GPS của Bạn"}
        userLat={userLat}
        userLng={userLng}
        friends={friends}
        initialCustomStatus={userCustomStatus}
        initialCustomSong={userCustomSong}
        initialCustomChibi={userCustomChibi}
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
          onOpenStoryDetail={handleOpenStoryViewer}
          onOpenUserProfile={(p, src) => handleOpenUserProfile(p, src || 'chat')}
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
          onOpenMemeTroll={(target) => setTrollTargetUser(target)}
          onOpenTakeoverMeme={(takeoverData) => setActiveTakeoverMeme(takeoverData)}
        />
      )}

            {/* 16. TAB TÔI (PROFILE TINDER CARD) */}
      {activeTab === 'profile' && (
        <ProfilePageView
          key={currentUserId || 'guest'}
          user={{
            ...user,
            id: currentUserId,
            user_metadata: {
              ...user,
              ...user?.user_metadata,
              full_name: currentUserName || user?.user_metadata?.full_name || user?.full_name,
              avatar_url: currentUserAvatar || user?.user_metadata?.avatar_url || user?.avatar_url
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
          onUpdateProfile={handleUpdateFullProfile}
          onOpenRightFriendshipPanel={() => setIsRightFriendshipPanelOpen(true)}
          onDirectChat={handleStoryDirectChat}
          onStartCall={(target) => handleStartCall('voice', target)}
          onTriggerBump={(target) => handleInitiateBump(target)}
          onOpenMemeTroll={(target) => setTrollTargetUser(target)}
          onStartNavigation={(target) => {
            setNavTarget(target);
            setIsNavigationActive(true);
            setActiveTab('social');
          }}
          onOpenStoryHighlight={(highlight) => {
            if (highlight && Array.isArray(highlight.stories) && highlight.stories.length > 0) {
              const hlStories = highlight.stories.map(s => ({
                ...s,
                host_name: currentUserName,
                host_avatar: currentUserAvatar,
                user_code: currentUserCode,
                isOwnerStory: true
              }));
              setSelectedInteractiveStory(hlStories[0]);
              setSelectedInteractiveStoryList(hlStories);
              setSelectedStoryInitialIndex(0);
            }
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
          if (currentUserId) {
            try { await apiClient.setOffline(currentUserId); } catch (_) {}
          }
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
        onSaveProfile={handleUpdateFullProfile}
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
          handleOpenStoryViewer(story);
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
            onClose={handleCloseBumpModal}
            initiatorName={activeBumpData?.initiatorName || currentUserName}
            initiatorAvatar={activeBumpData?.initiatorAvatar || currentUserAvatar}
            targetName={activeBumpData?.targetName || 'Bạn bè'}
            targetAvatar={activeBumpData?.targetAvatar || DEFAULT_WHITE_PERSON_AVATAR}
            isInitiator={activeBumpData?.initiatorId === currentUserId}
            isMyReady={isBumpMyReady}
            isPeerReady={isBumpPeerReady}
            clinkTriggered={isBumpClinkTriggered}
            onReady={handleBumpReady}
          />
        )}
      </Suspense>

      {/* 24.1 MODAL TẠO NHÓM MỚI (TOP LAYER z-[100]) */}
      <CreateCircleModal
        isOpen={isCreateCircleModalOpen}
        onClose={() => setIsCreateCircleModalOpen(false)}
        friends={friends}
        onCreateCircle={handleCreateCircle}
      />

      {/* 24.2 MODAL TẠO BÌNH CHỌN LỊCH HẸN (TOP LAYER) */}
      <CreatePollModal
        isOpen={isCreatePollModalOpen}
        onClose={() => setIsCreatePollModalOpen(false)}
        onCreatePoll={({ title, options }) => {
          if (!activeConversationId) return;
          handleSendMessage({
            conversationId: activeConversationId,
            text: `[BÌNH CHỌN]: ${title}`,
            isPoll: true,
            poll: {
              id: `poll-${Date.now()}`,
              title,
              options: (options || []).map((opt, i) => ({
                id: opt.id || `opt-${i + 1}`,
                text: typeof opt === 'string' ? opt : opt.text,
                votes: []
              }))
            }
          });
          setIsCreatePollModalOpen(false);
        }}
      />

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
          onMemeSent={({ meme, targetUser, quote }) => {
            setActiveTakeoverMeme({
              meme,
              quote,
              senderName: currentUserName || 'Bạn',
              targetUser
            });

            // Gửi tin nhắn Troll vào phòng chat 1-1 nếu có targetUser
            const targetId = targetUser?.id || targetUser?.hostId;
            if (targetId && handleSendMessage) {
              const trollPayload = {
                type: 'troll',
                memeId: meme.id,
                memeName: meme.name,
                memeIcon: meme.icon,
                image3d: meme.image3d,
                particleColor: meme.particleColor,
                soundType: meme.soundType,
                caption: quote || meme.caption,
                sender: 'me'
              };
              handleSendMessage(quote || meme.name, null, null, null, trollPayload);
            }

            // Gửi thông báo thời gian thực qua socket
            try {
              if (socketRef.current?.connected) {
                const sendPayload = {
                  senderId: currentUserId,
                  senderName: currentUserName,
                  senderAvatar: currentUserAvatar,
                  targetUserId: targetId,
                  targetId,
                  meme,
                  quote
                };
                socketRef.current.emit('troll:send', sendPayload);
                socketRef.current.emit('meme_troll', sendPayload);
              }
            } catch {}
          }}
        />
      )}

      {/* 28. HIỆU ỨNG MEME BAY LƯỢN TOÀN MÀN HÌNH (SCREEN TAKEOVER ĐÚNG 3S) */}
      {activeTakeoverMeme && (
        <MemeScreenTakeover
          meme={activeTakeoverMeme.meme}
          senderName={activeTakeoverMeme.senderName}
          senderUser={activeTakeoverMeme.senderUser}
          quote={activeTakeoverMeme.quote}
          onDismiss={() => setActiveTakeoverMeme(null)}
          onCounterAttack={(sender) => {
            setActiveTakeoverMeme(null);
            setTrollTargetUser(activeTakeoverMeme.targetUser || sender);
          }}
        />
      )}

    </div>
  );
}
