import React from 'react';
import { playTactileClickSound } from '../storyAudioEffects';

/**
 * CameraControlsBar - Thanh công cụ điều khiển Viewfinder
 * Flash, Grid 3x3, Hẹn giờ (Timer), Chuyển chế độ Text Story, Nút Đóng
 * 100% Bootstrap Icons, Rule 7 (< 200 dòng)
 */
export default function CameraControlsBar({
  flashOn,
  onToggleFlash,
  gridOn,
  onToggleGrid,
  timerSeconds,
  onChangeTimer,
  onSwitchToTextMode,
  isDualCam,
  onToggleDualCam,
  onClose
}) {
  const handleTimerCycle = () => {
    playTactileClickSound();
    if (timerSeconds === 0) onChangeTimer(3);
    else if (timerSeconds === 3) onChangeTimer(10);
    else onChangeTimer(0);
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-30 p-4 pt-safe flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
      {/* Nút đóng */}
      <button
        type="button"
        onClick={() => {
          playTactileClickSound();
          onClose();
        }}
        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-white active:scale-95 transition-transform"
        title="Đóng camera"
      >
        <i className="bi bi-x-lg text-lg"></i>
      </button>

      {/* Dải công cụ chính giữa */}
      <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
        {/* Flash */}
        <button
          type="button"
          onClick={() => {
            playTactileClickSound();
            onToggleFlash();
          }}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            flashOn ? 'bg-amber-400 text-black shadow-md shadow-amber-400/30' : 'text-white/80 hover:text-white'
          }`}
          title="Đèn trợ sáng màn hình"
        >
          <i className={`bi ${flashOn ? 'bi-lightning-fill' : 'bi-lightning'}`}></i>
        </button>

        {/* Lưới Grid */}
        <button
          type="button"
          onClick={() => {
            playTactileClickSound();
            onToggleGrid();
          }}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            gridOn ? 'bg-white text-black' : 'text-white/80 hover:text-white'
          }`}
          title="Lưới bố cục 3x3"
        >
          <i className="bi bi-grid-3x3"></i>
        </button>

        {/* Hẹn giờ Timer */}
        <button
          type="button"
          onClick={handleTimerCycle}
          className={`px-2.5 h-9 rounded-full flex items-center gap-1 font-mono text-xs font-bold transition-all ${
            timerSeconds > 0 ? 'bg-[#0A8395] text-white shadow-md' : 'text-white/80 hover:text-white'
          }`}
          title="Hẹn giờ chụp"
        >
          <i className="bi bi-stopwatch"></i>
          {timerSeconds > 0 ? `${timerSeconds}s` : ''}
        </button>

        {/* Chế độ Dual Camera (BeReal) */}
        <button
          type="button"
          onClick={() => {
            playTactileClickSound();
            onToggleDualCam();
          }}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            isDualCam ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'text-white/80 hover:text-white'
          }`}
          title="Chế độ Dual Camera 2 mặt"
        >
          <i className="bi bi-front"></i>
        </button>
      </div>

      {/* Nút chuyển sang chế độ Text / Gradient Story */}
      <button
        type="button"
        onClick={() => {
          playTactileClickSound();
          onSwitchToTextMode();
        }}
        className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform shadow-lg shadow-purple-500/20"
        title="Đăng Story chữ & màu nền"
      >
        <span className="font-serif font-black text-base">Aa</span>
      </button>
    </div>
  );
}

