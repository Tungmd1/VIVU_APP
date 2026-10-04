import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { ApiClient } from '../../services/api';
import { COLORS } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { useCircleStore } from '../../stores/circleStore';

const { width, height } = Dimensions.get('window');

export default function UserProfileRoute() {
  const { id, name: paramName, avatar: paramAvatar } = useLocalSearchParams();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const currentAuthUser = useAuthStore((s) => s.user);

  const { friends, addFriend, removeFriend } = useCircleStore();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (id) {
      ApiClient.getProfile(id as string, token || '').then((res) => {
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          // Mock data
          const existingFriend = friends.find(f => f.id === id || f.phone === id);
          if (id === currentAuthUser?.id) {
            setUser({
              id: currentAuthUser.id,
              name: currentAuthUser.name || 'Hồ sơ của tôi',
              avatar: currentAuthUser.avatar || paramAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600',
              city: currentAuthUser.city || 'Đà Nẵng',
              age: currentAuthUser.age || 22,
              bio: currentAuthUser.bio || 'Chào bạn! Mình là người yêu thích khám phá và những chuyến đi. Rất vui được làm quen với mọi người trên Vivu.',
              occupation: currentAuthUser.occupation || 'Sinh viên / Designer',
              interests: currentAuthUser.interests?.length > 0 ? currentAuthUser.interests : ['Du lịch', 'Cafe', 'Nhiếp ảnh'],
              photos: (currentAuthUser.photos?.length || 0) > 0 ? currentAuthUser.photos : [currentAuthUser.avatar || paramAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600'],
              mutualFriends: 0,
              distance: 0,
            });
          } else if (existingFriend) {
            setUser({
              id: id as string,
              name: existingFriend.name || existingFriend.nickname,
              avatar: existingFriend.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600',
              city: (existingFriend as any).city || 'Đà Nẵng',
              age: (existingFriend as any).age || 24,
              bio: (existingFriend as any).bio || existingFriend.beacon?.content || 'Yêu thích cuộc sống tự do và luôn mở lòng với những người bạn mới. Rất mong được gặp gỡ và trò chuyện!',
              occupation: (existingFriend as any).occupation || 'Nhiếp ảnh gia tự do',
              interests: (existingFriend as any).interests?.length > 0 ? (existingFriend as any).interests : ['Du lịch', 'Cafe', 'Âm nhạc', 'Dã ngoại'],
              photos: [existingFriend.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600'],
              mutualFriends: existingFriend.isFriend ? 10 : 0,
              distance: 1.2,
            });
          } else {
            setUser({
            id: id as string,
            name: paramName ? (paramName as string) : (typeof id === 'string' && id.startsWith('0') ? `Bạn ${id}` : 'Người dùng Vivu'),
            avatar: paramAvatar ? (paramAvatar as string) : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600',
            city: 'Đà Nẵng',
            age: Math.floor(Math.random() * 10) + 20, // Sinh ngẫu nhiên tuổi từ 20-29
            bio: 'Một tâm hồn tự do yêu thích khám phá những vùng đất mới. Cứ đi rồi sẽ đến, cứ mở lòng rồi sẽ gặp được những người bạn chân thành.',
            occupation: 'Sáng tạo nội dung',
            interests: ['Du lịch', 'Cafe', 'Âm nhạc', 'Dã ngoại', 'Chụp ảnh'],
            photos: [
              paramAvatar ? (paramAvatar as string) : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
              'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600',
            ],
            mutualFriends: 3,
            distance: 2.5
          });
          }
        }
        setLoading(false);
      });
    }
  }, [id, token]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF4B72" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#FFF' }}>Không tìm thấy người dùng</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: '#FF4B72' }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isFriend = friends.some((f) => (f.id === user.id || f.phone === user.id) && f.isFriend);
  const isSelf = currentAuthUser?.id === user?.id || currentAuthUser?.id === id;

  const photoList = user?.photos && user.photos.length > 0 ? user.photos : user?.avatar ? [user.avatar] : [];

  const handlePhotoTouch = (e: any) => {
    if (photoList.length <= 1) return;
    const { locationX } = e.nativeEvent;
    if (locationX < width / 2) {
      setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else {
      setActivePhotoIndex((prev) => (prev < photoList.length - 1 ? prev + 1 : prev));
    }
  };

  const handleAddFriendDirect = async () => {
    setIsAdding(true);
    try {
      await addFriend({
        id: user.id,
        name: user.name,
        avatar: user.avatar || photoList[0],
        phone: user.phone || (typeof user.id === 'string' && user.id.startsWith('0') ? user.id : undefined),
      });
      Alert.alert('Thành công 🎉', `Bạn và ${user.name} đã trở thành bạn bè!`);
    } catch (e) {
      Alert.alert('Thông báo', 'Không thể kết bạn lúc này, vui lòng thử lại.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleUnfriend = () => {
    Alert.alert(
      'Hủy kết bạn',
      `Bạn có chắc muốn hủy kết bạn với ${user.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          style: 'destructive',
          onPress: () => {
            const found = friends.find((f) => f.id === user.id || f.phone === user.id);
            if (found) removeFriend(found.id);
          },
        },
      ]
    );
  };

  const handleCopyProfileLink = async () => {
    const profileUrl = `https://vivu.app/u/${user.id}`;
    await Clipboard.setStringAsync(profileUrl);
    Alert.alert('Đã sao chép link 📋', `Đã chép liên kết của ${user.name}: ${profileUrl}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Nút nổi Header */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={handleCopyProfileLink}>
          <Ionicons name="share-social" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Phần ảnh bìa / Photo Stack */}
        <View style={styles.photoContainer}>
          {photoList.length > 0 && (
            <TouchableOpacity activeOpacity={0.95} onPress={handlePhotoTouch} style={{ flex: 1 }}>
              <Image source={{ uri: photoList[activePhotoIndex] }} style={styles.coverImage} />
              <LinearGradient
                colors={['transparent', 'rgba(15, 23, 42, 0.4)', 'rgba(15, 23, 42, 0.95)']}
                style={styles.imageOverlay}
              />
              
              {photoList.length > 1 && (
                <View style={styles.indicatorsRow}>
                  {photoList.map((_: any, i: number) => (
                    <View
                      key={i}
                      style={[
                        styles.indicator,
                        i === activePhotoIndex && styles.indicatorActive,
                      ]}
                    />
                  ))}
                </View>
              )}

              {/* Thông tin cơ bản dán trên ảnh */}
              <View style={styles.basicInfoOverImage}>
                <View style={styles.nameRow}>
                  <Text style={styles.nameText}>{user.name}, {user.age || 22}</Text>
                  {isFriend && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-done" size={14} color="#FFF" />
                    </View>
                  )}
                </View>
                {user.occupation && (
                  <Text style={styles.occupationText}>{user.occupation}</Text>
                )}
                
                <View style={styles.quickStatsRow}>
                  <View style={styles.quickStatBadge}>
                    <Ionicons name="location" size={14} color="#FF4B72" />
                    <Text style={styles.quickStatText}>{user.distance || 1.2} km</Text>
                  </View>
                  {user.city && (
                    <View style={styles.quickStatBadge}>
                      <Ionicons name="business" size={14} color="#38BDF8" />
                      <Text style={styles.quickStatText}>{user.city}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Nội dung chi tiết */}
        <View style={styles.detailsContainer}>
          
          {/* Box thống kê vui */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.mutualFriends || 0}</Text>
              <Text style={styles.statLabel}>Bạn chung</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>89%</Text>
              <Text style={styles.statLabel}>Tương đồng</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Tín hiệu</Text>
            </View>
          </View>

          {/* Giới thiệu */}
          {user.bio && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Giới thiệu</Text>
              <View style={styles.bioCard}>
                <Text style={styles.bioText}>{user.bio}</Text>
              </View>
            </View>
          )}

          {/* Sở thích */}
          {user.interests && user.interests.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sở thích chung</Text>
              <View style={styles.tagsContainer}>
                {user.interests.map((tag: string, idx: number) => (
                  <View key={idx} style={styles.tagBadge}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Footer Fixed Hành Động */}
      {!isSelf && (
        <LinearGradient
          colors={['transparent', 'rgba(15,23,42,0.8)', '#0F172A']}
          style={styles.bottomBarContainer}
        >
          {isFriend ? (
            <View style={styles.friendActionBar}>
              <TouchableOpacity style={styles.actionBtnOutline}>
                <Ionicons name="chatbubble-ellipses" size={20} color="#FFF" />
                <Text style={styles.actionBtnTextOutline}>Nhắn tin</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionBtnDanger} onPress={handleUnfriend}>
                <Ionicons name="person-remove" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.addFriendBtn}
              onPress={handleAddFriendDirect}
              disabled={isAdding}
            >
              <LinearGradient
                colors={['#FF4B72', '#E11D48']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.addFriendGradient}
              >
                {isAdding ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="person-add" size={22} color="#FFF" />
                    <Text style={styles.addFriendText}>Thêm Bạn Bè</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0F172A' 
  },
  scrollContent: {
    paddingBottom: 0,
  },
  floatingHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoContainer: {
    width: width,
    height: height * 0.55,
    backgroundColor: '#1E293B',
    position: 'relative',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  indicatorsRow: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  indicator: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
  },
  indicatorActive: {
    backgroundColor: '#FFF',
  },
  basicInfoOverImage: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  nameText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  verifiedBadge: {
    backgroundColor: '#38BDF8',
    borderRadius: 12,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  occupationText: {
    color: '#CBD5E1',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickStatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  quickStatText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  detailsContainer: {
    padding: 20,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#334155',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  bioCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  bioText: {
    color: '#E2E8F0',
    fontSize: 15,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tagText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    paddingTop: 40,
  },
  addFriendBtn: {
    shadowColor: '#FF4B72',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  addFriendGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 100,
    gap: 8,
  },
  addFriendText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  friendActionBar: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 16,
    borderRadius: 100,
    gap: 8,
  },
  actionBtnTextOutline: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionBtnDanger: {
    width: 56,
    height: 56,
    backgroundColor: '#475569',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
