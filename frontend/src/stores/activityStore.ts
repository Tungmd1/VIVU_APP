import { create } from 'zustand';
import { MOCK_ACTIVITY } from '../constants/mockData';
import { ApiClient } from '../services/api';
import { ActivityItem } from '../types';

interface ActivityState {
  activities: any[];
  currentActivity: any;
  isJoined: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  fetchActivities: (city?: string, category?: string) => Promise<void>;
  fetchActivityDetail: (id: string) => Promise<void>;
  joinActivity: (id: string, token: string, message?: string) => Promise<any>;
  toggleJoinActivity: () => void;
  
  // Hangout Session State
  activeHangout: { userId: string, userName: string } | null;
  setActiveHangout: (hangout: { userId: string, userName: string } | null) => void;
}

export const useActivityStore = create<ActivityState>((set) => ({
  activities: [],
  currentActivity: MOCK_ACTIVITY as any,
  isJoined: false,
  loading: false,
  error: null,
  activeHangout: null,
  setActiveHangout: (hangout) => set({ activeHangout: hangout }),

  fetchActivities: async (city = '', category = '') => {
    set({ loading: true });
    try {
      const res = await ApiClient.getActivities(city, category);
      if (res?.success && res.data) {
        set({ activities: res.data });
      }
    } finally {
      set({ loading: false });
    }
  },

  fetchActivityDetail: async (id: string) => {
    set({ loading: true });
    try {
      const res = await ApiClient.getActivityDetail(id);
      if (res?.success && res.data) {
        set({ currentActivity: res.data });
      }
    } finally {
      set({ loading: false });
    }
  },

  joinActivity: async (id: string, token: string, message = '') => {
    set({ loading: true });
    try {
      const res = await ApiClient.joinActivity(id, token, message);
      return res;
    } finally {
      set({ loading: false });
    }
  },

  toggleJoinActivity: () =>
    set((state) => {
      const nextJoined = !state.isJoined;
      return {
        isJoined: nextJoined,
        currentActivity: {
          ...state.currentActivity,
          joinedCount: nextJoined
            ? state.currentActivity.joinedCount + 1
            : Math.max(1, state.currentActivity.joinedCount - 1),
        },
      };
    }),
}));
