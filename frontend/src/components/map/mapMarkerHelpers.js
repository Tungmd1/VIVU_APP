/**
 * mapMarkerHelpers.js - Bộ Trình Tạo Giao Diện Marker & Bong Bóng Không Gian VIVU
 * - 100% Bootstrap Icons (Rule 5)
 * - Tách module chống file đơn khối (Rule 7)
 * - Hỗ trợ ưu tiên: Story Preview GIF Box > MP3 Song Bubble > Thought Bubble > Name Pill
 */

export function getOwnerBubbleHtml({ myActiveStory, song, statusText }) {
  if (myActiveStory) {
    return `
      <div id="btn-view-owner-story" class="owner-bubble-wrapper mb-2 relative flex flex-col items-center animate-in zoom-in-95 duration-200 cursor-pointer group" title="Bấm để xem Story toàn màn hình">
        <div class="vivu-story-gif-box relative w-[52px] h-[64px] rounded-2xl overflow-hidden border-2 border-[#FF2A85] shadow-[0_0_20px_rgba(255,42,133,0.85)] ring-2 ring-purple-500/50 bg-black flex items-center justify-center transition-all duration-300 group-hover:scale-110">
          ${myActiveStory.image ? `
            <img src="${myActiveStory.image}" alt="Story" class="w-full h-full object-cover animate-gif-breath" />
          ` : `
            <div class="w-full h-full ${myActiveStory.bg_gradient || 'bg-gradient-to-tr from-[#FF2A85] via-purple-600 to-[#7928CA]'} flex flex-col items-center justify-center p-1 text-center animate-gif-breath">
              <span class="text-[8px] font-black text-white line-clamp-2 leading-tight uppercase drop-shadow-sm">${myActiveStory.title || 'STORY'}</span>
            </div>
          `}
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"></div>
          <span class="absolute top-1 left-1 px-1 py-0.5 rounded-[4px] bg-[#FF2A85] text-white text-[7px] font-black tracking-wider leading-none shadow-xs">
            LIVE
          </span>
          <span class="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white text-[9px] group-hover:scale-110 transition-transform">
            <i class="bi bi-arrows-fullscreen"></i>
          </span>
        </div>
        <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#FF2A85] -mt-[1px]"></div>
      </div>
    `;
  }

  if (song) {
    return `
      <div class="owner-bubble-wrapper mb-2 relative flex flex-col items-center animate-in zoom-in-90 duration-200 cursor-pointer" title="Trạng Thái Suy Nghĩ của Bạn">
        <div class="px-3 py-1.5 bg-[#08202E]/95 text-white rounded-2xl rounded-br-xs shadow-[0_4px_16px_rgba(255,42,133,0.35)] border border-[#FF2A85]/50 flex items-center gap-2 max-w-[220px]">
          <button id="btn-play-owner-song" type="button" class="w-6 h-6 rounded-full bg-[#FF2A85] text-white flex items-center justify-center shrink-0 active:scale-90 transition-transform cursor-pointer" title="Phát bài hát của bạn">
            <i class="bi bi-play-fill text-xs"></i>
          </button>
          <div class="overflow-hidden">
            ${statusText ? `<div class="text-[11px] font-bold text-white truncate max-w-[150px]">${statusText}</div>` : ''}
            <div class="text-[10px] text-[#00E5FF] truncate flex items-center gap-1 font-mono max-w-[150px]">
              <i class="bi bi-music-note-beamed text-[#FF2A85] animate-bounce"></i>
              <span class="truncate">${song.title || 'Bài hát'}</span>
            </div>
          </div>
        </div>
        <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#08202E] -mt-[1px]"></div>
      </div>
    `;
  }

  if (statusText) {
    return `
      <div class="owner-bubble-wrapper mb-2 relative flex flex-col items-center animate-in zoom-in-90 duration-200 cursor-pointer" title="Suy nghĩ của Bạn">
        <div class="px-3.5 py-1.5 bg-[#00E5FF] text-[#08202E] font-bold text-xs rounded-2xl rounded-br-xs shadow-[0_4px_16px_rgba(0,229,255,0.4)] max-w-[200px] flex items-center gap-1.5 border border-white/60">
          <span class="w-2 h-2 rounded-full bg-[#10FFA0] animate-pulse"></span>
          <span class="truncate">${statusText}</span>
        </div>
        <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#00E5FF] -mt-[1px]"></div>
      </div>
    `;
  }

  return '';
}

