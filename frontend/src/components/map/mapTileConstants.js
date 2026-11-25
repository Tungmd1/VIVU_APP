/**
 * mapTileConstants.js
 * Cấu hình tile Google Maps (như bản chuẩn trước đây) kèm fallback OpenStreetMap / ESRI
 * và các hàm đo đạc tọa độ địa lý
 */

export const VIVU_MAP_TILES = {
  streets: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
  satellite: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
  osmFallback: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  esriFallback: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
};

export const TILE_LAYER_OPTIONS = {
  subdomains: '0123',
  maxZoom: 20
};

export const TILE_ATTRIBUTION = '&copy; Google Maps &amp; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export function getDistanceKm(lat1, lon1, lat2, lon2) {
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
