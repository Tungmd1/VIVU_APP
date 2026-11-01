import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import VivuButton from '../common/VivuButton';
import { triggerCyberSplash } from '../../utils/cyberSplash';
import { DEFAULT_STARRED_PLACES, calculateTasteBadges } from '../../data/defaultStarredPlaces';

/**
 * ProfilePlaceMapWidget - Bản Đồ Thu Nhỏ & Bộ Sưu Tập Địa Điểm Gắn Sao
 * - Phản ánh gu sống qua các địa điểm đã check-in và đánh giá sao (1-5★)
 * - Tự động cấp Danh Hiệu Hộ Chiếu Vết Chân (Taste Passport Badges)
 * - Nút "Dẫn đường đến đây" tự động chuyển về Bản đồ 3D VIVU chính
 * - 100% Bootstrap Icons (Rule 5), Rule 7 (< 450 dòng), Rule 11 (GPS an toàn)
 */
export default function ProfilePlaceMapWidget({
  userId = 'default',
  location,
  onStartNavigation,
  onBackToMap
}) {
  const storageKey = `vivu_starred_places_${userId}`;
  
  // 1. Quản lý danh sách địa điểm check-in & gắn sao
  const [places, setPlaces] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_STARRED_PLACES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(places));
    } catch {}
  }, [places, storageKey]);

  // Bộ lọc thể loại
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form thêm địa điểm mới
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceCategory, setNewPlaceCategory] = useState('cafe');
  const [newPlaceRating, setNewPlaceRating] = useState(5);
  const [newPlaceReview, setNewPlaceReview] = useState('');
  const [newPlacePhoto, setNewPlacePhoto] = useState('');

  // Tọa độ an toàn
  const userLat = Number(location?.lat ?? location?.latitude ?? 16.0544);
  const userLng = Number(location?.lng ?? location?.longitude ?? 108.2022);

  // Danh hiệu Hộ Chiếu Vết Chân
  const tasteBadges = calculateTasteBadges(places);

  // Lọc địa điểm theo thể loại
  const filteredPlaces = activeCategory === 'all'
    ? places
    : places.filter(p => p.category === activeCategory);

  // Chấm sao trực tiếp cho địa điểm
  const handleRatePlace = (placeId, newRating, e) => {
    e?.stopPropagation();
    triggerCyberSplash(e);
    setPlaces(prev => prev.map(p => 
      p.id === placeId ? { ...p, rating: newRating, visited: true } : p
    ));
    if (selectedPlace?.id === placeId) {
      setSelectedPlace(prev => ({ ...prev, rating: newRating, visited: true }));
    }
  };

  // Toggle trạng thái Đã Đến
  const handleToggleVisited = (placeId, e) => {
    e?.stopPropagation();
    triggerCyberSplash(e);
    setPlaces(prev => prev.map(p => 
      p.id === placeId ? { ...p, visited: !p.visited } : p
    ));
    if (selectedPlace?.id === placeId) {
      setSelectedPlace(prev => ({ ...prev, visited: !prev.visited }));
    }
  };

  // Dẫn đường đến địa điểm trên Bản đồ VIVU lớn
  const handleNavigate = (place, e) => {
    triggerCyberSplash(e);
    if (onStartNavigation) {
      onStartNavigation({
        name: place.name,
        address: place.address,
        lat: Number(place.lat),
        lng: Number(place.lng),
        realLat: Number(place.lat),
        realLng: Number(place.lng)
      });
    }
    if (onBackToMap) onBackToMap();
  };

  // Thêm địa điểm tùy chỉnh
  const handleCreateCustomPlace = (e) => {
    e.preventDefault();
    if (!newPlaceName.trim()) return;

    const categoryMap = {
      cafe: { label: 'Cà Phê & Acoustic', icon: 'bi-cup-hot-fill' },
      chill: { label: 'Rooftop & Hoàng Hôn', icon: 'bi-sunset-fill' },
      food: { label: 'Ẩm Thực Đêm', icon: 'bi-fire' },
      nature: { label: 'Thiên Nhiên & Biển', icon: 'bi-water' },
      camping: { label: 'Khám Phá & Phượt', icon: 'bi-compass-fill' }
    };

    const newSpot = {
      id: `spot-${Date.now()}`,
      name: newPlaceName.trim(),
      category: newPlaceCategory,
      categoryLabel: categoryMap[newPlaceCategory].label,
      icon: categoryMap[newPlaceCategory].icon,
      photo: newPlacePhoto.trim() || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
      rating: newPlaceRating,
      review: newPlaceReview.trim() || 'Một địa điểm tuyệt vời đậm chất gu cá nhân.',
      visited: true,
      visitedAt: 'Vừa mới đây',
      lat: userLat + (Math.random() - 0.5) * 0.02,
      lng: userLng + (Math.random() - 0.5) * 0.02,
      address: 'TP. Đà Nẵng'
    };

    setPlaces([newSpot, ...places]);
    setNewPlaceName('');
    setNewPlaceReview('');
    setNewPlacePhoto('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#D2D9F4] space-y-4 shadow-xs font-sans text-[#131315]">
      
      {/* 1. HEADER: TIÊU ĐỀ & NÚT THÊM ĐỊA ĐIỂM */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF2A85] to-[#FF539A] text-white flex items-center justify-center shadow-xs">
            <i className="bi bi-geo-alt-fill text-sm"></i>
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base font-display flex items-center gap-1.5 leading-none">
              <span>Hộ Chiếu Sở Thích & Địa Điểm</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#FF2A85]/15 text-[#FF2A85] font-bold">
                {places.filter(p => p.visited).length} Đã đến
              </span>
            </h3>
            <p className="text-[11px] text-[#70787E] mt-0.5">Nhận diện gu sống của bạn qua các điểm đã check-in</p>
          </div>
        </div>

        <VivuButton
          size="sm"
          variant="primary"
          pill={true}
          icon="bi-plus-lg"
          onClick={(e) => { triggerCyberSplash(e); setIsAddModalOpen(true); }}
          className="text-xs px-3 py-1 font-bold shadow-xs shrink-0"
        >
          Thêm chỗ
        </VivuButton>
      </div>

      {/* 2. HUY HIỆU DANH HIỆU HỘ CHIẾU VẾT CHÂN (TASTE PASSPORT BADGES) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {tasteBadges.map(badge => (
          <div
            key={badge.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r ${badge.gradient} text-white shadow-xs shrink-0 select-none transition-transform hover:scale-102`}
            title={badge.desc}
          >
            <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-xs">
              <i className={`bi ${badge.icon}`}></i>
            </div>
            <div>
              <div className="text-[11px] font-extrabold font-display leading-none">{badge.title}</div>
              <div className="text-[9px] text-white/80 line-clamp-1 leading-tight mt-0.5">{badge.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. BẢN ĐỒ THU NHỎ TƯƠNG TÁC (INTERACTIVE MINI MAP CANVAS) */}
      <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden border border-[#D2D9F4] bg-[#0d1b2a] shadow-inner">
        {/* Nền bản đồ phong cách Cyber Satellite Grid */}
        <div 
          className="absolute inset-0 opacity-40 bg-cover bg-center"
          style={{ backgroundImage: 'radial-gradient(#00E5FF 1px, transparent 1px), radial-gradient(#FF2A85 1px, transparent 1px)', backgroundSize: '24px 24px', backgroundPosition: '0 0, 12px 12px' }}
        />
        
        {/* Chấm tâm GPS BẠN */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10">
          <div className="w-5 h-5 rounded-full bg-[#00E5FF] border-2 border-white shadow-[0_0_12px_#00E5FF] animate-pulse flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
          </div>
          <span className="text-[9px] font-mono font-bold text-white bg-black/60 px-1.5 py-0.2 rounded-full mt-1 border border-white/20">
            BẠN (GPS)
          </span>
        </div>

        {/* Các ghim giọt nước địa điểm đã gắn sao rải trên Mini Map */}
        {filteredPlaces.map((place, idx) => {
          // Tính toán vị trí tương đối trên canvas quanh trung tâm
          const deltaLat = (place.lat - 16.06) * 600;
          const deltaLng = (place.lng - 108.22) * 600;
          const topPercent = Math.max(15, Math.min(85, 50 - deltaLat));
          const leftPercent = Math.max(12, Math.min(88, 50 + deltaLng));

          const isSelected = selectedPlace?.id === place.id;

          return (
            <button
              key={place.id}
              type="button"
              onClick={(e) => {
                triggerCyberSplash(e);
                setSelectedPlace(place);
              }}
              style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
              className={`absolute -translate-x-1/2 -translate-y-full z-20 group cursor-pointer transition-all duration-200 ${
                isSelected ? 'scale-125 z-30' : 'hover:scale-110'
              }`}
              title={`${place.name} • ${place.rating}★`}
            >
              {/* Teardrop Pin */}
              <div className={`relative px-2 py-1 rounded-full flex items-center gap-1 shadow-lg border text-white ${
                isSelected 
                  ? 'bg-gradient-to-r from-[#FF2A85] to-[#FF539A] border-white shadow-[0_0_16px_rgba(255,42,133,0.8)]' 
                  : 'bg-[#14141e]/90 border-[#00E5FF]/40 backdrop-blur-md'
              }`}>
                <i className={`bi ${place.icon} text-xs text-[#00E5FF]`}></i>
                <span className="text-[10px] font-bold truncate max-w-[80px]">{place.name}</span>
                <span className="text-[9px] text-[#FFD700] font-mono flex items-center">
                  <i className="bi bi-star-fill text-[8px] mr-0.5"></i>{place.rating}
                </span>
              </div>
              {/* Mũi nhọn neo bản đồ */}
              <div className="w-1.5 h-1.5 bg-[#FF2A85] rotate-45 mx-auto -mt-0.5 border-r border-b border-white/50" />
            </button>
          );
        })}

        {/* Thanh lọc thể loại nhỏ ở góc trên Mini Map */}
        <div className="absolute top-2 left-2 z-20 flex gap-1 bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/10">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'cafe', label: 'Cà phê' },
            { id: 'chill', label: 'Chill' },
            { id: 'food', label: 'Ăn uống' },
            { id: 'camping', label: 'Phượt' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                activeCategory === tab.id
                  ? 'bg-[#FF2A85] text-white shadow-xs'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Chú thích góc dưới Mini Map */}
        <div className="absolute bottom-2 right-2 z-10 bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-full text-[9px] text-white/80 font-mono border border-white/10 flex items-center gap-1.5">
          <i className="bi bi-crosshair text-[#00E5FF]"></i>
          <span>TP. Đà Nẵng • {filteredPlaces.length} địa điểm</span>
        </div>
      </div>

      {/* 4. DẢI THẺ ẢNH CUỘN NGANG (HORIZONTAL SCROLL CARDS) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#70787E] px-0.5">
          <span className="font-semibold">Bộ sưu tập quán & điểm đến</span>
          <span>Cuộn ngang để xem thêm &gt;</span>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
          {filteredPlaces.map(place => (
            <div
              key={place.id}
              onClick={() => setSelectedPlace(place)}
              className={`relative w-48 sm:w-56 shrink-0 rounded-2xl overflow-hidden border bg-white shadow-xs cursor-pointer group transition-all duration-200 hover:-translate-y-1 ${
                selectedPlace?.id === place.id
                  ? 'border-[#FF2A85] ring-2 ring-[#FF2A85]/30'
                  : 'border-[#D2D9F4] hover:border-[#00E5FF]'
              }`}
            >
              {/* Ảnh bìa địa điểm */}
              <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-slate-100">
                <img
                  src={place.photo}
                  alt={place.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Badge Thể loại */}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] font-bold border border-white/20 flex items-center gap-1">
                  <i className={`bi ${place.icon} text-[#00E5FF]`}></i>
                  <span>{place.categoryLabel}</span>
                </span>

                {/* Trạng thái Đã đến */}
                <button
                  type="button"
                  onClick={(e) => handleToggleVisited(place.id, e)}
                  className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold border transition-all ${
                    place.visited
                      ? 'bg-[#10FFA0] text-[#08202E] border-white shadow-xs'
                      : 'bg-black/60 text-white/80 border-white/20'
                  }`}
                  title="Bấm để bật/tắt trạng thái Đã đến"
                >
                  <i className="bi bi-check-circle-fill mr-0.5"></i>
                  <span>{place.visited ? 'Đã đến' : 'Chưa đến'}</span>
                </button>
              </div>

              {/* Thông tin & Đánh giá sao */}
              <div className="p-3 space-y-1.5">
                <h4 className="font-bold text-xs text-[#131315] truncate font-display group-hover:text-[#FF2A85] transition-colors">
                  {place.name}
                </h4>
                
                <p className="text-[10px] text-[#70787E] line-clamp-1">
                  {place.review}
                </p>

                {/* Hàng sao đánh giá (Chạm sao để chấm trực tiếp 1-5★) */}
                <div className="flex items-center justify-between pt-1 border-t border-[#F0F2FA]">
                  <div className="flex items-center gap-1" title="Chạm sao để chấm điểm">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={(e) => handleRatePlace(place.id, star, e)}
                        className="text-xs transition-transform hover:scale-125 focus:outline-hidden"
                      >
                        <i className={`bi ${
                          star <= place.rating 
                            ? 'bi-star-fill text-[#FFD700]' 
                            : 'bi-star text-slate-300'
                        }`}></i>
                      </button>
                    ))}
                  </div>

                  <span className="text-[10px] font-bold font-mono text-[#FF2A85]">
                    {place.rating}.0 ★
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. MODAL XEM CHI TIẾT ĐỊA ĐIỂM & NÚT DẪN ĐƯỜNG RA BẢN ĐỒ VIVU LỚN */}
      <AnimatePresence>
        {selectedPlace && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-[#D2D9F4] p-5 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="relative h-44 rounded-2xl overflow-hidden shadow-inner">
                <img src={selectedPlace.photo} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setSelectedPlace(null)}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
                >
                  <i className="bi bi-x-lg text-sm"></i>
                </button>
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5">
                  <i className={`bi ${selectedPlace.icon} text-[#00E5FF]`}></i>
                  <span>{selectedPlace.categoryLabel}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-[#131315] font-display">
                    {selectedPlace.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-[#FFD700]">
                    {[1, 2, 3, 4, 5].map(star => (
                      <i 
                        key={star} 
                        className={`bi ${star <= selectedPlace.rating ? 'bi-star-fill' : 'bi-star text-slate-300'}`} 
                      />
                    ))}
                  </div>
                </div>
                <div className="text-xs text-[#70787E] flex items-center gap-1.5 mt-1">
                  <i className="bi bi-geo-alt-fill text-[#FF2A85]"></i>
                  <span>{selectedPlace.address}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
                <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Cảm nhận gu cá nhân</div>
                <p className="text-xs text-[#334155] leading-relaxed italic">
                  "{selectedPlace.review}"
                </p>
                {selectedPlace.visitedAt && (
                  <div className="text-[10px] text-[#94A3B8] font-mono">
                    Check-in gần nhất: {selectedPlace.visitedAt}
                  </div>
                )}
              </div>

              {/* CẶP NÚT HÀNH ĐỘNG: ĐỔI TRẠNG THÁI & DẪN ĐƯỜNG RA MAP LỚN */}
              <div className="flex gap-2 pt-1">
                <VivuButton
                  variant="secondary"
                  pill={true}
                  className="flex-1 font-bold text-xs py-2.5"
                  onClick={(e) => handleToggleVisited(selectedPlace.id, e)}
                  icon={selectedPlace.visited ? 'bi-check-circle-fill' : 'bi-circle'}
                >
                  {selectedPlace.visited ? 'Đã check-in' : 'Chưa ghé qua'}
                </VivuButton>

                <VivuButton
                  variant="primary"
                  pill={true}
                  glow={true}
                  className="flex-1 font-bold text-xs py-2.5 shadow-[0_0_15px_rgba(255,42,133,0.5)]"
                  onClick={(e) => handleNavigate(selectedPlace, e)}
                  icon="bi-cursor-fill"
                >
                  Dẫn đường đến đây
                </VivuButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. MODAL THÊM ĐỊA ĐIỂM YÊU THÍCH MỚI */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <motion.form
              onSubmit={handleCreateCustomPlace}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl p-5 space-y-3.5 shadow-2xl border border-[#D2D9F4]"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#131315] font-display flex items-center gap-1.5">
                  <i className="bi bi-pin-map-fill text-[#FF2A85]"></i>
                  <span>Thêm Địa Điểm Check-In Mới</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-black"
                >
                  <i className="bi bi-x-lg text-xs"></i>
                </button>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#70787E] block mb-1">Tên địa điểm / Quán</label>
                <input
                  type="text"
                  required
                  value={newPlaceName}
                  onChange={(e) => setNewPlaceName(e.target.value)}
                  placeholder="Ví dụ: Cà Phê Trứng Góc Phố, Rooftop Chill..."
                  className="w-full px-3 py-2 rounded-xl border border-[#D2D9F4] text-xs outline-hidden focus:border-[#FF2A85]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#70787E] block mb-1">Thể loại gu</label>
                  <select
                    value={newPlaceCategory}
                    onChange={(e) => setNewPlaceCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D2D9F4] text-xs outline-hidden focus:border-[#FF2A85]"
                  >
                    <option value="cafe">Cà phê & Acoustic</option>
                    <option value="chill">Rooftop & Hoàng hôn</option>
                    <option value="food">Ẩm thực đêm</option>
                    <option value="nature">Thiên nhiên & Biển</option>
                    <option value="camping">Khám phá & Phượt</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#70787E] block mb-1">Đánh giá sao ({newPlaceRating}★)</label>
                  <div className="flex items-center gap-1 pt-1.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewPlaceRating(star)}
                        className="text-base cursor-pointer"
                      >
                        <i className={`bi ${star <= newPlaceRating ? 'bi-star-fill text-[#FFD700]' : 'bi-star text-slate-300'}`}></i>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#70787E] block mb-1">Ghi chú gu vibe / Cảm nhận</label>
                <textarea
                  value={newPlaceReview}
                  onChange={(e) => setNewPlaceReview(e.target.value)}
                  placeholder="Quán nhạc hay, view thoáng, nước ngon..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-[#D2D9F4] text-xs outline-hidden focus:border-[#FF2A85] resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#70787E] block mb-1">Link ảnh chụp quán (tùy chọn)</label>
                <input
                  type="url"
                  value={newPlacePhoto}
                  onChange={(e) => setNewPlacePhoto(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-[#D2D9F4] text-xs outline-hidden focus:border-[#FF2A85]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <VivuButton
                  type="button"
                  variant="secondary"
                  pill={true}
                  className="flex-1 font-bold text-xs"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Hủy
                </VivuButton>

                <VivuButton
                  type="submit"
                  variant="primary"
                  pill={true}
                  glow={true}
                  className="flex-1 font-bold text-xs shadow-xs"
                >
                  Lưu địa điểm
                </VivuButton>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

