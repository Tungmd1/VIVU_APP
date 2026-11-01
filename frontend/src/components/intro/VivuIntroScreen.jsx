import React, { useRef, useState, useEffect } from 'react';

/**
 * VivuIntroScreen - Màn hình Video Intro VIVU Có Âm Thanh
 * - Tự động phát video vivu-intro-desktop.mp4 CÓ ÂM THANH (Unmuted Audio 100%)
 * - Bắt buộc xem hết video, không có nút bỏ qua theo yêu cầu người dùng
 * - Cung cấp nút Bật/Tắt âm lượng nhanh ở góc dưới
 * - Khi kết thúc: Tự động fade-out và gọi onFinished để điều hướng
 * - Tuân thủ Rule 5 (100% Bootstrap Icons), Rule 7 (< 450 dòng)
 */
export default function VivuIntroScreen({ onFinished }) {
  const videoRef = useRef(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = 1.0;
    video.muted = false;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Autoplay unmuted blocked by browser policy, attempting muted fallback:', err);
        // Fallback: Nếu trình duyệt vẫn hạn chế, phát muted và đánh dấu để người dùng bấm bật tiếng
        video.muted = true;
        setIsMuted(true);
        video.play().catch(playErr => {
          console.error('Video play error:', playErr);
        });
      });
    }
  }, []);

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      const nextState = !videoRef.current.muted;
      videoRef.current.muted = nextState;
      setIsMuted(nextState);
      if (!nextState) {
        videoRef.current.volume = 1.0;
      }
    }
  };

  const handleEnded = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onFinished) onFinished();
    }, 400); // 400ms fade transition
  };

  const handleError = () => {
    console.warn('Intro video error, proceeding to next screen...');
    if (onFinished) onFinished();
  };

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden transition-opacity duration-400 select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <video
        ref={videoRef}
        src="/videos/vivu-intro-desktop.mp4"
        autoPlay
        playsInline
        preload="auto"
        onEnded={handleEnded}
        onError={handleError}
        className="w-full h-full object-cover"
      />

      {/* Nút điều khiển âm lượng nhanh ở góc dưới */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={toggleMute}
          className="px-3.5 py-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
          title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
        >
          <i className={`bi ${isMuted ? 'bi-volume-mute-fill text-rose-400' : 'bi-volume-up-fill text-[#10FFA0]'} text-base`}></i>
          <span>{isMuted ? 'Bật âm thanh' : 'Âm thanh bật'}</span>
        </button>
      </div>
    </div>
  );
}

