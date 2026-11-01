import React from 'react';

/**
 * NotificationBellButton - Nút chuông thông báo nổi trên góc bản đồ
 * Thiết kế chuẩn Resend Dark Monochrome, hiệu ứng pulse badge khi có thông báo mới
 */
export default function NotificationBellButton({ unreadCount = 0, onClick, isOpen = false }) {
  return (
    <button
      id="btn-notification-bell"
      onClick={onClick}
      aria-label="Thông báo"
      className={`relative p-2.5 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl backdrop-blur-xl border ${
        isOpen
          ? 'bg-white text-black border-white shadow-white/10 scale-105'
          : 'bg-[#151619]/90 text-white border-white/15 hover:border-white/40 hover:bg-[#1A1A1E] hover:scale-105 active:scale-95'
      }`}
    >
      <i className={`bi ${unreadCount > 0 ? 'bi-bell-fill text-vivu-accent' : 'bi-bell'} text-lg`} />

      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-[#0A0A0C] shadow-lg animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
