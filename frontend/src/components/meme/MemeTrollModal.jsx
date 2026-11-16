import React, { useState, useMemo } from 'react';
import { DEFAULT_WHITE_PERSON_AVATAR } from '../../utils/avatarUtils';
import { recordMemeTroll } from '../../utils/personalityAnalytics';
import { 
  CHIBI_MASCOT_FAMILIES, 
  CHIBI_MASCOTS, 
  getChibiDataUrl, 
  playChibiSound 
} from '../../data/chibiMascotData';

const QUICK_CHIBI_QUOTES = [
  'Lêu lêu đồ con gà!',
  'Alo bạn êi, đứng im đó coi!',
  'Đói meo mốc mỏ rồi nè!',
  'Tức nước vỡ bờ rồi đấy nha!',
  'Lười quá hổng thèm rep!',
  'Ngủ một giấc tới mai luôn!',
  'Thả cho trái tim bự chảng nè!',
  'Hú hồn chưa bà dà!',
  'Cool ngầu thế này ai đọ lại?',
  'Flex nhẹ bữa nay bao tất!'
];

/**
 * MemeTrollModal - Vũ Trụ Chibi Mascot Trêu Chọc & Lời Thoại Nhây VIVU
 * - 36 Biểu cảm Chibi độc bản (Giọt Nước VIVU, Thú Cưng Meme, Bạn Trẻ Anime)
 * - 100% Bootstrap Icons (Rule 5), Rule 7 (< 450 dòng)
 * - Tích hợp Web Audio Synth âm thanh chân thực theo 12 sắc thái biểu cảm
 */
