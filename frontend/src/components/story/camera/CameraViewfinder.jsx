import React, { useState, useRef, useEffect } from 'react';
import DualCameraOverlay from './DualCameraOverlay';
import CameraRightToolbar from './CameraRightToolbar';
import CameraBottomBar from './CameraBottomBar';
import { CAMERA_FILTER_PRESETS } from './cameraPresets';
import { playTactileClickSound, playShutterSound, playCountdownBeep } from '../storyAudioEffects';

export { CAMERA_FILTER_PRESETS };

/**
 * CameraViewfinder - Giao Diện Story Camera Chuẩn Instagram 1:1
 * - Đỉnh: [X] Đóng (trái), Flash trợ sáng (giữa), Hẹn giờ & Cài đặt (phải)
 * - Cột phải: CameraRightToolbar (Tạo [Aa], Boomerang [∞], Hiệu ứng [✿], Mũi tên [⌄], Nhạc [♫], Nhãn dán [☺])
 * - Đáy: CameraBottomBar (Nút Shutter viền kép, Bong bóng bộ lọc, Thư viện, Mode BÀI VIẾT/TIN/THƯỚC PHIM, Lật Camera)
 * Rule 5 (100% Bootstrap Icons), Rule 7 (< 450 dòng), Rule 18 (LAN fallback)
 */
