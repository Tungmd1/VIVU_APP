import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SocialCircle, useCircleStore } from '../../stores/circleStore';

interface CircleMenuBarProps {
  onOpenCreateCircle: () => void;
  onManageCircle?: (circle: SocialCircle) => void;
}

export const CircleMenuBar: React.FC<CircleMenuBarProps> = ({
  onOpenCreateCircle,
  onManageCircle,
}) => {
  const { circles, activeCircleId, setActiveCircleId, friends, socialDistanceRadius } = useCircleStore();

  const activeCircle = circles.find((c) => c.id === activeCircleId) || circles[0];

  const getCircleCount = (circle: SocialCircle) => {
    if (circle.id === 'social') return null;
    if (circle.id === 'friends') return friends.filter((f) => f.isFriend).length;
    if (circle.id === 'lover') return friends.filter((f) => f.isLover).length;
    if (circle.id === 'family') return friends.filter((f) => f.isFamily).length;
    return circle.memberIds.length;
  };

  return (
    <View style={styles.container}>
      {/* 1. HÀNG CUỘN CÁC VÒNG TRÒN / HỘI NHÓM */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {circles.map((circle) => {
          const isActive = circle.id === activeCircleId;
          const count = getCircleCount(circle);

          return (
            <TouchableOpacity
              key={circle.id}
              activeOpacity={0.8}
              onPress={() => setActiveCircleId(circle.id)}
              onLongPress={() => {
                if (onManageCircle) {
                  onManageCircle(circle);
                }
              }}
              style={styles.circleBtnWrapper}
            >
              {isActive ? (
                <LinearGradient
                  colors={[circle.color, '#0F172A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.circlePill, styles.circlePillActive, { borderColor: circle.color }]}
                >
                  <Text style={styles.circleIcon}>{circle.icon}</Text>
                  <Text style={styles.circleNameActive}>{circle.name}</Text>
                  {count !== null && (
                    <View style={[styles.badgeActive, { backgroundColor: circle.color }]}>
                      <Text style={styles.badgeTextActive}>{count}</Text>
                    </View>
                  )}
                </LinearGradient>
              ) : (
                <View style={styles.circlePill}>
                  <Text style={styles.circleIcon}>{circle.icon}</Text>
                  <Text style={styles.circleName}>{circle.name}</Text>
                  {count !== null && (
                    <View style={styles.badgeInactive}>
                      <Text style={styles.badgeTextInactive}>{count}</Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Nút "+" Thêm Vòng Tròn / Tạo Nhóm Mới */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onOpenCreateCircle}
          style={styles.addCircleBtn}
        >
          <LinearGradient
            colors={['#FF4B72', '#E11D48']}
            style={styles.addCircleGradient}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addCircleText}>Tạo nhóm</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* 2. CHIP TRẠNG THÁI NGỮ CẢNH TINH TẾ (CONTEXT BAR) */}
      <View style={styles.contextBar}>
        <View style={styles.contextLeft}>
          <View style={[styles.statusDot, { backgroundColor: activeCircle.color || '#3B82F6' }]} />
          <Text style={styles.contextText} numberOfLines={1}>
            {activeCircle.id === 'social' && (socialDistanceRadius === 0 ? '🌐 Quét toàn thành phố: Tất cả tín hiệu & người dùng' : `🌐 Bán kính ${socialDistanceRadius}km: Lọc tín hiệu & người dùng gần bạn`)}
            {activeCircle.id === 'friends' && `👥 Đang lọc ${friends.filter(f => f.isFriend).length} bạn bè đã kết nối`}
            {activeCircle.id === 'lover' && (
              friends.some(f => f.isLover)
                ? `💖 Không gian đôi: ${friends.find(f => f.isLover)?.nickname || friends.find(f => f.isLover)?.name} đang kết nối`
                : '💖 Chưa chọn người yêu • Bấm để ghép đôi'
            )}
            {activeCircle.id === 'family' && `👨‍👩‍👧 Gia đình: ${friends.filter(f => f.isFamily).length} thành viên đang kết nối`}
            {activeCircle.type === 'group' && `${activeCircle.icon} ${activeCircle.name}: ${activeCircle.memberIds.length} bạn bè trong nhóm`}
          </Text>
        </View>

        {/* Nút cài đặt / quản lý nhóm (Cho phép mọi nhóm trừ Xã hội) */}
        {onManageCircle && (
          <TouchableOpacity
            style={styles.manageBtn}
            onPress={() => onManageCircle(activeCircle)}
          >
            <Ionicons name="options-outline" size={13} color="#38BDF8" />
            <Text style={styles.manageBtnText}>
              {activeCircle.id === 'social' && 'Khoảng cách & Lọc'}
              {activeCircle.id === 'friends' && 'Quản lý bạn bè'}
              {activeCircle.id === 'lover' && 'Cài đặt đôi'}
              {activeCircle.id === 'family' && 'Quản lý gia đình'}
              {activeCircle.isCustom && 'Quản lý nhóm'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  scrollContent: {
    paddingVertical: 4,
    gap: 8,
    alignItems: 'center',
  },
  circleBtnWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  circlePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  circlePillActive: {
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  circleIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  circleName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  circleNameActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badgeInactive: {
    marginLeft: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  badgeTextInactive: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },
  badgeActive: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  badgeTextActive: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  addCircleBtn: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  addCircleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 4,
  },
  addCircleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  contextBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  contextLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  contextText: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '500',
    flex: 1,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 8,
  },
  manageBtnText: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '700',
  },
});
