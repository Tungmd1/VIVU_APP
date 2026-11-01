/**
 * VIVU Animate UI & Motion Tokens
 * Tuân thủ quy chuẩn Motion & Animate UI (Spring-based, dứt khoát, tôn trọng prefers-reduced-motion)
 */

// 1. SPRING TOKENS CHUẨN ANIMATE UI
export const springTokens = {
  // Phản hồi thao tác nhấn nút, toggle, icon
  press: { type: 'spring', stiffness: 500, damping: 32 },
  // Modal, Dialog ở trung tâm màn hình
  dialog: { type: 'spring', stiffness: 380, damping: 28 },
  // Khay trượt đáy (Bottom Sheet), Drawer
  sheet: { type: 'spring', stiffness: 320, damping: 30 },
  // Bubble popup, tag mở rộng, tooltip
  pop: { type: 'spring', stiffness: 420, damping: 26 },
  // Tab indicator trượt qua lại
  indicator: { type: 'spring', stiffness: 450, damping: 35 }
};

// 2. TWEEN TOKENS
export const transitionTokens = {
  fade: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
  fadeSlow: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  dismiss: { duration: 0.14, ease: [0.4, 0, 1, 1] }
};

// 3. RECIPES CHO CUSTOM COMPONENTS
// A. Nút bấm (Button Press Props)
export const pressProps = {
  whileTap: { scale: 0.97 },
  transition: springTokens.press
};

export const cardPressProps = {
  whileTap: { scale: 0.985 },
  transition: springTokens.press
};

// B. Modal trung tâm (Centered Modal Variants)
export const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: springTokens.dialog 
  },
  exit: { 
    opacity: 0, 
    scale: 0.97, 
    y: 4, 
    transition: transitionTokens.dismiss 
  }
};

// C. Khay trượt đáy (Bottom Sheet Variants)
export const sheetVariants = {
  hidden: { opacity: 0, y: '100%' },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: springTokens.sheet 
  },
  exit: { 
    opacity: 0, 
    y: '100%', 
    transition: transitionTokens.dismiss 
  }
};

// D. Hộp thoại thông báo nổi (Toast / Notification Drop Variants)
export const toastVariants = {
  hidden: { opacity: 0, y: -16, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: springTokens.pop 
  },
  exit: { 
    opacity: 0, 
    y: -12, 
    scale: 0.96, 
    transition: transitionTokens.dismiss 
  }
};

// E. Kiểm tra người dùng có bật Giảm chuyển động (prefers-reduced-motion)
export function getShouldReduceMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
