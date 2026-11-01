import React, { useState, useRef, useEffect } from 'react';
import CameraControlsBar from './CameraControlsBar';
import DualCameraOverlay from './DualCameraOverlay';
import { playTactileClickSound, playShutterSound, playCountdownBeep } from '../storyAudioEffects';

export const CAMERA_FILTER_PRESETS = [
  { id: 'normal', name: 'Gốc', css: 'none' },
  { id: 'vintage', name: 'Vintage', css: 'sepia(0.45) contrast(1.1) brightness(0.95)' },
  { id: 'noir', name: 'B&W Noir', css: 'grayscale(1) contrast(1.2)' },
  { id: 'cyberpunk', name: 'Cyberpunk', css: 'hue-rotate(180deg) saturate(1.8) contrast(1.2)' },
  { id: 'sunset', name: 'Sunset', css: 'sepia(0.3) saturate(1.4) brightness(1.05)' },
  { id: 'cool', name: 'Cool Fresh', css: 'hue-rotate(-20deg) saturate(1.2) brightness(1.05)' },
  { id: 'vivid', name: 'Vivid Pop', css: 'saturate(2) contrast(1.15)' },
  { id: 'film90s', name: 'Film 90s', css: 'contrast(0.9) brightness(1.1) saturate(1.3) sepia(0.2)' }
];

