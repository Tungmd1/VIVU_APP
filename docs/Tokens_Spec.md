# 🎨 get-design.md — Đặc Tả Kỹ Thuật Chi Tiết Button, Typography & Color Tokens
> **Hệ thống thiết kế**: Luminous Solar-Cyber HUD (White Cyberpunk)  
> **Dự án**: VIVU Web App  
> **Căn cứ trích xuất**: Dựa trên 4 màn hình thực tế (Bản đồ Radar 3D, Hộp thư Messenger, Kết nối Bạn bè, Hồ sơ Cá nhân) và Design System `Luminous Solar-Cyber HUD`.

---

## 1. BẢNG MÃ MÀU TOKENS HỆ THỐNG (SYSTEM COLOR PALETTE)

Toàn bộ các màu sắc được chuẩn hóa theo mã HEX và RGBA chuẩn CSS để lập trình viên áp dụng trực tiếp:

### 1.1 Bảng màu Nền & Bề mặt (Surfaces & Glass)
| Token Key | Mã Hex / RGBA | Vai trò kỹ thuật |
|---|---|---|
| `--color-canvas-bg` | `#FAFAFF` | Nền canvas toàn bộ ứng dụng |
| `--color-surface-card` | `#FFFFFF` | Nền card trắng tinh khiết, popup modal, panel danh sách |
| `--color-surface-soft` | `#F2F3FF` | Nền card phụ, nền nút secondary, nền badge |
| `--color-surface-dim` | `#ECEDFB` | Nền input khi inactive, nền icon placeholder |
| `--color-surface-hover` | `#E6E7F6` | Nền hover cho danh sách item và nút bấm phụ |
| `--color-glass-dock` | `rgba(255, 255, 255, 0.88)` | Nền Dynamic Island & Bottom Dock (`backdrop-filter: blur(20px)`) |
| `--color-glass-border` | `rgba(0, 229, 255, 0.30)` | Viền kính phản quang Neon Cyan |
| `--color-border-subtle` | `#D2D9F4` | Đường viền mỏng 1px ngăn cách các khối nội dung |
| `--color-border-light` | `rgba(0, 0, 0, 0.06)` | Viền chia nhẹ giữa các hàng |

### 1.2 Bảng màu Chữ & Nội dung (Typography Colors)
| Token Key | Mã Hex | Ý nghĩa hiển thị |
|---|---|---|
| `--text-primary` | `#131315` | Chữ tiêu đề, tên tài khoản, nội dung chính (Deep Slate) |
| `--text-secondary` | `#40484D` | Chữ mô tả phụ, tin nhắn xem trước, nhãn trường |
| `--text-muted` | `#70787E` | Timestamp, placeholder trong ô input, chú thích nhỏ |
| `--text-on-cyan` | `#08202E` | Màu chữ đậm tương phản cực cao trên nền nút Cyber Cyan |
| `--text-on-dark` | `#FFFFFF` | Chữ trắng trên các nút hoặc badge nền màu đậm |

### 1.3 Bảng màu Điểm nhấn Cyberpunk (Neon Accents)
| Tên màu | Mã Hex | Ứng dụng cụ thể trong hệ thống nút |
|---|---|---|
| **Cyber Cyan** | `#00E5FF` | Màu chủ đạo của Primary CTA, ghim vị trí, vạch laser quét |
| **Deep Cyan (Gradient End)**| `#00B4D8` | Màu đuôi gradient của Primary Action Button |
| **Dark Teal (Hover/Active)**| `#00838F` | Nút tham gia, chip vị trí |
| **Solar Amber (Gold)** | `#FFAA00` | Nút copy, badge VIP, chip khoảng cách, icon lửa |
| **Hyper Lime (Green)** | `#10FFA0` | Chấm Online, trạng thái hoạt động, viền sonar radar |
| **Neon Pink** | `#FF2A85` | Nút Cụm ly, badge thông báo chưa đọc, icon thả tim |
| **Crimson Laser (Red)** | `#EF4444` | Nút Hủy, Xóa đoạn chat, Từ chối kết bạn |
| **Soft Red (Danger BG)** | `#FEE2E2` | Nền nút từ chối kết bạn, nền icon thùng rác |

