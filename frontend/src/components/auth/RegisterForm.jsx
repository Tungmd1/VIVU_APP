import React, { useState } from 'react';

/**
 * Component Form Đăng Ký Tài Khoản VIVU
 * Chuẩn Luminous Solar-Cyber HUD (White Cyberpunk), 100% Bootstrap Icons
 */
export default function RegisterForm({
  onSwitchToLogin,
  onSubmit,
  isSubmitting,
  authError,
  onClearError
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    if (onClearError) onClearError();

    if (!fullName.trim()) {
      setValidationError('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    if (!email.trim()) {
      setValidationError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (password.length < 6) {
      setValidationError('Mật khẩu phải có độ dài tối thiểu 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Mật khẩu xác nhận không khớp.');
      return;
    }

    await onSubmit(email.trim(), password, fullName.trim());
  };

  const displayError = validationError || authError;

  return (
    <div className="w-full space-y-4 text-[#131315]">
      {/* Thông báo lỗi */}
      {displayError && (
        <div className="p-3 rounded-2xl bg-[#FEE2E2] border border-[#FCA5A5] text-[#EF4444] text-xs flex items-start gap-2 animate-in fade-in duration-200 shadow-xs">
          <i className="bi bi-exclamation-triangle-fill text-[#EF4444] text-sm shrink-0 mt-0.5"></i>
          <span className="flex-1 font-medium">{displayError}</span>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-3">
        {/* Họ và tên */}
        <div>
          <label className="block text-[11px] font-bold text-[#131315] uppercase tracking-wider mb-1 font-display">
            Họ và tên
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-[#00838F] text-sm pointer-events-none">
              <i className="bi bi-person-fill"></i>
            </span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              disabled={isSubmitting}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#D2D9F4] bg-[#F2F3FF] text-xs text-[#131315] placeholder-[#70787E] focus:outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[rgba(0,229,255,0.25)] transition-all font-medium"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-[11px] font-bold text-[#131315] uppercase tracking-wider mb-1 font-display">
            Địa chỉ Email
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-[#00838F] text-sm pointer-events-none">
              <i className="bi bi-envelope-at-fill"></i>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tenban@gmail.com"
              disabled={isSubmitting}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#D2D9F4] bg-[#F2F3FF] text-xs text-[#131315] placeholder-[#70787E] focus:outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[rgba(0,229,255,0.25)] transition-all font-medium"
            />
          </div>
        </div>

        {/* Mật khẩu */}
        <div>
          <label className="block text-[11px] font-bold text-[#131315] uppercase tracking-wider mb-1 font-display">
            Mật khẩu (tối thiểu 6 ký tự)
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-[#00838F] text-sm pointer-events-none">
              <i className="bi bi-shield-lock-fill"></i>
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isSubmitting}
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-[#D2D9F4] bg-[#F2F3FF] text-xs text-[#131315] placeholder-[#70787E] focus:outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[rgba(0,229,255,0.25)] transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-[#70787E] hover:text-[#131315] text-sm transition-colors cursor-pointer"
            >
              <i className={showPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'}></i>
            </button>
          </div>
        </div>

        {/* Xác nhận mật khẩu */}
        <div>
          <label className="block text-[11px] font-bold text-[#131315] uppercase tracking-wider mb-1 font-display">
            Xác nhận lại mật khẩu
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
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#D2D9F4] bg-[#F2F3FF] text-xs text-[#131315] placeholder-[#70787E] focus:outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[rgba(0,229,255,0.25)] transition-all font-medium"
            />
          </div>
        </div>

        {/* Nút Đăng ký */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-display font-bold text-xs shadow-[0_0_20px_rgba(0,229,255,0.40)] hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-3 disabled:opacity-50 cursor-pointer border border-[#00F0FF]"
        >
          {isSubmitting ? (
            <>
              <i className="bi bi-arrow-repeat animate-spin text-sm"></i>
              <span>Đang tạo tài khoản...</span>
            </>
          ) : (
            <>
              <i className="bi bi-person-plus-fill text-sm"></i>
              <span>Tạo Tài Khoản VIVU</span>
            </>
          )}
        </button>
      </form>

      {/* Cam kết điều khoản */}
      <p className="text-[10px] text-[#70787E] text-center leading-relaxed">
        Bằng việc đăng ký, bạn đồng ý với Điều khoản Dịch vụ và Chính sách Định vị GPS bảo mật của VIVU.
      </p>

      {/* Chuyển sang Đăng nhập */}
      <div className="text-center pt-2 border-t border-[#D2D9F4]">
        <p className="text-xs text-[#70787E]">
          Đã có tài khoản?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-[#00838F] hover:text-[#006064] hover:underline cursor-pointer"
          >
            Đăng nhập ngay
          </button>
        </p>
      </div>
    </div>
  );
}
