import { DEFAULT_WHITE_PERSON_AVATAR } from '../../utils/avatarUtils';
import { getChibiDataUrl } from '../../data/chibiMascotData';
import { getMascotActionDataUrl } from '../../data/messengerZaloMascotData';
import { resolveMarkerSkin, getMarkerBodyHtml } from './mapMarkerHelpers';
import { getDistanceKm } from './mapTileConstants';

export function processPeerItem(item, safeLat, safeLng, onlinePeers = [], friends = []) {
  const rawLat = Number(item.realLat ?? item.lat ?? item.latitude);
  const rawLng = Number(item.realLng ?? item.lng ?? item.longitude);
  if (isNaN(rawLat) || isNaN(rawLng)) return null;

  // Giữ nguyên 100% tọa độ GPS thật của người dùng và bạn bè
  const iLat = rawLat;
  const iLng = rawLng;

  // Xác định khoảng cách thực tế để xử lý chống đè trực quan (nếu < 10m)
  const distanceMeters = getDistanceKm(safeLat, safeLng, rawLat, rawLng) * 1000;
  const isCoLocated = distanceMeters < 10;

  const markerKey = String(item.id || item.user_id || `peer-${iLat}-${iLng}`);
  const hId = item.hostId || item.host_id || item.id;
  const isOnlineAuthor = (onlinePeers || []).some(p => p.id === hId && (p.isOnline === true || p.is_online === true)) || 
                         (friends || []).some(f => f.id === hId && (f.isOnline === true || f.is_online === true));
  const isOffline = item.isOnline != null ? (item.isOnline === false || item.is_online === false) : !isOnlineAuthor;
  const hostAvatar = item.hostAvatar || item.avatar || DEFAULT_WHITE_PERSON_AVATAR;
  const displayName = item.hostName || item.host_name || item.name || 'Người dùng VIVU';
  const peerStoriesList = Array.isArray(item.stories) && item.stories.length > 0
    ? item.stories.filter(s => s && !s.id?.startsWith('live-peer-'))
    : (item.activeStory ? [item.activeStory] : ((item.image || item.dual_image || item.video || (item.bg_gradient && item.texts?.length > 0)) && !item.id?.startsWith('live-peer-') ? [item] : []));
  const peerHasStory = peerStoriesList.length > 0;
  const peerStoryCount = peerStoriesList.length;
  const peerFirstStory = peerStoriesList[0]?.activeStory || peerStoriesList[0] || null;
  const peerStoryPreview = peerFirstStory?.image || peerFirstStory?.dual_image || null;
  const peerStoryTitle = peerFirstStory?.title || null;
  const peerSong = item.custom_song || item.songData || item.music || null;
  const peerHasSong = Boolean(peerSong);
  const peerSongTitle = peerSong?.title || peerSong?.name || null;

  const peerSkin = resolveMarkerSkin({
    manualSkin: item.pin_skin,
    hasStory: Boolean(peerHasStory),
    hasChibi: Boolean(item.custom_chibi || item.chibiId),
    hasAction: Boolean(item.pin_mascot && item.pin_action)
  });
  const peerActionDataUrl = item.pin_mascot && item.pin_action ? getMascotActionDataUrl(item.pin_mascot, item.pin_action) : null;
  const peerChibiDataUrl = (item.custom_chibi || item.chibiId) ? getChibiDataUrl(item.custom_chibi || item.chibiId) : null;
  const basePeerBodyHtml = getMarkerBodyHtml({
    skinMode: peerSkin,
    avatar: hostAvatar,
    name: displayName,
    isOwner: false,
    hasStory: peerHasStory,
    storyCount: peerStoryCount,
    storyPreviewImage: peerStoryPreview,
    storyTitle: peerStoryTitle,
    hasSong: peerHasSong,
    songTitle: peerSongTitle,
    isOffline,
    actionDataUrl: peerActionDataUrl,
    chibiDataUrl: peerChibiDataUrl,
    actionSound: item.pin_action
  });

  // Nếu ở sát nhau (< 10m), xử lý hiển thị chống đè bằng CSS transform nhỏ (10px) hoặc visual badge, không sửa tọa độ GPS
  let peerBodyHtml = basePeerBodyHtml;
  if (isCoLocated) {
    const hash = Math.abs(String(item.id || 'peer').split('').reduce((a, c) => a + c.charCodeAt(0), 0));
    const angle = (hash % 360) * (Math.PI / 180);
    const shiftX = Math.round(10 * Math.cos(angle));
    const shiftY = Math.round(10 * Math.sin(angle));
    peerBodyHtml = `<div style="transform: translate(${shiftX}px, ${shiftY}px); transition: transform 0.25s ease;" class="vivu-co-located-wrapper">${basePeerBodyHtml}</div>`;
  }

  return {
    iLat,
    iLng,
    isCoLocated,
    markerKey,
    peerBodyHtml
  };
}
