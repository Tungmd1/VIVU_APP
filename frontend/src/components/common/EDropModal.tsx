import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { useCircleStore } from '../../stores/circleStore';

interface EDropModalProps {
  visible: boolean;
  onClose: () => void;
}

interface NearbyDevice {
  id: string;
  name: string;
  avatar: string;
  distance: string;
  battery: number;
}

export const EDropModal: React.FC<EDropModalProps> = ({ visible, onClose }) => {
  const { user } = useAuthStore();
  const { addFriend, friends } = useCircleStore();

  const [isScanning, setIsScanning] = useState(true);
  const [nearbyDevices, setNearbyDevices] = useState<NearbyDevice[]>([]);
  const [connectingDevice, setConnectingDevice] = useState<NearbyDevice | null>(null);
  const [connectedSuccess, setConnectedSuccess] = useState<NearbyDevice | null>(null);

  // Animations
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const waveAnim3 = useRef(new Animated.Value(0)).current;
  const touchAnimLeft = useRef(new Animated.Value(-60)).current;
  const touchAnimRight = useRef(new Animated.Value(60)).current;
  const glowAnim = useRef(new Animated.Value(1)).current;

  // Radar Pulse Animation loop
  useEffect(() => {
    if (!visible) return;

    const createWaveAnimation = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = createWaveAnimation(waveAnim1, 0);
    const anim2 = createWaveAnimation(waveAnim2, 700);
    const anim3 = createWaveAnimation(waveAnim3, 1400);

    anim1.start();
    anim2.start();
    anim3.start();

    // Scan simulation: Find nearby active VIVU users in 1.8s
    setIsScanning(true);
    setConnectedSuccess(null);
    setConnectingDevice(null);

    const timer = setTimeout(() => {
      setIsScanning(false);
      // Giả lập phát hiện thiết bị gần trong phạm vi 1-3 mét
      setNearbyDevices([
        {
          id: 'edrop_minh_anh',
          name: 'Minh Anh (Cà Phê Muối)',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          distance: '0.4 m (Ngay cạnh)',
          battery: 88,
        },
        {
          id: 'edrop_quoc_bao',
          name: 'Quốc Bảo',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          distance: '1.2 m',
          battery: 76,
        },
      ]);
    }, 1800);

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
      clearTimeout(timer);
    };
  }, [visible]);

  // Handle 1-Touch Connect (E-Drop Bump)
  const handleTouchConnect = (device: NearbyDevice) => {
    setConnectingDevice(device);

    // Bắt đầu hiệu ứng 2 avatar chạm nhau
    touchAnimLeft.setValue(-70);
    touchAnimRight.setValue(70);

    Animated.parallel([
      Animated.spring(touchAnimLeft, {
        toValue: -8,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(touchAnimRight, {
        toValue: 8,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1.6,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(async () => {
      // Đã chạm thành công -> Thực hiện kết bạn qua circleStore
      try {
        await addFriend({
          id: device.id,
          name: device.name,
          avatar: device.avatar,
        });

        setConnectedSuccess(device);
        setConnectingDevice(null);
      } catch (e) {
        Alert.alert('Lỗi', 'Không thể kết nối E-Drop lúc này.');
        setConnectingDevice(null);
      }
    });
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerBadge}>⚡ 1 CHẠM KẾT NỐI</Text>
              <Text style={styles.title}>VIVU E-Drop Radar</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Active app warning banner */}
          <View style={styles.warningBox}>
            <Ionicons name="information-circle" size={18} color="#00F2FE" />
            <Text style={styles.warningText}>
              E-Drop chỉ hoạt động khi <Text style={styles.boldText}>cả 2 người dùng</Text> đang cùng mở app VIVU ở gần nhau.
            </Text>
          </View>

          {/* Center Stage: Radar or Bump Animation */}
          {connectingDevice ? (
            <View style={styles.bumpStage}>
              <Text style={styles.bumpPrompt}>ĐANG 1 CHẠM KẾT NỐI...</Text>
              <View style={styles.bumpAvatarsRow}>
                <Animated.View style={[styles.bumpAvatarWrap, { transform: [{ translateX: touchAnimLeft }] }]}>
                  <Image
                    source={{
                      uri: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                    }}
                    style={styles.bumpAvatar}
                  />
                  <Text style={styles.bumpName} numberOfLines={1}>Bạn</Text>
                </Animated.View>

                <Animated.View style={[styles.bumpSpark, { transform: [{ scale: glowAnim }] }]}>
                  <Ionicons name="flash" size={32} color="#FFE600" />
                </Animated.View>

                <Animated.View style={[styles.bumpAvatarWrap, { transform: [{ translateX: touchAnimRight }] }]}>
                  <Image source={{ uri: connectingDevice.avatar }} style={styles.bumpAvatar} />
                  <Text style={styles.bumpName} numberOfLines={1}>{connectingDevice.name}</Text>
                </Animated.View>
              </View>
            </View>
          ) : connectedSuccess ? (
            <View style={styles.successStage}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark-sharp" size={42} color="#FFF" />
              </View>
              <Text style={styles.successTitle}>Đã Kết Bạn Thành Công!</Text>
              <Text style={styles.successDesc}>
                Bạn và <Text style={styles.boldWhite}>{connectedSuccess.name}</Text> đã trở thành bạn bè qua E-Drop 1 chạm.
              </Text>
              <TouchableOpacity
                style={styles.doneBtn}
                onPress={() => {
                  setConnectedSuccess(null);
                  onClose();
                }}
              >
                <Text style={styles.doneBtnText}>Xong</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.radarStage}>
              {/* Radar Waves */}
              {[waveAnim1, waveAnim2, waveAnim3].map((anim, idx) => {
                const scale = anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.6, 2.5],
                });
                const opacity = anim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.6, 0.3, 0],
                });
                return (
                  <Animated.View
                    key={idx}
                    style={[
                      styles.radarWave,
                      {
                        transform: [{ scale }],
                        opacity,
                      },
                    ]}
                  />
                );
              })}

              {/* Center User Avatar */}
              <View style={styles.myAvatarWrap}>
                <Image
                  source={{
                    uri: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                  }}
                  style={styles.myAvatar}
                />
                <View style={styles.myPulseBadge}>
                  <Ionicons name="radio" size={14} color="#FFF" />
                </View>
              </View>

              <Text style={styles.radarStatus}>
                {isScanning ? 'Đang phát sóng & dò tìm thiết bị lân cận...' : 'Đã tìm thấy bạn bè đang mở app gần đây'}
              </Text>
            </View>
          )}

          {/* List of found devices */}
          {!connectingDevice && !connectedSuccess && (
            <View style={styles.deviceListSection}>
              <View style={styles.listHeaderRow}>
                <Text style={styles.listHeaderText}>THIẾT BỊ GẦN BẠN ({nearbyDevices.length})</Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsScanning(true);
                    setTimeout(() => setIsScanning(false), 1200);
                  }}
                >
                  <Text style={styles.refreshText}>Quét lại</Text>
                </TouchableOpacity>
              </View>

              {nearbyDevices.map((device) => {
                const isAlready = friends.some((f) => f.id === device.id && f.isFriend);
                return (
                  <View key={device.id} style={styles.deviceCard}>
                    <Image source={{ uri: device.avatar }} style={styles.deviceAvatar} />
                    <View style={styles.deviceInfo}>
                      <Text style={styles.deviceName} numberOfLines={1}>{device.name}</Text>
                      <View style={styles.deviceMetaRow}>
                        <Ionicons name="navigate-outline" size={12} color="#00F2FE" />
                        <Text style={styles.deviceMetaText}>{device.distance}</Text>
                        <Text style={styles.deviceMetaDot}>•</Text>
                        <Ionicons name="battery-charging" size={12} color="#4CD964" />
                        <Text style={styles.deviceMetaText}>{device.battery}%</Text>
                      </View>
                    </View>

                    {isAlready ? (
                      <View style={styles.alreadyBadge}>
                        <Ionicons name="checkmark-circle" size={14} color="#4CD964" />
                        <Text style={styles.alreadyText}>Bạn bè</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.touchBtn}
                        onPress={() => handleTouchConnect(device)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="flash" size={15} color="#000" />
                        <Text style={styles.touchBtnText}>1 Chạm</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 5, 15, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: '#0F1626',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 242, 254, 0.35)',
    shadowColor: '#00F2FE',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitleWrap: {
    gap: 3,
  },
  headerBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00F2FE',
    letterSpacing: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.25)',
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#B0D5FF',
    lineHeight: 16,
  },
  boldText: {
    fontWeight: '700',
    color: '#00F2FE',
  },
  radarStage: {
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  radarWave: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#00F2FE',
    backgroundColor: 'rgba(0, 242, 254, 0.05)',
  },
  myAvatarWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  myAvatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3,
    borderColor: '#00F2FE',
  },
  myPulseBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FF2A7A',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0F1626',
  },
  radarStatus: {
    position: 'absolute',
    bottom: 2,
    fontSize: 12,
    fontWeight: '600',
    color: '#9EADCF',
    textAlign: 'center',
  },
  deviceListSection: {
    marginTop: 10,
    gap: 10,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  listHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7E91B3',
    letterSpacing: 0.8,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00F2FE',
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  deviceAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#00F2FE',
  },
  deviceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  deviceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  deviceMetaText: {
    fontSize: 11,
    color: '#9EADCF',
    fontWeight: '500',
  },
  deviceMetaDot: {
    color: '#556585',
    fontSize: 10,
  },
  touchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F2FE',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
    shadowColor: '#00F2FE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  touchBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000',
  },
  alreadyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(76, 217, 100, 0.15)',
    borderRadius: 12,
  },
  alreadyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4CD964',
  },
  bumpStage: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bumpPrompt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFE600',
    letterSpacing: 1.2,
    marginBottom: 24,
  },
  bumpAvatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  bumpAvatarWrap: {
    alignItems: 'center',
  },
  bumpAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: '#00F2FE',
  },
  bumpName: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
    maxWidth: 90,
  },
  bumpSpark: {
    marginHorizontal: 4,
  },
  successStage: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#00C853',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#00C853',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 13,
    color: '#B0D5FF',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  boldWhite: {
    fontWeight: '800',
    color: '#FFF',
  },
  doneBtn: {
    backgroundColor: '#00F2FE',
    paddingHorizontal: 36,
    paddingVertical: 12,
    borderRadius: 24,
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
  },
});
