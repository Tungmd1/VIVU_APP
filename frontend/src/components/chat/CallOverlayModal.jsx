import React from 'react';

export default function CallOverlayModal({ 
  callingState, 
  onEndCall 
}) {
  if (!callingState) return null;

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-xl flex flex-col justify-between items-center py-12 px-6 animate-fadeIn select-none">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-widest text-white/60 font-medium">
          {callingState.type === 'video' ? 'Cuộc gọi video VIVU' : 'Cuộc gọi thoại VIVU'}
        </span>
        <h2 className="text-2xl font-bold text-white">{callingState.name}</h2>
        <p className="text-sm text-[#00F5FF] font-mono">
          {callingState.duration > 0 
            ? `${String(Math.floor(callingState.duration / 60)).padStart(2, '0')}:${String(callingState.duration % 60).padStart(2, '0')}`
            : callingState.status}
        </p>
      </div>

      <div className="relative my-auto">
        <div className="absolute inset-0 rounded-full bg-[#00F5FF]/20 animate-ping"></div>
        <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[#00F5FF]/80 shadow-[0_0_30px_rgba(0,245,255,0.4)] relative z-10 p-1 bg-[#151619]">
          <img src={callingState.avatar} alt="" className="w-full h-full object-cover rounded-full" />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={() => alert('Đã bật/tắt micro')}
          className="w-14 h-14 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-all btn-spring"
          title="Tắt tiếng"
        >
          <i className="bi bi-mic-fill text-xl"></i>
        </button>

        <button 
          onClick={onEndCall}
          className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-all btn-spring"
          title="Kết thúc cuộc gọi"
        >
          <i className="bi bi-telephone-x-fill text-2xl"></i>
        </button>

        <button 
          onClick={() => alert('Đã chuyển đổi loa ngoài')}
          className="w-14 h-14 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-all btn-spring"
          title="Loa ngoài"
        >
          <i className="bi bi-volume-up-fill text-xl"></i>
        </button>
      </div>
    </div>
  );
}
