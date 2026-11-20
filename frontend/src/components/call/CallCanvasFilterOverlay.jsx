import React, { useEffect, useRef } from 'react';

/**
 * CallCanvasFilterOverlay - Bộ lọc Canvas AR tương tác thời gian thực
 * Vẽ trực tiếp hiệu ứng AR lên khung hình Video: Tai thỏ VIVU, Kính râm Cyberpunk, Vương miện, Mịn da
 * Tự động tắt requestAnimationFrame khi filter = 'none' để tiết kiệm pin tối đa
 * Tuân thủ Rule 7 (< 250 dòng)
 */
export const AR_FILTERS = [
  { id: 'none', label: 'Tắt lọc', icon: 'bi-slash-circle' },
  { id: 'bunny', label: 'Tai Thỏ', icon: 'bi-emoji-smile-fill' },
  { id: 'glasses', label: 'Kính Ngầu', icon: 'bi-sunglasses' },
  { id: 'crown', label: 'Vương Miện', icon: 'bi-award-fill' },
  { id: 'glow', label: 'Mịn Da', icon: 'bi-magic' }
];

export default function CallCanvasFilterOverlay({
  filterType = 'none',
  className = ''
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (filterType === 'none') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let animId = null;
    let frame = 0;

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // 1. BỘ LỌC TAI THỎ VIVU (Bunny Ears & Blush)
      if (filterType === 'bunny') {
        const wiggleL = Math.sin(frame * 0.08) * 6;
        const wiggleR = Math.cos(frame * 0.08) * 6;
        const headCenterX = w / 2;
        const headTopY = h * 0.22;

        ctx.save();
        // Tai trái
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(headCenterX - w * 0.16, headTopY - h * 0.12 + wiggleL, w * 0.065, h * 0.14, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Lòng tai trái hồng
        ctx.fillStyle = '#FF8DA1';
        ctx.beginPath();
        ctx.ellipse(headCenterX - w * 0.16, headTopY - h * 0.12 + wiggleL, w * 0.035, h * 0.09, -0.15, 0, Math.PI * 2);
        ctx.fill();

        // Tai phải
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(headCenterX + w * 0.16, headTopY - h * 0.12 + wiggleR, w * 0.065, h * 0.14, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Lòng tai phải hồng
        ctx.fillStyle = '#FF8DA1';
        ctx.beginPath();
        ctx.ellipse(headCenterX + w * 0.16, headTopY - h * 0.12 + wiggleR, w * 0.035, h * 0.09, 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Má hồng dễ thương hai bên
        const blushOpacity = 0.45 + Math.sin(frame * 0.05) * 0.15;
        ctx.fillStyle = `rgba(255, 42, 133, ${blushOpacity})`;
        ctx.beginPath();
        ctx.ellipse(headCenterX - w * 0.22, headTopY + h * 0.18, w * 0.07, h * 0.035, 0, 0, Math.PI * 2);
        ctx.ellipse(headCenterX + w * 0.22, headTopY + h * 0.18, w * 0.07, h * 0.035, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 2. BỘ LỌC KÍNH RÂM CYBERPUNK (Thug Life Sunglasses)
      else if (filterType === 'glasses') {
        const cx = w / 2;
        const cy = h * 0.38 + Math.sin(frame * 0.04) * 3;
        const gw = w * 0.48;
        const gh = h * 0.09;

        ctx.save();
        // Gọng kính đen tuyền
        ctx.fillStyle = '#08080C';
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 2.5;

        // Mắt kính trái
        ctx.beginPath();
        ctx.roundRect(cx - gw / 2, cy - gh / 2, gw * 0.44, gh, 8);
        ctx.fill();
        ctx.stroke();

        // Mắt kính phải
        ctx.beginPath();
        ctx.roundRect(cx + gw * 0.06, cy - gh / 2, gw * 0.44, gh, 8);
        ctx.fill();
        ctx.stroke();

        // Cầu nối giữa 2 mắt kính
        ctx.beginPath();
        ctx.rect(cx - gw * 0.07, cy - gh * 0.2, gw * 0.14, gh * 0.4);
        ctx.fill();
        ctx.stroke();

        // Vệt phản chiếu ánh neon lướt qua mắt kính
        const shineOffset = (frame * 4) % (gw * 1.5) - gw * 0.5;
        ctx.fillStyle = 'rgba(0, 229, 255, 0.65)';
        ctx.beginPath();
        ctx.ellipse(cx - gw * 0.28 + shineOffset * 0.3, cy - gh * 0.1, gw * 0.08, gh * 0.2, 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 3. BỘ LỌC VƯƠNG MIỆN HOÀNG GIA (Golden Royal Crown)
      else if (filterType === 'crown') {
        const cx = w / 2;
        const cy = h * 0.16 + Math.sin(frame * 0.06) * 4;
        const cw = w * 0.36;
        const ch = h * 0.11;

        ctx.save();
        // Vương miện vàng gold hoàng gia
        const crownGrad = ctx.createLinearGradient(cx - cw / 2, cy, cx + cw / 2, cy + ch);
        crownGrad.addColorStop(0, '#FFE066');
        crownGrad.addColorStop(0.5, '#F59E0B');
        crownGrad.addColorStop(1, '#D97706');

        ctx.fillStyle = crownGrad;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(cx - cw / 2, cy + ch);
        ctx.lineTo(cx - cw / 2, cy + ch * 0.3);
        ctx.lineTo(cx - cw * 0.25, cy + ch * 0.65);
        ctx.lineTo(cx, cy); // Chóp giữa cao nhất
        ctx.lineTo(cx + cw * 0.25, cy + ch * 0.65);
        ctx.lineTo(cx + cw / 2, cy + ch * 0.3);
        ctx.lineTo(cx + cw / 2, cy + ch);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 3 viên hồng ngọc đính ở 3 chóp
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(cx - cw / 2, cy + ch * 0.28, 5, 0, Math.PI * 2);
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.arc(cx + cw / 2, cy + ch * 0.28, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 4. BỘ LỌC MỊN DA ĐIỆN ẢNH (Beauty Glow Soft Lighting)
      else if (filterType === 'glow') {
        ctx.save();
        // Ánh sáng hồng ngọc và lục lam nhẹ ở 4 góc
        const glowGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.65);
        glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
        glowGrad.addColorStop(0.7, 'rgba(255, 42, 133, 0.12)');
        glowGrad.addColorStop(1, 'rgba(0, 229, 255, 0.18)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [filterType]);

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={640}
      className={`absolute inset-0 w-full h-full pointer-events-none z-10 ${className}`}
    />
  );
}
