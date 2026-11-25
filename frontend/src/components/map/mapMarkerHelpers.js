import { getChibiMascotById, getChibiDataUrl, playChibiSound } from '../../data/chibiMascotData';
import { getMascotActionDataUrl, playActionSound } from '../../data/messengerZaloMascotData';

/**
 * mapMarkerHelpers.js - Bộ Trình Tạo Giao Diện Marker & Bong Bóng Không Gian VIVU (Thế Hệ Zenly 3D)
 * - 100% Bootstrap Icons (Rule 5) | Tối ưu < 440 dòng (Rule 7)
 */
export function resolveMarkerSkin({ manualSkin, hasStory, hasChibi, hasAction }) {
  if (manualSkin && manualSkin !== 'auto') return manualSkin;
  if (hasAction) return 'zenly_3d';
  return 'aura_circle';
}

// 1. RENDER THÂN GHIM (MARKER BODY) THEO PHONG CÁCH ZENLY 3D / AURA STORY RING
export function getMarkerBodyHtml({
  skinMode = 'aura_circle',
  avatar = '',
  name = 'BẠN',
  isOwner = false,
  hasStory = false,
  storyCount = 0,
  storyPreviewImage = null,
  storyTitle = null,
  hasSong = false,
  songTitle = null,
  isOffline = false,
  chibiDataUrl = null,
  actionDataUrl = null,
  actionSound = null
}) {
  // 1.1 PHONG CÁCH ZENLY 3D: ĐỨNG TỰ DO TRÊN MẶT ĐƯỜNG (0 CHÓP NHỌN)
  if (skinMode === 'zenly_3d') {
    const displayImg = actionDataUrl || avatar;
    return `
      <div class="vivu-zenly-marker flex flex-col items-center select-none relative group cursor-pointer animate-in zoom-in-95 duration-200 pointer-events-auto">
        <!-- Hover Preview Mini khi có Story (Rê chuột trên PC) -->
        ${hasStory && storyPreviewImage ? `
          <div class="vivu-story-hover-card absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
            <div class="rounded-2xl overflow-hidden border-2 border-white/90 shadow-[0_12px_30px_rgba(0,0,0,0.9)] bg-black relative shrink-0" style="width: 76px; height: 104px; min-width: 76px; max-width: 76px; min-height: 104px; max-height: 104px;">
              <img src="${storyPreviewImage}" alt="Story Preview" class="object-cover block" style="width: 76px; height: 104px; min-width: 76px; max-width: 76px; min-height: 104px; max-height: 104px;" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none"></div>
              <div class="absolute bottom-1.5 left-1 right-1 text-center pointer-events-none">
                <span class="text-[8.5px] font-bold text-white truncate block leading-tight drop-shadow-md">${storyTitle || 'Story'}</span>
                ${storyCount > 1 ? `<span class="text-[7.5px] text-[#00E5FF] font-mono font-bold block">${storyCount} tin</span>` : ''}
              </div>
            </div>
            <div class="w-2 h-2 bg-black border-r-2 border-b-2 border-white/90 transform rotate-45 -mt-1 shadow-md shrink-0"></div>
          </div>
        ` : ''}

        <!-- Nhân vật Chibi / Avatar đứng thẳng trên mặt đất (có viền & data-has-story khi có Story) -->
        <div class="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center transition-transform group-hover:scale-115 active:scale-95 animate-chibi-float pointer-events-auto cursor-pointer ${hasStory ? 'rounded-full p-1 bg-gradient-to-tr from-[#FF2A85]/40 via-purple-500/30 to-[#00E5FF]/40 ring-2 ring-[#FF2A85] shadow-[0_0_20px_rgba(255,42,133,0.65)]' : ''}" ${hasStory ? 'data-has-story="true" title="Bấm để xem Story toàn màn hình"' : (actionSound ? `data-action-sound="${actionSound}" data-chibi-sound="${actionSound}"` : '')}>
          ${displayImg
            ? `<img src="${displayImg}" alt="${name}" class="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] pointer-events-auto cursor-pointer" />`
            : `<div class="w-12 h-12 rounded-full bg-white flex items-center justify-center text-neutral-500 shadow-lg border-2 border-white pointer-events-auto cursor-pointer"><i class="bi bi-person-fill text-2xl"></i></div>`}
          ${hasStory && storyCount > 1 ? `<span class="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-black/85 text-white text-[8px] font-mono font-bold border border-white/30 shadow-md pointer-events-none">${storyCount}</span>` : ''}

          ${hasSong ? `
            <div class="vivu-vinyl-disc absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#111116] border border-white/40 shadow-[0_4px_10px_rgba(0,0,0,0.8)] flex items-center justify-center animate-spin-slow z-30 cursor-pointer pointer-events-auto hover:scale-125 transition-transform" data-song-title="${songTitle || ''}" title="Bài hát: ${songTitle || 'Đang phát'} (Bấm để bật/tắt)">
              <div class="w-4 h-4 rounded-full border border-neutral-700/80 flex items-center justify-center">
                <div class="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#FF2A85] to-[#7928CA] flex items-center justify-center shadow-inner">
                  <i class="bi bi-music-note-beamed text-[6.5px] text-white"></i>
                </div>
              </div>
            </div>` : ''}
          ${isOwner && !hasStory ? `
            <button id="btn-quick-create-story" data-quick-story="true" type="button" class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#FF2A85] text-white border-2 border-white shadow-[0_0_10px_#FF2A85] flex items-center justify-center z-30 hover:scale-115 active:scale-90 transition-transform cursor-pointer pointer-events-auto" title="Đăng Story">
              <i class="bi bi-plus-lg text-[11px] font-bold pointer-events-none"></i>
            </button>` : ''}
        </div>
        <div class="w-11 h-2 rounded-full bg-black/45 blur-[1.5px] -mt-1 shadow-inner pointer-events-none"></div>
      </div>
    `;
  }

  // 1.2 PHONG CÁCH VÒNG TRÒN AURA PHÁT SÁNG & STORY RING (CHUẨN INSTAGRAM / ZENLY 3D)
  const isAura = skinMode === 'aura_circle' || skinMode === 'polaroid' || hasStory;
  if (isAura) {
    const ringClass = hasStory
      ? (isOffline ? 'p-[2.5px] bg-neutral-400 opacity-70' : 'p-[3px] bg-gradient-to-tr from-[#FF2A85] via-purple-600 to-[#00E5FF] shadow-[0_0_20px_rgba(255,42,133,0.7)] animate-pulse-slow')
      : (isOwner ? 'p-[2.5px] bg-gradient-to-tr from-[#00E5FF] via-purple-500 to-[#FF2A85] shadow-[0_0_20px_rgba(0,229,255,0.7)]' : (isOffline ? 'p-[2px] bg-neutral-400 opacity-65' : 'p-[2.5px] bg-gradient-to-tr from-[#00E5FF] to-[#10FFA0] shadow-[0_0_18px_rgba(0,229,255,0.65)]'));

    return `
      <div class="vivu-aura-marker flex flex-col items-center select-none relative group cursor-pointer animate-in zoom-in-95 duration-200 pointer-events-auto">
        <!-- Hover Preview Mini khi có Story (Rê chuột trên PC) -->
        ${hasStory && storyPreviewImage ? `
          <div class="vivu-story-hover-card absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
            <div class="rounded-2xl overflow-hidden border-2 border-white/90 shadow-[0_12px_30px_rgba(0,0,0,0.9)] bg-black relative shrink-0" style="width: 76px; height: 104px; min-width: 76px; max-width: 76px; min-height: 104px; max-height: 104px;">
              <img src="${storyPreviewImage}" alt="Story Preview" class="object-cover block" style="width: 76px; height: 104px; min-width: 76px; max-width: 76px; min-height: 104px; max-height: 104px;" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none"></div>
              <div class="absolute bottom-1.5 left-1 right-1 text-center pointer-events-none">
                <span class="text-[8.5px] font-bold text-white truncate block leading-tight drop-shadow-md">${storyTitle || 'Story'}</span>
                ${storyCount > 1 ? `<span class="text-[7.5px] text-[#00E5FF] font-mono font-bold block">${storyCount} tin</span>` : ''}
              </div>
            </div>
            <div class="w-2 h-2 bg-black border-r-2 border-b-2 border-white/90 transform rotate-45 -mt-1 shadow-md shrink-0"></div>
          </div>
        ` : ''}

        <!-- Vòng hào quang xung nhịp kép (Dual Breathing Aura) -->
        <div class="absolute -inset-2 rounded-full ${hasStory ? (isOffline ? 'hidden' : 'bg-[rgba(255,42,133,0.25)]') : (isOffline ? 'hidden' : 'bg-[rgba(0,229,255,0.2)]')} animate-ping pointer-events-none"></div>

        <!-- Thân Tròn Viền Story Ring / Aura Ring -->
        <div class="vivu-pin-circle relative w-12 h-12 rounded-full ${ringClass} flex items-center justify-center transition-transform group-hover:scale-110 active:scale-95" ${hasStory ? 'data-has-story="true" title="Bấm để xem Story toàn màn hình"' : ''}>
          <div class="w-full h-full rounded-full overflow-hidden bg-[#0d0e14] border-2 border-white flex items-center justify-center">
            ${avatar ? `<img src="${avatar}" alt="${name}" class="w-full h-full object-cover" />` : `<div class="w-full h-full bg-neutral-800 flex items-center justify-center text-white/50"><i class="bi bi-person-fill text-xl"></i></div>`}
          </div>

          <!-- ĐĨA NHẠC VINYL MINI XOAY Ở GÓC GHIM -->
          ${hasSong ? `
            <div class="vivu-vinyl-disc absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#111116] border border-white/40 shadow-[0_4px_10px_rgba(0,0,0,0.8)] flex items-center justify-center animate-spin-slow z-30 cursor-pointer pointer-events-auto hover:scale-125 transition-transform"
                 data-song-title="${songTitle || ''}"
                 title="Bài hát: ${songTitle || 'Đang phát'} (Bấm để bật/tắt)">
              <div class="w-4 h-4 rounded-full border border-neutral-700/80 flex items-center justify-center">
                <div class="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#FF2A85] to-[#7928CA] flex items-center justify-center shadow-inner">
                  <i class="bi bi-music-note-beamed text-[6.5px] text-white"></i>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Nút (+) Đăng Story nhanh cho chính chủ nếu chưa có Story -->
          ${isOwner && !hasStory ? `
            <button id="btn-quick-create-story" data-quick-story="true" type="button" class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#FF2A85] text-white border-2 border-white shadow-[0_0_10px_#FF2A85] flex items-center justify-center z-30 hover:scale-115 active:scale-90 transition-transform cursor-pointer pointer-events-auto" title="Đăng Story">
              <i class="bi bi-plus-lg text-[11px] font-bold pointer-events-none"></i>
            </button>
          ` : ''}

          <!-- Huy hiệu số lượng Story nếu có từ 2 Story trở lên -->
          ${hasStory && storyCount > 1 ? `
            <span class="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-black/85 text-white text-[8px] font-mono font-bold border border-white/30 shadow-md">
              ${storyCount}
            </span>
          ` : ''}
        </div>
        <!-- Bóng mờ tiếp đất nhẹ -->
        <div class="w-8 h-1.5 rounded-full bg-black/35 blur-[1px] mt-0.5 pointer-events-none"></div>
      </div>
    `;
  }

  // 1.3 PHONG CÁCH GIỌT NƯỚC CỔ ĐIỂN (CLASSIC TEARDROP)
  return `
    <div class="vivu-teardrop-marker flex flex-col items-center select-none relative group cursor-pointer animate-in zoom-in-95 duration-200 pointer-events-auto">
      <div class="relative w-11 h-11 rounded-full p-[2px] ${hasStory ? 'bg-gradient-to-tr from-[#FF2A85] via-purple-600 to-[#00E5FF] shadow-[0_0_18px_rgba(255,42,133,0.7)]' : (isOwner ? 'bg-white border-2 border-[#10FFA0] shadow-[0_0_14px_rgba(16,255,160,0.65)]' : 'bg-white border-2 border-[#00E5FF] shadow-[0_0_14px_rgba(0,229,255,0.75)]')} flex items-center justify-center transition-transform group-hover:scale-110 active:scale-95" ${hasStory ? 'data-has-story="true" title="Bấm để xem Story toàn màn hình"' : ''}>
        <div class="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
          ${avatar ? `<img src="${avatar}" alt="${name}" class="w-full h-full object-cover" />` : `<div class="w-full h-full bg-white flex items-center justify-center text-neutral-400"><i class="bi bi-person-fill text-lg"></i></div>`}
        </div>
        ${hasSong ? `
          <div class="vivu-vinyl-disc absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#111116] border border-white/40 shadow-md flex items-center justify-center animate-spin-slow z-30 cursor-pointer pointer-events-auto">
            <i class="bi bi-music-note-beamed text-[6px] text-[#FF2A85]"></i>
          </div>
        ` : ''}
        ${isOwner && !hasStory ? `
          <button id="btn-quick-create-story" data-quick-story="true" type="button" class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#FF2A85] text-white border-2 border-white shadow-[0_0_10px_#FF2A85] flex items-center justify-center z-30 hover:scale-115 active:scale-90 transition-transform cursor-pointer pointer-events-auto" title="Đăng Story">
            <i class="bi bi-plus-lg text-[11px] font-bold pointer-events-none"></i>
          </button>
        ` : ''}
      </div>
      <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-white -mt-0.5 filter drop-shadow-[0_2px_4px_rgba(0,229,255,0.4)]"></div>
    </div>
  `;
}

export function formatRemainingChibiTime(expiresAt) {
  if (!expiresAt) return '';
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return '';
  const diffHours = Math.floor(diffMs / (3600 * 1000));
  const diffMins = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
  if (diffHours >= 1) return `Còn ${diffHours}h`;
  if (diffMins > 0) return `Còn ${diffMins}p`;
  return 'Sắp hết hạn';
}

// 2. RENDER BONG BÓNG TRẠNG THÁI / BÀI HÁT / CHIBI CHO CHỦ SỞ HỮU (BẠN)
export function renderStoryBubbleBox(storiesOrSingle, isOwner = false, displayName = 'VIVU') {
  const storyList = Array.isArray(storiesOrSingle) ? storiesOrSingle : (storiesOrSingle ? [storiesOrSingle] : []);
  if (storyList.length === 0) return '';

  const firstStory = storyList[0]?.activeStory || storyList[0];
  const total = storyList.length;

  if (total === 1) {
    const idAttr = isOwner ? 'id="btn-view-owner-story"' : 'id="btn-view-peer-story"';
    return `
      <div ${idAttr} class="${isOwner ? 'owner-bubble-wrapper' : 'peer-bubble-wrapper'} mb-2 relative flex flex-col items-center animate-in zoom-in-95 duration-200 cursor-pointer group pointer-events-auto" title="Bấm để xem Story của ${displayName}">
        <div class="vivu-story-gif-box relative w-[54px] h-[66px] rounded-2xl overflow-hidden border border-white/35 shadow-[0_8px_24px_rgba(0,0,0,0.7)] bg-[#0d0e14] flex items-center justify-center transition-all duration-300 group-hover:scale-110">
          ${(firstStory.image || firstStory.dual_image) ? `
            <img src="${firstStory.image || firstStory.dual_image}" alt="Story" class="w-full h-full object-cover animate-gif-breath" />
          ` : `
            <div class="w-full h-full ${firstStory.bg_gradient || 'bg-gradient-to-tr from-[#FF2A85] via-purple-600 to-[#7928CA]'} flex flex-col items-center justify-center p-1 text-center animate-gif-breath">
              <span class="text-[8px] font-black text-white line-clamp-2 leading-tight uppercase drop-shadow-sm">${firstStory.title || 'STORY'}</span>
            </div>
          `}
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"></div>
          <span class="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white text-[9px] group-hover:scale-110 transition-transform">
            <i class="bi bi-arrows-fullscreen"></i>
          </span>
        </div>
      </div>
    `;
  }

  // Multi-Story Mini Card kèm Thanh cuộn/pager và Nút mũi tên chuyển tin
  const idAttr = isOwner ? 'id="btn-view-owner-story"' : 'id="btn-view-peer-story"';
  const safeJson = encodeURIComponent(JSON.stringify(storyList.map(s => {
    const act = s.activeStory || s;
    return {
      id: act.id,
      title: act.title || 'Story',
      image: act.image || act.dual_image || '',
      bg_gradient: act.bg_gradient || ''
    };
  })));

  return `
    <div ${idAttr} class="vivu-multi-story-card ${isOwner ? 'owner-bubble-wrapper' : 'peer-bubble-wrapper'} mb-2 relative flex flex-col items-center select-none animate-in zoom-in-95 duration-200 pointer-events-auto cursor-pointer"
         data-multi-story="${safeJson}"
         data-current-index="0"
         data-total="${total}"
         title="Xem ${total} Story của ${displayName}">
      <div class="vivu-story-gif-box relative w-[68px] h-[86px] rounded-2xl overflow-hidden border-2 border-[#FF2A85]/80 shadow-[0_8px_25px_rgba(255,42,133,0.4)] bg-[#0d0e14] flex items-center justify-center group">
        <!-- Vùng ảnh / nội dung Story -->
        <div class="vivu-story-viewport w-full h-full relative cursor-pointer">
          ${(firstStory.image || firstStory.dual_image) ? `
            <img src="${firstStory.image || firstStory.dual_image}" alt="Story" class="w-full h-full object-cover animate-gif-breath" />
          ` : `
            <div class="w-full h-full ${firstStory.bg_gradient || 'bg-gradient-to-tr from-[#FF2A85] via-purple-600 to-[#7928CA]'} flex flex-col items-center justify-center p-1 text-center animate-gif-breath">
              <span class="text-[8px] font-black text-white line-clamp-2 leading-tight uppercase drop-shadow-sm">${firstStory.title || 'STORY'}</span>
            </div>
          `}
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none"></div>
        </div>

        <!-- Thanh phân đoạn đếm Story (Mini Indicators & Badge) -->
        <div class="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none z-20">
          <div class="flex gap-0.5 flex-1 max-w-[38px] overflow-hidden">
            ${storyList.slice(0, 5).map((_, i) => `<span class="h-1 flex-1 rounded-full transition-all ${i === 0 ? 'bg-white shadow-[0_0_6px_#fff]' : 'bg-white/30'} vivu-story-dash" data-dash-index="${i}"></span>`).join('')}
          </div>
          <span class="text-[7.5px] font-mono font-bold text-white bg-black/75 px-1 py-0.2 rounded-full border border-white/20 vivu-story-counter">1/${total}</span>
        </div>

        <!-- Nút Mũi Tên Trái / Phải Điều Hướng Trực Tiếp Trên Bản Đồ -->
        <button type="button" class="vivu-story-nav-btn absolute left-0.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center text-[10px] z-30 transition-all active:scale-75 shadow-lg pointer-events-auto border border-white/25" data-dir="prev" title="Tin trước">
          <i class="bi bi-chevron-left text-[9px] pointer-events-none"></i>
        </button>
        <button type="button" class="vivu-story-nav-btn absolute right-0.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center text-[10px] z-30 transition-all active:scale-75 shadow-lg pointer-events-auto border border-white/25" data-dir="next" title="Tin tiếp theo">
          <i class="bi bi-chevron-right text-[9px] pointer-events-none"></i>
        </button>

        <!-- Biểu tượng phóng to toàn màn hình -->
        <span class="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-[7.5px] z-20 pointer-events-none border border-white/20">
          <i class="bi bi-arrows-fullscreen"></i>
        </span>
      </div>
    </div>
  `;
}

// 2. RENDER BONG BÓNG TRẠNG THÁI / BÀI HÁT / CHIBI CHO CHỦ SỞ HỮU (BẠN)
export function getOwnerBubbleHtml({ myActiveStory, myActiveStories, song, statusText, chibiId, actionMascot, actionId, chibiExpiresAt, bodySkinMode = 'aura_circle' }) {
  // Khử tiêu đề mồ côi khi Story đã bị xóa
  const safeStatus = (statusText === 'Khoảnh khắc mới' || statusText === 'Tâm trạng') ? '' : statusText;

  // ƯU TIÊN 1: BỘ CHIBI HÀNH ĐỘNG (nếu thân ghim đã dùng zenly_3d hiển thị Chibi thì không vẽ lặp ảnh thứ 2 ở bong bóng)
  if (actionMascot && actionId && bodySkinMode !== 'zenly_3d') {
    const actionUrl = getMascotActionDataUrl(actionMascot, actionId);
    return `
      <div class="owner-bubble-wrapper mb-1.5 relative flex flex-col items-center animate-in zoom-in-90 duration-200 cursor-pointer group" title="Bấm để phát âm thanh">
        <div class="relative flex items-center justify-center filter drop-shadow-[0_4px_14px_rgba(0,0,0,0.6)]">
          <div class="chibi-mascot-pin w-[52px] h-[52px] flex items-center justify-center hover:scale-120 active:scale-95 transition-transform pointer-events-auto cursor-pointer" data-action-sound="${actionId}">
            <img src="${actionUrl}" alt="Action" class="w-full h-full object-contain pointer-events-auto" />
          </div>
          ${safeStatus ? `
            <div class="absolute left-full ml-1 px-2.5 py-1 bg-black/85 text-white text-[10px] font-bold rounded-xl whitespace-nowrap shadow-md border border-white/20 backdrop-blur-md max-w-[120px] truncate">
              ${safeStatus}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // ƯU TIÊN 2: BIỂU CẢM CHIBI MASCOT UNIVERSE
  const chibi = chibiId ? getChibiMascotById(chibiId) : null;
  if (chibi) {
    const chibiDataUrl = getChibiDataUrl(chibi);
    const remainingTime = formatRemainingChibiTime(chibiExpiresAt);
    return `
      <div class="owner-bubble-wrapper mb-2 relative flex items-center gap-2 px-2.5 py-1.5 bg-[rgba(10,18,32,0.92)] border border-[#00E5FF]/40 rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,0.7)] backdrop-blur-xl animate-in zoom-in-95 duration-200 select-none pointer-events-auto cursor-pointer group hover:border-[#00E5FF] transition-all">
        <!-- Cột Trái: Linh vật Chibi Động Bồng Bềnh -->
        <div class="relative w-10 h-10 flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-transform" data-chibi-sound="${chibi.soundType}" title="${chibi.name}">
          <img src="${chibiDataUrl}" alt="${chibi.name}" class="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,229,255,0.4)] animate-chibi-float pointer-events-auto" />
        </div>

        <!-- Cột Phải: Suy nghĩ hoặc tên Chibi -->
        <div class="flex flex-col min-w-0 max-w-[160px] pr-1">
          <div class="flex items-center gap-1">
            ${safeStatus ? `
              <div class="text-[11px] font-bold text-white truncate leading-snug drop-shadow-sm">
                ${safeStatus}
              </div>
            ` : `
              <div class="text-[10px] font-bold text-[#00E5FF] truncate leading-snug">
                ${chibi.name}
              </div>
            `}
            ${remainingTime ? `<span class="text-[8.5px] text-amber-400 font-mono shrink-0 ml-auto inline-flex items-center gap-0.5"><i class="bi bi-hourglass-split text-[8px]"></i>${remainingTime}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // ƯU TIÊN 3: SUY NGHĨ NGẮN (CYAN BUBBLE)
  if (safeStatus) {
    return `
      <div class="owner-bubble-wrapper mb-2 relative flex flex-col items-center animate-in zoom-in-90 duration-200 cursor-pointer" title="Suy nghĩ của Bạn">
        <div class="px-3.5 py-1.5 bg-[#00E5FF] text-[#08202E] font-bold text-xs rounded-2xl rounded-br-xs shadow-[0_4px_16px_rgba(0,229,255,0.4)] max-w-[200px] flex items-center gap-1.5 border border-white/60">
          <span class="w-2 h-2 rounded-full bg-[#10FFA0] animate-pulse"></span>
          <span class="truncate">${safeStatus}</span>
        </div>
      </div>
    `;
  }

  // Khi không có status, không có Chibi -> Bong bóng rỗng, nhường toàn bộ vẻ đẹp cho Giọt Nước Story Ring V2
  return '';
}

// 3. RENDER BONG BÓNG TRẠNG THÁI / BÀI HÁT / CHIBI CHO BẠN BÈ & NGƯỜI LẠ
export function getPeerBubbleHtml(item, isCoLocated = false, bodySkinMode = 'aura_circle') {
  const isOffline = item.isOnline === false;
  const displayName = item.hostName || item.host_name || item.name || 'Người dùng VIVU';

  if (isOffline) {
    return `
      <div class="peer-bubble-wrapper mb-1 px-2.5 py-1 bg-[#151619]/90 backdrop-blur-md rounded-xl shadow-md border border-neutral-600/60 text-white text-[11px] font-semibold flex items-center gap-1.5 whitespace-nowrap pointer-events-auto">
        <span class="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
        <span class="truncate max-w-[110px] text-neutral-200">${displayName}</span>
        <span class="text-[9px] text-neutral-400 font-bold bg-white/10 px-1 py-0.5 rounded">[Offline]</span>
        ${isCoLocated ? '<span class="text-[9px] text-[#FFAA00] font-bold">[GẦN BẠN]</span>' : ''}
      </div>
    `;
  }

  const peerSong = item.custom_song || item.songData || item.music || null;
  const statusText = item.custom_status || (item.title && item.title !== 'Đang trực tuyến' && item.title !== 'Khoảnh khắc mới' ? item.title : '');

  // 1. CHIBI HÀNH ĐỘNG FB/ZALO HOẶC MASCOT (tránh lặp 2 ảnh khi thân ghim đã dùng zenly_3d)
  const peerActionMascot = item.pin_mascot || item.actionMascot;
  const peerActionId = item.pin_action || item.actionId;
  if (peerActionMascot && peerActionId && bodySkinMode !== 'zenly_3d') {
    const actionUrl = getMascotActionDataUrl(peerActionMascot, peerActionId);
    return `
      <div class="peer-bubble-wrapper mb-1.5 relative flex flex-col items-center animate-in zoom-in-90 duration-200 cursor-pointer group" title="${displayName} đang ${peerActionId}">
        <div class="relative flex items-center justify-center filter drop-shadow-[0_4px_14px_rgba(0,0,0,0.6)]">
          <div class="chibi-mascot-pin w-12 h-12 flex items-center justify-center hover:scale-120 active:scale-95 transition-transform" data-action-sound="${peerActionId}">
            <img src="${actionUrl}" alt="Action" class="w-full h-full object-contain pointer-events-none" />
          </div>
          <div class="absolute left-full ml-1 px-2.5 py-1 bg-black/85 text-white text-[10px] font-bold rounded-xl whitespace-nowrap shadow-md border border-white/20 backdrop-blur-md max-w-[120px] truncate">
            ${statusText || displayName}
          </div>
        </div>
        ${isCoLocated ? '<span class="text-[9px] text-[#FFAA00] font-bold mt-0.5">[GẦN BẠN]</span>' : ''}
      </div>
    `;
  }

  const peerChibiId = item.custom_chibi || item.chibiId;
  const peerChibi = peerChibiId ? getChibiMascotById(peerChibiId) : null;
  if (peerChibi) {
    const peerChibiDataUrl = getChibiDataUrl(peerChibi);
    const peerRemaining = formatRemainingChibiTime(item.chibi_expires_at || item.chibiExpiresAt);
    return `
      <div class="peer-bubble-wrapper mb-2 relative flex items-center gap-2 px-2.5 py-1.5 bg-[rgba(10,18,32,0.92)] border border-[#00E5FF]/40 rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,0.7)] backdrop-blur-xl animate-in zoom-in-95 duration-200 select-none pointer-events-auto cursor-pointer group hover:border-[#00E5FF] transition-all" title="${displayName} đang cảm thấy ${peerChibi.name}">
        <!-- Linh vật Chibi động bồng bềnh bên trái -->
        <div class="relative w-10 h-10 flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-transform" data-chibi-sound="${peerChibi.soundType}" title="${peerChibi.name}">
          <img src="${peerChibiDataUrl}" alt="${peerChibi.name}" class="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,229,255,0.4)] animate-chibi-float pointer-events-auto" />
        </div>

        <!-- Cột Phải: Suy nghĩ / Tên + Nút phát nhạc MP3 -->
        <div class="flex flex-col min-w-0 max-w-[170px] pr-1">
          <div class="text-[11px] font-bold text-white truncate leading-snug drop-shadow-sm flex items-center gap-1">
            <span>${statusText || displayName}</span>
            ${isCoLocated ? '<span class="text-[8px] text-[#FFAA00] font-bold">[GẦN]</span>' : ''}
            ${peerRemaining ? `<span class="text-[8.5px] text-amber-400 font-mono ml-auto shrink-0 inline-flex items-center gap-0.5"><i class="bi bi-hourglass-split text-[8px]"></i>${peerRemaining}</span>` : ''}
          </div>
          ${peerSong ? `
            <div id="btn-play-peer-song" class="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#00E5FF] hover:text-white cursor-pointer active:scale-95 transition-all group/song" title="Bấm để phát / dừng bài hát của ${displayName}">
              <span class="w-4 h-4 rounded-full bg-[#FF2A85] text-white flex items-center justify-center shadow-[0_0_8px_#FF2A85] shrink-0 group-hover/song:scale-110 transition-transform">
                <i class="bi bi-play-fill text-[9px]"></i>
              </span>
              <span class="truncate max-w-[130px] font-mono text-[9.5px] text-white/90">${peerSong.title || 'Bài hát'}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // 3. BÀI HÁT MP3
  if (peerSong) {
    return `
      <div class="peer-bubble-wrapper mb-2 relative flex flex-col items-center animate-in zoom-in-90 duration-200" title="Bài hát của ${displayName}">
        <div class="px-3 py-1.5 bg-[#08202E]/95 text-white rounded-2xl rounded-br-xs shadow-[0_4px_16px_rgba(255,42,133,0.35)] border border-[#FF2A85]/50 flex items-center gap-2 max-w-[220px]">
          <button id="btn-play-peer-song" type="button" class="w-6 h-6 rounded-full bg-[#FF2A85] text-white flex items-center justify-center shrink-0 active:scale-90 transition-transform cursor-pointer" title="Phát bài hát của ${displayName}">
            <i class="bi bi-play-fill text-xs"></i>
          </button>
          <div class="overflow-hidden">
            ${statusText ? `<div class="text-[11px] font-bold text-white truncate max-w-[150px]">${statusText}</div>` : `<div class="text-[10px] text-neutral-300 font-semibold truncate max-w-[150px]">${displayName}</div>`}
            <div class="text-[10px] text-[#00E5FF] truncate flex items-center gap-1 font-mono max-w-[150px]">
              <i class="bi bi-music-note-beamed text-[#FF2A85] animate-bounce"></i>
              <span class="truncate">${peerSong.title || 'Bài hát'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 4. SUY NGHĨ NGẮN
  if (statusText) {
    return `
      <div class="peer-bubble-wrapper mb-2 relative flex flex-col items-center animate-in zoom-in-90 duration-200 cursor-pointer" title="Suy nghĩ của ${displayName}">
        <div class="px-3.5 py-1.5 bg-[#00E5FF] text-[#08202E] font-bold text-xs rounded-2xl rounded-br-xs shadow-[0_4px_16px_rgba(0,229,255,0.4)] max-w-[200px] flex items-center gap-1.5 border border-white/60">
          <span class="w-2 h-2 rounded-full bg-[#10FFA0] animate-pulse"></span>
          <span class="truncate">${statusText}</span>
        </div>
      </div>
    `;
  }

  // 5. VIÊN THUỐC TÊN TIÊU CHUẨN
  return `
    <div class="peer-bubble-wrapper mb-1 px-2.5 py-1 bg-white/95 border-[#D2D9F4] text-[#131315] backdrop-blur-md rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.12)] border text-[11px] font-semibold flex items-center gap-1.5 whitespace-nowrap pointer-events-auto">
      <span class="w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-neutral-400' : 'bg-[#10FFA0] animate-pulse'}"></span>
      <span class="truncate max-w-[120px]">${displayName}</span>
      ${isCoLocated ? '<span class="text-[9px] text-[#FFAA00] font-bold">[GẦN BẠN]</span>' : ''}
    </div>
  `;
}
