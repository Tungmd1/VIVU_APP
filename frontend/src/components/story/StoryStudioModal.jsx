import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import CameraViewfinder from './camera/CameraViewfinder';
import StoryCanvasPreview from './editor/StoryCanvasPreview';
import StoryTextEditor from './editor/StoryTextEditor';
import StoryStickerPicker from './editor/StoryStickerPicker';
import StoryFiltersAdjuster from './editor/StoryFiltersAdjuster';
import StoryPublishFooter from './editor/StoryPublishFooter';
import MusicPickerModal from './MusicPickerModal';
import { storyAudioPlayer } from '../../data/trendingSongs';
import { playStoryBeaconChime, playTactileClickSound, GRADIENT_PRESETS } from './storyAudioEffects';

/**
 * StoryStudioModal - Shell Điều Phối Toàn Diện: Camera Pro -> Edit Studio -> Publish
 * Tuân thủ Rule 5 (100% Bootstrap Icons), Rule 7 (< 400 dòng), Rule 8 (Ghim GPS)
 */
export default function StoryStudioModal({
  isOpen,
  onClose,
  onSubmitStory,
  userLocationName = 'Vị trí GPS thật của bạn',
  userLat = 10.7769,
  userLng = 106.7009,
  friends = []
}) {
  // Trạng thái luồng
  const [phase, setPhase] = useState('CAMERA'); // 'CAMERA' | 'EDIT'
  const [mode, setMode] = useState('PHOTO'); // 'PHOTO' | 'TEXT'

  // Dữ liệu nội dung Story
  const [image, setImage] = useState(null);
  const [dualImage, setDualImage] = useState(null);
  const [isDualCam, setIsDualCam] = useState(false);
  const [bgGradient, setBgGradient] = useState(GRADIENT_PRESETS[0].class);
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [adjustments, setAdjustments] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    vignette: 0
  });
  const [texts, setTexts] = useState([]);
  const [stickers, setStickers] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  // Cấu hình xuất bản
  const [privacy, setPrivacy] = useState('public');
  const [expiryHours, setExpiryHours] = useState(24);
  const [taggedFriends, setTaggedFriends] = useState([]);
  const [isPublishing, setIsPublishing] = useState(false);

  // Trạng thái mở các Sub-modal
  const [isTextEditorOpen, setIsTextEditorOpen] = useState(false);
  const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);
  const [isFilterAdjusterOpen, setIsFilterAdjusterOpen] = useState(false);
  const [isMusicPickerOpen, setIsMusicPickerOpen] = useState(false);
  const [isTagFriendsOpen, setIsTagFriendsOpen] = useState(false);
  const galleryInputRef = useRef(null);

  // Reset khi đóng mở
  useEffect(() => {
    if (!isOpen) {
      storyAudioPlayer.stop();
      setIsPlayingMusic(false);
      setPhase('CAMERA');
      setMode('PHOTO');
      setImage(null);
      setDualImage(null);
      setIsDualCam(false);
      setTexts([]);
      setStickers([]);
      setSelectedSong(null);
      setTaggedFriends([]);
      setIsPublishing(false);
      setIsTextEditorOpen(false);
      setIsStickerPickerOpen(false);
      setIsFilterAdjusterOpen(false);
      setIsMusicPickerOpen(false);
      setIsTagFriendsOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Chọn ảnh trực tiếp từ bộ nhớ máy / Thư viện
  const handleGalleryFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    playTactileClickSound();
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      setDualImage(null);
      setIsDualCam(false);
      setMode('PHOTO');
      setPhase('EDIT');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Khi chụp xong ảnh từ Camera
  const handlePhotoCaptured = (captureData) => {
    setImage(captureData.mainImage);
    setDualImage(captureData.dualImage);
    setIsDualCam(captureData.isDualCam);
    if (captureData.filterId) setSelectedFilter(captureData.filterId);
    setMode('PHOTO');
    setPhase('EDIT');
  };

  // Chuyển sang chế độ Text/Gradient
  const handleSwitchToTextMode = () => {
    setImage(null);
    setDualImage(null);
    setMode('TEXT');
    setPhase('EDIT');
    setIsTextEditorOpen(true);
  };

  // Hoán đổi ảnh Dual Camera
  const handleSwapDual = () => {
    setImage(prevMain => {
      const temp = prevMain;
      setDualImage(temp);
      return dualImage;
    });
  };

  // Thêm Text
  const handleSaveText = (textData) => {
    setTexts(prev => [...prev, textData]);
    setIsTextEditorOpen(false);
  };

  const handleRemoveText = (index) => {
    playTactileClickSound();
    setTexts(prev => prev.filter((_, i) => i !== index));
  };

  // Thêm Stickers
  const handleAddSticker = (stickerData) => {
    setStickers(prev => [...prev, stickerData]);
  };

  const handleRemoveSticker = (index) => {
    playTactileClickSound();
    setStickers(prev => prev.filter((_, i) => i !== index));
  };

  // Bật tắt nhạc
  const handleTogglePlaySong = () => {
    if (!selectedSong) return;
    if (isPlayingMusic) {
      storyAudioPlayer.stop();
      setIsPlayingMusic(false);
    } else {
      storyAudioPlayer.playSong(selectedSong);
      setIsPlayingMusic(true);
    }
  };

  // Đăng Story hoàn chỉnh
  const handlePublish = async () => {
    setIsPublishing(true);
    playStoryBeaconChime();
    if (navigator.vibrate) navigator.vibrate([40, 60, 40]);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        zIndex: 9999
      });
    } catch {}

    const payload = {
      image,
      dual_image: dualImage,
      is_dual_cam: isDualCam,
      mode,
      bg_gradient: mode === 'TEXT' ? bgGradient : null,
      filter_id: selectedFilter,
      adjustments,
      texts,
      stickers,
      music: selectedSong ? {
        id: selectedSong.id,
        title: selectedSong.title,
        artist: selectedSong.artist,
        audio_url: selectedSong.audioUrl || selectedSong.audio_url,
        cover_url: selectedSong.coverUrl || selectedSong.cover_url
      } : null,
      tagged_friends: taggedFriends,
      privacy,
      expiry_hours: expiryHours,
      title: texts[0]?.text || (mode === 'PHOTO' ? 'Khoảnh khắc mới' : 'Tâm trạng'),
      description: texts.length > 1 ? texts.slice(1).map(t => t.text).join(' - ') : '',
      address: userLocationName,
      lat: userLat,
      lng: userLng
    };

    if (onSubmitStory) {
      await onSubmitStory(payload);
    }

    setIsPublishing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden animate-fadeIn">
      <div className="relative w-full h-full max-w-md bg-black flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* THANH CHỌN CHẾ ĐỘ STORY */}
        <div className="absolute top-3 left-3 right-3 z-40 flex items-center justify-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border border-pink-400 bg-gradient-to-r from-pink-500/80 to-purple-600/80 hover:from-pink-500 hover:to-purple-600 text-white shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Chọn ảnh từ thiết bị"
          >
            <i className="bi bi-images text-xs"></i>
            <span>Chọn Ảnh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('PHOTO');
              setPhase('CAMERA');
            }}
            className={`px-2.5 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'PHOTO' && phase === 'CAMERA'
                ? 'bg-white text-black border-white shadow-lg'
                : 'bg-black/50 text-white/80 border-white/20 hover:bg-black/70'
            }`}
          >
            <i className="bi bi-camera-fill text-xs"></i>
            <span>Camera</span>
          </button>

          <button
            type="button"
            onClick={handleSwitchToTextMode}
            className={`px-2.5 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'TEXT'
                ? 'bg-white text-black border-white shadow-lg'
                : 'bg-black/50 text-white/80 border-white/20 hover:bg-black/70'
            }`}
          >
            <i className="bi bi-fonts text-xs"></i>
            <span>Văn Bản</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsMusicPickerOpen(true);
            }}
            className={`px-2.5 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedSong
                ? 'bg-[#FF2A85] text-white border-[#FF2A85] shadow-lg'
                : 'bg-black/50 text-white/80 border-white/20 hover:bg-black/70'
            }`}
          >
            <i className="bi bi-music-note-beamed text-xs"></i>
            <span>{selectedSong ? 'Đã Gắn Nhạc' : 'Nhạc'}</span>
          </button>
        </div>

        {phase === 'CAMERA' ? (
          <CameraViewfinder
            onPhotoCaptured={handlePhotoCaptured}
            onSwitchToTextMode={handleSwitchToTextMode}
            onClose={onClose}
          />
        ) : (
          <div className="relative w-full h-full flex flex-col justify-between">
            {/* Vùng Canvas Preview */}
            <StoryCanvasPreview
              mode={mode}
              image={image}
              dualImage={dualImage}
              onSwapDual={handleSwapDual}
              bgGradient={bgGradient}
              selectedFilter={selectedFilter}
              adjustments={adjustments}
              texts={texts}
              stickers={stickers}
              selectedSong={selectedSong}
              isPlayingMusic={isPlayingMusic}
              onTogglePlaySong={handleTogglePlaySong}
              onOpenMusicPicker={() => setIsMusicPickerOpen(true)}
              onOpenTextEditor={() => setIsTextEditorOpen(true)}
              onOpenStickerPicker={() => setIsStickerPickerOpen(true)}
              onOpenFilterAdjuster={() => setIsFilterAdjusterOpen(true)}
              onRetakePhoto={() => setPhase('CAMERA')}
              onRemoveText={handleRemoveText}
              onRemoveSticker={handleRemoveSticker}
            />

            {/* Thanh Footer xuất bản */}
            <StoryPublishFooter
              privacy={privacy}
              onChangePrivacy={setPrivacy}
              expiryHours={expiryHours}
              onChangeExpiry={setExpiryHours}
              taggedFriends={taggedFriends}
              onOpenTagFriends={() => setIsTagFriendsOpen(true)}
              userLocationName={userLocationName}
              isPublishing={isPublishing}
              onPublish={handlePublish}
            />
          </div>
        )}

        {/* Sub-Modal: Nhập Text */}
        {isTextEditorOpen && (
          <StoryTextEditor
            onSave={handleSaveText}
            onCancel={() => setIsTextEditorOpen(false)}
          />
        )}

        {/* Sub-Modal: Chọn Nhãn Dán / Poll / Q&A / Meme */}
        {isStickerPickerOpen && (
          <StoryStickerPicker
            userLocationName={userLocationName}
            onSelectMeme={handleAddSticker}
            onAddPoll={handleAddSticker}
            onAddQA={handleAddSticker}
            onAddLocationBadge={handleAddSticker}
            onClose={() => setIsStickerPickerOpen(false)}
          />
        )}

        {/* Sub-Modal: Bộ Lọc Màu & Thanh Trượt */}
        {isFilterAdjusterOpen && (
          <StoryFiltersAdjuster
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
            adjustments={adjustments}
            onChangeAdjustment={(key, val) => setAdjustments(prev => ({ ...prev, [key]: val }))}
            onResetAdjustments={() => setAdjustments({ brightness: 100, contrast: 100, saturation: 100, vignette: 0 })}
            onClose={() => setIsFilterAdjusterOpen(false)}
          />
        )}

        {/* Sub-Modal: Chọn Nhạc Nền */}
        {isMusicPickerOpen && (
          <MusicPickerModal
            isOpen={isMusicPickerOpen}
            onClose={() => setIsMusicPickerOpen(false)}
            onSelectSong={(song) => {
              setSelectedSong(song);
              setIsPlayingMusic(true);
            }}
            currentSong={selectedSong}
          />
        )}

        {/* Sub-Modal: Gắn Thẻ Bạn Bè */}
        {isTagFriendsOpen && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end p-4 animate-fadeIn select-none">
            <div className="flex-1" onClick={() => setIsTagFriendsOpen(false)} />
            <div className="bg-[#151619] rounded-3xl border border-white/10 p-5 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-sm tracking-wide font-display">Gắn Thẻ Bạn Bè Vào Story</h3>
                <button
                  type="button"
                  onClick={() => setIsTagFriendsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 text-white/70 hover:text-white flex items-center justify-center"
                >
                  <i className="bi bi-x-lg text-sm"></i>
                </button>
              </div>

              <div className="space-y-2">
                {friends.length === 0 ? (
                  <p className="text-xs text-white/50 text-center py-4">Chưa có bạn bè nào để gắn thẻ.</p>
                ) : (
                  friends.map(f => {
                    const isTagged = taggedFriends.includes(f.id);
                    return (
                      <div
                        key={f.id}
                        onClick={() => {
                          playTactileClickSound();
                          setTaggedFriends(prev =>
                            isTagged ? prev.filter(id => id !== f.id) : [...prev, f.id]
                          );
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                          isTagged ? 'bg-purple-600/20 border-purple-500' : 'bg-[#1A1A1E] border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={f.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                          <div>
                            <p className="text-xs font-bold text-white">{f.name}</p>
                            <span className="text-[10px] text-white/50 font-mono">{f.user_code || 'VU-Friend'}</span>
                          </div>
                        </div>
                        <i className={`bi ${isTagged ? 'bi-check-circle-fill text-purple-400' : 'bi-circle text-white/30'} text-lg`}></i>
                      </div>
                    );
                  })
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsTagFriendsOpen(false)}
                className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-lg active:scale-98"
              >
                Xong ({taggedFriends.length} bạn bè)
              </button>
            </div>
          </div>
        )}
        {/* Thẻ input chọn ảnh từ thiết bị */}
        <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryFileSelect} />
      </div>
    </div>
  );
}