export default function CameraViewfinder({
  onPhotoCaptured,
  onSwitchToTextMode,
  onOpenMusicPicker,
  onOpenStickerPicker,
  selectedSong,
  onClose
}) {
  const [facingMode, setFacingMode] = useState('user');
  const [flashOn, setFlashOn] = useState(false);
  const [gridOn, setGridOn] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [isDualCam, setIsDualCam] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [cameraError, setCameraError] = useState(false);
  const [isCapturingDual, setIsCapturingDual] = useState(false);
  const [dualPhase, setDualPhase] = useState(null);
  const [firstCapturedImage, setFirstCapturedImage] = useState(null);
  const [activeStoryMode, setActiveStoryMode] = useState('STORY'); // 'POST' | 'STORY' | 'REEL'
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const nativeCameraInputRef = useRef(null);

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
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(true);
        return;
      }
      let stream = null;
      try {
        const constraints = {
          video: facingMode ? { facingMode: { ideal: facingMode } } : true,
          audio: false
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err1) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        } catch (err2) {
          console.warn('[Camera] getUserMedia fallback note:', err2);
        }
      }

      if (stream) {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } else {
        setCameraError(true);
      }
    } catch (err) {
      console.warn('[Camera] Fallback file input mode:', err);
      setCameraError(true);
    }
  };

  const handleFlipCamera = () => {
    playTactileClickSound();
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  const captureFrameFromVideo = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1080;
    canvas.height = video.videoHeight || 1920;
    const ctx = canvas.getContext('2d');

    const activeFilter = CAMERA_FILTER_PRESETS.find(f => f.id === selectedFilter);
    if (activeFilter && activeFilter.css !== 'none') {
      ctx.filter = activeFilter.css;
    }

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.88);
  };

  const executeCapture = () => {
    // Nếu camera chưa mở hoặc thiết bị không hỗ trợ getUserMedia -> Mở camera gốc hoặc thư viện ảnh mượt mà
    if (cameraError || !streamRef.current) {
      if (nativeCameraInputRef.current) {
        nativeCameraInputRef.current.click();
      } else if (fileInputRef.current) {
        fileInputRef.current.click();
      }
      return;
    }

    playShutterSound();
    if (navigator.vibrate) navigator.vibrate(60);

    if (isDualCam) {
      const primaryShot = captureFrameFromVideo();
      setFirstCapturedImage(primaryShot);
      setIsCapturingDual(true);
      setDualPhase('SECONDARY');
      setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));

      setTimeout(() => {
        const secondaryShot = captureFrameFromVideo();
        setIsCapturingDual(false);
        setDualPhase(null);
        if (onPhotoCaptured) {
          onPhotoCaptured({
            mainImage: primaryShot,
            dualImage: secondaryShot,
            isDualCam: true,
            filterId: selectedFilter
          });
        }
      }, 1400);
    } else {
      const mainImage = captureFrameFromVideo();
      if (mainImage && onPhotoCaptured) {
        onPhotoCaptured({
          mainImage,
          dualImage: null,
          isDualCam: false,
          filterId: selectedFilter
        });
      } else {
        fileInputRef.current?.click();
      }
    }
  };

  const triggerCapture = () => {
    playTactileClickSound();
    if (timerSeconds > 0 && !cameraError) {
      let count = timerSeconds;
      setCountdown(count);
      playCountdownBeep();
      const interval = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
          playCountdownBeep();
        } else {
          clearInterval(interval);
          setCountdown(null);
          executeCapture();
        }
      }, 1000);
    } else {
      executeCapture();
    }
  };

  const handleSelectFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    playTactileClickSound();
    const reader = new FileReader();
    reader.onload = () => {
      if (onPhotoCaptured) {
        onPhotoCaptured({
          mainImage: reader.result,
          dualImage: null,
          isDualCam: false,
          filterId: selectedFilter
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleNextFilter = () => {
    const curIdx = CAMERA_FILTER_PRESETS.findIndex(f => f.id === selectedFilter);
    const nextIdx = (curIdx + 1) % CAMERA_FILTER_PRESETS.length;
    setSelectedFilter(CAMERA_FILTER_PRESETS[nextIdx].id);
  };

  const handleChangeStoryMode = (mode) => {
    setActiveStoryMode(mode);
    if (mode === 'POST' && onSwitchToTextMode) {
      onSwitchToTextMode();
    } else if (mode === 'REEL' && onOpenMusicPicker) {
      onOpenMusicPicker();
    }
  };

  const currentFilterObj = CAMERA_FILTER_PRESETS.find(f => f.id === selectedFilter);

  return (
    <div className="relative w-full h-full bg-black flex flex-col justify-between overflow-hidden select-none font-sans">
      
      {/* 1. MÀN HÌNH CAMERA VIEWFINDER (CHUẨN STUDIO ĐEN TỐI GIẢN) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden bg-black">
        {!cameraError ? (
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className={`w-full h-full object-cover transition-all ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            style={{ filter: currentFilterObj?.css || 'none' }}
          />
        ) : (
          /* Phông nền Studio tối giản chuẩn Instagram khi chưa có camera stream */
          <div className="w-full h-full bg-gradient-to-b from-[#131418] via-black to-[#0e0f13] flex items-center justify-center relative">
            <div className="w-40 h-40 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center">
              <i className="bi bi-camera text-4xl text-white/10"></i>
            </div>
          </div>
        )}

        {/* Lưới Grid 3x3 */}
        {gridOn && !cameraError && (
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/15">
            <div className="border-r border-b border-white/15"></div>
            <div className="border-r border-b border-white/15"></div>
            <div className="border-b border-white/15"></div>
            <div className="border-r border-b border-white/15"></div>
            <div className="border-r border-b border-white/15"></div>
            <div className="border-b border-white/15"></div>
            <div className="border-r border-b border-white/15"></div>
            <div className="border-r border-b border-white/15"></div>
            <div></div>
          </div>
        )}

        {flashOn && <div className="absolute inset-0 bg-white/80 pointer-events-none transition-opacity duration-300"></div>}

        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
            <span className="text-8xl font-black text-white font-mono animate-ping drop-shadow-2xl">{countdown}</span>
          </div>
        )}

        {isCapturingDual && (
          <DualCameraOverlay firstImage={firstCapturedImage} phase={dualPhase} />
        )}
      </div>

      {/* 2. THANH CÔNG CỤ ĐỈNH (TOP BAR CHUẨN 100% ẢNH 1 INSTAGRAM) */}
      <div className="relative z-30 pt-4 px-4 flex items-center justify-between pointer-events-auto">
        {/* Nút [X] Đóng */}
        <button
          type="button"
          onClick={() => {
            playTactileClickSound();
            if (onClose) onClose();
          }}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform cursor-pointer"
          title="Đóng Story Studio"
        >
          <i className="bi bi-x-lg text-lg"></i>
        </button>

        {/* Nút Flash trợ sáng ở tâm */}
        <button
          type="button"
          onClick={() => {
            playTactileClickSound();
            setFlashOn(v => !v);
          }}
          className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer ${
            flashOn ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/40' : 'bg-black/40 border border-white/20 text-white'
          }`}
          title="Bật/Tắt Flash"
        >
          <i className={`bi ${flashOn ? 'bi-lightning-fill' : 'bi-lightning-slash'} text-lg`}></i>
        </button>

        {/* Nút Cài đặt / Hẹn giờ bên phải */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playTactileClickSound();
              setTimerSeconds(s => (s === 0 ? 3 : s === 3 ? 10 : 0));
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all cursor-pointer ${
              timerSeconds > 0 ? 'bg-[#10FFA0] text-black border-[#10FFA0] font-bold text-xs' : 'bg-black/40 border-white/20 text-white'
            }`}
            title="Hẹn giờ"
          >
            {timerSeconds > 0 ? <span className="font-mono text-xs">{timerSeconds}s</span> : <i className="bi bi-stopwatch text-base"></i>}
          </button>
          <button
            type="button"
            onClick={() => {
              playTactileClickSound();
              setGridOn(v => !v);
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all cursor-pointer ${
              gridOn ? 'bg-white text-black border-white' : 'bg-black/40 border-white/20 text-white'
            }`}
            title="Cài đặt lưới"
          >
            <i className="bi bi-gear-wide-connected text-base"></i>
          </button>
        </div>
      </div>

      {/* 3. CỘT CÔNG CỤ BÊN PHẢI (CHUẨN 100% ẢNH 1 INSTAGRAM) */}
      <CameraRightToolbar
        onSwitchToTextMode={onSwitchToTextMode}
        isDualCam={isDualCam}
        onToggleDualCam={() => setIsDualCam(prev => !prev)}
        selectedFilter={selectedFilter}
        onNextFilter={handleNextFilter}
        isToolbarExpanded={isToolbarExpanded}
        onToggleExpand={() => setIsToolbarExpanded(v => !v)}
        selectedSong={selectedSong}
        onOpenMusicPicker={onOpenMusicPicker}
        onOpenStickerPicker={onOpenStickerPicker}
      />

      {/* 4. KHU VỰC ĐIỀU KHIỂN ĐÁY (CHUẨN 100% ẢNH 1 INSTAGRAM) */}
      <CameraBottomBar
        onTriggerCapture={triggerCapture}
        filterPresets={CAMERA_FILTER_PRESETS}
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
        onOpenGallery={() => fileInputRef.current?.click()}
        activeStoryMode={activeStoryMode}
        onChangeStoryMode={handleChangeStoryMode}
        onFlipCamera={handleFlipCamera}
      />

      {/* Thẻ input chọn file ẩn */}
      <input ref={fileInputRef} type="file" accept="image/*" aria-label="Chọn ảnh từ thư viện thiết bị" onChange={handleSelectFile} className="hidden" />

      {/* Thẻ input native camera an toàn cho mạng LAN (Rule 18) */}
      <input ref={nativeCameraInputRef} type="file" accept="image/*" capture="environment" aria-label="Chụp ảnh trực tiếp từ máy ảnh thiết bị" onChange={handleSelectFile} className="hidden" />
    </div>
  );
}
