import { useRouter } from 'expo-router';
import { LoginScreen } from '../screens/onboarding/LoginScreen';
import { ScreenKey } from '../types';

export default function LoginRoute() {
  const router = useRouter();

  const handleNavigate = (screen: ScreenKey) => {
    if (screen === 'register') {
      router.push('/register');
    } else if (screen === 'home') {
      router.replace('/home');
    } else if (screen === 'profile') {
      router.replace('/profile');
    }
  };

  return <LoginScreen onNavigate={handleNavigate} />;
}
