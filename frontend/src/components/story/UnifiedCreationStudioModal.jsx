import React, { useState, useEffect, useRef } from 'react';
import CameraViewfinder from './camera/CameraViewfinder';
import StoryCanvasPreview from './editor/StoryCanvasPreview';
import StoryTextEditor from './editor/StoryTextEditor';
import StoryStickerPicker from './editor/StoryStickerPicker';
import StoryFiltersAdjuster from './editor/StoryFiltersAdjuster';
import MusicPickerModal from './MusicPickerModal';
import { storyAudioPlayer } from '../../data/trendingSongs';
import { playStoryBeaconChime, playTactileClickSound, GRADIENT_PRESETS } from './storyAudioEffects';
import {
  CHIBI_MASCOT_FAMILIES,
  CHIBI_MASCOTS,
  getChibiMascotById,
  getChibiDataUrl,
  playChibiSound
} from '../../data/chibiMascotData';
import { apiClient } from '../../services/apiClient';

/**
 * UnifiedCreationStudioModal - Trình Sáng Tạo Thống Nhất VIVU (Giai đoạn 2)
 * - Tích hợp 3 chế độ: Story Khoảnh Khắc, Tâm Trạng & Nhạc, Linh Vật Chibi Mascot
 * - Cho phép đăng Story, đổi Chibi và cập nhật Giọt Nước trong 1 lần lưu
 * - Nén ảnh Canvas và tải lên máy chủ tĩnh (/uploads/stories/), tránh lỗi đầy bộ nhớ
 * - 100% Bootstrap Icons, không dùng confetti gây giật lag
 */
