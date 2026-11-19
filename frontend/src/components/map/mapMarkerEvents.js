import { playChibiSound } from '../../data/chibiMascotData';
import { playActionSound } from '../../data/messengerZaloMascotData';

/**
 * mapMarkerEvents.js - Event Delegation & Interaction Handler cho Leaflet Markers (Rule 3)
 * - Tách độc lập để tối ưu line count (< 450 dòng, Rule 7)
 * - Hỗ trợ âm thanh chibi, âm thanh hoạt động, bài hát MP3, mở Story, Profile & Troll Modal
 */

function handleStoryNavButtonClick(navBtn) {
  const dir = navBtn.getAttribute('data-dir');
  const card = navBtn.closest('.vivu-multi-story-card');
  if (!card) return;
  let rawList = [];
  try {
    rawList = JSON.parse(decodeURIComponent(card.getAttribute('data-multi-story') || '[]'));
  } catch (err) {}
  if (!rawList || rawList.length <= 1) return;

  let curIdx = parseInt(card.getAttribute('data-current-index') || '0', 10);
  if (dir === 'next') {
    curIdx = (curIdx + 1) % rawList.length;
  } else {
    curIdx = (curIdx - 1 + rawList.length) % rawList.length;
  }
  card.setAttribute('data-current-index', curIdx);

  const viewport = card.querySelector('.vivu-story-viewport');
  const counter = card.querySelector('.vivu-story-counter');
  const dashes = card.querySelectorAll('.vivu-story-dash');
  const curStory = rawList[curIdx];

  if (viewport && curStory) {
    viewport.innerHTML = `
      ${(curStory.image) ? `
        <img src="${curStory.image}" alt="Story" class="w-full h-full object-cover animate-in fade-in duration-200" />
      ` : `
        <div class="w-full h-full ${curStory.bg_gradient || 'bg-gradient-to-tr from-[#FF2A85] via-purple-600 to-[#7928CA]'} flex flex-col items-center justify-center p-1 text-center animate-in fade-in duration-200">
          <span class="text-[8px] font-black text-white line-clamp-2 leading-tight uppercase drop-shadow-sm">${curStory.title || 'STORY'}</span>
        </div>
      `}
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none"></div>
    `;
  }
  if (counter) counter.textContent = `${curIdx + 1}/${rawList.length}`;
  dashes.forEach((d, i) => {
    d.className = `h-1 flex-1 rounded-full transition-all ${i === curIdx ? 'bg-white shadow-[0_0_6px_#fff]' : 'bg-white/30'} vivu-story-dash`;
  });
}

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
    if (e.target.closest('#btn-play-owner-song') || e.target.closest('.vivu-vinyl-disc')) {
      const curSong = userCustomSongRef.current;
      if (curSong && storyAudioPlayer) {
        const isPlaying = storyAudioPlayer.togglePlay(curSong);
        const playIcon = el.querySelector('#btn-play-owner-song i');
        if (playIcon) playIcon.className = isPlaying ? 'bi bi-pause-fill text-[9px] text-[#10FFA0]' : 'bi bi-play-fill text-[9px]';
      }
      return;
    }

    // 2.5 Nút chuyển Story trước/sau trên thẻ Multi-Story
    const navBtn = e.target.closest('.vivu-story-nav-btn');
    if (navBtn) {
      handleStoryNavButtonClick(navBtn);
      return;
    }

    // 3. Xem Story của Bạn nếu bấm vào pin Story Ring hoặc khung Story
    const ownerStoryBox = e.target.closest('[data-has-story="true"]') || e.target.closest('#btn-view-owner-story') || e.target.closest('.user-bubble-slot .story-preview') || e.target.closest('.vivu-polaroid-marker');
    if (ownerStoryBox) {
      if (onOpenStoryDetailRef.current) {
        const card = e.target.closest('.vivu-multi-story-card');
        let curIdx = 0;
        if (card) {
          curIdx = parseInt(card.getAttribute('data-current-index') || '0', 10);
        }
        const storyTarget = Array.isArray(myActiveStoryRef.current)
          ? (myActiveStoryRef.current[curIdx] || myActiveStoryRef.current[0])
          : myActiveStoryRef.current;
        if (storyTarget) {
          onOpenStoryDetailRef.current(storyTarget);
          return;
        }
      }
    }

    // 4. Phát âm thanh tương tác Chibi & Mascot hoạt động (Rule 3)
    const chibiTarget = e.target.closest('[data-chibi-sound]');
    const actionTarget = e.target.closest('[data-action-sound]');
    if (chibiTarget) {
      const soundType = chibiTarget.getAttribute('data-chibi-sound');
      if (soundType) playChibiSound(soundType);
    } else if (actionTarget) {
      const soundType = actionTarget.getAttribute('data-action-sound');
      if (soundType) playActionSound(soundType);
    }

    // 5. Mở bảng Menu Ghim Vị Trí (UserLocationSheet) để người dùng xem thông tin và đổi Chibi/Ghim ngay lập tức
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
  // ================= 1. CƠ CHẾ NHẤN GIỮ 1.5S TRÊN GIỌT NƯỚC BẢN ĐỒ ĐỂ MỞ BẢNG TRÊU =================
  let longPressTimer = null;
  let startX = 0;
  let startY = 0;
  let isLongPressActive = false;
  let chargingRingEl = null;

  const cleanupLongPress = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    if (chargingRingEl) {
      chargingRingEl.remove();
      chargingRingEl = null;
    }
    isLongPressActive = false;
  };

  el.addEventListener('pointerdown', (e) => {
    // Chỉ kích hoạt bằng chuột trái hoặc chạm màn hình
    if (e.button !== undefined && e.button !== 0) return;

    // Không kích hoạt khi bấm vào các nút điều khiển nhỏ
    if (
      e.target.closest('#btn-play-peer-song') ||
      e.target.closest('.vivu-story-nav-btn') ||
      e.target.closest('.vivu-vinyl-disc')
    ) {
      return;
    }

    const curItem = getItem ? getItem() : null;
    if (!curItem || curItem.isOwner) return;

    cleanupLongPress();
    startX = e.clientX;
    startY = e.clientY;
    isLongPressActive = true;

    // Gắn vòng sạc LED neon vào thân ghim (pin circle / zenly body / teardrop body)
    const pinTarget =
      el.querySelector('.vivu-pin-circle') ||
      el.querySelector('.vivu-zenly-marker') ||
      el.querySelector('.vivu-teardrop-marker') ||
      el;

    chargingRingEl = document.createElement('div');
    chargingRingEl.className = 'vivu-troll-charging-ring pointer-events-none';
    pinTarget.appendChild(chargingRingEl);

    longPressTimer = setTimeout(() => {
      cleanupLongPress();
      // Đánh dấu thời điểm kích hoạt long-press để triệt tiêu click xem Story / Profile
      el.__longPressTriggeredTime = Date.now();

      // Rung phản hồi xúc giác trên thiết bị di động
      try {
        if (navigator?.vibrate) {
          navigator.vibrate([60, 40, 60]);
        }
      } catch (_) {}

      // Mở bảng chọn trêu bạn bè
      if (onOpenMemeTrollRef?.current) {
        onOpenMemeTrollRef.current(curItem);
      }
    }, 1500);
  });

  el.addEventListener('pointermove', (e) => {
    if (!isLongPressActive) return;
    const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
    // Nếu người dùng rê tay kéo bản đồ quá 10px -> Hủy sạc ngay
    if (dist > 10) {
      cleanupLongPress();
    }
  });

  el.addEventListener('pointerup', cleanupLongPress);
  el.addEventListener('pointercancel', cleanupLongPress);
  el.addEventListener('pointerleave', cleanupLongPress);

  // ================= 2. SỰ KIỆN CLICK THÔNG THƯỜNG TRÊN MARKER =================
  el.addEventListener('click', (e) => {
    e.stopPropagation();

    // Nếu vừa mới hoàn tất 1.5s long-press -> Triệt tiêu sự kiện click để không mở Profile/Story
    if (Date.now() - (el.__longPressTriggeredTime || 0) < 500) {
      e.preventDefault();
      return;
    }

    const curItem = getItem ? getItem() : null;
    const curSong = curItem?.custom_song || curItem?.songData || curItem?.music || null;

    // 0. Nút chuyển Story trước/sau trên thẻ Multi-Story
    const navBtn = e.target.closest('.vivu-story-nav-btn');
    if (navBtn) {
      handleStoryNavButtonClick(navBtn);
      return;
    }

    // 1. Nút phát bài hát của bạn bè & Đĩa vinyl mini
    if (e.target.closest('#btn-play-peer-song') || e.target.closest('.vivu-vinyl-disc')) {
      if (curSong && storyAudioPlayer) {
        const isPlaying = storyAudioPlayer.togglePlay(curSong, { loop: true });
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

    // 3. Xem Story khi bấm vào pin Story Ring hoặc khung Story
    const peerStoryPin = e.target.closest('[data-has-story="true"]');
    const peerStoryBox = e.target.closest('#btn-view-peer-story') || e.target.closest('.vivu-story-gif-box') || peerStoryPin;
    if (peerStoryBox) {
      const card = e.target.closest('.vivu-multi-story-card');
      let curIdx = 0;
      if (card) {
        curIdx = parseInt(card.getAttribute('data-current-index') || '0', 10);
      }
      const storyList = Array.isArray(curItem.stories) && curItem.stories.length > 0 ? curItem.stories : null;
      const targetStory = storyList ? (storyList[curIdx] || storyList[0]) : (curItem.activeStory || (curItem.category === 'moment' || curItem.image || curItem.bg_gradient ? curItem : null));
      if (targetStory && onOpenStoryDetailRef.current) {
        onOpenStoryDetailRef.current(targetStory);
        return;
      }
    }

    // 4. Mở hồ sơ người dùng
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

