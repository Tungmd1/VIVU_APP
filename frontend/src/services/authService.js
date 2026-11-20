import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { apiClient } from './apiClient.js';

/**
 * Service quản lý toàn bộ các tác vụ Xác Thực (Authentication) của VIVU Web App
 * Tuân thủ kiến trúc Dual-Mode (Supabase Cloud & Local Safe Mode)
 */

// Key lưu trữ phiên đăng nhập cục bộ dự phòng & danh sách tài khoản đã đăng ký
const LOCAL_SESSION_KEY = 'vivu_local_auth_session';
const LOCAL_REGISTERED_USERS_KEY = 'vivu_local_registered_users';

/**
 * Lấy session hiện tại
 */
export async function getSession() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('[VIVU Auth] Lỗi lấy session Supabase:', error.message);
      return null;
    }
    return data?.session || null;
  }

  // Fallback đọc session từ localStorage
  try {
    const local = localStorage.getItem(LOCAL_SESSION_KEY);
    return local ? JSON.parse(local) : null;
  } catch (err) {
    console.error('[VIVU Auth] Lỗi đọc session local:', err);
    return null;
  }
}

/**
 * Đăng ký tài khoản mới bằng Email & Mật khẩu
 * Quy chuẩn: Đăng ký xong KHÔNG tự động đăng nhập, mà chuyển hướng người dùng về form Đăng Nhập
 * @param {string} email 
 * @param {string} password 
 * @param {string} fullName 
 */
export async function signUpWithEmail(email, password, fullName) {
  const normalizedEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: password,
      options: {
        data: {
          full_name: fullName.trim(),
          avatar_url: null
        }
      }
    });

    if (error) {
      throw new Error(translateAuthError(error.message));
    }

    // Tự động tạo bản ghi trong bảng profiles nếu có user
    if (data?.user) {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName.trim(),
          avatar_url: null,
          custom_status: 'Thành viên mới gia nhập VIVU',
          battery: '100%',
          last_seen_at: new Date().toISOString()
        });
      } catch (profileErr) {
        console.warn('[VIVU Auth] Không thể upsert profile:', profileErr.message);
      }
    }

    // Nếu Supabase tự động cấp session sau khi signUp, chủ động đăng xuất để buộc người dùng đăng nhập lại
    if (data?.session) {
      try {
        await supabase.auth.signOut();
      } catch (signOutErr) {
        console.warn('[VIVU Auth] SignOut sau signUp:', signOutErr.message);
      }
    }

    return { success: true, email: normalizedEmail, user: data?.user };
  }

  // Kết nối Backend Server API trung tâm (Chia sẻ chung giữa Máy tính & Điện thoại & Đa trình duyệt)
  try {
    const cleanPassword = String(password).trim();
    const cleanFullName = String(fullName || '').trim();
    const res = await apiClient.register(normalizedEmail, cleanPassword, cleanFullName);
    if (res && res.success) {
      return { success: true, email: normalizedEmail, user: res.user };
    }
    if (res && res.message) {
      throw new Error(res.message);
    }
    throw new Error('Đăng ký không thành công. Vui lòng thử lại.');
  } catch (apiErr) {
    throw apiErr;
  }
}

/**
 * Đăng nhập bằng Email & Mật khẩu
 * @param {string} email 
 * @param {string} password 
 */
