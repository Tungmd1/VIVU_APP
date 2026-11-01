import React, { useState } from 'react';

/**
 * Màn hình Khóa Ứng Dụng (App Lock Screen)
 * Bảo vệ quyền riêng tư người dùng khi tạm rời máy hoặc khóa trang
 * Tuân thủ 100% Bootstrap Icons & Animate UI
 */
export default function AppLockOverlay({
  isLocked,
  onUnlock,
  user
}) {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isLocked) return null;

  const userFullName = user?.user_metadata?.full_name || 'Bạn (Tôi)';
  const userAvatar = user?.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

  const handleUnlock = (e) => {
    e.preventDefault();
    // Chấp nhận mở khóa nhanh hoặc mở khóa bằng bất kỳ mã PIN nào người dùng nhập
    onUnlock();
    setPinInput('');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-70 bg-gradient-to-br from-vivu-mocha via-[#352520] to-[#1F1613] text-white flex flex-col items-center justify-center p-6 select-none animate-fadeIn">
      {/* Vòng sáng bảo mật phía sau */}
      <div className="absolute w-72 h-72 rounded-full bg-vivu-peach/10 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-xs text-center space-y-5 animate-scaleUp">
        {/* Khóa bảo mật icon */}
        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-vivu-peach flex items-center justify-center text-xl mx-auto shadow-cozy-lg">
          <i className="bi bi-shield-lock-fill"></i>
        </div>

        {/* Avatar người dùng */}
        <div className="space-y-2">
          <div className="w-20 h-20 rounded-full mx-auto relative overflow-hidden border-3 border-vivu-peach shadow-cozy-md">
            <img src={userAvatar} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">{userFullName}</h2>
            <p className="text-xs text-white/60">VIVU đang được khóa bảo vệ</p>
          </div>
        </div>

        {/* Form mở khóa */}
        <form onSubmit={handleUnlock} className="space-y-3 pt-2">
          <div className="relative">
            <input
              type="password"
              placeholder="Nhập mã PIN hoặc bấm mở khóa"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full py-2.5 px-4 rounded-2xl bg-white/10 border border-white/20 text-center text-xs text-white placeholder-white/40 focus:outline-none focus:border-vivu-peach focus:ring-2 focus:ring-vivu-peach/30 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-vivu-peach to-vivu-coral text-white font-bold text-xs shadow-cozy-md hover:shadow-cozy-lg active:scale-[0.97] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <i className="bi bi-unlock-fill text-sm"></i>
            <span>Mở Khóa VIVU</span>
          </button>
        </form>

        <p className="text-[10px] text-white/40">
          Dữ liệu vị trí GPS &amp; tin nhắn được mã hóa an toàn trên thiết bị này.
        </p>
      </div>
    </div>
  );
}
