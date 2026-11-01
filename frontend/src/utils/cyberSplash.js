import { gsap } from 'gsap';

/**
 * cyberSplash - Hiệu ứng mô phỏng tia hạt và sóng xung kích Hồng & Xanh (Cyber Splash)
 * - Tối ưu 60fps chuẩn GSAP Performance: chỉ animate transform (x, y, scale) và opacity
 * - Màu chủ đạo: Hồng Neon (#FF2A85, #FF539A) và Xanh Dương / Cyan (#00E5FF, #4BA5FF)
 * - Tự động dọn dẹp DOM ngay sau khi kết thúc, không rò rỉ bộ nhớ
 */
const SPLASH_COLORS = [
  '#FF2A85', // Hot Neon Pink
  '#00E5FF', // Electric Cyan
  '#FF539A', // Vibrant Rose Pink
  '#38BDF8', // Sky Cyan Blue
  '#FF007F', // Deep Pink
  '#00F0FF', // Bright Cyan
];

export function triggerCyberSplash(event, customOrigin = null) {
  if (typeof document === 'undefined') return;

  // 1. Xác định tọa độ bùng nổ (Click X, Y hoặc tâm của phần tử)
  let originX = 0;
  let originY = 0;

  if (customOrigin && typeof customOrigin.x === 'number') {
    originX = customOrigin.x;
    originY = customOrigin.y;
  } else if (event) {
    if (event.clientX && event.clientY && event.clientX !== 0 && event.clientY !== 0) {
      originX = event.clientX;
      originY = event.clientY;
    } else {
      const target = event.currentTarget || event.target;
      if (target && typeof target.getBoundingClientRect === 'function') {
        const rect = target.getBoundingClientRect();
        originX = rect.left + rect.width / 2;
        originY = rect.top + rect.height / 2;
      }
    }
  }

  if (originX === 0 && originY === 0) return;

  // 2. Tạo container chứa các hạt bắn (Pointer-events: none)
  const container = document.createElement('div');
  container.className = 'cyber-splash-container';
  container.style.cssText = `
    position: fixed;
    left: ${originX}px;
    top: ${originY}px;
    width: 0;
    height: 0;
    pointer-events: none;
    z-index: 999999;
  `;
  document.body.appendChild(container);

  // 3. Tạo vòng sóng xung kích kép (Shockwave Ripple: Hồng & Xanh)
  const waveRing = document.createElement('div');
  waveRing.style.cssText = `
    position: absolute;
    left: 0;
    top: 0;
    width: 14px;
    height: 14px;
    margin-left: -7px;
    margin-top: -7px;
    border-radius: 50%;
    border: 2px solid #00E5FF;
    box-shadow: 0 0 16px #FF2A85, inset 0 0 10px #00E5FF;
    pointer-events: none;
    will-change: transform, opacity;
  `;
  container.appendChild(waveRing);

  // 4. Tạo 14 - 18 hạt neon bùng tỏa
  const particleCount = 16;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    const color = SPLASH_COLORS[i % SPLASH_COLORS.length];
    const size = Math.round(gsap.utils.random(4.5, 7.5));
    const isDiamond = i % 3 === 0;

    p.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      width: ${size}px;
      height: ${size}px;
      margin-left: -${size / 2}px;
      margin-top: -${size / 2}px;
      background-color: ${color};
      border-radius: ${isDiamond ? '2px' : '50%'};
      transform: ${isDiamond ? 'rotate(45deg)' : 'none'};
      box-shadow: 0 0 10px ${color}, 0 0 4px #ffffff;
      pointer-events: none;
      will-change: transform, opacity;
    `;
    container.appendChild(p);
    particles.push({
      el: p,
      index: i,
    });
  }

  // 5. Timeline chuyển động GSAP cực mượt
  const tl = gsap.timeline({
    onComplete: () => {
      container.remove();
    }
  });

  // Hoạt cảnh sóng xung kích
  tl.fromTo(
    waveRing,
    { scale: 0.3, opacity: 0.95 },
    { scale: 3.2, opacity: 0, duration: 0.42, ease: 'power2.out' },
    0
  );

  // Hoạt cảnh tung tóe các tia hạt
  particles.forEach(({ el, index }) => {
    const angle = (index / particleCount) * Math.PI * 2 + gsap.utils.random(-0.25, 0.25);
    const distance = gsap.utils.random(35, 75);
    const targetX = Math.cos(angle) * distance;
    const targetY = Math.sin(angle) * distance;
    const duration = gsap.utils.random(0.38, 0.58);

    tl.to(
      el,
      {
        x: targetX,
        y: targetY,
        scale: gsap.utils.random(0.1, 0.3),
        opacity: 0,
        duration: duration,
        ease: 'power3.out',
      },
      0
    );
  });
}

/**
 * initGlobalCyberSplash - Khởi tạo bộ bắt sự kiện click & pointerdown toàn cục trong giai đoạn Capture
 * Bất kỳ button hoặc phần tử tương tác nào được ấn sẽ tự động kích hoạt tia hạt tóe màu Hồng & Xanh
 * Kể cả khi component con có gọi e.stopPropagation(), giai đoạn Capture vẫn đảm bảo 100% kích hoạt!
 */
export function initGlobalCyberSplash() {
  if (typeof document === 'undefined') return;

  let lastSplashTime = 0;

  const handleSplash = (e) => {
    // Chống kích hoạt đúp trong khoảng 80ms giữa pointerdown và click
    const now = Date.now();
    if (now - lastSplashTime < 80) return;

    const targetButton = e.target.closest(
      'button, .btn, [role="button"], input[type="submit"], input[type="button"], ' +
      '.cursor-pointer, [data-action], [data-page], .btn-primary, .btn-secondary, ' +
      '.nav-item, .nearby-person, .map-control, .icon-button, .chip-select button, .text-button'
    );

    if (targetButton) {
      lastSplashTime = now;
      triggerCyberSplash(e);
    }
  };

  // Lắng nghe ở giai đoạn Capture (capture: true) để bắt trước khi bất kỳ child nào gọi stopPropagation()!
  document.addEventListener('pointerdown', handleSplash, { capture: true, passive: true });
  document.addEventListener('click', handleSplash, { capture: true, passive: true });
}

