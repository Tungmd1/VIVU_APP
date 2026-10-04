import { useRouter } from 'expo-router';
import { RegisterScreen } from '../screens/onboarding/RegisterScreen';
import { ScreenKey } from '../types';

export default function RegisterRoute() {
  const router = useRouter();

  const handleNavigate = (screen: ScreenKey) => {
    if (screen === 'login') {
      router.replace('/login');
    } else if (screen === 'home') {
      router.replace('/home');
    } else if (screen === 'profile') {
      router.replace('/profile');
    }
  };

  return <RegisterScreen onNavigate={handleNavigate} />;
}
