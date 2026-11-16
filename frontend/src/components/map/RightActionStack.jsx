import React, { useRef, useState, useEffect } from 'react';
import { triggerCyberSplash } from '../../utils/cyberSplash';

/**
 * RightActionStack - Cụm Phím Tiện Ích Bản Đồ Dạng Thanh Cuộn Cyber Capsule
 * - Tinh giản 100%: Xóa nút chụp ảnh nhanh, nút chọn vị trí và nút sync phone (tự động ngầm)
 * - Giữ lại các nút cốt lõi: Chuyển lớp bản đồ, Bao quát bạn bè, La bàn & Recenter GPS
 * - 100% Bootstrap Icons (Rule 5), Rule 7 (< 450 dòng)
 */
export default function RightActionStack({
  onResetCompass,
  onFitPeers,
  onRecenterGps,
  onToggleMapStyle,
  mapStyleType = 'streets',
  hasPeers = false,
  isGpsLoading = false
}) {
  const scrollRef = useRef(null);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 6);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 6);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, [hasPeers, mapStyleType]);

  const scrollBy = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed right-3.5 bottom-24 z-30 flex flex-col items-center gap-2 pointer-events-auto select-none font-sans">
      
      {/* 1. THANH CUỘN CHỨC NĂNG CAPSULE */}
      <div className="relative flex flex-col items-center">
        {/* Chỉ báo có thể cuộn lên */}
        {canScrollUp && (
          <button
            type="button"
            onClick={() => scrollBy(-60)}
            className="absolute -top-3 z-10 w-5 h-5 rounded-full bg-[#0F1018] border border-[#00E5FF]/40 text-[#00E5FF] flex items-center justify-center text-[10px] shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title="Cuộn lên"
            aria-label="Cuộn lên"
          >
            <i className="bi bi-chevron-up"></i>
          </button>
        )}

        {/* Hộp chứa các nút công cụ tinh giản */}
        <div
          ref={scrollRef}
          className="flex flex-col items-center gap-2 p-1.5 rounded-full bg-[rgba(15,16,24,0.88)] border border-[#00E5FF]/30 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl max-h-[168px] overflow-y-auto no-scrollbar scroll-smooth overscroll-contain touch-pan-y"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Nút 1: Chuyển đổi Google Đường phố <-> Vệ tinh */}
          {onToggleMapStyle && (
            <button
              type="button"
              onClick={(e) => {
                triggerCyberSplash(e);
                onToggleMapStyle();
              }}
              className="w-10 h-10 rounded-full bg-[rgba(20,20,30,0.9)] hover:bg-[rgba(30,30,45,0.95)] border border-[#00E5FF]/40 hover:border-[#00E5FF] text-[#00E5FF] shadow-md backdrop-blur-xl flex items-center justify-center shrink-0 active:scale-90 transition-all cursor-pointer group"
              title={mapStyleType === 'streets' ? "Chuyển sang Google Vệ Tinh" : "Chuyển sang Google Đường Phố"}
              aria-label="Chuyển lớp bản đồ"
            >
              <i className={`bi ${mapStyleType === 'streets' ? 'bi-globe-asia-australia' : 'bi-map-fill'} text-base group-hover:scale-110 transition-transform`}></i>
            </button>
          )}

          {/* Nút 2: Bao quát bạn bè (Fit Peers) */}
          {hasPeers && (
            <button
              type="button"
              onClick={(e) => {
                triggerCyberSplash(e);
                onFitPeers();
              }}
              className="w-10 h-10 rounded-full bg-[rgba(20,20,30,0.9)] hover:bg-[rgba(30,30,45,0.95)] border border-[#00E5FF]/30 hover:border-[#00E5FF] text-[#00E5FF] shadow-md backdrop-blur-xl flex items-center justify-center shrink-0 active:scale-90 transition-all cursor-pointer group"
              title="Bao quát toàn bộ bạn bè trên bản đồ"
              aria-label="Bao quát bạn bè"
            >
              <i className="bi bi-arrows-fullscreen text-sm group-hover:scale-110 transition-transform"></i>
            </button>
          )}

          {/* Nút 3: Đặt lại la bàn / hướng Bắc */}
          {onResetCompass && (
            <button
              type="button"
              onClick={(e) => {
                triggerCyberSplash(e);
                onResetCompass();
              }}
              className="w-10 h-10 rounded-full bg-[rgba(20,20,30,0.9)] hover:bg-[rgba(30,30,45,0.95)] border border-white/20 hover:border-white text-white/80 shadow-md backdrop-blur-xl flex items-center justify-center shrink-0 active:scale-90 transition-all cursor-pointer group"
              title="Đặt lại la bàn hướng Bắc"
              aria-label="Đặt lại hướng Bắc"
            >
              <i className="bi bi-compass text-base group-hover:scale-110 transition-transform"></i>
            </button>
          )}
        </div>

        {/* Chỉ báo có thể cuộn xuống */}
        {canScrollDown && (
          <button
            type="button"
            onClick={() => scrollBy(60)}
            className="absolute -bottom-3 z-10 w-5 h-5 rounded-full bg-[#0F1018] border border-[#00E5FF]/40 text-[#00E5FF] flex items-center justify-center text-[10px] shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title="Cuộn xuống"
            aria-label="Cuộn xuống"
          >
            <i className="bi bi-chevron-down"></i>
          </button>
        )}
      </div>

      {/* 2. NÚT ĐỊNH VỊ RECENTER GPS CỐ ĐỊNH Ở ĐÁY */}
      {onRecenterGps && (
        <button
          id="btn-recenter-gps"
          type="button"
          onClick={(e) => {
            triggerCyberSplash(e);
            onRecenterGps();
          }}
          disabled={isGpsLoading}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF2A85] to-[#7928CA] border-2 border-white/80 text-white shadow-[0_0_24px_rgba(255,42,133,0.8)] backdrop-blur-xl flex items-center justify-center shrink-0 active:scale-90 transition-all cursor-pointer group disabled:opacity-50"
          title="Định vị về vị trí của bạn"
          aria-label="Vị trí của tôi"
        >
          <i className={`bi ${isGpsLoading ? 'bi-arrow-repeat animate-spin' : 'bi-crosshair2'} text-xl group-hover:scale-110 transition-transform`}></i>
        </button>
      )}

    </div>
  );
}
