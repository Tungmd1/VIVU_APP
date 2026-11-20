import React, { useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import MessengerInboxList from './MessengerInboxList';
import MessengerActiveRoom from './MessengerActiveRoom';
import GroupMembersModal from './GroupMembersModal';
import ChatProfileModal from './ChatProfileModal';
import CreatePollModal from './CreatePollModal';
import { recordSentMessage } from '../../utils/personalityAnalytics';

/**
 * MessengerChatView - Giao diện Hộp thư & Phòng chat Luminous Solar-Cyber HUD (White Cyberpunk)
 * Bóc tách theo Feature Modules (Anti-Monolith, Rule 7 < 450 dòng).
 * Tuân thủ Rule 5 (100% Bootstrap Icons), Rule 11 (GPS an toàn), docs/Tokens_Spec.md (Screen 9).
 */
export default function MessengerChatView({
  conversations = [],
  activeConversationId,
  setActiveConversationId,
  messages = [],
  friends = [],
  stories = [],
  myActiveStory = null,
  onOpenCreateStory,
  onOpenStoryDetail,
  onOpenUserProfile,
  onToggleRightFriendshipPanel,
  pendingFriendRequestsCount = 0,
  userLat,
  userLng,
  userAvatar,
  currentUserId,
  currentUserName,
  currentUserCode,
  onSendMessage,
  onSendQuickHeart,
  onStartCall,
  onOpenCreateCircle,
  onDeleteCircle,
  onAddMembers,
  onInviteMembers,
  onLeaveGroup,
  onKickMember,
  onOpenMapForStory,
  onStartNavigation,
  onOpenDirectChat,
  onViewCircleOnMap,
  onBackToMap,
  onOpenMemeTroll,
  onOpenTakeoverMeme,
  onDeleteMessage,
  onClearConversation,
  onToggleArchive
}) {
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [chatFilterTab, setChatFilterTab] = useState('all'); // 'all', 'group', 'spam', 'archived'
  const [messageInputText, setMessageInputText] = useState('');
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [isGroupMembersModalOpen, setIsGroupMembersModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCreatePollModalOpen, setIsCreatePollModalOpen] = useState(false);
  const [isToolsDrawerOpen, setIsToolsDrawerOpen] = useState(false);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activeFriend = friends.find(f => f.id === activeConversation?.friendId || f.name === activeConversation?.name);

  // Lọc hội thoại: Phải có tin nhắn mới hiện trong trang tin nhắn
  const hasValidMessages = (conv) => {
    return Boolean((conv.messages && conv.messages.length > 0) || conv.lastMessage);
  };

  const filteredConversations = conversations.filter(conv => {
    if (!hasValidMessages(conv)) return false;
    if (chatSearchQuery && !conv.name.toLowerCase().includes(chatSearchQuery.toLowerCase())) {
      return false;
    }
    if (chatFilterTab === 'archived') {
      return Boolean(conv.isArchived);
    }
    if (conv.isArchived) return false;
    if (chatFilterTab === 'group') return conv.type === 'group';
    if (chatFilterTab === 'spam') return Boolean(conv.isStranger);
    return !conv.isStranger;
  });

  const validConvs = conversations.filter(hasValidMessages);
  const activeConvs = validConvs.filter(c => !c.isArchived);
  const allCount = activeConvs.filter(c => !c.isStranger).length;
  const groupCount = activeConvs.filter(c => c.type === 'group').length;
  const spamCount = activeConvs.filter(c => Boolean(c.isStranger)).length;
  const archivedCount = validConvs.filter(c => Boolean(c.isArchived)).length;

  // Gửi tin nhắn văn bản & kích hoạt Streak & Phân tích hành vi tính cách
  const handleSend = () => {
    if (!messageInputText.trim()) return;
    const currentMessageCount = messages.length || 0;
    const newCount = currentMessageCount + 1;
    const textToSend = messageInputText.trim();
    
    // Ghi nhận hành vi nhắn tin vào hệ thống đo lường tính cách
    try {
      recordSentMessage(currentUserId, textToSend);
    } catch {}

    onSendMessage({
      conversationId: activeConversationId,
      text: textToSend
    });
    setMessageInputText('');

    if (newCount >= 3 && newCount % 3 === 0) {
      confetti({ particleCount: 45, spread: 60, origin: { y: 0.7 } });
    }
  };

  const handleConfirmDeleteGroup = async () => {
    if (!groupToDelete) return;
    const targetId = groupToDelete.circleId || groupToDelete.id;
    if (activeConversationId === groupToDelete.id || activeConversationId === targetId) {
      setActiveConversationId(null);
    }
    setGroupToDelete(null);
    if (onDeleteCircle) {
      await onDeleteCircle(targetId);
    }
  };

  const handleCreatePoll = (pollData) => {
    onSendMessage({
      conversationId: activeConversationId,
      text: `[BÌNH CHỌN]: ${pollData.title}`,
      isPoll: true,
      is_poll: true,
      poll: {
        id: `poll-${Date.now()}`,
        title: pollData.title,
        options: (pollData.options || []).map((opt, idx) => ({
          id: opt.id || `opt-${idx + 1}`,
          text: opt.text,
          votes: []
        }))
      }
    });
    confetti({ particleCount: 30, spread: 50 });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-40 bg-[#0a0e1c] text-white flex w-full h-[100dvh] overflow-hidden pt-[env(safe-area-inset-top,0px)]"
    >
      {/* CỘT TRÁI: HỘP THƯ TIN NHẮN (INBOX LIST VIEW) */}
      <MessengerInboxList
        activeConversationId={activeConversationId}
        setActiveConversationId={setActiveConversationId}
        filteredConversations={filteredConversations}
        chatSearchQuery={chatSearchQuery}
        setChatSearchQuery={setChatSearchQuery}
        chatFilterTab={chatFilterTab}
        setChatFilterTab={setChatFilterTab}
        allCount={allCount}
        groupCount={groupCount}
        spamCount={spamCount}
        archivedCount={archivedCount}
        userAvatar={userAvatar}
        friends={friends}
        onOpenDirectChat={onOpenDirectChat}
        onBackToMap={onBackToMap}
        onToggleRightFriendshipPanel={onToggleRightFriendshipPanel}
        pendingFriendRequestsCount={pendingFriendRequestsCount}
        onOpenCreateCircle={onOpenCreateCircle}
        setGroupToDelete={setGroupToDelete}
      />

      {/* CỘT PHẢI / KHUNG CHAT HOẠT ĐỘNG (ACTIVE CHAT ROOM) */}
      <MessengerActiveRoom
        activeConversation={activeConversation}
        activeConversationId={activeConversationId}
        setActiveConversationId={setActiveConversationId}
        messages={messages}
        userLat={userLat}
        userLng={userLng}
        currentUserId={currentUserId}
        onSendMessage={onSendMessage}
        onSendQuickHeart={onSendQuickHeart}
        onStartCall={onStartCall}
        onBackToMap={onBackToMap}
        onOpenUserProfile={(target) => onOpenUserProfile && onOpenUserProfile(target, 'chat')}
        onOpenMemeTroll={onOpenMemeTroll}
        onOpenTakeoverMeme={onOpenTakeoverMeme}
        setIsProfileModalOpen={setIsProfileModalOpen}
        setIsGroupMembersModalOpen={setIsGroupMembersModalOpen}
        onOpenMapForStory={onOpenMapForStory}
        onStartNavigation={onStartNavigation}
        onOpenCreatePoll={() => setIsCreatePollModalOpen(true)}
        onOpenCreateCircle={onOpenCreateCircle}
        isToolsDrawerOpen={isToolsDrawerOpen}
        setIsToolsDrawerOpen={setIsToolsDrawerOpen}
        messageInputText={messageInputText}
        setMessageInputText={setMessageInputText}
        handleSend={handleSend}
        onDeleteMessage={onDeleteMessage}
        onClearConversation={onClearConversation}
        onToggleArchive={onToggleArchive}
      />

      {/* MODAL XÓA NHÓM (Rule 12 Tương phản dark theme & style zIndex 99999) */}
      {groupToDelete && (
        <div 
          style={{ zIndex: 99999 }}
          className="fixed inset-0 bg-black/75 backdrop-blur-md flex justify-center items-center p-4 select-none font-sans"
        >
          <div className="w-full max-w-sm bg-[#151619] rounded-3xl p-5 border border-white/10 space-y-4 shadow-2xl text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center">
                <i className="bi bi-trash3-fill text-sm"></i>
              </div>
              <div>
                <h3 className="font-bold text-sm text-white font-display">Xác nhận xóa nhóm</h3>
                <p className="text-[10px] text-white/50">Hành động này không thể hoàn tác</p>
              </div>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              Bạn có chắc chắn muốn xóa nhóm <strong className="text-white">"{groupToDelete.name}"</strong>?
            </p>
            <div className="flex gap-2 pt-1">
              <button 
                onClick={handleConfirmDeleteGroup} 
                className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90 active:scale-95 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <i className="bi bi-trash3"></i>
                <span>Xóa nhóm</span>
              </button>
              <button 
                onClick={() => setGroupToDelete(null)} 
                className="px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-xl font-medium text-xs cursor-pointer transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XEM HỒ SƠ BẠN CHAT */}
      <ChatProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        conversation={activeConversation}
        friend={activeFriend}
        userLat={userLat}
        userLng={userLng}
        onStartCall={onStartCall}
        onOpenMap={(f) => {
          setIsProfileModalOpen(false);
          setActiveConversationId(null);
          if (onOpenMapForStory) onOpenMapForStory();
        }}
      />

      {/* MODAL TẠO BÌNH CHỌN LỊCH HẸN */}
      <CreatePollModal
        isOpen={isCreatePollModalOpen}
        onClose={() => setIsCreatePollModalOpen(false)}
        onCreatePoll={handleCreatePoll}
      />

      {/* MODAL XEM & QUẢN LÝ THÀNH VIÊN NHÓM */}
      <GroupMembersModal
        isOpen={isGroupMembersModalOpen}
        onClose={() => setIsGroupMembersModalOpen(false)}
        group={activeConversation}
        allFriends={friends}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        currentUserAvatar={userAvatar}
        onViewOnMap={(grp) => {
          setIsGroupMembersModalOpen(false);
          setActiveConversationId(null);
          if (onViewCircleOnMap) onViewCircleOnMap(grp);
          else if (onOpenMapForStory) onOpenMapForStory();
        }}
        onOpenDirectChat={(friend) => {
          if (onOpenDirectChat) onOpenDirectChat(friend);
          setIsGroupMembersModalOpen(false);
        }}
        onOpenUserProfile={(friend) => {
          if (onOpenUserProfile) onOpenUserProfile(friend, 'group');
        }}
        onAddMembers={onAddMembers || onInviteMembers}
        onInviteMembers={onInviteMembers}
        onLeaveGroup={onLeaveGroup}
        onKickMember={onKickMember}
        onDisbandGroup={onDeleteCircle}
      />
    </motion.div>
  );
}
