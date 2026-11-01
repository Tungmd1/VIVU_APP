# 🎨 UI/UX Specification — Dự Án VIVU (Luminous Solar-Cyber HUD / White Cyberpunk)

> **Phiên bản tài liệu**: 3.0 (Đồng bộ chuẩn hóa theo Luminous Solar-Cyber HUD Design System)  
> **Ngôn ngữ thiết kế**: Luminous Solar-Cyber HUD (White Cyberpunk: High-Albedo Frosted Glass `#FFFFFF`, `#FAFAFF`, `#F2F3FF`, Cyber Cyan `#00E5FF`, Deep Slate `#131315`)  
> **Quy chuẩn biểu tượng**: 100% Vector Bootstrap Icons (`bi bi-...`) — Tuyệt đối cấm Unicode Emoji

---

## 1. TRIẾT LÝ THIẾT KẾ (DESIGN PHILOSOPHY)

VIVU Web App mang phong cách thiết kế **Luminous Solar-Cyber HUD (White Cyberpunk)**, lấy cảm hứng từ tương tác ánh sáng mặt trời năng động, công nghệ HUD viễn tưởng cao cấp và tính kết nối không gian tức thì của thế hệ mạng xã hội mới (Zenly, Jagat, Apple VisionOS).

### 3 Trụ Cột Trải Nghiệm:
1. **High-Albedo Surface & Frosted Glass (Bề Mặt Trắng Kính Lỏng Sáng)**: 
   - Sử dụng nền canvas `#FAFAFF`, thẻ card `#FFFFFF` và kính mờ `rgba(255, 255, 255, 0.88)` kèm viền phản quang Cyan mờ `rgba(0, 229, 255, 0.30)`.
   - Viền ngăn cách tinh tế `#D2D9F4` loại bỏ hoàn toàn sự nặng nề của theme tối truyền thống, mang lại cảm giác thanh thoát, hiện đại.
2. **Neon Accents Đột Phá & Typography Tương Phản Cực Cao**:
   - Chữ chính sử dụng màu than chì ánh sâu **Deep Slate (`#131315`)**, chữ phụ `#40484D`, chữ chú thích `#70787E`.
   - Màu nút Cyber Cyan (`#00E5FF`) kết hợp chữ than chì đậm (`#08202E`) đạt tỷ lệ tương phản WCAG AAA.
   - Các điểm nhấn tương tác neon: Cyber Cyan (`#00E5FF`), Hyper Lime (`#10FFA0`), Neon Pink (`#FF2A85`), Solar Amber (`#FFAA00`).
3. **Công Thái Học Cảm Ứng Di Động (Mobile-First Touch Ergonomics)**:
   - Mục tiêu chạm (touch target) tối thiểu 40x40px hoặc 44x44px.
   - Bố cục đảo nổi Dynamic Island ở đỉnh và thanh đáy Dock ở chân trang với clearance an toàn.

---

## 2. HỆ THỐNG MÀU SẮC & TOKENS (DESIGN TOKENS)

### 2.1 Bảng màu Nền & Bề Mặt (Base Surfaces & Glass)
| Token Name | Mã Hex / RGBA | Vai trò & Vị trí sử dụng |
|---|---|---|
| `--color-canvas-bg` | `#FAFAFF` | Nền canvas toàn bộ ứng dụng |
| `--color-surface-card` | `#FFFFFF` | Nền card trắng tinh khiết, popup modal, panel danh sách |
| `--color-surface-soft` | `#F2F3FF` | Nền card phụ, nền nút secondary, nền badge |
| `--color-surface-dim` | `#ECEDFB` | Nền input khi inactive, nền icon placeholder |
| `--color-glass-dock` | `rgba(255, 255, 255, 0.88)` | Nền Dynamic Island & Bottom Dock (`backdrop-filter: blur(20px)`) |
| `--color-glass-border` | `rgba(0, 229, 255, 0.30)` | Viền kính phản quang Neon Cyan |
| `--color-border-subtle`| `#D2D9F4` | Đường viền mỏng 1px ngăn cách các khối nội dung |

### 2.2 Bảng màu Chữ & Nội Dung (Typography Colors)
| Token Name | Mã Hex | Ý nghĩa hiển thị |
|---|---|---|
| `--text-primary` | `#131315` | Chữ tiêu đề, tên tài khoản, nội dung chính (Deep Slate) |
| `--text-secondary` | `#40484D` | Chữ mô tả phụ, tin nhắn xem trước, nhãn trường |
| `--text-muted` | `#70787E` | Timestamp, placeholder trong ô input, chú thích nhỏ |
| `--text-on-cyan` | `#08202E` | Màu chữ than chì ánh xanh đậm tương phản cao trên nút Cyber Cyan |
| `--text-on-dark` | `#FFFFFF` | Chữ trắng trên các nút hoặc badge màu đậm |