export default function UnifiedCreationStudioModal({
  isOpen,
  onClose,
  onSubmitAll,
  userLocationName = 'Vị trí GPS của Bạn',
  userLat = 16.0544,
  userLng = 108.2022,
  friends = [],
  initialCustomStatus = '',
  initialCustomSong = null,
  initialCustomChibi = null
}) {
  // Chế độ chính của Studio: 'STORY' | 'MOOD' | 'CHIBI'
  const [activeStudioTab, setActiveStudioTab] = useState('STORY');

  // Story camera / preview states
  const [phase, setPhase] = useState('CAMERA'); // 'CAMERA' | 'EDIT'
  const [mode, setMode] = useState('PHOTO'); // 'PHOTO' | 'TEXT'
  const [image, setImage] = useState(null);
  const [dualImage, setDualImage] = useState(null);
  const [isDualCam, setIsDualCam] = useState(false);
  const [bgGradient, setBgGradient] = useState(GRADIENT_PRESETS[0].class);
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [adjustments, setAdjustments] = useState({ brightness: 100, contrast: 100, saturation: 100, vignette: 0 });
  const [texts, setTexts] = useState([]);
  const [stickers, setStickers] = useState([]);

  // Mood & Music states
  const [customStatusInput, setCustomStatusInput] = useState('');
  const [selectedSong, setSelectedSong] = useState(null);
  const [musicStickerStyle, setMusicStickerStyle] = useState('VINYL'); // 'VINYL' | 'ALBUM_CARD' | 'EQUALIZER'
  const [musicStickerPosition, setMusicStickerPosition] = useState({ x: 50, y: 70 });
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  // Chibi states
  const [selectedChibiId, setSelectedChibiId] = useState(null);
  const [activeChibiFamily, setActiveChibiFamily] = useState('droplet');

  // Expiry states
  const [storyExpiryHours, setStoryExpiryHours] = useState(24);
  const [statusExpiryHours, setStatusExpiryHours] = useState(24);
  const [privacy, setPrivacy] = useState('public');
  const [taggedFriends, setTaggedFriends] = useState([]);
  const [isPublishing, setIsPublishing] = useState(false);

  // Sub-modals
  const [isTextEditorOpen, setIsTextEditorOpen] = useState(false);
  const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);
  const [isFilterAdjusterOpen, setIsFilterAdjusterOpen] = useState(false);
  const [isMusicPickerOpen, setIsMusicPickerOpen] = useState(false);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setCustomStatusInput(initialCustomStatus || '');
      setSelectedSong(initialCustomSong || null);
      setSelectedChibiId(initialCustomChibi || null);
      setActiveStudioTab('STORY');
      setPhase('CAMERA');
      setMusicStickerPosition({ x: 50, y: 70 });
    } else {
      storyAudioPlayer.stop();
      setIsPlayingMusic(false);
      setImage(null);
      setDualImage(null);
      setIsDualCam(false);
      setTexts([]);
      setStickers([]);
      setMusicStickerPosition({ x: 50, y: 70 });
      setIsPublishing(false);
    }
  }, [isOpen, initialCustomStatus, initialCustomSong, initialCustomChibi]);

  if (!isOpen) return null;

  // Xử lý nén ảnh qua Canvas và tải lên /api/upload/media
  const processAndUploadMedia = async (dataUri) => {
    if (!dataUri || !dataUri.startsWith('data:')) return dataUri;
    try {
      const res = await fetch(dataUri);
      const blob = await res.blob();
      const file = new File([blob], `story-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const uploadRes = await apiClient.uploadMedia(file, { category: 'stories' });
      if (uploadRes?.success && uploadRes.url) {
        return uploadRes.url;
      }
    } catch (err) {
      console.warn('[UnifiedStudio] Upload media fallback to dataUri:', err.message);
    }
    return dataUri;
  };

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

  const handleSelectChibi = (mascot) => {
    playTactileClickSound();
    playChibiSound(mascot.soundType);
    setSelectedChibiId(prev => (prev === mascot.id ? null : mascot.id));
  };

  const handleTogglePlaySong = () => {
    if (!selectedSong) return;
    if (isPlayingMusic) {
      storyAudioPlayer.stop();
      setIsPlayingMusic(false);
    } else {
      storyAudioPlayer.playSong(selectedSong, { loop: true });
      setIsPlayingMusic(true);
    }
  };

  // Xuất bản thống nhất (Unified Submit)
  const handlePublishAll = async () => {
    setIsPublishing(true);
    playStoryBeaconChime();
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);

    let finalImageUrl = null;
    let finalDualUrl = null;
    if (image) {
      finalImageUrl = await processAndUploadMedia(image);
    }
    if (dualImage) {
      finalDualUrl = await processAndUploadMedia(dualImage);
    }

    const hasStoryContent = Boolean(finalImageUrl || finalDualUrl || texts.length > 0);

    const storyPayload = hasStoryContent ? {
      image: finalImageUrl,
      dual_image: finalDualUrl,
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
        cover_url: selectedSong.coverUrl || selectedSong.cover_url || selectedSong.cover,
        sticker_style: musicStickerStyle,
        position: musicStickerPosition
      } : null,
      tagged_friends: taggedFriends,
      privacy,
      expiry_hours: storyExpiryHours,
      title: texts[0]?.text || (mode === 'PHOTO' ? 'Khoảnh khắc mới' : 'Tâm trạng'),
      description: texts.length > 1 ? texts.slice(1).map(t => t.text).join(' - ') : '',
      address: userLocationName,
      lat: userLat,
      lng: userLng
    } : null;

    const chibiExpiresAt = selectedChibiId ? Date.now() + statusExpiryHours * 3600 * 1000 : null;

    if (onSubmitAll) {
      await onSubmitAll({
        storyPayload,
        customStatus: customStatusInput.trim(),
        customSong: selectedSong,
        customChibi: selectedChibiId,
        chibiExpiresAt,
        statusExpiryHours
      });
    }

    setIsPublishing(false);
    onClose();
  };

  const filteredMascots = CHIBI_MASCOTS.filter(m => m.family === activeChibiFamily);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden animate-fadeIn">
      <div className="relative w-full h-full max-w-md bg-[#0a0f18] flex flex-col justify-between overflow-hidden shadow-2xl">
        
        {/* HEADER: ĐÓNG & TIÊU ĐỀ (Chỉ hiển thị cho tab MOOD và CHIBI; tab STORY có top-bar chuyên biệt riêng) */}
        {activeStudioTab !== 'STORY' && (
          <div className="absolute top-0 left-0 right-0 z-40 p-3 pt-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white/80 hover:text-white flex items-center justify-center border border-white/10 active:scale-95 transition-all shadow-md"
              title="Đóng Studio"
            >
              <i className="bi bi-x-lg text-sm"></i>
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-white text-xs font-bold shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#FF2A85] animate-pulse"></span>
              <span>VIVU Studio</span>
            </div>
            <button
              type="button"
              disabled={isPublishing}
              onClick={handlePublishAll}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FF2A85] to-[#7928CA] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,42,133,0.5)] active:scale-95 hover:brightness-110 transition-all flex items-center gap-1.5"
            >
              {isPublishing ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin text-xs"></i>
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <span>Đăng</span>
                  <i className="bi bi-check2 text-sm font-bold"></i>
                </>
              )}
            </button>
          </div>
        )}

        {/* NỘI DUNG CHÍNH THEO TAB */}
        <div className="flex-1 w-full h-full relative overflow-hidden">
          {activeStudioTab === 'STORY' && (
            phase === 'CAMERA' ? (
              <CameraViewfinder
                onPhotoCaptured={handlePhotoCaptured}
                onSwitchToTextMode={() => {
                  setImage(null);
                  setDualImage(null);
                  setMode('TEXT');
                  setPhase('EDIT');
                  setIsTextEditorOpen(true);
                }}
                onOpenMusicPicker={() => setIsMusicPickerOpen(true)}
                onOpenStickerPicker={() => setIsStickerPickerOpen(true)}
                selectedSong={selectedSong}
                onClose={onClose}
              />
            ) : (
              <StoryCanvasPreview
                mode={mode}
                image={image}
                dualImage={dualImage}
                onSwapDual={() => setDualImage(image)}
                bgGradient={bgGradient}
                selectedFilter={selectedFilter}
                adjustments={adjustments}
                texts={texts}
                stickers={stickers}
                selectedSong={selectedSong}
                musicStickerStyle={musicStickerStyle}
                onChangeMusicStickerStyle={setMusicStickerStyle}
                musicStickerPosition={musicStickerPosition}
                onChangeMusicStickerPosition={setMusicStickerPosition}
                isPlayingMusic={isPlayingMusic}
                onTogglePlaySong={handleTogglePlaySong}
                onOpenMusicPicker={() => setIsMusicPickerOpen(true)}
                onOpenTextEditor={() => setIsTextEditorOpen(true)}
                onOpenStickerPicker={() => setIsStickerPickerOpen(true)}
                onOpenFilterAdjuster={() => setIsFilterAdjusterOpen(true)}
                onRetakePhoto={() => setPhase('CAMERA')}
                onRemoveText={(idx) => setTexts(prev => prev.filter((_, i) => i !== idx))}
                onRemoveSticker={(idx) => setStickers(prev => prev.filter((_, i) => i !== idx))}
                onRemoveSong={() => {
                  storyAudioPlayer.stop();
                  setIsPlayingMusic(false);
                  setSelectedSong(null);
                }}
                onPublish={handlePublishAll}
                isPublishing={isPublishing}
              />
            )
          )}

          {activeStudioTab === 'MOOD' && (
            <div className="w-full h-full pt-16 pb-28 px-5 flex flex-col justify-center space-y-5 animate-fadeIn">
              <div className="text-center space-y-1">
                <h3 className="text-white text-base font-bold flex items-center justify-center gap-2">
                  <i className="bi bi-chat-quote-fill text-[#00E5FF]"></i>
                  Tâm Trạng Trên Ghim Bản Đồ
                </h3>
                <p className="text-white/60 text-xs">Hiển thị trực tiếp trên giọt nước cho bạn bè nhìn thấy</p>
              </div>

              {/* Ô Nhập Tâm Trạng */}
              <div className="relative bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md shadow-inner">
                <textarea
                  value={customStatusInput}
                  onChange={(e) => setCustomStatusInput(e.target.value)}
                  placeholder="Hôm nay bạn đang làm gì, nghĩ gì...?"
                  maxLength={100}
                  rows={3}
                  className="w-full bg-transparent text-white placeholder-white/40 text-sm focus:outline-none resize-none leading-relaxed"
                />
                <div className="flex justify-between items-center pt-2 text-[11px] text-white/40 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span>Tự động hiển thị kèm icon giọt nước</span>
                    {customStatusInput && (
                      <button
                        type="button"
                        onClick={() => setCustomStatusInput('')}
                        className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                        title="Xóa nội dung tâm trạng"
                      >
                        <i className="bi bi-x-circle-fill text-[10px]"></i>
                        <span>Xóa chữ</span>
                      </button>
                    )}
                  </div>
                  <span>{customStatusInput.length}/100</span>
                </div>
              </div>

              {/* Bộ Chọn Nhạc Online */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-xs font-semibold flex items-center gap-1.5">
                    <i className="bi bi-music-note-beamed text-[#FF2A85]"></i>
                    Nhạc nền giọt nước
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsMusicPickerOpen(true)}
                    className="text-xs text-[#00E5FF] hover:underline font-bold"
                  >
                    {selectedSong ? 'Đổi bài hát' : '+ Chọn bài hát'}
                  </button>
                </div>
                {selectedSong ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/10">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={selectedSong.coverUrl || selectedSong.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80'}
                        alt=""
                        className="w-9 h-9 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-white text-xs font-bold truncate">{selectedSong.title}</p>
                        <p className="text-white/50 text-[10px] truncate">{selectedSong.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleTogglePlaySong}
                        className="w-7 h-7 rounded-full bg-[#FF2A85] text-white flex items-center justify-center text-xs shadow-md"
                      >
                        <i className={`bi ${isPlayingMusic ? 'bi-pause-fill' : 'bi-play-fill'}`}></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          storyAudioPlayer.stop();
                          setIsPlayingMusic(false);
                          setSelectedSong(null);
                        }}
                        className="w-7 h-7 rounded-full bg-white/10 text-white/60 hover:text-white flex items-center justify-center text-xs"
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-white/40 text-[11px] italic">Chưa gắn nhạc nền cho giọt nước</p>
                )}
              </div>

              {/* Thời Hạn Tâm Trạng & Chibi */}
              <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded-xl border border-white/5">
                <span className="text-white/70 text-xs font-medium">Thời hạn tâm trạng:</span>
                <div className="flex gap-1.5">
                  {[1, 8, 24].map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setStatusExpiryHours(h)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        statusExpiryHours === h ? 'bg-[#00E5FF] text-black shadow-md' : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeStudioTab === 'CHIBI' && (
            <div className="w-full h-full pt-16 pb-28 px-4 flex flex-col justify-between animate-fadeIn overflow-y-auto no-scrollbar">
              <div className="space-y-3 pt-2">
                <div className="text-center">
                  <h3 className="text-white text-base font-bold flex items-center justify-center gap-2">
                    <i className="bi bi-stars text-amber-400"></i>
                    Linh Vật Chibi Mascot
                  </h3>
                  <p className="text-white/60 text-xs">Biểu cảm bồng bềnh bên cạnh giọt nước của Bạn</p>
                </div>

                {/* Gia Tộc Chibi Switcher */}
                <div className="flex gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/10">
                  {CHIBI_MASCOT_FAMILIES.map(fam => (
                    <button
                      key={fam.id}
                      type="button"
                      onClick={() => {
                        playTactileClickSound();
                        setActiveChibiFamily(fam.id);
                      }}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                        activeChibiFamily === fam.id ? 'bg-[#FF2A85] text-white shadow-md' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <span>{fam.icon}</span>
                      <span>{fam.name}</span>
                    </button>
                  ))}
                </div>

                {/* Grid 12 Sắc Thái Biểu Cảm Chibi */}
                <div className="grid grid-cols-4 gap-2.5 py-2">
                  {filteredMascots.map(mascot => {
                    const isSelected = selectedChibiId === mascot.id;
                    const dataUrl = getChibiDataUrl(mascot);
                    return (
                      <div
                        key={mascot.id}
                        onClick={() => handleSelectChibi(mascot)}
                        className={`flex flex-col items-center p-2 rounded-2xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#FF2A85]/25 border-2 border-[#FF2A85] scale-105 shadow-[0_0_15px_rgba(255,42,133,0.4)]'
                            : 'bg-white/5 border border-white/10 hover:bg-white/15'
                        }`}
                      >
                        <div className="w-12 h-12 flex items-center justify-center relative">
                          <img src={dataUrl} alt={mascot.name} className="w-full h-full object-contain filter drop-shadow-md" />
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF2A85] text-white rounded-full flex items-center justify-center text-[10px]">
                              <i className="bi bi-check"></i>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-white/90 text-center truncate max-w-full mt-1">
                          {mascot.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trạng thái Chibi đã chọn & Nút Gỡ Chibi */}
              <div className="p-3 bg-black/60 border border-white/15 rounded-2xl flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span className="text-xs text-white/90 font-medium">
                    {selectedChibiId ? `Đang gắn: ${getChibiMascotById(selectedChibiId)?.name}` : 'Chưa gắn linh vật'}
                  </span>
                </div>
                {selectedChibiId ? (
                  <button
                    type="button"
                    onClick={() => setSelectedChibiId(null)}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500 hover:text-white flex items-center gap-1.5 font-bold text-xs transition-all cursor-pointer active:scale-95"
                    title="Gỡ bỏ linh vật Chibi khỏi ghim"
                  >
                    <i className="bi bi-trash3-fill text-[11px]"></i>
                    <span>Gỡ Chibi đang gắn</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-white/40 italic">Chọn 1 linh vật ở trên để gắn</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* THANH CHUYỂN CHẾ ĐỘ THỐNG NHẤT Ở ĐÁY (Ẩn khi đang chỉnh sửa Story Canvas để toàn màn hình) */}
        {!(activeStudioTab === 'STORY' && phase === 'EDIT') && (
          <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black via-black/95 to-transparent pt-3 pb-4 px-4 flex items-center justify-around border-t border-white/10 backdrop-blur-xl">
            <button
              type="button"
              onClick={() => {
                playTactileClickSound();
                setActiveStudioTab('STORY');
              }}
              className={`flex flex-col items-center gap-1 transition-all py-1 px-3 rounded-2xl ${
                activeStudioTab === 'STORY' ? 'text-[#FF2A85] scale-110 font-bold bg-[#FF2A85]/15' : 'text-white/60 hover:text-white'
              }`}
            >
              <i className="bi bi-camera-reels-fill text-lg"></i>
              <span className="text-[10px]">📸 Story</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClickSound();
                setActiveStudioTab('MOOD');
              }}
              className={`flex flex-col items-center gap-1 transition-all py-1 px-3 rounded-2xl ${
                activeStudioTab === 'MOOD' ? 'text-[#00E5FF] scale-110 font-bold bg-[#00E5FF]/15' : 'text-white/60 hover:text-white'
              }`}
            >
              <i className="bi bi-chat-heart-fill text-lg"></i>
              <span className="text-[10px]">✍️ Tâm trạng</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTactileClickSound();
                setActiveStudioTab('CHIBI');
              }}
              className={`flex flex-col items-center gap-1 transition-all py-1 px-3 rounded-2xl ${
                activeStudioTab === 'CHIBI' ? 'text-amber-400 scale-110 font-bold bg-amber-400/15' : 'text-white/60 hover:text-white'
              }`}
            >
              <i className="bi bi-emoji-smile-fill text-lg"></i>
              <span className="text-[10px]">🧸 Mascot</span>
            </button>
          </div>
        )}

        {/* Sub-modals text, stickers, filter, music */}
        {isTextEditorOpen && (
          <StoryTextEditor
            onSave={(textData) => {
              setTexts(prev => [...prev, textData]);
              setIsTextEditorOpen(false);
            }}
            onCancel={() => setIsTextEditorOpen(false)}
          />
        )}

        {isStickerPickerOpen && (
          <StoryStickerPicker
            userLocationName={userLocationName}
            onSelectMeme={(stk) => setStickers(prev => [...prev, stk])}
            onAddPoll={(stk) => setStickers(prev => [...prev, stk])}
            onAddQA={(stk) => setStickers(prev => [...prev, stk])}
            onAddLocationBadge={(stk) => setStickers(prev => [...prev, stk])}
            onClose={() => setIsStickerPickerOpen(false)}
          />
        )}

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

        <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryFileSelect} />
      </div>
    </div>
  );
}
