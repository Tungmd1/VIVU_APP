import React, { useState, useEffect } from 'react';

/**
 * Component Form Đăng Nhập VIVU
 * Chuẩn Luminous Solar-Cyber HUD (White Cyberpunk), 100% Bootstrap Icons
 */
export default function LoginForm({
  initialEmail = '',
  successMessage = '',
  onClearSuccess,
  onSwitchToRegister,
  onSwitchToForgotPassword,
  onSubmit,
  isSubmitting,
  authError,
  onClearError
}) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Tự động điền email khi vừa đăng ký xong chuyển sang (Rule 10)
  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    if (onClearError) onClearError();
    if (onClearSuccess) onClearSuccess();

    if (!email.trim()) {
      setValidationError('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }
    if (!password) {
      setValidationError('Vui lòng nhập mật khẩu.');
      return;
    }

    await onSubmit(email.trim(), password);
  };

  const displayError = validationError || authError;

  return (
    <div className="w-full space-y-4 text-[#131315]">
      {/* Thông báo thành công sau khi đăng ký hoặc đổi mật khẩu */}
      {successMessage && !displayError && (
        <div className="p-3.5 rounded-2xl bg-[#E8FBF0] border border-[#A7F3D0] text-[#059669] text-xs flex items-start gap-2.5 animate-in fade-in duration-200 shadow-xs">
          <i className="bi bi-check-circle-fill text-[#10FFA0] text-base shrink-0 mt-0.5"></i>
          <div className="flex-1">
            <div className="font-bold text-[#059669] font-display">Đăng ký tài khoản thành công!</div>
            <div className="text-[11px] text-[#059669]/90 mt-0.5">{successMessage}</div>
          </div>
        </div>
      )}

      {/* Thông báo lỗi */}
      {displayError && (
        <div className="p-3 rounded-2xl bg-[#FEE2E2] border border-[#FCA5A5] text-[#EF4444] text-xs flex items-start gap-2 animate-in fade-in duration-200 shadow-xs">
          <i className="bi bi-exclamation-triangle-fill text-[#EF4444] text-sm shrink-0 mt-0.5"></i>
          <span className="flex-1 font-medium">{displayError}</span>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-3.5">
        {/* Email Input */}
        <div>
          <label className="block text-[11px] font-bold text-[#131315] uppercase tracking-wider mb-1.5 font-display">
            Email tài khoản
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

        {/* Password Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold text-[#131315] uppercase tracking-wider font-display">
              Mật khẩu
            </label>
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-[11px] font-semibold text-[#00838F] hover:text-[#006064] hover:underline transition-all cursor-pointer"
            >
              Quên mật khẩu?
            </button>
          </div>
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

        {/* Nút Đăng nhập chính chuẩn Luminous Solar-Cyber HUD */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-display font-bold text-xs shadow-[0_0_20px_rgba(0,229,255,0.40)] hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer border border-[#00F0FF]"
        >
          {isSubmitting ? (
            <>
              <i className="bi bi-arrow-repeat animate-spin text-sm"></i>
              <span>Đang kiểm tra thông tin...</span>
            </>
          ) : (
            <>
              <i className="bi bi-box-arrow-in-right text-sm"></i>
              <span>Đăng Nhập VIVU</span>
            </>
          )}
        </button>
      </form>

      {/* Chuyển sang Tab Đăng Ký */}
      <div className="text-center pt-2">
        <p className="text-xs text-[#70787E]">
          Chưa có tài khoản VIVU?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-bold text-[#00838F] hover:text-[#006064] hover:underline cursor-pointer"
          >
            Đăng ký ngay
          </button>
        </p>
      </div>
    </div>
  );
}
