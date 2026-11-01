import { useState, useEffect, useRef } from 'react';

// Hàm tính khoảng cách GPS Haversine (km)
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

/**
 * useProximityDetector - Hook phát hiện bạn bè ở cự ly siêu gần (< 15m)
 * Tích hợp cảm biến Lắc Điện Thoại (Shake-to-Bump) qua Devicemotion API
 */
export function useProximityDetector({
  userLat,
  userLng,
  friends = [],
  onTriggerBump
}) {
  const [nearbyFriend, setNearbyFriend] = useState(null);
  const [nearbyDistanceMeters, setNearbyDistanceMeters] = useState(null);
  const lastShakeTimeRef = useRef(0);
  const onTriggerBumpRef = useRef(onTriggerBump);
  onTriggerBumpRef.current = onTriggerBump;

  // 1. Quét cự ly bạn bè theo chu kỳ tọa độ
  useEffect(() => {
    if (!userLat || !userLng || !Array.isArray(friends) || friends.length === 0) {
      setNearbyFriend(null);
      setNearbyDistanceMeters(null);
      return;
    }

    let closest = null;
    let minMeters = Infinity;

    for (const friend of friends) {
      // 1. BẮT BUỘC: Người đó phải ĐANG ONLINE
      const isOnline = friend.isOnline === true || friend.is_online === true || friend.online === true;
      if (!isOnline) continue;

      // 2. BẮT BUỘC: Phải có tọa độ GPS số hợp lệ
      const fLat = Number(friend.realLat ?? friend.lat);
      const fLng = Number(friend.realLng ?? friend.lng);
      if (isNaN(fLat) || isNaN(fLng)) continue;

      const distKm = getDistanceFromLatLonInKm(userLat, userLng, fLat, fLng);
      const meters = Math.round(distKm * 1000);

      // 3. BẮT BUỘC: Cự ly siêu gần (< 15 mét)
      if (meters <= 15 && meters < minMeters) {
        minMeters = meters;
        closest = { ...friend, isOnline: true };
      }
    }

    if (closest) {
      setNearbyFriend(closest);
      setNearbyDistanceMeters(minMeters);
    } else {
      setNearbyFriend(null);
      setNearbyDistanceMeters(null);
    }
  }, [userLat, userLng, friends]);

  // 2. Lắng nghe cảm biến Lắc Điện Thoại (Shake Detection)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let lastX = 0, lastY = 0, lastZ = 0;

    const handleDeviceMotion = (event) => {
      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (!acc) return;

      const deltaX = Math.abs(acc.x - lastX);
      const deltaY = Math.abs(acc.y - lastY);
      const deltaZ = Math.abs(acc.z - lastZ);

      lastX = acc.x;
      lastY = acc.y;
      lastZ = acc.z;

      // Gia tốc lắc mạnh vượt ngưỡng 22 m/s²
      if (deltaX + deltaY + deltaZ > 24) {
        const now = Date.now();
        // Chống spam: cách nhau ít nhất 3.5s
        if (now - lastShakeTimeRef.current > 3500) {
          lastShakeTimeRef.current = now;
          if (nearbyFriend && onTriggerBumpRef.current) {
            console.log('[useProximityDetector] 📱 Phát hiện cử chỉ lắc điện thoại -> Kích hoạt Cụm Ly 3D!');
            onTriggerBumpRef.current(nearbyFriend);
          }
        }
      }
    };

    window.addEventListener('devicemotion', handleDeviceMotion, { passive: true });
    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [nearbyFriend]);

  return {
    nearbyFriend,
    nearbyDistanceMeters,
    triggerBump: () => {
      if (nearbyFriend && onTriggerBumpRef.current) {
        onTriggerBumpRef.current(nearbyFriend);
      }
    }
  };
}

