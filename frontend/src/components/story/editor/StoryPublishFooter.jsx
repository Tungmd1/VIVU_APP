import React, { useState } from 'react';
import { EXPIRY_OPTIONS, playTactileClickSound } from '../storyAudioEffects';

export default function StoryPublishFooter({
  privacy,
  onChangePrivacy,
  expiryHours,
  onChangeExpiry,
  taggedFriends = [],
  onOpenTagFriends,
  userLocationName,
  isPublishing,
  onPublish
}) {
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);

  const getPrivacyLabel = () => {
    if (privacy === 'friends') return 'Bạn Bè';
    if (privacy.startsWith('circle-')) return 'Nhóm Riêng';
    return 'Công Khai';
  };

  const getPrivacyIcon = () => {
    if (privacy === 'friends') return 'bi-people-fill';
    if (privacy.startsWith('circle-')) return 'bi-lock-fill';
    return 'bi-globe-asia-australia';
  };

  return (
    <>
      <div className="absolute bottom-0 left-0 right-0 z-30 p-4 pb-safe bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between gap-3 pointer-events-auto">
        {/* Nút cài đặt quyền riêng tư & tự hủy */}
        <button
          type="button"
          onClick={() => {
            playTactileClickSound();
            setShowOptionsSheet(true);
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white/90 text-xs font-semibold hover:border-white/30 active:scale-95 transition-all"
        >
          <i className={`bi ${getPrivacyIcon()} text-[#0A8395]`}></i>
          <span>{getPrivacyLabel()}</span>
          <span className="text-white/40">•</span>
          <span className="font-mono text-[11px] text-amber-400">{expiryHours}h</span>
          <i className="bi bi-chevron-up text-[10px] text-white/50"></i>
        </button>

        {/* Nút Gắn Thẻ Bạn Bè */}
        <button
          type="button"
          onClick={() => {
            playTactileClickSound();
            onOpenTagFriends();
          }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-semibold active:scale-95 transition-all ${
            taggedFriends.length > 0
              ? 'bg-purple-600/30 border-purple-500 text-purple-300'
              : 'bg-black/60 backdrop-blur-md border-white/15 text-white/80 hover:text-white'
          }`}
          title="Gắn thẻ bạn bè"
        >
          <i className="bi bi-person-plus-fill"></i>
          <span>{taggedFriends.length > 0 ? `@${taggedFriends.length}` : 'Gắn Thẻ'}</span>
        </button>

        {/* Nút Đăng Story To / Nổi bật */}
        <button
          type="button"
          disabled={isPublishing}
          onClick={onPublish}
          className="flex-1 max-w-[150px] py-2.5 px-4 rounded-full bg-gradient-to-r from-teal-400 via-[#0A8395] to-cyan-500 text-black font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-teal-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {isPublishing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              <span>Đang Đăng...</span>
            </>
          ) : (
            <>
              <span>Chia Sẻ</span>
              <i className="bi bi-send-fill text-sm"></i>
            </>
          )}
        </button>
      </div>

      {/* Sheet tùy chọn quyền riêng tư & hẹn giờ */}
      {showOptionsSheet && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end animate-fadeIn select-none">
          <div className="flex-1" onClick={() => setShowOptionsSheet(false)} />
          <div className="bg-[#151619] rounded-t-3xl border-t border-white/10 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-sm tracking-wide font-display">Cài Đặt Đăng Story</h3>
              <button
                type="button"
                onClick={() => setShowOptionsSheet(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-white/70 hover:text-white flex items-center justify-center"
              >
                <i className="bi bi-x-lg text-sm"></i>
              </button>
            </div>

            {/* Quyền xem */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider block">Ai có thể xem story này?</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { playTactileClickSound(); onChangePrivacy('public'); }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    privacy === 'public'
                      ? 'bg-teal-500/20 border-teal-400 text-white shadow-md'
                      : 'bg-[#1A1A1E] border-white/5 text-white/70 hover:border-white/20'
                  }`}
                >
                  <i className="bi bi-globe-asia-australia text-teal-400 text-base mb-1 block"></i>
                  <p className="text-xs font-bold">Công Khai</p>
                  <span className="text-[10px] text-white/50">Mọi người quanh radar</span>
                </button>

                <button
                  type="button"
                  onClick={() => { playTactileClickSound(); onChangePrivacy('friends'); }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    privacy === 'friends'
                      ? 'bg-purple-500/20 border-purple-400 text-white shadow-md'
                      : 'bg-[#1A1A1E] border-white/5 text-white/70 hover:border-white/20'
                  }`}
                >
                  <i className="bi bi-people-fill text-purple-400 text-base mb-1 block"></i>
                  <p className="text-xs font-bold">Bạn Bè</p>
                  <span className="text-[10px] text-white/50">Chỉ người trong friendlist</span>
                </button>
              </div>
            </div>

            {/* Hẹn giờ tự hủy */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider block">Thời gian tự hủy</label>
              <div className="grid grid-cols-4 gap-2">
                {EXPIRY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { playTactileClickSound(); onChangeExpiry(opt.value); }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                      expiryHours === opt.value
                        ? 'bg-white text-black border-white shadow-md'
                        : 'bg-[#1A1A1E] border-white/10 text-white/70 hover:border-white/30'
                    }`}
                  >
                    <i className={`bi ${opt.icon}`}></i>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowOptionsSheet(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
            >
              Áp Dụng
            </button>
          </div>
        </div>
      )}
    </>
  );
}
