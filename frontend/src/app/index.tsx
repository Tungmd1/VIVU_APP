import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores/authStore';

export default function Index() {
  const router = useRouter();
  const loadSession = useAuthStore((s) => s.loadSession);

  useEffect(() => {
    let active = true;
    loadSession().then(() => {
      if (!active) return;
      const token = useAuthStore.getState().token;
      const user = useAuthStore.getState().user;
      if (token && user) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
    });
    return () => {
      active = false;
    };
  }, [loadSession, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0F19' }}>
      <ActivityIndicator size="large" color="#FF4B72" />
    </View>
  );
}
