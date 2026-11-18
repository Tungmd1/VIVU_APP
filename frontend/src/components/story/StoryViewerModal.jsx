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
import apiClient from '../../services/apiClient';

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
  const [showPinModal, setShowPinModal] = useState(false);
  const [existingHighlights, setExistingHighlights] = useState([]);
  const [selectedHighlightId, setSelectedHighlightId] = useState('new');
  const [newHighlightTitle, setNewHighlightTitle] = useState('');
  const [isPinning, setIsPinning] = useState(false);
  const [pinToast, setPinToast] = useState('');

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

  // Mở modal Ghim lên Tin Nổi Bật
  const handleOpenPinHighlight = async () => {
    setShowPinModal(true);
    setNewHighlightTitle(actualStory?.title || 'Tin nổi bật');
    if (currentUserId) {
      try {
        const hls = await apiClient.getHighlights(currentUserId);
        if (Array.isArray(hls)) {
          setExistingHighlights(hls);
          if (hls.length > 0) {
            setSelectedHighlightId(hls[0].id);
          } else {
            setSelectedHighlightId('new');
          }
        }
      } catch (e) {
        console.warn('Lỗi đọc highlights:', e);
      }
    }
  };

  // Xác nhận thực hiện ghim story vào highlight
  const handleExecutePin = async () => {
    if (!currentUserId || isPinning) return;
    setIsPinning(true);
    try {
      await apiClient.pinStoryToHighlight(currentUserId, selectedHighlightId, {
        id: actualStory.id,
        title: actualStory.title || 'Khoảnh khắc',
        image: mainImageSrc || actualStory.image,
        video: actualStory.video,
        groupTitle: newHighlightTitle.trim() || 'Tin nổi bật',
        created_at: actualStory.created_at || new Date().toISOString()
      });
      playTactileClickSound();
      setPinToast('Đã ghim Story lên Tin nổi bật!');
      setTimeout(() => {
        setPinToast('');
        setShowPinModal(false);
      }, 1200);
    } catch (err) {
      alert(err.message || 'Lỗi khi ghim story lên tin nổi bật');
    } finally {
      setIsPinning(false);
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
          onOpenPinHighlight={handleOpenPinHighlight}
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

      {/* MODAL GHIM STORY LÊN TIN NỔI BẬT */}
      {showPinModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => !isPinning && setShowPinModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-[#1A1A1E] border border-white/20 p-5 shadow-2xl space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <i className="bi bi-star-fill text-[#10FFA0] text-base" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Ghim Lên Tin Nổi Bật</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs cursor-pointer"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {/* Thumbnail Story đang xem */}
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/15 bg-black">
                {actualStory.video ? (
                  <video src={actualStory.video} className="w-full h-full object-cover" />
                ) : (
                  <img src={mainImageSrc || actualStory.image} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{actualStory.title || 'Khoảnh khắc'}</p>
                <p className="text-[11px] text-[#10FFA0] font-medium">Sẵn sàng ghim lên hồ sơ</p>
              </div>
            </div>

            {/* Danh sách lựa chọn nhóm */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/80 block">
                Chọn nhóm nổi bật:
              </label>

              <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar">
                {/* Lựa chọn tạo nhóm mới */}
                <div
                  onClick={() => setSelectedHighlightId('new')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                    selectedHighlightId === 'new'
                      ? 'bg-[#10FFA0]/10 border-[#10FFA0] text-[#10FFA0]'
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs">
                    <i className="bi bi-plus-lg" />
                  </div>
                  <span className="text-xs font-bold flex-1">+ Tạo nhóm mới</span>
                  {selectedHighlightId === 'new' && <i className="bi bi-check-circle-fill text-sm" />}
                </div>

                {/* Các nhóm hiện có */}
                {existingHighlights.map((hl) => (
                  <div
                    key={hl.id}
                    onClick={() => setSelectedHighlightId(hl.id)}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      selectedHighlightId === hl.id
                        ? 'bg-[#10FFA0]/10 border-[#10FFA0] text-[#10FFA0]'
                        : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-white/15 bg-black shrink-0">
                      <img src={hl.cover_image || hl.coverImage} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-semibold flex-1 truncate">{hl.title}</span>
                    <span className="text-[10px] text-white/50">{hl.stories?.length || 0} mục</span>
                    {selectedHighlightId === hl.id && <i className="bi bi-check-circle-fill text-sm ml-1" />}
                  </div>
                ))}
              </div>

              {/* Nếu chọn tạo nhóm mới -> Hiện ô nhập tên */}
              {selectedHighlightId === 'new' && (
                <div className="pt-1">
                  <label className="text-[11px] text-white/70 block mb-1">Tên nhóm mới:</label>
                  <input
                    type="text"
                    value={newHighlightTitle}
                    onChange={(e) => setNewHighlightTitle(e.target.value)}
                    placeholder="Ví dụ: Kỷ niệm, Du lịch..."
                    maxLength={25}
                    className="w-full py-2 px-3 rounded-xl bg-[#151619] border border-white/15 text-white text-xs outline-none focus:border-[#10FFA0]"
                  />
                </div>
              )}
            </div>

            {/* Nút hành động */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isPinning || (selectedHighlightId === 'new' && !newHighlightTitle.trim())}
                onClick={handleExecutePin}
                className="flex-1 py-2 px-3 rounded-xl bg-[#10FFA0] hover:bg-[#00E5FF] disabled:opacity-40 text-black text-xs font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isPinning ? (
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <i className="bi bi-pin-angle-fill" />
                    <span>Ghim Lên Hồ Sơ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST THÔNG BÁO GHIM THÀNH CÔNG */}
      {pinToast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-[#10FFA0] text-black font-bold text-xs shadow-2xl animate-bounce flex items-center gap-2">
          <i className="bi bi-check-circle-fill text-sm" />
          <span>{pinToast}</span>
        </div>
      )}
    </div>
  );
}
