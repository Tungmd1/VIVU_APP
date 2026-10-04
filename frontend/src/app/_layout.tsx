import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../constants/theme';
import { BottomDock } from '../components/common/BottomDock';
import { useBeaconStore } from '../stores/beaconStore';

export default function RootLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const setShowCreateModal = useBeaconStore((s) => s.setShowCreateModal);

  const showDock = pathname === '/home' || pathname === '/profile';
  const activeTab = pathname === '/profile' ? 'profile' : 'home';

  const handleNavigate = (screen: any) => {
    if (screen === 'home' || screen === 'profile' || screen === 'login') {
      router.replace(`/${screen}`);
    } else {
      router.push(`/${screen}`);
    }
  };

  const handleFabPress = () => {
    if (pathname !== '/home') {
      router.replace('/home');
    }
    setTimeout(() => {
      setShowCreateModal(true);
    }, 150);
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.container}>
        <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="home" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="chat" />
        </Stack>
        {showDock && (
          <BottomDock 
            activeTab={activeTab} 
            onNavigate={handleNavigate} 
            onFabPress={handleFabPress} 
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
