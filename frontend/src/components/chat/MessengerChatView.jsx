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
  onBackToMap
}) {
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [chatFilterTab, setChatFilterTab] = useState('all'); // 'all', 'group', 'spam'
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
    if (chatFilterTab === 'group') return conv.type === 'group';
    if (chatFilterTab === 'spam') return Boolean(conv.isStranger);
    return !conv.isStranger;
  });

  const validConvs = conversations.filter(hasValidMessages);
  const allCount = validConvs.filter(c => !c.isStranger).length;
  const groupCount = validConvs.filter(c => c.type === 'group').length;
  const spamCount = validConvs.filter(c => Boolean(c.isStranger)).length;

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

  const handleConfirmDeleteGroup = () => {
    if (!groupToDelete) return;
    if (onDeleteCircle) onDeleteCircle(groupToDelete.circleId || groupToDelete.id);
    if (activeConversationId === groupToDelete.id) setActiveConversationId(null);
    setGroupToDelete(null);
  };

  const handleCreatePoll = (pollData) => {
    onSendMessage({
      conversationId: activeConversationId,
      text: `[BÌNH CHỌN]: ${pollData.title}\n${pollData.options.map(o => `• ${o.text}`).join('\n')}`
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
        userAvatar={userAvatar}
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
        onSendMessage={onSendMessage}
        onSendQuickHeart={onSendQuickHeart}
        onStartCall={onStartCall}
        onBackToMap={onBackToMap}
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
      />

      {/* MODAL XÓA NHÓM */}
      {groupToDelete && (
        <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-[#D2D9F4] space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-[#131315] font-display">Xác nhận xóa nhóm</h3>
            <p className="text-xs text-[#70787E]">Bạn có chắc muốn xóa nhóm "{groupToDelete.name}"?</p>
            <div className="flex gap-2">
              <button 
                onClick={handleConfirmDeleteGroup} 
                className="flex-1 py-2.5 bg-[#EF4444] text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs font-display"
              >
                Xóa nhóm
              </button>
              <button 
                onClick={() => setGroupToDelete(null)} 
                className="px-4 py-2.5 bg-[#F2F3FF] border border-[#D2D9F4] text-[#131315] hover:bg-[#E6E7F6] rounded-xl font-medium text-xs cursor-pointer"
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
        onAddMembers={onAddMembers || onInviteMembers}
        onInviteMembers={onInviteMembers}
        onLeaveGroup={onLeaveGroup}
        onKickMember={onKickMember}
        onDisbandGroup={onDeleteCircle}
      />
    </motion.div>
  );
}
