/**
 * defaultStarredPlaces.js
 * Danh mục địa điểm mẫu phong phú & phân tích danh hiệu Hộ chiếu Gu sở thích (Taste Passport)
 * Tuân thủ Rule 5 (Bootstrap Icons), Rule 11 (GPS an toàn)
 */

export const DEFAULT_STARRED_PLACES = [
  {
    id: 'spot-1',
    name: 'Sơn Trà Marina',
    category: 'chill',
    categoryLabel: 'Rooftop & Hoàng Hôn',
    icon: 'bi-sunset-fill',
    photo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
    rating: 5,
    review: 'View biển tựa Santorini, ngắm hoàng hôn chiều buông siêu thơ mộng.',
    visited: true,
    visitedAt: 'Hôm qua',
    lat: 16.1042,
    lng: 108.2612,
    address: 'Bán đảo Sơn Trà, TP. Đà Nẵng'
  },
  {
    id: 'spot-2',
    name: '43 Factory Coffee Roaster',
    category: 'cafe',
    categoryLabel: 'Cà Phê Specialty',
    icon: 'bi-cup-hot-fill',
    photo: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600',
    rating: 5,
    review: 'Không gian kính nước làm việc cực tập trung, hạt cà phê thơm đầm.',
    visited: true,
    visitedAt: '3 ngày trước',
    lat: 16.0592,
    lng: 108.2435,
    address: 'Khu An Thượng, Ngũ Hành Sơn, TP. Đà Nẵng'
  },
  {
    id: 'spot-3',
    name: 'Cầu Rồng & Chợ Đêm Sơn Trà',
    category: 'food',
    categoryLabel: 'Ẩm Thực Đêm',
    icon: 'bi-fire',
    photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
    rating: 4,
    review: 'Náo nhiệt, đồ ăn vặt đa dạng, hóng gió sông Hàn cuối tuần rực rỡ.',
    visited: true,
    visitedAt: 'Tuần trước',
    lat: 16.0610,
    lng: 108.2272,
    address: 'Đường Trần Hưng Đạo, TP. Đà Nẵng'
  },
  {
    id: 'spot-4',
    name: 'Bãi Biển Mỹ Khê',
    category: 'nature',
    categoryLabel: 'Thiên Nhiên & Biển',
    icon: 'bi-water',
    photo: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600',
    rating: 5,
    review: 'Bờ cát mịn trải dài, thích hợp chạy bộ bình minh và lướt sóng.',
    visited: true,
    visitedAt: '2 tuần trước',
    lat: 16.0583,
    lng: 108.2468,
    address: 'Đường Võ Nguyên Giáp, TP. Đà Nẵng'
  },
  {
    id: 'spot-5',
    name: 'Đèo Hải Vân - Cung Đường Phượt',
    category: 'camping',
    categoryLabel: 'Khám Phá Ngoại Ô',
    icon: 'bi-compass-fill',
    photo: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600',
    rating: 5,
    review: 'Săn mây đỉnh đèo, view trọn vịnh Đà Nẵng hùng vĩ nghìn trùng.',
    visited: true,
    visitedAt: 'Tháng trước',
    lat: 16.1868,
    lng: 108.1332,
    address: 'Ranh giới Đà Nẵng - Huế'
  },
  {
    id: 'spot-6',
    name: 'Bánh Xèo Bà Dưỡng',
    category: 'food',
    categoryLabel: 'Đặc Sản Địa Phương',
    icon: 'bi-egg-fried',
    photo: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600',
    rating: 4,
    review: 'Nước chấm mè đậu phộng độc quyền béo ngậy, bánh giòn rụm.',
    visited: true,
    visitedAt: 'Tháng trước',
    lat: 16.0538,
    lng: 108.2144,
    address: 'Kiệt 280 Hoàng Diệu, TP. Đà Nẵng'
  },
  {
    id: 'spot-7',
    name: 'Yên Cafe Acoustic',
    category: 'cafe',
    categoryLabel: 'Cà Phê Acoustic',
    icon: 'bi-music-note-beamed',
    photo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
    rating: 5,
    review: 'Nhạc guitar mộc mỗi tối thứ 6, không gian ấm cúng đậm chất hoài niệm.',
    visited: true,
    visitedAt: 'Tháng trước',
    lat: 16.0682,
    lng: 108.2198,
    address: 'Hải Châu, TP. Đà Nẵng'
  }
];

/**
 * Phân tích danh hiệu Hộ Chiếu Vết Chân (Taste Passport Badges)
 */
export function calculateTasteBadges(places = []) {
  const activePlaces = places.filter(p => p.visited);
  const badges = [];

  const cafeHigh = activePlaces.filter(p => p.category === 'cafe' && p.rating >= 4).length;
  const chillHigh = activePlaces.filter(p => p.category === 'chill' && p.rating >= 4).length;
  const foodHigh = activePlaces.filter(p => p.category === 'food' && p.rating >= 4).length;
  const natureHigh = activePlaces.filter(p => (p.category === 'nature' || p.category === 'camping') && p.rating >= 4).length;

  if (cafeHigh >= 1) {
    badges.push({
      id: 'cafe_master',
      title: 'Thánh Cà Phê 5★',
      icon: 'bi-cup-hot-fill',
      gradient: 'from-[#FF2A85] to-[#FF539A]',
      color: '#FF2A85',
      desc: 'Gu cà phê chất, say mê không gian acoustic & làm việc sáng tạo'
    });
  }

  if (chillHigh >= 1) {
    badges.push({
      id: 'sunset_hunter',
      title: 'Thợ Săn Hoàng Hôn',
      icon: 'bi-sunset-fill',
      gradient: 'from-[#FF7A00] to-[#FFB800]',
      color: '#FF7A00',
      desc: 'Thích view biển, rooftop lộng gió và khoảnh khắc hoàng hôn'
    });
  }

  if (foodHigh >= 1) {
    badges.push({
      id: 'foodie_pro',
      title: 'Chuyên Gia Ẩm Thực',
      icon: 'bi-fire',
      gradient: 'from-[#00E5FF] to-[#00A3FF]',
      color: '#00E5FF',
      desc: 'Sành ăn các quán đặc sản địa phương & phố ẩm thực đêm'
    });
  }

  if (natureHigh >= 1) {
    badges.push({
      id: 'wanderer',
      title: 'Kẻ Du Lãng Bụi',
      icon: 'bi-compass-fill',
      gradient: 'from-[#10FFA0] to-[#059669]',
      color: '#10FFA0',
      desc: 'Đam mê khám phá các cung đường phượt & cắm trại thiên nhiên'
    });
  }

  // Fallback nếu chưa có nhiều điểm
  if (badges.length === 0) {
    badges.push({
      id: 'explorer_novice',
      title: 'Nhà Thám Hiểm Mới',
      icon: 'bi-geo-alt-fill',
      gradient: 'from-[#FF2A85] to-[#00E5FF]',
      color: '#FF2A85',
      desc: 'Đang bắt đầu hành trình ghi dấu vết chân khắp thành phố'
    });
  }

  return badges;
}
