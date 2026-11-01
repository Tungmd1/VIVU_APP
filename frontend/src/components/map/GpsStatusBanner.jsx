import React, { useState, useEffect } from 'react';

/**
 * GpsStatusBanner - Chip Thông Báo Vị Trí GPS Chuẩn VIVU
 * - Nền trắng #FFFFFF, viền #D8E3E7, chữ #14252E, điểm nhấn #0A8395
 * - Hiển thị vị trí đã xác thực hoặc trạng thái đang dò tìm
 */
export default function GpsStatusBanner({
  locationSource,
  cityName,
  isFallback,
  onRequestGps,
  onFetchIp,
  onSelectOnMap,
  isScanning = false
}) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Tự động ẩn sau 8s khi vị trí đã xác thực qua GPS thật hoặc đã chủ động đặt thủ công
  useEffect(() => {
    if (locationSource === 'gps' || locationSource === 'manual') {
      const timer = setTimeout(() => setIsDismissed(true), 8000);
      return () => clearTimeout(timer);
    } else {
      setIsDismissed(false);
    }
  }, [locationSource, isFallback]);

  if (isDismissed) return null;

  const isConfirmedLocation = !isFallback && (locationSource === 'gps' || locationSource === 'storage' || locationSource === 'manual' || Boolean(cityName));

  return (
    <div className="fixed left-3.5 bottom-24 z-30 max-w-[calc(100vw-6rem)] sm:max-w-xs animate-in slide-in-from-bottom-2 duration-250 pointer-events-auto select-none font-sans">
      <div className="p-1.5 pr-2.5 rounded-xl bg-white text-[#14252E] border border-[#D8E3E7] flex items-center gap-2 shadow-[0_2px_8px_rgba(20,37,46,0.06)] transition-all">
        
        {/* Location Icon */}
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
          isConfirmedLocation ? 'bg-[#0A8395]/10 border border-[#0A8395]/20 text-[#0A8395]' : 'bg-[#F8FAFB] text-[#7E909A]'
        }`}>
          <i className={`bi ${isConfirmedLocation ? 'bi-geo-alt-fill text-xs' : 'bi-crosshair text-xs animate-spin'}`}></i>
        </div>

        {/* City / GPS Label */}
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-semibold text-[#14252E] truncate max-w-[140px]">
            {isConfirmedLocation ? (cityName || 'Vị trí của Bạn') : 'Đang tìm vệ tinh GPS...'}
          </div>
        </div>

        {/* Nút dò lại GPS */}
        <button
          type="button"
          onClick={onRequestGps}
          disabled={isScanning}
          className="px-2 py-0.5 rounded-md bg-[#0A8395]/10 hover:bg-[#0A8395]/18 text-[#0A8395] text-[10px] font-bold font-mono flex items-center gap-1 border border-[#0A8395]/20 active:scale-95 transition-all cursor-pointer shrink-0"
          title="Làm mới tín hiệu GPS"
        >
          <i className={`bi bi-arrow-clockwise text-[10px] ${isScanning ? 'animate-spin' : ''}`}></i>
          <span>{isScanning ? 'Dò...' : 'GPS'}</span>
        </button>

        {/* Nút đóng */}
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="w-5 h-5 rounded-md bg-[#F8FAFB] hover:bg-[#EEF3F5] text-[#7E909A] hover:text-[#14252E] flex items-center justify-center text-xs transition-colors cursor-pointer shrink-0"
          title="Đóng thông báo"
        >
          <i className="bi bi-x"></i>
        </button>
      </div>
    </div>
  );
}
