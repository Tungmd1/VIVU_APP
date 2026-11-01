import React, { useEffect, useRef, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import RightActionStack from './RightActionStack';
import { storyAudioPlayer } from '../../data/trendingSongs';

// Access token Mapbox chính thức của dự án VIVU
mapboxgl.accessToken = 'pk.eyJ1IjoibWFpZHVjdHVuZyIsImEiOiJjbXVtOGlqMm8wOTU5MnhvZmM5bXBqYnYyIn0.OAm5O7g64WWuibNsc-EWGQ';

// Hàm tính khoảng cách GPS theo Haversine (km)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Tạo đối tượng GeoJSON Polygon hình tròn chuẩn mét địa lý trên Mapbox
function createGeoJSONCircle(center, radiusKm, points = 64) {
  if (radiusKm === 'all' || !radiusKm || isNaN(Number(radiusKm))) {
    return { type: 'FeatureCollection', features: [] };
  }
  const coords = {
    latitude: center[1],
    longitude: center[0]
  };
  const km = Number(radiusKm);
  const ret = [];
  const distanceX = km / (111.320 * Math.cos((coords.latitude * Math.PI) / 180));
  const distanceY = km / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]);

  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: { radiusKm: km },
      geometry: {
        type: 'Polygon',
        coordinates: [ret]
      }
    }]
  };
}

