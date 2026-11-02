import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'vivu_user_real_location';

/**
 * Hook định vị không gian Thiết Bị Thật (Multi-Tier Location Engine - Rule 13)
 * - Tầng 1: HTML5 High-Accuracy GPS (navigator.geolocation) từ chip GPS của thiết bị
 * - Tầng 2: IP Geolocation dự phòng khi thiết bị PC không có chip GPS hoặc timeout
 * - Tầng 3: Bộ nhớ cục bộ localStorage (lưu và tải lại toạ độ gần nhất)
 * - Tầng 4: Hỗ trợ chọn tọa độ thủ công (setManualCoords) khi người dùng chủ động chọn
 */
export function useGeolocation() {
  // Đọc tọa độ thật đã lưu gần nhất (nếu có, và loại bỏ triệt để tọa độ ảo Đà Nẵng 16.0544 cũ)
  const [location, setLocation] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
          if ((Math.abs(parsed.lat - 16.0544) < 0.0001 && Math.abs(parsed.lng - 108.2022) < 0.0001) ||
              (Math.abs(parsed.lat - 16.038) < 0.05 && Math.abs(parsed.lng - 108.219) < 0.05)) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
          }
          return { ...parsed, source: parsed.source || 'storage', isFallback: false };
        }
      }
    } catch (e) {
      console.warn('Lỗi đọc localStorage GPS:', e);
    }
    return null;
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const locationRef = useRef(location);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  // Hàm tính khoảng cách mét (Haversine) để lọc rung lắc cảm biến
  const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
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

  // Lưu tọa độ thật hợp lệ vào localStorage
  const saveLocationToStorage = useCallback((coords) => {
    if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') return;
    if (Math.abs(coords.lat - 16.0544) < 0.0001 && Math.abs(coords.lng - 108.2022) < 0.0001) {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(coords));
    } catch (e) {
      console.warn('Lỗi ghi localStorage GPS:', e);
    }
  }, []);

  // Xóa tọa độ khỏi bộ nhớ khi quyền bị thu hồi hoặc đăng xuất
  const clearLocation = useCallback(() => {
    setLocation(null);
    setPermissionGranted(false);
    locationRef.current = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Lỗi xoá localStorage GPS:', e);
    }
  }, []);

  // Tầng 2: Dự phòng định vị qua IP Geolocation khi GPS phần cứng không khả dụng (Rule 13)
  const fetchIpLocation = useCallback(async () => {
    if (locationRef.current && locationRef.current.source === 'gps') return;

    try {
      const res = await fetch('https://ipwho.is/');
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
          const coords = {
            lat: data.latitude,
            lng: data.longitude,
            accuracy: 1000,
            timestamp: Date.now(),
            source: 'ip',
            cityName: data.city || data.region || 'Vị trí mạng IP',
            isFallback: false
          };
          setLocation(coords);
          saveLocationToStorage(coords);
          setLoading(false);
          setPermissionGranted(true);
          return;
        }
      }
    } catch (_) {}

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
          setLocation({ ...parsed, source: parsed.source || 'storage' });
          setLoading(false);
          return;
        }
      }
    } catch (_) {}

    const fallbackCoords = {
      lat: 13.77665,
      lng: 109.22385,
      accuracy: 50,
      timestamp: Date.now(),
      source: 'fallback',
      cityName: 'Quy Nhơn',
      isFallback: true
    };
    setLocation(fallbackCoords);
    setLoading(false);
  }, [saveLocationToStorage]);

  // Tầng 1: Đọc tọa độ GPS thật của thiết bị qua HTML5 Geolocation API
  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ chip Geolocation, chuyển sang định vị IP.');
      setLoading(false);
      setPermissionDenied(true);
      setPermissionGranted(false);
      fetchIpLocation();
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp || Date.now(),
          source: 'gps',
          cityName: locationRef.current?.cityName || 'Vị trí GPS',
          isFallback: false
        };
        setLocation(coords);
        saveLocationToStorage(coords);
        setLoading(false);
        setPermissionGranted(true);
        setPermissionDenied(false);
        setError(null);
      },
      (err) => {
        console.warn('HTML5 GPS error, fallback sang IP:', err.code, err.message);
        setLoading(false);
        setPermissionGranted(false);

        if (err.code === 1) { // PERMISSION_DENIED
          setPermissionDenied(true);
          setError('Quyền GPS bị từ chối, sử dụng định vị IP.');
        } else if (err.code === 2) { // POSITION_UNAVAILABLE
          setError('Không thể kết nối phần cứng GPS, sử dụng định vị IP.');
        } else if (err.code === 3) { // TIMEOUT
          setError('Quá thời gian lấy GPS, sử dụng định vị IP.');
        } else {
          setError(err.message || 'Lỗi định vị vị trí.');
        }
        fetchIpLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000,
      }
    );
  }, [fetchIpLocation, saveLocationToStorage]);

  // Tầng 4: Đặt tọa độ thủ công khi người dùng chủ động chọn trên map
  const setManualCoords = useCallback((lat, lng, cityName = 'Vị trí đã chọn') => {
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) return;
    const coords = {
      lat: Number(lat),
      lng: Number(lng),
      accuracy: 10,
      cityName,
      source: 'manual',
      isFallback: false,
      timestamp: Date.now()
    };
    setLocation(coords);
    saveLocationToStorage(coords);
    setLoading(false);
    setPermissionGranted(true);
  }, [saveLocationToStorage]);

  // Vòng đời cảm biến và theo dõi trạng thái quyền trình duyệt
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((status) => {
        if (status.state === 'denied') {
          setPermissionDenied(true);
          setPermissionGranted(false);
          fetchIpLocation();
        } else if (status.state === 'granted') {
          setPermissionGranted(true);
          setPermissionDenied(false);
          requestLocation();
        }

        status.onchange = () => {
          if (status.state === 'denied') {
            setPermissionDenied(true);
            setPermissionGranted(false);
            fetchIpLocation();
          } else if (status.state === 'granted') {
            setPermissionDenied(false);
            setPermissionGranted(true);
            requestLocation();
          }
        };
      }).catch(() => {
        // Trình duyệt không hỗ trợ query permissions
      });
    }

    requestLocation();

    let watchId = null;
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          if (pos.coords.accuracy > 350 && locationRef.current && (locationRef.current.accuracy || 0) < 100) {
            return;
          }

          if (locationRef.current) {
            const dist = getDistanceMeters(
              locationRef.current.lat,
              locationRef.current.lng,
              pos.coords.latitude,
              pos.coords.longitude
            );
            if (dist < 8) return;
          }

          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp || Date.now(),
            source: 'gps',
            cityName: locationRef.current?.cityName || 'Vị trí GPS',
            isFallback: false
          };
          setLocation(coords);
          saveLocationToStorage(coords);
          setPermissionGranted(true);
          setPermissionDenied(false);
        },
        (err) => {
          if (err.code === 1) {
            setPermissionDenied(true);
            setPermissionGranted(false);
            fetchIpLocation();
          }
        },
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    }

    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [fetchIpLocation, requestLocation, saveLocationToStorage]);

  return {
    location,
    error,
    loading,
    permissionGranted,
    permissionDenied,
    locationSource: location?.source || 'none',
    cityName: location?.cityName || '',
    isFallback: false,
    requestLocation,
    clearLocation,
    setManualCoords
  };
}
