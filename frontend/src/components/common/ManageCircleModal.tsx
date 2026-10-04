import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useAuthStore } from '../../stores/authStore';
import { LinearGradient } from 'expo-linear-gradient';
import {
  FriendItem,
  SocialCircle,
  calculateDistanceKm,
  useCircleStore,
} from '../../stores/circleStore';

const { height } = Dimensions.get('window');

const DISTANCE_OPTIONS = [
  { label: '1 km', value: 1 },
  { label: '3 km', value: 3 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '20 km', value: 20 },
  { label: 'Toàn TP 🌐', value: 0 },
];

const FAMILY_ROLES = ['Mẹ 🏡', 'Bố 👔', 'Em trai 👦', 'Chị gái 👧', 'Anh trai 👦', 'Con 👶', 'Người thân ❤️'];

interface ManageCircleModalProps {
  circle: SocialCircle | null;
  visible: boolean;
  onClose: () => void;
  currentCoords?: { latitude: number; longitude: number };
}

export const ManageCircleModal: React.FC<ManageCircleModalProps> = ({
  circle,
  visible,
  onClose,
  currentCoords = { latitude: 16.0544, longitude: 108.2022 },
}) => {
  const {
    friends,
    socialDistanceRadius,
    setSocialDistanceRadius,
    socialCategoryFilter,
    setSocialCategoryFilter,
    socialOnlineOnly,
    setSocialOnlineOnly,
    socialMood,
    setSocialMood,
    socialOpenDoor,
    setSocialOpenDoor,
    setShowSameIntentModal,
    loverAnniversaryDate,
    setLoverAnniversaryDate,
    addFriend,
    addFriendByLinkOrId,
    setShowEDropModal,
    removeFriend,
    setFriendNickname,
    setFamilyRole,
    setLover,
    deleteCircle,
    updateCircle,
    addMembersToCircle,
    removeMemberFromCircle,
  } = useCircleStore();

  // Auth User
  const authUser = useAuthStore((s) => s.user);

  // State cho Thêm bạn bè mới
  const [showAddFriendForm, setShowAddFriendForm] = useState(false);
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendPhone, setNewFriendPhone] = useState('');
  const [newFriendNickname, setNewFriendNickname] = useState('');

  // State cho Cách 1: Kết bạn qua Link / ID
  const [pasteLinkInput, setPasteLinkInput] = useState('');
  const [isSubmittingLink, setIsSubmittingLink] = useState(false);

  const myProfileLink = `https://vivu.app/u/${authUser?.id || authUser?.phone || 'my_id'}`;

  // Sao chép link của chính mình để gửi cho bạn
  const handleCopyMyProfileLink = async () => {
    await Clipboard.setStringAsync(myProfileLink);
    Alert.alert('Đã sao chép link của bạn 📋', `${myProfileLink}\nHãy gửi link này cho bạn bè dán vào ô kết bạn nhé!`);
  };

  // Dán từ clipboard
  const handlePasteClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setPasteLinkInput(text.trim());
      } else {
        Alert.alert('Thông báo', 'Bộ nhớ tạm (Clipboard) đang trống.');
      }
    } catch {
      Alert.alert('Thông báo', 'Không thể đọc clipboard.');
    }
  };

  // Xác nhận kết bạn bằng link hoặc mã ID
  const handleConfirmAddByLinkOrId = async () => {
    if (!pasteLinkInput.trim()) {
      Alert.alert('Chưa nhập thông tin', 'Vui lòng dán liên kết hoặc mã ID của bạn bè!');
      return;
    }
    setIsSubmittingLink(true);
    try {
      const res = await addFriendByLinkOrId(pasteLinkInput.trim());
      Alert.alert(res.success ? 'Thành công 🎉' : 'Thông báo', res.message);
      if (res.success) {
        setPasteLinkInput('');
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể kết bạn qua link lúc này.');
    } finally {
      setIsSubmittingLink(false);
    }
  };

  // State cho Chỉnh sửa tên nhóm custom
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(circle?.name || '');

  // State cho Thêm người vào custom group hoặc gia đình
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
  const [selectedFamilyRole, setSelectedFamilyRole] = useState('Người thân ❤️');
  const [searchQuery, setSearchQuery] = useState('');

  // State cho Biệt danh inline
  const [editingNicknameFriendId, setEditingNicknameFriendId] = useState<string | null>(null);
  const [nicknameInput, setNicknameInput] = useState('');

  // State cho Ngày kỷ niệm yêu nhau
  const [anniversaryInput, setAnniversaryInput] = useState(loverAnniversaryDate || '2025-02-14');

  if (!circle) return null;

  // Tính số ngày yêu nhau nếu là tab lover
  const calculateLoveDays = () => {
    try {
      const start = new Date(loverAnniversaryDate).getTime();
      const now = Date.now();
      const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 100;
    }
  };

  // 1. Xử lý Thêm Bạn Bè Mới
  const handleAddNewFriend = async () => {
    if (!newFriendName.trim()) {
      alert('Vui lòng nhập họ tên bạn bè!');
      return;
    }
    await addFriend({
      name: newFriendName.trim(),
      phone: newFriendPhone.trim(),
      nickname: newFriendNickname.trim(),
    });
    setNewFriendName('');
    setNewFriendPhone('');
    setNewFriendNickname('');
    setShowAddFriendForm(false);
    alert('Đã kết nối bạn bè thành công!');
  };

  // 2. Xử lý Xóa bạn bè (Hủy kết bạn)
  const handleRemoveFriend = (friend: FriendItem) => {
    Alert.alert(
      'Hủy kết bạn',
      `Bạn có chắc chắn muốn hủy kết bạn với ${friend.nickname || friend.name} không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Hủy kết bạn',
          style: 'destructive',
          onPress: async () => {
            await removeFriend(friend.id);
          },
        },
      ]
    );
  };

  // 3. Xử lý Xóa thành viên khỏi nhóm hoặc gia đình
  const handleRemoveMember = (friend: FriendItem) => {
    Alert.alert(
      'Gỡ khỏi nhóm',
      `Bạn có muốn gỡ ${friend.nickname || friend.name} khỏi "${circle.name}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gỡ thành viên',
          style: 'destructive',
          onPress: () => removeMemberFromCircle(circle.id, friend.id),
        },
      ]
    );
  };

  // 4. Xử lý Xóa nhóm custom
  const handleDeleteCircle = () => {
    Alert.alert(
      'Giải tán nhóm',
      `Bạn có chắc chắn muốn xóa vĩnh viễn nhóm "${circle.name}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa nhóm',
          style: 'destructive',
          onPress: async () => {
            onClose();
            await deleteCircle(circle.id);
          },
        },
      ]
    );
  };

  // 5. Thêm thành viên vào Custom Group
  const handleConfirmAddMembers = async () => {
    if (selectedToAdd.length === 0) {
      setShowAddMembers(false);
      return;
    }
    await addMembersToCircle(circle.id, selectedToAdd);
    setSelectedToAdd([]);
    setShowAddMembers(false);
  };

  // 6. Thêm thành viên vào Gia đình kèm vai trò
  const handleAddFamilyMember = async (friendId: string) => {
    await setFamilyRole(friendId, selectedFamilyRole);
    setShowAddMembers(false);
  };

  // 7. Lưu biệt danh
  const handleSaveNickname = async (friendId: string) => {
    await setFriendNickname(friendId, nicknameInput);
    setEditingNicknameFriendId(null);
  };

  // Lọc danh sách thành viên hiện tại
  const currentMembers = friends.filter(
    (f) =>
      circle.memberIds.includes(f.id) ||
      (circle.id === 'friends' && f.isFriend) ||
      (circle.id === 'lover' && f.isLover) ||
      (circle.id === 'family' && f.isFamily)
  );

  const currentMemberIds = new Set(currentMembers.map((m) => m.id));
  const candidateFriends = friends.filter(
    (f) => !currentMemberIds.has(f.id) && f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentLover = friends.find((f) => f.isLover);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheetContainer}>
          <View style={styles.sheetHandle} />

          {/* Header Modal */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={[styles.circleIconBox, { backgroundColor: circle.color || '#3B82F6' }]}>
                <Text style={styles.circleIcon}>{circle.icon}</Text>
              </View>
              <View>
                <Text style={styles.title}>
                  {circle.id === 'social' && 'Tùy Chỉnh Xã Hội 🌐'}
                  {circle.id === 'friends' && 'Quản Lý Bạn Bè 👥'}
                  {circle.id === 'lover' && 'Không Gian Người Yêu 💖'}
                  {circle.id === 'family' && 'Vòng Tròn Gia Đình 👨‍👩‍👧'}
                  {circle.isCustom && `Quản Lý: ${circle.name}`}
                </Text>
                <Text style={styles.subtitle}>{circle.description || 'Cài đặt riêng cho vòng tròn này'}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* ========================================================
                TRƯỜNG HỢP 1: MỤC XÃ HỘI (KHOẢNG CÁCH, BÁN KÍNH, DANH MỤC)
                ======================================================== */}
            {circle.id === 'social' && (
              <View>
                {/* 0. TÂM TRẠNG & CÁNH CỬA KẾT NỐI HÔM NAY */}
                <View style={styles.moodBox}>
                  <Text style={styles.sectionTitle}>🌟 Tâm trạng & Cánh cửa kết nối hôm nay</Text>
                  <Text style={styles.sectionSubtitle}>
                    Chọn tâm trạng hôm nay để hệ thống tự động gợi ý cạ cứng cùng nguyện vọng
                  </Text>

                  <View style={styles.moodButtonsRow}>
                    {[
                      { key: 'happy' as const, icon: '🥳', label: 'Vui vẻ (Đi chơi)', desc: 'Gợi ý nhiều người mới' },
                      { key: 'normal' as const, icon: '😊', label: 'Bình thường', desc: 'Chỉ nhận bạn bè' },
                      { key: 'bad' as const, icon: '🌧️', label: 'Tồi tệ', desc: 'Tắt hết thông báo' },
                    ].map((m) => {
                      const isActive = socialMood === m.key;
                      return (
                        <TouchableOpacity
                          key={m.key}
                          style={[styles.moodCardItem, isActive && styles.moodCardItemActive]}
                          onPress={() => setSocialMood(m.key)}
                        >
                          <Text style={styles.moodCardEmoji}>{m.icon}</Text>
                          <Text style={[styles.moodCardLabel, isActive && styles.moodCardLabelActive]}>
                            {m.label}
                          </Text>
                          <Text style={styles.moodCardDesc}>{m.desc}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Switch Mở Cửa */}
                  <TouchableOpacity
                    style={styles.openDoorRow}
                    activeOpacity={0.8}
                    onPress={() => setSocialOpenDoor(!socialOpenDoor)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.openDoorTitle}>🚪 Chế độ Mở cửa đón nhận bạn bè mới</Text>
                      <Text style={styles.openDoorDesc}>
                        {socialOpenDoor
                          ? 'Đang bật: Sẵn sàng kết nối với người có cùng nguyện vọng'
                          : 'Đang tắt: Giữ riêng tư, chỉ kết nối người quen'}
                      </Text>
                    </View>
                    <View style={[styles.toggleSwitch, socialOpenDoor && styles.toggleSwitchActive]}>
                      <View style={[styles.toggleThumb, socialOpenDoor && styles.toggleThumbActive]} />
                    </View>
                  </TouchableOpacity>

                  {/* Nút xem danh sách gợi ý cùng nguyện vọng */}
                  {socialMood !== 'bad' && (
                    <TouchableOpacity
                      style={styles.viewMatchesBtn}
                      onPress={() => {
                        onClose();
                        setShowSameIntentModal(true);
                      }}
                    >
                      <LinearGradient
                        colors={['#FF4B72', '#8B5CF6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.viewMatchesGradient}
                      >
                        <Ionicons name="sparkles" size={16} color="#FFF" />
                        <Text style={styles.viewMatchesText}>
                          Xem cạ cứng có cùng nguyện vọng ngay ✨
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>

                {/* 1. Tính năng khoảng cách */}
                <Text style={styles.sectionTitle}>📍 Khoảng cách quét tín hiệu (Bán kính)</Text>
                <Text style={styles.sectionSubtitle}>
                  Chỉ hiển thị các tín hiệu và người dùng trong bán kính được chọn quanh vị trí của bạn
                </Text>

                <View style={styles.distanceGrid}>
                  {DISTANCE_OPTIONS.map((opt) => {
                    const isSelected = socialDistanceRadius === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.distancePill, isSelected && styles.distancePillActive]}
                        onPress={() => setSocialDistanceRadius(opt.value)}
                      >
                        <Text style={[styles.distancePillText, isSelected && styles.distancePillTextActive]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 2. Lọc theo danh mục */}
                <Text style={[styles.sectionTitle, { marginTop: 18 }]}>🎯 Lọc theo danh mục tín hiệu</Text>
                <View style={styles.categoryRow}>
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'cafe', label: '☕ Cafe' },
                    { id: 'sport', label: '🏸 Thể thao' },
                    { id: 'food', label: '🍔 Ăn uống' },
                    { id: 'study', label: '📚 Học tập' },
                    { id: 'travel', label: '🏍️ Vi vu' },
                  ].map((cat) => {
                    const isActive = socialCategoryFilter === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[styles.catChip, isActive && styles.catChipActive]}
                        onPress={() => setSocialCategoryFilter(cat.id)}
                      >
                        <Text style={[styles.catChipText, isActive && styles.catChipTextActive]}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 3. Lọc người dùng online */}
                <TouchableOpacity
                  style={styles.toggleRow}
                  activeOpacity={0.8}
                  onPress={() => setSocialOnlineOnly(!socialOnlineOnly)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.toggleTitle}>🟢 Chỉ hiển thị người dùng đang Online</Text>
                    <Text style={styles.toggleDesc}>Ẩn các tài khoản không hoạt động trong 24 giờ</Text>
                  </View>
                  <View style={[styles.toggleSwitch, socialOnlineOnly && styles.toggleSwitchActive]}>
                    <View style={[styles.toggleThumb, socialOnlineOnly && styles.toggleThumbActive]} />
                  </View>
                </TouchableOpacity>

                <View style={styles.socialStatsCard}>
                  <Ionicons name="sparkles" size={18} color="#38BDF8" />
                  <Text style={styles.socialStatsText}>
                    {socialDistanceRadius === 0
                      ? 'Đang quét toàn thành phố Đà Nẵng'
                      : `Đang quét trong bán kính ${socialDistanceRadius}km quanh bạn`}
                  </Text>
                </View>
              </View>
            )}

            {/* ========================================================
                TRƯỜNG HỢP 2: MỤC BẠN BÈ (THÊM BẠN, XÓA BẠN, ĐẶT BIỆT DANH)
                ======================================================== */}
            {circle.id === 'friends' && (
              <View>
                {/* Thanh tiêu đề & Nút Thêm bạn mới */}
                <View style={styles.actionHeaderRow}>
                  <Text style={styles.sectionTitle}>Danh sách bạn bè ({currentMembers.length})</Text>
                  <TouchableOpacity
                    style={styles.actionBtnHeader}
                    onPress={() => setShowAddFriendForm(!showAddFriendForm)}
                  >
                    <Ionicons name={showAddFriendForm ? 'close' : 'person-add'} size={14} color="#FFF" />
                    <Text style={styles.actionBtnHeaderText}>
                      {showAddFriendForm ? 'Đóng' : '+ Thêm bạn'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* CÁCH 3: E-DROP 1 CHẠM (CHỈ HOẠT ĐỘNG KHI CẢ 2 Ở TRONG APP) */}
                <TouchableOpacity
                  style={styles.edropBanner}
                  activeOpacity={0.88}
                  onPress={() => setShowEDropModal(true)}
                >
                  <LinearGradient
                    colors={['#0052D4', '#4364F7', '#6FB1FC']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.edropGradient}
                  >
                    <View style={styles.edropIconCircle}>
                      <Ionicons name="flash" size={22} color="#FFE600" />
                    </View>
                    <View style={styles.edropTextWrap}>
                      <View style={styles.edropTitleRow}>
                        <Text style={styles.edropTitle}>⚡ VIVU E-Drop 1 Chạm</Text>
                        <View style={styles.edropTag}>
                          <Text style={styles.edropTagText}>Trong App</Text>
                        </View>
                      </View>
                      <Text style={styles.edropDesc}>
                        Chạm 2 máy gần nhau khi cả 2 cùng mở app VIVU để kết bạn siêu tốc!
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#FFF" />
                  </LinearGradient>
                </TouchableOpacity>

                {/* CÁCH 1: DÁN LINK HOẶC MÃ ID KẾT BẠN */}
                <View style={styles.linkAddCard}>
                  <View style={styles.linkHeaderRow}>
                    <Ionicons name="link-outline" size={18} color="#38BDF8" />
                    <Text style={styles.linkAddTitle}>Cách 1: Dán Link Người Muốn Kết Bạn</Text>
                  </View>

                  <View style={styles.pasteInputRow}>
                    <TextInput
                      style={styles.pasteInput}
                      placeholder="Dán link (https://vivu.app/u/...) hoặc ID..."
                      placeholderTextColor="#64748B"
                      value={pasteLinkInput}
                      onChangeText={setPasteLinkInput}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity style={styles.pasteClipboardBtn} onPress={handlePasteClipboard}>
                      <Ionicons name="clipboard-outline" size={16} color="#38BDF8" />
                      <Text style={styles.pasteClipboardText}>Dán</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.linkActionsRow}>
                    <TouchableOpacity
                      style={styles.confirmLinkBtn}
                      onPress={handleConfirmAddByLinkOrId}
                      disabled={isSubmittingLink}
                    >
                      <Ionicons name="person-add" size={14} color="#FFF" />
                      <Text style={styles.confirmLinkBtnText}>Kết bạn qua link 🔗</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.copyMyLinkBtn}
                      onPress={handleCopyMyProfileLink}
                    >
                      <Ionicons name="copy-outline" size={14} color="#CBD5E1" />
                      <Text style={styles.copyMyLinkBtnText}>Chép link của tôi</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Form thêm bạn bè thủ công (Nếu bấm "+ Thêm bạn") */}
                {showAddFriendForm && (
                  <View style={styles.addFriendCard}>
                    <Text style={styles.addFriendCardTitle}>Thêm bạn bè thủ công bằng Họ Tên & Số ĐT:</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="Họ và tên bạn bè..."
                      placeholderTextColor="#64748B"
                      value={newFriendName}
                      onChangeText={setNewFriendName}
                    />
                    <TextInput
                      style={styles.formInput}
                      placeholder="Số điện thoại / Zalo (Tùy chọn)..."
                      placeholderTextColor="#64748B"
                      keyboardType="phone-pad"
                      value={newFriendPhone}
                      onChangeText={setNewFriendPhone}
                    />
                    <TextInput
                      style={styles.formInput}
                      placeholder="Biệt danh riêng (VD: Cạ cứng, Bạn thân...)..."
                      placeholderTextColor="#64748B"
                      value={newFriendNickname}
                      onChangeText={setNewFriendNickname}
                    />
                    <TouchableOpacity style={styles.confirmAddFriendBtn} onPress={handleAddNewFriend}>
                      <Text style={styles.confirmAddFriendBtnText}>Xác nhận kết bạn ngay ✨</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Danh sách bạn bè hiện tại (kèm nút xóa bạn & sửa biệt danh) */}
                <View style={styles.membersList}>
                  {currentMembers.map((friend) => {
                    const isEditingThis = editingNicknameFriendId === friend.id;
                    const dist = calculateDistanceKm(
                      currentCoords.latitude,
                      currentCoords.longitude,
                      friend.latitude,
                      friend.longitude
                    );

                    return (
                      <View key={friend.id} style={styles.memberCard}>
                        <Image source={{ uri: friend.avatar }} style={styles.memberAvatar} />
                        <View style={styles.memberDetails}>
                          <View style={styles.memberNameRow}>
                            <Text style={styles.memberName}>{friend.name}</Text>
                            {friend.nickname && (
                              <View style={styles.nicknameBadge}>
                                <Text style={styles.nicknameBadgeText}>"{friend.nickname}"</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.memberStatusText}>
                            Cách {dist} km • 🔋 {friend.batteryLevel}% • {friend.statusText || '🟢 Online'}
                          </Text>

                          {isEditingThis && (
                            <View style={styles.nicknameEditRow}>
                              <TextInput
                                style={styles.nicknameInput}
                                placeholder="Nhập biệt danh..."
                                placeholderTextColor="#64748B"
                                value={nicknameInput}
                                onChangeText={setNicknameInput}
                                autoFocus
                              />
                              <TouchableOpacity
                                style={styles.nicknameSaveBtn}
                                onPress={() => handleSaveNickname(friend.id)}
                              >
                                <Ionicons name="checkmark" size={16} color="#FFF" />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.nicknameCancelBtn}
                                onPress={() => setEditingNicknameFriendId(null)}
                              >
                                <Ionicons name="close" size={16} color="#94A3B8" />
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>

                        {/* Nút Đặt biệt danh & Nút XÓA BẠN BÈ */}
                        <View style={styles.memberActions}>
                          <TouchableOpacity
                            style={styles.nicknameActionBtn}
                            onPress={() => {
                              setEditingNicknameFriendId(friend.id);
                              setNicknameInput(friend.nickname || '');
                            }}
                          >
                            <Ionicons name="pencil-outline" size={16} color="#38BDF8" />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.removeActionBtn}
                            onPress={() => handleRemoveFriend(friend)}
                          >
                            <Ionicons name="person-remove-outline" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ========================================================
                TRƯỜNG HỢP 3: MỤC NGƯỜI YÊU (CHỌN/ĐỔI NGƯỜI YÊU, NGÀY KỶ NIỆM)
                ======================================================== */}
            {circle.id === 'lover' && (
              <View>
                {/* Khối người yêu hiện tại */}
                {currentLover ? (
                  <View style={styles.loverHighlightCard}>
                    <View style={styles.loverTopRow}>
                      <Image source={{ uri: currentLover.avatar }} style={styles.loverBigAvatar} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.loverTagHeader}>💖 Người Yêu Hiện Tại</Text>
                        <Text style={styles.loverBigName}>{currentLover.nickname || currentLover.name}</Text>
                        <Text style={styles.loverRealName}>({currentLover.name})</Text>
                        <Text style={styles.loverDistanceText}>
                          📍 Đang cách bạn{' '}
                          {calculateDistanceKm(
                            currentCoords.latitude,
                            currentCoords.longitude,
                            currentLover.latitude,
                            currentLover.longitude
                          )}{' '}
                          km
                        </Text>
                      </View>
                    </View>

                    {/* Bộ đếm ngày yêu nhau */}
                    <View style={styles.loveDaysBox}>
                      <Text style={styles.loveDaysCount}>Đã bên nhau {calculateLoveDays()} ngày 💕</Text>
                      <Text style={styles.loveDaysSub}>Ngày bắt đầu: {loverAnniversaryDate}</Text>
                    </View>

                    <View style={styles.loverBtnsRow}>
                      <TouchableOpacity
                        style={styles.loverEditNickBtn}
                        onPress={() => {
                          setEditingNicknameFriendId(currentLover.id);
                          setNicknameInput(currentLover.nickname || '');
                        }}
                      >
                        <Ionicons name="pencil" size={14} color="#FFF" />
                        <Text style={styles.loverEditNickText}>Đổi biệt danh ngọt ngào</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.loverUnsetBtn}
                        onPress={() => {
                          Alert.alert('Hủy người yêu', 'Bạn có muốn hủy trạng thái người yêu này không?', [
                            { text: 'Không', style: 'cancel' },
                            { text: 'Xác nhận hủy', style: 'destructive', onPress: () => setLover(currentLover.id) },
                          ]);
                        }}
                      >
                        <Ionicons name="heart-dislike" size={14} color="#EF4444" />
                        <Text style={styles.loverUnsetText}>Hủy ghép đôi</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Sửa biệt danh cho người yêu */}
                    {editingNicknameFriendId === currentLover.id && (
                      <View style={[styles.nicknameEditRow, { marginTop: 12 }]}>
                        <TextInput
                          style={styles.nicknameInput}
                          placeholder="VD: Bé iu, Công chúa, Chồng iu..."
                          placeholderTextColor="#64748B"
                          value={nicknameInput}
                          onChangeText={setNicknameInput}
                          autoFocus
                        />
                        <TouchableOpacity
                          style={styles.nicknameSaveBtn}
                          onPress={() => handleSaveNickname(currentLover.id)}
                        >
                          <Ionicons name="checkmark" size={16} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.emptyLoverCard}>
                    <Text style={{ fontSize: 36, marginBottom: 8 }}>💔</Text>
                    <Text style={styles.emptyLoverTitle}>Chưa ghép đôi người yêu</Text>
                    <Text style={styles.emptyLoverDesc}>
                      Hãy chọn một người bạn trong danh sách bên dưới để thiết lập làm Người Yêu!
                    </Text>
                  </View>
                )}

                {/* Chọn ngày kỷ niệm yêu nhau */}
                <View style={styles.anniversaryInputCard}>
                  <Text style={styles.anniversaryCardTitle}>📅 Cài đặt ngày kỷ niệm yêu nhau:</Text>
                  <View style={styles.anniversaryRow}>
                    <TextInput
                      style={styles.anniversaryTextInput}
                      placeholder="YYYY-MM-DD (VD: 2025-02-14)"
                      placeholderTextColor="#64748B"
                      value={anniversaryInput}
                      onChangeText={setAnniversaryInput}
                    />
                    <TouchableOpacity
                      style={styles.saveAnniversaryBtn}
                      onPress={async () => {
                        await setLoverAnniversaryDate(anniversaryInput);
                        alert('Đã cập nhật ngày kỷ niệm yêu nhau!');
                      }}
                    >
                      <Text style={styles.saveAnniversaryBtnText}>Lưu ngày</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Danh sách bạn bè để chọn làm người yêu mới */}
                <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
                  {currentLover ? 'Hoặc chọn người yêu khác từ bạn bè:' : 'Chọn người yêu từ danh sách bạn bè:'}
                </Text>
                <View style={{ gap: 8, marginTop: 8 }}>
                  {friends
                    .filter((f) => f.id !== currentLover?.id)
                    .map((f) => (
                      <TouchableOpacity
                        key={f.id}
                        style={styles.chooseLoverRow}
                        onPress={() => setLover(f.id)}
                      >
                        <Image source={{ uri: f.avatar }} style={styles.memberAvatarSmall} />
                        <Text style={styles.chooseLoverName}>{f.nickname || f.name}</Text>
                        <View style={styles.heartSelectBtn}>
                          <Ionicons name="heart-outline" size={16} color="#EC4899" />
                          <Text style={styles.heartSelectText}>Chọn</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>
            )}

            {/* ========================================================
                TRƯỜNG HỢP 4: MỤC GIA ĐÌNH (THÊM THÀNH VIÊN, GỠ THÀNH VIÊN, VAI TRÒ)
                ======================================================== */}
            {circle.id === 'family' && (
              <View>
                <View style={styles.actionHeaderRow}>
                  <Text style={styles.sectionTitle}>Thành viên gia đình ({currentMembers.length})</Text>
                  <TouchableOpacity
                    style={styles.actionBtnHeader}
                    onPress={() => setShowAddMembers(!showAddMembers)}
                  >
                    <Ionicons name={showAddMembers ? 'close' : 'person-add'} size={14} color="#FFF" />
                    <Text style={styles.actionBtnHeaderText}>
                      {showAddMembers ? 'Đóng' : '+ Thêm người thân'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Form thêm người thân vào gia đình */}
                {showAddMembers && (
                  <View style={styles.addFamilyCard}>
                    <Text style={styles.addFamilyCardTitle}>1. Chọn vai trò trong gia đình:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                      {FAMILY_ROLES.map((role) => (
                        <TouchableOpacity
                          key={role}
                          style={[styles.roleChip, selectedFamilyRole === role && styles.roleChipActive]}
                          onPress={() => setSelectedFamilyRole(role)}
                        >
                          <Text style={[styles.roleChipText, selectedFamilyRole === role && styles.roleChipTextActive]}>
                            {role}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <Text style={styles.addFamilyCardTitle}>2. Chọn bạn bè để đưa vào gia đình:</Text>
                    {candidateFriends.length === 0 ? (
                      <Text style={styles.emptyText}>Tất cả bạn bè đã có trong gia đình!</Text>
                    ) : (
                      <View style={{ gap: 6 }}>
                        {candidateFriends.map((f) => (
                          <TouchableOpacity
                            key={f.id}
                            style={styles.addFamilyFriendRow}
                            onPress={() => handleAddFamilyMember(f.id)}
                          >
                            <Image source={{ uri: f.avatar }} style={styles.memberAvatarSmall} />
                            <Text style={styles.addFamilyFriendName}>{f.nickname || f.name}</Text>
                            <View style={styles.addFamilyActionBadge}>
                              <Ionicons name="add" size={14} color="#FFF" />
                              <Text style={styles.addFamilyActionText}>Thêm ({selectedFamilyRole})</Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* Danh sách thành viên gia đình hiện tại */}
                <View style={styles.membersList}>
                  {currentMembers.map((member) => {
                    const isEditingThis = editingNicknameFriendId === member.id;
                    const isLowBattery = member.batteryLevel <= 20;

                    return (
                      <View key={member.id} style={styles.memberCard}>
                        <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                        <View style={styles.memberDetails}>
                          <View style={styles.memberNameRow}>
                            <Text style={styles.memberName}>{member.name}</Text>
                            <View style={styles.familyRoleBadge}>
                              <Text style={styles.familyRoleBadgeText}>{member.familyRole || 'Người thân 👨‍👩‍👧'}</Text>
                            </View>
                            {member.nickname && (
                              <View style={styles.nicknameBadge}>
                                <Text style={styles.nicknameBadgeText}>"{member.nickname}"</Text>
                              </View>
                            )}
                          </View>

                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                            <Ionicons
                              name={isLowBattery ? 'battery-dead' : 'battery-charging'}
                              size={14}
                              color={isLowBattery ? '#EF4444' : '#10B981'}
                            />
                            <Text
                              style={[
                                styles.memberStatusText,
                                isLowBattery && { color: '#EF4444', fontWeight: 'bold' },
                              ]}
                            >
                              Pin: {member.batteryLevel}% {isLowBattery && '⚠️ Pin yếu!'}
                            </Text>
                          </View>

                          {isEditingThis && (
                            <View style={styles.nicknameEditRow}>
                              <TextInput
                                style={styles.nicknameInput}
                                placeholder="Biệt danh trong nhà..."
                                placeholderTextColor="#64748B"
                                value={nicknameInput}
                                onChangeText={setNicknameInput}
                                autoFocus
                              />
                              <TouchableOpacity
                                style={styles.nicknameSaveBtn}
                                onPress={() => handleSaveNickname(member.id)}
                              >
                                <Ionicons name="checkmark" size={16} color="#FFF" />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.nicknameCancelBtn}
                                onPress={() => setEditingNicknameFriendId(null)}
                              >
                                <Ionicons name="close" size={16} color="#94A3B8" />
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>

                        {/* Nút sửa biệt danh & Gỡ khỏi gia đình */}
                        <View style={styles.memberActions}>
                          <TouchableOpacity
                            style={styles.nicknameActionBtn}
                            onPress={() => {
                              setEditingNicknameFriendId(member.id);
                              setNicknameInput(member.nickname || '');
                            }}
                          >
                            <Ionicons name="pencil-outline" size={16} color="#38BDF8" />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.removeActionBtn}
                            onPress={() => handleRemoveMember(member)}
                          >
                            <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ========================================================
                TRƯỜNG HỢP 5: MỤC HỘI NHÓM TÙY BIẾN (CUSTOM GROUP)
                ======================================================== */}
            {circle.isCustom && (
              <View>
                {/* Đổi tên nhóm */}
                <View style={styles.customGroupHeaderCard}>
                  {isEditingName ? (
                    <View style={styles.editNameRow}>
                      <TextInput
                        style={styles.editNameInput}
                        value={editedName}
                        onChangeText={setEditedName}
                        placeholder="Tên hội nhóm..."
                        placeholderTextColor="#64748B"
                        autoFocus
                      />
                      <TouchableOpacity
                        style={styles.saveNameBtn}
                        onPress={async () => {
                          if (!editedName.trim()) return;
                          await updateCircle(circle.id, { name: editedName.trim() });
                          setIsEditingName(false);
                        }}
                      >
                        <Ionicons name="checkmark" size={18} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={styles.customGroupNameTitle}>{circle.icon} {circle.name}</Text>
                      <TouchableOpacity onPress={() => setIsEditingName(true)} style={styles.editNameIconBtn}>
                        <Ionicons name="pencil" size={14} color="#38BDF8" />
                        <Text style={styles.editNameIconText}>Đổi tên</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Thêm thành viên vào nhóm */}
                <View style={[styles.actionHeaderRow, { marginTop: 14 }]}>
                  <Text style={styles.sectionTitle}>Thành viên nhóm ({currentMembers.length})</Text>
                  <TouchableOpacity
                    style={styles.actionBtnHeader}
                    onPress={() => setShowAddMembers(!showAddMembers)}
                  >
                    <Ionicons name={showAddMembers ? 'close' : 'person-add'} size={14} color="#FFF" />
                    <Text style={styles.actionBtnHeaderText}>{showAddMembers ? 'Đóng' : '+ Thêm bạn'}</Text>
                  </TouchableOpacity>
                </View>

                {showAddMembers && (
                  <View style={styles.addMembersBox}>
                    <Text style={styles.addMembersBoxTitle}>Chọn bạn bè thêm vào {circle.name}:</Text>
                    {candidateFriends.length === 0 ? (
                      <Text style={styles.emptyText}>Tất cả bạn bè đã có trong nhóm!</Text>
                    ) : (
                      <View style={{ gap: 6 }}>
                        {candidateFriends.map((f) => {
                          const isSelected = selectedToAdd.includes(f.id);
                          return (
                            <TouchableOpacity
                              key={f.id}
                              style={[styles.addFriendRow, isSelected && styles.addFriendRowSelected]}
                              onPress={() => {
                                if (isSelected) {
                                  setSelectedToAdd(selectedToAdd.filter((id) => id !== f.id));
                                } else {
                                  setSelectedToAdd([...selectedToAdd, f.id]);
                                }
                              }}
                            >
                              <Image source={{ uri: f.avatar }} style={styles.memberAvatarSmall} />
                              <Text style={styles.addFriendName}>{f.nickname || f.name}</Text>
                              <View
                                style={[
                                  styles.checkbox,
                                  isSelected && { backgroundColor: circle.color, borderColor: circle.color },
                                ]}
                              >
                                {isSelected && <Ionicons name="checkmark" size={12} color="#FFF" />}
                              </View>
                            </TouchableOpacity>
                          );
                        })}

                        <TouchableOpacity
                          style={[styles.confirmAddBtn, { backgroundColor: circle.color || '#8B5CF6' }]}
                          onPress={handleConfirmAddMembers}
                        >
                          <Text style={styles.confirmAddBtnText}>
                            Xác nhận thêm ({selectedToAdd.length}) bạn vào nhóm
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                {/* Danh sách thành viên nhóm */}
                <View style={styles.membersList}>
                  {currentMembers.map((member) => {
                    const isEditingThis = editingNicknameFriendId === member.id;
                    return (
                      <View key={member.id} style={styles.memberCard}>
                        <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                        <View style={styles.memberDetails}>
                          <View style={styles.memberNameRow}>
                            <Text style={styles.memberName}>{member.name}</Text>
                            {member.nickname && (
                              <View style={styles.nicknameBadge}>
                                <Text style={styles.nicknameBadgeText}>"{member.nickname}"</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.memberStatusText}>
                            🔋 {member.batteryLevel}% • {member.statusText || '🟢 Online'}
                          </Text>

                          {isEditingThis && (
                            <View style={styles.nicknameEditRow}>
                              <TextInput
                                style={styles.nicknameInput}
                                placeholder="Biệt danh trong nhóm..."
                                placeholderTextColor="#64748B"
                                value={nicknameInput}
                                onChangeText={setNicknameInput}
                                autoFocus
                              />
                              <TouchableOpacity
                                style={styles.nicknameSaveBtn}
                                onPress={() => handleSaveNickname(member.id)}
                              >
                                <Ionicons name="checkmark" size={16} color="#FFF" />
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>

                        <View style={styles.memberActions}>
                          <TouchableOpacity
                            style={styles.nicknameActionBtn}
                            onPress={() => {
                              setEditingNicknameFriendId(member.id);
                              setNicknameInput(member.nickname || '');
                            }}
                          >
                            <Ionicons name="pencil-outline" size={16} color="#38BDF8" />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.removeActionBtn}
                            onPress={() => handleRemoveMember(member)}
                          >
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Nút Xóa / Giải tán Nhóm */}
                <TouchableOpacity
                  style={styles.deleteGroupBtn}
                  onPress={handleDeleteCircle}
                  activeOpacity={0.85}
                >
                  <Ionicons name="trash" size={18} color="#EF4444" />
                  <Text style={styles.deleteGroupText}>Giải tán & Xóa nhóm này</Text>
                </TouchableOpacity>
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
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  circleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleIcon: {
    fontSize: 22,
  },
  title: {
    fontSize: 18,
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
  content: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 12,
  },
  moodBox: {
    backgroundColor: 'rgba(255, 75, 114, 0.08)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 75, 114, 0.25)',
  },
  moodButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  moodCardItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  moodCardItemActive: {
    borderColor: '#FF4B72',
    backgroundColor: 'rgba(255, 75, 114, 0.2)',
  },
  moodCardEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  moodCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textAlign: 'center',
  },
  moodCardLabelActive: {
    color: '#FF4B72',
    fontWeight: '800',
  },
  moodCardDesc: {
    fontSize: 9,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
  openDoorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  openDoorTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  openDoorDesc: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  viewMatchesBtn: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  viewMatchesGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
  },
  viewMatchesText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
  },
  distanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  distancePill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  distancePillActive: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  distancePillText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
  },
  distancePillTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  catChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  catChipActive: {
    borderColor: '#FF4B72',
    backgroundColor: 'rgba(255, 75, 114, 0.15)',
  },
  catChipText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  catChipTextActive: {
    color: '#FF4B72',
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  toggleDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#334155',
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#10B981',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  socialStatsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  socialStatsText: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '600',
  },
  actionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionBtnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  actionBtnHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  
  edropBanner: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#4364F7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  edropGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  edropIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  edropTextWrap: {
    flex: 1,
  },
  edropTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  edropTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  edropTag: {
    backgroundColor: 'rgba(255, 230, 0, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  edropTagText: {
    color: '#FFE600',
    fontSize: 10,
    fontWeight: '800',
  },
  edropDesc: {
    color: '#E0E7FF',
    fontSize: 12,
    lineHeight: 16,
  },
  linkAddCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  linkHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  linkAddTitle: {
    fontSize: 13,
    color: '#38BDF8',
    fontWeight: '700',
  },
  pasteInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    height: 44,
    marginBottom: 10,
  },
  pasteInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 13,
    paddingVertical: 0,
  },
  pasteClipboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  pasteClipboardText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  linkActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  confirmLinkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  confirmLinkBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  copyMyLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 5,
  },
  copyMyLinkBtnText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  addFriendCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.3)',
  },
  addFriendCardTitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
    marginBottom: 10,
  },
  formInput: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    height: 40,
    paddingHorizontal: 12,
    color: '#FFF',
    fontSize: 13,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  confirmAddFriendBtn: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  confirmAddFriendBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  membersList: {
    gap: 10,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  memberAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  memberDetails: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  nicknameBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  nicknameBadgeText: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '700',
  },
  familyRoleBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  familyRoleBadgeText: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '700',
  },
  memberStatusText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  nicknameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  nicknameInput: {
    flex: 1,
    height: 32,
    backgroundColor: '#0F172A',
    borderRadius: 6,
    paddingHorizontal: 8,
    color: '#FFF',
    fontSize: 12,
  },
  nicknameSaveBtn: {
    backgroundColor: '#10B981',
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nicknameCancelBtn: {
    backgroundColor: '#334155',
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 6,
  },
  nicknameActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loverHighlightCard: {
    backgroundColor: 'rgba(236, 72, 153, 0.12)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#EC4899',
    marginBottom: 16,
  },
  loverTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  loverBigAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#EC4899',
  },
  loverTagHeader: {
    fontSize: 11,
    color: '#EC4899',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  loverBigName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 2,
  },
  loverRealName: {
    fontSize: 12,
    color: '#94A3B8',
  },
  loverDistanceText: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '600',
    marginTop: 4,
  },
  loveDaysBox: {
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  loveDaysCount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  loveDaysSub: {
    fontSize: 11,
    color: '#F472B6',
    marginTop: 2,
  },
  loverBtnsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  loverEditNickBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EC4899',
    paddingVertical: 10,
    borderRadius: 12,
  },
  loverEditNickText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  loverUnsetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  loverUnsetText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyLoverCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyLoverTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  emptyLoverDesc: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  anniversaryInputCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  anniversaryCardTitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
    marginBottom: 8,
  },
  anniversaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  anniversaryTextInput: {
    flex: 1,
    height: 38,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingHorizontal: 10,
    color: '#FFF',
    fontSize: 13,
  },
  saveAnniversaryBtn: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveAnniversaryBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  chooseLoverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 14,
  },
  chooseLoverName: {
    flex: 1,
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  heartSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  heartSelectText: {
    color: '#EC4899',
    fontSize: 12,
    fontWeight: '700',
  },
  addFamilyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  addFamilyCardTitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
    marginBottom: 8,
  },
  roleChip: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    marginRight: 8,
  },
  roleChipActive: {
    backgroundColor: '#F59E0B',
  },
  roleChipText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  roleChipTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  addFamilyFriendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 8,
    borderRadius: 10,
  },
  addFamilyFriendName: {
    flex: 1,
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  addFamilyActionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addFamilyActionText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '800',
  },
  customGroupHeaderCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
  },
  customGroupNameTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  editNameIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  editNameIconText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  editNameRow: {
    flexDirection: 'row',
    gap: 8,
  },
  editNameInput: {
    flex: 1,
    height: 38,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingHorizontal: 10,
    color: '#FFF',
    fontSize: 13,
  },
  saveNameBtn: {
    backgroundColor: '#10B981',
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMembersBox: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  addMembersBoxTitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 8,
  },
  addFriendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 8,
    borderRadius: 10,
  },
  addFriendRowSelected: {
    backgroundColor: '#1E3A8A',
  },
  addFriendName: {
    flex: 1,
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmAddBtn: {
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmAddBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  deleteGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 20,
  },
  deleteGroupText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
});
