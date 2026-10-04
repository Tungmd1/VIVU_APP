import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';

/**
 * LoadingSkeleton: Khung xương tải trang mềm mại (không khóa toàn màn hình)
 * Tuân thủ Mục 9: Trạng thái và hành vi chuẩn
 */
export const LoadingSkeleton: React.FC<{
  count?: number;
  height?: number;
  style?: ViewStyle;
}> = ({ count = 3, height = 110, style }) => {
  const [shimmerAnim] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [shimmerAnim]);

  return (
    <View style={[styles.skeletonContainer, style]}>
      {Array.from({ length: count }).map((_, idx) => (
        <Animated.View
          key={idx}
          style={[
            styles.skeletonCard,
            { height, opacity: shimmerAnim },
          ]}
        >
          <View style={styles.skeletonHeader}>
            <View style={styles.skeletonCircle} />
            <View style={styles.skeletonLines}>
              <View style={[styles.skeletonLine, { width: '60%' }]} />
              <View style={[styles.skeletonLine, { width: '40%', marginTop: 6 }]} />
            </View>
          </View>
          <View style={[styles.skeletonLine, { width: '85%', marginTop: 14 }]} />
          <View style={[styles.skeletonLine, { width: '50%', marginTop: 8 }]} />
        </Animated.View>
      ))}
    </View>
  );
};

/**
 * EmptyState: Minh bạch lý do trống dữ liệu + một nút CTA rõ ràng để tiếp tục
 */
export const EmptyState: React.FC<{
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}> = ({
  icon = 'compass-outline',
  title,
  message,
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.emptyContainer, style]}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name={icon} size={48} color={COLORS.secondaryPurple} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          style={styles.emptyActionBtn}
          activeOpacity={0.85}
          onPress={onAction}
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
        >
          <Text style={styles.emptyActionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * ErrorState: Nêu rõ điều gì thất bại + nút Thử lại
 */
export const ErrorState: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}> = ({
  title = 'Không thể tải dữ liệu',
  message = 'Đã có lỗi xảy ra trong quá trình kết nối. Vui lòng kiểm tra lại mạng.',
  onRetry,
  style,
}) => {
  return (
    <View style={[styles.emptyContainer, style]}>
      <View style={[styles.emptyIconWrap, { backgroundColor: '#FEE2E2' }]}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.danger} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>

      {onRetry && (
        <TouchableOpacity
          style={[styles.emptyActionBtn, { backgroundColor: COLORS.secondaryPurple }]}
          activeOpacity={0.85}
          onPress={onRetry}
          accessibilityLabel="Thử lại"
          accessibilityRole="button"
        >
          <Ionicons name="refresh" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.emptyActionText}>Thử lại ngay</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    padding: 16,
    gap: 14,
  },
  skeletonCard: {
    backgroundColor: '#EBE7E1',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skeletonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DDD8D0',
  },
  skeletonLines: {
    flex: 1,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DDD8D0',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: 20,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryCoral,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    ...SHADOWS.glow,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
