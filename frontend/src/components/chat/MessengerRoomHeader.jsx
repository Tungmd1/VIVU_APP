import React, { useState } from 'react';
import { motion } from 'motion/react';

/**
 * MessengerRoomHeader - Thanh tiêu đề phòng chat F1 Glass
 * 100% Bootstrap Icons (Rule 5), Rule 7 (< 450 dòng)
 */
export default function MessengerRoomHeader({
  activeConversation,
  setActiveConversationId,
  hasStreak,
  streakLevel,
  onOpenUserProfile,
  setIsProfileModalOpen,
  onStartCall,
  onBackToMap,
  setIsGroupMembersModalOpen,
  onOpenClearModal
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isOnline = Boolean(activeConversation?.online || activeConversation?.isOnline || activeConversation?.is_online);

  return (
    <div className="flex items-center justify-between px-3.5 py-3 bg-[rgba(20,20,30,0.85)] backdrop-blur-xl border-b border-white/10 shrink-0 z-30 shadow-sm select-none">
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
        
        {/* Avatar & Tên: Chạm để mở Hồ sơ & Kho lưu trữ bạn chat */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => {
            setIsProfileModalOpen?.(true);
          }}
          title="Xem thông tin & Kho lưu trữ file phương tiện"
        >
          <div className="relative">
            <img 
              src={activeConversation?.avatar} 
              alt="" 
              className="w-10 h-10 rounded-full object-cover border-2 border-[#FF2A85] group-hover:scale-105 transition-transform" 
            />
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-black ${
              isOnline ? 'bg-[#00FF66] shadow-[0_0_6px_#00FF66]' : 'bg-neutral-500'
            }`}></span>
          </div>
          
          <div>
            <h2 className="font-bold text-xs text-white truncate max-w-[150px] sm:max-w-[200px] group-hover:text-[#FF2A85] transition-colors flex items-center gap-1">
              <span>{activeConversation?.name}</span>
              <i className="bi bi-chevron-right text-[10px] text-white/50"></i>
            </h2>
            <div className="text-[10px] text-white/50 flex items-center gap-1.5 font-mono">
              {hasStreak && !activeConversation?.isStranger && (
                <>
                  <span className="text-[#FF2A85] font-bold flex items-center gap-0.5 animate-pulse">
                    <i className="bi bi-fire"></i>
                    <span>Cấp {streakLevel}</span>
                  </span>
                  <span>•</span>
                </>
              )}
              {isOnline ? (
                <span className="text-[#00FF66] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66]"></span>
                  <span>Đang hoạt động</span>
                </span>
              ) : (
                <span className="text-white/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-500"></span>
                  <span>Ngoại tuyến</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nút hành động: Gọi thoại, video & Bản đồ */}
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

        {/* Nút Tùy chọn cuộc trò chuyện (Menu Lưu trữ & Xóa toàn bộ tin nhắn) */}
        <div className="relative">
          <button 
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`w-8 h-8 rounded-full border text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-sm ${
              isMenuOpen ? 'bg-[#FF2A85] border-[#FF2A85] shadow-[0_0_10px_rgba(255,42,133,0.4)]' : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
            title="Tùy chọn cuộc trò chuyện"
            aria-label="Tùy chọn cuộc trò chuyện"
          >
            <i className="bi bi-three-dots-vertical text-xs text-white"></i>
          </button>

          {/* Menu Dropdown F1 Glass */}
          {isMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute right-0 top-10 w-52 rounded-2xl bg-[#141625]/95 backdrop-blur-2xl border border-white/15 shadow-2xl p-1.5 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsProfileModalOpen?.(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/10 text-white transition-colors cursor-pointer text-left"
                >
                  <i className="bi bi-images text-[#00E5FF] text-sm"></i>
                  <div>
                    <div className="font-semibold">Kho lưu trữ phương tiện</div>
                    <div className="text-[10px] text-white/50">Xem ảnh, video đã chia sẻ</div>
                  </div>
                </button>

                <div className="border-t border-white/10 my-1"></div>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenClearModal?.();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-red-500/20 text-[#FF2A85] hover:text-red-300 transition-colors cursor-pointer text-left"
                >
                  <i className="bi bi-trash3 text-sm"></i>
                  <div>
                    <div className="font-semibold">Xóa toàn bộ tin nhắn</div>
                    <div className="text-[10px] text-white/50">Dọn sạch lịch sử trò chuyện</div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

