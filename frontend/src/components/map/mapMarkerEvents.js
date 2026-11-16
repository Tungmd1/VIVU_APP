import { playChibiSound } from '../../data/chibiMascotData';
import { playActionSound } from '../../data/messengerZaloMascotData';

/**
 * mapMarkerEvents.js - Event Delegation & Interaction Handler cho Leaflet Markers (Rule 3)
 * - Tách độc lập để tối ưu line count (< 450 dòng, Rule 7)
 * - Hỗ trợ âm thanh chibi, âm thanh hoạt động, bài hát MP3, mở Story, Profile & Troll Modal
 */

export function bindOwnerMarkerEvents(el, {
  userCustomSongRef,
  myActiveStoryRef,
  onOpenCreateStoryRef,
  onOpenStoryDetailRef,
  onOpenUserMenuRef,
  storyAudioPlayer
}) {
  if (!el || el._vivuOwnerEventsBound) return;
  el._vivuOwnerEventsBound = true;

  el.addEventListener('click', (e) => {
    e.stopPropagation();

    // 1. NÚT CHỨC NĂNG NHỎ: Nút (+) Đăng Story nhanh - Ưu tiên hàng đầu (Rule 3)
    if (e.target.closest('#btn-quick-create-story')) {
      if (onOpenCreateStoryRef.current) {
        onOpenCreateStoryRef.current();
      }
      return;
    }

    // 2. Nút phát bài hát MP3 của chính Bạn
    if (e.target.closest('#btn-play-owner-song')) {
      const curSong = userCustomSongRef.current;
      if (curSong && storyAudioPlayer) {
        const isPlaying = storyAudioPlayer.togglePlay(curSong);
        const playIcon = el.querySelector('#btn-play-owner-song i');
        if (playIcon) playIcon.className = isPlaying ? 'bi bi-pause-fill text-[9px] text-[#10FFA0]' : 'bi bi-play-fill text-[9px]';
      }
      return;
    }

    // 3. Xem Story của Bạn nếu bấm vào khung Story
    if (myActiveStoryRef.current && (e.target.closest('#btn-view-owner-story') || e.target.closest('.user-bubble-slot .story-preview') || e.target.closest('.vivu-polaroid-marker'))) {
      if (onOpenStoryDetailRef.current) {
        onOpenStoryDetailRef.current(myActiveStoryRef.current);
        return;
      }
    }

    // 4. Phát âm thanh tương tác: Ưu tiên 100% phát nhạc khi ghim có bài hát
    const curSong = userCustomSongRef.current;
    const chibiTarget = e.target.closest('[data-chibi-sound]');
    const bubbleTarget = e.target.closest('.owner-bubble-wrapper');
    if (chibiTarget || bubbleTarget) {
      if (curSong && storyAudioPlayer) {
        // Có bài hát -> Phát/dừng nhạc Apple Music, triệt tiêu tiếng kêu điện tử Chibi lạ
        const isPlaying = storyAudioPlayer.togglePlay(curSong, { loop: true });
        const playIcon = el.querySelector('#btn-play-owner-song i');
        if (playIcon) playIcon.className = isPlaying ? 'bi bi-pause-fill text-[9px] text-[#10FFA0]' : 'bi bi-play-fill text-[9px]';
      } else if (chibiTarget) {
        // Không có bài hát -> Phát tiếng kêu tương tác vui nhộn của Chibi
        const soundType = chibiTarget.getAttribute('data-chibi-sound');
        if (soundType) playChibiSound(soundType);
      }
      return; // Dừng tại đây, không tự ý bật UserLocationSheet làm gián đoạn việc nghe nhạc
    }

    // 5. Phát âm thanh mascot hoạt động trong tủ đồ
    const actionTarget = e.target.closest('[data-action-sound]');
    if (actionTarget) {
      const soundType = actionTarget.getAttribute('data-action-sound');
      if (soundType) playActionSound(soundType);
    }

    // 6. Mở bảng Menu Ghim Vị Trí (UserLocationSheet) khi bấm vào thân ghim Avatar ở dưới đất
    if (onOpenUserMenuRef.current) {
      onOpenUserMenuRef.current();
    }
  });
}

export function bindPeerMarkerEvents(el, {
  getItem,
  isFriendsMode,
  storyAudioPlayer,
  onOpenStoryDetailRef,
  onOpenMemeTrollRef,
  onOpenUserProfileRef,
  onOpenFriendDetailRef,
  onOpenGuestProfileRef
}) {
  el.addEventListener('click', (e) => {
    e.stopPropagation();

    const curItem = getItem ? getItem() : null;
    const curSong = curItem?.custom_song || curItem?.songData || curItem?.music || null;

    // 1. Nút phát bài hát của bạn bè
    if (e.target.closest('#btn-play-peer-song')) {
      if (curSong && storyAudioPlayer) {
        const isPlaying = storyAudioPlayer.togglePlay(curSong);
        const playIcon = el.querySelector('#btn-play-peer-song i');
        if (playIcon) playIcon.className = isPlaying ? 'bi bi-pause-fill text-[9px] text-[#10FFA0]' : 'bi bi-play-fill text-[9px]';
      }
      return;
    }

    // 2. Chibi sound + toggle nhạc của bạn bè khi bấm vào Chibi hoặc Bong bóng
    const chibiEl = e.target.closest('[data-chibi-sound]');
    const peerBubble = e.target.closest('.peer-bubble-wrapper');
    if (chibiEl || peerBubble) {
      if (curSong && storyAudioPlayer) {
        // Có bài hát -> Ưu tiên phát nhạc Apple Music, triệt tiêu tiếng kêu điện tử Chibi lạ
        const isPlaying = storyAudioPlayer.togglePlay(curSong, { loop: true });
        const playIcon = el.querySelector('#btn-play-peer-song i');
        if (playIcon) playIcon.className = isPlaying ? 'bi bi-pause-fill text-[9px] text-[#10FFA0]' : 'bi bi-play-fill text-[9px]';
      } else if (chibiEl) {
        // Không có bài hát -> Phát tiếng kêu của Chibi bạn bè
        const soundType = chibiEl.getAttribute('data-chibi-sound');
        if (soundType) playChibiSound(soundType);
      }
      return;
    }

    const actionEl = e.target.closest('[data-action-sound]');
    if (actionEl) {
      const soundType = actionEl.getAttribute('data-action-sound');
      if (soundType) playActionSound(soundType);
      return;
    }

    if (!curItem) return;

    // 3. Xem Story
    const targetStory = curItem.activeStory || (curItem.category === 'moment' || curItem.image || curItem.bg_gradient ? curItem : null);
    if (targetStory && (e.target.closest('#btn-view-peer-story') || e.target.closest('.vivu-story-gif-box'))) {
      if (onOpenStoryDetailRef.current) {
        onOpenStoryDetailRef.current(targetStory);
        return;
      }
    }

    // 4. Troll bạn bè
    if (e.target.closest('#btn-peer-troll')) {
      if (onOpenMemeTrollRef.current) {
        onOpenMemeTrollRef.current(curItem);
        return;
      }
    }

    // 5. Mở hồ sơ người dùng
    if (onOpenUserProfileRef.current) {
      onOpenUserProfileRef.current(curItem);
      return;
    }

    if (isFriendsMode || curItem.isFriend) {
      if (onOpenFriendDetailRef.current) onOpenFriendDetailRef.current(curItem);
    } else {
      if (onOpenGuestProfileRef.current) onOpenGuestProfileRef.current(curItem);
    }
  });
}