export async function signInWithEmail(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanPassword = String(password).trim();

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: cleanPassword
    });

    if (error) {
      throw new Error(translateAuthError(error.message));
    }

    return data;
  }

  // Xác thực qua Backend Server trung tâm (Đồng bộ đa trình duyệt 100%)
  try {
    const res = await apiClient.login(normalizedEmail, cleanPassword);
    if (res && res.success) {
      const userObj = {
        id: res.user.id,
        email: res.user.email,
        ...res.user,
        user_metadata: {
          ...res.user,
          full_name: res.user.full_name,
          avatar_url: res.user.avatar_url,
          user_code: res.user.user_code,
          phone: res.user.phone,
          bio: res.user.bio,
          age: res.user.age,
          job: res.user.job,
          tags: res.user.tags,
          favorite_song: res.user.favorite_song,
          privacy_age: res.user.privacy_age,
          privacy_phone: res.user.privacy_phone,
          privacy_tags: res.user.privacy_tags
        }
      };
      const sessionObj = {
        user: userObj,
        access_token: res.session?.access_token || `vivu-tok-${res.user.id}`
      };
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sessionObj));
      const targetAvatar = res.user.avatar_url || res.user.avatar;
      try {
        const scopedKey = `vivu_user_profile_data_${res.user.id}`;
        let existingProfile = {};
        const raw = localStorage.getItem(scopedKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.id === res.user.id || parsed.userId === res.user.id) {
            existingProfile = parsed;
          }
        }
        const mergedProfile = {
          ...existingProfile,
          ...res.user,
          userId: res.user.id,
          id: res.user.id,
          fullName: res.user.full_name || existingProfile.fullName || '',
          avatarUrl: targetAvatar || existingProfile.avatarUrl || null,
          avatar_url: targetAvatar || existingProfile.avatar_url || null
        };
        localStorage.setItem(scopedKey, JSON.stringify(mergedProfile));
        if (targetAvatar) {
          localStorage.setItem(`vivu_user_avatar_${res.user.id}`, targetAvatar);
          localStorage.setItem('vivu_user_avatar', targetAvatar);
        }
        if (res.user.custom_chibi) {
          const isExp = res.user.chibi_expires_at && new Date(res.user.chibi_expires_at).getTime() <= Date.now();
          if (!isExp) {
            localStorage.setItem(`vivu_user_custom_chibi_${res.user.id}`, res.user.custom_chibi);
            if (res.user.chibi_expires_at) {
              const expMs = typeof res.user.chibi_expires_at === 'number' ? res.user.chibi_expires_at : new Date(res.user.chibi_expires_at).getTime();
              localStorage.setItem(`vivu_user_custom_chibi_expires_${res.user.id}`, String(expMs));
            }
          }
        }
        if (res.user.custom_status) {
          localStorage.setItem(`vivu_user_custom_status_${res.user.id}`, res.user.custom_status);
        }
        if (res.user.custom_song) {
          const songStr = typeof res.user.custom_song === 'object' ? JSON.stringify(res.user.custom_song) : String(res.user.custom_song);
          localStorage.setItem(`vivu_user_custom_song_${res.user.id}`, songStr);
        }
        if (res.user.pin_skin) {
          localStorage.setItem(`vivu_user_pin_skin_${res.user.id}`, res.user.pin_skin);
        }
      } catch {}
      return { user: userObj, session: sessionObj };
    }
    if (res && res.message) {
      throw new Error(res.message);
    }
    throw new Error('Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
  } catch (apiErr) {
    throw apiErr;
  }
}

/** Đồng bộ danh tính Supabase đã xác minh vào hồ sơ VIVU dùng bởi backend. */
export async function syncAuthenticatedAccount(session) {
  if (!isSupabaseConfigured || !session?.access_token || !session?.user?.id) return null;
  return apiClient.syncSupabaseAccount(session.access_token);
}

/**
 * Đăng nhập trực tiếp bằng Google qua Backend VIVU (hoặc Fallback an toàn)
 * @param {{ credential?: string, email?: string, fullName?: string, avatarUrl?: string, googleId?: string }} googleData 
 */
export async function signInWithGoogleDirect(googleData) {
  try {
    const res = await apiClient.googleLogin(googleData);
    if (res && res.success) {
      const sessionObj = {
        access_token: res.token,
        user: {
          id: res.user.id,
          email: res.user.email,
          auth_provider: 'google',
          user_metadata: {
            full_name: res.user.full_name,
            avatar_url: res.user.avatar_url,
            user_code: res.user.user_code
          }
        }
      };
      try {
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sessionObj));
      } catch (e) {
        console.warn('Lỗi lưu session local:', e);
      }
      return { success: true, session: sessionObj, user: sessionObj.user };
    }
    throw new Error('Đăng nhập Google không thành công.');
  } catch (err) {
    if (err.message && !err.message.includes('fetch')) {
      throw err;
    }
    // Fallback Local Safe Mode khi mất kết nối mạng backend
    const email = (googleData.email || 'vivu.explorer@gmail.com').toLowerCase();
    const name = googleData.fullName || email.split('@')[0];
    const localUser = {
      id: `google-local-${Date.now()}`,
      email: email,
      auth_provider: 'google',
      user_metadata: {
        full_name: name,
        avatar_url: googleData.avatarUrl || null,
        user_code: `VU-${Math.floor(1000 + Math.random() * 9000)}`
      }
    };
    const sessionObj = {
      access_token: `vivu-tok-local-${Date.now()}`,
      user: localUser
    };
    try {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sessionObj));
    } catch {}
    return { success: true, session: sessionObj, user: localUser };
  }
}

