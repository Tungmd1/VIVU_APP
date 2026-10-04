import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

const MAPBOX_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_TOKEN ||
  'pk.eyJ1IjoibWFpZHVjdHVuZyIsImEiOiJjbXVtOGlqMm8wOTU5MnhvZmM5bXBqYnYyIn0.OAm5O7g64WWuibNsc-EWGQ';

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  color?: string;
  avatar?: string;
  isSelf?: boolean;
  beacon?: {
    emoji: string;
    text: string;
    category?: string;
    remainingTime?: string;
  };
  status?: {
    battery?: number;
    activity?: 'chilling' | 'working' | 'moving' | 'online';
  };
  onPress?: () => void;
}

export interface MapViewComponentProps {
  markers: MapMarker[];
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  centerCoordinate?: {
    latitude: number;
    longitude: number;
    zoom?: number;
  } | null;
  style?: any;
  flyingEmojiTrigger?: any;
  onEmojiProjected?: (e: string, sx: number, sy: number, ex: number, ey: number) => void;
}

export const MapViewComponent: React.FC<MapViewComponentProps> = ({
  markers,
  initialRegion,
  centerCoordinate,
  style,
  flyingEmojiTrigger,
  onEmojiProjected,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const initialCenter = useMemo(
    () => ({
      lng: initialRegion?.longitude || 108.2022,
      lat: initialRegion?.latitude || 16.0544,
      zoom: 13,
    }),
    [initialRegion]
  );

  // Gửi lệnh flyTo khi vị trí tâm thay đổi (ví dụ: bấm nút Recenter GPS)
  useEffect(() => {
    if (centerCoordinate && webViewRef.current && mapLoaded) {
      const zoom = centerCoordinate.zoom || 14;
      const js = `
        if (window.map) {
          window.map.flyTo({
            center: [${centerCoordinate.longitude}, ${centerCoordinate.latitude}],
            zoom: ${zoom},
            duration: 1500,
            essential: true
          });
        }
        true;
      `;
      webViewRef.current.injectJavaScript(js);
    }
  }, [centerCoordinate, mapLoaded]);

  useEffect(() => {
    if (flyingEmojiTrigger && webViewRef.current && mapLoaded) {
      const { startLat, startLng, endLat, endLng, emoji } = flyingEmojiTrigger;
      webViewRef.current.injectJavaScript(`
        if (window.map) {
          const p1 = window.map.project([${startLng}, ${startLat}]);
          const p2 = window.map.project([${endLng}, ${endLat}]);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'EMOJI_XY',
            emoji: '${emoji}',
            sx: p1.x,
            sy: p1.y,
            ex: p2.x,
            ey: p2.y
          }));
        }
        true;
      `);
    }
  }, [flyingEmojiTrigger, mapLoaded]);

  // Cập nhật markers động khi danh sách markers thay đổi
  useEffect(() => {
    if (webViewRef.current && mapLoaded) {
      const cleanMarkers = markers.map((m) => ({
        id: m.id,
        lng: m.longitude,
        lat: m.latitude,
        title: m.title,
        avatar:
          m.avatar ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        isSelf: !!m.isSelf,
        beacon: m.beacon,
        status: m.status,
      }));

      const js = `
        if (window.updateMapboxMarkers) {
          window.updateMapboxMarkers(${JSON.stringify(cleanMarkers)});
        }
        true;
      `;
      webViewRef.current.injectJavaScript(js);
    }
  }, [markers, mapLoaded]);

  // Nhận thông điệp từ WebView khi người dùng chạm vào marker
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'EMOJI_XY') {
        onEmojiProjected?.(data.emoji, data.sx, data.sy, data.ex, data.ey);
      }
      if (data.type === 'DEBUG') { console.log('[WebView DEBUG]', data.msg); }
      if (data.type === 'MARKER_CLICK') {
        const target = markers.find((m) => m.id === data.id);
        target?.onPress?.();
      } else if (data.type === 'MAP_LOADED') {
        setMapLoaded(true);
      }
    } catch {
      // ignore
    }
  };

  const initialMarkersJson = useMemo(() => {
    return JSON.stringify(
      markers.map((m) => ({
        id: m.id,
        lng: m.longitude,
        lat: m.latitude,
        title: m.title,
        avatar:
          m.avatar ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        isSelf: !!m.isSelf,
        beacon: m.beacon,
        status: m.status,
      }))
    );
  }, [markers]);

  // Mã nguồn HTML tải Mapbox GL JS Vector Dark Mode nguyên bản
  const mapboxHtml = useMemo(() => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet" />
  <script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"></script>
  <style>
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #0B0F19; overflow: hidden; }
    .mapboxgl-ctrl-bottom-left, .mapboxgl-ctrl-bottom-right, .mapboxgl-ctrl-attrib { display: none !important; }
    
    .marker-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      user-select: none;
    }
    
    .beacon-bubble {
      background: rgba(23, 27, 38, 0.95);
      border: 1.5px solid #FF4B72;
      border-radius: 16px;
      padding: 4px 10px;
      display: flex;
      align-items: center;
      gap: 5px;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 700;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin-bottom: 4px;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0,0,0,0.6);
      pointer-events: auto;
    }
    
    .avatar-wrapper {
      position: relative;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .avatar-circle {
      width: 44px;
      height: 44px;
      border-radius: 22px;
      overflow: hidden;
      background: #1E293B;
      position: relative;
    }
    
    .avatar-circle.self {
      border: 3px solid #FF4B72;
      box-shadow: 0 0 16px rgba(255, 75, 114, 0.7);
    }
    
    .avatar-circle.other {
      border: 2.5px solid #38BDF8;
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.5);
    }
    
    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    
    .status-badge {
      position: absolute;
      bottom: -2px;
      right: -2px;
      background: #0F172A;
      color: #FFFFFF;
      font-size: 9px;
      font-weight: 800;
      padding: 1px 4px;
      border-radius: 6px;
      border: 1px solid #334155;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    .marker-name {
      color: #E2E8F0;
      font-size: 11px;
      font-weight: 600;
      margin-top: 3px;
      text-shadow: 0 1px 3px rgba(0,0,0,0.9);
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    @keyframes radarPulse {
      0% { transform: scale(1); opacity: 0.8; }
      100% { transform: scale(2.8); opacity: 0; }
    }
    
    .radar-wave {
      position: absolute;
      width: 44px;
      height: 44px;
      border-radius: 22px;
      background: rgba(255, 75, 114, 0.45);
      animation: radarPulse 2s cubic-bezier(0, 0.2, 0.8, 1) infinite;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    mapboxgl.accessToken = '${MAPBOX_TOKEN}';
    
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [${initialCenter.lng}, ${initialCenter.lat}],
      zoom: ${initialCenter.zoom},
      attributionControl: false
    });

    window.map = map;
    let currentMapboxMarkers = [];

    function postAppMessage(payload) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
    }

    function createMarkerElement(m) {
      const container = document.createElement('div');
      container.className = 'marker-container';
      container.onclick = function(e) {
        e.stopPropagation();
        postAppMessage({ type: 'MARKER_CLICK', id: m.id });
      };

      // 1. Bong bóng nguyện vọng (NOW Beacon)
      if (m.beacon && m.beacon.text) {
        const bubble = document.createElement('div');
        bubble.className = 'beacon-bubble';
        bubble.innerHTML = '<span style="font-size:13px;">' + (m.beacon.emoji || '💬') + '</span><span>' + m.beacon.text + '</span>';
        container.appendChild(bubble);
      }

      // 2. Avatar Pin
      const avatarWrapper = document.createElement('div');
      avatarWrapper.className = 'avatar-wrapper';

      if (m.isSelf) {
        const wave = document.createElement('div');
        wave.className = 'radar-wave';
        avatarWrapper.appendChild(wave);
      }

      const avatarCircle = document.createElement('div');
      avatarCircle.className = 'avatar-circle ' + (m.isSelf ? 'self' : 'other');

      const img = document.createElement('img');
      img.className = 'avatar-img';
      img.src = m.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
      avatarCircle.appendChild(img);

      if (m.status) {
        const badge = document.createElement('div');
        badge.className = 'status-badge';
        badge.innerText = m.status.battery !== undefined ? '🔋' + m.status.battery + '%' : '🟢';
        avatarCircle.appendChild(badge);
      }

      avatarWrapper.appendChild(avatarCircle);
      container.appendChild(avatarWrapper);

      // 3. Name label
      const name = document.createElement('span');
      name.className = 'marker-name';
      name.innerText = m.title || '';
      container.appendChild(name);

      return container;
    }

    window.updateMapboxMarkers = function(markersData) {
      currentMapboxMarkers.forEach(function(m) { m.remove(); });
      currentMapboxMarkers = [];

      markersData.forEach(function(m) {
        const el = createMarkerElement(m);
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([m.lng, m.lat])
          .addTo(map);
        currentMapboxMarkers.push(marker);
      });
    };

    window.flyEmoji = function(startLat, startLng, endLat, endLng, emoji) {
      const container = document.createElement('div');
      container.style.zIndex = '999999';
      container.style.pointerEvents = 'none';

      const inner = document.createElement('div');
      inner.innerHTML = '<span style="font-size: 34px; display: inline-block;">' + emoji + '</span>';
      inner.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      inner.style.transform = 'scale(0) translateY(10px)';
      inner.style.textShadow = '0 2px 10px rgba(0,0,0,0.5)';
      
      container.appendChild(inner);

      const marker = new mapboxgl.Marker({ element: container })
        .setLngLat([startLng, startLat])
        .addTo(map);
        
      setTimeout(() => {
        inner.style.transform = 'scale(1.5) translateY(-20px)';
      }, 50);

      let startTime = null;
      const duration = 1800;
      
      function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        let progress = (timestamp - startTime) / duration;
        if (progress > 1) progress = 1;
        
        const easeProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        const currentLng = startLng + (endLng - startLng) * easeProgress;
        const arcHeight = 0.005; // Cao độ của đường cong parabol 
        const currentLat = startLat + (endLat - startLat) * easeProgress + Math.sin(easeProgress * Math.PI) * arcHeight;
        
        marker.setLngLat([currentLng, currentLat]);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          inner.style.transition = 'all 0.4s ease-out';
          inner.style.transform = 'scale(4) translateY(-30px)';
          inner.style.opacity = '0';
          setTimeout(() => {
            marker.remove();
          }, 400);
        }
      }
      
      setTimeout(() => {
        requestAnimationFrame(animate);
      }, 400);
    };

    map.on('load', function() {
      postAppMessage({ type: 'MAP_LOADED' });
      window.updateMapboxMarkers(${initialMarkersJson});
    });
  </script>
</body>
</html>
    `;
  }, [initialCenter]);

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapboxHtml }}
        style={styles.webView}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF4B72" />
            <Text style={styles.loadingText}>Đang tải bản đồ VIVU Mapbox...</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0B0F19',
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0B0F19',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
  },
});
