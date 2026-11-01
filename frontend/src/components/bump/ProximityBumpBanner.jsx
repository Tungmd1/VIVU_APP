import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * ProximityBumpBanner - Banner thông báo phát hiện Bạn Bè ở cự ly siêu gần (< 15m)
 * Chuẩn thiết kế từ DESIGN.md & get-design.md Mục 3.1 Nút 1.6
 * Thẻ card trắng tinh khiết, nút Cụm Ly gradient #00E5FF -> #00B4D8 viền #00F0FF, chữ #08202E
 */
export default function ProximityBumpBanner({
  nearbyFriend,
  distanceMeters = 5,
  onTriggerBump,
  onDismiss
}) {
  if (!nearbyFriend) return null;

  const friendName = nearbyFriend.name || nearbyFriend.full_name || 'Bạn bè';
  const friendAvatar = nearbyFriend.avatar || nearbyFriend.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

  return (
    <AnimatePresence>
      <div className="fixed bottom-24 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-40 pointer-events-auto select-none font-sans">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 15, scale: 0.96, filter: 'blur(3px)' }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="w-full bg-white/95 backdrop-blur-2xl border border-[rgba(0,229,255,0.40)] rounded-3xl p-3 shadow-[0_12px_36px_rgba(0,229,255,0.18),0_4px_16px_rgba(0,0,0,0.06)] flex items-center justify-between gap-3 text-[#131315]"
        >
          {/* Avatar & Thông tin cự ly */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={friendAvatar}
                alt={friendName}
                className="w-11 h-11 rounded-full object-cover border-2 border-[#00B4D8] shadow-xs"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#10FFA0] border-2 border-white flex items-center justify-center">
                <i className="bi bi-broadcast text-[8px] text-[#08202E] font-black"></i>
              </span>
            </div>

            <div className="min-w-0">
              <div className="text-xs font-bold font-['Outfit'] text-[#131315] truncate flex items-center gap-1.5">
                <span>{friendName}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-[rgba(0,229,255,0.15)] text-[#00838F] border border-[rgba(0,229,255,0.40)] font-mono text-[9px] font-bold">
                  cách {distanceMeters}m
                </span>
              </div>
              <p className="text-[10px] text-[#70787E] truncate font-medium">
                Lắc điện thoại hoặc chạm để Cụng Ly 3D!
              </p>
            </div>
          </div>

          {/* Cụm Nút Hành Động (Nút 1.6: Cụng Ly Gradient Cyber Cyan) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <motion.button
              type="button"
              whileTap={{ scale: 0.93 }}
              onClick={onTriggerBump}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] border border-[#00F0FF] text-[#08202E] font-['Outfit'] font-bold text-xs flex items-center gap-1.5 shadow-[0_0_16px_rgba(0,229,255,0.45)] cursor-pointer active:scale-95 transition-all"
            >
              <i className="bi bi-cup-straw text-xs"></i>
              <span>Cụng Ly</span>
            </motion.button>

            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="w-7 h-7 rounded-full bg-[#F2F3FF] hover:bg-[#E6E7F6] text-[#70787E] hover:text-[#131315] flex items-center justify-center transition-all cursor-pointer"
                title="Bỏ qua"
              >
                <i className="bi bi-x text-sm"></i>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
