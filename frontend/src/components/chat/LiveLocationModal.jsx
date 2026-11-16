import React, { useState } from 'react';

/**
 * LiveLocationModal - Modal chọn thời gian chia sẻ vị trí trực tiếp
 * Tách module chuẩn Rule 7 (< 450 dòng), 100% Bootstrap Icons (Rule 5)
 */
export default function LiveLocationModal({
  isOpen,
  onClose,
  partnerName = 'bạn bè',
  onConfirmStart
}) {
  const [selectedDuration, setSelectedDuration] = useState(60); // Phút: 15, 60, 480

  if (!isOpen) return null;

  const DURATIONS = [
    { minutes: 15, label: '15 Phút', desc: 'Chia sẻ ngắn' },
    { minutes: 60, label: '1 Giờ', desc: 'Phổ biến nhất' },
    { minutes: 480, label: '8 Giờ', desc: 'Cả ngày dạo phố' }
  ];

  const handleStart = () => {
    onConfirmStart(selectedDuration);
    onClose();
  };

  return (
    <div 
      style={{ zIndex: 99999 }}
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none font-sans"
    >
      <div className="w-full max-w-sm bg-[#11131A] rounded-3xl p-5 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-4 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#00FF66]/15 text-[#00FF66] flex items-center justify-center text-lg border border-[#00FF66]/30">
              <i className="bi bi-broadcast-pin"></i>
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Chia Sẻ Vị Trí Trực Tiếp</h2>
              <p className="text-[11px] text-[#8E8E93]">với {partnerName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#8E8E93] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <i className="bi bi-x-lg text-xs"></i>
          </button>
        </div>

        {/* Mô tả giải thích */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/80 space-y-1.5">
          <div className="flex items-center gap-2 text-[#00E5FF] font-semibold text-[11px]">
            <i className="bi bi-shield-check"></i>
            <span>Bảo Mật Quyền Riêng Tư</span>
          </div>
          <p className="text-[11px] leading-relaxed text-white/70">
            Chỉ người trong cuộc trò chuyện này mới có thể thấy bạn di chuyển trên bản đồ. Bạn có thể chủ động bấm <strong>Dừng chia sẻ</strong> bất cứ lúc nào.
          </p>
        </div>

        {/* Lựa chọn thời gian */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#8E8E93]">Chọn thời gian chia sẻ:</label>
          <div className="grid grid-cols-3 gap-2">
            {DURATIONS.map(d => {
              const isSelected = selectedDuration === d.minutes;
              return (
                <button
                  key={d.minutes}
                  type="button"
                  onClick={() => setSelectedDuration(d.minutes)}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#00FF66]/15 border-[#00FF66] text-white shadow-[0_0_12px_rgba(0,255,102,0.3)]'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{d.label}</div>
                  <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-[#00FF66]' : 'text-white/40'}`}>
                    {d.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Nút hành động */}
        <div className="pt-2 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleStart}
            className="flex-1 py-2.5 rounded-xl bg-[#00FF66] text-black text-xs font-extrabold hover:bg-[#00E65C] active:scale-95 transition-all shadow-[0_0_15px_rgba(0,255,102,0.4)] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <i className="bi bi-geo-alt-fill"></i>
            <span>Bắt Đầu Chia Sẻ</span>
          </button>
        </div>

      </div>
    </div>
  );
}

