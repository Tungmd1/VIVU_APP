import React, { useEffect, useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ApiClient } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { ScreenKey } from '../../types';

interface LoginScreenProps {
  onNavigate: (screen: ScreenKey) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const login = useAuthStore((s) => s.login);
  const activePhone = useAuthStore((s) => s.activePhone);

  const [identifier, setIdentifier] = useState(activePhone || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activePhone) {
      setIdentifier(activePhone);
    } else {
      // Đọc tài khoản đăng nhập gần nhất đã lưu trên thiết bị
      AsyncStorage.getItem('vivu_last_identifier').then((savedId) => {
        if (savedId && !identifier) {
          setIdentifier(savedId);
        }
      }).catch(() => {});
    }
  }, [activePhone]);

  const handleLogin = async () => {
    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanId) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập số điện thoại hoặc email của bạn.');
      return;
    }
    if (!cleanPass) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const res = await ApiClient.login(cleanId, cleanPass);

      if (res?.success && res?.data?.token) {
        // Lưu lại định danh tài khoản để các lần sau tự động nhớ
        await AsyncStorage.setItem('vivu_last_identifier', cleanId).catch(() => {});
        
        const userObj = {
          ...res.data.user,
          identifier: res.data.user?.identifier || cleanId,
        };
        await login(res.data.token, userObj);
        onNavigate('home');
      } else if (res?.code === 'ACCOUNT_NOT_FOUND' || res?.message?.includes('chưa được đăng ký')) {
        Alert.alert(
          'Tài khoản chưa tồn tại ⚠️',
          `Số điện thoại hoặc Email "${cleanId}" chưa được đăng ký trên Vivu.\n\nBạn có muốn đăng ký tài khoản mới ngay bây giờ không?`,
          [
            { text: 'Kiểm tra lại', style: 'cancel' },
            {
              text: 'Đăng ký tài khoản',
              style: 'default',
              onPress: () => onNavigate('register'),
            },
          ]
        );
      } else if (res?.code === 'INVALID_PASSWORD' || res?.message?.includes('Mật khẩu không chính xác')) {
        Alert.alert(
          'Mật khẩu chưa đúng 🔑',
          'Mật khẩu bạn vừa nhập chưa chính xác. Bạn vui lòng bấm vào biểu tượng con mắt 👁️ để kiểm tra lại và tắt kiểu gõ Telex nếu có dấu lạ.'
        );
      } else {
        Alert.alert(
          'Đăng nhập thất bại',
          res?.message || 'Số điện thoại/Email hoặc mật khẩu không chính xác.'
        );
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
      <View style={{ height: Platform.OS === 'ios' ? 52 : 36 }} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header Branding (Jagat Neon Standard) */}
        <View style={styles.brandingHeader}>
          <View style={styles.logoRow}>
            <Text style={styles.logoText}>VIVU</Text>
            <View style={styles.livePulseDot} />
          </View>
          <Text style={styles.tagline}>Bản đồ Mạng xã hội Thời gian thực</Text>
        </View>

        {/* Card Form */}
        <View style={styles.cardBox}>
          <View style={styles.headerBlock}>
            <Text style={styles.title}>Đăng nhập</Text>
            <Text style={styles.subtitle}>Chào mừng bạn quay trở lại bản đồ VIVU</Text>
          </View>

          <View style={styles.formBlock}>
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
                placeholder="Mật khẩu"
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

            {/* Nút Đăng nhập */}
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.85}
              onPress={handleLogin}
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
                  <Text style={styles.btnText}>Đăng nhập</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chuyển sang Đăng ký */}
        <TouchableOpacity
          style={styles.footerLink}
          onPress={() => onNavigate('register')}
          activeOpacity={0.7}
        >
          <Text style={styles.footerText}>
            Chưa có tài khoản? <Text style={styles.boldPink}>Đăng ký ngay</Text>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  brandingHeader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 28,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FF4B72',
    letterSpacing: 2,
  },
  livePulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    marginLeft: 8,
  },
  tagline: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.5,
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
