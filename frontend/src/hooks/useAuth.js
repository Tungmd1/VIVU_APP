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

  // Gửi email khôi phục mật khẩu hoặc đặt lại qua Mockup OTP
  const forgotPassword = useCallback(async (email, newPassword, otp) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      // Nếu có mật khẩu mới và OTP -> Chạy luồng Mockup OTP Reset
      if (newPassword && otp) {
        const res = await authService.resetPasswordMock(email, newPassword, otp);
        return res;
      }
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
        if (!prev) return prev;
        return {
          ...prev,
          user_metadata: {
            ...prev.user_metadata,
            full_name: profileData.fullName,
            avatar_url: profileData.avatarUrl,
            custom_status: profileData.customStatus,
            phone: profileData.phone,
            tags: profileData.tags
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
