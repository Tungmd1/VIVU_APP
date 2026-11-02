// ====================================================================
// VIVU API CLIENT SERVICE - TÍCH HỢP TRỰC TIẾP BACKEND SERVER
// ====================================================================

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  return '/api';
};

const API_BASE_URL = getBaseUrl();

export const apiClient = {
  baseUrl: API_BASE_URL,

  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return await res.json();
    } catch (err) {
      console.warn('[API Client] Backend offline, using direct local/cloud service:', err.message);
      return null;
    }
  },

  async getTunnelUrl() {
    try {
      const res = await fetch(`${API_BASE_URL}/tunnel`);
      const json = await res.json();
      if (json.success && json.url) return json.url;
    } catch (e) {
      // Offline fallback
    }
    return '';
  },

  async register(email, password, fullName, avatarUrl) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, avatarUrl })
      });
      const json = await res.json();
      return json;
    } catch (err) {
      console.warn('[API Client] register error:', err.message);
      throw err;
    }
  },

  async login(email, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      return json;
    } catch (err) {
      console.warn('[API Client] login error:', err.message);
      throw err;
    }
  },

  async resetPasswordMock(email, newPassword, otp) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password-mock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword, otp })
      });
      const json = await res.json();
      return json;
    } catch (err) {
      console.warn('[API Client] resetPasswordMock error:', err.message);
      throw err;
    }
  },

  async syncSupabaseAccount(accessToken) {
    const res = await fetch(`${API_BASE_URL}/auth/oauth/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success || !json.user) {
      throw new Error(json.message || 'Không thể đồng bộ tài khoản với VIVU.');
    }
    return json;
  },

  async googleLogin(payload) {
    const res = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success || !json.user) {
      throw new Error(json.message || 'Không thể đăng nhập bằng Google.');
    }
    return json;
  },

  async facebookLogin(payload) {
    const res = await fetch(`${API_BASE_URL}/auth/facebook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success || !json.user) {
      throw new Error(json.message || 'Không thể đăng nhập bằng Facebook.');
    }
    return json;
  },

  async getMe(userId) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me?userId=${encodeURIComponent(userId)}`);
      const json = await res.json();
      if (json.success && json.user) return json.user;
    } catch (err) {
      console.warn('[API Client] getMe error:', err.message);
    }
    return null;
  },

  async updateProfile(userId, profileData) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...profileData })
      });
      return await res.json();
    } catch (err) {
      console.warn('[API Client] updateProfile error:', err.message);
      throw err;
    }
  },

  async updateUserProfile(userId, profileData) {
    return this.updateProfile(userId, profileData);
  },

  async getStories(privacy = null) {
    try {
      const url = privacy ? `${API_BASE_URL}/stories?privacy=${privacy}` : `${API_BASE_URL}/stories`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) return json.data;
    } catch (err) {
      console.warn('[API Client] getStories fallback:', err.message);
    }
    return null;
  },

  async createStory(storyData) {
    try {
      const res = await fetch(`${API_BASE_URL}/stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyData)
      });
      const json = await res.json();
      if (json.success && json.data) return json.data;
    } catch (err) {
      console.warn('[API Client] createStory fallback:', err.message);
    }
    return null;
  },

  async deleteStory(storyId, userId = null, userCode = null) {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (userCode) params.append('userCode', userCode);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const url = `${API_BASE_URL}/stories/${encodeURIComponent(storyId)}${queryString}`;
      const res = await fetch(url, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) return true;
    } catch (err) {
      console.warn('[API Client] deleteStory fallback:', err.message);
    }
    return false;
  },

  async voteStoryPoll(storyId, pollId, optionIndex, userId) {
    try {
      const res = await fetch(`${API_BASE_URL}/stories/${storyId}/poll-vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, optionIndex, userId })
      });
      const json = await res.json();
      if (json.success && json.data) return json.data;
    } catch (err) {
      console.warn('[API Client] voteStoryPoll fallback:', err.message);
    }
    return null;
  },

  async replyStoryQA(storyId, qaId, prompt, text, user) {
    try {
      const res = await fetch(`${API_BASE_URL}/stories/${storyId}/qa-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qaId, prompt, text, user })
      });
      const json = await res.json();
      if (json.success && json.data) return json.data;
    } catch (err) {
      console.warn('[API Client] replyStoryQA fallback:', err.message);
    }
    return null;
  },

  async reactStory(storyId, reactionType, userId) {
    try {
      const res = await fetch(`${API_BASE_URL}/stories/${storyId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactionType, userId })
      });
      const json = await res.json();
      if (json.success && json.data) return json.data;
    } catch (err) {
      console.warn('[API Client] reactStory fallback:', err.message);
    }
    return null;
  },

  async getProfiles() {
    try {
      const res = await fetch(`${API_BASE_URL}/gps/profiles`);
      const json = await res.json();
      if (json.success && json.data) return json.data;
    } catch (err) {
      console.warn('[API Client] getProfiles fallback:', err.message);
    }
    return null;
  },

  async updateGps(userId, lat, lng, customStatus, name, avatar, userCode, phone) {
    try {
      const res = await fetch(`${API_BASE_URL}/gps/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, lat, lng, customStatus, name, avatar, userCode, phone })
      });
      const json = await res.json();
      if (json.success && json.data) return json.data;
    } catch (err) {
      console.warn('[API Client] updateGps fallback:', err.message);
    }
    return null;
  },

  async setOffline(userId) {
    if (!userId) return null;
    try {
      const payload = JSON.stringify({ userId });
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(`${API_BASE_URL}/gps/offline`, blob);
      } else {
        await fetch(`${API_BASE_URL}/gps/offline`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        });
      }
    } catch (err) {
      console.warn('[API Client] setOffline fallback:', err.message);
    }
    return null;
  },

  getDirectConversationId(userIdA, userIdB) {
    if (!userIdA || !userIdB) return null;
    return `conv-direct-${[String(userIdA), String(userIdB)].sort().join('--')}`;
  },

  async getMessages(conversationId, userId = null) {
    try {
      const url = userId ? `${API_BASE_URL}/chat/${conversationId}/messages?userId=${encodeURIComponent(userId)}` : `${API_BASE_URL}/chat/${conversationId}/messages`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) return json.data;
    } catch (err) {
      console.warn('[API Client] getMessages fallback:', err.message);
    }
    return null;
  },

  async getUserConversations(userId) {
    if (!userId) return [];
    try {
      const res = await fetch(`${API_BASE_URL}/chat/conversations/${userId}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) return json.data;
    } catch (err) {
      console.warn('[API Client] getUserConversations fallback:', err.message);
    }
    return [];
  },

  async getInboxMessages(userId) {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/inbox/${userId}`);
      const json = await res.json();
      if (json.success && json.data) return json.data;
    } catch (err) {
      console.warn('[API Client] getInboxMessages fallback:', err.message);
    }
    return null;
  },

  async sendMessage(msgPayload) {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgPayload)
      });
      const json = await res.json();
      if (json.success && json.data) return json.data;
    } catch (err) {
      console.warn('[API Client] sendMessage fallback:', err.message);
    }
    return null;
  },

  async markMessagesAsRead(conversationId, readerId) {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/messages/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, readerId })
      });
      const json = await res.json();
      if (json.success) return json.count;
    } catch (err) {
      console.warn('[API Client] markMessagesAsRead fallback:', err.message);
    }
    return 0;
  },

  // ------------------------------------------------------------------
  // FRIENDSHIP & USER DISCOVERY APIS
  // ------------------------------------------------------------------
  async searchUsers(query, currentUserId) {
    try {
      const res = await fetch(`${API_BASE_URL}/friends/search?q=${encodeURIComponent(query)}&userId=${encodeURIComponent(currentUserId || '')}`);
      const json = await res.json();
      if (json.success && json.data) return json.data;
    } catch (err) {
      console.warn('[API Client] searchUsers fallback:', err.message);
    }
    return [];
  },

  async getFriendshipStatus(userIdA, userIdB) {
    try {
      const res = await fetch(`${API_BASE_URL}/friends/status?userIdA=${encodeURIComponent(userIdA)}&userIdB=${encodeURIComponent(userIdB)}`);
      const json = await res.json();
      if (json.success && json.data) return json.data;
    } catch (err) {
      console.warn('[API Client] getFriendshipStatus fallback:', err.message);
    }
    return { status: 'none', requestId: null };
  },

  async sendFriendRequest(senderId, receiverId) {
    try {
      const res = await fetch(`${API_BASE_URL}/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId, receiverId })
      });
      const json = await res.json();
      return json;
    } catch (err) {
      console.warn('[API Client] sendFriendRequest fallback:', err.message);
      return { success: false, message: err.message };
    }
  },

  async acceptFriendRequest(requestId, currentUserId) {
    try {
      const res = await fetch(`${API_BASE_URL}/friends/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, currentUserId })
      });
      const json = await res.json();
      return json;
    } catch (err) {
      console.warn('[API Client] acceptFriendRequest fallback:', err.message);
      return { success: false, message: err.message };
    }
  },

  async rejectFriendRequest(requestId, currentUserId) {
    try {
      const res = await fetch(`${API_BASE_URL}/friends/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, currentUserId })
      });
      const json = await res.json();
      return json;
    } catch (err) {
      console.warn('[API Client] rejectFriendRequest fallback:', err.message);
      return { success: false, message: err.message };
    }
  },

  async cancelFriendRequest(requestId, currentUserId) {
    try {
      const res = await fetch(`${API_BASE_URL}/friends/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, currentUserId })
      });
      const json = await res.json();
      return json;
    } catch (err) {
      console.warn('[API Client] cancelFriendRequest fallback:', err.message);
      return { success: false, message: err.message };
    }
  },

  async getFriendRequests(userId) {
    try {
      const res = await fetch(`${API_BASE_URL}/friends/requests/${encodeURIComponent(userId)}`);
      const json = await res.json();
      if (json.success && json.data) return json.data;
    } catch (err) {
      console.warn('[API Client] getFriendRequests fallback:', err.message);
    }
    return { received: [], sent: [] };
  },

  async getFriendsList(userId) {
    try {
      const res = await fetch(`${API_BASE_URL}/friends/list/${encodeURIComponent(userId)}`);
      const json = await res.json();
      if (json.success && json.data) return json.data;
    } catch (err) {
      console.warn('[API Client] getFriendsList fallback:', err.message);
    }
    return [];
  },

  async unfriend(userIdA, userIdB) {
    try {
      const res = await fetch(`${API_BASE_URL}/friends/unfriend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIdA, userIdB })
      });
      const json = await res.json();
      return json;
    } catch (err) {
      console.warn('[API Client] unfriend fallback:', err.message);
      return { success: false, message: err.message };
    }
  },

  // ================= QUẢN LÝ NHÓM (CUSTOM CIRCLES) =================
  async getCircles(userId = null) {
    try {
      const url = userId ? `${API_BASE_URL}/circles?userId=${encodeURIComponent(userId)}` : `${API_BASE_URL}/circles`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) return json.data;
    } catch (err) {
      console.warn('[API Client] getCircles fallback:', err.message);
    }
    return null;
  },

  async getCircleById(circleId, userId = null) {
    try {
      const url = userId 
        ? `${API_BASE_URL}/circles/${encodeURIComponent(circleId)}?userId=${encodeURIComponent(userId)}` 
        : `${API_BASE_URL}/circles/${encodeURIComponent(circleId)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) return json.data;
    } catch (err) {
      console.warn('[API Client] getCircleById fallback:', err.message);
    }
    return null;
  },

  async createCircle(circlePayload) {
    try {
      const res = await fetch(`${API_BASE_URL}/circles`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': circlePayload.ownerId || circlePayload.owner_id || ''
        },
        body: JSON.stringify(circlePayload)
      });
      const json = await res.json();
      if (json.success && json.data) return json.data;
    } catch (err) {
      console.warn('[API Client] createCircle fallback:', err.message);
    }
    return null;
  },

  async updateCircle(circleId, updatePayload) {
    try {
      const res = await fetch(`${API_BASE_URL}/circles/${encodeURIComponent(circleId)}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': updatePayload.requesterId || updatePayload.userId || ''
        },
        body: JSON.stringify(updatePayload)
      });
      const json = await res.json();
      if (json.success && json.data) return json.data;
    } catch (err) {
      console.warn('[API Client] updateCircle fallback:', err.message);
    }
    return null;
  },

  async inviteToCircle(circleId, { memberIds, requesterId, inviterName }) {
    try {
      const res = await fetch(`${API_BASE_URL}/circles/${encodeURIComponent(circleId)}/invite`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': requesterId || ''
        },
        body: JSON.stringify({ memberIds, requesterId, inviterName })
      });
      const json = await res.json();
      if (json.success && json.data) return json.data;
    } catch (err) {
      console.warn('[API Client] inviteToCircle fallback:', err.message);
    }
    return null;
  },

  async addMembersToCircle(circleId, { memberIds, requesterId, inviterName }) {
    try {
      const res = await fetch(`${API_BASE_URL}/circles/${encodeURIComponent(circleId)}/add-members`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': requesterId || ''
        },
        body: JSON.stringify({ memberIds, requesterId, inviterName })
      });
      const json = await res.json();
      if (json.success && json.data) return json.data;
    } catch (err) {
      console.warn('[API Client] addMembersToCircle fallback:', err.message);
    }
    return null;
  },

  async respondToCircleInvite(circleId, { userId, action, userName }) {
    try {
      const res = await fetch(`${API_BASE_URL}/circles/${encodeURIComponent(circleId)}/respond`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId || ''
        },
        body: JSON.stringify({ userId, action, userName })
      });
      const json = await res.json();
      if (json.success && json.data) return json.data;
    } catch (err) {
      console.warn('[API Client] respondToCircleInvite fallback:', err.message);
    }
    return null;
  },

  async leaveCircle(circleId, { userId, newOwnerId, userName }) {
    try {
      const res = await fetch(`${API_BASE_URL}/circles/${encodeURIComponent(circleId)}/leave`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId || ''
        },
        body: JSON.stringify({ userId, newOwnerId, userName })
      });
      const json = await res.json();
      if (json.success) return json.data;
    } catch (err) {
      console.warn('[API Client] leaveCircle fallback:', err.message);
    }
    return null;
  },

  async kickFromCircle(circleId, { targetUserId, requesterId, targetUserName }) {
    try {
      const res = await fetch(`${API_BASE_URL}/circles/${encodeURIComponent(circleId)}/kick`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': requesterId || ''
        },
        body: JSON.stringify({ targetUserId, requesterId, targetUserName })
      });
      const json = await res.json();
      if (json.success) return json.data;
    } catch (err) {
      console.warn('[API Client] kickFromCircle fallback:', err.message);
    }
    return null;
  },

  async deleteCircle(circleId, userId = null) {
    try {
      const res = await fetch(`${API_BASE_URL}/circles/${encodeURIComponent(circleId)}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId || ''
        },
        body: JSON.stringify({ userId })
      });
      const json = await res.json();
      if (json.success) return true;
    } catch (err) {
      console.warn('[API Client] deleteCircle fallback:', err.message);
    }
    return null;
  },

  // ================= NOTIFICATIONS API =================
  async getNotifications(userId) {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/${encodeURIComponent(userId)}`);
      const json = await res.json();
      if (json.success && json.data) return json.data;
    } catch (err) {
      console.warn('[API Client] getNotifications fallback:', err.message);
    }
    return [];
  },

  async markNotificationAsRead(notifId) {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/${encodeURIComponent(notifId)}/read`, {
        method: 'POST'
      });
      const json = await res.json();
      return json.success;
    } catch (err) {
      console.warn('[API Client] markNotificationAsRead fallback:', err.message);
    }
    return false;
  },

  async markAllNotificationsAsRead(userId) {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const json = await res.json();
      return json.success;
    } catch (err) {
      console.warn('[API Client] markAllNotificationsAsRead fallback:', err.message);
    }
    return false;
  },

  async deleteNotification(notifId) {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/${encodeURIComponent(notifId)}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      return json.success;
    } catch (err) {
      console.warn('[API Client] deleteNotification fallback:', err.message);
    }
    return false;
  }
};

