import React, { useState } from 'react';

/**
 * Component Form Quên Mật Khẩu Mockup OTP (3 Bước chuẩn HUD Cyber)
 * Bước 1: Nhập Email -> Bước 2: Nhận & Điền OTP Mockup -> Bước 3: Đặt Mật khẩu mới
 * 100% Bootstrap Icons (Rule 5), Rule 7 (< 450 dòng)
 */
export default function ForgotPasswordForm({
  onSwitchToLogin,
  onSubmitMockReset,
  isSubmitting,
  authError,
  onClearError
}) {
  // Trạng thái bước: 1 (Email) -> 2 (OTP) -> 3 (New Password) -> 4 (Success)
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [mockOtp, setMockOtp] = useState('889966');
  const [inputOtp, setInputOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isCopiedOtp, setIsCopiedOtp] = useState(false);

  // Xử lý gửi yêu cầu bước 1: Tạo mã OTP giả lập
  const handleRequestOtp = (e) => {
    e.preventDefault();
    setValidationError('');
    if (onClearError) onClearError();

    if (!email.trim() || !email.includes('@')) {
      setValidationError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    // Sinh mã OTP 6 số ngẫu nhiên mô phỏng
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setMockOtp(generatedOtp);
    setStep(2);
  };

  // Tự động điền mã OTP giả lập vào input
  const handleAutoFillOtp = () => {
    setInputOtp(mockOtp);
    setIsCopiedOtp(true);
    setTimeout(() => setIsCopiedOtp(false), 2000);
  };

  // Xử lý xác nhận OTP bước 2
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setValidationError('');
    if (onClearError) onClearError();

    if (!inputOtp.trim() || inputOtp.trim() !== mockOtp) {
      setValidationError('Mã xác thực OTP không chính xác. Hãy nhập đúng mã hiển thị bên dưới.');
      return;
    }

    setStep(3);
  };

  // Xử lý đổi mật khẩu mới bước 3
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setValidationError('');
    if (onClearError) onClearError();

    if (!newPassword || newPassword.length < 6) {
      setValidationError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError('Xác nhận mật khẩu không trùng khớp.');
      return;
    }

    if (onSubmitMockReset) {
      const res = await onSubmitMockReset(email.trim(), newPassword, inputOtp);
      if (res?.success) {
        setStep(4);
      } else {
        setValidationError(res?.message || 'Có lỗi xảy ra khi cập nhật mật khẩu.');
      }
    } else {
      setStep(4);
    }
  };

  const displayError = validationError || authError;

  return (
    <div className="w-full space-y-4 text-[#131315]">
      {/* 1. Header & Chỉ báo tiến trình 3 bước */}
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-2xl bg-[rgba(0,229,255,0.12)] text-[#00838F] border border-[rgba(0,229,255,0.3)] mx-auto flex items-center justify-center text-xl mb-2 shadow-xs">
          <i className={
            step === 1 ? 'bi bi-envelope-at-fill' :
            step === 2 ? 'bi bi-shield-check' :
            step === 3 ? 'bi bi-key-fill' : 'bi bi-check2-circle'
          } />
        </div>

        <h3 className="font-bold text-sm text-[#131315] font-display">
          {step === 1 && 'Khôi Phục Mật Khẩu (Mockup)'}
          {step === 2 && 'Xác Thực Mã OTP Mockup'}
          {step === 3 && 'Tạo Mật Khẩu Mới'}
          {step === 4 && 'Đổi Mật Khẩu Thành Công!'}
        </h3>

        <p className="text-xs text-[#70787E] max-w-xs mx-auto leading-relaxed">
          {step === 1 && 'Nhập email tài khoản của bạn để nhận mã OTP mô phỏng kiểm thử.'}
          {step === 2 && `Mã xác thực đã được gửi đến ${email}. Hãy điền mã 6 số để tiếp tục.`}
          {step === 3 && 'Nhập mật khẩu mới an toàn cho tài khoản của bạn (tối thiểu 6 ký tự).'}
          {step === 4 && 'Mật khẩu của bạn đã được cập nhật thành công vào hệ thống. Hãy đăng nhập lại!'}
        </p>

        {/* Thanh chỉ báo bước 1-2-3 */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-2 pt-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-7 bg-gradient-to-r from-[#00E5FF] to-[#00B4D8]'
                    : s < step
                    ? 'w-3.5 bg-[#00838F]'
                    : 'w-3.5 bg-[#D2D9F4]'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thông báo lỗi nếu có */}
      {displayError && step < 4 && (
        <div className="p-3 rounded-2xl bg-[#FEE2E2] border border-[#FCA5A5] text-[#EF4444] text-xs flex items-start gap-2 animate-in fade-in duration-200 shadow-xs">
          <i className="bi bi-exclamation-triangle-fill text-[#EF4444] text-sm shrink-0 mt-0.5" />
          <span className="flex-1 font-medium">{displayError}</span>
        </div>
      )}

      {/* BƯỚC 1: NHẬP EMAIL */}
      {step === 1 && (
        <form onSubmit={handleRequestOtp} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-[#131315] uppercase tracking-wider mb-1.5 font-display">
              Email tài khoản của bạn
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#00838F] text-sm pointer-events-none">
                <i className="bi bi-envelope-at-fill" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenban@gmail.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#D2D9F4] bg-[#F2F3FF] text-xs text-[#131315] placeholder-[#70787E] focus:outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[rgba(0,229,255,0.25)] transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-display font-bold text-xs shadow-[0_0_20px_rgba(0,229,255,0.40)] hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#00F0FF]"
          >
            <span>Nhận Mã OTP Mockup</span>
            <i className="bi bi-arrow-right text-xs" />
          </button>

          <button
            type="button"
            onClick={onSwitchToLogin}
            className="w-full py-2.5 px-4 rounded-2xl border border-[#D2D9F4] bg-[#F2F3FF] text-[#131315] font-semibold text-xs hover:bg-[#E0E2F0] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <i className="bi bi-arrow-left text-xs" />
            <span>Trở về Đăng nhập</span>
          </button>
        </form>
      )}

      {/* BƯỚC 2: NHẬP MÃ OTP MOCKUP */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-3.5">
          {/* Hộp gợi ý mã OTP mô phỏng */}
          <div className="p-3.5 rounded-2xl bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.3)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#00E5FF]/20 text-[#00838F] flex items-center justify-center text-sm font-bold">
                <i className="bi bi-phone-vibrate" />
              </div>
              <div>
                <span className="text-[10px] text-[#70787E] block uppercase font-bold tracking-wider">Mã OTP Giả Lập</span>
                <span className="text-base font-black tracking-widest text-[#00838F] font-mono">{mockOtp}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAutoFillOtp}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#00E5FF] text-[#00838F] font-bold text-[11px] hover:bg-[#00E5FF]/10 active:scale-95 transition-all shadow-xs flex items-center gap-1"
            >
              <i className={`bi ${isCopiedOtp ? 'bi-check2' : 'bi-magic'} text-xs`} />
              <span>{isCopiedOtp ? 'Đã điền' : 'Tự điền OTP'}</span>
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#131315] uppercase tracking-wider mb-1.5 font-display">
              Nhập mã OTP 6 số
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#00838F] text-sm pointer-events-none">
                <i className="bi bi-lock-fill" />
              </span>
              <input
                type="text"
                maxLength={6}
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Nhập 6 số (VD: 889966)"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#D2D9F4] bg-[#F2F3FF] text-center text-sm font-bold tracking-widest text-[#131315] placeholder-[#70787E] focus:outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[rgba(0,229,255,0.25)] transition-all font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-display font-bold text-xs shadow-[0_0_20px_rgba(0,229,255,0.40)] hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#00F0FF]"
          >
            <span>Xác Thực OTP</span>
            <i className="bi bi-shield-check text-xs" />
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full py-2.5 px-4 rounded-2xl border border-[#D2D9F4] bg-[#F2F3FF] text-[#131315] font-semibold text-xs hover:bg-[#E0E2F0] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <i className="bi bi-arrow-left text-xs" />
            <span>Đổi email khác</span>
          </button>
        </form>
      )}

      {/* BƯỚC 3: ĐẶT MẬT KHẨU MỚI */}
      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-[#131315] uppercase tracking-wider mb-1.5 font-display">
              Mật khẩu mới
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#00838F] text-sm pointer-events-none">
                <i className="bi bi-key-fill" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-[#D2D9F4] bg-[#F2F3FF] text-xs text-[#131315] placeholder-[#70787E] focus:outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[rgba(0,229,255,0.25)] transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-[#70787E] hover:text-[#131315] text-sm transition-colors"
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#131315] uppercase tracking-wider mb-1.5 font-display">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#00838F] text-sm pointer-events-none">
                <i className="bi bi-shield-lock-fill" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#D2D9F4] bg-[#F2F3FF] text-xs text-[#131315] placeholder-[#70787E] focus:outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[rgba(0,229,255,0.25)] transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-display font-bold text-xs shadow-[0_0_20px_rgba(0,229,255,0.40)] hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#00F0FF]"
          >
            {isSubmitting ? (
              <>
                <i className="bi bi-arrow-repeat animate-spin text-sm" />
                <span>Đang lưu mật khẩu...</span>
              </>
            ) : (
              <>
                <i className="bi bi-check2-circle text-xs" />
                <span>Lưu Mật Khẩu Mới</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* BƯỚC 4: THÀNH CÔNG */}
      {step === 4 && (
        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-2xl bg-[#E8FBF0] border border-[#A7F3D0] text-[#059669] text-xs flex items-center gap-3 shadow-xs">
            <i className="bi bi-check-circle-fill text-[#10FFA0] text-2xl shrink-0" />
            <div>
              <p className="font-bold text-[#059669] font-display">Mật khẩu mới đã sẵn sàng!</p>
              <p className="text-[11px] text-[#059669]/90 mt-0.5">
                Bạn có thể đăng nhập ngay bằng email <strong>{email}</strong> và mật khẩu vừa tạo.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSwitchToLogin(email)}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-display font-bold text-xs shadow-[0_0_20px_rgba(0,229,255,0.40)] hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#00F0FF]"
          >
            <i className="bi bi-box-arrow-in-right text-base" />
            <span>Đăng Nhập Ngay</span>
          </button>
        </div>
      )}
    </div>
  );
}
