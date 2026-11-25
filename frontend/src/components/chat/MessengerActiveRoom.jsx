import React, { useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import MessengerToolsDrawer from './MessengerToolsDrawer';
import MessengerEmptyState from './MessengerEmptyState';
import MessengerRoomHeader from './MessengerRoomHeader';
import LiveLocationModal from './LiveLocationModal';
import MediaPreviewModal from './MediaPreviewModal';
import VivuStickerKeyboard from './VivuStickerKeyboard';
import ChatMessageBubble from './ChatMessageBubble';
import ChatLightboxModal from './ChatLightboxModal';
import ChatMessageActionModal from './ChatMessageActionModal';
import ClearChatModal from './ClearChatModal';
import ChatProfileModal from './ChatProfileModal';
import apiClient from '../../services/apiClient';

/**
 * MessengerActiveRoom - Khung chat đang chọn & Màn hình chờ chuẩn Cyberpunk Pink & Blue Glass
 * - Hỗ trợ Bàn phím Sticker độc quyền VIVU 1 chạm
 * - 100% Bootstrap Icons (Rule 5) | Tối ưu < 350 dòng (Rule 7)
 */
export default function MessengerActiveRoom({
  activeConversation,
  activeConversationId,
  setActiveConversationId,
  messages = [],
  userLat,
  userLng,
  currentUserId,
  onSendMessage,
  onSendQuickHeart,
  onStartCall,
  onBackToMap,
  onOpenUserProfile,
  onOpenMemeTroll,
  onOpenTakeoverMeme,
  setIsGroupMembersModalOpen,
  onOpenMapForStory,
  onStartNavigation,
  onOpenCreatePoll,
  onOpenCreateCircle,
  isToolsDrawerOpen,
  setIsToolsDrawerOpen,
  messageInputText,
  setMessageInputText,
  handleSend,
  onDeleteMessage,
  onClearConversation,
  onStopLiveLocation,
  userSpeed
}) {
  const chatFileInputRef = useRef(null);
  const chatVideoInputRef = useRef(null);
  const [isLiveLocationModalOpen, setIsLiveLocationModalOpen] = useState(false);
  const [previewMediaFile, setPreviewMediaFile] = useState(null);
  const [previewMediaType, setPreviewMediaType] = useState('image');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedLightboxMedia, setSelectedLightboxMedia] = useState(null);
  const [isStickerKeyboardOpen, setIsStickerKeyboardOpen] = useState(false);
  const [selectedMessageForAction, setSelectedMessageForAction] = useState(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isChatProfileModalOpen, setIsChatProfileModalOpen] = useState(false);

  // Xóa tin nhắn đơn lẻ ở phía tôi
  const handleDeleteForMe = async (msg) => {
    try {
      await apiClient.deleteMessage(msg.id, currentUserId, false);
      onDeleteMessage?.(msg.id, false);
    } catch (e) {
      console.warn('Lỗi khi xóa tin nhắn ở phía tôi:', e);
    }
  };

  // Thu hồi tin nhắn với mọi người
  const handleUnsendForEveryone = async (msg) => {
    try {
      await apiClient.deleteMessage(msg.id, currentUserId, true);
      onDeleteMessage?.(msg.id, true);
    } catch (e) {
      console.warn('Lỗi khi thu hồi tin nhắn:', e);
    }
  };

  // Dọn sạch toàn bộ lịch sử tin nhắn (mặc định chỉ phía tôi, hỗ trợ tùy chọn cho cả hai phía)
  const handleConfirmClear = async (clearForEveryone = false) => {
    try {
      await apiClient.clearConversationMessages(activeConversationId, currentUserId, clearForEveryone);
      onClearConversation?.(activeConversationId, clearForEveryone);
    } catch (e) {
      console.warn('Lỗi khi dọn sạch tin nhắn:', e);
    }
  };

  // Tính cấp Chuỗi Thân Thiết (Streak): Cứ mỗi 3 tin nhắn tăng 1 cấp chuỗi
  const currentMessageCount = messages.length || 0;
  const streakLevel = Math.max(1, Math.floor(currentMessageCount / 3));
  const hasStreak = currentMessageCount >= 3;

  // Gửi sticker độc quyền VIVU 1 chạm
  const handleSendSticker = (sticker) => {
    setIsStickerKeyboardOpen(false);
    onSendMessage({
      conversationId: activeConversationId,
      type: 'sticker',
      isSticker: true,
      sticker: {
        id: sticker.id,
        name: sticker.name,
        packId: sticker.packId,
        image: sticker.image,
        soundType: sticker.soundType,
        particleColor: sticker.particleColor,
        badge: sticker.badge
      },
      image: sticker.image,
      soundType: sticker.soundType,
      text: `[Sticker: ${sticker.name}]`
    });
  };

  // Chọn ảnh & video -> Mở Modal xem trước toàn màn hình
  const handleMediaSelected = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewMediaFile(file);
    setPreviewMediaType(type);
    setIsPreviewModalOpen(true);
    setIsToolsDrawerOpen(false);
    e.target.value = '';
  };

  // Thực hiện tải lên máy chủ và gửi tin nhắn
  const handleExecuteSendMedia = async ({ file, caption, type, onProgress }) => {
    const uploadRes = await apiClient.uploadMedia(file, 'chat', onProgress);
    if (!uploadRes || !uploadRes.url) {
      throw new Error('Không nhận được đường dẫn tệp sau khi tải lên.');
    }

    onSendMessage({
      conversationId: activeConversationId,
      [type]: uploadRes.url,
      text: caption || ''
    });
  };

  // Gửi vị trí GPS tĩnh
  const handleSendLocation = () => {
    if (userLat == null || userLng == null || isNaN(Number(userLat)) || isNaN(Number(userLng))) {
      alert('Vui lòng bật quyền truy cập GPS để chia sẻ vị trí của bạn.');
      return;
    }
    const safeLat = Number(userLat);
    const safeLng = Number(userLng);
    onSendMessage({
      conversationId: activeConversationId,
      isLocation: true,
      is_location: true,
      lat: safeLat,
      lng: safeLng,
      text: 'Vị trí GPS của tôi'
    });
    setIsToolsDrawerOpen(false);
    confetti({ particleCount: 30, spread: 45 });
  };

  // Bắt đầu chia sẻ vị trí trực tiếp (Live Location)
  const handleStartLiveLocation = (durationMinutes) => {
    if (userLat == null || userLng == null || isNaN(Number(userLat)) || isNaN(Number(userLng))) {
      alert('Vui lòng bật quyền truy cập GPS để chia sẻ vị trí trực tiếp.');
      return;
    }
    const safeLat = Number(userLat);
    const safeLng = Number(userLng);
    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
    onSendMessage({
      conversationId: activeConversationId,
      isLiveLocation: true,
      is_live_location: true,
      liveDurationMinutes: durationMinutes,
      live_duration_minutes: durationMinutes,
      liveExpiresAt: expiresAt,
      live_expires_at: expiresAt,
      liveStatus: 'active',
      live_status: 'active',
      lat: safeLat,
      lng: safeLng,
      speed: userSpeed != null && !isNaN(Number(userSpeed)) ? Number(userSpeed) : 0,
      text: `Đang chia sẻ vị trí trực tiếp (${durationMinutes === 60 ? '1 giờ' : (durationMinutes === 480 ? '8 giờ' : `${durationMinutes} phút`)})`
    });
    setIsLiveLocationModalOpen(false);
    setIsToolsDrawerOpen(false);
    confetti({ particleCount: 35, spread: 50 });
  };

  // Dừng chia sẻ vị trí trực tiếp (ưu tiên callback đồng bộ App state + REST/Socket backend)
  const handleStopShare = async (msgId) => {
    if (!msgId) return;
    if (onStopLiveLocation) {
      return onStopLiveLocation(msgId);
    }
    try {
      await apiClient.stopLiveLocation(msgId, currentUserId);
    } catch (err) {
      console.warn('[MessengerActiveRoom] stopLiveLocation fallback error:', err?.message);
    }
  };

  return (
    <main 
      id="main-content"
      tabIndex="-1"
      className={`${!activeConversationId ? 'hidden md:flex' : 'flex'} flex-1 flex-col h-full bg-[#0a0e1c] relative overflow-hidden outline-none`}
    >
      {activeConversationId ? (
        <div className="flex-1 flex flex-col h-full bg-[#0a0e1c] text-white animate-in fade-in duration-150 relative z-20">
          
          {/* Header phòng chat F1 Glass (Tách module Rule 7) */}
          <MessengerRoomHeader
            activeConversation={activeConversation}
            setActiveConversationId={setActiveConversationId}
            hasStreak={hasStreak}
            streakLevel={streakLevel}
            onOpenUserProfile={onOpenUserProfile}
            setIsProfileModalOpen={setIsChatProfileModalOpen}
            onStartCall={onStartCall}
            onBackToMap={onBackToMap}
            setIsGroupMembersModalOpen={setIsGroupMembersModalOpen}
            onOpenClearModal={() => setIsClearModalOpen(true)}
          />

          {/* VÙNG TIN NHẮN CUỘN ĐỘC LẬP */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 sm:p-4 space-y-3 bg-[#0a0e1c]">
            {messages.length === 0 ? (
              <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center px-6 space-y-2 text-white/50 select-none">
                <i className="bi bi-chat-dots text-2xl text-[#00E5FF] p-3 rounded-2xl bg-white/5 border border-white/10"></i>
                <p className="text-xs font-semibold text-white/75">
                  {activeConversation?.isCleared || activeConversation?.lastMessage === 'Đã xóa lịch sử trò chuyện' ? 'Đã xóa lịch sử trò chuyện' : 'Chưa có tin nhắn nào'}
                </p>
                <p className="text-[11px] text-white/40 max-w-xs">Khung trò chuyện vẫn được giữ nguyên. Nhập tin nhắn bên dưới để tiếp tục.</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.sender === 'me' || (currentUserId && msg.sender === currentUserId);
                return (
                  <div key={msg.id || idx} className="space-y-1.5">
                    <ChatMessageBubble
                      msg={msg}
                      isMe={isMe}
                      currentUserId={currentUserId}
                      currentUserLat={userLat}
                      currentUserLng={userLng}
                      activeConversation={activeConversation}
                      onOpenTakeoverMeme={onOpenTakeoverMeme}
                      onOpenMapForStory={onOpenMapForStory}
                      onStartNavigation={onStartNavigation}
                      onStopShare={handleStopShare}
                      setSelectedLightboxMedia={setSelectedLightboxMedia}
                      onSelectMessageForDelete={setSelectedMessageForAction}
                      onOpenChatProfile={() => setIsChatProfileModalOpen(true)}
                    />

                    {/* Thời gian tin nhắn */}
                    <div className={`text-[9px] text-[#8E8E93] px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                      {msg.time || (msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* KHAY TIỆN ÍCH MỞ RỘNG (GỬI ẢNH, VIDEO, VỊ TRÍ, LIVE GPS, BÌNH CHỌN) */}
          <MessengerToolsDrawer
            isOpen={isToolsDrawerOpen}
            onClose={() => setIsToolsDrawerOpen(false)}
            chatFileInputRef={chatFileInputRef}
            chatVideoInputRef={chatVideoInputRef}
            onSendLocation={handleSendLocation}
            onOpenLiveLocation={() => setIsLiveLocationModalOpen(true)}
            onOpenCreatePoll={onOpenCreatePoll}
            onOpenMemeTroll={onOpenMemeTroll}
            activeConversation={activeConversation}
          />

          {/* KHAY BÀN PHÍM STICKER ĐỘC QUYỀN VIVU */}
          <VivuStickerKeyboard
            isOpen={isStickerKeyboardOpen}
            onClose={() => setIsStickerKeyboardOpen(false)}
            onSelectSticker={handleSendSticker}
          />

          {/* THANH NHẬP TIN NHẮN GHIM ĐÁY */}
          <div className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] md:pb-3.5 bg-[rgba(20,20,30,0.85)] backdrop-blur-xl border-t border-white/10 flex items-center gap-2 shrink-0 sticky bottom-0 z-20 shadow-sm">
            <input 
              type="file" 
              ref={chatFileInputRef}
              onChange={(e) => handleMediaSelected(e, 'image')}
              accept="image/*"
              aria-label="Đính kèm tệp tin tài liệu"
              className="hidden"
            />
            <input 
              type="file" 
              ref={chatVideoInputRef}
              onChange={(e) => handleMediaSelected(e, 'video')}
              accept="video/*"
              aria-label="Đính kèm tệp video"
              className="hidden"
            />

            {/* Nút (+) mở Khay tiện ích */}
            <button 
              type="button"
              onClick={() => {
                setIsToolsDrawerOpen(!isToolsDrawerOpen);
                if (isStickerKeyboardOpen) setIsStickerKeyboardOpen(false);
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                isToolsDrawerOpen 
                  ? 'bg-[#FF2A85] border-[#FF2A85] text-white rotate-45 shadow-[0_0_10px_rgba(255,42,133,0.4)]' 
                  : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Mở tiện ích mở rộng"
            >
              <i className="bi bi-plus-lg text-sm"></i>
            </button>

            {/* Nút mở Bàn phím Sticker VIVU */}
            <button 
              type="button"
              onClick={() => {
                setIsStickerKeyboardOpen(!isStickerKeyboardOpen);
                if (isToolsDrawerOpen) setIsToolsDrawerOpen(false);
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                isStickerKeyboardOpen 
                  ? 'bg-gradient-to-r from-[#FF2A85] to-[#7928CA] text-white shadow-[0_0_10px_rgba(255,42,133,0.4)]' 
                  : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Nhãn dán Sticker VIVU"
            >
              <i className="bi bi-stickies-fill text-sm"></i>
            </button>

            {/* Ô nhập tin nhắn */}
            <form onSubmit={handleSend} className="flex-1 flex items-center gap-2">
              <input 
                id="chat-message-input"
                type="text" 
                value={messageInputText}
                onChange={(e) => setMessageInputText(e.target.value)}
                placeholder="Nhập tin nhắn..."
                aria-label="Nội dung tin nhắn"
                className="flex-1 bg-[#121624] border border-white/10 focus:border-[#FF2A85]/50 focus:ring-1 focus:ring-[#FF2A85]/30 rounded-2xl px-4 py-2 text-xs text-white placeholder-[#8E8E93] outline-none transition-all shadow-inner"
              />
            </form>

            {/* Nút gửi tin nhắn hoặc Thả tim nhanh */}
            {messageInputText.trim() ? (
              <button 
                type="button"
                onClick={handleSend}
                className="w-9 h-9 rounded-full bg-gradient-to-r from-[#FF2A85] to-[#FF539A] text-white flex items-center justify-center shrink-0 hover:opacity-90 active:scale-90 transition-all cursor-pointer shadow-[0_0_12px_rgba(255,42,133,0.45)]"
                title="Gửi"
              >
                <i className="bi bi-arrow-up-short text-xl font-bold"></i>
              </button>
            ) : (
              <button 
                type="button"
                onClick={onSendQuickHeart}
                className="w-9 h-9 rounded-full text-[#FF2A85] hover:bg-pink-500/10 border border-transparent hover:border-pink-500/20 flex items-center justify-center shrink-0 active:scale-125 transition-transform cursor-pointer"
                title="Thả tim"
              >
                <i className="bi bi-heart-fill text-base"></i>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* MÀN HÌNH CHỜ TRÊN DESKTOP KHI CHƯA CHỌN ĐOẠN CHAT (Tách module Rule 7) */
        <MessengerEmptyState 
          onOpenCreatePoll={onOpenCreatePoll}
          onOpenCreateCircle={onOpenCreateCircle}
        />
      )}

      {/* Modal Chọn Thời Gian Chia Sẻ Vị Trí Trực Tiếp */}
      <LiveLocationModal
        isOpen={isLiveLocationModalOpen}
        onClose={() => setIsLiveLocationModalOpen(false)}
        partnerName={activeConversation?.name || 'bạn bè'}
        onConfirmStart={handleStartLiveLocation}
      />

      {/* Modal Xem Trước Toàn Màn Hình Khi Gửi Ảnh/Video */}
      <MediaPreviewModal
        isOpen={isPreviewModalOpen}
        file={previewMediaFile}
        mediaType={previewMediaType}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewMediaFile(null);
        }}
        onSendMedia={handleExecuteSendMedia}
      />

      {/* Lightbox Xem Ảnh/Video Toàn Màn Hình Từ Tin Nhắn */}
      <ChatLightboxModal
        media={selectedLightboxMedia}
        onClose={() => setSelectedLightboxMedia(null)}
      />

      {/* Modal Tùy Chọn Xóa / Thu Hồi Từng Tin Nhắn */}
      <ChatMessageActionModal
        isOpen={Boolean(selectedMessageForAction)}
        message={selectedMessageForAction}
        isMe={selectedMessageForAction?.sender === 'me' || (currentUserId && selectedMessageForAction?.sender === currentUserId)}
        onClose={() => setSelectedMessageForAction(null)}
        onDeleteForMe={handleDeleteForMe}
        onUnsendForEveryone={handleUnsendForEveryone}
      />

      {/* Modal Xác Nhận Xóa Toàn Bộ Lịch Sử Tin Nhắn */}
      <ClearChatModal
        isOpen={isClearModalOpen}
        partnerName={activeConversation?.name}
        onClose={() => setIsClearModalOpen(false)}
        onConfirmClear={handleConfirmClear}
      />

      {/* Modal Thông Tin Bạn Chat & KHO LƯU TRỮ PHƯƠNG TIỆN (Ảnh & Video giống Messenger) */}
      <ChatProfileModal
        isOpen={isChatProfileModalOpen}
        onClose={() => setIsChatProfileModalOpen(false)}
        conversation={activeConversation}
        messages={messages}
        onSelectLightboxMedia={(media) => setSelectedLightboxMedia(media)}
        onStartCall={onStartCall}
        onOpenUserProfile={onOpenUserProfile}
        onOpenClearModal={() => setIsClearModalOpen(true)}
        onOpenMap={() => {
          setIsChatProfileModalOpen(false);
          if (onOpenMapForStory) onOpenMapForStory();
        }}
      />
    </main>
  );
}
