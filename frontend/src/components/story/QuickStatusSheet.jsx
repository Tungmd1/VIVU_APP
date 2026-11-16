import { DEFAULT_WHITE_PERSON_AVATAR } from '../../utils/avatarUtils';
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import MusicPickerModal from './MusicPickerModal';
import { storyAudioPlayer } from '../../data/trendingSongs';
import { playTactileClickSound } from './storyAudioEffects';
import {
  CHIBI_MASCOT_FAMILIES,
  CHIBI_MASCOTS,
  getChibiMascotById,
  getChibiDataUrl,
  playChibiSound
} from '../../data/chibiMascotData';

/**
 * QuickStatusSheet - Cập Nhật Trạng Thái Suy Nghĩ & Biểu Cảm Chibi VIVU
 * - 3 Gia tộc Chibi: Bé Giọt Nước VIVU, Thú Cưng Meme, Bạn Trẻ Anime
 * - 12 Sắc thái cảm xúc: Trêu chọc, Tức giận, Vui sướng, Đói bụng, Mệt mỏi, Lười biếng, Buồn ngủ, Đang yêu...
 * - Nhập suy nghĩ tự do (không áp đặt câu nói)
 * - Gắn bài hát online Apple Music
 * - 100% Bootstrap Icons (Rule 5), < 450 dòng (Rule 7)
 */
