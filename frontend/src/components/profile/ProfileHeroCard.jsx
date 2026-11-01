import React, { useState, useEffect } from 'react';
import { playTactileClickSound, triggerProfileHaptic } from './profileAudioEffects';
import { TRENDING_SONGS, storyAudioPlayer } from '../../data/trendingSongs';

/**
 * ProfileHeroCard - Thẻ Hero không gian tràn viền chuẩn Luminous Solar-Cyber HUD
 * Căn cứ kỹ thuật: DESIGN.md & get_design.md (Nút 4.1, 4.2, 4.3, 4.4, 4.5, 4.6)
 * 100% Bootstrap Icons (Zero Unicode Emoji), Rule 7 (< 450 dòng)
 */
export default function ProfileHeroCard({
  user,
  userCustomStatus = 'Đang vivu dạo phố',
  location,
  userCode,
  photos = [],
  activePhotoIndex = 0,
  setActivePhotoIndex,
  onOpenEditProfile,
  onOpenSettings,
  onOpenAccountSwitcher,
  onBackToMap,
  fileInputRef
}) {
  const meta = user?.user_metadata || {};
  const userFullName = meta.full_name || (user?.email ? user.email.split('@')[0] : 'Người dùng VIVU');
  const userAge = meta.age ? `${meta.age} tuổi` : 'Chưa cập nhật';
  const userJob = meta.job || 'Nhà thám hiểm VIVU';
  const userFavoriteSong = meta.favorite_song || TRENDING_SONGS[0].title;
  const displayCode = userCode || meta.user_code || 'VU-0001';

  // Chỉ số Zenly: Pin phần cứng thực tế qua navigator.getBattery
  const [batteryLevel, setBatteryLevel] = useState(88);
  const [isCharging, setIsCharging] = useState(false);
  const [isPlayingAnthem, setIsPlayingAnthem] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.getBattery) {
      navigator.getBattery().then(bat => {
        setBatteryLevel(Math.round(bat.level * 100));
        setIsCharging(bat.charging);
        bat.onlevelchange = () => setBatteryLevel(Math.round(bat.level * 100));
        bat.onchargingchange = () => setIsCharging(bat.charging);
      }).catch(() => {});
    }
  }, []);

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    if (photos.length <= 1) return;
    playTactileClickSound();
    triggerProfileHaptic([20]);
    setActivePhotoIndex(prev => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    if (photos.length <= 1) return;
    playTactileClickSound();
    triggerProfileHaptic([20]);
    setActivePhotoIndex(prev => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handleToggleAnthem = (e) => {
    e?.stopPropagation();
    playTactileClickSound();
    if (isPlayingAnthem) {
      storyAudioPlayer.stop();
      setIsPlayingAnthem(false);
    } else {
      const foundSong = TRENDING_SONGS.find(s => s.title.toLowerCase().includes(userFavoriteSong.toLowerCase())) || TRENDING_SONGS[0];
      storyAudioPlayer.playSong(foundSong);
      setIsPlayingAnthem(true);
    }
  };

  const safeLat = location?.lat ?? location?.latitude ?? 10.7769;
  const safeLng = location?.lng ?? location?.longitude ?? 106.7009;

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] md:h-[520px] overflow-hidden sm:rounded-3xl border-b sm:border-2 border-[#D2D9F4] sm:hover:border-[#00E5FF] transition-all shadow-[0_12px_45px_rgba(0,0,0,0.08)] bg-[#0C0D10] select-none group">
      
      {/* ẢNH BÌA DUAL-LAYER: AMBIENT BLUR ĐỆM NỀN + ẢNH GỐC CHÍNH TÂM KHÔNG BỊ CẮT MẶT */}
      {photos.length > 0 ? (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {/* Lớp nền nhòe tạo chiều sâu không gian, bù đắp 2 bên trên màn hình rộng */}
          <img
            src={photos[activePhotoIndex]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center blur-2xl opacity-45 scale-125 pointer-events-none select-none"
          />
          {/* Lớp vignette che dịu ánh sáng */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/50 pointer-events-none" />

          {/* Ảnh chính: object-cover kết hợp object-top trên màn hình nhỏ & object-contain trên màn hình lớn để giữ trọn vẹn khuôn mặt */}
          <img
            src={photos[activePhotoIndex]}
            alt={userFullName}
            className="relative z-10 w-full h-full max-h-[520px] object-cover object-top sm:object-contain transition-all duration-300 drop-shadow-2xl"
          />
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FAFAFF] to-[#ECEDFB] p-6 text-center text-[#131315] space-y-3">
          <div className="w-20 h-20 rounded-2xl bg-white border border-[#D2D9F4] flex items-center justify-center text-[#00838F] shadow-sm">
            <i className="bi bi-person-bounding-box text-3xl"></i>
          </div>
          <div>
            <h3 className="font-bold text-base text-[#131315] font-display">Chưa có ảnh hồ sơ</h3>
            <p className="text-xs text-[#70787E] mt-1 max-w-[240px]">Tải ảnh cá nhân để kích hoạt Hộ chiếu Không gian</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-4 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-display font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-xs border border-[#00F0FF] cursor-pointer"
          >
            <i className="bi bi-camera-fill"></i>
            <span>Tải ảnh từ máy</span>
          </button>
        </div>
      )}

      {/* THANH STORY BARS Ở ĐỈNH */}
      {photos.length > 1 && (
        <div className="absolute top-2.5 inset-x-3.5 z-30 flex items-center gap-1.5 pointer-events-none">
          {photos.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                idx === activePhotoIndex
                  ? 'bg-white shadow-[0_0_8px_white]'
                  : idx < activePhotoIndex
                  ? 'bg-white/75'
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      )}

      {/* TOP FLOATING HUD BAR (LUMINOUS SOLAR-CYBER THEME) */}
      <div className="absolute top-5 inset-x-3.5 z-30 flex items-center justify-between gap-2 pointer-events-auto">
        {onBackToMap && (
          <button
            type="button"
            onClick={() => {
              playTactileClickSound();
              onBackToMap();
            }}
            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-[#D2D9F4] hover:bg-white text-[#131315] flex items-center justify-center active:scale-95 transition-all shadow-sm cursor-pointer"
            title="Quay lại Bản đồ 3D"
          >
            <i className="bi bi-arrow-left text-sm font-bold"></i>
          </button>
        )}

        {/* Telemetry Pill */}
        <div className="flex-1 inline-flex items-center justify-between px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#D2D9F4] shadow-sm max-w-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#10FFA0] animate-pulse shrink-0"></span>
            <span className="text-[10px] font-mono text-[#131315] font-semibold truncate">
              {Number(safeLat).toFixed(4)}, {Number(safeLng).toFixed(4)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#00838F] font-mono font-bold shrink-0 ml-1">
            <i className="bi bi-reception-4"></i>
            <span>UWB ONLINE</span>
          </div>
        </div>

        {/* Quick actions (Nút 4.1, 4.2, 4.3) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenAccountSwitcher && (
            <button
              type="button"
              onClick={() => {
                playTactileClickSound();
                onOpenAccountSwitcher();
              }}
              className="h-8 px-2.5 rounded-full bg-[#FFE8F0] backdrop-blur-md border border-[#FFB8D2] text-[#FF2A85] hover:bg-[#FFD1E0] flex items-center gap-1 text-[11px] font-bold active:scale-95 transition-all shadow-sm cursor-pointer"
              title="Đổi tài khoản"
            >
              <i className="bi bi-arrow-repeat text-xs"></i>
              <span className="hidden sm:inline">Đổi nick</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              playTactileClickSound();
              onOpenEditProfile?.();
            }}
            className="h-8 px-2.5 rounded-full bg-white/90 backdrop-blur-md border border-[rgba(0,229,255,0.40)] text-[#131315] font-display text-[11px] font-semibold flex items-center gap-1 hover:bg-white active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <i className="bi bi-pencil text-[#00838F] text-xs"></i>
            <span className="hidden sm:inline">Sửa</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClickSound();
              onOpenSettings?.();
            }}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md border border-[#D2D9F4] text-[#131315] flex items-center justify-center hover:bg-white active:scale-95 transition-all shadow-sm group/btn cursor-pointer"
            title="Cài đặt hệ thống"
          >
            <i className="bi bi-gear text-xs group-hover/btn:rotate-45 transition-transform duration-300"></i>
          </button>
        </div>
      </div>

      {/* VÙNG CHẠM ĐIỀU HƯỚNG ẢNH TRÁI / PHẢI */}
      {photos.length > 1 && (
        <div className="absolute inset-y-16 inset-x-0 z-20 flex">
          <div className="w-1/2 h-full cursor-pointer" onClick={handlePrevPhoto} title="Xem ảnh trước" />
          <div className="w-1/2 h-full cursor-pointer" onClick={handleNextPhoto} title="Xem ảnh tiếp theo" />
        </div>
      )}

      {/* LỚP PHỦ THÔNG TIN ĐÁY HERO TRÀN VIỀN */}
      <div className="absolute inset-x-0 bottom-0 z-25 pt-28 pb-4 px-4 sm:px-6 bg-gradient-to-t from-black/90 via-black/65 to-transparent flex flex-col justify-end pointer-events-none text-white space-y-2.5">
        
        {/* THANH CHỈ SỐ ZENLY LIVE TELEMETRY */}
        <div className="inline-flex items-center gap-1.5 flex-wrap pointer-events-auto">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-mono">
            <i className={`bi ${isCharging ? 'bi-battery-charging text-[#10FFA0]' : batteryLevel < 20 ? 'bi-battery text-[#FF2A85]' : 'bi-battery-full text-[#10FFA0]'}`}></i>
            <span className="text-white font-bold">{batteryLevel}%</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-mono text-slate-200">
            <i className="bi bi-hourglass-split text-amber-400"></i>
            <span>Ở đây 35m</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-mono text-[#00E5FF]">
            <i className="bi bi-speedometer2"></i>
            <span>0 km/h</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FF2A85]/20 border border-[#FF2A85]/50 text-[10px] font-mono text-[#FF2A85] font-bold">
            <i className="bi bi-cup-hot-fill"></i>
            <span>8 Bumps</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 border border-white/30 font-mono text-[10px] text-white font-bold">
            {displayCode}
          </span>
        </div>

        {/* Tên, Tuổi, Nghề nghiệp */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md truncate font-display">
              {userFullName}
            </h1>
            <span className="text-sm font-semibold text-slate-200 shrink-0">
              • {userAge}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-200 drop-shadow mt-0.5 font-medium">
            <i className="bi bi-briefcase-fill text-[#00E5FF]"></i>
            <span className="truncate">{userJob}</span>
          </div>
        </div>

        {/* Hàng 2: Status trích dẫn (Nút 4.6) & Anthem nhạc */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pointer-events-auto">
          {/* Status trích dẫn (Nút 4.6) */}
          <div className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-xs text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <i className="bi bi-quote text-[#00E5FF] text-base"></i>
              <span className="truncate font-medium">{userCustomStatus}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                playTactileClickSound();
                onOpenEditProfile?.();
              }}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[#00E5FF] hover:scale-110 active:scale-95 transition-all shrink-0 cursor-pointer"
              title="Đổi trạng thái"
            >
              <i className="bi bi-send-fill text-xs text-[#00B4D8]"></i>
            </button>
          </div>

          {/* Anthem bài hát yêu thích (nghe thử thật) */}
          <div 
            onClick={handleToggleAnthem}
            className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 hover:border-[#FF2A85] text-xs text-white flex items-center justify-between cursor-pointer transition-all shadow-xs"
            title="Bấm để nghe thử giai điệu đại diện"
          >
            <div className="flex items-center gap-2 min-w-0">
              <i className={`bi bi-disc-fill text-[#FF2A85] text-sm ${isPlayingAnthem ? 'animate-spin' : ''}`}></i>
              <span className="truncate text-slate-200">Anthem: <strong className="text-white">{userFavoriteSong}</strong></span>
            </div>
            <span className="text-[10px] text-[#00E5FF] font-bold shrink-0 ml-1.5">
              {isPlayingAnthem ? 'Đang phát' : 'Nghe thử'}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
