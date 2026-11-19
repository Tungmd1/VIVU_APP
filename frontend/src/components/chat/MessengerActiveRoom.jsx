import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import VivuButton from '../common/VivuButton';
import MessengerToolsDrawer from './MessengerToolsDrawer';
import MessengerEmptyState from './MessengerEmptyState';
import MessengerRoomHeader from './MessengerRoomHeader';
import LiveLocationModal from './LiveLocationModal';
import LiveLocationCard from './LiveLocationCard';
import ChatPollCard from './ChatPollCard';
import MediaPreviewModal from './MediaPreviewModal';
import apiClient from '../../services/apiClient';

/**
 * MessengerActiveRoom - Khung chat đang chọn & Màn hình chờ chuẩn Cyberpunk Pink & Blue Glass
 * Nền tối #0a0e1c, khung kính rgba(20,20,30,0.85), Hồng #FF2A85 & Xanh Cyan #00E5FF
 * Hỗ trợ Vị trí trực tiếp (Live Location) với đếm giờ, khoảng cách, tốc độ, dừng chia sẻ
 * Tuân thủ Rule 5 (100% Bootstrap Icons), Rule 7 (< 450 dòng), Rule 12 (Tương phản form)
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
  setIsProfileModalOpen,
  setIsGroupMembersModalOpen,
  onOpenMapForStory,
  onStartNavigation,
  onOpenCreatePoll,
  onOpenCreateCircle,
  isToolsDrawerOpen,
  setIsToolsDrawerOpen,
  messageInputText,
  setMessageInputText,
  handleSend
}) {
  const chatFileInputRef = useRef(null);
  const chatVideoInputRef = useRef(null);
  const [isLiveLocationModalOpen, setIsLiveLocationModalOpen] = useState(false);
  const [previewMediaFile, setPreviewMediaFile] = useState(null);
  const [previewMediaType, setPreviewMediaType] = useState('image');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedLightboxMedia, setSelectedLightboxMedia] = useState(null);

  // Tính cấp Chuỗi Thân Thiết (Streak): Cứ mỗi 3 tin nhắn tăng 1 cấp chuỗi
  const currentMessageCount = messages.length || 0;
  const streakLevel = Math.max(1, Math.floor(currentMessageCount / 3));
  const hasStreak = currentMessageCount >= 3;

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
    const safeLat = (userLat != null && !isNaN(Number(userLat))) ? Number(userLat) : 10.7769;
    const safeLng = (userLng != null && !isNaN(Number(userLng))) ? Number(userLng) : 106.7009;
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
    const safeLat = (userLat != null && !isNaN(Number(userLat))) ? Number(userLat) : 10.7769;
    const safeLng = (userLng != null && !isNaN(Number(userLng))) ? Number(userLng) : 106.7009;
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
      speed: 0,
      text: `Đang chia sẻ vị trí trực tiếp (${durationMinutes === 60 ? '1 giờ' : (durationMinutes === 480 ? '8 giờ' : `${durationMinutes} phút`)})`
    });
    setIsLiveLocationModalOpen(false);
    setIsToolsDrawerOpen(false);
    confetti({ particleCount: 35, spread: 50 });
  };

  // Dừng chia sẻ vị trí trực tiếp
  const handleStopLiveLocation = async (messageId) => {
    try {
      await apiClient.stopLiveLocation(messageId, currentUserId);
    } catch (e) {
      console.warn('stopLiveLocation error:', e);
    }
  };

  return (
    <main
      className={`${
        !activeConversationId ? 'hidden md:flex' : 'flex'
      } flex-1 flex-col h-full relative overflow-hidden bg-[#0a0e1c] font-sans select-none text-white`}
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
            setIsProfileModalOpen={setIsProfileModalOpen}
            onStartCall={onStartCall}
            onBackToMap={onBackToMap}
            setIsGroupMembersModalOpen={setIsGroupMembersModalOpen}
          />

          {/* VÙNG TIN NHẮN CUỘN ĐỘC LẬP */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 sm:p-4 space-y-3 bg-[#0a0e1c]">
            {messages.map((msg, idx) => {
              const isMe = msg.sender === 'me' || (currentUserId && msg.sender === currentUserId);
              return (
                <div key={msg.id || idx} className="space-y-1.5">
                  <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : 'flex-row'}`}>
                    {!isMe && (
                      <img 
                        src={msg.senderAvatar || activeConversation?.avatar} 
                        alt="" 
                        className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/20"
                      />
                    )}

                    {/* Tin nhắn Thả tim */}
                    {(msg.isHeart || msg.is_heart || msg.text === '❤️') ? (
                      <div className="p-1 animate-bounce">
                        <i className="bi bi-heart-fill text-[#E10600] text-3xl drop-shadow"></i>
                      </div>
                    ) : msg.video ? (
                      /* Tin nhắn Video */
                      <div className="rounded-2xl overflow-hidden border border-white/15 max-w-[260px] bg-black shadow-md">
                        <video src={msg.video} controls playsInline className="w-full max-h-60 object-cover rounded-2xl" />
                        {msg.text && (
                          <p className="p-2.5 text-xs text-white/90 leading-relaxed break-words bg-black/60 border-t border-white/10">{msg.text}</p>
                        )}
                      </div>
                    ) : (msg.image) ? (
                      /* Tin nhắn Ảnh */
                      <div className="rounded-2xl overflow-hidden border border-white/15 max-w-[240px] bg-black/40 shadow-md">
                        <img 
                          src={msg.image} 
                          alt="Đính kèm" 
                          className="w-full max-h-60 object-cover rounded-2xl cursor-pointer hover:opacity-90 active:scale-[0.99] transition-all" 
                          onClick={() => setSelectedLightboxMedia({ type: 'image', url: msg.image })}
                        />
                        {msg.text && (
                          <p className="p-2.5 text-xs text-white/90 leading-relaxed break-words bg-black/60 border-t border-white/10">{msg.text}</p>
                        )}
                      </div>
                    ) : (msg.type === 'troll' || msg.isTroll) ? (
                      /* Thẻ Tin Nhắn Troll Đặc Bản */
                      <div className="p-3 bg-gradient-to-br from-[#1c1224] to-[#121c24] backdrop-blur-xl rounded-2xl border-2 border-[#FF2A85]/50 space-y-1.5 max-w-[240px] text-white shadow-[0_0_15px_rgba(255,42,133,0.3)]">
                        <div className="flex items-center justify-between border-b border-white/10 pb-1 text-xs font-bold text-[#FF2A85]">
                          <span className="flex items-center gap-1"><i className="bi bi-lightning-charge-fill animate-pulse" />{msg.memeName || 'Trêu Chọc'}</span>
                          <span className="text-[9px] font-mono px-1 rounded-full bg-white/10 text-white/80">TROLL</span>
                        </div>
                        <p className="text-xs font-bold text-white italic py-0.5 line-clamp-2">"{msg.text || msg.caption || 'Ném trêu bạn!'}"</p>
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenTakeoverMeme) {
                              onOpenTakeoverMeme({
                                meme: {
                                  id: msg.prankId || msg.memeId || 'honeycomb_slipper',
                                  name: msg.memeName || 'Trêu Chọc',
                                  icon: msg.memeIcon || 'bi-lightning-charge-fill',
                                  image3d: msg.image3d,
                                  particleColor: msg.particleColor,
                                  soundType: msg.soundType || 'punch',
                                  caption: msg.text || msg.caption
                                },
                                senderName: isMe ? 'Bạn' : (activeConversation?.name || 'Bạn bè'),
                                senderUser: isMe ? null : activeConversation
                              });
                            }
                          }}
                          className="w-full py-1.5 rounded-xl bg-gradient-to-r from-[#FF2A85] to-[#00E5FF] text-white text-[11px] font-bold shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <i className="bi bi-play-fill text-sm" />
                          <span>Xem hiệu ứng bùng nổ</span>
                        </button>
                      </div>
                    ) : (msg.is_poll || msg.isPoll || msg.poll || msg.customPoll || (typeof msg.text === 'string' && (msg.text.startsWith('[BÌNH CHỌN]:') || msg.text.startsWith('[BÃŒNH CHá»ŒN]:') || msg.text.startsWith('[POLL]:')))) ? (
                      /* Thẻ Bình Chọn Tương Tác (Interactive Chat Poll Card) */
                      <ChatPollCard
                        msg={msg}
                        isMe={isMe}
                        currentUserId={currentUserId}
                      />
                    ) : (msg.is_live_location || msg.isLiveLocation || (typeof msg.text === 'string' && msg.text.includes('chia sẻ vị trí trực tiếp'))) ? (
                      /* Thẻ Vị trí Trực tiếp (Live GPS Location Card) */
                      <LiveLocationCard
                        msg={msg}
                        isMe={isMe}
                        currentUserLat={userLat}
                        currentUserLng={userLng}
                        onOpenMap={onOpenMapForStory}
                        onStartNavigation={onStartNavigation}
                        onStopShare={handleStopLiveLocation}
                      />
                    ) : (msg.isLocation || msg.is_location) ? (
                      /* Tin nhắn Vị trí GPS Tĩnh */
                      <div className="p-3 bg-[rgba(20,20,30,0.85)] backdrop-blur-xl rounded-2xl border border-white/15 space-y-2 max-w-[240px] text-white shadow-sm">
                        <div className="flex items-center gap-1.5 text-[#00E5FF] font-bold text-xs">
                          <i className="bi bi-geo-alt-fill text-[#FF2A85]"></i>
                          <span>{msg.text || 'Vị trí GPS của tôi'}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/5 text-[10px] font-mono text-white/70 flex items-center justify-between border border-white/10">
                          <span>
                            {(msg.lat != null && !isNaN(Number(msg.lat))) ? Number(msg.lat).toFixed(4) : '10.7769'}° N, 
                            {(msg.lng != null && !isNaN(Number(msg.lng))) ? Number(msg.lng).toFixed(4) : '106.7009'}° E
                          </span>
                          <i className="bi bi-broadcast text-[#00E5FF]"></i>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <VivuButton
                            size="sm"
                            variant="secondary"
                            pill={true}
                            onClick={() => {
                              if (onOpenMapForStory) onOpenMapForStory(msg);
                            }}
                            icon="bi-map-fill"
                            className="text-[11px] py-1"
                          >
                            Map
                          </VivuButton>
                          <VivuButton
                            size="sm"
                            variant="primary"
                            pill={true}
                            onClick={() => {
                              if (onStartNavigation) {
                                onStartNavigation({
                                  realLat: Number(msg.lat ?? 10.7769),
                                  realLng: Number(msg.lng ?? 106.7009),
                                  lat: Number(msg.lat ?? 10.7769),
                                  lng: Number(msg.lng ?? 106.7009),
                                  name: msg.text || 'Vị trí được chia sẻ'
                                });
                              }
                            }}
                            icon="bi-cursor-fill"
                            className="text-[11px] py-1"
                          >
                            Đường đi
                          </VivuButton>
                        </div>
                      </div>
                    ) : (
                      /* Tin nhắn văn bản */
                      <div 
                        className={`p-3 text-xs leading-relaxed ${
                          isMe 
                            ? 'bg-gradient-to-r from-[#FF2A85] to-[#FF539A] text-white font-semibold rounded-2xl rounded-br-sm shadow-[0_0_12px_rgba(255,42,133,0.35)]' 
                            : 'bg-[rgba(20,20,30,0.85)] text-white rounded-2xl rounded-bl-sm border border-white/10 shadow-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    )}
                  </div>

                  <span className={`text-[10px] text-white/40 block font-mono ${isMe ? 'text-right mr-1' : 'ml-9'}`}>
                    {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              );
            })}
          </div>

          {/* KHAY TIỆN ÍCH MỞ RỘNG (GỬI ẢNH, VIDEO, VỊ TRÍ, LIVE GPS, BÌNH CHỌN, TROLL) */}
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

          {/* THANH NHẬP TIN NHẮN GHIM ĐÁY */}
          <div className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] md:pb-3.5 bg-[rgba(20,20,30,0.85)] backdrop-blur-xl border-t border-white/10 flex items-center gap-2 shrink-0 sticky bottom-0 z-20 shadow-sm">
            <input 
              type="file" 
              ref={chatFileInputRef}
              onChange={(e) => handleMediaSelected(e, 'image')}
              accept="image/*"
              className="hidden"
            />
            <input 
              type="file" 
              ref={chatVideoInputRef}
              onChange={(e) => handleMediaSelected(e, 'video')}
              accept="video/*"
              className="hidden"
            />

            {/* Nút (+) mở Khay tiện ích */}
            <button 
              type="button"
              onClick={() => setIsToolsDrawerOpen(!isToolsDrawerOpen)}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                isToolsDrawerOpen 
                  ? 'bg-[#FF2A85] border-[#FF2A85] text-white rotate-45 shadow-[0_0_10px_rgba(255,42,133,0.4)]' 
                  : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Mở tiện ích mở rộng"
            >
              <i className="bi bi-plus-lg text-sm"></i>
            </button>

            {/* Ô nhập tin nhắn */}
            <form onSubmit={handleSend} className="flex-1 flex items-center gap-2">
              <input 
                type="text" 
                value={messageInputText}
                onChange={(e) => setMessageInputText(e.target.value)}
                placeholder="Nhập tin nhắn..."
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
      {selectedLightboxMedia && (
        <div 
          onClick={() => setSelectedLightboxMedia(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-fadeIn"
        >
          <button 
            onClick={() => setSelectedLightboxMedia(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-lg z-10 transition-all"
          >
            <i className="bi bi-x-lg" />
          </button>
          {selectedLightboxMedia.type === 'video' ? (
            <video 
              src={selectedLightboxMedia.url} 
              controls 
              autoPlay 
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" 
              onClick={(e) => e.stopPropagation()} 
            />
          ) : (
            <img 
              src={selectedLightboxMedia.url} 
              alt="Phóng to" 
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" 
              onClick={(e) => e.stopPropagation()} 
            />
          )}
        </div>
      )}
    </main>
  );
}
