import React from 'react';
import { triggerCyberSplash } from '../../utils/cyberSplash';

/**
 * VivuButton - Hệ Thống Nút Bấm Bo Cạnh Chuẩn Hồng & Xanh Dương (Pink & Cyber Blue)
 * - Màu chủ đạo: Nút Hồng Neon (#FF2A85) bứt phá trên nền Xanh Dương (#0a0e1c, #00E5FF)
 * - Tất cả nút đều được bo tròn mềm mại (rounded-pill hoặc rounded-2xl)
 * - Khi click: Tự động kích hoạt hiệu ứng GSAP tia hạt & sóng xung kích Hồng - Xanh tóe ra
 * - Tuân thủ Rule 5 (100% Bootstrap Icons), Rule 7 (< 450 dòng)
 */
export default function VivuButton({
  children,
  variant = 'primary', // 'primary' (Hồng Neon) | 'secondary' (Xanh Kính) | 'danger' | 'success' | 'info' | 'outline-primary' | 'outline-secondary' | 'glass'
  size = 'md',         // 'sm' | 'md' | 'lg'
  pill = true,        // bo tròn kiểu viên thuốc (rounded-pill)
  icon = null,        // 'bi-plus-lg', 'bi-geo-alt-fill', etc.
  iconPosition = 'left',
  loading = false,
  glow = true,        // mặc định có ánh phát quang neon hồng/xanh
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...rest
}) {
  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  }[size] || '';

  const pillClass = pill ? 'rounded-pill' : 'rounded-2xl';
  const glowClass = glow ? 'btn-glow' : '';
  const variantClass = variant === 'glass' ? 'btn-secondary' : `btn-${variant}`;

  const handleClick = (e) => {
    if (disabled || loading) return;
    triggerCyberSplash(e);
    if (onClick) onClick(e);
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`btn ${variantClass} ${sizeClasses} ${pillClass} ${glowClass} ${className}`}
      {...rest}
    >
      {loading ? (
        <>
          <i className="bi bi-arrow-clockwise animate-spin text-sm"></i>
          {children && <span>{children}</span>}
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <i className={`bi ${icon}`}></i>}
          {children && <span>{children}</span>}
          {icon && iconPosition === 'right' && <i className={`bi ${icon}`}></i>}
        </>
      )}
    </button>
  );
}
