import React from 'react';

/**
 * Component VivuLogo: Logo Thương Hiệu Chính Thức Của VIVU
 * Biểu tượng chữ 'V' cách điệu kết hợp ghim định vị bản đồ (Teardrop Pin)
 * với dải màu chuyển sắc Neon Cyan -> Coral trên nền đen sâu tối giản.
 */
export default function VivuLogo({
  size = 'md',
  showText = false,
  tagText = 'Social Map',
  className = '',
  imgClassName = '',
  useImage = false
}) {
  const sizeMap = {
    xs: { box: 'w-6 h-6', img: 'w-6 h-6', text: 'text-sm', tag: 'text-[9px]' },
    sm: { box: 'w-8 h-8', img: 'w-8 h-8', text: 'text-base', tag: 'text-[9px]' },
    md: { box: 'w-11 h-11', img: 'w-11 h-11', text: 'text-lg', tag: 'text-[10px]' },
    lg: { box: 'w-14 h-14', img: 'w-14 h-14', text: 'text-xl', tag: 'text-[10px]' },
    xl: { box: 'w-20 h-20', img: 'w-20 h-20', text: 'text-2xl', tag: 'text-xs' },
    '2xl': { box: 'w-28 h-28', img: 'w-28 h-28', text: 'text-3xl', tag: 'text-sm' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const renderSymbol = () => {
    if (useImage) {
      return (
        <img
          src="/vivu_logo.png"
          alt="VIVU Logo"
          className={`${currentSize.img} rounded-2xl object-contain shadow-[0_0_25px_rgba(0,240,255,0.25)] ${imgClassName}`}
        />
      );
    }

    return (
      <div className={`relative ${currentSize.box} flex items-center justify-center shrink-0`}>
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(0,240,255,0.35)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="vivuLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="40%" stopColor="#0EA5E9" />
              <stop offset="75%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#FF6B4A" />
            </linearGradient>
          </defs>

          {/* Nền đen sâu bo góc squircle thanh thoát */}
          <rect width="120" height="120" rx="28" fill="#0A0A0C" />

          {/* Biểu tượng chữ V lồng ghim bản đồ */}
          <g transform="translate(4, 2)">
            {/* Cánh trái chữ V */}
            <path
              d="M32 44 L41 44 L56 81 C55 83 51 86 48 86 C45 86 42 84 41 81 L32 44 Z"
              fill="url(#vivuLogoGradient)"
              stroke="#00F0FF"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />

            {/* Cánh phải chữ V uốn lượn thành Ghim Định Vị */}
            <path
              d="M48 85 C55 77 64 65 72 56 C79 48 81 39 77 31 C73 23 62 20 53 23 C44 26 39 34 40 43 C41 49 45 57 49 66 L55 80"
              fill="none"
              stroke="url(#vivuLogoGradient)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Tâm ghim bản đồ */}
            <circle cx="60" cy="38" r="7.5" fill="#0A0A0C" stroke="url(#vivuLogoGradient)" strokeWidth="4.5" />
          </g>
        </svg>
      </div>
    );
  };

  if (!showText) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {renderSymbol()}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {renderSymbol()}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black text-white tracking-tight ${currentSize.text}`}>
            VIVU
          </span>
          {tagText && (
            <span className={`${currentSize.tag} uppercase font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/15`}>
              {tagText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
