import React, { useState } from 'react';

/**
 * Modal Đặt Lại Mật Khẩu Mới khi người dùng mở liên kết Magic Link từ Email
 * Chuẩn Luminous Solar-Cyber HUD (White Cyberpunk), 100% Bootstrap Icons
 */
export default function ResetPasswordModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    const res = await onSubmit(newPassword);
    if (res?.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } else {
      setError(res?.error || 'Không thể cập nhật mật khẩu. Vui lòng thử lại.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200 select-none font-sans">
      <div className="w-full max-w-sm bg-white/95 backdrop-blur-2xl rounded-3xl p-6 border border-[#D2D9F4] shadow-[0_25px_60px_rgba(0,0,0,0.15),0_0_30px_rgba(0,229,255,0.15)] space-y-4 animate-in zoom-in-95 duration-200 text-[#131315]">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-[rgba(0,229,255,0.12)] text-[#00838F] border border-[rgba(0,229,255,0.3)] mx-auto flex items-center justify-center text-xl mb-1 shadow-xs">
            <i className="bi bi-shield-lock-fill"></i>
          </div>
          <h3 className="font-bold text-sm text-[#131315] font-display">Tạo Mật Khẩu Mới</h3>
          <p className="text-xs text-[#70787E]">
            Liên kết xác thực hợp lệ. Hãy thiết lập mật khẩu bảo mật mới cho tài khoản VIVU của bạn.
          </p>
        </div>

        {/* Lỗi */}
        {error && (
          <div className="p-3 rounded-2xl bg-[#FEE2E2] border border-[#FCA5A5] text-[#EF4444] text-xs flex items-start gap-2 shadow-xs">
            <i className="bi bi-exclamation-triangle-fill text-[#EF4444] shrink-0 mt-0.5"></i>
            <span>{error}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="p-4 rounded-2xl bg-[#E8FBF0] border border-[#A7F3D0] text-[#059669] text-xs text-center space-y-1 shadow-xs">
            <i className="bi bi-check-circle-fill text-[#10FFA0] text-2xl"></i>
            <p className="font-bold text-[#059669] font-display">Đổi mật khẩu thành công!</p>
            <p className="text-[11px] text-[#059669]/90">Đang đưa bạn vào giao diện chính...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-[#131315] uppercase tracking-wider mb-1 font-display">
                Mật khẩu mới
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#00838F] text-sm pointer-events-none">
                  <i className="bi bi-key-fill"></i>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-[#D2D9F4] bg-[#F2F3FF] text-xs text-[#131315] placeholder-[#70787E] focus:outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[rgba(0,229,255,0.25)] font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-[#70787E] hover:text-[#131315] text-sm cursor-pointer"
                >
                  <i className={showPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'}></i>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#131315] uppercase tracking-wider mb-1 font-display">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#00838F] text-sm pointer-events-none">
                  <i className="bi bi-shield-check"></i>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#D2D9F4] bg-[#F2F3FF] text-xs text-[#131315] placeholder-[#70787E] focus:outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[rgba(0,229,255,0.25)] font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-display font-bold text-xs shadow-[0_0_20px_rgba(0,229,255,0.40)] hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50 border border-[#00F0FF]"
            >
              {isSubmitting ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin text-sm"></i>
                  <span>Đang lưu mật khẩu...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg text-sm"></i>
                  <span>Lưu Mật Khẩu Mới</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
