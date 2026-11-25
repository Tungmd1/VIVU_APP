import React from 'react';

export function ProfileHighlightsStrip({ highlights = [], onSelectHighlight }) {
  if (!Array.isArray(highlights) || highlights.length === 0) return null;
  return (
    <div className="p-4 rounded-3xl bg-[#121520] border border-white/10 space-y-3">
      <div className="flex items-center gap-2">
        <i className="bi bi-stars text-[#10FFA0] text-base" />
        <span className="text-xs font-bold text-white uppercase tracking-wider">
          Tin Nổi Bật ({highlights.length})
        </span>
      </div>
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
        {highlights.map((hl) => {
          const cover = hl.cover_image || hl.coverImage || hl.stories?.[0]?.image || '';
          return (
            <button
              key={hl.id}
              type="button"
              onClick={() => onSelectHighlight?.(hl)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#10FFA0] via-[#00E5FF] to-[#FF2A85] group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
                  {cover ? (
                    <img src={cover} alt={hl.title} className="w-full h-full object-cover" />
                  ) : (
                    <i className="bi bi-star-fill text-xs text-[#10FFA0]" />
                  )}
                </div>
              </div>
              <span className="text-[10px] font-medium text-white/85 truncate max-w-[60px]">
                {hl.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * HighlightViewerModal - Trình Xem Chi Tiết Nhóm Tin Nổi Bật
 * Tách khỏi ProfileStoryHighlights.jsx để tuân thủ Rule 7 (< 450 dòng)
 */
export default function HighlightViewerModal({
  highlight,
  currentStoryIndex,
  setCurrentStoryIndex,
  onClose
}) {
  if (!highlight) return null;

  const stories = highlight.stories || [];
  const currentStory = stories[currentStoryIndex] || {
    image: highlight.cover_image || highlight.coverImage,
    title: highlight.title
  };

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div className="flex items-center justify-between text-white z-10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden bg-black flex items-center justify-center">
            {(highlight.cover_image || highlight.coverImage) ? (
              <img
                src={highlight.cover_image || highlight.coverImage}
                alt={highlight.title || ''}
                className="w-full h-full object-cover"
              />
            ) : (
              <i className="bi bi-stars text-xs text-[#10FFA0]" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-white">{highlight.title}</p>
            <p className="text-[10px] text-white/50">
              {stories.length || 1} khoảnh khắc
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng trình xem tin nổi bật"
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm cursor-pointer"
        >
          <i className="bi bi-x-lg" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-2 relative" onClick={(e) => e.stopPropagation()}>
        {currentStory.video ? (
          <video
            src={currentStory.video}
            controls
            autoPlay
            playsInline
            className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
          />
        ) : currentStory.image ? (
          <img
            src={currentStory.image}
            alt={currentStory.title || highlight.title}
            className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
          />
        ) : (
          <div className="w-72 h-96 rounded-3xl bg-gradient-to-tr from-[#FF2A85] via-purple-600 to-[#7928CA] flex items-center justify-center p-6 text-center shadow-2xl">
            <p className="text-lg font-extrabold text-white">{currentStory.title || highlight.title}</p>
          </div>
        )}

        {stories.length > 1 && (
          <>
            {currentStoryIndex > 0 && (
              <button
                type="button"
                onClick={() => setCurrentStoryIndex(prev => prev - 1)}
                aria-label="Tin trước"
                className="absolute left-4 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 cursor-pointer"
              >
                <i className="bi bi-chevron-left" />
              </button>
            )}
            {currentStoryIndex < stories.length - 1 && (
              <button
                type="button"
                onClick={() => setCurrentStoryIndex(prev => prev + 1)}
                aria-label="Tin tiếp theo"
                className="absolute right-4 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 cursor-pointer"
              >
                <i className="bi bi-chevron-right" />
              </button>
            )}
          </>
        )}
      </div>

      <div className="w-full text-center py-2 text-white/40 text-[11px]">
        Chạm ra ngoài để đóng
      </div>
    </div>
  );
}
