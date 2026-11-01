import React, { useRef } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import VivuButton from '../common/VivuButton';

/**
 * MessengerActiveRoom - Khung chat đang chọn & Màn hình chờ chuẩn Cyberpunk Pink & Blue Glass
 * Nền tối #0a0e1c, khung kính rgba(20,20,30,0.85), Hồng #FF2A85 & Xanh Cyan #00E5FF
 * Tuân thủ Rule 5 (100% Bootstrap Icons), Rule 7 (< 450 dòng), Rule 12 (Tương phản form)
 */
export default function MessengerActiveRoom({
  activeConversation,
  activeConversationId,
  setActiveConversationId,
  messages = [],
  userLat,
  userLng,
  onSendMessage,
  onSendQuickHeart,
  onStartCall,
  onBackToMap,
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

  // Tính cấp Chuỗi Thân Thiết (Streak): Cứ mỗi 3 tin nhắn tăng 1 cấp chuỗi
  const currentMessageCount = messages.length || 0;
  const streakLevel = Math.max(1, Math.floor(currentMessageCount / 3));
  const hasStreak = currentMessageCount >= 3;

  // Gửi ảnh & video
  const handleMediaSend = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      onSendMessage({
        conversationId: activeConversationId,
        [type]: reader.result,
        text: ''
      });
      setIsToolsDrawerOpen(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Gửi vị trí GPS thời gian thực
  const handleSendLocation = () => {
    const safeLat = (userLat != null && !isNaN(Number(userLat))) ? Number(userLat) : 10.7769;
    const safeLng = (userLng != null && !isNaN(Number(userLng))) ? Number(userLng) : 106.7009;
    onSendMessage({
      conversationId: activeConversationId,
      isLocation: true,
      is_location: true,
      lat: safeLat,
      lng: safeLng,
      text: 'Vị trí GPS thời gian thực của tôi'
    });
    setIsToolsDrawerOpen(false);
    confetti({ particleCount: 30, spread: 45 });
  };

  return (
    <main
      className={`${
        !activeConversationId ? 'hidden md:flex' : 'flex'
      } flex-1 flex-col h-full relative overflow-hidden bg-[#0a0e1c] font-sans select-none text-white`}
    >
      {activeConversationId ? (
        <div className="flex-1 flex flex-col h-full bg-[#0a0e1c] text-white animate-in fade-in duration-150 relative z-20">
          
          {/* Header phòng chat F1 Glass */}
          <div className="flex items-center justify-between px-3.5 py-3 bg-[rgba(20,20,30,0.85)] backdrop-blur-xl border-b border-white/10 shrink-0 z-30 shadow-sm">
            <div className="flex items-center gap-2.5">
              {/* Nút quay lại danh sách trên Mobile */}
              <motion.button 
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveConversationId(null)}
                className="md:hidden w-9 h-9 -ml-1 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
                title="Quay lại danh sách hội thoại"
                aria-label="Quay lại danh sách hội thoại"
              >
                <i className="bi bi-arrow-left text-base font-bold text-[#FF2A85]"></i>
              </motion.button>
              
              {/* Avatar & Tên: Chạm để mở Hồ sơ bạn chat */}
              <div 
                className="flex items-center gap-2.5 cursor-pointer group"
                onClick={() => setIsProfileModalOpen(true)}
                title="Xem hồ sơ cá nhân"
              >
                <div className="relative">
                  <img 
                    src={activeConversation?.avatar} 
                    alt="" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#FF2A85] group-hover:scale-105 transition-transform" 
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00FF66] border-2 border-black shadow-[0_0_6px_#00FF66]"></span>
                </div>
                
                <div>
                  <h2 className="font-bold text-xs text-white truncate max-w-[150px] sm:max-w-[200px] group-hover:text-[#FF2A85] transition-colors flex items-center gap-1">
                    <span>{activeConversation?.name}</span>
                    <i className="bi bi-chevron-right text-[10px] text-white/50"></i>
                  </h2>
                  <div className="text-[10px] text-white/50 flex items-center gap-1.5 font-mono">
                    {hasStreak && !activeConversation?.isStranger && (
                      <span className="text-[#FF2A85] font-bold flex items-center gap-0.5 animate-pulse">
                        <i className="bi bi-fire"></i>
                        <span>Cấp {streakLevel}</span>
                      </span>
                    )}
                    <span>•</span>
                    <span className="text-[#00FF66] font-semibold">Đang hoạt động</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Nút hành động đầu phòng chat: Gọi thoại, video & Bản đồ */}
            <div className="flex items-center gap-1.5">
              <button 
                type="button"
                onClick={() => onStartCall?.(activeConversation, 'voice')}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-colors active:scale-90 cursor-pointer shadow-sm"
                title="Gọi thoại"
              >
                <i className="bi bi-telephone-fill text-xs text-[#00E5FF]"></i>
              </button>
              <button 
                type="button"
                onClick={() => onStartCall?.(activeConversation, 'video')}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-colors active:scale-90 cursor-pointer shadow-sm"
                title="Gọi video"
              >
                <i className="bi bi-camera-video-fill text-xs text-[#00E5FF]"></i>
              </button>
              {/* Nút Xem Bản đồ 3D */}
              {onBackToMap && (
                <motion.button 
                  type="button"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={onBackToMap}
                  className="w-8 h-8 rounded-full bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] flex items-center justify-center hover:bg-[#00E5FF]/25 transition-colors cursor-pointer shadow-sm"
                  title="Về Bản đồ 3D"
                  aria-label="Về Bản đồ 3D"
                >
                  <i className="bi bi-globe-americas text-xs"></i>
                </motion.button>
              )}
              {activeConversation?.type === 'group' && (
                <button 
                  type="button"
                  onClick={() => setIsGroupMembersModalOpen(true)}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-colors active:scale-90 cursor-pointer shadow-sm"
                  title="Xem thành viên nhóm"
                >
                  <i className="bi bi-people-fill text-xs text-[#00E5FF]"></i>
                </button>
              )}
            </div>
          </div>

          {/* VÙNG TIN NHẮN CUỘN ĐỘC LẬP */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 sm:p-4 space-y-3 bg-[#0a0e1c]">
            {messages.map((msg, idx) => {
              const isMe = msg.sender === 'me';
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
                      <div className="rounded-2xl overflow-hidden border border-white/15 max-w-[240px] bg-black shadow-sm">
                        <video src={msg.video} controls className="w-full max-h-56 object-cover rounded-2xl" />
                      </div>
                    ) : msg.image ? (
                      /* Tin nhắn Ảnh */
                      <div className="rounded-2xl overflow-hidden border border-white/15 max-w-[220px] shadow-sm">
                        <img src={msg.image} alt="Đính kèm" className="w-full max-h-56 object-cover rounded-2xl" />
                      </div>
                    ) : (msg.isLocation || msg.is_location) ? (
                      /* Tin nhắn Vị trí GPS */
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
                  {isMe && (
                    <div className="flex items-center justify-end gap-1 px-1 text-[10px] text-white/40">
                      {msg.status === 'read' ? (
                        <span className="flex items-center gap-0.5 text-[#FF2A85] font-medium">
                          <i className="bi bi-check-all text-xs"></i>
                          <span className="text-[9px]">Đã xem</span>
                        </span>
                      ) : msg.status === 'delivered' ? (
                        <span className="flex items-center gap-0.5 text-white/50">
                          <i className="bi bi-check-all text-xs"></i>
                          <span className="text-[9px]">Đã nhận</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-white/50">
                          <i className="bi bi-check text-xs"></i>
                          <span className="text-[9px]">Đã gửi</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* KHAY CÔNG CỤ MỞ RỘNG (KHI BẤM NÚT +) */}
          {isToolsDrawerOpen && (
            <div className="mx-3 mb-2 p-3 bg-[rgba(20,20,30,0.95)] backdrop-blur-2xl border border-white/15 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.4)] grid grid-cols-3 gap-2 animate-in slide-in-from-bottom-3 duration-200 z-30">
              <button
                type="button"
                onClick={() => chatFileInputRef.current?.click()}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#FF2A85] text-lg border border-white/10">
                  <i className="bi bi-image"></i>
                </div>
                <span className="text-[10px] font-semibold">Gửi Ảnh</span>
              </button>

              <button
                type="button"
                onClick={() => chatVideoInputRef.current?.click()}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#00E5FF] text-lg border border-white/10">
                  <i className="bi bi-camera-video-fill"></i>
                </div>
                <span className="text-[10px] font-semibold">Gửi Video</span>
              </button>

              <button
                type="button"
                onClick={handleSendLocation}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#00FF66] text-lg border border-white/10">
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <span className="text-[10px] font-semibold">Gửi Vị Trí</span>
              </button>
            </div>
          )}

          {/* THANH NHẬP TIN NHẮN GHIM ĐÁY */}
          <div className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] md:pb-3.5 bg-[rgba(20,20,30,0.85)] backdrop-blur-xl border-t border-white/10 flex items-center gap-2 shrink-0 sticky bottom-0 z-20 shadow-sm">
            <input 
              type="file" 
              ref={chatFileInputRef}
              onChange={(e) => handleMediaSend(e, 'image')}
              accept="image/*"
              className="hidden"
            />
            <input 
              type="file" 
              ref={chatVideoInputRef}
              onChange={(e) => handleMediaSend(e, 'video')}
              accept="video/*"
              className="hidden"
            />

            <button 
              type="button"
              onClick={() => setIsToolsDrawerOpen(!isToolsDrawerOpen)}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 active:scale-90 cursor-pointer border ${
                isToolsDrawerOpen 
                  ? 'bg-[#FF2A85] text-white rotate-45 border-[#FF2A85] shadow-[0_0_12px_rgba(255,42,133,0.5)]' 
                  : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
              }`}
              title="Mở tiện ích gửi ảnh, video, vị trí"
            >
              <i className="bi bi-plus-lg text-base font-bold"></i>
            </button>

            <input 
              type="text" 
              value={messageInputText}
              onChange={(e) => setMessageInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Nhập tin nhắn..." 
              className="flex-1 bg-white/5 px-4 py-2.5 rounded-full text-xs text-white placeholder-white/40 outline-none focus:border-[#FF2A85] focus:ring-1 focus:ring-[#FF2A85]/30 border border-white/10 transition-all font-medium"
            />

            {messageInputText.trim() ? (
              <button 
                type="button"
                onClick={handleSend}
                className="w-9 h-9 rounded-full bg-gradient-to-r from-[#FF2A85] to-[#FF539A] text-white flex items-center justify-center shrink-0 font-bold border border-white/20 active:scale-95 shadow-[0_0_14px_rgba(255,42,133,0.5)] transition-all cursor-pointer"
                title="Gửi tin nhắn"
              >
                <i className="bi bi-send-fill text-xs"></i>
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
        /* MÀN HÌNH CHỜ TRÊN DESKTOP KHI CHƯA CHỌN ĐOẠN CHAT */
        <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center text-white/50 space-y-6 bg-[#0a0e1c]">
          <div className="w-16 h-16 rounded-3xl bg-[rgba(20,20,30,0.85)] border border-white/10 flex items-center justify-center text-3xl text-[#FF2A85] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            <i className="bi bi-chat-quote-fill"></i>
          </div>

          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-base font-bold text-white">Chưa chọn đoạn chat</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Chọn một hội thoại từ danh sách bên trái hoặc sử dụng phím tắt bên dưới để bắt đầu kết nối.
            </p>
          </div>

          {/* Cụm Phím Tắt Khởi Tạo Nhanh */}
          <div className="w-full max-w-xs space-y-2.5 pt-2">
            <button
              type="button"
              onClick={onOpenCreatePoll}
              className="w-full h-11 px-4 rounded-full bg-[rgba(20,20,30,0.85)] border border-white/10 shadow-sm hover:border-[#FF2A85]/40 hover:bg-white/5 text-white text-[13px] font-semibold flex items-center justify-between transition-all cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-2.5">
                <i className="bi bi-bar-chart-steps text-[#FF2A85] text-base"></i>
                <span>Tạo bình chọn nhanh</span>
              </div>
              <i className="bi bi-chevron-right text-xs text-white/40"></i>
            </button>

            <button
              type="button"
              onClick={onOpenCreateCircle}
              className="w-full h-11 px-4 rounded-full bg-[rgba(20,20,30,0.85)] border border-white/10 shadow-sm hover:border-[#00E5FF]/40 hover:bg-white/5 text-white text-[13px] font-semibold flex items-center justify-between transition-all cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-2.5">
                <i className="bi bi-calendar-event text-[#00E5FF] text-base"></i>
                <span>Tạo nhóm hội tụ</span>
              </div>
              <i className="bi bi-chevron-right text-xs text-white/40"></i>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
