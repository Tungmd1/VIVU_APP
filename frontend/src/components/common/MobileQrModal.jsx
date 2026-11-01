import React, { useState } from 'react';
import VivuLogo from './VivuLogo.jsx';

/**
 * MobileQrModal - Cung cấp đường link công khai (Cloudflare Tunnel) và LAN kèm mã QR Code cho thiết bị di động
 * Hỗ trợ quét mã bằng camera điện thoại để truy cập tức thì từ 4G hoặc Wi-Fi bất kỳ
 * Chuẩn Resend Dark Monochrome, 100% Bootstrap Icons
 */
export default function MobileQrModal({
  isOpen,
  onClose,
  publicUrl = '',
  lanUrl = 'http://192.168.1.163:5173/'
}) {
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedLan, setCopiedLan] = useState(false);
  const [activeTab, setActiveTab] = useState(publicUrl ? 'public' : 'lan');

  React.useEffect(() => {
    if (publicUrl) {
      setActiveTab('public');
    }
  }, [publicUrl]);

  if (!isOpen) return null;

  const activeUrl = activeTab === 'public' && publicUrl ? publicUrl : lanUrl;

  const handleCopy = (url, isPublic) => {
    navigator.clipboard?.writeText(url);
    if (isPublic) {
      setCopiedPublic(true);
      setTimeout(() => setCopiedPublic(false), 2500);
    } else {
      setCopiedLan(true);
      setTimeout(() => setCopiedLan(false), 2500);
    }
  };

  // Tạo URL mã QR qua QRServer API với màu nền tối chuẩn Resend
  const qrCodeImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(activeUrl)}&color=ffffff&bgcolor=0E0E10&margin=1`;

  return (
    <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans animate-in fade-in">
      <div className="w-full max-w-sm bg-[#0E0E10] border border-white/15 rounded-3xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-white space-y-4 text-center">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <i className="bi bi-phone-fill text-sm"></i>
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Kết Nối Điện Thoại</h2>
              <p className="text-[10px] text-[#8E8E93]">Trải nghiệm VIVU trên di động (4G / Wi-Fi)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-[#8E8E93] hover:text-white flex items-center justify-center transition-colors"
          >
            <i className="bi bi-x-lg text-xs"></i>
          </button>
        </div>

        {/* Tab chuyển đổi kiểu kết nối (Công khai HTTPS vs Cục bộ LAN) */}
        {publicUrl && (
          <div className="flex p-1 bg-[#1A1A1E] rounded-2xl border border-white/10 text-xs">
            <button
              onClick={() => setActiveTab('public')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'public'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              <i className="bi bi-globe2"></i>
              <span>Link Toàn Cầu (4G)</span>
            </button>
            <button
              onClick={() => setActiveTab('lan')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'lan'
                  ? 'bg-white text-black shadow-md'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              <i className="bi bi-wifi"></i>
              <span>Wi-Fi Cục Bộ</span>
            </button>
          </div>
        )}

        {/* Mã QR Code trung tâm */}
        <div className="flex flex-col items-center justify-center py-1">
          <div className="relative p-3 rounded-2xl bg-[#151619] border border-white/15 shadow-xl">
            <img
              src={qrCodeImgUrl}
              alt="Mã QR VIVU Mobile"
              className="w-44 h-44 rounded-xl object-contain"
            />
            {/* Logo VIVU ở tâm QR */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <VivuLogo size="sm" className="shadow-2xl rounded-2xl ring-2 ring-black" />
            </div>
          </div>
          <span className="text-[11px] text-[#8E8E93] mt-2">
            Mở Camera điện thoại (iOS / Android) quét mã để mở ngay
          </span>
        </div>

        {/* Ô Link & Nút Copy / Chia sẻ 1 Chạm */}
        <div className="bg-[#151619] border border-white/10 rounded-2xl p-2.5 flex items-center justify-between gap-2 text-left">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-[#8E8E93] block">
              {activeTab === 'public' ? 'Link HTTPS Công Khai:' : 'Link Mạng Nội Bộ (LAN):'}
            </span>
            <div className={`text-xs font-mono font-bold truncate ${activeTab === 'public' ? 'text-sky-400' : 'text-emerald-400'}`}>
              {activeUrl}
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0">
            {typeof navigator !== 'undefined' && navigator.share && (
              <button
                onClick={() => {
                  navigator.share({
                    title: 'VIVU - Bản Đồ Xã Hội & Chat Thời Gian Thực',
                    text: 'Cùng tham gia VIVU với tôi để xem vị trí thực tế và trò chuyện nhé!',
                    url: activeUrl
                  }).catch(() => {});
                }}
                className="py-1.5 px-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs active:scale-95 transition-all flex items-center gap-1 shadow-sm"
                title="Gửi qua Zalo, Messenger, SMS..."
              >
                <i className="bi bi-share-fill"></i>
                <span className="hidden sm:inline">Gửi</span>
              </button>
            )}

            <button
              onClick={() => handleCopy(activeUrl, activeTab === 'public')}
              className="py-1.5 px-3 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-[#EAEAEA] active:scale-95 transition-all flex items-center gap-1 shadow-sm"
            >
              <i className={`bi ${(activeTab === 'public' ? copiedPublic : copiedLan) ? 'bi-check2' : 'bi-clipboard-fill'}`}></i>
              <span>{(activeTab === 'public' ? copiedPublic : copiedLan) ? 'Đã chép' : 'Sao chép'}</span>
            </button>
          </div>
        </div>


        {/* Hướng Dẫn Các Bước */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-left space-y-1.5 text-[11px] text-[#8E8E93]">
          <div className="font-bold text-white text-xs flex items-center gap-1.5">
            <i className={`bi ${activeTab === 'public' ? 'bi-shield-check text-sky-400' : 'bi-wifi text-emerald-400'}`}></i>
            <span>{activeTab === 'public' ? 'Ưu điểm Link Toàn Cầu HTTPS:' : 'Lưu ý khi dùng Wi-Fi:'}</span>
          </div>
          {activeTab === 'public' ? (
            <ul className="space-y-1 list-disc list-inside">
              <li>Hoạt động trên <b>4G/5G hoặc bất kỳ mạng Wi-Fi nào</b> ở mọi nơi.</li>
              <li>Tự động mở khóa quyền <b>GPS thời gian thực</b> và <b>Camera chụp Story</b> trên Safari và Chrome Mobile.</li>
            </ul>
          ) : (
            <ul className="space-y-1 list-disc list-inside">
              <li>Điện thoại và máy tính phải kết nối <b>chung một mạng Wi-Fi</b>.</li>
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
