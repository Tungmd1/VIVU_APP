import React, { useState, useRef } from 'react';

const ICON_PRESETS = [
  { id: 'bi-compass', icon: 'bi-compass' }, { id: 'bi-geo-alt', icon: 'bi-geo-alt' },
  { id: 'bi-lightning-charge', icon: 'bi-lightning-charge' }, { id: 'bi-cup-hot', icon: 'bi-cup-hot' },
  { id: 'bi-bicycle', icon: 'bi-bicycle' }, { id: 'bi-shield-lock', icon: 'bi-shield-lock' }
];

const COLOR_PRESETS = [
  { id: 'neon-cyan', label: 'Neon Cyan', color: '#00E5FF', borderClass: 'border-[#0A8395]', bgClass: 'bg-[rgba(10,131,149,0.08)]' },
  { id: 'neon-pink', label: 'Neon Pink', color: '#FF2A85', borderClass: 'border-[#FF2A85]', bgClass: 'bg-[rgba(255,42,133,0.12)]' },
  { id: 'neon-lime', label: 'Hyper Lime', color: '#10FFA0', borderClass: 'border-[#10FFA0]', bgClass: 'bg-[rgba(16,255,160,0.12)]' }
];

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=150', // Bạn bè cafe/chill
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150', // Nhóm hội ngộ
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=150', // Event / Tiệc tùng
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=150'  // Phượt / Dã ngoại
];

/**
 * CreateCircleModal - Tạo nhóm Luminous Solar-Cyber HUD (White Cyberpunk), Rule 7 (< 450 dòng)
 */
