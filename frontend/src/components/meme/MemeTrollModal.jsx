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
 * MemeTrollModal - Bảng Vũ Khí Trêu Bạn Bè Độc Quyền VIVU (Instant 1-Tap Minimalist Edition)
 * - Tinh giản tối đa: Xóa sạch ô nhập văn bản, câu thoại cà khịa và nút bấm xác nhận rườm rà
 * - Cơ chế 1 Chạm Tức Thì (Instant 1-Tap): Ấn vào bất kỳ icon 3D nào là lập tức bắn chiêu thức và đóng bảng
 * - Bộ biểu tượng 3D Ultra-HD Microsoft Fluent & Dép tổ ong 3D vàng độc quyền
 * - 100% Bootstrap Icons (Rule 5) | Tối ưu < 200 dòng (Rule 7)
 */
export default function MemeTrollModal({ targetUser, currentUserId, isOpen, onClose, onMemeSent }) {
  const [activeCategory, setActiveCategory] = useState('stickers');

  // Lọc danh sách món đồ theo Tab đang chọn
  const categoryItems = useMemo(() => {
    return getTrollItemsByCategory(activeCategory);
  }, [activeCategory]);

  if (!isOpen || !targetUser) return null;

  const targetName = targetUser.name || targetUser.displayName || targetUser.hostName || targetUser.full_name || 'Bạn bè';
  const targetAvatar = targetUser.avatar || targetUser.avatarUrl || targetUser.hostAvatar || DEFAULT_WHITE_PERSON_AVATAR;

  // CHẠM 1 CHẠM TỨC THÌ: Bắn chiêu thức ngay & đóng bảng chọn trong chớp mắt
  const handleInstantSend = (item) => {
    try {
      if (navigator?.vibrate) {
        navigator.vibrate([45]);
      }
    } catch (_) {}

    // 1. Phát âm thanh Web Audio Synth tương ứng
    playTrollSound(item.soundType);

    // 2. Ghi nhận phân tích hành vi
    recordMemeTroll(currentUserId, targetUser.id, item.id);

    // 3. Bắn payload trêu chọc sang đối phương
    if (onMemeSent) {
      onMemeSent({
        meme: {
          id: item.id,
          name: item.name,
          category: item.category,
          emotion: item.emotion,
          soundType: item.soundType,
          icon: item.icon,
          color: item.color,
          particleColor: item.particleColor,
          badge: item.badge,
          image3d: item.image3d,
          previewIcon: item.previewIcon || item.icon,
          caption: `Vừa ném ${item.name}!`,
          subtext: `Vừa ném trêu ${targetName}!`,
          isTrollItem: true
        },
        targetUser,
        quote: `Vừa ném ${item.name}!`
      });
    }

    // 4. Đóng bảng chọn ngay lập tức
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[115] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 select-none font-sans">
      {/* Vùng bấm mờ bên ngoài để đóng */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative z-10 w-full sm:max-w-md bg-[#0A0B0E]/95 border border-white/15 rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_25px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl flex flex-col max-h-[85vh] overflow-hidden text-white space-y-3 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Thanh gạt nhỏ ở đỉnh cho thao tác vuốt di động */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1 sm:hidden shrink-0" />

        {/* 1. Header Tinh Giản: Avatar bạn bè + Nhãn Trêu Bạn + Nút đóng nhanh */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#FF2A85] shadow-[0_0_12px_rgba(255,42,133,0.4)] shrink-0 bg-neutral-900 flex items-center justify-center">
              <img src={targetAvatar} alt={targetName} className="w-full h-full object-cover" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10FFA0] border-2 border-[#0A0B0E] animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-white truncate max-w-[150px] tracking-wide">{targetName}</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FF2A85]/25 to-purple-600/25 text-[#FF529D] border border-[#FF2A85]/40 font-bold uppercase shrink-0 flex items-center gap-1">
                  <i className="bi bi-lightning-charge-fill text-[8px]" />
                  <span>Chạm là bắn</span>
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 truncate">Chạm 1 chạm vào bất kỳ icon nào để ném ngay!</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-neutral-300 hover:text-white transition-all cursor-pointer shrink-0"
            title="Đóng bảng trêu"
          >
            <i className="bi bi-x-lg text-xs" />
          </button>
        </div>

        {/* 2. Thanh 4 Tab Phân Loại (Con vật, Đồ dùng, Cây cối, Meme) */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-black/60 rounded-2xl border border-white/10 shrink-0">
          {TROLL_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`py-1.5 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF2A85] to-[#7928CA] text-white shadow-[0_0_12px_rgba(255,42,133,0.45)]'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <i className={`bi ${cat.icon} text-xs`} />
                <span className="truncate text-[10px] sm:text-xs">{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Lưới Các Biểu Tượng 3D Bento Card (Chạm 1 chạm để bắn tức thì) */}
        <div className="space-y-1 overflow-y-auto no-scrollbar pr-0.5 flex-1 max-h-[340px]">
          <div className="grid grid-cols-3 gap-2.5 py-1">
            {categoryItems.map((item) => {
              const glowColor = item.particleColor || '#FF2A85';
              return (
                <div
                  key={item.id}
                  onClick={() => handleInstantSend(item)}
                  className="p-3 rounded-2xl cursor-pointer transition-all duration-200 border bg-[#12141A] border-white/10 hover:border-white/30 hover:bg-[#181B22] flex flex-col items-center text-center relative group active:scale-90 overflow-hidden shadow-sm"
                  style={{
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                  }}
                >
                  {/* Ambient Glow nền nhẹ khi hover */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-35 transition-opacity"
                    style={{
                      background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 70%)`
                    }}
                  />

                  {/* Icon 3D Ultra-HD bóng bẩy */}
                  <div className="relative w-14 h-14 flex items-center justify-center mb-1.5 group-hover:scale-125 transition-transform duration-200">
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

                  {/* Tên vật phẩm */}
                  <span className="text-[11px] font-bold text-white truncate max-w-full leading-tight z-10">
                    {item.name}
                  </span>

                  {/* Huy hiệu mini */}
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

      </div>
    </div>
  );
}
