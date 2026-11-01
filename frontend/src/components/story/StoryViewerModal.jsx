import React, { useState, useEffect, useRef } from 'react';
import StoryFloatingReactions from './viewer/StoryFloatingReactions';
import StoryInteractiveLayer from './viewer/StoryInteractiveLayer';
import StoryMiniMapRadar from './viewer/StoryMiniMapRadar';
import DualCameraOverlay from './camera/DualCameraOverlay';
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
  onClose,
  onOpenStoryChat,
  onVotePoll,
  onReplyQA,
  onReact,
  userLat,
  userLng,
  currentUserId
}) {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseBadge, setShowPauseBadge] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [dualSwapped, setDualSwapped] = useState(false);

  const durationMs = 7000; // 7s auto progress

  // Luôn reset tiến trình về 0s khi mở hoặc đổi story mới
  useEffect(() => {
    if (story) {
      setProgress(0);
      setIsPaused(false);
    }
  }, [story?.id]);

  // Quản lý phát nhạc của Story
  useEffect(() => {
    if (!story) return;
    const actual = story.activeStory || story;

    if (actual.music && actual.music.audio_url) {
      storyAudioPlayer.playSong(actual.music);
      setIsPlayingMusic(true);
    }

    return () => {
      storyAudioPlayer.stop();
      setIsPlayingMusic(false);
    };
  }, [story]);

  // Quản lý Progress Bar tự chạy (chỉ chạy khi KHÔNG tạm dừng)
  useEffect(() => {
    if (!story || isPaused) return;

    const intervalTime = 50;
    const step = (intervalTime / durationMs) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          onClose();
          return 100;
        }
        return Math.min(100, prev + step);
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [story?.id, isPaused]);

  if (!story) return null;

  // Chạm vào ảnh/màn hình để Bật/Tắt Tạm Dừng
  const handleTapStory = (e) => {
    // Bỏ qua nếu chạm vào controls, buttons, form inputs
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('form') || e.target.closest('.interactive-clickable')) {
      return;
    }
    e.stopPropagation();
    playTactileClickSound();
    setIsPaused(prev => !prev);
    setShowPauseBadge(true);
    setTimeout(() => setShowPauseBadge(false), 900);
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    playTactileClickSound();
    if (onOpenStoryChat) {
      onOpenStoryChat(story, replyText.trim());
    }
    setReplyText('');
    onClose();
  };

  const handleToggleMusic = (e) => {
    e.stopPropagation();
    if (!story.music) return;
    if (isPlayingMusic) {
      storyAudioPlayer.stop();
      setIsPlayingMusic(false);
    } else {
      storyAudioPlayer.playSong(story.music);
      setIsPlayingMusic(true);
    }
  };

  const actualStory = story.activeStory || story;
  const remainingTime = formatRemainingTime(actualStory.expires_at || actualStory.expiresAt);

  // Xử lý ảnh chính / ảnh phụ nếu là Dual Camera
  const mainImageSrc = dualSwapped
    ? (actualStory.dual_image || actualStory.dualImage)
    : (actualStory.image || actualStory.memeImage || actualStory.dual_image);
  const secondaryImageSrc = dualSwapped
    ? (actualStory.image || actualStory.memeImage)
    : (actualStory.dual_image || actualStory.dualImage);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden animate-fadeIn">
      {/* Vùng nền ảnh full màn hình / immersion */}
      <div
        onClick={handleTapStory}
        className="relative w-full h-full max-w-lg md:max-w-2xl bg-[#0A0A0C] flex items-center justify-center overflow-hidden shadow-2xl cursor-pointer"
      >
        {/* Chỉ báo Tạm dừng / Tiếp tục khi chạm vào ảnh */}
        {(isPaused || showPauseBadge) && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/25 text-white text-xs font-bold flex items-center gap-2 shadow-2xl pointer-events-none transition-all">
            <i className={`bi ${isPaused ? 'bi-pause-circle-fill text-amber-400' : 'bi-play-circle-fill text-teal-400'} text-base`}></i>
            <span>{isPaused ? 'ĐÃ TẠM DỪNG (Chạm để tiếp tục)' : 'TIẾP TỤC CHẠY'}</span>
          </div>
        )}

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
              className="relative w-full h-full object-contain md:object-cover"
              style={{ filter: actualStory.filter_css || 'none' }}
            />
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

        {/* Dải tiến trình thời gian (Progress Bar) */}
        <div className="absolute top-0 left-0 right-0 z-40 p-3 pt-safe bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Header: Avatar, Tên, Cự ly, Nhạc, Nút Đóng */}
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
                    {actualStory.user_code || actualStory.userCode || 'VU'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-white/70">
                  <i className="bi bi-clock-history text-amber-400"></i>
                  <span>{remainingTime}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Nút đĩa nhạc quay nếu có */}
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

              {/* Nút Tạm Dừng / Tiếp Tục */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playTactileClickSound();
                  setIsPaused(prev => !prev);
                  setShowPauseBadge(true);
                  setTimeout(() => setShowPauseBadge(false), 900);
                }}
                className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all cursor-pointer ${
                  isPaused ? 'bg-amber-400 text-black shadow-lg scale-105' : 'bg-black/50 text-white hover:bg-black/70'
                }`}
                title={isPaused ? "Tiếp tục chạy" : "Tạm dừng xem"}
              >
                <i className={`bi ${isPaused ? 'bi-play-fill text-base' : 'bi-pause-fill text-sm'}`}></i>
              </button>

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
          {/* Mini Map Radar widget */}
          <div className="flex items-center justify-between">
            <StoryMiniMapRadar
              storyLat={actualStory.lat || actualStory.latitude}
              storyLng={actualStory.lng || actualStory.longitude}
              userLat={userLat}
              userLng={userLng}
              address={actualStory.address}
            />

            {/* Dải nút cảm xúc nổi */}
            <StoryFloatingReactions
              onReact={(rxId) => {
                if (onReact) onReact(actualStory.id, rxId);
              }}
            />
          </div>

          {/* Ô nhập gửi tin nhắn reply vào chat 1-1 */}
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
    </div>
  );
}
