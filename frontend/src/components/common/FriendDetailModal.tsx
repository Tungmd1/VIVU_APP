import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FriendItem, useCircleStore } from '../../stores/circleStore';

interface FriendDetailModalProps {
  friend: FriendItem | null;
  visible: boolean;
  onClose: () => void;
  onChat: (friend: FriendItem) => void;
  onHangout: (friend: FriendItem) => void;
  onViewProfile?: (friendId: string) => void;
  onSendEmoji?: (emoji: string) => void;
  isSocialMode?: boolean; // True nếu đang mở từ mục Xã hội (công cộng)
}

export const FriendDetailModal: React.FC<FriendDetailModalProps> = ({
  friend,
  visible,
  onClose,
  onChat,
  onHangout,
  onViewProfile,
  onSendEmoji,
  isSocialMode = false,
}) => {
  const {
    setLover,
    toggleFamilyMember,
    setFriendNickname,
    circles,
    addFriend,
    friends,
  } = useCircleStore();

  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameText, setNicknameText] = useState('');
  const [isAddingFriend, setIsAddingFriend] = useState(false);

  if (!friend) return null;

  // Kiểm tra xem đã kết bạn chưa
  const isAlreadyFriend =
    friend.isFriend || friends.some((f) => f.id === friend.id && f.isFriend);

  const joinedCircles = circles.filter(
    (c) =>
      c.memberIds.includes(friend.id) ||
      (c.id === 'friends' && isAlreadyFriend) ||
      (c.id === 'lover' && friend.isLover) ||
      (c.id === 'family' && friend.isFamily)
  );

  const handleStartEditNickname = () => {
    setNicknameText(friend.nickname || '');
    setIsEditingNickname(true);
  };

  const handleSaveNickname = async () => {
    await setFriendNickname(friend.id, nicknameText);
    setIsEditingNickname(false);
  };

  const handleRemoveNickname = async () => {
    await setFriendNickname(friend.id, '');
    setIsEditingNickname(false);
  };

  // Thêm bạn bè trực tiếp từ modal
  const handleAddFriendAction = async () => {
    setIsAddingFriend(true);
    try {
      await addFriend({
        id: friend.id,
        name: friend.name,
        avatar: friend.avatar,
        phone: friend.phone,
        nickname: friend.nickname,
      });
      Alert.alert('Thành công 🎉', `Đã thêm ${friend.name} vào danh sách bạn bè của bạn!`);
    } catch {
      Alert.alert('Lỗi', 'Không thể kết bạn lúc này, vui lòng thử lại.');
    } finally {
      setIsAddingFriend(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheetContainer}>
          <View style={styles.sheetHandle} />

          {/* User Header */}
          <View style={styles.userHeader}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: friend.avatar }} style={styles.avatar} />
              {friend.isLover && !isSocialMode && (
                <View style={styles.loverBadge}>
                  <Text style={{ fontSize: 12 }}>💖</Text>
                </View>
              )}
            </View>

            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{friend.name}</Text>
                {/* Chỉ hiển thị tag Người yêu & Gia đình nếu không phải chế độ xã hội */}
                {!isSocialMode && friend.isLover && <Text style={styles.loverTag}>Người yêu</Text>}
                {!isSocialMode && friend.isFamily && <Text style={styles.familyTag}>Gia đình</Text>}
                {isAlreadyFriend && (
                  <View style={styles.friendPill}>
                    <Ionicons name="checkmark-circle" size={11} color="#4CD964" />
                    <Text style={styles.friendPillText}>Bạn bè</Text>
                  </View>
                )}
              </View>

              {/* BIỆT DANH RIÊNG (CHỈ ÁP DỤNG KHI ĐÃ LÀ BẠN BÈ) */}
              {isAlreadyFriend ? (
                friend.nickname ? (
                  <View style={styles.nicknameDisplayRow}>
                    <Text style={styles.nicknameLabel}>Biệt danh:</Text>
                    <Text style={styles.nicknameValue}>"{friend.nickname}"</Text>
                    <TouchableOpacity onPress={handleStartEditNickname}>
                      <Ionicons name="pencil" size={13} color="#38BDF8" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.addNicknameRow} onPress={handleStartEditNickname}>
                    <Ionicons name="add-circle-outline" size={14} color="#38BDF8" />
                    <Text style={styles.addNicknameText}>Đặt biệt danh riêng</Text>
                  </TouchableOpacity>
                )
              ) : (
                <Text style={styles.socialStrangerText}>🌐 Người dùng VIVU xung quanh bạn</Text>
              )}

              <Text style={styles.statusText}>{friend.statusText || '🟢 Đang hoạt động'}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="battery-charging" size={14} color="#10B981" />
                  <Text style={styles.metaText}>{friend.batteryLevel}%</Text>
                </View>
                <View style={styles.metaDivider} />
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={14} color="#FF4B72" />
                  <Text style={styles.metaText}>Đà Nẵng (Gần bạn)</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Ô SỬA BIỆT DANH INLINE */}
          {isEditingNickname && isAlreadyFriend && (
            <View style={styles.nicknameCardEdit}>
              <Text style={styles.nicknameCardTitle}>Đặt biệt danh riêng cho {friend.name}:</Text>
              <View style={styles.nicknameCardInputRow}>
                <TextInput
                  style={styles.nicknameCardInput}
                  placeholder="VD: Bé iu, Cạ cứng, Cu Bo..."
                  placeholderTextColor="#64748B"
                  value={nicknameText}
                  onChangeText={setNicknameText}
                  autoFocus
                />
                <TouchableOpacity style={styles.saveNickBtn} onPress={handleSaveNickname}>
                  <Text style={styles.saveNickBtnText}>Lưu</Text>
                </TouchableOpacity>
                {friend.nickname ? (
                  <TouchableOpacity style={styles.removeNickBtn} onPress={handleRemoveNickname}>
                    <Text style={styles.removeNickBtnText}>Xóa</Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  style={styles.cancelNickBtn}
                  onPress={() => setIsEditingNickname(false)}
                >
                  <Ionicons name="close" size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Tín hiệu / Nguyện vọng đang treo */}
          {friend.beacon && (
            <View style={styles.beaconCard}>
              <View style={styles.beaconHeader}>
                <Text style={styles.beaconEmoji}>{friend.beacon.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.beaconTitle}>Tín hiệu đang phát</Text>
                  <Text style={styles.beaconTime}>{friend.beacon.remainingTime}</Text>
                </View>
              </View>
              <Text style={styles.beaconContent}>{friend.beacon.content}</Text>
            </View>
          )}

          {/* ========================================================
              KHU VỰC HÀNH ĐỘNG TÙY BIẾN:
              - Ở phần Xã hội (isSocialMode = true):
                -> XÓA ĐẶT NGƯỜI YÊU VÀ THÊM GIA ĐÌNH
                -> THAY BẰNG NÚT "THÊM BẠN"
              - Ở phần Private (Bạn bè đã kết bạn):
                -> Mới có chức năng Đặt làm người yêu & Thêm vào gia đình
              ======================================================== */}
          {isSocialMode || !isAlreadyFriend ? (
            // TRƯỜNG HỢP 1: MỤC XÃ HỘI HOẶC CHƯA KẾT BẠN -> CHỈ CÓ NÚT THÊM BẠN
            <View style={styles.socialActionContainer}>
              {isAlreadyFriend ? (
                <View style={styles.alreadyFriendNoticeBox}>
                  <Ionicons name="checkmark-circle" size={18} color="#4CD964" />
                  <Text style={styles.alreadyFriendNoticeText}>
                    Đã là bạn bè. Để đặt làm Người yêu hoặc Gia đình, hãy quản lý trong mục Bạn bè riêng tư.
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addFriendSocialBtn}
                  onPress={handleAddFriendAction}
                  disabled={isAddingFriend}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#0284C7', '#0EA5E9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.addFriendGradient}
                  >
                    <Ionicons name="person-add" size={18} color="#FFF" />
                    <Text style={styles.addFriendSocialText}>
                      {isAddingFriend ? 'Đang kết nối...' : '+ Thêm Bạn Bè 🤝'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            // TRƯỜNG HỢP 2: PHẦN PRIVATE (BẠN BÈ ĐÃ KẾT BẠN) -> ĐƯỢC PHÉP ĐẶT NGƯỜI YÊU & GIA ĐÌNH
            <View>
              <View style={styles.privateHeaderRow}>
                <Ionicons name="lock-closed" size={12} color="#F59E0B" />
                <Text style={styles.privateHeaderText}>TÙY BIẾN RIÊNG TƯ (DÀNH CHO BẠN BÈ)</Text>
              </View>

              <View style={styles.quickActionsRow}>
                <TouchableOpacity
                  style={[styles.quickActionBtn, friend.isLover && styles.quickActionBtnActive]}
                  onPress={() => setLover(friend.id)}
                >
                  <Ionicons
                    name={friend.isLover ? 'heart' : 'heart-outline'}
                    size={16}
                    color={friend.isLover ? '#EC4899' : '#94A3B8'}
                  />
                  <Text style={[styles.quickActionText, friend.isLover && { color: '#EC4899' }]}>
                    {friend.isLover ? 'Người yêu 💖' : 'Đặt làm người yêu'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickActionBtn, friend.isFamily && styles.quickActionBtnActive]}
                  onPress={() => toggleFamilyMember(friend.id)}
                >
                  <Ionicons
                    name="people-outline"
                    size={16}
                    color={friend.isFamily ? '#F59E0B' : '#94A3B8'}
                  />
                  <Text style={[styles.quickActionText, friend.isFamily && { color: '#F59E0B' }]}>
                    {friend.isFamily ? 'Gia đình 👨‍👩‍👧' : 'Thêm vào Gia đình'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Vòng tròn tham gia (Chỉ hiện khi ở private) */}
          {!isSocialMode && joinedCircles.length > 0 && (
            <View style={styles.circlesSection}>
              <Text style={styles.sectionTitle}>Vòng kết nối tham gia:</Text>
              <View style={styles.circleTagsRow}>
                {joinedCircles.map((c) => (
                  <View key={c.id} style={[styles.circleTag, { borderColor: c.color }]}>
                    <Text style={styles.circleTagText}>
                      {c.icon} {c.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* QUICK REACT EMOJIS */}
          {onSendEmoji && (
            <View style={{ marginTop: 12, marginBottom: 16 }}>
              <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '600', marginBottom: 8, alignSelf: 'center' }}>THẢ CẢM XÚC NHANH</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
                {['💖', '👋', '😂', '🍻', '🔥'].map(emoji => (
                  <TouchableOpacity 
                    key={emoji} 
                    style={{ padding: 6, backgroundColor: '#1E293B', borderRadius: 20, borderWidth: 1, borderColor: '#334155' }}
                    onPress={() => {
                      onClose(); // Đóng Modal
                      onSendEmoji(emoji);
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Footer Action Buttons */}
          {onViewProfile && (
            <TouchableOpacity
              style={[styles.chatBtn, { flex: 0, backgroundColor: '#38BDF8', marginBottom: 12, width: '100%', justifyContent: 'center', borderColor: 'transparent' }]}
              onPress={() => {
                onClose();
                onViewProfile(friend.id);
              }}
            >
              <Ionicons name="person-circle-outline" size={20} color="#FFF" />
              <Text style={styles.chatBtnText}>Xem trang cá nhân</Text>
            </TouchableOpacity>
          )}
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => {
                onClose();
                onChat(friend);
              }}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color="#FFF" />
              <Text style={styles.chatBtnText}>Nhắn tin</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.hangoutBtn}
              onPress={() => {
                onClose();
                onHangout(friend);
              }}
            >
              <LinearGradient colors={['#10B981', '#34D399']} style={styles.hangoutGradient}>
                <Ionicons name="flash" size={20} color="#FFF" />
                <Text style={styles.hangoutBtnText}>Chốt kèo đi chơi ⚡</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sheetHandle: {
    width: 44,
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  loverBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 2,
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
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  loverTag: {
    fontSize: 10,
    color: '#EC4899',
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: '700',
  },
  familyTag: {
    fontSize: 10,
    color: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: '700',
  },
  friendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(76, 217, 100, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  friendPillText: {
    fontSize: 10,
    color: '#4CD964',
    fontWeight: '700',
  },
  socialStrangerText: {
    fontSize: 11,
    color: '#38BDF8',
    marginTop: 2,
    fontWeight: '500',
  },
  nicknameDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  nicknameLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  nicknameValue: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '700',
  },
  addNicknameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  addNicknameText: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '600',
  },
  statusText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#64748B',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nicknameCardEdit: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  nicknameCardTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 6,
  },
  nicknameCardInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nicknameCardInput: {
    flex: 1,
    height: 36,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingHorizontal: 10,
    color: '#FFF',
    fontSize: 13,
  },
  saveNickBtn: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveNickBtnText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 12,
  },
  removeNickBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 10,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeNickBtnText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 11,
  },
  cancelNickBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  beaconCard: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    marginBottom: 14,
  },
  beaconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  beaconEmoji: {
    fontSize: 22,
  },
  beaconTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
  },
  beaconTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  beaconContent: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '600',
    lineHeight: 18,
  },
  socialActionContainer: {
    marginBottom: 16,
  },
  addFriendSocialBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  addFriendGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  addFriendSocialText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  alreadyFriendNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 217, 100, 0.12)',
    borderRadius: 12,
    padding: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 217, 100, 0.25)',
  },
  alreadyFriendNoticeText: {
    flex: 1,
    color: '#A7F3D0',
    fontSize: 12,
    lineHeight: 16,
  },
  privateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  privateHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.8,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  quickActionBtnActive: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: '#243046',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  circlesSection: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 6,
  },
  circleTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  circleTag: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  circleTagText: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chatBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  hangoutBtn: {
    flex: 1.3,
    borderRadius: 16,
    overflow: 'hidden',
  },
  hangoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  hangoutBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
});
