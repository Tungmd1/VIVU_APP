import React, { useState } from 'react';

/**
 * GroupMembersModal - Bảng quản lý & xem chi tiết thành viên nhóm
 * Phong cách Luminous Solar-Cyber HUD (White Cyberpunk)
 * Hỗ trợ: Danh sách thành viên, Trưởng nhóm, Thêm thành viên, Rời nhóm, Giải tán nhóm & Xem trên Bản đồ
 */
export default function GroupMembersModal({
  isOpen,
  onClose,
  group,
  allFriends = [],
  currentUserId,
  currentUserName = 'Bạn',
  currentUserAvatar,
  onViewOnMap,
  onOpenDirectChat,
  onAddMembers,
  onInviteMembers,
  onLeaveGroup,
  onKickMember,
  onDisbandGroup
}) {
  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'invites' | 'add'
  const [selectedNewFriendIds, setSelectedNewFriendIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'leave' | 'disband' | { type: 'kick', targetId, targetName }

  if (!isOpen || !group) return null;

  const isOwner = group.owner_id === currentUserId || group.isOwner === true;
  const acceptedMemberIds = Array.isArray(group.member_ids) ? group.member_ids : (group.memberIds || []);
  
  // Danh sách thành viên đã chấp nhận (gồm bạn bè + chính mình nếu trong nhóm)
  const isMeMember = acceptedMemberIds.includes(currentUserId) || isOwner;
  const memberFriends = allFriends.filter(f => acceptedMemberIds.includes(f.id));
  const totalAcceptedCount = memberFriends.length + (isMeMember ? 1 : 0);

  // Danh sách thành viên đang chờ duyệt (pending)
  const pendingMembers = Array.isArray(group.members) 
    ? group.members.filter(m => m.status === 'pending')
    : [];

  // Danh sách bạn bè chưa có trong nhóm để mời thêm
  const existingMemberAndPendingIds = new Set([
    ...acceptedMemberIds,
    ...pendingMembers.map(m => m.user_id)
  ]);
  const inviteableFriends = allFriends.filter(f => !existingMemberAndPendingIds.has(f.id));

  const handleToggleNewFriend = (id) => {
    if (selectedNewFriendIds.includes(id)) {
      setSelectedNewFriendIds(selectedNewFriendIds.filter(fid => fid !== id));
    } else {
      setSelectedNewFriendIds([...selectedNewFriendIds, id]);
    }
  };

  const handleSendInvites = async () => {
    if (selectedNewFriendIds.length === 0) return;
    setIsSubmitting(true);
    try {
      if (onAddMembers) {
        await onAddMembers(group.circleId || group.id, selectedNewFriendIds);
      } else if (onInviteMembers) {
        await onInviteMembers(group.circleId || group.id, selectedNewFriendIds);
      }
      setSelectedNewFriendIds([]);
      setActiveTab('members');
    } catch (e) {
      console.warn('Add/Invite error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteConfirm = async () => {
    if (!confirmAction) return;
    setIsSubmitting(true);
    try {
      if (confirmAction === 'leave') {
        if (onLeaveGroup) await onLeaveGroup(group.circleId || group.id);
        onClose();
      } else if (confirmAction === 'disband') {
        if (onDisbandGroup) await onDisbandGroup(group.circleId || group.id);
        onClose();
      } else if (confirmAction?.type === 'kick') {
        if (onKickMember) await onKickMember(group.circleId || group.id, confirmAction.targetId, confirmAction.targetName);
      }
    } catch (e) {
      console.warn('Action error:', e);
    } finally {
      setIsSubmitting(false);
      setConfirmAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in select-none font-sans">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white border border-[#D2D9F4] rounded-t-3xl sm:rounded-3xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.15)] z-10 text-[#131315] max-h-[88vh] flex flex-col space-y-3.5 animate-in slide-in-from-bottom-6 duration-200">
        
        {/* Mobile handle bar */}
        <div className="w-12 h-1 bg-[#D2D9F4] rounded-full mx-auto -mt-1 sm:hidden shrink-0" />

        {/* 1. HEADER NHÓM */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D2D9F4] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img 
              src={group.avatar || group.image || `https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=150`} 
              alt="" 
              className="w-12 h-12 rounded-2xl object-cover border-2 border-[#00E5FF] shadow-xs shrink-0"
            />
            <div className="min-w-0">
              <h3 className="font-bold text-base text-[#131315] font-display truncate max-w-[210px]">
                {group.name}
              </h3>
              <p className="text-[11px] text-[#70787E] truncate max-w-[210px] mt-0.5">
                {group.description || `${totalAcceptedCount} thành viên đã tham gia`}
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F2F3FF] hover:bg-[#E6E7F6] text-[#70787E] hover:text-[#131315] flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-[#D2D9F4]"
          >
            <i className="bi bi-x-lg text-xs"></i>
          </button>
        </div>

        {/* 2. SUB-NAV TABS */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F2F3FF] rounded-2xl border border-[#D2D9F4] shrink-0 text-xs font-display">
          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'members' 
                ? 'bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] border border-[#00F0FF] shadow-xs' 
                : 'text-[#70787E] hover:text-[#131315]'
            }`}
          >
            Thành viên ({totalAcceptedCount})
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('invites')}
            className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'invites' 
                ? 'bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] border border-[#00F0FF] shadow-xs' 
                : 'text-[#70787E] hover:text-[#131315]'
            }`}
          >
            Chờ duyệt ({pendingMembers.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`py-1.5 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'add' 
                ? 'bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] border border-[#00F0FF] shadow-xs' 
                : 'bg-white text-[#131315] hover:bg-[#E6E7F6] border border-[#D2D9F4]'
            }`}
          >
            <i className="bi bi-person-plus-fill text-xs"></i>
            <span>+ Thêm</span>
          </button>
        </div>

        {/* 3. NỘI DUNG CHÍNH (CUỘN ĐƯỢC) */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-0.5 min-h-[160px] bg-[#FAFAFF] p-2 rounded-2xl border border-[#D2D9F4]">
          
          {/* TAB 1: DANH SÁCH THÀNH VIÊN ĐÃ THAM GIA */}
          {activeTab === 'members' && (
            <div className="space-y-2">
              {/* Chính bạn */}
              {isMeMember && (
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-[#00E5FF] shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img 
                        src={currentUserAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                        alt="" 
                        className="w-9 h-9 rounded-full object-cover border-2 border-[#10FFA0]"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10FFA0] border-2 border-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#131315] font-display">{currentUserName} (Bạn)</span>
                        {isOwner && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[rgba(255,170,0,0.15)] text-[#B06000] border border-[rgba(255,170,0,0.3)] flex items-center gap-0.5">
                            <i className="bi bi-award-fill text-[8px]"></i>
                            <span>Trưởng nhóm</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#00838F] font-medium">Đang trực tuyến • GPS thật</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#00838F] font-bold px-2 py-0.5 bg-[rgba(0,229,255,0.12)] border border-[rgba(0,229,255,0.4)] rounded-full font-mono">
                    Tôi
                  </span>
                </div>
              )}

              {/* Bạn bè trong nhóm */}
              {memberFriends.length === 0 && !isMeMember ? (
                <div className="py-8 text-center text-xs text-[#70787E]">
                  Chưa có thành viên nào tham gia nhóm.
                </div>
              ) : (
                memberFriends.map(friend => {
                  const isFriendOwner = group.owner_id === friend.id;
                  return (
                    <div key={friend.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-[#D2D9F4] hover:border-[rgba(0,229,255,0.4)] transition-all shadow-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <img src={friend.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-[#D2D9F4]" />
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10FFA0] border border-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-[#131315] font-display truncate max-w-[120px]">{friend.name}</span>
                            {isFriendOwner && (
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[rgba(255,170,0,0.15)] text-[#B06000] border border-[rgba(255,170,0,0.3)] shrink-0">
                                Trưởng nhóm
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-[#70787E]">
                            <span className="text-[#00838F] font-medium">{friend.onlineStatus || 'Vừa xong'}</span>
                            <span>•</span>
                            <span>Cách {friend.distance || 'quanh đây'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {onOpenDirectChat && (
                          <button 
                            type="button"
                            onClick={() => { onClose(); onOpenDirectChat(friend); }}
                            className="w-7 h-7 rounded-full bg-[#F2F3FF] hover:bg-[#E6E7F6] text-[#00838F] border border-[#D2D9F4] flex items-center justify-center transition-colors cursor-pointer"
                            title={`Nhắn tin với ${friend.name}`}
                          >
                            <i className="bi bi-chat-dots-fill text-xs"></i>
                          </button>
                        )}

                        {isOwner && !isFriendOwner && (
                          <button
                            type="button"
                            onClick={() => setConfirmAction({ type: 'kick', targetId: friend.id, targetName: friend.name })}
                            className="w-7 h-7 rounded-full bg-[#FEE2E2] border border-[#FCA5A5] text-[#EF4444] hover:bg-[#FCA5A5] hover:text-[#B91C1C] flex items-center justify-center transition-colors cursor-pointer"
                            title={`Mời ${friend.name} ra khỏi nhóm`}
                          >
                            <i className="bi bi-person-dash text-xs"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: DANH SÁCH LỜI MỜI ĐANG CHỜ (PENDING) */}
          {activeTab === 'invites' && (
            <div className="space-y-2">
              {pendingMembers.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#70787E]">
                  Không có lời mời nào đang chờ duyệt.
                </div>
              ) : (
                pendingMembers.map((m, idx) => {
                  const friendInfo = allFriends.find(f => f.id === m.user_id);
                  const displayName = friendInfo?.name || m.name || `Thành viên (${m.user_id.slice(-4)})`;
                  const displayAvatar = friendInfo?.avatar || m.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100`;
                  return (
                    <div 
                      key={m.user_id || idx}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-[#D2D9F4] shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={displayAvatar} 
                          alt="" 
                          className="w-8 h-8 rounded-full object-cover border border-[#D2D9F4]"
                        />
                        <div>
                          <span className="font-semibold text-xs text-[#131315] font-display block">
                            {displayName}
                          </span>
                          <span className="text-[10px] text-[#B06000] font-medium flex items-center gap-1">
                            <i className="bi bi-clock-history text-[9px]"></i>
                            <span>Đã gửi lời mời • Chờ chấp nhận</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: THÊM THÀNH VIÊN VÀO NHÓM */}
          {activeTab === 'add' && (
            <div className="space-y-2.5">
              <div className="text-[11px] text-[#70787E]">
                Chọn bạn bè để thêm trực tiếp vào nhóm:
              </div>

              {inviteableFriends.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#70787E] bg-white rounded-2xl border border-dashed border-[#D2D9F4]">
                  Tất cả bạn bè của bạn đã có trong nhóm.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar pr-0.5">
                  {inviteableFriends.map(friend => {
                    const isChecked = selectedNewFriendIds.includes(friend.id);
                    return (
                      <div
                        key={friend.id}
                        onClick={() => handleToggleNewFriend(friend.id)}
                        className={`flex items-center justify-between p-2 rounded-2xl cursor-pointer border transition-all ${
                          isChecked ? 'border-[#00E5FF] bg-[rgba(0,229,255,0.10)] shadow-xs' : 'border-[#D2D9F4] bg-white hover:bg-[#FAFAFF]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={friend.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-[#D2D9F4]" />
                          <div>
                            <span className="text-xs font-semibold text-[#131315] font-display block">{friend.name}</span>
                            {friend.userCode && <span className="text-[10px] text-[#70787E] font-mono">{friend.userCode}</span>}
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs transition-colors ${
                          isChecked ? 'bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] border-[#00F0FF] text-[#08202E]' : 'border-[#D2D9F4] text-transparent'
                        }`}>
                          <i className="bi bi-check-lg font-bold"></i>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {inviteableFriends.length > 0 && (
                <button
                  type="button"
                  onClick={handleSendInvites}
                  disabled={selectedNewFriendIds.length === 0 || isSubmitting}
                  className="w-full py-2.5 bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] border border-[#00F0FF] disabled:opacity-50 text-[#08202E] font-display rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {isSubmitting ? (
                    <i className="bi bi-arrow-clockwise animate-spin text-sm"></i>
                  ) : (
                    <>
                      <i className="bi bi-person-plus-fill text-xs"></i>
                      <span>Thêm vào nhóm ({selectedNewFriendIds.length})</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

        </div>

        {/* 4. MODAL XÁC NHẬN HÀNH ĐỘNG NGUY HIỂM */}
        {confirmAction && (
          <div className="p-3 rounded-2xl bg-[#FEE2E2] border border-[#FCA5A5] text-[#131315] space-y-2 animate-in fade-in">
            <div className="text-xs font-bold flex items-center gap-1.5 text-[#EF4444] font-display">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>
                {confirmAction === 'disband' 
                  ? 'Bạn có chắc muốn GIẢI TÁN nhóm này?' 
                  : confirmAction === 'leave'
                    ? 'Bạn có chắc muốn RỜI KHỎI nhóm này?'
                    : `Xóa "${confirmAction.targetName}" khỏi nhóm?`}
              </span>
            </div>
            <p className="text-[10px] text-[#70787E]">
              {confirmAction === 'disband' 
                ? 'Nhóm và toàn bộ lịch sử trò chuyện sẽ bị đóng cho tất cả thành viên.' 
                : 'Bạn sẽ không còn xem được vị trí và tin nhắn của nhóm.'}
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleExecuteConfirm}
                disabled={isSubmitting}
                className="flex-1 py-1.5 bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-bold rounded-xl transition-all cursor-pointer font-display"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="px-3 py-1.5 bg-white border border-[#D2D9F4] text-[#131315] hover:bg-[#F2F3FF] text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* 5. FOOTER ACTIONS */}
        <div className="pt-2 border-t border-[#D2D9F4] space-y-2 shrink-0">
          <button
            type="button"
            onClick={() => { onClose(); if (onViewOnMap) onViewOnMap(group); }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] border border-[#00F0FF] text-[#08202E] font-display font-bold text-xs shadow-[0_0_12px_rgba(0,229,255,0.35)] flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
          >
            <i className="bi bi-geo-alt-fill text-sm"></i>
            <span>Xem {totalAcceptedCount} thành viên trên Bản đồ 3D</span>
          </button>

          <div className="flex gap-2">
            {isOwner ? (
              <button
                type="button"
                onClick={() => setConfirmAction('disband')}
                className="flex-1 py-2 rounded-xl bg-[#FEE2E2] hover:bg-[#FCA5A5] text-[#EF4444] border border-[#FCA5A5] font-display font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <i className="bi bi-trash3-fill text-xs"></i>
                <span>Giải tán nhóm</span>
              </button>
            ) : isMeMember && (
              <button
                type="button"
                onClick={() => setConfirmAction('leave')}
                className="flex-1 py-2 rounded-xl bg-[#F2F3FF] hover:bg-[#FEE2E2] text-[#70787E] hover:text-[#EF4444] border border-[#D2D9F4] font-display font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <i className="bi bi-box-arrow-right text-xs"></i>
                <span>Rời nhóm</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
