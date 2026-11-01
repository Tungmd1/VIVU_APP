import React, { useState } from 'react';
import LoginForm from './LoginForm.jsx';
import RegisterForm from './RegisterForm.jsx';
import ForgotPasswordForm from './ForgotPasswordForm.jsx';
import VivuLogo from '../common/VivuLogo.jsx';

/**
 * Component AuthGateView: Màn hình bảo vệ toàn bộ ứng dụng VIVU
 * Chuẩn Luminous Solar-Cyber HUD (White Cyberpunk), độ tương phản cao, 100% Bootstrap Icons
 */
export default function AuthGateView({
  onLogin,
  onRegister,
  onForgotPassword,
  isSubmitting,
  authError,
  onClearError,
  onClose
}) {
  // Chế độ xem: 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD'
  const [authMode, setAuthMode] = useState('LOGIN');
  // Email đã đăng ký thành công để tự động điền vào Form Đăng nhập
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Xử lý khi đăng ký thành công -> Chuyển về Đăng nhập kèm email vừa đăng ký (Rule 10)
  const handleRegisterSuccess = async (email, password, fullName) => {
    if (onClearError) onClearError();
    setSuccessMessage('');
    const res = await onRegister(email, password, fullName);
    if (res?.success) {
      setRegisteredEmail(res.email || email);
      setSuccessMessage('Vui lòng nhập mật khẩu vừa tạo để đăng nhập vào VIVU.');
      setAuthMode('LOGIN');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md text-[#131315] overflow-y-auto no-scrollbar font-sans select-none">
      {/* Vòng hào quang Cyber Cyan phát quang phía sau */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[rgba(0,229,255,0.18)] blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-sm my-auto relative z-10 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Khối Card Auth chính chuẩn Luminous Solar-Cyber HUD (White Cyberpunk) */}
        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 border border-[#D2D9F4] shadow-[0_20px_60px_rgba(0,0,0,0.12),0_0_30px_rgba(0,229,255,0.15)] relative overflow-hidden transition-all text-[#131315]">
          
          {/* Nút đóng X nếu mở dưới dạng Modal khi đã đăng nhập */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F2F3FF] hover:bg-[#E0E2F0] border border-[#D2D9F4] text-[#70787E] hover:text-[#131315] flex items-center justify-center transition-all cursor-pointer z-20"
              title="Đóng & quay lại bản đồ"
            >
              <i className="bi bi-x-lg text-sm"></i>
            </button>
          )}

          {/* Header Thương hiệu VIVU với Logo */}
          <div className="text-center space-y-2 pb-2">
            <div className="flex justify-center mb-1">
              <VivuLogo size="lg" />
            </div>
            <h1 className="text-xl font-black text-[#131315] tracking-tight flex items-center justify-center gap-2 font-display">
              <span>VIVU</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[rgba(0,229,255,0.12)] text-[#00838F] border border-[rgba(0,229,255,0.3)] font-mono">
                Social Map
              </span>
            </h1>
            <p className="text-xs text-[#70787E] font-medium">
              Bản đồ kết nối bạn bè &amp; khám phá quanh bạn
            </p>
          </div>

          {/* Thanh chuyển đổi Tab (Đăng nhập / Đăng ký) */}
          {authMode !== 'FORGOT_PASSWORD' && (
            <div className="flex p-1 bg-[#F2F3FF] rounded-2xl my-3 border border-[#D2D9F4]">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('LOGIN');
                  if (onClearError) onClearError();
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'LOGIN'
                    ? 'bg-white text-[#131315] font-bold shadow-xs border border-[#D2D9F4]'
                    : 'text-[#70787E] hover:text-[#131315]'
                }`}
              >
                <i className={`bi bi-box-arrow-in-right ${authMode === 'LOGIN' ? 'text-[#00838F]' : ''}`}></i>
                <span>Đăng Nhập</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('REGISTER');
                  setSuccessMessage('');
                  if (onClearError) onClearError();
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'REGISTER'
                    ? 'bg-white text-[#131315] font-bold shadow-xs border border-[#D2D9F4]'
                    : 'text-[#70787E] hover:text-[#131315]'
                }`}
              >
                <i className={`bi bi-person-plus ${authMode === 'REGISTER' ? 'text-[#00838F]' : ''}`}></i>
                <span>Đăng Ký</span>
              </button>
            </div>
          )}

          {/* Nội dung Form theo trạng thái */}
          <div className="pt-1">
            {authMode === 'LOGIN' && (
              <LoginForm
                initialEmail={registeredEmail}
                successMessage={successMessage}
                onClearSuccess={() => setSuccessMessage('')}
                onSwitchToRegister={() => {
                  setAuthMode('REGISTER');
                  setSuccessMessage('');
                  if (onClearError) onClearError();
                }}
                onSwitchToForgotPassword={() => {
                  setAuthMode('FORGOT_PASSWORD');
                  setSuccessMessage('');
                  if (onClearError) onClearError();
                }}
                onSubmit={onLogin}
                isSubmitting={isSubmitting}
                authError={authError}
                onClearError={onClearError}
              />
            )}

            {authMode === 'REGISTER' && (
              <RegisterForm
                onSwitchToLogin={() => {
                  setAuthMode('LOGIN');
                  if (onClearError) onClearError();
                }}
                onSubmit={handleRegisterSuccess}
                isSubmitting={isSubmitting}
                authError={authError}
                onClearError={onClearError}
              />
            )}

            {authMode === 'FORGOT_PASSWORD' && (
              <ForgotPasswordForm
                onSwitchToLogin={(prefEmail) => {
                  if (prefEmail && typeof prefEmail === 'string') {
                    setRegisteredEmail(prefEmail);
                    setSuccessMessage('Đổi mật khẩu thành công! Hãy đăng nhập với mật khẩu mới.');
                  }
                  setAuthMode('LOGIN');
                  if (onClearError) onClearError();
                }}
                onSubmitMockReset={onForgotPassword}
                isSubmitting={isSubmitting}
                authError={authError}
                onClearError={onClearError}
              />
            )}
          </div>
        </div>

        {/* Footer bảo mật */}
        <div className="text-center text-[11px] text-[#70787E] space-y-1">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <i className="bi bi-shield-check text-[#00838F] text-xs"></i>
            <span>Dữ liệu GPS &amp; Tài khoản được bảo vệ thời gian thực</span>
          </p>
        </div>
      </div>
    </div>
  );
}
