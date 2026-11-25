import { DEFAULT_WHITE_PERSON_AVATAR } from '../../utils/avatarUtils';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { springTokens } from '../../utils/motion';
import VivuButton from '../common/VivuButton';

/**
 * UnifiedDynamicIsland - Đảo Nổi Công Nghệ Phong Cách F1 Dynamic Island
 * Giao diện Radar tối giản, trực quan, loại bỏ thanh trượt phức tạp
 * 100% Bootstrap Icons (Rule 5), Rule 7 (< 450 dòng)
 */
export default function UnifiedDynamicIsland({
  radarDistance = 5.0,
  onSelectRadarDistance,
  onAdjustingRadius,
  isScanning = false,
  onTriggerScan,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  friendsCount = 0,
  pendingFriendRequestsCount = 0,
  onOpenFriends,
  resultsCount = 0,
  activeAlert = null,
  onDismissAlert
}) {
  const [isRadarDropdownOpen, setIsRadarDropdownOpen] = useState(false);

  // 4 khoảng cách tinh gọn, dễ chạm nhất
  const RADAR_PRESETS = [
    { label: '1 km', value: 1.0, desc: 'Lân cận' },
    { label: '3 km', value: 3.0, desc: 'Khu vực' },
    { label: '5 km', value: 5.0, desc: 'Mặc định' },
    { label: 'Tất cả', value: 'all', desc: 'Toàn thành' },
  ];

  const currentDisplayDistance = radarDistance === 'all' 
    ? 'Tất cả' 
    : `${radarDistance} km`;

  return (
    <div className="fixed top-[max(0.75rem,calc(env(safe-area-inset-top,0px)+0.5rem))] left-[104px] right-[58px] sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 sm:max-w-[92vw] select-none pointer-events-auto font-sans flex flex-col items-center">
      
      {/* 1. THÂN ĐẢO NỔI DYNAMIC ISLAND CHÍNH */}
      <motion.div
        layout
        transition={springTokens.dialog}
        className="relative flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-[rgba(18,20,30,0.92)] backdrop-blur-xl border border-white/15 shadow-[0_8px_30px_rgba(0,0,0,0.6)] text-white text-xs z-20 max-w-full"
      >
        {/* Nút Thông Báo (Chuông) */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative p-1 rounded-full text-white/70 hover:text-white transition-colors cursor-pointer"
          title="Thông báo"
        >
          <i className="bi bi-bell-fill text-sm"></i>
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#FF2A85] text-white text-[9px] font-bold flex items-center justify-center">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          )}
        </button>

        <div className="w-[1px] h-3.5 bg-white/15" />

        {/* Nút Radar Chính: Nhấn để mở bộ chọn khoảng cách tinh gọn */}
        <button
          type="button"
          onClick={() => {
            setIsRadarDropdownOpen(prev => !prev);
            onAdjustingRadius?.(!isRadarDropdownOpen);
          }}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer group"
          title="Điều chỉnh khoảng cách quét Radar"
        >
          <span className="relative flex h-2 w-2">
            {isScanning && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2A85] opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isScanning ? 'bg-[#FF2A85]' : 'bg-[#00FF66]'}`}></span>
          </span>

          <i className={`bi bi-radar text-xs ${isScanning ? 'animate-spin text-[#FF2A85]' : 'text-white/80'}`}></i>
          
          <span className="font-bold tracking-tight text-white font-mono text-xs">
            {currentDisplayDistance}
          </span>

          <i className={`bi bi-chevron-down text-[10px] text-white/50 transition-transform duration-200 ${isRadarDropdownOpen ? 'rotate-180' : ''}`}></i>
        </button>

        <div className="w-[1px] h-3.5 bg-white/15" />

        {/* Nút Bạn Bè / Kết Nối */}
        <button
          type="button"
          onClick={onOpenFriends}
          className="relative flex items-center gap-1 px-1.5 py-0.5 rounded-full text-white/70 hover:text-white transition-colors cursor-pointer"
          title="Bạn bè & Yêu cầu kết nối"
        >
          <i className="bi bi-people-fill text-xs text-[#00E5FF]"></i>
          <span className="text-[11px] font-medium font-mono">{friendsCount}</span>
          {pendingFriendRequestsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse"></span>
          )}
        </button>
      </motion.div>

      {/* 2. DROPDOWN RADAR TINH GỌN (CHỌN 1 CHẠM & BÁO KẾT QUẢ) */}
      <AnimatePresence>
        {isRadarDropdownOpen && (
          <>
            {/* Lớp phủ click ngoài */}
            <div 
              className="fixed inset-0 z-40 bg-transparent"
              onClick={() => {
                setIsRadarDropdownOpen(false);
                onAdjustingRadius?.(false);
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 6, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={springTokens.pop}
              className="relative z-50 w-72 sm:w-80 bg-[rgba(18,20,30,0.96)] backdrop-blur-2xl rounded-2xl p-4 shadow-[0_16px_40px_rgba(0,0,0,0.85)] border border-white/15 space-y-3 mt-1 text-white"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FF2A85]/15 border border-[#FF2A85]/30 text-[#FF2A85] flex items-center justify-center text-xs">
                    <i className="bi bi-broadcast-pin"></i>
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-white tracking-tight">
                      Khoảng Cách Quét
                    </div>
                    <div className="text-[10px] text-white/50">
                      Tự động quét người dùng &amp; bài đăng
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-[#FF2A85]/20 border border-[#FF2A85]/30 text-[#FF2A85] text-[10px] font-mono font-bold">
                    {currentDisplayDistance}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRadarDropdownOpen(false);
                      onAdjustingRadius?.(false);
                    }}
                    className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              </div>

              {/* Trạng thái quét & Kết quả tìm thấy trực quan */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isScanning ? (
                    <>
                      <i className="bi bi-arrow-repeat animate-spin text-[#FF2A85] text-sm"></i>
                      <span className="text-white/80 font-medium text-[11px]">Đang cập nhật radar...</span>
                    </>
                  ) : resultsCount > 0 ? (
                    <>
                      <i className="bi bi-geo-alt-fill text-[#00FF66] text-sm"></i>
                      <span className="text-white font-semibold text-[11px]">
                        Tìm thấy <strong className="text-[#00E5FF] font-mono">{resultsCount}</strong> người lân cận
                      </span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-info-circle text-amber-400 text-sm"></i>
                      <span className="text-white/70 text-[11px]">Chưa có ai trong bán kính này</span>
                    </>
                  )}
                </div>
                {!isScanning && (
                  <span className="text-[10px] font-mono text-white/40">Realtime</span>
                )}
              </div>

              {/* 4 Nút Chọn Khoảng Cách 1 Chạm (Gọn gàng & Trực quan) */}
              <div className="grid grid-cols-4 gap-1.5">
                {RADAR_PRESETS.map((preset) => {
                  const isSelected = String(radarDistance) === String(preset.value);
                  return (
                    <button
                      key={String(preset.value)}
                      type="button"
                      onClick={() => {
                        onSelectRadarDistance?.(preset.value);
                        onAdjustingRadius?.(false);
                      }}
                      className={`py-2 px-1 rounded-xl text-center border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FF2A85] border-[#FF2A85] text-white font-black shadow-[0_0_12px_rgba(255,42,133,0.4)]'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white'
                      }`}
                    >
                      <div className="text-[11px] font-bold leading-tight">{preset.label}</div>
                      <div className={`text-[9px] leading-tight mt-0.5 ${isSelected ? 'text-white/90' : 'text-white/40'}`}>
                        {preset.desc}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Nút quét lại nhanh */}
              {onTriggerScan && (
                <button
                  type="button"
                  onClick={() => {
                    onTriggerScan();
                  }}
                  disabled={isScanning}
                  className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <i className={`bi bi-arrow-clockwise ${isScanning ? 'animate-spin' : ''}`}></i>
                  <span>{isScanning ? 'Đang quét...' : 'Quét lại vùng lân cận'}</span>
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
