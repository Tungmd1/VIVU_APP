import React, { useState, useEffect } from 'react';
import { storyAudioPlayer, TRENDING_SONGS } from '../../data/trendingSongs';

/**
 * StoryInteractiveModal - Thẻ xem và tương tác Story 3D trực tiếp trên Map
 * Hỗ trợ 5 phản ứng cảm xúc: Tim, Like, Haha, Tức giận, Buồn
 * Tự động phát âm thanh nhạc nền của Story qua Web Audio Player
 * Nút Nhắn tin trực tiếp 1-1 & Nút Kết bạn
 * Chuẩn Resend Dark Monochrome, 100% Bootstrap Icons
 */
function formatRemainingTime(expiresAt) {
  if (!expiresAt) return 'Còn 3 giờ';
  try {
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    if (diffMs <= 0) return 'Sắp hết hạn';
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `Còn ${diffMins} phút`;
    const hours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    if (remainingMins === 0) return `Còn ${hours} giờ`;
    return `Còn ${hours}h ${remainingMins}p`;
  } catch {
    return 'Còn 3 giờ';
  }
}

export default function StoryInteractiveModal({
  story,
  onClose,
  onReact,
  onDirectChat,
  onToggleFriend,
  isFriend = false,
  myReactions = {} // { [storyId]: reactionType }
}) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(true);
  const [activeReactionAnim, setActiveReactionAnim] = useState(null);

  useEffect(() => {
    if (story?.music || story?.songData) {
      const songToPlay = story.songData || TRENDING_SONGS.find(s => 
        story.music?.includes(s.title) || s.title?.includes(story.music)
      ) || { id: 'story-music', title: story.music, bpm: 90, notes: [261.63, 329.63, 392.00, 523.25] };

      storyAudioPlayer.playSong(songToPlay);
      setIsPlayingAudio(true);
    }

    return () => {
      storyAudioPlayer.stop();
    };
  }, [story]);

  if (!story) return null;

  // Danh sách 5 phản ứng cảm xúc (Bootstrap Icons vector)
  const REACTIONS = [
    { type: 'heart', label: 'Yêu thích', icon: 'bi-heart-fill', activeColor: 'text-rose-500' },
    { type: 'like', label: 'Thích', icon: 'bi-hand-thumbs-up-fill', activeColor: 'text-sky-400' },
    { type: 'haha', label: 'Haha', icon: 'bi-emoji-laughing-fill', activeColor: 'text-amber-400' },
    { type: 'angry', label: 'Tức giận', icon: 'bi-fire', activeColor: 'text-orange-500' },
    { type: 'sad', label: 'Buồn', icon: 'bi-cloud-rain-fill', activeColor: 'text-indigo-400' }
  ];

  const currentReaction = myReactions[story.id] || null;

  const handleSelectReaction = (type) => {
    setActiveReactionAnim(type);
    if (onReact) {
      onReact(story.id, type);
    }
    setTimeout(() => setActiveReactionAnim(null), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Background click để đóng */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Card nội dung chính chuẩn Resend 3D Monochrome */}
      <div className="relative z-10 w-full max-w-sm bg-[#0E0E10] border border-white/15 rounded-3xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-white overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-[#8E8E93] hover:text-white transition-all active:scale-90"
        >
          <i className="bi bi-x-lg text-sm"></i>
        </button>

        {/* Thông tin tác giả */}
        <div className="flex items-center gap-3 pr-8">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 p-0.5">
            <img
              src={story.hostAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={story.hostName}
              className="w-full h-full object-cover rounded-full"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border border-black"></span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-white truncate flex items-center gap-1.5">
              <span>{story.hostName || story.title}</span>
              {story.verified && <i className="bi bi-patch-check-fill text-white/90 text-xs"></i>}
            </h3>
            <div className="flex items-center gap-2 text-xs text-[#8E8E93]">
              <span>{story.timeAgo || 'Vừa xong'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <i className="bi bi-geo-alt-fill text-[10px]"></i>
                {story.distanceText || 'Gần đây'}
              </span>
              {story.expires_at && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-400 font-medium">
                    <i className="bi bi-hourglass-split text-[10px]"></i>
                    {formatRemainingTime(story.expires_at)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Ảnh Story nếu có - Object-contain + Blur Background để xem trọn vẹn */}
        {story.image && (
          <div className="mt-4 relative rounded-2xl overflow-hidden border border-white/10 bg-black group flex items-center justify-center min-h-[200px] max-h-[60vh]">
            <img
              src={story.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
            />
            <img
              src={story.image}
              alt="Story"
              className="relative w-auto h-auto max-w-full max-h-[60vh] object-contain group-hover:scale-[1.02] transition-transform duration-500"
            />
            {/* Nhạc nền đính kèm nếu có */}
            {story.music && (
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[11px] text-white flex items-center gap-1.5 shadow">
                <i className="bi bi-music-note-beamed text-white animate-pulse"></i>
                <span className="font-mono truncate max-w-[150px]">{story.music}</span>
              </div>
            )}
          </div>
        )}

        {/* Nhạc nền độc lập nếu không có ảnh */}
        {!story.image && story.music && (
          <div className="mt-3 p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <i className="bi bi-disc-fill text-base animate-spin"></i>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-[#8E8E93] uppercase font-mono">Giai điệu đang nghe</div>
              <div className="text-xs text-white font-medium truncate">{story.music}</div>
            </div>
          </div>
        )}

        {/* Status / Nội dung Story */}
        <div className="mt-3.5 p-3 rounded-2xl bg-white/5 border border-white/5 text-sm text-[#EEEEEE] leading-relaxed">
          {story.description || story.content || story.title}
        </div>

        {/* Khu vực 5 Phản ứng cảm xúc (Reactions) */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-[#8E8E93] mb-2 px-1">
            <span>Bày tỏ cảm xúc:</span>
            {currentReaction && (
              <span className="text-white text-[11px] font-medium flex items-center gap-1">
                <i className={`bi ${REACTIONS.find(r => r.type === currentReaction)?.icon}`}></i>
                <span>Bạn đã tương tác</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-1 bg-[#151619] p-1.5 rounded-2xl border border-white/10">
            {REACTIONS.map((reaction) => {
              const isSelected = currentReaction === reaction.type;
              const isAnimating = activeReactionAnim === reaction.type;
              return (
                <button
                  key={reaction.type}
                  onClick={() => handleSelectReaction(reaction.type)}
                  className={`flex-1 py-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-white/15 scale-105 border border-white/20'
                      : 'hover:bg-white/5 active:scale-95'
                  }`}
                  title={reaction.label}
                >
                  <i
                    className={`bi ${reaction.icon} text-lg transition-transform ${
                      isSelected ? reaction.activeColor : 'text-[#8E8E93]'
                    } ${isAnimating ? 'scale-125' : ''}`}
                  ></i>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2 Nút hành động chính: Nhắn Tin & Kết Bạn */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {/* Nút Nhắn tin trực tiếp */}
          <button
            onClick={() => {
              if (onDirectChat) onDirectChat(story);
              onClose();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-white text-black font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[#F2F2F2] active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            <i className="bi bi-chat-dots-fill text-sm"></i>
            <span>Nhắn tin</span>
          </button>

          {/* Nút Kết bạn */}
          <button
            onClick={() => {
              if (onToggleFriend) onToggleFriend(story);
            }}
            className={`w-full py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all border ${
              isFriend
                ? 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                : 'bg-white/5 text-[#EEEEEE] border-white/10 hover:bg-white/10 active:scale-95'
            }`}
          >
            <i className={`bi ${isFriend ? 'bi-person-check-fill' : 'bi-person-plus-fill'} text-sm`}></i>
            <span>{isFriend ? 'Đã là bạn' : 'Kết bạn'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
