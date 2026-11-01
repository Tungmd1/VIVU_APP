import React from 'react';
import VivuButton from '../common/VivuButton';

/**
 * VivuBottomDock - Thanh Điều Hướng Đáy Chuẩn Cyberpunk Pink & Blue
 * - Nền xanh đen sâu thẳm rgba(10,18,32,0.85) với viền ánh cyan border-[#00E5FF]/20
 * - Tab kích hoạt: Hồng Neon #FF2A85, viền sáng và chấm trạng thái
 * - Nút (+) trung tâm: Viên ngọc Hồng Neon #FF2A85 với hiệu ứng phát quang và tia hạt xanh hồng
 * - 100% Bootstrap Icons, Rule 7 (< 450 dòng)
 */
export default function VivuBottomDock({ 
  activeTab, 
  setActiveTab, 
  onOpenCreateStory, 
  onResetNavigation,
  unreadCount = 0,
  className = ''
}) {
  return (
    <div className={`fixed bottom-3.5 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-40 pointer-events-auto select-none font-sans ${className}`}>
      <nav className="relative w-full rounded-full py-1.5 px-3 flex justify-between items-center bg-[rgba(10,18,32,0.85)] backdrop-blur-xl border border-[#00E5FF]/20 shadow-[0_12px_40px_rgba(0,0,0,0.7)] transition-all duration-200">
        
        {/* 1. TAB XÃ HỘI (EXPLORE / BẢN ĐỒ RADAR) */}
        <button 
          id="dock-tab-social"
          type="button"
          onClick={() => { 
            setActiveTab('social'); 
            if (onResetNavigation) onResetNavigation(); 
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-full transition-all duration-150 active:scale-95 cursor-pointer ${
            activeTab === 'social' ? 'text-[#FF2A85]' : 'text-white/60 hover:text-[#00E5FF]'
          }`}
        >
          <div className={`p-1.5 rounded-full transition-all ${
            activeTab === 'social' 
              ? 'bg-[#FF2A85]/15 text-[#FF2A85] border border-[#FF2A85]/35 shadow-[0_0_14px_rgba(255,42,133,0.35)]' 
              : 'text-white/60'
          }`}>
            <i className="bi bi-globe-americas text-lg"></i>
          </div>
          <span className={`text-[11px] tracking-tight ${
            activeTab === 'social' ? 'font-bold text-[#FF2A85]' : 'font-medium text-white/60'
          }`}>
            Xã Hội
          </span>
        </button>

        {/* 2. TAB BẠN BÈ (FRIENDS) */}
        <button 
          id="dock-tab-friends"
          type="button"
          onClick={() => { 
            setActiveTab('friends'); 
            if (onResetNavigation) onResetNavigation(); 
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-full transition-all duration-150 active:scale-95 cursor-pointer ${
            activeTab === 'friends' ? 'text-[#FF2A85]' : 'text-white/60 hover:text-[#00E5FF]'
          }`}
        >
          <div className={`p-1.5 rounded-full transition-all ${
            activeTab === 'friends' 
              ? 'bg-[#FF2A85]/15 text-[#FF2A85] border border-[#FF2A85]/35 shadow-[0_0_14px_rgba(255,42,133,0.35)]' 
              : 'text-white/60'
          }`}>
            <i className="bi bi-people-fill text-lg"></i>
          </div>
          <span className={`text-[11px] tracking-tight ${
            activeTab === 'friends' ? 'font-bold text-[#FF2A85]' : 'font-medium text-white/60'
          }`}>
            Bạn Bè
          </span>
        </button>

        {/* 3. NÚT DẤU CỘNG TRUNG TÂM (ELEVATED HERO ACTION BUTTON: TO HƠN & NHÔ CAO KHỎI THANH MENU) */}
        <div className="relative -top-5 sm:-top-6 z-50 flex flex-col items-center shrink-0">
          <div className="p-1 sm:p-1.5 rounded-full bg-[#0a1220]/95 backdrop-blur-xl border border-[#00E5FF]/35 shadow-[0_12px_28px_rgba(0,0,0,0.85)]">
            <VivuButton
              id="dock-tab-create"
              onClick={onOpenCreateStory}
              variant="primary"
              pill={true}
              glow={true}
              className="w-14 h-14 sm:w-16 sm:h-16 p-0 flex items-center justify-center text-white border-2 border-white/60 group cursor-pointer active:scale-90 transition-all duration-200 shadow-[0_0_30px_rgba(255,42,133,0.85)]"
              title="Đăng Story khoảnh khắc mới"
              aria-label="Tạo bài đăng mới"
            >
              <i className="bi bi-plus-lg text-2xl sm:text-3xl font-black transition-transform duration-200 group-hover:rotate-90"></i>
            </VivuButton>
          </div>
        </div>

        {/* 4. TAB TIN NHẮN (MESSAGES / CHAT) */}
        <button 
          id="dock-tab-chat"
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-full transition-all duration-150 relative active:scale-95 cursor-pointer ${
            activeTab === 'chat' ? 'text-[#FF2A85]' : 'text-white/60 hover:text-[#00E5FF]'
          }`}
        >
          <div className={`relative p-1.5 rounded-full transition-all ${
            activeTab === 'chat' 
              ? 'bg-[#FF2A85]/15 text-[#FF2A85] border border-[#FF2A85]/35 shadow-[0_0_14px_rgba(255,42,133,0.35)]' 
              : 'text-white/60'
          }`}>
            <i className="bi bi-chat-dots-fill text-lg"></i>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#E10600] border border-white text-white text-[10px] font-mono font-bold flex items-center justify-center shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className={`text-[11px] tracking-tight ${
            activeTab === 'chat' ? 'font-bold text-[#FF2A85]' : 'font-medium text-white/60'
          }`}>
            Tin Nhắn
          </span>
        </button>

        {/* 5. TAB TÔI (PROFILE / HỒ SƠ) */}
        <button 
          id="dock-tab-profile"
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-full transition-all duration-150 active:scale-95 cursor-pointer ${
            activeTab === 'profile' ? 'text-[#FF2A85]' : 'text-white/60 hover:text-[#00E5FF]'
          }`}
        >
          <div className={`p-1.5 rounded-full transition-all ${
            activeTab === 'profile' 
              ? 'bg-[#FF2A85]/15 text-[#FF2A85] border border-[#FF2A85]/35 shadow-[0_0_14px_rgba(255,42,133,0.35)]' 
              : 'text-white/60'
          }`}>
            <i className="bi bi-person-fill text-lg"></i>
          </div>
          <span className={`text-[11px] tracking-tight ${
            activeTab === 'profile' ? 'font-bold text-[#FF2A85]' : 'font-medium text-white/60'
          }`}>
            Tôi
          </span>
        </button>

      </nav>
    </div>
  );
}
