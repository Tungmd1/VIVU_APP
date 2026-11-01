import React, { useState, useEffect } from 'react';

/**
 * Component FacebookAuthModal: Dialog Đăng nhập Facebook Đa Tầng (Multi-Tier Facebook Sign-In)
 * Tuân thủ Resend Dark Monochrome, 100% Bootstrap Icons, độ tương phản cao, hỗ trợ phím Escape.
 */
export default function FacebookAuthModal({
  isOpen,
  onClose,
  onFacebookSuccess,
  isSubmitting: parentSubmitting
}) {
  const [appIdInput, setAppIdInput] = useState(() => {
    try {
      return localStorage.getItem('vivu_facebook_app_id') || import.meta.env.VITE_FACEBOOK_APP_ID || '';
    } catch {
      return '';
    }
  });
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [savedConfigMsg, setSavedConfigMsg] = useState('');

  const isSubmitting = parentSubmitting || localSubmitting;

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

  // Xử lý đăng nhập 1 chạm với tài khoản mẫu
  const handleQuickLogin = async (email, name) => {
    setErrorMessage('');
    setLocalSubmitting(true);
    try {
      const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name || email)}`;
      await onFacebookSuccess({
        email,
        fullName: name,
        avatarUrl,
        facebookId: `fbid-${Math.abs(email.split('').reduce((acc, c) => ((acc << 5) - acc) + c.charCodeAt(0), 0))}`
      });
    } catch (err) {
      setErrorMessage(err.message || 'Đăng nhập Facebook thất bại');
    } finally {
      setLocalSubmitting(false);
    }
  };

  // Xử lý gửi form nhập thông tin Facebook
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const name = nameInput.trim() || 'Facebook User';
    const email = emailInput.trim() || `fb_${Date.now()}@facebook.vivu.vn`;

    await handleQuickLogin(email, name);
  };

  // Lưu Facebook App ID vào localStorage và cập nhật SDK
  const handleSaveAppId = (e) => {
    e.preventDefault();
    const trimmed = appIdInput.trim();
    try {
      localStorage.setItem('vivu_facebook_app_id', trimmed);
      setSavedConfigMsg('Đã lưu cấu hình Facebook App ID thành công!');
      setTimeout(() => setSavedConfigMsg(''), 3000);
      if (trimmed && window.FB) {
        window.FB.init({
          appId: trimmed,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
      }
    } catch {
      setErrorMessage('Không thể lưu vào bộ nhớ trình duyệt');
    }
  };

  // Mở Popup Facebook chính thức qua Meta SDK
  const handleMetaPopup = async () => {
    const trimmedAppId = appIdInput.trim();
    if (!trimmedAppId) {
      setShowConfig(true);
      setErrorMessage('Vui lòng nhập và Lưu Facebook App ID bên dưới để kích hoạt popup chính thức.');
      return;
    }
    setErrorMessage('');
    setLocalSubmitting(true);
    try {
      if (!window.FB) {
        await new Promise((resolve, reject) => {
          window.fbAsyncInit = function() {
            window.FB.init({
              appId: trimmedAppId,
              cookie: true,
              xfbml: true,
              version: 'v18.0'
            });
            resolve();
          };
          const script = document.createElement('script');
          script.src = 'https://connect.facebook.net/vi_VN/sdk.js';
          script.async = true;
          script.defer = true;
          script.crossOrigin = 'anonymous';
          script.onerror = () => reject(new Error('Không thể tải Facebook SDK. Vui lòng kiểm tra kết nối mạng.'));
          document.body.appendChild(script);
        });
      } else {
        window.FB.init({
          appId: trimmedAppId,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
      }

      window.FB.login((response) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          window.FB.api('/me', { fields: 'id,name,email,picture.type(large)' }, async (userInfo) => {
            try {
              await onFacebookSuccess({
                accessToken,
                facebookId: userInfo.id,
                email: userInfo.email,
                fullName: userInfo.name,
                avatarUrl: userInfo.picture?.data?.url
              });
            } catch (apiErr) {
              setErrorMessage(apiErr.message || 'Lỗi lưu thông tin Facebook');
            } finally {
              setLocalSubmitting(false);
            }
          });
        } else {
          setLocalSubmitting(false);
          setErrorMessage('Đăng nhập Facebook bị hủy hoặc từ chối cấp quyền.');
        }
      }, { scope: 'public_profile,email' });
    } catch (sdkErr) {
      setLocalSubmitting(false);
      setErrorMessage(sdkErr.message || 'Lỗi khởi chạy Facebook SDK');
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
      aria-labelledby="facebook-modal-title"
    >
      <div className="w-full max-w-sm bg-white/95 backdrop-blur-2xl rounded-3xl p-6 border border-[#D2D9F4] shadow-[0_25px_60px_rgba(0,0,0,0.15),0_0_30px_rgba(0,229,255,0.15)] text-[#131315] space-y-4 relative animate-in zoom-in-95 duration-200">
        
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F2F3FF] hover:bg-[#E0E2F0] border border-[#D2D9F4] text-[#70787E] hover:text-[#131315] flex items-center justify-center transition-all cursor-pointer"
          aria-label="Đóng cửa sổ đăng nhập Facebook"
        >
          <i className="bi bi-x-lg text-sm"></i>
        </button>

        {/* Tiêu đề & Logo Facebook */}
        <div className="text-center space-y-2 pt-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/25 shadow-xs mx-auto">
            <i className="bi bi-facebook text-2xl"></i>
          </div>
          <div>
            <h2 id="facebook-modal-title" className="text-lg font-bold text-[#131315] font-display tracking-tight">
              Đăng Nhập Facebook
            </h2>
            <p className="text-xs text-[#70787E] mt-0.5 font-medium">
              Kết nối tài khoản Facebook để tìm bạn bè quanh bạn
            </p>
          </div>
        </div>

        {/* Thông báo lỗi nếu có */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-[#FEE2E2] border border-[#FCA5A5] text-[#EF4444] text-xs flex items-start gap-2 animate-in fade-in shadow-xs">
            <i className="bi bi-exclamation-triangle-fill text-[#EF4444] shrink-0 mt-0.5"></i>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Thông báo thành công cấu hình */}
        {savedConfigMsg && (
          <div className="p-2.5 rounded-2xl bg-[#E8FBF0] border border-[#A7F3D0] text-[#059669] text-xs flex items-center gap-2 animate-in fade-in shadow-xs">
            <i className="bi bi-check-circle-fill text-[#10FFA0]"></i>
            <span>{savedConfigMsg}</span>
          </div>
        )}

        {/* Danh sách tài khoản 1 chạm (Quick Selection) */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-[#131315] uppercase tracking-wider font-display">
            Tài khoản Facebook đề xuất
          </label>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleQuickLogin('facebook.explorer@vivu.vn', 'Facebook Explorer')}
              className="w-full p-2.5 rounded-2xl bg-[#FAFAFF] hover:bg-[#F2F3FF] border border-[#D2D9F4] hover:border-[#00E5FF] text-left flex items-center gap-3 transition-all cursor-pointer group active:scale-[0.99] disabled:opacity-50 shadow-xs"
            >
              <div className="w-9 h-9 rounded-full bg-[#1877F2]/10 border border-[#1877F2]/20 flex items-center justify-center text-[#1877F2] shrink-0 group-hover:scale-105 transition-transform">
                <i className="bi bi-facebook text-base"></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#131315] truncate flex items-center gap-1.5 font-display">
                  <span>Facebook Explorer</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/20 rounded-md font-semibold">FB User</span>
                </div>
                <div className="text-[11px] text-[#70787E] truncate font-mono">fb_user_explorer</div>
              </div>
              <i className="bi bi-arrow-right-short text-lg text-[#70787E] group-hover:text-[#00838F] transition-colors"></i>
            </button>
          </div>
        </div>

        {/* Phân cách */}
        <div className="flex items-center my-2">
          <div className="flex-1 border-t border-[#D2D9F4]"></div>
          <span className="px-2.5 text-[10px] font-bold text-[#70787E] uppercase font-display">
            Hoặc nhập tài khoản của bạn
          </span>
          <div className="flex-1 border-t border-[#D2D9F4]"></div>
        </div>

        {/* Form nhập thông tin Facebook */}
        <form onSubmit={handleFormSubmit} className="space-y-3">
          <div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#00838F] text-sm pointer-events-none">
                <i className="bi bi-person-fill"></i>
              </span>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Tên Facebook của bạn"
                required
                className="w-full bg-[#F2F3FF] border border-[#D2D9F4] focus:border-[#00E5FF] focus:ring-2 focus:ring-[rgba(0,229,255,0.25)] rounded-2xl py-2.5 pl-10 pr-3.5 text-xs text-[#131315] placeholder-[#70787E] font-medium outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#00838F] text-sm pointer-events-none">
                <i className="bi bi-envelope-at-fill"></i>
              </span>
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Email hoặc SĐT Facebook (tùy chọn)"
                className="w-full bg-[#F2F3FF] border border-[#D2D9F4] focus:border-[#00E5FF] focus:ring-2 focus:ring-[rgba(0,229,255,0.25)] rounded-2xl py-2.5 pl-10 pr-3.5 text-xs text-[#131315] placeholder-[#70787E] font-medium outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-2xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <i className="bi bi-arrow-repeat animate-spin text-sm"></i>
                <span>Đang kết nối Facebook...</span>
              </>
            ) : (
              <>
                <i className="bi bi-facebook text-sm"></i>
                <span>Tiếp tục với Facebook</span>
              </>
            )}
          </button>
        </form>

        {/* Nút đăng nhập trực tiếp qua Meta SDK nếu có App ID */}
        {appIdInput.trim() && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleMetaPopup}
            className="w-full py-2.5 px-4 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <i className="bi bi-box-arrow-up-right text-xs"></i>
            <span>Đăng nhập Meta Popup (App ID: {appIdInput.trim().slice(0, 6)}...)</span>
          </button>
        )}

        {/* Khối Cấu hình Nâng cao (Facebook App ID) */}
        <div className="pt-2 border-t border-[#D2D9F4]">
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="w-full text-center text-[11px] text-[#70787E] hover:text-[#131315] flex items-center justify-center gap-1.5 transition-colors cursor-pointer py-1 font-medium"
          >
            <i className={`bi ${showConfig ? 'bi-chevron-up' : 'bi-gear-fill'} text-xs`}></i>
            <span>{showConfig ? 'Thu gọn cài đặt' : 'Cấu hình Facebook App ID'}</span>
          </button>

          {showConfig && (
            <div className="mt-2.5 p-3 rounded-2xl bg-[#FAFAFF] border border-[#D2D9F4] space-y-2.5 text-xs animate-in fade-in duration-150 shadow-xs">
              <form onSubmit={handleSaveAppId} className="space-y-2">
                <label className="block text-[10px] text-[#70787E] uppercase font-bold font-display">
                  Facebook App ID (Meta for Developers)
                </label>
                <input
                  type="text"
                  value={appIdInput}
                  onChange={(e) => setAppIdInput(e.target.value)}
                  placeholder="Ví dụ: 123456789012345"
                  className="w-full bg-[#F2F3FF] border border-[#D2D9F4] focus:border-[#00E5FF] rounded-xl py-2 px-3 text-[11px] text-[#131315] font-mono outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] text-[11px] font-bold transition-all cursor-pointer border border-[#00F0FF] shadow-xs"
                >
                  Lưu App ID
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
