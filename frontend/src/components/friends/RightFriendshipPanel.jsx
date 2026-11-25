import React, { useState, useEffect, useMemo } from 'react';
import { getSafeAvatar } from '../../utils/avatarUtils';
import { apiClient } from '../../services/apiClient';
import FriendsListSection from './FriendsListSection';
import NearbyPeersSection from './NearbyPeersSection';

/**
 * RightFriendshipPanel - Khu vực Quản lý Kết nối & Bạn bè chuyên dụng ở Cạnh Phải Màn Hình
 * Phong cách Luminous Solar-Cyber HUD (White Cyberpunk)
 * Căn cứ kỹ thuật: Screen 11 & docs/Tokens_Spec.md (Nút 3.1, 3.2, 3.3, 3.4)
 * Tuân thủ Rule 7 (< 450 dòng), Rule 5 (100% Bootstrap Icons), Rule 45 (Không mockup)
 */
export default function RightFriendshipPanel({
  isOpen,
  onClose,
  currentUserId,
  currentUserName,
  currentUserCode,
  currentUserAvatar,
  nearbyPeers = [],
  friends = [],
  incomingRequestsCount = 0,
  onRequestHandled,
  onStartChatWithUser,
  onOpenUserProfile
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loadingActionId, setLoadingActionId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Phím Escape để đóng panel
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Tải danh sách lời mời kết bạn từ server
  const loadRequests = async () => {
    if (!currentUserId) return;
    try {
      const data = await apiClient.getFriendRequests(currentUserId);
      if (data && Array.isArray(data.received)) setPendingRequests(data.received);
      if (data && Array.isArray(data.sent)) setSentRequests(data.sent);
    } catch (e) {
      console.warn('Lỗi tải friend requests:', e);
    }
  };

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 8000);
    return () => clearInterval(interval);
  }, [currentUserId, isOpen, incomingRequestsCount, friends.length]);

  // Tìm kiếm người dùng khi gõ phím
  useEffect(() => {
    let active = true;
    const search = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const res = await apiClient.searchUsers(searchQuery.trim(), currentUserId);
        if (active) setSearchResults(res || []);
      } catch (err) {
        console.warn('Lỗi tìm kiếm:', err);
      } finally {
        if (active) setIsSearching(false);
      }
    };
    const t = setTimeout(search, 300);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [searchQuery, currentUserId]);

  // Phân loại bạn bè: Online trước, Offline sau
  const sortedFriends = useMemo(() => {
    if (!Array.isArray(friends)) return [];
    return [...friends].sort((a, b) => {
      const aOn = Boolean(a.isOnline || a.is_online);
      const bOn = Boolean(b.isOnline || b.is_online);
      if (aOn === bOn) return (a.name || '').localeCompare(b.name || '');
      return aOn ? -1 : 1;
    });
  }, [friends]);

  const onlineFriendsCount = useMemo(() => {
    return sortedFriends.filter(f => Boolean(f.isOnline || f.is_online)).length;
  }, [sortedFriends]);

  // Gửi lời mời kết bạn
  const handleSendRequest = async (targetUserId, targetName) => {
    setLoadingActionId(targetUserId);
    try {
      const res = await apiClient.sendFriendRequest(currentUserId, targetUserId);
      if (res?.success) {
        setStatusMessage(`Đã gửi lời mời đến ${targetName}!`);
        setTimeout(() => setStatusMessage(null), 3000);
        await loadRequests();
        onRequestHandled?.();
        if (searchQuery.trim()) {
          const updated = await apiClient.searchUsers(searchQuery.trim(), currentUserId);
          setSearchResults(updated || []);
        }
      }
    } catch (err) {
      console.warn('Lỗi gửi kết bạn:', err);
    } finally {
      setLoadingActionId(null);
    }
  };

  // Nút 3.3: Chấp nhận lời mời kết bạn
  const handleAcceptRequest = async (reqId, senderName) => {
    setLoadingActionId(reqId);
    try {
      const res = await apiClient.acceptFriendRequest(reqId, currentUserId);
      if (res?.success) {
        setStatusMessage(`Đã trở thành bạn bè với ${senderName}!`);
        setTimeout(() => setStatusMessage(null), 3000);
        await loadRequests();
        onRequestHandled?.();
      }
    } catch (err) {
      console.warn('Lỗi chấp nhận:', err);
    } finally {
      setLoadingActionId(null);
    }
  };

  // Nút 3.4: Từ chối lời mời
  const handleRejectRequest = async (reqId) => {
    setLoadingActionId(reqId);
    try {
      await apiClient.rejectFriendRequest(reqId, currentUserId);
      await loadRequests();
      onRequestHandled?.();
    } catch (err) {
      console.warn('Lỗi từ chối:', err);
    } finally {
      setLoadingActionId(null);
    }
  };

  // Nút 3.1: Sao chép mã VU-XXXX
  const handleCopyCode = () => {
    if (!currentUserCode) return;
    navigator.clipboard?.writeText(currentUserCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Định vị bạn bè trên bản đồ 3D
  const handleLocateFriend = (friend) => {
    const targetLat = Number(friend.lat ?? friend.realLat);
    const targetLng = Number(friend.lng ?? friend.realLng);
    if (!isNaN(targetLat) && !isNaN(targetLng) && window.__vivu_map) {
      onClose?.();
      window.__vivu_map.flyTo([targetLat, targetLng], 17, { duration: 0.9 });
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
          aria-hidden="true"
        />
      )}

      {/* Cột / Panel Kết Nối Cạnh Phải */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Khu vực Kết nối & Bạn bè"
        className={`fixed top-0 right-0 h-[100dvh] w-full max-w-[340px] sm:max-w-[380px] bg-white/98 backdrop-blur-2xl border-l border-[#D2D9F4] z-50 flex flex-col justify-between transition-transform duration-300 ease-out shadow-2xl font-sans select-none ${
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none invisible'
        }`}
      >
        {/* 1. HEADER PANEL */}
        <div className="p-4 border-b border-[#D2D9F4] shrink-0 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[rgba(0,229,255,0.15)] text-[#00838F] flex items-center justify-center text-sm border border-[rgba(0,229,255,0.4)] shadow-xs">
                <i className="bi bi-people-fill"></i>
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#131315] font-display tracking-tight">Kết Nối &amp; Bạn Bè</h2>
                <p className="text-[10px] text-[#70787E]">Danh sách bạn bè &amp; lời mời kết nối</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#F2F3FF] border border-[#D2D9F4] text-[#131315] hover:bg-[#E6E7F6] flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-xs"
              title="Đóng panel"
              aria-label="Đóng panel kết nối bạn bè"
            >
              <i className="bi bi-x-lg text-xs font-bold"></i>
            </button>
          </div>

          {/* Thẻ mã cá nhân */}
          {currentUserCode && (
            <div className="p-2.5 rounded-xl bg-[#FAFAFF] border border-[#D2D9F4] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="bi bi-qr-code text-xs text-[#00838F]"></i>
                <div className="text-[11px] text-[#40484D]">
                  <span>Mã của bạn: </span>
                  <strong className="font-mono text-[#131315] tracking-wide">{currentUserCode}</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                aria-label={copiedCode ? 'Đã sao chép mã của bạn' : 'Sao chép mã của bạn'}
                title="Sao chép mã của bạn"
                className="px-2.5 py-1 rounded-full bg-[rgba(0,229,255,0.15)] hover:bg-[rgba(0,229,255,0.25)] border border-[rgba(0,229,255,0.50)] text-[#00667A] text-[10px] font-mono font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                <i className={`bi ${copiedCode ? 'bi-check-lg text-[#10FFA0]' : 'bi-copy'}`}></i>
                <span>{copiedCode ? 'Đã sao chép' : 'Sao chép'}</span>
              </button>
            </div>
          )}

          {/* Ô tìm kiếm */}
          <div className="relative">
            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#70787E]"></i>
            <input
              id="search-right-friends-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập mã VU-XXXX hoặc tên..."
              aria-label="Tìm kiếm bạn bè trong danh sách"
              className="w-full pl-8 pr-7 py-2 rounded-xl bg-[#F2F3FF] border border-[#D2D9F4] text-xs text-[#131315] placeholder-[#70787E] outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[rgba(0,229,255,0.3)] transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#70787E] hover:text-[#131315]"
              >
                <i className="bi bi-x-circle-fill text-xs"></i>
              </button>
            )}
          </div>
        </div>

        {/* Thông báo thao tác */}
        {statusMessage && (
          <div className="mx-4 mt-2 p-2 rounded-xl bg-[rgba(16,255,160,0.15)] border border-[rgba(16,255,160,0.4)] text-[#00838F] text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <i className="bi bi-check-circle-fill text-[#10FFA0]"></i>
            <span className="truncate">{statusMessage}</span>
          </div>
        )}

        {/* 2. NỘI DUNG CUỘN DANH SÁCH */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-5 bg-[#FAFAFF]">
          {searchQuery.trim() ? (
            /* KẾT QUẢ TÌM KIẾM */
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-[#70787E] uppercase tracking-wider flex items-center justify-between font-display">
                <span>Kết quả tìm kiếm</span>
                {isSearching && <i className="bi bi-arrow-repeat animate-spin text-[#00838F]"></i>}
              </div>

              {searchResults.length === 0 && !isSearching ? (
                <div className="py-6 text-center text-xs text-[#70787E] bg-white rounded-2xl border border-dashed border-[#D2D9F4]">
                  Không tìm thấy người dùng phù hợp.
                </div>
              ) : (
                searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="p-2.5 rounded-2xl bg-white border border-[#D2D9F4] flex items-center justify-between gap-2 hover:border-[rgba(0,229,255,0.4)] transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <img
                        src={getSafeAvatar(user.avatar || user.avatar_url)}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border border-[#D2D9F4] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#131315] font-display truncate">{user.name}</div>
                        <div className="text-[10px] text-[#70787E] truncate font-mono">{user.user_code || ''}</div>
                      </div>
                    </div>

                    {user.is_friend ? (
                      <span className="px-2.5 py-1 rounded-full bg-[#F2F3FF] text-[#00838F] border border-[#D2D9F4] text-[10px] font-semibold shrink-0">
                        Bạn bè
                      </span>
                    ) : user.friendship_status === 'pending_sent' ? (
                      <span className="px-2.5 py-1 rounded-full bg-[rgba(255,170,0,0.15)] text-[#B06000] border border-[rgba(255,170,0,0.4)] text-[10px] font-semibold shrink-0">
                        Đã gửi
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={loadingActionId === user.id}
                        onClick={() => handleSendRequest(user.id, user.name)}
                        className="px-3 py-1 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] border border-[#00F0FF] hover:opacity-95 active:scale-95 text-[10px] font-bold font-display transition-all shrink-0 flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-xs"
                      >
                        {loadingActionId === user.id ? (
                          <i className="bi bi-arrow-repeat animate-spin"></i>
                        ) : (
                          <i className="bi bi-person-plus-fill"></i>
                        )}
                        <span>Kết bạn</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              {/* PHẦN 1: BẠN BÈ CỦA BẠN (ONLINE & OFFLINE) */}
              <FriendsListSection
                sortedFriends={sortedFriends}
                onlineFriendsCount={onlineFriendsCount}
                onLocateFriend={handleLocateFriend}
                onStartChatWithUser={onStartChatWithUser}
                onOpenUserProfile={onOpenUserProfile}
                onClose={onClose}
              />

              {/* PHẦN 2: LỜI MỜI KẾT BẠN ĐANG CHỜ */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#70787E] uppercase tracking-wider flex items-center gap-1.5 font-display">
                    <i className="bi bi-envelope-paper-fill text-[#00838F] text-xs"></i>
                    <span>Lời mời kết bạn</span>
                  </span>
                  {pendingRequests.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#FF2A85] text-white text-[10px] font-bold">
                      {pendingRequests.length}
                    </span>
                  )}
                </div>

                {pendingRequests.length === 0 ? (
                  <div className="py-3 px-3 rounded-2xl bg-white border border-[#D2D9F4] text-center text-xs text-[#70787E]">
                    Không có lời mời nào đang chờ.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pendingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3 rounded-2xl bg-white border border-[#D2D9F4] space-y-2.5 shadow-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={getSafeAvatar(req.sender_avatar)}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border-2 border-[#10FFA0] shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-[#131315] font-display truncate">
                              {req.sender_name || 'Người dùng VIVU'}
                            </div>
                            <div className="text-[10px] text-[#70787E] font-mono">
                              {req.sender_user_code || 'Vừa gửi lời mời'}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            disabled={loadingActionId === req.id}
                            onClick={() => handleAcceptRequest(req.id, req.sender_name)}
                            className="w-full py-1.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] border border-[#00F0FF] text-[#08202E] text-xs font-display font-bold hover:opacity-95 active:scale-95 transition-all shadow-[0_0_10px_rgba(0,229,255,0.35)] flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {loadingActionId === req.id ? (
                              <i className="bi bi-arrow-repeat animate-spin"></i>
                            ) : (
                              <i className="bi bi-check-lg font-bold"></i>
                            )}
                            <span>Chấp nhận</span>
                          </button>

                          <button
                            type="button"
                            disabled={loadingActionId === req.id}
                            onClick={() => handleRejectRequest(req.id)}
                            className="w-full py-1.5 rounded-xl bg-[#F2F3FF] border border-[#D2D9F4] text-[#40484D] hover:bg-[#FEE2E2] hover:border-[#FCA5A5] hover:text-[#EF4444] text-xs font-display font-semibold active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 shadow-xs"
                          >
                            <span>Từ chối</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PHẦN 3: GỢI Ý NGƯỜI DÙNG QUANH ĐÂY */}
              <NearbyPeersSection
                nearbyPeers={nearbyPeers}
                sortedFriends={sortedFriends}
                sentRequests={sentRequests}
                loadingActionId={loadingActionId}
                onSendRequest={handleSendRequest}
                onStartChatWithUser={onStartChatWithUser}
                onOpenUserProfile={onOpenUserProfile}
              />
            </>
          )}
        </div>

        {/* Footer Panel */}
        <div className="p-3 border-t border-[#D2D9F4] bg-[#FAFAFF] text-center text-[10px] text-[#70787E] shrink-0 font-medium">
          Mạng xã hội bản đồ kết nối thời gian thực VIVU
        </div>
      </aside>
    </>
  );
}
