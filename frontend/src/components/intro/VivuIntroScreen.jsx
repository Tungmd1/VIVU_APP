import React, { useState, useEffect, useRef } from 'react';
import PlanetBackdrop, { PLANETS_DATA } from '../common/PlanetBackdrop.jsx';
import VivuLogo from '../common/VivuLogo.jsx';

/**
 * VivuIntroScreen - Màn hình Cinematic Không Gian Vũ Trụ Khởi Động VIVU
 * - Tự động phát clip nền Planet (Earth, Venus, Mars) crossfade mượt mà
 * - Đếm ngược 6 giây tự động chuyển mượt vào Bản Đồ 3D
 * - 2 slot hành tinh cut-out 2 bên cánh cho phép đổi góc nhìn tinh cầu tức thì
 * - Nút "VÀO BẢN ĐỒ NGAY" dạng Glossy Pill chuẩn pixel
 * - Nút "Bỏ qua" cho phép người dùng vào ngay tức thì
 * - Tuân thủ Rule 5 (100% Bootstrap Icons, No Unicode Emoji), Rule 7 (< 450 dòng)
 */
const PLANET_ORDER = ['earth', 'venus', 'mars'];

export default function VivuIntroScreen({ onFinished }) {
  const [activePlanet, setActivePlanet] = useState('earth');
  const [countdown, setCountdown] = useState(6);
  const [isExiting, setIsExiting] = useState(false);
  const hasFinishedRef = useRef(false);

  const activeIndex = PLANET_ORDER.indexOf(activePlanet);
  const leftPlanetKey = PLANET_ORDER[(activeIndex + 1) % 3];
  const rightPlanetKey = PLANET_ORDER[(activeIndex + 2) % 3];

  const activeData = PLANETS_DATA[activePlanet] || PLANETS_DATA.earth;
  const leftData = PLANETS_DATA[leftPlanetKey];
  const rightData = PLANETS_DATA[rightPlanetKey];

  // Đếm ngược 6s tự động vào bản đồ
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerExit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const triggerExit = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setIsExiting(true);
    setTimeout(() => {
      if (onFinished) onFinished();
    }, 450);
  };

  const switchPlanet = (planetId) => {
    if (PLANETS_DATA[planetId]) {
      setActivePlanet(planetId);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#04101f] text-white flex flex-col justify-between overflow-hidden select-none transition-opacity duration-500 ${
        isExiting ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100'
      }`}
      style={{
        fontFamily: "'Hanken Grotesk', system-ui, -apple-system, sans-serif"
      }}
    >
      {/* 0. Nền Video Không Gian Cinematic với Crossfade */}
      <PlanetBackdrop activePlanet={activePlanet} dimLevel="normal" />

      {/* 1. Header Bar: Brand + Quick Actions */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <VivuLogo size="sm" />
          <div className="flex items-center gap-2">
            <span
              className="text-lg sm:text-xl font-bold tracking-wider text-white"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              space<i className="text-[#5fd0e1] not-italic font-normal">edu</i>
            </span>
            <span className="hidden xs:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#79dce8]/15 text-[#79dce8] border border-[#79dce8]/30 font-mono">
              VIVU 3D
            </span>
          </div>
        </div>

        {/* Nút Bỏ qua / Đếm ngược */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-white/90 font-mono">
            <i className="bi bi-clock-history text-[#79dce8]"></i>
            <span>Vào bản đồ sau: <strong>{countdown}s</strong></span>
          </div>

          <button
            type="button"
            onClick={triggerExit}
            className="px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 backdrop-blur-md border border-white/30 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            title="Bỏ qua vào thẳng bản đồ"
          >
            <span>Bỏ qua</span>
            <i className="bi bi-arrow-right text-xs"></i>
          </button>
        </div>
      </header>

      {/* 2. Hero Content Trung Tâm */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto my-auto py-6">
        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-mono tracking-[0.28em] uppercase text-[#79dce8] font-bold mb-2">
          <span className="w-4 sm:w-8 h-[1px] bg-[#79dce8]/60"></span>
          <span>PLANET • {activeData.enName}</span>
          <span className="w-4 sm:w-8 h-[1px] bg-[#79dce8]/60"></span>
        </div>

        {/* Huge Serif Planet Name */}
        <h1
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal text-white tracking-wider my-1 sm:my-2 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
          style={{ fontFamily: "'Prata', Georgia, serif" }}
        >
          {activeData.name}
        </h1>

        <p className="text-xs sm:text-sm font-medium tracking-wide text-white/70 uppercase font-mono">
          {activeData.tagline}
        </p>

        {/* Cyan Rule */}
        <div className="w-14 sm:w-20 h-[2px] bg-[#79dce8] my-3 sm:my-5 rounded-full shadow-[0_0_12px_rgba(121,220,232,0.8)]"></div>

        {/* Lede Paragraph */}
        <p className="max-w-xl text-xs sm:text-sm md:text-base text-white/90 leading-relaxed font-light px-2 sm:px-4 drop-shadow-md">
          {activeData.lede}
        </p>

        {/* Glossy White Pill CTA Button */}
        <div className="mt-6 sm:mt-8">
          <button
            type="button"
            onClick={triggerExit}
            className="group px-7 sm:px-9 py-3 sm:py-3.5 rounded-full bg-white hover:bg-white/95 active:scale-95 text-[#071227] font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-[0_12px_40px_rgba(255,255,255,0.35),0_0_20px_rgba(121,220,232,0.3)] hover:shadow-[0_16px_50px_rgba(121,220,232,0.6)] flex items-center gap-2.5 mx-auto cursor-pointer"
          >
            <i className="bi bi-geo-alt-fill text-[#00838F] group-hover:scale-110 transition-transform"></i>
            <span>VÀO BẢN ĐỒ NGAY ({countdown}s)</span>
            <i className="bi bi-arrow-right text-[#071227] group-hover:translate-x-1 transition-transform"></i>
          </button>
        </div>
      </main>

      {/* 3. Slot Hành Tinh Hai Bên Cánh (Left & Right Flanking Cutouts) */}
      {/* Cánh Trái */}
      <aside className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
        <button
          type="button"
          onClick={() => switchPlanet(leftPlanetKey)}
          className="group relative flex flex-col items-center cursor-pointer p-2 transition-transform duration-300 hover:scale-110 active:scale-95"
          title={`Khám phá ${leftData.name}`}
        >
          <div className="relative w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 flex items-center justify-center">
            {/* Vòng hào quang sáng phía sau */}
            <div className="absolute inset-0 rounded-full bg-[#79dce8]/10 blur-md group-hover:bg-[#79dce8]/30 transition-all"></div>
            <img
              src={leftData.cutout}
              alt={leftData.name}
              className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)] transition-all group-hover:rotate-6"
            />
          </div>
          <span
            className="mt-1 text-[11px] sm:text-xs text-white/80 group-hover:text-white tracking-widest font-normal"
            style={{ fontFamily: "'Prata', Georgia, serif" }}
          >
            {leftData.enName}
          </span>
          <span className="text-[9px] text-[#79dce8] font-mono tracking-wider opacity-70 group-hover:opacity-100 flex items-center gap-1">
            <i className="bi bi-chevron-left text-[8px]"></i>
            Chuyển
          </span>
        </button>
      </aside>

      {/* Cánh Phải */}
      <aside className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
        <button
          type="button"
          onClick={() => switchPlanet(rightPlanetKey)}
          className="group relative flex flex-col items-center cursor-pointer p-2 transition-transform duration-300 hover:scale-110 active:scale-95"
          title={`Khám phá ${rightData.name}`}
        >
          <div className="relative w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 flex items-center justify-center">
            {/* Vòng hào quang sáng phía sau */}
            <div className="absolute inset-0 rounded-full bg-[#79dce8]/10 blur-md group-hover:bg-[#79dce8]/30 transition-all"></div>
            <img
              src={rightData.cutout}
              alt={rightData.name}
              className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)] transition-all group-hover:-rotate-6"
            />
          </div>
          <span
            className="mt-1 text-[11px] sm:text-xs text-white/80 group-hover:text-white tracking-widest font-normal"
            style={{ fontFamily: "'Prata', Georgia, serif" }}
          >
            {rightData.enName}
          </span>
          <span className="text-[9px] text-[#79dce8] font-mono tracking-wider opacity-70 group-hover:opacity-100 flex items-center gap-1">
            Chuyển
            <i className="bi bi-chevron-right text-[8px]"></i>
          </span>
        </button>
      </aside>

      {/* 4. Footer Bar: Bộ chọn 3 hành tinh + Tín hiệu radar sẵn sàng */}
      <footer className="relative z-20 w-full px-4 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-t from-black/80 to-transparent">
        {/* Tín hiệu GPS Ready */}
        <div className="flex items-center gap-2 text-[11px] text-white/70 font-mono">
          <span className="w-2 h-2 rounded-full bg-[#10FFA0] animate-pulse"></span>
          <span>Bản đồ Không gian 3D &amp; GPS Radar đã sẵn sàng</span>
        </div>

        {/* Bộ chỉ báo 3 hành tinh */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          {PLANET_ORDER.map((key) => {
            const p = PLANETS_DATA[key];
            const isActive = key === activePlanet;
            return (
              <button
                key={key}
                type="button"
                onClick={() => switchPlanet(key)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1 ${
                  isActive
                    ? 'bg-[#79dce8]/25 text-[#79dce8] font-bold border border-[#79dce8]/40 shadow-xs'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#79dce8]' : 'bg-white/30'}`}></span>
                <span>{p.enName}</span>
              </button>
            );
          })}
        </div>

        {/* Bản quyền */}
        <div className="hidden md:block text-[11px] text-white/40 font-mono">
          VIVU Web App © 2026
        </div>
      </footer>
    </div>
  );
}
