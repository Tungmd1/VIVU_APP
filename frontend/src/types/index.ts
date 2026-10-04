export type ScreenKey = 'login' | 'register' | 'profile' | 'home';

export type BeaconCategory = 'all' | 'cafe' | 'sport' | 'food' | 'study' | 'travel';

export interface NowBeacon {
  id: string;
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
  createdAt: number;
  expiresAt: number;
  ttlHours: number;
  likesCount?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  city: string;
  trustScore: number;
  badge?: string;
  verified: boolean;
  postsCount: number;
  activitiesCount: number;
  friendsCount: number;
  communicationStyle: string;
  interests: string[];
  identifier?: string;
  phone?: string;
  email?: string;
  rating?: number;
  reviewCount?: number;
  joinDate?: string;
  badges?: string[];
  coverPhoto?: string;
  // Bổ sung các trường phong cách Tinder & Jagat
  age?: number;
  occupation?: string;
  education?: string;
  bio?: string;
  zodiac?: string;
  photos?: string[];
  privatePhotos?: string[];
  pinnedPhoto?: string;
  footprintPercent?: number;
  exploredPlacesCount?: number;
  ghostMode?: 'precise' | 'blurred' | 'frozen';
}

export interface PostItem {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    location: string;
    trustScore?: number;
  };
  timeAgo?: string;
  createdAt?: string;
  content: string;
  images: string[];
  location?: string;
  videoUrl?: string;
  videoDuration?: number;
  hashtags?: string[];
  likes: number;
  commentsCount: number;
  sharesCount?: number;
  isLiked?: boolean;
  activitySnippet?: {
    location: string;
    time: string;
    slots: string;
    budget?: string;
  };
  taggedVenue?: {
    id: string;
    name: string;
    address: string;
    platformSource?: string;
    latitude?: number;
    longitude?: number;
  };
  taggedCompanions?: Array<{
    id: string;
    name: string;
    avatar: string;
  }>;
  isRecruitment?: boolean;
  recruitmentSlots?: number;
  recruitmentJoined?: number;
  isWish?: boolean;
  wishDestination?: string;
  wishDate?: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  category: string;
  rating: number;
  reviewsCount: number;
  date: string;
  time: string;
  location: string;
  joinedCount: number;
  maxCount: number;
  image: string;
  host: {
    name: string;
    trustScore: number;
    avatar: string;
  };
  description: string;
  tags: string[];
  participants: Array<{
    id: string;
    name: string;
    avatar: string;
    role?: string;
    trustScore: number;
  }>;
}

export interface GroupItem {
  id: string;
  name: string;
  membersCount: string;
  avatar: string;
  coverImage: string;
  description: string;
  tags: string[];
  activeUsers: number;
  recentPostSnippet: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  isViViSuggestion?: boolean;
}

export interface ConversationItem {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    online: boolean;
  };
  lastMessage: string;
  time: string;
  unreadCount: number;
  isGroup?: boolean;
}