export default function QuickStatusSheet({
  isOpen,
  onClose,
  userCustomStatus = '',
  userCustomSong = null,
  userCustomChibi = null,
  userAvatar = '',
  onOpenPinWardrobe,
  onSelectStatus
}) {
  const [customInput, setCustomInput] = useState('');
  const [selectedSong, setSelectedSong] = useState(null);
  const [selectedChibiId, setSelectedChibiId] = useState(null);
  const [activeFamily, setActiveFamily] = useState('droplet');
  const [expiryHours, setExpiryHours] = useState(24);
  const [isMusicPickerOpen, setIsMusicPickerOpen] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCustomInput(userCustomStatus || '');
      setSelectedSong(userCustomSong || null);
      setSelectedChibiId(userCustomChibi || null);
      setIsPlayingPreview(false);
    } else {
      storyAudioPlayer.stop();
      setIsPlayingPreview(false);
      setIsMusicPickerOpen(false);
    }
  }, [isOpen, userCustomStatus, userCustomSong, userCustomChibi]);

  if (!isOpen) return null;

  const currentChibi = getChibiMascotById(selectedChibiId);
  const filteredMascots = CHIBI_MASCOTS.filter(m => m.family === activeFamily);

  const handleTogglePlaySong = (e) => {
    e.stopPropagation();
    if (!selectedSong) return;
    const isPlaying = storyAudioPlayer.togglePlay(selectedSong, { loop: true });
    setIsPlayingPreview(isPlaying);
  };

  const handleRemoveSong = (e) => {
    e.stopPropagation();
    storyAudioPlayer.stop();
    setIsPlayingPreview(false);
    setSelectedSong(null);
  };

  const handleSelectChibi = (mascot) => {
    playTactileClickSound();
    playChibiSound(mascot.soundType);
    if (selectedChibiId === mascot.id) {
      setSelectedChibiId(null);
    } else {
      setSelectedChibiId(mascot.id);
    }
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    playTactileClickSound();
    storyAudioPlayer.stop();
    setIsPlayingPreview(false);

    const expiresAt = Date.now() + expiryHours * 3600 * 1000;

    if (onSelectStatus) {
      onSelectStatus(customInput.trim(), selectedSong, selectedChibiId, expiresAt, expiryHours);
    }

    try {
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: 0.8 },
        zIndex: 9999
      });
    } catch {}

    onClose();
  };

  const handleClearStatus = () => {
    playTactileClickSound();
    storyAudioPlayer.stop();
    setIsPlayingPreview(false);
    setCustomInput('');
    setSelectedSong(null);
    setSelectedChibiId(null);

    if (onSelectStatus) {
      onSelectStatus('', null, null);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-md flex items-end justify-center p-0 sm:p-4 select-none font-sans animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className={`relative z-10 w-full max-w-md max-h-[92vh] flex flex-col bg-[#0F121C]/96 border border-white/15 rounded-t-[32px] sm:rounded-3xl p-5 shadow-[0_-20px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl space-y-3.5 animate-in slide-in-from-bottom-8 duration-300 text-white overflow-hidden ${isMusicPickerOpen ? 'hidden' : ''}`}>
        
        {/* Thanh gạt đỉnh */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1 mb-0.5 shrink-0" />

        {/* Header Sheet */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={userAvatar || DEFAULT_WHITE_PERSON_AVATAR}
                alt="Avatar"
                className="w-11 h-11 rounded-full object-cover border-2 border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.4)]"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10FFA0] border-2 border-[#0F121C]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>Biểu Cảm Chibi & Trạng Thái</span>
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
              </h3>
              <p className="text-[11px] text-white/50">Gắn linh vật động bồng bềnh trên đỉnh ghim của Bạn</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold text-white transition-all cursor-pointer border border-white/10 shadow-sm"
            title="Quay lại"
          >
            <i className="bi bi-chevron-left text-xs"></i>
            <span>Quay lại</span>
          </button>
        </div>

        {/* VÙNG NỘI DUNG CUỘN CHÍNH */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-0.5">

          {/* Banner Tủ Đồ Ghim & Chibi FB/Zalo */}
          {onOpenPinWardrobe && (
            <button
              type="button"
              onClick={onOpenPinWardrobe}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 hover:from-amber-500/25 hover:to-rose-500/25 border border-amber-400/30 flex items-center justify-between text-xs text-white font-bold transition-all cursor-pointer group active:scale-98"
            >
              <div className="flex items-center gap-2">
                <i className="bi bi-palette-fill text-amber-400 group-hover:scale-110 transition-transform"></i>
                <span>Tủ Đồ Ghim Bản Đồ &amp; Chibi FB / Zalo</span>
              </div>
              <span className="text-[10px] text-amber-300 font-mono bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                <span>Đổi Skin</span>
                <i className="bi bi-chevron-right text-[9px]"></i>
              </span>
            </button>
          )}

          {/* 1. KHAY CHỌN BIỂU CẢM CHIBI (3 TABS) */}
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white/80 flex items-center gap-1.5 uppercase tracking-wide">
                <i className="bi bi-stars text-[#FF2A85]"></i>
                <span>Chọn Linh Vật Chibi VIVU</span>
              </span>
              {currentChibi && (
                <button
                  type="button"
                  onClick={() => setSelectedChibiId(null)}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                  title="Không dùng Chibi"
                >
                  <i className="bi bi-trash3-fill"></i>
                  <span>Gỡ Chibi</span>
                </button>
              )}
            </div>

            {/* Tab phân loại gia tộc Chibi */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/40 rounded-xl border border-white/10">
              {CHIBI_MASCOT_FAMILIES.map(fam => {
                const isActive = activeFamily === fam.id;
                return (
                  <button
                    key={fam.id}
                    type="button"
                    onClick={() => {
                      playTactileClickSound();
                      setActiveFamily(fam.id);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#FF2A85] to-[#7928CA] text-white shadow-md'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <i className={`bi ${fam.icon} text-xs`}></i>
                    <span className="truncate">{fam.label.split(' ')[0]} {fam.label.split(' ')[1] || ''}</span>
                  </button>
                );
              })}
            </div>

            {/* Lưới các sắc thái cảm xúc Chibi */}
            <div className="grid grid-cols-4 gap-2 pt-1 max-h-[170px] overflow-y-auto no-scrollbar">
              {filteredMascots.map(mascot => {
                const isSelected = selectedChibiId === mascot.id;
                return (
                  <button
                    key={mascot.id}
                    type="button"
                    onClick={() => handleSelectChibi(mascot)}
                    className={`relative p-2 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer group active:scale-95 ${
                      isSelected
                        ? 'bg-[#FF2A85]/20 border-2 border-[#FF2A85] shadow-[0_0_14px_rgba(255,42,133,0.5)] scale-102'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25'
                    }`}
                    title={`${mascot.name} • ${mascot.extrasDesc}`}
                  >
                    {/* Badge đang chọn */}
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF2A85] text-white flex items-center justify-center text-[9px] shadow-xs">
                        <i className="bi bi-check-lg font-bold"></i>
                      </span>
                    )}

                    {/* Hình ảnh Chibi SVG */}
                    <div className="w-11 h-11 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <img
                        src={getChibiDataUrl(mascot.id)}
                        alt={mascot.name}
                        className="w-full h-full object-contain filter drop-shadow-sm"
                      />
                    </div>

                    {/* Tên biểu cảm */}
                    <span className={`text-[10px] font-bold truncate max-w-full ${isSelected ? 'text-[#FF2A85]' : 'text-white/80'}`}>
                      {mascot.emotionLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Huy hiệu xem trước Chibi đang chọn */}
            {currentChibi && (
              <div className="p-2 rounded-xl bg-gradient-to-r from-[#FF2A85]/15 to-purple-900/20 border border-[#FF2A85]/30 flex items-center gap-2.5 animate-in fade-in duration-150">
                <img
                  src={getChibiDataUrl(currentChibi.id)}
                  alt=""
                  className="w-7 h-7 object-contain animate-bounce shrink-0"
                />
                <div className="text-[11px] truncate flex-1">
                  <span className="font-bold text-white">{currentChibi.name}</span>
                  <span className="text-white/50 ml-1.5">({currentChibi.extrasDesc})</span>
                </div>
                <button
                  type="button"
                  onClick={() => playChibiSound(currentChibi.soundType)}
                  className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-[#00E5FF] flex items-center justify-center text-xs shrink-0 cursor-pointer"
                  title="Nghe lại âm thanh"
                >
                  <i className="bi bi-volume-up-fill"></i>
                </button>
              </div>
            )}
          </div>

          {/* 2. Ô NHẬP SUY NGHĨ TỰ DO */}
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-white/60 font-medium">
              <span className="flex items-center gap-1.5">
                <i className="bi bi-chat-quote-fill text-[#00E5FF]"></i>
                <span>Suy nghĩ hiển thị kèm (Tùy chọn)</span>
              </span>
              <span className={`font-mono ${customInput.length > 50 ? 'text-[#FF2A85] font-bold' : 'text-white/40'}`}>
                {customInput.length}/60
              </span>
            </div>
            <input
              type="text"
              maxLength={60}
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder={currentChibi ? currentChibi.sloganPlaceholder : "Nhập suy nghĩ ngắn hiển thị trên ghim..."}
              className="w-full bg-[#151619] border border-white/10 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/30 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none transition-all placeholder-white/30"
            />
          </div>

          {/* 3. THẺ GẮN BÀI HÁT APPLE MUSIC */}
          {selectedSong ? (
            <div className="p-2.5 rounded-2xl bg-[#1A1A24] border border-[#FF2A85]/40 flex items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/20 shadow-xs">
                  <img src={selectedSong.cover} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleTogglePlaySong}
                    className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-all cursor-pointer"
                    title={isPlayingPreview ? 'Dừng phát' : 'Nghe thử'}
                  >
                    <i className={`bi ${isPlayingPreview ? 'bi-pause-fill text-[#10FFA0]' : 'bi-play-fill text-white'} text-sm`}></i>
                  </button>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                    <i className="bi bi-music-note-beamed text-[#FF2A85] text-[10px]"></i>
                    <span className="truncate">{selectedSong.title}</span>
                  </div>
                  <p className="text-[10px] text-white/50 truncate">{selectedSong.artist}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMusicPickerOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  Đổi
                </button>
                <button
                  type="button"
                  onClick={handleRemoveSong}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-rose-500/30 text-white/60 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                  title="Gỡ bài hát"
                >
                  <i className="bi bi-x-lg text-xs"></i>
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsMusicPickerOpen(true)}
              className="w-full py-2.5 px-3 rounded-2xl border border-dashed border-white/20 hover:border-[#FF2A85]/60 hover:bg-[#FF2A85]/5 text-white/70 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <i className="bi bi-music-note-beamed text-[#FF2A85] text-sm group-hover:scale-110 transition-transform"></i>
              <span>Gắn Nhạc Nền Ghim (Apple Music Hát Thật 100%)</span>
            </button>
          )}
        </div>

        {/* 4. THỜI GIAN HIỂN THỊ (TỰ HỦY) */}
        <div className="bg-white/5 rounded-2xl p-3 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-white/60 font-medium">
            <span className="flex items-center gap-1.5">
              <i className="bi bi-hourglass-split text-amber-400"></i>
              <span>Thời gian tự hủy</span>
            </span>
            <span className="text-amber-400 font-mono font-bold text-xs">{expiryHours}h</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 4, 8, 24].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => { playTactileClickSound(); setExpiryHours(h); }}
                className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  expiryHours === h
                    ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                    : 'bg-[#151619] border-white/10 text-white/60 hover:border-white/30'
                }`}
              >
                <i className="bi bi-clock text-[10px]"></i>
                <span>{h}h</span>
              </button>
            ))}
          </div>
        </div>

        {/* 5. CẶP NÚT HÀNH ĐỘNG DƯỚI ĐÁY */}
        <div className="flex gap-2 pt-1 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-white/10"
            title="Quay lại"
          >
            <i className="bi bi-arrow-left text-xs"></i>
            <span>Quay lại</span>
          </button>
          {(userCustomStatus || userCustomSong || userCustomChibi) && (
            <button
              type="button"
              onClick={handleClearStatus}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-white/60 hover:text-rose-300 font-bold text-xs transition-colors cursor-pointer"
              title="Xóa toàn bộ biểu cảm & trạng thái hiện tại"
            >
              Gỡ bỏ
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!customInput.trim() && !selectedSong && !selectedChibiId}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#10FFA0] hover:brightness-110 disabled:opacity-40 text-[#08202E] font-bold text-xs shadow-[0_0_16px_rgba(0,229,255,0.4)] active:scale-98 transition-all cursor-pointer"
          >
            Lưu Lên Ghim Bản Đồ
          </button>
        </div>

      </div>

      {/* Sub-Modal: Chọn Nhạc Apple Music Hát Thật */}
      {isMusicPickerOpen && (
        <MusicPickerModal
          isOpen={isMusicPickerOpen}
          onClose={() => setIsMusicPickerOpen(false)}
          selectedSong={selectedSong}
          onSelectSong={(song) => {
            setSelectedSong(song);
            setIsMusicPickerOpen(false);
            if (song) {
              storyAudioPlayer.playSong(song, { loop: true });
              setIsPlayingPreview(true);
            } else {
              storyAudioPlayer.stop();
              setIsPlayingPreview(false);
            }
          }}
        />
      )}
    </div>
  );
}
