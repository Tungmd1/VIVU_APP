import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiClient } from '../services/api';
import { BeaconCategory, NowBeacon } from '../types';

interface BeaconState {
  beacons: NowBeacon[];
  myBeacon: NowBeacon | null;
  activeCategory: BeaconCategory;
  loading: boolean;
  showCreateModal: boolean;

  setShowCreateModal: (show: boolean) => void;
  setActiveCategory: (cat: BeaconCategory) => void;
  fetchBeacons: (cat?: BeaconCategory) => Promise<void>;
  postBeacon: (data: {
    userId: string;
    userName: string;
    userAvatar: string;
    userAge?: number;
    userOccupation?: string;
    userInterests?: string[];
    batteryLevel?: number;
    statusMode?: 'chilling' | 'working' | 'moving' | 'online';
    latitude: number;
    longitude: number;
    category: BeaconCategory;
    emoji: string;
    content: string;
    imageUrl?: string;
    ttlHours: number;
  }) => Promise<NowBeacon | null>;
  deleteBeacon: (beaconId: string) => Promise<void>;
  reactToBeacon: (beaconId: string) => Promise<void>;
  loadSavedMyBeacon: (userId: string) => Promise<void>;
}

const MY_BEACON_STORAGE_PREFIX = 'vivu_my_beacon_';

export const useBeaconStore = create<BeaconState>((set, get) => ({
  beacons: [],
  myBeacon: null,
  activeCategory: 'all',
  loading: false,
  showCreateModal: false,

  setShowCreateModal: (show: boolean) => set({ showCreateModal: show }),

  setActiveCategory: (cat: BeaconCategory) => {
    set({ activeCategory: cat });
    get().fetchBeacons(cat);
  },

  fetchBeacons: async (cat?: BeaconCategory) => {
    const currentCat = cat || get().activeCategory;
    set({ loading: true });
    try {
      const res = await ApiClient.getBeacons(currentCat);
      if (res && res.success && Array.isArray(res.data)) {
        const now = Date.now();
        const validBeacons = res.data.filter((b: NowBeacon) => !b.expiresAt || b.expiresAt > now);
        
        // Cập nhật myBeacon nếu có beacon của chính mình trong danh sách
        const { myBeacon } = get();
        if (myBeacon && (!myBeacon.expiresAt || myBeacon.expiresAt <= now)) {
          set({ myBeacon: null });
        }
        
        set({ beacons: validBeacons });
      }
    } catch (err) {
      console.error('Lỗi khi fetch beacons:', err);
    } finally {
      set({ loading: false });
    }
  },

  postBeacon: async (beaconData) => {
    set({ loading: true });
    try {
      const res = await ApiClient.postBeacon(beaconData);
      if (res && res.success && res.data) {
        const newBeacon: NowBeacon = res.data;
        
        // Lưu cục bộ để khôi phục nhanh
        try {
          await AsyncStorage.setItem(
            `${MY_BEACON_STORAGE_PREFIX}${beaconData.userId}`,
            JSON.stringify(newBeacon)
          );
        } catch {
          // ignore
        }

        set((state) => {
          const filtered = state.beacons.filter((b) => b.userId !== beaconData.userId);
          return {
            beacons: [newBeacon, ...filtered],
            myBeacon: newBeacon,
          };
        });

        return newBeacon;
      }
      return null;
    } catch (err) {
      console.error('Lỗi khi post beacon:', err);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  deleteBeacon: async (beaconId: string) => {
    try {
      await ApiClient.deleteBeacon(beaconId);
      const { myBeacon } = get();
      if (myBeacon && myBeacon.id === beaconId) {
        try {
          await AsyncStorage.removeItem(`${MY_BEACON_STORAGE_PREFIX}${myBeacon.userId}`);
        } catch {
          // ignore
        }
        set({ myBeacon: null });
      }
      set((state) => ({
        beacons: state.beacons.filter((b) => b.id !== beaconId),
      }));
    } catch (err) {
      console.error('Lỗi khi xóa beacon:', err);
    }
  },

  reactToBeacon: async (beaconId: string) => {
    // Optimistic update
    set((state) => ({
      beacons: state.beacons.map((b) =>
        b.id === beaconId ? { ...b, likesCount: (b.likesCount || 0) + 1 } : b
      ),
      myBeacon:
        state.myBeacon?.id === beaconId
          ? { ...state.myBeacon, likesCount: (state.myBeacon.likesCount || 0) + 1 }
          : state.myBeacon,
    }));

    try {
      await ApiClient.reactBeacon(beaconId);
    } catch {
      // ignore
    }
  },

  loadSavedMyBeacon: async (userId: string) => {
    try {
      const raw = await AsyncStorage.getItem(`${MY_BEACON_STORAGE_PREFIX}${userId}`);
      if (raw) {
        const parsed: NowBeacon = JSON.parse(raw);
        if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
          set({ myBeacon: parsed });
        } else {
          await AsyncStorage.removeItem(`${MY_BEACON_STORAGE_PREFIX}${userId}`);
          set({ myBeacon: null });
        }
      }
    } catch {
      // ignore
    }
  },
}));
