import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { springTokens } from '../../utils/motion';
import VivuButton from '../common/VivuButton';

/**
 * UnifiedDynamicIsland - Đảo Nổi Công Nghệ Phong Cách F1 Dynamic Island
 * docs/getdesign.md Quy chuẩn Lewis Hamilton / Silverstone F1 Hero
 * - Thân kính mờ F1 Glass rgba(20,20,30,0.85) với viền ánh kim border-white/10
 * - Bán kính Radar F1 Gold #EDB40B, số liệu Albert Sans tracking hẹp
 * - Dropdown kính mờ sang trọng với presets và thanh trượt F1 Gold
 * - 100% Bootstrap Icons, Rule 7 (< 450 dòng)
 */
export default function UnifiedDynamicIsland({
  radarDistance = 3.5,
  onSelectRadarDistance,
  onAdjustingRadius,
  isScanning = false,
  onTriggerScan,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  friendsCount = 0,
  pendingFriendRequestsCount = 0,
  onOpenFriends,
  activeAlert = null,
  onDismissAlert
}) {
  const [isRadarDropdownOpen, setIsRadarDropdownOpen] = useState(false);

  const RADAR_PRESETS = [
    { label: '500m', value: 0.5, desc: 'Đi bộ' },
    { label: '1km', value: 1.0, desc: 'Gần đây' },
    { label: '3.5km', value: 3.5, desc: 'Khu phố' },
    { label: '5km', value: 5.0, desc: 'Quận huyện' },
    { label: '10km', value: 10.0, desc: 'Toàn thành' },
    { label: 'Tất cả', value: 'all', desc: 'Không giới hạn' },
  ];

  const currentDisplayDistance = radarDistance === 'all' 
    ? 'Tất cả' 
    : `${radarDistance} km`;

  return (
    <div className="fixed top-[max(0.75rem,calc(env(safe-area-inset-top,0px)+0.5rem))] left-1/2 -translate-x-1/2 z-50 max-w-[96vw] select-none pointer-events-auto font-sans flex flex-col items-center">
      
      {/* 1. THÂN ĐẢO NỔI DYNAMIC ISLAND CHÍNH */}
      <motion.div
        layout
        transition={springTokens.dialog}
        className="relative rounded-full bg-[rgba(20,20,30,0.85)] text-white border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl p-1 transition-colors"
      >
        <AnimatePresence mode="wait">
          {activeAlert ? (
            /* TRẠNG THÁI NỞ TO RA CỦA DYNAMIC ISLAND (EXPANDED ALERT STATE) */
            <motion.div
              key="alert-expanded"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={springTokens.pop}
              onClick={activeAlert.onClick}
              className="w-[90vw] sm:w-[390px] px-3.5 py-2 flex items-center justify-between gap-3 cursor-pointer group"
            >
              {/* Bên trái: Avatar người gửi kèm chấm trạng thái */}
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 bg-white/5">
                  <img
                    src={activeAlert.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#FF2A85] border border-black shadow-xs" />
              </div>

              {/* Ở giữa: Tiêu đề, Nội dung & Badge phân loại */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate">
                    {activeAlert.title}
                  </span>
                  {activeAlert.badge && (
                    <span 
                      className="text-[10px] font-bold px-1.5 py-0.2 rounded-md font-mono shrink-0 bg-[#FF2A85]/20 text-[#FF2A85] border border-[#FF2A85]/40"
                    >
                      {activeAlert.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white/70 truncate mt-0.5">
                  {activeAlert.subtitle}
                </p>
              </div>

              {/* Bên phải: Nút Mở nhanh & Nút đóng */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="px-2.5 py-1 rounded-full bg-[#FF2A85] text-white font-bold text-[11px] shadow-[0_0_12px_rgba(255,42,133,0.4)] group-hover:bg-[#ff4598] transition-colors flex items-center gap-1">
                  <span>Xem</span>
                  <i className="bi bi-arrow-right text-[10px]"></i>
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    activeAlert.onDismiss?.();
                    onDismissAlert?.();
                  }}
                  className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Đóng thông báo"
                >
                  <i className="bi bi-x text-sm font-bold"></i>
                </button>
              </div>
            </motion.div>
          ) : (
            /* TRẠNG THÁI NGHỈ (IDLE COMPACT STATE) */
            <motion.div
              key="idle-compact"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={springTokens.pop}
              className="rounded-full px-2 py-0.5 flex items-center gap-1.5 sm:gap-2"
            >
              {/* 1. DROPDOWN BÁN KÍNH RADAR (BOOTSTRAP BTN-OUTLINE-PRIMARY) */}
              <button
                type="button"
                onClick={() => {
                  const nextState = !isRadarDropdownOpen;
                  setIsRadarDropdownOpen(nextState);
                  onAdjustingRadius?.(nextState);
                }}
                className={`btn btn-sm rounded-pill transition-all cursor-pointer group ${
                  isRadarDropdownOpen
                    ? 'btn-primary btn-glow'
                    : 'btn-outline-primary'
                }`}
                title="Bấm để chọn cự ly quét radar"
              >
                <i className={`bi bi-broadcast-pin text-xs ${isRadarDropdownOpen ? 'text-white' : 'text-[#FF2A85]'}`}></i>
                <span className="text-[12px] font-bold font-mono tracking-tight">
                  {currentDisplayDistance}
                </span>
                <i className={`bi bi-chevron-down text-[9px] transition-transform duration-150 ${
                  isRadarDropdownOpen ? 'rotate-180 text-white' : 'text-[#FF2A85]'
                }`}></i>
              </button>

              {/* DẢI PHÂN CÁCH NHẸ */}
              <div className="w-[1px] h-3.5 bg-white/15" />

              {/* 2. NÚT BẠN BÈ LÂN CẬN (BOOTSTRAP BTN-SECONDARY) */}
              <button
                type="button"
                onClick={onOpenFriends}
                className="btn btn-sm btn-secondary rounded-pill gap-1.5 transition-all cursor-pointer"
                title="Mở danh sách Bạn bè"
              >
                <i className="bi bi-people-fill text-xs text-[#00E5FF]"></i>
                <span className="text-[12px] font-bold font-mono text-white">
                  {friendsCount}
                </span>
                {pendingFriendRequestsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#FF2A85] text-white text-[9px] font-mono font-bold shadow-[0_0_8px_#FF2A85]">
                    +{pendingFriendRequestsCount}
                  </span>
                )}
              </button>

              {/* DẢI PHÂN CÁCH NHẸ */}
              <div className="w-[1px] h-3.5 bg-white/15" />

              {/* 3. CHUÔNG THÔNG BÁO (BOOTSTRAP BTN-SECONDARY) */}
              <button
                type="button"
                onClick={onOpenNotifications}
                className="btn btn-sm btn-secondary rounded-full w-7 h-7 p-0 relative flex items-center justify-center text-white transition-colors cursor-pointer"
                title="Mở danh sách thông báo"
              >
                <i className="bi bi-bell-fill text-xs text-white/80"></i>
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-[#E10600] border border-black" />
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 2. BẢNG ĐIỀU KHIỂN CỰ LY RADAR MỞ RỘNG (F1 GLASS CARD) */}
      <AnimatePresence>
        {isRadarDropdownOpen && (
          <>
            {/* Backdrop trong suốt chạm ra ngoài để đóng */}
            <div 
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs" 
              onClick={() => {
                setIsRadarDropdownOpen(false);
                onAdjustingRadius?.(false);
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 6, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={springTokens.pop}
              className="relative z-50 w-72 sm:w-80 bg-[rgba(20,20,30,0.92)] backdrop-blur-2xl rounded-2xl p-4 shadow-[0_16px_40px_rgba(0,0,0,0.8)] border border-white/15 space-y-3 mt-1 text-white"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FF2A85]/15 border border-[#FF2A85]/30 text-[#FF2A85] flex items-center justify-center text-xs">
                    <i className="bi bi-broadcast-pin"></i>
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-white tracking-tight">
                      Bán kính quét Radar
                    </div>
                    <div className="text-[11px] text-white/60">
                      Lọc bài đăng &amp; bạn bè lân cận
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-[#FF2A85]/20 border border-[#FF2A85]/30 text-[#FF2A85] text-[11px] font-mono font-bold">
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

              {/* Slider cự ly liên tục */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] text-white/60 font-medium px-0.5">
                  <span>0.5 km (Đi bộ)</span>
                  <span className="text-[#FF2A85] font-bold font-mono">{currentDisplayDistance}</span>
                  <span>15 km (Toàn thành)</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="15.0"
                  step="0.5"
                  value={radarDistance === 'all' ? 15.0 : Number(radarDistance)}
                  onMouseDown={() => onAdjustingRadius?.(true)}
                  onTouchStart={() => onAdjustingRadius?.(true)}
                  onMouseUp={() => onAdjustingRadius?.(false)}
                  onTouchEnd={() => onAdjustingRadius?.(false)}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    onSelectRadarDistance?.(val);
                  }}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FF2A85]"
                />
              </div>

              {/* Lưới presets 1 chạm */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
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
                          ? 'bg-[#FF2A85] border-[#FF2A85] text-white font-black shadow-[0_0_14px_rgba(255,42,133,0.45)]'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white'
                      }`}
                    >
                      <div className="text-[11px] font-bold leading-tight">{preset.label}</div>
                      <div className={`text-[10px] leading-tight mt-0.5 ${isSelected ? 'text-white/90' : 'text-white/40'}`}>{preset.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Nút kích hoạt phát sóng quét Radar (Bootstrap VivuButton) */}
              {onTriggerScan && (
                <VivuButton
                  variant="primary"
                  size="md"
                  pill={true}
                  glow={true}
                  loading={isScanning}
                  icon={!isScanning ? "bi-radar" : null}
                  onClick={() => {
                    onTriggerScan();
                    setIsRadarDropdownOpen(false);
                    onAdjustingRadius?.(false);
                  }}
                  disabled={isScanning}
                  className="w-full text-xs font-bold"
                >
                  {isScanning ? 'Đang phát sóng quét...' : 'Phát sóng quét Radar ngay'}
                </VivuButton>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
