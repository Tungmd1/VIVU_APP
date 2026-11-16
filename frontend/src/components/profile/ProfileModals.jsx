import React from 'react';

/**
 * ProfileModals - Các hộp thoại phụ của trang Hồ Sơ Cá Nhân:
 * 1. LogoutConfirmModal: Hộp thoại xác nhận đăng xuất
 * 2. PhotoViewerModal: Popup phóng to ảnh xem chi tiết
 * Tuân thủ Rule 5 (100% Bootstrap Icons), Rule 7 (< 450 dòng)
 */

export function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="max-w-xs w-full bg-[#121520] border border-white/15 rounded-3xl p-5 text-center shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center text-xl">
          <i className="bi bi-box-arrow-right" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-white">Xác nhận đăng xuất?</h3>
          <p className="text-xs text-white/60 mt-1">Bạn sẽ quay trở lại chế độ Khách của VIVU.</p>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold active:scale-95 transition-all cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/30 active:scale-95 transition-all cursor-pointer"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}

export function PhotoViewerModal({ photoUrl, onClose }) {
  if (!photoUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer animate-in fade-in duration-200"
    >
      <div 
        className="relative max-w-lg w-full max-h-[85vh] rounded-3xl overflow-hidden bg-black shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={photoUrl} alt="Phóng to ảnh" className="w-full h-full object-contain" />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center text-sm border border-white/20 transition-all cursor-pointer"
          title="Đóng xem ảnh"
        >
          <i className="bi bi-x-lg" />
        </button>
      </div>
    </div>
  );
}

