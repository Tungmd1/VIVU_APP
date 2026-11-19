import React, { useState, useMemo } from 'react';
import { DEFAULT_WHITE_PERSON_AVATAR } from '../../utils/avatarUtils';
import { recordMemeTroll } from '../../utils/personalityAnalytics';
import { 
  TROLL_CATEGORIES, 
  TROLL_ITEMS, 
  getTrollItemsByCategory 
} from './TrollItemCatalog';
import { playTrollSound } from './trollSoundSynth';

/**
 * MemeTrollModal - Bảng Vũ Khí Trêu Bạn Bè Độc Quyền VIVU
 * - Giao diện Bento 3D hiện đại theo Stitch Design Taste
 * - Sử dụng bộ biểu tượng 3D Ultra-HD Microsoft Fluent & Dép tổ ong 3D vàng
 * - 4 Danh mục: Con vật, Đồ vật/Đồ dùng, Cây cối, Meme Hot
 * - 100% Bootstrap Icons (Rule 5) | Tối ưu < 320 dòng (Rule 7)
 * - Tự động phát âm thanh Web Audio Synth khi chạm thử từng món đồ
 */
export default function MemeTrollModal({ targetUser, currentUserId, isOpen, onClose, onMemeSent }) {
  const [activeCategory, setActiveCategory] = useState('animals');
  const [selectedItem, setSelectedItem] = useState(() => TROLL_ITEMS[0]);
  const [customQuote, setCustomQuote] = useState(() => TROLL_ITEMS[0].quotes[0]);
  const [isSending, setIsSending] = useState(false);

  // Lọc danh sách món đồ theo Tab đang chọn
  const categoryItems = useMemo(() => {
    return getTrollItemsByCategory(activeCategory);
  }, [activeCategory]);

  if (!isOpen || !targetUser) return null;

  const targetName = targetUser.name || targetUser.displayName || targetUser.hostName || targetUser.full_name || 'Bạn bè';
  const targetAvatar = targetUser.avatar || targetUser.avatarUrl || targetUser.hostAvatar || DEFAULT_WHITE_PERSON_AVATAR;

  // Khi chọn một vật phẩm mới: Đổi câu thoại mẫu và phát âm thanh thử nghiệm
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    if (item.quotes && item.quotes.length > 0) {
      setCustomQuote(item.quotes[0]);
    }
    playTrollSound(item.soundType);
  };

  const handleSendTroll = () => {
    if (!selectedItem) return;
    setIsSending(true);

    try {
      recordMemeTroll(currentUserId, targetUser.id, selectedItem.id);
      playTrollSound(selectedItem.soundType);

      if (onMemeSent) {
        onMemeSent({
          meme: {
            id: selectedItem.id,
            name: selectedItem.name,
            category: selectedItem.category,
            emotion: selectedItem.emotion,
            soundType: selectedItem.soundType,
            icon: selectedItem.icon,
            color: selectedItem.color,
            particleColor: selectedItem.particleColor,
            badge: selectedItem.badge,
            image3d: selectedItem.image3d,
            previewEmoji: selectedItem.previewEmoji,
            caption: customQuote.trim() || selectedItem.name,
            subtext: `Vừa ném trêu ${targetName}!`,
            isTrollItem: true
          },
          targetUser,
          quote: customQuote.trim() || selectedItem.name
        });
      }
    } catch (err) {
      console.error('[MemeTrollModal] Lỗi khi ném trêu:', err);
    } finally {
      setTimeout(() => {
        setIsSending(false);
        onClose();
      }, 350);
    }
  };

  return (
    <div className="fixed inset-0 z-[115] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none font-sans">
      {/* Vùng bấm mờ bên ngoài để đóng */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative z-10 w-full sm:max-w-md bg-[#0A0B0E]/95 border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl flex flex-col max-h-[92vh] overflow-hidden text-white space-y-3.5 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Thanh gạt nhỏ ở đỉnh cho thao tác vuốt di động */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1 sm:hidden shrink-0" />

        {/* 1. Header Bảng Trêu - Phong cách Zenly */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#FF2A85] shadow-[0_0_16px_rgba(255,42,133,0.45)] shrink-0 bg-neutral-900 flex items-center justify-center">
              <img src={targetAvatar} alt={targetName} className="w-full h-full object-cover" />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10FFA0] border-2 border-[#0A0B0E] animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-white truncate max-w-[160px] tracking-wide">{targetName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FF2A85]/25 to-purple-600/25 text-[#FF529D] border border-[#FF2A85]/40 font-bold uppercase shrink-0 flex items-center gap-1">
                  <i className="bi bi-lightning-charge-fill text-[9px]" />
                  <span>Trêu Bạn</span>
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 truncate">Chọn vũ khí 3D ném rung chuyển màn hình đối phương!</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-neutral-300 hover:text-white transition-all cursor-pointer shrink-0"
            title="Đóng bảng trêu"
          >
            <i className="bi bi-x-lg text-xs" />
          </button>
        </div>

        {/* 2. Thanh 4 Tab Phân Loại (Con vật, Đồ dùng, Cây cối, Meme) */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-black/60 rounded-2xl border border-white/10 shrink-0">
          {TROLL_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  const firstInCat = getTrollItemsByCategory(cat.id)[0];
                  if (firstInCat) handleSelectItem(firstInCat);
                }}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF2A85] to-[#7928CA] text-white shadow-[0_0_15px_rgba(255,42,133,0.45)]'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <i className={`bi ${cat.icon} text-xs`} />
                <span className="truncate text-[10px] sm:text-xs">{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Lưới Các Biểu Tượng 3D Bento Card Trong Tab */}
        <div className="space-y-1.5 overflow-y-auto no-scrollbar pr-0.5 flex-1 max-h-[240px]">
          <div className="grid grid-cols-3 gap-2.5">
            {categoryItems.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              const glowColor = item.particleColor || '#FF2A85';
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all duration-200 border flex flex-col items-center text-center relative group active:scale-95 overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-b from-white/15 to-white/5 border-white/40 shadow-lg ring-2'
                      : 'bg-[#12141A] border-white/10 hover:border-white/25 hover:bg-[#181B22]'
                  }`}
                  style={{
                    borderColor: isSelected ? glowColor : undefined,
                    boxShadow: isSelected ? `0 0 20px ${glowColor}50` : undefined,
                    ringColor: isSelected ? glowColor : undefined
                  }}
                >
                  {/* Ambient Glow nền nhẹ */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-35 transition-opacity"
                    style={{
                      background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 70%)`
                    }}
                  />

                  {/* Icon 3D Ultra-HD */}
                  <div className="relative w-14 h-14 flex items-center justify-center mb-1 group-hover:scale-125 transition-transform duration-300">
                    {item.image3d ? (
                      <img
                        src={item.image3d}
                        alt={item.name}
                        className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
                        loading="lazy"
                      />
                    ) : (
                      <i className={`bi ${item.icon} text-3xl text-white`} />
                    )}
                  </div>

                  <span className="text-[11px] font-bold text-white truncate max-w-full leading-tight z-10">
                    {item.name}
                  </span>

                  <span
                    className="text-[9px] font-bold mt-1 px-1.5 py-0.5 rounded-full z-10 flex items-center gap-1 border"
                    style={{
                      color: glowColor,
                      borderColor: `${glowColor}40`,
                      backgroundColor: `${glowColor}15`
                    }}
                  >
                    <i className={`bi ${item.icon} text-[8px]`} />
                    <span>{item.badge}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Lời Thoại Nhây & Banter Cà Khịa */}
        <div className="space-y-2 shrink-0 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
              <i className="bi bi-chat-quote-fill text-pink-500" />
              <span>Lời Thoại Cà Khịa</span>
            </span>
            <span className="text-[10px] text-pink-400 font-bold">
              {selectedItem?.name || 'Vũ khí'}
            </span>
          </div>

          {/* Dải cuộn nhanh các câu thoại gợi ý */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {selectedItem?.quotes?.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCustomQuote(q)}
                className={`text-[11px] px-3 py-1 rounded-full whitespace-nowrap transition-all border shrink-0 cursor-pointer active:scale-95 ${
                  customQuote === q
                    ? 'bg-white text-black font-black border-white shadow-sm'
                    : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Ô nhập tùy chỉnh lời thoại trêu chọc */}
          <input
            type="text"
            value={customQuote}
            onChange={(e) => setCustomQuote(e.target.value)}
            maxLength={60}
            placeholder="Tự nhập câu cà khịa hài hước..."
            className="w-full px-3.5 py-2 rounded-xl bg-[#12141A] border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 text-white text-xs outline-none font-medium placeholder-white/30"
          />
        </div>

        {/* 5. Nút Ném Vũ Khí Trêu Bạn Bè */}
        <div className="pt-1 shrink-0">
          <button
            type="button"
            onClick={handleSendTroll}
            disabled={isSending || !selectedItem}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF2A85] via-purple-600 to-[#00E5FF] text-white font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(255,42,133,0.6)] hover:opacity-95 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSending ? (
              <>
                <i className="bi bi-arrow-repeat animate-spin text-sm" />
                <span>Đang Bắn Chiêu Thức...</span>
              </>
            ) : (
              <>
                <i className="bi bi-send-fill text-sm animate-bounce" />
                <span>Ném {selectedItem?.name} Trêu {targetName}!</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