export default function CreateCircleModal({ 
  isOpen, 
  onClose, 
  friends = [], 
  onCreateCircle 
}) {
  const [circleName, setCircleName] = useState('');
  const [circleImage, setCircleImage] = useState(AVATAR_PRESETS[0]);
  const [selectedFriendIds, setSelectedFriendIds] = useState([]);
  const [selectedIcon, setSelectedIcon] = useState('bi-compass');
  const [selectedColor, setSelectedColor] = useState('neon-cyan');
  const [searchFriend, setSearchFriend] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa 8MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setCircleImage(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleToggleFriend = (id) => {
    if (selectedFriendIds.includes(id)) {
      setSelectedFriendIds(selectedFriendIds.filter(fid => fid !== id));
    } else {
      setSelectedFriendIds([...selectedFriendIds, id]);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedFriendIds.length === filteredFriends.length && filteredFriends.length > 0) {
      setSelectedFriendIds([]);
    } else {
      setSelectedFriendIds(filteredFriends.map(f => f.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!circleName.trim()) {
      setErrorMessage('Vui lòng nhập tên nhóm');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (onCreateCircle) {
        await onCreateCircle({
          name: circleName.trim(),
          image: circleImage || AVATAR_PRESETS[0],
          icon: selectedIcon,
          color: selectedColor,
          privacy: 'private',
          memberIds: selectedFriendIds
        });
      }
      setCircleName('');
      setCircleImage(AVATAR_PRESETS[0]);
      setSelectedFriendIds([]);
      setSearchFriend('');
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Không thể tạo nhóm. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFriends = friends.filter(f => {
    if (!searchFriend.trim()) return true;
    const query = searchFriend.toLowerCase();
    const nameMatch = (f.name || f.full_name || '').toLowerCase().includes(query);
    const codeMatch = (f.userCode || f.user_code || '').toLowerCase().includes(query);
    return nameMatch || codeMatch;
  });

  const isAllSelected = filteredFriends.length > 0 && selectedFriendIds.length === filteredFriends.length;

  return (
    <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-xs flex justify-center items-center p-3 sm:p-4 select-none font-sans animate-in fade-in duration-200">
      <div className="w-full max-w-[420px] bg-white border border-[#D8E3E7] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.15)] text-[#14252E] flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header Luminous Solar-Cyber */}
        <header className="px-5 py-3.5 bg-white border-b border-[#D8E3E7] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[rgba(10,131,149,0.10)] text-[#0A8395] border border-[rgba(10,131,149,0.25)] flex items-center justify-center shadow-xs">
              <i className="bi bi-people text-sm font-bold"></i>
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#14252E] font-display tracking-wide">Tạo Nhóm Mới</h2>
              <p className="text-[10px] text-[#52646D]">Custom Circle • Đồng bộ bản đồ</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F3F7F8] text-[10px] font-semibold text-[#0A8395] border border-[#D8E3E7]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10FFA0] animate-pulse"></span>
              Riêng tư
            </span>
            <button 
              type="button" 
              onClick={onClose}
              disabled={isSubmitting}
              className="w-7 h-7 rounded-lg bg-[#F3F7F8] border border-[#D8E3E7] hover:bg-[#E6E7F6] text-[#14252E] flex items-center justify-center transition-colors cursor-pointer"
            >
              <i className="bi bi-x text-sm font-bold"></i>
            </button>
          </div>
        </header>

        {errorMessage && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-[#FEE2E2] border border-[#FCA5A5] text-[#EF4444] text-xs flex items-center gap-2 shrink-0">
            <i className="bi bi-exclamation-triangle-fill text-xs"></i>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3.5 no-scrollbar bg-[#F8FAFB]">
          {/* 1. HUD Card: Phân quyền 2 tầng */}
          <section className="p-3 rounded-2xl bg-white border border-[#D8E3E7] relative overflow-hidden shadow-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[rgba(10,131,149,0.10)] text-[#0A8395] flex items-center justify-center shrink-0 border border-[rgba(10,131,149,0.25)] mt-0.5 shadow-xs">
                <i className="bi bi-shield-check text-sm font-bold"></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A8395] font-display">2-Tier Access</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#F3F7F8] text-[#52646D] font-mono border border-[#D8E3E7]">BẢO MẬT</span>
                </div>
                <p className="text-[11px] text-[#40484D] mt-0.5 leading-relaxed">
                  Bạn là Quản trị viên (Owner). Thành viên được mời vào trực tiếp và đồng bộ vị trí trên bản đồ 3D.
                </p>
              </div>
            </div>
          </section>

          {/* 2. Ảnh đại diện nhóm (Group Avatar Uploader & Presets) */}
          <section className="p-3 rounded-2xl bg-white border border-[#D8E3E7] space-y-3 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#14252E] flex items-center gap-1.5 font-display">
              <i className="bi bi-image text-[#0A8395]"></i>
              <span>Ảnh đại diện nhóm</span>
            </span>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />

            <div className="flex items-center gap-3.5">
              {/* Avatar Preview */}
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#0A8395] shadow-[0_0_12px_rgba(0,229,255,0.3)] shrink-0 bg-[#F3F7F8]">
                <img 
                  src={circleImage} 
                  alt="Ảnh nhóm" 
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* Nút tải ảnh lên từ máy */}
              <div className="flex-1 space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 px-3 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-display font-bold text-xs flex items-center gap-1.5 border border-[#00F0FF] shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <i className="bi bi-camera-fill"></i>
                  <span>Tải ảnh từ máy</span>
                </button>
                <p className="text-[10px] text-[#52646D]">Hoặc chọn nhanh ảnh mẫu có sẵn bên dưới:</p>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {AVATAR_PRESETS.map((presetUrl, idx) => {
                const isSelected = circleImage === presetUrl;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCircleImage(presetUrl)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-[#0A8395] shadow-[0_0_8px_rgba(10,131,149,0.25)] scale-105' 
                        : 'border-[#D8E3E7] opacity-75 hover:opacity-100 hover:border-[#0A8395]'
                    }`}
                  >
                    <img src={presetUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3. Tên nhóm (ĐÃ LOẠI BỎ HOÀN TOÀN MÔ TẢ THEO YÊU CẦU) */}
          <section className="p-3 rounded-2xl bg-white border border-[#D8E3E7] space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#14252E] flex items-center gap-1.5 font-display" htmlFor="c-name">
                <i className="bi bi-tag text-[#0A8395]"></i>
                <span>Tên nhóm</span>
              </label>
              <span className="text-[10px] text-[#52646D] font-mono">{circleName.length}/40</span>
            </div>
            <input 
              id="c-name"
              type="text" 
              value={circleName}
              onChange={(e) => setCircleName(e.target.value)}
              placeholder="VD: Cạ Cứng Phố Cổ, Team Phượt..." 
              maxLength={40}
              required
              className="w-full bg-[#F3F7F8] text-[#14252E] text-xs px-3.5 py-2.5 rounded-xl border border-[#D8E3E7] focus:outline-none focus:border-[#0A8395] focus:ring-1 focus:ring-[rgba(0,229,255,0.3)] transition-all placeholder:text-[#52646D] font-medium"
            />
          </section>

          {/* 4. Lựa chọn Vector Icon (Bootstrap Icons) */}
          <section className="p-3 rounded-2xl bg-white border border-[#D8E3E7] space-y-2 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#14252E] flex items-center gap-1.5 font-display">
              <i className="bi bi-app-indicator text-[#0A8395]"></i>
              <span>Biểu tượng Vector</span>
            </span>
            <div className="grid grid-cols-6 gap-2">
              {ICON_PRESETS.map((item) => {
                const isActive = selectedIcon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedIcon(item.id)}
                    className={`h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[rgba(10,131,149,0.10)] border-2 border-[#0A8395] text-[#0A8395] shadow-[0_0_12px_rgba(0,229,255,0.25)]' 
                        : 'bg-[#F3F7F8] border border-[#D8E3E7] text-[#52646D] hover:text-[#14252E] hover:bg-[#E6E7F6]'
                    }`}
                  >
                    <i className={`bi ${item.icon} text-base`}></i>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 5. Màu sắc chủ đạo */}
          <section className="p-3 rounded-2xl bg-white border border-[#D8E3E7] space-y-2 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#14252E] flex items-center gap-1.5 font-display">
              <i className="bi bi-palette text-[#0A8395]"></i>
              <span>Màu sắc chủ đạo</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_PRESETS.map((col) => {
                const isChecked = selectedColor === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setSelectedColor(col.id)}
                    className={`px-2.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer border ${
                      isChecked 
                        ? `${col.bgClass} ${col.borderClass} border-2 shadow-xs` 
                        : 'bg-[#F3F7F8] border-[#D8E3E7] text-[#52646D] hover:text-[#14252E]'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: col.color }}></span>
                    <span className={`text-[11px] font-medium truncate ${isChecked ? 'text-[#14252E] font-bold' : ''}`}>
                      {col.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 6. Thêm bạn bè trực tiếp */}
          <section className="p-3 rounded-2xl bg-white border border-[#D8E3E7] space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#14252E] flex items-center gap-1.5 font-display">
                  <i className="bi bi-person-plus text-[#0A8395]"></i>
                  <span>Thêm bạn bè vào nhóm</span>
                </span>
                {selectedFriendIds.length > 0 && (
                  <span className="px-2 py-0.2 rounded-full bg-[rgba(10,131,149,0.08)] text-[#0A8395] text-[10px] font-bold border border-[rgba(10,131,149,0.25)]">
                    {selectedFriendIds.length} đã chọn
                  </span>
                )}
              </div>
              {filteredFriends.length > 0 && (
                <button 
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-[11px] font-bold text-[#0A8395] hover:underline cursor-pointer font-display"
                >
                  {isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
              )}
            </div>

            {/* Ô tìm kiếm bạn bè */}
            {friends.length > 0 && (
              <div className="relative">
                <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-[#52646D]"></i>
                <input 
                  type="text" 
                  value={searchFriend}
                  onChange={(e) => setSearchFriend(e.target.value)}
                  placeholder="Tìm bạn bè theo tên hoặc mã VU-..."
                  className="w-full bg-[#F3F7F8] text-xs text-[#14252E] pl-8 pr-3 py-2 rounded-xl border border-[#D8E3E7] focus:outline-none focus:border-[#0A8395] placeholder:text-[#52646D] font-medium"
                />
              </div>
            )}

            {/* Danh sách bạn bè checkbox */}
            <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
              {friends.length === 0 ? (
                <div className="text-center py-4 px-3 text-[11px] text-[#52646D] bg-[#F8FAFB] rounded-xl border border-dashed border-[#D8E3E7] space-y-1">
                  <p className="font-semibold text-[#14252E]">Chưa có bạn bè nào trong danh bạ.</p>
                  <p className="text-[10px]">Bạn có thể tạo nhóm trước và thêm thành viên sau.</p>
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="text-center py-4 text-xs text-[#52646D] bg-[#F8FAFB] rounded-xl border border-[#D8E3E7]">
                  Không tìm thấy bạn bè "{searchFriend}"
                </div>
              ) : (
                filteredFriends.map(friend => {
                  const isChecked = selectedFriendIds.includes(friend.id);
                  return (
                    <div 
                      key={friend.id}
                      onClick={() => handleToggleFriend(friend.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer border transition-all ${
                        isChecked 
                          ? 'border-[#0A8395] bg-[rgba(0,229,255,0.10)] shadow-xs' 
                          : 'border-[#D8E3E7] bg-white hover:bg-[#F8FAFB]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <img 
                            src={friend.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
                            alt="" 
                            className="w-8 h-8 rounded-full object-cover border border-[#D8E3E7]" 
                          />
                          {friend.isOnline && (
                            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#10FFA0] border border-white"></span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-[#14252E] font-display truncate block">
                            {friend.name}
                          </span>
                          {friend.userCode && (
                            <span className="text-[10px] text-[#52646D] font-mono">
                              {friend.userCode}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] transition-colors shrink-0 ${
                        isChecked ? 'bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] border-[#00F0FF] text-[#08202E] font-bold' : 'border-[#D8E3E7] text-transparent'
                      }`}>
                        <i className="bi bi-check font-bold"></i>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* 7. Sticky Submit Footer */}
          <div className="pt-2 border-t border-[#D8E3E7] space-y-2 shrink-0">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-display font-bold text-xs flex items-center justify-center gap-2 border border-[#00F0FF] shadow-[0_0_16px_rgba(0,229,255,0.40)] active:scale-98 transition-all cursor-pointer disabled:opacity-50 tracking-wide"
            >
              {isSubmitting ? (
                <>
                  <i className="bi bi-arrow-clockwise animate-spin text-sm"></i>
                  <span>Đang tạo nhóm...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-people-fill text-sm"></i>
                  <span>Tạo Nhóm &amp; Mời Thành Viên</span>
                  {selectedFriendIds.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded bg-[#08202E]/15 text-[#08202E] text-[10px] font-mono font-bold">
                      {selectedFriendIds.length} bạn
                    </span>
                  )}
                </>
              )}
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#52646D]">
              <i className="bi bi-shield-lock-fill text-[#0A8395] text-xs"></i>
              <span>Mặc định riêng tư • Chỉ thành viên được mời mới nhìn thấy nhóm</span>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
