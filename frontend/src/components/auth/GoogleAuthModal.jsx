import React, { useState, useEffect } from 'react';

/**
 * Component GoogleAuthModal: Dialog Đăng nhập Google Đa Tầng (Multi-Tier Google Sign-In)
 * Tuân thủ Resend Dark Monochrome, 100% Bootstrap Icons, độ tương phản cao, hỗ trợ phím Escape.
 * Hỗ trợ mở Popup Google chính thức (accounts.google.com) qua Google Identity Services.
 */
export default function GoogleAuthModal({
  isOpen,
  onClose,
  onGoogleSuccess,
  isSubmitting: parentSubmitting
}) {
  const [clientIdInput, setClientIdInput] = useState(() => {
    try {
      return localStorage.getItem('vivu_google_client_id') || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    } catch {
      return '';
    }
  });
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [showSandbox, setShowSandbox] = useState(false);
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [savedConfigMsg, setSavedConfigMsg] = useState('');

  const isSubmitting = parentSubmitting || localSubmitting;
  const hasClientId = Boolean(clientIdInput.trim());

  // Lắng nghe phím Escape để đóng modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Kích hoạt Popup Google chính thức qua Google Identity Services (accounts.google.com)
  const triggerRealGoogleOAuth = (targetClientId) => {
    const idToUse = (targetClientId || clientIdInput).trim();
    if (!idToUse) {
      setErrorMessage('Vui lòng nhập Google OAuth Client ID để mở popup Google chính thức.');
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      setErrorMessage('Thư viện Google Identity Services đang tải. Vui lòng bấm lại sau 2 giây.');
      return;
    }

    setErrorMessage('');
    setLocalSubmitting(true);

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: idToUse,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            setErrorMessage(`Google OAuth từ chối: ${tokenResponse.error_description || tokenResponse.error}`);
            setLocalSubmitting(false);
            return;
          }
          try {
            // Lấy thông tin user chính thức từ Google UserInfo API
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            });
            const userInfo = await userInfoRes.json();
            if (userInfo.email) {
              await onGoogleSuccess({
                googleId: userInfo.sub,
                email: userInfo.email,
                fullName: userInfo.name,
                avatarUrl: userInfo.picture
              });
            } else {
              setErrorMessage('Không nhận được thông tin email từ Google.');
            }
          } catch (err) {
            setErrorMessage(`Lỗi lấy hồ sơ Google: ${err.message}`);
          } finally {
            setLocalSubmitting(false);
          }
        }
      });
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      setErrorMessage(`Lỗi khởi động Google Popup: ${err.message}`);
      setLocalSubmitting(false);
    }
  };

  // Lưu Google Client ID vào localStorage & thử mở popup ngay
  const handleSaveAndTrigger = (e) => {
    e.preventDefault();
    const trimmed = clientIdInput.trim();
    if (!trimmed) {
      setErrorMessage('Vui lòng dán Client ID có đuôi .apps.googleusercontent.com');
      return;
    }
    try {
      localStorage.setItem('vivu_google_client_id', trimmed);
      setSavedConfigMsg('Đã lưu Client ID! Đang mở popup Google...');
      setTimeout(() => {
        setSavedConfigMsg('');
        triggerRealGoogleOAuth(trimmed);
      }, 500);
    } catch {
      setErrorMessage('Không thể lưu vào bộ nhớ trình duyệt');
    }
  };

  // Xử lý đăng nhập Sandbox (Dev / Fallback)
  const handleSandboxLogin = async (email, name) => {
    setErrorMessage('');
    setLocalSubmitting(true);
    try {
      const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name || email)}`;
      await onGoogleSuccess({
        email,
        fullName: name,
        avatarUrl,
        googleId: `gid-${Math.abs(email.split('').reduce((acc, c) => ((acc << 5) - acc) + c.charCodeAt(0), 0))}`
      });
    } catch (err) {
      setErrorMessage(err.message || 'Đăng nhập Google thất bại');
    } finally {
      setLocalSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200 select-none font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-modal-title"
    >
      <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl p-6 border border-[#D2D9F4] shadow-[0_25px_60px_rgba(0,0,0,0.15),0_0_30px_rgba(0,229,255,0.15)] text-[#131315] space-y-4 relative animate-in zoom-in-95 duration-200">
        
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F2F3FF] hover:bg-[#E0E2F0] border border-[#D2D9F4] text-[#70787E] hover:text-[#131315] flex items-center justify-center transition-all cursor-pointer"
          aria-label="Đóng cửa sổ"
        >
          <i className="bi bi-x-lg text-sm"></i>
        </button>

        {/* Tiêu đề & Logo Google */}
        <div className="text-center space-y-2 pt-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white text-black shadow-xs border border-[#D2D9F4] mx-auto">
            <i className="bi bi-google text-2xl text-[#EA4335]"></i>
          </div>
          <div>
            <h2 id="google-modal-title" className="text-lg font-bold text-[#131315] font-display tracking-tight flex items-center justify-center gap-2">
              <span>Đăng Nhập Bằng Google</span>
            </h2>
            <p className="text-xs text-[#70787E] mt-0.5 font-medium">
              Xác thực danh tính qua Google Identity Services (OAuth 2.0)
            </p>
          </div>
        </div>

        {/* Thông báo lỗi nếu có */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-[#FEE2E2] border border-[#FCA5A5] text-[#EF4444] text-xs flex items-start gap-2 animate-in fade-in shadow-xs">
            <i className="bi bi-exclamation-triangle-fill text-[#EF4444] shrink-0 mt-0.5"></i>
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Thông báo trạng thái */}
        {savedConfigMsg && (
          <div className="p-2.5 rounded-2xl bg-[#E8FBF0] border border-[#A7F3D0] text-[#059669] text-xs flex items-center gap-2 animate-in fade-in shadow-xs">
            <i className="bi bi-check-circle-fill text-[#10FFA0]"></i>
            <span>{savedConfigMsg}</span>
          </div>
        )}

        {/* KHỐI 1: NẾU ĐÃ CÓ GOOGLE CLIENT ID -> NÚT MỞ POPUP GOOGLE XỊN */}
        {hasClientId ? (
          <div className="space-y-3">
            <div className="p-3 bg-[#F2F3FF] rounded-2xl border border-[#D2D9F4] text-xs text-[#70787E] flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium">
                <i className="bi bi-shield-check text-[#00838F]"></i>
                <span>OAuth Client ID:</span>
              </span>
              <span className="font-mono text-[10px] text-[#131315] truncate max-w-[180px] font-bold">
                {clientIdInput}
              </span>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => triggerRealGoogleOAuth()}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-[#F2F3FF] border border-[#D2D9F4] hover:border-[#00E5FF] active:scale-[0.98] text-[#131315] font-bold text-xs flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin text-base text-[#EA4335]"></i>
                  <span>Đang kết nối Google...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-google text-base text-[#EA4335]"></i>
                  <span>Mở Cửa Sổ Google (accounts.google.com)</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* KHỐI 2: NẾU CHƯA CÓ GOOGLE CLIENT ID -> HƯỚNG DẪN RÕ RÀNG VỀ API KEY VS CLIENT ID */
          <div className="space-y-3">
            <div className="p-3.5 bg-[#FFFBEB] rounded-2xl border border-[#FDE68A] text-xs text-[#92400E] space-y-2 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-[#B45309] font-display">
                <i className="bi bi-info-circle-fill"></i>
                <span>Lưu ý về Google API Key &amp; OAuth Client ID</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#92400E]">
                Khóa API của bạn là <strong>Google API Key</strong> (dùng cho Maps/AI).
                Để Google cho phép bật <strong>Cửa sổ chọn tài khoản Gmail (accounts.google.com)</strong>, Google yêu cầu <strong>OAuth 2.0 Web Client ID</strong> (có đuôi <code>.apps.googleusercontent.com</code>).
              </p>
            </div>

            <form onSubmit={handleSaveAndTrigger} className="space-y-2.5">
              <label className="block text-[11px] font-bold text-[#131315] uppercase tracking-wider font-display">
                Dán Google OAuth Client ID của bạn:
              </label>
              <input
                type="text"
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                placeholder="xxxx.apps.googleusercontent.com"
                className="w-full bg-[#F2F3FF] border border-[#D2D9F4] focus:border-[#00E5FF] focus:ring-2 focus:ring-[rgba(0,229,255,0.25)] rounded-2xl py-2.5 px-3.5 text-xs text-[#131315] placeholder-[#70787E] font-mono outline-none transition-all font-medium"
              />
              <button
                type="submit"
                disabled={!clientIdInput.trim() || isSubmitting}
                className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-display font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-xs border border-[#00F0FF] disabled:opacity-40"
              >
                <i className="bi bi-check2-circle text-sm"></i>
                <span>Lưu &amp; Bật Cửa Sổ Google Ngay</span>
              </button>
            </form>
          </div>
        )}

        {/* KHỐI 3: CHẾ ĐỘ THỬ NGHIỆM TẠM THỜI (DEV SANDBOX) */}
        <div className="pt-2 border-t border-[#D2D9F4]">
          <button
            type="button"
            onClick={() => setShowSandbox(!showSandbox)}
            className="w-full text-center text-[11px] text-[#70787E] hover:text-[#131315] flex items-center justify-center gap-1.5 transition-colors cursor-pointer py-1 font-medium"
          >
            <i className={`bi ${showSandbox ? 'bi-chevron-up' : 'bi-person-badge'} text-xs`}></i>
            <span>{showSandbox ? 'Thu gọn chế độ thử nghiệm' : 'Hoặc đăng nhập nhanh chế độ Thử Nghiệm (Sandbox)'}</span>
          </button>

          {showSandbox && (
            <div className="mt-2.5 p-3 rounded-2xl bg-[#FAFAFF] border border-[#D2D9F4] space-y-2.5 text-xs animate-in fade-in duration-150 shadow-xs">
              <p className="text-[11px] text-[#70787E]">
                Dành cho phát triển &amp; kiểm thử tính năng xã hội khi chưa cấu hình Google Cloud Console:
              </p>
              
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSandboxLogin('vivu.explorer@gmail.com', 'VIVU Explorer')}
                className="w-full p-2.5 rounded-xl bg-white hover:bg-[#F2F3FF] border border-[#D2D9F4] hover:border-[#00E5FF] text-left flex items-center gap-2.5 transition-all cursor-pointer text-xs shadow-xs"
              >
                <div className="w-7 h-7 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 border border-red-200">
                  <i className="bi bi-google text-xs"></i>
                </div>
                <div className="flex-1 truncate">
                  <div className="font-bold text-[#131315] text-[11px]">VIVU Explorer (Tester)</div>
                  <div className="text-[10px] text-[#70787E]">vivu.explorer@gmail.com</div>
                </div>
                <i className="bi bi-arrow-right text-[#70787E]"></i>
              </button>

              <div className="pt-1">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="email.cua.ban@gmail.com"
                    className="flex-1 bg-[#F2F3FF] border border-[#D2D9F4] rounded-xl py-1.5 px-2.5 text-[11px] text-[#131315] placeholder-[#70787E] outline-none font-medium"
                  />
                  <button
                    type="button"
                    disabled={!emailInput.includes('@') || isSubmitting}
                    onClick={() => handleSandboxLogin(emailInput.trim(), nameInput.trim() || emailInput.split('@')[0])}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-bold text-[11px] transition-all disabled:opacity-40 cursor-pointer border border-[#00F0FF]"
                  >
                    Vào
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
