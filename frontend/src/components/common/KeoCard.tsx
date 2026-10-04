import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../../constants/theme';
import { UserAvatar } from './UserAvatar';

export interface KeoActivityItem {
  id: string;
  title: string;
  category?: string;
  location: string;
  district?: string;
  time: string;
  date?: string;
  joined: number;
  maxParticipants: number;
  image?: string;
  host: {
    id?: string;
    name: string;
    avatar?: string;
    trustScore?: number;
    isVerified?: boolean;
  };
  matchReason?: string; // Tín hiệu phù hợp: "Gần khu vực bạn chọn", "Cùng mê cafe"
  userRequestStatus?: 'PENDING' | 'ACCEPTED' | 'DECLINED' | null;
  budget?: string;
}

interface KeoCardProps {
  activity: KeoActivityItem;
  onPress: (activity: KeoActivityItem) => void;
  onJoinPress?: (activity: KeoActivityItem) => void;
}

export const KeoCard: React.FC<KeoCardProps> = ({
  activity,
  onPress,
  onJoinPress,
}) => {
  const isFull = activity.joined >= activity.maxParticipants;
  const remainingSlots = Math.max(0, activity.maxParticipants - activity.joined);

  // CTA Text theo trạng thái
  const getCtaLabel = () => {
    if (activity.userRequestStatus === 'ACCEPTED') return 'Đã tham gia';
    if (activity.userRequestStatus === 'PENDING') return 'Chờ duyệt';
    if (isFull) return 'Hết chỗ';
    return 'Tham gia kèo';
  };

  const isPending = activity.userRequestStatus === 'PENDING';
  const isAccepted = activity.userRequestStatus === 'ACCEPTED';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.92}
      onPress={() => onPress(activity)}
      accessibilityLabel={`Kèo: ${activity.title}`}
      accessibilityRole="button"
    >
      {/* Ảnh bìa & Tag trạng thái */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              activity.image ||
              'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
          }}
          style={styles.image}
        />
        <LinearGradient
          colors={['rgba(41, 38, 51, 0.1)', 'rgba(41, 38, 51, 0.7)']}
          style={styles.imageGradient}
        />

        {/* Tag danh mục */}
        {activity.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{activity.category}</Text>
          </View>
        )}

        {/* Tag số chỗ còn lại */}
        <View
          style={[
            styles.slotBadge,
            isFull ? styles.slotBadgeFull : styles.slotBadgeAvailable,
          ]}
        >
          <Ionicons
            name={isFull ? 'people' : 'person-add'}
            size={12}
            color="#FFFFFF"
          />
          <Text style={styles.slotBadgeText}>
            {isFull ? 'Đã đủ chỗ' : `Còn ${remainingSlots}/${activity.maxParticipants} chỗ`}
          </Text>
        </View>

        {/* Tín hiệu phù hợp nếu có (Mục 1 Nguyên tắc UX: Nêu lý do đề xuất) */}
        {activity.matchReason && (
          <View style={styles.matchReasonChip}>
            <Ionicons name="sparkles" size={11} color="#FFD166" />
            <Text style={styles.matchReasonText}>{activity.matchReason}</Text>
          </View>
        )}
      </View>

      {/* Thông tin chính: Hoạt động, Giờ, Điểm hẹn, Chủ kèo */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {activity.title}
        </Text>

        {/* Thời gian */}
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={15} color={COLORS.primaryCoral} />
          <Text style={styles.metaText} numberOfLines={1}>
            {activity.time} {activity.date ? `• ${activity.date}` : ''}
          </Text>
        </View>

        {/* Địa điểm */}
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={15} color={COLORS.secondaryPurple} />
          <Text style={styles.metaText} numberOfLines={1}>
            {(activity.location || '').startsWith('http') ? 'Xem điểm hẹn trên bản đồ' : activity.location}
          </Text>
        </View>

        {/* Chi phí ước tính nếu có */}
        {activity.budget && (
          <View style={styles.metaRow}>
            <Ionicons name="wallet-outline" size={15} color={COLORS.accentMint} />
            <Text style={[styles.metaText, { color: COLORS.accentMint, fontWeight: '600' }]}>
              {activity.budget}
            </Text>
          </View>
        )}

        {/* Footer: Chủ kèo & Nút CTA */}
        <View style={styles.footerRow}>
          {/* Thông tin chủ kèo */}
          <View style={styles.hostInfo}>
            <UserAvatar
              uri={activity.host.avatar}
              name={activity.host.name}
              size={34}
              trustScore={activity.host.trustScore}
              isVerified={activity.host.isVerified}
            />
            <View style={styles.hostTextWrap}>
              <Text style={styles.hostLabel}>Chủ kèo</Text>
              <Text style={styles.hostName} numberOfLines={1}>
                {activity.host.name}
              </Text>
            </View>
          </View>

          {/* CTA Nút tham gia / Xem chi tiết */}
          <TouchableOpacity
            style={[
              styles.ctaBtn,
              isFull && styles.ctaBtnFull,
              isPending && styles.ctaBtnPending,
              isAccepted && styles.ctaBtnAccepted,
            ]}
            activeOpacity={0.8}
            onPress={() => {
              if (onJoinPress && !isFull && !isPending && !isAccepted) {
                onJoinPress(activity);
              } else {
                onPress(activity);
              }
            }}
            accessibilityLabel={getCtaLabel()}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.ctaText,
                (isPending || isAccepted || isFull) && styles.ctaTextSecondary,
              ]}
            >
              {getCtaLabel()}
            </Text>
            {!isFull && !isPending && !isAccepted && (
              <Ionicons name="arrow-forward" size={13} color="#FFFFFF" style={{ marginLeft: 4 }} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  imageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
    backgroundColor: '#FAF8F5',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(41, 38, 51, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  slotBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  slotBadgeAvailable: {
    backgroundColor: COLORS.accentMint,
  },
  slotBadgeFull: {
    backgroundColor: '#6B7280',
  },
  slotBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  matchReasonChip: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(117, 89, 232, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchReasonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    lineHeight: 22,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textLight,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  hostTextWrap: {
    flex: 1,
  },
  hostLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  hostName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryCoral,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    ...SHADOWS.glow,
  },
  ctaBtnFull: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaBtnPending: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaBtnAccepted: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  ctaTextSecondary: {
    color: COLORS.textDark,
  },
});
