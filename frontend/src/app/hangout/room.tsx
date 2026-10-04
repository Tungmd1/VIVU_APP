import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, Dimensions, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MapViewComponent } from '../../components/MapViewComponent';

export default function HangoutRoomScreen() {
  const router = useRouter();
  const { title } = useLocalSearchParams<{ title: string }>();
  const [inputText, setInputText] = useState('');

  // Mô phỏng 3 thành viên trong Kèo
  const members = [
    { id: 'me', name: 'Tôi', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', lat: 16.0544, lng: 108.2022, isSelf: true, status: 'Đang di chuyển' },
    { id: '2', name: 'Minh', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', lat: 16.0580, lng: 108.2050, isSelf: false, status: 'Đang đợi' },
    { id: '3', name: 'Quân', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150', lat: 16.0520, lng: 108.1980, isSelf: false, status: 'Chưa xuất phát' },
  ];

  const mapMarkers = useMemo(() => members.map(m => ({
    id: m.id,
    latitude: m.lat,
    longitude: m.lng,
    title: m.name,
    avatar: m.avatar,
    isSelf: m.isSelf,
  })), []);

  const [messages, setMessages] = useState([
    { id: '1', text: 'Tối nay 8h nhậu nha ae', sender: 'Minh', isMe: false, time: '19:00', avatar: members[1].avatar },
    { id: '2', text: 'Quán cũ hả m?', sender: 'Tôi', isMe: true, time: '19:02' },
    { id: '3', text: 'Đúng rồi, tau ra trước giữ bàn. Ai tới trễ bao chầu đầu!', sender: 'Quân', isMe: false, time: '19:05', avatar: members[2].avatar },
  ]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages([...messages, {
      id: Date.now().toString(),
      text: inputText,
      sender: 'Tôi',
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setInputText('');
  };

  return (
    <View style={styles.container}>
      {/* BACKGROUND LIVE MAP */}
      <View style={StyleSheet.absoluteFill}>
        <MapViewComponent
          markers={mapMarkers}
          centerCoordinate={{ latitude: 16.0550, longitude: 108.2010, zoom: 14 }}
          style={{ flex: 1 }}
        />
        <LinearGradient 
          colors={['rgba(11, 15, 25, 0.75)', 'rgba(11, 15, 25, 0.45)', 'rgba(11, 15, 25, 0.95)']} 
          style={StyleSheet.absoluteFill} 
          pointerEvents="none"
        />
      </View>

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* HEADER */}
        <BlurView intensity={90} tint="dark" style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-down" size={28} color="#FFF" />
            </TouchableOpacity>
            
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>{title || '🍻 Nhậu Đêm Cuối Tuần'}</Text>
              <Text style={styles.headerStatus}>Mục tiêu: Đang thảo luận • Đang chạy</Text>
            </View>

            <TouchableOpacity 
              style={[styles.inviteBtn, { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: '#EF4444', marginRight: 8 }]}
              onPress={() => {
                Alert.alert(
                  'Giải tán Kèo?',
                  'Cuộc đi chơi đã kết thúc, bạn muốn giải tán nhóm này?',
                  [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Giải tán', style: 'destructive', onPress: () => router.push('/' as any) }
                  ]
                );
              }}
            >
              <Ionicons name="power" size={20} color="#EF4444" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.inviteBtn} onPress={() => Alert.alert('Mời bạn bè', 'Đã sao chép link mời vào Kèo!')}>
              <Ionicons name="person-add" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* MEMBER TRAY */}
          <View style={styles.memberTray}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
              {members.map(m => (
                <View key={m.id} style={styles.memberBadge}>
                  <View style={[styles.avatarBorder, m.isSelf ? styles.borderSelf : styles.borderOther]}>
                    <Image source={{ uri: m.avatar }} style={styles.memberAvatar} />
                  </View>
                  <Text style={styles.memberName} numberOfLines={1}>{m.name}</Text>
                  <Text style={[styles.memberStatus, m.isSelf && { color: '#10B981' }]}>{m.status}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </BlurView>

        {/* MESSAGES */}
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[
              styles.messageWrapper, 
              item.isMe ? styles.messageWrapperMe : styles.messageWrapperThem
            ]}>
              {!item.isMe && (
                <Image source={{ uri: item.avatar }} style={styles.chatAvatar} />
              )}
              <View style={styles.messageContent}>
                {!item.isMe && <Text style={styles.senderName}>{item.sender}</Text>}
                <View style={[
                  styles.messageBubble, 
                  item.isMe ? styles.messageBubbleMe : styles.messageBubbleThem
                ]}>
                  <Text style={styles.messageText}>{item.text}</Text>
                </View>
                <Text style={styles.messageTime}>{item.time}</Text>
              </View>
            </View>
          )}
        />

        {/* INPUT */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <BlurView intensity={100} tint="dark" style={styles.inputContainer}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="location" size={22} color="#38BDF8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="camera" size={22} color="#94A3B8" />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              placeholder="Chat với nhóm..."
              placeholderTextColor="#64748B"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity 
              style={[styles.sendBtn, inputText.trim() ? styles.sendBtnActive : {}]} 
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Ionicons name="send" size={18} color={inputText.trim() ? "#FFF" : "#64748B"} />
            </TouchableOpacity>
          </BlurView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: {
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerStatus: {
    color: '#F59E0B',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600'
  },
  inviteBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10B981'
  },
  memberTray: {
    marginTop: 8,
  },
  memberBadge: {
    alignItems: 'center',
    width: 60,
  },
  avatarBorder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  borderSelf: {
    backgroundColor: '#10B981',
  },
  borderOther: {
    backgroundColor: '#38BDF8',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#0B0F19'
  },
  memberName: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  memberStatus: {
    color: '#94A3B8',
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center'
  },
  messageList: {
    padding: 16,
    paddingTop: 24,
  },
  messageWrapper: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageWrapperMe: {
    justifyContent: 'flex-end',
  },
  messageWrapperThem: {
    justifyContent: 'flex-start',
  },
  chatAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 16,
  },
  messageContent: {
    maxWidth: '80%',
  },
  senderName: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 4,
    marginLeft: 4,
  },
  messageBubble: {
    padding: 14,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  messageBubbleMe: {
    backgroundColor: '#FF2A7A',
    borderBottomRightRadius: 4,
  },
  messageBubbleThem: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  messageText: {
    color: '#FFF',
    fontSize: 15,
    lineHeight: 22,
  },
  messageTime: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconBtn: {
    marginRight: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  sendBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendBtnActive: {
    backgroundColor: '#FF2A7A',
    shadowColor: '#FF2A7A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  }
});
