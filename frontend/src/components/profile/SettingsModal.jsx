import React, { useState } from 'react';

/**
 * Modal Cấu Hình & Cài Đặt Ứng Dụng VIVU (Settings)
 * Chức năng: Khóa trang/màn hình, Đăng xuất, Xóa lịch sử trò chuyện, Tàng hình GPS, Đổi mật khẩu
 * Chuẩn Resend Dark Monochrome, 100% Bootstrap Icons
 */
export default function SettingsModal({
  isOpen,
  onClose,
  onLogout,
  onLockApp,
  onClearChatHistory,
  onOpenChangePassword,
  ghostMode,
  onToggleGhostMode,
  messagePrivacy = 'everyone',
  onUpdateMessagePrivacy,
  currentThemeAccent = 'cyan',
  onSelectThemeAccent,
  onReplayIntro
}) {
  const [confirmClearChat, setConfirmClearChat] = useState(false);

  const THEME_ACCENTS = [
    { id: 'cyan', name: 'VIVU Cyan', hex: '#0EA5E9', desc: 'Xanh công nghệ' },
    { id: 'emerald', name: 'Nordic Emerald', hex: '#10B981', desc: 'Xanh lục tươi' },
    { id: 'violet', name: 'Electric Violet', hex: '#8B5CF6', desc: 'Tím thời thượng' },
    { id: 'rose', name: 'Neon Rose', hex: '#F43F5E', desc: 'Hồng cá tính' },
    { id: 'amber', name: 'Cyber Amber', hex: '#F59E0B', desc: 'Vàng rực rỡ' },
    { id: 'white', name: 'Pure White', hex: '#FFFFFF', desc: 'Tối giản nguyên bản' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none font-sans">
      <div className="w-full max-w-sm bg-[#0E0E10] border border-white/15 rounded-3xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.95)] max-h-[90vh] overflow-y-auto no-scrollbar space-y-4 text-white">
        
        {/* Header Cài đặt */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center text-sm border border-white/15">
              <i className="bi bi-gear-fill"></i>
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Cài Đặt &amp; Cấu Hình</h2>
              <p className="text-[10px] text-[#8E8E93]">Quản trị quyền riêng tư &amp; dữ liệu</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
          >
            <i className="bi bi-x-lg text-xs"></i>
          </button>
        </div>

        {/* ======================================================== */}
        {/* NHÓM 1: BẢO MẬT & KHÓA TRANG                            */}
        {/* ======================================================== */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider px-1">
            Bảo Mật &amp; Khóa Ứng Dụng
          </h3>
          
          <div className="bg-[#151619] rounded-2xl p-3.5 border border-white/10 space-y-3">
            {/* Nút Khóa trang */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs">
                  <i className="bi bi-shield-lock-fill"></i>
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Khóa ứng dụng ngay</div>
                  <div className="text-[10px] text-[#8E8E93]">Bảo vệ riêng tư khi cho người khác mượn máy</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLockApp();
                }}
                className="px-2.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold active:scale-[0.97] transition-all flex items-center gap-1 cursor-pointer"
              >
                <i className="bi bi-lock-fill"></i>
                <span>Khóa</span>
              </button>
            </div>

            {/* Chế độ Tàng hình trên Bản đồ (Ghost Mode) */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs">
                  <i className="bi bi-eye-slash-fill"></i>
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Chế độ tàng hình GPS</div>
                  <div className="text-[10px] text-[#8E8E93]">Ẩn vị trí trên bản đồ với người lạ</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleGhostMode}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer border ${
                  ghostMode ? 'bg-indigo-600 border-indigo-400' : 'bg-white/10 border-white/15'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    ghostMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Phân quyền nhận tin nhắn */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center text-xs">
                  <i className="bi bi-shield-check"></i>
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Quyền nhận tin nhắn</div>
                  <div className="text-[10px] text-[#8E8E93]">
                    {messagePrivacy === 'friends_only' ? 'Chỉ bạn bè mới được nhắn' : 'Mọi người (Người lạ gửi tin chờ)'}
                  </div>
                </div>
              </div>
              {onUpdateMessagePrivacy && (
                <button
                  type="button"
                  onClick={() => onUpdateMessagePrivacy(messagePrivacy === 'friends_only' ? 'everyone' : 'friends_only')}
                  className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white active:scale-95 transition-all cursor-pointer"
                >
                  {messagePrivacy === 'friends_only' ? 'Chỉ bạn bè' : 'Mọi người'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* NHÓM 2: MÀU SẮC GIAO DIỆN (THEME ACCENT COLOR)          */}
        {/* ======================================================== */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider flex items-center gap-1.5">
              <i className="bi bi-palette-fill text-sky-400 text-xs"></i>
              <span>Màu Sắc Giao Diện</span>
            </h3>
            <span className="text-[10px] text-sky-400 font-semibold font-mono">
              {THEME_ACCENTS.find(a => a.id === currentThemeAccent)?.name || 'VIVU Cyan'}
            </span>
          </div>

          <div
            role="radiogroup"
            aria-label="Chọn màu sắc chủ đạo của giao diện"
            className="grid grid-cols-3 gap-2 bg-[#151619] rounded-2xl p-3 border border-white/10"
          >
            {THEME_ACCENTS.map((accent) => {
              const isSelected = currentThemeAccent === accent.id;
              return (
                <button
                  key={accent.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onSelectThemeAccent?.(accent.id)}
                  className={`p-2 rounded-xl flex flex-col items-center gap-1.5 border transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-white/15 border-white text-white shadow-md'
                      : 'bg-black/30 border-white/5 text-[#8E8E93] hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="relative">
                    <span
                      className="w-6 h-6 rounded-full block border border-white/30 shadow-xs"
                      style={{ backgroundColor: accent.hex }}
                    />
                    {isSelected && (
                      <span className="absolute inset-0 flex items-center justify-center text-black text-[11px] font-black drop-shadow">
                        <i className="bi bi-check-lg font-extrabold"></i>
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold truncate max-w-full">
                    {accent.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* NHÓM 3: DỮ LIỆU CUỘC TRÒ CHUYỆN                         */}
        {/* ======================================================== */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider px-1">
            Trò Chuyện &amp; Lưu Trữ
          </h3>

          <div className="bg-[#151619] rounded-2xl p-3.5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-xs">
                  <i className="bi bi-chat-left-dots-fill"></i>
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Xóa lịch sử trò chuyện</div>
                  <div className="text-[10px] text-[#8E8E93]">Dọn dẹp sạch toàn bộ tin nhắn đã gửi</div>
                </div>
              </div>
              
              {!confirmClearChat ? (
                <button
                  type="button"
                  onClick={() => setConfirmClearChat(true)}
                  className="px-2.5 py-1 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-[11px] font-bold active:scale-[0.97] transition-all cursor-pointer flex items-center gap-1"
                >
                  <i className="bi bi-trash3"></i>
                  <span>Xóa</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onClearChatHistory();
                      setConfirmClearChat(false);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-bold active:scale-[0.97] cursor-pointer"
                  >
                    Xác nhận
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearChat(false)}
                    className="px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* NHÓM 4: TÀI KHOẢN & PHIÊN LÀM VIỆC                      */}
        {/* ======================================================== */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider px-1">
            Tài Khoản
          </h3>

          <div className="bg-[#151619] rounded-2xl p-3.5 border border-white/10 space-y-2.5">
            {/* Đổi mật khẩu */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenChangePassword();
              }}
              className="w-full flex items-center justify-between py-1 text-left cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs">
                  <i className="bi bi-key-fill"></i>
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Đổi mật khẩu tài khoản</div>
                  <div className="text-[10px] text-[#8E8E93]">Cập nhật mật khẩu đăng nhập an toàn</div>
                </div>
              </div>
              <i className="bi bi-chevron-right text-xs text-[#8E8E93]"></i>
            </button>

            {/* Xem lại Video Intro */}
            {onReplayIntro && (
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-xs">
                    <i className="bi bi-play-circle-fill"></i>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Xem lại Video Giới thiệu</div>
                    <div className="text-[10px] text-[#8E8E93]">Phát video intro VIVU có âm thanh</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onReplayIntro();
                  }}
                  className="px-3 py-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 text-xs font-bold active:scale-[0.97] transition-all flex items-center gap-1 cursor-pointer"
                >
                  <i className="bi bi-play-fill"></i>
                  <span>Xem</span>
                </button>
              </div>
            )}

            {/* Đăng xuất tài khoản */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-xs">
                  <i className="bi bi-box-arrow-right"></i>
                </div>
                <div>
                  <div className="text-xs font-bold text-rose-300">Đăng xuất khỏi thiết bị</div>
                  <div className="text-[10px] text-rose-400/80">Kết thúc phiên làm việc hiện tại</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi VIVU?')) {
                    onClose();
                    onLogout();
                  }
                }}
                className="px-3 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-bold active:scale-[0.97] transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>

        {/* Thông tin phiên bản */}
        <div className="pt-2 text-center text-[10px] text-[#8E8E93]">
          VIVU Social Map • Phiên bản 1.0.4 (Bảo mật GPS kép)
        </div>
      </div>
    </div>
  );
}
