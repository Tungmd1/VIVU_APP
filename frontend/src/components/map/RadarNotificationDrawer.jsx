import React from 'react';

/**
 * RadarNotificationDrawer - Drawer trượt từ trên xuống xem lịch sử thông báo Radar
 * Phong cách Luminous Solar-Cyber HUD (White Cyberpunk), 100% Bootstrap Icons
 */
export default function RadarNotificationDrawer({
  isOpen,
  onClose,
  notifications = [],
  onSelectNotification,
  onClearAll
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-start pt-3 px-3 animate-in fade-in duration-200 pointer-events-auto select-none font-sans">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl text-[#131315] rounded-3xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-[#D2D9F4] space-y-3 animate-in slide-in-from-top-6 duration-300 max-h-[82vh] flex flex-col">
        
        {/* Header Drawer */}
        <div className="flex items-center justify-between pb-2 border-b border-[#D2D9F4] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FFE8F0] text-[#FF2A85] flex items-center justify-center border border-[#FFB8D2] shadow-xs">
              <i className="bi bi-bell-fill text-sm"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#131315] font-display flex items-center gap-1.5">
                <span>Thông Báo Radar</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F2F3FF] border border-[#D2D9F4] font-mono font-bold text-[#131315]">
                  {notifications.length}
                </span>
              </h3>
              <p className="text-[10px] text-[#70787E]">Bài đăng mới được phát hiện trong khu vực quét</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-[11px] text-[#70787E] hover:text-[#FF2A85] px-2 py-1 rounded-lg hover:bg-[#FFE8F0] transition-all cursor-pointer font-medium"
                title="Xóa tất cả"
              >
                Xóa hết
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-[#F2F3FF] hover:bg-[#E0E2F0] text-[#70787E] hover:text-[#131315] flex items-center justify-center transition-all cursor-pointer"
            >
              <i className="bi bi-x-lg text-xs"></i>
            </button>
          </div>
        </div>

        {/* Danh sách thông báo */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
          {notifications.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-[#70787E] space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#F2F3FF] border border-[#D2D9F4] flex items-center justify-center text-xl text-[#00838F]">
                <i className="bi bi-broadcast"></i>
              </div>
              <p className="text-xs font-bold text-[#131315] font-display">Chưa có bài đăng nào mới quanh đây</p>
              <p className="text-[10px] text-[#70787E] max-w-[200px]">Radar sẽ tự động rung chuông khi có người dùng đăng bài trong bán kính bạn chọn</p>
            </div>
          ) : (
            notifications.map((notif, idx) => (
              <div
                key={notif.id || idx}
                onClick={() => {
                  if (notif.item) onSelectNotification(notif.item);
                  onClose();
                }}
                className="p-3 rounded-2xl bg-[#FAFAFF] hover:bg-[#F2F3FF] border border-[#D2D9F4] hover:border-[#00E5FF] transition-all cursor-pointer flex items-center gap-3 group active:scale-[0.99] shadow-xs"
              >
                <div className="relative w-11 h-11 rounded-full overflow-hidden border border-[#D2D9F4] shrink-0 bg-[#F2F3FF]">
                  <img
                    src={notif.item?.hostAvatar || notif.item?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10FFA0] border border-white"></span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-[#131315] font-display truncate">
                      {notif.item?.hostName || notif.item?.name || 'Người dùng quanh bạn'}
                    </span>
                    <span className="text-[10px] text-[#70787E] font-mono shrink-0">
                      {notif.time || 'Vừa xong'}
                    </span>
                  </div>

                  <p className="text-xs text-[#40484D] truncate mt-0.5 font-medium">
                    {notif.item?.title || notif.subtitle}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] px-2 py-0.5 rounded-md bg-white text-[#70787E] border border-[#D2D9F4] flex items-center gap-1 shadow-xs">
                      <i className="bi bi-geo-alt-fill text-[8px] text-[#00838F]"></i>
                      <span>{notif.item?.distanceText || 'Gần bạn'}</span>
                    </span>
                    {notif.item?.music && (
                      <span className="text-[9px] text-[#FF2A85] truncate flex items-center gap-1 max-w-[120px] font-medium">
                        <i className="bi bi-music-note-beamed text-[8px]"></i>
                        <span className="truncate">{notif.item.music}</span>
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="w-8 h-8 rounded-full bg-white group-hover:bg-gradient-to-r group-hover:from-[#00E5FF] group-hover:to-[#00B4D8] border border-[#D2D9F4] group-hover:border-[#00F0FF] text-[#70787E] group-hover:text-[#08202E] flex items-center justify-center text-xs transition-all shrink-0 shadow-xs cursor-pointer"
                  title="Xem chi tiết"
                >
                  <i className="bi bi-chevron-right font-bold"></i>
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
