import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useActivityStore } from '../stores/activityStore';
import { MapViewComponent } from '../components/MapViewComponent';

export default function ChatScreen() {
  const router = useRouter();
  const { userId, userName } = useLocalSearchParams<{ userId: string; userName: string }>();
  const { setActiveHangout } = useActivityStore();
  const [inputText, setInputText] = useState('');

  // Tọa độ giả lập để demo Map-in-Chat
  const myLat = 16.0544;
  const myLng = 108.2022;
  const friendLat = myLat + 0.003;
  const friendLng = myLng + 0.003;

  const [messages, setMessages] = useState([
    { id: '1', text: `Chào ${userName || 'bạn'}, mình thấy bạn đang muốn đi cà phê!`, sender: 'me', time: '19:00' },
    { id: '2', text: `Chào bạn! Đúng rồi, bạn rảnh không đi chung cho vui?`, sender: 'them', time: '19:02' },
    { id: '3', text: `Mình đang ở gần đó, chừng 15 phút nữa mình qua nhé.`, sender: 'me', time: '19:03' },
  ]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages([...messages, {
      id: Date.now().toString(),
      text: inputText,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setInputText('');
  };

  const handleChotKeo = () => {
    // Chuyển sang màn hình tạo Group Chốt Kèo thay vì chỉ chat 1-1
    router.push('/hangout/room');
  };

  const mapMarkers = useMemo(() => [
    {
      id: 'me',
      latitude: myLat,
      longitude: myLng,
      title: 'Tôi',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      isSelf: true,
    },
    {
      id: userId || 'friend',
      latitude: friendLat,
      longitude: friendLng,
      title: userName || 'Bạn bè',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      isSelf: false,
    }
  ], [userId, userName]);

  const midLat = (myLat + friendLat) / 2;
  const midLng = (myLng + friendLng) / 2;

  return (
    <View style={styles.container}>
      {/* 1. BACKGROUND LIVE MAP */}
      <View style={StyleSheet.absoluteFill}>
        <MapViewComponent
          markers={mapMarkers}
          centerCoordinate={{ latitude: midLat, longitude: midLng, zoom: 14 }}
          initialRegion={{
            latitude: midLat,
            longitude: midLng,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          style={{ flex: 1 }}
        />
        {/* Lớp phủ Gradient làm tối map để dễ đọc chữ */}
        <LinearGradient 
          colors={['rgba(11, 15, 25, 0.7)', 'rgba(11, 15, 25, 0.4)', 'rgba(11, 15, 25, 0.9)']} 
          style={StyleSheet.absoluteFill} 
          pointerEvents="none"
        />
      </View>

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Header Glassmorphism */}
        <BlurView intensity={80} tint="dark" style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.headerTitle}>{userName || 'Trò chuyện'}</Text>
              <View style={styles.liveMapBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveMapText}>Live Map</Text>
              </View>
            </View>
            <Text style={styles.headerStatus}>Cách bạn 450m • Đang di chuyển</Text>
          </View>

          <TouchableOpacity style={styles.chotKeoBtn} onPress={handleChotKeo}>
            <LinearGradient colors={['#10B981', '#34D399']} style={styles.chotKeoGradient}>
              <Text style={styles.chotKeoText}>Chốt Kèo 🤝</Text>
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>

        {/* Messages */}
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[
              styles.messageWrapper, 
              item.sender === 'me' ? styles.messageWrapperMe : styles.messageWrapperThem
            ]}>
              <View style={[
                styles.messageBubble, 
                item.sender === 'me' ? styles.messageBubbleMe : styles.messageBubbleThem
              ]}>
                <Text style={styles.messageText}>{item.text}</Text>
              </View>
              <Text style={styles.messageTime}>{item.time}</Text>
            </View>
          )}
        />

        {/* Input Area */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        >
          <BlurView intensity={90} tint="dark" style={styles.inputContainer}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="location" size={24} color="#38BDF8" />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity 
              style={[styles.sendBtn, inputText.trim() ? styles.sendBtnActive : {}]} 
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Ionicons name="send" size={20} color={inputText.trim() ? "#FFF" : "#64748B"} />
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
    color: '#38BDF8',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600'
  },
  liveMapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 42, 122, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 42, 122, 0.5)'
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF2A7A',
    marginRight: 4,
  },
  liveMapText: {
    color: '#FF2A7A',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  chotKeoBtn: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  chotKeoGradient: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chotKeoText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  messageList: {
    padding: 16,
    paddingTop: 24,
  },
  messageWrapper: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  messageWrapperMe: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  messageWrapperThem: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
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
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
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
    fontSize: 11,
    marginTop: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconBtn: {
    marginRight: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  sendBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
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
