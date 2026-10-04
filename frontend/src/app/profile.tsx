import React from 'react';
import { useRouter } from 'expo-router';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { ScreenKey } from '../types';

export default function ProfileRoute() {
  const router = useRouter();

  const handleNavigate = (screen: ScreenKey) => {
    if (screen === 'home') {
      router.replace('/home');
    } else if (screen === 'login') {
      router.replace('/login');
    } else if (screen === 'register') {
      router.push('/register');
    }
  };

  return <ProfileScreen onNavigate={handleNavigate} />;
}
