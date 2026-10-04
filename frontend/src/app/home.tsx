import React from 'react';
import { useRouter } from 'expo-router';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ScreenKey } from '../types';

export default function HomeRoute() {
  const router = useRouter();

  const handleNavigate = (screen: any, params?: any) => {
    if (screen === 'profile') {
      router.push({ pathname: '/profile', params });
    } else if (screen === 'userProfile') {
      router.push({ pathname: `/user/${params?.userId}`, params: { name: params?.userName, avatar: params?.userAvatar } });
    } else if (screen === 'login') {
      router.replace('/login');
    } else if (screen === 'register') {
      router.push('/register');
    }
  };

  return <HomeScreen onNavigate={handleNavigate} />;
}
