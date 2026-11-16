import { DEFAULT_WHITE_PERSON_AVATAR } from '../../utils/avatarUtils';
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
 * StoryStudioModal - Trình Sáng Tạo Story Đa Năng Chuẩn Instagram (All-in-One Studio)
 * - Tích hợp đầy đủ: Chụp ảnh, Thư viện, Viết tâm trạng/văn bản, Gắn nhạc MP3, Dán Meme
 * - Trực tiếp mở toàn màn hình, không qua popup hỏi chọn rườm rà
 * - Đồng bộ kép: Đăng Story lên Bản đồ GPS + Cập nhật Tâm trạng và Nhạc vào giọt nước
 * - 100% Bootstrap Icons (Rule 5), Rule 7 (< 400 dòng)
 */
export default function StoryStudioModal({
  isOpen,
  onClose,
  onSubmitStory,
  userLocationName = 'Vị trí GPS của Bạn',
  userLat = 10.7769,
  userLng = 106.7009,
  friends = []
}) {
  const [phase, setPhase] = useState('CAMERA'); // 'CAMERA' | 'EDIT'
  const [mode, setMode] = useState('PHOTO'); // 'PHOTO' | 'TEXT'

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

  const [privacy, setPrivacy] = useState('public');
  const [expiryHours, setExpiryHours] = useState(24);
  const [taggedFriends, setTaggedFriends] = useState([]);
  const [isPublishing, setIsPublishing] = useState(false);

  const [isTextEditorOpen, setIsTextEditorOpen] = useState(false);
  const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);
  const [isFilterAdjusterOpen, setIsFilterAdjusterOpen] = useState(false);
  const [isMusicPickerOpen, setIsMusicPickerOpen] = useState(false);
  const [isTagFriendsOpen, setIsTagFriendsOpen] = useState(false);
  const galleryInputRef = useRef(null);

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

  const handlePhotoCaptured = (captureData) => {
    setImage(captureData.mainImage);
    setDualImage(captureData.dualImage);
    setIsDualCam(captureData.isDualCam);
    if (captureData.filterId) setSelectedFilter(captureData.filterId);
    setMode('PHOTO');
    setPhase('EDIT');
  };

  const handleSwitchToTextMode = () => {
    setImage(null);
    setDualImage(null);
    setMode('TEXT');
    setPhase('EDIT');
    setIsTextEditorOpen(true);
  };

  const handleSwapDual = () => {
    setImage(prevMain => {
      const temp = prevMain;
      setDualImage(temp);
      return dualImage;
    });
  };

  const handleSaveText = (textData) => {
    setTexts(prev => [...prev, textData]);
    setIsTextEditorOpen(false);
  };

  const handleRemoveText = (index) => {
    playTactileClickSound();
    setTexts(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddSticker = (stickerData) => {
    setStickers(prev => [...prev, stickerData]);
  };

  const handleRemoveSticker = (index) => {
    playTactileClickSound();
    setStickers(prev => prev.filter((_, i) => i !== index));
  };

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
        cover_url: selectedSong.coverUrl || selectedSong.cover_url || selectedSong.cover
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
        {phase === 'CAMERA' ? (
          <CameraViewfinder
            onPhotoCaptured={handlePhotoCaptured}
            onSwitchToTextMode={handleSwitchToTextMode}
            onOpenMusicPicker={() => setIsMusicPickerOpen(true)}
            onOpenStickerPicker={() => setIsStickerPickerOpen(true)}
            selectedSong={selectedSong}
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
              onRemoveSong={() => {
                storyAudioPlayer.stop();
                setIsPlayingMusic(false);
                setSelectedSong(null);
              }}
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
              if (song) {
                storyAudioPlayer.playSong(song, { loop: true });
                setIsPlayingMusic(true);
              } else {
                storyAudioPlayer.stop();
                setIsPlayingMusic(false);
              }
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
                <h3 className="text-white font-bold text-sm">Gắn thẻ bạn bè</h3>
                <button
                  type="button"
                  onClick={() => setIsTagFriendsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white"
                >
                  <i className="bi bi-x-lg text-xs"></i>
                </button>
              </div>
              <div className="space-y-2">
                {friends.length === 0 ? (
                  <p className="text-white/40 text-xs py-4 text-center">Chưa có bạn bè để gắn thẻ</p>
                ) : (
                  friends.map(friend => {
                    const isTagged = taggedFriends.some(f => f.id === friend.id);
                    return (
                      <div
                        key={friend.id}
                        onClick={() => {
                          playTactileClickSound();
                          setTaggedFriends(prev =>
                            isTagged ? prev.filter(f => f.id !== friend.id) : [...prev, friend]
                          );
                        }}
                        className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                          isTagged ? 'bg-[#FF2A85]/20 border border-[#FF2A85]/40' : 'bg-white/5 border border-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={friend.avatar || DEFAULT_WHITE_PERSON_AVATAR}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border border-white/20"
                          />
                          <div>
                            <p className="text-white text-xs font-bold">{friend.name}</p>
                            <p className="text-white/50 text-[10px]">{friend.user_code || ''}</p>
                          </div>
                        </div>
                        <i className={`bi ${isTagged ? 'bi-check-circle-fill text-[#FF2A85]' : 'bi-circle text-white/30'} text-base`}></i>
                      </div>
                    );
                  })
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsTagFriendsOpen(false)}
                className="w-full py-3 rounded-2xl bg-[#FF2A85] text-white text-xs font-bold shadow-lg"
              >
                Xác nhận ({taggedFriends.length})
              </button>
            </div>
          </div>
        )}

        <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryFileSelect} />
      </div>
    </div>
  );
}
