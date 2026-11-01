import React from 'react';

/**
 * Component React ErrorBoundary toàn cục
 * Bắt mọi runtime exception của giao diện và hiển thị màn hình phục hồi trang nhã chuẩn Dark Monochrome
 * 100% Bootstrap Icons, tuyệt đối không để rơi vào màn hình đen (Rule 2)
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[VIVU ErrorBoundary] Đã bắt lỗi runtime:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Lỗi xóa storage:', e);
    }
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black text-white font-sans">
          <div className="w-full max-w-sm bg-[#0E0E10] border border-white/15 rounded-3xl p-6 text-center space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
              <i className="bi bi-exclamation-triangle-fill text-2xl"></i>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-black tracking-tight text-white">
                Khôi Phục Bản Đồ VIVU
              </h2>
              <p className="text-xs text-[#8E8E93] leading-relaxed">
                Ứng dụng vừa phát hiện kết nối không đồng nhất trên thiết bị di động. Vui lòng tải lại để làm mới giao diện 3D.
              </p>
            </div>

            {this.state.error && (
              <div className="p-2.5 bg-red-950/40 border border-red-500/20 rounded-xl text-left text-[11px] text-red-300 font-mono break-all max-h-24 overflow-y-auto">
                <div className="font-bold text-red-400 mb-0.5">Chi tiết lỗi:</div>
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-2xl bg-white text-black text-xs font-bold flex items-center justify-center gap-2 hover:bg-neutral-200 active:scale-95 transition-all shadow cursor-pointer"
              >
                <i className="bi bi-arrow-clockwise text-sm"></i>
                <span>Tải lại Bản đồ ngay</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetStorage}
                className="w-full py-2.5 px-4 rounded-2xl bg-white/5 border border-white/10 text-[#8E8E93] hover:text-white text-[11px] font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <i className="bi bi-trash3 text-xs"></i>
                <span>Xóa bộ nhớ đệm & Đặt lại</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