---

## 2. QUY CHUẨN TYPOGRAPHY CHO BUTTON & CONTROLS

| Font Family | Phân bổ sử dụng |
|---|---|
| **Outfit** (`font-display`) | Dùng cho các nút hành động chính, CTA to, nhãn tab, tiêu đề (`font-semibold`, `font-bold`) |
| **Be Vietnam Pro** (`font-body`) | Dùng cho text nút thông thường, văn bản tiếng Việt dấu thanh chuẩn, nội dung form |
| **JetBrains Mono** (`font-mono`) | Dùng cho mã ID `VU-XXXX`, tọa độ GPS, cự ly `km`, đồng hồ timestamp ISO |

---

## 3. ĐẶC TẢ CHI TIẾT TỪNG NÚT BẤM (BUTTON SPECIFICATION BY SCREEN)

---

### 3.1 MÀN HÌNH 1: BẢN ĐỒ RADAR CYBERPUNK 3D (`Screen 13`)

#### Nút 1.1: Chip Hồ Sơ Cá Nhân (Dynamic Island Header - Bên Trái)
- **Vị trí**: Nằm trong Dynamic Island góc trên bên trái.
- **Kích thước**: `height: 36px`, `padding: 4px 12px 4px 6px`.
- **Bo góc (Border Radius)**: `9999px` (Full Pill).
- **Màu nền**: `#FFFFFF` kết hợp viền `1px solid #D2D9F4`.
- **Màu chữ**: `#131315`, `font-family: 'Outfit'`, `font-size: 13px`, `font-weight: 600`.
- **Hiệu ứng**: Avatar tròn `26px` có viền nhịp thở Hyper Lime `#10FFA0`.

#### Nút 1.2: Dropdown Bán Kính Radar (`3 km ▾`)
- **Vị trí**: Giữa Dynamic Island.
- **Kích thước**: `height: 32px`, `padding: 4px 10px`.
- **Bo góc**: `9999px` (Full Pill).
- **Màu nền**: `rgba(0, 229, 255, 0.12)` (Cyber Cyan mờ).
- **Viền**: `1px solid rgba(0, 229, 255, 0.40)`.
- **Màu chữ & Icon**: `#00838F`, `font-family: 'JetBrains Mono'`, `font-size: 12px`, `font-weight: 700`.
- **Hover**: Đổi nền sang `rgba(0, 229, 255, 0.22)`, viền phát sáng nhẹ.

#### Nút 1.3: Chuông Thông Báo (Bell Icon Button)
- **Vị trí**: Bên phải thanh Dynamic Island.
- **Kích thước**: `32px × 32px`.
- **Bo góc**: `50%` (Hình tròn).
- **Màu nền**: `#F2F3FF`, viền `1px solid #D2D9F4`.
- **Màu Icon**: Bootstrap Icon `bi-bell-fill` màu `#131315`, size `14px`.
- **Chấm đỏ thông báo**: Tròn `6px`, màu Neon Pink `#FF2A85`, vị trí `top: 4px, right: 4px`.

#### Nút 1.4: Nút Bạn Bè Lân Cận (`👥 1`)
- **Vị trí**: Góc phải Dynamic Island.
- **Kích thước**: `height: 32px`, `padding: 4px 10px`.
- **Bo góc**: `9999px`.
- **Màu nền**: `rgba(0, 229, 255, 0.15)`.
- **Màu chữ & Icon**: `#007791`, `font-family: 'JetBrains Mono'`, `font-size: 12px`, `font-weight: 700`.

