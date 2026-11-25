import React, { useState, useEffect } from 'react';

/**
 * GpsStatusBanner - Chip Thông Báo Vị Trí GPS & Điều Khiển Chia Sẻ Trực Tiếp Chuẩn VIVU
 * - Nền trắng #FFFFFF, viền #D8E3E7, chữ #14252E, điểm nhấn #0A8395
 * - Hiển thị độ chính xác GPS theo mét (±Xm) và thời gian cập nhật gần nhất
 * - Hỗ trợ nút Bắt đầu / Dừng chia sẻ vị trí tức thì
 */
export default function GpsStatusBanner({
  locationSource,
  cityName,
  isFallback,
  onRequestGps,
  isScanning = false,
  location,
  isSharing = true,
  onToggleSharing
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [relativeTimeText, setRelativeTimeText] = useState('Vừa xong');

  // Cập nhật nhãn thời gian tương đối liên tục
  useEffect(() => {
    const updateTime = () => {
      const ts = location?.timestamp;
      if (!ts) {
        setRelativeTimeText('Vừa xong');
        return;
      }
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - ts) / 1000));
      if (diffSec < 5) {
        setRelativeTimeText('Vừa xong');
      } else if (diffSec < 60) {
        setRelativeTimeText(`${diffSec}s trước`);
      } else if (diffSec < 3600) {
        setRelativeTimeText(`${Math.floor(diffSec / 60)}p trước`);
      } else {
        setRelativeTimeText(`${Math.floor(diffSec / 3600)}h trước`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 2000);
    return () => clearInterval(interval);
  }, [location?.timestamp]);

  const isConfirmedLocation = !isFallback && (locationSource === 'gps' || locationSource === 'storage' || locationSource === 'manual' || Boolean(cityName));
  const accuracyMeters = location?.accuracy != null ? Math.round(location.accuracy) : null;

  // Trạng thái thu gọn (minimized capsule)
  if (isMinimized) {
    return (
      <div className="fixed left-3.5 bottom-[104px] sm:bottom-24 z-30 pointer-events-auto select-none font-sans animate-in fade-in duration-200">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="px-2.5 py-1.5 rounded-xl bg-white/95 hover:bg-white text-[#14252E] border border-[#D8E3E7] shadow-[0_4px_12px_rgba(20,37,46,0.1)] flex items-center gap-1.5 text-xs font-semibold backdrop-blur-md active:scale-95 transition-all cursor-pointer"
          title="Mở rộng bảng điều khiển vị trí"
        >
          <span className={`w-2 h-2 rounded-full ${isSharing ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
          <i className="bi bi-geo-alt-fill text-[#0A8395] text-xs"></i>
          {accuracyMeters != null && (
            <span className="text-[11px] font-mono font-medium text-[#52646D]">±{accuracyMeters}m</span>
          )}
          <span className="text-[10px] text-[#0A8395] ml-0.5">
            {isSharing ? 'Đang phát' : 'Đã dừng'}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed left-3.5 bottom-[104px] sm:bottom-24 z-30 max-w-[calc(100vw-5rem)] sm:max-w-sm animate-in slide-in-from-bottom-2 duration-250 pointer-events-auto select-none font-sans">
      <div className="p-2.5 rounded-2xl bg-white text-[#14252E] border border-[#D8E3E7] shadow-[0_4px_16px_rgba(20,37,46,0.12)] transition-all">
        
        {/* Hàng 1: Trạng thái GPS, Độ chính xác & Thời gian */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Location Icon with pulsing indicator */}
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 relative ${
              isConfirmedLocation ? 'bg-[#0A8395]/10 border border-[#0A8395]/20 text-[#0A8395]' : 'bg-[#F8FAFB] text-[#7E909A]'
            }`}>
              <i className={`bi ${isConfirmedLocation ? 'bi-geo-alt-fill text-xs' : 'bi-crosshair text-xs animate-spin'}`}></i>
              <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
                isSharing ? 'bg-emerald-500' : 'bg-rose-500'
              }`}></span>
            </div>

            {/* Thông tin vị trí & thời gian cập nhật */}
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#14252E] truncate max-w-[150px] sm:max-w-[180px]">
                {isConfirmedLocation ? (cityName || 'Vị trí của Bạn') : 'Đang tìm vệ tinh GPS...'}
              </div>
              <div className="text-[10px] text-[#52646D] flex items-center gap-1.5 font-medium">
                {accuracyMeters != null && (
                  <span className="font-mono text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200/60">
                    ±{accuracyMeters}m
                  </span>
                )}
                <span className="truncate">Cập nhật: {relativeTimeText}</span>
              </div>
            </div>
          </div>

          {/* Nút thu nhỏ */}
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="w-6 h-6 rounded-lg bg-[#F8FAFB] hover:bg-[#EEF3F5] text-[#7E909A] hover:text-[#14252E] flex items-center justify-center text-xs transition-colors cursor-pointer shrink-0"
            title="Thu nhỏ thanh trạng thái"
            aria-label="Thu nhỏ thanh trạng thái"
          >
            <i className="bi bi-chevron-down"></i>
          </button>
        </div>

        {/* Hàng 2: Nút điều khiển - Bắt đầu / Dừng chia sẻ & Dò lại GPS */}
        <div className="mt-2 pt-2 border-t border-[#D8E3E7]/80 flex items-center justify-between gap-2">
          {/* Nút Bắt đầu / Dừng chia sẻ */}
          {onToggleSharing && (
            <button
              type="button"
              onClick={onToggleSharing}
              className={`flex-1 py-1 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                isSharing
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 shadow-xs'
                  : 'bg-[#0A8395] hover:bg-[#086a7a] text-white shadow-sm'
              }`}
              title={isSharing ? "Dừng chia sẻ vị trí của bạn ngay lập tức" : "Bắt đầu phát sóng vị trí của bạn lên máy chủ"}
            >
              <i className={`bi ${isSharing ? 'bi-stop-circle-fill text-xs' : 'bi-broadcast text-xs'}`}></i>
              <span>{isSharing ? 'Dừng chia sẻ' : 'Bắt đầu chia sẻ'}</span>
            </button>
          )}

          {/* Nút Dò lại GPS */}
          <button
            type="button"
            onClick={onRequestGps}
            disabled={isScanning}
            className="px-2.5 py-1 rounded-xl bg-[#F8FAFB] hover:bg-[#EEF3F5] text-[#0A8395] text-xs font-semibold font-mono flex items-center gap-1 border border-[#D8E3E7] active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-50"
            title="Dò lại vệ tinh GPS"
          >
            <i className={`bi bi-arrow-clockwise text-xs ${isScanning ? 'animate-spin' : ''}`}></i>
            <span>{isScanning ? 'Dò...' : 'GPS'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
