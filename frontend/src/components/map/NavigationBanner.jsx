import React from 'react';
import { calculateHaversineMeters, formatExactDistance, formatDurationSeconds } from '../../utils/mapNavigationUtils';

/**
 * NavigationBanner - Banner dẫn đường nội bộ trên Map khi kích hoạt tính năng Chỉ Đường
 * Thiết kế chuẩn Design System VIVU: Nền trắng, viền #D8E3E7, màu điều hướng #0A8395, bóng đổ nhẹ
 * 100% Zero External Maps (Rule T1.07), 100% Bootstrap Icons (Rule 5), < 180 dòng (Rule 7)
 */
export default function NavigationBanner({
  navTarget,
  userLat,
  userLng,
  userSpeed = 0,
  routeInfo = null,
  travelMode = 'driving',
  onToggleTravelMode,
  onFitRoute,
  onClose
}) {
  if (!navTarget) return null;

  const targetTitle = navTarget.title || navTarget.name || 'Điểm đến trên bản đồ';
  const targetAddress = navTarget.address || (navTarget.lat ? `${Number(navTarget.lat).toFixed(4)}°N, ${Number(navTarget.lng).toFixed(4)}°E` : 'Đang điều hướng');

  const parsedStartLat = Number(userLat ?? navTarget.userLat);
  const parsedStartLng = Number(userLng ?? navTarget.userLng);
  const parsedTargetLat = Number(navTarget.realLat ?? navTarget.lat);
  const parsedTargetLng = Number(navTarget.realLng ?? navTarget.lng);

  // Khoảng cách thực tế ưu tiên từ OSRM routeInfo, nếu chưa có thì tính tức thời Haversine
  const calculatedMeters = routeInfo?.distanceMeters ?? calculateHaversineMeters(parsedStartLat, parsedStartLng, parsedTargetLat, parsedTargetLng);
  const distanceDisplay = routeInfo?.distanceText || formatExactDistance(calculatedMeters);
  const durationDisplay = formatDurationSeconds(routeInfo?.durationSeconds ?? (travelMode === 'foot' ? Math.round(calculatedMeters / 1.2) : Math.round(calculatedMeters / 8.3)));

  // Tốc độ di chuyển thực tế: ưu tiên tốc độ người gửi nếu đang dẫn đường tới peer chia sẻ vị trí
  const isTrackingPeer = Boolean(navTarget?.targetUserId || (navTarget?.speed != null && !isNaN(Number(navTarget.speed))));
  const effectiveSpeed = isTrackingPeer
    ? Number(navTarget?.speed ?? 0)
    : Number(userSpeed ?? 0);
  const speedLabel = isTrackingPeer ? 'Tốc độ người gửi:' : 'Tốc độ của bạn:';

  const handleFit = () => {
    if (onFitRoute) {
      onFitRoute();
    } else if (typeof window !== 'undefined' && typeof window.__vivu_fit_nav_route === 'function') {
      window.__vivu_fit_nav_route();
    }
  };

  return (
    <div className="fixed top-[68px] sm:top-[76px] left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md bg-white text-[#14252E] border border-[#D8E3E7] rounded-3xl p-3.5 sm:p-4 shadow-[0_12px_36px_rgba(20,37,46,0.16)] select-none font-sans animate-in slide-in-from-top-4 duration-250">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* VIVU Navigation Brand Icon */}
          <div className="w-11 h-11 rounded-2xl bg-[#0A8395] text-white flex items-center justify-center font-bold text-lg shadow-[0_0_16px_rgba(10,131,149,0.35)] shrink-0">
            <i className="bi bi-cursor-fill rotate-45 text-base"></i>
          </div>

          <div className="min-w-0">
            <div className="text-sm font-bold text-[#14252E] flex items-center gap-2 flex-wrap">
              <span className="text-[#0A8395]">Đang dẫn đường</span>
              <span className="text-xs font-bold text-[#0A8395] px-2 py-0.5 rounded-full bg-[#0A8395]/10 border border-[#0A8395]/20 font-mono">
                {distanceDisplay}
              </span>
              <span className="text-[11px] font-semibold text-[#52646D]">
                • {durationDisplay}
              </span>
            </div>

            <div className="text-xs text-[#14252E] font-bold truncate max-w-[220px] mt-0.5">
              Tới: {targetTitle}
            </div>

            <div className="text-[10px] text-[#52646D] truncate max-w-[220px]">
              {targetAddress}
            </div>
          </div>
        </div>

        {/* Nút đóng nhanh góc trên */}
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-xl bg-[#F8FAFB] hover:bg-[#EEF3F5] text-[#52646D] hover:text-[#14252E] flex items-center justify-center transition-all active:scale-95 shrink-0 cursor-pointer border border-[#D8E3E7]"
          title="Kết thúc chỉ đường"
        >
          <i className="bi bi-x-lg text-xs"></i>
        </button>
      </div>

      {/* Thanh thông số thời gian thực: Tốc độ di chuyển & Chuyển đổi phương tiện */}
      <div className="mt-3 pt-2.5 border-t border-[#D8E3E7] flex items-center justify-between gap-2 text-xs">
        {/* Huy hiệu Tốc độ di chuyển thực tế */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#F8FAFB] border border-[#D8E3E7]">
          <i className="bi bi-speedometer2 text-[#0A8395] text-sm"></i>
          <span className="text-[11px] font-medium text-[#52646D]">{speedLabel}</span>
          <span className="text-xs font-bold font-mono text-[#14252E]">
            {effectiveSpeed > 0 ? `${Math.round(effectiveSpeed)} km/h` : 'Đang dừng'}
          </span>
        </div>

        {/* Chuyển đổi chế độ Xe cộ / Đi bộ */}
        {onToggleTravelMode && (
          <button
            type="button"
            onClick={onToggleTravelMode}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#F8FAFB] hover:bg-[#EEF3F5] border border-[#D8E3E7] text-[#14252E] font-medium text-[11px] transition-all cursor-pointer active:scale-95"
            title="Đổi chế độ di chuyển"
          >
            <i className={`bi ${travelMode === 'foot' ? 'bi-person-walking text-[#10FFA0]' : 'bi-car-front-fill text-[#0A8395]'}`}></i>
            <span>{travelMode === 'foot' ? 'Đi bộ' : 'Lái xe'}</span>
          </button>
        )}
      </div>

      {/* Thanh nút thao tác dẫn đường nội bộ (Zero External Links) */}
      <div className="mt-2.5 flex gap-2">
        <button
          type="button"
          onClick={handleFit}
          className="flex-1 py-2 bg-[#0A8395]/10 hover:bg-[#0A8395]/18 text-[#0A8395] rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-all border border-[#0A8395]/25 cursor-pointer active:scale-98"
        >
          <i className="bi bi-arrows-fullscreen text-[11px]"></i>
          <span>Bao quát tuyến đường</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-[#F8FAFB] hover:bg-[#EEF3F5] text-[#52646D] hover:text-[#14252E] border border-[#D8E3E7] rounded-xl text-xs font-semibold active:scale-95 transition-all cursor-pointer"
        >
          Kết thúc
        </button>
      </div>
    </div>
  );
}
