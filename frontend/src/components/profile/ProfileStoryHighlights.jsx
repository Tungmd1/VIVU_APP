import React, { useState, useRef } from 'react';
import { playProfileChime, triggerProfileHaptic } from './profileAudioEffects';

/**
 * ProfileStoryHighlights
 * Hàng Tin Nổi Bật (Highlights) trên trang cá nhân Profile.
 * - Nút (+) để thêm nhóm tin nổi bật mới.
 * - Các vòng tròn Story Highlights viền gradient năng động.
 * - Cho phép bấm xem hoặc xóa nhóm nổi bật.
 * - 100% Bootstrap Icons, Dark Monochrome theme.
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
    // Mặc định ban đầu có thể để rỗng để tránh mockup
    return [];
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCoverImage, setNewCoverImage] = useState(null);
  const coverInputRef = useRef(null);

  // Đọc danh sách ảnh từ Kho Lưu Trữ Story để chọn nhanh
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

  const saveHighlights = (updated) => {
    setHighlights(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {}
  };

  const handleSelectCover = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa 8MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewCoverImage(reader.result);
      playProfileChime();
    };
    reader.readAsDataURL(file);
  };

  const handleCreateHighlight = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newHighlight = {
      id: `highlight-${Date.now()}`,
      title: newTitle.trim(),
      coverImage: newCoverImage || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
      stories: [
        {
          id: `hl-story-${Date.now()}`,
          title: newTitle.trim(),
          image: newCoverImage || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
          created_at: new Date().toISOString()
        }
      ],
      created_at: new Date().toISOString()
    };

    saveHighlights([...highlights, newHighlight]);
    playProfileChime();
    triggerProfileHaptic([30, 20]);
    setNewTitle('');
    setNewCoverImage(null);
    setIsCreateModalOpen(false);
  };

  const handleDeleteHighlight = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Xóa nhóm tin nổi bật này khỏi hồ sơ?')) {
      saveHighlights(highlights.filter(h => h.id !== id));
      triggerProfileHaptic([20]);
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
      </div>

      {/* Hàng cuộn tròn Stories Highlights */}
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
        {/* Nút (+) Tạo Tin Nổi Bật Mới */}
        <div
          onClick={() => setIsCreateModalOpen(true)}
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
        {highlights.map((hl) => (
          <div
            key={hl.id}
            onClick={() => onOpenHighlight && onOpenHighlight(hl)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group relative"
            title={`Xem tin nổi bật: ${hl.title}`}
          >
            {/* Vòng tròn viền Gradient rực rỡ */}
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#10FFA0] via-[#00E5FF] to-[#FF2A85] shadow-lg group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full rounded-full overflow-hidden bg-black p-[2px]">
                <img
                  src={hl.coverImage}
                  alt={hl.title}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>

            <span className="text-[11px] font-medium text-white/90 truncate max-w-[68px] text-center">
              {hl.title}
            </span>

            {/* Nút xóa nhóm nhỏ khi hover */}
            <button
              type="button"
              onClick={(e) => handleDeleteHighlight(hl.id, e)}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black/80 hover:bg-rose-600 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity border border-white/20"
              title="Xóa nhóm này"
            >
              <i className="bi bi-x" />
            </button>
          </div>
        ))}
      </div>

      {/* MODAL TẠO NHÓM TIN NỔI BẬT */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-[#1A1A1E] border border-white/15 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <i className="bi bi-stars text-[#10FFA0] text-lg" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tin Nổi Bật Mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form onSubmit={handleCreateHighlight} className="space-y-4">
              {/* Vùng chọn ảnh bìa */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className="w-20 h-20 rounded-full border-2 border-dashed border-white/20 hover:border-[#10FFA0] bg-white/5 flex items-center justify-center overflow-hidden cursor-pointer group shadow-inner"
                >
                  {newCoverImage ? (
                    <img src={newCoverImage} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2">
                      <i className="bi bi-camera text-xl text-white/50 group-hover:text-[#10FFA0]" />
                      <span className="text-[10px] text-white/40 block mt-0.5">Bìa</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={coverInputRef}
                  onChange={handleSelectCover}
                  accept="image/*"
                  className="hidden"
                />
                <span className="text-[11px] text-[#8E8E93]">Chạm vào vòng tròn để chọn ảnh bìa</span>

                {archiveList.length > 0 && (
                  <div className="w-full pt-1 space-y-1.5">
                    <span className="text-[10px] text-white/60 font-semibold uppercase tracking-wider block text-left">
                      Hoặc chọn ảnh từ Kho Lưu Trữ ({archiveList.length}):
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                      {archiveList.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setNewCoverImage(item.image);
                            playProfileChime();
                          }}
                          className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer border-2 transition-all ${
                            newCoverImage === item.image ? 'border-[#10FFA0] scale-105 shadow-md shadow-[#10FFA0]/30' : 'border-white/15 hover:border-white/40'
                          }`}
                        >
                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tên nhóm tin nổi bật */}
              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1.5">
                  Tên nhóm nổi bật <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Du lịch, Chill cuối tuần..."
                  maxLength={25}
                  className="w-full py-2.5 px-3.5 rounded-2xl bg-[#151619] border border-white/10 text-white font-medium text-xs placeholder-[#8E8E93] focus:border-[#10FFA0] focus:ring-1 focus:ring-[#10FFA0]/30 outline-none"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#10FFA0] hover:bg-[#00E5FF] disabled:opacity-40 text-black text-xs font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <i className="bi bi-check2 text-base" />
                  <span>Tạo Tin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

