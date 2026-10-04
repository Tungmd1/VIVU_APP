import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { UserProfile } from '../types';
import { ApiClient } from '../services/api';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  hasCompletedOnboarding: boolean;
  selectedCity: string;
  selectedGoals: string[];
  selectedInterests: string[];
  communicationStyle: string;
  privacySettings: {
    location: boolean;
    profile: boolean;
    messages: boolean;
    notifications: boolean;
  };

  activePhone: string;
  currentOtpCode: string;

  // Actions
  setActivePhone: (phone: string) => void;
  setCurrentOtpCode: (code: string) => void;
  setCity: (city: string) => void;
  setGoals: (goals: string[]) => void;
  setInterests: (interests: string[]) => void;
  setSocialLevel: (level: string) => void;
  setPrivacySettings: (settings: AuthState['privacySettings']) => void;
  completeOnboarding: () => Promise<void>;
  login: (token: string, user: UserProfile) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (partial: Partial<UserProfile>) => void;
  loadSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  hasCompletedOnboarding: false,
  selectedCity: 'Đà Nẵng',
  selectedGoals: [],
  selectedInterests: [],
  communicationStyle: 'normal',
  privacySettings: {
    location: true,
    profile: true,
    messages: true,
    notifications: false,
  },
  activePhone: '',
  currentOtpCode: '',

  setActivePhone: (phone) => set({ activePhone: phone }),
  setCurrentOtpCode: (code) => set({ currentOtpCode: code }),
  setCity: (city) => set({ selectedCity: city }),
  setGoals: (goals) => set({ selectedGoals: goals }),
  setInterests: (interests) => set({ selectedInterests: interests }),
  setSocialLevel: (level) => set({ communicationStyle: level }),
  setPrivacySettings: (settings) => set({ privacySettings: settings }),

  completeOnboarding: async () => {
    set({ hasCompletedOnboarding: true });
    try {
      await AsyncStorage.setItem('vivu_onboarding_completed', 'true');
    } catch {
      // ignore
    }
  },

  login: async (token, incomingUser) => {
    // 1. Xác định định danh tài khoản duy nhất (identifier hoặc id)
    const userIdentifier = (incomingUser.identifier || incomingUser.phone || incomingUser.email || incomingUser.id || '').trim().toLowerCase();
    const storageKey = `vivu_profile_${userIdentifier}`;
    const idStorageKey = `vivu_profile_${incomingUser.id}`;

    // 2. Đọc hồ sơ đã lưu trước đó của tài khoản này trên thiết bị (nếu có)
    let savedProfile: Partial<UserProfile> = {};
    try {
      const savedStr = (await AsyncStorage.getItem(storageKey)) || (await AsyncStorage.getItem(idStorageKey));
      if (savedStr) {
        savedProfile = JSON.parse(savedStr);
      }
    } catch {}

    // 3. Hợp nhất thông tin (Không bao giờ để mất ảnh, bio, sở thích người dùng đã tạo)
    const mergedUser: UserProfile = {
      ...savedProfile,
      ...incomingUser,
      photos: (incomingUser.photos && incomingUser.photos.length > 0)
        ? incomingUser.photos
        : (savedProfile.photos && savedProfile.photos.length > 0
          ? savedProfile.photos
          : (incomingUser.avatar ? [incomingUser.avatar] : [])),
      privatePhotos: (incomingUser.privatePhotos && incomingUser.privatePhotos.length > 0)
        ? incomingUser.privatePhotos
        : (savedProfile.privatePhotos || []),
      pinnedPhoto: incomingUser.pinnedPhoto || savedProfile.pinnedPhoto || incomingUser.avatar || '',
      bio: incomingUser.bio || savedProfile.bio || '',
      age: incomingUser.age || savedProfile.age,
      occupation: incomingUser.occupation || savedProfile.occupation || '',
      education: incomingUser.education || savedProfile.education || '',
      zodiac: incomingUser.zodiac || savedProfile.zodiac || '',
      interests: (incomingUser.interests && incomingUser.interests.length > 0)
        ? incomingUser.interests
        : (savedProfile.interests || []),
      ghostMode: incomingUser.ghostMode || savedProfile.ghostMode || 'precise',
    };

    set({ token, user: mergedUser, hasCompletedOnboarding: true });

    // 4. Lưu lại vào cả phiên hiện tại và bản lưu trữ vĩnh viễn theo tài khoản
    try {
      const userJson = JSON.stringify(mergedUser);
      await AsyncStorage.setItem('vivu_token', token);
      await AsyncStorage.setItem('vivu_user', userJson);
      if (userIdentifier) {
        await AsyncStorage.setItem(storageKey, userJson);
      }
      if (mergedUser.id) {
        await AsyncStorage.setItem(idStorageKey, userJson);
      }
      await AsyncStorage.setItem('vivu_onboarding_completed', 'true');
    } catch {}

    // 5. Đồng bộ lên máy chủ trong nền
    ApiClient.syncProfile(token, mergedUser).catch(() => {});
  },

  logout: async () => {
    const currentUser = get().user;
    let lastId = '';
    if (currentUser) {
      // Lưu lại dữ liệu tài khoản vào kho vĩnh viễn trước khi thoát phiên
      const userJson = JSON.stringify(currentUser);
      const id1 = (currentUser.identifier || currentUser.phone || currentUser.email || '').trim().toLowerCase();
      lastId = id1;
      if (id1) {
        await AsyncStorage.setItem(`vivu_profile_${id1}`, userJson).catch(() => {});
        await AsyncStorage.setItem('vivu_last_identifier', id1).catch(() => {});
      }
      if (currentUser.id) {
        await AsyncStorage.setItem(`vivu_profile_${currentUser.id}`, userJson).catch(() => {});
      }
    }

    // Xóa phiên làm việc hiện tại, nhưng giữ lại activePhone để màn hình login tự điền sẵn
    set({
      token: null,
      user: null,
      hasCompletedOnboarding: false,
      activePhone: lastId || get().activePhone,
    });
    try {
      await AsyncStorage.removeItem('vivu_token');
      await AsyncStorage.removeItem('vivu_user');
      await AsyncStorage.removeItem('vivu_onboarding_completed');
    } catch {}
  },

  updateUser: (partial: Partial<UserProfile>) => {
    const current = get().user;
    const token = get().token;
    if (current) {
      const updated: UserProfile = { ...current, ...partial };
      set({ user: updated });
      const userJson = JSON.stringify(updated);
      AsyncStorage.setItem('vivu_user', userJson).catch(() => {});

      const id1 = (updated.identifier || updated.phone || updated.email || '').trim().toLowerCase();
      if (id1) {
        AsyncStorage.setItem(`vivu_profile_${id1}`, userJson).catch(() => {});
      }
      if (updated.id) {
        AsyncStorage.setItem(`vivu_profile_${updated.id}`, userJson).catch(() => {});
      }

      // Đồng bộ ngay lên backend nếu có token
      if (token) {
        ApiClient.syncProfile(token, updated).catch(() => {});
      }
    } else {
      const updated: UserProfile = {
        id: 'user_' + Date.now(),
        name: 'Người dùng',
        avatar: '',
        city: 'Đà Nẵng',
        trustScore: 100,
        verified: true,
        postsCount: 0,
        activitiesCount: 0,
        friendsCount: 0,
        communicationStyle: 'normal',
        interests: [],
        ...partial,
      };
      set({ user: updated });
      const userJson = JSON.stringify(updated);
      AsyncStorage.setItem('vivu_user', userJson).catch(() => {});
      if (token) {
        ApiClient.syncProfile(token, updated).catch(() => {});
      }
    }
  },

  loadSession: async () => {
    try {
      const onboardingCompleted = await AsyncStorage.getItem('vivu_onboarding_completed');
      const token = await AsyncStorage.getItem('vivu_token');
      const userStr = await AsyncStorage.getItem('vivu_user');

      if (token && userStr) {
        let user: UserProfile = JSON.parse(userStr);
        // Kiểm tra xem có bản sao lưu profile chi tiết hơn theo identifier không
        const id1 = (user.identifier || user.phone || user.email || '').trim().toLowerCase();
        if (id1) {
          const detailedStr = await AsyncStorage.getItem(`vivu_profile_${id1}`);
          if (detailedStr) {
            const detailed = JSON.parse(detailedStr);
            user = {
              ...detailed,
              ...user,
              photos: user.photos?.length ? user.photos : (detailed.photos || []),
              privatePhotos: user.privatePhotos?.length ? user.privatePhotos : (detailed.privatePhotos || []),
            };
          }
        }
        set({
          token,
          user,
          hasCompletedOnboarding: true,
        });

        // Tải thông tin mới nhất từ backend trong nền
        ApiClient.getMe(token).then((res) => {
          if (res?.success && res.data) {
            get().updateUser(res.data);
          }
        }).catch(() => {});
      } else {
        if (onboardingCompleted === 'true') {
          set({ hasCompletedOnboarding: true });
        }
        const lastId = await AsyncStorage.getItem('vivu_last_identifier');
        if (lastId) {
          set({ activePhone: lastId });
        }
      }
    } catch {}
  },
}));
