import React, { useState } from 'react';

/**
 * VivuPermissionGate - Cổng Cấp Quyền Bắt Buộc (GPS Thực, Âm Thanh, Camera)
 * - Yêu cầu bắt buộc 3 quyền cốt lõi khi mới vào Web App
 * - Nếu người dùng từ chối -> Khóa màn hình / Đóng Web App theo yêu cầu
 * - Khi người dùng bấm cho phép: Tương tác chạm mở khóa Browser Autoplay cho Video Intro
 * - Chuẩn Luminous Solar-Cyber HUD, 100% Bootstrap Icons, Rule 7 (< 450 dòng)
 */
export default function VivuPermissionGate({ onGranted }) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [isDenied, setIsDenied] = useState(false);
  const [deniedReason, setDeniedReason] = useState('');

  const handleRequestAllPermissions = async () => {
    setIsRequesting(true);
    setIsDenied(false);
    setDeniedReason('');

    try {
      // 1. Kích hoạt Web Audio Context (Mở khóa âm thanh trình duyệt)
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          if (ctx.state === 'suspended') {
            await ctx.resume();
          }
        }
      } catch (err) {
        console.warn('Audio unlock warning:', err);
      }

      // 2. Yêu cầu quyền GPS thực tế
      if (!navigator.geolocation) {
        throw new Error('Trình duyệt của bạn không hỗ trợ định vị GPS phần cứng.');
      }

      await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          (err) => {
            if (err.code === err.PERMISSION_DENIED) {
              reject(new Error('Quyền truy cập GPS thực tế bị từ chối. VIVU yêu cầu vị trí để đồng bộ bản đồ.'));
            } else {
              // Timeout hoặc vị trí tạm thời vẫn cho phép tiếp tục
              resolve(null);
            }
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      });

      // 3. Yêu cầu quyền Camera / Hình ảnh (nếu thiết bị có camera)
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          });
          // Tắt ngay sau khi đã xác nhận cấp quyền
          stream.getTracks().forEach(track => track.stop());
        } catch (camErr) {
          // Nếu bị từ chối thẳng thừng bởi người dùng
          if (camErr.name === 'NotAllowedError' || camErr.name === 'PermissionDeniedError') {
            throw new Error('Quyền truy cập Camera/Hình ảnh bị từ chối. VIVU yêu cầu máy ảnh để tạo khoảnh khắc Story.');
          }
          console.warn('Camera probe note:', camErr);
        }
      }

      // Đánh dấu đã cấp quyền thành công
      try {
        localStorage.setItem('vivu_permissions_granted_v1', 'true');
        localStorage.setItem('vivu_location_terms_accepted', 'true');
      } catch {}

      setIsRequesting(false);
      if (onGranted) onGranted();

    } catch (err) {
      setIsRequesting(false);
      setIsDenied(true);
      setDeniedReason(err.message || 'Bạn đã từ chối một hoặc nhiều quyền bắt buộc của VIVU.');
    }
  };

  const handleReject = () => {
    setIsDenied(true);
    setDeniedReason('Bạn đã chọn từ chối cấp quyền. Theo chính sách hoạt động của VIVU, ứng dụng không thể tiếp tục.');
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
              <h2 className="text-sm font-bold text-[#131315] font-display">Cấp Quyền Bắt Buộc</h2>
              <p className="text-[10px] text-[#70787E]">VIVU Social Map • Xác thực quyền hệ thống</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#F2F3FF] border border-[#D2D9F4] text-[10px] font-mono font-bold text-[#00838F]">
            3 QUYỀN
          </span>
        </div>

        {/* Nội dung chính */}
        {!isDenied ? (
          <div className="p-6 space-y-4 bg-[#FAFAFF]">
            <p className="text-xs text-[#40484D] leading-relaxed">
              Để trải nghiệm đầy đủ mạng xã hội thời gian thực, VIVU <strong className="text-[#131315]">bắt buộc</strong> yêu cầu bạn cấp 3 quyền truy cập sau:
            </p>

            {/* Danh sách 3 quyền bắt buộc */}
            <div className="space-y-2.5">
              {/* 1. GPS Thật */}
              <div className="p-3 rounded-2xl bg-white border border-[#D2D9F4] flex items-start gap-3 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-[rgba(0,229,255,0.15)] text-[#00838F] border border-[rgba(0,229,255,0.35)] flex items-center justify-center shrink-0 mt-0.5">
                  <i className="bi bi-geo-alt-fill text-base"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#131315] font-display">1. GPS Định Vị Không Gian Thực</div>
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
                  <div className="text-xs font-bold text-[#131315] font-display">2. Âm Thanh Video &amp; Radar Chime</div>
                  <div className="text-[11px] text-[#70787E] mt-0.5">
                    Phát video intro có âm thanh, chuông radar story và hiệu ứng âm thanh sống động.
                  </div>
                </div>
              </div>

              {/* 3. Camera / Hình ảnh */}
              <div className="p-3 rounded-2xl bg-white border border-[#D2D9F4] flex items-start gap-3 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-[rgba(255,42,133,0.15)] text-[#D81B60] border border-[rgba(255,42,133,0.35)] flex items-center justify-center shrink-0 mt-0.5">
                  <i className="bi bi-camera-fill text-base"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#131315] font-display">3. Hình Ảnh &amp; Máy Ảnh Camera</div>
                  <div className="text-[11px] text-[#70787E] mt-0.5">
                    Chụp nhanh khoảnh khắc quanh bạn, đăng Story và quét mã kết nối bạn bè.
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
                onClick={handleReject}
                disabled={isRequesting}
                className="w-full py-2 text-[11px] font-bold text-[#70787E] hover:text-[#EF4444] transition-colors cursor-pointer"
              >
                Từ chối và Đóng ứng dụng
              </button>
            </div>
          </div>
        ) : (
          /* MÀN HÌNH KHÓA / ĐÓNG WEBAPP KHI TỪ CHỐI */
          <div className="p-6 text-center space-y-4 bg-[#FAFAFF] animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto rounded-3xl bg-[#FEE2E2] border border-[#FCA5A5] text-[#EF4444] flex items-center justify-center text-2xl shadow-xs">
              <i className="bi bi-x-octagon-fill"></i>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#EF4444] font-display">Ứng Dụng Đã Bị Khóa</h3>
              <p className="text-xs text-[#70787E] leading-relaxed">
                {deniedReason}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#D2D9F4] text-[11px] text-[#40484D] text-left space-y-1 shadow-xs">
              <div className="font-bold text-[#131315] flex items-center gap-1.5">
                <i className="bi bi-info-circle text-[#00838F]"></i>
                <span>Cách mở lại quyền:</span>
              </div>
              <p className="text-[#70787E]">
                Nhấn vào biểu tượng ổ khóa bên trái thanh địa chỉ trình duyệt, chọn <strong>Cho phép (Allow)</strong> Vị trí, Âm thanh &amp; Camera, sau đó tải lại trang.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRequestAllPermissions}
              className="w-full h-11 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-display font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all cursor-pointer"
            >
              <i className="bi bi-arrow-clockwise text-sm font-bold"></i>
              <span>Thử Cấp Quyền Lại</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

