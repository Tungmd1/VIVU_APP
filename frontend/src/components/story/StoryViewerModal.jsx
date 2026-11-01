import React, { useState, useEffect } from 'react';
import StoryFloatingReactions from './viewer/StoryFloatingReactions';
import StoryInteractiveLayer from './viewer/StoryInteractiveLayer';
import StoryMiniMapRadar from './viewer/StoryMiniMapRadar';
import DualCameraOverlay from './camera/DualCameraOverlay';
import StoryFullscreenLightbox from './viewer/StoryFullscreenLightbox';
import { storyAudioPlayer } from '../../data/trendingSongs';
import { playTactileClickSound } from './storyAudioEffects';

function formatRemainingTime(expiresAt) {
  if (!expiresAt) return 'Còn 24h';
  try {
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    if (diffMs <= 0) return 'Hết hạn';
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `Còn ${diffMins}p`;
    const hours = Math.floor(diffMins / 60);
    return `Còn ${hours}h`;
  } catch {
    return 'Còn 24h';
  }
}

export default function StoryViewerModal({
  story,
  storyList = [],
  initialIndex = 0,
  onClose,
  onOpenStoryChat,
  onVotePoll,
  onReplyQA,
  onReact,
  onDeleteStory,
  userLat,
  userLng,
  currentUserId,
  currentUserCode
}) {
  // Danh sách các story cùng tác giả
  const [activeList, setActiveList] = useState(() => {
    if (Array.isArray(storyList) && storyList.length > 0) return storyList;
    return story ? [story] : [];
  });
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const [isFullscreenLightbox, setIsFullscreenLightbox] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [dualSwapped, setDualSwapped] = useState(false);

  // Đồng bộ khi storyList thay đổi từ props ngoài
  useEffect(() => {
    if (Array.isArray(storyList) && storyList.length > 0) {
      setActiveList(storyList);
      if (initialIndex < storyList.length) {
        setCurrentIndex(initialIndex);
      }
    } else if (story) {
      setActiveList([story]);
      setCurrentIndex(0);
    }
  }, [storyList, story, initialIndex]);

  const rawStory = activeList[currentIndex] || story;
  const actualStory = rawStory?.activeStory || rawStory;

  // Quản lý phát nhạc của Story hiện tại
  useEffect(() => {
    if (!actualStory) return;

    if (actualStory.music && actualStory.music.audio_url) {
      storyAudioPlayer.playSong(actualStory.music);
      setIsPlayingMusic(true);
    } else {
      storyAudioPlayer.stop();
      setIsPlayingMusic(false);
    }

    return () => {
      storyAudioPlayer.stop();
      setIsPlayingMusic(false);
    };
  }, [actualStory?.id, actualStory?.music]);

  if (!actualStory) return null;

  const remainingTime = formatRemainingTime(actualStory.expires_at || actualStory.expiresAt);

  // Kiểm tra quyền sở hữu bài đăng (Owner check)
  const isOwner = Boolean(
    (currentUserId && (actualStory.host_id === currentUserId || actualStory.hostId === currentUserId)) ||
    (currentUserCode && (actualStory.user_code === currentUserCode || actualStory.userCode === currentUserCode)) ||
    actualStory.isOwnerStory
  );

  // Xử lý ảnh chính / ảnh phụ nếu là Dual Camera
  const mainImageSrc = dualSwapped
    ? (actualStory.dual_image || actualStory.dualImage)
    : (actualStory.image || actualStory.memeImage || actualStory.dual_image);
  const secondaryImageSrc = dualSwapped
    ? (actualStory.image || actualStory.memeImage)
    : (actualStory.dual_image || actualStory.dualImage);

  // Điều hướng Story trước / sau
  const handlePrevStory = (e) => {
    e?.stopPropagation();
    playTactileClickSound();
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNextStory = (e) => {
    e?.stopPropagation();
    playTactileClickSound();
    if (currentIndex < activeList.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  // Chạm vào ảnh để mở Chế Độ Full Màn Hình (Lightbox tràn viền)
  const handleTapStory = (e) => {
    if (
      e.target.closest('button') ||
      e.target.closest('input') ||
      e.target.closest('form') ||
      e.target.closest('.interactive-clickable') ||
      e.target.closest('.interactive-layer-root') ||
      showDeleteConfirm
    ) {
      return;
    }
    e.stopPropagation();
    playTactileClickSound();
    if (mainImageSrc) {
      setIsFullscreenLightbox(true);
    }
  };

  // Xác nhận Xóa Story
  const handleConfirmDelete = async () => {
    if (!onDeleteStory || isDeleting) return;
    setIsDeleting(true);
    playTactileClickSound();
    try {
      await onDeleteStory(actualStory.id);
      const remainingStories = activeList.filter(s => (s.id || s.activeStory?.id) !== actualStory.id);
      if (remainingStories.length > 0) {
        setActiveList(remainingStories);
        setCurrentIndex(prev => Math.min(prev, remainingStories.length - 1));
        setShowDeleteConfirm(false);
      } else {
        setShowDeleteConfirm(false);
        onClose();
      }
    } catch (err) {
      console.warn('[Delete Story Error]:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    playTactileClickSound();
    if (onOpenStoryChat) {
      onOpenStoryChat(actualStory, replyText.trim());
    }
    setReplyText('');
    onClose();
  };

  const handleToggleMusic = (e) => {
    e.stopPropagation();
    if (!actualStory.music) return;
    if (isPlayingMusic) {
      storyAudioPlayer.stop();
      setIsPlayingMusic(false);
    } else {
      storyAudioPlayer.playSong(actualStory.music);
      setIsPlayingMusic(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden animate-fadeIn">
      {/* Vùng nền ảnh / Khung Story */}
      <div
        onClick={handleTapStory}
        className="relative w-full h-full max-w-lg md:max-w-2xl bg-[#0A0A0C] flex items-center justify-center overflow-hidden shadow-2xl cursor-pointer"
        title="Chạm vào ảnh để xem Toàn Màn Hình"
      >
        {mainImageSrc ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={mainImageSrc}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
            />
            <img
              src={mainImageSrc}
              alt="Story Content"
              className="relative w-full h-full object-contain md:object-cover transition-transform hover:scale-[1.01]"
              style={{ filter: actualStory.filter_css || 'none' }}
            />

            {/* Gợi ý chạm mở toàn màn hình */}
            <div className="absolute top-20 right-4 z-20 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white/90 text-[11px] font-mono flex items-center gap-1.5 shadow-lg pointer-events-none opacity-80 hover:opacity-100">
              <i className="bi bi-arrows-fullscreen text-[#10FFA0]"></i>
              <span>Xem Full Màn Hình</span>
            </div>
          </div>
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${actualStory.bg_gradient || 'from-[#0A0A0C] via-[#1A1A24] to-[#251A30]'} flex items-center justify-center p-8 text-center`}
          >
            <h2 className="text-2xl font-bold text-white leading-relaxed">
              {actualStory.title}
            </h2>
          </div>
        )}

        {/* Khung ảnh Dual Camera PIP */}
        {secondaryImageSrc && (
          <DualCameraOverlay
            secondaryImage={secondaryImageSrc}
            onSwap={() => setDualSwapped(v => !v)}
            isSwapped={dualSwapped}
          />
        )}

        {/* Lớp hiển thị Text chèn */}
        {actualStory.texts && actualStory.texts.length > 0 && (
          <div className="absolute inset-0 pointer-events-none p-6 flex flex-col items-center justify-center space-y-3 z-20">
            {actualStory.texts.map((t, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-2xl text-xl font-bold tracking-wide shadow-lg"
                style={{
                  color: t.color || '#FFFFFF',
                  backgroundColor: t.hasHighlight ? 'rgba(0,0,0,0.65)' : 'transparent'
                }}
              >
                {t.text}
              </span>
            ))}
          </div>
        )}

        {/* Lớp Tương Tác Sống Động: Poll, Q&A, Location */}
        <StoryInteractiveLayer
          storyId={actualStory.id}
          stickers={actualStory.stickers}
          currentUserId={currentUserId}
          onVotePoll={onVotePoll}
          onReplyQA={onReplyQA}
        />

        {/* VÙNG ĐIỀU HƯỚNG TRÁI / PHẢI KHI CÓ NHIỀU STORY */}
        {activeList.length > 1 && (
          <>
            {currentIndex > 0 && (
              <button
                type="button"
                onClick={handlePrevStory}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center transition-all shadow-xl active:scale-95"
                title="Khoảnh khắc trước"
              >
                <i className="bi bi-chevron-left text-lg"></i>
              </button>
            )}

            <button
              type="button"
              onClick={handleNextStory}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center transition-all shadow-xl active:scale-95"
              title={currentIndex < activeList.length - 1 ? "Khoảnh khắc kế tiếp" : "Đóng"}
            >
              <i className={`bi ${currentIndex < activeList.length - 1 ? 'bi-chevron-right text-lg' : 'bi-x-lg text-base'}`}></i>
            </button>
          </>
        )}

        {/* THANH HEADER: VẠCH PHÂN ĐOẠN, TÊN, NHẠC, NÚT XÓA, FULLSCREEN & ĐÓNG */}
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
            <div className="flex items-center gap-2.5">
              <img
                src={actualStory.host_avatar || actualStory.hostAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
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
              {actualStory.music && (
                <button
                  type="button"
                  onClick={handleToggleMusic}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold"
                  title="Nhạc nền"
                >
                  <i className={`bi bi-disc text-teal-400 ${isPlayingMusic ? 'animate-spin' : ''}`}></i>
                  <span className="truncate max-w-[80px]">{actualStory.music.title}</span>
                </button>
              )}

              {/* NÚT XÓA STORY (Chỉ hiển thị cho chủ sở hữu bài đăng) */}
              {isOwner && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playTactileClickSound();
                    setShowDeleteConfirm(true);
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
                    setIsFullscreenLightbox(true);
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

        {/* Chân Story: Mini Map Radar, Floating Reactions & Input Reply DM */}
        <div className="absolute bottom-0 left-0 right-0 z-40 p-4 pb-safe bg-gradient-to-t from-black/95 via-black/60 to-transparent space-y-3 pointer-events-auto">
          <div className="flex items-center justify-between">
            <StoryMiniMapRadar
              storyLat={actualStory.lat || actualStory.latitude}
              storyLng={actualStory.lng || actualStory.longitude}
              userLat={userLat}
              userLng={userLng}
              address={actualStory.address}
            />

            <StoryFloatingReactions
              onReact={(rxId) => {
                if (onReact) onReact(actualStory.id, rxId);
              }}
            />
          </div>

          <form onSubmit={handleSendReply} className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={`Nhắn tin cho ${actualStory.host_name || actualStory.hostName}...`}
                className="w-full bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/60 focus:border-white/50 outline-none pr-10"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-teal-400 text-black flex items-center justify-center text-xs active:scale-95 disabled:opacity-40"
              >
                <i className="bi bi-send-fill"></i>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* POPUP XÁC NHẬN XÓA STORY */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[65] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full max-w-sm rounded-2xl bg-[#1A1A1E] border border-white/15 p-6 shadow-2xl space-y-4 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <i className="bi bi-trash3 text-xl"></i>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Xóa Khoảnh Khắc Này?</h3>
              <p className="text-xs text-[#8E8E93] leading-relaxed">
                Story này sẽ được gỡ khỏi Bản đồ 3D ngay lập tức và không thể khôi phục.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all active:scale-95"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition-all active:scale-95 shadow-lg shadow-rose-500/25 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <i className="bi bi-arrow-repeat animate-spin text-sm"></i>
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash3-fill text-xs"></i>
                    <span>Xác nhận xóa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chế độ xem toàn màn hình (Lightbox Fullscreen) */}
      {isFullscreenLightbox && mainImageSrc && (
        <StoryFullscreenLightbox
          imageSrc={mainImageSrc}
          title={actualStory.title}
          filterCss={actualStory.filter_css}
          onClose={() => setIsFullscreenLightbox(false)}
        />
      )}
    </div>
  );
}