/**
 * Mở cửa sổ Popup Google chính thức (accounts.google.com) qua Google Identity Services
 * @param {string} [clientId]
 */
export async function signInWithGooglePopup(clientId) {
  const targetClientId = (
    clientId || 
    import.meta.env.VITE_GOOGLE_CLIENT_ID || 
    localStorage.getItem('vivu_google_client_id') || 
    ''
  ).trim();

  if (!targetClientId) {
    return { requiresSelection: true };
  }

  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      return reject(new Error('Thư viện Google Identity Services chưa tải xong. Vui lòng bấm lại sau 2 giây.'));
    }

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: targetClientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            return reject(new Error(`Google OAuth từ chối: ${tokenResponse.error_description || tokenResponse.error}`));
          }
          try {
            // Lấy thông tin user chính thức từ Google UserInfo API
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            });
            const userInfo = await userInfoRes.json();
            if (userInfo.email) {
              const result = await signInWithGoogleDirect({
                googleId: userInfo.sub,
                email: userInfo.email,
                fullName: userInfo.name,
                avatarUrl: userInfo.picture
              });
              resolve(result);
            } else {
              reject(new Error('Không nhận được thông tin email từ Google.'));
            }
          } catch (err) {
            reject(err);
          }
        }
      });
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Đăng nhập trực tiếp bằng Facebook qua Backend VIVU (hoặc Fallback an toàn)
 * @param {{ accessToken?: string, email?: string, fullName?: string, avatarUrl?: string, facebookId?: string }} facebookData 
 */
export async function signInWithFacebookDirect(facebookData) {
  try {
    const res = await apiClient.facebookLogin(facebookData);
    if (res && res.success) {
      const sessionObj = {
        access_token: res.token,
        user: {
          id: res.user.id,
          email: res.user.email,
          auth_provider: 'facebook',
          user_metadata: {
            full_name: res.user.full_name,
            avatar_url: res.user.avatar_url,
            user_code: res.user.user_code
          }
        }
      };
      try {
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sessionObj));
      } catch (e) {
        console.warn('Lỗi lưu session local:', e);
      }
      return { success: true, session: sessionObj, user: sessionObj.user };
    }
    throw new Error('Đăng nhập Facebook không thành công.');
  } catch (err) {
    if (err.message && !err.message.includes('fetch')) {
      throw err;
    }
    // Fallback Local Safe Mode khi mất kết nối mạng backend
    const email = (facebookData.email || `fb_${Date.now()}@facebook.vivu.vn`).toLowerCase();
    const name = facebookData.fullName || email.split('@')[0];
    const localUser = {
      id: `fb-local-${Date.now()}`,
      email: email,
      auth_provider: 'facebook',
      user_metadata: {
        full_name: name,
        avatar_url: facebookData.avatarUrl || null,
        user_code: `VU-${Math.floor(1000 + Math.random() * 9000)}`
      }
    };
    const sessionObj = {
      access_token: `vivu-tok-local-${Date.now()}`,
      user: localUser
    };
    try {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sessionObj));
    } catch {}
    return { success: true, session: sessionObj, user: localUser };
  }
}

/**
 * Mở cửa sổ Popup Facebook chính thức qua Facebook JS SDK
 * @param {string} [appId]
 */