export default function CameraViewfinder({
  onPhotoCaptured,
  onSwitchToTextMode,
  onClose
}) {
  const [facingMode, setFacingMode] = useState('user'); // 'user' | 'environment'
  const [flashOn, setFlashOn] = useState(false);
  const [gridOn, setGridOn] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [isDualCam, setIsDualCam] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [cameraError, setCameraError] = useState(false);
  const [isCapturingDual, setIsCapturingDual] = useState(false);
  const [dualPhase, setDualPhase] = useState(null); // 'PRIMARY' | 'SECONDARY'
  const [firstCapturedImage, setFirstCapturedImage] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const nativeCameraInputRef = useRef(null);

  // Khởi động Camera stream
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    stopCamera();
    setCameraError(false);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1080 }, height: { ideal: 1920 } },
          audio: false
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } else {
        setCameraError(true);
      }
    } catch (err) {
      console.warn('[Camera] getUserMedia failed, fallback to native file input:', err);
      setCameraError(true);
    }
  };

  const handleFlipCamera = () => {
    playTactileClickSound();
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  // Chụp ảnh thực tế từ Video Stream lên Canvas
  const captureFrameFromVideo = () => {
    const video = videoRef.current;
    if (!video) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1080;
    canvas.height = video.videoHeight || 1920;
    const ctx = canvas.getContext('2d');

    // Áp dụng bộ lọc màu lên canvas
    const activeFilter = CAMERA_FILTER_PRESETS.find(f => f.id === selectedFilter);
    if (activeFilter && activeFilter.css !== 'none') {
      ctx.filter = activeFilter.css;
    }

    // Nếu là camera trước thì lật gương ngang tự nhiên
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.92);
  };

  // Kích hoạt tiến trình chụp (xử lý Timer + Dual Cam)
  const triggerCapture = () => {
    if (countdown !== null) return;

    if (timerSeconds > 0) {
      let count = timerSeconds;
      setCountdown(count);
      playCountdownBeep(false);

      const interval = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
          playCountdownBeep(false);
        } else {
          clearInterval(interval);
          setCountdown(null);
          playCountdownBeep(true);
          performInstantCapture();
        }
      }, 1000);
    } else {
      performInstantCapture();
    }
  };

  const performInstantCapture = async () => {
    // Hiệu ứng flash màn hình
    if (flashOn) {
      const flashEl = document.getElementById('camera-screen-flash');
      if (flashEl) {
        flashEl.style.opacity = '1';
        setTimeout(() => { flashEl.style.opacity = '0'; }, 150);
      }
    }

    playShutterSound();
    if (navigator.vibrate) navigator.vibrate(40);

    const shot1 = captureFrameFromVideo();
    if (!shot1) return;

    if (isDualCam && !isCapturingDual) {
      // Chế độ Dual Camera BeReal: Chụp xong mặt 1 -> chuyển camera chụp mặt 2
      setFirstCapturedImage(shot1);
      setIsCapturingDual(true);
      setDualPhase('SECONDARY');

      // Tự động lật camera đối diện
      setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));

      // Đếm ngược 1.2s chụp mặt 2
      setTimeout(() => {
        playShutterSound();
        if (navigator.vibrate) navigator.vibrate(40);
        const shot2 = captureFrameFromVideo();
        setIsCapturingDual(false);
        setDualPhase(null);

        onPhotoCaptured({
          mainImage: shot1,
          dualImage: shot2 || null,
          isDualCam: true,
          filterId: selectedFilter
        });
      }, 1200);
    } else {
      // Chụp đơn bình thường
      onPhotoCaptured({
        mainImage: shot1,
        dualImage: null,
        isDualCam: false,
        filterId: selectedFilter
      });
    }
  };

  // Chọn ảnh từ Gallery
  const handleSelectFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    playTactileClickSound();
    const reader = new FileReader();
    reader.onload = () => {
      onPhotoCaptured({
        mainImage: reader.result,
        dualImage: null,
        isDualCam: false,
        filterId: selectedFilter
      });
    };
    reader.readAsDataURL(file);
  };

  const currentFilterObj = CAMERA_FILTER_PRESETS.find(f => f.id === selectedFilter);

  return (
    <div className="relative w-full h-full bg-black select-none overflow-hidden flex flex-col justify-between">
      {/* Flash overlay trắng */}
      <div
        id="camera-screen-flash"
        className="absolute inset-0 z-50 bg-white pointer-events-none transition-opacity duration-150 opacity-0"
      />

      {/* Đếm ngược đếm to giữa màn hình */}
      {countdown !== null && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
          <span className="text-8xl font-black text-white font-mono drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] animate-ping">
            {countdown}
          </span>
        </div>
      )}

      {/* Thông báo Dual Camera Phase */}
      {isCapturingDual && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 rounded-full bg-purple-600/90 text-white text-xs font-bold font-mono tracking-wider shadow-lg flex items-center gap-2 animate-pulse">
          <i className="bi bi-camera-fill"></i>
          <span>ĐANG CHỤP MẶT 2 (DUAL BEREAL)...</span>
        </div>
      )}

      {/* Thanh công cụ đỉnh */}
      <CameraControlsBar
        flashOn={flashOn}
        onToggleFlash={() => setFlashOn(v => !v)}
        gridOn={gridOn}
        onToggleGrid={() => setGridOn(v => !v)}
        timerSeconds={timerSeconds}
        onChangeTimer={setTimerSeconds}
        onSwitchToTextMode={onSwitchToTextMode}
        isDualCam={isDualCam}
        onToggleDualCam={() => setIsDualCam(v => !v)}
        onClose={onClose}
      />

      {/* Viewfinder Video hoặc Fallback */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        {cameraError ? (
          <div className="p-6 text-center text-white/80 max-w-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/10 mx-auto flex items-center justify-center text-2xl text-amber-400">
              <i className="bi bi-camera-video-off"></i>
            </div>
            <p className="text-sm font-medium">Không thể mở luồng Camera trực tiếp (do chính sách HTTP mạng LAN hoặc thiết bị chưa cấp quyền).</p>
            <button
              type="button"
              onClick={() => nativeCameraInputRef.current?.click()}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold text-sm shadow-lg active:scale-95 transition-transform inline-flex items-center gap-2"
            >
              <i className="bi bi-camera-fill"></i>
              <span>Mở Camera Gốc Của Máy</span>
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className={`w-full h-full object-cover transition-all ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            style={{ filter: currentFilterObj?.css || 'none' }}
          />
        )}

        {/* Lưới Grid 3x3 */}
        {gridOn && !cameraError && (
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
            <div className="border-r border-b border-white/20"></div>
            <div className="border-r border-b border-white/20"></div>
            <div className="border-b border-white/20"></div>
            <div className="border-r border-b border-white/20"></div>
            <div className="border-r border-b border-white/20"></div>
            <div className="border-b border-white/20"></div>
            <div className="border-r border-white/20"></div>
            <div className="border-r border-white/20"></div>
            <div></div>
          </div>
        )}
      </div>

      {/* Dải chọn Filter xem trước live */}
      <div className="absolute bottom-28 left-0 right-0 z-30 px-4 py-2 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar pointer-events-auto">
        {CAMERA_FILTER_PRESETS.map(filter => (
          <button
            key={filter.id}
            type="button"
            onClick={() => {
              playTactileClickSound();
              setSelectedFilter(filter.id);
            }}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
              selectedFilter === filter.id
                ? 'bg-white text-black shadow-lg scale-105'
                : 'bg-black/50 backdrop-blur-md text-white/70 hover:text-white border border-white/10'
            }`}
          >
            {filter.name}
          </button>
        ))}
      </div>

      {/* Thanh điều khiển đáy: Thư viện, Nút Chụp Shutter, Lật Cam */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-6 pb-safe flex items-center justify-around bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-auto">
        {/* Nút thư viện ảnh */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform hover:bg-white/25"
          title="Chọn ảnh từ thiết bị"
        >
          <i className="bi bi-images text-xl"></i>
        </button>

        {/* Nút chụp Shutter tròn phong cách Pro Camera */}
        <button
          type="button"
          onClick={triggerCapture}
          className="relative w-20 h-20 rounded-full flex items-center justify-center active:scale-90 transition-transform group"
          title="Chụp ảnh"
        >
          <div className="absolute inset-0 rounded-full border-4 border-white/90 group-hover:border-white transition-colors"></div>
          <div className="w-16 h-16 rounded-full bg-white shadow-xl group-hover:scale-95 transition-transform"></div>
        </button>

        {/* Nút lật camera trước / sau */}
        <button
          type="button"
          onClick={handleFlipCamera}
          className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform hover:bg-white/25"
          title="Lật camera"
        >
          <i className="bi bi-arrow-repeat text-2xl"></i>
        </button>
      </div>

      {/* Thẻ input chọn file ẩn */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleSelectFile}
        className="hidden"
      />

      {/* Thẻ input native camera an toàn cho mạng LAN (Rule 18) */}
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleSelectFile}
        className="hidden"
      />
    </div>
  );
}

