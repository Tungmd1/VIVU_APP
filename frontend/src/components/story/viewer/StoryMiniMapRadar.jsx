import React from 'react';

/**
 * StoryMiniMapRadar - Widget Radar mini hiển thị khoảng cách GPS
 * 100% Bootstrap Icons, Rule 7 (< 150 dòng)
 */
export default function StoryMiniMapRadar({
  storyLat,
  storyLng,
  userLat,
  userLng,
  address = 'Quanh đây'
}) {
  // Tính cự ly Haversine
  const calcDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const distKm = calcDistance(userLat, userLng, storyLat, storyLng);
  const displayDist = distKm !== null ? (distKm < 1 ? `${Math.round(distKm * 1000)}m` : `${distKm.toFixed(1)}km`) : 'Gần bạn';

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white shadow-lg pointer-events-auto">
      <div className="relative w-4 h-4 rounded-full bg-[#0A8395]/40 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-[#0A8395] animate-ping" />
        <div className="absolute w-2 h-2 rounded-full bg-[#0A8395]" />
      </div>
      <span className="text-[11px] font-bold text-teal-300 font-mono">{displayDist}</span>
      <span className="text-white/40 text-[10px]">•</span>
      <span className="text-[11px] text-white/80 font-medium truncate max-w-[120px]">{address}</span>
    </div>
  );
}