#### Nút 1.5: Cụm Phím Tiện Ích Bản Đồ Nổi Bên Phải (Right FAB Stack)
Gồm 6 nút tròn xếp dọc theo cột:
- **Kích thước từng nút**: `40px × 40px`.
- **Bo góc**: `50%` (Tròn đều).
- **Màu nền**: `#FFFFFF`, `box-shadow: 0 4px 12px rgba(0,0,0,0.08)`.
- **Viền**: `1px solid #D2D9F4`.
- **Chi tiết từng nút**:
  1. **Zoom In (`+`)**: Icon `bi-plus-lg`, màu `#131315`, size `16px`.
  2. **Zoom Out (`-`)**: Icon `bi-dash-lg`, màu `#131315`, size `16px`.
  3. **Khóa La Bàn 3D (`bi-compass`)**: Icon màu `#FF2A85` (Neon Pink), size `18px`.
  4. **Đổi Lớp Bản Đồ (`bi-layers`)**: Icon màu `#00B4D8`, size `18px`.
  5. **Chụp Ảnh Nhanh (`bi-camera-fill`)**: Icon màu `#FF2A85`, size `18px`.
  6. **Định Vị Tâm Bạn (`bi-send-fill` / GPS Focus)**: Nền gradient `linear-gradient(135deg, #00838F, #006064)`, icon trắng `#FFFFFF`, size `16px`.

#### Nút 1.6: Nút Cụng Ly Kết Nối Siêu Gần (`🍻 Cụm Ly` / Spatial Bump)
- **Vị trí**: Nằm trong thẻ card nổi báo cự ly `Test2 cách 14m`.
- **Kích thước**: `height: 38px`, `padding: 8px 18px`.
- **Bo góc**: `12px` (`rounded-xl`).
- **Màu nền**: `linear-gradient(135deg, #00E5FF, #00B4D8)`.
- **Viền**: `1px solid #00F0FF`.
- **Bóng đổ (Shadow)**: `box-shadow: 0 0 16px rgba(0, 229, 255, 0.45)`.
- **Màu chữ & Icon**: `#08202E` (Chữ than chì ánh xanh đậm cực nét), `font-family: 'Outfit'`, `font-size: 13px`, `font-weight: 700`.

#### Nút 1.7: Nút Thêm Tâm Trạng Nhanh (`+ Đăng`)
- **Vị trí**: Nằm trong bong bóng tâm trạng phía trên avatar bản đồ.
- **Kích thước**: `height: 26px`, `padding: 2px 10px`.
- **Bo góc**: `9999px`.
- **Màu nền**: `#00667A`.
- **Màu chữ**: `#FFFFFF`, `font-family: 'Outfit'`, `font-size: 11px`, `font-weight: 600`.

---

### 3.2 MÀN HÌNH 2: HỘP THƯ MESSENGER CYBERPUNK SÁNG (`Screen 9`)

#### Nút 2.1: Nút Quay Lại (`←`)
- **Kích thước**: `36px × 36px`.
- **Bo góc**: `12px` (`rounded-xl`).
- **Màu nền**: `#F2F3FF`, viền `1px solid #D2D9F4`.
- **Icon**: `bi-arrow-left`, màu `#131315`, size `18px`.

#### Nút 2.2: Nút "+ Tạo Nhóm" (Top Header CTA)
- **Vị trí**: Góc trên bên phải thanh tiêu đề Tin nhắn.
- **Kích thước**: `height: 38px`, `padding: 6px 16px`.
- **Bo góc**: `12px` (`rounded-xl`).
- **Màu nền**: `linear-gradient(135deg, #00E5FF, #00C4DF)`.
- **Viền**: `1px solid rgba(0, 229, 255, 0.6)`.
- **Bóng đổ**: `0 0 14px rgba(0, 229, 255, 0.35)`.
- **Màu chữ**: `#08202E`, `font-family: 'Outfit'`, `font-size: 13px`, `font-weight: 700`.

#### Nút 2.3: Bộ Lọc Phân Loại Tin Nhắn (Filter Tabs)
Gồm 3 nút dạng Pill Filter:
1. **Tab Active: "Tất cả (3)"**:
   - **Màu nền**: `linear-gradient(135deg, #00E5FF, #00B4D8)`.
   - **Màu chữ**: `#08202E`, `font-family: 'Outfit'`, `font-size: 13px`, `font-weight: 700`.
   - **Bo góc**: `9999px`, `padding: 8px 16px`.
   - **Bóng đổ**: `0 2px 8px rgba(0, 229, 255, 0.30)`.
