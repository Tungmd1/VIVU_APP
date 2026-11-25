import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * ClearChatModal - Hộp thoại xác nhận dọn sạch toàn bộ tin nhắn trong cuộc trò chuyện
 * - Mặc định xóa ở phía tôi; cho phép chọn xóa với cả mọi người
 * - Giữ nguyên trang và cuộc trò chuyện sau khi xóa
 * Tuân thủ Rule 5 (100% Bootstrap Icons), Rule 7 (< 450 dòng)
 */
export default function ClearChatModal({
  isOpen,
  partnerName,
  onClose,
  onConfirmClear
}) {
  const [clearForEveryone, setClearForEveryone] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setClearForEveryone(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
          {/* Header với Icon cảnh báo */}
          <div className="flex flex-col items-center text-center space-y-2 pt-1">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-[#FF2A85] flex items-center justify-center border border-red-500/30 shadow-[0_0_15px_rgba(255,42,133,0.3)]">
              <i className="bi bi-trash3-fill text-xl"></i>
            </div>
            <h3 className="text-base font-bold tracking-tight">Xóa tất cả tin nhắn?</h3>
            <p className="text-xs text-white/70 leading-relaxed px-2">
              Toàn bộ tin nhắn trong cuộc trò chuyện với <span className="font-semibold text-white">{partnerName || 'người này'}</span> sẽ được dọn sạch, nhưng trang trò chuyện và danh sách bạn bè/nhóm vẫn được giữ nguyên.
            </p>
          </div>

          {/* Tùy chọn phạm vi xóa */}
          <div className="space-y-2 text-left">
            <button
              type="button"
              onClick={() => setClearForEveryone(false)}
              className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                !clearForEveryone
                  ? 'bg-[#00E5FF]/10 border-[#00E5FF]/50 text-white'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              <i className={`bi ${!clearForEveryone ? 'bi-check-circle-fill text-[#00E5FF]' : 'bi-circle text-white/40'} text-sm mt-0.5 shrink-0`}></i>
              <div>
                <div className="text-xs font-bold">Chỉ xóa ở phía tôi</div>
                <div className="text-[11px] text-white/60 leading-snug">Chỉ dọn sạch lịch sử trên tài khoản của bạn; đối phương vẫn giữ nguyên tin nhắn.</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setClearForEveryone(true)}
              className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                clearForEveryone
                  ? 'bg-[#FF2A85]/15 border-[#FF2A85]/60 text-white'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              <i className={`bi ${clearForEveryone ? 'bi-check-circle-fill text-[#FF2A85]' : 'bi-circle text-white/40'} text-sm mt-0.5 shrink-0`}></i>
              <div>
                <div className="text-xs font-bold">Xóa với cả mọi người</div>
                <div className="text-[11px] text-white/60 leading-snug">Xóa toàn bộ tin nhắn cho cả hai phía (khung chat vẫn được giữ lại).</div>
              </div>
            </button>
          </div>

          {/* Các nút hành động */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs border border-white/10 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirmClear?.(clearForEveryone);
                onClose();
              }}
              className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF2A85] to-[#E10600] hover:opacity-95 text-white font-bold text-xs shadow-[0_0_15px_rgba(255,42,133,0.4)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <i className="bi bi-trash3"></i>
              <span>Xóa tất cả tin nhắn</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
