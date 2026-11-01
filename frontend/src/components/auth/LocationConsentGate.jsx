import React, { useState } from 'react';

/**
 * LocationConsentGate - Cổng kiểm soát 2 bước: Điều khoản Vị trí & Cấp quyền GPS phần cứng
 * Tuân thủ Rule 5 (100% Bootstrap Icons), Chuẩn Luminous Solar-Cyber HUD (White Cyberpunk)
 */
export default function LocationConsentGate({
  user,
  onAcceptTerms,
  onRequestGps,
  onLogout,
  isGpsLoading,
  gpsError,
  permissionDenied
}) {
  const [hasAgreedTerms, setHasAgreedTerms] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Điều khoản | 2: Quyền GPS

  const handleStep1Submit = () => {
    if (!hasAgreedTerms) return;
    onAcceptTerms();
    setCurrentStep(2);
    onRequestGps();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200 select-none font-sans">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl border border-[#D2D9F4] rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.15),0_0_30px_rgba(0,229,255,0.15)] space-y-5 text-[#131315] max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* Header Icon */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D2D9F4]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[rgba(0,229,255,0.12)] text-[#00838F] flex items-center justify-center text-lg border border-[rgba(0,229,255,0.3)] shadow-xs">
              <i className="bi bi-geo-alt-fill text-[#00838F]"></i>
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-[#131315] font-display">Xác Thực Vị Trí VIVU</h2>
              <p className="text-[11px] text-[#70787E]">Cổng điều khoản &amp; định vị GPS thực tế</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F2F3FF] border border-[#D2D9F4] text-[10px] text-[#70787E] font-mono font-bold">
            <span>Bước {currentStep}/2</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BƯỚC 1: ĐIỀU KHOẢN VÀ CHÍNH SÁCH QUYỀN RIÊNG TƯ VỊ TRÍ   */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in slide-in-from-right-2 duration-150">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-[#131315] uppercase tracking-wider flex items-center gap-1.5 font-display">
                <i className="bi bi-shield-check text-[#00838F]"></i>
                <span>Chính sách minh bạch dữ liệu vị trí</span>
              </h3>
              <p className="text-[11px] text-[#70787E] leading-relaxed">
                VIVU là mạng xã hội bản đồ kết nối thời gian thực. Để tham gia và kết nối với bạn bè, bạn cần hiểu rõ cách dữ liệu vị trí của bạn được sử dụng:
              </p>
            </div>

            {/* Khung giải thích chi tiết 5 điểm */}
            <div className="bg-[#FAFAFF] border border-[#D2D9F4] rounded-2xl p-4 space-y-3 text-xs shadow-xs">
              <div className="flex items-start gap-2.5">
                <i className="bi bi-crosshair text-[#00838F] text-sm mt-0.5 shrink-0"></i>
                <div className="space-y-0.5">
                  <div className="font-bold text-[#131315]">Mục đích sử dụng</div>
                  <div className="text-[11px] text-[#70787E]">
                    Hiển thị giọt nước vị trí của bạn trên bản đồ 3D và kết nối với bạn bè quanh bạn.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <i className="bi bi-hdd-network text-[#00838F] text-sm mt-0.5 shrink-0"></i>
                <div className="space-y-0.5">
                  <div className="font-bold text-[#131315]">Dữ liệu được thu thập</div>
                  <div className="text-[11px] text-[#70787E]">
                    Tọa độ GPS (Vĩ độ, Kinh độ), độ chính xác (mét) và thời điểm ghi nhận (timestamp).
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <i className="bi bi-people text-[#00838F] text-sm mt-0.5 shrink-0"></i>
                <div className="space-y-0.5">
                  <div className="font-bold text-[#131315]">Ai có thể nhìn thấy?</div>
                  <div className="text-[11px] text-[#70787E]">
                    Chỉ những người online hợp lệ trên bản đồ hoặc bạn bè theo cài đặt quyền riêng tư của bạn.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <i className="bi bi-clock-history text-[#00838F] text-sm mt-0.5 shrink-0"></i>
                <div className="space-y-0.5">
                  <div className="font-bold text-[#131315]">Tần suất cập nhật</div>
                  <div className="text-[11px] text-[#70787E]">
                    Chỉ cập nhật khi mở ứng dụng và di chuyển trên 8 mét để tối ưu pin cho thiết bị.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <i className="bi bi-eye-slash text-[#00838F] text-sm mt-0.5 shrink-0"></i>
                <div className="space-y-0.5">
                  <div className="font-bold text-[#131315]">Cách dừng chia sẻ</div>
                  <div className="text-[11px] text-[#70787E]">
                    Bật "Chế độ tàng hình GPS" trong Cài đặt, thu hồi quyền vị trí trong trình duyệt, hoặc Đăng xuất.
                  </div>
                </div>
              </div>
            </div>

            {/* Checkbox Chấp thuận */}
            <label className="flex items-start gap-3 p-3 bg-[#F2F3FF] border border-[#D2D9F4] rounded-2xl cursor-pointer hover:border-[#00E5FF] transition-all select-none">
              <input
                type="checkbox"
                checked={hasAgreedTerms}
                onChange={(e) => setHasAgreedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#D2D9F4] text-[#00838F] focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-xs text-[#40484D] leading-relaxed">
                Tôi xác nhận đã đọc, hiểu rõ và đồng ý với <strong>Điều khoản Dịch vụ</strong> và <strong>Chính sách Chia sẻ Vị trí VIVU</strong> (Phiên bản 1.0).
              </span>
            </label>

            {/* Nút hành động */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onLogout}
                className="w-1/3 py-2.5 px-3 rounded-full bg-[#F2F3FF] text-[#70787E] hover:text-[#EF4444] hover:bg-[#FFE8E8] text-xs font-semibold border border-[#D2D9F4] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <i className="bi bi-box-arrow-right"></i>
                <span>Đăng xuất</span>
              </button>

              <button
                type="button"
                disabled={!hasAgreedTerms}
                onClick={handleStep1Submit}
                className={`w-2/3 py-2.5 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  hasAgreedTerms
                    ? 'bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-display hover:opacity-95 active:scale-95 border border-[#00F0FF]'
                    : 'bg-[#F2F3FF] text-[#70787E]/50 border border-[#D2D9F4] cursor-not-allowed'
                }`}
              >
                <span>Tiếp tục cấp quyền GPS</span>
                <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* BƯỚC 2: CẤP QUYỀN GPS TRÌNH DUYỆT THIẾT BỊ               */}
        {/* ======================================================== */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right-2 duration-150">
            <div className="text-center py-3 space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-[rgba(0,229,255,0.12)] border border-[rgba(0,229,255,0.3)] text-[#00838F] flex items-center justify-center text-2xl shadow-xs">
                {isGpsLoading ? (
                  <i className="bi bi-arrow-repeat animate-spin"></i>
                ) : permissionDenied ? (
                  <i className="bi bi-geo-alt-slash text-[#EF4444]"></i>
                ) : (
                  <i className="bi bi-geo-alt-fill text-[#00838F]"></i>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#131315] font-display">
                  {permissionDenied ? 'Quyền vị trí đã bị chặn' : 'Cấp quyền truy cập vị trí thiết bị'}
                </h3>
                <p className="text-[11px] text-[#70787E] max-w-xs mx-auto">
                  {permissionDenied
                    ? 'Trình duyệt đang chặn VIVU truy cập chip GPS. Vui lòng làm theo hướng dẫn dưới đây để tiếp tục.'
                    : 'Nhấn nút bên dưới để trình duyệt hiển thị hộp thoại cấp quyền GPS phần cứng cho VIVU.'}
                </p>
              </div>
            </div>

            {/* Hướng dẫn khi bị từ chối quyền */}
            {permissionDenied && (
              <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4 space-y-2.5 text-xs text-[#92400E] shadow-xs">
                <div className="font-bold text-[#B45309] font-display flex items-center gap-1.5">
                  <i className="bi bi-info-circle-fill"></i>
                  <span>Cách bật lại quyền vị trí:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#92400E] leading-relaxed">
                  <li>Bấm vào biểu tượng <strong>Ổ khóa <i className="bi bi-lock-fill text-[#D97706]"></i></strong> hoặc cài đặt trang trên thanh địa chỉ URL.</li>
                  <li>Tìm mục <strong>Vị trí (Location)</strong> và đổi thành <strong>Cho phép (Allow)</strong>.</li>
                  <li>Nhấn nút <strong>Thử lại</strong> bên dưới.</li>
                </ol>
              </div>
            )}

            {/* Báo lỗi nếu có */}
            {gpsError && !permissionDenied && (
              <div className="bg-[#FEE2E2] border border-[#FCA5A5] rounded-2xl p-3 text-xs text-[#EF4444] flex items-center gap-2 shadow-xs">
                <i className="bi bi-exclamation-triangle-fill text-[#EF4444]"></i>
                <span className="text-[11px]">{gpsError}</span>
              </div>
            )}

            {/* Nút hành động */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onLogout}
                className="w-1/3 py-2.5 px-3 rounded-full bg-[#F2F3FF] text-[#70787E] hover:text-[#EF4444] hover:bg-[#FFE8E8] text-xs font-semibold border border-[#D2D9F4] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <i className="bi bi-box-arrow-right"></i>
                <span>Đăng xuất</span>
              </button>

              <button
                type="button"
                onClick={onRequestGps}
                disabled={isGpsLoading}
                className="w-2/3 py-2.5 px-4 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#08202E] font-display hover:opacity-95 active:scale-95 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 border border-[#00F0FF]"
              >
                {isGpsLoading ? (
                  <>
                    <i className="bi bi-arrow-repeat animate-spin"></i>
                    <span>Đang tìm GPS...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-crosshair"></i>
                    <span>{permissionDenied ? 'Thử lại' : 'Cho phép GPS'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
