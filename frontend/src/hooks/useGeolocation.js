import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'vivu_user_real_location';

/**
 * Hook định vị không gian Thiết Bị Thật (Hardware GPS Location Engine)
 * - Tầng 1: HTML5 High-Accuracy GPS (navigator.geolocation) từ chip GPS của thiết bị
 * - Tầng 2: Quản lý vòng đời quyền GPS (granted, denied, revoked) theo thời gian thực
 * - Tầng 3: Bộ nhớ cục bộ localStorage (chỉ lưu tọa độ GPS thật đã được xác minh)
 * - Tầng 4: Hỗ trợ chọn tọa độ thủ công (setManualCoords) khi người dùng chủ động chọn
 * - TRIỆT TIÊU HOÀN TOÀN TỌA ĐỘ ĐÀ NẴNG MẶC ĐỊNH HOẶC FALLBACK ẢO
 */
export function useGeolocation() {
  // Đọc tọa độ thật đã lưu gần nhất (nếu có, và loại bỏ triệt để tọa độ ảo Đà Nẵng 16.0544 cũ)
  const [location, setLocation] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
          // Nếu dữ liệu cũ trong cache là Đà Nẵng hardcode (16.0544, 108.2022) -> Xóa sạch ngay!
          if (Math.abs(parsed.lat - 16.0544) < 0.0001 && Math.abs(parsed.lng - 108.2022) < 0.0001) {
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
    // Tuyệt đối không lưu toạ độ ảo Đà Nẵng mặc định
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

  // Tầng 1: Đọc tọa độ GPS thật của thiết bị qua HTML5 Geolocation API
  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (!navigator.geolocation) {
      setError('Trình duyệt của bạn không hỗ trợ Geolocation.');
      setLoading(false);
      setPermissionDenied(true);
      setPermissionGranted(false);
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
        console.warn('HTML5 GPS error:', err.code, err.message);
        setLoading(false);
        setPermissionGranted(false);

        if (err.code === 1) { // PERMISSION_DENIED
          setPermissionDenied(true);
          setError('Quyền truy cập vị trí đã bị từ chối.');
          clearLocation();
        } else if (err.code === 2) { // POSITION_UNAVAILABLE
          setError('Không thể xác định vị trí của thiết bị.');
        } else if (err.code === 3) { // TIMEOUT
          setError('Quá thời gian xác định vị trí GPS.');
        } else {
          setError(err.message || 'Lỗi định vị vị trí.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000,
      }
    );
  }, [clearLocation, saveLocationToStorage]);

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
    // 1. Kiểm tra trạng thái quyền qua Permissions API (nếu có hỗ trợ)
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((status) => {
        if (status.state === 'denied') {
          setPermissionDenied(true);
          setPermissionGranted(false);
          clearLocation();
        } else if (status.state === 'granted') {
          setPermissionGranted(true);
          setPermissionDenied(false);
          requestLocation();
        }

        // Lắng nghe khi người dùng bấm thu hồi hoặc cấp quyền trực tiếp trên thanh URL
        status.onchange = () => {
          if (status.state === 'denied') {
            setPermissionDenied(true);
            setPermissionGranted(false);
            clearLocation();
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

    // 2. Yêu cầu lấy vị trí ban đầu
    requestLocation();

    // 3. Lắng nghe cập nhật GPS liên tục khi di chuyển (watchPosition)
    let watchId = null;
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          // Bỏ qua nếu độ chính xác quá tệ (> 350m) khi đã có vị trí tốt
          if (pos.coords.accuracy > 350 && locationRef.current && (locationRef.current.accuracy || 0) < 100) {
            return;
          }

          // Lọc micro-drift: chỉ cập nhật nếu di chuyển > 8m
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
            clearLocation();
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
  }, [clearLocation, requestLocation, saveLocationToStorage]);

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
