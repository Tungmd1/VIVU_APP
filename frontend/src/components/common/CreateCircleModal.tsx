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
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FriendItem, useCircleStore } from '../../stores/circleStore';

const { height } = Dimensions.get('window');

const ICONS = ['👥', '👨‍👩‍👧', '💖', '🏕️', '☕', '⚽', '🎮', '🏍️', '🍺', '🏸', '📚', '🍕', '🏖️', '💼'];

const COLORS = [
  '#FF4B72', // Hồng VIVU
  '#10B981', // Xanh ngọc
  '#3B82F6', // Xanh biển
  '#8B5CF6', // Tím mộng mơ
  '#F59E0B', // Vàng cam
  '#EC4899', // Hồng đậm
  '#06B6D4', // Cyan
  '#EF4444', // Đỏ nhiệt huyết
];

interface CreateCircleModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CreateCircleModal: React.FC<CreateCircleModalProps> = ({ visible, onClose }) => {
  const { friends, createCircle } = useCircleStore();

  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<'group' | 'family' | 'lover'>('group');
  const [selectedIcon, setSelectedIcon] = useState('👥');
  const [selectedColor, setSelectedColor] = useState('#8B5CF6');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMember = (id: string) => {
    if (selectedMemberIds.includes(id)) {
      setSelectedMemberIds(selectedMemberIds.filter((m) => m !== id));
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedMemberIds.length === friends.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(friends.map((f) => f.id));
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      alert('Vui lòng nhập tên vòng tròn / hội nhóm!');
      return;
    }

    await createCircle({
      name: name.trim(),
      type: selectedType,
      icon: selectedIcon,
      color: selectedColor,
      memberIds: selectedMemberIds,
      description: `Nhóm ${name.trim()} (${selectedMemberIds.length} thành viên)`,
    });

    // Reset & close
    setName('');
    setSelectedMemberIds([]);
    onClose();
  };

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheetContainer}>
          <View style={styles.sheetHandle} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Tạo Vòng Tròn Mới ✨</Text>
              <Text style={styles.subtitle}>Tùy biến nhóm Gia đình, Bạn thân, Hội nhóm riêng</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
            {/* 1. Tên nhóm */}
            <Text style={styles.sectionLabel}>Tên nhóm / Vòng tròn</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.iconPreview}>{selectedIcon}</Text>
              <TextInput
                style={styles.textInput}
                placeholder="VD: Hội Phượt Sơn Trà, Gia đình nhỏ, Cạ cứng..."
                placeholderTextColor="#64748B"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* 2. Loại nhóm */}
            <Text style={styles.sectionLabel}>Phân loại</Text>
            <View style={styles.typeRow}>
              {[
                { type: 'group' as const, label: 'Hội nhóm', icon: '👥' },
                { type: 'family' as const, label: 'Gia đình', icon: '👨‍👩‍👧' },
                { type: 'lover' as const, label: 'Người yêu', icon: '💖' },
              ].map((item) => {
                const isActive = selectedType === item.type;
                return (
                  <TouchableOpacity
                    key={item.type}
                    style={[styles.typePill, isActive && styles.typePillActive]}
                    onPress={() => {
                      setSelectedType(item.type);
                      setSelectedIcon(item.icon);
                    }}
                  >
                    <Text style={styles.typeIcon}>{item.icon}</Text>
                    <Text style={[styles.typeText, isActive && styles.typeTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 3. Chọn Icon */}
            <Text style={styles.sectionLabel}>Chọn biểu tượng</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
              {ICONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => setSelectedIcon(emoji)}
                  style={[styles.iconBox, selectedIcon === emoji && styles.iconBoxActive]}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* 4. Chọn Màu Sắc */}
            <Text style={styles.sectionLabel}>Màu chủ đạo</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScroll}>
              {COLORS.map((col) => (
                <TouchableOpacity
                  key={col}
                  onPress={() => setSelectedColor(col)}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: col },
                    selectedColor === col && styles.colorCircleActive,
                  ]}
                />
              ))}
            </ScrollView>

            {/* 5. Mời Bạn Bè Vào Nhóm */}
            <View style={styles.memberHeaderRow}>
              <Text style={styles.sectionLabel}>
                Mời bạn bè ({selectedMemberIds.length}/{friends.length})
              </Text>
              <TouchableOpacity onPress={handleSelectAll}>
                <Text style={styles.selectAllText}>
                  {selectedMemberIds.length === friends.length ? 'Bỏ chọn hết' : 'Chọn tất cả'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Ô tìm bạn */}
            <View style={styles.searchFriendBox}>
              <Ionicons name="search" size={16} color="#64748B" />
              <TextInput
                style={styles.searchFriendInput}
                placeholder="Tìm bạn bè..."
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Danh sách bạn bè chọn checkbox */}
            <View style={styles.friendsList}>
              {filteredFriends.map((friend) => {
                const isSelected = selectedMemberIds.includes(friend.id);
                return (
                  <TouchableOpacity
                    key={friend.id}
                    style={[styles.friendItem, isSelected && styles.friendItemSelected]}
                    onPress={() => toggleMember(friend.id)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: friend.avatar }} style={styles.friendAvatar} />
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{friend.name}</Text>
                      <Text style={styles.friendStatus} numberOfLines={1}>
                        {friend.statusText || '🟢 Đang hoạt động'}
                      </Text>
                    </View>
                    <View style={[styles.checkbox, isSelected && { backgroundColor: selectedColor, borderColor: selectedColor }]}>
                      {isSelected && <Ionicons name="checkmark" size={14} color="#FFF" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer Button Tạo nhóm */}
          <View style={styles.footerContainer}>
            <TouchableOpacity activeOpacity={0.85} onPress={handleCreate} style={styles.submitBtnWrapper}>
              <LinearGradient colors={[selectedColor, '#E11D48']} style={styles.submitBtn}>
                <Text style={styles.submitBtnText}>Tạo nhóm & Hiển thị trên bản đồ 🚀</Text>
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
    maxHeight: height * 0.88,
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
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
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
  formContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 8,
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconPreview: {
    fontSize: 20,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: 46,
    color: '#FFF',
    fontSize: 14,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  typePillActive: {
    borderColor: '#FF4B72',
    backgroundColor: 'rgba(255, 75, 114, 0.15)',
  },
  typeIcon: {
    fontSize: 16,
  },
  typeText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  typeTextActive: {
    color: '#FF4B72',
    fontWeight: '700',
  },
  iconScroll: {
    marginBottom: 6,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconBoxActive: {
    borderColor: '#FF4B72',
    backgroundColor: 'rgba(255, 75, 114, 0.2)',
  },
  emojiText: {
    fontSize: 20,
  },
  colorScroll: {
    marginBottom: 8,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleActive: {
    borderColor: '#FFF',
    transform: [{ scale: 1.15 }],
  },
  memberHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  selectAllText: {
    fontSize: 12,
    color: '#FF4B72',
    fontWeight: '700',
  },
  searchFriendBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
    marginBottom: 10,
  },
  searchFriendInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 12,
    marginLeft: 8,
  },
  friendsList: {
    gap: 8,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  friendItemSelected: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: '#243046',
  },
  friendAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '600',
  },
  friendStatus: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  submitBtnWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
});