### 2.3 Bảng màu Điểm Nhấn Cyberpunk (Neon Accents)
| Tên màu | Mã Hex | Ứng dụng cụ thể trong hệ thống nút & ghim |
|---|---|---|
| **Cyber Cyan** | `#00E5FF` | Màu chủ đạo của Primary CTA, ghim vị trí, vạch laser quét |
| **Deep Cyan** | `#00B4D8` | Màu đuôi gradient của Primary Action Button |
| **Dark Teal** | `#00838F` | Nút tham gia, chip vị trí GPS, nhãn công nghệ |
| **Solar Amber** | `#FFAA00` | Nút copy, badge VIP, chip khoảng cách, icon lửa |
| **Hyper Lime** | `#10FFA0` | Chấm Online, trạng thái hoạt động, viền sonar radar |
| **Neon Pink** | `#FF2A85` | Nút Cụm ly, badge thông báo chưa đọc, icon thả tim |
| **Crimson Laser** | `#EF4444` | Nút Hủy, Xóa đoạn chat, Từ chối kết bạn |
| **Soft Red** | `#FEE2E2` | Nền nút từ chối kết bạn, nền icon thùng rác |

### 2.4 Phông Chữ & Thang Bậc Typography
- **Font tiêu đề & nút hành động chính**: `"Outfit"`, sans-serif (`font-display`, `font-bold`, `font-semibold`).
- **Font nội dung & giao diện chính**: `"Be Vietnam Pro"`, sans-serif (`font-sans`, tiếng Việt hoàn hảo).
- **Font số liệu, ID & telemetry**: `"JetBrains Mono"`, monospace (`font-mono`, mã `VU-XXXX`, tọa độ GPS, cự ly km, thời gian).

---

## 3. ĐẶC TẢ CHI TIẾT 4 MÀN HÌNH CHỦ ĐẠO

### 3.1 Màn Hình 1: Bản Đồ Radar Cyberpunk 3D (`Screen 13`)
- **VIVU Dynamic Island (`UnifiedDynamicIsland.jsx`)**:
  - Đảo nổi tại `top-3.5 left-1/2 -translate-x-1/2 z-40`, nền kính `rgba(255,255,255,0.88)` bo tròn viên thuốc (`rounded-full`), viền `rgba(0,229,255,0.30)`.
  - Chip profile góc trái: Avatar tròn với viền nhịp thở Hyper Lime `#10FFA0`.
  - Dropdown bán kính radar: nền `rgba(0,229,255,0.12)`, text `#00838F font-mono font-bold`.
  - Chuông thông báo: nền `#F2F3FF`, viền `#D2D9F4`, icon `#131315`, chấm ping Neon Pink `#FF2A85`.
- **Ghim Bản Đồ & Bong Bóng Trạng Thái (`MapboxCanvas.jsx`)**:
  - Ghim "BẠN": Bo viền Hyper Lime `#10FFA0`, chấm định vị Cyber Cyan `#00E5FF`, bong bóng trắng kính `bg-white/95 text-[#131315] border-[rgba(0,229,255,0.40)]`, nút "+ Đăng" nền `#00667A text-white`.
  - Ghim bạn bè & story: Ghim giọt nước teardrop Cyber Cyan `#00E5FF` hoặc Magenta `#FF2A85`, bong bóng trắng kính `bg-white/95 text-[#131315] border-[#D2D9F4]`.
  - Cơ chế tách cụm không gian (Rule 16): Phân tán hướng tròn $\ge 200$m khi cự ly < 60m.
- **Cụm Phím Tiện Ích Bản Đồ Nổi Bên Phải (Right Action Stack FAB)**:
  - 6 nút tròn 40x40px xếp dọc trên nền trắng `#FFFFFF`, viền `#D2D9F4`, bóng đổ tinh tế: Zoom In/Out `#131315`, La bàn `#FF2A85`, Lớp bản đồ `#00B4D8`, Chụp ảnh `#FF2A85`, Bay về tâm Bạn (gradient `#00838F` -> `#006064` icon trắng).
- **Thẻ Cụm Ly Siêu Gần (`ProximityBumpBanner.jsx`)**:
  - Nút "Cụm Ly" (Nút 1.6): gradient `#00E5FF` -> `#00B4D8`, viền `#00F0FF`, text `#08202E font-display font-bold`.

### 3.2 Màn Hình 2: Hộp Thư Messenger Cyberpunk Sáng (`Screen 9`)
- **Nút Quay lại (Nút 2.1)**: `36x36px`, bo `12px`, nền `#F2F3FF`, viền `#D2D9F4`, icon `#131315`.
- **Nút "+ Tạo Nhóm" (Nút 2.2)**: `height: 38px`, bo `12px`, gradient `#00E5FF` -> `#00C4DF`, viền `rgba(0,229,255,0.6)`, text `#08202E font-bold`.
- **Bộ Lọc Phân Loại (Nút 2.3)**:
  - Tab Active ("Tất cả"): gradient `#00E5FF` -> `#00B4D8`, text `#08202E font-bold`.
  - Tab Inactive ("Nhóm", "Người lạ"): `#FFFFFF`, viền `#D2D9F4`, text `#40484D`.
