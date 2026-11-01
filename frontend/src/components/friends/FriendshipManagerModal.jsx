import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';

/**
 * FriendshipManagerModal - Quản lý kết bạn, tìm kiếm người dùng và danh sách bạn bè
 * Phong cách Luminous Solar-Cyber HUD (White Cyberpunk)
 * Căn cứ kỹ thuật: Screen 11 & docs/Tokens_Spec.md (Nút 3.1, 3.2, 3.3, 3.4)
 */
export default function FriendshipManagerModal({
  isOpen,
  onClose,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  currentUserCode,
  onStartChatWithUser,
  onRequestHandled
}) {
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'requests' | 'friends'
  const [requestSubTab, setRequestSubTab] = useState('received'); // 'received' | 'sent'

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Requests state
  const [requests, setRequests] = useState({ received: [], sent: [] });
  // Friends list state
  const [friendsList, setFriendsList] = useState([]);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Tải danh sách lời mời và bạn bè khi mở modal hoặc đổi tab
  const reloadData = async () => {
    if (!currentUserId) return;
    try {
      const [reqData, listData] = await Promise.all([
        apiClient.getFriendRequests(currentUserId),
        apiClient.getFriendsList(currentUserId)
      ]);
      if (reqData) setRequests(reqData);
      if (listData) setFriendsList(listData);
    } catch (err) {
      console.warn('Error loading friend data:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      reloadData();
    }
  }, [isOpen, currentUserId, activeTab]);

  // Tìm kiếm người dùng khi nhập query
  useEffect(() => {
    let isMounted = true;
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const results = await apiClient.searchUsers(searchQuery, currentUserId);
        if (isMounted) setSearchResults(results || []);
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        if (isMounted) setIsSearching(false);
      }
    };

    const timer = setTimeout(performSearch, 300);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, currentUserId]);

  if (!isOpen) return null;

  // Gửi lời mời kết bạn
  const handleSendRequest = async (targetUserId) => {
    setActionLoadingId(targetUserId);
    try {
      const res = await apiClient.sendFriendRequest(currentUserId, targetUserId);
      if (res && res.success) {
        await reloadData();
        if (searchQuery.trim()) {
          const updated = await apiClient.searchUsers(searchQuery, currentUserId);
          setSearchResults(updated || []);
        }
        if (onRequestHandled) onRequestHandled();
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // Chấp nhận lời mời (Nút 3.3)
  const handleAcceptRequest = async (requestId) => {
    setActionLoadingId(requestId);
    try {
      const res = await apiClient.acceptFriendRequest(requestId, currentUserId);
      if (res && res.success) {
        await reloadData();
        if (searchQuery.trim()) {
          const updated = await apiClient.searchUsers(searchQuery, currentUserId);
          setSearchResults(updated || []);
        }
        if (onRequestHandled) onRequestHandled();
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // Từ chối lời mời (Nút 3.4)
  const handleRejectRequest = async (requestId) => {
    setActionLoadingId(requestId);
    try {
      const res = await apiClient.rejectFriendRequest(requestId, currentUserId);
      if (res && res.success) {
        await reloadData();
        if (onRequestHandled) onRequestHandled();
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // Hủy lời mời đã gửi
  const handleCancelRequest = async (requestId) => {
    setActionLoadingId(requestId);
    try {
      const res = await apiClient.cancelFriendRequest(requestId, currentUserId);
      if (res && res.success) {
        await reloadData();
        if (searchQuery.trim()) {
          const updated = await apiClient.searchUsers(searchQuery, currentUserId);
          setSearchResults(updated || []);
        }
        if (onRequestHandled) onRequestHandled();
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // Hủy kết bạn
  const handleUnfriend = async (friendId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy kết bạn với người này?')) return;
    setActionLoadingId(friendId);
    try {
      const res = await apiClient.unfriend(currentUserId, friendId);
      if (res && res.success) {
        await reloadData();
        if (searchQuery.trim()) {
          const updated = await apiClient.searchUsers(searchQuery, currentUserId);
          setSearchResults(updated || []);
        }
        if (onRequestHandled) onRequestHandled();
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // Nút 3.1: Sao chép mã VU-XXXX
  const copyMyCode = () => {
    if (currentUserCode && navigator.clipboard) {
      navigator.clipboard.writeText(currentUserCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const totalReceived = requests.received?.length || 0;

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200 select-none font-sans">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-white border border-[#D8E3E7] rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.15)] text-[#14252E] flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-[#D8E3E7] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[rgba(10,131,149,0.10)] border border-[rgba(10,131,149,0.25)] flex items-center justify-center text-[#0A8395]">
              <i className="bi bi-people-fill text-lg"></i>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#14252E] font-display tracking-tight">Kết Bạn &amp; Tìm Kiếm</h2>
              <p className="text-[11px] text-[#52646D]">Đồng bộ bạn bè và trò chuyện trực tiếp</p>
            </div>
          </div>

          {/* Nút 3.2: Nút Đóng Trang (36x36px, bo 12px, #F3F7F8) */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#F3F7F8] border border-[#D8E3E7] text-[#14252E] hover:bg-[#E6E7F6] flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-xs"
            title="Đóng"
          >
            <i className="bi bi-x-lg text-xs font-bold"></i>
          </button>
        </div>

        {/* My ID Card Bar */}
        <div className="mx-5 my-3 p-3 rounded-2xl bg-[#F8FAFB] border border-[#D8E3E7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={currentUserAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt=""
                className="w-10 h-10 rounded-full object-cover border-2 border-[#10FFA0]"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10FFA0] border-2 border-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#14252E] font-display flex items-center gap-1.5">
                <span>{currentUserName || 'Bạn'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[rgba(10,131,149,0.08)] text-[#0A8395] font-bold font-mono">Tôi</span>
              </div>
              <div className="text-[11px] text-[#52646D] flex items-center gap-1 font-mono mt-0.5">
                <span>Mã: <strong className="text-[#14252E] font-mono">{currentUserCode || 'VU-0000'}</strong></span>
              </div>
            </div>
          </div>

          {/* Nút 3.1: Nút "Sao Chép" Mã Lưới Tự Động (Pill, height 34px, bg rgba(10,131,149,0.10)) */}
          <button
            onClick={copyMyCode}
            className="h-[34px] px-3.5 rounded-full bg-[rgba(10,131,149,0.10)] hover:bg-[rgba(0,229,255,0.25)] active:scale-95 border border-[rgba(10,131,149,0.30)] text-xs text-[#0A8395] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <i className={`bi ${copiedCode ? 'bi-check-lg text-[#10FFA0]' : 'bi-copy'} text-xs text-[#0A8395]`}></i>
            <span className="text-[12px]">{copiedCode ? 'Đã sao chép' : 'Sao chép'}</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-[#D8E3E7] flex gap-1 bg-white">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2.5 text-xs font-display font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'border-[#0A8395] text-[#0A8395]'
                : 'border-transparent text-[#52646D] hover:text-[#14252E]'
            }`}
          >
            <i className="bi bi-search text-xs"></i>
            <span>Tìm Kiếm</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2.5 text-xs font-display font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all relative cursor-pointer ${
              activeTab === 'requests'
                ? 'border-[#0A8395] text-[#0A8395]'
                : 'border-transparent text-[#52646D] hover:text-[#14252E]'
            }`}
          >
            <i className="bi bi-envelope-paper-fill text-xs"></i>
            <span>Lời Mời</span>
            {totalReceived > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#FF2A85] text-white text-[10px] font-bold">
                {totalReceived}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2.5 text-xs font-display font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'friends'
                ? 'border-[#0A8395] text-[#0A8395]'
                : 'border-transparent text-[#52646D] hover:text-[#14252E]'
            }`}
          >
            <i className="bi bi-people-fill text-xs"></i>
            <span>Bạn Bè ({friendsList.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[280px] bg-[#F8FAFB]">
          {/* TAB 1: SEARCH */}
          {activeTab === 'search' && (
            <div className="space-y-3">
              {/* Search Input */}
              <div className="relative">
                <i className="bi bi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#52646D]"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nhập tên, mã số (VD: VU-1001) hoặc SĐT..."
                  className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-[#F3F7F8] border border-[#D8E3E7] focus:border-[#0A8395] focus:ring-1 focus:ring-[rgba(10,131,149,0.15)] text-[#14252E] font-medium text-xs placeholder-[#52646D] outline-none transition-all"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52646D] hover:text-[#14252E] text-xs"
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                )}
              </div>

              {/* State Indicator */}
              {isSearching && (
                <div className="flex items-center justify-center py-6 text-xs text-[#52646D] gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-[#0A8395] border-t-transparent rounded-full animate-spin"></span>
                  <span>Đang tìm kiếm người dùng...</span>
                </div>
              )}

              {/* Results List */}
              {!isSearching && searchQuery.trim() && searchResults.length === 0 && (
                <div className="text-center py-8 text-xs text-[#52646D] space-y-1.5 bg-white p-6 rounded-2xl border border-dashed border-[#D8E3E7]">
                  <i className="bi bi-search text-2xl text-[#D8E3E7] block mb-1"></i>
                  <p className="text-[#14252E] font-semibold">Không tìm thấy người dùng phù hợp</p>
                  <p className="text-[11px]">Thử kiểm tra lại mã số người dùng (VD: VU-1002) hoặc tên hiển thị</p>
                </div>
              )}

              {!isSearching && !searchQuery.trim() && (
                <div className="text-center py-8 text-xs text-[#52646D] space-y-2 bg-white p-6 rounded-2xl border border-[#D8E3E7]">
                  <i className="bi bi-person-lines-fill text-3xl text-[#0A8395] block mb-1"></i>
                  <p className="text-[#14252E] font-bold font-display text-sm">Tìm bạn mới trên VIVU</p>
                  <p className="text-[11px] max-w-[260px] mx-auto text-[#52646D]">
                    Nhập mã người dùng hoặc tên tài khoản để kết bạn và hiển thị vị trí trên bản đồ thời gian thực.
                  </p>
                </div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((user) => {
                    const isSelf = user.id === currentUserId;
                    const status = user.relationshipStatus || 'none';
                    const isLoading = actionLoadingId === user.id || actionLoadingId === user.requestId;

                    return (
                      <div
                        key={user.id}
                        className="p-3 rounded-2xl bg-white border border-[#D8E3E7] flex items-center justify-between hover:border-[rgba(10,131,149,0.25)] transition-all shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={user.avatar || user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover border border-[#D8E3E7]"
                            />
                            {user.isOnline && (
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10FFA0] border-2 border-white shadow-[0_0_6px_#10FFA0]" />
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#14252E] font-display flex items-center gap-1.5">
                              <span>{user.name || user.full_name || 'Người dùng VIVU'}</span>
                              {user.isOnline && (
                                <span className="text-[10px] text-[#0A8395] font-normal">• Trực tuyến</span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#52646D] font-mono mt-0.5 flex items-center gap-2">
                              <span>Mã: <strong className="text-[#14252E] font-mono">{user.user_code || 'VU-????'}</strong></span>
                              {user.phone && <span>• {user.phone}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div>
                          {isSelf ? (
                            <span className="text-[11px] text-[#52646D] italic px-2 py-1">Bạn</span>
                          ) : status === 'friends' ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  onClose();
                                  if (onStartChatWithUser) onStartChatWithUser(user);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-display font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 transition-all border border-[#00F0FF]"
                              >
                                <i className="bi bi-chat-dots-fill text-xs"></i>
                                <span>Nhắn</span>
                              </button>
                              <button
                                onClick={() => handleUnfriend(user.id)}
                                disabled={isLoading}
                                className="w-8 h-8 rounded-xl bg-[#F3F7F8] border border-[#D8E3E7] text-[#52646D] hover:text-[#EF4444] hover:bg-[#FEE2E2] active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                                title="Hủy kết bạn"
                              >
                                <i className="bi bi-person-x-fill text-xs"></i>
                              </button>
                            </div>
                          ) : status === 'pending_sent' ? (
                            <button
                              onClick={() => handleCancelRequest(user.requestId)}
                              disabled={isLoading}
                              className="px-2.5 py-1.5 rounded-xl bg-[#F3F7F8] border border-[#D8E3E7] text-xs text-[#52646D] hover:text-[#EF4444] hover:bg-[#FEE2E2] active:scale-95 transition-all flex items-center gap-1"
                            >
                              <i className="bi bi-clock-history text-xs"></i>
                              <span>Hủy yêu cầu</span>
                            </button>
                          ) : status === 'pending_received' ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleAcceptRequest(user.requestId)}
                                disabled={isLoading}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-display font-bold text-xs hover:opacity-95 active:scale-95 transition-all flex items-center gap-1 shadow-xs border border-[#00F0FF]"
                              >
                                <i className="bi bi-check-lg text-xs font-bold"></i>
                                <span>Đồng ý</span>
                              </button>
                              <button
                                onClick={() => handleRejectRequest(user.requestId)}
                                disabled={isLoading}
                                className="w-8 h-8 rounded-xl bg-[#F3F7F8] border border-[#D8E3E7] text-[#52646D] hover:text-[#EF4444] hover:bg-[#FEE2E2] active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                                title="Từ chối"
                              >
                                <i className="bi bi-x-lg text-xs"></i>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSendRequest(user.id)}
                              disabled={isLoading}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-display font-bold text-xs hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 border border-[#00F0FF] shadow-xs cursor-pointer"
                            >
                              <i className="bi bi-person-plus-fill text-xs"></i>
                              <span>Kết bạn</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REQUESTS */}
          {activeTab === 'requests' && (
            <div className="space-y-3">
              {/* Sub-tabs */}
              <div className="flex bg-[#F3F7F8] p-1 rounded-2xl border border-[#D8E3E7]">
                <button
                  onClick={() => setRequestSubTab('received')}
                  className={`flex-1 py-1.5 text-xs font-display font-bold rounded-xl transition-all cursor-pointer ${
                    requestSubTab === 'received'
                      ? 'bg-white text-[#14252E] shadow-xs'
                      : 'text-[#52646D] hover:text-[#14252E]'
                  }`}
                >
                  Đã nhận ({requests.received?.length || 0})
                </button>
                <button
                  onClick={() => setRequestSubTab('sent')}
                  className={`flex-1 py-1.5 text-xs font-display font-bold rounded-xl transition-all cursor-pointer ${
                    requestSubTab === 'sent'
                      ? 'bg-white text-[#14252E] shadow-xs'
                      : 'text-[#52646D] hover:text-[#14252E]'
                  }`}
                >
                  Đã gửi ({requests.sent?.length || 0})
                </button>
              </div>

              {/* Received Requests */}
              {requestSubTab === 'received' && (
                <div className="space-y-2">
                  {(!requests.received || requests.received.length === 0) ? (
                    <div className="text-center py-8 text-xs text-[#52646D] space-y-1.5 bg-white p-6 rounded-2xl border border-[#D8E3E7]">
                      <i className="bi bi-inbox text-2xl text-[#D8E3E7] block mb-1"></i>
                      <p className="text-[#14252E] font-semibold">Không có lời mời kết bạn nào</p>
                      <p className="text-[11px]">Khi có người gửi lời mời cho bạn, lời mời sẽ xuất hiện ở đây.</p>
                    </div>
                  ) : (
                    requests.received.map((req) => (
                      <div
                        key={req.id}
                        className="p-3.5 rounded-2xl bg-white border border-[#D8E3E7] space-y-3 shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={req.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt=""
                            className="w-11 h-11 rounded-full object-cover border-2 border-[#10FFA0]"
                          />
                          <div>
                            <div className="text-xs font-bold text-[#14252E] font-display">{req.senderName || 'Người dùng VIVU'}</div>
                            <div className="text-[11px] text-[#52646D] font-mono mt-0.5">
                              Mã: <strong className="text-[#14252E] font-mono">{req.senderUserCode || 'VU-????'}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Nút 3.3 Chấp nhận & Nút 3.4 Từ chối */}
                        <div className="flex gap-2 pt-1">
                          {/* Nút 3.3: Chấp nhận (flex 1, height 42px, bo 12px, gradient #00E5FF -> #00B4D8, text #08202E Outfit 14px bold) */}
                          <button
                            onClick={() => handleAcceptRequest(req.id)}
                            disabled={actionLoadingId === req.id}
                            className="flex-1 h-[42px] rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] border border-[#00F0FF] text-[#08202E] font-display font-bold text-sm hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_14px_rgba(0,229,255,0.40)] cursor-pointer"
                          >
                            <i className="bi bi-person-check-fill text-base"></i>
                            <span>Chấp nhận</span>
                          </button>

                          {/* Nút 3.4: Từ chối (width 110px, height 42px, bo 12px, nền #F3F7F8, viền #D8E3E7, text #40484D, hover #FEE2E2 text #EF4444) */}
                          <button
                            onClick={() => handleRejectRequest(req.id)}
                            disabled={actionLoadingId === req.id}
                            className="w-[110px] h-[42px] rounded-xl bg-[#F3F7F8] border border-[#D8E3E7] text-[#40484D] hover:bg-[#FEE2E2] hover:border-[#FCA5A5] hover:text-[#EF4444] font-display font-semibold text-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <i className="bi bi-person-x text-base"></i>
                            <span>Từ chối</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Sent Requests */}
              {requestSubTab === 'sent' && (
                <div className="space-y-2">
                  {(!requests.sent || requests.sent.length === 0) ? (
                    <div className="text-center py-8 text-xs text-[#52646D] space-y-1.5 bg-white p-6 rounded-2xl border border-[#D8E3E7]">
                      <i className="bi bi-send text-2xl text-[#D8E3E7] block mb-1"></i>
                      <p className="text-[#14252E] font-semibold">Bạn chưa gửi lời mời kết bạn nào</p>
                      <p className="text-[11px]">Tìm bạn mới qua ô tìm kiếm để gửi lời mời kết bạn.</p>
                    </div>
                  ) : (
                    requests.sent.map((req) => (
                      <div
                        key={req.id}
                        className="p-3 rounded-2xl bg-white border border-[#D8E3E7] flex items-center justify-between hover:border-[rgba(10,131,149,0.25)] transition-all shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={req.receiverAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border border-[#D8E3E7]"
                          />
                          <div>
                            <div className="text-xs font-bold text-[#14252E] font-display">{req.receiverName || 'Người dùng VIVU'}</div>
                            <div className="text-[11px] text-[#52646D] font-mono mt-0.5">
                              Mã: <strong className="text-[#14252E] font-mono">{req.receiverUserCode || 'VU-????'}</strong>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleCancelRequest(req.id)}
                          disabled={actionLoadingId === req.id}
                          className="px-3 py-1.5 rounded-xl bg-[#F3F7F8] border border-[#D8E3E7] text-xs text-[#52646D] hover:text-[#EF4444] hover:bg-[#FEE2E2] active:scale-95 transition-all flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <i className="bi bi-x-circle text-xs"></i>
                          <span>Hủy</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FRIENDS LIST */}
          {activeTab === 'friends' && (
            <div className="space-y-2">
              {friendsList.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#52646D] space-y-1.5 bg-white p-6 rounded-2xl border border-[#D8E3E7]">
                  <i className="bi bi-people text-2xl text-[#D8E3E7] block mb-1"></i>
                  <p className="text-[#14252E] font-semibold">Chưa có bạn bè nào trong danh sách</p>
                  <p className="text-[11px]">Tìm kiếm và gửi lời mời kết bạn để kết nối với người dùng khác.</p>
                </div>
              ) : (
                friendsList.map((friend) => (
                  <div
                    key={friend.id}
                    className="p-3 rounded-2xl bg-white border border-[#D8E3E7] flex items-center justify-between hover:border-[rgba(10,131,149,0.25)] transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={friend.avatar || friend.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border-2 border-[#10FFA0]"
                        />
                        {friend.isOnline && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10FFA0] border-2 border-white shadow-[0_0_6px_#10FFA0]" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#14252E] font-display flex items-center gap-1.5">
                          <span>{friend.name || friend.full_name || 'Người dùng VIVU'}</span>
                          {friend.isOnline && (
                            <span className="text-[10px] text-[#0A8395] font-normal">• Trực tuyến</span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#52646D] font-mono mt-0.5">
                          Mã: <strong className="text-[#14252E] font-mono">{friend.user_code || 'VU-????'}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          onClose();
                          if (onStartChatWithUser) onStartChatWithUser(friend);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-display font-bold text-xs flex items-center gap-1 hover:opacity-95 active:scale-95 transition-all border border-[#00F0FF] shadow-xs cursor-pointer"
                      >
                        <i className="bi bi-chat-dots-fill text-xs"></i>
                        <span>Nhắn tin</span>
                      </button>

                      <button
                        onClick={() => handleUnfriend(friend.id)}
                        disabled={actionLoadingId === friend.id}
                        className="w-8 h-8 rounded-xl bg-[#F3F7F8] border border-[#D8E3E7] text-[#52646D] hover:text-[#EF4444] hover:bg-[#FEE2E2] active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                        title="Hủy kết bạn"
                      >
                        <i className="bi bi-person-x-fill text-xs"></i>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-[#D8E3E7] bg-[#F8FAFB] flex items-center justify-between text-[11px] text-[#52646D]">
          <span className="flex items-center gap-1.5 font-medium">
            <i className="bi bi-shield-check text-[#0A8395]"></i>
            <span>Kết nối bảo mật 1-1 qua VIVU Cloud</span>
          </span>
          <span className="font-mono text-[#14252E] font-bold">{currentUserCode}</span>
        </div>

      </div>
    </div>
  );
}
