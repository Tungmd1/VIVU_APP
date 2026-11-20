import { dbService, supabase } from '../services/dbService.js';

export const authController = {
  async register(req, res, next) {
    try {
      const { email, password, fullName, avatarUrl } = req.body;
      const result = await dbService.registerUser({ email, password, fullName, avatarUrl });
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await dbService.loginUser({ email, password });
      res.json(result);
    } catch (err) {
      res.status(401).json({ success: false, message: err.message });
    }
  },

  async syncOAuthAccount(req, res) {
    const authorization = req.headers.authorization || '';
    const accessToken = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!accessToken) {
      return res.status(401).json({ success: false, message: 'Thiếu Supabase access token hợp lệ' });
    }
    if (!supabase) {
      return res.status(503).json({ success: false, message: 'Backend chưa cấu hình Supabase để xác minh tài khoản OAuth' });
    }

    try {
      const { data, error } = await supabase.auth.getUser(accessToken);
      const authUser = data?.user;
      if (error || !authUser?.id || !authUser.email) {
        return res.status(401).json({ success: false, message: 'Supabase access token không hợp lệ hoặc tài khoản thiếu email' });
      }

      const result = await dbService.syncSupabaseUser({
        id: authUser.id,
        email: authUser.email,
        fullName: authUser.user_metadata?.full_name || authUser.user_metadata?.name,
        avatarUrl: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture,
        provider: authUser.app_metadata?.provider || authUser.identities?.[0]?.provider || 'supabase'
      });
      return res.json(result);
    } catch (err) {
      const status = err.message?.includes('đã thuộc một tài khoản') ? 409 : 400;
      return res.status(status).json({ success: false, message: err.message || 'Không thể đồng bộ tài khoản OAuth' });
    }
  },

  async googleLogin(req, res) {
    try {
      const { credential, email, fullName, avatarUrl, googleId } = req.body || {};
      let targetEmail = email;
      let targetName = fullName;
      let targetAvatar = avatarUrl;
      let targetGoogleId = googleId;

      // Nếu client gửi credential (JWT ID token từ Google Identity Services)
      if (credential && typeof credential === 'string') {
        try {
          // Thử verify với Google Tokeninfo API
          const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`, {
            signal: AbortSignal.timeout(3000)
          });
          if (verifyRes.ok) {
            const tokenInfo = await verifyRes.json();
            if (tokenInfo.email) {
              targetEmail = tokenInfo.email;
              targetName = tokenInfo.name || targetName;
              targetAvatar = tokenInfo.picture || targetAvatar;
              targetGoogleId = tokenInfo.sub || targetGoogleId;
            }
          } else {
            // Fallback decode local payload nếu tokeninfo network error
            const parts = credential.split('.');
            if (parts.length >= 2) {
              const base64Url = parts[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const decoded = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
              if (decoded.email) {
                targetEmail = decoded.email;
                targetName = decoded.name || targetName;
                targetAvatar = decoded.picture || targetAvatar;
                targetGoogleId = decoded.sub || targetGoogleId;
              }
            }
          }
        } catch {
          // Fallback decode local payload nếu offline
          const parts = credential.split('.');
          if (parts.length >= 2) {
            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const decoded = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
            if (decoded.email) {
              targetEmail = decoded.email;
              targetName = decoded.name || targetName;
              targetAvatar = decoded.picture || targetAvatar;
              targetGoogleId = decoded.sub || targetGoogleId;
            }
          }
        }
      }

      if (!targetEmail) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin email tài khoản Google'
        });
      }

      const result = await dbService.syncGoogleUser({
        googleId: targetGoogleId,
        email: targetEmail,
        fullName: targetName,
        avatarUrl: targetAvatar
      });

      return res.json(result);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Lỗi đăng nhập Google'
      });
    }
  },

  async facebookLogin(req, res) {
    try {
      const { accessToken, email, fullName, avatarUrl, facebookId } = req.body || {};
      let targetEmail = email;
      let targetName = fullName;
      let targetAvatar = avatarUrl;
      let targetFacebookId = facebookId;

      // Nếu client gửi accessToken (từ Facebook SDK FB.login)
      if (accessToken && typeof accessToken === 'string') {
        try {
          const fbRes = await fetch(
            `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${encodeURIComponent(accessToken)}`,
            { signal: AbortSignal.timeout(4000) }
          );
          if (fbRes.ok) {
            const fbData = await fbRes.json();
            if (fbData.id) {
              targetFacebookId = fbData.id;
              targetName = fbData.name || targetName;
              targetEmail = fbData.email || targetEmail || `fb_${fbData.id}@facebook.vivu.vn`;
              targetAvatar = fbData.picture?.data?.url || targetAvatar;
            }
          }
        } catch (err) {
          console.warn('[Facebook Auth] Graph API fetch error, fallback to client payload:', err.message);
        }
      }

      if (!targetEmail && !targetFacebookId) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin tài khoản Facebook hợp lệ'
        });
      }

      const result = await dbService.syncFacebookUser({
        facebookId: targetFacebookId,
        email: targetEmail,
        fullName: targetName,
        avatarUrl: targetAvatar
      });

      return res.json(result);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Lỗi đăng nhập Facebook'
      });
    }
  },

  async getMe(req, res, next) {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'userId là bắt buộc' });
      }
      const user = await dbService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
      }
      res.json({ success: true, user });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const { 
        userId, 
        fullName, 
        avatarUrl, 
        avatar_url, 
        customStatus, 
        custom_status,
        age, 
        job, 
        phone, 
        bio, 
        tags, 
        photos, 
        favorite_song, 
        privacy_age, 
        privacy_phone, 
        privacy_tags, 
        pinSkin, 
        pin_skin,
        customChibi, 
        custom_chibi,
        chibiExpiresAt,
        chibi_expires_at,
        customSong,
        custom_song,
        pinMascot, 
        pin_mascot,
        pinAction,
        pin_action 
      } = req.body;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'userId là bắt buộc' });
      }
      const targetAvatar = avatarUrl !== undefined ? avatarUrl : avatar_url;
      const targetStatus = customStatus !== undefined ? customStatus : custom_status;
      const targetChibi = customChibi !== undefined ? customChibi : custom_chibi;
      const targetChibiExp = chibiExpiresAt !== undefined ? chibiExpiresAt : chibi_expires_at;
      const targetSong = customSong !== undefined ? customSong : custom_song;
      const targetSkin = pinSkin !== undefined ? pinSkin : pin_skin;
      const targetMascot = pinMascot !== undefined ? pinMascot : pin_mascot;
      const targetAction = pinAction !== undefined ? pinAction : pin_action;

      const updatedUser = await dbService.updateUserProfile(userId, {
        fullName,
        avatarUrl: targetAvatar,
        customStatus: targetStatus,
        age,
        job,
        phone,
        bio,
        tags,
        photos,
        favorite_song,
        privacy_age,
        privacy_phone,
        privacy_tags,
        pinSkin: targetSkin,
        customChibi: targetChibi,
        chibiExpiresAt: targetChibiExp,
        customSong: targetSong,
        pinMascot: targetMascot,
        pinAction: targetAction
      });
      res.json({ success: true, user: updatedUser });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
};
