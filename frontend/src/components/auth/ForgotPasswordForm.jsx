import React, { useState } from 'react';

/**
 * Component Form Quên Mật Khẩu (Xác thực qua Email Magic Link chuẩn VIVU)
 * 100% Bootstrap Icons (Rule 5), Rule 7 (< 450 dòng), Zero-Mockup (Rule 45)
 */
export default function ForgotPasswordForm({
  onSwitchToLogin,
  onSubmit,
  isSubmitting,
  authError,
  onClearError
}) {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    if (onClearError) onClearError();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setValidationError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    if (onSubmit) {
      const res = await onSubmit(cleanEmail);
      if (res?.success) {
        setIsSubmitted(true);
      } else {
        setValidationError(res?.error || res?.message || 'Không thể gửi yêu cầu khôi phục mật khẩu.');
      }
    }
  };

  const displayError = validationError || authError;

  return (
    <div className="w-full space-y-4 text-[#131315]">
      {/* 1. Header & Chỉ báo trạng thái */}
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-2xl bg-[rgba(0,229,255,0.12)] text-[#00838F] border border-[rgba(0,229,255,0.3)] mx-auto flex items-center justify-center text-xl mb-2 shadow-xs">
          <i className={isSubmitted ? 'bi bi-envelope-check-fill' : 'bi bi-key-fill'} />
        </div>

        <h3 className="font-bold text-sm text-[#131315] font-display">
          {isSubmitted ? 'Đã Gửi Liên Kết Khôi Phục' : 'Khôi Phục Mật Khẩu'}
        </h3>

        <p className="text-xs text-[#70787E] max-w-xs mx-auto leading-relaxed">
          {isSubmitted
            ? `Liên kết đặt lại mật khẩu đã được gửi đến ${email}. Hãy kiểm tra hộp thư đến hoặc mục thư rác.`
            : 'Nhập địa chỉ email tài khoản VIVU của bạn để nhận liên kết đặt lại mật khẩu an toàn.'}
        </p>
      </div>

      {/* Thông báo lỗi nếu có */}
      {displayError && !isSubmitted && (
        <div className="p-3 rounded-2xl bg-[#FEE2E2] border border-[#FCA5A5] text-[#EF4444] text-xs flex items-start gap-2 animate-in fade-in duration-200 shadow-xs">
          <i className="bi bi-exclamation-triangle-fill text-[#EF4444] text-sm shrink-0 mt-0.5" />
          <span className="flex-1 font-medium">{displayError}</span>
        </div>
      )}

      {/* GIAO DIỆN NHẬP EMAIL */}
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-3.5">
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
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#D2D9F4] bg-[#F2F3FF] text-xs text-[#131315] placeholder-[#70787E] focus:outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[rgba(0,229,255,0.25)] transition-all font-medium disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-display font-bold text-xs shadow-[0_0_20px_rgba(0,229,255,0.40)] hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#00F0FF] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <i className="bi bi-arrow-repeat animate-spin text-sm" />
                <span>Đang gửi yêu cầu...</span>
              </>
            ) : (
              <>
                <span>Gửi Liên Kết Khôi Phục</span>
                <i className="bi bi-send-fill text-xs" />
              </>
            )}
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
      ) : (
        /* GIAO DIỆN XÁC NHẬN ĐÃ GỬI THÀNH CÔNG */
        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-2xl bg-[#E8FBF0] border border-[#A7F3D0] text-[#059669] text-xs flex items-center gap-3 shadow-xs">
            <i className="bi bi-check-circle-fill text-[#10FFA0] text-2xl shrink-0" />
            <div>
              <p className="font-bold text-[#059669] font-display">Kiểm tra hộp thư email</p>
              <p className="text-[11px] text-[#059669]/90 mt-0.5">
                Vui lòng nhấp vào liên kết xác thực trong email để đặt lại mật khẩu mới cho tài khoản.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSwitchToLogin(email)}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-display font-bold text-xs shadow-[0_0_20px_rgba(0,229,255,0.40)] hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#00F0FF]"
          >
            <i className="bi bi-box-arrow-in-right text-base" />
            <span>Trở về Đăng nhập</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSubmitted(false)}
            className="w-full py-2 px-4 text-center text-[#70787E] hover:text-[#00838F] text-xs font-medium transition-colors cursor-pointer"
          >
            <span>Gửi lại hoặc đổi email khác</span>
          </button>
        </div>
      )}
    </div>
  );
}
