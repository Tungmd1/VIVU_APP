/**
 * mapFlyToGuard.js
 * Bộ đệm thông minh Safe Guard cho Leaflet map.flyTo
 * Tự động chuyển đổi đa hình cả 2 cú pháp:
 * 1. Leaflet chuẩn: [lat, lng], zoom, options
 * 2. Mapbox GL: { center: [lng, lat], zoom, pitch, duration }
 * Ngăn chặn triệt để lỗi "Cannot read properties of null (reading 'lat')" làm sập webapp
 */

export function attachMapFlyToGuard(map) {
  if (!map || typeof map.flyTo !== 'function') return;

  const rawFlyTo = map.flyTo.bind(map);
  map.flyTo = function(target, zoom, options) {
    try {
      if (target && typeof target === 'object' && !Array.isArray(target) && target.center) {
        const center = target.center;
        const lat = Array.isArray(center) ? center[1] : (center.lat ?? center.latitude);
        const lng = Array.isArray(center) ? center[0] : (center.lng ?? center.longitude);
        const z = target.zoom || zoom || 16;
        const dur = (target.duration ? target.duration / 1000 : 0.8) || (options?.duration || 0.8);
        if (!isNaN(Number(lat)) && !isNaN(Number(lng))) {
          return rawFlyTo([Number(lat), Number(lng)], z, { duration: dur, ...(options || {}) });
        }
        return map;
      }
      if (Array.isArray(target)) {
        const lat = Number(target[0]);
        const lng = Number(target[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          return rawFlyTo([lat, lng], zoom || 16, options || { duration: 0.8 });
        }
        return map;
      }
      return rawFlyTo(target, zoom, options);
    } catch (err) {
      console.warn('[Map FlyTo Safe Guard] Đã ngăn chặn sự cố flyTo:', err?.message);
      return map;
    }
  };
}