export default function MapboxCanvas({
  userLat,
  userLng,
  currentUserId,
  currentUserName,
  userCustomStatus = '',
  userAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  gpsLoading = false,
  location,
  onRequestLocation,
  activeTab = 'social',
  viewMode = 'social',
  stories = [],
  friends = [],
  radarDistance = 3,
  isAdjustingRadius = false,
  isRadarScanning = false,
  isNavigationActive = false,
  navTarget = null,
  activeCircleFilter = null,
  onClearCircleFilter = null,
  onOpenStoryDetail,
  onOpenStoryChat,
  onOpenFriendDetail,
  onOpenGuestProfile,
  onOpenUserMenu,
  onOpenCreateStory,
  onSetManualLocation,
  onOpenQuickSnap,
  onOpenMemeTroll
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const itemMarkersMapRef = useRef(new Map());
  const hasCenteredGPSRef = useRef(false);
  const lastFlyCoordsRef = useRef(null);
  const prevActiveTabRef = useRef(activeTab);

  // Nhận diện một item (story/friend) có phải của chính mình hay không (chống lặp tài khoản & trùng story)
  const isOwnerItem = (item) => {
    if (!item) return false;
    if (currentUserId && (item.hostId === currentUserId || item.id === currentUserId || item.host_id === currentUserId)) return true;
    if (item.isOwnerStory === true) return true;
    return false;
  };

  // Nhận diện Story đang hoạt động của chính Bạn (myActiveStory)
  const myActiveStory = useMemo(() => {
    return stories.find(s => isOwnerItem(s)) || null;
  }, [stories, currentUserId, currentUserName]);

  const myActiveStoryRef = useRef(myActiveStory);
  myActiveStoryRef.current = myActiveStory;

  // Giữ callback refs tránh re-render
  const onOpenStoryDetailRef = useRef(onOpenStoryDetail);
  onOpenStoryDetailRef.current = onOpenStoryDetail;
  const onOpenStoryChatRef = useRef(onOpenStoryChat);
  onOpenStoryChatRef.current = onOpenStoryChat;
  const onOpenFriendDetailRef = useRef(onOpenFriendDetail);
  onOpenFriendDetailRef.current = onOpenFriendDetail;
  const onOpenGuestProfileRef = useRef(onOpenGuestProfile);
  onOpenGuestProfileRef.current = onOpenGuestProfile;
  const onOpenMemeTrollRef = useRef(onOpenMemeTroll);
  onOpenMemeTrollRef.current = onOpenMemeTroll;
  const onOpenUserMenuRef = useRef(onOpenUserMenu);
  onOpenUserMenuRef.current = onOpenUserMenu;
  const onOpenCreateStoryRef = useRef(onOpenCreateStory);
  onOpenCreateStoryRef.current = onOpenCreateStory;
  const onSetManualLocationRef = useRef(onSetManualLocation);
  onSetManualLocationRef.current = onSetManualLocation;

  const [mapStyleType, setMapStyleType] = React.useState('streets'); // 'streets' (Google Streets) | 'satellite' (Google Satellite)
  const mapStyleTypeRef = useRef(mapStyleType);
  mapStyleTypeRef.current = mapStyleType;

  // Thiết lập các layer tuyến đường và bán kính radar
  const setupMapLayers = (map) => {
    if (!map) return;

    // 1. Tuyến đường Polyline chỉ đường phong cách Google Maps Navigation
    if (!map.getSource('vivu-route')) {
      map.addSource('vivu-route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: [] }
        }
      });

      // Viền đậm Google Maps Navigation
      map.addLayer({
        id: 'vivu-route-casing',
        type: 'line',
        source: 'vivu-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#185ABC',
          'line-width': 8,
          'line-opacity': 0.85
        }
      });

      // Lõi xanh lam Google Maps
      map.addLayer({
        id: 'vivu-route-line',
        type: 'line',
        source: 'vivu-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#4285F4',
          'line-width': 5,
          'line-opacity': 1.0
        }
      });
    }

    // 2. Vòng tròn Bán Kính Radar Địa Lý Thực Tế kiểu Google Maps Accuracy Ring
    if (!map.getSource('radar-radius-source')) {
      map.addSource('radar-radius-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Vùng phủ màu lam nhạt
      map.addLayer({
        id: 'radar-radius-fill',
        type: 'fill',
        source: 'radar-radius-source',
        paint: {
          'fill-color': '#1A73E8',
          'fill-opacity': 0.08
        }
      });

      // Viền nét đứt nhẹ nhàng
      map.addLayer({
        id: 'radar-radius-stroke',
        type: 'line',
        source: 'radar-radius-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#1A73E8',
          'line-width': 2,
          'line-opacity': 0.7,
          'line-dasharray': [3, 2]
        }
      });
    }
  };

  // Hàm chuyển đổi lớp bản đồ Google Streets <-> Google Satellite
  const handleToggleMapStyle = () => {
    if (!mapRef.current) return;
    const nextType = mapStyleType === 'streets' ? 'satellite' : 'streets';
    setMapStyleType(nextType);
    const styleUrl = nextType === 'streets'
      ? 'mapbox://styles/mapbox/streets-v12'
      : 'mapbox://styles/mapbox/satellite-streets-v12';
    mapRef.current.setStyle(styleUrl);
  };

  // 1. Khởi tạo Mapbox GL JS - PHONG CÁCH GOOGLE MAPS STREETS VECTOR
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const safeLng = userLng ?? 106.7009;
    const safeLat = userLat ?? 10.7769;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12', // Bản đồ chuẩn Google Maps (Đường sá, công viên, sông hồ)
      center: [safeLng, safeLat],
      zoom: 15.6,
      pitch: 32,
      bearing: -5,
      attributionControl: false
    });
    window.__vivu_map = map;

    map.on('load', () => {
      setupMapLayers(map);
    });

    map.on('style.load', () => {
      setupMapLayers(map);
    });

    // Chuột phải vào bản đồ để chọn vị trí thủ công (hữu ích cho PC/Laptop)
    map.on('contextmenu', (e) => {
      if (onSetManualLocationRef.current) {
        onSetManualLocationRef.current(e.lngLat.lat, e.lngLat.lng, 'Vị trí đã chọn trên bản đồ');
      }
    });

    mapRef.current = map;

    return () => {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      for (const cached of itemMarkersMapRef.current.values()) {
        cached.marker.remove();
      }
      itemMarkersMapRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Resize bản đồ khi chuyển tab
  useEffect(() => {
    if ((activeTab === 'social' || activeTab === 'friends' || activeTab === 'map') && mapRef.current) {
      const timer = setTimeout(() => {
        mapRef.current?.resize();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // 3. Tự động flyTo khi có GPS thật hoặc IP thực
  useEffect(() => {
    const lat = location?.lat ?? location?.latitude;
    const lng = location?.lng ?? location?.longitude;
    const isReal = location && !location.isFallback && (location.source === 'gps' || location.source === 'ip' || location.source === 'manual');

    if (mapRef.current && lat && lng && isReal) {
      const last = lastFlyCoordsRef.current;
      const isFirstOrMoved = !last || Math.abs(last.lat - lat) > 0.0005 || Math.abs(last.lng - lng) > 0.0005;

      if (isFirstOrMoved) {
        lastFlyCoordsRef.current = { lat, lng };
        hasCenteredGPSRef.current = true;
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom: 16.8,
          pitch: 35,
          duration: 1500,
          essential: true
        });
      }
    }
  }, [location]);

  // 4. Đồng bộ Giọt Nước Chính Chủ & HIỆU ỨNG QUÉT RADA 360 ĐỘ BAO QUANH BONG BÓNG
  useEffect(() => {
    if (!mapRef.current) return;
    const rawLng = location?.lng ?? location?.longitude ?? userLng;
    const rawLat = location?.lat ?? location?.latitude ?? userLat;
    if (typeof rawLat !== 'number' || typeof rawLng !== 'number' || isNaN(rawLat) || isNaN(rawLng)) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      return;
    }
    const safeLng = rawLng;
    const safeLat = rawLat;
    const coords = [safeLng, safeLat];
    const safeAvatar = userAvatar || '';

    const getOwnerBubbleHtml = (activeStory) => {
      // Yêu cầu: Xóa bỏ hoàn toàn thanh trạng thái mặc định khi chưa đăng bài
      if (!activeStory) {
        return '';
      }

      const memeImg = activeStory.memeImage || activeStory.meme?.image || activeStory.image || (typeof activeStory.meme === 'string' && activeStory.meme.startsWith('http') ? activeStory.meme : null);
      const statusText = activeStory.caption || activeStory.title || activeStory.description;
      const song = activeStory.songData || activeStory.music;
      const isSongPlaying = song && storyAudioPlayer.isPlaying(song?.id || song);

      // 1. Trường hợp có cả Meme và Trạng thái (Text)
      if (memeImg && statusText) {
        return `
          <div class="btn-view-owner-story mb-2 relative flex flex-col items-center animate-in zoom-in-90 duration-200 cursor-pointer hover:scale-105 transition-transform" title="Bấm để xem Story của Bạn">
            <div class="mb-1.5 px-3.5 py-2 bg-[#0A8395] text-white rounded-2xl rounded-br-xs shadow-[0_4px_16px_rgba(10,131,149,0.3)] max-w-[200px] flex items-center gap-2">
              <span class="text-xs font-medium leading-snug break-words text-left">${statusText}</span>
              ${song ? `
                <button id="btn-play-marker-music" class="w-6 h-6 shrink-0 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center active:scale-95 transition-transform cursor-pointer" title="Phát/Dừng nhạc">
                  <i class="bi ${isSongPlaying ? 'bi-pause-fill' : 'bi-play-fill'} text-xs"></i>
                </button>
              ` : ''}
            </div>
            <div class="relative bg-white p-1 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.18)] border-2 border-[#0A8395] overflow-hidden group">
              <img src="${memeImg}" alt="Story" class="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl bg-[#F3F7F8]" />
              ${song && !statusText ? `
                <button id="btn-play-marker-music" class="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-[#0A8395] hover:bg-[#086a78] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer" title="Phát/Dừng nhạc">
                  <i class="bi ${isSongPlaying ? 'bi-pause-fill' : 'bi-play-fill'} text-xs"></i>
                </button>
              ` : ''}
            </div>
            <!-- Mũi nhọn trỏ xuống đầu giọt nước -->
            <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] border-t-[#0A8395] -mt-[1px]"></div>
          </div>
        `;
      }

      // 2. Trường hợp chỉ có Meme / Ảnh: Hiện thẳng ảnh lên phía trên đầu giọt nước
      if (memeImg) {
        return `
          <div class="btn-view-owner-story mb-2 relative flex flex-col items-center animate-in zoom-in-90 duration-200 cursor-pointer hover:scale-105 transition-transform" title="Bấm để xem Story của Bạn">
            <div class="relative bg-white p-1 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.18)] border-2 border-[#0A8395] overflow-hidden group">
              <img src="${memeImg}" alt="Story" class="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl bg-[#F3F7F8]" />
              ${song ? `
                <button id="btn-play-marker-music" class="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-[#0A8395] hover:bg-[#086a78] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer" title="Phát/Dừng nhạc">
                  <i class="bi ${isSongPlaying ? 'bi-pause-fill' : 'bi-play-fill'} text-xs"></i>
                </button>
              ` : ''}
            </div>
            <!-- Mũi nhọn trỏ xuống đầu giọt nước -->
            <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] border-t-[#0A8395] -mt-[1px]"></div>
          </div>
        `;
      }

      // 3. Trường hợp có Trạng thái / Chữ: Hiện ra 1 ô chứa trạng thái
      if (statusText) {
        return `
          <div class="btn-view-owner-story mb-2 relative flex flex-col items-center animate-in zoom-in-90 duration-200 cursor-pointer hover:scale-105 transition-transform" title="Bấm để xem Story của Bạn">
            <div class="px-3.5 py-2 bg-[#0A8395] text-white rounded-2xl rounded-br-xs shadow-[0_4px_16px_rgba(10,131,149,0.3)] max-w-[200px] flex items-center gap-2">
              <span class="text-xs font-medium leading-snug break-words text-left">${statusText}</span>
              ${song ? `
                <button id="btn-play-marker-music" class="w-6 h-6 shrink-0 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center active:scale-95 transition-transform cursor-pointer" title="Phát/Dừng nhạc">
                  <i class="bi ${isSongPlaying ? 'bi-pause-fill' : 'bi-play-fill'} text-xs"></i>
                </button>
              ` : ''}
            </div>
            <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#0A8395] -mt-[1px]"></div>
          </div>
        `;
      }

      // 4. Trường hợp chỉ có Nhạc: Nút nghe nhạc có thể ấn vào để phát
      if (song) {
        const musicTitle = typeof song === 'string' ? song : (song.title || 'Bài hát');
        return `
          <div class="mb-2 relative flex flex-col items-center animate-in zoom-in-90 duration-200 cursor-default">
            <div class="px-3 py-1.5 bg-[#0A8395] text-white rounded-full shadow-[0_4px_16px_rgba(10,131,149,0.3)] flex items-center gap-2">
              <button id="btn-play-marker-music" class="w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center active:scale-95 transition-transform cursor-pointer" title="Phát/Dừng nhạc">
                <i class="bi ${isSongPlaying ? 'bi-pause-fill' : 'bi-play-fill'} text-xs"></i>
              </button>
              <span class="text-[11px] font-semibold truncate max-w-[120px]">${musicTitle}</span>
            </div>
            <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#0A8395] -mt-[1px]"></div>
          </div>
        `;
      }

      return '';
    };

    if (!userMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'vivu-teardrop-marker owner-marker group flex flex-col items-center cursor-pointer select-none relative';
      el.style.zIndex = '45';
      
      const renderUserMarkerHtml = () => `
        <div class="owner-bubble-wrapper">
          ${getOwnerBubbleHtml(myActiveStory)}
        </div>

        <!-- LUMINOUS SOLAR-CYBER USER LOCATION PULSE & AVATAR -->
        <div class="relative flex flex-col items-center">
          <!-- Vòng hào quang Laser Cyan phát xung (Accuracy Pulse) -->
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 pointer-events-none flex items-center justify-center -z-10">
            <div class="absolute inset-0 rounded-full bg-[rgba(0,229,255,0.15)] animate-ping"></div>
            <div class="absolute w-16 h-16 rounded-full border border-[rgba(0,229,255,0.40)] bg-[rgba(0,229,255,0.08)]"></div>
          </div>

          <!-- Avatar Pin với viền nhịp thở Hyper Lime #10FFA0 -->
          <div class="relative w-11 h-11 rounded-full p-[2.5px] bg-white border-2 border-[#10FFA0] shadow-[0_0_12px_rgba(16,255,160,0.6)] flex items-center justify-center hover:scale-110 transition-transform">
            <div class="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
              ${safeAvatar ? `
                <img 
                  src="${safeAvatar}" 
                  alt="BẠN" 
                  class="w-full h-full object-cover" 
                />
              ` : `
                <div class="w-full h-full bg-white flex items-center justify-center text-neutral-400">
                  <i class="bi bi-person-fill text-xl"></i>
                </div>
              `}
            </div>

            <!-- Chấm định vị Cyber Cyan phát sáng -->
            <div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#00E5FF] border-2 border-white shadow-[0_0_8px_#00E5FF] flex items-center justify-center z-20">
              <span class="w-1.5 h-1.5 rounded-full bg-[#08202E]"></span>
            </div>
          </div>

          <!-- Mũi kim định vị tiếp đất -->
          <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-white -mt-0.5 filter drop-shadow-[0_2px_4px_rgba(0,229,255,0.3)]"></div>
        </div>
      `;

      el.innerHTML = renderUserMarkerHtml();

      // Event Delegation: Ấn nút nhạc nghe nhạc, bấm vào bong bóng xem Story của Bạn, bấm thân giọt nước mở Menu
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (e.target.closest('#btn-play-marker-music')) {
          const song = myActiveStoryRef.current?.songData || myActiveStoryRef.current?.music;
          if (song) {
            const isPlaying = storyAudioPlayer.togglePlay(song);
            const playIcon = el.querySelector('#btn-play-marker-music i');
            if (playIcon) {
              playIcon.className = isPlaying ? 'bi bi-pause-fill text-xs' : 'bi bi-play-fill text-xs';
            }
          }
          return;
        }

        // BẤM VÀO BONG BÓNG STORY CỦA BẠN -> MỞ XEM STORY TOÀN MÀN HÌNH
        if (e.target.closest('.owner-bubble-wrapper') || e.target.closest('.btn-view-owner-story')) {
          if (myActiveStoryRef.current && onOpenStoryDetailRef.current) {
            onOpenStoryDetailRef.current(myActiveStoryRef.current);
            return;
          }
        }

        // Bấm vào thân giọt nước "BẠN"
        if (onOpenUserMenuRef.current) {
          onOpenUserMenuRef.current();
        }
      });

      userMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(coords)
        .addTo(mapRef.current);
    } else {
      const el = userMarkerRef.current.getElement();
      if (!mapRef.current.getContainer().contains(el)) {
        userMarkerRef.current.addTo(mapRef.current);
      }
      userMarkerRef.current.setLngLat(coords);

      // Cập nhật nội dung bong bóng khi myActiveStory thay đổi
      const bubbleWrapper = el.querySelector('.owner-bubble-wrapper');
      if (bubbleWrapper) {
        bubbleWrapper.innerHTML = getOwnerBubbleHtml(myActiveStory);
      }

      // ĐỒNG BỘ ẢNH GIỌT NƯỚC TỨC THÌ KHI USER AVATAR ĐỔI
      const avatarImg = el.querySelector('img');
      if (avatarImg && safeAvatar && avatarImg.src !== safeAvatar) {
        avatarImg.src = safeAvatar;
      }
    }
  }, [userLng, userLat, location, userCustomStatus, userAvatar, myActiveStory]);

  // 5. Đồng bộ Markers Items: CẢ XÃ HỘI VÀ BẠN BÈ ĐỀU CÓ HOLOGRAPHIC MARKER & CẬP NHẬT CACHE CHỐNG RUNG LẮC
  useEffect(() => {
    if (!mapRef.current) return;

    const isFriendsMode = activeTab === 'friends';
    const safeUserLat = userLat ?? 10.7769;
    const safeUserLng = userLng ?? 106.7009;

    // 1. Nguồn dữ liệu theo tab hoặc theo Nhóm (Rule 9 GEMINI.md)
    let rawItems;
    if (activeCircleFilter) {
      const circleMemberIds = activeCircleFilter.member_ids || activeCircleFilter.memberIds || [];
      const allPeers = [...friends, ...stories];
      rawItems = allPeers.filter(p => {
        const pId = p.id || p.hostId || p.userId;
        return circleMemberIds.some(cid => cid === pId || p.hostId === cid || p.id === cid);
      });
    } else {
      rawItems = isFriendsMode ? friends : stories;
    }

    // 2. PHÂN BIỆT RẠCH RÒI XÃ HỘI (REALTIME ONLY) VS BẠN BÈ (STEALTH OFFLINE) VS NHÓM
    const withoutMe = rawItems.filter(item => {
      if (isOwnerItem(item)) return false;

      if (!isFriendsMode && !activeCircleFilter) {
        if (item.isOnline === false) {
          return false;
        }
      }
      return true;
    });

    // 3. KHỬ TRÙNG LẶP & HỢP NHẤT STORY VÀO GIỌT NƯỚC DUY NHẤT (Rule 30)
    const targetItems = [];
    const seenUsers = new Map();

    withoutMe.forEach(item => {
      let userKey = null;
      if (item.hostId && String(item.hostId).startsWith('user-')) {
        userKey = String(item.hostId);
      } else if (item.id && String(item.id).startsWith('user-')) {
        userKey = String(item.id);
      } else if (item.userCode) {
        userKey = String(item.userCode);
      } else if (item.id && String(item.id).startsWith('live-peer-')) {
        userKey = String(item.id).replace('live-peer-', '');
      } else if (item.hostName) {
        userKey = `name-${item.hostName}`;
      } else if (item.name) {
        userKey = `name-${item.name}`;
      } else {
        userKey = String(item.id || Math.random());
      }

      if (seenUsers.has(userKey)) {
        const existingIdx = seenUsers.get(userKey);
        const existing = targetItems[existingIdx];
        const activeStory = item.activeStory || (item.id?.startsWith('story-') ? item : existing.activeStory);

        targetItems[existingIdx] = {
          ...existing,
          ...item,
          realLat: existing.realLat ?? item.realLat,
          realLng: existing.realLng ?? item.realLng,
          hostAvatar: existing.hostAvatar || item.hostAvatar || item.avatar,
          hostName: existing.hostName || item.hostName || item.name,
          userCode: existing.userCode || item.userCode || '',
          isOnline: (existing.isOnline === true || item.isOnline === true),
          activeStory: activeStory || existing.activeStory || null,
          image: item.image || existing.image || null,
          music: item.music || existing.music || null,
          video: item.video || existing.video || null,
          title: item.title || existing.title
        };
      } else {
        seenUsers.set(userKey, targetItems.length);
        targetItems.push({ ...item, _userKey: userKey });
      }
    });

    const usedKeys = new Set();

    targetItems.forEach(item => {
      let iLat = item.realLat ?? (safeUserLat + (item.latOffset || 0.003));
      let iLng = item.realLng ?? (safeUserLng + (item.lngOffset || 0.003));

      // Thuật toán Tự Động Tách Cụm Không Gian (Spatial Marker Dispersion - Rule 16):
      const distFromUser = getDistanceFromLatLonInKm(safeUserLat, safeUserLng, iLat, iLng);
      let isCoLocated = false;
      if (distFromUser < 0.06) {
        isCoLocated = true;
        const seedStr = String(item.id || item.hostId || item.userCode || item.name || 'vivu-peer');
        const hash = seedStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const angle = ((hash % 8) * (Math.PI / 4)) + (Math.PI / 8);
        const dispersionRadiusLat = 0.0020;
        const dispersionRadiusLng = 0.0022;
        iLat = safeUserLat + dispersionRadiusLat * Math.sin(angle);
        iLng = safeUserLng + dispersionRadiusLng * Math.cos(angle);
      }

      const isOnlineAccount = Boolean(item.id?.startsWith('user-') || item.id?.startsWith('client-') || item.hostId?.startsWith('user-') || item.hostId?.startsWith('client-') || item.id?.startsWith('live-peer-'));
      if (!isOnlineAccount && radarDistance !== 'all') {
        const distKm = getDistanceFromLatLonInKm(safeUserLat, safeUserLng, iLat, iLng);
        if (distKm > Number(radarDistance)) return;
      }

      if (typeof iLat !== 'number' || typeof iLng !== 'number' || isNaN(iLat) || isNaN(iLng) || !isFinite(iLat) || !isFinite(iLng)) {
        return;
      }

      const coords = [iLng, iLat];
      const markerKey = item._userKey || item.id;
      usedKeys.add(markerKey);

      const isOffline = item.isOnline === false;
      const hostAvatar = item.hostAvatar || item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
      const displayName = item.hostName || item.name || 'Người dùng VIVU';
      const userCodeBadge = item.userCode ? `<span class="text-[9px] ${isOffline ? 'text-neutral-500' : 'text-[#00F0FF]/80'} font-mono">(${item.userCode})</span>` : '';
      const musicPreview = item.music ? `<i class="bi bi-music-note-beamed text-[#FF2A85]"></i>` : '';
      const videoIndicator = item.video ? `<i class="bi bi-play-circle-fill text-[#8B5CF6]"></i>` : '';
      const imageIndicator = item.image ? `<i class="bi bi-image text-[#00F0FF]"></i>` : '';

      const hasActiveStory = Boolean(item.activeStory || item.image || (item.category === 'moment' && item.title?.startsWith('Story:')));
      const activeStoryObj = item.activeStory || item;
      const bubbleTitle = hasActiveStory ? (activeStoryObj.title || item.title || displayName) : displayName;

      // Màu sắc ghim giọt nước Cyber Teardrop Luminous Solar-Cyber HUD
      let pinColor = '#00E5FF'; // Cyber Cyan (Bạn bè trực tuyến)
      let bubbleClasses = 'bg-white/95 backdrop-blur-xl text-[#131315] border border-[#D2D9F4] shadow-[0_4px_14px_rgba(0,0,0,0.08)]';
      if (isOffline) {
        pinColor = '#A0AEC0'; // Muted Slate (Offline)
        bubbleClasses = 'bg-[#F2F3FF]/90 backdrop-blur-md text-[#70787E] border border-[#D2D9F4] shadow-xs';
      } else if (hasActiveStory) {
        pinColor = '#FF2A85'; // Cyber Magenta (Có Story mới)
        bubbleClasses = 'bg-white/95 backdrop-blur-xl text-[#131315] border border-[#FF2A85]/50 shadow-[0_4px_14px_rgba(255,42,133,0.25)]';
      } else if (isCoLocated) {
        pinColor = '#FFAA00'; // Solar Amber (Gần bạn <60m)
        bubbleClasses = 'bg-white/95 backdrop-blur-xl text-[#131315] border border-[#FFAA00]/50 shadow-[0_4px_14px_rgba(255,170,0,0.25)]';
      }

      const statusDotHtml = isOffline
        ? `<span class="w-2 h-2 rounded-full bg-[#A0AEC0] shrink-0" title="Offline"></span>`
        : `<span class="w-2 h-2 rounded-full bg-[#10FFA0] animate-pulse shrink-0 shadow-[0_0_8px_#10FFA0]" title="Đang trực tuyến"></span>`;

      const offlineBadge = isOffline
        ? `<span class="px-1.5 py-0.2 bg-[#ECEDFB] text-[#70787E] text-[8px] font-semibold rounded-xs uppercase tracking-tight">OFFLINE</span>`
        : '';

      const reactBtnHtml = isOffline ? '' : `
        <button id="btn-quick-react" class="ml-0.5 px-2 py-0.5 bg-[#F2F3FF] hover:bg-[#FFE8F0] text-[#FF2A85] text-[10px] font-semibold rounded-full flex items-center gap-1 transition-all border border-[#D2D9F4]" title="Thả cảm xúc">
          <i class="bi bi-heart-fill text-[9px] text-[#FF2A85]"></i>
        </button>
      `;

      let bottomBadgeBg = isOffline ? 'bg-[#D2D9F4] text-[#70787E]' : (hasActiveStory ? 'bg-[#FF2A85] text-white' : 'bg-[#00E5FF] text-[#08202E] font-bold');
      let bottomBadgeIcon = hasActiveStory ? 'bi-camera-reels-fill' : (isFriendsMode ? 'bi-people-fill' : 'bi-person-check-fill');

      let cached = itemMarkersMapRef.current.get(markerKey);

      if (cached) {
        // CẬP NHẬT TỌA ĐỘ IN-PLACE KHÔNG TIÊU HỦY DOM (Chấm dứt hiện tượng chớp nháy 3.5s)
        cached.marker.setLngLat(coords);
      } else {
        // TẠO MỚI MARKER GOOGLE MAPS TEARDROP PIN
        const el = document.createElement('div');
        el.className = `vivu-teardrop-marker group flex flex-col items-center cursor-pointer select-none relative ${isCoLocated ? 'z-30' : 'z-20'} ${isOffline ? 'opacity-65 grayscale-[60%] hover:opacity-100 hover:grayscale-0 transition-all duration-300' : ''}`;

        const peerMemeImg = activeStoryObj?.memeImage || activeStoryObj?.meme?.image || activeStoryObj?.image || (typeof activeStoryObj?.meme === 'string' && activeStoryObj?.meme.startsWith('http') ? activeStoryObj?.meme : null);
        const peerSong = activeStoryObj?.songData || activeStoryObj?.music || item.music || null;
        const displayText = activeStoryObj?.caption || activeStoryObj?.title || activeStoryObj?.description;

        let topContentHtml = '';
        if (peerMemeImg && displayText) {
          // Có cả Meme và Trạng thái
          topContentHtml = `
            <div class="mb-2 relative flex flex-col items-center animate-in zoom-in-90 duration-200 cursor-default">
              <div class="mb-1.5 px-3 py-1.5 bg-[#0A8395] text-white rounded-2xl rounded-br-xs shadow-[0_4px_16px_rgba(10,131,149,0.3)] max-w-[180px] flex items-center gap-1.5">
                <span class="text-[11px] font-medium leading-snug break-words text-left">${displayText}</span>
                ${peerSong ? `
                  <button id="btn-play-peer-music" class="w-5 h-5 shrink-0 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center active:scale-95 transition-transform cursor-pointer" title="Phát/Dừng nhạc">
                    <i class="bi bi-play-fill text-[10px]"></i>
                  </button>
                ` : ''}
                ${reactBtnHtml}
              </div>
              <div class="relative bg-white p-1 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.18)] border-2 border-[#0A8395] overflow-hidden group">
                <img src="${peerMemeImg}" alt="Meme" class="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-xl bg-[#F3F7F8]" />
              </div>
              <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#0A8395] -mt-[1px]"></div>
            </div>
          `;
        } else if (peerMemeImg) {
          // Ảnh Meme nổi trực tiếp trên đầu giọt nước
          topContentHtml = `
            <div class="mb-2 relative flex flex-col items-center animate-in zoom-in-90 duration-200 cursor-default">
              <div class="relative bg-white p-1 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.18)] border-2 border-[#0A8395] overflow-hidden group">
                <img src="${peerMemeImg}" alt="Meme" class="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-xl bg-[#F3F7F8]" />
                ${peerSong ? `
                  <button id="btn-play-peer-music" class="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#0A8395] hover:bg-[#086a78] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer" title="Phát/Dừng nhạc">
                    <i class="bi bi-play-fill text-[10px]"></i>
                  </button>
                ` : ''}
              </div>
              <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#0A8395] -mt-[1px]"></div>
            </div>
          `;
        } else if (hasActiveStory && (activeStoryObj.caption || activeStoryObj.title || activeStoryObj.description)) {
          // Khung trạng thái Messenger trực tiếp
          const displayText = activeStoryObj.caption || activeStoryObj.title || activeStoryObj.description;
          topContentHtml = `
            <div class="mb-2 relative flex flex-col items-center animate-in zoom-in-90 duration-200 cursor-default">
              <div class="px-3 py-1.5 bg-[#0A8395] text-white rounded-2xl rounded-br-xs shadow-[0_4px_16px_rgba(10,131,149,0.3)] max-w-[180px] flex items-center gap-1.5">
                <span class="text-[11px] font-medium leading-snug break-words text-left">${displayText}</span>
                ${peerSong ? `
                  <button id="btn-play-peer-music" class="w-5 h-5 shrink-0 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center active:scale-95 transition-transform cursor-pointer" title="Phát/Dừng nhạc">
                    <i class="bi bi-play-fill text-[10px]"></i>
                  </button>
                ` : ''}
                ${reactBtnHtml}
              </div>
              <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#0A8395] -mt-[1px]"></div>
            </div>
          `;
        } else {
          // Thanh trạng thái bạn bè / offline
          topContentHtml = `
            <div id="btn-view-story-bubble" class="mb-1 px-2.5 py-0.8 ${bubbleClasses} rounded-full text-xs flex items-center gap-1.5 whitespace-nowrap group-hover:scale-105 transition-transform max-w-[200px] cursor-pointer" title="${hasActiveStory ? (isOffline ? 'Xem Story (Offline)' : 'Bấm để xem Story') : (isOffline ? 'Bạn bè đang Offline' : 'Trạng thái')}">
              ${statusDotHtml}
              ${isCoLocated ? `<span class="px-1.5 py-0.2 bg-[#F9AB00]/15 text-[#B06000] text-[8px] font-bold rounded-sm border border-[#F9AB00]/30">GẦN BẠN</span>` : ''}
              ${offlineBadge}
              ${peerSong ? `
                <button id="btn-play-peer-music" class="w-4 h-4 rounded-full bg-[#0A8395] text-white flex items-center justify-center cursor-pointer" title="Phát nhạc">
                  <i class="bi bi-play-fill text-[9px]"></i>
                </button>
              ` : ''}
              <span class="truncate font-semibold text-[11px]">${bubbleTitle}</span>
              ${userCodeBadge}
              ${reactBtnHtml}
            </div>
          `;
        }

        el.innerHTML = `
          ${topContentHtml}

          <!-- Ghim giọt nước kinh điển chuẩn Google Maps (Classic Teardrop Pin) -->
          <div class="relative flex flex-col items-center hover:scale-110 active:scale-95 transition-transform duration-200">
            <!-- SVG Teardrop Body -->
            <svg width="34" height="44" viewBox="0 0 34 44" fill="none" class="filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.28)]">
              <path d="M17 0C7.611 0 0 7.611 0 17C0 29.75 17 44 17 44C17 44 34 29.75 34 17C34 7.611 26.389 0 17 0Z" fill="${pinColor}"/>
              <circle cx="17" cy="17" r="14" fill="white"/>
            </svg>

            <!-- Vòng tròn tiến trình đếm ngược 2s khi ấn giữ (Meme Troll Long-press Ring) -->
            <svg class="meme-troll-ring absolute top-[1px] left-[1px] w-[32px] h-[32px] pointer-events-none z-20 opacity-0 transition-opacity" viewBox="0 0 36 36">
              <path
                class="troll-circle-stroke"
                stroke="#FF2A85"
                stroke-width="3"
                stroke-dasharray="100, 100"
                stroke-dashoffset="100"
                stroke-linecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>

            <!-- Avatar nằm gọn trong đầu ghim tròn -->
            <div class="avatar-click-zone absolute top-[3px] left-[3px] w-7 h-7 rounded-full overflow-hidden bg-white cursor-pointer z-10" title="Chạm mở hồ sơ • Giữ 2s ném Meme trêu">
              <img src="${hostAvatar}" alt="${displayName}" class="w-full h-full object-cover rounded-full" />
            </div>

            <!-- Huy hiệu nhỏ góc dưới ghim -->
            <div class="absolute top-[22px] right-[-2px] w-4 h-4 ${bottomBadgeBg} rounded-full flex items-center justify-center text-[8px] font-bold border-2 border-white shadow-xs z-20">
              <i class="bi ${bottomBadgeIcon}"></i>
            </div>
          </div>
        `;

        // Bắt sự kiện Ấn Giữ 2 giây (Long-press 2000ms) để mở Meme Troll Modal
        let longPressTimer = null;
        let isLongPressTriggered = false;
        let pressStartX = 0;
        let pressStartY = 0;

        const startLongPress = (e) => {
          if (e.target.closest('#btn-play-peer-music') || e.target.closest('#btn-quick-react')) return;
          isLongPressTriggered = false;
          pressStartX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
          pressStartY = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0;

          const ring = el.querySelector('.meme-troll-ring');
          const circlePath = el.querySelector('.troll-circle-stroke');
          if (ring && circlePath) {
            ring.style.opacity = '1';
            circlePath.style.transition = 'stroke-dashoffset 2000ms linear';
            circlePath.style.strokeDashoffset = '0';
          }

          longPressTimer = setTimeout(() => {
            isLongPressTriggered = true;
            if (ring && circlePath) {
              ring.style.opacity = '0';
              circlePath.style.strokeDashoffset = '100';
            }
            if (onOpenMemeTrollRef.current) {
              onOpenMemeTrollRef.current(item);
            }
          }, 2000);
        };

        const cancelLongPress = () => {
          if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
          }
          const ring = el.querySelector('.meme-troll-ring');
          const circlePath = el.querySelector('.troll-circle-stroke');
          if (ring && circlePath) {
            circlePath.style.transition = 'none';
            circlePath.style.strokeDashoffset = '100';
            ring.style.opacity = '0';
          }
        };

        const checkMoveCancel = (e) => {
          const curX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
          const curY = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0;
          if (Math.hypot(curX - pressStartX, curY - pressStartY) > 10) {
            cancelLongPress();
          }
        };

        el.addEventListener('pointerdown', startLongPress);
        el.addEventListener('pointerup', cancelLongPress);
        el.addEventListener('pointercancel', cancelLongPress);
        el.addEventListener('pointermove', checkMoveCancel);

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          if (isLongPressTriggered) {
            isLongPressTriggered = false;
            return;
          }
          if (e.target.closest('#btn-play-peer-music')) {
            const song = activeStoryObj?.songData || activeStoryObj?.music || item.music;
            if (song) {
              const isPlaying = storyAudioPlayer.togglePlay(song);
              const playIcon = el.querySelector('#btn-play-peer-music i');
              if (playIcon) {
                playIcon.className = isPlaying ? 'bi bi-pause-fill text-[10px]' : 'bi bi-play-fill text-[10px]';
              }
            }
            return;
          }
          if (e.target.closest('#btn-quick-react')) {
            const heartBtn = e.target.closest('#btn-quick-react');
            heartBtn.classList.add('scale-125');
            setTimeout(() => heartBtn.classList.remove('scale-125'), 300);
            return;
          }
          if (e.target.closest('#btn-view-story-bubble') || (hasActiveStory && e.target.closest('.avatar-click-zone'))) {
            if (hasActiveStory && onOpenStoryDetailRef.current) {
              onOpenStoryDetailRef.current(activeStoryObj || item);
              return;
            }
          }
          if (e.target.closest('.avatar-click-zone')) {
            if (isFriendsMode || item.isFriend) {
              onOpenFriendDetailRef.current(item);
            } else {
              onOpenGuestProfileRef.current(item);
            }
            return;
          }
          mapRef.current?.flyTo({ center: coords, zoom: 16.5, pitch: 32, duration: 900 });
        });

        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat(coords)
          .addTo(mapRef.current);

        itemMarkersMapRef.current.set(markerKey, { marker, el, item });
      }
    });

    // DỌN DẸP MARKERS KHÔNG CÒN TỒN TẠI
    for (const [key, cached] of itemMarkersMapRef.current.entries()) {
      if (!usedKeys.has(key)) {
        cached.marker.remove();
        itemMarkersMapRef.current.delete(key);
      }
    }
  }, [activeTab, stories, friends, radarDistance, userLng, userLat, activeCircleFilter]);

  // 5.0 Điều phối camera khi chọn xem theo Nhóm (Rule 9 GEMINI.md)
  useEffect(() => {
    if (!mapRef.current || !activeCircleFilter) return;

    const circleMemberIds = activeCircleFilter.member_ids || activeCircleFilter.memberIds || [];
    const safeUserLat = userLat ?? 10.7769;
    const safeUserLng = userLng ?? 106.7009;

    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([safeUserLng, safeUserLat]);

    let peerCount = 0;
    const allPeers = [...friends, ...stories];
    allPeers.forEach(item => {
      const pId = item.id || item.hostId || item.userId;
      if (circleMemberIds.includes(pId) || circleMemberIds.includes(item.hostId)) {
        const lat = item.realLat || item.lat;
        const lng = item.realLng || item.lng;
        if (lat && lng && (lat !== safeUserLat || lng !== safeUserLng)) {
          bounds.extend([lng, lat]);
          peerCount++;
        }
      }
    });

    if (peerCount > 0) {
      mapRef.current.fitBounds(bounds, {
        padding: { top: 140, bottom: 200, left: 70, right: 70 },
        maxZoom: 16.5,
        duration: 1100
      });
    } else {
      mapRef.current.flyTo({
        center: [safeUserLng, safeUserLat],
        zoom: 16.2,
        pitch: 32,
        duration: 900
      });
    }
  }, [activeCircleFilter]);

  // 5.1 Điều phối camera khi chuyển Tab (Xã Hội <-> Bạn Bè)
  // Quy chuẩn: Tuyệt đối không bao giờ zoom out ra ngoài vũ trụ / cả nước khi bấm Bạn Bè
  useEffect(() => {
    if (!mapRef.current) return;
    if (prevActiveTabRef.current === activeTab) return;
    prevActiveTabRef.current = activeTab;

    const safeUserLat = userLat ?? 10.7769;
    const safeUserLng = userLng ?? 106.7009;

    if (activeTab === 'friends') {
      // Chỉ tìm các bạn bè ở phạm vi gần (trong bán kính <= 5km hoặc radarDistance)
      const maxRadiusKm = radarDistance !== 'all' ? Math.max(Number(radarDistance), 3) : 5;
      const nearbyFriends = friends.filter(f => {
        if (isOwnerItem(f)) return false;
        const lat = f.realLat ?? (safeUserLat + (f.latOffset || 0.002));
        const lng = f.realLng ?? (safeUserLng + (f.lngOffset || 0.002));
        const dist = getDistanceFromLatLonInKm(safeUserLat, safeUserLng, lat, lng);
        return dist <= maxRadiusKm;
      });

      if (nearbyFriends.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([safeUserLng, safeUserLat]);
        nearbyFriends.forEach(f => {
          const lat = f.realLat ?? (safeUserLat + (f.latOffset || 0.002));
          const lng = f.realLng ?? (safeUserLng + (f.lngOffset || 0.002));
          bounds.extend([lng, lat]);
        });

        const camera = mapRef.current.cameraForBounds(bounds, {
          padding: { top: 120, bottom: 200, left: 60, right: 60 },
          maxZoom: 16.5
        });

        if (camera) {
          mapRef.current.flyTo({
            center: camera.center,
            zoom: Math.max(camera.zoom, 15.0), // Khóa chặn zoom: Không bao giờ thấp hơn mức phố phường 15.0
            pitch: 32,
            duration: 800
          });
        } else {
          mapRef.current.flyTo({
            center: [safeUserLng, safeUserLat],
            zoom: 16.2,
            pitch: 32,
            duration: 800
          });
        }
      } else {
        // Không có bạn bè nào ở gần (hoặc bạn bè ở tỉnh thành khác xa xôi) -> bay mượt về vị trí Bạn ở zoom cận cảnh
        mapRef.current.flyTo({
          center: [safeUserLng, safeUserLat],
          zoom: 16.2,
          pitch: 32,
          duration: 800
        });
      }
    } else if (activeTab === 'social') {
      mapRef.current.flyTo({
        center: [safeUserLng, safeUserLat],
        zoom: 15.8,
        pitch: 30,
        duration: 800
      });
    }
  }, [activeTab, friends, userLat, userLng, radarDistance]);

  // 5.2 Cập nhật vòng tròn Bán Kính Radar Thực Tế & Điều phối Camera theo Bán Kính
  const prevRadarDistanceRef = useRef(radarDistance);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const safeLng = userLng ?? 106.7009;
    const safeLat = userLat ?? 10.7769;

    const updateCircle = () => {
      const source = map.getSource('radar-radius-source');
      if (!source) return;

      const circleData = createGeoJSONCircle([safeLng, safeLat], radarDistance);
      source.setData(circleData);

      // Chỉ zoom camera khi cự ly thực sự thay đổi
      const isDistanceChanged = prevRadarDistanceRef.current !== radarDistance;
      prevRadarDistanceRef.current = radarDistance;

      if (isDistanceChanged) {
        if (radarDistance !== 'all' && Number(radarDistance) > 0) {
          const ring = circleData.features[0]?.geometry?.coordinates[0];
          if (ring && ring.length > 0) {
            const bounds = new mapboxgl.LngLatBounds();
            ring.forEach(pt => bounds.extend(pt));
            map.fitBounds(bounds, {
              padding: { top: 90, bottom: 90, left: 35, right: 35 },
              maxZoom: 16.5,
              duration: 800
            });
          }
        } else if (radarDistance === 'all') {
          map.flyTo({
            center: [safeLng, safeLat],
            zoom: 13.5,
            pitch: 30,
            duration: 800
          });
        }
      }
    };

    if (map.isStyleLoaded()) {
      updateCircle();
    } else {
      map.once('load', updateCircle);
    }
  }, [radarDistance, userLat, userLng]);

  // 5.3 Thay đổi độ sáng của vòng Radar khi người dùng đang kéo Slider (isAdjustingRadius)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    try {
      if (map.getLayer('radar-radius-fill') && map.getLayer('radar-radius-stroke')) {
        if (isAdjustingRadius) {
          map.setPaintProperty('radar-radius-fill', 'fill-opacity', 0.18);
          map.setPaintProperty('radar-radius-stroke', 'line-opacity', 0.95);
          map.setPaintProperty('radar-radius-stroke', 'line-width', 3);
        } else {
          map.setPaintProperty('radar-radius-fill', 'fill-opacity', 0.08);
          map.setPaintProperty('radar-radius-stroke', 'line-opacity', 0.8);
          map.setPaintProperty('radar-radius-stroke', 'line-width', 2);
        }
      }
    } catch {
      // Bỏ qua nếu style chưa sẵn sàng
    }
  }, [isAdjustingRadius]);

  // 6. Cập nhật Tuyến đường Polyline khi bật Navigation
  useEffect(() => {
    if (!mapRef.current) return;
    const source = mapRef.current.getSource('vivu-route');
    if (!source) return;

    if (isNavigationActive && navTarget) {
      const safeUserLat = userLat ?? 10.7769;
      const safeUserLng = userLng ?? 106.7009;
      const targetCoords = [
        navTarget.realLng || navTarget.lng || (safeUserLng + (navTarget.lngOffset || 0.003)),
        navTarget.realLat || navTarget.lat || (safeUserLat + (navTarget.latOffset || 0.002))
      ];

      const midPoint = [
        safeUserLng + (targetCoords[0] - safeUserLng) * 0.45 + 0.0008,
        safeUserLat + (targetCoords[1] - safeUserLat) * 0.55 - 0.0005
      ];

      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [[safeUserLng, safeUserLat], midPoint, targetCoords]
        }
      });

      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([safeUserLng, safeUserLat]);
      bounds.extend(targetCoords);
      mapRef.current.fitBounds(bounds, {
        padding: { top: 120, bottom: 220, left: 60, right: 60 },
        pitch: 35,
        duration: 1200
      });
    } else {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: [] }
      });
    }
  }, [isNavigationActive, navTarget, userLng, userLat]);

  const handleFlyToUserGPS = () => {
    // Bay êm ái về vị trí hiện tại của thiết bị
    const rawLng = location?.lng ?? location?.longitude ?? userLng;
    const rawLat = location?.lat ?? location?.latitude ?? userLat;
    if (typeof rawLat !== 'number' || typeof rawLng !== 'number' || isNaN(rawLat) || isNaN(rawLng)) {
      return;
    }
    const safeLng = rawLng;
    const safeLat = rawLat;
    
    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([safeLng, safeLat]);
      const el = userMarkerRef.current.getElement();
      if (mapRef.current && !mapRef.current.getContainer().contains(el)) {
        userMarkerRef.current.addTo(mapRef.current);
      }
    }

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [safeLng, safeLat],
        zoom: 16.8,
        pitch: 35,
        bearing: 0,
        duration: 1000,
        essential: true
      });
    }
  };

  const handleFitAllPeers = () => {
    if (!mapRef.current) return;
    const rawLat = location?.lat ?? location?.latitude ?? userLat;
    const rawLng = location?.lng ?? location?.longitude ?? userLng;
    if (typeof rawLat !== 'number' || typeof rawLng !== 'number' || isNaN(rawLat) || isNaN(rawLng)) {
      return;
    }
    const safeLat = rawLat;
    const safeLng = rawLng;

    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([safeLng, safeLat]);

    let peerCount = 0;
    const currentList = activeTab === 'friends' ? friends : stories;
    currentList.forEach(item => {
      if (isOwnerItem(item)) return;
      const lat = item.realLat || item.lat;
      const lng = item.realLng || item.lng;
      if (lat && lng) {
        bounds.extend([lng, lat]);
        peerCount++;
      }
    });

    if (peerCount > 0) {
      mapRef.current.fitBounds(bounds, {
        padding: { top: 120, bottom: 200, left: 70, right: 70 },
        maxZoom: 16.5,
        duration: 900
      });
    } else {
      handleFlyToUserGPS();
    }
  };

  return (
    <>
      {/* Container bản đồ toàn màn hình Google Maps Streets Vector */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0 w-full h-full bg-[#E8ECEF]" />

      {/* Banner Lọc Theo Nhóm Phong Cách Cyber HUD Glass (Rule 9 GEMINI.md) */}
      {activeCircleFilter && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-30 max-w-[92vw] animate-in slide-in-from-top-3 duration-300 pointer-events-auto font-sans select-none">
          <div className="bg-[#0B0D11]/92 backdrop-blur-2xl text-white border border-cyan-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.7)] rounded-full px-3.5 py-1.5 flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[#00F5FF] flex items-center justify-center text-xs shrink-0 shadow-[0_0_8px_rgba(0,245,255,0.25)]">
              <i className="bi bi-people-fill"></i>
            </div>
            <div className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-xs">
              Nhóm: {activeCircleFilter.name}
            </div>
            <span className="text-[10px] text-cyan-300 font-semibold bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full shrink-0">
              {(activeCircleFilter.member_ids?.length || activeCircleFilter.memberIds?.length || 1)} thành viên
            </span>
            {onClearCircleFilter && (
              <button
                type="button"
                onClick={onClearCircleFilter}
                className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-neutral-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer shrink-0"
                title="Thoát chế độ xem nhóm"
              >
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cụm Phím Nổi Thao Tác Nhanh (FAB Vertical Stack) Cạnh Phải - Chuẩn Luminous Solar-Cyber HUD */}
      {(activeTab === 'social' || activeTab === 'friends' || activeTab === 'map') && (
        <RightActionStack
          onResetCompass={() => mapRef.current?.resetNorthPitch()}
          onFitPeers={handleFitAllPeers}
          onQuickSnap={onOpenQuickSnap}
          onRecenterGps={handleFlyToUserGPS}
          hasPeers={friends.length > 0 || stories.length > 0}
          isGpsLoading={gpsLoading}
        />
      )}
    </>
  );
}
