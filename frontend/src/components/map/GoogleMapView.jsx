import { DEFAULT_WHITE_PERSON_AVATAR } from '../../utils/avatarUtils';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import RightActionStack from './RightActionStack';
import { storyAudioPlayer } from '../../data/trendingSongs';
import { getOwnerBubbleHtml, getPeerBubbleHtml, getMarkerBodyHtml, resolveMarkerSkin } from './mapMarkerHelpers';
import { bindOwnerMarkerEvents, bindPeerMarkerEvents } from './mapMarkerEvents';
import { playChibiSound, getChibiMascotById, getChibiDataUrl } from '../../data/chibiMascotData';
import { getMascotActionDataUrl } from '../../data/messengerZaloMascotData';

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
  userCustomChibi = null,
  userCustomChibiExpiresAt = null,
  userPinSkin = 'auto',
  userPinMascot = null,
  userPinAction = null,
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
  onSyncFromPhone,
  onOpenStoryDetail,
  onOpenStoryChat,
  onOpenUserProfile,
  onOpenFriendDetail,
  onOpenGuestProfile,
  onOpenUserMenu,
  onOpenCreateStory,
  onOpenQuickSnap,
  onOpenMemeTroll,
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

  const onOpenStoryDetailRef = useRef(onOpenStoryDetail); onOpenStoryDetailRef.current = onOpenStoryDetail;
  const onOpenStoryChatRef = useRef(onOpenStoryChat); onOpenStoryChatRef.current = onOpenStoryChat;
  const onOpenUserProfileRef = useRef(onOpenUserProfile); onOpenUserProfileRef.current = onOpenUserProfile;
  const onOpenFriendDetailRef = useRef(onOpenFriendDetail); onOpenFriendDetailRef.current = onOpenFriendDetail;
  const onOpenGuestProfileRef = useRef(onOpenGuestProfile); onOpenGuestProfileRef.current = onOpenGuestProfile;
  const onOpenUserMenuRef = useRef(onOpenUserMenu); onOpenUserMenuRef.current = onOpenUserMenu;
  const onOpenCreateStoryRef = useRef(onOpenCreateStory); onOpenCreateStoryRef.current = onOpenCreateStory;
  const onSetManualLocationRef = useRef(onSetManualLocation); onSetManualLocationRef.current = onSetManualLocation;
  const onOpenMemeTrollRef = useRef(onOpenMemeTroll); onOpenMemeTrollRef.current = onOpenMemeTroll;
  const isPickingLocationRef = useRef(isPickingLocation); isPickingLocationRef.current = isPickingLocation;
  const setIsPickingLocationRef = useRef(setIsPickingLocation); setIsPickingLocationRef.current = setIsPickingLocation;

  const isOwnerItem = (item) => Boolean(
    item && (
      item.id === currentUserId || 
      item.hostId === currentUserId || 
      item.host_id === currentUserId || 
      item.user_id === currentUserId ||
      item.isOwnerStory === true
    )
  );
  const myActiveStories = useMemo(() => stories.filter(s => isOwnerItem(s)), [stories, currentUserId]);
  const myActiveStory = useMemo(() => myActiveStories[0] || null, [myActiveStories]);
  const myActiveStoryRef = useRef(myActiveStories.length > 0 ? myActiveStories : myActiveStory);
  myActiveStoryRef.current = myActiveStories.length > 0 ? myActiveStories : myActiveStory;
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

    const ownerSkin = resolveMarkerSkin({
      manualSkin: userPinSkin,
      hasStory: Boolean(myActiveStory),
      hasChibi: Boolean(userCustomChibi),
      hasAction: Boolean(userPinMascot && userPinAction)
    });

    const ownerHtml = getOwnerBubbleHtml({ 
      myActiveStory,
      myActiveStories,
      song,
      statusText, 
      chibiId: userCustomChibi,
      actionMascot: userPinMascot,
      actionId: userPinAction,
      chibiExpiresAt: userCustomChibiExpiresAt
    });

    const bodyHtml = getMarkerBodyHtml({
      skinMode: ownerSkin,
      avatar: safeAvatar,
      name: 'BẠN',
      isOwner: true,
      hasStory: Boolean(myActiveStory),
      actionDataUrl: userPinMascot && userPinAction ? getMascotActionDataUrl(userPinMascot, userPinAction) : null,
      chibiDataUrl: userCustomChibi ? getChibiDataUrl(userCustomChibi) : null,
      actionSound: userPinAction || (userCustomChibi ? getChibiMascotById(userCustomChibi)?.soundType : null)
    });

    if (!userMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'vivu-user-marker-container flex flex-col items-center select-none relative';
      el.style.cssText = 'overflow: visible; width: 56px; height: 56px; pointer-events: auto;';
      el.innerHTML = `
        <div class="user-bubble-slot absolute bottom-[56px] left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto">
          ${ownerHtml}
        </div>
        <div class="user-body-slot pointer-events-auto">
          ${bodyHtml}
        </div>
      `;

      bindOwnerMarkerEvents(el, {
        userCustomSongRef,
        myActiveStoryRef,
        onOpenCreateStoryRef,
        onOpenStoryDetailRef,
        onOpenUserMenuRef,
        storyAudioPlayer
      });

      const icon = L.divIcon({ html: el, className: 'vivu-custom-div-icon', iconSize: [56, 56], iconAnchor: [28, 56] });
      userMarkerRef.current = L.marker([safeLat, safeLng], { icon, zIndexOffset: 1000 }).addTo(mapRef.current);
      userMarkerRef.current.on('click', (e) => {
        if (e.originalEvent) {
          const target = e.originalEvent.target;
          if (target && target.closest) {
            if (target.closest('#btn-quick-create-story')) {
              if (onOpenCreateStoryRef.current) onOpenCreateStoryRef.current();
              return;
            }
            if (target.closest('#btn-play-owner-song')) {
              return;
            }
          }
        }
        if (onOpenUserMenuRef.current) onOpenUserMenuRef.current();
      });
    } else {
      userMarkerRef.current.setLatLng([safeLat, safeLng]);
      const el = userMarkerRef.current.getElement();
      if (el) {
        const bubbleSlot = el.querySelector('.user-bubble-slot');
        if (bubbleSlot) bubbleSlot.innerHTML = ownerHtml;
        const bodySlot = el.querySelector('.user-body-slot');
        if (bodySlot) bodySlot.innerHTML = bodyHtml;
        bindOwnerMarkerEvents(el, {
          userCustomSongRef,
          myActiveStoryRef,
          onOpenCreateStoryRef,
          onOpenStoryDetailRef,
          onOpenUserMenuRef,
          storyAudioPlayer
        });
      }
    }
  }, [safeLat, safeLng, userAvatar, userCustomStatus, userCustomSong, userCustomChibi, userCustomChibiExpiresAt, userPinSkin, userPinMascot, userPinAction, myActiveStory]);

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

  // 5.1 Tự động điều chỉnh góc nhìn bản đồ (fitBounds) bao quát toàn bộ bạn bè (Rule 24)
  const prevActiveTabRef = useRef(activeTab);
  useEffect(() => {
    if (!mapRef.current) return;
    const isFriendsTab = activeTab === 'friends' || Boolean(activeCircleFilter);
    const tabJustChanged = prevActiveTabRef.current !== activeTab;
    prevActiveTabRef.current = activeTab;

    if (isFriendsTab && tabJustChanged) {
      const validPoints = [L.latLng(safeLat, safeLng)];
      (friends || []).forEach(f => {
        const lat = Number(f.realLat ?? f.lat);
        const lng = Number(f.realLng ?? f.lng);
        if (!isNaN(lat) && !isNaN(lng)) validPoints.push(L.latLng(lat, lng));
      });
      if (validPoints.length > 1) {
        mapRef.current.fitBounds(L.latLngBounds(validPoints), { padding: [50, 50], maxZoom: 16.5 });
        if (mapRef.current.getZoom() < 14.8) mapRef.current.setZoom(14.8);
      } else {
        mapRef.current.flyTo([safeLat, safeLng], 16.2, { duration: 0.8 });
      }
    }
  }, [activeTab, activeCircleFilter, friends, safeLat, safeLng]);

  // 6. Ghim Bạn Bè & Stories (Phân tán <60m - Rule 16)
  useEffect(() => {
    if (!mapRef.current) return;
    const isFriendsMode = activeTab === 'friends' || Boolean(activeCircleFilter);
    let rawItems = [];

    if (isFriendsMode) {
      rawItems = (friends || []).filter(f => f && !isOwnerItem(f)).map(f => {
        const fStories = (stories || []).filter(s => s && (s.hostId === f.id || s.host_id === f.id));
        return fStories.length > 0 ? { ...f, stories: fStories } : f;
      });
    } else {
      const peerStoriesByHost = new Map();
      (stories || []).filter(s => s && !isOwnerItem(s)).forEach(s => {
        const hId = s.hostId || s.host_id || s.id;
        if (!peerStoriesByHost.has(hId)) {
          peerStoriesByHost.set(hId, { ...s, stories: [s] });
        } else {
          peerStoriesByHost.get(hId).stories.push(s);
        }
      });
      const groupedPeerStories = Array.from(peerStoriesByHost.values());
      const activePeerIdsWithStory = new Set(peerStoriesByHost.keys());
      const nonStoryOnlinePeers = (onlinePeers || []).filter(p => p && !isOwnerItem(p) && !activePeerIdsWithStory.has(p.id));
      rawItems = [...groupedPeerStories, ...nonStoryOnlinePeers];
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
      const hostAvatar = item.hostAvatar || item.avatar || DEFAULT_WHITE_PERSON_AVATAR;
      const displayName = item.hostName || item.host_name || item.name || 'Người dùng VIVU';
      const hasStory = Boolean(item.activeStory || item.image || item.bg_gradient);

      const peerSkin = resolveMarkerSkin({
        manualSkin: item.pin_skin,
        hasStory: Boolean(hasStory),
        hasChibi: Boolean(item.custom_chibi || item.chibiId),
        hasAction: Boolean(item.pin_mascot && item.pin_action)
      });
      const peerActionDataUrl = item.pin_mascot && item.pin_action ? getMascotActionDataUrl(item.pin_mascot, item.pin_action) : null;
      const peerChibiDataUrl = (item.custom_chibi || item.chibiId) ? getChibiDataUrl(item.custom_chibi || item.chibiId) : null;
      const peerBodyHtml = getMarkerBodyHtml({
        skinMode: peerSkin,
        avatar: hostAvatar,
        name: displayName,
        isOwner: false,
        hasStory: Boolean(hasStory),
        isOffline,
        actionDataUrl: peerActionDataUrl,
        chibiDataUrl: peerChibiDataUrl,
        actionSound: item.pin_action
      });

      const cached = itemMarkersMapRef.current.get(markerKey);
      if (cached) {
        cached.marker.setLatLng([iLat, iLng]);
        if (cached.el) {
          const bubbleSlot = cached.el.querySelector('.peer-bubble-slot');
          if (bubbleSlot) bubbleSlot.innerHTML = getPeerBubbleHtml(item, isCoLocated);
          const bodySlot = cached.el.querySelector('.peer-body-slot');
          if (bodySlot) bodySlot.innerHTML = peerBodyHtml;
        }
        cached.item = item;
      } else {
        const el = document.createElement('div');
        el.className = 'vivu-peer-marker-container flex flex-col items-center select-none relative';
        el.style.cssText = 'overflow: visible; width: 56px; height: 56px; pointer-events: auto;';
        el.innerHTML = `
          <div class="peer-bubble-slot absolute bottom-[54px] left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto">
            ${getPeerBubbleHtml(item, isCoLocated)}
          </div>
          <div class="peer-body-slot">
            ${peerBodyHtml}
          </div>
        `;

        bindPeerMarkerEvents(el, {
          getItem: () => itemMarkersMapRef.current.get(markerKey)?.item || item,
          isFriendsMode,
          storyAudioPlayer,
          onOpenStoryDetailRef,
          onOpenMemeTrollRef,
          onOpenUserProfileRef,
          onOpenFriendDetailRef,
          onOpenGuestProfileRef
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

      <RightActionStack
        onResetCompass={handleResetCompass}
        onFitPeers={handleFitPeers}
        onRecenterGps={handleRecenterGps}
        onToggleMapStyle={handleToggleMapStyle}
        mapStyleType={mapStyleType}
        hasPeers={itemMarkersMapRef.current.size > 0 || (onlinePeers && onlinePeers.length > 0)}
        isGpsLoading={gpsLoading}
      />
    </div>
  );
}
