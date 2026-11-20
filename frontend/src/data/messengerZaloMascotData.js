/**
 * messengerZaloMascotData.js - Vũ Trụ Chibi & Meme Bản Đồ Phong Cách FB Messenger & Zalo
 * - 4 Dòng Nhân Vật Kinh Điển: Mèo Béo Ami Bụng Bự (Zalo), Khủng Long Vàng QooBee (Messenger), Quỳnh Aka & Tuzki, Mèo Pusheen & Capybara
 * - 7 Hành Động Đời Thường Đặc Sắc: Vi vu xe máy, Hút trà sữa, Chạy deadline, Ngủ nướng, Húp mì/ăn vặt, Cầm dép chọi troll, Bắn tim
 * - 100% Vector Claymorphism 3D Xúc Giác (Inner highlight, bóng đổ mềm mại, 0 emoji - Rule 5 & Rule 45)
 * - Tích hợp Web Audio Synth âm thanh chân thực theo từng hành động
 */

export const MASCOT_FAMILIES = [
  { id: 'ami_fat_cat', name: 'Mèo Béo Ami', origin: 'Zalo Icon', icon: 'bi-emoji-smile', color: '#FFFFFF', accent: '#FF94B9' },
  { id: 'qoobee_dino', name: 'Khủng Long QooBee', origin: 'Messenger Icon', icon: 'bi-heart-fill', color: '#FFD700', accent: '#FF4500' },
  { id: 'quynh_aka', name: 'Quỳnh Aka & Tuzki', origin: 'Tấu Hài Nhây', icon: 'bi-lightning-charge-fill', color: '#FFE600', accent: '#10FFA0' },
  { id: 'pusheen_capy', name: 'Pusheen & Capy', origin: 'Chill & Vibe', icon: 'bi-sunglasses', color: '#C8A2C8', accent: '#00E5FF' }
];

export const MASCOT_ACTIONS = [
  { id: 'scooter', label: 'Vi Vu Xe Máy', icon: 'bi-scooter', sound: 'engine' },
  { id: 'boba', label: 'Hút Trà Sữa', icon: 'bi-cup-straw', sound: 'slurp' },
  { id: 'deadline', label: 'Chạy Deadline', icon: 'bi-laptop', sound: 'keyboard' },
  { id: 'sleep', label: 'Ngủ Nướng zZz', icon: 'bi-moon-stars-fill', sound: 'snore' },
  { id: 'eat', label: 'Húp Mì / Ăn Vặt', icon: 'bi-egg-fried', sound: 'chew' },
  { id: 'troll', label: 'Cầm Dép Chọi', icon: 'bi-send-fill', sound: 'bonk' },
  { id: 'love', label: 'Bắn Tim Tung Tóe', icon: 'bi-heart-pulse-fill', sound: 'chime' }
];

