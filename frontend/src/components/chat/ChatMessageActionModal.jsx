import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * ChatMessageActionModal - Hộp thoại tùy chọn xóa hoặc thu hồi từng tin nhắn
 * Tuân thủ Rule 5 (100% Bootstrap Icons), Rule 7 (< 450 dòng)
 */
export default function ChatMessageActionModal({
  isOpen,
  message,
  isMe,
  onClose,
  onDeleteForMe,
  onUnsendForEveryone
}) {
  if (!isOpen || !message) return null;

  // Lấy nội dung xem trước của tin nhắn
  const previewText = message.text || 
    (message.isHeart || message.is_heart ? '❤️ Thả tim' : 
    (message.type === 'sticker' || message.isSticker ? `[Sticker: ${message.sticker?.name || 'VIVU'}]` : 
    (message.image ? '[Hình ảnh]' : 
    (message.video ? '[Video]' : 
    (message.isLocation || message.is_location ? '[Vị trí GPS]' : '[Tin nhắn]')))));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Nền mờ Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Khung Modal F1 Glass */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 12 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-sm rounded-3xl bg-[#121624] border border-white/15 p-5 shadow-2xl text-white space-y-4 z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FF2A85]/20 text-[#FF2A85] flex items-center justify-center">
                <i className="bi bi-trash3 text-sm"></i>
              </div>
              <h3 className="text-sm font-bold tracking-tight">Tùy chọn tin nhắn</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <i className="bi bi-x-lg text-xs"></i>
            </button>
          </div>

          {/* Xem trước tin nhắn cần xóa */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/80 line-clamp-2 italic font-sans">
            "{previewText}"
          </div>

          {/* Các nút hành động */}
          <div className="space-y-2">
            {isMe && (
              <button
                type="button"
                onClick={() => {
                  onUnsendForEveryone?.(message);
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#FF2A85] to-[#7928CA] hover:opacity-95 text-white font-bold text-xs flex items-center justify-between shadow-[0_0_15px_rgba(255,42,133,0.35)] active:scale-98 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <i className="bi bi-arrow-counterclockwise text-base"></i>
                  <div className="text-left">
                    <div>Thu hồi với mọi người</div>
                    <div className="text-[10px] text-white/70 font-normal">Xóa hoàn toàn đối với cả 2 bên</div>
                  </div>
                </div>
                <i className="bi bi-chevron-right text-xs text-white/60"></i>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onDeleteForMe?.(message);
                onClose();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-between active:scale-98 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <i className="bi bi-trash3 text-base text-[#FF2A85]"></i>
                <div className="text-left">
                  <div>Xóa ở phía tôi</div>
                  <div className="text-[10px] text-white/50 font-normal">Chỉ xóa trên thiết bị của bạn</div>
                </div>
              </div>
              <i className="bi bi-chevron-right text-xs text-white/60"></i>
            </button>
          </div>

          {/* Nút Hủy */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
