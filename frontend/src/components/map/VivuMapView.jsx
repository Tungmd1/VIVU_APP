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
import { VIVU_MAP_TILES, TILE_LAYER_OPTIONS, TILE_ATTRIBUTION, getDistanceKm } from './mapTileConstants';
import { attachMapFlyToGuard } from './mapFlyToGuard';
import { processPeerItem } from './mapPeerProcessor';
import { MapNavigationLayerManager } from './mapNavigationLayer';
import { fetchInAppRoute, formatExactDistance, calculateHaversineMeters } from '../../utils/mapNavigationUtils';

// Bảng màu gradient Neon Rainbow Trail: #00E5FF -> #7928CA -> #FF2A85
const NEON_RAINBOW_PALETTE = ['#00E5FF', '#29B6F6', '#5C6BC0', '#7928CA', '#BA24B2', '#FF2A85'];

// Bản đồ Icon danh mục địa điểm đã lưu (Saved Places) chuẩn Bootstrap Icons (T1.14)
export const SAVED_PLACE_CATEGORY_ICONS = {
  food: 'bi-cup-hot',
  music: 'bi-music-note',
  dance: 'bi-activity',
  sightseeing: 'bi-compass'
};

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
  savedPlaces = [],
  onlinePeers = [],
  radarDistance = 'all',
  isAdjustingRadius = false,
  isRadarScanning = false,
  isNavigationActive = false,
  navTarget = null,
  navTravelMode = 'driving',
  onRouteCalculated,
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
  onOpenSavedPlaces,
  onStartNavigation,
  onSetManualLocation,
  isLiveTrackingActive = false
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
  const userMarkerInnerElRef = useRef(null);
  const navLayerManagerRef = useRef(null);
  const lastNavRouteKeyRef = useRef(null);
  const lastFetchedEndpointsRef = useRef(null);
  const fittedRouteKeysRef = useRef(new Set());

  const [mapStyleType, setMapStyleType] = useState('streets');
  const mapStyleTypeRef = useRef(mapStyleType);
  mapStyleTypeRef.current = mapStyleType;
  const tileFallbackRef = useRef({ errors: 0, level: 0 });

  const rawLatVal = userLat ?? location?.lat ?? location?.latitude;
  const rawLngVal = userLng ?? location?.lng ?? location?.longitude;
  const parsedLat = rawLatVal != null ? Number(rawLatVal) : NaN;
  const parsedLng = rawLngVal != null ? Number(rawLngVal) : NaN;
  const hasRealGps = Number.isFinite(parsedLat) && Number.isFinite(parsedLng) && !(parsedLat === 0 && parsedLng === 0);
  const hasCenteredOnRealGpsRef = useRef(hasRealGps);
  const safeLat = hasRealGps ? parsedLat : 16.0544;
  const safeLng = hasRealGps ? parsedLng : 108.2022;

  const onOpenStoryDetailRef = useRef(onOpenStoryDetail); onOpenStoryDetailRef.current = onOpenStoryDetail;
  const onOpenStoryChatRef = useRef(onOpenStoryChat); onOpenStoryChatRef.current = onOpenStoryChat;
  const onOpenUserProfileRef = useRef(onOpenUserProfile); onOpenUserProfileRef.current = onOpenUserProfile;
  const onOpenFriendDetailRef = useRef(onOpenFriendDetail); onOpenFriendDetailRef.current = onOpenFriendDetail;
  const onOpenGuestProfileRef = useRef(onOpenGuestProfile); onOpenGuestProfileRef.current = onOpenGuestProfile;
  const onOpenUserMenuRef = useRef(onOpenUserMenu); onOpenUserMenuRef.current = onOpenUserMenu;
  const onOpenCreateStoryRef = useRef(onOpenCreateStory); onOpenCreateStoryRef.current = onOpenCreateStory;
  const onSetManualLocationRef = useRef(onSetManualLocation); onSetManualLocationRef.current = onSetManualLocation;
  const onOpenMemeTrollRef = useRef(onOpenMemeTroll); onOpenMemeTrollRef.current = onOpenMemeTroll;
  const onStartNavigationRef = useRef(onStartNavigation); onStartNavigationRef.current = onStartNavigation;
  const safeLatRef = useRef(safeLat); safeLatRef.current = safeLat;
  const safeLngRef = useRef(safeLng); safeLngRef.current = safeLng;
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

  // 1. Khởi tạo Bản Đồ Google Maps qua Leaflet Core (kèm fallback OSM/ESRI khi mất kết nối)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [safeLat, safeLng],
      zoom: hasRealGps ? 16 : 6,
      zoomControl: false,
      attributionControl: false,
      maxZoom: TILE_LAYER_OPTIONS.maxZoom,
      minZoom: 3
    });

    const activeTileUrl = VIVU_MAP_TILES[mapStyleType] || VIVU_MAP_TILES.streets;
    const tileLayer = L.tileLayer(activeTileUrl, {
      subdomains: TILE_LAYER_OPTIONS.subdomains,
      maxZoom: TILE_LAYER_OPTIONS.maxZoom,
      attribution: TILE_ATTRIBUTION
    }).addTo(map);

    tileLayer.on('tileload', () => {
      tileFallbackRef.current.errors = 0;
    });
    tileLayer.on('tileerror', () => {
      const state = tileFallbackRef.current;
      state.errors += 1;
      if (state.errors < 4 || mapStyleTypeRef.current !== 'streets') return;
      state.errors = 0;
      if (state.level === 0) {
        state.level = 1;
        tileLayer.options.subdomains = ['a', 'b', 'c'];
        tileLayer.options.maxNativeZoom = 19;
        tileLayer.setUrl(VIVU_MAP_TILES.osmFallback);
      } else if (state.level === 1) {
        state.level = 2;
        tileLayer.options.maxNativeZoom = 19;
        tileLayer.setUrl(VIVU_MAP_TILES.esriFallback);
      }
    });

    tileLayerRef.current = tileLayer;
    mapRef.current = map;
    navLayerManagerRef.current = new MapNavigationLayerManager(map);

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
      navLayerManagerRef.current?.destroy();
      navLayerManagerRef.current = null;
      delete window.__vivu_fit_nav_route;
      try { map.remove(); } catch { }
      mapRef.current = null;
    };
  }, []);

  // 2. Chuyển Đổi Kiểu Bản Đồ Đường Phố (lyrs=m) <-> Vệ Tinh Lai (lyrs=y)
  const handleToggleMapStyle = () => {
    if (!tileLayerRef.current || !mapRef.current) return;
    const nextStyle = mapStyleType === 'streets' ? 'satellite' : 'streets';
    setMapStyleType(nextStyle);
    tileFallbackRef.current = { errors: 0, level: 0 };
    if (tileLayerRef.current.options) {
      tileLayerRef.current.options.subdomains = TILE_LAYER_OPTIONS.subdomains.split('');
      delete tileLayerRef.current.options.maxNativeZoom;
    }
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
      chibiExpiresAt: userCustomChibiExpiresAt,
      bodySkinMode: ownerSkin
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

      userMarkerInnerElRef.current = el;
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
      gpsHistoryRef.current = hasRealGps ? [[safeLat, safeLng]] : [];
    } else {
      // CẬP NHẬT GIAO DIỆN MARKER HIỆN CÓ (Giữ nguyên listener duy nhất trên userMarkerInnerElRef)
      const el = userMarkerInnerElRef.current || userMarkerRef.current.getElement();
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

      if (!hasCenteredOnRealGpsRef.current && hasRealGps && mapRef.current) {
        hasCenteredOnRealGpsRef.current = true;
        currentMarkerPosRef.current = { lat: safeLat, lng: safeLng };
        lastTargetPosRef.current = { lat: safeLat, lng: safeLng };
        gpsHistoryRef.current = [[safeLat, safeLng]];
        renderNeonRainbowTrail(mapRef.current, []);
        userMarkerRef.current.setLatLng([safeLat, safeLng]);
        mapRef.current.flyTo([safeLat, safeLng], 16, { duration: 0.7 });
      }

      // KIỂM TRA TỌA ĐỘ GPS CÓ THAY ĐỔI ĐỂ KÍCH HOẠT LERP & VẼ VỆT CẦU VỒNG NEON
      const prevTarget = lastTargetPosRef.current || { lat: safeLat, lng: safeLng };
      const hasMoved = hasRealGps && (Math.abs(prevTarget.lat - safeLat) > 0.000005 || Math.abs(prevTarget.lng - safeLng) > 0.000005);

      if (hasMoved) {
        lastTargetPosRef.current = { lat: safeLat, lng: safeLng };

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
        // Nếu nhảy khoảng cách lớn (> 5km, vd mới lấy được GPS thật từ định vị mặc định hoặc đổi thành phố)
        // thì snap thẳng và đặt lại lịch sử vệt đường để không vẽ vệt nối xuyên tỉnh
        if (distKm > 5) {
          gpsHistoryRef.current = [[safeLat, safeLng]];
          renderNeonRainbowTrail(mapRef.current, []);
          currentMarkerPosRef.current = { lat: targetLat, lng: targetLng };
          userMarkerRef.current.setLatLng([targetLat, targetLng]);
        } else {
          // Lưu lịch sử GPS thật (5-8 tọa độ gần nhất); chỉ hiển thị vệt đường khi đang dẫn đường
          const history = gpsHistoryRef.current;
          const lastHistPoint = history[history.length - 1];
          if (!lastHistPoint || Math.abs(lastHistPoint[0] - safeLat) > 0.00001 || Math.abs(lastHistPoint[1] - safeLng) > 0.00001) {
            history.push([safeLat, safeLng]);
            if (history.length > 8) {
              gpsHistoryRef.current = history.slice(-8);
            }
            if (isNavigationActive) {
              renderNeonRainbowTrail(mapRef.current, gpsHistoryRef.current);
            } else {
              renderNeonRainbowTrail(mapRef.current, []);
            }
          }

          if (distKm < 0.000005) {
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
    }
  }, [hasRealGps, safeLat, safeLng, userAvatar, userCustomStatus, userCustomSong, userCustomChibi, userCustomChibiExpiresAt, userPinSkin, userPinMascot, userPinAction, myActiveStory, myActiveStories, isNavigationActive]);

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
          const livePeer = (onlinePeers || []).find(p => p && String(p.id) === String(hId));
          const peerPinMeta = livePeer ? {
            pin_skin: livePeer.pin_skin ?? s.pin_skin,
            pin_mascot: livePeer.pin_mascot ?? s.pin_mascot,
            pin_action: livePeer.pin_action ?? s.pin_action,
            custom_chibi: livePeer.custom_chibi ?? s.custom_chibi,
            chibi_expires_at: livePeer.chibi_expires_at ?? s.chibi_expires_at,
            custom_song: livePeer.custom_song ?? s.custom_song,
            custom_status: livePeer.custom_status ?? s.custom_status,
            isOnline: livePeer.is_online !== false && livePeer.isOnline !== false,
            is_online: livePeer.is_online !== false && livePeer.isOnline !== false
          } : {};
          peerStoriesByHost.set(hId, { ...s, ...peerPinMeta, stories: [s] });
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
      const { iLat, iLng, isCoLocated, markerKey, peerBodyHtml, peerSkin } = peerData;
      usedKeys.add(markerKey);

      const cached = itemMarkersMapRef.current.get(markerKey);
      if (cached) {
        cached.marker.setLatLng([iLat, iLng]);
        if (cached.el && !cached.el._isLongPressActive) {
          const bubbleSlot = cached.el.querySelector('.peer-bubble-slot');
          if (bubbleSlot) bubbleSlot.innerHTML = getPeerBubbleHtml(item, isCoLocated, peerSkin);
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
            ${getPeerBubbleHtml(item, isCoLocated, peerSkin)}
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

  // 6.5 Ghim Địa Điểm Đã Lưu (Saved Places - T1.14: 30x36px, zIndexOffset: 300, popup Chỉ đường nội bộ)
  useEffect(() => {
    if (!mapRef.current || !savedPlaces || savedPlaces.length === 0) return;
    const markers = [];
    savedPlaces.forEach(place => {
      if (!place || !place.lat || !place.lng) return;
      const catIcon = SAVED_PLACE_CATEGORY_ICONS[place.category] || 'bi-geo-alt';
      const icon = L.divIcon({
        className: 'vivu-saved-place-marker',
        html: `<div class="w-[30px] h-[36px] rounded-2xl bg-amber-500/90 text-white flex items-center justify-center shadow-md cursor-pointer"><i class="bi ${catIcon} text-xs"></i></div>`,
        iconSize: [30, 36],
        iconAnchor: [15, 36]
      });
      const m = L.marker([place.lat, place.lng], { icon, zIndexOffset: 300 }).addTo(mapRef.current);

      const popupRoot = document.createElement('div');
      popupRoot.className = 'text-xs font-sans space-y-1.5 min-w-[160px]';
      const titleEl = document.createElement('div');
      titleEl.className = 'font-bold text-[#14252E]';
      titleEl.textContent = place.name || 'Địa điểm đã lưu';
      const distEl = document.createElement('div');
      distEl.className = 'text-[11px] font-mono text-[#0A8395] font-semibold';
      const navBtn = document.createElement('button');
      navBtn.type = 'button';
      navBtn.className = 'w-full mt-1 py-1.5 px-2.5 rounded-xl bg-[#0A8395] text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer';
      navBtn.innerHTML = '<i class="bi bi-cursor-fill"></i><span>Chỉ đường</span>';
      navBtn.addEventListener('click', (evt) => {
        evt.stopPropagation();
        m.closePopup();
        onStartNavigationRef.current?.(place);
      });
      popupRoot.appendChild(titleEl);
      popupRoot.appendChild(distEl);
      popupRoot.appendChild(navBtn);
      m.bindPopup(popupRoot);
      m.on('popupopen', () => {
        const curMeters = calculateHaversineMeters(
          Number(safeLatRef.current),
          Number(safeLngRef.current),
          Number(place.lat),
          Number(place.lng)
        );
        distEl.textContent = `Cách bạn ${formatExactDistance(curMeters)}`;
      });

      markers.push(m);
    });
    return () => {
      markers.forEach(m => m.remove());
    };
  }, [savedPlaces]);

  // 7. Lộ Trình Chỉ Đường Nội Bộ VIVU (In-App Navigation Route có chống jitter >25m & fitBounds 1 lần theo tuyến)
  const navTargetLat = Number(navTarget?.realLat ?? navTarget?.lat);
  const navTargetLng = Number(navTarget?.realLng ?? navTarget?.lng);
  const hasValidNavTarget = Number.isFinite(navTargetLat) && Number.isFinite(navTargetLng);
  const isNavigating = isNavigationActive && hasValidNavTarget;
  const navRouteKey = isNavigating
    ? `${navTarget?.id || navTarget?.targetUserId || navTarget?.hostId || navTarget?.name || `${navTargetLat.toFixed(4)},${navTargetLng.toFixed(4)}`}:${navTravelMode}`
    : null;

  useEffect(() => {
    if (!mapRef.current || !navLayerManagerRef.current) return;

    if (!isNavigating || !navRouteKey) {
      navLayerManagerRef.current.clear();
      renderNeonRainbowTrail(mapRef.current, []);
      gpsHistoryRef.current = hasRealGps ? [[safeLat, safeLng]] : [];
      lastNavRouteKeyRef.current = null;
      lastFetchedEndpointsRef.current = null;
      delete window.__vivu_fit_nav_route;
      return;
    }

    const prevEnd = lastFetchedEndpointsRef.current;
    const sameRouteKey = lastNavRouteKeyRef.current === navRouteKey;
    if (sameRouteKey && prevEnd) {
      const startDelta = calculateHaversineMeters(prevEnd.startLat, prevEnd.startLng, safeLat, safeLng);
      const endDelta = calculateHaversineMeters(prevEnd.endLat, prevEnd.endLng, navTargetLat, navTargetLng);
      if (startDelta <= 25 && endDelta <= 25) {
        return;
      }
    }

    lastNavRouteKeyRef.current = navRouteKey;
    lastFetchedEndpointsRef.current = {
      startLat: safeLat,
      startLng: safeLng,
      endLat: navTargetLat,
      endLng: navTargetLng
    };

    let isMounted = true;
    const abortCtrl = new AbortController();

    fetchInAppRoute({
      startLat: safeLat,
      startLng: safeLng,
      endLat: navTargetLat,
      endLng: navTargetLng,
      profile: navTravelMode === 'foot' ? 'foot' : 'driving',
      signal: abortCtrl.signal
    }).then((route) => {
      if (!isMounted || !mapRef.current || !navLayerManagerRef.current) return;
      const targetTitle = navTarget.title || navTarget.name || 'Điểm đến';
      const distanceText = formatExactDistance(route.distanceMeters);
      const res = navLayerManagerRef.current.renderRoute({
        coordinates: route.coordinates,
        targetTitle,
        distanceText,
        isRoadRoute: route.isRoadRoute
      });

      if (onRouteCalculated) {
        onRouteCalculated({
          distanceMeters: route.distanceMeters,
          durationSeconds: route.durationSeconds,
          distanceText,
          isRoadRoute: route.isRoadRoute,
          coordinates: route.coordinates
        });
      }

      if (res?.bounds) {
        window.__vivu_nav_bounds = res.bounds;
        window.__vivu_fit_nav_route = () => {
          if (mapRef.current && window.__vivu_nav_bounds) {
            mapRef.current.fitBounds(window.__vivu_nav_bounds, { padding: [60, 60], maxZoom: 16.8 });
          }
        };
        if (!fittedRouteKeysRef.current.has(navRouteKey)) {
          fittedRouteKeysRef.current.add(navRouteKey);
          mapRef.current.fitBounds(res.bounds, { padding: [60, 60], maxZoom: 16.8 });
        }
      }
    }).catch(() => { });

    return () => {
      isMounted = false;
      abortCtrl.abort();
    };
  }, [isNavigating, navRouteKey, navTargetLat, navTargetLng, safeLat, safeLng, navTravelMode]);

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

      {(activeTab === 'social' || activeTab === 'friends' || activeTab === 'map') && !isLiveTrackingActive && (
        <RightActionStack
          onResetCompass={handleResetCompass}
          onFitPeers={handleFitPeers}
          onRecenterGps={handleRecenterGps}
          onToggleMapStyle={handleToggleMapStyle}
          onOpenSavedPlaces={onOpenSavedPlaces}
          savedPlacesCount={savedPlaces?.length || 0}
          mapStyleType={mapStyleType}
          hasPeers={itemMarkersMapRef.current.size > 0 || (onlinePeers && onlinePeers.length > 0)}
          isGpsLoading={gpsLoading}
        />
      )}
    </div>
  );
}
