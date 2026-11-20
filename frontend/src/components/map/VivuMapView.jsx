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
import { VIVU_MAP_TILES, TILE_ATTRIBUTION, getDistanceKm } from './mapTileConstants';
import { attachMapFlyToGuard } from './mapFlyToGuard';
import { processPeerItem } from './mapPeerProcessor';

// Bảng màu gradient Neon Rainbow Trail: #00E5FF -> #7928CA -> #FF2A85
const NEON_RAINBOW_PALETTE = ['#00E5FF', '#29B6F6', '#5C6BC0', '#7928CA', '#BA24B2', '#FF2A85'];

export default function VivuMapView({
  currentUserId,
  currentUserName,
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
  viewMode = 'social',
  stories = [],
  friends = [],
  onlinePeers = [],
  radarDistance = 'all',
  isAdjustingRadius = false,
  isRadarScanning = false,
  isNavigationActive = false,
  navTarget = null,
  activeCircleFilter = null,
  onClearCircleFilter,
  isPickingLocation = false,
  setIsPickingLocation,
  onSyncFromPhone,
  onOpenStoryDetail,
  onOpenStoryChat,
  onOpenUserProfile,
  onOpenFriendDetail,
  onOpenGuestProfile,
  onOpenUserMenu,
  onOpenProfile,
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

  // Refs cho hoạt cảnh mượt mà Lerp và Vệt cầu vồng neon
  const animFrameIdRef = useRef(null);
  const currentMarkerPosRef = useRef(null);
  const lastTargetPosRef = useRef(null);
  const gpsHistoryRef = useRef([]);
  const trailPolylinesRef = useRef([]);

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

  // 1. Khởi tạo Bản Đồ Vivu Live Map (OpenStreetMap & CartoDB Voyager qua Leaflet)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [safeLat, safeLng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
      maxZoom: 19,
      minZoom: 3
    });

    const activeTileUrl = VIVU_MAP_TILES[mapStyleType] || VIVU_MAP_TILES.streets;
    const tileLayer = L.tileLayer(activeTileUrl, {
      subdomains: mapStyleType === 'streets' ? 'abcd' : 'abc',
      maxZoom: 19,
      attribution: TILE_ATTRIBUTION
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapRef.current = map;

    // Bộ đệm thông minh Safe Guard cho map.flyTo
    attachMapFlyToGuard(map);
    window.__vivu_map = map;

    // Chuột phải cắm ghim nhanh - Chỉ khi đang bật chế độ chọn vị trí (isPickingLocation) trên PC
    map.on('contextmenu', (e) => {
      const orig = e.originalEvent;
      if (orig && (orig.pointerType === 'touch' || orig.type === 'touchstart' || orig.touches?.length)) {
        if (orig.preventDefault) orig.preventDefault();
        return;
      }
      if (isPickingLocationRef.current && onSetManualLocationRef.current) {
        onSetManualLocationRef.current(e.latlng.lat, e.latlng.lng, 'Vị trí đã chọn trên bản đồ');
        if (setIsPickingLocationRef.current) {
          setIsPickingLocationRef.current(false);
        }
      }
    });

    // Chế độ nhấp chuột cắm ghim định vị máy tính
    map.on('click', (e) => {
      if (isPickingLocationRef.current) {
        if (onSetManualLocationRef.current) {
          onSetManualLocationRef.current(e.latlng.lat, e.latlng.lng, 'Vị trí đã chọn trên bản đồ');
        }
        if (setIsPickingLocationRef.current) {
          setIsPickingLocationRef.current(false);
        }
      }
    });

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      trailPolylinesRef.current.forEach(p => p.remove());
      trailPolylinesRef.current = [];
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

  // 2. Chuyển Đổi Kiểu Bản Đồ Đường Phố (CartoDB) <-> Vệ Tinh (ESRI) <-> OSM
  const handleToggleMapStyle = () => {
    if (!tileLayerRef.current || !mapRef.current) return;
    const nextStyle = mapStyleType === 'streets' ? 'satellite' : 'streets';
    setMapStyleType(nextStyle);
    const nextTileUrl = VIVU_MAP_TILES[nextStyle] || VIVU_MAP_TILES.streets;
    tileLayerRef.current.setUrl(nextTileUrl);
  };

  // 3. Con trỏ chuột khi bật chế độ cắm ghim
  useEffect(() => {
    if (mapContainerRef.current) {
      mapContainerRef.current.style.cursor = isPickingLocation ? 'crosshair' : '';
    }
  }, [isPickingLocation]);

  // Hàm vẽ vệt chuyển động cầu vồng neon (Neon Rainbow Trail) từ 5-8 tọa độ thật gần nhất
  const renderNeonRainbowTrail = (map, history) => {
    // Xóa toàn bộ đoạn polyline cũ
    trailPolylinesRef.current.forEach(layer => layer.remove());
    trailPolylinesRef.current = [];

    if (!map || !history || history.length < 2) return;

    const numSegments = history.length - 1;
    for (let i = 0; i < numSegments; i++) {
      const p0 = history[i];
      const p1 = history[i + 1];
      const frac = numSegments > 1 ? i / (numSegments - 1) : 1;
      const colorIdx = Math.min(
        NEON_RAINBOW_PALETTE.length - 1,
        Math.floor(frac * (NEON_RAINBOW_PALETTE.length - 1))
      );
      const color = NEON_RAINBOW_PALETTE[colorIdx];
      // Mờ dần về sau (đuôi mờ 0.2, đầu mới nhất 0.85)
      const opacity = Math.min(0.85, Math.max(0.2, 0.2 + 0.65 * frac));

      // Lớp phát sáng neon bên dưới (glow)
      const glowLine = L.polyline([p0, p1], {
        color,
        weight: 8,
        opacity: opacity * 0.35,
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false
      }).addTo(map);

      // Lớp nét chính rực rỡ
      const coreLine = L.polyline([p0, p1], {
        color,
        weight: 4,
        opacity,
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false
      }).addTo(map);

      trailPolylinesRef.current.push(glowLine, coreLine);
    }
  };

  // 4. Cắm Ghim Chủ Sở Hữu (BẠN), Nội Suy Lerp Chuyển Động Mượt Mà & Vẽ Vệt Cầu Vồng Neon
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

    // KHỞI TẠO MARKER LẦN ĐẦU
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
      currentMarkerPosRef.current = { lat: safeLat, lng: safeLng };
      lastTargetPosRef.current = { lat: safeLat, lng: safeLng };
      gpsHistoryRef.current = [[safeLat, safeLng]];

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
      // CẬP NHẬT GIAO DIỆN MARKER HIỆN CÓ
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

      // KIỂM TRA TỌA ĐỘ GPS CÓ THAY ĐỔI ĐỂ KÍCH HOẠT LERP & VẼ VỆT CẦU VỒNG NEON
      const prevTarget = lastTargetPosRef.current || { lat: safeLat, lng: safeLng };
      const hasMoved = Math.abs(prevTarget.lat - safeLat) > 0.000005 || Math.abs(prevTarget.lng - safeLng) > 0.000005;

      if (hasMoved) {
        lastTargetPosRef.current = { lat: safeLat, lng: safeLng };

        // Lưu lịch sử GPS thật (5-8 tọa độ gần nhất)
        const history = gpsHistoryRef.current;
        const lastHistPoint = history[history.length - 1];
        if (!lastHistPoint || Math.abs(lastHistPoint[0] - safeLat) > 0.00001 || Math.abs(lastHistPoint[1] - safeLng) > 0.00001) {
          history.push([safeLat, safeLng]);
          if (history.length > 8) {
            gpsHistoryRef.current = history.slice(-8);
          }
          // Vẽ lại vệt neon cầu vồng từ lịch sử tọa độ GPS thật
          renderNeonRainbowTrail(mapRef.current, gpsHistoryRef.current);
        }

        // Hủy animation frame cũ nếu đang chạy
        if (animFrameIdRef.current) {
          cancelAnimationFrame(animFrameIdRef.current);
          animFrameIdRef.current = null;
        }

        const startLat = currentMarkerPosRef.current?.lat ?? safeLat;
        const startLng = currentMarkerPosRef.current?.lng ?? safeLng;
        const targetLat = safeLat;
        const targetLng = safeLng;

        const distKm = getDistanceKm(startLat, startLng, targetLat, targetLng);
        // Nếu nhảy khoảng cách quá xa (> 50km, vd đổi thành phố) thì snap thẳng
        if (distKm > 50 || distKm < 0.000005) {
          currentMarkerPosRef.current = { lat: targetLat, lng: targetLng };
          userMarkerRef.current.setLatLng([targetLat, targetLng]);
        } else {
          // CHUYỂN ĐỘNG LERP MƯỢT MÀ BẰNG requestAnimationFrame (~800ms)
          const duration = 800; // ms
          const startTime = performance.now();

          const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Hàm chuyển động êm cubic ease-out: 1 - (1 - p)^3
            const ease = 1 - Math.pow(1 - progress, 3);

            const curLat = startLat + (targetLat - startLat) * ease;
            const curLng = startLng + (targetLng - startLng) * ease;

            currentMarkerPosRef.current = { lat: curLat, lng: curLng };
            if (userMarkerRef.current) {
              userMarkerRef.current.setLatLng([curLat, curLng]);
            }

            if (progress < 1) {
              animFrameIdRef.current = requestAnimationFrame(step);
            } else {
              // Điểm kết thúc tuyệt đối 100% là tọa độ GPS thật mới nhận
              currentMarkerPosRef.current = { lat: targetLat, lng: targetLng };
              if (userMarkerRef.current) {
                userMarkerRef.current.setLatLng([targetLat, targetLng]);
              }
              animFrameIdRef.current = null;
            }
          };

          animFrameIdRef.current = requestAnimationFrame(step);
        }
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

  // 6. Ghim Bạn Bè & Stories (Giữ 100% tọa độ GPS thật)
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
