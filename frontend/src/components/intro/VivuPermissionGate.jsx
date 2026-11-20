import React, { useState } from 'react';

/**
 * VivuPermissionGate - Cổng Cấp Quyền (Vị trí GPS, Âm thanh, Camera)
 * - Yêu cầu cấp 3 quyền cốt lõi khi mới vào Web App
 * - Hỗ trợ thiết bị máy tính không có camera hoặc trình duyệt hạn chế quyền (Rule 18 & Rule 22)
 * - Không bao giờ khóa cứng màn hình: Cung cấp tùy chọn tiếp tục với chế độ dự phòng
 * - Chuẩn Luminous Solar-Cyber HUD, 100% Bootstrap Icons (Rule 5), Rule 7 (< 450 dòng)
 */
export default function VivuPermissionGate({ onGranted }) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [isDenied, setIsDenied] = useState(false);
  const [deniedReason, setDeniedReason] = useState('');

  const finishAndEnter = () => {
    try {
      localStorage.setItem('vivu_permissions_granted_v1', 'true');
      localStorage.setItem('vivu_location_terms_accepted', 'true');
    } catch {}
    if (onGranted) onGranted();
  };

  const handleRequestAllPermissions = async () => {
    setIsRequesting(true);
    setIsDenied(false);
    setDeniedReason('');

    try {
      // 1. Không kích hoạt Web Audio Context để tránh sập trình duyệt mobile

      // 2. Yêu cầu quyền GPS thực tế
      if (navigator.geolocation) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            (err) => {
              console.warn('GPS prompt note:', err?.message);
              resolve(null);
            },
            { enableHighAccuracy: true, timeout: 6000 }
          );
        });
      }

      // 3. Yêu cầu quyền Camera (Thích ứng cả PC webcam lẫn camera điện thoại)
      if (navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
        } catch (camErr) {
          console.warn('Camera probe warning (Fallback to gallery upload mode):', camErr?.message);
          // Không quăng lỗi chặn cứng app nếu PC không có webcam hoặc bị từ chối camera
        }
      }

      setIsRequesting(false);
      finishAndEnter();

    } catch (err) {
      console.warn('Permission gate note:', err);
      setIsRequesting(false);
      setIsDenied(true);
      setDeniedReason(err.message || 'Thiết bị chưa cấp quyền. Bạn vẫn có thể tiếp tục với chế độ tải ảnh từ thư viện.');
    }
  };

  const handleBypass = () => {
    finishAndEnter();
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-[#D2D9F4] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.30),0_0_40px_rgba(0,229,255,0.20)] overflow-hidden text-[#131315]">
        
        {/* Header HUD */}
        <div className="px-6 py-4 bg-white border-b border-[#D2D9F4] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[rgba(0,229,255,0.15)] text-[#00838F] border border-[rgba(0,229,255,0.4)] flex items-center justify-center shadow-xs">
              <i className="bi bi-shield-lock-fill text-base"></i>
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#131315] font-display">Cấp Quyền Ứng Dụng</h2>
              <p className="text-[10px] text-[#70787E]">VIVU Social Map • Khởi tạo quyền hệ thống</p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleBypass}
            className="w-7 h-7 rounded-full bg-[#F2F3FF] hover:bg-[#E0E2F0] border border-[#D2D9F4] text-[#70787E] hover:text-[#131315] flex items-center justify-center transition-all cursor-pointer"
            title="Đóng & vào bản đồ"
          >
            <i className="bi bi-x-lg text-xs"></i>
          </button>
        </div>

        {/* Nội dung chính */}
        {!isDenied ? (
          <div className="p-6 space-y-4 bg-[#FAFAFF]">
            <p className="text-xs text-[#40484D] leading-relaxed">
              Để trải nghiệm đầy đủ mạng xã hội thời gian thực, VIVU cần bạn cấp các quyền truy cập sau:
            </p>

            {/* Danh sách 3 quyền */}
            <div className="space-y-2.5">
              {/* 1. GPS Thật */}
              <div className="p-3 rounded-2xl bg-white border border-[#D2D9F4] flex items-start gap-3 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-[rgba(0,229,255,0.15)] text-[#00838F] border border-[rgba(0,229,255,0.35)] flex items-center justify-center shrink-0 mt-0.5">
                  <i className="bi bi-geo-alt-fill text-base"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#131315] font-display">1. GPS Định Vị Không Gian</div>
                  <div className="text-[11px] text-[#70787E] mt-0.5">
                    Cắm ghim giọt nước và đồng bộ tọa độ trực tiếp với bạn bè trên bản đồ 3D.
                  </div>
                </div>
              </div>

              {/* 2. Âm thanh Web Audio */}
              <div className="p-3 rounded-2xl bg-white border border-[#D2D9F4] flex items-start gap-3 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-[rgba(16,255,160,0.15)] text-[#00A86B] border border-[rgba(16,255,160,0.35)] flex items-center justify-center shrink-0 mt-0.5">
                  <i className="bi bi-volume-up-fill text-base"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#131315] font-display">2. Âm Thanh &amp; Nhạc Nền MP3</div>
                  <div className="text-[11px] text-[#70787E] mt-0.5">
                    Mở khóa chuông radar phát hiện bài đăng và nghe thử nhạc MP3 trực tiếp.
                  </div>
                </div>
              </div>

              {/* 3. Camera / Hình ảnh */}
              <div className="p-3 rounded-2xl bg-white border border-[#D2D9F4] flex items-start gap-3 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-[rgba(255,42,133,0.15)] text-[#D81B60] border border-[rgba(255,42,133,0.35)] flex items-center justify-center shrink-0 mt-0.5">
                  <i className="bi bi-camera-fill text-base"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#131315] font-display">3. Máy Ảnh Hoặc Thư Viện Ảnh</div>
                  <div className="text-[11px] text-[#70787E] mt-0.5">
                    Chụp khoảnh khắc hoặc tải ảnh từ thiết bị để tạo bài Story quanh bạn.
                  </div>
                </div>
              </div>
            </div>

            {/* Khung nút hành động */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleRequestAllPermissions}
                disabled={isRequesting}
                className="w-full h-11 rounded-2xl bg-gradient-to-r from-[#00E5FF] via-[#00B4D8] to-[#10FFA0] text-[#08202E] font-display font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(0,229,255,0.4)] hover:shadow-[0_6px_25px_rgba(0,229,255,0.55)] active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {isRequesting ? (
                  <>
                    <i className="bi bi-arrow-repeat animate-spin text-sm"></i>
                    <span>Đang kích hoạt quyền &amp; khởi động...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle-fill text-sm"></i>
                    <span>Cho Phép Tất Cả &amp; Bắt Đầu</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBypass}
                disabled={isRequesting}
                className="w-full py-2 text-[11px] font-bold text-[#70787E] hover:text-[#00838F] transition-colors cursor-pointer"
              >
                Bỏ qua &amp; Dùng chế độ cơ bản (Tải ảnh thư viện)
              </button>
            </div>
          </div>
        ) : (
          /* MÀN HÌNH THÔNG BÁO VÀ TIẾP TỤC KHÔNG BỊ KHÓA (Rule 22) */
          <div className="p-6 text-center space-y-4 bg-[#FAFAFF] animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto rounded-3xl bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center text-2xl shadow-xs">
              <i className="bi bi-shield-exclamation text-2xl"></i>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#131315] font-display">Chế Độ Dự Phòng Sẵn Sàng</h3>
              <p className="text-xs text-[#70787E] leading-relaxed">
                {deniedReason}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-[#D2D9F4] text-[11px] text-[#40484D] text-left space-y-1 shadow-xs">
              <div className="font-bold text-[#131315] flex items-center gap-1.5">
                <i className="bi bi-info-circle text-[#00838F]"></i>
                <span>Gợi ý cho bạn:</span>
              </div>
              <p className="text-[#70787E]">
                Nếu thiết bị không có webcam hoặc truy cập qua mạng nội bộ LAN, bạn vẫn có thể đăng Story bình thường bằng cách chọn ảnh từ thư viện thiết bị.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleBypass}
                className="w-full h-11 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#10FFA0] text-[#08202E] font-display font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
              >
                <i className="bi bi-geo-alt-fill text-sm"></i>
                <span>Tiếp Tục Vào Bản Đồ Ngay</span>
              </button>

              <button
                type="button"
                onClick={handleRequestAllPermissions}
                className="w-full py-2 rounded-xl bg-white border border-[#D2D9F4] text-[#40484D] hover:text-[#131315] font-semibold text-xs active:scale-98 transition-all cursor-pointer"
              >
                <i className="bi bi-arrow-clockwise text-xs mr-1"></i>
                <span>Thử Cấp Quyền Lại</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
