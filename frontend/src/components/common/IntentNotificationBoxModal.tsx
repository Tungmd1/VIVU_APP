import React, { useState } from 'react';
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
import {
  calculateDistanceKm,
  FriendItem,
  useCircleStore,
} from '../../stores/circleStore';

const { height } = Dimensions.get('window');

export interface IntentNotificationItem {
  id: string;
  sourceType: 'family' | 'friend' | 'lover' | 'suggested' | 'reaction';
  userId: string;
  name: string;
  nickname?: string;
  avatar: string;
  category: string;
  emoji: string;
  content: string;
  timeAgo: string;
  distanceKm: number;
  latitude: number;
  longitude: number;
  batteryLevel?: number;
}

interface IntentNotificationBoxModalProps {
  visible: boolean;
  onClose: () => void;
  beacons: any[];
  currentCoords: { latitude: number; longitude: number };
  onLocateOnMap: (lat: number, lon: number) => void;
  onChat: (user: { id: string; name: string }) => void;
  onHangout: (user: { id: string; name: string }) => void;
}

export const IntentNotificationBoxModal: React.FC<IntentNotificationBoxModalProps> = ({
  visible,
  onClose,
  beacons,
  currentCoords,
  onLocateOnMap,
  onChat,
  onHangout,
}) => {
  const { friends, socialMood, setSocialMood } = useCircleStore();
  const [filterType, setFilterType] = useState<'all' | 'family' | 'friend' | 'suggested' | 'reaction'>('all');

  // Tổng hợp tất cả thông báo nguyện vọng dựa vào socialMood
  const notifications: IntentNotificationItem[] = [];

  if (socialMood !== 'bad') {
    // 1. Thêm nguyện vọng từ GIA ĐÌNH
    friends
      .filter((f) => f.isFamily)
      .forEach((f) => {
        const dist = calculateDistanceKm(currentCoords.latitude, currentCoords.longitude, f.latitude, f.longitude);
        notifications.push({
          id: `notif_fam_${f.id}`,
          sourceType: 'family',
          userId: f.id,
          name: f.name,
          nickname: f.nickname || f.familyRole,
          avatar: f.avatar,
          category: f.beacon?.category || 'home',
          emoji: f.beacon?.emoji || '🏡',
          content: f.beacon?.content || 'Đang ở nhà, gia đình sum vầy an tâm ❤️',
          timeAgo: '10 phút trước',
          distanceKm: dist,
          latitude: f.latitude,
          longitude: f.longitude,
          batteryLevel: f.batteryLevel,
        });
      });

    // 2. Thêm nguyện vọng từ BẠN BÈ & NGƯỜI YÊU
    friends
      .filter((f) => f.isFriend && !f.isFamily)
      .forEach((f) => {
        const dist = calculateDistanceKm(currentCoords.latitude, currentCoords.longitude, f.latitude, f.longitude);
        if (f.beacon) {
          notifications.push({
            id: `notif_friend_${f.id}`,
            sourceType: f.isLover ? 'lover' : 'friend',
            userId: f.id,
            name: f.name,
            nickname: f.nickname,
            avatar: f.avatar,
            category: f.beacon.category || 'cafe',
            emoji: f.beacon.emoji,
            content: f.beacon.content,
            timeAgo: 'Vừa xong',
            distanceKm: dist,
            latitude: f.latitude,
            longitude: f.longitude,
            batteryLevel: f.batteryLevel,
          });
        }
      });

    // 4. THÔNG BÁO TƯƠNG TÁC: Ai đó đã thả biểu tượng cảm xúc vào nguyện vọng của bạn
    const reactions = ['💖', '🩴', '🎆', '🔥'];
    // Lấy giả lập 2 người dùng đầu tiên để làm tương tác
    friends.slice(0, 2).forEach((f, idx) => {
      notifications.push({
        id: `notif_reaction_${f.id}_${idx}`,
        sourceType: 'reaction',
        userId: f.id,
        name: f.name,
        nickname: f.nickname,
        avatar: f.avatar,
        category: 'reaction',
        emoji: reactions[idx % reactions.length],
        content: 'đã thả cảm xúc vào tín hiệu nguyện vọng của bạn!',
        timeAgo: idx === 0 ? '1 phút trước' : '12 phút trước',
        distanceKm: 0,
        latitude: f.latitude,
        longitude: f.longitude,
      });
    });

    // 3. NẾU TÂM TRẠNG LÀ VUI VẺ: Thêm tất cả nguyện vọng từ CẠ CỨNG XUNG QUANH
    if (socialMood === 'happy') {
      beacons.forEach((b: any) => {
        // Tránh trùng bạn bè đã thêm
        if (!friends.some((f) => f.id === b.userId)) {
          const dist = calculateDistanceKm(currentCoords.latitude, currentCoords.longitude, b.latitude, b.longitude);
          notifications.push({
            id: `notif_sug_${b.id}`,
            sourceType: 'suggested',
            userId: b.userId || b.id,
            name: b.userName,
            avatar: b.userAvatar,
            category: b.category,
            emoji: b.emoji || '✨',
            content: b.content,
            timeAgo: '15 phút trước',
            distanceKm: dist,
            latitude: b.latitude,
            longitude: b.longitude,
            batteryLevel: b.batteryLevel,
          });
        }
      });
    }
  }

  // Lọc theo tab con
  const filteredNotifications = notifications.filter((item) => {
    if (filterType === 'all') return true;
    if (filterType === 'family') return item.sourceType === 'family';
    if (filterType === 'friend') return item.sourceType === 'friend' || item.sourceType === 'lover';
    if (filterType === 'suggested') return item.sourceType === 'suggested';
    if (filterType === 'reaction') return item.sourceType === 'reaction';
    return true;
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheetContainer}>
          <View style={styles.sheetHandle} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <LinearGradient colors={['#FF4B72', '#E11D48']} style={styles.bellIconBox}>
                <Ionicons name="notifications" size={20} color="#FFF" />
              </LinearGradient>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.title}>Hộp Tín Hiệu & Nguyện Vọng 📬</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{notifications.length}</Text>
                  </View>
                </View>
                <Text style={styles.subtitle}>
                  {socialMood === 'happy' && 'Đang nhận tất cả nguyện vọng từ Bạn bè, Gia đình & Cạ cứng 🥳'}
                  {socialMood === 'normal' && 'Chỉ nhận nguyện vọng từ Bạn bè & Gia đình 😊'}
                  {socialMood === 'bad' && 'Đang ở chế độ yên tĩnh 🌙'}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Tabs bộ lọc nguồn thông báo */}
          {socialMood !== 'bad' && (
            <View style={styles.tabsRow}>
              {[
                { key: 'all' as const, label: `Tất cả (${notifications.length})` },
                { key: 'family' as const, label: `👨‍👩‍👧 Gia đình (${notifications.filter(n => n.sourceType === 'family').length})` },
                { key: 'friend' as const, label: `👥 Bạn bè (${notifications.filter(n => n.sourceType === 'friend' || n.sourceType === 'lover').length})` },
                ...(socialMood === 'happy'
                  ? [{ key: 'suggested' as const, label: `✨ Gợi ý (${notifications.filter(n => n.sourceType === 'suggested').length})` }]
                  : []),
                { key: 'reaction' as const, label: `🔔 Tương tác (${notifications.filter(n => n.sourceType === 'reaction').length})` }
              ].map((tab) => {
                const isActive = filterType === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.filterTab, isActive && styles.filterTabActive]}
                    onPress={() => setFilterType(tab.key)}
                  >
                    <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Nội dung danh sách thông báo */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {socialMood === 'bad' ? (
              <View style={styles.emptyContainer}>
                <Text style={{ fontSize: 44, marginBottom: 10 }}>🌙</Text>
                <Text style={styles.emptyTitle}>Hộp Thư Đang Tạm Dừng</Text>
                <Text style={styles.emptyDesc}>
                  Hôm nay bạn đang ở Chế Độ Yên Tĩnh. Thông báo nguyện vọng đã được tạm dừng để bạn nghỉ ngơi.
                </Text>
                <TouchableOpacity
                  style={styles.switchHappyBtn}
                  onPress={() => setSocialMood('happy')}
                >
                  <Text style={styles.switchHappyBtnText}>Chuyển sang Vui vẻ để nhận thông báo 🥳</Text>
                </TouchableOpacity>
              </View>
            ) : filteredNotifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={{ fontSize: 40, marginBottom: 10 }}>📭</Text>
                <Text style={styles.emptyTitle}>Chưa có nguyện vọng mới</Text>
                <Text style={styles.emptyDesc}>
                  Khi bạn bè hoặc người thân đăng tín hiệu, thông báo sẽ lập tức xuất hiện tại đây!
                </Text>
              </View>
            ) : (
              <View style={styles.notificationsList}>
                {filteredNotifications.map((item) => (
                  <View key={item.id} style={styles.notifCard}>
                    {/* Header thông báo */}
                    <View style={styles.notifHeader}>
                      <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
                      <View style={styles.userInfo}>
                        <View style={styles.nameRow}>
                          <Text style={styles.userName}>{item.name}</Text>
                          {item.nickname && (
                            <Text style={styles.userNickname}>"{item.nickname}"</Text>
                          )}
                        </View>
                        <Text style={styles.timeDistanceText}>
                          {item.timeAgo} • 📍 Cách bạn {item.distanceKm} km
                        </Text>
                      </View>

                      {/* Tag phân loại nguồn */}
                      <View
                        style={[
                          styles.sourceTag,
                          item.sourceType === 'family' && styles.sourceTagFamily,
                          item.sourceType === 'lover' && styles.sourceTagLover,
                          item.sourceType === 'friend' && styles.sourceTagFriend,
                          item.sourceType === 'suggested' && styles.sourceTagSuggested,
                        ]}
                      >
                        <Text style={styles.sourceTagText}>
                          {item.sourceType === 'family' && '👨‍👩‍👧 Gia đình'}
                          {item.sourceType === 'lover' && '💖 Người yêu'}
                          {item.sourceType === 'friend' && '👥 Bạn bè'}
                          {item.sourceType === 'suggested' && '✨ Cạ cứng mới'}
                          {item.sourceType === 'reaction' && '🔔 Tương tác'}
                        </Text>
                      </View>
                    </View>

                    {/* Khối nguyện vọng hoặc tương tác */}
                    {item.sourceType === 'reaction' ? (
                      <View style={[styles.intentCard, { backgroundColor: 'rgba(255, 75, 114, 0.1)', borderColor: 'rgba(255, 75, 114, 0.3)' }]}>
                        <Text style={{ fontSize: 24, marginRight: 10 }}>{item.emoji}</Text>
                        <Text style={[styles.intentContent, { color: '#FF4B72', flex: 1 }]} numberOfLines={2}>
                          Đã thả cảm xúc vào tín hiệu nguyện vọng của bạn!
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.intentCard}>
                        <Text style={styles.intentEmoji}>{item.emoji}</Text>
                        <Text style={styles.intentContent} numberOfLines={2}>
                          "{item.content}"
                        </Text>
                      </View>
                    )}

                    {/* Nút hành động */}
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.locateBtn}
                        onPress={() => {
                          onClose();
                          onLocateOnMap(item.latitude, item.longitude);
                        }}
                      >
                        <Ionicons name="navigate-outline" size={14} color="#38BDF8" />
                        <Text style={styles.locateBtnText}>Xem vị trí</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.chatBtn}
                        onPress={() => {
                          onClose();
                          onChat({ id: item.userId, name: item.nickname || item.name });
                        }}
                      >
                        <Ionicons name="chatbubble-ellipses-outline" size={14} color="#FFF" />
                        <Text style={styles.chatBtnText}>Bắt chuyện</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.hangoutBtn}
                        onPress={() => {
                          onClose();
                          onHangout({ id: item.userId, name: item.nickname || item.name });
                        }}
                      >
                        <LinearGradient colors={['#10B981', '#34D399']} style={styles.hangoutGradient}>
                          <Ionicons name="flash" size={14} color="#FFF" />
                          <Text style={styles.hangoutBtnText}>Rủ đi ngay ⚡</Text>
                        </LinearGradient>
                      </TouchableOpacity>
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
    maxHeight: height * 0.9,
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
  bellIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  countBadge: {
    backgroundColor: '#FF4B72',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 11,
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
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  filterTab: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  filterTabActive: {
    backgroundColor: '#FF4B72',
    borderColor: '#FF4B72',
  },
  filterTabText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: '#FFF',
    fontWeight: '800',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  notificationsList: {
    gap: 12,
  },
  notifCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
  userNickname: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '700',
  },
  timeDistanceText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  sourceTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sourceTagFamily: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  sourceTagLover: {
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
  },
  sourceTagFriend: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  sourceTagSuggested: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
  },
  sourceTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  intentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  intentEmoji: {
    fontSize: 20,
  },
  intentContent: {
    fontSize: 12,
    color: '#F1F5F9',
    fontWeight: '500',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  locateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  locateBtnText: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '700',
  },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#334155',
    paddingVertical: 8,
    borderRadius: 10,
  },
  chatBtnText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '700',
  },
  hangoutBtn: {
    flex: 1.2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  hangoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  hangoutBtnText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '800',
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
  },
  emptyDesc: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  switchHappyBtn: {
    marginTop: 16,
    backgroundColor: '#FF4B72',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  switchHappyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
});
