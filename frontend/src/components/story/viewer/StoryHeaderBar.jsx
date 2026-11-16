import React from 'react';
import { DEFAULT_WHITE_PERSON_AVATAR } from '../../../utils/avatarUtils';
import { playTactileClickSound } from '../storyAudioEffects';

/**
 * StoryHeaderBar - Thanh Header điều khiển Story
 * Bao gồm: Vạch phân đoạn carousel, Avatar & Tác giả, Nút nhạc, Nút xóa, Fullscreen & Đóng
 * 100% Bootstrap Icons (Rule 5), < 450 dòng (Rule 7)
 */
export default function StoryHeaderBar({
  activeList = [],
  currentIndex = 0,
  actualStory,
  remainingTime,
  resolvedStoryMusic,
  isPlayingMusic,
  onToggleMusic,
  isOwner,
  onOpenDeleteConfirm,
  mainImageSrc,
  onOpenFullscreen,
  onClose,
  onOpenUserProfile
}) {
  if (!actualStory) return null;

  return (
    <div className="absolute top-0 left-0 right-0 z-40 p-3 pt-safe bg-gradient-to-b from-black/80 via-black/40 to-transparent">
      {/* Thanh vạch phân đoạn Segmented Bars */}
      <div className="w-full flex items-center gap-1.5 mb-3">
        {activeList.map((_, idx) => (
          <div
            key={idx}
            className="flex-1 h-1 rounded-full overflow-hidden transition-all duration-300"
            style={{
              backgroundColor: idx < currentIndex ? '#FFFFFF' : (idx === currentIndex ? '#10FFA0' : 'rgba(255,255,255,0.25)'),
              boxShadow: idx === currentIndex ? '0 0 8px #10FFA0' : 'none'
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between pointer-events-auto">
        <div 
          className="flex items-center gap-2.5 cursor-pointer group hover:opacity-90 transition-opacity"
          onClick={() => {
            if (onOpenUserProfile) {
              onOpenUserProfile(actualStory, 'story');
            }
          }}
          title={`Xem trang cá nhân của ${actualStory.host_name || actualStory.hostName}`}
        >
          <img
            src={actualStory.host_avatar || actualStory.hostAvatar || DEFAULT_WHITE_PERSON_AVATAR}
            alt=""
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/80 shadow-md"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-white">{actualStory.host_name || actualStory.hostName}</h3>
              <span className="px-1.5 py-0.5 rounded-full bg-white/15 text-[10px] text-white/80 font-mono">
                {activeList.length > 1 ? `${currentIndex + 1}/${activeList.length}` : (actualStory.user_code || actualStory.userCode || 'VU')}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-white/70">
              <i className="bi bi-clock-history text-amber-400"></i>
              <span>{remainingTime}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút đĩa nhạc quay */}
          {resolvedStoryMusic && (
            <button
              type="button"
              onClick={onToggleMusic}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold cursor-pointer hover:bg-black/80 transition-colors"
              title={isPlayingMusic ? "Tạm dừng phát nhạc" : "Bật phát nhạc Story"}
            >
              <i className={`bi bi-disc text-teal-400 ${isPlayingMusic ? 'animate-spin' : ''}`}></i>
              <span className="truncate max-w-[80px]">{resolvedStoryMusic.title}</span>
            </button>
          )}

          {/* NÚT XÓA STORY (Chỉ hiển thị cho chủ sở hữu bài đăng) */}
          {isOwner && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                playTactileClickSound();
                onOpenDeleteConfirm();
              }}
              className="w-8 h-8 rounded-full bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/30 text-rose-400 hover:text-rose-200 flex items-center justify-center transition-all cursor-pointer shadow-md"
              title="Xóa Story này"
            >
              <i className="bi bi-trash3 text-xs"></i>
            </button>
          )}

          {/* Nút Xem Toàn Màn Hình */}
          {mainImageSrc && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                playTactileClickSound();
                onOpenFullscreen();
              }}
              className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white hover:text-[#10FFA0] hover:bg-black/70 flex items-center justify-center transition-all cursor-pointer shadow-md"
              title="Mở toàn màn hình"
            >
              <i className="bi bi-arrows-fullscreen text-xs"></i>
            </button>
          )}

          {/* Nút đóng */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playTactileClickSound();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 cursor-pointer"
            title="Đóng Story"
          >
            <i className="bi bi-x-lg text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
