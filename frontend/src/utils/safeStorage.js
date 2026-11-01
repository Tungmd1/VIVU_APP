/**
 * Tiện ích truy xuất localStorage an toàn (Safe Storage Helper)
 * Chống crash trên iOS Safari Private Browsing hoặc khi trình duyệt di động hạn chế bộ nhớ.
 */

export function safeGetItem(key, defaultValue = null) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return defaultValue;
    const item = window.localStorage.getItem(key);
    return item !== null ? item : defaultValue;
  } catch (err) {
    console.warn(`[SafeStorage] Lỗi đọc key "${key}":`, err.message);
    return defaultValue;
  }
}

export function safeSetItem(key, value) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    window.localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`[SafeStorage] Lỗi ghi key "${key}":`, err.message);
    return false;
  }
}

export function safeRemoveItem(key) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    window.localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.warn(`[SafeStorage] Lỗi xóa key "${key}":`, err.message);
    return false;
  }
}

export function safeGetJson(key, defaultValue = null) {
  try {
    const raw = safeGetItem(key, null);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[SafeStorage] Lỗi parse JSON key "${key}":`, err.message);
    return defaultValue;
  }
}
