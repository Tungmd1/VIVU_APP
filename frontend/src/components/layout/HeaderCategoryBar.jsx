import React from 'react';

export default function HeaderCategoryBar({ 
  viewMode, 
  setViewMode, 
  customCircles = [], 
  onOpenCreateCircle, 
  categories = [], 
  selectedCategory, 
  setSelectedCategory,
  onNotify,
  userAvatar,
  onOpenProfile
}) {
  return (
    <header className="fixed top-3 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md pointer-events-auto select-none">
      <div className="flex items-center gap-2">
        {/* Menu cuộn ngang bộ lọc chế độ bản đồ & Nhóm tự tạo */}
        <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-1.5 p-1 bg-white/95 backdrop-blur-md border border-vivu-border rounded-full shadow-cozy-sm">
          {/* 1. Xã hội (Toàn bộ) */}
          <button
            onClick={() => setViewMode('social')}
            className={`py-1.5 px-3 rounded-full text-xs font-semibold shrink-0 transition-all btn-spring flex items-center gap-1.5 ${
              viewMode === 'social'
                ? 'bg-vivu-peach text-white shadow-xs'
                : 'text-vivu-cocoa hover:text-vivu-mocha hover:bg-vivu-tint'
            }`}
          >
            <i className="bi bi-globe2 text-xs"></i>
            <span>Xã hội</span>
          </button>

          {/* 2. Bạn bè */}
          <button
            onClick={() => setViewMode('friends')}
            className={`py-1.5 px-3 rounded-full text-xs font-semibold shrink-0 transition-all btn-spring flex items-center gap-1.5 ${
              viewMode === 'friends'
                ? 'bg-vivu-peach text-white shadow-xs'
                : 'text-vivu-cocoa hover:text-vivu-mocha hover:bg-vivu-tint'
            }`}
          >
            <i className="bi bi-people-fill text-xs"></i>
            <span>Bạn bè</span>
          </button>

          {/* 3. Các nhóm riêng do người dùng tự tạo */}
          {customCircles.map(c => {
            const isSelected = viewMode === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setViewMode(c.id)}
                className={`py-1.5 px-2.5 rounded-full text-xs font-semibold shrink-0 transition-all btn-spring flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-vivu-peach text-white shadow-xs'
                    : 'text-vivu-cocoa hover:text-vivu-mocha hover:bg-vivu-tint'
                }`}
              >
                <img src={c.image} alt="" className="w-4 h-4 rounded-full object-cover shrink-0 border border-white" />
                <span className="truncate max-w-[85px]">{c.name}</span>
              </button>
            );
          })}

          {/* 4. Nút tạo nhóm riêng mới */}
          <button
            onClick={onOpenCreateCircle}
            className="py-1 px-2.5 rounded-full text-xs font-bold shrink-0 text-vivu-peach bg-vivu-peach/15 hover:bg-vivu-peach/25 transition-all btn-spring flex items-center gap-1"
            title="Tạo nhóm / Mục riêng mới"
          >
            <i className="bi bi-plus-circle-fill text-xs"></i>
            <span>Tạo mục</span>
          </button>

          {/* Dải phân cách */}
          <div className="w-[1px] h-4 bg-vivu-border shrink-0 my-auto"></div>

          {/* Danh mục lọc Story */}
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-1.5 px-3 rounded-full text-xs font-semibold shrink-0 transition-all btn-spring flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-vivu-mocha text-white shadow-xs'
                    : 'text-vivu-cocoa hover:text-vivu-mocha hover:bg-vivu-tint'
                }`}
              >
                <i className={`bi ${cat.iconClass}`}></i>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Nút thông báo */}
        <button 
          onClick={onNotify}
          className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md border border-vivu-border shadow-cozy-sm flex items-center justify-center text-vivu-mocha hover:bg-vivu-tint btn-spring relative shrink-0"
          title="Thông báo"
        >
          <i className="bi bi-bell text-vivu-cocoa"></i>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-vivu-peach border border-white"></span>
        </button>

        {/* Nút vào Trang Cá Nhân nhanh từ Header */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md border-2 border-vivu-peach shadow-cozy-sm flex items-center justify-center overflow-hidden btn-spring shrink-0 cursor-pointer"
          title="Trang Cá Nhân Của Bạn"
        >
          <img 
            src={userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
            alt="Profile" 
            className="w-full h-full object-cover" 
          />
        </button>
      </div>
    </header>
  );
}
