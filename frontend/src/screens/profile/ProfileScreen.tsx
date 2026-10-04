import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, SHADOWS } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { ScreenKey } from '../../types';

const { width } = Dimensions.get('window');

interface ProfileScreenProps {
  onNavigate: (screen: ScreenKey, params?: any) => void;
  showBottomBar?: boolean;
}

const AVAILABLE_TAGS = [
  { label: 'Cà phê acoustic', icon: 'cafe' },
  { label: 'Cầu lông', icon: 'tennisball' },
  { label: 'Ẩm thực đường phố', icon: 'restaurant' },
  { label: 'Trí tuệ nhân tạo', icon: 'hardware-chip' },
  { label: 'Nhiếp ảnh', icon: 'camera' },
  { label: 'Cắm trại Sơn Trà', icon: 'bonfire' },
  { label: 'Chạy bộ', icon: 'walk' },
  { label: 'Boardgame', icon: 'game-controller' },
  { label: 'Phim ảnh', icon: 'film' },
  { label: 'Leo núi', icon: 'trail-sign' },
  { label: 'Nghe nhạc Chill', icon: 'musical-notes' },
];

const ZODIAC_LIST = [
  'Bạch Dương ♈', 'Kim Ngưu ♉', 'Song Tử ♊', 'Cự Giải ♋',
  'Sư Tử ♌', 'Xử Nữ ♍', 'Thiên Bình ♎', 'Bọ Cạp ♏',
  'Nhân Mã ♐', 'Ma Kết ♑', 'Bảo Bình ♒', 'Song Ngư ♓',
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate }) => {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);

  // Danh sách ảnh công khai (Public Photos)
  const photoList: string[] =
    user?.photos && user.photos.length > 0
      ? user.photos
      : user?.avatar
      ? [user.avatar]
      : [];

  // Danh sách ảnh trong Kho Riêng Tư (Private Vault)
  const privatePhotoList: string[] = user?.privatePhotos || [];

  // Ảnh được ghim lên trang chính
  const pinnedPhoto: string =
    user?.pinnedPhoto || (photoList.length > 0 ? photoList[0] : '');

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Modals
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryTab, setGalleryTab] = useState<'public' | 'private'>('public');
  const [showEditModal, setShowEditModal] = useState(false);

  // Chế độ Bóng Ma (Ghost Mode kiểu Jagat)
  const [ghostMode, setGhostMode] = useState<'precise' | 'blurred' | 'frozen'>(
    user?.ghostMode || 'precise'
  );

  // Edit profile form state
  const [editName, setEditName] = useState(user?.name || '');
  const [editAge, setEditAge] = useState(user?.age ? user.age.toString() : '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editOccupation, setEditOccupation] = useState(user?.occupation || '');
  const [editEducation, setEditEducation] = useState(user?.education || '');
  const [editZodiac, setEditZodiac] = useState(user?.zodiac || '');
  const [editInterests, setEditInterests] = useState<string[]>(user?.interests || []);

  // Đồng bộ khi user thay đổi
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditAge(user.age ? user.age.toString() : '');
      setEditBio(user.bio || '');
      setEditOccupation(user.occupation || '');
      setEditEducation(user.education || '');
      setEditZodiac(user.zodiac || '');
      setEditInterests(user.interests || []);
      setGhostMode(user.ghostMode || 'precise');
    }
  }, [user]);

  // Chuyển ảnh trong album Tinder khi chạm vào nửa trái / phải
  const handlePhotoTouch = (evt: any) => {
    if (photoList.length <= 1) return;
    const touchX = evt.nativeEvent.locationX;
    const cardWidth = width - 32;
    if (touchX > cardWidth / 2) {
      setActivePhotoIndex((prev) => (prev < photoList.length - 1 ? prev + 1 : 0));
    } else {
      setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : photoList.length - 1));
    }
  };

  // Chọn thêm ảnh vào Kho Công Khai
  const handlePickPublicPhoto = async () => {
    if (photoList.length >= 6) {
      Alert.alert(
        'Kho công khai đã đầy',
        'Kho công khai hiển thị tối đa 6 ảnh. Vui lòng chuyển bớt ảnh vào Kho Riêng hoặc xóa bớt để thêm mới.'
      );
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        const newUri = result.assets[0].uri;
        const currentPhotos = user?.photos || (user?.avatar ? [user.avatar] : []);
        const updated = [...currentPhotos, newUri];
        updateUser({
          photos: updated,
          avatar: user?.avatar || updated[0],
          pinnedPhoto: user?.pinnedPhoto || updated[0],
        });
        Alert.alert('Thành công', 'Đã thêm ảnh vào Kho Công Khai!');
      }
    } catch {
      Alert.alert('Thông báo', 'Không thể mở thư viện ảnh.');
    }
  };

  // Chọn thêm ảnh vào Kho Riêng Tư (Chỉ mình bạn thấy)
  const handlePickPrivatePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        const newUri = result.assets[0].uri;
        const currentPrivate = user?.privatePhotos || [];
        const updated = [...currentPrivate, newUri];
        updateUser({ privatePhotos: updated });
        Alert.alert('Thành công 🔒', 'Đã lưu ảnh vào Kho Riêng Tư bí mật! Người khác sẽ không thể xem ảnh này.');
      }
    } catch {
      Alert.alert('Thông báo', 'Không thể mở thư viện ảnh.');
    }
  };

  // Ghim ảnh lên trang chính (Làm Avatar & Ảnh Thẻ Đầu Tiên)
  const handlePinToMain = (targetPhotoUri: string) => {
    let updatedPrivate = privatePhotoList.filter((uri) => uri !== targetPhotoUri);
    let otherPhotos = photoList.filter((uri) => uri !== targetPhotoUri);

    // Nếu ảnh chuyển từ kho riêng sang và kho công khai đã đủ 6 ảnh, đưa ảnh thứ 6 về kho riêng để bảo lưu
    if (!photoList.includes(targetPhotoUri) && otherPhotos.length >= 6) {
      const bumpedPhoto = otherPhotos.pop();
      if (bumpedPhoto) {
        updatedPrivate = [bumpedPhoto, ...updatedPrivate];
      }
    }

    const updatedPhotos = [targetPhotoUri, ...otherPhotos];

    updateUser({
      photos: updatedPhotos,
      avatar: targetPhotoUri,
      pinnedPhoto: targetPhotoUri,
      privatePhotos: updatedPrivate,
    });
    setActivePhotoIndex(0);
    Alert.alert('Đã ghim 📌', 'Bức ảnh này đã được ghim làm ảnh đại diện chính trên Bản đồ và Thẻ Tinder!');
  };

  // Chuyển ảnh từ Kho Công Khai vào Kho Riêng Tư (Ẩn đi)
  const handleMoveToPrivate = (targetPhotoUri: string) => {
    Alert.alert(
      'Ẩn vào Kho Riêng Tư',
      'Bạn có muốn chuyển ảnh này vào Kho Riêng? Bức ảnh sẽ được ẩn đi và người khác sẽ không thấy trên hồ sơ.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Chuyển vào Kho Riêng 🔒',
          onPress: () => {
            const updatedPublic = photoList.filter((uri) => uri !== targetPhotoUri);
            const updatedPrivate = [...privatePhotoList, targetPhotoUri];
            const newAvatar =
              pinnedPhoto === targetPhotoUri
                ? updatedPublic.length > 0
                  ? updatedPublic[0]
                  : ''
                : user?.avatar || '';

            updateUser({
              photos: updatedPublic,
              privatePhotos: updatedPrivate,
              avatar: newAvatar,
              pinnedPhoto: pinnedPhoto === targetPhotoUri ? newAvatar : pinnedPhoto,
            });
            Alert.alert('Đã ẩn 🔒', 'Ảnh đã được cất an toàn vào Kho Riêng Tư.');
          },
        },
      ]
    );
  };

  // Chuyển ảnh từ Kho Riêng Tư ra Kho Công Khai
  const handleMoveToPublic = (targetPhotoUri: string) => {
    if (photoList.length >= 6) {
      Alert.alert('Kho công khai đã đầy', 'Kho công khai tối đa 6 ảnh. Vui lòng xóa bớt ảnh công khai để đưa ảnh này ra.');
      return;
    }
    const updatedPrivate = privatePhotoList.filter((uri) => uri !== targetPhotoUri);
    const updatedPublic = [...photoList, targetPhotoUri];
    updateUser({
      photos: updatedPublic,
      privatePhotos: updatedPrivate,
    });
    Alert.alert('Đã công khai 🌐', 'Ảnh đã được chuyển ra Kho Công Khai để mọi người cùng xem.');
  };

  // Xóa ảnh khỏi Kho Công Khai
  const handleDeletePublicPhoto = (indexToDelete: number) => {
    Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa bức ảnh này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa ảnh',
        style: 'destructive',
        onPress: () => {
          const target = photoList[indexToDelete];
          const updated = photoList.filter((_, i) => i !== indexToDelete);
          const newAvatar =
            pinnedPhoto === target ? (updated.length > 0 ? updated[0] : '') : user?.avatar || '';

          updateUser({
            photos: updated,
            avatar: newAvatar,
            pinnedPhoto: pinnedPhoto === target ? newAvatar : pinnedPhoto,
          });
          if (activePhotoIndex >= updated.length) {
            setActivePhotoIndex(Math.max(0, updated.length - 1));
          }
          Alert.alert('Đã xóa', 'Ảnh đã được xóa khỏi hồ sơ.');
        },
      },
    ]);
  };

  // Xóa ảnh khỏi Kho Riêng Tư
  const handleDeletePrivatePhoto = (indexToDelete: number) => {
    Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa vĩnh viễn bức ảnh này khỏi kho riêng?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa vĩnh viễn',
        style: 'destructive',
        onPress: () => {
          const updated = privatePhotoList.filter((_, i) => i !== indexToDelete);
          updateUser({ privatePhotos: updated });
          Alert.alert('Đã xóa', 'Ảnh đã được xóa khỏi kho riêng tư.');
        },
      },
    ]);
  };

  // Lưu chỉnh sửa hồ sơ
  const handleSaveProfile = () => {
    const ageNum = editAge.trim() ? parseInt(editAge.trim(), 10) : undefined;
    updateUser({
      name: editName.trim() || 'Người dùng Vivu',
      age: ageNum,
      bio: editBio.trim(),
      occupation: editOccupation.trim(),
      education: editEducation.trim(),
      zodiac: editZodiac,
      interests: editInterests,
      ghostMode,
    });
    setShowEditModal(false);
    Alert.alert('Hoàn tất', 'Hồ sơ cá nhân đã được lưu thành công!');
  };

  // Toggle chọn tag sở thích
  const toggleInterest = (tag: string) => {
    if (editInterests.includes(tag)) {
      setEditInterests(editInterests.filter((t) => t !== tag));
    } else {
      if (editInterests.length >= 8) {
        Alert.alert('Giới hạn', 'Bạn chỉ nên chọn tối đa 8 sở thích tiêu biểu.');
        return;
      }
      setEditInterests([...editInterests, tag]);
    }
  };

  // Đổi Ghost Mode (Jagat style)
  const handleSelectGhostMode = (mode: 'precise' | 'blurred' | 'frozen') => {
    setGhostMode(mode);
    updateUser({ ghostMode: mode });
  };

  // Đăng xuất
  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await logout();
          onNavigate('login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 1. HEADER HERO: TINDER PHOTO ALBUM STACK */}
        <View style={styles.cardWrapper}>
          {photoList.length > 0 ? (
            <TouchableOpacity
              activeOpacity={0.98}
              onPress={handlePhotoTouch}
              style={styles.tinderPhotoCard}
            >
              <Image
                source={{ uri: photoList[activePhotoIndex] }}
                style={styles.tinderImage}
                resizeMode="cover"
              />

              {/* Thanh chỉ báo Story/Tinder Bars nếu có từ 2 ảnh */}
              {photoList.length > 1 && (
                <View style={styles.storyIndicatorsRow}>
                  {photoList.map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.storyIndicator,
                        i === activePhotoIndex && styles.storyIndicatorActive,
                      ]}
                    />
                  ))}
                </View>
              )}

              {/* Huy hiệu ghim trang chính hoặc Nút ghim nhanh */}
              {photoList[activePhotoIndex] === pinnedPhoto ? (
                <View style={styles.heroPinnedBadge}>
                  <Ionicons name="pin" size={13} color="#FFFFFF" />
                  <Text style={styles.heroPinnedText}>Đã ghim trang chính</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.heroQuickPinBtn}
                  activeOpacity={0.8}
                  onPress={() => handlePinToMain(photoList[activePhotoIndex])}
                >
                  <Ionicons name="pin-outline" size={13} color="#FFFFFF" />
                  <Text style={styles.heroQuickPinText}>Ghim lên trang chính</Text>
                </TouchableOpacity>
              )}

              {/* Lớp Gradient tối màu ở đáy ảnh */}
              <LinearGradient
                colors={['transparent', 'rgba(18, 19, 28, 0.4)', 'rgba(18, 19, 28, 0.95)']}
                style={styles.cardGradientOverlay}
              >
                {/* Tên & Tuổi */}
                <View style={styles.nameAgeRow}>
                  <Text style={styles.cardName}>{user?.name || 'Chưa đặt tên'}</Text>
                  {!!user?.age && <Text style={styles.cardAge}>, {user.age}</Text>}
                  <View style={styles.verifiedIconBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  </View>
                </View>

                {/* Nghề nghiệp */}
                {!!user?.occupation && (
                  <View style={styles.metaLine}>
                    <Ionicons name="briefcase-outline" size={15} color="#E2E8F0" />
                    <Text style={styles.metaLineText}>{user.occupation}</Text>
                  </View>
                )}

                {/* Trường học */}
                {!!user?.education && (
                  <View style={styles.metaLine}>
                    <Ionicons name="school-outline" size={15} color="#E2E8F0" />
                    <Text style={styles.metaLineText}>{user.education}</Text>
                  </View>
                )}

                {/* Vị trí */}
                <View style={styles.metaLine}>
                  <Ionicons name="location-outline" size={15} color="#FF4B72" />
                  <Text style={styles.metaLineText}>{user?.city || 'Đà Nẵng, Việt Nam'}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            /* Khung ảnh trống khi người dùng mới chưa tải ảnh */
            <View style={styles.emptyPhotoCard}>
              <View style={styles.emptyPhotoCircle}>
                <Ionicons name="images-outline" size={50} color="#94A3B8" />
              </View>
              <Text style={styles.emptyPhotoTitle}>{user?.name || 'Hồ sơ của bạn'}</Text>
              <Text style={styles.emptyPhotoSubtitle}>
                Chưa có ảnh trong kho lưu trữ. Tải ảnh lên để ghim làm đại diện và xuất hiện trên Bản đồ!
              </Text>

              <TouchableOpacity
                style={styles.uploadFirstPhotoBtn}
                activeOpacity={0.85}
                onPress={() => setShowGalleryModal(true)}
              >
                <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />
                <Text style={styles.uploadFirstPhotoText}>Mở Kho Ảnh & Tải Lên</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Hàng nút Nhanh: Kho ảnh & Chỉnh sửa hồ sơ */}
          <View style={styles.floatingActionsRow}>
            <TouchableOpacity
              style={styles.floatingActionBtn}
              activeOpacity={0.85}
              onPress={() => setShowGalleryModal(true)}
            >
              <Ionicons name="images" size={18} color="#FFFFFF" />
              <Text style={styles.floatingActionText}>
                Kho ảnh ({photoList.length}/6)
              </Text>
              {privatePhotoList.length > 0 && (
                <View style={styles.privateCountMiniPill}>
                  <Ionicons name="lock-closed" size={10} color="#FFFFFF" />
                  <Text style={styles.privateCountMiniText}>{privatePhotoList.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.floatingActionBtn, styles.editActionBtn]}
              activeOpacity={0.85}
              onPress={() => setShowEditModal(true)}
            >
              <Ionicons name="create-outline" size={18} color="#0F172A" />
              <Text style={styles.editActionText}>Sửa hồ sơ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. GIỚI THIỆU BẢN THÂN & THÔNG TIN CÁ NHÂN (BIO & DETAILS) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Giới thiệu bản thân</Text>
            <TouchableOpacity onPress={() => setShowEditModal(true)}>
              <Text style={styles.sectionHeaderAction}>
                {user?.bio ? 'Sửa' : '+ Viết bio'}
              </Text>
            </TouchableOpacity>
          </View>

          {user?.bio ? (
            <Text style={styles.bioContent}>{user.bio}</Text>
          ) : (
            <TouchableOpacity onPress={() => setShowEditModal(true)} style={styles.emptyPromptBox}>
              <Ionicons name="create-outline" size={16} color="#FF4B72" />
              <Text style={styles.emptyPromptText}>
                Chưa có lời giới thiệu. Chạm vào đây để viết đôi dòng về bạn!
              </Text>
            </TouchableOpacity>
          )}

          {/* Các thuộc tính cá nhân */}
          {(!!user?.zodiac || !!user?.occupation || !!user?.education) && (
            <View style={styles.detailsRow}>
              {!!user?.zodiac && (
                <View style={[styles.detailPill, styles.zodiacPill]}>
                  <Ionicons name="sparkles" size={13} color="#7C3AED" />
                  <Text style={[styles.detailPillText, { color: '#6D28D9' }]}>{user.zodiac}</Text>
                </View>
              )}
              {!!user?.occupation && (
                <View style={[styles.detailPill, styles.occupationPill]}>
                  <Ionicons name="briefcase-outline" size={13} color="#059669" />
                  <Text style={[styles.detailPillText, { color: '#047857' }]}>{user.occupation}</Text>
                </View>
              )}
              {!!user?.education && (
                <View style={[styles.detailPill, styles.educationPill]}>
                  <Ionicons name="school-outline" size={13} color="#2563EB" />
                  <Text style={[styles.detailPillText, { color: '#1D4ED8' }]}>{user.education}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* 3. TAGS SỞ THÍCH CHO AI MATCHING (INTERESTS) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Sở thích AI Matching</Text>
            <TouchableOpacity onPress={() => setShowEditModal(true)}>
              <Text style={styles.sectionHeaderAction}>
                {user?.interests && user.interests.length > 0 ? 'Sửa' : '+ Thêm'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSubtitle}>
            AI sẽ ưu tiên gợi ý bạn bè có cùng gu khi lắc điện thoại tìm bạn.
          </Text>

          {user?.interests && user.interests.length > 0 ? (
            <View style={styles.tagChipsWrap}>
              {user.interests.map((tag, idx) => (
                <View key={idx} style={styles.tagChip}>
                  <Ionicons name="sparkles" size={12} color="#FF4B72" />
                  <Text style={styles.tagChipText}>{tag}</Text>
                </View>
              ))}
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setShowEditModal(true)}
              style={styles.emptyInterestBox}
            >
              <Ionicons name="sparkles-outline" size={24} color="#94A3B8" />
              <Text style={styles.emptyInterestTitle}>Bạn chưa chọn sở thích nào</Text>
              <Text style={styles.emptyInterestDesc}>
                Chọn tối đa 8 sở thích để AI tìm bạn bè có cùng gu nhanh nhất!
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 4. BỘ SƯU TẬP ẢNH & KHO RIÊNG TƯ (PHOTO VAULT SHOWCASE) */}
        <TouchableOpacity
          style={styles.sectionCard}
          activeOpacity={0.88}
          onPress={() => setShowGalleryModal(true)}
        >
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="images" size={18} color="#FF4B72" />
              <Text style={styles.sectionHeaderTitle}>Bộ sưu tập ảnh ({photoList.length}/6)</Text>
            </View>
            <Text style={styles.sectionHeaderAction}>Quản lý kho ›</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Ảnh được ghim 📌 là ảnh đại diện hiển thị trên Bản đồ và Thẻ Tinder.
          </Text>

          {/* Dải ảnh thu nhỏ (6 Slots Preview) */}
          <View style={styles.vaultThumbnailsStrip}>
            {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
              const photoUri = photoList[slotIdx];
              if (photoUri) {
                const isPinned = photoUri === pinnedPhoto;
                return (
                  <View key={slotIdx} style={styles.vaultMiniThumb}>
                    <Image source={{ uri: photoUri }} style={styles.vaultMiniImg} />
                    {isPinned && (
                      <View style={styles.miniPinBadge}>
                        <Ionicons name="pin" size={10} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                );
              }
              return (
                <View key={slotIdx} style={styles.vaultMiniSlotEmpty}>
                  <Ionicons name="add" size={16} color="#CBD5E1" />
                </View>
              );
            })}
          </View>

          {/* Huy hiệu thông báo kho riêng nếu có ảnh kín */}
          {privatePhotoList.length > 0 && (
            <View style={styles.privateVaultStripBadge}>
              <Ionicons name="lock-closed" size={13} color="#7C3AED" />
              <Text style={styles.privateVaultStripBadgeText}>
                Đang lưu {privatePhotoList.length} ảnh trong Kho riêng tư (chỉ mình bạn thấy)
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 5. CHẾ ĐỘ BÓNG MA (JAGAT GHOST MODE) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>Chia sẻ vị trí (Ghost Mode)</Text>
          <Text style={styles.sectionSubtitle}>
            Kiểm soát quyền riêng tư của bạn trên Bản đồ thời gian thực:
          </Text>

          <View style={styles.ghostModesContainer}>
            <TouchableOpacity
              style={[
                styles.ghostModeBtn,
                ghostMode === 'precise' && styles.ghostModeBtnActive,
              ]}
              onPress={() => handleSelectGhostMode('precise')}
            >
              <Ionicons
                name="locate"
                size={18}
                color={ghostMode === 'precise' ? '#10B981' : '#64748B'}
              />
              <Text
                style={[
                  styles.ghostModeTitle,
                  ghostMode === 'precise' && styles.ghostModeTitleActive,
                ]}
              >
                Chính xác
              </Text>
              <Text style={styles.ghostModeDesc}>Vị trí thật trên bản đồ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.ghostModeBtn,
                ghostMode === 'blurred' && styles.ghostModeBtnActive,
              ]}
              onPress={() => handleSelectGhostMode('blurred')}
            >
              <Ionicons
                name="eye-off-outline"
                size={18}
                color={ghostMode === 'blurred' ? '#EAB308' : '#64748B'}
              />
              <Text
                style={[
                  styles.ghostModeTitle,
                  ghostMode === 'blurred' && styles.ghostModeTitleActive,
                ]}
              >
                Làm mờ 1km
              </Text>
              <Text style={styles.ghostModeDesc}>Chỉ hiện khu vực quận</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.ghostModeBtn,
                ghostMode === 'frozen' && styles.ghostModeBtnActive,
              ]}
              onPress={() => handleSelectGhostMode('frozen')}
            >
              <Ionicons
                name="snow-outline"
                size={18}
                color={ghostMode === 'frozen' ? '#3B82F6' : '#64748B'}
              />
              <Text
                style={[
                  styles.ghostModeTitle,
                  ghostMode === 'frozen' && styles.ghostModeTitleActive,
                ]}
              >
                Đóng băng
              </Text>
              <Text style={styles.ghostModeDesc}>Cố định tại điểm cuối</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 7. NÚT ĐĂNG XUẤT */}
        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>



      {/* ========================================================== */}
      {/* MODAL 1: KHO LƯU TRỮ ẢNH & KHO RIÊNG TƯ (PHOTO VAULT MODAL) */}
      {/* ========================================================== */}
      <Modal visible={showGalleryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.galleryModalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Kho Lưu Trữ & Ghim Ảnh</Text>
              <TouchableOpacity onPress={() => setShowGalleryModal(false)}>
                <Ionicons name="close-circle" size={28} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* SEGMENTED TABS: KHO CÔNG KHAI VS KHO RIÊNG TƯ */}
            <View style={styles.galleryTabsRow}>
              <TouchableOpacity
                style={[
                  styles.galleryTabBtn,
                  galleryTab === 'public' && styles.galleryTabBtnActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setGalleryTab('public')}
              >
                <Ionicons
                  name="globe-outline"
                  size={16}
                  color={galleryTab === 'public' ? '#FF4B72' : '#64748B'}
                />
                <Text
                  style={[
                    styles.galleryTabText,
                    galleryTab === 'public' && styles.galleryTabTextActive,
                  ]}
                >
                  Kho công khai ({photoList.length}/6)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.galleryTabBtn,
                  galleryTab === 'private' && styles.galleryTabBtnActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setGalleryTab('private')}
              >
                <Ionicons
                  name="lock-closed"
                  size={15}
                  color={galleryTab === 'private' ? '#7C3AED' : '#64748B'}
                />
                <Text
                  style={[
                    styles.galleryTabText,
                    galleryTab === 'private' && styles.galleryTabTextActive,
                    galleryTab === 'private' && { color: '#7C3AED' },
                  ]}
                >
                  Kho riêng tư 🔒 ({privatePhotoList.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* TAB 1: KHO CÔNG KHAI (PUBLIC GALLERY) */}
            {galleryTab === 'public' ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.galleryTabNotice}>
                  Những bức ảnh dưới đây sẽ hiển thị công khai trên Thẻ vuốt Tinder và Bản đồ.
                </Text>

                <View style={styles.galleryGrid}>
                  {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
                    const photoUri = photoList[slotIdx];
                    if (photoUri) {
                      const isPinned = photoUri === pinnedPhoto;
                      return (
                        <View key={slotIdx} style={styles.gallerySlot}>
                          <Image source={{ uri: photoUri }} style={styles.galleryImg} />

                          {/* Huy hiệu Ghim / Thứ tự */}
                          <View
                            style={[
                              styles.slotOrderBadge,
                              isPinned && styles.slotOrderBadgePinned,
                            ]}
                          >
                            <Text style={styles.slotOrderTextPinned}>
                              {isPinned ? '📌 Đã ghim' : `#${slotIdx + 1}`}
                            </Text>
                          </View>

                          {/* Nút Xóa ảnh (Đỏ) */}
                          <TouchableOpacity
                            style={styles.deletePhotoBtn}
                            activeOpacity={0.85}
                            onPress={() => handleDeletePublicPhoto(slotIdx)}
                          >
                            <Ionicons name="trash-outline" size={13} color="#FFFFFF" />
                          </TouchableOpacity>

                          {/* Hàng nút tác vụ dưới đáy ảnh */}
                          <View style={styles.slotActionsBottomRow}>
                            {/* Nút Ghim lên trang chính */}
                            {!isPinned && (
                              <TouchableOpacity
                                style={styles.pinMiniBtn}
                                activeOpacity={0.8}
                                onPress={() => handlePinToMain(photoUri)}
                              >
                                <Ionicons name="pin" size={11} color="#FFFFFF" />
                                <Text style={styles.slotBtnLabel}>Ghim</Text>
                              </TouchableOpacity>
                            )}

                            {/* Nút Ẩn vào kho riêng */}
                            <TouchableOpacity
                              style={styles.hideToPrivateBtn}
                              activeOpacity={0.8}
                              onPress={() => handleMoveToPrivate(photoUri)}
                            >
                              <Ionicons name="lock-closed" size={11} color="#FFFFFF" />
                              <Text style={styles.slotBtnLabel}>Ẩn</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    }

                    {/* Ô trống thêm ảnh công khai */}
                    return (
                      <TouchableOpacity
                        key={slotIdx}
                        style={styles.gallerySlotEmpty}
                        activeOpacity={0.8}
                        onPress={handlePickPublicPhoto}
                      >
                        <View style={styles.slotAddCircle}>
                          <Ionicons name="add" size={24} color="#FF4B72" />
                        </View>
                        <Text style={styles.slotAddText}>Thêm ảnh</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Nút Tải thêm ảnh công khai */}
                {photoList.length < 6 && (
                  <TouchableOpacity
                    style={styles.galleryAddMoreBtn}
                    activeOpacity={0.85}
                    onPress={handlePickPublicPhoto}
                  >
                    <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.galleryAddMoreText}>+ Thêm ảnh công khai</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            ) : (
              /* TAB 2: KHO RIÊNG TƯ (PRIVATE VAULT) */
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.privateVaultNoticeBox}>
                  <Ionicons name="shield-checkmark" size={18} color="#7C3AED" />
                  <Text style={styles.privateVaultNoticeText}>
                    Kho riêng tư bảo mật. Ảnh lưu ở đây chỉ bạn mới thấy, hoàn toàn không xuất hiện trên bản đồ hay thẻ vuốt của người khác.
                  </Text>
                </View>

                {privatePhotoList.length > 0 ? (
                  <View style={styles.galleryGrid}>
                    {privatePhotoList.map((photoUri, pIdx) => (
                      <View key={pIdx} style={styles.gallerySlot}>
                        <Image source={{ uri: photoUri }} style={styles.galleryImg} />

                        {/* Huy hiệu khóa */}
                        <View style={styles.privateLockBadge}>
                          <Ionicons name="lock-closed" size={10} color="#FFFFFF" />
                          <Text style={styles.privateLockBadgeText}>Riêng tư</Text>
                        </View>

                        {/* Nút Xóa vĩnh viễn */}
                        <TouchableOpacity
                          style={styles.deletePhotoBtn}
                          activeOpacity={0.85}
                          onPress={() => handleDeletePrivatePhoto(pIdx)}
                        >
                          <Ionicons name="trash-outline" size={13} color="#FFFFFF" />
                        </TouchableOpacity>

                        {/* Tác vụ: Công khai hoặc Ghim luôn */}
                        <View style={styles.slotActionsBottomRow}>
                          <TouchableOpacity
                            style={styles.publishMiniBtn}
                            activeOpacity={0.8}
                            onPress={() => handleMoveToPublic(photoUri)}
                          >
                            <Ionicons name="globe-outline" size={11} color="#FFFFFF" />
                            <Text style={styles.slotBtnLabel}>Công khai</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.pinDirectBtn}
                            activeOpacity={0.8}
                            onPress={() => handlePinToMain(photoUri)}
                          >
                            <Ionicons name="pin" size={11} color="#FFFFFF" />
                            <Text style={styles.slotBtnLabel}>Ghim</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                    {/* Ô bấm thêm ảnh nhanh vào kho riêng */}
                    <TouchableOpacity
                      style={[styles.gallerySlotEmpty, { borderColor: 'rgba(139, 92, 246, 0.35)', backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}
                      activeOpacity={0.8}
                      onPress={handlePickPrivatePhoto}
                    >
                      <View style={[styles.slotAddCircle, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                        <Ionicons name="lock-closed" size={20} color="#A78BFA" />
                      </View>
                      <Text style={[styles.slotAddText, { color: '#A78BFA' }]}>Thêm ảnh kín</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* Kho riêng trống */
                  <TouchableOpacity
                    style={styles.emptyPrivateBox}
                    activeOpacity={0.85}
                    onPress={handlePickPrivatePhoto}
                  >
                    <Ionicons name="lock-closed-outline" size={40} color="#A78BFA" />
                    <Text style={styles.emptyPrivateTitle}>Kho riêng tư đang trống</Text>
                    <Text style={styles.emptyPrivateDesc}>
                      Lưu giữ những tấm ảnh bạn thích mà chưa muốn người khác thấy ngay.
                    </Text>
                    <View style={styles.emptyPrivateAddHint}>
                      <Ionicons name="add-circle" size={16} color="#A78BFA" />
                      <Text style={styles.emptyPrivateAddHintText}>Chạm để tải ảnh vào kho riêng</Text>
                    </View>
                  </TouchableOpacity>
                )}

                {/* Nút Thêm ảnh vào Kho Riêng Tư */}
                <TouchableOpacity
                  style={[styles.galleryAddMoreBtn, { backgroundColor: '#7C3AED' }]}
                  activeOpacity={0.85}
                  onPress={handlePickPrivatePhoto}
                >
                  <Ionicons name="lock-closed-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.galleryAddMoreText}>+ Thêm ảnh vào Kho Riêng Tư</Text>
                </TouchableOpacity>
              </ScrollView>
            )}

            {/* Nút đóng */}
            <TouchableOpacity
              style={styles.galleryDoneBtn}
              activeOpacity={0.85}
              onPress={() => setShowGalleryModal(false)}
            >
              <Text style={styles.galleryDoneText}>Đóng kho ảnh</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================== */}
      {/* MODAL 2: CHỈNH SỬA HỒ SƠ THỰC TẾ (EDIT PROFILE MODAL) */}
      {/* ========================================================== */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Chỉnh sửa hồ sơ</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close-circle" size={26} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.editScroll}>
              <Text style={styles.inputLabel}>Họ và tên</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Nhập họ và tên của bạn"
                placeholderTextColor="#64748B"
              />

              <Text style={styles.inputLabel}>Tuổi</Text>
              <TextInput
                style={styles.textInput}
                value={editAge}
                onChangeText={setEditAge}
                placeholder="Ví dụ: 21"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Giới thiệu ngắn (Bio)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={editBio}
                onChangeText={setEditBio}
                placeholder="Chia sẻ về sở thích, tính cách, hoặc điều bạn tìm kiếm..."
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.inputLabel}>Nghề nghiệp</Text>
              <TextInput
                style={styles.textInput}
                value={editOccupation}
                onChangeText={setEditOccupation}
                placeholder="Ví dụ: Sinh viên, Kỹ sư, Designer..."
                placeholderTextColor="#64748B"
              />

              <Text style={styles.inputLabel}>Trường học / Nơi làm việc</Text>
              <TextInput
                style={styles.textInput}
                value={editEducation}
                onChangeText={setEditEducation}
                placeholder="Ví dụ: Đại học Bách Khoa..."
                placeholderTextColor="#64748B"
              />

              <Text style={styles.inputLabel}>Cung hoàng đạo</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {ZODIAC_LIST.map((z) => (
                    <TouchableOpacity
                      key={z}
                      style={[
                        styles.zodiacChip,
                        editZodiac === z && styles.zodiacChipActive,
                      ]}
                      onPress={() => setEditZodiac(editZodiac === z ? '' : z)}
                    >
                      <Text
                        style={[
                          styles.zodiacText,
                          editZodiac === z && styles.zodiacTextActive,
                        ]}
                      >
                        {z}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.inputLabel}>
                Chọn sở thích AI Matching ({editInterests.length}/8)
              </Text>
              <View style={styles.tagSelectorWrap}>
                {AVAILABLE_TAGS.map((item) => {
                  const isSelected = editInterests.includes(item.label);
                  return (
                    <TouchableOpacity
                      key={item.label}
                      style={[
                        styles.tagSelectChip,
                        isSelected && styles.tagSelectChipActive,
                      ]}
                      onPress={() => toggleInterest(item.label)}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={14}
                        color={isSelected ? '#FFFFFF' : '#64748B'}
                      />
                      <Text
                        style={[
                          styles.tagSelectText,
                          isSelected && styles.tagSelectTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.saveBtn}
                activeOpacity={0.85}
                onPress={handleSaveProfile}
              >
                <LinearGradient
                  colors={COLORS.primaryGradient}
                  style={styles.btnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.saveBtnText}>Lưu thông tin</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  cardWrapper: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
  },
  tinderPhotoCard: {
    width: '100%',
    height: 420,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  tinderImage: {
    width: '100%',
    height: '100%',
  },
  heroPinnedBadge: {
    position: 'absolute',
    top: 24,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF4B72',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    zIndex: 15,
    shadowColor: '#FF4B72',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  heroPinnedText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  heroQuickPinBtn: {
    position: 'absolute',
    top: 24,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    zIndex: 15,
  },
  heroQuickPinText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyPhotoCard: {
    width: '100%',
    height: 320,
    borderRadius: 24,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#1E293B',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyPhotoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyPhotoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  emptyPhotoSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  uploadFirstPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF4B72',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#FF4B72',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  uploadFirstPhotoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  storyIndicatorsRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 6,
    zIndex: 10,
  },
  storyIndicator: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 2,
  },
  storyIndicatorActive: {
    backgroundColor: '#FFFFFF',
  },
  cardGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingBottom: 18,
    paddingTop: 48,
  },
  nameAgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  cardName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cardAge: {
    fontSize: 24,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  verifiedIconBadge: {
    marginLeft: 4,
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  metaLineText: {
    fontSize: 13,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  floatingActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  floatingActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FF4B72',
    paddingVertical: 12,
    borderRadius: 16,
    position: 'relative',
    ...SHADOWS.sm,
  },
  privateCountMiniPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 2,
  },
  privateCountMiniText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  editActionBtn: {
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#1E293B',
  },
  editActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  floatingActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  vaultThumbnailsStrip: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  vaultMiniThumb: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  vaultMiniImg: {
    width: '100%',
    height: '100%',
  },
  miniPinBadge: {
    position: 'absolute',
    top: 3,
    left: 3,
    backgroundColor: '#FF4B72',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaultMiniSlotEmpty: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#334155',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
  },
  galleryBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 75, 114, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 75, 114, 0.3)',
  },
  galleryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B8B',
  },
  privateVaultStripBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 12,
  },
  privateVaultStripBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C084FC',
  },
  zodiacPill: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: 'rgba(139, 92, 246, 0.35)',
  },
  occupationPill: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  educationPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  sectionCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionHeaderAction: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF4B72',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 18,
  },
  bioContent: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 22,
    marginTop: 8,
  },
  emptyPromptBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 75, 114, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 75, 114, 0.25)',
    padding: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  emptyPromptText: {
    fontSize: 13,
    color: '#FF8A9E',
    fontWeight: '600',
    flex: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  detailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  detailPillText: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  tagChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 75, 114, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 75, 114, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  tagChipText: {
    fontSize: 13,
    color: '#FF8A9E',
    fontWeight: '700',
  },
  emptyInterestBox: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
  },
  emptyInterestTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  emptyInterestDesc: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  ghostModesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  ghostModeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  ghostModeBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#10B981',
    ...SHADOWS.sm,
  },
  ghostModeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 6,
  },
  ghostModeTitleActive: {
    color: '#10B981',
  },
  ghostModeDesc: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  galleryModalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
    maxHeight: '92%',
  },
  galleryModalSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  galleryTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 4,
    marginTop: 14,
    marginBottom: 8,
  },
  galleryTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  galleryTabBtnActive: {
    backgroundColor: '#0F172A',
    ...SHADOWS.sm,
  },
  galleryTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  galleryTabTextActive: {
    color: '#FF4B72',
    fontWeight: '700',
  },
  galleryTabNotice: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 10,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  gallerySlot: {
    width: (width - 60) / 3,
    height: ((width - 60) / 3) * (4 / 3),
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  galleryImg: {
    width: '100%',
    height: '100%',
  },
  slotOrderBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  slotOrderBadgePinned: {
    backgroundColor: '#FF4B72',
  },
  slotOrderTextPinned: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  privateLockBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(124, 58, 237, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  privateLockBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  deletePhotoBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  slotActionsBottomRow: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    flexDirection: 'row',
    gap: 4,
  },
  pinMiniBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: 'rgba(255, 75, 114, 0.9)',
    paddingVertical: 4,
    borderRadius: 6,
  },
  hideToPrivateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: 'rgba(124, 58, 237, 0.9)',
    paddingVertical: 4,
    borderRadius: 6,
  },
  publishMiniBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingVertical: 4,
    borderRadius: 6,
  },
  pinDirectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: 'rgba(255, 75, 114, 0.9)',
    paddingVertical: 4,
    borderRadius: 6,
  },
  slotBtnLabel: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  gallerySlotEmpty: {
    width: (width - 60) / 3,
    height: ((width - 60) / 3) * (4 / 3),
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#334155',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
  },
  slotAddCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 75, 114, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  slotAddText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  privateVaultNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  privateVaultNoticeText: {
    fontSize: 12,
    color: '#C4B5FD',
    lineHeight: 17,
    flex: 1,
  },
  emptyPrivateBox: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
  },
  emptyPrivateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  emptyPrivateDesc: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  emptyPrivateAddHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginTop: 12,
  },
  emptyPrivateAddHintText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A78BFA',
  },
  galleryAddMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FF4B72',
    paddingVertical: 13,
    borderRadius: 16,
    marginTop: 14,
    ...SHADOWS.glow,
  },
  galleryAddMoreText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  galleryDoneBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 13,
    borderRadius: 16,
    marginTop: 10,
  },
  galleryDoneText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '700',
  },
  editModalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
    maxHeight: '88%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  editScroll: {
    paddingBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#FFFFFF',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  zodiacChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  zodiacChipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#8B5CF6',
  },
  zodiacText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  zodiacTextActive: {
    color: '#FFFFFF',
  },
  tagSelectorWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
    marginBottom: 18,
  },
  tagSelectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  tagSelectChipActive: {
    backgroundColor: '#FF4B72',
    borderColor: '#FF4B72',
  },
  tagSelectText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tagSelectTextActive: {
    color: '#FFFFFF',
  },
  saveBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
    ...SHADOWS.glow,
  },
  btnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  floatingBackBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 48 : 36,
    left: 16,
    zIndex: 99,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  floatingBackText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
});
