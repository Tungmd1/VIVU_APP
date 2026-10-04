import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

interface UserAvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  trustScore?: number;
  isVerified?: boolean;
  showTrustScore?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  uri,
  name = 'Vivu',
  size = 44,
  trustScore,
  isVerified = false,
  showTrustScore = false,
}) => {
  const [imgError, setImgError] = useState(false);

  // Lấy 2 ký tự đầu làm fallback
  const getInitials = (n: string) => {
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const ringColor =
    trustScore && trustScore >= 80
      ? COLORS.accentMint
      : trustScore && trustScore >= 60
      ? COLORS.secondaryPurple
      : COLORS.border;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.avatarWrap,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: ringColor,
            borderWidth: trustScore ? 2 : 0,
          },
        ]}
      >
        {uri && !imgError ? (
          <Image
            source={{ uri }}
            style={{ width: '100%', height: '100%', borderRadius: size / 2 }}
            onError={() => setImgError(true)}
          />
        ) : (
          <View
            style={[
              styles.fallback,
              { borderRadius: size / 2, backgroundColor: COLORS.primarySoft },
            ]}
          >
            <Text
              style={[
                styles.initials,
                { fontSize: size * 0.38, color: COLORS.secondaryPurple },
              ]}
            >
              {getInitials(name)}
            </Text>
          </View>
        )}
      </View>

      {/* Huy hiệu xác minh (Mint) */}
      {isVerified && (
        <View
          style={[
            styles.verifiedBadge,
            {
              width: Math.max(16, size * 0.35),
              height: Math.max(16, size * 0.35),
              borderRadius: Math.max(16, size * 0.35) / 2,
            },
          ]}
        >
          <Ionicons name="checkmark-sharp" size={size * 0.22} color="#FFFFFF" />
        </View>
      )}

      {/* Điểm uy tín thu nhỏ */}
      {showTrustScore && trustScore !== undefined && (
        <View style={styles.trustBadge}>
          <Text style={styles.trustText}>{trustScore}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: {
    overflow: 'hidden',
    backgroundColor: COLORS.card,
  },
  fallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '800',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.accentMint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  trustBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: COLORS.secondaryPurple,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.background,
  },
  trustText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
