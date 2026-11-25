import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../services/apiClient';

export const SAVED_PLACE_CATEGORIES = [
  { id: 'food', label: 'Ăn uống', icon: 'bi-cup-hot', color: '#F59E0B' },
  { id: 'music', label: 'Âm nhạc', icon: 'bi-music-note', color: '#FF2A85' },
  { id: 'dance', label: 'Nhảy múa', icon: 'bi-activity', color: '#A855F7' },
  { id: 'sightseeing', label: 'Danh lam', icon: 'bi-compass', color: '#00E5FF' }
];

/**
 * SavedPlaceModal - Modal Tạo / Sửa Địa Điểm Đã Lưu Trên Bản Đồ
 * Hỗ trợ đủ 4 danh mục chuẩn VIVU (food, music, dance, sightseeing) + Upload ảnh lên VPS.
 * 100% Bootstrap Icons, không dùng hộp thoại chặn luồng trình duyệt.
 */
export default function SavedPlaceModal({
  isOpen,
  onClose,
  initialPlace = null,
  defaultCoords = null,
  userLat = null,
  userLng = null,
  onSave,
  onDelete
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('food');
  const [notes, setNotes] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [image, setImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg('');
    setConfirmDelete(false);
    if (initialPlace) {
      setName(initialPlace.name || '');
      const normalizedCat = SAVED_PLACE_CATEGORIES.some(c => c.id === initialPlace.category)
        ? initialPlace.category
        : initialPlace.category === 'dining' || initialPlace.category === 'cafe_dating'
        ? 'food'
        : initialPlace.category === 'dancing'
        ? 'dance'
        : 'sightseeing';
      setCategory(normalizedCat);
      setNotes(initialPlace.notes || '');
      setLat(initialPlace.lat != null ? String(initialPlace.lat) : '');
      setLng(initialPlace.lng != null ? String(initialPlace.lng) : '');
      setImage(initialPlace.image || '');
    } else {
      const startLat = defaultCoords?.lat ?? userLat ?? '';
      const startLng = defaultCoords?.lng ?? userLng ?? '';
      setName('');
      setCategory('food');
      setNotes('');
      setLat(startLat !== '' ? Number(startLat).toFixed(6) : '');
      setLng(startLng !== '' ? Number(startLng).toFixed(6) : '');
      setImage('');
    }
  }, [isOpen, initialPlace, defaultCoords, userLat, userLng]);

  if (!isOpen) return null;

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setErrorMsg('');
    try {
      const uploaded = await apiClient.uploadMedia(file, 'places');
      if (uploaded?.url) {
        setImage(uploaded.url);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Không thể tải ảnh địa điểm lên máy chủ');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập tên địa điểm');
      return;
    }
    const numLat = Number(lat);
    const numLng = Number(lng);
    if (!Number.isFinite(numLat) || !Number.isFinite(numLng) || lat === '' || lng === '') {
      setErrorMsg('Cần tọa độ GPS hợp lệ để ghim địa điểm lên bản đồ');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    try {
      await onSave({
        id: initialPlace?.id || null,
        name: name.trim(),
        category,
        notes: notes.trim(),
        lat: numLat,
        lng: numLng,
        image: image.trim()
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Không thể lưu địa điểm');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none font-sans"
      onClick={() => !isSaving && onClose()}
    >
      <div
        className="w-full max-w-md bg-[#0E0E10] border border-white/15 rounded-3xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.95)] max-h-[90vh] overflow-y-auto no-scrollbar text-white space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 border border-amber-400/35 flex items-center justify-center">
              <i className="bi bi-star-fill text-sm" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {initialPlace ? 'Chỉnh Sửa Địa Điểm' : 'Lưu Địa Điểm Mới'}
              </h2>
              <p className="text-[10px] text-[#8E8E93]">Ghim tọa độ yêu thích của riêng bạn trên bản đồ</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng biểu mẫu địa điểm"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#8E8E93] hover:text-white flex items-center justify-center cursor-pointer"
          >
            <i className="bi bi-x-lg text-xs" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label htmlFor="saved-place-name" className="text-[11px] font-medium text-[#8E8E93] block mb-1">
              Tên địa điểm *
            </label>
            <input
              id="saved-place-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Quán cà phê view sông Hàn..."
              aria-label="Tên địa điểm"
              className="w-full bg-[#151619] border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-[#8E8E93] outline-none"
            />
          </div>

          <div>
            <span className="text-[11px] font-medium text-[#8E8E93] block mb-1.5">Danh mục</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {SAVED_PLACE_CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-sm'
                        : 'bg-[#151619] border-white/10 text-white/65 hover:text-white'
                    }`}
                  >
                    <i className={`bi ${cat.icon} text-sm`} style={{ color: isSelected ? cat.color : undefined }} />
                    <span className="text-[10px] truncate max-w-full">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="saved-place-lat" className="text-[11px] font-medium text-[#8E8E93] block mb-1">
                Vĩ độ (Lat)
              </label>
              <input
                id="saved-place-lat"
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                aria-label="Vĩ độ địa điểm"
                className="w-full bg-[#151619] border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
              />
            </div>
            <div>
              <label htmlFor="saved-place-lng" className="text-[11px] font-medium text-[#8E8E93] block mb-1">
                Kinh độ (Lng)
              </label>
              <input
                id="saved-place-lng"
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                aria-label="Kinh độ địa điểm"
                className="w-full bg-[#151619] border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
              />
            </div>
          </div>

          {userLat != null && userLng != null && (
            <button
              type="button"
              onClick={() => {
                setLat(Number(userLat).toFixed(6));
                setLng(Number(userLng).toFixed(6));
              }}
              className="w-full py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-cyan-300 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <i className="bi bi-crosshair" />
              <span>Lấy tọa độ GPS hiện tại của bạn</span>
            </button>
          )}

          <div>
            <label htmlFor="saved-place-notes" className="text-[11px] font-medium text-[#8E8E93] block mb-1">
              Ghi chú kỷ niệm
            </label>
            <textarea
              id="saved-place-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Món ngon nên thử, góc chụp đẹp..."
              className="w-full bg-[#151619] border border-white/10 focus:border-amber-400 rounded-xl p-2.5 text-xs text-white placeholder-[#8E8E93] outline-none resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              aria-label="Tải ảnh địa điểm"
              className="hidden"
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <i className={`bi ${isUploading ? 'bi-arrow-repeat animate-spin' : 'bi-image'}`} />
              <span>{isUploading ? 'Đang tải ảnh...' : (image ? 'Đổi ảnh' : 'Thêm ảnh')}</span>
            </button>
            {image && (
              <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-white/20 shrink-0">
                <img src={image} alt="Place preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs flex items-center gap-2">
              <i className="bi bi-exclamation-triangle-fill shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            {initialPlace && onDelete && (
              !confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="px-3 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold cursor-pointer"
                >
                  <i className="bi bi-trash3" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    await onDelete(initialPlace.id);
                    onClose();
                  }}
                  className="px-3 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold cursor-pointer"
                >
                  Xóa hẳn
                </button>
              )
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-extrabold cursor-pointer disabled:opacity-50"
            >
              {isSaving ? 'Đang lưu...' : (initialPlace ? 'Cập nhật' : 'Lưu địa điểm')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
