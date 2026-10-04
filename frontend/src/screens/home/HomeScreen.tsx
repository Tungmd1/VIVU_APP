import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
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
import { Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

import { MapMarker, MapViewComponent } from '../../components/MapViewComponent';
import { useAuthStore } from '../../stores/authStore';
import { useBeaconStore } from '../../stores/beaconStore';
import { useActivityStore } from '../../stores/activityStore';
import { ApiClient } from '../../services/api';
import { useRouter } from 'expo-router';
import { BeaconCategory, NowBeacon, ScreenKey } from '../../types';
import { CircleMenuBar } from '../../components/common/CircleMenuBar';
import { CreateCircleModal } from '../../components/common/CreateCircleModal';
import { ManageCircleModal } from '../../components/common/ManageCircleModal';
import { FriendDetailModal } from '../../components/common/FriendDetailModal';
import { SameIntentModal } from '../../components/common/SameIntentModal';
import { DailyMoodCheckinModal } from '../../components/common/DailyMoodCheckinModal';
import { EDropModal } from '../../components/common/EDropModal';
import { IntentNotificationBoxModal } from '../../components/common/IntentNotificationBoxModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodNotificationBanner } from '../../components/common/MoodNotificationBanner';
import { useCircleStore, FriendItem, calculateDistanceKm } from '../../stores/circleStore';

const { width, height } = Dimensions.get('window');

interface HomeScreenProps {
  onNavigate: (screen: ScreenKey, params?: any) => void;
}

const CATEGORY_TABS: Array<{ id: BeaconCategory; label: string; icon: string }> = [
  { id: 'all', label: 'Tất cả', icon: 'globe-outline' },
  { id: 'cafe', label: '☕ Cafe & Chill', icon: 'cafe-outline' },
  { id: 'sport', label: '🏸 Cầu lông & Thể thao', icon: 'fitness-outline' },
  { id: 'food', label: '🍔 Ăn uống', icon: 'restaurant-outline' },
  { id: 'study', label: '📚 Học & Code', icon: 'book-outline' },
  { id: 'travel', label: '🏍️ Vi vu dạo phố', icon: 'compass-outline' },
];

const EMOJI_OPTIONS = [
  { emoji: '☕', category: 'cafe' as BeaconCategory, label: 'Cafe' },
  { emoji: '🏸', category: 'sport' as BeaconCategory, label: 'Cầu lông' },
  { emoji: '🍔', category: 'food' as BeaconCategory, label: 'Ăn vặt' },
  { emoji: '📚', category: 'study' as BeaconCategory, label: 'Học tập' },
  { emoji: '🎬', category: 'all' as BeaconCategory, label: 'Xem phim' },
  { emoji: '🍻', category: 'food' as BeaconCategory, label: 'Nhậu chill' },
  { emoji: '🎮', category: 'all' as BeaconCategory, label: 'Game' },
  { emoji: '🏍️', category: 'travel' as BeaconCategory, label: 'Vi vu' },
];

const TTL_OPTIONS = [
  { label: '1 giờ', hours: 1 },
  { label: '3 giờ', hours: 3 },
  { label: '6 giờ', hours: 6 },
  { label: '24 giờ', hours: 24 },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const {
    circles,
    activeCircleId,
    friends,
    showCreateCircleModal,
    setShowCreateCircleModal,
    selectedFriendDetail,
    setSelectedFriendDetail,
    selectedManageCircle,
    setSelectedManageCircle,
    socialMood,
    socialDistanceRadius,
    socialCategoryFilter,
    socialOnlineOnly,
    showSameIntentModal,
    setShowSameIntentModal,
    showEDropModal,
    setShowEDropModal,
    getSameIntentMatches,
    addFriend,
    loadPersistedCircles,
    fetchFriendsFromApi,
    deleteCircle,
  } = useCircleStore();

  useEffect(() => {
    loadPersistedCircles();
    fetchFriendsFromApi();

    // KIỂM TRA LẦN ĐẦU ĐĂNG NHẬP / MỞ APP TRONG NGÀY ĐỂ KHẢO SÁT CẢM XÚC
    (async () => {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const lastCheckin = await AsyncStorage.getItem('vivu_last_mood_checkin_date_v1');
        if (lastCheckin !== todayStr) {
          setTimeout(() => {
            setShowDailyMoodModal(true);
          }, 800);
        }
      } catch (e) {
        console.warn('Lỗi kiểm tra daily checkin:', e);
      }
    })();
  }, []);

  const {
    beacons,
    myBeacon,
    activeCategory,
    setActiveCategory,
    fetchBeacons,
    postBeacon,
    deleteBeacon,
    reactToBeacon,
    loadSavedMyBeacon,
    showCreateModal,
    setShowCreateModal,
  } = useBeaconStore();

  // Tọa độ GPS hiện tại (Mặc định trung tâm Đà Nẵng: Cầu Rồng / Hải Châu)
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: 16.0544,
    longitude: 108.2022,
  });
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number; zoom?: number } | null>(null);

  // Modal tạo nguyện vọng (Create NOW Beacon) (State từ store)
  const [selectedCategory, setSelectedCategory] = useState<BeaconCategory>('all');
  const [beaconText, setBeaconText] = useState('');
  const [isCreateGroup, setIsCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [memberCount, setMemberCount] = useState(2);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTtl, setSelectedTtl] = useState(3);
  const [posting, setPosting] = useState(false);
  const [showDailyMoodModal, setShowDailyMoodModal] = useState(false);
  const [showIntentNotificationBox, setShowIntentNotificationBox] = useState(false);

  // Đếm số lượng thông báo nguyện vọng dựa theo tâm trạng
  const notificationsCount = useMemo(() => {
    if (socialMood === 'bad') return 0;
    const famAndFriendCount = friends.filter((f) => f.beacon || f.isFamily).length;
    if (socialMood === 'happy') {
      return famAndFriendCount + beacons.length;
    }
    return famAndFriendCount;
  }, [socialMood, friends, beacons]);

  // Modal chi tiết khi bấm vào Pin người khác / Nguyện vọng
  const [selectedBeacon, setSelectedBeacon] = useState<any | null>(null);
  const [popoFeedback, setPopoFeedback] = useState<string | null>(null);
  const { activeHangout, setActiveHangout } = useActivityStore();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hangoutTarget, setHangoutTarget] = useState<{userId: string, userName: string} | null>(null);
  const [flyingEmojiTrigger, setFlyingEmojiTrigger] = useState<any>(null);
  const [inAppNotice, setInAppNotice] = useState<{ title: string; body: string; icon: string } | null>(null);
  const [rnEmoji, setRnEmoji] = useState<string | null>(null);
  const rnEmojiX = useRef(new Animated.Value(0)).current;
  const rnEmojiY = useRef(new Animated.Value(0)).current;
  const rnEmojiScale = useRef(new Animated.Value(0)).current;
  const rnEmojiOpacity = useRef(new Animated.Value(0)).current;

  const handleEmojiProjected = useCallback((emoji: string, sx: number, sy: number, ex: number, ey: number) => {
    setRnEmoji(emoji);
    rnEmojiX.setValue(sx - 20); // Center the emoji (approx width 40)
    rnEmojiY.setValue(sy - 20);
    rnEmojiScale.setValue(0);
    rnEmojiOpacity.setValue(1);
    
    // Tạo đường vòng cung
    const arcHeight = -100; // Bay vút lên trên 100px so với đường chim bay
    const duration = 1200;
    
    Animated.sequence([
      Animated.parallel([
        Animated.timing(rnEmojiScale, { toValue: 1.5, duration: 200, useNativeDriver: true }),
        Animated.timing(rnEmojiY, { toValue: sy - 40, duration: 200, useNativeDriver: true })
      ]),
      Animated.parallel([
        Animated.timing(rnEmojiX, { toValue: ex - 20, duration: duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.sequence([
          // Nửa đầu: bay lên đỉnh vòng cung
          Animated.timing(rnEmojiY, { toValue: Math.min(sy, ey) + arcHeight, duration: duration / 2, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          // Nửa sau: rơi xuống đích
          Animated.timing(rnEmojiY, { toValue: ey - 20, duration: duration / 2, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.timing(rnEmojiScale, { toValue: 2, duration: duration, useNativeDriver: true })
      ]),
      Animated.parallel([
        Animated.timing(rnEmojiScale, { toValue: 4, duration: 300, useNativeDriver: true }),
        Animated.timing(rnEmojiOpacity, { toValue: 0, duration: 300, useNativeDriver: true })
      ])
    ]).start(() => {
      setRnEmoji(null);
    });
  }, []);

  const noticeAnimY = useRef(new Animated.Value(-150)).current;

  const showInAppNotice = (title: string, body: string, icon: string) => {
    setInAppNotice({ title, body, icon });
    Animated.sequence([
      Animated.timing(noticeAnimY, { toValue: 60, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.back(1.5)) }),
      Animated.delay(3500),
      Animated.timing(noticeAnimY, { toValue: -150, duration: 400, useNativeDriver: true })
    ]).start(() => setInAppNotice(null));
  };

  // Lấy vị trí GPS thực tế của thiết bị
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (isMounted) {
            const coords = {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            };
            setCurrentCoords(coords);
            setMapCenter(coords);
          }
        }
      } catch {
        // Fallback mặc định Đà Nẵng
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Khôi phục beacon của bản thân & fetch danh sách beacons
  useEffect(() => {
    if (user?.id) {
      loadSavedMyBeacon(user.id);
    }
    fetchBeacons();

    // Định kỳ refresh 30 giây
    const interval = setInterval(() => {
      fetchBeacons();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.id, fetchBeacons, loadSavedMyBeacon]);

  // Recenter bản đồ về vị trí của người dùng
  const handleRecenter = () => {
    setMapCenter({
      latitude: currentCoords.latitude,
      longitude: currentCoords.longitude,
      zoom: 14,
    });
  };

  // Mở modal tạo nguyện vọng
  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri) {
          setSelectedImage(asset.uri);
        }
      }
    } catch (e: any) {
      Alert.alert('Lỗi Thư Viện Ảnh', e?.message || 'Không thể mở thư viện ảnh.');
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    if (!timestamp) return 'vừa xong';
    const diff = Math.floor((Date.now() - timestamp) / 60000);
    if (diff < 1) return 'vừa xong';
    if (diff < 60) return `${diff} phút trước`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
  };

  // Đăng nguyện vọng mới
  const handlePublishBeacon = async () => {
    if (!beaconText.trim()) {
      Alert.alert('Chưa nhập nội dung', 'Vui lòng nhập điều bạn muốn làm ngay lúc này nhé!');
      return;
    }

    if (!user) {
      Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập để phát tín hiệu nguyện vọng.');
      return;
    }

    setPosting(true);
    const result = await postBeacon({
      userId: user.id,
      userName: user.name || 'Người dùng Vivu',
      userAvatar:
        user.pinnedPhoto ||
        user.avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      userAge: user.age,
      userOccupation: user.occupation,
      userInterests: user.interests,
      batteryLevel: 92,
      statusMode: 'chilling',
      latitude: currentCoords.latitude,
      longitude: currentCoords.longitude,
      category: selectedCategory,
      emoji: '✨',
      content: beaconText.trim(),
      imageUrl: selectedImage || undefined,
      ttlHours: selectedTtl,
    });
    setPosting(false);

    if (result) {
      setShowCreateModal(false);
      setBeaconText('');
      setSelectedImage(null);
      Alert.alert('Phát tín hiệu thành công! 🚀', 'Bong bóng nguyện vọng đã xuất hiện trên bản đồ.');
      // Center map to self
      handleRecenter();
    } else {
      Alert.alert('Lỗi', 'Không thể phát tín hiệu, vui lòng thử lại.');
    }
  };

  // Hủy nguyện vọng của chính mình
  const handleCancelMyBeacon = () => {
    if (!myBeacon) return;
    Alert.alert('Hủy tín hiệu', 'Bạn có chắc chắn muốn gỡ bong bóng nguyện vọng này?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Gỡ tín hiệu',
        style: 'destructive',
        onPress: async () => {
          await deleteBeacon(myBeacon.id);
        },
      },
    ]);
  };

  // Ném POPO tương tác (💖, 🩴, 🎆)
  const handleSendPopo = async (emoji: string) => {
    if (!selectedBeacon) return;
    setPopoFeedback(`Đã gửi ${emoji} tới ${selectedBeacon.userName}!`);
    await reactToBeacon(selectedBeacon.id);

    setTimeout(() => {
      setPopoFeedback(null);
    }, 2000);
  };

  // Tính thời gian còn lại của Beacon
  const formatTimeLeft = (expiresAt: number) => {
    const diffMs = expiresAt - Date.now();
    if (diffMs <= 0) return 'Hết hạn';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `Còn ${hours}h${mins > 0 ? `${mins}p` : ''}`;
    return `Còn ${mins} phút`;
  };

  // Chuẩn bị danh sách Markers cho MapView (Lọc theo Vòng tròn Xã hội / Bạn bè / Hội nhóm)
  const mapMarkers: MapMarker[] = useMemo(() => {
    const list: MapMarker[] = [];

    // 1. Marker của chính mình
    list.push({
      id: user?.id ? `self_${user.id}` : 'self_me',
      latitude: currentCoords.latitude,
      longitude: currentCoords.longitude,
      title: user?.name || 'Bạn',
      avatar:
        user?.pinnedPhoto ||
        user?.avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      isSelf: true,
      beacon: myBeacon
        ? {
            emoji: myBeacon.emoji,
            text: myBeacon.content,
            remainingTime: formatTimeLeft(myBeacon.expiresAt),
          }
        : undefined,
      status: {
        battery: 95,
        activity: 'online',
      },
      onPress: () => {
        if (myBeacon) {
          setSelectedBeacon(myBeacon);
        } else {
          handleOpenCreateModal();
        }
      },
    });

    const activeCircle = circles.find((c) => c.id === activeCircleId) || circles[0];

    // 2. Lọc Markers theo Vòng tròn đang chọn:
    if (activeCircle.id === 'social') {
      // 🌐 XÃ HỘI (CÔNG KHAI): Lọc theo khoảng cách bán kính và danh mục
      beacons.forEach((b) => {
        if (b.userId === user?.id) return;

        // LOẠI BỎ: Những người đã là bạn bè thì không hiện ở mục Xã Hội nữa
        if (friends.some((f) => f.id === b.userId && f.isFriend)) {
          return;
        }

        // Lọc theo danh mục nếu được chọn
        if (socialCategoryFilter !== 'all' && b.category !== socialCategoryFilter) {
          return;
        }

        // Lọc theo khoảng cách bán kính (> 0 nghĩa là có giới hạn km)
        if (socialDistanceRadius > 0) {
          const dist = calculateDistanceKm(
            currentCoords.latitude,
            currentCoords.longitude,
            b.latitude,
            b.longitude
          );
          if (dist > socialDistanceRadius) return;
        }

        list.push({
          id: b.id,
          latitude: b.latitude,
          longitude: b.longitude,
          title: b.userName,
          avatar: b.userAvatar,
          isSelf: false,
          beacon: {
            emoji: b.emoji,
            text: b.content,
            remainingTime: formatTimeLeft(b.expiresAt),
          },
          status: {
            battery: b.batteryLevel,
            activity: b.statusMode,
          },
          onPress: () => {
            setSelectedBeacon(b);
          },
        });
      });

      // Thêm những người lạ (chưa kết bạn) xung quanh trong bán kính
      friends.forEach((f) => {
        // LOẠI BỎ: Đã là bạn bè thì không hiện ở Xã Hội nữa
        if (f.isFriend) return;

        if (!beacons.some((b) => b.userId === f.id)) {
          if (socialOnlineOnly && f.status !== 'online') return;

          if (socialDistanceRadius > 0) {
            const dist = calculateDistanceKm(
              currentCoords.latitude,
              currentCoords.longitude,
              f.latitude,
              f.longitude
            );
            if (dist > socialDistanceRadius) return;
          }

          list.push({
            id: `f_${f.id}`,
            latitude: f.latitude,
            longitude: f.longitude,
            title: f.nickname ? `${f.nickname} (${f.name})` : f.name,
            avatar: f.avatar,
            isSelf: false,
            beacon: f.beacon
              ? {
                  emoji: f.beacon.emoji,
                  text: f.beacon.content,
                  remainingTime: f.beacon.remainingTime,
                }
              : undefined,
            status: {
              battery: f.batteryLevel,
              activity: f.status,
            },
            onPress: () => {
              setSelectedFriendDetail(f);
            },
          });
        }
      });
    } else if (activeCircle.id === 'friends') {
      // 👥 BẠN BÈ: CHỈ HIỂN THỊ NHỮNG NGƯỜI BẠN ĐÃ KẾT BẠN
      friends
        .filter((f) => f.isFriend)
        .forEach((f) => {
          const friendBeacon = beacons.find((b) => b.userId === f.id);
          list.push({
            id: `friend_${f.id}`,
            latitude: f.latitude,
            longitude: f.longitude,
            title: f.nickname ? `${f.nickname} (${f.name})` : f.name,
            avatar: f.avatar,
            isSelf: false,
            beacon: friendBeacon
              ? {
                  emoji: friendBeacon.emoji,
                  text: friendBeacon.content,
                  remainingTime: formatTimeLeft(friendBeacon.expiresAt),
                }
              : f.beacon
              ? {
                  emoji: f.beacon.emoji,
                  text: f.beacon.content,
                  remainingTime: f.beacon.remainingTime,
                }
              : undefined,
            status: {
              battery: f.batteryLevel,
              activity: f.status,
            },
            onPress: () => {
              setSelectedFriendDetail(f);
            },
          });
        });
    } else if (activeCircle.id === 'lover') {
      // 💖 NGƯỜI YÊU: CHỈ HIỂN THỊ NGƯỜI YÊU ĐƯỢC CHỌN
      friends
        .filter((f) => f.isLover || activeCircle.memberIds.includes(f.id))
        .forEach((f) => {
          list.push({
            id: `lover_${f.id}`,
            latitude: f.latitude,
            longitude: f.longitude,
            title: f.nickname ? `💖 ${f.nickname}` : `💖 ${f.name}`,
            avatar: f.avatar,
            isSelf: false,
            beacon: f.beacon
              ? {
                  emoji: f.beacon.emoji,
                  text: f.beacon.content,
                  remainingTime: f.beacon.remainingTime,
                }
              : undefined,
            status: {
              battery: f.batteryLevel,
              activity: f.status,
            },
            onPress: () => {
              setSelectedFriendDetail(f);
            },
          });
        });
    } else if (activeCircle.id === 'family') {
      // 👨‍👩‍👧 GIA ĐÌNH: CHỈ HIỂN THỊ CÁC THÀNH VIÊN GIA ĐÌNH
      friends
        .filter((f) => f.isFamily || activeCircle.memberIds.includes(f.id))
        .forEach((f) => {
          list.push({
            id: `fam_${f.id}`,
            latitude: f.latitude,
            longitude: f.longitude,
            title: f.nickname ? `👨‍👩‍👧 ${f.nickname}` : `👨‍👩‍👧 ${f.name}`,
            avatar: f.avatar,
            isSelf: false,
            beacon: f.beacon
              ? {
                  emoji: f.beacon.emoji,
                  text: f.beacon.content,
                  remainingTime: f.beacon.remainingTime,
                }
              : undefined,
            status: {
              battery: f.batteryLevel,
              activity: f.status,
            },
            onPress: () => {
              setSelectedFriendDetail(f);
            },
          });
        });
    } else {
      // 🏕️ HỘI NHÓM TÙY BIẾN: CHỈ HIỂN THỊ CÁC THÀNH VIÊN TRONG NHÓM NÀY
      friends
        .filter((f) => activeCircle.memberIds.includes(f.id))
        .forEach((f) => {
          list.push({
            id: `group_${activeCircle.id}_${f.id}`,
            latitude: f.latitude,
            longitude: f.longitude,
            title: f.nickname ? `${activeCircle.icon} ${f.nickname}` : `${activeCircle.icon} ${f.name}`,
            avatar: f.avatar,
            isSelf: false,
            beacon: f.beacon
              ? {
                  emoji: f.beacon.emoji,
                  text: f.beacon.content,
                  remainingTime: f.beacon.remainingTime,
                }
              : undefined,
            status: {
              battery: f.batteryLevel,
              activity: f.status,
            },
            onPress: () => {
              setSelectedFriendDetail(f);
            },
          });
        });
    }

    return list;
  }, [user, currentCoords, myBeacon, beacons, friends, activeCircleId, circles, socialDistanceRadius, socialCategoryFilter, socialOnlineOnly]);

  return (
    <View style={styles.container}>
      {/* RN NATIVE FLYING EMOJI FALLBACK */}
      {rnEmoji && (
        <Animated.View style={{
          position: 'absolute',
          top: 0, left: 0,
          transform: [{ translateX: rnEmojiX }, { translateY: rnEmojiY }, { scale: rnEmojiScale }],
          opacity: rnEmojiOpacity,
          zIndex: 999999,
          pointerEvents: 'none'
        }}>
          <Text style={{ fontSize: 40, textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 10 }}>
            {rnEmoji}
          </Text>
        </Animated.View>
      )}
      {/* IN-APP PUSH NOTIFICATION BANNER */}
      {inAppNotice && (
        <Animated.View style={[styles.inAppNoticeContainer, { transform: [{ translateY: noticeAnimY }] }]} pointerEvents="none">
          <View style={styles.inAppNoticeIconBox}>
            <Text style={{ fontSize: 24 }}>{inAppNotice.icon}</Text>
          </View>
          <View style={styles.inAppNoticeTextCol}>
            <Text style={styles.inAppNoticeTitle}>{inAppNotice.title}</Text>
            <Text style={styles.inAppNoticeBody}>{inAppNotice.body}</Text>
          </View>
        </Animated.View>
      )}


      {/* 1. BẢN ĐỒ FULL MÀN HÌNH (JAGAT DARK MAP CANVAS) */}
      <MapViewComponent
        markers={mapMarkers}
        centerCoordinate={mapCenter}
        initialRegion={{
          latitude: currentCoords.latitude,
          longitude: currentCoords.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
        style={StyleSheet.absoluteFill}
        onEmojiProjected={handleEmojiProjected}
      />

      {/* 2. THANH HEADER ĐỈNH MÀN HÌNH (GLASSMORPHISM OVERLAY) */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          {/* Logo & Địa danh */}
          <View style={styles.brandingBox}>
            <View style={styles.logoRow}>
              <Text style={styles.logoVIVU}>VIVU</Text>
              <View style={styles.livePulseDot} />
            </View>
            <Text style={styles.locationSubText}>Đà Nẵng • Bản đồ xã hội</Text>
          </View>

          {/* Cụm nút bên phải: Chuông Hộp Thư Nguyện Vọng + Avatar */}
          <View style={styles.headerRightRow}>
            {/* Nút Chuông Hộp Thư Tín Hiệu */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowIntentNotificationBox(true)}
              style={styles.bellBtnWrapper}
            >
              <LinearGradient
                colors={['rgba(255, 75, 114, 0.25)', 'rgba(15, 23, 42, 0.9)']}
                style={styles.bellBtnGradient}
              >
                <Ionicons name="notifications" size={20} color="#FFF" />
                {notificationsCount > 0 && (
                  <View style={styles.bellBadge}>
                    <Text style={styles.bellBadgeText}>
                      {notificationsCount > 99 ? '99+' : notificationsCount}
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Avatar Nút sang Profile */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => onNavigate('profile')}
              style={styles.profileBtnWrapper}
            >
              <Image
                source={{
                  uri:
                    user?.pinnedPhoto ||
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                }}
                style={styles.profileAvatarThumb}
              />
              <View style={styles.onlineDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* THANH MENU VÒNG TRÒN XÃ HỘI, BẠN BÈ & HỘI NHÓM MỚI */}
        <CircleMenuBar
          onOpenCreateCircle={() => setShowCreateCircleModal(true)}
          onManageCircle={(circle) => setSelectedManageCircle(circle)}
        />
      </View>

      {/* BANNER ĐANG HẸN ĐI CHƠI (Nổi phía dưới Header) */}
      {activeHangout && (
        <TouchableOpacity
          style={styles.activeHangoutBanner}
          activeOpacity={0.9}
          onPress={() => {
            setHangoutTarget(activeHangout);
            setActiveHangout(null);
            setShowReviewModal(true);
          }}
        >
          <LinearGradient colors={['#10B981', '#34D399']} style={styles.activeHangoutGradient}>
            <Ionicons name="walk" size={24} color="#FFF" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14 }}>Đang VIVU cùng {activeHangout.userName}</Text>
              <Text style={{ color: '#FFF', fontSize: 12 }}>Bấm vào đây để kết thúc cuộc hẹn</Text>
            </View>
            <Ionicons name="stop-circle" size={24} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* 3. WIDGET NGUYỆN VỌNG HIỆN TẠI CỦA BẢN THÂN (NẾU CÓ) */}
      {myBeacon && (
        <View style={styles.myBeaconWidget}>
          <View style={styles.myBeaconHeader}>
            <View style={styles.myBeaconTitleRow}>
              <Text style={styles.myBeaconEmoji}>{myBeacon.emoji}</Text>
              <View>
                <Text style={styles.myBeaconLabel}>Tín hiệu của bạn đang phát:</Text>
                <Text style={styles.myBeaconContent} numberOfLines={1}>
                  "{myBeacon.content}"
                </Text>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCancelMyBeacon}
              style={styles.cancelBeaconBtn}
            >
              <Ionicons name="close" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          <View style={styles.myBeaconFooter}>
            <Text style={styles.myBeaconTtlText}>
              ⏱️ {formatTimeLeft(myBeacon.expiresAt)}
            </Text>
            <Text style={styles.myBeaconReactionCount}>
              ❤️ {myBeacon.likesCount || 0} lượt thích
            </Text>
          </View>
        </View>
      )}

      {/* 4. NÚT RECENTER VỊ TRÍ GPS (GÓC PHẢI DƯỚI) */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleRecenter}
        style={styles.recenterBtn}
      >
        <Ionicons name="locate" size={24} color="#FF4B72" />
      </TouchableOpacity>

      {/* THANH DOCK ĐƯỢC CHUYỂN RA LAYOUT GỐC */}

      {/* ========================================================
          MODAL 1: TREO NGUYỆN VỌNG (CREATE NOW BEACON BOTTOM SHEET)
          ======================================================== */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalDismissArea}
            activeOpacity={1}
            onPress={() => setShowCreateModal(false)}
          />
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetTitle}>Treo Nguyện Vọng Phù Du ⚡</Text>
            <Text style={styles.sheetSubtitle}>
              Bong bóng sẽ xuất hiện ngay trên đầu bạn để kết nối bạn bè xung quanh
            </Text>

            {/* Ảnh đính kèm */}
            <Text style={styles.fieldHeader}>Ảnh đính kèm (Tùy chọn):</Text>
            {selectedImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.removeImageBtn} onPress={() => setSelectedImage(null)}>
                  <Ionicons name="close-circle" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.imageUploadBtn} onPress={handlePickImage}>
                <Ionicons name="camera-outline" size={24} color="#94A3B8" />
                <Text style={styles.imageUploadText}>Thêm ảnh để bài nổi bật hơn</Text>
              </TouchableOpacity>
            )}

            {/* CHỨC NĂNG LẬP NHÓM & SỐ LƯỢNG NGƯỜI */}
            <Text style={styles.fieldHeader}>Số lượng người tham gia kèo?</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12, marginBottom: 16 }}>
              <View>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Bạn muốn hẹn gặp bao nhiêu người?</Text>
                <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>Từ 3 người trở lên sẽ có tính năng Lập Kèo Nhóm.</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 }}>
                <TouchableOpacity 
                  style={{ width: 36, height: 36, justifyContent: 'center', alignItems: 'center' }} 
                  onPress={() => {
                    const newCount = Math.max(2, memberCount - 1);
                    setMemberCount(newCount);
                    if (newCount <= 2) setIsCreateGroup(false);
                  }}
                >
                  <Ionicons name="remove" size={20} color="#FFF" />
                </TouchableOpacity>
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold', width: 24, textAlign: 'center' }}>{memberCount}</Text>
                <TouchableOpacity 
                  style={{ width: 36, height: 36, justifyContent: 'center', alignItems: 'center' }}
                  onPress={() => setMemberCount(Math.min(20, memberCount + 1))}
                >
                  <Ionicons name="add" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>

            {memberCount > 2 && (
              <>
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isCreateGroup ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: isCreateGroup ? '#10B981' : 'transparent' }}
                  onPress={() => setIsCreateGroup(!isCreateGroup)}
                >
                  <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: isCreateGroup ? '#10B981' : '#64748B', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                    {isCreateGroup && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#10B981' }} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: isCreateGroup ? '#10B981' : '#FFF', fontWeight: 'bold' }}>Lập Kèo Đi Chơi Nhóm Ngay ⚡</Text>
                    <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>Biến nguyện vọng này thành phòng Kèo {memberCount} người.</Text>
                  </View>
                </TouchableOpacity>

                {isCreateGroup && (
                  <TextInput
                    style={[styles.textInput, { marginBottom: 16, minHeight: 45 }]}
                    placeholder="Đặt tên Kèo Nhóm (VD: Hội nhậu đêm 🍻)"
                    placeholderTextColor="#64748B"
                    value={groupName}
                    onChangeText={setGroupName}
                  />
                )}
              </>
            )}

            {/* Ô nhập suy nghĩ */}
            <Text style={styles.fieldHeader}>Bạn đang muốn làm gì ngay lúc này?</Text>
            <View style={styles.inputBoxContainer}>
              <TextInput
                style={[styles.textInput, { minHeight: 60 }]}
                placeholder="Nhập nguyện vọng của bạn..."
                placeholderTextColor="#64748B"
                value={beaconText}
                onChangeText={setBeaconText}
                maxLength={200}
                multiline
                returnKeyType="default"
              />
            </View>
            <Text style={styles.charCounter}>{beaconText.length}/200 ký tự</Text>

            {/* Chọn thời gian tồn tại (TTL) */}
            <Text style={styles.fieldHeader}>Thời gian tồn tại (Hết giờ tự động gỡ):</Text>
            <View style={styles.ttlRow}>
              {TTL_OPTIONS.map((opt) => {
                const isSelected = selectedTtl === opt.hours;
                return (
                  <TouchableOpacity
                    key={opt.hours}
                    activeOpacity={0.8}
                    onPress={() => setSelectedTtl(opt.hours)}
                    style={[
                      styles.ttlPill,
                      isSelected && styles.ttlPillSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.ttlPillText,
                        isSelected && styles.ttlPillTextSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Nút hành động */}
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={posting}
              onPress={handlePublishBeacon}
              style={styles.submitBtn}
            >
              <LinearGradient
                colors={['#FF6B8B', '#FF4B72']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitBtnGradient}
              >
                {posting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="radio-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.submitBtnText}>Phát Tín Hiệu Lên Bản Đồ</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================
          MODAL 2: CARD XEM NHANH CHI TIẾT NGƯỜI DÙNG & NGUYỆN VỌNG
          ======================================================== */}
      <Modal
        visible={!!selectedBeacon}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedBeacon(null)}
      >
        <View style={styles.quickViewBackdrop}>
          <TouchableOpacity
            style={styles.modalDismissArea}
            activeOpacity={1}
            onPress={() => setSelectedBeacon(null)}
          />

          {selectedBeacon && (
            <View style={styles.quickCard}>
              {/* Header profile tóm tắt */}
              <View style={styles.cardHeaderRow}>
                <TouchableOpacity 
                  style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedBeacon(null);
                    onNavigate('userProfile' as any, { userId: selectedBeacon.userId, userName: selectedBeacon.userName, userAvatar: selectedBeacon.userAvatar });
                  }}
                >
                  <Image
                    source={{ uri: selectedBeacon.userAvatar }}
                    style={styles.cardAvatar}
                  />
                  <View style={styles.cardInfoCol}>
                    <View style={styles.cardNameRow}>
                      <Text style={styles.cardName}>{selectedBeacon.userName}</Text>
                      {selectedBeacon.userAge && (
                        <Text style={styles.cardAge}>, {selectedBeacon.userAge}</Text>
                      )}
                    </View>
                    {selectedBeacon.userOccupation ? (
                      <Text style={styles.cardOccupation}>
                        💼 {selectedBeacon.userOccupation}
                      </Text>
                    ) : (
                      <Text style={styles.cardOccupation}>📍 Đà Nẵng</Text>
                    )}
                    <View style={styles.cardStatusRow}>
                      <Text style={styles.cardStatusBadge}>
                        ⏱️ Đăng {formatTimeAgo(selectedBeacon.createdAt)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedBeacon(null)}
                  style={styles.cardCloseBtn}
                >
                  <Ionicons name="close" size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* ========================================================
                  MỤC KẾT BẠN TRONG TRANG HỒ SƠ NHỎ (KHI ẤN VÀO GIỌT NƯỚC)
                  ======================================================== */}
              {(() => {
                const isBeaconFriend = friends.some((f) => f.id === selectedBeacon.userId && f.isFriend);
                const isSelfMini = selectedBeacon.userId === user?.id;

                if (isSelfMini) return null;

                return (
                  <View style={styles.miniProfileFriendSection}>
                    <View style={styles.miniProfileFriendHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="people" size={16} color="#38BDF8" />
                        <Text style={styles.miniProfileFriendTitle}>MỤC KẾT BẠN</Text>
                      </View>
                      <View style={[
                        styles.miniProfileFriendStatusBadge,
                        isBeaconFriend ? styles.statusBadgeFriend : styles.statusBadgeStranger
                      ]}>
                        <Ionicons
                          name={isBeaconFriend ? 'checkmark-circle' : 'person-add-outline'}
                          size={12}
                          color={isBeaconFriend ? '#4CD964' : '#38BDF8'}
                        />
                        <Text style={[
                          styles.miniProfileFriendStatusText,
                          isBeaconFriend ? { color: '#4CD964' } : { color: '#38BDF8' }
                        ]}>
                          {isBeaconFriend ? 'Bạn bè' : 'Chưa kết bạn'}
                        </Text>
                      </View>
                    </View>


                    <View style={{ marginTop: 12, marginBottom: 4 }}>
                      <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '600', marginBottom: 8, alignSelf: 'center' }}>THẢ CẢM XÚC NHANH</Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
                        {['💖', '👋', '😂', '🍻', '🔥'].map(emoji => (
                          <TouchableOpacity 
                            key={emoji} 
                            style={{ padding: 6, backgroundColor: '#1E293B', borderRadius: 20, borderWidth: 1, borderColor: '#334155' }}
                            onPress={() => {
                              const sLat = currentCoords.latitude;
                              const sLng = currentCoords.longitude;
                              const eLat = selectedBeacon.latitude;
                              const eLng = selectedBeacon.longitude;
                              
                              const { width, height } = Dimensions.get('window');
                              const scale = 80000; 
                              const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
                              const ex = clamp(width / 2 + (eLng - sLng) * scale, 50, width - 50);
                              const ey = clamp(height / 2 - (eLat - sLat) * scale, 100, height - 100);
                              
                              handleEmojiProjected(emoji, width / 2, height / 2, ex, ey);
                              const b = selectedBeacon;
                              setSelectedBeacon(null);
                              showInAppNotice('Gửi tín hiệu thành công', `Biểu tượng ${emoji} đang bay tới ${b.userName}`, emoji);
                              
                              // GIẢ LẬP ĐỐI PHƯƠNG PHẢN HỒI (Easter Egg)
                              setTimeout(() => {
                                const { width, height } = Dimensions.get('window');
                                const scale = 80000;
                                const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
                                const sx = clamp(width / 2 + (b.longitude - currentCoords.longitude) * scale, 50, width - 50);
                                const sy = clamp(height / 2 - (b.latitude - currentCoords.latitude) * scale, 100, height - 100);
                                handleEmojiProjected(emoji, sx, sy, width/2, height/2);
                                setTimeout(() => {
                                   showInAppNotice('Tín hiệu phản hồi', `${b.userName} vừa thả lại ${emoji} cho bạn!`, emoji);
                                }, 1800); // Đợi icon bay về tới nơi
                              }, 4000); // Đợi 4 giây đối phương trả lời
                            }}
                          >
                            <Text style={{ fontSize: 24 }}>{emoji}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    <View style={styles.miniProfileFriendActionsRow}>
                      {isBeaconFriend ? (
                        <View style={styles.miniProfileAlreadyFriendBox}>
                          <Ionicons name="heart" size={16} color="#FF2A7A" />
                          <Text style={styles.miniProfileAlreadyFriendText}>
                            Đã kết bạn • Có thể xem vị trí & nhắn tin
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.miniProfileAddBtn}
                          activeOpacity={0.85}
                          onPress={async () => {
                            await addFriend({
                              id: selectedBeacon.userId,
                              name: selectedBeacon.userName,
                              avatar: selectedBeacon.userAvatar,
                            });
                            Alert.alert('Thành công 🎉', `Đã thêm ${selectedBeacon.userName} vào danh sách bạn bè!`);
                          }}
                        >
                          <LinearGradient
                            colors={['#0284C7', '#0EA5E9']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.miniProfileAddGradient}
                          >
                            <Ionicons name="person-add" size={15} color="#FFF" />
                            <Text style={styles.miniProfileAddText}>+ Kết Bạn Với {selectedBeacon.userName}</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={styles.miniProfileViewDetailBtn}
                        activeOpacity={0.8}
                        onPress={() => {
                          setSelectedBeacon(null);
                          onNavigate('userProfile' as any, { userId: selectedBeacon.userId, userName: selectedBeacon.userName, userAvatar: selectedBeacon.userAvatar });
                        }}
                      >
                        <Ionicons name="id-card-outline" size={15} color="#CBD5E1" />
                        <Text style={styles.miniProfileViewDetailText}>Xem hồ sơ</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })()}

              {/* Khối nguyện vọng nổi bật */}
              <View style={styles.cardBeaconBox}>
                <Text style={styles.cardBeaconEmoji}>{selectedBeacon.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardBeaconLabel}>ĐANG MUỐN:</Text>
                  <Text style={styles.cardBeaconContent}>
                    "{selectedBeacon.content}"
                  </Text>
                </View>
              </View>

              {/* Ảnh đính kèm (nếu có) */}
              {selectedBeacon.imageUrl && (
                <Image source={{ uri: selectedBeacon.imageUrl }} style={styles.cardBeaconImage} />
              )}

              {/* Tags sở thích (nếu có) */}
              {selectedBeacon.userInterests && selectedBeacon.userInterests.length > 0 && (
                <View style={styles.cardTagsRow}>
                  {selectedBeacon.userInterests.slice(0, 3).map((tag: string, i: number) => (
                    <View key={i} style={styles.cardTagPill}>
                      <Text style={styles.cardTagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* KHỐI AI TRUST SHIELD (Phân tích uy tín) */}
              <View style={styles.trustShieldBox}>
                <View style={styles.trustShieldHeader}>
                  <Ionicons name="shield-checkmark" size={18} color="#10B981" />
                  <Text style={styles.trustShieldTitle}>
                    AI Trust Shield: {Math.min(100, 50 + 30 + ((selectedBeacon.userName.length * 3) % 15 + 5))}/100
                  </Text>
                </View>
                <View style={styles.trustShieldList}>
                  <View style={styles.trustShieldItem}>
                    <Ionicons name="scan" size={14} color="#38BDF8" style={styles.trustIcon} />
                    <Text style={styles.trustShieldText}>Xác thực sinh trắc khuôn mặt (Face ID)</Text>
                  </View>
                  <View style={styles.trustShieldItem}>
                    <Text style={styles.trustEmoji}>😍 👍</Text>
                    <Text style={styles.trustShieldText}>{(selectedBeacon.userName.length * 3) % 15 + 5} người thả Icon tích cực sau hẹn</Text>
                  </View>
                  <View style={styles.trustShieldItem}>
                    <Ionicons name="pulse" size={14} color="#A78BFA" style={styles.trustIcon} />
                    <Text style={styles.trustShieldText}>Không phát hiện bất thường (Bot/Spam)</Text>
                  </View>
                </View>
              </View>

              {/* POPO Reactions: Thả tim 💖, Ném dép 🩴, Bắn pháo hoa 🎆 */}
              <View style={styles.popoContainer}>
                <Text style={styles.popoHeader}>Gửi cảm xúc tương tác tức thì:</Text>
                <View style={styles.popoButtonsRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleSendPopo('💖')}
                    style={styles.popoBtn}
                  >
                    <Text style={styles.popoIcon}>💖</Text>
                    <Text style={styles.popoBtnText}>Thả tim</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleSendPopo('🩴')}
                    style={styles.popoBtn}
                  >
                    <Text style={styles.popoIcon}>🩴</Text>
                    <Text style={styles.popoBtnText}>Ném dép</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleSendPopo('🎆')}
                    style={styles.popoBtn}
                  >
                    <Text style={styles.popoIcon}>🎆</Text>
                    <Text style={styles.popoBtnText}>Pháo hoa</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => Alert.alert('Chia sẻ', 'Chia sẻ nguyện vọng thành công!')}
                    style={styles.popoBtn}
                  >
                    <Ionicons name="share-social-outline" size={17} color="#FFF" style={{ marginBottom: 4 }} />
                    <Text style={styles.popoBtnText}>Share</Text>
                  </TouchableOpacity>
                </View>

                {popoFeedback && (
                  <Text style={styles.popoFeedbackText}>{popoFeedback}</Text>
                )}
              </View>

              {/* Nút Bắt đầu hẹn đi chơi ĐÃ ĐƯỢC CHUYỂN VÀO TRONG TRANG CHAT */}

              {/* Action buttons: Thêm bạn bè hoặc Bắt chuyện trong mục Xã Hội */}
              {(() => {
                const isBeaconFriend = friends.some((f) => f.id === selectedBeacon.userId && f.isFriend);
                return (
                  <View style={styles.beaconActionsWrapper}>
                    {isBeaconFriend ? (
                      <View style={styles.beaconFriendBadge}>
                        <Ionicons name="checkmark-circle" size={15} color="#4CD964" />
                        <Text style={styles.beaconFriendBadgeText}>Đã là bạn bè ✓</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={async () => {
                          await addFriend({
                            id: selectedBeacon.userId,
                            name: selectedBeacon.userName,
                            avatar: selectedBeacon.userAvatar,
                          });
                          alert(`Đã thêm ${selectedBeacon.userName} vào danh sách bạn bè!`);
                        }}
                        style={styles.beaconAddFriendBtn}
                      >
                        <LinearGradient
                          colors={['#0284C7', '#0EA5E9']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.beaconAddFriendGradient}
                        >
                          <Ionicons name="person-add" size={16} color="#FFF" style={{ marginRight: 6 }} />
                          <Text style={styles.beaconAddFriendBtnText}>+ Thêm Bạn Bè 🤝</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        const targetUser = { userId: selectedBeacon.userId, userName: selectedBeacon.userName };
                        setSelectedBeacon(null);
                        router.push({
                          pathname: '/chat',
                          params: targetUser,
                        });
                      }}
                      style={styles.chatActionBtn}
                    >
                      <LinearGradient
                        colors={['#FF6B8B', '#FF4B72']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.chatActionGradient}
                      >
                        <Ionicons name="chatbubble-ellipses" size={18} color="#FFF" style={{ marginRight: 6 }} />
                        <Text style={styles.chatActionText}>Bắt Chuyện Cùng {selectedBeacon.userName}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                );
              })()}
            </View>
          )}
        </View>
      </Modal>

      {/* ========================================================
          MODAL 3: ĐÁNH GIÁ (TRUST REVIEW SHIELD)
          ======================================================== */}
      <Modal
        visible={showReviewModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.quickViewBackdrop}>
           <View style={styles.reviewCard}>
              <View style={{alignItems: 'center', marginBottom: 16}}>
                <Ionicons name="shield-checkmark" size={48} color="#10B981" />
                <Text style={styles.reviewTitle}>Chuyến đi thế nào?</Text>
                <Text style={styles.reviewSubtitle}>Đánh giá {hangoutTarget?.userName} để cộng đồng VIVU an toàn hơn nhé!</Text>
              </View>
              
              <View style={styles.reviewGrid}>
                <TouchableOpacity style={styles.reviewIconBtn} onPress={() => { alert(`Cảm ơn bạn! Đã cộng 5 điểm Uy tín cho ${hangoutTarget?.userName}`); setShowReviewModal(false); }}>
                   <Text style={styles.reviewEmojiLarge}>😍</Text>
                   <Text style={styles.reviewLabel}>Tuyệt vời</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.reviewIconBtn} onPress={() => { alert(`Cảm ơn bạn! Đã cộng 2 điểm Uy tín cho ${hangoutTarget?.userName}`); setShowReviewModal(false); }}>
                   <Text style={styles.reviewEmojiLarge}>👍</Text>
                   <Text style={styles.reviewLabel}>Khá ổn</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.reviewIconBtn} onPress={() => { alert('Rất tiếc vì trải nghiệm của bạn! Đã trừ 2 điểm Uy tín.'); setShowReviewModal(false); }}>
                   <Text style={styles.reviewEmojiLarge}>👎</Text>
                   <Text style={styles.reviewLabel}>Tệ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.reviewIconBtn} onPress={() => { alert('Đã ghi nhận báo cáo. Đã trừ 5 điểm Uy tín & Gửi cảnh báo đỏ lên Admin.'); setShowReviewModal(false); }}>
                   <Text style={styles.reviewEmojiLarge}>🤬</Text>
                   <Text style={styles.reviewLabel}>Cảnh báo</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity style={{ marginTop: 20, alignItems: 'center', padding: 10 }} onPress={() => setShowReviewModal(false)}>
                 <Text style={{ color: '#94A3B8', fontWeight: '500' }}>Bỏ qua đánh giá lần này</Text>
              </TouchableOpacity>
           </View>
        </View>
      </Modal>

      {/* ========================================================
          MODAL 4: TẠO VÒNG TRÒN / HỘI NHÓM MỚI
          ======================================================== */}
      <CreateCircleModal
        visible={showCreateCircleModal}
        onClose={() => setShowCreateCircleModal(false)}
      />

      {/* ========================================================
          MODAL 5: QUẢN LÝ / XÓA NHÓM / THÊM BẠN / ĐẶT BIỆT DANH
          ======================================================== */}
      <ManageCircleModal
        circle={selectedManageCircle}
        visible={!!selectedManageCircle}
        onClose={() => setSelectedManageCircle(null)}
        currentCoords={currentCoords}
      />

      {/* ========================================================
          MODAL 6: CHI TIẾT BẠN BÈ / ĐẶT BIỆT DANH RIÊNG TRÊN MAP
          ======================================================== */}
      <FriendDetailModal
        friend={selectedFriendDetail}
        visible={!!selectedFriendDetail}
        isSocialMode={activeCircleId === 'social'}
        onClose={() => setSelectedFriendDetail(null)}
        onViewProfile={(friendId) => {
          setSelectedFriendDetail(null);
          onNavigate('userProfile' as any, { userId: friendId });
        }}
        onSendEmoji={(emoji) => {
          const f = selectedFriendDetail;
          if (!f) return;
          setSelectedFriendDetail(null);
          
          const sLat = currentCoords.latitude;
          const sLng = currentCoords.longitude;
          const eLat = f.latitude || (currentCoords.latitude + 0.005);
          const eLng = f.longitude || (currentCoords.longitude + 0.005);
          
          const { width, height } = Dimensions.get('window');
          const scale = 80000; 
          const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
          const ex = clamp(width / 2 + (eLng - sLng) * scale, 50, width - 50);
          const ey = clamp(height / 2 - (eLat - sLat) * scale, 100, height - 100);
          
          handleEmojiProjected(emoji, width / 2, height / 2, ex, ey);
          
          showInAppNotice('Gửi tín hiệu thành công', `Biểu tượng ${emoji} đang bay tới ${f.name || f.nickname}`, emoji);
          
          setTimeout(() => {
            const { width, height } = Dimensions.get('window');
            const scale = 80000;
            const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
            const sx = clamp(width / 2 + ((f.longitude || currentCoords.longitude) - currentCoords.longitude) * scale, 50, width - 50);
            const sy = clamp(height / 2 - ((f.latitude || currentCoords.latitude) - currentCoords.latitude) * scale, 100, height - 100);
            handleEmojiProjected(emoji, sx, sy, width/2, height/2);
            setTimeout(() => {
                showInAppNotice('Tín hiệu phản hồi', `${f.name || f.nickname} vừa thả lại ${emoji} cho bạn!`, emoji);
            }, 1800);
          }, 4000);
        }}
        onChat={(f) => {
          setSelectedFriendDetail(null);
          router.push({
            pathname: '/chat',
            params: { userId: f.id, userName: f.nickname || f.name },
          });
        }}
        onHangout={(f) => {
          setSelectedFriendDetail(null);
          setActiveHangout({ userId: f.id, userName: f.nickname || f.name });
        }}
      />

      {/* ========================================================
          MODAL 7: GỢI Ý CẠ CỨNG CÙNG NGUYỆN VỌNG & TÂM TRẠNG
          ======================================================== */}
      <SameIntentModal
        visible={showSameIntentModal}
        onClose={() => setShowSameIntentModal(false)}
        matches={getSameIntentMatches(currentCoords, beacons)}
        onChat={(m) => {
          setShowSameIntentModal(false);
          router.push({
            pathname: '/chat',
            params: { userId: m.id, userName: m.nickname || m.name },
          });
        }}
        onHangout={(m) => {
          setShowSameIntentModal(false);
          setActiveHangout({ userId: m.id, userName: m.nickname || m.name });
        }}
        onAddFriend={async (m) => {
          await addFriend({ name: m.name, nickname: m.nickname, avatar: m.avatar });
          alert(`Đã kết nối bạn bè với ${m.nickname || m.name}!`);
        }}
      />

      {/* ========================================================
          MODAL 8: ĐÁNH GIÁ MỨC ĐỘ CẢM XÚC ĐẦU NGÀY (DAILY CHECK-IN)
          ======================================================== */}
      <DailyMoodCheckinModal
        visible={showDailyMoodModal}
        onClose={() => setShowDailyMoodModal(false)}
        userName={user?.name || 'Bạn'}
      />

      {/* ========================================================
          MODAL 10: VIVU E-DROP 1 CHẠM (CHỈ KHI CẢ 2 CÙNG MỞ APP)
          ======================================================== */}
      <EDropModal
        visible={showEDropModal}
        onClose={() => setShowEDropModal(false)}
      />

      {/* ========================================================
          MODAL 9: HỘP THÔNG BÁO GỢI Ý NGUYỆN VỌNG BẠN BÈ & GIA ĐÌNH
          ======================================================== */}
      <IntentNotificationBoxModal
        visible={showIntentNotificationBox}
        onClose={() => setShowIntentNotificationBox(false)}
        beacons={beacons}
        currentCoords={currentCoords}
        onLocateOnMap={(lat, lon) => {
          setMapCenter({ latitude: lat, longitude: lon, zoom: 15 });
        }}
        onChat={(u) => {
          router.push({
            pathname: '/chat',
            params: { userId: u.id, userName: u.name },
          });
        }}
        onHangout={(u) => {
          setActiveHangout({ userId: u.id, userName: u.name });
        }}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  inAppNoticeContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  inAppNoticeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  inAppNoticeTextCol: {
    flex: 1,
  },
  inAppNoticeTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  inAppNoticeBody: {
    color: '#94A3B8',
    fontSize: 13,
  },
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },

  // 2. HEADER
  headerContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 48 : 36,
    left: 0,
    right: 0,
    zIndex: 30,
    paddingHorizontal: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  brandingBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoVIVU: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FF4B72',
    letterSpacing: 1.5,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginLeft: 6,
  },
  locationSubText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 1,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellBtnWrapper: {
    position: 'relative',
    borderRadius: 22,
    overflow: 'hidden',
  },
  bellBtnGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF4B72',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#0F172A',
  },
  bellBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  profileBtnWrapper: {
    position: 'relative',
    padding: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#FF4B72',
  },
  profileAvatarThumb: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  categoryScroll: {
    paddingVertical: 2,
    gap: 8,
  },
  categoryPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryPillActive: {
    backgroundColor: '#FF4B72',
    borderColor: '#FF4B72',
  },
  categoryPillText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // 3. WIDGET MY BEACON
  myBeaconWidget: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 142 : 130,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(23, 27, 38, 0.92)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#FF4B72',
    zIndex: 25,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  myBeaconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  myBeaconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  myBeaconEmoji: {
    fontSize: 22,
    marginRight: 10,
  },
  myBeaconLabel: {
    fontSize: 10,
    color: '#FF8A9E',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  myBeaconContent: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  cancelBeaconBtn: {
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
  },
  myBeaconFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  myBeaconTtlText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  myBeaconReactionCount: {
    fontSize: 11,
    color: '#F43F5E',
    fontWeight: '700',
  },

  // 4. RECENTER BUTTON
  recenterBtn: {
    position: 'absolute',
    bottom: 96,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 20,
  },

  // 5. BOTTOM DOCK & FAB
  bottomDockContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 25,
  },
  dockBar: {
    width: width - 40,
    height: 64,
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    borderRadius: 32,
    marginBottom: Platform.OS === 'ios' ? 24 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    paddingHorizontal: 16,
  },
  dockItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  dockLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  dockLabelActive: {
    color: '#FF4B72',
    fontWeight: '700',
  },
  dockCenterSpacer: {
    width: 64,
  },
  fabButtonWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 44 : 36,
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF4B72',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 12,
  },
  fabGradient: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // MODAL TREO NGUYỆN VỌNG (BOTTOM SHEET)
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  fieldHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
    marginTop: 12,
    marginBottom: 8,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  emojiCardSelected: {
    borderColor: '#FF4B72',
    backgroundColor: 'rgba(255, 75, 114, 0.15)',
  },
  emojiCardIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  emojiCardLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  emojiCardLabelSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inputBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputPrefixEmoji: {
    fontSize: 22,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  charCounter: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'right',
    marginTop: 4,
  },
  imageUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
    gap: 8,
  },
  imageUploadText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
  },
  cardBeaconImage: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    marginTop: 12,
    resizeMode: 'cover',
  },
  ttlRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ttlPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  ttlPillSelected: {
    borderColor: '#FF4B72',
    backgroundColor: 'rgba(255, 75, 114, 0.15)',
  },
  ttlPillText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  ttlPillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  // MODAL QUICK VIEW CARD
  quickViewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  quickCard: {
    width: width - 40,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FF4B72',
    marginRight: 14,
  },
  cardInfoCol: {
    flex: 1,
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cardAge: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94A3B8',
  },
  cardOccupation: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  cardStatusRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  cardStatusBadge: {
    fontSize: 10,
    color: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: '700',
  },
  cardCloseBtn: {
    padding: 6,
    backgroundColor: '#1E293B',
    borderRadius: 14,
  },
  
  miniProfileFriendSection: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  miniProfileFriendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  miniProfileFriendTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.6,
  },
  miniProfileFriendStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  statusBadgeFriend: {
    backgroundColor: 'rgba(76, 217, 100, 0.15)',
  },
  statusBadgeStranger: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  miniProfileFriendStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  miniProfileFriendActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniProfileAlreadyFriendBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 10,
    gap: 6,
  },
  miniProfileAlreadyFriendText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  miniProfileAddBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  miniProfileAddGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  miniProfileAddText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  miniProfileViewDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 5,
  },
  miniProfileViewDetailText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBeaconBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 75, 114, 0.12)',
    borderWidth: 1.5,
    borderColor: '#FF4B72',
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
  },
  cardBeaconEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  cardBeaconLabel: {
    fontSize: 10,
    color: '#FF8A9E',
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  cardBeaconContent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  cardTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  cardTagPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardTagText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  popoContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  popoHeader: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
    marginBottom: 8,
  },
  popoButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  popoBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  popoIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  popoBtnText: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  popoFeedbackText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
  },
    beaconActionsWrapper: {
    gap: 8,
    marginTop: 4,
  },
  beaconAddFriendBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  beaconAddFriendGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  beaconAddFriendBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  beaconFriendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 217, 100, 0.15)',
    paddingVertical: 10,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(76, 217, 100, 0.3)',
  },
  beaconFriendBadgeText: {
    color: '#4CD964',
    fontSize: 13,
    fontWeight: '700',
  },
  chatActionBtn: {
    marginTop: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  chatActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  chatActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  
  /* Active Hangout Banner */
  activeHangoutBanner: {
    position: 'absolute',
    top: 100, // Dưới thanh search
    left: 16,
    right: 16,
    zIndex: 50,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  activeHangoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
  },
  
  /* Trust Shield Box */
  trustShieldBox: {
    marginTop: 16,
    padding: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 16,
  },
  trustShieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trustShieldTitle: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
  trustShieldList: {
    marginTop: 4,
    gap: 6,
  },
  trustShieldItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustIcon: {
    marginRight: 8,
    width: 20,
    textAlign: 'center',
  },
  trustEmoji: {
    fontSize: 12,
    marginRight: 8,
    width: 20,
    textAlign: 'center',
    lineHeight: 14,
  },
  trustShieldText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  
  /* Review Modal */
  reviewCard: {
    backgroundColor: '#1E293B',
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  reviewTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 12,
  },
  reviewSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  reviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 20,
  },
  reviewIconBtn: {
    width: '45%',
    backgroundColor: '#0F172A',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  reviewEmojiLarge: {
    fontSize: 40,
    marginBottom: 8,
  },
  reviewLabel: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  }
});
