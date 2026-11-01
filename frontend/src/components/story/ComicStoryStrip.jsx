import React, { useRef } from 'react';

/**
 * ComicStoryStrip - Dải Story phong cách Khung Truyện Tranh (Comic Book / Manga Panels)
 * - Mỗi Story được thiết kế như một khung tranh (comic panel) góc cạnh xúc giác
 * - Hiệu ứng halftone vi mô, viền đậm 2px, đổ bóng comic tactile
 * - Khung đầu tiên dành cho Bạn ("Story của bạn" / "+ Tạo Story")
 * - Phân định rạch ròi trạng thái Chưa xem (Unread) vs Đã xem (Read)
 * - Cuộn ngang mượt mà trên mobile, có nút cuộn tiện lợi trên desktop
 * - 100% Bootstrap Icons, Resend Dark Monochrome kết hợp Accent Theme
 */
export default function ComicStoryStrip({
  stories = [],
  myActiveStory = null,
  userAvatar,
  userName = 'Bạn',
  onOpenCreateStory,
  onOpenStoryDetail,
  viewedStoryIds = new Set()
}) {
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -220, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 220, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full py-2 select-none">
      {/* Nút cuộn trái trên Desktop */}
      <button
        type="button"
        onClick={scrollLeft}
        aria-label="Cuộn Story sang trái"
        className="hidden md:flex absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-[#111111]/90 border border-white/20 text-white items-center justify-center hover:bg-white hover:text-black shadow-md transition-all active:scale-90"
      >
        <i className="bi bi-chevron-left text-xs font-bold"></i>
      </button>

      {/* Dải cuộn ngang các khung truyện tranh */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-2.5 overflow-x-auto no-scrollbar px-1 py-1 scroll-smooth"
      >
        {/* ======================================================== */}
        {/* KHUNG TRUYỆN TRANH 1: STORY CỦA BẠN / TẠO MỚI           */}
        {/* ======================================================== */}
        <div
          onClick={() => {
            if (myActiveStory) {
              onOpenStoryDetail?.(myActiveStory);
            } else {
              onOpenCreateStory?.();
            }
          }}
          className={`shrink-0 w-28 sm:w-32 h-40 rounded-2xl relative overflow-hidden flex flex-col justify-between p-2.5 cursor-pointer comic-panel group bg-[#111114] ${
            myActiveStory ? 'comic-panel-unread' : 'border-dashed border-white/30 hover:border-white/60'
          }`}
          title={myActiveStory ? 'Bấm để xem lại Story của bạn' : 'Bấm để tạo Story mới'}
        >
          {/* Nền ảnh hoặc Halftone Texture */}
          {myActiveStory?.image ? (
            <img
              src={myActiveStory.image}
              alt="Story của bạn"
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-300"
            />
          ) : (
            <div className="absolute inset-0 comic-halftone opacity-40 pointer-events-none bg-gradient-to-b from-[#18181D] to-[#0A0A0C]" />
          )}

          {/* Lớp phủ chuyển sắc tối bảo đảm tương phản */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

          {/* Huy hiệu Góc Manga: BẠN */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="comic-badge text-[9px] px-1.5 py-0.5 rounded-sm bg-accent text-black font-extrabold shadow-sm">
              {myActiveStory ? 'LIVE' : 'YOU'}
            </span>

            {/* Nút dấu cộng hoặc icon phát sóng */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCreateStory?.();
              }}
              className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center shadow-md hover:bg-neutral-200 active:scale-90 transition-all border border-black/40"
              title="Đăng thêm Story mới"
            >
              <i className="bi bi-plus-lg text-xs font-black"></i>
            </button>
          </div>

          {/* Phần chân khung: Avatar & Tiêu đề */}
          <div className="relative z-10 space-y-1">
            <div className="relative w-8 h-8 rounded-full p-[1.5px] border-2 border-white bg-black">
              <img
                src={userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={userName}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="space-y-0.5">
              <div className="text-[11px] font-black text-white truncate tracking-tight">
                {myActiveStory ? (myActiveStory.title || 'Story của bạn') : 'Tạo Story'}
              </div>
              <div className="text-[9px] text-[#A1A1AA] font-mono truncate">
                {myActiveStory ? 'Đang phát sóng' : 'Chia sẻ ngay'}
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CÁC KHUNG TRUYỆN TRANH: BẠN BÈ & NGƯỜI DÙNG QUANH ĐÂY   */}
        {/* ======================================================== */}
        {stories.map((story) => {
          const isViewed = viewedStoryIds.has(story.id);
          const authorName = story.hostName || story.name || 'Người dùng VIVU';
          const authorAvatar = story.hostAvatar || story.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
          const storyTitle = story.title || 'Khoảnh khắc VIVU';

          return (
            <div
              key={story.id}
              onClick={() => onOpenStoryDetail?.(story)}
              className={`shrink-0 w-28 sm:w-32 h-40 rounded-2xl relative overflow-hidden flex flex-col justify-between p-2.5 cursor-pointer comic-panel group bg-[#131317] ${
                !isViewed ? 'comic-panel-unread' : 'border-white/15 opacity-85 hover:opacity-100'
              }`}
              title={`Xem Story của ${authorName}`}
            >
              {/* Ảnh nền Story hoặc Gradient Halftone */}
              {story.image ? (
                <img
                  src={story.image}
                  alt={storyTitle}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                />
              ) : (
                <div className="absolute inset-0 comic-halftone opacity-35 bg-gradient-to-br from-[#1C1A24] via-[#101014] to-[#0A0A0C]" />
              )}

              {/* Lớp phủ chuyển sắc bảo đảm text luôn rõ */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/20 pointer-events-none" />

              {/* Header khung: Badge trạng thái & Âm nhạc */}
              <div className="relative z-10 flex items-center justify-between">
                <span
                  className={`comic-badge text-[8px] px-1.5 py-0.5 rounded-sm font-extrabold shadow-sm ${
                    !isViewed
                      ? 'bg-rose-500 text-white'
                      : 'bg-white/20 text-neutral-300'
                  }`}
                >
                  {!isViewed ? 'MỚI' : 'ĐÃ XEM'}
                </span>

                {story.music && (
                  <span className="w-5 h-5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-rose-400 flex items-center justify-center text-[10px]">
                    <i className="bi bi-music-note-beamed"></i>
                  </span>
                )}
              </div>

              {/* Footer khung: Avatar viền Comic & Tên tác giả */}
              <div className="relative z-10 space-y-1">
                <div
                  className={`relative w-8 h-8 rounded-full p-[1.5px] bg-black ${
                    !isViewed
                      ? 'border-2 border-accent shadow-[0_0_8px_var(--accent-glow)]'
                      : 'border border-white/30'
                  }`}
                >
                  <img
                    src={authorAvatar}
                    alt={authorName}
                    className="w-full h-full rounded-full object-cover"
                  />
                  {!isViewed && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 border border-black animate-pulse" />
                  )}
                </div>

                <div className="space-y-0.2">
                  <div className="text-[11px] font-bold text-white truncate leading-tight group-hover:text-accent transition-colors">
                    {authorName}
                  </div>
                  <div className="text-[9px] text-[#A1A1AA] truncate leading-tight">
                    {storyTitle}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Nút cuộn phải trên Desktop */}
      <button
        type="button"
        onClick={scrollRight}
        aria-label="Cuộn Story sang phải"
        className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-[#111111]/90 border border-white/20 text-white items-center justify-center hover:bg-white hover:text-black shadow-md transition-all active:scale-90"
      >
        <i className="bi bi-chevron-right text-xs font-bold"></i>
      </button>
    </div>
  );
}