- **Xóa Hội Thoại (Nút 2.4)**: `32x32px`, nền `#FEE2E2`, viền `#FCA5A5`, icon `bi-trash3-fill` màu `#EF4444`.
- **Phím Tắt Khởi Tạo Nhanh (Nút 2.5 & 2.6)**:
  - Bình chọn nhanh (Poll): nền `#FFFFFF`, viền `rgba(0,229,255,0.35)`, icon `#00B4D8`, text `#131315`.
  - Thẻ nhóm di chuyển: nền `#FFFFFF`, viền `rgba(255,42,133,0.25)`, icon `#FF2A85`, text `#131315`.

### 3.3 Màn Hình 3: Kết Nối & Quản Lý Bạn Bè (`Screen 11`)
- **Sao Chép Mã Lưới (Nút 3.1)**: `height: 34px`, bo `9999px`, nền `rgba(0,229,255,0.15)`, viền `rgba(0,229,255,0.50)`, icon `#00838F`, text `#00667A font-mono font-bold`.
- **Đóng Trang (Nút 3.2)**: `36x36px`, bo `12px`, nền `#F2F3FF`, viền `#D2D9F4`, icon `#131315`.
- **Chấp Nhận Lời Mời (Nút 3.3)**: `height: 42px`, bo `12px`, gradient `#00E5FF` -> `#00B4D8`, viền `#00F0FF`, text `#08202E Outfit 14px bold`.
- **Từ Chối Lời Mời (Nút 3.4)**: `height: 42px`, bo `12px`, nền `#F2F3FF`, viền `#D2D9F4`, text `#40484D`, hover nền `#FEE2E2` text `#EF4444`.
- **Quét Lại Radar (Nút 3.5)**: `height: 38px`, bo `9999px`, nền `rgba(0,229,255,0.12)`, text `#007791 font-mono font-bold`.

### 3.4 Màn Hình 4: Hồ Sơ Cá Nhân (`Screen 7`)
- **Nút "Sửa" Nickname (Nút 4.1)**: `height: 28px`, nền `#FFFFFF`, viền `#D2D9F4`, text `#131315`.
- **Nút "Đổi Nick" (Nút 4.2)**: `height: 28px`, nền `#FFE8F0`, viền `#FFB8D2`, text `#FF2A85`.
- **Nút Cài Đặt (Nút 4.3)**: `32x32px`, nền `#F2F3FF`, viền `#D2D9F4`, icon `#131315`.
- **Nút Nổi Trên Ảnh Bìa (Nút 4.4, 4.5)**: `rgba(255,255,255,0.85)` blur 12px, viền `rgba(0,229,255,0.40)`.
- **Gửi Tâm Trạng (Nút 4.6)**: Icon mũi tên `#00B4D8` (hover `#00E5FF`).
- **Thêm Ảnh Từ Máy (Nút 4.7)**: `height: 32px`, gradient `#00E5FF` -> `#00B4D8`, text `#08202E font-bold`.
- **Ô Tải Ảnh Lên (Nút 4.8)**: Ô vuông 72x72px, nền `#F2F3FF`, viền dashed `#00E5FF`, text/icon `#00838F`.
- **Mã QR Radar (Nút 4.10)**: `height: 46px`, bo `14px`, nền `#FFFFFF`, viền `#D2D9F4`, text `#131315 Outfit 14px bold`.
- **Chia Sẻ Hồ Sơ (Nút 4.11)**: `height: 46px`, bo `14px`, gradient `#00E5FF` -> `#00B4D8`, viền `#00F0FF`, text `#08202E Outfit 14px bold`.

---

## 4. THANH ĐIỀU HƯỚNG ĐÁY CHUNG (`VivuBottomDock.jsx`)
- Khung Dock: bo góc `32px`, nền `rgba(255, 255, 255, 0.88)` kèm `backdrop-blur: 24px`, viền `1px solid rgba(0, 229, 255, 0.30)`.
- 4 Tab điều hướng:
  - Tab Inactive: Icon Bootstrap 20px màu `#70787E`, text 10px `#70787E`.
  - Tab Active: Icon Bootstrap 22px màu `#00838F`, text 10px `#00838F font-bold`.
- Nút Dấu Cộng Trung Tâm (+): `54x54px`, bo `18px`, gradient `linear-gradient(135deg, #00E5FF, #FF2A85)`, viền `2px solid #FFFFFF`, bóng đổ kép Cyan/Pink `box-shadow: 0 4px 20px rgba(0,229,255,0.5), 0 0 12px rgba(255,42,133,0.4)`.

---

## 5. QUY CHUẨN FORM NHẬP LIỆU & ĐỘ TƯƠNG PHẢN (RULE 12)
Mọi ô nhập liệu trong ứng dụng:
- Nền: `bg-[#F2F3FF]`
- Viền: `border border-[#D2D9F4] focus:border-[#00E5FF] focus:ring-1 focus:ring-[rgba(0,229,255,0.3)]`
- Màu chữ hiển thị: `text-[#131315] font-medium`
- Placeholder: `placeholder-[#70787E]`
- Biểu tượng vector đính kèm: 100% Bootstrap Icons (`bi bi-...`).
