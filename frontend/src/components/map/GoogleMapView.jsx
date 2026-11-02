import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import RightActionStack from './RightActionStack';
import { storyAudioPlayer } from '../../data/trendingSongs';
import { getOwnerBubbleHtml, getPeerBubbleHtml } from './mapMarkerHelpers';

/**
 * GoogleMapView - Bản Đồ Google Maps Chuẩn VIVU (Zero-WebGL Crash)
 * - Leaflet Core 2D mượt mà (0 WebGL contexts, không bao giờ crash)
 * - Google Streets & Google Satellite Hybrid
 * - Hiển thị bài đăng Story, Bài hát MP3 thật, Suy nghĩ và Tên cho bạn bè
 * - Chế độ cắm ghim tương tác định vị máy tính (isPickingLocation)
 * - 100% Bootstrap Icons (Rule 5), < 450 dòng (Rule 7), Rule 11, Rule 16
 */

const GOOGLE_TILES = {
  streets: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
  satellite: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
};

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function GoogleMapView({
  currentUserId,
  userLat,
  userLng,
  userCustomStatus,
  userCustomSong,
  userAvatar,
  gpsLoading,
  location,
  onRequestLocation,
  activeTab = 'social',
  stories = [],
  friends = [],
  onlinePeers = [],
  radarDistance = 'all',
  activeCircleFilter = null,
  isPickingLocation = false,
  setIsPickingLocation,
  onOpenStoryDetail,
  onOpenFriendDetail,
  onOpenGuestProfile,
  onOpenUserMenu,
  onOpenCreateStory,
  onOpenQuickSnap,
  onSetManualLocation
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const radarCircleRef = useRef(null);
  const itemMarkersMapRef = useRef(new Map());

  const [mapStyleType, setMapStyleType] = useState('streets');

  const safeLat = Number(userLat ?? location?.lat ?? location?.latitude ?? 10.7769);
  const safeLng = Number(userLng ?? location?.lng ?? location?.longitude ?? 106.7009);

  const onOpenStoryDetailRef = useRef(onOpenStoryDetail);
  onOpenStoryDetailRef.current = onOpenStoryDetail;
  const onOpenFriendDetailRef = useRef(onOpenFriendDetail);
  onOpenFriendDetailRef.current = onOpenFriendDetail;
  const onOpenGuestProfileRef = useRef(onOpenGuestProfile);
  onOpenGuestProfileRef.current = onOpenGuestProfile;
  const onOpenUserMenuRef = useRef(onOpenUserMenu);
  onOpenUserMenuRef.current = onOpenUserMenu;
  const onOpenCreateStoryRef = useRef(onOpenCreateStory);
  onOpenCreateStoryRef.current = onOpenCreateStory;
  const onSetManualLocationRef = useRef(onSetManualLocation);
  onSetManualLocationRef.current = onSetManualLocation;
  const isPickingLocationRef = useRef(isPickingLocation);
  isPickingLocationRef.current = isPickingLocation;
  const setIsPickingLocationRef = useRef(setIsPickingLocation);
  setIsPickingLocationRef.current = setIsPickingLocation;

  const isOwnerItem = (item) => Boolean(item && (item.id === currentUserId || item.hostId === currentUserId || item.user_id === currentUserId));
  const myActiveStory = useMemo(() => stories.find(s => isOwnerItem(s)) || null, [stories, currentUserId]);
  const myActiveStoryRef = useRef(myActiveStory);
  myActiveStoryRef.current = myActiveStory;
  const userCustomSongRef = useRef(userCustomSong);
  userCustomSongRef.current = userCustomSong;

  // 1. Khởi tạo Bản Đồ Google Maps qua Leaflet Core
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [safeLat, safeLng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
      maxZoom: 20,
      minZoom: 3
    });

    const tileLayer = L.tileLayer(GOOGLE_TILES[mapStyleType], { subdomains: '0123', maxZoom: 20 }).addTo(map);
    tileLayerRef.current = tileLayer;
    mapRef.current = map;
    window.__vivu_map = map;

    // Chuột phải cắm ghim nhanh
    map.on('contextmenu', (e) => {
      if (onSetManualLocationRef.current) {
        onSetManualLocationRef.current(e.latlng.lat, e.latlng.lng, 'Vị trí đã chọn trên Google Maps');
      }
    });

    // Chế độ nhấp chuột cắm ghim định vị máy tính
    map.on('click', (e) => {
      if (isPickingLocationRef.current) {
        if (onSetManualLocationRef.current) {
          onSetManualLocationRef.current(e.latlng.lat, e.latlng.lng, 'Vị trí đã chọn trên Google Maps');
        }
        if (setIsPickingLocationRef.current) {
          setIsPickingLocationRef.current(false);
        }
      }
    });

    return () => {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      for (const c of itemMarkersMapRef.current.values()) c.marker.remove();
      itemMarkersMapRef.current.clear();
      radarCircleRef.current?.remove();
      radarCircleRef.current = null;
      try { map.remove(); } catch { }
      mapRef.current = null;
    };
  }, []);

  // 2. Chuyển Đổi Kiểu Bản Đồ Google Đường Phố <-> Google Vệ Tinh
  const handleToggleMapStyle = () => {
    if (!tileLayerRef.current || !mapRef.current) return;
    const nextStyle = mapStyleType === 'streets' ? 'satellite' : 'streets';
    setMapStyleType(nextStyle);
    tileLayerRef.current.setUrl(GOOGLE_TILES[nextStyle]);
  };

  // 3. Con trỏ chuột khi bật chế độ cắm ghim
  useEffect(() => {
    if (mapContainerRef.current) {
      mapContainerRef.current.style.cursor = isPickingLocation ? 'crosshair' : '';
    }
  }, [isPickingLocation]);

  // 4. Cắm Ghim Chủ Sở Hữu (BẠN)
  useEffect(() => {
    if (!mapRef.current) return;
    const safeAvatar = userAvatar || '';
    const statusText = userCustomStatus || '';
    const song = userCustomSong || null;

    const ownerHtml = getOwnerBubbleHtml({ myActiveStory, song, statusText });

    if (!userMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'vivu-user-marker-container flex flex-col items-center select-none relative';
      el.style.cssText = 'overflow: visible; width: 44px; height: 44px; pointer-events: auto;';
      el.innerHTML = `
        <div class="user-bubble-slot absolute bottom-[46px] left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto">
          ${ownerHtml}
        </div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 pointer-events-none flex items-center justify-center -z-10">
          <div class="absolute inset-0 rounded-full bg-[rgba(0,229,255,0.2)] animate-ping"></div>
          <div class="absolute w-14 h-14 rounded-full border border-[rgba(0,229,255,0.45)] bg-[rgba(0,229,255,0.1)]"></div>
        </div>
        <div class="vivu-user-avatar-ring relative w-11 h-11 rounded-full p-[2px] ${myActiveStory ? 'bg-gradient-to-tr from-[#FF2A85] via-purple-500 to-[#7928CA] shadow-[0_0_16px_rgba(255,42,133,0.7)] animate-pulse' : 'bg-white border-2 border-[#10FFA0] shadow-[0_0_14px_rgba(16,255,160,0.65)]'} flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer">
          <div class="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
            ${safeAvatar ? `<img src="${safeAvatar}" alt="BẠN" class="user-pin-avatar w-full h-full object-cover" />` : `<div class="w-full h-full bg-white flex items-center justify-center text-neutral-400"><i class="bi bi-person-fill text-lg"></i></div>`}
          </div>
          <button id="btn-quick-create-story" type="button" class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#FF2A85] text-white border-2 border-white shadow-[0_0_8px_#FF2A85] flex items-center justify-center z-20 hover:scale-110 active:scale-90 transition-transform cursor-pointer" title="Đăng Story">
            <i class="bi bi-plus-lg text-[10px] font-bold"></i>
          </button>
        </div>
        <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-white -mt-0.5 filter drop-shadow-[0_2px_4px_rgba(0,229,255,0.4)]"></div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (e.target.closest('#btn-play-owner-song')) {
          const curSong = userCustomSongRef.current;
          if (curSong) {
            const isPlaying = storyAudioPlayer.togglePlay(curSong);
            const playIcon = el.querySelector('#btn-play-owner-song i');
            if (playIcon) playIcon.className = isPlaying ? 'bi bi-pause-fill text-xs' : 'bi bi-play-fill text-xs';
          }
          return;
        }
        if (e.target.closest('#btn-quick-create-story')) {
          if (onOpenCreateStoryRef.current) onOpenCreateStoryRef.current();
          return;
        }
        if (myActiveStoryRef.current && (e.target.closest('#btn-view-owner-story') || e.target.closest('.user-bubble-slot') || e.target.closest('.user-pin-avatar'))) {
          if (onOpenStoryDetailRef.current) {
            onOpenStoryDetailRef.current(myActiveStoryRef.current);
            return;
          }
        }
        if (onOpenUserMenuRef.current) {
          onOpenUserMenuRef.current();
        }
      });

      const icon = L.divIcon({ html: el, className: 'vivu-custom-div-icon', iconSize: [44, 44], iconAnchor: [22, 44] });
      userMarkerRef.current = L.marker([safeLat, safeLng], { icon, zIndexOffset: 1000 }).addTo(mapRef.current);
    } else {
      userMarkerRef.current.setLatLng([safeLat, safeLng]);
      const el = userMarkerRef.current.getElement();
      if (el) {
        const bubbleSlot = el.querySelector('.user-bubble-slot');
        if (bubbleSlot) bubbleSlot.innerHTML = ownerHtml;
        const avatarImg = el.querySelector('.user-pin-avatar');
        if (avatarImg && safeAvatar && avatarImg.src !== safeAvatar) avatarImg.src = safeAvatar;
        const ringEl = el.querySelector('.vivu-user-avatar-ring');
        if (ringEl) {
          ringEl.className = `vivu-user-avatar-ring relative w-11 h-11 rounded-full p-[2px] ${myActiveStory ? 'bg-gradient-to-tr from-[#FF2A85] via-purple-500 to-[#7928CA] shadow-[0_0_16px_rgba(255,42,133,0.7)] animate-pulse' : 'bg-white border-2 border-[#10FFA0] shadow-[0_0_14px_rgba(16,255,160,0.65)]'} flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer`;
        }
      }
    }
  }, [safeLat, safeLng, userAvatar, userCustomStatus, userCustomSong, myActiveStory]);

  // 5. Vòng Tròn Radar Quét Không Gian
  useEffect(() => {
    if (!mapRef.current) return;
    const radiusMeters = radarDistance === '1km' ? 1000 : radarDistance === '3km' ? 3000 : 5000;
    if (!radarCircleRef.current) {
      radarCircleRef.current = L.circle([safeLat, safeLng], {
        radius: radiusMeters,
        color: '#00E5FF',
        weight: 1.5,
        opacity: 0.6,
        fillColor: '#00E5FF',
        fillOpacity: 0.04,
        dashArray: '6, 8',
        interactive: false
      }).addTo(mapRef.current);
    } else {
      radarCircleRef.current.setLatLng([safeLat, safeLng]);
      radarCircleRef.current.setRadius(radiusMeters);
    }
  }, [safeLat, safeLng, radarDistance]);

  // 6. Ghim Bạn Bè & Stories (Phân tán <60m - Rule 16)
  useEffect(() => {
    if (!mapRef.current) return;
    const isFriendsMode = activeTab === 'friends' || Boolean(activeCircleFilter);
    let rawItems = [];

    if (isFriendsMode) {
      rawItems = (friends || []).filter(f => f && (f.isOnline === true || f.is_online === true));
    } else {
      const peerStories = (stories || []).filter(s => s && !isOwnerItem(s));
      const activePeerIdsWithStory = new Set(peerStories.map(s => s.hostId || s.id));

      const peersWithoutStory = (onlinePeers || [])
        .filter(p => p && p.id && !isOwnerItem(p) && !activePeerIdsWithStory.has(p.id))
        .map(p => ({
          id: `online-peer-${p.id}`,
          user_id: p.id,
          hostId: p.id,
          hostName: p.full_name || p.name || 'Người dùng VIVU',
          hostAvatar: p.avatar_url || p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          title: p.custom_status || 'Đang trực tuyến',
          custom_status: p.custom_status || 'Đang trực tuyến',
          realLat: Number(p.lat),
          realLng: Number(p.lng),
          user_code: p.user_code || '',
          isOnline: true,
          custom_song: p.custom_song || null,
          activeStory: p.active_story || p.activeStory || null
        }));

      rawItems = [...peerStories, ...peersWithoutStory];
    }

    const usedKeys = new Set();

    rawItems.forEach((item) => {
      if (!item || isOwnerItem(item)) return;
      const rawLat = Number(item.realLat ?? item.lat ?? item.latitude);
      const rawLng = Number(item.realLng ?? item.lng ?? item.longitude);
      if (isNaN(rawLat) || isNaN(rawLng)) return;

      let iLat = rawLat;
      let iLng = rawLng;
      const isCoLocated = getDistanceKm(safeLat, safeLng, rawLat, rawLng) * 1000 < 60;
      if (isCoLocated) {
        const hash = Math.abs(String(item.id || 'peer').split('').reduce((a, c) => a + c.charCodeAt(0), 0));
        const angle = (hash % 360) * (Math.PI / 180);
        iLat = safeLat + 0.0018 * Math.sin(angle);
        iLng = safeLng + 0.0022 * Math.cos(angle);
      }

      const markerKey = String(item.id || item.user_id || `peer-${iLat}-${iLng}`);
      usedKeys.add(markerKey);

      const isOffline = item.isOnline === false;
      const hostAvatar = item.hostAvatar || item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
      const displayName = item.hostName || item.name || 'Bạn VIVU';
      const hasStory = Boolean(item.activeStory || item.image || item.bg_gradient);

      const cached = itemMarkersMapRef.current.get(markerKey);
      if (cached) {
        cached.marker.setLatLng([iLat, iLng]);
        if (cached.el) {
          const bubbleSlot = cached.el.querySelector('.peer-bubble-slot');
          if (bubbleSlot) bubbleSlot.innerHTML = getPeerBubbleHtml(item, isCoLocated);
          const img = cached.el.querySelector('img');
          if (img && img.src !== hostAvatar) img.src = hostAvatar;
          const ring = cached.el.querySelector('.vivu-peer-avatar-ring');
          if (ring) {
            ring.className = `vivu-peer-avatar-ring relative w-11 h-11 rounded-full p-[2px] ${hasStory ? 'bg-gradient-to-tr from-[#FF2A85] via-purple-500 to-[#7928CA] shadow-[0_0_16px_rgba(255,42,133,0.7)] animate-pulse' : (isOffline ? 'bg-white border-2 border-neutral-400' : 'bg-white border-2 border-[#00E5FF] shadow-[0_0_14px_rgba(0,229,255,0.75)]')} flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer`;
          }
        }
        cached.item = item;
      } else {
        const el = document.createElement('div');
        el.className = 'vivu-peer-marker-container flex flex-col items-center select-none relative';
        el.style.cssText = 'overflow: visible; width: 44px; height: 44px; pointer-events: auto;';
        el.innerHTML = `
          <div class="peer-bubble-slot absolute bottom-[46px] left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto">
            ${getPeerBubbleHtml(item, isCoLocated)}
          </div>
          <div class="vivu-peer-avatar-ring relative w-11 h-11 rounded-full p-[2px] ${hasStory ? 'bg-gradient-to-tr from-[#FF2A85] via-purple-500 to-[#7928CA] shadow-[0_0_16px_rgba(255,42,133,0.7)] animate-pulse' : (isOffline ? 'bg-white border-2 border-neutral-400' : 'bg-white border-2 border-[#00E5FF] shadow-[0_0_14px_rgba(0,229,255,0.75)]')} flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer">
            <div class="w-full h-full rounded-full overflow-hidden bg-[#151619]">
              <img src="${hostAvatar}" alt="${displayName}" class="w-full h-full object-cover" />
            </div>
            <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white text-[9px] flex items-center justify-center shadow-xs border border-neutral-200">
              <i class="bi ${hasStory ? 'bi-camera-fill text-[#FF2A85]' : 'bi-person-fill text-[#00838F]'}"></i>
            </div>
          </div>
          <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-white -mt-0.5 filter drop-shadow-[0_2px_4px_rgba(0,229,255,0.4)]"></div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const curItem = itemMarkersMapRef.current.get(markerKey)?.item || item;
          const curSong = curItem.custom_song || curItem.songData || curItem.music || null;
          if (e.target.closest('#btn-play-peer-song') && curSong) {
            const isPlaying = storyAudioPlayer.togglePlay(curSong);
            const playIcon = el.querySelector('#btn-play-peer-song i');
            if (playIcon) playIcon.className = isPlaying ? 'bi bi-pause-fill text-xs' : 'bi bi-play-fill text-xs';
            return;
          }
          const targetStory = curItem.activeStory || (curItem.category === 'moment' || curItem.image || curItem.bg_gradient ? curItem : null);
          if (targetStory && (e.target.closest('#btn-view-peer-story') || e.target.closest('.vivu-story-gif-box'))) {
            if (onOpenStoryDetailRef.current) {
              onOpenStoryDetailRef.current(targetStory);
              return;
            }
          }
          if (isFriendsMode || curItem.isFriend) {
            if (onOpenFriendDetailRef.current) onOpenFriendDetailRef.current(curItem);
          } else {
            if (onOpenGuestProfileRef.current) onOpenGuestProfileRef.current(curItem);
          }
        });

        const icon = L.divIcon({ html: el, className: 'vivu-peer-div-icon', iconSize: [44, 44], iconAnchor: [22, 44] });
        const marker = L.marker([iLat, iLng], { icon, zIndexOffset: isCoLocated ? 600 : 500 }).addTo(mapRef.current);
        itemMarkersMapRef.current.set(markerKey, { marker, el, item });
      }
    });

    for (const [key, cached] of itemMarkersMapRef.current.entries()) {
      if (!usedKeys.has(key)) {
        cached.marker.remove();
        itemMarkersMapRef.current.delete(key);
      }
    }
  }, [stories, friends, onlinePeers, activeTab, activeCircleFilter, safeLat, safeLng]);

  const handleRecenterGps = () => {
    if (onRequestLocation) onRequestLocation();
    mapRef.current?.flyTo([safeLat, safeLng], 16.5, { duration: 0.8 });
  };

  const handleResetCompass = () => {
    mapRef.current?.flyTo([safeLat, safeLng], 16, { duration: 0.8 });
  };

  const handleFitPeers = () => {
    if (!mapRef.current) return;
    const group = [L.latLng(safeLat, safeLng)];
    for (const cached of itemMarkersMapRef.current.values()) group.push(cached.marker.getLatLng());
    if (group.length > 1) {
      mapRef.current.fitBounds(L.latLngBounds(group), { maxZoom: 16.5, padding: [40, 40] });
    } else {
      handleRecenterGps();
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none font-sans">
      <div ref={mapContainerRef} className="absolute inset-0 z-0 w-full h-full bg-[#E8ECEF]" />

      {/* Banner Hướng Dẫn Khi Bật Chế Độ Cắm Ghim Định Vị Máy Tính */}
      {isPickingLocation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-[#0F121C]/95 border border-[#00E5FF]/60 text-white px-4 py-2.5 rounded-2xl shadow-[0_8px_32px_rgba(0,229,255,0.4)] backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-200">
          <i className="bi bi-geo-alt-fill text-[#00E5FF] text-lg animate-bounce"></i>
          <span className="text-xs font-semibold">Nhấp vào bất kỳ điểm nào trên bản đồ để đặt vị trí máy tính</span>
          <button
            type="button"
            onClick={() => setIsPickingLocation && setIsPickingLocation(false)}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            Hủy
          </button>
        </div>
      )}

      <RightActionStack
        onResetCompass={handleResetCompass}
        onFitPeers={handleFitPeers}
        onQuickSnap={onOpenQuickSnap}
        onRecenterGps={handleRecenterGps}
        onToggleMapStyle={handleToggleMapStyle}
        isPickingLocation={isPickingLocation}
        onTogglePickLocation={() => setIsPickingLocation && setIsPickingLocation(!isPickingLocation)}
        mapStyleType={mapStyleType}
        hasPeers={itemMarkersMapRef.current.size > 0 || (onlinePeers && onlinePeers.length > 0)}
        isGpsLoading={gpsLoading}
      />
    </div>
  );
}
