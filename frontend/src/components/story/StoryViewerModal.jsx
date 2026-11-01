import React from 'react';

function formatRemainingTime(expiresAt) {
  if (!expiresAt) return null;
  try {
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    if (diffMs <= 0) return 'Sắp hết hạn';
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `Còn ${diffMins} phút`;
    const hours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    if (remainingMins === 0) return `Còn ${hours} giờ`;
    return `Còn ${hours}h ${remainingMins}p`;
  } catch {
    return null;
  }
}

export default function StoryViewerModal({ 
  story, 
  onClose, 
  onOpenStoryChat, 
  onSendHeart, 
  onStartNavigation,
  categories = [] 
}) {
  if (!story) return null;

  const categoryItem = categories.find(c => c.id === story.category);
  const remainingTimeText = formatRemainingTime(story.expires_at || story.expiresAt) || story.expiresIn || 'Còn 3 giờ';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex justify-center items-end animate-fadeIn select-none">
      <div className="w-full max-w-md bg-white rounded-t-[32px] p-5 shadow-2xl border-t border-vivu-border space-y-3.5 max-h-[85vh] overflow-y-auto no-scrollbar">
        <div className="w-12 h-1.5 bg-vivu-border rounded-full mx-auto -mt-1 mb-1"></div>
        
        {/* Header: Người đăng + Quyền riêng tư + Nút đóng */}
        <div className="flex items-center justify-between pb-2 border-b border-vivu-border/40">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={story.hostAvatar} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-[#FF7E67] shadow-sm" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base text-vivu-mocha">{story.hostName}</h3>
                {(!story.privacy || story.privacy === 'public') ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-600 border border-sky-200 flex items-center gap-1">
                    <i className="bi bi-globe2"></i>
                    <span>Công khai quanh đây</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1">
                    <i className="bi bi-people-fill"></i>
                    <span>Chỉ bạn bè</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-vivu-cocoa mt-0.5">
                <span className="text-vivu-peach font-mono font-bold">Cách bạn {story.liveDistance || story.distance}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <i className="bi bi-clock-history text-amber-500"></i>
                  <span>{remainingTimeText}</span>
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-vivu-tint flex items-center justify-center text-vivu-cocoa hover:bg-vivu-border transition-colors">
            <i className="bi bi-x-lg text-sm"></i>
          </button>
        </div>

        {/* Nội dung Story chính - Object-contain + Blur Background */}
        {story.image ? (
          <div className="relative rounded-2xl overflow-hidden w-full shadow-md border border-vivu-border bg-black min-h-[220px] max-h-[60vh] flex items-center justify-center">
            <img
              src={story.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
            />
            <img
              src={story.image}
              alt="Story"
              className="relative w-auto h-auto max-w-full max-h-[60vh] object-contain"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 pt-8">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md border border-white/30 mb-1.5 uppercase text-white">
                {categoryItem?.label || 'Khoảnh khắc'}
              </span>
              <h2 className="text-base font-extrabold leading-tight text-white drop-shadow-md">{story.title}</h2>
              {story.description && (
                <p className="text-xs text-white/90 line-clamp-2 mt-1 drop-shadow-sm">{story.description}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-tr from-[#FF7E67]/15 via-orange-50 to-[#FFA28D]/15 rounded-2xl p-4 border border-[#FF7E67]/30 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF7E67] text-white">
                {categoryItem?.label || 'Khoảnh khắc'}
              </span>
              <span className="text-[10px] text-vivu-cocoa flex items-center gap-1">
                <i className="bi bi-clock-fill text-vivu-peach"></i>
                <span>{story.plannedAt || 'Ngay bây giờ'}</span>
              </span>
            </div>
            <h2 className="font-extrabold text-lg text-vivu-mocha leading-snug">{story.title}</h2>
            {story.description && (
              <p className="text-xs text-vivu-cocoa leading-relaxed">{story.description}</p>
            )}
          </div>
        )}

        {/* Thông tin tọa độ GPS thật */}
        <div className="bg-vivu-tint/90 rounded-2xl p-3 text-xs space-y-1.5 text-vivu-mocha border border-vivu-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold">
              <i className="bi bi-geo-alt-fill text-vivu-peach"></i>
              <span className="truncate max-w-[200px]">{story.address || 'Quanh vị trí của bạn'}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              GPS THẬT
            </span>
          </div>
          <div className="text-[10px] text-vivu-cocoa font-mono flex items-center gap-1 pt-1 border-t border-vivu-border/40">
            <i className="bi bi-crosshair text-sky-500"></i>
            <span>Tọa độ xác thực: {story.realLat || 10.7769}°N, {story.realLng || 106.7009}°E</span>
          </div>
        </div>

        {/* 3 Nút Hành Động Tương Tác: Nhắn tin 1-1, Thả tim nở hoa, Chỉ đường Mapbox */}
        <div className="pt-2 flex items-center gap-2">
          <button 
            onClick={() => onOpenStoryChat(story)}
            className="flex-1 py-3 bg-[#FF7E67] text-white rounded-full font-bold text-xs shadow-cozy-sm flex items-center justify-center gap-2 btn-spring hover:brightness-105"
          >
            <i className="bi bi-chat-dots-fill text-sm"></i>
            <span>Nhắn tin với {story.hostName.split(' ').slice(-1)[0]}</span>
          </button>

          <button 
            onClick={onSendHeart}
            className="w-11 h-11 rounded-full bg-rose-50 text-rose-500 border border-rose-200 flex items-center justify-center btn-spring hover:bg-rose-100 shadow-sm"
            title="Thả tim Story"
          >
            <i className="bi bi-heart-fill text-base"></i>
          </button>

          <button 
            onClick={() => onStartNavigation(story)}
            className="w-11 h-11 rounded-full bg-vivu-sky text-white flex items-center justify-center shadow-sm btn-spring hover:brightness-105"
            title="Chỉ đường đến vị trí thật"
          >
            <i className="bi bi-compass-fill text-base"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
