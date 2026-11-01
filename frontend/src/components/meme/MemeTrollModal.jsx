import React, { useState } from 'react';
import { TRENDING_MEMES } from '../../data/trendingMemes';
import { recordMemeTroll } from '../../utils/personalityAnalytics';

/**
 * MemeTrollModal - Bảng chọn Meme Hot Trend khi giữ giọt nước đối phương 2 giây
 * 100% Bootstrap Icons, 0 unicode emoji
 */
export default function MemeTrollModal({ targetUser, currentUserId, isOpen, onClose, onMemeSent }) {
  const [selectedMeme, setSelectedMeme] = useState(null);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !targetUser) return null;

  const targetName = targetUser.name || targetUser.displayName || 'Bạn bè';
  const targetAvatar = targetUser.avatar || targetUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

  const handleSelectMeme = (meme) => {
    setSelectedMeme(meme);
  };

  const handleSendTroll = () => {
    if (!selectedMeme) return;
    setIsSending(true);

    try {
      // 1. Ghi nhận vào hệ thống phân tích hành vi tính cách (tăng điểm Nhây/Troll)
      recordMemeTroll(currentUserId, targetUser.id, selectedMeme.id);

      // 2. Kêu âm thanh Web Audio Chime vui nhộn
      playTrollSound(selectedMeme.soundType);

      // 3. Callback ra ngoài App để hiển thị thông báo & hiệu ứng
      if (onMemeSent) {
        onMemeSent({
          meme: {
            id: selectedMeme.id,
            name: selectedMeme.name,
            img: selectedMeme.image,
            caption: selectedMeme.reactionText,
            subtext: `Vừa ném trêu ${targetName}!`,
            tag: 'TROLL BẠN BÈ'
          },
          targetUser
        });
      }
    } catch (err) {
      console.error('Lỗi khi ném meme:', err);
    } finally {
      setTimeout(() => {
        setIsSending(false);
        onClose();
      }, 300);
    }
  };

  // Web Audio Synth phát hiệu ứng âm thanh
  const playTrollSound = (type) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'pop' || type === 'fast_tap') {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // Bỏ qua lỗi audio context
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full sm:max-w-lg bg-[#0e111a] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#FF2A85] shadow-md shadow-[#FF2A85]/30">
              <img src={targetAvatar} alt={targetName} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white truncate max-w-[180px]">{targetName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF2A85]/20 text-[#FF2A85] border border-[#FF2A85]/30 font-semibold uppercase">
                  Ấn giữ 2s
                </span>
              </div>
              <p className="text-[11px] text-white/50">Chọn 1 Meme hot trend để ném trêu ngay!</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <i className="bi bi-x-lg text-sm" />
          </button>
        </div>

        {/* Danh sách Meme Lưới 2 Cột */}
        <div className="grid grid-cols-2 gap-3 py-4 overflow-y-auto no-scrollbar flex-1">
          {TRENDING_MEMES.map((meme) => {
            const isSelected = selectedMeme?.id === meme.id;
            return (
              <div
                key={meme.id}
                onClick={() => handleSelectMeme(meme)}
                className={`group relative p-2.5 rounded-2xl cursor-pointer transition-all border flex flex-col items-center text-center ${
                  isSelected
                    ? 'bg-[#FF2A85]/15 border-[#FF2A85] shadow-lg shadow-[#FF2A85]/25 scale-[1.02]'
                    : 'bg-[#151926] border-white/5 hover:border-white/20 hover:bg-[#1a1f30]'
                }`}
              >
                {/* Ảnh GIF Meme */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/40 mb-2 border border-white/10 flex items-center justify-center relative">
                  <img
                    src={meme.image}
                    alt={meme.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#FF2A85] flex items-center justify-center text-white text-xs shadow-md">
                      <i className="bi bi-check-lg" />
                    </div>
                  )}
                </div>

                {/* Tên và Mô tả */}
                <span className="text-xs font-bold text-white line-clamp-1">{meme.name}</span>
                <span className="text-[10px] text-white/60 line-clamp-1 mt-0.5">"{meme.reactionText}"</span>
              </div>
            );
          })}
        </div>

        {/* Footer & Nút Gửi */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
          <div className="text-[11px] text-white/60 flex items-center gap-1.5">
            <i className="bi bi-fire text-[#FF2A85]" />
            <span>Tăng +1 chỉ số Nhây / Hay trêu bạn</span>
          </div>

          <button
            type="button"
            disabled={!selectedMeme || isSending}
            onClick={handleSendTroll}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all flex items-center gap-2 ${
              selectedMeme && !isSending
                ? 'bg-gradient-to-r from-[#FF2A85] to-[#FF529D] text-white shadow-lg shadow-[#FF2A85]/40 hover:scale-[1.02] active:scale-95'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            {isSending ? (
              <>
                <i className="bi bi-arrow-repeat animate-spin text-sm" />
                <span>Đang ném...</span>
              </>
            ) : (
              <>
                <i className="bi bi-send-fill text-sm" />
                <span>Ném Meme Ngay</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

