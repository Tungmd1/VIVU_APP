import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ApiClient } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { ScreenKey } from '../../types';

interface RegisterScreenProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigate }) => {
  const login = useAuthStore((s) => s.login);
  const setActivePhone = useAuthStore((s) => s.setActivePhone);

  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const cleanName = fullName.trim();
    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanName) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ và tên của bạn.');
      return;
    }
    if (!cleanId) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập số điện thoại hoặc email.');
      return;
    }
    if (cleanPass.length < 6) {
      Alert.alert('Mật khẩu quá ngắn', 'Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      const res = await ApiClient.register(cleanId, cleanPass, cleanName);

      if (res?.success && res?.data?.token) {
        setActivePhone(cleanId);
        
        // Tự động lưu phiên đăng nhập để thông tin tài khoản được lưu giữ trọn vẹn
        if (res.data.user) {
          await login(res.data.token, res.data.user);
        }

        Alert.alert(
          'Đăng ký thành công! 🎉',
          `Chào mừng ${cleanName} gia nhập bản đồ VIVU! Tài khoản của bạn đã được thiết lập.`,
          [
            {
              text: 'Bắt đầu khám phá',
              onPress: () => onNavigate('home'),
            },
          ]
        );
      } else if (
        res?.code === 'ACCOUNT_EXISTS' ||
        res?.message?.includes('tồn tại') ||
        res?.message?.includes('đã được đăng ký')
      ) {
        // Xử lý rõ ràng trường hợp tài khoản đã tồn tại theo yêu cầu người dùng
        Alert.alert(
          'Tài khoản đã tồn tại ⚠️',
          `Số điện thoại hoặc Email "${cleanId}" đã được đăng ký tài khoản trước đó trên Vivu.\n\nBạn có muốn chuyển sang màn hình Đăng nhập ngay không?`,
          [
            {
              text: 'Đổi thông tin khác',
              style: 'cancel',
            },
            {
              text: 'Đăng nhập ngay',
              style: 'default',
              onPress: () => {
                setActivePhone(cleanId);
                onNavigate('login');
              },
            },
          ]
        );
      } else {
        Alert.alert('Đăng ký không thành công', res?.message || 'Vui lòng thử lại với thông tin khác.');
      }
    } catch {
      Alert.alert('Lỗi kết nối', 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={{ height: Platform.OS === 'ios' ? 48 : 32 }} />

      {/* Top Bar with Back Button */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => onNavigate('login')}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.topBranding}>
          <Text style={styles.topLogo}>VIVU</Text>
          <View style={styles.livePulseDot} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Card Form */}
        <View style={styles.cardBox}>
          <View style={styles.headerBlock}>
            <Text style={styles.title}>Đăng ký tài khoản</Text>
            <Text style={styles.subtitle}>Tạo hồ sơ và khám phá cộng đồng Đà Nẵng</Text>
          </View>

          <View style={styles.formBlock}>
            {/* Họ và tên */}
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Họ và tên của bạn"
                placeholderTextColor="#64748B"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Số điện thoại / Email */}
            <View style={styles.inputWrap}>
              <Ionicons name="call-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Số điện thoại hoặc Email"
                placeholderTextColor="#64748B"
                value={identifier}
                onChangeText={setIdentifier}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Mật khẩu */}
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                placeholderTextColor="#64748B"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>

            {/* Nút Đăng ký */}
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.85}
              onPress={handleRegister}
              disabled={loading}
            >
              <LinearGradient
                colors={['#FF6B8B', '#FF4B72', '#E11D48']}
                style={styles.btnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.btnText}>Tạo tài khoản</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chuyển sang Đăng nhập */}
        <TouchableOpacity
          style={styles.footerLink}
          onPress={() => onNavigate('login')}
          activeOpacity={0.7}
        >
          <Text style={styles.footerText}>
            Đã có tài khoản? <Text style={styles.boldPink}>Đăng nhập ngay</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBranding: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topLogo: {
    fontSize: 22,
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 36,
  },
  cardBox: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  headerBlock: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 6,
  },
  formBlock: {
    gap: 16,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
  },
  primaryBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#FF4B72',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  btnGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  footerLink: {
    alignItems: 'center',
    marginTop: 32,
    paddingVertical: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  boldPink: {
    color: '#FF4B72',
    fontWeight: '800',
  },
});
