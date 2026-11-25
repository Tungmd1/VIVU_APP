import React, { useState, useEffect, useRef } from 'react';
import { playProfileChime, triggerProfileHaptic } from './profileAudioEffects';
import apiClient from '../../services/apiClient';
import HighlightFormModal from './HighlightFormModal';
import HighlightViewerModal from './HighlightViewerModal';

/**
 * ProfileStoryHighlights
 * Hàng Tin Nổi Bật (Highlights) trên trang cá nhân Profile.
 * - Lưu trữ bền vững 100% vào CSDL Backend qua REST API /api/profile/:userId/highlights
 * - Hỗ trợ cả 2 nguồn: Chọn từ Kho Lưu Trữ Story HOẶC Tải ảnh/video mới trực tiếp từ máy
 * - 100% Bootstrap Icons, Dark Monochrome Cyberpunk theme, < 250 dòng (Rule 7).
 */
export default function ProfileStoryHighlights({
  userId = 'guest',
  onOpenHighlight
}) {
  const storageKey = `vivu_user_highlights_${userId}`;

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
  const [activeTab, setActiveTab] = useState('archive');
  const [newTitle, setNewTitle] = useState('');
  const [newCoverImage, setNewCoverImage] = useState(null);
  const [selectedArchiveStories, setSelectedArchiveStories] = useState([]);
  const [uploadedMediaFiles, setUploadedMediaFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formError, setFormError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [viewingHighlight, setViewingHighlight] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const coverInputRef = useRef(null);
  const mediaFileInputRef = useRef(null);

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

  const handleSelectCover = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await apiClient.uploadMedia(file, 'highlights');
      if (res && res.url) {
        setNewCoverImage(res.url);
        playProfileChime();
      }
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCoverImage(reader.result);
        playProfileChime();
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleSelectNewMedia = (e) => {
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

  const toggleSelectArchiveStory = (item) => {
    const isSelected = selectedArchiveStories.some(s => (s.id && s.id === item.id) || (s.image && s.image === item.image));
    if (isSelected) {
      setSelectedArchiveStories(prev => prev.filter(s => (s.id ? s.id !== item.id : s.image !== item.image)));
    } else {
      setSelectedArchiveStories(prev => [...prev, item]);
      if (!newCoverImage && item.image) {
        setNewCoverImage(item.image);
      }
    }
    triggerProfileHaptic([15]);
  };

  const handleCreateHighlight = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || isSubmitting) return;
    setFormError('');
    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      const finalStories = [];

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

      selectedArchiveStories.forEach((as, idx) => {
        finalStories.push({
          id: as.id || `hl-arch-${Date.now()}-${idx}`,
          title: as.title || newTitle.trim(),
          image: as.image || '',
          video: as.video || null,
          created_at: as.created_at || new Date().toISOString()
        });
      });

      if (finalStories.length === 0 && newCoverImage) {
        finalStories.push({
          id: `hl-story-${Date.now()}`,
          title: newTitle.trim(),
          image: newCoverImage,
          created_at: new Date().toISOString()
        });
      }

      const finalCover = newCoverImage || finalStories[0]?.image || finalStories[0]?.video || '';
      const createdHl = await apiClient.createHighlight(userId, {
        title: newTitle.trim(),
        coverImage: finalCover,
        stories: finalStories
      });

      const updated = [createdHl, ...highlights.filter(h => h.id !== createdHl.id)];
      setHighlights(updated);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}

      playProfileChime();
      triggerProfileHaptic([30, 20]);

      setNewTitle('');
      setNewCoverImage(null);
      setSelectedArchiveStories([]);
      setUploadedMediaFiles([]);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.warn('[ProfileStoryHighlights] Lỗi tạo highlight:', err.message);
      setFormError(err.message || 'Lỗi khi tạo tin nổi bật. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteHighlight = async (id, e) => {
    e.stopPropagation();
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setConfirmDeleteId(null);
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

      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
        <div
          onClick={() => {
            setFormError('');
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

        {highlights.map((hl) => {
          const cover = hl.cover_image || hl.coverImage || hl.stories?.[0]?.image || '';
          const isArmedDelete = confirmDeleteId === hl.id;
          return (
            <div
              key={hl.id}
              onClick={() => handleOpenHighlight(hl)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group relative"
              title={`Xem tin nổi bật: ${hl.title}`}
            >
              <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#10FFA0] via-[#00E5FF] to-[#FF2A85] shadow-lg group-hover:scale-105 transition-transform flex items-center justify-center">
                <div className="w-full h-full rounded-full overflow-hidden bg-black p-[2px]">
                  {cover ? (
                    <img src={cover} alt={hl.title} className="w-full h-full rounded-full object-cover" />
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

              <button
                type="button"
                onClick={(e) => handleDeleteHighlight(hl.id, e)}
                className={`absolute -top-1 -right-1 rounded-full text-white flex items-center justify-center transition-all border border-white/20 cursor-pointer ${
                  isArmedDelete
                    ? 'px-1.5 h-5 bg-rose-600 text-[9px] font-bold opacity-100'
                    : 'w-5 h-5 bg-black/80 hover:bg-rose-600 text-[10px] opacity-0 group-hover:opacity-100'
                }`}
                title={isArmedDelete ? 'Bấm lần nữa để xác nhận xóa' : 'Xóa nhóm này'}
              >
                {isArmedDelete ? 'Xóa?' : <i className="bi bi-x" />}
              </button>
            </div>
          );
        })}
      </div>

      <HighlightFormModal
        isOpen={isCreateModalOpen}
        isSubmitting={isSubmitting}
        uploadProgress={uploadProgress}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        newCoverImage={newCoverImage}
        coverInputRef={coverInputRef}
        mediaFileInputRef={mediaFileInputRef}
        onSelectCover={handleSelectCover}
        onSelectNewMedia={handleSelectNewMedia}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        archiveList={archiveList}
        selectedArchiveStories={selectedArchiveStories}
        onToggleArchiveStory={toggleSelectArchiveStory}
        uploadedMediaFiles={uploadedMediaFiles}
        onRemoveUploadedMedia={(idx) => setUploadedMediaFiles(prev => prev.filter((_, i) => i !== idx))}
        errorMessage={formError}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateHighlight}
      />

      <HighlightViewerModal
        highlight={viewingHighlight}
        currentStoryIndex={currentStoryIndex}
        setCurrentStoryIndex={setCurrentStoryIndex}
        onClose={() => setViewingHighlight(null)}
      />
    </div>
  );
}
