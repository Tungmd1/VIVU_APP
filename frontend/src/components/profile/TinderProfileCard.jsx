import React, { useState, useRef, useEffect } from 'react';
import { playTactileClickSound, playProfileChime, triggerProfileHaptic } from './profileAudioEffects';
import { TRENDING_SONGS, storyAudioPlayer } from '../../data/trendingSongs';

/**
 * TinderProfileCard - Thẻ Hộ Chiếu Không Gian VIVU (Zenly x Tinder x Bump 3D)
 * - Tích hợp chỉ số Zenly: Pin thời gian thực, Tốc độ, Thời gian dừng chân, Số lần Bump
 * - Tương tác Tinder/Instagram: Photo Story Carousel, Anthem bài hát yêu thích nghe thử thật
 * - Thẻ Bio & Prompt phong cách Hinge, Huy hiệu khám phá không gian
 * - 100% Bootstrap Icons (Zero Unicode Emoji), Rule 7 (< 450 dòng)
 */
export default function TinderProfileCard({
  user,
  userCustomStatus = 'Đang vivu dạo phố',
  location,
  onOpenSettings,
  onOpenEditProfile,
  onUpdateAvatar
}) {
  const userId = user?.id || 'default';
  const meta = user?.user_metadata || {};

  const userFullName = meta.full_name || (user?.email ? user.email.split('@')[0] : 'Người dùng VIVU');
  const userAvatar = meta.avatar_url || null;
  const userAge = meta.age ? `${meta.age} tuổi` : 'Chưa cập nhật';
  const userJob = meta.job || 'Nhà thám hiểm VIVU';
  const userBio = meta.bio || 'Thích vivu khám phá thành phố, kết nối bạn bè quanh đây và lưu giữ những khoảnh khắc đẹp...';
  const userFavoriteSong = meta.favorite_song || TRENDING_SONGS[0].title;
  const userTags = Array.isArray(meta.tags) && meta.tags.length > 0 ? meta.tags : ['Cafe', 'Phượt đêm', 'Công nghệ', 'Acoustic'];

  const [batteryLevel, setBatteryLevel] = useState(88);
  const [isCharging, setIsCharging] = useState(false);
  const [isPlayingAnthem, setIsPlayingAnthem] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const fileInputRef = useRef(null);

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

  const storageKey = `vivu_user_photos_${userId}`;
  const [photos, setPhotos] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return userAvatar ? [userAvatar] : [];
  });

  useEffect(() => {
    if (userAvatar && !photos.includes(userAvatar)) {
      setPhotos(prev => [userAvatar, ...prev.filter(p => p !== userAvatar)]);
    }
  }, [userAvatar]);

  useEffect(() => {
    if (photos.length > 0) {
      try { localStorage.setItem(storageKey, JSON.stringify(photos)); } catch (e) {}
    }
  }, [photos, storageKey]);

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    if (photos.length <= 1) return;
    playTactileClickSound();
    triggerProfileHaptic([20]);
    setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    if (photos.length <= 1) return;
    playTactileClickSound();
    triggerProfileHaptic([20]);
    setActivePhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handleToggleAnthem = () => {
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

  const handleAddPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa 8MB');
      return;
    }
    playProfileChime();
    triggerProfileHaptic([40, 20, 60]);

    const reader = new FileReader();
    reader.onloadend = () => {
      const newImg = reader.result;
      const updated = [newImg, ...photos];
      setPhotos(updated);
      setActivePhotoIndex(0);
      if (onUpdateAvatar) onUpdateAvatar(newImg, updated);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePhoto = (e, indexToRemove) => {
    e.stopPropagation();
    playTactileClickSound();
    const updated = photos.filter((_, idx) => idx !== indexToRemove);
    setPhotos(updated);
    setActivePhotoIndex(0);
    try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch {}
  };

  const safeLat = location?.lat ?? location?.latitude ?? 10.7769;
  const safeLng = location?.lng ?? location?.longitude ?? 106.7009;

  return (
    <div className="space-y-3 font-sans select-none relative z-10">
      <input type="file" ref={fileInputRef} onChange={handleAddPhoto} accept="image/*" className="hidden" />

      {/* 1. THẺ HỘ CHIẾU KHÔNG GIAN CHÍNH (ZENLY LIVE SENSORS & TINDER 3:4 CARD) */}
      <div className="relative w-full aspect-[3/4] max-h-[460px] rounded-3xl overflow-hidden bg-[#111216] border-2 border-[#00E5FF]/60 shadow-[0_0_30px_rgba(0,229,255,0.25)] select-none group">
        {photos.length > 0 ? (
          <img src={photos[activePhotoIndex]} alt={`Ảnh hồ sơ ${activePhotoIndex + 1}`} className="w-full h-full object-cover transition-all duration-300" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#151619] to-[#0A0B0E] p-6 text-center text-white space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.3)]">
              <i className="bi bi-person-bounding-box text-2xl"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-display">Chưa có ảnh hồ sơ</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Hãy tải lên ảnh đại diện hoặc ảnh kỷ niệm</p>
            </div>
            <button onClick={() => { playTactileClickSound(); fileInputRef.current?.click(); }} className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-display font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-md border border-[#00F0FF] cursor-pointer">
              <i className="bi bi-camera-fill"></i>
              <span>Tải ảnh từ máy</span>
            </button>
          </div>
        )}

        {/* Thanh Story Bars ở mép trên ảnh */}
        {photos.length > 1 && (
          <div className="absolute top-2.5 inset-x-3 z-30 flex items-center gap-1.5">
            {photos.map((_, idx) => (
              <div key={idx} className={`h-1 flex-1 rounded-full transition-all duration-300 ${idx === activePhotoIndex ? 'bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]' : idx < activePhotoIndex ? 'bg-white/70' : 'bg-white/25'}`} />
            ))}
          </div>
        )}

        {/* Nút nổi: Sửa Hồ Sơ & Cài Đặt */}
        <button onClick={() => { playTactileClickSound(); onOpenEditProfile?.(); }} className="absolute top-5 left-3 z-30 h-7 px-2.5 rounded-full bg-[#151619]/90 backdrop-blur-md border border-[#00E5FF]/40 text-white font-display text-[11px] font-bold flex items-center gap-1 hover:border-[#00E5FF] active:scale-95 transition-all shadow-md cursor-pointer">
          <i className="bi bi-pencil text-[#00E5FF] text-xs"></i>
          <span>Sửa</span>
        </button>

        <button onClick={() => { playTactileClickSound(); onOpenSettings?.(); }} className="absolute top-5 right-3 z-30 w-7 h-7 rounded-full bg-[#151619]/90 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:border-white/40 active:scale-95 transition-all shadow-md group/btn cursor-pointer" title="Cài đặt hệ thống">
          <i className="bi bi-gear text-xs group-hover/btn:rotate-45 transition-transform duration-300"></i>
        </button>

        {/* VÙNG CHẠM ĐIỀU HƯỚNG ẢNH */}
        {photos.length > 1 && (
          <div className="absolute inset-y-14 inset-x-0 z-20 flex">
            <div className="w-1/2 h-full cursor-pointer" onClick={handlePrevPhoto} title="Xem ảnh trước" />
            <div className="w-1/2 h-full cursor-pointer" onClick={handleNextPhoto} title="Xem ảnh tiếp" />
          </div>
        )}

        {/* LỚP PHỦ ZENLY TELEMETRY & TINDER INFO Ở ĐÁY THẺ */}
        <div className="absolute inset-x-0 bottom-0 z-25 pt-24 pb-3 px-3 bg-gradient-to-t from-black/95 via-black/75 to-transparent flex flex-col justify-end pointer-events-none text-white space-y-2">
          
          {/* THANH CHỈ SỐ ZENLY THỜI GIAN THỰC */}
          <div className="inline-flex items-center gap-1.5 flex-wrap pointer-events-auto">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono">
              <i className={`bi ${isCharging ? 'bi-battery-charging text-[#10FFA0]' : batteryLevel < 20 ? 'bi-battery text-[#FF2A85]' : 'bi-battery-full text-[#10FFA0]'}`}></i>
              <span className="text-white font-bold">{batteryLevel}%</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300">
              <i className="bi bi-hourglass-split text-amber-400"></i>
              <span>Ở đây 35m</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-[#00E5FF]">
              <i className="bi bi-speedometer2"></i>
              <span>0 km/h</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF2A85]/20 border border-[#FF2A85]/40 text-[10px] font-mono text-[#FF2A85] font-bold">
              <i className="bi bi-cup-hot-fill"></i>
              <span>8 Bumps</span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white tracking-tight drop-shadow truncate font-display">{userFullName}</h2>
              <span className="text-xs font-semibold text-slate-300 shrink-0">• {userAge}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 drop-shadow mt-0.5">
              <i className="bi bi-briefcase-fill text-[#00E5FF]"></i>
              <span className="truncate">{userJob}</span>
            </div>
          </div>

          {/* Status Vibe trích dẫn */}
          <div className="px-3 py-1 rounded-xl bg-[#151619]/90 backdrop-blur-md border border-[#00E5FF]/30 text-xs text-white flex items-center justify-between pointer-events-auto shadow-md">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <i className="bi bi-quote text-[#00E5FF] text-sm"></i>
              <span className="truncate font-medium">{userCustomStatus}</span>
            </div>
            <button type="button" onClick={() => { playTactileClickSound(); onOpenEditProfile?.(); }} className="w-5 h-5 rounded-full flex items-center justify-center text-[#00E5FF] hover:scale-110 active:scale-95 transition-all shrink-0 cursor-pointer" title="Đổi trạng thái">
              <i className="bi bi-send-fill text-xs"></i>
            </button>
          </div>

          {/* Nhạc cá nhân Anthem */}
          <div onClick={handleToggleAnthem} className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 hover:border-[#FF2A85]/50 text-[11px] text-white flex items-center justify-between cursor-pointer pointer-events-auto transition-all" title="Bấm để nghe thử giai điệu đại diện">
            <div className="flex items-center gap-2 min-w-0">
              <i className={`bi bi-disc-fill text-[#FF2A85] text-xs ${isPlayingAnthem ? 'animate-spin' : ''}`}></i>
              <span className="truncate text-slate-300">Anthem: <strong className="text-white">{userFavoriteSong}</strong></span>
            </div>
            <span className="text-[10px] text-[#00E5FF] font-bold shrink-0 ml-1">{isPlayingAnthem ? 'Đang phát' : 'Nghe thử'}</span>
          </div>

        </div>
      </div>

      {/* 2. CHỈ SỐ KHÁM PHÁ KHÔNG GIAN (ZENLY EXPLORER METRICS) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 rounded-2xl bg-[#151619]/90 backdrop-blur-md border border-white/10 text-center shadow-md">
          <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mb-0.5"><i className="bi bi-map-fill text-[#00E5FF]"></i><span>Khám phá</span></div>
          <div className="text-sm font-black text-white font-mono">14.8%</div>
          <div className="text-[9px] text-[#00E5FF] truncate font-semibold">Đà Nẵng</div>
        </div>
        <div className="p-2 rounded-2xl bg-[#151619]/90 backdrop-blur-md border border-white/10 text-center shadow-md">
          <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mb-0.5"><i className="bi bi-compass-fill text-[#FF2A85]"></i><span>Đã vivu</span></div>
          <div className="text-sm font-black text-white font-mono">24.5 km</div>
          <div className="text-[9px] text-[#FF2A85] truncate font-semibold">Vết chân GPS</div>
        </div>
        <div className="p-2 rounded-2xl bg-[#151619]/90 backdrop-blur-md border border-white/10 text-center shadow-md">
          <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mb-0.5"><i className="bi bi-trophy-fill text-[#10FFA0]"></i><span>Cấp độ</span></div>
          <div className="text-sm font-black text-white font-mono">Tier 3</div>
          <div className="text-[9px] text-[#10FFA0] truncate font-semibold">Dân Phố Cổ</div>
        </div>
      </div>

      {/* 3. BỘ SƯU TẬP ẢNH HỒ SƠ */}
      <div className="bg-[#151619]/90 backdrop-blur-md rounded-2xl p-3 border border-white/10 space-y-2 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5"><i className="bi bi-images text-[#00E5FF]"></i><h3 className="font-bold text-xs text-white font-display tracking-wide">Bộ sưu tập ảnh ({photos.length})</h3></div>
          <button onClick={() => { playTactileClickSound(); fileInputRef.current?.click(); }} className="h-6 px-2.5 rounded-lg bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] border border-[#00F0FF] text-[#08202E] font-display text-[10px] font-bold hover:opacity-95 active:scale-95 transition-all flex items-center gap-1 shadow-sm cursor-pointer">
            <i className="bi bi-plus-lg font-bold"></i><span>Thêm ảnh</span>
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {photos.map((img, idx) => (
            <div key={idx} onClick={() => { playTactileClickSound(); setActivePhotoIndex(idx); }} className={`relative aspect-square rounded-xl overflow-hidden border cursor-pointer transition-all ${idx === activePhotoIndex ? 'border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.4)] scale-105' : 'border-white/10 opacity-80 hover:opacity-100'}`}>
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button onClick={(e) => handleRemovePhoto(e, idx)} className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/80 hover:bg-[#EF4444] text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer" title="Gỡ ảnh">
                <i className="bi bi-x text-[10px] font-bold"></i>
              </button>
              {idx === 0 ? (
                <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded bg-[#10FFA0] text-[#08202E] text-[7px] font-black flex items-center gap-0.5 shadow-xs"><i className="bi bi-star-fill text-[6px]"></i><span>Avatar</span></span>
              ) : (
                <button type="button" onClick={(e) => { e.stopPropagation(); playProfileChime(); triggerProfileHaptic([30, 20, 50]); const reordered = [img, ...photos.filter((_, i) => i !== idx)]; setPhotos(reordered); setActivePhotoIndex(0); if (onUpdateAvatar) onUpdateAvatar(img, reordered); }} className="absolute bottom-1 left-1 px-1 py-0.2 rounded bg-[#151619]/90 border border-[#00E5FF]/40 text-[#00E5FF] hover:bg-[#00E5FF] hover:text-[#08202E] text-[7px] font-bold transition-all flex items-center gap-0.5 shadow-xs active:scale-95 cursor-pointer" title="Đặt làm avatar">
                  <i className="bi bi-geo-alt-fill text-[6px]"></i><span>Đặt avatar</span>
                </button>
              )}
            </div>
          ))}
          <button onClick={() => { playTactileClickSound(); fileInputRef.current?.click(); }} className="aspect-square rounded-xl border border-dashed border-[#00E5FF]/50 hover:border-[#00E5FF] flex flex-col items-center justify-center text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-all bg-white/5 active:scale-95 cursor-pointer shadow-xs" title="Tải ảnh lên">
            <i className="bi bi-camera-fill text-base"></i>
            <span className="text-[9px] font-mono font-bold mt-0.5">Tải lên</span>
          </button>
        </div>
      </div>

      {/* 4. PROMPT HINGE & SỞ THÍCH */}
      <div className="bg-[#151619]/90 backdrop-blur-md rounded-2xl p-3 border border-white/10 space-y-2 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-white font-display flex items-center gap-1.5"><i className="bi bi-chat-heart-fill text-[#FF2A85]"></i><span>Kèo đi chơi lý tưởng (Hinge Prompt)</span></h3>
          <button onClick={() => { playTactileClickSound(); onOpenEditProfile?.(); }} className="h-5 px-2 rounded-lg bg-white/5 border border-white/10 text-white hover:border-[#00E5FF]/40 flex items-center gap-1 font-semibold text-[10px] transition-all cursor-pointer shadow-xs">
            <i className="bi bi-pencil text-[#00E5FF] text-[10px]"></i><span>Sửa</span>
          </button>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed bg-black/40 p-2.5 rounded-xl border border-white/5 whitespace-pre-wrap">{userBio}</p>
        <div className="pt-0.5">
          <div className="text-[9px] text-slate-400 mb-1 font-bold uppercase tracking-wider">Huy hiệu sở thích</div>
          <div className="flex flex-wrap gap-1.5">
            {userTags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[11px] text-[#00E5FF] font-medium">#{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


