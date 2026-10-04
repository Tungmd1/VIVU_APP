import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MatchedUser, useCircleStore } from '../../stores/circleStore';

const { height } = Dimensions.get('window');

interface SameIntentModalProps {
  visible: boolean;
  onClose: () => void;
  matches: MatchedUser[];
  onChat: (match: MatchedUser) => void;
  onHangout: (match: MatchedUser) => void;
  onAddFriend: (match: MatchedUser) => void;
}

export const SameIntentModal: React.FC<SameIntentModalProps> = ({
  visible,
  onClose,
  matches,
  onChat,
  onHangout,
  onAddFriend,
}) => {
  const { socialMood, socialOpenDoor, setSocialMood } = useCircleStore();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheetContainer}>
          <View style={styles.sheetHandle} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <LinearGradient colors={['#FF4B72', '#8B5CF6']} style={styles.headerIconBox}>
                <Ionicons name="sparkles" size={20} color="#FFF" />
              </LinearGradient>
              <View>
                <Text style={styles.title}>Cạ Cứng Cùng Nguyện Vọng ✨</Text>
                <Text style={styles.subtitle}>
                  {socialMood === 'happy' && 'Đang mở cửa kết bạn • Gợi ý nhiệt tình nhất'}
                  {socialMood === 'normal' && 'Tâm trạng bình thường • Chỉ gợi ý bạn bè'}
                  {socialMood === 'bad' && 'Đang ở chế độ yên tĩnh'}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Vùng chọn nhanh tâm trạng */}
          <View style={styles.moodSelectorCard}>
            <Text style={styles.moodSelectorTitle}>Tâm trạng hôm nay của bạn:</Text>
            <View style={styles.moodButtonsRow}>
              {[
                { key: 'happy' as const, icon: '🥳', label: 'Vui vẻ (Đi chơi)' },
                { key: 'normal' as const, icon: '😊', label: 'Bình thường' },
                { key: 'bad' as const, icon: '🌧️', label: 'Tồi tệ (Im lặng)' },
              ].map((m) => {
                const isActive = socialMood === m.key;
                return (
                  <TouchableOpacity
                    key={m.key}
                    style={[styles.moodBtn, isActive && styles.moodBtnActive]}
                    onPress={() => setSocialMood(m.key)}
                  >
                    <Text style={styles.moodEmoji}>{m.icon}</Text>
                    <Text style={[styles.moodLabel, isActive && styles.moodLabelActive]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Nội dung danh sách */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {socialMood === 'bad' ? (
              <View style={styles.emptyContainer}>
                <Text style={{ fontSize: 44, marginBottom: 12 }}>🌙</Text>
                <Text style={styles.emptyTitle}>Chế Độ Yên Tĩnh Được Kích Hoạt</Text>
                <Text style={styles.emptyDesc}>
                  Hôm nay là một ngày không vui. VIVU đã tắt toàn bộ thông báo và gợi ý để bạn có không gian nghỉ ngơi thư giãn.
                </Text>
                <TouchableOpacity
                  style={styles.cheerUpBtn}
                  onPress={() => setSocialMood('happy')}
                >
                  <Text style={styles.cheerUpBtnText}>Tâm trạng đã tốt hơn, tìm bạn đi chơi 🥳</Text>
                </TouchableOpacity>
              </View>
            ) : matches.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={{ fontSize: 40, marginBottom: 10 }}>🔍</Text>
                <Text style={styles.emptyTitle}>Chưa tìm thấy cạ cứng phù hợp</Text>
                <Text style={styles.emptyDesc}>
                  Hãy thử mở rộng bán kính tìm kiếm trong cài đặt hoặc đổi nguyện vọng hôm nay!
                </Text>
              </View>
            ) : (
              <View style={styles.matchList}>
                {matches.map((match) => (
                  <View key={match.id} style={styles.matchCard}>
                    {/* Hàng trên: Avatar, Tên, Độ trùng khớp */}
                    <View style={styles.matchCardTop}>
                      <Image source={{ uri: match.avatar }} style={styles.avatar} />
                      <View style={styles.matchCardInfo}>
                        <View style={styles.nameRow}>
                          <Text style={styles.name}>{match.nickname || match.name}</Text>
                          {match.isFriend && (
                            <View style={styles.friendBadge}>
                              <Text style={styles.friendBadgeText}>Bạn bè</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.distText}>
                          📍 Cách bạn {match.distanceKm} km • 🔋 {match.batteryLevel || 85}% pin
                        </Text>
                      </View>

                      {/* Badge Điểm Hòa Hợp */}
                      <LinearGradient colors={['#FF4B72', '#E11D48']} style={styles.scoreBadge}>
                        <Ionicons name="flame" size={13} color="#FFF" />
                        <Text style={styles.scoreText}>{match.matchScore}%</Text>
                      </LinearGradient>
                    </View>

                    {/* Nguyện vọng của cạ cứng */}
                    <View style={styles.intentBubble}>
                      <Text style={styles.intentEmoji}>{match.intentEmoji}</Text>
                      <Text style={styles.intentText} numberOfLines={2}>
                        "{match.intentText}"
                      </Text>
                    </View>

                    {/* Các nút hành động */}
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.chatBtn}
                        onPress={() => {
                          onClose();
                          onChat(match);
                        }}
                      >
                        <Ionicons name="chatbubble-ellipses" size={15} color="#FFF" />
                        <Text style={styles.chatBtnText}>Bắt chuyện</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.hangoutBtn}
                        onPress={() => {
                          onClose();
                          onHangout(match);
                        }}
                      >
                        <LinearGradient colors={['#10B981', '#34D399']} style={styles.hangoutGradient}>
                          <Ionicons name="flash" size={15} color="#FFF" />
                          <Text style={styles.hangoutBtnText}>Rủ đi chung ⚡</Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      {!match.isFriend && (
                        <TouchableOpacity
                          style={styles.addFriendIconBtn}
                          onPress={() => onAddFriend(match)}
                        >
                          <Ionicons name="person-add-outline" size={16} color="#38BDF8" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: height * 0.88,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sheetHandle: {
    width: 44,
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodSelectorCard: {
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  moodSelectorTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 8,
  },
  moodButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  moodBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  moodBtnActive: {
    borderColor: '#FF4B72',
    backgroundColor: 'rgba(255, 75, 114, 0.15)',
  },
  moodEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  moodLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  moodLabelActive: {
    color: '#FF4B72',
    fontWeight: '800',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  matchList: {
    gap: 12,
  },
  matchCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  matchCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  matchCardInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
  },
  friendBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  friendBadgeText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '700',
  },
  distText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
  },
  intentBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  intentEmoji: {
    fontSize: 20,
  },
  intentText: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '500',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#334155',
    paddingVertical: 10,
    borderRadius: 12,
  },
  chatBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  hangoutBtn: {
    flex: 1.2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  hangoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  hangoutBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
  },
  addFriendIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  cheerUpBtn: {
    marginTop: 18,
    backgroundColor: '#FF4B72',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  cheerUpBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
});
