import React from 'react';

/**
 * MessengerEmptyState - Màn hình chờ khi chưa chọn đoạn chat (Desktop)
 * 100% Bootstrap Icons (Rule 5), Rule 7 (< 450 dòng)
 */
export default function MessengerEmptyState({ onOpenCreatePoll, onOpenCreateCircle }) {
  return (
    <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center text-white/50 space-y-6 bg-[#0a0e1c] select-none">
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
      <div className="w-full max-w-xs space-y-2 pt-2">
        <button
          type="button"
          onClick={onOpenCreatePoll}
          className="w-full h-10 px-4 rounded-full bg-[rgba(20,20,30,0.85)] border border-white/10 hover:border-[#FF2A85]/40 text-white text-xs font-semibold flex items-center justify-between transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <i className="bi bi-bar-chart-steps text-[#FF2A85]"></i>
            Tạo bình chọn nhanh
          </span>
          <i className="bi bi-chevron-right text-xs text-white/40"></i>
        </button>
        <button
          type="button"
          onClick={onOpenCreateCircle}
          className="w-full h-10 px-4 rounded-full bg-[rgba(20,20,30,0.85)] border border-white/10 hover:border-[#00E5FF]/40 text-white text-xs font-semibold flex items-center justify-between transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <i className="bi bi-calendar-event text-[#00E5FF]"></i>
            Tạo nhóm hội tụ
          </span>
          <i className="bi bi-chevron-right text-xs text-white/40"></i>
        </button>
      </div>
    </div>
  );
}

