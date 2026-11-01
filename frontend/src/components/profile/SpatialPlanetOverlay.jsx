import React from 'react';
import { motion } from 'motion/react';
import VivuButton from '../common/VivuButton';
import { triggerCyberSplash } from '../../utils/cyberSplash';

/**
 * SpatialPlanetOverlay - Bảng Điều Khiển Hologram Tương Tác Trong Không Gian 3D
 * Hiển thị chi tiết khi camera 3D bay cận cảnh vào từng hành tinh thiên thể
 * Tuân thủ Rule 5 (100% Bootstrap Icons), Rule 7 (< 450 dòng), Rule 11 (GPS an toàn)
 */
export default function SpatialPlanetOverlay({
  focusedPlanet,
  onClose,
  user,
  userCode,
  location,
  photos = [],
  activePhotoIndex = 0,
  setActivePhotoIndex,
  onAddPhoto,
  onRemovePhoto,
  places = [],
  onRatePlace,
  onToggleVisitedPlace,
  onStartNavigation,
  onOpenEditProfile,
  onOpenSettings,
  onLogout,
  fileInputRef,
  isPlayingAnthem,
  onToggleAnthem,
  currentSongTitle,
  tasteBadges = [],
  batteryLevel = 88,
  isCharging = false
}) {
  if (!focusedPlanet) return null;

  const safeLat = Number(location?.lat ?? location?.latitude ?? 16.0544);
  const safeLng = Number(location?.lng ?? location?.longitude ?? 108.2022);
  const userAvatar = photos[0] || user?.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250';
  const userName = user?.user_metadata?.full_name || 'Nhà thám hiểm VIVU';

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-end sm:items-center justify-center p-3 sm:p-6 font-sans select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto no-scrollbar pointer-events-auto rounded-3xl bg-[rgba(10,18,32,0.92)] border border-[#00E5FF]/40 text-white shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl p-5 space-y-4"
      >
        {/* THANH ĐỈNH CỦA BẢNG HOLOGRAM */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF2A85] to-[#00E5FF] p-0.5 shadow-[0_0_12px_rgba(255,42,133,0.5)]">
              <div className="w-full h-full rounded-full bg-[#0a1220] flex items-center justify-center text-xs text-white">
                <i className={
                  focusedPlanet === 'core' ? 'bi bi-person-bounding-box' :
                  focusedPlanet === 'places' ? 'bi bi-geo-alt-fill text-[#00E5FF]' :
                  focusedPlanet === 'music' ? 'bi bi-disc-fill text-[#FF2A85]' :
                  focusedPlanet === 'photos' ? 'bi bi-images text-[#10FFA0]' :
                  focusedPlanet === 'telemetry' ? 'bi bi-broadcast text-[#00E5FF]' :
                  'bi bi-trophy-fill text-[#FFD700]'
                }></i>
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base font-display tracking-tight text-white flex items-center gap-2">
                <span>{
                  focusedPlanet === 'core' ? 'Tâm Điểm Bản Sắc (Avatar Core)' :
                  focusedPlanet === 'places' ? 'Hành Tinh Địa Điểm & Tọa Độ Gu' :
                  focusedPlanet === 'music' ? 'Hành Tinh Đĩa Than Âm Nhạc' :
                  focusedPlanet === 'photos' ? 'Hành Tinh Kho Ảnh Không Gian' :
                  focusedPlanet === 'telemetry' ? 'Cảm Biến Telemetry Không Gian' :
                  'Hành Tinh Tước Hiệu Hộ Chiếu'
                }</span>
              </h3>
              <span className="text-[10px] text-white/60 font-mono">Trạm Hologram • Quỹ Đạo VIVU 3D</span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => { triggerCyberSplash(e); onClose(); }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border border-white/15"
            title="Quay về góc nhìn vũ trụ"
          >
            <i className="bi bi-x-lg text-xs"></i>
          </button>
        </div>

        {/* NỘI DUNG 1: TÂM ĐIỂM BẢN SẮC (AVATAR CORE) */}
        {focusedPlanet === 'core' && (
          <div className="space-y-4 text-center">
            <div className="relative w-24 h-24 mx-auto rounded-full p-1 bg-gradient-to-tr from-[#FF2A85] via-[#FF539A] to-[#00E5FF] shadow-[0_0_30px_rgba(255,42,133,0.6)]">
              <img src={userAvatar} alt="" className="w-full h-full rounded-full object-cover border-2 border-[#0a1220]" />
              <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#10FFA0] border-2 border-[#0a1220] shadow-[0_0_8px_#10FFA0]" />
            </div>

            <div>
              <h4 className="font-black text-lg text-white font-display">{userName}</h4>
              <div className="text-xs text-[#00E5FF] font-mono font-bold mt-0.5">{userCode}</div>
              <p className="text-xs text-white/70 italic mt-2 px-4">
                "{user?.user_metadata?.bio || 'Đang khám phá vũ trụ không gian cùng những người bạn kề bên...'}"
              </p>
            </div>

            <div className="pt-2 flex gap-2">
              <VivuButton
                variant="secondary"
                pill={true}
                className="flex-1 font-bold text-xs"
                onClick={(e) => { triggerCyberSplash(e); onOpenEditProfile?.(); }}
                icon="bi-pencil"
              >
                Chỉnh sửa hồ sơ
              </VivuButton>
              <VivuButton
                variant="outline-secondary"
                pill={true}
                className="px-4 font-bold text-xs"
                onClick={(e) => { triggerCyberSplash(e); onOpenSettings?.(); }}
                icon="bi-gear-fill"
              >
                Cài đặt
              </VivuButton>
            </div>
          </div>
        )}

        {/* NỘI DUNG 2: HÀNH TINH ĐỊA ĐIỂM & GU SỐNG (PLACES & STARS) */}
        {focusedPlanet === 'places' && (
          <div className="space-y-3">
            <div className="text-xs text-white/70 flex items-center justify-between">
              <span>Địa điểm đã check-in ({places.filter(p => p.visited).length})</span>
              <span className="text-[#00E5FF] font-mono text-[10px]">Chạm sao để chấm điểm ⭐</span>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto no-scrollbar pr-1">
              {places.map(place => (
                <div 
                  key={place.id}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00E5FF]/50 transition-all flex items-center gap-3 group"
                >
                  <img src={place.photo} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/20" />
                  
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className="font-bold text-xs text-white truncate group-hover:text-[#00E5FF] transition-colors">{place.name}</h5>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#FF2A85]/20 text-[#FF2A85] border border-[#FF2A85]/30 font-bold shrink-0">
                        {place.categoryLabel}
                      </span>
                    </div>

                    <p className="text-[10px] text-white/60 line-clamp-1 mt-0.5">{place.review}</p>

                    <div className="flex items-center justify-between pt-1">
                      {/* Chấm sao trực tiếp */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={(e) => onRatePlace?.(place.id, star, e)}
                            className="text-xs transition-transform hover:scale-125 cursor-pointer"
                          >
                            <i className={`bi ${star <= place.rating ? 'bi-star-fill text-[#FFD700]' : 'bi-star text-white/20'}`} />
                          </button>
                        ))}
                      </div>

                      {/* Nút Dẫn đường Map VIVU */}
                      <VivuButton
                        size="sm"
                        variant="primary"
                        pill={true}
                        icon="bi-cursor-fill"
                        className="text-[10px] py-0.5 px-2.5 shadow-xs"
                        onClick={(e) => {
                          triggerCyberSplash(e);
                          onStartNavigation?.(place);
                        }}
                      >
                        Đến đây
                      </VivuButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NỘI DUNG 3: HÀNH TINH ĐĨA THAN ÂM NHẠC (ANTHEM VINYL) */}
        {focusedPlanet === 'music' && (
          <div className="space-y-4 text-center py-2">
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              {/* Vành đĩa than xoay tròn */}
              <div className={`w-full h-full rounded-full bg-gradient-to-tr from-[#111] via-[#222] to-[#0a0a0a] border-4 border-[#333] shadow-[0_0_30px_rgba(255,42,133,0.5)] flex items-center justify-center ${isPlayingAnthem ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }}>
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FF2A85] to-[#FF539A] p-1 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </div>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[#00E5FF] font-mono uppercase tracking-widest font-bold">Giai Điệu Đại Diện Bản Sắc</div>
              <h4 className="font-black text-base text-white mt-1 font-display">{currentSongTitle || 'VIVU Cyber Chillwave'}</h4>
            </div>

            {/* Visualizer Sóng Âm Thanh */}
            <div className="flex items-center justify-center gap-1.5 h-6">
              {[40, 70, 100, 60, 85, 45, 90, 65, 30].map((h, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-full bg-gradient-to-t from-[#FF2A85] to-[#00E5FF] transition-all duration-150 ${isPlayingAnthem ? 'animate-pulse' : 'opacity-30'}`}
                  style={{ height: isPlayingAnthem ? `${h}%` : '20%' }}
                />
              ))}
            </div>

            <VivuButton
              variant="primary"
              pill={true}
              glow={true}
              icon={isPlayingAnthem ? 'bi-pause-fill' : 'bi-play-fill'}
              onClick={(e) => { triggerCyberSplash(e); onToggleAnthem?.(); }}
              className="px-6 py-2.5 text-sm font-bold shadow-[0_0_20px_rgba(255,42,133,0.6)]"
            >
              {isPlayingAnthem ? 'Tạm dừng giai điệu' : 'Phát giai điệu đại diện'}
            </VivuButton>
          </div>
        )}

        {/* NỘI DUNG 4: HÀNH TINH KHO ẢNH KHÔNG GIAN (PHOTOS) */}
        {focusedPlanet === 'photos' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span>Bộ sưu tập khoảnh khắc ({photos.length})</span>
              <button
                type="button"
                onClick={() => fileInputRef?.current?.click()}
                className="text-[#00E5FF] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <i className="bi bi-plus-lg"></i>
                <span>Tải ảnh mới</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto no-scrollbar">
              {photos.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActivePhotoIndex?.(idx)}
                  className={`relative aspect-square rounded-2xl overflow-hidden border cursor-pointer group transition-all ${
                    idx === activePhotoIndex
                      ? 'border-[#00E5FF] ring-2 ring-[#00E5FF]/40 scale-102'
                      : 'border-white/10 opacity-80 hover:opacity-100 hover:border-white/40'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => onRemovePhoto?.(e, idx)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-[#EF4444] text-white flex items-center justify-center text-[10px] transition-colors"
                    title="Gỡ ảnh"
                  >
                    <i className="bi bi-x-lg font-bold"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NỘI DUNG 5: HÀNH TINH CẢM BIẾN REALTIME (TELEMETRY) */}
        {focusedPlanet === 'telemetry' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-[11px] text-white/60 flex items-center gap-1.5">
                  <i className="bi bi-battery-charging text-[#10FFA0]"></i>
                  <span>Pin thiết bị</span>
                </div>
                <div className="text-xl font-black font-mono text-white">{batteryLevel}%</div>
                <div className="text-[10px] text-[#10FFA0]">{isCharging ? 'Đang sạc nhanh' : 'Sử dụng bình thường'}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-[11px] text-white/60 flex items-center gap-1.5">
                  <i className="bi bi-speedometer text-[#00E5FF]"></i>
                  <span>Tốc độ di chuyển</span>
                </div>
                <div className="text-xl font-black font-mono text-white">0.0 <span className="text-xs font-normal">km/h</span></div>
                <div className="text-[10px] text-[#00E5FF]">Đang dừng chân</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1 text-left font-mono">
              <div className="text-[11px] text-white/60 font-sans flex items-center gap-1.5">
                <i className="bi bi-broadcast text-[#FF2A85]"></i>
                <span>Tọa độ GPS phát sóng thời gian thực</span>
              </div>
              <div className="text-xs font-bold text-white pt-1">
                {safeLat.toFixed(5)}° N, {safeLng.toFixed(5)}° E
              </div>
              <div className="text-[10px] text-white/50 font-sans">
                Độ chính xác cao • Cảm biến vệ tinh mặt đất
              </div>
            </div>
          </div>
        )}

        {/* NỘI DUNG 6: HÀNH TINH TƯỚC HIỆU HỘ CHIẾU (BADGES) */}
        {focusedPlanet === 'badges' && (
          <div className="space-y-3">
            <div className="text-xs text-white/70">Tước hiệu gu sống đạt được dựa trên địa điểm bạn đã đến:</div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
              {tasteBadges.map(badge => (
                <div
                  key={badge.id}
                  className={`p-3.5 rounded-2xl bg-gradient-to-r ${badge.gradient} text-white flex items-center gap-3 shadow-md`}
                >
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-base shrink-0">
                    <i className={`bi ${badge.icon}`}></i>
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs sm:text-sm font-display leading-tight">{badge.title}</h5>
                    <p className="text-[10px] text-white/80 leading-relaxed mt-0.5">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NÚT THOÁT QUAY VỀ QUỸ ĐẠO */}
        <div className="pt-2 border-t border-white/10">
          <VivuButton
            variant="outline-secondary"
            pill={true}
            className="w-full font-bold text-xs py-2"
            icon="bi-arrow-left"
            onClick={(e) => { triggerCyberSplash(e); onClose(); }}
          >
            Quay về Quỹ Đạo Toàn Cảnh
          </VivuButton>
        </div>
      </motion.div>
    </div>
  );
}

