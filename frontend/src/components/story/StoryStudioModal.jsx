import React, { useRef, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import StoryStudio3DCanvas from './StoryStudio3DCanvas';
import MusicPickerModal from './MusicPickerModal';
import VivuButton from '../common/VivuButton';
import { TRENDING_SONGS, storyAudioPlayer } from '../../data/trendingSongs';
import { 
  playStoryBeaconChime, 
  playTactileClickSound, 
  MEME_STICKERS, 
  GRADIENT_PRESETS, 
  EXPIRY_OPTIONS 
} from './storyAudioEffects';

/**
 * StoryStudioModal - Màn hình Soạn Thảo & Cắm Ghim Story Không Gian
 * Hỗ trợ 3 chức năng chính: Nhạc (link riêng/thịnh hành), Meme (gợi ý/tải ảnh riêng), Story (ảnh/caption)
 * 100% Bootstrap Icons, Rule 7 (< 450 dòng)
 */
export default function StoryStudioModal({
  isOpen,
  onClose,
  onSubmitStory,
  userLocationName = 'Vị trí GPS thật của bạn'
}) {
  const fileInputRef = useRef(null);
  const memeFileInputRef = useRef(null);

  const [storyImage, setStoryImage] = useState(null);
  const [storyCaption, setStoryCaption] = useState('');
  const [selectedMeme, setSelectedMeme] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [bgGradient, setBgGradient] = useState(GRADIENT_PRESETS[0].class);
  const [activeTabTool, setActiveTabTool] = useState('none');
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [expiryHours, setExpiryHours] = useState(3);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      storyAudioPlayer.stop();
      setIsPlayingMusic(false);
      setActiveTabTool('none');
      setIsPublishing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('Vui lòng chọn ảnh dung lượng dưới 8MB');
      return;
    }
    playTactileClickSound();
    if (navigator.vibrate) navigator.vibrate(30);

    const reader = new FileReader();
    reader.onloadend = () => setStoryImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCustomMemeUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Vui lòng chọn ảnh Meme dung lượng dưới 5MB');
      return;
    }
    playTactileClickSound();
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedMeme({
        id: `custom-meme-${Date.now()}`,
        label: 'Meme của bạn',
        image: reader.result,
        icon: 'bi-stars',
        bg: 'bg-[#0A8395]/15 text-[#0A8395] border-[#0A8395]/40',
        isCustom: true
      });
      setActiveTabTool('none');
    };
    reader.readAsDataURL(file);
  };

  const handleTogglePlaySong = (e) => {
    e.stopPropagation();
    if (!selectedSong) return;
    if (isPlayingMusic) {
      storyAudioPlayer.stop();
      setIsPlayingMusic(false);
    } else {
      storyAudioPlayer.playSong(selectedSong);
      setIsPlayingMusic(true);
    }
  };

  const handlePublishStory = () => {
    if (isPublishing) return;
    setIsPublishing(true);

    playStoryBeaconChime();
    if (navigator.vibrate) navigator.vibrate([60, 40, 90]);

    confetti({
      particleCount: 65,
      spread: 75,
      origin: { y: 0.5 },
      colors: ['#0A8395', '#00E5FF', '#FF2A85', '#FFFFFF']
    });

    storyAudioPlayer.stop();
    setIsPlayingMusic(false);

    setTimeout(() => {
      onSubmitStory({
        title: storyCaption.trim() || (selectedSong ? `Story: ${selectedSong.title}` : (selectedMeme ? selectedMeme.label : 'Khoảnh khắc mới')),
        caption: storyCaption.trim(),
        description: storyCaption.trim() || (selectedMeme ? selectedMeme.label : 'Chia sẻ từ VIVU Spatial Story'),
        image: storyImage || null,
        music: selectedSong ? `${selectedSong.artist} - ${selectedSong.title}` : null,
        songData: selectedSong || null,
        meme: selectedMeme || null,
        memeImage: selectedMeme?.image || null,
        bgGradient: !storyImage ? bgGradient : null,
        category: 'moment',
        privacy: 'public',
        expiry_hours: expiryHours,
        expires_at: new Date(Date.now() + expiryHours * 3600000).toISOString()
      });
      setIsPublishing(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-60 bg-[#0a0e1c]/95 backdrop-blur-xl flex flex-col justify-between p-3 sm:p-5 select-none overflow-hidden font-sans text-white animate-in fade-in duration-200">
      
      {/* 3D Background Canvas Layer */}
      <StoryStudio3DCanvas isOpen={isOpen} />

      {/* Input File ẩn */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={memeFileInputRef}
        onChange={handleCustomMemeUpload}
        accept="image/*"
        className="hidden"
      />

      {/* 1. TOP BAR HUD */}
      <div className="relative z-20 w-full max-w-sm mx-auto space-y-2 pointer-events-auto">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => {
              playTactileClickSound();
              storyAudioPlayer.stop();
              onClose();
            }}
            className="btn btn-sm btn-secondary rounded-full w-9 h-9 p-0 text-white cursor-pointer"
            title="Đóng Studio"
          >
            <i className="bi bi-x-lg text-sm"></i>
          </button>

          <div className="px-3.5 py-1 rounded-full bg-[rgba(20,20,30,0.85)] backdrop-blur-md border border-white/15 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#FF2A85] animate-pulse"></span>
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">Story Studio</span>
          </div>

          {!storyImage ? (
            <button
              onClick={() => {
                playTactileClickSound();
                const idx = GRADIENT_PRESETS.findIndex(g => g.class === bgGradient);
                setBgGradient(GRADIENT_PRESETS[(idx + 1) % GRADIENT_PRESETS.length].class);
              }}
              className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 hover:border-[#0A8395] text-[#00E5FF] flex items-center justify-center active:scale-95 transition-all cursor-pointer"
              title="Đổi màu nền"
            >
              <i className="bi bi-palette-fill text-sm"></i>
            </button>
          ) : (
            <button
              onClick={() => {
                playTactileClickSound();
                setStoryImage(null);
              }}
              className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 hover:border-rose-500 text-rose-400 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
              title="Gỡ ảnh"
            >
              <i className="bi bi-trash-fill text-sm"></i>
            </button>
          )}
        </div>

        {/* Sub Header Badge */}
        <div className="flex items-center justify-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#0A8395]/20 border border-[#0A8395]/40 text-[#00E5FF] text-[10px] font-bold tracking-wider uppercase">
            <i className="bi bi-geo-alt-fill"></i>
            <span>Cắm Ghim Bản Đồ VIVU</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FF2A85]/20 border border-[#FF2A85]/40 text-[#FF2A85] text-[10px] font-mono font-bold">
            <i className="bi bi-hourglass-split"></i>
            <span>Tự hủy {expiryHours}h</span>
          </div>
        </div>
      </div>

      {/* 2. KHUNG PREVIEW STORY 9:16 */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center max-w-sm mx-auto w-full px-2 py-1 overflow-hidden pointer-events-auto">
        <div className="relative w-full aspect-[9/15] max-h-[56vh] rounded-3xl overflow-hidden border-2 border-[#D8E3E7]/40 shadow-2xl flex flex-col justify-between p-3.5 group bg-[#111622]">
          
          {storyImage ? (
            <img src={storyImage} alt="" className="absolute inset-0 w-full h-full object-cover z-0" />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} z-0 transition-all duration-500`}></div>
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 z-5 pointer-events-none"></div>

          {/* Góc trên: Sticker Nhạc & Meme */}
          <div className="relative z-10 flex flex-col gap-2">
            {selectedSong && (
              <div 
                onClick={handleTogglePlaySong}
                className="inline-flex items-center gap-2 py-1 px-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white cursor-pointer hover:border-[#00E5FF] transition-all self-start shadow-md active:scale-95"
              >
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${isPlayingMusic ? 'bg-[#0A8395] text-white animate-spin' : 'bg-white/20 text-white'}`}>
                  <i className={`bi ${isPlayingMusic ? 'bi-pause-fill' : 'bi-play-fill'} text-xs`}></i>
                </div>
                <div className="text-[11px] font-bold truncate max-w-[170px]">
                  <span>{selectedSong.title}</span>
                  <span className="text-white/70 font-normal"> • {selectedSong.artist}</span>
                </div>
              </div>
            )}

            {/* Meme Sticker đang chọn */}
            {selectedMeme && (
              <div className="inline-flex items-center gap-2 py-1 px-2.5 rounded-2xl bg-white/95 text-[#14252E] border border-white shadow-lg text-[11px] font-bold self-start animate-in zoom-in duration-150">
                {selectedMeme.image && (
                  <img src={selectedMeme.image} alt="" className="w-6 h-6 rounded-md object-cover" />
                )}
                <span>{selectedMeme.label}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playTactileClickSound();
                    setSelectedMeme(null);
                  }}
                  className="ml-1 text-[#52646D] hover:text-[#DC2626]"
                >
                  <i className="bi bi-x text-sm"></i>
                </button>
              </div>
            )}
          </div>

          {/* Vùng giữa: Caption chữ trạng thái */}
          <div className="relative z-10 my-auto text-center px-2">
            <textarea
              value={storyCaption}
              onChange={(e) => setStoryCaption(e.target.value)}
              placeholder="Nhập trạng thái, cảm xúc quanh đây..."
              rows={2}
              className="w-full bg-black/50 backdrop-blur-md border border-white/20 focus:border-[#00E5FF] rounded-2xl p-3 text-white placeholder-white/50 font-bold text-base text-center outline-none shadow-xl resize-none transition-colors"
            />
          </div>

          {/* Góc dưới Canvas: Vị trí GPS thật */}
          <div className="relative z-10 flex items-center justify-between text-[11px] text-white/80">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 font-mono">
              <i className="bi bi-geo-alt-fill text-[#00E5FF]"></i>
              <span className="truncate max-w-[180px]">{userLocationName}</span>
            </div>
            <span className="text-[10px] text-[#10FFA0] font-mono flex items-center gap-1">
              <i className="bi bi-shield-check"></i> GPS Verified
            </span>
          </div>
        </div>
      </div>

      {/* 3. THANH ĐIỀU KHIỂN CÔNG CỤ DẠNG DOCK (3 LỰA CHỌN: NHẠC - MEME - STORY) */}
      <div className="relative z-20 max-w-sm mx-auto w-full space-y-2 pointer-events-auto">
        
        {/* Bộ 3 công cụ chính */}
        <div className="grid grid-cols-3 gap-2">
          {/* CÔNG CỤ 1: CHỤP / TẢI ẢNH STORY */}
          <button
            type="button"
            onClick={() => {
              playTactileClickSound();
              fileInputRef.current?.click();
            }}
            className="py-2.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-[#0A8395] text-white flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <i className="bi bi-camera-fill text-[#00E5FF] text-base"></i>
            <span className="text-[11px] font-bold">{storyImage ? 'Đổi ảnh' : 'Tải ảnh'}</span>
          </button>

          {/* CÔNG CỤ 2: NHÃN MEME */}
          <button
            type="button"
            onClick={() => {
              playTactileClickSound();
              setActiveTabTool(activeTabTool === 'meme' ? 'none' : 'meme');
            }}
            className={`py-2.5 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer ${
              activeTabTool === 'meme'
                ? 'bg-[#0A8395] text-white border-[#0A8395] font-bold shadow-md'
                : 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
            }`}
          >
            <i className="bi bi-emoji-smile-fill text-[#FF2A85] text-base"></i>
            <span className="text-[11px] font-bold">Meme</span>
          </button>

          {/* CÔNG CỤ 3: CHỌN NHẠC */}
          <button
            type="button"
            onClick={() => {
              playTactileClickSound();
              setIsMusicModalOpen(true);
            }}
            className="py-2.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-[#0A8395] text-white flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <i className="bi bi-disc-fill text-[#00E5FF] text-base"></i>
            <span className="text-[11px] font-bold truncate max-w-[70px]">
              {selectedSong ? selectedSong.title : 'Nhạc'}
            </span>
          </button>
        </div>

        {/* Khay nhãn dán Meme mở rộng: 10 Meme gợi ý + Nút Tải Meme riêng */}
        {activeTabTool === 'meme' && (
          <div className="p-3 bg-white text-[#14252E] rounded-2xl border border-[#D8E3E7] shadow-xl animate-in slide-in-from-bottom-2 duration-150">
            <div className="text-[11px] font-bold text-[#52646D] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <i className="bi bi-stars text-[#0A8395]"></i> Kho Meme Thịnh Hành
              </span>
              <button 
                onClick={() => setActiveTabTool('none')} 
                className="text-[#7E909A] hover:text-[#14252E] text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>

            {/* Nút Tải Ảnh Meme Riêng */}
            <button
              type="button"
              onClick={() => memeFileInputRef.current?.click()}
              className="w-full mb-2.5 py-2 px-3 rounded-xl bg-[#0A8395]/10 hover:bg-[#0A8395]/16 border border-dashed border-[#0A8395] text-[#0A8395] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <i className="bi bi-cloud-arrow-up-fill text-base"></i>
              <span>+ Tải ảnh Meme riêng từ máy bạn</span>
            </button>

            {/* Lưới 10 Meme gợi ý sẵn */}
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto no-scrollbar">
              {MEME_STICKERS.map(meme => (
                <button
                  key={meme.id}
                  onClick={() => {
                    playTactileClickSound();
                    setSelectedMeme(meme);
                    setActiveTabTool('none');
                  }}
                  className={`p-1.5 rounded-xl text-left text-[11px] font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                    selectedMeme?.id === meme.id
                      ? 'border-[#0A8395] bg-[#0A8395]/15 text-[#0A8395] font-bold'
                      : 'border-[#D8E3E7] bg-[#F8FAFB] hover:bg-[#F3F7F8] text-[#14252E]'
                  }`}
                >
                  <img src={meme.image} alt="" className="w-7 h-7 rounded-lg object-cover shrink-0" />
                  <span className="truncate">{meme.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chọn thời hạn tự hủy Story */}
        <div className="px-3 py-2 bg-white/10 rounded-xl border border-white/15 flex items-center justify-between gap-2 shadow-sm">
          <span className="text-[10px] uppercase text-white/70 font-semibold flex items-center gap-1">
            <i className="bi bi-hourglass-split text-amber-400"></i> Hạn ghim:
          </span>
          <div className="flex items-center gap-1.5">
            {EXPIRY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  playTactileClickSound();
                  setExpiryHours(opt.value);
                }}
                className={`py-1 px-2.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                  expiryHours === opt.value
                    ? 'bg-[#0A8395] text-white border-[#0A8395]'
                    : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/15'
                }`}
              >
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* NÚT PRIMARY CTA: CẮM GHIM STORY LÊN BẢN ĐỒ (Bootstrap VivuButton btn-primary btn-lg) */}
        <VivuButton
          variant="primary"
          size="lg"
          pill={true}
          glow={true}
          loading={isPublishing}
          icon={!isPublishing ? "bi-geo-alt-fill" : null}
          onClick={handlePublishStory}
          disabled={isPublishing}
          className="w-full font-black text-xs tracking-wider"
        >
          {isPublishing ? 'Đang cắm ghim khoảnh khắc...' : 'CẮM GHIM LÊN BẢN ĐỒ VIVU'}
        </VivuButton>

      </div>

      {/* Modal Chọn Nhạc Thịnh Hành */}
      <MusicPickerModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        selectedSong={selectedSong}
        onSelectSong={(song) => {
          setSelectedSong(song);
          setIsMusicModalOpen(false);
          setIsPlayingMusic(false);
        }}
      />

    </div>
  );
}
