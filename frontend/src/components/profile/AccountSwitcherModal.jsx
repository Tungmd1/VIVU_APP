import React from 'react';
import { sharedStore } from '../../services/sharedStoreService';

/**
 * AccountSwitcherModal - Modal chuyển đổi nhanh tài khoản người dùng
 * Cho phép chuyển đổi giữa các tài khoản khác nhau để thử nghiệm tính năng kết bạn, nhắn tin 2 chiều
 * Chuẩn Resend Dark Monochrome, 100% Bootstrap Icons
 */
export default function AccountSwitcherModal({
  isOpen,
  onClose,
  currentUser,
  onSwitchAccount
}) {
  if (!isOpen) return null;

  const accounts = sharedStore.getAllAccounts();
  const currentUserId = currentUser?.id || 'user-tung';

  return (
    <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans animate-in fade-in">
      <div className="w-full max-w-sm bg-[#0E0E10] border border-white/15 rounded-3xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-white space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/15">
              <i className="bi bi-people-fill text-sm"></i>
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Chuyển Đổi Tài Khoản</h2>
              <p className="text-[10px] text-[#8E8E93]">Thử nghiệm nhắn tin & kết bạn 2 chiều</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-[#8E8E93] hover:text-white flex items-center justify-center transition-colors"
          >
            <i className="bi bi-x-lg text-xs"></i>
          </button>
        </div>

        {/* Danh sách tài khoản trong hệ thống */}
        <div className="space-y-2 max-h-[60vh] overflow-y-auto no-scrollbar">
          {accounts.map(acc => {
            const isCurrent = acc.id === currentUserId || acc.email === currentUser?.email;

            return (
              <div
                key={acc.id}
                onClick={() => {
                  if (!isCurrent) {
                    onSwitchAccount(acc);
                    onClose();
                  }
                }}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-white/15 border-white shadow-[0_0_15px_rgba(255,255,255,0.15)]'
                    : 'bg-[#151619] border-white/5 hover:border-white/25 hover:bg-[#1C1D22] cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border border-white/20 shrink-0">
                    <img src={acc.avatar} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black"></span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      <span>{acc.name}</span>
                      {isCurrent && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                          Đang dùng
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#8E8E93] truncate">{acc.job}</div>
                    <div className="text-[9px] text-[#8E8E93]/70 truncate">{acc.email}</div>
                  </div>
                </div>

                {!isCurrent && (
                  <button className="px-3 py-1 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#EAEAEA] shrink-0 active:scale-95 transition-all">
                    Chuyển
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Ghi chú hướng dẫn */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-[#8E8E93] flex items-start gap-2">
          <i className="bi bi-info-circle-fill text-white/70 mt-0.5"></i>
          <span>
            Khi chuyển tài khoản, bạn có thể gửi lời mời kết bạn và nhắn tin qua lại với tài khoản trước đó để kiểm tra tương tác toàn diện.
          </span>
        </div>

      </div>
    </div>
  );
}
