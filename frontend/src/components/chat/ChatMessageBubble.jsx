import React from 'react';
import ChatPollCard from './ChatPollCard';
import LiveLocationCard from './LiveLocationCard';
import { playTrollSound } from '../meme/trollSoundSynth';

/**
 * ChatMessageBubble - Khối Hiển Thị Từng Loại Tin Nhắn Trong Khung Chat (Rule 7 Anti-Monolith)
 * - Hỗ trợ: Thả tim, Video, Ảnh, Sticker VIVU Độc Quyền, Thẻ Troll, Thẻ Bình Chọn, Vị Trí Trực Tiếp (Live GPS), Vị Trí Tĩnh, Tin Nhắn Chữ
 * - 100% Bootstrap Icons (Rule 5) | Tối ưu < 220 dòng (Rule 7)
 */
export default function ChatMessageBubble({
  msg,
  isMe,
  currentUserId,
  activeConversation,
  onOpenTakeoverMeme,
  onOpenMapForStory,
  onStartNavigation,
  setSelectedLightboxMedia,
  onSelectMessageForDelete
}) {
  return (
    <div className={`group relative flex items-end gap-1.5 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : 'flex-row'}`}>
      {!isMe && (
        <img 
          src={msg.senderAvatar || activeConversation?.avatar} 
          alt="" 
          className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/20"
        />
      )}

      {/* Nút hành động nhanh: Mở menu Xóa / Thu hồi tin nhắn */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelectMessageForDelete?.(msg);
        }}
        className={`w-6 h-6 rounded-full bg-white/10 hover:bg-[#FF2A85]/20 text-white/40 hover:text-[#FF2A85] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 self-center shrink-0 cursor-pointer ${
          isMe ? 'order-first' : 'order-last'
        }`}
        title="Tùy chọn tin nhắn (Xóa / Thu hồi)"
      >
        <i className="bi bi-three-dots text-[10px]"></i>
      </button>

      {/* 1. Tin nhắn Thả tim */}
      {(msg.isHeart || msg.is_heart || msg.text === '❤️') ? (
        <div 
          onClick={() => onSelectMessageForDelete?.(msg)}
          title="Nhấn để xóa tin nhắn"
          className="p-1 animate-bounce cursor-pointer"
        >
          <i className="bi bi-heart-fill text-[#E10600] text-3xl drop-shadow"></i>
        </div>
      ) : msg.video ? (
        /* 2. Tin nhắn Video */
        <div className="rounded-2xl overflow-hidden border border-white/15 max-w-[260px] bg-black shadow-md">
          <video src={msg.video} controls playsInline className="w-full max-h-60 object-cover rounded-2xl" />
          {msg.text && (
            <p 
              onClick={() => onSelectMessageForDelete?.(msg)}
              title="Nhấn để xóa tin nhắn"
              className="p-2.5 text-xs text-white/90 leading-relaxed break-words bg-black/60 border-t border-white/10 cursor-pointer"
            >
              {msg.text}
            </p>
          )}
        </div>
      ) : (msg.image && !msg.type && !msg.isSticker && !msg.sticker) ? (
        /* 3. Tin nhắn Ảnh thường */
        <div className="rounded-2xl overflow-hidden border border-white/15 max-w-[240px] bg-black/40 shadow-md">
          <img 
            src={msg.image} 
            alt="Đính kèm" 
            className="w-full max-h-60 object-cover rounded-2xl cursor-pointer hover:opacity-90 active:scale-[0.99] transition-all" 
            onClick={() => setSelectedLightboxMedia?.({ type: 'image', url: msg.image })}
          />
          {msg.text && (
            <p 
              onClick={() => onSelectMessageForDelete?.(msg)}
              title="Nhấn để xóa tin nhắn"
              className="p-2.5 text-xs text-white/90 leading-relaxed break-words bg-black/60 border-t border-white/10 cursor-pointer"
            >
              {msg.text}
            </p>
          )}
        </div>
      ) : (msg.type === 'sticker' || msg.isSticker || msg.sticker) ? (
        /* 4. Tin nhắn Sticker Độc Quyền VIVU Không Viền */
        <div 
          className="relative group/stk cursor-pointer select-none py-1"
          onClick={() => onSelectMessageForDelete?.(msg)}
          title="Nhấn để tùy chọn / xóa sticker"
        >
          <img 
            src={msg.sticker?.image || msg.stickerImage || msg.image} 
            alt={msg.sticker?.name || 'Sticker VIVU'} 
            className="w-28 h-28 sm:w-32 sm:h-32 object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transform hover:scale-110 active:scale-95 transition-all duration-200"
            onClick={(e) => {
              if (msg.sticker?.soundType || msg.soundType) {
                e.stopPropagation();
                playTrollSound(msg.sticker?.soundType || msg.soundType);
              }
            }}
          />
        </div>
      ) : (msg.type === 'troll' || msg.isTroll) ? (
        /* 5. Thẻ Tin Nhắn Troll Đặc Bản */
        <div 
          onClick={() => onSelectMessageForDelete?.(msg)}
          className="p-3 bg-gradient-to-br from-[#1c1224] to-[#121c24] backdrop-blur-xl rounded-2xl border-2 border-[#FF2A85]/50 space-y-1.5 max-w-[240px] text-white shadow-[0_0_15px_rgba(255,42,133,0.3)] cursor-pointer"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-1 text-xs font-bold text-[#FF2A85]">
            <span className="flex items-center gap-1"><i className="bi bi-lightning-charge-fill animate-pulse" />{msg.memeName || 'Trêu Chọc'}</span>
            <span className="text-[9px] font-mono px-1 rounded-full bg-white/10 text-white/80">TROLL</span>
          </div>
          <p className="text-xs font-bold text-white italic py-0.5 line-clamp-2">"{msg.text || msg.caption || 'Ném trêu bạn!'}"</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenTakeoverMeme) {
                onOpenTakeoverMeme({
                  meme: {
                    id: msg.prankId || msg.memeId || 'honeycomb_slipper',
                    name: msg.memeName || 'Trêu Chọc',
                    icon: msg.memeIcon || 'bi-lightning-charge-fill',
                    image3d: msg.image3d,
                    particleColor: msg.particleColor,
                    soundType: msg.soundType || 'punch',
                    caption: msg.text || msg.caption
                  },
                  senderName: isMe ? 'Bạn' : (activeConversation?.name || 'Bạn bè'),
                  senderUser: isMe ? null : activeConversation
                });
              }
            }}
            className="w-full py-1.5 rounded-xl bg-gradient-to-r from-[#FF2A85] to-[#00E5FF] text-white text-[11px] font-bold shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <i className="bi bi-play-fill text-sm" />
            <span>Xem hiệu ứng bùng nổ</span>
          </button>
        </div>
      ) : (msg.is_poll || msg.isPoll || msg.poll || msg.customPoll || (typeof msg.text === 'string' && (msg.text.startsWith('[BÌNH CHỌN]:') || msg.text.startsWith('[BÃŒNH CHá»ŒN]:') || msg.text.startsWith('[POLL]:')))) ? (
        /* 6. Thẻ Bình Chọn Tương Tác */
        <ChatPollCard
          msg={msg}
          isMe={isMe}
          currentUserId={currentUserId}
        />
      ) : (msg.is_live_location || msg.isLiveLocation || (typeof msg.text === 'string' && msg.text.includes('chia sẻ vị trí trực tiếp'))) ? (
        /* 7. Thẻ Vị trí Trực tiếp (Live GPS) */
        <LiveLocationCard
          msg={msg}
          isMe={isMe}
          currentUserId={currentUserId}
          onOpenMapForStory={onOpenMapForStory}
          onStartNavigation={onStartNavigation}
        />
      ) : (msg.isLocation || msg.is_location) ? (
        /* 8. Thẻ Vị trí Tĩnh GPS */
        <div 
          onClick={(e) => {
            if (onOpenMapForStory) onOpenMapForStory({ lat: msg.lat, lng: msg.lng });
          }}
          className="p-3 bg-[#1c2438] hover:bg-[#222c44] border border-cyan-500/40 rounded-2xl cursor-pointer transition-all space-y-1.5 max-w-[220px]"
        >
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
            <i className="bi bi-geo-alt-fill text-base animate-bounce" />
            <span>Vị trí GPS</span>
          </div>
          <p className="text-[11px] text-white/80 line-clamp-1">{msg.text || 'Nhấn để mở bản đồ'}</p>
          <div className="text-[9px] text-cyan-300 font-mono">
            {msg.lat?.toFixed(5)}, {msg.lng?.toFixed(5)}
          </div>
        </div>
      ) : (
        /* 9. Tin Nhắn Văn Bản Tiêu Chuẩn */
        <div 
          onClick={() => onSelectMessageForDelete?.(msg)}
          title="Nhấn để xóa hoặc tùy chọn tin nhắn"
          className={`p-3 rounded-2xl text-xs leading-relaxed max-w-full break-words shadow-sm cursor-pointer hover:opacity-95 transition-all ${
          isMe
            ? 'bg-gradient-to-r from-[#FF2A85] to-[#7928CA] text-white font-medium rounded-br-none'
            : 'bg-[#151926] text-white border border-white/10 rounded-bl-none'
        }`}>
          {msg.text}
        </div>
      )}
    </div>
  );
}
