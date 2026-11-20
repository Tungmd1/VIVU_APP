import { useState, useEffect, useCallback, useRef } from 'react';
import * as authService from '../services/authService.js';
import { apiClient } from '../services/apiClient.js';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState(null);
  const syncedAccountIdsRef = useRef(new Set());

  // Khởi tạo session và đồng bộ danh tính Supabase đã xác minh với backend VIVU.
  useEffect(() => {
    let isMounted = true;
    const syncInFlight = new Map();

    const applySession = async (nextSession, event = 'INITIAL_SESSION') => {
      if (!isMounted) return;
      setSession(nextSession || null);
      setUser(nextSession?.user || null);

      if (!nextSession?.user) {
        syncedAccountIdsRef.current.clear();
        setIsLoading(false);
        return;
      }

      const userId = nextSession.user.id;

      // Đồng bộ thông tin hồ sơ mới nhất từ Database Server
      if (userId && (userId.startsWith('user-') || userId.startsWith('client-'))) {
        try {
          const freshUser = await apiClient.getMe(userId);
          if (isMounted && freshUser) {
            setUser(current => {
              const base = current || nextSession.user;
              return {
                ...base,
                ...freshUser,
                id: userId,
                user_metadata: {
                  ...base.user_metadata,
                  ...freshUser,
                  full_name: freshUser.full_name || base.user_metadata?.full_name,
                  avatar_url: freshUser.avatar_url || base.user_metadata?.avatar_url,
                  user_code: freshUser.user_code || base.user_metadata?.user_code,
                  phone: freshUser.phone,
                  bio: freshUser.bio,
                  age: freshUser.age,
                  job: freshUser.job,
                  tags: freshUser.tags,
                  favorite_song: freshUser.favorite_song,
                  privacy_age: freshUser.privacy_age,
                  privacy_phone: freshUser.privacy_phone,
                  privacy_tags: freshUser.privacy_tags
                }
              };
            });
            // Đồng bộ bộ nhớ cục bộ theo scoped user id (Rule 26)
            try {
              const scopedKey = `vivu_user_profile_data_${freshUser.id}`;
              let localData = {};
              const localRaw = localStorage.getItem(scopedKey);
              if (localRaw) {
                const parsed = JSON.parse(localRaw);
                if (parsed.id === freshUser.id || parsed.userId === freshUser.id) {
                  localData = parsed;
                }
              }
              const merged = {
                ...localData,
                ...freshUser,
                userId: freshUser.id,
                id: freshUser.id,
                fullName: freshUser.full_name || localData.fullName || freshUser.name || '',
                avatarUrl: freshUser.avatar_url || localData.avatarUrl || null,
                avatar_url: freshUser.avatar_url || localData.avatar_url || null
              };
              const targetAv = freshUser.avatar_url || localData.avatarUrl || localData.avatar_url;
              if (targetAv) {
                merged.avatarUrl = targetAv;
                merged.avatar_url = targetAv;
                localStorage.setItem(`vivu_user_avatar_${freshUser.id}`, targetAv);
                localStorage.setItem('vivu_user_avatar', targetAv);
              }
              localStorage.setItem(scopedKey, JSON.stringify(merged));
            } catch {}
          }
        } catch (meErr) {
          console.warn('[useAuth] Lỗi nạp hồ sơ mới nhất:', meErr);
        }
      }

      const shouldSync = ['INITIAL_SESSION', 'SIGNED_IN'].includes(event);
      if (!shouldSync || syncedAccountIdsRef.current.has(userId)) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        let syncPromise = syncInFlight.get(userId);
        if (!syncPromise) {
          syncPromise = authService.syncAuthenticatedAccount(nextSession);
          syncInFlight.set(userId, syncPromise);
        }
        const result = await syncPromise;
        if (isMounted && result?.user) {
          const account = result.user;
          setUser((current) => current?.id === userId ? {
            ...current,
            ...account,
            id: userId,
            user_metadata: {
              ...current.user_metadata,
              ...account,
              full_name: account.full_name || current.user_metadata?.full_name,
              avatar_url: account.avatar_url || current.user_metadata?.avatar_url,
              user_code: account.user_code
            }
          } : current);
          syncedAccountIdsRef.current.add(userId);
        }
      } catch (err) {
        if (isMounted) {
          setAuthError(`Đăng nhập thành công nhưng chưa đồng bộ được hồ sơ VIVU: ${err.message}`);
        }
      } finally {
        syncInFlight.delete(userId);
        if (isMounted) setIsLoading(false);
      }
    };

    authService.getSession()
      .then((currentSession) => applySession(currentSession, 'INITIAL_SESSION'))
      .catch((err) => {
        console.error('[useAuth] Lỗi khởi tạo session:', err);
        if (isMounted) setIsLoading(false);
      });

    const unsubscribe = authService.onAuthStateChange((event, nextSession) => {
      void applySession(nextSession, event);
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);
  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Đăng nhập
  const login = useCallback(async (email, password) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const data = await authService.signInWithEmail(email, password);
      setSession(data.session);
      setUser(data.user);
      return { success: true, data };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Đăng ký tài khoản (Quy chuẩn: Không tự động đăng nhập, buộc người dùng đăng nhập lại)
  const register = useCallback(async (email, password, fullName) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const data = await authService.signUpWithEmail(email, password, fullName);
      // TUYỆT ĐỐI KHÔNG setSession hay setUser ở đây
      return { success: true, email: data.email || email.trim().toLowerCase(), data };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Đăng nhập qua OAuth (Google / Facebook)
  const loginOAuth = useCallback(async (provider, options = {}) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const data = await authService.signInWithOAuthProvider(provider, options);
      if (data?.requiresSelection) {
        return { success: false, requiresSelection: true, provider: data.provider || provider };
      }
      if (data?.user && data?.session) {
        setSession(data.session);
        setUser(data.user);
      }
      return { success: true, data };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Gửi email khôi phục mật khẩu qua liên kết xác thực an toàn
  const forgotPassword = useCallback(async (email) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const data = await authService.sendPasswordResetEmail(email);
      return { success: true, data };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Cập nhật mật khẩu mới
  const changePassword = useCallback(async (newPassword) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const data = await authService.updatePassword(newPassword);
      return { success: true, data };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Đăng xuất
  const logout = useCallback(async () => {
    setIsSubmitting(true);
    try {
      if (user?.id) {
        await apiClient.setOffline(user.id);
      }
      await authService.signOut();
      setSession(null);
      setUser(null);
      return { success: true };
    } catch (err) {
      console.error('[useAuth] Lỗi đăng xuất:', err);
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [user]);

  // Cập nhật thông tin hồ sơ (Profile)
  const updateProfile = useCallback(async (profileData) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const res = await authService.updateUserProfile(profileData);
      setUser(prev => {
        const base = prev || { id: 'guest', is_guest: true, user_metadata: {} };
        return {
          ...base,
          ...profileData,
          full_name: profileData.fullName || base.full_name,
          avatar_url: profileData.avatarUrl !== undefined ? profileData.avatarUrl : base.avatar_url,
          custom_status: profileData.customStatus || base.custom_status,
          user_metadata: {
            ...base.user_metadata,
            full_name: profileData.fullName || base.user_metadata?.full_name,
            avatar_url: profileData.avatarUrl !== undefined ? profileData.avatarUrl : base.user_metadata?.avatar_url,
            custom_status: profileData.customStatus || base.user_metadata?.custom_status,
            phone: profileData.phone,
            age: profileData.age,
            job: profileData.job,
            bio: profileData.bio,
            tags: profileData.tags,
            favorite_song: profileData.favorite_song,
            privacy_age: profileData.privacy_age,
            privacy_phone: profileData.privacy_phone,
            privacy_tags: profileData.privacy_tags
          }
        };
      });
      return { success: true, res };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    session,
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    isSubmitting,
    authError,
    clearError,
    login,
    register,
    loginOAuth,
    forgotPassword,
    changePassword,
    updateProfile,
    logout
  };
}
