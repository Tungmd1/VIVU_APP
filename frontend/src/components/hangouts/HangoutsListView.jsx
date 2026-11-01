import React from 'react';

export default function HangoutsListView({
  stories = [],
  categories = [],
  selectedCategory,
  setSelectedCategory,
  onOpenCreateStory,
  onOpenStoryChat,
  onViewStoryDetail
}) {
  const filteredStories = stories.filter(s => {
    if (selectedCategory === 'all') return true;
    return s.category === selectedCategory;
  });

  return (
    <div className="fixed inset-0 z-35 bg-vivu-ivory flex flex-col max-w-md mx-auto w-full overflow-y-auto no-scrollbar pt-4 px-4 pb-28 space-y-4 animate-fadeIn">
      {/* Header Kèo Quanh */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-vivu-peach-soft text-vivu-peach flex items-center justify-center shadow-xs">
            <i className="bi bi-stars text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-vivu-mocha">Kèo quanh bạn</h1>
            <span className="text-[11px] text-vivu-cocoa flex items-center gap-1">
              <i className="bi bi-geo-alt-fill text-vivu-peach"></i>
              <span>Bán kính 2km • GPS thời gian thực</span>
            </span>
          </div>
        </div>

        <button
          onClick={onOpenCreateStory}
          className="h-9 px-3.5 rounded-full bg-vivu-peach text-white text-xs font-bold shadow-cozy-sm flex items-center gap-1.5 btn-spring hover:brightness-105"
        >
          <i className="bi bi-plus-lg"></i>
          <span>Rủ đi chơi</span>
        </button>
      </div>

      {/* Bộ lọc danh mục */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {categories.map(cat => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`py-1.5 px-3 rounded-full text-xs font-semibold shrink-0 transition-all btn-spring flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-vivu-peach text-white shadow-xs'
                  : 'bg-white text-vivu-cocoa border border-vivu-border hover:bg-vivu-tint'
              }`}
            >
              <i className={`bi ${cat.iconClass}`}></i>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Danh sách các kèo rủ (Story Beacons) */}
      <div className="space-y-3">
        {filteredStories.map(story => (
          <div 
            key={story.id}
            className="bg-white rounded-3xl p-4 border border-vivu-border shadow-cozy-sm space-y-3 transition-all hover:shadow-cozy-md btn-spring"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img 
                  src={story.hostAvatar} 
                  alt="" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-vivu-peach-soft" 
                />
                <div>
                  <h3 className="font-bold text-xs text-vivu-mocha">{story.hostName}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-vivu-cocoa">
                    <span className="text-vivu-peach font-semibold font-mono">Cách bạn {story.liveDistance || story.distance || '250m'}</span>
                    <span>•</span>
                    <span>{story.expiresIn || 'Còn 3 giờ'}</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-vivu-tint text-vivu-mocha border border-vivu-border">
                {categories.find(c => c.id === story.category)?.label}
              </span>
            </div>

            <div>
              <h4 className="font-bold text-sm text-vivu-mocha">{story.title}</h4>
              <p className="text-xs text-vivu-cocoa mt-1 leading-relaxed line-clamp-2">{story.description}</p>
            </div>

            <div className="bg-vivu-tint/80 rounded-2xl p-2.5 text-xs text-vivu-mocha flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <i className="bi bi-geo-alt-fill text-vivu-peach shrink-0 text-xs"></i>
                <span className="truncate font-medium">{story.address || 'Quanh đây'}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-vivu-sage shrink-0 pl-2">
                <i className="bi bi-clock-fill"></i>
                <span>{story.plannedAt || 'Ngay bây giờ'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <button 
                onClick={() => onOpenStoryChat(story)}
                className="flex-1 py-2.5 bg-vivu-peach text-white rounded-full font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 btn-spring hover:brightness-105"
              >
                <i className="bi bi-chat-dots-fill"></i>
                <span>Nhắn tin rủ đi</span>
              </button>
              <button 
                onClick={() => onViewStoryDetail(story)}
                className="px-4 py-2.5 bg-vivu-tint text-vivu-mocha border border-vivu-border rounded-full font-semibold text-xs hover:bg-vivu-border/40 btn-spring"
              >
                Chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