2. **Tab Inactive: "Nhóm (1)" & "Người lạ"**:
   - **Màu nền**: `#FFFFFF`, viền `1px solid #D2D9F4`.
   - **Màu chữ**: `#40484D`, `font-family: 'Outfit'`, `font-size: 13px`, `font-weight: 500`.
   - **Hover**: Đổi nền `#F2F3FF`, viền `#00E5FF`.

#### Nút 2.4: Nút Xóa Hội Thoại (Thùng Rác Nhóm `ggggg`)
- **Kích thước**: `32px × 32px`.
- **Bo góc**: `8px`.
- **Màu nền**: `#FEE2E2` (Đỏ mờ), viền `1px solid #FCA5A5`.
- **Icon**: `bi-trash3-fill`, màu `#EF4444`, size `14px`.
- **Hover**: Đổi nền `#FCA5A5`, màu icon `#B91C1C`.

#### Nút 2.5: Phím Tắt Khởi Tạo "Bình Chọn Địa Điểm Tối Nay (Poll)"
- **Vị trí**: Khối tác vụ nhanh khi chưa chọn đoạn chat.
- **Kích thước**: `width: 100%`, `height: 44px`, `padding: 10px 16px`.
- **Bo góc**: `14px` (`rounded-2xl`).
- **Màu nền**: `#FFFFFF`, viền `1px solid rgba(0, 229, 255, 0.35)`.
- **Bóng đổ**: `0 4px 12px rgba(0, 229, 255, 0.08)`.
- **Màu Icon & Chữ**: Icon `bi-bar-chart-steps` màu `#00B4D8` size `16px`. Chữ `#131315`, `font-family: 'JetBrains Mono'`, `font-size: 13px`, `font-weight: 600`.
- **Hover**: Viền `#00E5FF`, nền `#F2F3FF`.

#### Nút 2.6: Phím Tắt Khởi Tạo "Thẻ Chốt Lịch Trình Di Chuyển"
- **Kích thước**: `width: 100%`, `height: 44px`, `padding: 10px 16px`.
- **Bo góc**: `14px`.
- **Màu nền**: `#FFFFFF`, viền `1px solid rgba(255, 42, 133, 0.25)`.
- **Màu Icon & Chữ**: Icon `bi-calendar-event` màu `#FF2A85` size `16px`. Chữ `#131315`, `font-family: 'JetBrains Mono'`, `font-size: 13px`, `font-weight: 600`.

---

### 3.3 MÀN HÌNH 3: KẾT NỐI & BẠN BÈ CYBERPUNK SÁNG (`Screen 11`)

#### Nút 3.1: Nút "Sao Chép" Mã Lưới Tự Động (`VU-5139`)
- **Kích thước**: `height: 34px`, `padding: 6px 14px`.
- **Bo góc**: `9999px` (Pill).
- **Màu nền**: `rgba(0, 229, 255, 0.15)`.
- **Viền**: `1px solid rgba(0, 229, 255, 0.50)`.
- **Icon & Chữ**: Icon `bi-copy` màu `#00838F` size `13px`. Chữ `#00667A`, `font-family: 'JetBrains Mono'`, `font-size: 12px`, `font-weight: 700`.

#### Nút 3.2: Nút Đóng Trang (`✕`)
- **Kích thước**: `36px × 36px`.
- **Bo góc**: `12px`.
- **Màu nền**: `#F2F3FF`, viền `1px solid #D2D9F4`.
- **Icon**: `bi-x-lg`, màu `#131315`, size `16px`.