// Trình tạo SVG Claymorphism 3D Vector cho từng Nhân Vật và Hành Động
export function generateMascotActionSvg(familyId, actionId) {
  // Bảng phối màu cho từng nhân vật
  const pal = {
    ami_fat_cat: { base: '#FFF5F8', stroke: '#E87A90', cheek: '#FF88A5', ear: '#FFB3C6' },
    qoobee_dino: { base: '#FFDE59', stroke: '#D49E00', cheek: '#FF5757', belly: '#FFF1B0' },
    quynh_aka: { base: '#FFF176', stroke: '#C79A00', cheek: '#FF5252', lip: '#FF1744' },
    pusheen_capy: { base: '#D7CCC8', stroke: '#8D6E63', cheek: '#FFAB91', stripe: '#6D4C41' }
  }[familyId] || { base: '#FFF5F8', stroke: '#E87A90', cheek: '#FF88A5' };

  // 1. VI VU XE MÁY (Scooter Ride)
  if (actionId === 'scooter') {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <radialGradient id="clayHead_${familyId}_${actionId}" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/>
            <stop offset="50%" stop-color="${pal.base}"/>
            <stop offset="100%" stop-color="${pal.stroke}"/>
          </radialGradient>
          <linearGradient id="scooterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#00E5FF"/>
            <stop offset="100%" stop-color="#00838F"/>
          </linearGradient>
          <filter id="clayShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
          </filter>
        </defs>
        <!-- Bánh xe máy 3D -->
        <circle cx="28" cy="80" r="11" fill="#263238" filter="url(#clayShadow)"/>
        <circle cx="28" cy="80" r="6" fill="#B0BEC5"/>
        <circle cx="74" cy="80" r="11" fill="#263238" filter="url(#clayShadow)"/>
        <circle cx="74" cy="80" r="6" fill="#B0BEC5"/>
        <!-- Thân xe máy tay ga vi vu -->
        <path d="M 28 80 L 48 78 L 68 68 L 74 80 Z" fill="url(#scooterGrad)" filter="url(#clayShadow)"/>
        <path d="M 64 68 L 72 48 L 76 50 L 70 70 Z" fill="#00ACC1"/>
        <!-- Đèn xe & Ghi-đông -->
        <circle cx="73" cy="48" r="4" fill="#FFEB3B" filter="url(#clayShadow)"/>
        <rect x="68" y="45" width="8" height="3" rx="1.5" fill="#37474F"/>
        <!-- Thân nhân vật Chibi -->
        <ellipse cx="48" cy="52" rx="16" ry="14" fill="url(#clayHead_${familyId}_${actionId})" filter="url(#clayShadow)"/>
        <!-- Đầu nhân vật Chibi đội mũ bảo hiểm -->
        <circle cx="48" cy="34" r="18" fill="url(#clayHead_${familyId}_${actionId})" filter="url(#clayShadow)"/>
        <!-- Mũ bảo hiểm nửa đầu siêu ngầu -->
        <path d="M 32 32 C 32 18, 64 18, 64 32 Z" fill="#FF2A85"/>
        <rect x="30" y="30" width="36" height="3" rx="1.5" fill="#FFFFFF"/>
        <!-- Mắt nhắm tít vi vu đón gió -->
        <path d="M 40 35 Q 43 31 46 35" stroke="#212121" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <path d="M 52 35 Q 55 31 58 35" stroke="#212121" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <!-- Má hồng hây hây -->
        <ellipse cx="38" cy="39" rx="3.5" ry="2" fill="${pal.cheek}" opacity="0.8"/>
        <ellipse cx="60" cy="39" rx="3.5" ry="2" fill="${pal.cheek}" opacity="0.8"/>
        <!-- Miệng cười toe toét -->
        <path d="M 46 39 Q 49 44 52 39" stroke="#212121" stroke-width="2" stroke-linecap="round" fill="#D32F2F"/>
        <!-- Gió lướt phía sau -->
        <path d="M 12 45 L 24 45 M 8 52 L 20 52 M 14 59 L 26 59" stroke="#00E5FF" stroke-width="2" stroke-linecap="round" opacity="0.75"/>
      </svg>
    `;
  }

  // 2. HÚT TRÀ SỮA (Boba Milk Tea Sip)
  if (actionId === 'boba') {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <radialGradient id="clayHead_${familyId}_${actionId}" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/>
            <stop offset="50%" stop-color="${pal.base}"/>
            <stop offset="100%" stop-color="${pal.stroke}"/>
          </radialGradient>
          <linearGradient id="teaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFE0B2"/>
            <stop offset="100%" stop-color="#D7CCC8"/>
          </linearGradient>
          <filter id="clayShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
          </filter>
        </defs>
        <!-- Thân Chibi ngồi béo tròn -->
        <ellipse cx="50" cy="68" rx="22" ry="18" fill="url(#clayHead_${familyId}_${actionId})" filter="url(#clayShadow)"/>
        <!-- Đầu Chibi to tròn má phúng phính -->
        <circle cx="50" cy="40" r="22" fill="url(#clayHead_${familyId}_${actionId})" filter="url(#clayShadow)"/>
        <!-- Mắt long lanh sung sướng -->
        <circle cx="41" cy="38" r="3.5" fill="#212121"/>
        <circle cx="42.5" cy="36.5" r="1.2" fill="#FFFFFF"/>
        <circle cx="59" cy="38" r="3.5" fill="#212121"/>
        <circle cx="60.5" cy="36.5" r="1.2" fill="#FFFFFF"/>
        <!-- Má phồng to hút trà sữa -->
        <circle cx="36" cy="44" r="5" fill="${pal.cheek}" opacity="0.85"/>
        <circle cx="64" cy="44" r="5" fill="${pal.cheek}" opacity="0.85"/>
        <!-- Ly trà sữa trân châu bự chảng -->
        <path d="M 40 58 L 44 86 C 44 88, 56 88, 56 86 L 60 58 Z" fill="url(#teaGrad)" stroke="#FFFFFF" stroke-width="1.5" filter="url(#clayShadow)"/>
        <!-- Nắp ly cầu tròn -->
        <path d="M 38 58 Q 50 51 62 58 Z" fill="#FF80AB" opacity="0.9"/>
        <!-- Ống hút cắm thẳng vào miệng -->
        <line x1="50" y1="44" x2="50" y2="76" stroke="#FF2A85" stroke-width="3" stroke-linecap="round"/>
        <!-- Hạt trân châu đen óng ánh -->
        <circle cx="47" cy="80" r="2.2" fill="#212121"/>
        <circle cx="53" cy="81" r="2.2" fill="#212121"/>
        <circle cx="50" cy="84" r="2.2" fill="#212121"/>
        <circle cx="48" cy="74" r="2.2" fill="#212121"/>
        <circle cx="53" cy="76" r="2.2" fill="#212121"/>
        <!-- Hai tay ôm ly trà sữa -->
        <circle cx="39" cy="65" r="5" fill="url(#clayHead_${familyId}_${actionId})"/>
        <circle cx="61" cy="65" r="5" fill="url(#clayHead_${familyId}_${actionId})"/>
      </svg>
    `;
  }

  // 3. CHẠY DEADLINE LAPTOP (Laptop Deadline Sprint)
  if (actionId === 'deadline') {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <radialGradient id="clayHead_${familyId}_${actionId}" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/>
            <stop offset="50%" stop-color="${pal.base}"/>
            <stop offset="100%" stop-color="${pal.stroke}"/>
          </radialGradient>
          <filter id="clayShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
          </filter>
        </defs>
        <!-- Đầu Chibi đeo kính cận chạy deadline -->
        <circle cx="50" cy="36" r="22" fill="url(#clayHead_${familyId}_${actionId})" filter="url(#clayShadow)"/>
        <!-- Kính tròn trí thức gọng đen -->
        <circle cx="42" cy="36" r="6" fill="#00E5FF" fill-opacity="0.3" stroke="#212121" stroke-width="1.8"/>
        <circle cx="58" cy="36" r="6" fill="#00E5FF" fill-opacity="0.3" stroke="#212121" stroke-width="1.8"/>
        <line x1="48" y1="36" x2="52" y2="36" stroke="#212121" stroke-width="1.8"/>
        <!-- Mắt quầng thâm vì thức đêm -->
        <path d="M 37 43 Q 42 46 47 43" stroke="#795548" stroke-width="1.5" fill="none" opacity="0.6"/>
        <path d="M 53 43 Q 58 46 63 43" stroke="#795548" stroke-width="1.5" fill="none" opacity="0.6"/>
        <!-- Miệng cắn răng tập trung -->
        <rect x="46" y="44" width="8" height="2.5" rx="1.2" fill="#D32F2F"/>
        <!-- Thân ngồi trước bàn -->
        <ellipse cx="50" cy="65" rx="20" ry="15" fill="url(#clayHead_${familyId}_${actionId})" filter="url(#clayShadow)"/>
        <!-- Chiếc Laptop phát sáng màn hình -->
        <path d="M 36 64 L 64 64 L 60 78 L 40 78 Z" fill="#455A64" filter="url(#clayShadow)"/>
        <path d="M 38 64 L 62 64 L 62 48 L 38 48 Z" fill="#ECEFF1" stroke="#37474F" stroke-width="1.5"/>
        <!-- Logo quả táo phát sáng -->
        <circle cx="50" cy="56" r="2.5" fill="#00E5FF"/>
        <!-- Bàn phím gõ lách cách -->
        <rect x="42" y="66" width="16" height="8" rx="1" fill="#263238"/>
        <!-- Tia lửa / khói bốc ra từ bàn phím -->
        <path d="M 34 60 Q 30 54 35 48" stroke="#FF5722" stroke-width="1.8" stroke-dasharray="2 2" fill="none"/>
        <path d="M 66 60 Q 70 54 65 48" stroke="#FF5722" stroke-width="1.8" stroke-dasharray="2 2" fill="none"/>
      </svg>
    `;
  }

  // 4. NGỦ NƯỚNG CUỘN CHĂN (Lazy Sleeping zZz)
  if (actionId === 'sleep') {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <radialGradient id="clayHead_${familyId}_${actionId}" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/>
            <stop offset="50%" stop-color="${pal.base}"/>
            <stop offset="100%" stop-color="${pal.stroke}"/>
          </radialGradient>
          <linearGradient id="blanketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#81D4FA"/>
            <stop offset="100%" stop-color="#0288D1"/>
          </linearGradient>
          <filter id="clayShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
          </filter>
        </defs>
        <!-- Chiếc gối êm ái -->
        <rect x="22" y="42" width="56" height="34" rx="12" fill="#FFF9C4" filter="url(#clayShadow)"/>
        <!-- Chăn bông cuộn ấm áp -->
        <path d="M 24 55 Q 50 48 76 55 L 76 84 Q 50 90 24 84 Z" fill="url(#blanketGrad)" filter="url(#clayShadow)"/>
        <circle cx="34" cy="68" r="3" fill="#FFFFFF" opacity="0.4"/>
        <circle cx="50" cy="74" r="4" fill="#FFFFFF" opacity="0.4"/>
        <circle cx="66" cy="68" r="3" fill="#FFFFFF" opacity="0.4"/>
        <!-- Đầu Chibi nằm nghiêng ngủ say sưa -->
        <circle cx="48" cy="46" r="18" fill="url(#clayHead_${familyId}_${actionId})" filter="url(#clayShadow)"/>
        <!-- Mũ len ngủ ban đêm có chuông -->
        <path d="M 34 38 Q 48 20 62 38 Z" fill="#FF4081"/>
        <circle cx="48" cy="22" r="4" fill="#FFFFFF"/>
        <!-- Mắt nhắm tít ngủ ngon -->
        <path d="M 40 46 Q 44 50 48 46" stroke="#212121" stroke-width="2" stroke-linecap="round" fill="none"/>
        <path d="M 52 46 Q 56 50 60 46" stroke="#212121" stroke-width="2" stroke-linecap="round" fill="none"/>
        <!-- Má hồng ngủ say -->
        <ellipse cx="38" cy="50" rx="3.5" ry="2" fill="${pal.cheek}" opacity="0.7"/>
        <ellipse cx="62" cy="50" rx="3.5" ry="2" fill="${pal.cheek}" opacity="0.7"/>
        <!-- Nước miếng chảy nhỏ dãi đáng yêu -->
        <path d="M 54 52 Q 56 58 53 58 Q 50 58 52 52" fill="#80D8FF"/>
        <!-- Ký tự zZz bay lên -->
        <text x="68" y="32" font-family="sans-serif" font-weight="900" font-size="11" fill="#7C4DFF">Z</text>
        <text x="76" y="24" font-family="sans-serif" font-weight="900" font-size="9" fill="#B388FF">z</text>
        <text x="82" y="16" font-family="sans-serif" font-weight="900" font-size="7" fill="#E040FB">z</text>
      </svg>
    `;
  }

  // 5. HÚP MÌ TÔM / GẶM GÀ RÁN (Eat Yummy Food)
  if (actionId === 'eat') {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <radialGradient id="clayHead_${familyId}_${actionId}" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/>
            <stop offset="50%" stop-color="${pal.base}"/>
            <stop offset="100%" stop-color="${pal.stroke}"/>
          </radialGradient>
          <filter id="clayShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
          </filter>
        </defs>
        <!-- Đầu Chibi há to mồm ăn -->
        <circle cx="50" cy="38" r="22" fill="url(#clayHead_${familyId}_${actionId})" filter="url(#clayShadow)"/>
        <!-- Mắt chớp chớp thèm thuồng -->
        <circle cx="41" cy="34" r="3.5" fill="#212121"/>
        <circle cx="42.5" cy="32.5" r="1.2" fill="#FFFFFF"/>
        <circle cx="59" cy="34" r="3.5" fill="#212121"/>
        <circle cx="60.5" cy="32.5" r="1.2" fill="#FFFFFF"/>
        <!-- Mồm há to húp mì -->
        <path d="M 43 42 Q 50 54 57 42 Z" fill="#D32F2F"/>
        <!-- Tô mì cay bốc khói -->
        <ellipse cx="50" cy="72" rx="22" ry="12" fill="#FF5722" filter="url(#clayShadow)"/>
        <ellipse cx="50" cy="70" rx="19" ry="8" fill="#FFE082"/>
        <!-- Sợi mì vàng óng -->
        <path d="M 42 70 Q 50 64 58 70" stroke="#FFD54F" stroke-width="2.5" fill="none"/>
        <path d="M 44 68 Q 50 60 56 68" stroke="#FFD54F" stroke-width="2.5" fill="none"/>
        <!-- Đôi đũa gắp mì đưa lên miệng -->
        <line x1="62" y1="52" x2="48" y2="44" stroke="#8D6E63" stroke-width="2" stroke-linecap="round"/>
        <line x1="64" y1="54" x2="50" y2="46" stroke="#8D6E63" stroke-width="2" stroke-linecap="round"/>
        <!-- Khói nghi ngút thơm lừng -->
        <path d="M 44 58 Q 42 50 46 46" stroke="#B0BEC5" stroke-width="1.8" stroke-linecap="round" fill="none"/>
        <path d="M 56 58 Q 58 50 54 46" stroke="#B0BEC5" stroke-width="1.8" stroke-linecap="round" fill="none"/>
      </svg>
    `;
  }

  // 6. CẦM DÉP LÀO CHỌI TROLL (Bonk Slipper Troll)
  if (actionId === 'troll') {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <radialGradient id="clayHead_${familyId}_${actionId}" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/>
            <stop offset="50%" stop-color="${pal.base}"/>
            <stop offset="100%" stop-color="${pal.stroke}"/>
          </radialGradient>
          <filter id="clayShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
          </filter>
        </defs>
        <!-- Đầu Chibi cười nhăn nhở troll lầy lội -->
        <circle cx="46" cy="40" r="22" fill="url(#clayHead_${familyId}_${actionId})" filter="url(#clayShadow)"/>
        <!-- Mắt nháy 1 bên lém lỉnh -->
        <path d="M 36 38 Q 41 33 46 38" stroke="#212121" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <circle cx="56" cy="38" r="3.5" fill="#212121"/>
        <circle cx="57.5" cy="36.5" r="1.2" fill="#FFFFFF"/>
        <!-- Miệng lè lưỡi lêu lêu -->
        <path d="M 42 45 Q 48 52 54 45 Z" fill="#212121"/>
        <path d="M 45 47 Q 48 55 51 47 Z" fill="#FF4081"/>
        <!-- Thân Chibi đứng chuẩn bị chọi dép -->
        <ellipse cx="46" cy="68" rx="18" ry="15" fill="url(#clayHead_${familyId}_${actionId})" filter="url(#clayShadow)"/>
        <!-- Tay phải giơ cao vung chiếc DÉP LÀO HUYỀN THOẠI -->
        <path d="M 58 60 Q 72 45 74 34" stroke="url(#clayHead_${familyId}_${actionId})" stroke-width="7" stroke-linecap="round" fill="none"/>
        <!-- Chiếc dép lào xanh lá huyền thoại -->
        <g transform="translate(68, 18) rotate(35)" filter="url(#clayShadow)">
          <ellipse cx="12" cy="18" rx="8" ry="16" fill="#00E676"/>
          <path d="M 8 16 Q 12 10 16 16" stroke="#FFEB3B" stroke-width="2.5" fill="none"/>
          <circle cx="12" cy="11" r="1.8" fill="#FFEB3B"/>
        </g>
        <!-- Hiệu ứng gió vụt khi vung dép -->
        <path d="M 62 26 Q 70 20 78 26" stroke="#FF5252" stroke-width="2" stroke-linecap="round" fill="none"/>
      </svg>
    `;
  }

  // 7. BẮN TIM TUNG TÓE (Shoot Love Hearts)
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <radialGradient id="clayHead_${familyId}_${actionId}" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/>
          <stop offset="50%" stop-color="${pal.base}"/>
          <stop offset="100%" stop-color="${pal.stroke}"/>
        </radialGradient>
        <radialGradient id="heartGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#FF80AB"/>
          <stop offset="60%" stop-color="#FF1744"/>
          <stop offset="100%" stop-color="#C51162"/>
        </radialGradient>
        <filter id="clayShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
        </filter>
      </defs>
      <!-- Đầu Chibi mắt hình trái tim đáng yêu -->
      <circle cx="50" cy="38" r="22" fill="url(#clayHead_${familyId}_${actionId})" filter="url(#clayShadow)"/>
      <!-- Mắt trái tim phát sáng -->
      <path d="M 40 35 C 40 31, 35 31, 35 35 C 35 39, 40 43, 40 43 C 40 43, 45 39, 45 35 C 45 31, 40 31, 40 35 Z" fill="#FF1744"/>
      <path d="M 60 35 C 60 31, 55 31, 55 35 C 55 39, 60 43, 60 43 C 60 43, 65 39, 65 35 C 65 31, 60 31, 60 35 Z" fill="#FF1744"/>
      <!-- Má hồng bừng sáng tình yêu -->
      <circle cx="34" cy="42" r="5" fill="#FF4081" opacity="0.85"/>
      <circle cx="66" cy="42" r="5" fill="#FF4081" opacity="0.85"/>
      <!-- Nụ cười e thẹn -->
      <path d="M 46 44 Q 50 49 54 44" stroke="#212121" stroke-width="2" stroke-linecap="round" fill="none"/>
      <!-- Thân ôm TRÁI TIM BỰ CHẢNG -->
      <ellipse cx="50" cy="68" rx="19" ry="16" fill="url(#clayHead_${familyId}_${actionId})" filter="url(#clayShadow)"/>
      <!-- Trái tim 3D Claymorphism khổng lồ -->
      <path d="M 50 56 C 50 48, 38 48, 38 56 C 38 64, 50 76, 50 76 C 50 76, 62 64, 62 56 C 62 48, 50 48, 50 56 Z" fill="url(#heartGrad)" filter="url(#clayShadow)"/>
      <!-- Tim nhỏ bay xung quanh -->
      <path d="M 28 32 C 28 29, 24 29, 24 32 C 24 35, 28 39, 28 39 C 28 39, 32 35, 32 32 C 32 29, 28 29, 28 32 Z" fill="#FF4081"/>
      <path d="M 74 26 C 74 23, 70 23, 70 26 C 70 29, 74 33, 74 33 C 74 33, 78 29, 78 26 C 78 23, 74 23, 74 26 Z" fill="#FF4081"/>
    </svg>
  `;
}

// Chuyển đổi SVG thành Data URL
export function getMascotActionDataUrl(familyId, actionId) {
  const svg = generateMascotActionSvg(familyId, actionId);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Danh sách toàn bộ 28 Mascot Presets (4 nhân vật x 7 hành động)
export const ALL_MASCOT_PRESETS = MASCOT_FAMILIES.flatMap(fam => 
  MASCOT_ACTIONS.map(act => ({
    id: `${fam.id}_${act.id}`,
    familyId: fam.id,
    actionId: act.id,
    familyName: fam.name,
    actionLabel: act.label,
    fullName: `${fam.name} - ${act.label}`,
    sound: act.sound,
    icon: act.icon
  }))
);

// Trình phát âm thanh: Đã tắt hoàn toàn âm thanh Web Audio để chống sập webapp
export function playActionSound(soundType) {
  // No-op
}
