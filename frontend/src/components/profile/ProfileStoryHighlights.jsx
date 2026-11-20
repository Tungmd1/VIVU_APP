import React, { useState, useEffect, useRef } from 'react';
import { playProfileChime, triggerProfileHaptic } from './profileAudioEffects';
import apiClient from '../../services/apiClient';

/**
 * ProfileStoryHighlights
 * Hàng Tin Nổi Bật (Highlights) trên trang cá nhân Profile.
 * - Lưu trữ bền vững 100% vào CSDL Backend qua REST API /api/profile/:userId/highlights
 * - Hỗ trợ cả 2 nguồn: Chọn từ Kho Lưu Trữ Story HOẶC Tải ảnh/video mới trực tiếp từ máy
 * - Tự động tải tệp tĩnh lên backend/uploads/highlights/ tối ưu cho môi trường VPS
 * - 100% Bootstrap Icons, Dark Monochrome Cyberpunk theme.
 */
export default function ProfileStoryHighlights({
  userId = 'guest',
  onOpenHighlight
}) {
  const storageKey = `vivu_user_highlights_${userId}`;

  // State danh sách Tin Nổi Bật
  const [highlights, setHighlights] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('archive'); // 'archive' | 'upload'
  const [newTitle, setNewTitle] = useState('');
  const [newCoverImage, setNewCoverImage] = useState(null);
  const [selectedArchiveStories, setSelectedArchiveStories] = useState([]);
  const [uploadedMediaFiles, setUploadedMediaFiles] = useState([]); // [{ file, previewUrl, type }]
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Xem chi tiết Highlight được chọn
  const [viewingHighlight, setViewingHighlight] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const coverInputRef = useRef(null);
  const mediaFileInputRef = useRef(null);

  // 1. Tải danh sách Highlights từ Backend API
  const fetchHighlights = async () => {
    if (!userId || userId === 'guest') return;
    setIsLoading(true);
    try {
      const remoteHls = await apiClient.getHighlights(userId);
      if (Array.isArray(remoteHls)) {
        setHighlights(remoteHls);
        try {
          localStorage.setItem(storageKey, JSON.stringify(remoteHls));
        } catch {}
      }
    } catch (e) {
      console.warn('[ProfileStoryHighlights] Lỗi tải highlights:', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, [userId]);

  // 2. Đọc danh sách ảnh từ Kho Lưu Trữ Story để chọn nhanh
  const archiveStorageKey = `vivu_user_story_archive_${userId}`;
  const archiveList = (() => {
    try {
      const saved = localStorage.getItem(archiveStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  })();

  // 3. Chọn ảnh bìa từ máy
  const handleSelectCover = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await apiClient.uploadMedia(file, 'highlights');
      if (res && res.url) {
        setNewCoverImage(res.url);
        playProfileChime();
      }
    } catch (err) {
      // Fallback base64 nếu mạng yếu
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCoverImage(reader.result);
        playProfileChime();
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // 4. Thêm tệp mới tải trực tiếp từ máy để làm tin nổi bật
  const handleSelectNewMedia = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (const f of files) {
      const isVideo = f.type.startsWith('video/');
      const objectUrl = URL.createObjectURL(f);
      setUploadedMediaFiles(prev => [...prev, { file: f, previewUrl: objectUrl, type: isVideo ? 'video' : 'image', name: f.name }]);
      if (!newCoverImage && !isVideo) {
        setNewCoverImage(objectUrl);
      }
    }
    playProfileChime();
    e.target.value = '';
  };

  // 5. Toggle chọn story từ kho lưu trữ
  const toggleSelectArchiveStory = (item) => {
    const isSelected = selectedArchiveStories.some(s => (s.id && s.id === item.id) || (s.image && s.image === item.image));
    if (isSelected) {
      setSelectedArchiveStories(prev => prev.filter(s => (s.id ? s.id !== item.id : s.image !== item.image)));
    } else {
      setSelectedArchiveStories(prev => [...prev, item]);
      if (!newCoverImage) {
        setNewCoverImage(item.image);
      }
    }
    triggerProfileHaptic([15]);
  };

  // 6. Xử lý tạo Nhóm Tin Nổi Bật mới
  const handleCreateHighlight = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      let finalStories = [];

      // 6.1. Nếu có tệp mới tải từ máy -> Tải lên backend/uploads/highlights/
      if (uploadedMediaFiles.length > 0) {
        let uploadedCount = 0;
        for (const item of uploadedMediaFiles) {
          try {
            const res = await apiClient.uploadMedia(item.file, 'highlights', (p) => {
              const base = Math.round((uploadedCount / uploadedMediaFiles.length) * 80);
              const cur = Math.round((p / uploadedMediaFiles.length) * 0.8);
              setUploadProgress(base + cur);
            });
            if (res && res.url) {
              finalStories.push({
                id: `hl-media-${Date.now()}-${uploadedCount}`,
                title: newTitle.trim(),
                image: res.type === 'video' ? '' : res.url,
                video: res.type === 'video' ? res.url : null,
                created_at: new Date().toISOString()
              });
            }
          } catch (upErr) {
            console.warn('[Highlights] Lỗi upload tệp:', upErr);
          }
          uploadedCount++;
        }
      }

      // 6.2. Thêm các story đã chọn từ kho lưu trữ
      selectedArchiveStories.forEach((as, idx) => {
        finalStories.push({
          id: as.id || `hl-arch-${Date.now()}-${idx}`,
          title: as.title || newTitle.trim(),
          image: as.image || '',
          video: as.video || null,
          created_at: as.created_at || new Date().toISOString()
        });
      });

      // Nếu không chọn story nào thì tạo 1 mục mặc định từ bìa
      if (finalStories.length === 0 && newCoverImage) {
        finalStories.push({
          id: `hl-story-${Date.now()}`,
          title: newTitle.trim(),
          image: newCoverImage,
          created_at: new Date().toISOString()
        });
      }

      const finalCover = newCoverImage || finalStories[0]?.image || finalStories[0]?.video || '';

      // 6.3. Gọi Backend API lưu trữ CSDL bền vững
      const createdHl = await apiClient.createHighlight(userId, {
        title: newTitle.trim(),
        coverImage: finalCover,
        stories: finalStories
      });

      // Cập nhật state
      const updated = [createdHl, ...highlights.filter(h => h.id !== createdHl.id)];
      setHighlights(updated);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}

      playProfileChime();
      triggerProfileHaptic([30, 20]);

      // Reset form
      setNewTitle('');
      setNewCoverImage(null);
      setSelectedArchiveStories([]);
      setUploadedMediaFiles([]);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.warn('[ProfileStoryHighlights] Lỗi tạo highlight:', err.message);
      alert(err.message || 'Lỗi khi tạo tin nổi bật. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // 7. Xóa nhóm Tin Nổi Bật
  const handleDeleteHighlight = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Xóa nhóm tin nổi bật này khỏi hồ sơ?')) return;

    try {
      await apiClient.deleteHighlight(userId, id);
      const updated = highlights.filter(h => h.id !== id);
      setHighlights(updated);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
      triggerProfileHaptic([20]);
    } catch (err) {
      console.warn('Lỗi xóa highlight:', err);
    }
  };

  // 8. Bấm xem Highlight
  const handleOpenHighlight = (hl) => {
    if (onOpenHighlight) {
      onOpenHighlight(hl);
    } else {
      setViewingHighlight(hl);
      setCurrentStoryIndex(0);
    }
  };

  return (
    <div className="p-4 rounded-3xl bg-[#121520] border border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="bi bi-stars text-[#10FFA0] text-base" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Tin Nổi Bật ({highlights.length})
          </span>
        </div>
        {isLoading && (
          <span className="w-3.5 h-3.5 border-2 border-[#10FFA0] border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Hàng cuộn tròn Stories Highlights */}
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
        {/* Nút (+) Tạo Tin Nổi Bật Mới */}
        <div
          onClick={() => {
            setIsCreateModalOpen(true);
            setActiveTab(archiveList.length > 0 ? 'archive' : 'upload');
          }}
          className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
          title="Tạo nhóm tin nổi bật mới"
        >
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 group-hover:border-[#10FFA0] bg-white/5 flex items-center justify-center transition-all group-active:scale-95 shadow-md">
            <i className="bi bi-plus-lg text-lg text-white/60 group-hover:text-[#10FFA0] transition-colors" />
          </div>
          <span className="text-[11px] font-medium text-white/70 group-hover:text-white truncate max-w-[64px] text-center">
            Mới
          </span>
        </div>

        {/* Danh sách các nhóm Tin Nổi Bật */}
        {highlights.map((hl) => {
          const cover = hl.cover_image || hl.coverImage || hl.stories?.[0]?.image || '';
          return (
            <div
              key={hl.id}
              onClick={() => handleOpenHighlight(hl)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group relative"
              title={`Xem tin nổi bật: ${hl.title}`}
            >
              {/* Vòng tròn viền Gradient rực rỡ */}
              <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#10FFA0] via-[#00E5FF] to-[#FF2A85] shadow-lg group-hover:scale-105 transition-transform flex items-center justify-center">
                <div className="w-full h-full rounded-full overflow-hidden bg-black p-[2px]">
                  {cover ? (
                    <img
                      src={cover}
                      alt={hl.title}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center text-white/60">
                      <i className="bi bi-star-fill text-sm text-[#10FFA0]" />
                    </div>
                  )}
                </div>
              </div>

              <span className="text-[11px] font-medium text-white/90 truncate max-w-[68px] text-center">
                {hl.title}
              </span>

              {/* Nút xóa nhóm nhỏ khi hover */}
              <button
                type="button"
                onClick={(e) => handleDeleteHighlight(hl.id, e)}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black/80 hover:bg-rose-600 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity border border-white/20 cursor-pointer"
                title="Xóa nhóm này"
              >
                <i className="bi bi-x" />
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL TẠO NHÓM TIN NỔI BẬT */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => !isSubmitting && setIsCreateModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-[#1A1A1E] border border-white/15 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <i className="bi bi-stars text-[#10FFA0] text-lg" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tin Nổi Bật Mới</h3>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsCreateModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs cursor-pointer disabled:opacity-40"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form onSubmit={handleCreateHighlight} className="space-y-4">
              {/* Tên nhóm tin nổi bật */}
              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1.5">
                  Tên nhóm nổi bật <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Du lịch, Chill cuối tuần, Kỷ niệm..."
                  maxLength={30}
                  aria-label="Tên album tin nổi bật"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-3.5 rounded-2xl bg-[#151619] border border-white/10 text-white font-medium text-xs placeholder-[#8E8E93] focus:border-[#10FFA0] focus:ring-1 focus:ring-[#10FFA0]/30 outline-none"
                  autoFocus
                />
              </div>

              {/* Vùng chọn ảnh bìa */}
              <div className="flex flex-col items-center justify-center space-y-1.5 py-1">
                <div
                  onClick={() => !isSubmitting && coverInputRef.current?.click()}
                  className="w-20 h-20 rounded-full border-2 border-dashed border-white/20 hover:border-[#10FFA0] bg-white/5 flex items-center justify-center overflow-hidden cursor-pointer group shadow-inner"
                  title="Chạm để đổi ảnh bìa"
                >
                  {newCoverImage ? (
                    <img src={newCoverImage} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2">
                      <i className="bi bi-camera text-xl text-white/50 group-hover:text-[#10FFA0]" />
                      <span className="text-[10px] text-white/40 block mt-0.5">Ảnh Bìa</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={coverInputRef}
                  onChange={handleSelectCover}
                  accept="image/*"
                  aria-label="Chọn ảnh bìa tin nổi bật"
                  className="hidden"
                />
                <span className="text-[10px] text-[#8E8E93]">Chạm vòng tròn để chọn ảnh bìa</span>
              </div>

              {/* Tab chuyển đổi nguồn Story: Từ Kho Lưu Trữ hoặc Tải Mới Từ Máy */}
              <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('archive')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'archive'
                      ? 'bg-[#10FFA0] text-black shadow-sm font-bold'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <i className="bi bi-clock-history" />
                  <span>Từ Kho Lưu Trữ ({archiveList.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'upload'
                      ? 'bg-[#00E5FF] text-black shadow-sm font-bold'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <i className="bi bi-cloud-arrow-up" />
                  <span>Tải Mới Từ Máy</span>
                </button>
              </div>

              {/* NỘI DUNG TAB 1: Kho Lưu Trữ */}
              {activeTab === 'archive' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-white/70">
                    <span>Chọn Story muốn đưa vào nhóm ({selectedArchiveStories.length} đã chọn):</span>
                  </div>
                  {archiveList.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-white/5 text-center text-white/50 text-xs">
                      Chưa có Story nào trong kho lưu trữ. Bạn có thể chuyển sang tab "Tải Mới Từ Máy"!
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto no-scrollbar p-1">
                      {archiveList.map((item, idx) => {
                        const isSelected = selectedArchiveStories.some(s => (s.id && s.id === item.id) || (s.image && s.image === item.image));
                        return (
                          <div
                            key={idx}
                            onClick={() => toggleSelectArchiveStory(item)}
                            className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                              isSelected
                                ? 'border-[#10FFA0] scale-95 shadow-md shadow-[#10FFA0]/40'
                                : 'border-white/15 hover:border-white/40'
                            }`}
                          >
                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#10FFA0] text-black flex items-center justify-center text-xs font-bold">
                                <i className="bi bi-check" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* NỘI DUNG TAB 2: Tải Mới Từ Máy */}
              {activeTab === 'upload' && (
                <div className="space-y-2">
                  <div
                    onClick={() => !isSubmitting && mediaFileInputRef.current?.click()}
                    className="p-5 rounded-2xl border-2 border-dashed border-[#00E5FF]/40 hover:border-[#00E5FF] bg-[#00E5FF]/5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                  >
                    <i className="bi bi-images text-2xl text-[#00E5FF]" />
                    <p className="text-xs font-bold text-white">Chạm để chọn Ảnh hoặc Video từ thiết bị</p>
                    <p className="text-[10px] text-white/50">Hỗ trợ định dạng JPG, PNG, WebP, MP4</p>
                  </div>
                  <input
                    type="file"
                    ref={mediaFileInputRef}
                    onChange={handleSelectNewMedia}
                    accept="image/*,video/*"
                    multiple
                    aria-label="Chọn ảnh hoặc video cho tin nổi bật"
                    className="hidden"
                  />

                  {uploadedMediaFiles.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-white/60 font-semibold uppercase">
                        Đã chọn ({uploadedMediaFiles.length}):
                      </span>
                      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                        {uploadedMediaFiles.map((m, idx) => (
                          <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden border border-white/20 shrink-0">
                            {m.type === 'video' ? (
                              <video src={m.previewUrl} className="w-full h-full object-cover" />
                            ) : (
                              <img src={m.previewUrl} alt="" className="w-full h-full object-cover" />
                            )}
                            <button
                              type="button"
                              onClick={() => setUploadedMediaFiles(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/80 text-white flex items-center justify-center text-[9px]"
                            >
                              <i className="bi bi-x" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tiến trình Upload nếu đang lưu */}
              {isSubmitting && (
                <div className="space-y-1.5 py-1">
                  <div className="flex items-center justify-between text-xs text-[#10FFA0] font-bold">
                    <span>Đang lưu trữ bền vững lên CSDL...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#10FFA0] to-[#00E5FF] transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Nút hành động */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer disabled:opacity-40"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim() || isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#10FFA0] hover:bg-[#00E5FF] disabled:opacity-40 text-black text-xs font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2 text-base" />
                      <span>Tạo Tin Nổi Bật</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEWER XEM CHI TIẾT TIN NỔI BẬT NỘI BỘ */}
      {viewingHighlight && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 animate-in fade-in"
          onClick={() => setViewingHighlight(null)}
        >
          {/* Header */}
          <div className="flex items-center justify-between text-white z-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden bg-black">
                <img
                  src={viewingHighlight.cover_image || viewingHighlight.coverImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{viewingHighlight.title}</p>
                <p className="text-[10px] text-white/50">
                  {viewingHighlight.stories?.length || 1} khoảnh khắc
                </p>
              </div>
            </div>
            <button
              onClick={() => setViewingHighlight(null)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm cursor-pointer"
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>

          {/* Media Player */}
          <div className="flex-1 flex items-center justify-center p-2 relative" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const currentStory = viewingHighlight.stories?.[currentStoryIndex] || {
                image: viewingHighlight.cover_image || viewingHighlight.coverImage
              };
              if (currentStory.video) {
                return (
                  <video
                    src={currentStory.video}
                    controls
                    autoPlay
                    playsInline
                    className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
                  />
                );
              }
              return (
                <img
                  src={currentStory.image}
                  alt={currentStory.title}
                  className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
                />
              );
            })()}

            {/* Nút Previous & Next */}
            {(viewingHighlight.stories?.length || 0) > 1 && (
              <>
                {currentStoryIndex > 0 && (
                  <button
                    onClick={() => setCurrentStoryIndex(prev => prev - 1)}
                    className="absolute left-4 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 cursor-pointer"
                  >
                    <i className="bi bi-chevron-left" />
                  </button>
                )}
                {currentStoryIndex < (viewingHighlight.stories?.length || 1) - 1 && (
                  <button
                    onClick={() => setCurrentStoryIndex(prev => prev + 1)}
                    className="absolute right-4 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 cursor-pointer"
                  >
                    <i className="bi bi-chevron-right" />
                  </button>
                )}
              </>
            )}
          </div>

          <div className="w-full text-center py-2 text-white/40 text-[11px]">
            Chạm ra ngoài để đóng
          </div>
        </div>
      )}
    </div>
  );
}
