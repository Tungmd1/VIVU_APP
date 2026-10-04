import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenKey } from '../../types';

const { width } = Dimensions.get('window');

interface BottomDockProps {
  activeTab: 'home' | 'profile';
  onNavigate: (screen: ScreenKey) => void;
  onFabPress?: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({ activeTab, onNavigate, onFabPress }) => {
  return (
    <View style={styles.bottomDockContainer}>
      <View style={styles.dockBar}>
        {/* Tab 1: Bản đồ */}
        <TouchableOpacity 
          activeOpacity={0.8} 
          style={styles.dockItem}
          onPress={() => {
            if (activeTab !== 'home') onNavigate('home');
          }}
        >
          <Ionicons name="map" size={24} color={activeTab === 'home' ? "#FF4B72" : "#94A3B8"} />
          <Text style={[styles.dockLabel, activeTab === 'home' && styles.dockLabelActive]}>Bản đồ</Text>
        </TouchableOpacity>

        {/* Khoảng trống trung tâm cho FAB */}
        <View style={styles.dockCenterSpacer} />

        {/* Tab 2: Cá nhân */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (activeTab !== 'profile') onNavigate('profile');
          }}
          style={styles.dockItem}
        >
          <Ionicons name="person-outline" size={24} color={activeTab === 'profile' ? "#FF4B72" : "#94A3B8"} />
          <Text style={[styles.dockLabel, activeTab === 'profile' && styles.dockLabelActive]}>Cá nhân</Text>
        </TouchableOpacity>
      </View>

      {/* FAB NÚT TRUNG TÂM PHÁT TÍN HIỆU */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          if (onFabPress) {
            onFabPress();
          } else {
            onNavigate('home');
          }
        }}
        style={styles.fabButtonWrapper}
      >
        <LinearGradient
          colors={['#FF6B8B', '#FF4B72', '#E11D48']}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomDockContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 25,
  },
  dockBar: {
    width: Math.min(width - 60, 320),
    height: 64,
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    borderRadius: 32,
    marginBottom: Platform.OS === 'ios' ? 24 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    paddingHorizontal: 32,
  },
  dockItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  dockLabel: {
    fontSize: 12,
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
});
