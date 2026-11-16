import React from 'react';

/**
 * StoryDeleteConfirmDialog - Hộp thoại xác nhận gỡ / xóa Story thông minh
 * Tách độc lập để tối ưu dung lượng component StoryViewerModal (< 450 dòng, Rule 7)
 * 100% Bootstrap Icons (Rule 5)
 */
export default function StoryDeleteConfirmDialog({
  isOpen,
  isDeleting,
  onConfirm,
  onClose
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[65] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-sm rounded-2xl bg-[#1A1A1E] border border-white/15 p-6 shadow-2xl space-y-4 text-center animate-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
          <i className="bi bi-archive-fill text-xl"></i>
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Quản Lý Khoảnh Khắc</h3>
          <p className="text-xs text-[#8E8E93] leading-relaxed">
            Bạn muốn gỡ bài đăng này khỏi Bản đồ 3D như thế nào?
          </p>
        </div>

        <div className="space-y-2 pt-2">
          {/* Lựa chọn 1: Chỉ gỡ khỏi bản đồ, lưu vào kho */}
          <button
            type="button"
            onClick={() => onConfirm({ preserveInArchive: true })}
            disabled={isDeleting}
            className="w-full py-2.5 px-4 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-[#10FFA0] text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <i className="bi bi-archive-fill text-sm"></i>
            <span>Chỉ gỡ khỏi Bản đồ (Giữ trong Kho Lưu Trữ)</span>
          </button>

          {/* Lựa chọn 2: Xóa vĩnh viễn tất cả */}
          <button
            type="button"
            onClick={() => onConfirm({ preserveInArchive: false })}
            disabled={isDeleting}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-400 hover:text-rose-200 text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <i className="bi bi-trash3-fill text-xs"></i>
            <span>Xóa vĩnh viễn tất cả</span>
          </button>

          {/* Lựa chọn 3: Hủy bỏ */}
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full py-2 text-white/50 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  );
}
