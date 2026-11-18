import React from 'react';
import DualCameraOverlay from '../camera/DualCameraOverlay';
import { CAMERA_FILTER_PRESETS } from '../camera/CameraViewfinder';
import { playTactileClickSound } from '../storyAudioEffects';

export default function StoryCanvasPreview({
  mode = 'PHOTO', // 'PHOTO' | 'TEXT'
  image,
  dualImage,
  onSwapDual,
  bgGradient,
  selectedFilter,
  adjustments,
  texts = [],
  stickers = [],
  selectedSong,
  isPlayingMusic,
  onTogglePlaySong,
  onOpenMusicPicker,
  onOpenTextEditor,
  onOpenStickerPicker,
  onOpenFilterAdjuster,
  onRetakePhoto,
  onRemoveText,
  onRemoveSticker,
  onRemoveSong,
  onPublish,
  isPublishing
}) {
  const currentFilterObj = CAMERA_FILTER_PRESETS.find(f => f.id === selectedFilter);

  // Tính toán chuỗi CSS filter kết hợp preset + slider adjustments
  const computedFilterCss = [
    currentFilterObj && currentFilterObj.css !== 'none' ? currentFilterObj.css : '',
    `brightness(${adjustments?.brightness ?? 100}%)`,
    `contrast(${adjustments?.contrast ?? 100}%)`,
    `saturate(${adjustments?.saturation ?? 100}%)`
  ].filter(Boolean).join(' ');

  return (
    <div className="relative w-full h-full bg-black select-none overflow-hidden flex flex-col justify-between">
      {/* Lớp nền ảnh hoặc Gradient */}
      <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center">
        {mode === 'PHOTO' && image ? (
          <div className="relative w-full h-full">
            <img
              src={image}
              alt="Story Preview"
              className="w-full h-full object-cover transition-all duration-200"
              style={{ filter: computedFilterCss }}
            />
            {/* Lớp phủ Vignette */}
            {adjustments?.vignette > 0 && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: `inset 0 0 ${adjustments.vignette * 2.5}px rgba(0,0,0,${adjustments.vignette / 100})`
                }}
              />
            )}
          </div>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${bgGradient || 'from-[#0A0A0C] via-[#1A1A24] to-[#251A30]'} flex items-center justify-center p-6`} />
        )}

        {/* Khung ảnh Dual Camera PIP */}
        {dualImage && (
          <DualCameraOverlay
            secondaryImage={dualImage}
            onSwap={onSwapDual}
          />
        )}

        {/* Lớp hiển thị các khối Text đã chèn */}
        <div className="absolute inset-0 pointer-events-none p-6 flex flex-col items-center justify-center space-y-4">
          {texts.map((item, idx) => (
            <div
              key={idx}
              className="pointer-events-auto relative group cursor-pointer max-w-[85%] text-center"
              onClick={() => onRemoveText(idx)}
              title="Chạm để xóa text"
            >
              <span
                className={`inline-block px-3 py-1.5 rounded-2xl text-xl font-bold tracking-wide shadow-lg ${
                  item.font === 'font-neon'
                    ? 'font-mono drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]'
                    : item.font === 'font-serif'
                    ? 'font-serif italic'
                    : item.font === 'font-mono'
                    ? 'font-mono'
                    : 'font-sans'
                }`}
                style={{
                  color: item.color,
                  backgroundColor: item.hasHighlight ? 'rgba(0,0,0,0.65)' : 'transparent'
                }}
              >
                {item.text}
              </span>
              <button
                type="button"
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] items-center justify-center hidden group-hover:flex"
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
          ))}
        </div>

        {/* Lớp hiển thị các Sticker (Meme, Poll, QA, Location) */}
        <div className="absolute inset-0 pointer-events-none p-6 flex flex-col items-center justify-end pb-32 space-y-3">
          {stickers.map((stk, idx) => (
            <div
              key={stk.id || idx}
              className="pointer-events-auto relative group cursor-pointer"
              onClick={() => onRemoveSticker(idx)}
              title="Chạm để xóa sticker"
            >
              {/* Poll Sticker Preview */}
              {stk.type === 'poll' && (
                <div className="w-64 p-3.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/20 text-center shadow-xl space-y-2">
                  <p className="text-xs font-bold text-white">{stk.question}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="py-1.5 px-2 rounded-xl bg-white/20 text-white text-[11px] font-bold border border-white/10">
                      {stk.options[0]}
                    </div>
                    <div className="py-1.5 px-2 rounded-xl bg-white/20 text-white text-[11px] font-bold border border-white/10">
                      {stk.options[1]}
                    </div>
                  </div>
                </div>
              )}

              {/* QA Box Preview */}
              {stk.type === 'qa' && (
                <div className="w-64 p-3 rounded-2xl bg-gradient-to-r from-pink-600/90 to-rose-600/90 text-white shadow-xl space-y-1.5 border border-white/20">
                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-wider uppercase">
                    <i className="bi bi-chat-heart-fill"></i>
                    <span>Hỏi Tôi</span>
                  </div>
                  <p className="text-xs font-bold text-center">{stk.prompt}</p>
                </div>
              )}

              {/* Location Badge Preview */}
              {stk.type === 'location' && (
                <div className="px-3.5 py-1.5 rounded-full bg-[#0A8395]/90 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 border border-white/20 shadow-lg">
                  <i className="bi bi-geo-alt-fill text-amber-300"></i>
                  <span>{stk.name}</span>
                  <span className="text-white/40">•</span>
                  <span className="text-[11px] text-teal-200">{stk.weather}</span>
                </div>
              )}

              {/* Meme Sticker Preview */}
              {stk.type === 'meme' && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-black/70 backdrop-blur-md border border-white/20 shadow-xl">
                  <img src={stk.image} alt={stk.label} className="w-10 h-10 rounded-xl object-cover" />
                  <span className="text-xs font-bold text-white pr-1">{stk.label}</span>
                </div>
              )}

              <button
                type="button"
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] items-center justify-center hidden group-hover:flex"
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Thanh công cụ đỉnh: Chụp lại, [Nhạc, Aa, Sticker, Filter], [Đăng] */}
      <div className="relative z-30 p-3.5 pt-safe flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
        {/* Nút quay lại Camera */}
        <button
          type="button"
          onClick={() => {
            playTactileClickSound();
            onRetakePhoto();
          }}
          className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-95 transition-all shadow-md cursor-pointer"
          title="Chụp lại ảnh"
        >
          <i className="bi bi-arrow-left text-base"></i>
        </button>

        {/* Cụm công cụ sáng tạo & Nút Đăng */}
        <div className="flex items-center gap-2">
          {/* Cụm công cụ: Nhạc (đầu tiên), Aa, Sticker, Filter */}
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/15 shadow-lg">
            {/* 1. Chọn Nhạc Apple Music */}
            <button
              type="button"
              onClick={() => {
                playTactileClickSound();
                if (onOpenMusicPicker) onOpenMusicPicker();
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                selectedSong
                  ? 'bg-gradient-to-tr from-[#FF2A85] to-[#7928CA] text-white shadow-[0_0_12px_rgba(255,42,133,0.8)] animate-pulse'
                  : 'text-white/90 hover:text-white hover:bg-white/15 active:scale-95'
              }`}
              title={selectedSong ? `Bài hát: ${selectedSong.title}` : "Chọn nhạc nền"}
            >
              <i className="bi bi-music-note-beamed text-sm"></i>
            </button>

            {/* 2. Chèn Text */}
            <button
              type="button"
              onClick={() => {
                playTactileClickSound();
                if (onOpenTextEditor) onOpenTextEditor();
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/15 active:scale-95 transition-all cursor-pointer"
              title="Thêm chữ (Aa)"
            >
              <span className="font-serif font-black text-xs">Aa</span>
            </button>

            {/* 3. Chèn Nhãn dán Sticker */}
            <button
              type="button"
              onClick={() => {
                playTactileClickSound();
                if (onOpenStickerPicker) onOpenStickerPicker();
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/15 active:scale-95 transition-all cursor-pointer"
              title="Nhãn dán, Poll & Meme"
            >
              <i className="bi bi-stickies text-sm"></i>
            </button>

            {/* 4. Bộ lọc Filter / Chỉnh màu */}
            <button
              type="button"
              onClick={() => {
                playTactileClickSound();
                if (onOpenFilterAdjuster) onOpenFilterAdjuster();
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/15 active:scale-95 transition-all cursor-pointer"
              title="Bộ lọc & Tinh chỉnh ảnh"
            >
              <i className="bi bi-sliders text-sm"></i>
            </button>
          </div>

          {/* Nút Đăng Story trực tiếp */}
          {onPublish && (
            <button
              type="button"
              disabled={isPublishing}
              onClick={onPublish}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FF2A85] to-[#7928CA] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,42,133,0.5)] active:scale-95 hover:brightness-110 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Đăng Story"
            >
              {isPublishing ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin text-xs"></i>
                  <span>Đang đăng...</span>
                </>
              ) : (
                <>
                  <span>Đăng</span>
                  <i className="bi bi-check2 text-sm font-bold"></i>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Widget hiển thị bài hát đang phát nếu có HOẶC prompt thêm nhạc nếu chưa có */}
      {selectedSong ? (
        <div className="relative z-30 mx-4 mb-6 pointer-events-auto self-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white text-xs shadow-xl">
            <div
              onClick={onTogglePlaySong}
              className="flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
              title="Phát / Tạm dừng"
            >
              <div className={`w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF2A85] to-[#00E5FF] flex items-center justify-center text-white text-xs shadow-md ${isPlayingMusic ? 'animate-spin' : ''}`}>
                <i className={`bi ${isPlayingMusic ? 'bi-disc' : 'bi-play-fill'}`}></i>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold truncate max-w-[130px] leading-tight">{selectedSong.title}</span>
                <span className="text-white/50 text-[10px] truncate max-w-[100px] leading-tight">{selectedSong.artist}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playTactileClickSound();
                if (onOpenMusicPicker) onOpenMusicPicker();
              }}
              className="px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-[10px] text-cyan-300 font-semibold transition-colors cursor-pointer"
              title="Đổi bài hát khác"
            >
              Đổi
            </button>

            {onRemoveSong && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveSong();
                }}
                className="w-5 h-5 ml-0.5 rounded-full bg-white/20 hover:bg-rose-600 text-white flex items-center justify-center text-[10px] cursor-pointer transition-colors"
                title="Gỡ bỏ bài hát"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Floating Prompt thêm nhạc khi chưa chọn bài nào */
        <div className="relative z-30 mx-4 mb-6 pointer-events-auto self-center">
          <button
            type="button"
            onClick={() => {
              playTactileClickSound();
              if (onOpenMusicPicker) onOpenMusicPicker();
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-md border border-white/20 hover:border-[#FF2A85]/60 text-white text-xs shadow-xl transition-all active:scale-95 group cursor-pointer"
            title="Thêm nhạc nền vào Story"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#FF2A85] to-[#7928CA] flex items-center justify-center text-white text-[10px] group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(255,42,133,0.5)]">
              <i className="bi bi-music-note-beamed"></i>
            </div>
            <span className="font-semibold text-white/90 group-hover:text-white">Thêm nhạc nền</span>
            <i className="bi bi-plus text-xs text-white/60 group-hover:text-white"></i>
          </button>
        </div>
      )}
    </div>
  );
}

