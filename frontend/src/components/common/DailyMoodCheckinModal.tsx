import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCircleStore } from '../../stores/circleStore';

const { width } = Dimensions.get('window');

const STORAGE_LAST_CHECKIN_KEY = 'vivu_last_mood_checkin_date_v1';

interface DailyMoodCheckinModalProps {
  visible: boolean;
  onClose: () => void;
  userName?: string;
}

export const DailyMoodCheckinModal: React.FC<DailyMoodCheckinModalProps> = ({
  visible,
  onClose,
  userName = 'Bạn',
}) => {
  const { setSocialMood } = useCircleStore();
  const [selectedMood, setSelectedMood] = useState<'happy' | 'normal' | 'bad' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);

  const handleSelectMood = async (mood: 'happy' | 'normal' | 'bad') => {
    setSelectedMood(mood);
    setIsProcessing(true);

    if (mood === 'happy') {
      setFeedbackText('🧠 AI đang mở cửa kết nối & quét cạ cứng cùng đi chơi...');
    } else if (mood === 'normal') {
      setFeedbackText('🧠 AI đang lọc danh sách bạn bè thân thiết...');
    } else {
      setFeedbackText('🧠 AI đang kích hoạt Chế độ Yên Tĩnh, tắt mọi thông báo...');
    }

    // Cập nhật mood vào store
    setSocialMood(mood);

    // Lưu ngày check-in để không hỏi lại hôm nay
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      await AsyncStorage.setItem(STORAGE_LAST_CHECKIN_KEY, todayStr);
    } catch (e) {}

    // Delay ngắn để người dùng thấy phản hồi thông minh của AI
    setTimeout(() => {
      setIsProcessing(false);
      onClose();
    }, 950);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.cardContainer}>
          {/* Header Gradient */}
          <LinearGradient
            colors={['#FF4B72', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.greetingRow}>
              <Text style={styles.greetingEmoji}>✨</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.greetingTitle}>Chào ngày mới, {userName}!</Text>
                <Text style={styles.greetingSubtitle}>Hôm nay tâm trạng của bạn thế nào?</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeIconBtn}>
                <Ionicons name="close" size={18} color="rgba(255, 255, 255, 0.8)" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={styles.bodyContent}>
            <Text style={styles.instructionText}>
              Chọn 1 biểu cảm để AI tự động sắp xếp bản đồ, gợi ý cạ cứng và điều chỉnh thông báo phù hợp nhất với bạn hôm nay:
            </Text>

            {/* 3 BIỂU CẢM: VUI - BÌNH THƯỜNG - BUỒN */}
            <View style={styles.moodGrid}>
              {/* 1. VUI VẺ */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.moodOptionCard,
                  selectedMood === 'happy' && styles.moodOptionCardActiveHappy,
                ]}
                onPress={() => handleSelectMood('happy')}
                disabled={isProcessing}
              >
                <Text style={styles.moodEmoji}>🥳</Text>
                <Text style={[styles.moodTitle, selectedMood === 'happy' && { color: '#FF4B72' }]}>
                  Vui vẻ
                </Text>
                <Text style={styles.moodSubText}>Muốn đi chơi & làm quen bạn mới</Text>
                <View style={styles.aiTagHappy}>
                  <Text style={styles.aiTagTextHappy}>AI gợi ý cạ cứng 🚀</Text>
                </View>
              </TouchableOpacity>

              {/* 2. BÌNH THƯỜNG */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.moodOptionCard,
                  selectedMood === 'normal' && styles.moodOptionCardActiveNormal,
                ]}
                onPress={() => handleSelectMood('normal')}
                disabled={isProcessing}
              >
                <Text style={styles.moodEmoji}>😊</Text>
                <Text style={[styles.moodTitle, selectedMood === 'normal' && { color: '#10B981' }]}>
                  Bình thường
                </Text>
                <Text style={styles.moodSubText}>Chill thoải mái, chỉ bạn bè quen</Text>
                <View style={styles.aiTagNormal}>
                  <Text style={styles.aiTagTextNormal}>Chỉ tin bạn bè ☕</Text>
                </View>
              </TouchableOpacity>

              {/* 3. BUỒN */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.moodOptionCard,
                  selectedMood === 'bad' && styles.moodOptionCardActiveBad,
                ]}
                onPress={() => handleSelectMood('bad')}
                disabled={isProcessing}
              >
                <Text style={styles.moodEmoji}>😢</Text>
                <Text style={[styles.moodTitle, selectedMood === 'bad' && { color: '#38BDF8' }]}>
                  Buồn
                </Text>
                <Text style={styles.moodSubText}>Mệt mỏi, cần không gian yên tĩnh</Text>
                <View style={styles.aiTagBad}>
                  <Text style={styles.aiTagTextBad}>Tắt hết thông báo 🌙</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Trạng thái xử lý của AI */}
            {isProcessing && (
              <View style={styles.processingBox}>
                <ActivityIndicator color="#FF4B72" size="small" style={{ marginRight: 10 }} />
                <Text style={styles.processingText}>{feedbackText}</Text>
              </View>
            )}

            {/* Chân trang nhắc nhở */}
            <Text style={styles.footerTip}>
              💡 Bạn luôn có thể thay đổi lại cảm xúc bất kỳ lúc nào trong tab Xã hội.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  cardContainer: {
    width: Math.min(width - 32, 380),
    backgroundColor: '#0F172A',
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greetingEmoji: {
    fontSize: 28,
  },
  greetingTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFF',
  },
  greetingSubtitle: {
    fontSize: 12,
    color: '#F1F5F9',
    marginTop: 2,
    fontWeight: '500',
  },
  closeIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyContent: {
    padding: 18,
  },
  instructionText: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  moodGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  moodOptionCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  moodOptionCardActiveHappy: {
    borderColor: '#FF4B72',
    backgroundColor: 'rgba(255, 75, 114, 0.18)',
    transform: [{ scale: 1.03 }],
  },
  moodOptionCardActiveNormal: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    transform: [{ scale: 1.03 }],
  },
  moodOptionCardActiveBad: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    transform: [{ scale: 1.03 }],
  },
  moodEmoji: {
    fontSize: 34,
    marginBottom: 6,
  },
  moodTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  moodSubText: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 13,
    marginBottom: 8,
    minHeight: 26,
  },
  aiTagHappy: {
    backgroundColor: 'rgba(255, 75, 114, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  aiTagTextHappy: {
    fontSize: 9,
    color: '#FF4B72',
    fontWeight: '700',
  },
  aiTagNormal: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  aiTagTextNormal: {
    fontSize: 9,
    color: '#10B981',
    fontWeight: '700',
  },
  aiTagBad: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  aiTagTextBad: {
    fontSize: 9,
    color: '#38BDF8',
    fontWeight: '700',
  },
  processingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 75, 114, 0.3)',
  },
  processingText: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '600',
    flex: 1,
  },
  footerTip: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});
