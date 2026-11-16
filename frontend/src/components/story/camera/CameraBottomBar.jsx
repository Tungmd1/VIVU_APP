import React from 'react';
import { playTactileClickSound } from '../storyAudioEffects';

/**
 * CameraBottomBar - Thanh Điều Khiển Đáy Chuẩn 100% Ảnh Instagram
 * - Hàng 1: Nút Shutter to tròn viền kép ở tâm & Bong bóng bộ lọc tròn kế bên
 * - Hàng 2: Thumbnail Thư viện (trái) • BÀI VIẾT • TIN • THƯỚC PHIM (giữa) • Lật Camera (phải)
 * Rule 5 (100% Bootstrap Icons), Rule 7 (< 200 dòng)
 */
export default function CameraBottomBar({
  onTriggerCapture,
  filterPresets,
  selectedFilter,
  onSelectFilter,
  onOpenGallery,
  activeStoryMode,
  onChangeStoryMode,
  onFlipCamera
}) {
  return (
    <div className="relative z-30 shrink-0 w-full flex flex-col items-center bg-gradient-to-t from-black via-black/80 to-transparent pt-2 pb-6 px-4 pointer-events-auto">
      
      {/* Hàng 1: Nút Shutter to tròn ở tâm & Bong bóng bộ lọc tròn kế bên */}
      <div className="w-full flex items-center justify-center gap-3.5 py-1">
        {/* Nút Shutter to tròn trắng ở tâm (Viền đôi chuẩn Instagram) */}
        <button
          type="button"
          onClick={onTriggerCapture}
          className="relative w-[76px] h-[76px] rounded-full flex items-center justify-center active:scale-90 transition-transform cursor-pointer group shrink-0"
          title="Chụp ảnh / Chọn ảnh"
        >
          <div className="absolute inset-0 rounded-full border-[3.5px] border-white/90 group-hover:border-white transition-colors"></div>
          <div className="w-[60px] h-[60px] rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.7)] group-hover:scale-95 transition-transform"></div>
        </button>

        {/* Các bong bóng bộ lọc hiệu ứng tròn kế bên Shutter (Theo đúng Instagram) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-[130px] py-1">
          {filterPresets?.filter(f => f.id !== 'normal').slice(0, 3).map(filter => (
            <button
              key={filter.id}
              type="button"
              onClick={() => {
                playTactileClickSound();
                onSelectFilter(filter.id);
              }}
              className={`w-10 h-10 rounded-full bg-gradient-to-tr ${filter.previewColor} shrink-0 border-2 transition-all cursor-pointer flex items-center justify-center text-[9px] font-bold text-white shadow-md ${
                selectedFilter === filter.id ? 'border-white scale-110 shadow-[0_0_12px_white]' : 'border-white/40 opacity-75 hover:opacity-100'
              }`}
              title={`Bộ lọc: ${filter.name}`}
            >
              {filter.name.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Hàng 2: Thư viện (trái) - Dải chế độ lướt ngang (giữa) - Lật Camera (phải) */}
      <div className="w-full flex items-center justify-between px-2 pt-2">
        {/* Thumbnail Thư viện ảnh (Góc trái) - Bo góc viền trắng chuẩn Instagram */}
        <button
          type="button"
          onClick={onOpenGallery}
          className="w-10 h-10 rounded-xl bg-neutral-800/80 backdrop-blur-md border border-white/40 flex items-center justify-center text-white active:scale-95 transition-transform group hover:border-white overflow-hidden shadow-lg cursor-pointer"
          title="Chọn ảnh từ thiết bị"
        >
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-neutral-700 to-neutral-900 group-hover:scale-105 transition-transform">
            <i className="bi bi-images text-base text-white/90"></i>
          </div>
        </button>

        {/* Dải chọn chế độ lướt ngang: BÀI VIẾT • TIN • THƯỚC PHIM */}
        <div className="flex items-center justify-center gap-6 text-[12px] font-bold tracking-widest text-white/50 select-none">
          <button
            type="button"
            onClick={() => {
              playTactileClickSound();
              onChangeStoryMode('POST');
            }}
            className={`transition-all cursor-pointer ${
              activeStoryMode === 'POST' ? 'text-white font-black tracking-wider drop-shadow-md' : 'hover:text-white/80'
            }`}
          >
            BÀI VIẾT
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClickSound();
              onChangeStoryMode('STORY');
            }}
            className={`transition-all cursor-pointer relative py-1 ${
              activeStoryMode === 'STORY' ? 'text-white font-black tracking-wider drop-shadow-[0_0_10px_white]' : 'hover:text-white/80'
            }`}
          >
            <span>TIN</span>
            {activeStoryMode === 'STORY' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_white]"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClickSound();
              onChangeStoryMode('REEL');
            }}
            className={`transition-all cursor-pointer ${
              activeStoryMode === 'REEL' ? 'text-white font-black tracking-wider drop-shadow-md' : 'hover:text-white/80'
            }`}
          >
            THƯỚC PHIM
          </button>
        </div>

        {/* Nút lật camera trước / sau (Góc phải) */}
        <button
          type="button"
          onClick={onFlipCamera}
          className="w-10 h-10 rounded-full bg-neutral-800/80 backdrop-blur-md border border-white/40 flex items-center justify-center text-white active:scale-95 transition-transform group hover:border-white shadow-lg cursor-pointer"
          title="Lật camera"
        >
          <i className="bi bi-arrow-repeat text-xl group-hover:rotate-180 transition-transform duration-300"></i>
        </button>
      </div>
    </div>
  );
}