export function getPeerBubbleHtml(item, isCoLocated = false) {
  const targetStory = item.activeStory || (item.category === 'moment' || item.image || item.bg_gradient ? item : null);
  const peerSong = item.custom_song || item.songData || item.music || null;
  const statusText = item.custom_status || (item.title && item.title !== 'Đang trực tuyến' && item.title !== 'Khoảnh khắc mới' ? item.title : '');
  const displayName = item.hostName || item.name || 'Bạn VIVU';
  const isOffline = item.isOnline === false;

  // ƯU TIÊN 1: STORY KHOẢNH KHẮC (Khung GIF 52x64px có nhãn LIVE & nút mở xem)
  if (targetStory) {
    return `
      <div id="btn-view-peer-story" class="peer-bubble-wrapper mb-2 relative flex flex-col items-center animate-in zoom-in-95 duration-200 cursor-pointer group" title="Bấm để xem Story của ${displayName}">
        <div class="vivu-story-gif-box relative w-[52px] h-[64px] rounded-2xl overflow-hidden border-2 border-[#FF2A85] shadow-[0_0_20px_rgba(255,42,133,0.85)] ring-2 ring-purple-500/50 bg-black flex items-center justify-center transition-all duration-300 group-hover:scale-110">
          ${targetStory.image ? `
            <img src="${targetStory.image}" alt="Story" class="w-full h-full object-cover animate-gif-breath" />
          ` : `
            <div class="w-full h-full ${targetStory.bg_gradient || 'bg-gradient-to-tr from-[#FF2A85] via-purple-600 to-[#7928CA]'} flex flex-col items-center justify-center p-1 text-center animate-gif-breath">
              <span class="text-[8px] font-black text-white line-clamp-2 leading-tight uppercase drop-shadow-sm">${targetStory.title || 'STORY'}</span>
            </div>
          `}
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"></div>
          <span class="absolute top-1 left-1 px-1 py-0.5 rounded-[4px] bg-[#FF2A85] text-white text-[7px] font-black tracking-wider leading-none shadow-xs">
            LIVE
          </span>
          <span class="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white text-[9px] group-hover:scale-110 transition-transform">
            <i class="bi bi-arrows-fullscreen"></i>
          </span>
        </div>
        <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#FF2A85] -mt-[1px]"></div>
      </div>
    `;
  }

  // ƯU TIÊN 2: BÀI HÁT MP3 THẬT (Bong bóng viền hồng neon với nút Play & Tên bài hát - Chuẩn Hình 5)
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
        <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#08202E] -mt-[1px]"></div>
      </div>
    `;
  }

  // ƯU TIÊN 3: SUY NGHĨ NGẮN (Bong bóng xanh Cyan)
  if (statusText) {
    return `
      <div class="peer-bubble-wrapper mb-2 relative flex flex-col items-center animate-in zoom-in-90 duration-200 cursor-pointer" title="Suy nghĩ của ${displayName}">
        <div class="px-3.5 py-1.5 bg-[#00E5FF] text-[#08202E] font-bold text-xs rounded-2xl rounded-br-xs shadow-[0_4px_16px_rgba(0,229,255,0.4)] max-w-[200px] flex items-center gap-1.5 border border-white/60">
          <span class="w-2 h-2 rounded-full bg-[#10FFA0] animate-pulse"></span>
          <span class="truncate">${statusText}</span>
        </div>
        <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#00E5FF] -mt-[1px]"></div>
      </div>
    `;
  }

  // ƯU TIÊN 4: VIÊN THUỐC TÊN & TRỰC TUYẾN
  return `
    <div class="peer-bubble-wrapper mb-1 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.12)] border border-[#D2D9F4] text-[#131315] text-[11px] font-semibold flex items-center gap-1.5 whitespace-nowrap pointer-events-auto">
      <span class="w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-neutral-400' : 'bg-[#10FFA0] animate-pulse'}"></span>
      <span class="truncate max-w-[110px]">${displayName}</span>
      ${isCoLocated ? '<span class="text-[9px] text-[#FFAA00] font-bold">[GẦN BẠN]</span>' : ''}
    </div>
  `;
}

