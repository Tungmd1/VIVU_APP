import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';

/**
 * QuickSnapModal - Chụp ảnh post liền toàn màn hình phong cách Instagram / BeReal
 * Tích hợp Live Camera Stream, Filters, Chỉnh màu sắc & Đăng thẳng lên Story GPS
 * Tuân thủ Rule 5 (100% Bootstrap Icons), Rule 12 (Resend Dark Monochrome)
 */
export default function QuickSnapModal({
  isOpen,
  onClose,
  onSubmitStory,
  userLat,
  userLng
}) {
  const [step, setStep] = useState('CAPTURE'); // 'CAPTURE' | 'EDIT'
  const [facingMode, setFacingMode] = useState('user'); // 'user' | 'environment'
  const [capturedImage, setCapturedImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [showSliders, setShowSliders] = useState(false);
  
  // Các thông số chỉnh màu sắc
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [vignette, setVignette] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const nativeCameraInputRef = useRef(null);
  const [cameraError, setCameraError] = useState(false);

  // Danh sách Filter Presets
  const FILTERS = [
    { id: 'normal', name: 'Gốc', css: 'none' },
    { id: 'vintage', name: 'Vintage', css: 'sepia(0.45) contrast(1.1) brightness(0.95)' },
    { id: 'noir', name: 'B&W Noir', css: 'grayscale(1) contrast(1.2)' },
    { id: 'cyberpunk', name: 'Cyberpunk', css: 'hue-rotate(180deg) saturate(1.8) contrast(1.2)' },
    { id: 'sunset', name: 'Sunset', css: 'sepia(0.3) saturate(1.4) brightness(1.05)' },
    { id: 'cool', name: 'Cool Fresh', css: 'hue-rotate(-20deg) saturate(1.2) brightness(1.05)' },
    { id: 'vivid', name: 'Vivid Pop', css: 'saturate(2) contrast(1.15)' },
    { id: 'film90s', name: 'Film 90s', css: 'contrast(0.9) brightness(1.1) saturate(1.3) sepia(0.2)' }
  ];

  // Khởi động Camera khi mở modal ở bước CAPTURE
  useEffect(() => {
    if (!isOpen || step !== 'CAPTURE') {
      stopCamera();
      return;
    }

    startCamera();

    return () => stopCamera();
  }, [isOpen, step, facingMode]);

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
          videoRef.current.play().catch(() => {});
        }
      } else {
        setCameraError(true);
      }
    } catch (err) {
      console.warn('Không thể mở camera WebRTC (Origin HTTP không bảo mật hoặc bị chặn):', err);
      setCameraError(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Đổi camera trước / sau
  const handleToggleCamera = () => {
    if (cameraError) {
      nativeCameraInputRef.current?.click();
      return;
    }
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  // Chụp ảnh từ khung video stream hoặc mở Camera điện thoại
  const handleCapturePhoto = () => {
    // Nếu camera bị chặn hoặc màn hình không có stream (trên điện thoại duyệt qua HTTP LAN):
    // Tự động kích hoạt ngay Camera ứng dụng gốc của điện thoại để chụp ảnh độ nét cao!
    if (cameraError || !videoRef.current || !videoRef.current.srcObject) {
      nativeCameraInputRef.current?.click();
      return;
    }

    const video = videoRef.current;
    if (!video.videoWidth || !video.videoHeight) {
      nativeCameraInputRef.current?.click();
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 1280;
    const ctx = canvas.getContext('2d');

    // Nếu là camera trước thì lật gương tự nhiên
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    setStep('EDIT');
    stopCamera();
  };

  // Chọn ảnh có sẵn từ máy
  const handleSelectFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCapturedImage(ev.target.result);
        setStep('EDIT');
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  // Tính toán filter CSS kết hợp
  const getCombinedFilterStyle = () => {
    const presetCss = FILTERS.find(f => f.id === selectedFilter)?.css || 'none';
    const sliderCss = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    if (presetCss === 'none') return sliderCss;
    return `${presetCss} ${sliderCss}`;
  };

  // Đăng Story ngay lập tức
  const handlePublishStory = () => {
    if (!capturedImage) return;

    // Tạo canvas để xuất ảnh đã áp dụng filter và chỉnh màu
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      // Áp dụng bộ lọc lên canvas
      ctx.filter = getCombinedFilterStyle();
      ctx.drawImage(img, 0, 0);

      const finalDataUrl = canvas.toDataURL('image/jpeg', 0.9);

      onSubmitStory({
        title: caption.trim() || 'Khoảnh khắc vừa chụp',
        description: caption.trim() || 'Đã chụp và đăng tức thì từ VIVU Snap!',
        category: 'moment',
        image: finalDataUrl,
        privacy: 'public',
        realLat: userLat,
        realLng: userLng
      });

      confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });
      handleResetAndClose();
    };
    img.src = capturedImage;
  };

  const handleResetAndClose = () => {
    stopCamera();
    setStep('CAPTURE');
    setCapturedImage(null);
    setCaption('');
    setSelectedFilter('normal');
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setVignette(0);
    setShowSliders(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between overflow-hidden select-none animate-in fade-in duration-200">
      
      {/* 1. MÀN HÌNH CHỤP ẢNH (CAPTURE MODE) */}
      {step === 'CAPTURE' && (
        <div className="relative w-full h-full flex flex-col justify-between">
          
          {/* Header Bar */}
          <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
            <button
              onClick={handleResetAndClose}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center border border-white/20 active:scale-90 transition-all"
            >
              <i className="bi bi-x-lg text-lg font-bold"></i>
            </button>

            <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>VIVU SNAP LIVE</span>
            </div>

            <button
              onClick={handleToggleCamera}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center border border-white/20 active:scale-90 transition-all"
              title="Đổi camera trước / sau"
            >
              <i className="bi bi-arrow-repeat text-xl"></i>
            </button>
          </div>

          {/* Khung ngắm Camera trực tiếp */}
          <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />

            {/* Màn hình thông báo thông minh khi WebRTC Camera bị hạn chế trên Mobile HTTP */}
            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-gradient-to-b from-[#18191D] via-[#0E0E10] to-black">
                <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white mb-4 shadow-[0_0_25px_rgba(255,255,255,0.15)]">
                  <i className="bi bi-camera-fill text-3xl text-emerald-400 animate-pulse"></i>
                </div>
                <h3 className="text-lg font-extrabold text-white">Camera Điện Thoại Sẵn Sàng</h3>
                <p className="text-xs text-[#8E8E93] max-w-xs mt-1.5 mb-6">
                  Chạm nút bên dưới hoặc nút tròn ở đáy để mở máy ảnh điện thoại chụp ảnh sắc nét
                </p>
                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="px-6 py-3 rounded-full bg-white text-black font-extrabold text-sm flex items-center gap-2 active:scale-95 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.4)] hover:bg-[#EAEAEA]"
                >
                  <i className="bi bi-camera-fill text-base"></i>
                  <span>Mở Máy Ảnh Chụp Liền</span>
                </button>
              </div>
            )}

            {/* Khung viền ngắm BeReal */}
            {!cameraError && (
              <div className="absolute inset-4 rounded-3xl border-2 border-white/20 pointer-events-none"></div>
            )}
          </div>

          {/* Footer Bar: Nút chụp & Nút thư viện */}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-8 pb-10 flex items-center justify-around bg-gradient-to-t from-black/90 via-black/40 to-transparent">
            {/* Nút chọn ảnh từ thư viện */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white flex items-center justify-center active:scale-90 transition-all hover:bg-white/20"
              title="Chọn ảnh từ máy"
            >
              <i className="bi bi-image text-xl"></i>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSelectFile}
            />

            {/* Input camera gốc của điện thoại qua HTML5 Media Capture */}
            <input
              ref={nativeCameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleSelectFile}
            />

            {/* Nút bấm chụp tròn lớn ở giữa */}
            <button
              type="button"
              onClick={handleCapturePhoto}
              className="w-20 h-20 rounded-full p-1.5 bg-white/20 backdrop-blur-md border-2 border-white flex items-center justify-center active:scale-90 transition-all group"
              title={cameraError ? 'Bấm để mở Camera chụp ảnh' : 'Chụp ảnh ngay'}
            >
              <div className="w-full h-full rounded-full bg-white group-active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.8)] flex items-center justify-center text-black">
                {cameraError && <i className="bi bi-camera-fill text-xl"></i>}
              </div>
            </button>

            {/* Khoảng trống cân bằng */}
            <div className="w-12 h-12"></div>
          </div>

        </div>
      )}

      {/* 2. MÀN HÌNH CHỈNH SỬA & FILTER (EDIT MODE) */}
      {step === 'EDIT' && capturedImage && (
        <div className="relative w-full h-full flex flex-col justify-between bg-black">
          
          {/* Header Edit Bar */}
          <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent">
            <button
              onClick={() => setStep('CAPTURE')}
              className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 active:scale-90 transition-all"
              title="Chụp lại"
            >
              <i className="bi bi-arrow-left text-lg"></i>
            </button>

            {/* Nút bật/tắt công cụ chỉnh màu sắc */}
            <button
              onClick={() => setShowSliders(!showSliders)}
              className={`px-3 py-1.5 rounded-full backdrop-blur-md border text-xs font-bold flex items-center gap-1.5 transition-all ${
                showSliders
                  ? 'bg-white text-black border-white shadow-md'
                  : 'bg-black/60 text-white border-white/20 hover:bg-white/10'
              }`}
            >
              <i className="bi bi-sliders text-sm"></i>
              <span>Chỉnh màu sắc</span>
            </button>

            <button
              onClick={handleResetAndClose}
              className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 active:scale-90 transition-all"
            >
              <i className="bi bi-x-lg text-lg"></i>
            </button>
          </div>

          {/* Vùng xem trước ảnh kèm Filter & Sliders */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <img
              src={capturedImage}
              alt="Snap Preview"
              style={{ filter: getCombinedFilterStyle() }}
              className="w-full h-full object-cover transition-all duration-150"
            />

            {/* Hiệu ứng Vignette nếu có */}
            {vignette > 0 && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: `inset 0 0 ${vignette * 1.5}px rgba(0,0,0,${vignette / 100})`
                }}
              />
            )}

            {/* Ô nhập Caption nổi trên ảnh */}
            <div className="absolute top-20 left-4 right-4 z-20">
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Thêm caption story của bạn..."
                maxLength={80}
                className="w-full px-4 py-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/30 text-white placeholder-white/60 text-sm font-semibold outline-none shadow-2xl focus:border-white focus:bg-black/80 transition-all"
              />
            </div>

            {/* Bảng Sliders chỉnh màu sắc trượt lên nếu mở */}
            {showSliders && (
              <div className="absolute bottom-28 left-4 right-4 z-30 p-4 rounded-2xl bg-black/85 backdrop-blur-2xl border border-white/20 text-white space-y-3 animate-in slide-in-from-bottom-4 duration-200">
                <div className="flex items-center justify-between text-xs font-bold text-[#8E8E93] pb-1 border-b border-white/10">
                  <span>TÙY CHỈNH MÀU SẮC</span>
                  <button
                    onClick={() => {
                      setBrightness(100);
                      setContrast(100);
                      setSaturation(100);
                      setVignette(0);
                    }}
                    className="text-[10px] text-sky-400 hover:underline"
                  >
                    Đặt lại
                  </button>
                </div>

                {/* Độ sáng */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span>Độ sáng (Brightness)</span>
                    <span className="font-mono text-neutral-400">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-white"
                  />
                </div>

                {/* Độ tương phản */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span>Độ tương phản (Contrast)</span>
                    <span className="font-mono text-neutral-400">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-white"
                  />
                </div>

                {/* Độ bão hòa */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span>Độ bão hòa (Saturation)</span>
                    <span className="font-mono text-neutral-400">{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full accent-white"
                  />
                </div>

                {/* Vignette */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span>Mờ viền (Vignette)</span>
                    <span className="font-mono text-neutral-400">{vignette}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={vignette}
                    onChange={(e) => setVignette(Number(e.target.value))}
                    className="w-full accent-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Edit Bar: Thanh cuộn Filter & Nút Post */}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-6 bg-gradient-to-t from-black via-black/80 to-transparent space-y-3">
            {/* Thanh cuộn ngang các Filter Presets */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
              {FILTERS.map((filt) => (
                <button
                  key={filt.id}
                  onClick={() => setSelectedFilter(filt.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                    selectedFilter === filt.id
                      ? 'bg-white text-black font-extrabold shadow-lg scale-105'
                      : 'bg-black/60 text-white/80 border border-white/20 hover:bg-white/20'
                  }`}
                >
                  {filt.name}
                </button>
              ))}
            </div>

            {/* Nút Đăng Story Ngay */}
            <button
              onClick={handlePublishStory}
              className="w-full py-3.5 rounded-2xl bg-white hover:bg-neutral-200 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(255,255,255,0.3)] active:scale-98 transition-all"
            >
              <span>Đăng Story Ngay</span>
              <i className="bi bi-send-fill text-base"></i>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
