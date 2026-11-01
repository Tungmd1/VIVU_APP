import React from 'react';
import VivuLogo from './VivuLogo';

/**
 * TopAppLogo - Logo VIVU Neon Glass Capsule
 * - Thân viên thuốc kính mờ Cyber Glass rgba(20,20,30,0.85), bo tròn rounded-pill
 * - Huy hiệu Hồng Neon #FF2A85 & Xanh Cyan #00E5FF
 * - 100% Bootstrap Icons, Rule 7 (< 450 dòng)
 */
export default function TopAppLogo({ onClick }) {
  return (
    <div className="fixed top-3 left-3 sm:top-4 sm:left-4 z-40 pointer-events-auto select-none font-sans flex items-center gap-2">
      {/* Nút Logo VIVU Map (Bootstrap btn-secondary rounded-pill) */}
      <button
        type="button"
        onClick={onClick}
        title="VIVU Social Map • Định vị lại trung tâm bản đồ"
        aria-label="VIVU Social Map"
        className="btn btn-secondary rounded-pill gap-2.5 px-3 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all cursor-pointer group"
      >
        <div className="shrink-0 group-hover:scale-105 transition-transform duration-200">
          <VivuLogo size="xs" />
        </div>

        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-extrabold text-white text-sm tracking-tight group-hover:text-[#FF2A85] transition-colors">
            VIVU
          </span>
          <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FF2A85]/20 text-[#FF2A85] border border-[#FF2A85]/30 font-mono">
            GPS
          </span>
        </div>
      </button>
    </div>
  );
}