#### Nút 3.3: Nút "Chấp Nhận" Lời Mời Kết Bạn
- **Vị trí**: Dưới thông báo lời mời từ `Nguyễn Phi Lâm`.
- **Kích thước**: `flex: 1`, `height: 42px`.
- **Bo góc**: `12px` (`rounded-xl`).
- **Màu nền**: `linear-gradient(135deg, #00E5FF, #00B4D8)`.
- **Viền**: `1px solid #00F0FF`.
- **Bóng đổ**: `0 0 14px rgba(0, 229, 255, 0.40)`.
- **Icon & Chữ**: Icon `bi-person-check-fill` màu `#08202E`. Chữ `Chấp nhận` màu `#08202E`, `font-family: 'Outfit'`, `font-size: 14px`, `font-weight: 700`.

#### Nút 3.4: Nút "Từ Chối" Lời Mời Kết Bạn
- **Kích thước**: `width: 110px`, `height: 42px`.
- **Bo góc**: `12px` (`rounded-xl`).
- **Màu nền**: `#F2F3FF`, viền `1px solid #D2D9F4`.
- **Icon & Chữ**: Icon `bi-person-x` màu `#70787E`. Chữ `Từ chối` màu `#40484D`, `font-family: 'Outfit'`, `font-size: 14px`, `font-weight: 600`.
- **Hover**: Đổi nền `#FEE2E2`, viền `#FCA5A5`, chữ và icon `#EF4444`.

#### Nút 3.5: Nút "Quét Lại Tần Số" (Radar Refresh)
- **Vị trí**: Dưới vùng quét Radar chưa có người.
- **Kích thước**: `height: 38px`, `padding: 8px 20px`.
- **Bo góc**: `9999px`.
- **Màu nền**: `rgba(0, 229, 255, 0.12)`, viền `1px solid rgba(0, 229, 255, 0.40)`.
- **Icon & Chữ**: Icon `bi-arrow-clockwise` màu `#00838F`. Chữ `#007791`, `font-family: 'JetBrains Mono'`, `font-size: 12px`, `font-weight: 700`.

#### Nút 3.6: Nút "Kích Hoạt Bump >" (Spatial Bump Card)
- **Vị trí**: Bên phải thẻ card vàng *Cụng máy Spatial Bump 3D*.
- **Kích thước**: `height: 36px`, `padding: 6px 14px`.
- **Bo góc**: `10px`.
- **Màu nền**: `#131315` (Nền than chì sâu đối lập tạo điểm nhấn viễn tưởng).
- **Viền**: `1px solid rgba(255, 255, 255, 0.20)`.
- **Màu chữ**: `#FFFFFF`, `font-family: 'JetBrains Mono'`, `font-size: 12px`, `font-weight: 700`.
- **Hover**: Nền `#00E5FF`, chữ `#08202E`.

---

### 3.4 MÀN HÌNH 4: HỒ SƠ CÁ NHÂN CYBERPUNK SÁNG (`Screen 7`)

#### Nút 4.1: Nút "Sửa" Nickname Nhỏ (Header)
- **Kích thước**: `height: 28px`, `padding: 2px 10px`.
- **Bo góc**: `8px`.
- **Màu nền**: `#FFFFFF`, viền `1px solid #D2D9F4`.
- **Icon & Chữ**: Icon `bi-pencil-square` màu `#00838F`. Chữ `#131315`, `font-family: 'Be Vietnam Pro'`, `font-size: 12px`, `font-weight: 600`.

#### Nút 4.2: Nút "Đổi Nick" (Header)
- **Kích thước**: `height: 28px`, `padding: 2px 10px`.
- **Bo góc**: `8px`.
- **Màu nền**: `#FFE8F0` (Hồng pastel mờ), viền `1px solid #FFB8D2`.
- **Icon & Chữ**: Icon `bi-arrow-repeat` màu `#FF2A85`. Chữ `#FF2A85`, `font-family: 'Be Vietnam Pro'`, `font-size: 12px`, `font-weight: 600`.

#### Nút 4.3: Nút Bánh Răng Cài Đặt (Settings Button)
- **Kích thước**: `32px × 32px`.
- **Bo góc**: `8px`.
- **Màu nền**: `#F2F3FF`, viền `1px solid #D2D9F4`.
- **Icon**: `bi-gear-fill`, màu `#131315`, size `16px`.

