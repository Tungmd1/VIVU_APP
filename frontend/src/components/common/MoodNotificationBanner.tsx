import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCircleStore } from '../../stores/circleStore';

interface MoodNotificationBannerProps {
  onPressBanner: () => void;
}

export const MoodNotificationBanner: React.FC<MoodNotificationBannerProps> = ({
  onPressBanner,
}) => {
  const { notificationBanner, dismissNotificationBanner, socialMood } = useCircleStore();

  if (!notificationBanner || !notificationBanner.visible) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPressBanner}>
        <LinearGradient
          colors={
            socialMood === 'happy'
              ? ['rgba(236, 72, 153, 0.95)', 'rgba(139, 92, 246, 0.95)']
              : socialMood === 'normal'
              ? ['rgba(16, 185, 129, 0.95)', 'rgba(15, 23, 42, 0.95)']
              : ['rgba(30, 41, 59, 0.95)', 'rgba(15, 23, 42, 0.95)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerGradient}
        >
          <Text style={styles.bannerEmoji}>{notificationBanner.icon}</Text>
          <View style={styles.bannerTextContent}>
            <Text style={styles.bannerTitle} numberOfLines={1}>
              {notificationBanner.title}
            </Text>
            <Text style={styles.bannerSubtitle} numberOfLines={1}>
              {notificationBanner.subtitle}
            </Text>
          </View>

          {socialMood === 'happy' && (
            <View style={styles.viewBadge}>
              <Text style={styles.viewBadgeText}>Xem</Text>
              <Ionicons name="chevron-forward" size={12} color="#FFF" />
            </View>
          )}

          <TouchableOpacity
            style={styles.dismissBtn}
            onPress={(e) => {
              e.stopPropagation();
              dismissNotificationBanner();
            }}
          >
            <Ionicons name="close" size={16} color="rgba(255, 255, 255, 0.7)" />
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  bannerEmoji: {
    fontSize: 22,
    marginRight: 10,
  },
  bannerTextContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
  },
  bannerSubtitle: {
    fontSize: 10,
    color: '#F1F5F9',
    marginTop: 1,
  },
  viewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 8,
    gap: 2,
  },
  viewBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
  },
  dismissBtn: {
    padding: 4,
  },
});
