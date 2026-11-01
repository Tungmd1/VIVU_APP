import React from 'react';
import { motion } from 'motion/react';
import VivuButton from '../common/VivuButton';

/**
 * MessengerInboxList - Danh sách Hộp thư Tin nhắn chuẩn Cyberpunk Pink & Blue Theme
 * Nền tối #0a0e1c, khung kính rgba(10,18,32,0.85), điểm nhấn Hồng Neon #FF2A85 & Xanh Cyan #00E5FF
 * Tuân thủ Rule 5 (100% Bootstrap Icons), Rule 7 (< 450 dòng)
 */
export default function MessengerInboxList({
  activeConversationId,
  setActiveConversationId,
  filteredConversations = [],
  chatSearchQuery,
  setChatSearchQuery,
  chatFilterTab,
  setChatFilterTab,
  allCount = 0,
  groupCount = 0,
  spamCount = 0,
  userAvatar,
  onBackToMap,
  onToggleRightFriendshipPanel,
  pendingFriendRequestsCount = 0,
  onOpenCreateCircle,
  setGroupToDelete
}) {
  return (
    <aside
      className={`${
        activeConversationId ? 'hidden md:flex' : 'flex'
      } w-full md:w-[350px] lg:w-[390px] shrink-0 border-r border-white/10 flex-col h-full bg-[#0a0e1c] z-30 select-none font-sans`}
    >
      {/* Header Hộp thư F1 Glass */}
      <div className="p-4 border-b border-white/10 shrink-0 space-y-3 bg-[rgba(20,20,30,0.85)] backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Nút Quay Lại Bản Đồ 3D */}
            {onBackToMap && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                onClick={onBackToMap}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 flex items-center justify-center transition-colors shrink-0 shadow-sm cursor-pointer group"
                title="Quay lại Bản đồ 3D"
                aria-label="Quay lại Bản đồ 3D"
              >
                <i className="bi bi-arrow-left text-base font-bold group-hover:-translate-x-0.5 transition-transform text-[#00E5FF]"></i>
              </motion.button>
            )}

            <div className="relative">
              <img 
                src={userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                alt="" 
                className="w-10 h-10 rounded-full object-cover border-2 border-[#FF2A85] shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00FF66] border border-black"></span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white font-sans tracking-tight">Tin nhắn</h1>
              <span className="text-[11px] text-white/50">Trò chuyện &amp; Kết nối</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Nút toggle nhanh Panel Kết bạn cạnh phải trên Mobile */}
            {onToggleRightFriendshipPanel && (
              <button
                type="button"
                onClick={onToggleRightFriendshipPanel}
                className="lg:hidden h-8 px-2.5 rounded-full bg-white/5 border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-white/10 active:scale-95 transition-all shadow-sm"
                title="Mở khu vực kết nối &amp; bạn bè cạnh phải"
              >
                <i className="bi bi-people-fill text-xs text-[#00E5FF]"></i>
                {pendingFriendRequestsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#FF2A85] text-white text-[9px] font-bold">
                    {pendingFriendRequestsCount}
                  </span>
                )}
              </button>
            )}

            {/* Nút "+ Tạo Nhóm" F1 Gold CTA */}
            <VivuButton
              onClick={onOpenCreateCircle}
              variant="primary"
              size="sm"
              pill={true}
              glow={true}
              icon="bi-plus-lg"
              title="Tạo nhóm trò chuyện mới"
            >
              Tạo nhóm
            </VivuButton>
          </div>
        </div>

        {/* Ô tìm kiếm F1 Glass Theme */}
        <div className="relative">
          <i className="bi bi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-xs"></i>
          <input 
            type="text" 
            value={chatSearchQuery}
            onChange={(e) => setChatSearchQuery(e.target.value)}
            placeholder="Tìm kiếm đoạn chat..." 
            className="w-full pl-9 pr-8 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-white placeholder-white/40 outline-none focus:border-[#FF2A85] focus:ring-1 focus:ring-[#FF2A85]/30 transition-all font-medium"
          />
          {chatSearchQuery && (
            <button 
              type="button"
              onClick={() => setChatSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <i className="bi bi-x-circle-fill text-xs"></i>
            </button>
          )}
        </div>
      </div>

      {/* Danh sách cuộn độc lập cho Hộp thư */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 pb-28 space-y-3 bg-[#0a0e1c]">

        {/* Bộ lọc 3 tab: Tất cả, Nhóm, Người lạ */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
          <button
            type="button"
            onClick={() => setChatFilterTab('all')}
            className={`py-1.5 px-3.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              chatFilterTab === 'all'
                ? 'bg-[#FF2A85] text-white font-bold shadow-[0_0_12px_rgba(255,42,133,0.35)]'
                : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>Tất cả</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              chatFilterTab === 'all' ? 'bg-black/20 text-white' : 'bg-white/10 text-white/60'
            }`}>
              {allCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setChatFilterTab('group')}
            className={`py-1.5 px-3.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              chatFilterTab === 'group'
                ? 'bg-[#FF2A85] text-white font-bold shadow-[0_0_12px_rgba(255,42,133,0.35)]'
                : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <i className="bi bi-people-fill text-xs"></i>
            <span>Nhóm</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              chatFilterTab === 'group' ? 'bg-black/20 text-white' : 'bg-white/10 text-white/60'
            }`}>
              {groupCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setChatFilterTab('spam')}
            className={`py-1.5 px-3.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              chatFilterTab === 'spam'
                ? 'bg-[#FF2A85] text-white font-bold shadow-[0_0_12px_rgba(255,42,133,0.35)]'
                : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <i className="bi bi-shield-exclamation text-xs"></i>
            <span>Người lạ</span>
            {spamCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-[#E10600] text-white">
                {spamCount}
              </span>
            )}
          </button>
        </div>

        {/* Danh sách các cuộc trò chuyện */}
        <div className="space-y-2">
          {filteredConversations.length === 0 ? (
            <div className="py-12 text-center text-white/40 space-y-2 bg-[rgba(20,20,30,0.6)] rounded-3xl border border-dashed border-white/10">
              <i className="bi bi-chat-square-dots text-3xl text-white/20"></i>
              <p className="text-xs">Chưa có đoạn chat nào.</p>
              {spamCount > 0 && chatFilterTab === 'all' && (
                <button
                  type="button"
                  onClick={() => setChatFilterTab('spam')}
                  className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FF2A85]/15 text-[#FF2A85] text-xs font-bold border border-[#FF2A85]/30 hover:bg-[#FF2A85]/25 active:scale-95 transition-all cursor-pointer"
                >
                  <i className="bi bi-shield-exclamation"></i>
                  <span>Xem {spamCount} lời nhắn chờ từ người lạ</span>
                </button>
              )}
            </div>
          ) : (
            filteredConversations.map(conv => {
              const isGroup = conv.type === 'group';
              const convStreak = Math.max(1, Math.floor((conv.messages?.length || 0) / 3));
              const showStreak = !isGroup && (conv.messages?.length || 0) >= 3;
              const isSelected = activeConversationId === conv.id;

              return (
                <div 
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer active:scale-[0.99] group ${
                    isSelected
                      ? 'bg-[#FF2A85]/15 border-2 border-[#FF2A85] text-white shadow-[0_0_16px_rgba(255,42,133,0.3)]'
                      : 'bg-[rgba(20,20,30,0.6)] border border-white/10 hover:bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative shrink-0">
                      <img 
                        src={conv.avatar} 
                        alt="" 
                        className="w-12 h-12 rounded-full object-cover border border-white/20" 
                      />
                      {conv.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00FF66] border-2 border-black shadow-[0_0_6px_#00FF66]"></span>
                      )}
                      {showStreak && (
                        <span className="absolute -top-1 -left-1 px-1 rounded-full bg-[#FF2A85] text-white text-[9px] font-bold flex items-center border border-black shadow-sm">
                          <i className="bi bi-fire text-[8px] mr-0.5"></i>
                          {convStreak}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          <h3 className="font-semibold text-xs text-white truncate">{conv.name}</h3>
                          {showStreak && (
                            <span className="text-[10px] text-[#FF2A85] font-bold flex items-center gap-0.5">
                              <i className="bi bi-fire"></i>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-white/40 shrink-0 font-mono">{conv.time}</span>
                      </div>

                      <p className={`text-xs truncate mt-0.5 ${conv.unread ? 'font-semibold text-[#FF2A85]' : 'text-white/50'}`}>
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>

                  {/* Nút Xóa Hội Thoại */}
                  {isGroup && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setGroupToDelete(conv);
                      }}
                      className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors flex items-center justify-center shrink-0 cursor-pointer shadow-sm"
                      title="Xóa nhóm"
                    >
                      <i className="bi bi-trash3-fill text-xs"></i>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