#### Nút 4.4: Nút "Sửa Hồ Sơ" Nổi Trên Ảnh Bìa (Cover Floating Button)
- **Vị trí**: Góc trên bên trái của ảnh đại diện phi hành gia.
- **Kích thước**: `height: 32px`, `padding: 4px 12px`.
- **Bo góc**: `9999px`.
- **Màu nền**: `rgba(255, 255, 255, 0.85)`, `backdrop-filter: blur(12px)`.
- **Viền**: `1px solid rgba(0, 229, 255, 0.40)`.
- **Icon & Chữ**: Icon `bi-pencil` màu `#00838F`. Chữ `#131315`, `font-family: 'Outfit'`, `font-size: 12px`, `font-weight: 600`.

#### Nút 4.5: Nút Bánh Răng Nổi Trên Ảnh Bìa
- **Vị trí**: Góc trên bên phải của ảnh đại diện.
- **Kích thước**: `32px × 32px`.
- **Bo góc**: `50%`.
- **Màu nền**: `rgba(255, 255, 255, 0.85)`, viền `1px solid #D2D9F4`.
- **Icon**: `bi-gear`, màu `#131315`, size `16px`.

#### Nút 4.6: Nút Gửi Tâm Trạng Mới (Icon Mũi Tên Xanh `➤`)
- **Vị trí**: Bên phải ô trích dẫn *“Đang vivu dạo phố”*.
- **Kích thước**: `32px × 32px`.
- **Bo góc**: `50%`.
- **Màu nền**: `transparent`.
- **Icon**: `bi-send-fill`, màu `#00B4D8`, size `16px`.
- **Hover**: Đổi màu `#00E5FF`, hiệu ứng phóng to `scale(1.1)`.

#### Nút 4.7: Nút "+ Thêm Ảnh Từ Máy" (Photos Section Header CTA)
- **Kích thước**: `height: 32px`, `padding: 4px 12px`.
- **Bo góc**: `9999px`.
- **Màu nền**: `linear-gradient(135deg, #00E5FF, #00B4D8)`.
- **Màu chữ**: `#08202E`, `font-family: 'Outfit'`, `font-size: 12px`, `font-weight: 700`.
- **Bóng đổ**: `0 2px 8px rgba(0, 229, 255, 0.3)`.

#### Nút 4.8: Nút Ô Tải Ảnh Lên (`Tải lên`)
- **Kích thước**: Ô vuông `72px × 72px`.
- **Bo góc**: `16px` (`rounded-2xl`).
- **Màu nền**: `#F2F3FF`, viền `1px dashed #00E5FF`.
- **Icon**: `bi-camera-fill` màu `#00838F`, size `20px`.
- **Chữ**: `Tải lên` màu `#00838F`, `font-family: 'JetBrains Mono'`, `font-size: 11px`, `font-weight: 600`.

#### Nút 4.9: Nút "Chỉnh Sửa" Giới Thiệu Bản Thân
- **Kích thước**: `height: 26px`, `padding: 2px 10px`.
- **Bo góc**: `6px`.
- **Màu nền**: `#F2F3FF`, viền `1px solid #D2D9F4`.
- **Icon & Chữ**: Icon `bi-pencil` màu `#00838F`. Chữ `#131315`, `font-family: 'Be Vietnam Pro'`, `font-size: 11px`, `font-weight: 600`.

#### Nút 4.10: Nút "Mã QR Radar" (Bottom Action - Trái)
- **Kích thước**: `flex: 1`, `height: 46px`.
- **Bo góc**: `14px` (`rounded-2xl`).
- **Màu nền**: `#FFFFFF`, viền `1px solid #D2D9F4`.
- **Bóng đổ**: `0 4px 10px rgba(0,0,0,0.04)`.
- **Icon & Chữ**: Icon `bi-qr-code-scan` màu `#00838F`, size `16px`. Chữ `Mã QR Radar` màu `#131315`, `font-family: 'Outfit'`, `font-size: 14px`, `font-weight: 700`.

