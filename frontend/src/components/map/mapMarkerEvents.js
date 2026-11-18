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
    if (e.target.closest('#btn-play-owner-song')) {
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

    // 3. Xem Story của Bạn nếu bấm vào khung Story
    const ownerStoryBox = e.target.closest('#btn-view-owner-story') || e.target.closest('.user-bubble-slot .story-preview') || e.target.closest('.vivu-polaroid-marker');
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
  el.addEventListener('click', (e) => {
    e.stopPropagation();

    const curItem = getItem ? getItem() : null;
    const curSong = curItem?.custom_song || curItem?.songData || curItem?.music || null;

    // 0. Nút chuyển Story trước/sau trên thẻ Multi-Story
    const navBtn = e.target.closest('.vivu-story-nav-btn');
    if (navBtn) {
      handleStoryNavButtonClick(navBtn);
      return;
    }

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
    const peerStoryBox = e.target.closest('#btn-view-peer-story') || e.target.closest('.vivu-story-gif-box');
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

