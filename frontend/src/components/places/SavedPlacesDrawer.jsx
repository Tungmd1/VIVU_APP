import React, { useState, useMemo } from 'react';
import { SAVED_PLACE_CATEGORIES } from './SavedPlaceModal';
import { calculateHaversineMeters, formatExactDistance } from '../../utils/mapNavigationUtils';

/**
 * SavedPlacesDrawer - Ngăn Kéo Địa Điểm Đã Lưu Trên Bản Đồ VIVU
 * Lọc theo 4 danh mục (Ăn uống, Âm nhạc, Nhảy múa, Danh lam), tìm kiếm,
 * bay map tới ghim, chỉ đường nhanh kèm khoảng cách chính xác, sửa hoặc xóa.
 */
export default function SavedPlacesDrawer({
  isOpen,
  onClose,
  savedPlaces = [],
  userLat = null,
  userLng = null,
  onOpenCreateModal,
  onEditPlace,
  onDeletePlace,
  onFocusPlace,
  onStartNavigation
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const filteredPlaces = useMemo(() => {
    return (savedPlaces || []).filter((place) => {
      if (!place) return false;
      if (activeCategory !== 'all' && place.category !== activeCategory) {
        const legacyMap = { dining: 'food', cafe_dating: 'food', dancing: 'dance' };
        if (legacyMap[place.category] !== activeCategory) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = (place.name || '').toLowerCase().includes(q);
        const matchNotes = (place.notes || '').toLowerCase().includes(q);
        return matchName || matchNotes;
      }
      return true;
    });
  }, [savedPlaces, activeCategory, searchQuery]);

  if (!isOpen) return null;

  const getCategoryMeta = (catId) => {
    return SAVED_PLACE_CATEGORIES.find(c => c.id === catId) || {
      id: 'sightseeing',
      label: 'Danh lam',
      icon: 'bi-geo-alt',
      color: '#F59E0B'
    };
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-md flex justify-center sm:justify-end items-end sm:items-stretch animate-in fade-in duration-150 select-none font-sans"
      onClick={onClose}
    >
      <div
        className="w-full sm:w-[400px] max-h-[84vh] sm:max-h-full bg-[#0E0E10] border-t sm:border-t-0 sm:border-l border-white/15 rounded-t-3xl sm:rounded-none p-5 flex flex-col gap-3.5 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 border border-amber-400/35 flex items-center justify-center">
              <i className="bi bi-star-fill text-sm" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Địa Điểm Đã Lưu ({savedPlaces.length})</h2>
              <p className="text-[10px] text-[#8E8E93]">Ghim quán ăn, âm nhạc &amp; góc chill cá nhân</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenCreateModal?.()}
              className="px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-extrabold flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
              aria-label="Thêm địa điểm đã lưu mới"
            >
              <i className="bi bi-plus-lg" />
              <span>Lưu mới</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng danh sách địa điểm"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
            >
              <i className="bi bi-x-lg text-xs" />
            </button>
          </div>
        </div>

        {/* Ô tìm kiếm */}
        <div className="relative shrink-0">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xs" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm địa điểm hoặc ghi chú..."
            aria-label="Tìm địa điểm đã lưu"
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#151619] border border-white/10 focus:border-amber-400 text-xs text-white placeholder-[#8E8E93] outline-none"
          />
        </div>

        {/* Tab lọc 4 danh mục */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 pb-0.5">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold shrink-0 cursor-pointer transition-all ${
              activeCategory === 'all'
                ? 'bg-amber-400 text-black'
                : 'bg-white/5 text-white/70 border border-white/10 hover:text-white'
            }`}
          >
            Tất cả
          </button>
          {SAVED_PLACE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold shrink-0 flex items-center gap-1.5 cursor-pointer transition-all ${
                activeCategory === cat.id
                  ? 'bg-amber-400 text-black'
                  : 'bg-white/5 text-white/70 border border-white/10 hover:text-white'
              }`}
            >
              <i className={`bi ${cat.icon}`} />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Danh sách địa điểm */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pr-0.5">
          {filteredPlaces.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
              <i className="bi bi-star text-2xl text-amber-400/60" />
              <p className="text-xs font-bold text-white/80">Chưa có địa điểm nào</p>
              <p className="text-[11px] text-white/50">
                Nhấn "Lưu mới" để đánh dấu quán yêu thích tại tọa độ hiện tại của bạn.
              </p>
            </div>
          ) : (
            filteredPlaces.map((place) => {
              const meta = getCategoryMeta(place.category);
              const isConfirming = pendingDeleteId === place.id;
              const hasDist = userLat != null && userLng != null && place.lat != null && place.lng != null;
              const distLabel = hasDist
                ? formatExactDistance(calculateHaversineMeters(Number(userLat), Number(userLng), Number(place.lat), Number(place.lng)))
                : null;
              return (
                <div
                  key={place.id}
                  onClick={() => {
                    onFocusPlace?.(place);
                    onClose();
                  }}
                  className="p-3 rounded-2xl bg-[#151619] border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer flex gap-3 items-start group"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/50 border border-white/10 shrink-0 flex items-center justify-center">
                    {place.image ? (
                      <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                    ) : (
                      <i className={`bi ${meta.icon} text-lg`} style={{ color: meta.color }} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-bold text-white truncate">{place.name}</h3>
                      <div className="flex items-center gap-1 shrink-0">
                        {distLabel && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            {distLabel}
                          </span>
                        )}
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-amber-300">
                          {meta.label}
                        </span>
                      </div>
                    </div>
                    {place.notes && (
                      <p className="text-[11px] text-white/60 line-clamp-2 mt-0.5">{place.notes}</p>
                    )}
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5">
                      <span className="text-[10px] font-mono text-white/40">
                        {Number(place.lat).toFixed(4)}°, {Number(place.lng).toFixed(4)}°
                      </span>
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {onStartNavigation && (
                          <button
                            type="button"
                            onClick={() => {
                              onStartNavigation(place);
                              onClose();
                            }}
                            className="w-7 h-7 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 flex items-center justify-center text-xs cursor-pointer"
                            title="Chỉ đường tới đây"
                          >
                            <i className="bi bi-cursor-fill" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onEditPlace?.(place)}
                          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs cursor-pointer"
                          title="Chỉnh sửa địa điểm"
                        >
                          <i className="bi bi-pencil" />
                        </button>
                        {!isConfirming ? (
                          <button
                            type="button"
                            onClick={() => setPendingDeleteId(place.id)}
                            className="w-7 h-7 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 flex items-center justify-center text-xs cursor-pointer"
                            title="Xóa địa điểm"
                          >
                            <i className="bi bi-trash3" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              onDeletePlace?.(place.id);
                              setPendingDeleteId(null);
                            }}
                            className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold cursor-pointer"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