export default function MemeTrollModal({ targetUser, currentUserId, isOpen, onClose, onMemeSent }) {
  const [activeFamily, setActiveFamily] = useState('droplet');
  const [selectedMascot, setSelectedMascot] = useState(CHIBI_MASCOTS[0]);
  const [customQuote, setCustomQuote] = useState(QUICK_CHIBI_QUOTES[0]);
  const [isSending, setIsSending] = useState(false);

  const familyMascots = useMemo(() => {
    return CHIBI_MASCOTS.filter(m => m.family === activeFamily);
  }, [activeFamily]);

  if (!isOpen || !targetUser) return null;

  const targetName = targetUser.name || targetUser.displayName || targetUser.hostName || 'Bạn bè';
  const targetAvatar = targetUser.avatar || targetUser.avatarUrl || targetUser.hostAvatar || DEFAULT_WHITE_PERSON_AVATAR;

  const handleSelectMascot = (mascot) => {
    setSelectedMascot(mascot);
    playChibiSound(mascot.soundType);
  };

  const handleSendTroll = () => {
    if (!selectedMascot) return;
    setIsSending(true);

    try {
      recordMemeTroll(currentUserId, targetUser.id, selectedMascot.id);
      playChibiSound(selectedMascot.soundType);

      if (onMemeSent) {
        onMemeSent({
          meme: {
            id: selectedMascot.id,
            name: selectedMascot.name,
            emotion: selectedMascot.emotion,
            soundType: selectedMascot.soundType,
            chibiDataUrl: getChibiDataUrl(selectedMascot),
            caption: customQuote.trim() || selectedMascot.description,
            subtext: `Vừa ném trêu ${targetName}!`,
            badge: selectedMascot.emotion,
            isChibi: true
          },
          targetUser,
          quote: customQuote.trim() || selectedMascot.description
        });
      }
    } catch (err) {
      console.error('Lỗi khi ném Chibi troll:', err);
    } finally {
      setTimeout(() => {
        setIsSending(false);
        onClose();
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none font-sans">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative z-10 w-full sm:max-w-md bg-[#0E0E10] border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col max-h-[92vh] overflow-hidden text-white space-y-3.5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1 sm:hidden shrink-0" />

        {/* 1. Header Bảng Trêu */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#FF2A85] shadow-[0_0_15px_rgba(255,42,133,0.4)] shrink-0 bg-white flex items-center justify-center">
              <img src={targetAvatar} alt={targetName} className="w-full h-full object-cover" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00E5FF] border-2 border-[#0E0E10]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white truncate max-w-[170px]">{targetName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF2A85]/20 text-[#FF2A85] border border-[#FF2A85]/30 font-bold uppercase shrink-0">
                  Trêu Chibi
                </span>
              </div>
              <p className="text-[11px] text-[#8E8E93] truncate">Chọn biểu cảm Chibi ném bùng nổ màn hình</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors cursor-pointer shrink-0"
            title="Đóng bảng trêu"
          >
            <i className="bi bi-x-lg text-xs" />
          </button>
        </div>

        {/* 2. Thanh 3 Tab Bộ Sưu Tập Chibi */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/60 rounded-2xl border border-white/10 shrink-0">
          {CHIBI_MASCOT_FAMILIES.map((fam) => {
            const isActive = activeFamily === fam.id;
            return (
              <button
                key={fam.id}
                type="button"
                onClick={() => setActiveFamily(fam.id)}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF2A85] to-[#7928CA] text-white shadow-md'
                    : 'text-[#8E8E93] hover:text-white hover:bg-white/5'
                }`}
              >
                <i className={`bi ${fam.icon} text-xs`}></i>
                <span className="truncate">{fam.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Lưới 12 Biểu Cảm Chibi của Tab Hiện Tại */}
        <div className="space-y-1.5 overflow-y-auto no-scrollbar pr-0.5 flex-1 max-h-[220px]">
          <div className="grid grid-cols-3 gap-2">
            {familyMascots.map((mascot) => {
              const isSelected = selectedMascot?.id === mascot.id;
              const dataUrl = getChibiDataUrl(mascot);
              return (
                <div
                  key={mascot.id}
                  onClick={() => handleSelectMascot(mascot)}
                  className={`p-2 rounded-2xl cursor-pointer transition-all border flex flex-col items-center text-center relative group active:scale-95 ${
                    isSelected
                      ? 'bg-white/15 border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.35)] ring-1 ring-cyan-400'
                      : 'bg-[#151619] border-white/10 hover:border-white/25 hover:bg-[#1A1A1E]'
                  }`}
                >
                  <div className="w-12 h-12 flex items-center justify-center mb-1 group-hover:scale-115 transition-transform">
                    <img src={dataUrl} alt={mascot.name} className="w-full h-full object-contain pointer-events-none" />
                  </div>
                  <span className="text-[10px] font-bold text-white truncate max-w-full leading-tight">
                    {mascot.name}
                  </span>
                  <span className="text-[9px] text-[#8E8E93] font-mono mt-0.5">
                    {mascot.emotion}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Lời Thoại Nhây */}
        <div className="space-y-2 shrink-0 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">
              Lời Thoại Nhây
            </span>
            <span className="text-[10px] text-pink-400 font-bold">
              {selectedMascot?.name || 'Chibi'}
            </span>
          </div>

          {/* Dải cuộn các câu thoại mẫu */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {QUICK_CHIBI_QUOTES.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCustomQuote(q)}
                className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                  customQuote === q
                    ? 'bg-white text-black font-bold border-white shadow-sm'
                    : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={customQuote}
            onChange={(e) => setCustomQuote(e.target.value)}
            maxLength={60}
            placeholder="Tự nhập câu thoại trêu người ta..."
            className="w-full px-3.5 py-2 rounded-xl bg-[#151619] border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 text-white text-xs outline-none font-medium placeholder-white/30"
          />
        </div>

        {/* 5. Nút Bắn Vũ Khí */}
        <div className="pt-1 shrink-0">
          <button
            type="button"
            onClick={handleSendTroll}
            disabled={isSending || !selectedMascot}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF2A85] via-purple-600 to-[#00E5FF] text-white font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(255,42,133,0.6)] hover:opacity-95 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSending ? (
              <>
                <i className="bi bi-arrow-repeat animate-spin text-sm" />
                <span>Đang Bắn Chiêu Thức...</span>
              </>
            ) : (
              <>
                <i className="bi bi-send-fill text-sm" />
                <span>Ném Chibi Trêu {targetName}!</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
