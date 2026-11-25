/**
 * mapNavigationUtils.js
 * Tiện ích tính toán dẫn đường nội bộ (In-app Routing), khoảng cách chính xác và tốc độ GPS cho VIVU
 * Tuyệt đối không phụ thuộc dịch vụ ngoài Google Maps (Rule T1.07 Zero External Maps)
 */

/**
 * Tính khoảng cách đường chim bay chính xác theo công thức Haversine (mét)
 */
export function calculateHaversineMeters(lat1, lng1, lat2, lng2) {
  const pLat1 = Number(lat1);
  const pLng1 = Number(lng1);
  const pLat2 = Number(lat2);
  const pLng2 = Number(lng2);

  if (!Number.isFinite(pLat1) || !Number.isFinite(pLng1) || !Number.isFinite(pLat2) || !Number.isFinite(pLng2)) {
    return 0;
  }

  const R = 6371e3; // Bán kính Trái Đất (mét)
  const phi1 = (pLat1 * Math.PI) / 180;
  const phi2 = (pLat2 * Math.PI) / 180;
  const deltaPhi = ((pLat2 - pLat1) * Math.PI) / 180;
  const deltaLambda = ((pLng2 - pLng1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Định dạng khoảng cách mét sang chuỗi hiển thị thân thiện (m hoặc km)
 */
export function formatExactDistance(meters) {
  const m = Number(meters);
  if (!Number.isFinite(m) || m <= 0) return '0 m';
  if (m < 1000) {
    return `${Math.round(m)} m`;
  }
  const km = m / 1000;
  return `${km < 10 ? km.toFixed(2) : km.toFixed(1)} km`;
}

/**
 * Định dạng thời gian di chuyển dự kiến (giây -> phút / giờ)
 */
export function formatDurationSeconds(seconds) {
  const s = Number(seconds);
  if (!Number.isFinite(s) || s <= 0) return '~1 phút';
  const mins = Math.round(s / 60);
  if (mins < 60) {
    return `~${Math.max(1, mins)} phút`;
  }
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `~${hours}h ${remMins}p` : `~${hours} giờ`;
}

/**
 * Tính toán tốc độ di chuyển thực tế (km/h) từ phần cứng hoặc tọa độ liên tiếp
 */
export function calculateSpeedKmh({ prevLat, prevLng, prevTs, nextLat, nextLng, nextTs, nativeSpeedMs }) {
  // 1. Ưu tiên tốc độ thực từ cảm biến GPS phần cứng (native speed m/s -> km/h)
  if (nativeSpeedMs != null && Number.isFinite(Number(nativeSpeedMs)) && Number(nativeSpeedMs) >= 0) {
    const rawSpeed = Number(nativeSpeedMs) * 3.6;
    return rawSpeed < 1.0 ? 0 : Number(rawSpeed.toFixed(1));
  }

  // 2. Nội suy từ 2 lần cập nhật GPS liên tiếp
  if (prevLat != null && prevLng != null && nextLat != null && nextLng != null && prevTs && nextTs) {
    const deltaTimeSec = Math.max(0.5, (nextTs - prevTs) / 1000);
    // Bỏ qua nếu thời gian quá dài (> 60s) vì không còn tính tức thời
    if (deltaTimeSec <= 60) {
      const distanceMeters = calculateHaversineMeters(prevLat, prevLng, nextLat, nextLng);
      const speedMs = distanceMeters / deltaTimeSec;
      const speedKmh = speedMs * 3.6;
      // Chặn nhiễu đứng yên khi rung lắc cảm biến (< 1.5 km/h)
      if (speedKmh < 1.5) return 0;
      // Chặn tốc độ siêu thực (> 160 km/h do GPS nhảy điểm)
      if (speedKmh > 160) return 0;
      return Number(speedKmh.toFixed(1));
    }
  }

  return 0;
}

/**
 * Lấy lộ trình đường đi thực tế từ OSRM Project (có timeout & fallback Haversine mượt)
 * Trả về: { coordinates: [[lat, lng], ...], distanceMeters, durationSeconds, isRoadRoute }
 */
export async function fetchInAppRoute({ startLat, startLng, endLat, endLng, profile = 'driving', signal = null }) {
  const pStartLat = Number(startLat);
  const pStartLng = Number(startLng);
  const pEndLat = Number(endLat);
  const pEndLng = Number(endLng);

  const fallbackDist = calculateHaversineMeters(pStartLat, pStartLng, pEndLat, pEndLng);
  const fallbackDuration = profile === 'foot' ? Math.round(fallbackDist / 1.2) : Math.round(fallbackDist / 8.3);

  const fallbackResult = {
    coordinates: [
      [pStartLat, pStartLng],
      [pEndLat, pEndLng]
    ],
    distanceMeters: fallbackDist,
    durationSeconds: fallbackDuration,
    isRoadRoute: false
  };

  if (!Number.isFinite(pStartLat) || !Number.isFinite(pStartLng) || !Number.isFinite(pEndLat) || !Number.isFinite(pEndLng)) {
    return fallbackResult;
  }

  // Nếu cự ly cực nhỏ (< 5m), không cần gọi mạng
  if (fallbackDist < 5) {
    return {
      coordinates: [[pStartLat, pStartLng], [pEndLat, pEndLng]],
      distanceMeters: fallbackDist,
      durationSeconds: 10,
      isRoadRoute: true
    };
  }

  const osrmProfile = profile === 'foot' ? 'foot' : 'driving';
  const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${pStartLng},${pStartLat};${pEndLng},${pEndLat}?overview=full&geometries=geojson&steps=false`;

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), 3500);

  try {
    const fetchSignal = signal ? AbortSignal.any([signal, timeoutController.signal]) : timeoutController.signal;
    const response = await fetch(url, { signal: fetchSignal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return fallbackResult;
    }

    const data = await response.json();
    if (data?.code === 'Ok' && Array.isArray(data?.routes) && data.routes.length > 0) {
      const bestRoute = data.routes[0];
      const geoCoords = bestRoute?.geometry?.coordinates; // [[lng, lat], ...]
      if (Array.isArray(geoCoords) && geoCoords.length >= 2) {
        // Chuyển đổi OSRM [lng, lat] sang Leaflet [lat, lng]
        const leafletCoords = geoCoords.map(([lng, lat]) => [lat, lng]);
        return {
          coordinates: leafletCoords,
          distanceMeters: Math.round(bestRoute.distance || fallbackDist),
          durationSeconds: Math.round(bestRoute.duration || fallbackDuration),
          isRoadRoute: true
        };
      }
    }
    return fallbackResult;
  } catch (err) {
    clearTimeout(timeoutId);
    return fallbackResult;
  }
}
