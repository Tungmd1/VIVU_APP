import { Platform, ViewStyle } from 'react-native';

/**
 * Vivu Design System Tokens (Dark Theme / Jagat Social Map Standard)
 * Màu chuẩn theo màn hình chính HomeScreen
 */
export const COLORS = {
  // Thương hiệu & Accent chính
  coral: '#FF4B72',
  primaryCoral: '#FF4B72',
  primary: '#FF4B72',
  primaryDark: '#E11D48',
  primaryLight: '#FF6B8B',
  primarySoft: 'rgba(255, 75, 114, 0.15)',
  primaryGradient: ['#FF6B8B', '#FF4B72', '#E11D48'] as const,

  // Accent phụ (Jagat Cyberpunk)
  cyan: '#38BDF8',
  purple: '#8B5CF6',
  secondaryPurple: '#8B5CF6',
  mint: '#10B981',
  accentMint: '#10B981',
  accentTeal: '#38BDF8',
  accentGreen: '#10B981',
  accentYellow: '#F59E0B',

  // Bề mặt & Nền Dark Canvas
  background: '#0B0F19', // Nền đen sâu chuẩn Jagat
  surface: '#0F172A',    // Card chính Slate 900
  card: '#0F172A',
  cardSecondary: '#1E293B', // Card phụ / Input Slate 800

  // Chữ & Độ tương phản cao
  text: '#FFFFFF',
  textDark: '#FFFFFF',    // Tiêu đề, chữ chính
  textPrimary: '#FFFFFF',
  textMedium: '#E2E8F0',  // Nội dung phụ
  textLight: '#94A3B8',   // Mô tả, gợi ý, phụ đề
  textMuted: '#64748B',   // Placeholder
  textWhite: '#FFFFFF',
  secondary: '#38BDF8',

  // Trạng thái & Viền
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  error: '#EF4444',
  border: '#1E293B',
  borderLight: '#334155',
  divider: '#1E293B',
};

const smShadow = Platform.select({
  web: { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.4)' } as ViewStyle,
  default: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
});

export const SHADOWS = {
  sm: smShadow,
  card: smShadow,
  md: Platform.select({
    web: { boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.5)' } as ViewStyle,
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 6,
    },
  }),
  glow: Platform.select({
    web: { boxShadow: '0px 0px 18px rgba(255, 75, 114, 0.45)' } as ViewStyle,
    default: {
      shadowColor: '#FF4B72',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
  }),
  purpleGlow: Platform.select({
    web: { boxShadow: '0px 0px 18px rgba(139, 92, 246, 0.45)' } as ViewStyle,
    default: {
      shadowColor: '#8B5CF6',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
  }),
};

export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
};

export const LAYOUT = {
  maxWidth: 1200,
  sidebarWidth: 280,
  contentMaxWidth: 800,
};

export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};

export const FONT_SIZES = {
  xs: 11,
  s: 13,
  m: 15,
  l: 18,
  xl: 22,
  xxl: 28,
};

export const BORDER_RADIUS = {
  s: 6,
  m: 12,
  l: 16,
  xl: 20,
  full: 9999,
};