export async function signInWithFacebookPopup(appId) {
  const targetAppId = (
    appId || 
    import.meta.env.VITE_FACEBOOK_APP_ID || 
    localStorage.getItem('vivu_facebook_app_id') || 
    ''
  ).trim();

  if (!targetAppId) {
    return { requiresSelection: true, provider: 'facebook' };
  }

  return new Promise((resolve, reject) => {
    if (!window.FB) {
      return reject(new Error('Thư viện Facebook SDK chưa tải xong. Vui lòng thử lại sau 2 giây hoặc chọn tài khoản đề xuất.'));
    }

    try {
      window.FB.login((response) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          window.FB.api('/me', { fields: 'id,name,email,picture.type(large)' }, async (userInfo) => {
            try {
              const result = await signInWithFacebookDirect({
                accessToken,
                facebookId: userInfo.id,
                email: userInfo.email,
                fullName: userInfo.name,
                avatarUrl: userInfo.picture?.data?.url
              });
              resolve(result);
            } catch (err) {
              reject(err);
            }
          });
        } else {
          reject(new Error('Đăng nhập Facebook bị hủy hoặc từ chối cấp quyền.'));
        }
      }, { scope: 'public_profile,email' });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Đăng nhập qua OAuth Provider (Google / Facebook)
 * @param {'google' | 'facebook'} provider 
 * @param {object} [options]
 */
export async function signInWithOAuthProvider(provider, options = {}) {
  if (!['google', 'facebook'].includes(provider)) {
    throw new Error('Nhà cung cấp đăng nhập không được hỗ trợ.');
  }

  // Nếu là Google:
  if (provider === 'google') {
    // 1. Đã có payload trực tiếp từ modal / sandbox
    if (options?.credential || options?.email) {
      return signInWithGoogleDirect(options);
    }

    // 2. Thử mở trực tiếp Popup Google chính thức nếu đã cấu hình Client ID
    const googleClientId = (
      import.meta.env.VITE_GOOGLE_CLIENT_ID || 
      localStorage.getItem('vivu_google_client_id') || 
      ''
    ).trim();

    if (googleClientId && window.google?.accounts?.oauth2) {
      try {
        return await signInWithGooglePopup(googleClientId);
      } catch (err) {
        console.warn('[VIVU Auth] Google Popup error, falling back to selection modal:', err.message);
        throw err;
      }
    }

    // 3. Nếu chưa có Client ID hoặc thư viện chưa sẵn sàng -> mở GoogleAuthModal
    return { requiresSelection: true, provider: 'google' };
  }

  // Nếu là Facebook:
  if (provider === 'facebook') {
    // 1. Đã có payload trực tiếp từ modal / quick login
    if (options?.accessToken || options?.email || options?.facebookId || options?.fullName) {
      return signInWithFacebookDirect(options);
    }

    // 2. Thử mở trực tiếp Popup Facebook nếu đã cấu hình App ID và SDK đã tải
    const fbAppId = (
      import.meta.env.VITE_FACEBOOK_APP_ID || 
      localStorage.getItem('vivu_facebook_app_id') || 
      ''
    ).trim();

    if (fbAppId && window.FB) {
      try {
        return await signInWithFacebookPopup(fbAppId);
      } catch (err) {
        console.warn('[VIVU Auth] Facebook Popup error, falling back to selection modal:', err.message);
        throw err;
      }
    }

    // 3. Nếu Supabase Cloud đã được cấu hình đầy đủ
    if (isSupabaseConfigured && supabase) {
      const redirectTo = new URL('/', window.location.origin).toString();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo
        }
      });

      if (error) {
        throw new Error(translateAuthError(error.message));
      }

      return data;
    }

    // 4. Mở FacebookAuthModal đa tầng (Direct selection & Dev sandbox)
    return { requiresSelection: true, provider: 'facebook' };
  }

  throw new Error('Nhà cung cấp đăng nhập không được hỗ trợ.');
}

/**
 * Gửi Magic Link đặt lại mật khẩu về email người dùng
 * @param {string} email 
 */
export async function sendPasswordResetEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Chưa cấu hình Supabase. Tính năng gửi email Magic Link chỉ hoạt động khi kết nối Supabase Cloud.');
  }

  const { data, error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: `${window.location.origin}#type=recovery`
  });

  if (error) {
    throw new Error(translateAuthError(error.message));
  }

  return data;
}

/**
 * Cập nhật mật khẩu mới khi người dùng mở link recovery
 * @param {string} newPassword 
 */
export async function updatePassword(newPassword) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw new Error(translateAuthError(error.message));
    }

    return data;
  }

  return { success: true };
}

/**
 * Cập nhật thông tin hồ sơ người dùng (Profile)
 * @param {object} profileData { fullName, avatarUrl, customStatus, phone, tags }
 */
