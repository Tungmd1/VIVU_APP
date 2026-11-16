import { DEFAULT_WHITE_PERSON_AVATAR } from '../../utils/avatarUtils';
import React, { useState, useEffect, useMemo } from 'react';
import StoryFloatingReactions from './viewer/StoryFloatingReactions';
import StoryInteractiveLayer from './viewer/StoryInteractiveLayer';
import StoryMiniMapRadar from './viewer/StoryMiniMapRadar';
import DualCameraOverlay from './camera/DualCameraOverlay';
import StoryFullscreenLightbox from './viewer/StoryFullscreenLightbox';
import StoryDeleteConfirmDialog from './viewer/StoryDeleteConfirmDialog';
import StoryHeaderBar from './viewer/StoryHeaderBar';
import { storyAudioPlayer, resolveSongMetadata } from '../../data/trendingSongs';
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
  onOpenUserProfile,
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

  // Chuẩn hóa bài hát gắn kèm Story (Tự động fallback bài hát thịnh hành nếu Story chưa chọn nhạc)
  const resolvedStoryMusic = useMemo(() => {
    if (!actualStory) return null;
    const song = actualStory.music || actualStory.song || actualStory.custom_song || actualStory.customSong || actualStory.host_custom_song || actualStory.hostCustomSong;
    return resolveSongMetadata(song);
  }, [actualStory]);

  // Quản lý phát nhạc của Story hiện tại: Khi mở Story sẽ tự động phát nhạc Apple Music
  useEffect(() => {
    if (!actualStory || !resolvedStoryMusic) return;

    storyAudioPlayer.playSong(resolvedStoryMusic, { loop: true });
    setIsPlayingMusic(true);

    return () => {
      storyAudioPlayer.stop();
      setIsPlayingMusic(false);
    };
  }, [actualStory?.id, currentIndex, resolvedStoryMusic]);

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

  // Xác nhận Xóa Story (Hỗ trợ 2 chế độ: Chỉ gỡ khỏi Bản đồ hoặc Xóa vĩnh viễn)
  const handleConfirmDelete = async ({ preserveInArchive = false } = {}) => {
    if (!onDeleteStory || isDeleting) return;
    setIsDeleting(true);
    playTactileClickSound();
    try {
      await onDeleteStory(actualStory, { preserveInArchive });
      const targetId = actualStory.id || rawStory?.id;
      const remainingStories = activeList.filter(s => {
        const sId = s.id || s.activeStory?.id;
        return sId !== targetId && s.id !== actualStory.id;
      });
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
    if (!resolvedStoryMusic) return;
    if (isPlayingMusic) {
      storyAudioPlayer.stop();
      setIsPlayingMusic(false);
    } else {
      storyAudioPlayer.playSong(resolvedStoryMusic, { loop: true });
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
        <StoryHeaderBar
          activeList={activeList}
          currentIndex={currentIndex}
          actualStory={actualStory}
          remainingTime={remainingTime}
          resolvedStoryMusic={resolvedStoryMusic}
          isPlayingMusic={isPlayingMusic}
          onToggleMusic={handleToggleMusic}
          isOwner={isOwner}
          onOpenDeleteConfirm={() => setShowDeleteConfirm(true)}
          mainImageSrc={mainImageSrc}
          onOpenFullscreen={() => setIsFullscreenLightbox(true)}
          onClose={onClose}
          onOpenUserProfile={onOpenUserProfile}
        />

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

      {/* POPUP XÁC NHẬN XÓA STORY (2 LỰA CHỌN THÔNG MINH) */}
      <StoryDeleteConfirmDialog
        isOpen={showDeleteConfirm}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setShowDeleteConfirm(false)}
      />

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
