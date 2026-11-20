import React, { useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import MessengerInboxList from './MessengerInboxList';
import MessengerActiveRoom from './MessengerActiveRoom';
import GroupMembersModal from './GroupMembersModal';
import CreatePollModal from './CreatePollModal';
import ClearChatModal from './ClearChatModal';
import { recordSentMessage } from '../../utils/personalityAnalytics';
import apiClient from '../../services/apiClient';

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
  onClearConversation
}) {
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [chatFilterTab, setChatFilterTab] = useState('all'); // 'all', 'group', 'spam'
  const [messageInputText, setMessageInputText] = useState('');
  const [conversationToClear, setConversationToClear] = useState(null);
  const [isGroupMembersModalOpen, setIsGroupMembersModalOpen] = useState(false);
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

  // Xóa toàn bộ tin nhắn trong cuộc trò chuyện (KHÔNG xóa nhóm hay bạn bè)
  const handleConfirmClearConversation = async () => {
    if (!conversationToClear) return;
    const convId = conversationToClear.id;
    try {
      await apiClient.clearConversationMessages(convId, currentUserId, true);
      onClearConversation?.(convId);
    } catch (e) {
      console.warn('Lỗi khi xóa tất cả tin nhắn:', e);
    } finally {
      setConversationToClear(null);
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
        userAvatar={userAvatar}
        friends={friends}
        onOpenDirectChat={onOpenDirectChat}
        onBackToMap={onBackToMap}
        onToggleRightFriendshipPanel={onToggleRightFriendshipPanel}
        pendingFriendRequestsCount={pendingFriendRequestsCount}
        onOpenCreateCircle={onOpenCreateCircle}
        onOpenClearConversation={(conv) => setConversationToClear(conv)}
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
      />

      {/* MODAL XÁC NHẬN XÓA TẤT CẢ TIN NHẮN (KHÔNG XÓA NHÓM, CHỈ DỌN SẠCH LỊCH SỬ TIN NHẮN) */}
      <ClearChatModal
        isOpen={Boolean(conversationToClear)}
        partnerName={conversationToClear?.name}
        onClose={() => setConversationToClear(null)}
        onConfirmClear={handleConfirmClearConversation}
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
