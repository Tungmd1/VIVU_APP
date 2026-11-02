import React from 'react';

/**
 * CreateActionSheet - Menu Lựa Chọn Tạo Mới Tích Hợp Vào Nút Dấu Cộng (+)
 * - Xuất hiện khi bấm nút (+) ở giữa thanh menu dưới
 * - Gồm 2 lựa chọn to rõ: Đăng Story Khoảnh Khắc & Cập Nhật Trạng Thái Suy Nghĩ
 * - 100% Bootstrap Icons (Rule 5), < 450 dòng (Rule 7)
 */
export default function CreateActionSheet({
  isOpen,
  onClose,
  onSelectStory,
  onSelectStatus
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-md flex items-end justify-center p-0 sm:p-4 select-none font-sans animate-in fade-in duration-200">
      {/* Vùng bấm ngoài để đóng */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Khung Sheet chính bo góc F1 Glassmorphism */}
      <div className="relative z-10 w-full max-w-md bg-[#0F121C]/95 border border-white/15 rounded-t-[32px] sm:rounded-3xl p-5 shadow-[0_-20px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl space-y-4 animate-in slide-in-from-bottom-8 duration-300 text-white">
        
        {/* Thanh gạt đỉnh */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1 mb-2" />

        {/* Header Sheet */}
        <div className="flex items-center justify-between pb-1">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Tạo Mới Khoảnh Khắc</span>
              <span className="w-2 h-2 rounded-full bg-[#FF2A85] animate-ping" />
            </h3>
            <p className="text-xs text-white/50">Chọn loại nội dung bạn muốn chia sẻ lên Bản đồ VIVU</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Đóng"
          >
            <i className="bi bi-x-lg text-xs"></i>
          </button>
        </div>

        {/* 2 LỰA CHỌN TO RÕ PHONG CÁCH TIKTOK / INSTAGRAM */}
        <div className="space-y-3 pt-1">
          {/* LỰA CHỌN 1: ĐĂNG STORY KHOẢNH KHẮC */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectStory();
            }}
            className="w-full text-left p-4 rounded-2xl bg-gradient-to-r from-[#FF2A85]/20 via-[#7928CA]/20 to-transparent border border-[#FF2A85]/50 hover:border-[#FF2A85] hover:from-[#FF2A85]/30 hover:via-[#7928CA]/30 transition-all flex items-center gap-4 group cursor-pointer active:scale-98 shadow-[0_4px_20px_rgba(255,42,133,0.2)]"
          >
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#FF2A85] to-[#7928CA] text-white flex items-center justify-center text-2xl shadow-[0_0_16px_rgba(255,42,133,0.6)] group-hover:scale-105 transition-transform shrink-0">
              <i className="bi bi-camera-reels-fill"></i>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white group-hover:text-[#FF2A85] transition-colors">
                  Đăng Story Khoảnh Khắc
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF2A85]/20 text-[#FF529D] border border-[#FF2A85]/30">
                  24 Giờ
                </span>
              </div>
              <p className="text-xs text-white/60 mt-1 line-clamp-2">
                Chụp ảnh, chọn ảnh thư viện, soạn chữ gradient hoặc gắn nhạc hát thật từ Apple Music.
              </p>
            </div>
            <i className="bi bi-chevron-right text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all text-base"></i>
          </button>

          {/* LỰA CHỌN 2: CẬP NHẬT TRẠNG THÁI SUY NGHĨ */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectStatus();
            }}
            className="w-full text-left p-4 rounded-2xl bg-gradient-to-r from-[#00E5FF]/20 via-[#10FFA0]/15 to-transparent border border-[#00E5FF]/40 hover:border-[#00E5FF] hover:from-[#00E5FF]/30 hover:via-[#10FFA0]/20 transition-all flex items-center gap-4 group cursor-pointer active:scale-98 shadow-[0_4px_20px_rgba(0,229,255,0.15)]"
          >
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#00E5FF] to-[#10FFA0] text-[#08202E] flex items-center justify-center text-2xl shadow-[0_0_16px_rgba(0,229,255,0.6)] group-hover:scale-105 transition-transform shrink-0">
              <i className="bi bi-chat-quote-fill"></i>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white group-hover:text-[#00E5FF] transition-colors">
                  Trạng Thái Suy Nghĩ
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30">
                  Ghim Bản Đồ
                </span>
              </div>
              <p className="text-xs text-white/60 mt-1 line-clamp-2">
                Viết suy nghĩ ngắn 60 ký tự kèm bài hát yêu thích nổi trên ghim giọt nước của Bạn.
              </p>
            </div>
            <i className="bi bi-chevron-right text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all text-base"></i>
          </button>
        </div>

        {/* Nút hủy ở đáy */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white font-bold text-xs transition-colors cursor-pointer active:scale-98"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}

