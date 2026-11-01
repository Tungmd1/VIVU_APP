import React, { useEffect, useState } from 'react';

/**
 * MemeScreenTakeover - Hiệu ứng Meme bay lượn toàn màn hình khi bị ném Meme Troll
 * Không dùng emoji, 100% Bootstrap Icons & SVG animation
 */
export default function MemeScreenTakeover({ meme, senderName = 'Một người bạn', onDismiss }) {
  const [scaleUp, setScaleUp] = useState(false);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    // Kích hoạt chuỗi animation
    const t1 = setTimeout(() => setScaleUp(true), 50);
    const t2 = setTimeout(() => setShaking(true), 350);
    const t3 = setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 3600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDismiss]);

  if (!meme) return null;

  return (
    <div
      onClick={onDismiss}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md cursor-pointer select-none overflow-hidden transition-all duration-300"
    >
      {/* Sóng xung kích phát quang nền */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#FF2A85]/25 to-[#00E5FF]/25 blur-3xl animate-pulse" />
      </div>

      {/* Các hạt pháo sáng / icon bay quanh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <i className="bi bi-stars text-2xl text-[#FF2A85] absolute top-16 left-12 animate-bounce" />
        <i className="bi bi-lightning-charge-fill text-3xl text-[#00E5FF] absolute top-24 right-16 animate-pulse" />
        <i className="bi bi-chat-quote-fill text-2xl text-[#FF2A85] absolute bottom-24 left-16 animate-bounce" />
        <i className="bi bi-fire text-3xl text-amber-400 absolute bottom-32 right-20 animate-pulse" />
      </div>

      {/* Khung Meme chính giữa */}
      <div
        className={`relative max-w-sm w-full text-center transition-all duration-500 transform ${
          scaleUp ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        } ${shaking ? 'animate-wiggle' : ''}`}
      >
        {/* Banner gửi từ ai */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white mb-4 shadow-lg shadow-[#FF2A85]/20">
          <i className="bi bi-broadcast text-[#FF2A85] animate-ping" />
          <span>{senderName} vừa ném meme trêu bạn!</span>
        </div>

        {/* Khung ảnh meme nổi bật */}
        <div className="relative mx-auto w-48 h-48 sm:w-56 sm:h-56 rounded-3xl p-1 bg-gradient-to-tr from-[#FF2A85] via-white/50 to-[#00E5FF] shadow-2xl shadow-[#FF2A85]/50 group">
          <div className="w-full h-full rounded-[22px] overflow-hidden bg-[#11131a] flex items-center justify-center relative">
            <img
              src={meme.img}
              alt={meme.name}
              className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            {/* Fallback Icon nếu ảnh tải chậm */}
            <div className="absolute inset-0 flex flex-col items-center justify-center -z-10 text-white/50">
              <i className={`${meme.icon || 'bi bi-emoji-smile'} text-5xl text-[#FF2A85] mb-2`} />
              <span className="text-xs">{meme.name}</span>
            </div>
          </div>

          {/* Badge cấp độ trêu */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#FF2A85] text-white text-[11px] font-black tracking-wider uppercase shadow-md flex items-center gap-1">
            <i className="bi bi-bullseye" />
            <span>{meme.tag || 'HOT TREND'}</span>
          </div>
        </div>

        {/* Lời thoại hài hước trêu ngươi */}
        <div className="mt-7 px-4">
          <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-100 to-[#00E5FF] tracking-tight mb-2">
            "{meme.caption || meme.name}"
          </h3>
          <p className="text-xs sm:text-sm text-white/70 max-w-xs mx-auto">
            {meme.subtext || 'Đã cộng +1 điểm Độ Nhây vào chỉ số tính cách!'}
          </p>
        </div>

        {/* Nút chạm để đóng */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onDismiss}
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white/80 text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-2"
          >
            <i className="bi bi-x-circle text-[#FF2A85]" />
            <span>Chạm để đóng</span>
          </button>
        </div>
      </div>
    </div>
  );
}

