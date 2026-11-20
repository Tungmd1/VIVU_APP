import React, { useState } from 'react';
import { DEFAULT_WHITE_PERSON_AVATAR } from '../../utils/avatarUtils';
import { 
  MASCOT_FAMILIES, 
  MASCOT_ACTIONS, 
  getMascotActionDataUrl, 
  playActionSound 
} from '../../data/messengerZaloMascotData';

const SKIN_OPTIONS = [
  { id: 'auto', name: 'Tự Động Thông Minh', desc: 'Tự đổi theo Story, Chibi & Hoạt động', icon: 'bi-magic' },
  { id: 'zenly_3d', name: 'Zenly 3D Tự Do', desc: 'Đứng thẳng trên mặt đất, 0 chóp nhọn', icon: 'bi-person-walking' },
  { id: 'aura_circle', name: 'Vòng Tròn Aura', desc: 'Hào quang neon xung nhịp kép hiện đại', icon: 'bi-circle-half' },
  { id: 'polaroid', name: 'Thẻ Polaroid', desc: 'Khung ảnh chụp film nghệ thuật', icon: 'bi-card-image' },
  { id: 'classic_teardrop', name: 'Giọt Nước Cổ Điển', desc: 'Ghim giọt nước kinh điển có chóp nhọn', icon: 'bi-geo-alt-fill' }
];

/**
 * PinWardrobeModal - Tủ Đồ Ghim Bản Đồ & Bộ Chibi FB/Zalo Đa Hành Động
 * - 100% Bootstrap Icons (Rule 5), Rule 7 (< 400 dòng)
 * - Cho phép xem trước 3D tương tác, đổi skin khung ghim và chọn nhân vật/hành động
 */
