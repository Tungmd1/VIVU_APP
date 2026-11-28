import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { VIVU_MAP_TILES, TILE_LAYER_OPTIONS, getDistanceKm } from './mapTileConstants';

/**
 * LiveLocationTrackingView - Chế Độ Theo Dõi Vị Trí Trực Tiếp Độc Quyền Toàn Màn Hình
 * - Ẩn hoàn toàn menu, dock, dynamic island, icon phụ
 * - Chỉ hiển thị Map, 2 Giọt nước (Bạn & Đối phương), HUD khoảng cách, tốc độ và nút Thoát
 * - Hỗ trợ camera bám theo đối phương, căn giữa 2 người, và bật/tắt giữ sáng màn hình (Wake Lock)
 * - Tuân thủ Rule 5 (100% Bootstrap Icons), Rule 7 (< 450 dòng), Rule 12 (Dark Monochrome + Neon)
 */
export default function LiveLocationTrackingView({
  myUserId,
  myName = 'Bạn',
  myAvatar = '',
  myCoords, // { lat, lng, speed, accuracy }
  targetUserId,
  targetName = 'Đối phương',
  targetAvatar = '',
  targetCoords, // { lat, lng, speed, accuracy, timestamp, isStopped }
  isStopped = false,
  onClose,
  onStopMyShare
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const myMarkerRef = useRef(null);
  const targetMarkerRef = useRef(null);
  const lineRef = useRef(null);
  const midBadgeMarkerRef = useRef(null);
  const wakeLockRef = useRef(null);

  // Chế độ camera: 'follow_target' (mặc định), 'fit_bounds', 'follow_me', 'manual'
  const [cameraMode, setCameraMode] = useState('follow_target');
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const [wakeLockSupported, setWakeLockSupported] = useState(false);

  // 1. Quản lý Screen Wake Lock (Giữ sáng màn hình)
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      setWakeLockSupported(true);
      // Mặc định tự động kích hoạt Wake Lock khi mở chế độ theo dõi trực tiếp
      const requestWakeLock = async () => {
        try {
          const lock = await navigator.wakeLock.request('screen');
          wakeLockRef.current = lock;
          setIsWakeLockActive(true);
          lock.addEventListener('release', () => {
            setIsWakeLockActive(false);
          });
        } catch (err) {
          console.warn('[LiveTracking] WakeLock error:', err?.message);
        }
      };
      requestWakeLock();
    }

    return () => {
      if (wakeLockRef.current) {
        try {
          wakeLockRef.current.release();
        } catch (_) {}
        wakeLockRef.current = null;
      }
    };
  }, []);

  const toggleWakeLock = async () => {
    if (!wakeLockSupported) return;
    if (isWakeLockActive && wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setIsWakeLockActive(false);
      } catch (_) {}
    } else {
      try {
        const lock = await navigator.wakeLock.request('screen');
        wakeLockRef.current = lock;
        setIsWakeLockActive(true);
      } catch (err) {
        console.warn('[LiveTracking] Toggle WakeLock error:', err?.message);
      }
    }
  };

  // 2. Tính khoảng cách chính xác theo km hoặc mét
  const myLat = myCoords?.lat != null ? Number(myCoords.lat) : null;
  const myLng = myCoords?.lng != null ? Number(myCoords.lng) : null;
  const tLat = targetCoords?.lat != null ? Number(targetCoords.lat) : null;
  const tLng = targetCoords?.lng != null ? Number(targetCoords.lng) : null;

  let distanceText = '--';
  let distanceKm = null;
  if (myLat != null && myLng != null && tLat != null && tLng != null) {
    distanceKm = getDistanceKm(myLat, myLng, tLat, tLng);
    if (distanceKm < 1) {
      distanceText = `${Math.round(distanceKm * 1000)} m`;
    } else {
      distanceText = `${distanceKm.toFixed(1)} km`;
    }
  }

  // Tốc độ đối phương
  const tSpeedNum = targetCoords?.speed != null ? Number(targetCoords.speed) : null;
  const tSpeedText = (tSpeedNum != null && tSpeedNum >= 1.5)
    ? `${Math.round(tSpeedNum)} km/h`
    : 'Đang đứng yên';

  // Tốc độ của bạn
  const mySpeedNum = myCoords?.speed != null ? Number(myCoords.speed) : null;
  const mySpeedText = (mySpeedNum != null && mySpeedNum >= 1.5)
    ? `${Math.round(mySpeedNum)} km/h`
    : 'Đang đứng yên';

  // 3. Khởi tạo bản đồ Leaflet độc lập toàn màn hình
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCenter = (tLat != null && tLng != null) 
      ? [tLat, tLng] 
      : ((myLat != null && myLng != null) ? [myLat, myLng] : [16.0544, 108.2022]);

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 16.5,
      zoomControl: false,
      attributionControl: false
    });

    const tileLayer = L.tileLayer(VIVU_MAP_TILES.streets, {
      ...TILE_LAYER_OPTIONS,
      subdomains: TILE_LAYER_OPTIONS.subdomains.split('')
    });
    tileLayer.on('tileerror', () => {
      tileLayer.setUrl(VIVU_MAP_TILES.osmFallback);
    });
    tileLayer.addTo(map);

    // Bắt sự kiện người dùng tự kéo/zoom bản đồ -> chuyển sang chế độ manual
    map.on('dragstart', () => setCameraMode('manual'));

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 4. Tạo icon Giọt nước cho Bạn & Đối phương
  const createWaterdropIcon = (isTarget = false, avatar = '', name = '', speed = '') => {
    const mainColor = isTarget ? '#10FFA0' : '#00E5FF';
    const subColor = isTarget ? '#00FF66' : '#00B4D8';
    const shadowColor = isTarget ? 'rgba(16,255,160,0.65)' : 'rgba(0,229,255,0.65)';
    const radarBorder = isTarget ? '#10FFA0' : '#00E5FF';

    const avatarHtml = avatar
      ? `<img src="${avatar}" alt="${name}" class="w-full h-full object-cover rounded-full" />`
      : `<i class="bi bi-person-fill text-2xl text-neutral-400"></i>`;

    const statusBadge = isTarget
      ? `<span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-[#10FFA0] animate-pulse"></span>${name}</span>`
      : `<span>Bạn</span>`;

    return L.divIcon({
      className: 'vivu-live-waterdrop-marker',
      iconSize: [64, 88],
      iconAnchor: [32, 70],
      html: `
        <div class="relative flex flex-col items-center select-none" style="filter: drop-shadow(0 10px 18px rgba(0,0,0,0.6));">
          <!-- Vòng sóng Radar Pulse phát sáng liên tục -->
          <div class="absolute top-2 w-16 h-16 rounded-full border-2 animate-ping pointer-events-none opacity-60" style="border-color: ${radarBorder};"></div>

          <!-- Thân giọt nước chính bo tròn -->
          <div class="relative w-13 h-13 rounded-full p-[3px] flex items-center justify-center" style="background: linear-gradient(135deg, ${mainColor}, ${subColor}); box-shadow: 0 0 25px ${shadowColor};">
            <div class="w-full h-full rounded-full overflow-hidden bg-[#121520] flex items-center justify-center">
              ${avatarHtml}
            </div>
          </div>

          <!-- Chóp nhọn giọt nước phía dưới chỉ đúng toạ độ -->
          <div class="w-3 h-3 rotate-45 -mt-1.5" style="background: ${subColor};"></div>

          <!-- Nhãn tên & tốc độ nổi bật bên dưới -->
          <div class="px-2.5 py-0.5 rounded-full bg-black/90 border border-white/20 text-white text-[10px] font-bold mt-1 shadow-lg whitespace-nowrap flex items-center gap-1.5">
            ${statusBadge}
            ${speed ? `<span class="text-[9px] font-mono font-normal opacity-70">(${speed})</span>` : ''}
          </div>
        </div>
      `
    });
  };

  // 5. Cập nhật vị trí markers và đường nối liên tục
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const hasMe = myLat != null && myLng != null;
    const hasTarget = tLat != null && tLng != null;

    // Marker của Bạn
    if (hasMe) {
      const myIcon = createWaterdropIcon(false, myAvatar, myName, mySpeedText);
      if (!myMarkerRef.current) {
        myMarkerRef.current = L.marker([myLat, myLng], { icon: myIcon, zIndexOffset: 900 }).addTo(map);
      } else {
        myMarkerRef.current.setLatLng([myLat, myLng]);
        myMarkerRef.current.setIcon(myIcon);
      }
    }

    // Marker của Đối phương
    if (hasTarget) {
      const targetIcon = createWaterdropIcon(true, targetAvatar, targetName, tSpeedText);
      if (!targetMarkerRef.current) {
        targetMarkerRef.current = L.marker([tLat, tLng], { icon: targetIcon, zIndexOffset: 1000 }).addTo(map);
      } else {
        targetMarkerRef.current.setLatLng([tLat, tLng]);
        targetMarkerRef.current.setIcon(targetIcon);
      }
    }

    // Đường nối neon và huy hiệu khoảng cách
    if (hasMe && hasTarget) {
      const latlngs = [[myLat, myLng], [tLat, tLng]];
      if (!lineRef.current) {
        lineRef.current = L.polyline(latlngs, {
          color: '#00E5FF',
          weight: 3.5,
          opacity: 0.85,
          dashArray: '6, 8'
        }).addTo(map);
      } else {
        lineRef.current.setLatLngs(latlngs);
      }

      // Huy hiệu khoảng cách bay ở trung điểm đường nối
      const midLat = (myLat + tLat) / 2;
      const midLng = (myLng + tLng) / 2;
      const badgeIcon = L.divIcon({
        className: 'vivu-mid-distance-badge',
        iconSize: [90, 26],
        iconAnchor: [45, 13],
        html: `
          <div class="px-2.5 py-0.5 rounded-full bg-[#0B0D14]/95 border border-[#00E5FF]/60 text-[#00E5FF] text-[11px] font-mono font-black shadow-[0_0_12px_rgba(0,229,255,0.5)] flex items-center justify-center gap-1">
            <i class="bi bi-geo-alt-fill text-[10px]"></i>
            <span>${distanceText}</span>
          </div>
        `
      });

      if (!midBadgeMarkerRef.current) {
        midBadgeMarkerRef.current = L.marker([midLat, midLng], { icon: badgeIcon, interactive: false, zIndexOffset: 500 }).addTo(map);
      } else {
        midBadgeMarkerRef.current.setLatLng([midLat, midLng]);
        midBadgeMarkerRef.current.setIcon(badgeIcon);
      }
    } else {
      if (lineRef.current) {
        lineRef.current.remove();
        lineRef.current = null;
      }
      if (midBadgeMarkerRef.current) {
        midBadgeMarkerRef.current.remove();
        midBadgeMarkerRef.current = null;
      }
    }

    // Camera tự động theo chế độ
    if (cameraMode === 'follow_target' && hasTarget) {
      map.panTo([tLat, tLng], { animate: true, duration: 0.8 });
    } else if (cameraMode === 'follow_me' && hasMe) {
      map.panTo([myLat, myLng], { animate: true, duration: 0.8 });
    } else if (cameraMode === 'fit_bounds' && hasMe && hasTarget) {
      map.fitBounds([[myLat, myLng], [tLat, tLng]], {
        padding: [90, 90],
        maxZoom: 17,
        animate: true
      });
    }
  }, [myLat, myLng, tLat, tLng, mySpeedText, tSpeedText, distanceText, cameraMode]);

  // Hành động camera khi người dùng nhấn nút
  const handleFollowTarget = () => {
    setCameraMode('follow_target');
    if (mapRef.current && tLat != null && tLng != null) {
      mapRef.current.flyTo([tLat, tLng], 17, { duration: 0.8 });
    }
  };

  const handleFitBounds = () => {
    setCameraMode('fit_bounds');
    if (mapRef.current && myLat != null && myLng != null && tLat != null && tLng != null) {
      mapRef.current.fitBounds([[myLat, myLng], [tLat, tLng]], {
        padding: [90, 90],
        maxZoom: 17,
        animate: true
      });
    }
  };

  const handleFollowMe = () => {
    setCameraMode('follow_me');
    if (mapRef.current && myLat != null && myLng != null) {
      mapRef.current.flyTo([myLat, myLng], 17, { duration: 0.8 });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] w-full h-full bg-[#0B0D14] flex flex-col overflow-hidden select-none font-sans">
      {/* 1. KHUNG BẢN ĐỒ TOÀN MÀN HÌNH */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0 w-full h-full bg-[#121520]" />

      {/* 2. THANH HUD TRÊN ĐỈNH (TOP BAR) */}
      <div className="relative z-20 flex items-center justify-between p-3 sm:p-4 pointer-events-none">
        {/* Nút Thoát Chế Độ Live */}
        <button
          type="button"
          onClick={onClose}
          className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#0B0D14]/85 hover:bg-black text-white text-xs font-bold border border-white/20 backdrop-blur-xl shadow-2xl active:scale-95 transition-all cursor-pointer"
          title="Thoát chế độ theo dõi"
          aria-label="Thoát chế độ theo dõi"
        >
          <i className="bi bi-x-lg text-sm text-[#FF2A85]" />
          <span>Thoát</span>
        </button>

        {/* Thông tin đối phương đang theo dõi */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B0D14]/85 border border-[#10FFA0]/40 backdrop-blur-xl shadow-2xl">
          <div className="w-6 h-6 rounded-full overflow-hidden bg-neutral-800 border border-white/30 shrink-0">
            {targetAvatar ? (
              <img src={targetAvatar} alt={targetName} className="w-full h-full object-cover" />
            ) : (
              <i className="bi bi-person-fill text-white/50 text-xs flex items-center justify-center h-full" />
            )}
          </div>
          <span className="text-xs font-bold text-white max-w-[120px] truncate">{targetName}</span>
          <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-[#10FFA0] bg-[#10FFA0]/15 px-2 py-0.5 rounded-full border border-[#10FFA0]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10FFA0] animate-pulse" />
            <span>LIVE</span>
          </span>
        </div>

        {/* Nút Tùy Chọn Giữ Sáng Màn Hình (Screen Wake Lock) */}
        {wakeLockSupported ? (
          <button
            type="button"
            onClick={toggleWakeLock}
            className={`pointer-events-auto flex items-center gap-1.5 px-3 py-2 rounded-2xl border backdrop-blur-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xl ${
              isWakeLockActive
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-[#0B0D14]/85 border-white/20 text-white/60 hover:text-white'
            }`}
            title={isWakeLockActive ? 'Màn hình luôn sáng (Bấm để tắt)' : 'Tự tắt màn hình (Bấm để giữ sáng)'}
          >
            <i className={`bi ${isWakeLockActive ? 'bi-sun-fill text-amber-400 animate-pulse' : 'bi-sun'}`} />
            <span className="hidden sm:inline">{isWakeLockActive ? 'Sáng liên tục' : 'Tự tắt'}</span>
          </button>
        ) : <div className="w-10" />}
      </div>

      {/* 3. THÔNG BÁO KHI ĐỐI PHƯƠNG DỪNG CHIA SẺ VỊ TRÍ */}
      {isStopped && (
        <div className="relative z-30 mx-4 mt-1 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium flex items-center justify-between backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill text-rose-400 text-base" />
            <span>Đối phương đã dừng chia sẻ vị trí trực tiếp.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer"
          >
            Quay lại
          </button>
        </div>
      )}

      {/* 4. THANH ĐIỀU KHIỂN & BẢNG THÔNG SỐ HUD DƯỚI ĐÁY */}
      <div className="mt-auto relative z-20 p-3 sm:p-5 pointer-events-none">
        <div className="pointer-events-auto max-w-md mx-auto rounded-3xl bg-[#0B0D14]/90 border border-white/15 backdrop-blur-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.85)] space-y-3.5">
          {/* Cụm thông số lớn: Khoảng cách & Tốc độ */}
          <div className="flex items-center justify-between divide-x divide-white/10">
            {/* Khoảng cách trực tiếp */}
            <div className="pr-4 flex-1">
              <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold block flex items-center gap-1">
                <i className="bi bi-geo-alt-fill text-[#00E5FF]" />
                <span>Khoảng Cách Trực Tiếp</span>
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight mt-0.5">
                {distanceText}
              </div>
            </div>

            {/* Tốc độ đối phương */}
            <div className="pl-4 flex-1">
              <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold block flex items-center gap-1">
                <i className="bi bi-speedometer2 text-[#10FFA0]" />
                <span>Tốc Độ Đối Phương</span>
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#10FFA0] font-mono tracking-tight mt-0.5">
                {tSpeedText}
              </div>
            </div>
          </div>

          {/* Cụm 3 nút chuyển chế độ camera */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/10">
            <button
              type="button"
              onClick={handleFollowTarget}
              className={`py-2 px-1.5 rounded-2xl border text-[11px] font-bold flex flex-col items-center gap-1 active:scale-95 transition-all cursor-pointer ${
                cameraMode === 'follow_target'
                  ? 'bg-[#10FFA0]/20 border-[#10FFA0] text-[#10FFA0]'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70'
              }`}
            >
              <i className="bi bi-crosshair text-sm" />
              <span>Bám theo</span>
            </button>

            <button
              type="button"
              onClick={handleFitBounds}
              className={`py-2 px-1.5 rounded-2xl border text-[11px] font-bold flex flex-col items-center gap-1 active:scale-95 transition-all cursor-pointer ${
                cameraMode === 'fit_bounds'
                  ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70'
              }`}
            >
              <i className="bi bi-arrows-angle-expand text-sm" />
              <span>Căn cả hai</span>
            </button>

            <button
              type="button"
              onClick={handleFollowMe}
              className={`py-2 px-1.5 rounded-2xl border text-[11px] font-bold flex flex-col items-center gap-1 active:scale-95 transition-all cursor-pointer ${
                cameraMode === 'follow_me'
                  ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70'
              }`}
            >
              <i className="bi bi-cursor-fill text-sm" />
              <span>Vị trí tôi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
