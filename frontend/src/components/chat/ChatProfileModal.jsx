import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * ChatProfileModal - Modal Thông Tin Bạn Chat & KHO LƯU TRỮ FILE PHƯƠNG TIỆN (Ảnh & Video) Chuẩn Messenger
 * 100% Bootstrap Icons (Rule 5), Rule 7 (< 450 dòng)
 */
export default function ChatProfileModal({
  isOpen,
  onClose,
  conversation,
  friend,
  messages = [],
  onStartCall,
  onOpenMap,
  onSelectLightboxMedia,
  onOpenClearModal
}) {
  const [mediaFilter, setMediaFilter] = useState('all'); // 'all', 'image', 'video'

  // Trích xuất toàn bộ hình ảnh và video đã gửi trong cuộc trò chuyện (Kho lưu trữ)
  const mediaList = useMemo(() => {
    const list = [];
    (messages || []).forEach((m, idx) => {
      if (m.image && !m.isSticker && !m.is_sticker && !m.sticker && m.type !== 'sticker') {
        list.push({
          id: m.id || `img-${idx}`,
          type: 'image',
          url: m.image,
          text: m.text,
          time: m.created_at || m.time
        });
      }
      if (m.video) {
        list.push({
          id: m.id || `vid-${idx}`,
          type: 'video',
          url: m.video,
          text: m.text,
          time: m.created_at || m.time
        });
      }
    });
    return list.reverse(); // Mới nhất hiển thị trước
  }, [messages]);

  const imageCount = useMemo(() => mediaList.filter(m => m.type === 'image').length, [mediaList]);
  const videoCount = useMemo(() => mediaList.filter(m => m.type === 'video').length, [mediaList]);

  const filteredMedia = useMemo(() => {
    if (mediaFilter === 'image') return mediaList.filter(m => m.type === 'image');
    if (mediaFilter === 'video') return mediaList.filter(m => m.type === 'video');
    return mediaList;
  }, [mediaList, mediaFilter]);

  const displayName = friend?.name || conversation?.name || 'Người dùng VIVU';
  const displayAvatar = friend?.avatar || conversation?.avatar;
  const isGroup = conversation?.type === 'group';
  const memberCount = (conversation?.memberIds?.length || 0) + 1;
  const messageCount = messages.length || conversation?.messages?.length || 0;
  const streakLevel = Math.max(1, Math.floor(messageCount / 3));

  return (
    <AnimatePresence>
      {isOpen && conversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-sans select-none">
          {/* Nền mờ Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Khung Modal F1 Glass Dark Cyberpunk */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-md max-h-[90vh] bg-[#121624] border border-white/15 rounded-3xl p-5 shadow-2xl text-white space-y-4 overflow-hidden flex flex-col"
          >
          {/* Nút đóng */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center transition-all active:scale-90 border border-white/10 z-20 cursor-pointer"
            title="Đóng"
          >
            <i className="bi bi-x-lg text-xs"></i>
          </button>

          {/* VÙNG CUỘN NỘI DUNG */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-0.5">

            {/* 1. Avatar & Tên & Huy hiệu */}
            <div className="flex flex-col items-center text-center pt-2">
              <div className="relative w-20 h-20 rounded-full p-0.5 border-2 border-[#FF2A85] shadow-[0_0_20px_rgba(255,42,133,0.35)] mb-3">
                <img
                  src={displayAvatar}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#00FF66] border-2 border-[#121624] shadow-[0_0_8px_#00FF66]"></span>
              </div>

              <h3 className="font-bold text-base text-white flex items-center gap-1.5">
                <span>{displayName}</span>
                <i className="bi bi-patch-check-fill text-[#00E5FF] text-sm"></i>
              </h3>

              <p className="text-xs text-white/50 mt-0.5 font-mono">
                {isGroup ? `Nhóm trò chuyện • ${memberCount} thành viên` : 'Bạn bè đã kết nối trên VIVU'}
              </p>

              {/* Huy hiệu Chuỗi thân thiết nếu có */}
              {!isGroup && messageCount >= 3 && (
                <div className="mt-2 px-3 py-1 rounded-full bg-[#FF2A85]/15 border border-[#FF2A85]/40 text-[#FF2A85] text-xs font-bold flex items-center gap-1.5 animate-pulse">
                  <i className="bi bi-fire"></i>
                  <span>Chuỗi thân thiết: Cấp {streakLevel} ({messageCount} tin nhắn)</span>
                </div>
              )}
            </div>

            {/* 2. Các nút hành động nhanh: Gọi thoại, video & Bản đồ */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onStartCall) onStartCall(conversation, 'voice');
                }}
                className="py-2.5 px-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex flex-col items-center gap-1 active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                <i className="bi bi-telephone-fill text-base text-[#00E5FF]"></i>
                <span>Gọi thoại</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onStartCall) onStartCall(conversation, 'video');
                }}
                className="py-2.5 px-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex flex-col items-center gap-1 active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                <i className="bi bi-camera-video-fill text-base text-[#FF2A85]"></i>
                <span>Gọi video</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenMap) onOpenMap(friend || conversation);
                }}
                className="py-2.5 px-2 rounded-2xl bg-gradient-to-r from-[#00E5FF]/20 to-[#00B4D8]/20 hover:from-[#00E5FF]/30 hover:to-[#00B4D8]/30 text-[#00E5FF] text-xs font-bold border border-[#00E5FF]/30 flex flex-col items-center gap-1 active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                <i className="bi bi-geo-alt-fill text-base"></i>
                <span>Xem Map</span>
              </button>
            </div>

            {/* 3. MỤC "KHO LƯU TRỮ PHƯƠNG TIỆN" (Ảnh & Video giống Messenger) */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#00E5FF]/15 text-[#00E5FF] flex items-center justify-center">
                    <i className="bi bi-images text-sm"></i>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-wide">Kho lưu trữ phương tiện</h4>
                    <span className="text-[10px] text-white/50">{mediaList.length} tệp đã chia sẻ</span>
                  </div>
                </div>

                {/* Bộ lọc 3 tab: Tất cả, Ảnh, Video */}
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 text-[10px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setMediaFilter('all')}
                    className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                      mediaFilter === 'all' ? 'bg-[#FF2A85] text-white' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaFilter('image')}
                    className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                      mediaFilter === 'image' ? 'bg-[#FF2A85] text-white' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Ảnh ({imageCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaFilter('video')}
                    className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                      mediaFilter === 'video' ? 'bg-[#FF2A85] text-white' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Video ({videoCount})
                  </button>
                </div>
              </div>

              {/* Lưới hiển thị ảnh và video trong kho lưu trữ */}
              {filteredMedia.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto no-scrollbar pr-0.5 pt-1">
                  {filteredMedia.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectLightboxMedia?.({ type: item.type, url: item.url })}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-black/50 border border-white/10 hover:border-[#00E5FF] cursor-pointer transition-all active:scale-95 shadow-sm"
                      title={item.type === 'video' ? 'Xem video toàn màn hình' : 'Xem ảnh to'}
                    >
                      {item.type === 'video' ? (
                        <>
                          <video
                            src={item.url}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            muted
                            playsInline
                          />
                          <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                            <div className="w-7 h-7 rounded-full bg-[#FF2A85]/80 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                              <i className="bi bi-play-fill text-sm"></i>
                            </div>
                          </div>
                          <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/70 text-[9px] font-mono text-white/90">
                            VIDEO
                          </span>
                        </>
                      ) : (
                        <img
                          src={item.url}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center justify-center text-center space-y-1 bg-black/20 rounded-xl border border-dashed border-white/10">
                  <i className="bi bi-camera-video text-2xl text-white/30"></i>
                  <p className="text-[11px] text-white/60">
                    Chưa có {mediaFilter === 'image' ? 'hình ảnh' : (mediaFilter === 'video' ? 'video' : 'ảnh hoặc video')} nào được chia sẻ.
                  </p>
                </div>
              )}
            </div>

            {/* 4. TÙY CHỌN: XÓA TẤT CẢ TIN NHẮN TRONG ĐOẠN CHAT */}
            {onOpenClearModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenClearModal();
                }}
                className="w-full py-2.5 px-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-[#FF2A85] border border-red-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm active:scale-95"
              >
                <i className="bi bi-trash3 text-sm"></i>
                <span>Xóa tất cả tin nhắn trong cuộc trò chuyện</span>
              </button>
            )}

          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