export default function PinWardrobeModal({
  isOpen,
  onClose,
  currentPinSkin = 'auto',
  currentMascot = 'ami_fat_cat',
  currentAction = 'scooter',
  userAvatar = '',
  userName = 'BẠN',
  onSavePinConfig
}) {
  const [selectedSkin, setSelectedSkin] = useState(currentPinSkin || 'auto');
  const [selectedFamily, setSelectedFamily] = useState(currentMascot || 'ami_fat_cat');
  const [selectedAction, setSelectedAction] = useState(currentAction || 'scooter');
  const [isEquippedMascot, setIsEquippedMascot] = useState(Boolean(currentMascot && currentAction));

  // Đồng bộ lại diện mạo ghim & mascot mới nhất mỗi khi mở lại modal
  React.useEffect(() => {
    if (isOpen) {
      setSelectedSkin(currentPinSkin || 'auto');
      setSelectedFamily(currentMascot || 'ami_fat_cat');
      setSelectedAction(currentAction || 'scooter');
      setIsEquippedMascot(Boolean(currentMascot && currentAction));
    }
  }, [isOpen, currentPinSkin, currentMascot, currentAction]);

  if (!isOpen) return null;

  const previewActionUrl = getMascotActionDataUrl(selectedFamily, selectedAction);

  const handleSelectAction = (act) => {
    setSelectedAction(act.id);
    setIsEquippedMascot(true);
    playActionSound(act.sound);
  };

  const handleClearMascot = () => {
    setIsEquippedMascot(false);
  };

  const handleApply = () => {
    if (onSavePinConfig) {
      onSavePinConfig({
        pinSkin: selectedSkin,
        pinMascot: isEquippedMascot ? selectedFamily : null,
        pinAction: isEquippedMascot ? selectedAction : null
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none font-sans">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative z-10 w-full sm:max-w-lg bg-[#0E0E10] border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col max-h-[92vh] overflow-hidden text-white space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1 sm:hidden shrink-0" />

        {/* 1. Header Tủ Đồ Ghim */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FF2A85] to-[#00E5FF] flex items-center justify-center text-white shadow-md">
              <i className="bi bi-palette2 text-base"></i>
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Tủ Đồ Ghim Bản Đồ</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-400/30">
                  Zenly 3D
                </span>
              </h3>
              <p className="text-[11px] text-[#8E8E93]">Tùy biến diện mạo ghim của Bạn &amp; Bạn bè trên bản đồ</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng tủ ghim hồ sơ"
            title="Đóng"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
          >
            <i className="bi bi-x-lg text-xs" />
          </button>
        </div>

        {/* 2. KHUNG PREVIEW TƯƠNG TÁC 3D (Interactive Pin Preview) */}
        <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-gradient-to-b from-[#151926] to-[#0A0D14] border border-white/15 flex flex-col items-center justify-center shrink-0 shadow-inner group">
          {/* Lưới tọa độ bản đồ mini giả lập */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#00E5FF_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <div className="relative flex flex-col items-center">
            {isEquippedMascot ? (
              <div className="relative w-20 h-20 flex items-center justify-center animate-chibi-float cursor-pointer hover:scale-110 active:scale-95 transition-transform" onClick={() => playActionSound(selectedAction)}>
                <img src={previewActionUrl} alt="Preview" className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]" />
                <div className="absolute -bottom-1 w-14 h-2.5 rounded-full bg-black/50 blur-[2px] pointer-events-none"></div>
              </div>
            ) : (
              <div className="relative flex flex-col items-center">
                <div className="w-14 h-14 rounded-full p-[2.5px] bg-gradient-to-tr from-[#00E5FF] via-purple-500 to-[#FF2A85] shadow-[0_0_20px_rgba(0,229,255,0.7)] flex items-center justify-center">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                    <img src={userAvatar || DEFAULT_WHITE_PERSON_AVATAR} alt={userName} className="w-full h-full object-cover" />
                  </div>
                </div>
                {selectedSkin === 'classic_teardrop' ? (
                  <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-white -mt-0.5 filter drop-shadow-[0_2px_4px_rgba(0,229,255,0.4)]"></div>
                ) : (
                  <div className="w-10 h-2 rounded-full bg-black/45 blur-[1.5px] mt-1"></div>
                )}
              </div>
            )}
            <span className="text-[10px] font-bold text-white/80 mt-1 bg-black/60 px-2.5 py-0.5 rounded-full border border-white/10 backdrop-blur-md">
              {isEquippedMascot ? `${MASCOT_FAMILIES.find(f => f.id === selectedFamily)?.name} đang ${MASCOT_ACTIONS.find(a => a.id === selectedAction)?.label}` : userName}
            </span>
          </div>

          <div className="absolute bottom-2 right-2 text-[9px] text-cyan-300 font-mono bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-500/30">
            Skin: {SKIN_OPTIONS.find(s => s.id === selectedSkin)?.name}
          </div>
        </div>

        {/* 3. NỘI DUNG CUỘN CHỌN TỦ ĐỒ */}
        <div className="space-y-4 overflow-y-auto no-scrollbar pr-0.5 flex-1">
          {/* MỤC A: KIỂU DÁNG KHUNG GHIM (PIN SKIN) */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider block">
              1. Kiểu Dáng Khung Ghim Trên Bản Đồ
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SKIN_OPTIONS.map((skin) => {
                const isSelected = selectedSkin === skin.id;
                return (
                  <button
                    key={skin.id}
                    type="button"
                    onClick={() => setSelectedSkin(skin.id)}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-gradient-to-b from-white/15 to-white/5 border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.3)] ring-1 ring-cyan-400'
                        : 'bg-[#151619] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <i className={`bi ${skin.icon} text-base ${isSelected ? 'text-cyan-400' : 'text-white/60'}`}></i>
                      {isSelected && <i className="bi bi-check-circle-fill text-cyan-400 text-xs"></i>}
                    </div>
                    <div className="text-xs font-bold text-white leading-tight">{skin.name}</div>
                    <div className="text-[9px] text-[#8E8E93] mt-0.5 truncate">{skin.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MỤC B: BỘ CHIBI FB MESSENGER & ZALO */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">
                2. Nhân Vật Chibi Bản Đồ
              </span>
              {isEquippedMascot && (
                <button
                  type="button"
                  onClick={handleClearMascot}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <i className="bi bi-x-circle-fill"></i>
                  <span>Gỡ bỏ Chibi (dùng Avatar)</span>
                </button>
              )}
            </div>

            {/* 4 Tab Nhân Vật */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MASCOT_FAMILIES.map((fam) => {
                const isSelected = isEquippedMascot && selectedFamily === fam.id;
                return (
                  <button
                    key={fam.id}
                    type="button"
                    onClick={() => {
                      setSelectedFamily(fam.id);
                      setIsEquippedMascot(true);
                      playActionSound(selectedAction);
                    }}
                    className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#FF2A85]/20 to-[#7928CA]/20 border-[#FF2A85] shadow-[0_0_15px_rgba(255,42,133,0.35)] ring-1 ring-[#FF2A85]'
                        : 'bg-[#151619] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-base" style={{ color: fam.accent }}>
                      <i className={`bi ${fam.icon}`}></i>
                    </div>
                    <span className="text-xs font-bold text-white truncate max-w-full">{fam.name}</span>
                    <span className="text-[9px] text-[#8E8E93] font-mono">{fam.origin}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MỤC C: 7 HÀNH ĐỘNG ĐỜI THƯỜNG ĐẶC SẮC */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider block">
              3. Hành Động Đang Làm (Chạm để nghe âm thanh)
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MASCOT_ACTIONS.map((act) => {
                const isSelected = isEquippedMascot && selectedAction === act.id;
                const actUrl = getMascotActionDataUrl(selectedFamily, act.id);
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => handleSelectAction(act)}
                    className={`p-2 rounded-2xl border flex items-center gap-2.5 transition-all cursor-pointer active:scale-95 text-left ${
                      isSelected
                        ? 'bg-white/15 border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.35)] ring-1 ring-cyan-400'
                        : 'bg-[#151619] border-white/10 hover:border-white/25 hover:bg-[#1A1A1E]'
                    }`}
                  >
                    <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                      <img src={actUrl} alt={act.label} className="w-full h-full object-contain pointer-events-none" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{act.label}</div>
                      <span className="text-[9px] text-cyan-300 font-mono flex items-center gap-1">
                        <i className="bi bi-volume-up-fill text-[9px]"></i>
                        <span>Nghe thử</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Footer Nút Áp Dụng */}
        <div className="pt-2 border-t border-white/10 shrink-0 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#FF2A85] via-purple-600 to-[#00E5FF] text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,42,133,0.5)] hover:opacity-95 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <i className="bi bi-check2-circle text-base"></i>
            <span>Lưu &amp; Cắm Lên Bản Đồ Ngay</span>
          </button>
        </div>

      </div>
    </div>
  );
}

