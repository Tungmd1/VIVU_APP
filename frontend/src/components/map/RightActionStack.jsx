import React from 'react';
import { triggerCyberSplash } from '../../utils/cyberSplash';

/**
 * RightActionStack - Cụm Phím Tiện Ích Bản Đồ Nổi VIVU Chuẩn Cyberpunk Pink & Blue
 * - Bo tròn hoàn hảo rounded-full
 * - Thân kính mờ Cyber Glass rgba(20,20,30,0.85) với viền ánh Cyan #00E5FF
 * - Nút Recenter GPS Hồng Neon #FF2A85 phát quang
 * - Khi bấm: Kích hoạt hiệu ứng GSAP tia hạt Cyber Splash
 * - 100% Bootstrap Icons, Rule 7 (< 450 dòng)
 */
export default function RightActionStack({
  onResetCompass,
  onFitPeers,
  onQuickSnap,
  onRecenterGps,
  hasPeers = false,
  isGpsLoading = false
}) {
  return (
    <div className="fixed right-3.5 bottom-24 z-30 flex flex-col items-end gap-2.5 pointer-events-auto select-none font-sans">
      
      {/* 1. NÚT LA BÀN (COMPASS / ĐẶT LẠI HƯỚNG BẮC) */}
      {onResetCompass && (
        <button
          type="button"
          onClick={(e) => {
            triggerCyberSplash(e);
            onResetCompass();
          }}
          className="w-11 h-11 rounded-full bg-[rgba(20,20,30,0.85)] hover:bg-[rgba(25,25,38,0.95)] border border-[#00E5FF]/30 hover:border-[#00E5FF] text-[#00E5FF] shadow-[0_4px_16px_rgba(0,0,0,0.5)] backdrop-blur-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer group"
          title="Đặt lại hướng Bắc và góc nhìn 2D"
          aria-label="Đặt lại la bàn"
        >
          <i className="bi bi-compass text-lg text-[#00E5FF] group-hover:rotate-45 transition-transform duration-250"></i>
        </button>
      )}

      {/* 2. NÚT FIT PEERS (BAO QUÁT BẠN BÈ) */}
      {hasPeers && (
        <button
          type="button"
          onClick={(e) => {
            triggerCyberSplash(e);
            onFitPeers();
          }}
          className="w-11 h-11 rounded-full bg-[rgba(20,20,30,0.85)] hover:bg-[rgba(25,25,38,0.95)] border border-[#00E5FF]/30 hover:border-[#00E5FF] text-[#00E5FF] shadow-[0_4px_16px_rgba(0,0,0,0.5)] backdrop-blur-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer"
          title="Bao quát toàn bộ bạn bè trên bản đồ"
          aria-label="Bao quát bạn bè"
        >
          <i className="bi bi-arrows-fullscreen text-base"></i>
        </button>
      )}

      {/* 3. NÚT CHỤP HÌNH NHANH (QUICKSNAP STORY) */}
      {onQuickSnap && (
        <button
          type="button"
          onClick={(e) => {
            triggerCyberSplash(e);
            onQuickSnap();
          }}
          className="w-11 h-11 rounded-full bg-[rgba(20,20,30,0.85)] hover:bg-[rgba(25,25,38,0.95)] border border-[#FF2A85]/40 hover:border-[#FF2A85] text-[#FF2A85] shadow-[0_4px_16px_rgba(0,0,0,0.5)] backdrop-blur-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer group"
          title="Chụp nhanh khoảnh khắc quanh bạn"
          aria-label="Chụp ảnh nhanh"
        >
          <i className="bi bi-camera-fill text-lg group-hover:scale-110 transition-transform"></i>
        </button>
      )}

      {/* 4. NÚT RECENTER GPS (ĐỊNH VỊ BAY VỀ VỊ TRÍ CỦA BẠN - HỒNG NEON PHÁT QUANG) */}
      {onRecenterGps && (
        <button
          type="button"
          onClick={(e) => {
            triggerCyberSplash(e);
            onRecenterGps();
          }}
          className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#FF2A85] to-[#FF539A] text-white border-2 border-white/50 shadow-[0_0_20px_rgba(255,42,133,0.65),0_4px_16px_rgba(0,0,0,0.5)] flex items-center justify-center active:scale-95 transition-all cursor-pointer group"
          title="Định vị bay về vị trí của Bạn"
          aria-label="Về vị trí của tôi"
        >
          <i className={`bi bi-cursor-fill text-lg ${isGpsLoading ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`}></i>
        </button>
      )}

    </div>
  );
}
