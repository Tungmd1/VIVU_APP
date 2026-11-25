import L from 'leaflet';

/**
 * mapNavigationLayer.js
 * Quản lý các lớp đồ họa vẽ lộ trình dẫn đường ngay bên trong Leaflet VivuMapView
 * - Vòng sáng neon phát xung tại điểm xuất phát (chân người dùng)
 * - Đường dẫn đường 2 tầng: Tầng dưới phát sáng (glow), tầng trên nét đứt động (marching dashes)
 * - Ghim đích đến có thẻ tên và khoảng cách nổi bật
 */

export class MapNavigationLayerManager {
  constructor(map) {
    this.map = map;
    this.layers = [];
    this.startMarker = null;
    this.destMarker = null;
  }

  clear() {
    this.layers.forEach((layer) => {
      try {
        layer.remove();
      } catch (_) {}
    });
    this.layers = [];

    if (this.startMarker) {
      try {
        this.startMarker.remove();
      } catch (_) {}
      this.startMarker = null;
    }

    if (this.destMarker) {
      try {
        this.destMarker.remove();
      } catch (_) {}
      this.destMarker = null;
    }
  }

  renderRoute({
    coordinates,
    targetTitle = 'Điểm đến',
    distanceText = '',
    isRoadRoute = true
  }) {
    this.clear();

    if (!this.map || !Array.isArray(coordinates) || coordinates.length < 2) {
      return;
    }

    const startPoint = coordinates[0];
    const endPoint = coordinates[coordinates.length - 1];

    // 1. Vòng tròn phát sáng tại chân người dùng
    const startPulseEl = document.createElement('div');
    startPulseEl.className = 'relative flex items-center justify-center';
    startPulseEl.innerHTML = `
      <div class="absolute w-8 h-8 rounded-full bg-[#00E5FF]/30 animate-ping"></div>
      <div class="w-4 h-4 rounded-full bg-[#00E5FF] border-2 border-white shadow-[0_0_12px_#00E5FF]"></div>
    `;
    const startIcon = L.divIcon({
      html: startPulseEl,
      className: 'vivu-nav-start-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    this.startMarker = L.marker(startPoint, { icon: startIcon, zIndexOffset: 900 }).addTo(this.map);

    // 2. Lớp đường nền phát quang (Glow polyline)
    const glowPolyline = L.polyline(coordinates, {
      color: '#00E5FF',
      weight: 8,
      opacity: 0.35,
      lineCap: 'round',
      lineJoin: 'round',
      interactive: false
    }).addTo(this.map);
    this.layers.push(glowPolyline);

    // 3. Lớp đường nét chính rực rỡ (Core path)
    const corePolyline = L.polyline(coordinates, {
      color: isRoadRoute ? '#0A8395' : '#00E5FF',
      weight: 4.5,
      opacity: 0.95,
      dashArray: isRoadRoute ? '8, 8' : '6, 6',
      lineCap: 'round',
      lineJoin: 'round',
      interactive: false
    }).addTo(this.map);
    this.layers.push(corePolyline);

    // 4. Ghim đích đến với thẻ tên + khoảng cách nổi bật
    const destEl = document.createElement('div');
    destEl.className = 'relative flex flex-col items-center select-none';
    destEl.innerHTML = `
      <div class="px-2.5 py-1 rounded-full bg-[#14252E] text-white border border-[#00E5FF]/40 text-[10px] font-bold shadow-lg flex items-center gap-1 whitespace-nowrap mb-1">
        <i class="bi bi-geo-alt-fill text-[#FF2A85]"></i>
        <span class="max-w-[120px] truncate">${targetTitle}</span>
        ${distanceText ? `<span class="text-[#00E5FF] font-mono">(${distanceText})</span>` : ''}
      </div>
      <div class="w-6 h-6 rounded-full bg-[#FF2A85] text-white flex items-center justify-center border-2 border-white shadow-[0_0_12px_rgba(255,42,133,0.5)]">
        <i class="bi bi-flag-fill text-[10px]"></i>
      </div>
    `;
    const destIcon = L.divIcon({
      html: destEl,
      className: 'vivu-nav-dest-icon',
      iconSize: [140, 50],
      iconAnchor: [70, 48]
    });
    this.destMarker = L.marker(endPoint, { icon: destIcon, zIndexOffset: 950 }).addTo(this.map);

    return {
      bounds: L.latLngBounds(coordinates)
    };
  }

  destroy() {
    this.clear();
    this.map = null;
  }
}
