import React from 'react';

/**
 * HighlightFormModal - Modal Tạo Nhóm Tin Nổi Bật Mới
 * Tách khỏi ProfileStoryHighlights.jsx để tuân thủ Rule 7 (< 450 dòng)
 */
export default function HighlightFormModal({
  isOpen,
  isSubmitting,
  uploadProgress,
  newTitle,
  setNewTitle,
  newCoverImage,
  coverInputRef,
  mediaFileInputRef,
  onSelectCover,
  onSelectNewMedia,
  activeTab,
  setActiveTab,
  archiveList,
  selectedArchiveStories,
  onToggleArchiveStory,
  uploadedMediaFiles,
  onRemoveUploadedMedia,
  errorMessage,
  onClose,
  onSubmit
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={() => !isSubmitting && onClose()}
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
            onClick={onClose}
            aria-label="Đóng tạo tin nổi bật"
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs cursor-pointer disabled:opacity-40"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
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
              onChange={onSelectCover}
              accept="image/*"
              aria-label="Chọn ảnh bìa tin nổi bật"
              className="hidden"
            />
            <span className="text-[10px] text-[#8E8E93]">Chạm vòng tròn để chọn ảnh bìa</span>
          </div>

          <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('archive')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-[#00E5FF] text-black shadow-sm font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <i className="bi bi-cloud-arrow-up" />
              <span>Tải Mới Từ Máy</span>
            </button>
          </div>

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
                        onClick={() => onToggleArchiveStory(item)}
                        className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                          isSelected
                            ? 'border-[#10FFA0] scale-95 shadow-md shadow-[#10FFA0]/40'
                            : 'border-white/15 hover:border-white/40'
                        }`}
                      >
                        {item.image ? (
                          <img src={item.image} alt={item.title || ''} className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full ${item.bg_gradient || 'bg-gradient-to-tr from-[#FF2A85] to-[#7928CA]'} flex items-center justify-center p-1 text-center text-[9px] font-bold text-white`}>
                            {item.title || 'Story'}
                          </div>
                        )}
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
                onChange={onSelectNewMedia}
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
                          onClick={() => onRemoveUploadedMedia(idx)}
                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/80 text-white flex items-center justify-center text-[9px] cursor-pointer"
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

          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs flex items-center gap-2">
              <i className="bi bi-exclamation-triangle-fill shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

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

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
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
  );
}
