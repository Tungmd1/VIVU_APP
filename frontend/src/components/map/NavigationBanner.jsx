import React from 'react';

/**
 * NavigationBanner - Banner dẫn đường nổi trên Map khi kích hoạt tính năng Chỉ Đường
 * Thiết kế chuẩn Design System VIVU: Nền trắng, viền #D8E3E7, màu điều hướng #0A8395, bóng đổ nhẹ
 */
export default function NavigationBanner({ navTarget, onClose }) {
  if (!navTarget) return null;

  const targetTitle = navTarget.title || navTarget.name || 'Điểm hẹn trên bản đồ';
  const targetAddress = navTarget.address || (navTarget.lat ? `${Number(navTarget.lat).toFixed(4)}°N, ${Number(navTarget.lng).toFixed(4)}°E` : 'Đang điều hướng GPS');

  return (
    <div className="fixed top-18 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md bg-white text-[#14252E] border border-[#D8E3E7] rounded-2xl p-4 shadow-[0_8px_24px_rgba(20,37,46,0.12)] select-none font-sans animate-in slide-in-from-top-4 duration-250">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* VIVU Navigation Icon */}
          <div className="w-10 h-10 rounded-xl bg-[#0A8395] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            <i className="bi bi-cursor-fill rotate-45 text-base"></i>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-[#14252E] flex items-center gap-2">
              <span className="text-[#0A8395]">Đang dẫn đường</span>
              <span className="text-xs font-semibold text-[#52646D] truncate max-w-[140px]">
                ({navTarget.distance || 'Khoảng 1.2 km'})
              </span>
            </div>
            <div className="text-xs text-[#14252E] font-semibold truncate max-w-[220px]">
              Tới: {targetTitle}
            </div>
            <div className="text-[11px] text-[#52646D] truncate max-w-[220px]">
              {targetAddress}
            </div>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="w-8 h-8 rounded-xl bg-[#F8FAFB] hover:bg-[#EEF3F5] text-[#52646D] hover:text-[#14252E] flex items-center justify-center transition-all active:scale-95 shrink-0 cursor-pointer"
          title="Kết thúc chỉ đường"
        >
          <i className="bi bi-x-lg text-xs"></i>
        </button>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#D8E3E7] flex gap-2">
        <a 
          href={`https://www.google.com/maps/dir/?api=1&destination=${navTarget.realLat || navTarget.lat || 10.7769},${navTarget.realLng || navTarget.lng || 106.7009}`} 
          target="_blank" 
          rel="noreferrer"
          className="flex-1 py-2 bg-[#0A8395]/10 hover:bg-[#0A8395]/18 text-[#0A8395] rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-all border border-[#0A8395]/25 cursor-pointer"
        >
          <i className="bi bi-box-arrow-up-right text-[11px]"></i>
          <span>Mở trong Google Maps</span>
        </a>
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-[#F8FAFB] hover:bg-[#EEF3F5] text-[#52646D] hover:text-[#14252E] border border-[#D8E3E7] rounded-xl text-xs font-semibold active:scale-95 transition-all cursor-pointer"
        >
          Kết thúc
        </button>
      </div>
    </div>
  );
}
