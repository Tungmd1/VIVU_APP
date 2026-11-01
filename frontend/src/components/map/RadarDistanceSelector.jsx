import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * RadarDistanceSelector - Thanh chọn bán kính quét Radar trên Map
 * Nâng cấp toàn diện theo chuẩn Animate-UI (Level: More)
 * Tích hợp Slider kéo mượt mà 0.5km - 15km kèm Preset 1 chạm & Vòng tròn địa lý Mapbox
 * Chuẩn Resend Dark Monochrome, 100% Bootstrap Icons
 */
export default function RadarDistanceSelector({
  selectedDistance = 3, // km (0.5 - 15) hoặc 'all'
  onSelectDistance,
  onAdjustingRadius,
  storiesCount = 0,
  isScanning = false,
  onTriggerScan,
  viewMode = 'social', // 'social' | 'friends'
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenMobileQr
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sliderVal, setSliderVal] = useState(selectedDistance === 'all' ? 15 : Number(selectedDistance) || 3);
  const [isDragging, setIsDragging] = useState(false);

  // Đồng bộ sliderVal khi selectedDistance từ ngoài thay đổi
  useEffect(() => {
    if (selectedDistance !== 'all' && typeof selectedDistance === 'number') {
      setSliderVal(selectedDistance);
    }
  }, [selectedDistance]);

  const DISTANCE_PRESETS = [
    { value: 1, label: '1 km' },
    { value: 3, label: '3 km' },
    { value: 5, label: '5 km' },
    { value: 10, label: '10 km' },
    { value: 'all', label: 'Toàn thành' }
  ];

  const displayDistance = selectedDistance === 'all' 
    ? 'Toàn thành' 
    : `${Number(selectedDistance).toFixed(1).replace('.0', '')} km`;

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    setSliderVal(val);
    if (!isDragging) {
      setIsDragging(true);
      onAdjustingRadius?.(true);
    }
    onSelectDistance(val);
  };

  const handleSliderRelease = () => {
    setIsDragging(false);
    onAdjustingRadius?.(false);
  };

  const handleSelectPreset = (val) => {
    if (val === 'all') {
      onSelectDistance('all');
    } else {
      setSliderVal(val);
      onSelectDistance(val);
    }
    onAdjustingRadius?.(false);
  };

  // Tính tỷ lệ fill của slider track (0.5km -> 15km)
  const sliderPercentage = Math.min(Math.max(((sliderVal - 0.5) / (15 - 0.5)) * 100, 0), 100);

  return (
    <div className="fixed top-4 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-40 pointer-events-auto select-none flex flex-col items-center gap-2">
      {/* Thanh chính: Header Pill */}
      <motion.div 
        layout
        className="w-full bg-[#0A0A0A]/95 backdrop-blur-2xl border border-white/10 rounded-full py-1.5 px-3 shadow-[0_8px_30px_rgba(0,0,0,0.8)] flex items-center justify-between text-white"
      >
        {/* Nút Radar Scanner Icon & Trạng thái */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={onTriggerScan}
          className="flex items-center gap-2 py-1 px-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all group cursor-pointer"
          title="Bấm để phát sóng quét radar tìm bài đăng hoặc bạn bè mới"
        >
          <div className="relative flex items-center justify-center">
            <i className={`bi bi-radar text-base text-sky-400 ${isScanning ? 'animate-spin text-white' : 'group-hover:rotate-45'} transition-transform`}></i>
            {isScanning && (
              <span className="absolute -inset-1 rounded-full bg-sky-400/40 animate-ping"></span>
            )}
          </div>
          <span className="text-[11px] font-medium tracking-wide">
            {isScanning ? 'Đang quét...' : (viewMode === 'friends' ? 'Radar Bạn Bè' : 'Radar Xã Hội')}
          </span>
        </motion.button>

        {/* Story Count Badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#8E8E93]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{storiesCount} {viewMode === 'friends' ? 'bạn bè' : 'bài đăng'}</span>
        </div>

        {/* Cụm Nút Điều Khiển */}
        <div className="flex items-center gap-1.5">
          {/* Nút Chọn Bán Kính */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-full font-semibold text-xs transition-all cursor-pointer ${
              isExpanded 
                ? 'bg-sky-400 text-black shadow-[0_0_15px_rgba(56,189,248,0.4)]' 
                : 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:bg-[#F2F2F2]'
            }`}
          >
            <i className="bi bi-geo-alt-fill text-[11px]"></i>
            <span>{displayDistance}</span>
            <i className={`bi bi-chevron-down text-[10px] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}></i>
          </motion.button>

          {/* Nút Chuông Thông Báo */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={onOpenNotifications}
            className="relative w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/10 cursor-pointer"
            title="Xem thông báo Radar"
          >
            <i className="bi bi-bell-fill text-xs text-white"></i>
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center border border-[#0A0A0A] shadow animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </motion.button>

          {/* Nút Kết Nối Điện Thoại (Mobile Link / QR) */}
          <motion.button
            type="button"
            id="btn-open-mobile-qr"
            whileTap={{ scale: 0.92 }}
            onClick={onOpenMobileQr}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/10 cursor-pointer"
            title="Kết nối ứng dụng với Điện thoại (Mobile LAN Link / QR)"
          >
            <i className="bi bi-phone-fill text-xs text-emerald-400"></i>
          </motion.button>
        </div>
      </motion.div>

      {/* Bảng điều khiển Bán Kính Radar Mở Rộng (Animate-UI: Spring & Blur) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, scale: 0.97, filter: 'blur(3px)' }}
            transition={{ type: 'spring', damping: 24, stiffness: 280, mass: 0.8 }}
            className="w-full bg-[#111111]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-3.5 shadow-[0_16px_50px_rgba(0,0,0,0.9)] space-y-3"
          >
            {/* Header Bảng */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs">
                  <i className="bi bi-broadcast-pin"></i>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white tracking-wide uppercase">
                    Bán kính quét địa lý
                  </div>
                  <div className="text-[10px] text-[#8E8E93]">
                    Vòng radar thực tế bao phủ trên Mapbox
                  </div>
                </div>
              </div>

              {/* Badge số km hiện tại */}
              <div className="px-2.5 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 font-mono text-xs font-bold shadow-xs">
                {displayDistance}
              </div>
            </div>

            {/* Slider Trượt Cự Ly (0.5km - 15km) */}
            <div className="space-y-1.5 px-1 pt-1">
              <div className="relative flex items-center">
                {/* Thanh Slider Input */}
                <input
                  type="range"
                  min="0.5"
                  max="15"
                  step="0.5"
                  value={selectedDistance === 'all' ? 15 : sliderVal}
                  onChange={handleSliderChange}
                  onMouseUp={handleSliderRelease}
                  onTouchEnd={handleSliderRelease}
                  disabled={selectedDistance === 'all'}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-all ${
                    selectedDistance === 'all' ? 'opacity-40 cursor-not-allowed bg-neutral-800' : 'bg-neutral-800'
                  }`}
                  style={{
                    background: selectedDistance === 'all' 
                      ? '#262626' 
                      : `linear-gradient(to right, #0284c7 0%, #38bdf8 ${sliderPercentage}%, #262626 ${sliderPercentage}%, #262626 100%)`
                  }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-[#8E8E93] font-mono px-0.5">
                <span>0.5 km</span>
                <span className="text-white/60">5.0 km</span>
                <span className="text-white/60">10.0 km</span>
                <span>15.0 km</span>
              </div>
            </div>

            {/* Các Mốc Preset Chọn Nhanh */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {DISTANCE_PRESETS.map((preset) => {
                const isSelected = selectedDistance === preset.value;
                return (
                  <motion.button
                    key={preset.value}
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleSelectPreset(preset.value)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-black font-extrabold shadow-[0_0_12px_rgba(255,255,255,0.35)] scale-[1.02]'
                        : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/5 hover:border-white/20'
                    }`}
                  >
                    {preset.label}
                  </motion.button>
                );
              })}
            </div>

            {/* Footer Trạng Thái & Số Lượng Trong Vùng Quét */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium truncate">
                <i className="bi bi-geo-alt text-xs"></i>
                <span>Tìm thấy {storiesCount} {viewMode === 'friends' ? 'bạn bè' : 'bài đăng'}</span>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="text-[11px] text-[#8E8E93] hover:text-white font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Thu gọn</span>
                <i className="bi bi-chevron-up text-[10px]"></i>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
