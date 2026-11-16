/**
 * avatarUtils.js - Tiện ích chuẩn hóa Avatar VIVU (Quy chuẩn Avatar Hình Người Nền Trắng)
 * - Tuyệt đối không dùng avatar AI mockup (Dicebear, Unsplash)
 * - Khi người dùng chưa thêm ảnh đại diện: 100% hiển thị Avatar hình người nền trắng chuẩn (White Silhouette)
 */

export const DEFAULT_WHITE_PERSON_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><circle cx='64' cy='64' r='64' fill='%23FFFFFF'/><circle cx='64' cy='48' r='20' fill='%238E8E93'/><path d='M64 74c-22 0-40 12-40 28v6h80v-6c0-16-18-28-40-28z' fill='%238E8E93'/></svg>";

export function getSafeAvatar(avatarUrl) {
  if (
    avatarUrl &&
    typeof avatarUrl === 'string' &&
    avatarUrl.trim().length > 0 &&
    !avatarUrl.includes('unsplash.com') &&
    !avatarUrl.includes('dicebear.com')
  ) {
    return avatarUrl;
  }
  return DEFAULT_WHITE_PERSON_AVATAR;
}
