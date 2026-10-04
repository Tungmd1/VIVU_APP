import { useRouter } from 'expo-router';
import { ScreenKey } from '../types';

export function useAppNavigation() {
  const router = useRouter();

  const navigateTo = (screen: ScreenKey | string) => {
    switch (screen) {
      case 'login':
        router.replace('/login');
        break;
      case 'register':
        router.push('/register');
        break;
      case 'home':
        router.replace('/home');
        break;
      case 'profile':
        router.push('/profile');
        break;
      default:
        router.replace('/login');
        break;
    }
  };

  return { navigateTo };
}