export async function updateUserProfile(profileData) {
  const { 
    fullName, 
    avatarUrl, 
    customStatus, 
    phone, 
    age, 
    job, 
    bio, 
    tags, 
    favorite_song, 
    privacy_age, 
    privacy_phone, 
    privacy_tags,
    photos 
  } = profileData;

  // Luôn lưu bền vững vào standalone cache profile (cả global và scoped theo user)
  const scopedUserId = profileData.userId || (() => {
    try {
      const local = localStorage.getItem(LOCAL_SESSION_KEY);
      if (local) return JSON.parse(local)?.user?.id;
    } catch {}
    try { return localStorage.getItem('vivu_client_user_id'); } catch {}
    return null;
  })();

  const isExplicitClearStatus =
    customStatus === '' ||
    customStatus === 'clear' ||
    customStatus === 'remove' ||
    customStatus === null;
  const resolvedCustomStatus = isExplicitClearStatus ? '' : (customStatus !== undefined ? customStatus : existing.custom_status);

  const isExplicitClearSong =
    customSong === null ||
    customSong === '' ||
    customSong === 'remove' ||
    custom_song === null ||
    custom_song === '' ||
    custom_song === 'remove';
  const resolvedCustomSong = isExplicitClearSong ? null : (customSong !== undefined ? customSong : (custom_song !== undefined ? custom_song : existing.custom_song));

  try {
    const existingRaw = localStorage.getItem('vivu_user_profile_data');
    const existing = existingRaw ? JSON.parse(existingRaw) : {};
    const updatedCache = {
      ...existing,
      ...profileData,
      fullName: fullName || existing.fullName,
      full_name: fullName || existing.fullName,
      avatar_url: avatarUrl !== undefined ? avatarUrl : existing.avatar_url,
      avatarUrl: avatarUrl !== undefined ? avatarUrl : existing.avatarUrl,
      custom_status: resolvedCustomStatus,
      customStatus: resolvedCustomStatus,
      custom_song: resolvedCustomSong,
      customSong: resolvedCustomSong
    };
    localStorage.setItem('vivu_user_profile_data', JSON.stringify(updatedCache));
    if (scopedUserId && scopedUserId !== 'guest') {
      localStorage.setItem(`vivu_user_profile_data_${scopedUserId}`, JSON.stringify(updatedCache));
      if (isExplicitClearStatus) {
        localStorage.removeItem(`vivu_user_custom_status_${scopedUserId}`);
        localStorage.removeItem('vivu_user_custom_status');
      } else if (resolvedCustomStatus) {
        localStorage.setItem(`vivu_user_custom_status_${scopedUserId}`, resolvedCustomStatus);
      }
      if (isExplicitClearSong) {
        localStorage.removeItem(`vivu_user_custom_song_${scopedUserId}`);
        localStorage.removeItem('vivu_user_custom_song');
      } else if (resolvedCustomSong) {
        const songStr = typeof resolvedCustomSong === 'object' ? JSON.stringify(resolvedCustomSong) : String(resolvedCustomSong);
        localStorage.setItem(`vivu_user_custom_song_${scopedUserId}`, songStr);
      }
      const targetAv = avatarUrl !== undefined ? avatarUrl : existing.avatarUrl;
      if (targetAv) {
        localStorage.setItem(`vivu_user_avatar_${scopedUserId}`, targetAv);
      } else if (targetAv === null || targetAv === '') {
        localStorage.removeItem(`vivu_user_avatar_${scopedUserId}`);
      }
    }
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 1. Cập nhật auth metadata
        await supabase.auth.updateUser({
          data: {
            full_name: fullName,
            avatar_url: avatarUrl,
            custom_status: customStatus,
            phone: phone,
            age: age,
            job: job,
            bio: bio,
            tags: tags,
            favorite_song: favorite_song,
            privacy_age: privacy_age,
            privacy_phone: privacy_phone,
            privacy_tags: privacy_tags
          }
        });

        // 2. Cập nhật bảng profiles
        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: fullName,
          avatar_url: avatarUrl,
          custom_status: customStatus,
          phone: phone,
          age: age,
          job: job,
          bio: bio,
          tags: tags,
          last_seen_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn('[VIVU Auth] Lỗi cập nhật profile Supabase:', err.message);
    }
    return { success: true, profile: profileData };
  }

  // Dual-Mode: Đồng bộ trực tiếp lên Backend API Server (Lưu bền vững vào vivu_database.json)
  const currentUserId = scopedUserId;

  if (currentUserId) {
    try {
      const apiRes = await apiClient.updateProfile(currentUserId, profileData);
      if (apiRes && apiRes.success && apiRes.user) {
        const local = localStorage.getItem(LOCAL_SESSION_KEY);
        if (local) {
          const session = JSON.parse(local);
          session.user = {
            ...session.user,
            ...apiRes.user,
            custom_status: resolvedCustomStatus,
            custom_song: resolvedCustomSong,
            user_metadata: {
              ...session.user.user_metadata,
              ...apiRes.user,
              full_name: apiRes.user.full_name || fullName,
              avatar_url: apiRes.user.avatar_url || avatarUrl,
              custom_status: resolvedCustomStatus,
              custom_song: resolvedCustomSong,
              phone: apiRes.user.phone || phone,
              age: apiRes.user.age ?? profileData.age,
              job: apiRes.user.job ?? profileData.job,
              bio: apiRes.user.bio ?? profileData.bio,
              privacy_age: apiRes.user.privacy_age ?? profileData.privacy_age,
              privacy_phone: apiRes.user.privacy_phone ?? profileData.privacy_phone,
              privacy_tags: apiRes.user.privacy_tags ?? profileData.privacy_tags,
              tags: apiRes.user.tags || tags
            }
          };
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
          return { success: true, user: session.user };
        }
      }
    } catch (apiErr) {
      console.warn('[VIVU Auth] Lỗi gọi API updateProfile:', apiErr.message);
    }
  }

  // Fallback Local Storage Mode
  try {
    const local = localStorage.getItem(LOCAL_SESSION_KEY);
    if (local) {
      const session = JSON.parse(local);
      session.user.custom_status = resolvedCustomStatus;
      session.user.custom_song = resolvedCustomSong;
      session.user.user_metadata = {
        ...session.user.user_metadata,
        full_name: fullName,
        avatar_url: avatarUrl,
        custom_status: resolvedCustomStatus,
        custom_song: resolvedCustomSong,
        phone: phone,
        age: profileData.age,
        job: profileData.job,
        bio: profileData.bio,
        privacy_age: profileData.privacy_age,
        privacy_phone: profileData.privacy_phone,
        privacy_tags: profileData.privacy_tags,
        tags: tags
      };
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
      return { success: true, user: session.user };
    }
  } catch (err) {
    console.error('[VIVU Auth] Lỗi lưu profile local:', err);
  }

  return { success: true, profile: profileData };
}

