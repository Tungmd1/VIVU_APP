import React from 'react';

/**
 * ProfileMediaSection - Bộ Sưu Tập Ảnh & Kho Lưu Trữ Story Cá Nhân
 * Tách khỏi ProfilePageView.jsx để tuân thủ Rule 7 (< 450 dòng).
 */
export default function ProfileMediaSection({
  mediaTab,
  setMediaTab,
  photos,
  archiveItems,
  multiPhotoInputRef,
  handleAddPhotos,
  handleRemovePhoto,
  handleRemoveArchiveItem,
  photoActionError,
  setPhotoActionError,
  confirmDeletePhotoIdx,
  confirmDeleteArchiveId,
  setViewingPhoto
}) {
  return (
    <div className="p-4 rounded-3xl bg-[#121520] border border-white/10 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMediaTab('photos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              mediaTab === 'photos'
                ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <i className="bi bi-images" />
            <span>Thư Viện Ảnh ({photos.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMediaTab('archive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              mediaTab === 'archive'
                ? 'bg-[#10FFA0]/20 text-[#10FFA0] border border-[#10FFA0]/40 shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <i className="bi bi-archive-fill" />
            <span>Kho Lưu Trữ ({archiveItems.length})</span>
          </button>
        </div>

        {mediaTab === 'photos' && (
          <button
            type="button"
            onClick={() => multiPhotoInputRef.current?.click()}
            className="px-3 py-1 rounded-full bg-[#FF2A85]/20 hover:bg-[#FF2A85]/30 text-[#FF529D] border border-[#FF2A85]/40 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <i className="bi bi-plus-lg" />
            <span>Thêm ảnh</span>
          </button>
        )}
        <input
          type="file"
          ref={multiPhotoInputRef}
          onChange={handleAddPhotos}
          accept="image/*"
          multiple
          aria-label="Tải ảnh lên bộ sưu tập cá nhân"
          className="hidden"
        />
      </div>

      {photoActionError && (
        <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <span>{photoActionError}</span>
          <button type="button" onClick={() => setPhotoActionError('')} className="text-white/70 hover:text-white cursor-pointer">
            <i className="bi bi-x" />
          </button>
        </div>
      )}

      {mediaTab === 'photos' && (
        photos.length === 0 ? (
          <div onClick={() => multiPhotoInputRef.current?.click()} className="p-8 rounded-2xl border-2 border-dashed border-white/15 bg-white/5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-white/30 transition-colors">
            <i className="bi bi-cloud-arrow-up text-3xl text-white/40 mb-2" />
            <p className="text-xs font-bold text-white/80">Chưa có ảnh nào được tải lên</p>
            <p className="text-[11px] text-white/40 mt-0.5">Chạm vào đây để chọn ảnh từ máy thiết bị của bạn</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((imgSrc, idx) => (
              <div key={idx} onClick={() => setViewingPhoto(imgSrc)} className="relative aspect-square rounded-2xl overflow-hidden bg-black/40 border border-white/10 group cursor-pointer">
                <img src={imgSrc} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <button
                  type="button"
                  onClick={(e) => handleRemovePhoto(idx, e)}
                  className={`absolute top-1.5 right-1.5 rounded-full text-white flex items-center justify-center transition-all cursor-pointer ${
                    confirmDeletePhotoIdx === idx
                      ? 'px-2 h-6 bg-rose-600 text-[10px] font-bold opacity-100'
                      : 'w-6 h-6 bg-black/70 hover:bg-rose-600 text-xs opacity-80 group-hover:opacity-100'
                  }`}
                  title={confirmDeletePhotoIdx === idx ? 'Bấm lần nữa để xác nhận xóa' : 'Xóa ảnh này'}
                >
                  {confirmDeletePhotoIdx === idx ? 'Xóa?' : <i className="bi bi-trash" />}
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {mediaTab === 'archive' && (
        archiveItems.length === 0 ? (
          <div className="p-8 rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center justify-center text-center">
            <i className="bi bi-archive text-3xl text-white/30 mb-2" />
            <p className="text-xs font-bold text-white/80">Kho Lưu Trữ Đang Trống</p>
            <p className="text-[11px] text-white/40 mt-1 max-w-xs">Khoảnh khắc sẽ tự động được lưu trữ an toàn tại đây để xem lại hoặc đưa lên Tin Nổi Bật.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {archiveItems.map((item, idx) => (
              <div
                key={item.id || idx}
                onClick={() => item.image && setViewingPhoto(item.image)}
                className="relative aspect-square rounded-2xl overflow-hidden bg-black/50 border border-white/10 group cursor-pointer shadow-md"
              >
                {item.video ? (
                  <video src={item.video} muted playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : item.image ? (
                  <img src={item.image} alt={item.title || 'Archived'} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className={`w-full h-full ${item.bg_gradient || 'bg-gradient-to-tr from-[#FF2A85] via-purple-600 to-[#7928CA]'} flex items-center justify-center p-2 text-center`}>
                    <span className="text-[10px] font-bold text-white line-clamp-3">{item.title || item.caption || 'Khoảnh khắc'}</span>
                  </div>
                )}
                <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-mono text-[#10FFA0] flex items-center gap-1 border border-white/10">
                  <i className="bi bi-clock-history text-[8px]" />
                  <span>{new Date(item.created_at || Date.now()).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleRemoveArchiveItem(item.id, e)}
                  className={`absolute top-1.5 right-1.5 rounded-full text-white flex items-center justify-center transition-all shadow-md cursor-pointer ${
                    confirmDeleteArchiveId === item.id
                      ? 'px-2 h-6 bg-rose-600 text-[10px] font-bold opacity-100'
                      : 'w-6 h-6 bg-black/70 hover:bg-rose-600 text-xs opacity-80 group-hover:opacity-100'
                  }`}
                  title={confirmDeleteArchiveId === item.id ? 'Bấm lần nữa để xóa' : 'Xóa vĩnh viễn khỏi Kho Lưu Trữ'}
                >
                  {confirmDeleteArchiveId === item.id ? 'Xóa?' : <i className="bi bi-trash" />}
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
