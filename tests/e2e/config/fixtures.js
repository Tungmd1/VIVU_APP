import crypto from 'node:crypto';

/**
 * Standard E2E Test Fixtures
 * Contains real Vietnamese user profiles, genuine GPS coordinates,
 * places categories, and WebRTC signaling test payloads.
 */

export const REAL_USERS = {
  userA: {
    id: `e2e_user_a_${crypto.randomBytes(4).toString('hex')}`,
    full_name: 'Nguyễn Minh Anh',
    email: 'minhanh.test@example.com',
    user_code: 'VU-E2E-A1',
    password: 'Password@1234',
    avatar: '/uploads/avatars/avatar_a.jpg',
    bio: 'Khám phá ẩm thực & du lịch Hà Nội',
    is_online: true
  },
  userB: {
    id: `e2e_user_b_${crypto.randomBytes(4).toString('hex')}`,
    full_name: 'Trần Bảo Long',
    email: 'baolong.test@example.com',
    user_code: 'VU-E2E-B2',
    password: 'Password@1234',
    avatar: '/uploads/avatars/avatar_b.jpg',
    bio: 'Lập trình viên & Yêu âm nhạc Đà Nẵng',
    is_online: true
  },
  userC: {
    id: `e2e_user_c_${crypto.randomBytes(4).toString('hex')}`,
    full_name: 'Lê Thùy Dung',
    email: 'thuydung.test@example.com',
    user_code: 'VU-E2E-C3',
    password: 'Password@1234',
    avatar: '/uploads/avatars/avatar_c.jpg',
    bio: 'Yêu thích nhảy múa & cà phê Sài Gòn',
    is_online: false
  },
  userD: {
    id: `e2e_user_d_${crypto.randomBytes(4).toString('hex')}`,
    full_name: 'Phạm Hoàng Nam',
    email: 'hoangnam.test@example.com',
    user_code: 'VU-E2E-D4',
    password: 'Password@1234',
    avatar: '/uploads/avatars/avatar_d.jpg',
    bio: 'Du lịch miền Tây & Danh lam thắng cảnh Cần Thơ',
    is_online: false
  }
};

export const REAL_GPS_LOCATIONS = {
  // Hà Nội
  hanoiHoanKiem: {
    lat: 21.028511,
    lng: 105.854167,
    accuracy: 5.2,
    name: 'Hồ Hoàn Kiếm, Hà Nội'
  },
  hanoiWestLake: {
    lat: 21.055833,
    lng: 105.823611,
    accuracy: 4.8,
    name: 'Hồ Tây, Hà Nội'
  },
  // Đà Nẵng
  danangDragonBridge: {
    lat: 16.0610,
    lng: 108.2272,
    accuracy: 6.1,
    name: 'Cầu Rồng, Đà Nẵng'
  },
  danangMyKhe: {
    lat: 16.0592,
    lng: 108.2435,
    accuracy: 3.9,
    name: 'Bãi biển Mỹ Khê, Đà Nẵng'
  },
  // TP. Hồ Chí Minh (Tọa độ thực, không phải fallback)
  saigonBenThanh: {
    lat: 10.7725,
    lng: 106.6980,
    accuracy: 5.0,
    name: 'Chợ Bến Thành, TP.HCM'
  },
  saigonLandmark81: {
    lat: 10.7950,
    lng: 106.7219,
    accuracy: 4.2,
    name: 'Landmark 81, TP.HCM'
  },
  // Cần Thơ
  canthoNinhKieu: {
    lat: 10.0336,
    lng: 105.7877,
    accuracy: 6.5,
    name: 'Bến Ninh Kiều, Cần Thơ'
  },
  // Cặp tọa độ co-location cực gần (<60m) để kiểm thử Feature 8
  colocatedA: {
    lat: 21.028500,
    lng: 105.854150,
    accuracy: 3.0,
    name: 'Điểm A Hồ Gươm'
  },
  colocatedB_15m: {
    lat: 21.028590,
    lng: 105.854220,
    accuracy: 3.5,
    name: 'Điểm B cách A 15m'
  }
};

// Hardcoded fallback coordinates to purge (Feature 5 check)
export const FORBIDDEN_SAIGON_FALLBACK = {
  lat: 10.7769,
  lng: 106.7009
};

// Saved Places Fixtures (Feature 11, 12, 13, 14)
export const SAVED_PLACES_FIXTURES = [
  {
    name: 'Phở Thìn Bờ Hồ',
    category: 'food',
    notes: 'Quán phở truyền thống gia đình rất ngon',
    lat: 21.0315,
    lng: 105.8528,
    image: '/uploads/places/pho_thin.jpg'
  },
  {
    name: 'Acoustic Bar Live Music',
    category: 'music',
    notes: 'Ban nhạc rock indie biểu diễn mỗi tối thứ 6',
    lat: 10.7812,
    lng: 106.6914,
    image: '/uploads/places/acoustic_bar.jpg'
  },
  {
    name: 'Soul Dance Studio Danang',
    category: 'dance',
    notes: 'Lớp học nhảy hiphop và breaking cho giới trẻ',
    lat: 16.0688,
    lng: 108.2155,
    image: '/uploads/places/dance_studio.jpg'
  },
  {
    name: 'Chùa Một Cột',
    category: 'sightseeing',
    notes: 'Di tích lịch sử danh lam thắng cảnh nghìn năm văn hiến',
    lat: 21.0358,
    lng: 105.8336,
    image: '/uploads/places/chua_mot_cot.jpg'
  }
];

// WebRTC Signaling Payload Fixtures (Features 15, 16, 17, 18, 19)
export const WEBRTC_FIXTURES = {
  sampleOffer: {
    type: 'offer',
    sdp: 'v=0\r\no=- 4239847293847 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0 1\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nm=video 9 UDP/TLS/RTP/SAVPF 96\r\n'
  },
  sampleAnswer: {
    type: 'answer',
    sdp: 'v=0\r\no=- 5239847293848 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0 1\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nm=video 9 UDP/TLS/RTP/SAVPF 96\r\n'
  },
  sampleCandidate1: {
    candidate: 'candidate:842163049 1 udp 1677729535 192.168.1.105 52834 typ host',
    sdpMid: '0',
    sdpMLineIndex: 0
  },
  sampleCandidate2: {
    candidate: 'candidate:842163050 1 udp 1677729535 192.168.1.105 52835 typ host',
    sdpMid: '1',
    sdpMLineIndex: 1
  }
};
