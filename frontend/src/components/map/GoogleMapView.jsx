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
import { GOOGLE_TILES, getDistanceKm } from './mapTileConstants';
import { attachMapFlyToGuard } from './mapFlyToGuard';
import { processPeerItem } from './mapPeerProcessor';

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

    // Bộ đệm thông minh Safe Guard cho map.flyTo
    attachMapFlyToGuard(map);
    window.__vivu_map = map;

    // Chuột phải cắm ghim nhanh - Chỉ khi đang bật chế độ chọn vị trí (isPickingLocation) trên PC
    map.on('contextmenu', (e) => {
      const orig = e.originalEvent;
      // Tuyệt đối không can thiệp cử chỉ chạm/nhấn giữ trên màn hình cảm ứng để tránh di chuyển giọt nước linh tinh
      if (orig && (orig.pointerType === 'touch' || orig.type === 'touchstart' || orig.touches?.length)) {
        if (orig.preventDefault) orig.preventDefault();
        return;
      }
      if (isPickingLocationRef.current && onSetManualLocationRef.current) {
        onSetManualLocationRef.current(e.latlng.lat, e.latlng.lng, 'Vị trí đã chọn trên Google Maps');
        if (setIsPickingLocationRef.current) {
          setIsPickingLocationRef.current(false);
        }
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

    const ownerStoriesList = (myActiveStories && myActiveStories.length > 0) ? myActiveStories : (myActiveStory ? [myActiveStory] : []);
    const ownerHasStory = ownerStoriesList.length > 0;
    const ownerStoryCount = ownerStoriesList.length;
    const ownerFirstStory = ownerStoriesList[0]?.activeStory || ownerStoriesList[0] || null;
    const ownerStoryPreview = ownerFirstStory?.image || ownerFirstStory?.dual_image || null;
    const ownerStoryTitle = ownerFirstStory?.title || null;
    const ownerHasSong = Boolean(song);
    const ownerSongTitle = song?.title || song?.name || null;

    const bodyHtml = getMarkerBodyHtml({
      skinMode: ownerSkin,
      avatar: safeAvatar,
      name: 'BẠN',
      isOwner: true,
      hasStory: ownerHasStory,
      storyCount: ownerStoryCount,
      storyPreviewImage: ownerStoryPreview,
      storyTitle: ownerStoryTitle,
      hasSong: ownerHasSong,
      songTitle: ownerSongTitle,
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
  }, [safeLat, safeLng, userAvatar, userCustomStatus, userCustomSong, userCustomChibi, userCustomChibiExpiresAt, userPinSkin, userPinMascot, userPinAction, myActiveStory, myActiveStories]);

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
        const fStories = (stories || []).filter(s => s && (s.hostId === f.id || s.host_id === f.id) && !s.id?.startsWith('live-peer-'));
        return fStories.length > 0 ? { ...f, stories: fStories } : f;
      });
    } else {
      const peerStoriesByHost = new Map();
      (stories || []).filter(s => s && !isOwnerItem(s) && !s.id?.startsWith('live-peer-')).forEach(s => {
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
      const peerData = processPeerItem(item, safeLat, safeLng, onlinePeers, friends);
      if (!peerData) return;
      const { iLat, iLng, isCoLocated, markerKey, peerBodyHtml } = peerData;
      usedKeys.add(markerKey);

      const cached = itemMarkersMapRef.current.get(markerKey);
      if (cached) {
        cached.marker.setLatLng([iLat, iLng]);
        if (cached.el && !cached.el._isLongPressActive) {
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