/**
 * Đăng xuất khỏi hệ thống
 */
export async function signOut() {
  localStorage.removeItem(LOCAL_SESSION_KEY);
  localStorage.removeItem('vivu_user_code');
  localStorage.removeItem('vivu_user_avatar');
  localStorage.removeItem('vivu_device_client_id');
  localStorage.removeItem('vivu_stories_cache');
  localStorage.removeItem('vivu_messages_cache');
  localStorage.removeItem('vivu_custom_circles_cache');
  localStorage.removeItem('vivu_user_profile_data');
  localStorage.removeItem('vivu_user_name');
  localStorage.removeItem('vivu_user_custom_status');
  localStorage.removeItem('vivu_user_custom_song');
  localStorage.removeItem('vivu_user_custom_chibi');
  localStorage.removeItem('vivu_user_custom_chibi_expires');
  localStorage.removeItem('vivu_user_pin_skin');
  localStorage.removeItem('vivu_user_pin_mascot');
  localStorage.removeItem('vivu_user_pin_action');
  localStorage.removeItem('vivu_user_active_story');

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn('[VIVU Auth] Lỗi khi signOut Supabase:', error.message);
    }
  }

  return true;
}


/**
 * Đăng ký listener lắng nghe biến động phiên đăng nhập
 * @param {function} callback 
 */
export function onAuthStateChange(callback) {
  if (isSupabaseConfigured && supabase) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return () => subscription?.unsubscribe();
  }

  // Local listener (chỉ phản ứng khi session key thay đổi và đảm bảo await session object)
  const handler = async (e) => {
    if (e && e.key && e.key !== LOCAL_SESSION_KEY) return;
    try {
      const session = await getSession();
      callback('LOCAL_STORAGE_CHANGE', session);
    } catch (err) {
      console.warn('[onAuthStateChange] Handler error:', err);
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

/**
 * Bản địa hóa các thông báo lỗi từ Supabase Auth sang Tiếng Việt
 */
function translateAuthError(message = '') {
  const msg = message.toLowerCase();
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.';
  }
  if (msg.includes('user already registered') || msg.includes('already registered')) {
    return 'Email này đã được đăng ký tài khoản. Bạn vui lòng chọn Đăng nhập.';
  }
  if (msg.includes('password should be at least')) {
    return 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.';
  }
  if (msg.includes('rate limit exceeded') || msg.includes('too many requests')) {
    return 'Thao tác quá nhanh hoặc vượt giới hạn. Vui lòng thử lại sau ít phút.';
  }
  if (msg.includes('provider is not enabled') || msg.includes('unsupported provider')) {
    return 'Nhà cung cấp này chưa được bật trong Supabase Dashboard → Authentication → Sign In / Providers.';
  }
  if (msg.includes('redirect') && (msg.includes('not allowed') || msg.includes('uri'))) {
    return 'Địa chỉ quay lại chưa được thêm vào Supabase Authentication → URL Configuration → Redirect URLs.';
  }
  return message || 'Đã có lỗi xảy ra trong quá trình xác thực. Vui lòng thử lại.';
}
