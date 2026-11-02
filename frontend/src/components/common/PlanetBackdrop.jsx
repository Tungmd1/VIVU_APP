import React, { useEffect, useRef } from 'react';

/**
 * PlanetBackdrop - Nền video không gian tinh cầu cinematic (Earth, Venus, Mars)
 * - Tự động phát vòng lặp (muted, loop, playsinline, autoplay)
 * - Chuyển cảnh crossfade mượt mà giữa các hành tinh
 * - Fallback ảnh tĩnh poster tức thì
 * - Tương thích 100% với cả di động iOS/Android và máy tính Desktop
 */

export const PLANETS_DATA = {
  earth: {
    id: 'earth',
    name: 'TRÁI ĐẤT',
    enName: 'EARTH',
    tagline: 'Hành tinh xanh • Ngôi nhà kết nối VIVU',
    lede: 'Khám phá thế giới và những điều kỳ diệu quanh bạn trên hành tinh Trái Đất. Kết nối bạn bè, chia sẻ khoảnh khắc và khám phá địa điểm ngay bây giờ!',
    clip: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202422_3ffb4889-c520-432d-8458-038009eb40df.mp4',
    poster: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202133_508c64b8-a31e-4290-bdfc-1187df70e0a6.png',
    cutout: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202005_3346cc4d-ec3b-44ab-825c-b18e49f5021a.png'
  },
  venus: {
    id: 'venus',
    name: 'SAO KIM',
    enName: 'VENUS',
    tagline: 'Thế giới rực sáng • Ánh sáng bình minh',
    lede: 'Hành tinh sáng rực rỡ nhất trong bầu trời đêm, được bao phủ bởi những tầng mây sulfuric kỳ ảo. Một chân trời mới cho những hành trình khám phá!',
    clip: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202422_b211cd74-013b-4dd3-bfd0-64491d8696fa.mp4',
    poster: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202133_cf55d1d8-7b59-4a64-80da-d72052ae974e.png',
    cutout: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202012_640b239a-d08a-4200-adb2-741bbe129ac8.png'
  },
  mars: {
    id: 'mars',
    name: 'SAO HỎA',
    enName: 'MARS',
    tagline: 'Hành tinh đỏ • Chân trời tương lai',
    lede: 'Thế giới sa mạc đỏ rỉ sắt kỳ vĩ, nơi có đỉnh núi lửa Olympus Mons cao nhất thái dương hệ. Điểm hẹn kế tiếp của nhân loại!',
    clip: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202422_51eae59a-2459-4c84-907c-cc5edfe5fea7.mp4',
    poster: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202133_0ba6de7c-285d-43dc-b7ab-8c54c73707cb.png',
    cutout: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202018_3d559490-f613-4ed7-a3bb-3b7e9fc90fb8.png'
  }
};

export default function PlanetBackdrop({
  activePlanet = 'earth',
  className = '',
  dimLevel = 'normal' // 'none' | 'normal' | 'dark'
}) {
  const videoRefs = useRef({});
  const activeData = PLANETS_DATA[activePlanet] || PLANETS_DATA.earth;

  useEffect(() => {
    // Kích hoạt play cho video đang active, pause các video khác
    Object.keys(PLANETS_DATA).forEach((key) => {
      const vid = videoRefs.current[key];
      if (!vid) return;

      if (key === activePlanet) {
        if (!vid.src) {
          vid.src = PLANETS_DATA[key].clip;
          vid.load();
        }
        vid.play().catch((err) => {
          console.warn(`[PlanetBackdrop] Autoplay for ${key} paused:`, err.message);
        });
      } else {
        vid.pause();
      }
    });
  }, [activePlanet]);

  const overlayBg = {
    none: 'bg-transparent',
    normal: 'bg-gradient-to-b from-black/40 via-transparent to-black/70',
    dark: 'bg-black/60 backdrop-blur-xs'
  }[dimLevel] || 'bg-transparent';

  return (
    <div 
      className={`absolute inset-0 z-0 overflow-hidden bg-cover bg-center transition-all duration-700 ${className}`}
      style={{
        backgroundImage: `url('${activeData.poster}')`,
        backgroundColor: '#04101f'
      }}
    >
      {/* 3 Video Clones cho phép chuyển đổi ngay trong 1 frame */}
      {Object.values(PLANETS_DATA).map((p) => {
        const isActive = p.id === activePlanet;
        return (
          <video
            key={p.id}
            ref={(el) => { videoRefs.current[p.id] = el; }}
            src={p.id === 'earth' ? p.clip : undefined}
            data-src={p.clip}
            poster={p.poster}
            autoPlay={isActive}
            muted
            loop
            playsInline
            preload={p.id === 'earth' ? 'auto' : 'none'}
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300 ease-linear ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
          />
        );
      })}

      {/* Lớp phủ điện ảnh tăng độ đọc rõ cho text trên foreground */}
      <div className={`absolute inset-0 pointer-events-none ${overlayBg}`} />
    </div>
  );
}