#### Nút 4.11: Nút "Chia Sẻ Hồ Sơ" (Bottom Action - Phải)
- **Kích thước**: `flex: 1`, `height: 46px`.
- **Bo góc**: `14px` (`rounded-2xl`).
- **Màu nền**: `linear-gradient(135deg, #00E5FF, #00B4D8)`.
- **Viền**: `1px solid #00F0FF`.
- **Bóng đổ**: `0 0 16px rgba(0, 229, 255, 0.40)`.
- **Icon & Chữ**: Icon `bi-share-fill` màu `#08202E`, size `15px`. Chữ `Chia sẻ hồ sơ` màu `#08202E`, `font-family: 'Outfit'`, `font-size: 14px`, `font-weight: 700`.

---

### 3.5 THANH ĐIỀU HƯỚNG ĐÁY CHUNG (VIVU BOTTOM DOCK)
Xuất hiện cố định ở chân 4 màn hình:

- **Khung chứa Dock**: Bo góc `32px`, nền `rgba(255, 255, 255, 0.88)`, `backdrop-filter: blur(24px)`, viền `1px solid rgba(0, 229, 255, 0.3)`.
- **4 Tab Icon điều hướng (Bản Đồ, Bạn Bè, Tin Nhắn, Tôi)**:
  - **Kích thước khu vực chạm**: `50px × 50px`.
  - **Tab Inactive**: Icon Bootstrap size `20px` màu `#70787E`, chữ nhãn `10px font-medium` màu `#70787E`.
  - **Tab Active**: Icon Bootstrap size `22px` màu `#00838F` (kèm hiệu ứng vầng sáng Cyan), chữ nhãn `10px font-bold` màu `#00838F`.
- **Nút Dấu Cộng Trung Tâm (`+`) (Floating Center Action Button)**:
  - **Kích thước**: `54px × 54px`.
  - **Bo góc**: `18px` (`rounded-2xl`).
  - **Màu nền**: Gradient Cyberpunk Hologram `linear-gradient(135deg, #00E5FF, #FF2A85)` (chuyển màu từ Cyan sang Neon Pink).
  - **Viền**: `2px solid #FFFFFF`.
  - **Bóng đổ**: `box-shadow: 0 4px 20px rgba(0, 229, 255, 0.5), 0 0 12px rgba(255, 42, 133, 0.4)`.
  - **Icon**: `bi-plus-lg`, màu trắng `#FFFFFF`, size `24px font-bold`.
  - **Hiệu ứng nhấn**: `transform: scale(0.94)`, xoay nhẹ 45 độ khi mở Action Sheet.

---

## 4. BẢNG TỔNG HỢP QUICK-REFERENCE CHO DEVELOPER

| Loại Nút (Button Type) | Màu Nền (Background) | Viền (Border) | Màu Chữ (Text Color) | Font & Size | Shadow / Glow |
|---|---|---|---|---|---|
| **Primary Cyber CTA** | `linear-gradient(135deg, #00E5FF, #00B4D8)` | `1px solid #00F0FF` | `#08202E` | Outfit 13-14px Bold | `0 0 16px rgba(0,229,255,0.4)` |
| **Secondary Light** | `#FFFFFF` hoặc `#F2F3FF` | `1px solid #D2D9F4` | `#131315` | Outfit / Be VN 13px SemiBold | `0 2px 6px rgba(0,0,0,0.04)` |
| **Cyber Pill Tag** | `rgba(0, 229, 255, 0.12)` | `1px solid rgba(0,229,255,0.4)` | `#00838F` | JetBrains Mono 12px Bold | Nhẹ |
| **Danger / Reject** | `#F2F3FF` (Hover: `#FEE2E2`) | `1px solid #D2D9F4` | `#40484D` (Hover: `#EF4444`) | Outfit 14px SemiBold | None |
| **Center Dock (+)** | `linear-gradient(135deg, #00E5FF, #FF2A85)` | `2px solid #FFFFFF` | `#FFFFFF` | Vector Icon 24px | `0 4px 20px rgba(0,229,255,0.5)` |
