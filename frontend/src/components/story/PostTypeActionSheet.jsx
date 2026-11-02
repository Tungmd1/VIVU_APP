import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * PostTypeActionSheet - Bảng chọn định tuyến loại bài đăng VIVU
 * Tuân thủ Quy chuẩn Rule 8 (Post Intent Routing) & Rule 12 (Resend Dark Theme)
 * Nâng cấp hoạt cảnh trượt mượt mà Animate-UI / Motion Spring physics
 * 100% Bootstrap Icons vector, không bị lỗi tương phản chữ
 */
export default function PostTypeActionSheet({
  isOpen,
  onClose,
  onSelectType
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none"
        >
          {/* Backdrop click to dismiss */}
          <div className="absolute inset-0" onClick={onClose}></div>

          {/* Sheet Content with Motion Spring */}
          <motion.div 
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-md bg-[#0E0E10] border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.95)] z-10 font-sans text-white"
          >
            {/* Thanh gạt trên đỉnh */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4 sm:hidden"></div>

            {/* Tiêu đề */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <i className="bi bi-plus-circle-fill text-sky-400"></i>
                  <span>Bạn muốn đăng gì hôm nay?</span>
                </h2>
                <p className="text-xs text-[#8E8E93] mt-0.5">
                  Chọn định dạng phù hợp để kết nối với bạn bè xung quanh
                </p>
              </div>
              <motion.button 
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#8E8E93] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="bi bi-x-lg text-xs"></i>
              </motion.button>
            </div>

            {/* 2 Lựa chọn định dạng */}
            <div className="space-y-3">
              {/* LỰA CHỌN 1: NGUYỆN VỌNG ĐI CHƠI (HANGOUT) */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onClose();
                  onSelectType('hangout');
                }}
                className="w-full text-left p-4 rounded-2xl border border-white/10 hover:border-sky-500/60 bg-[#151619] hover:bg-[#1C1D22] transition-colors flex items-center gap-3.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform shrink-0">
                  <i className="bi bi-compass-fill text-xl"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white group-hover:text-sky-300 transition-colors">
                      Nguyện vọng đi chơi
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      Kèo quanh đây
                    </span>
                  </div>
                  <p className="text-xs text-[#8E8E93] mt-1 line-clamp-2">
                    Rủ cafe, ăn uống, dạo phố, thể thao. Tự động cắm ghim GPS trên Bản đồ 3D và điều hướng sang tab Kèo quanh đây.
                  </p>
                </div>
                <i className="bi bi-chevron-right text-[#8E8E93] group-hover:text-white group-hover:translate-x-1 transition-all"></i>
              </motion.button>

              {/* LỰA CHỌN 2: ĐĂNG TÂM TRẠNG SUY NGHĨ */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onClose();
                  onSelectType('mood');
                }}
                className="w-full text-left p-4 rounded-2xl border border-white/10 hover:border-purple-500/60 bg-[#151619] hover:bg-[#1C1D22] transition-colors flex items-center gap-3.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-600 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform shrink-0">
                  <i className="bi bi-chat-quote-fill text-xl"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                      Đăng tâm trạng
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Tin nhắn 24h
                    </span>
                  </div>
                  <p className="text-xs text-[#8E8E93] mt-1 line-clamp-2">
                    Ghi chú 60 ký tự, icon vector, nhạc nền. Hiển thị dạng Bong bóng suy nghĩ nổi trên Avatar hàng Đang hoạt động.
                  </p>
                </div>
                <i className="bi bi-chevron-right text-[#8E8E93] group-hover:text-white group-hover:translate-x-1 transition-all"></i>
              </motion.button>
            </div>

            {/* Nút đóng */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full mt-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
            >
              Hủy bỏ
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
