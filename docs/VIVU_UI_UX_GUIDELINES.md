# VIVU — HƯỚNG DẪN THIẾT KẾ UI/UX TỔNG THỂ (JAGAT & TINDER AI STYLE)

**Mã tài liệu:** VIVU-UX-002  
**Phiên bản:** 2.0 (Chuẩn thiết kế Đồ án AI: Social Map LBSD & Shake Swipe)  
**Trạng thái:** Kim chỉ nam thiết kế giao diện và trải nghiệm người dùng  
**Ngày cập nhật:** 2026-09-30

> **Tôn chỉ thiết kế:** *"Bản đồ là trung tâm — Lắc để kết nối — AI để thấu hiểu."*  
> Giao diện Vivu mang đậm ngôn ngữ thiết kế Gen Z: Bản đồ tối màu hiện đại, avatar phát sáng sống động (Jagat-style), cử chỉ vật lý tự nhiên (Lắc điện thoại, Vuốt thẻ Tinder 60fps) và tương tác phản hồi xúc giác (Haptic Feedback).

---

## 1. NGUYÊN TẮC THIẾT KẾ CỐT LÕI (DESIGN PRINCIPLES)

1. **Bản đồ là trung gian kết nối mọi trải nghiệm:**
   - Không có màn hình "chết" hay danh sách bảng tin cuộn bất tận đơn điệu. Mọi tương tác, nguyện vọng, con người đều gắn liền với không gian thực tế trên bản đồ.
2. **Cử chỉ vật lý mang lại cảm xúc (Tangible Interactions):**
   - **Lắc điện thoại (Shake):** Kích hoạt radar quét ứng viên và mở màn hình Tinder Swipe.
   - **Vuốt thẻ (Swipe):** Kéo thả mượt mà, đàn hồi theo quán tính vật lý (Spring physics).
   - **Ném POPO (Blast):** Chạm vào avatar bạn bè để bắn hiệu ứng nổ tung màn hình.
3. **Minh bạch và có lý giải của Trí tuệ Nhân tạo (Explainable AI):**
   - Khi đề xuất người khác, luôn hiển thị lý do: `🔥 Match 94% (Cùng mê Cầu lông & Acoustic Cafe)`.
4. **Tôn trọng quyền riêng tư (Privacy-by-Design):**
   - Hỗ trợ Chế độ bóng ma (Ghost Mode): Cho phép ẩn hoặc làm mờ vị trí chính xác (bán kính 1km) bất kỳ lúc nào.

---

## 2. BẢNG MÀU & ĐỊNH DANH HÌNH ẢNH (COLOR SYSTEM & TYPOGRAPHY)

### 2.1. Bảng màu chủ đạo (Color Palette)
- **Map Canvas Background (Nền bản đồ tối):** `#12131C` (Dark Navy) kết hợp các tuyến đường `#1E2235` và vùng nước `#0D111E`.
- **Primary Accent (Màu chủ đạo):** `#FF4B72` (Neon Coral / Gradient Coral - Hồng cam nhiệt huyết).
- **Secondary Accent (Màu thứ hai):** `#7C3AED` (Electric Purple - Tím công nghệ AI).
- **AI Highlight / Online:** `#10B981` (Mint Neon - Xanh ngọc bảo mật/online) & `#06B6D4` (Cyan).
- **Surface / Cards:** `#1F2438` (Dark Surface) hoặc `#FFFFFF` (Khi ở chế độ sáng).
- **Text:** `#FFFFFF` (Tiêu đề), `#94A3B8` (Phụ đề/Meta text).

### 2.2. Nghệ thuật chữ (Typography)
- Phông chữ hệ thống hiện đại, dễ đọc trên thiết bị di động (Inter / System font).
- Chữ số hiển thị % Match AI và khoảng cách được nhấn đậm (Bold / Heavy, letter-spacing -0.5px).

---

## 3. KIẾN TRÚC ĐIỀU HƯỚNG THANH CÔNG CỤ DƯỚI (BOTTOM BAR NAVIGATION)

Thanh Tab Bar được thiết kế phong cách mờ trong suốt (Glassmorphism / Blur):

| Vị trí | Tab | Biểu tượng | Chức năng & Trải nghiệm |
|:---|:---|:---|:---|
| **Tab 1** | **Bản đồ (Map)** | `map` / `earth` | **Màn hình chính:** Social Map Jagat, Avatar pins, Sóng Radar, Bong bóng trạng thái NOW. |
| **Tab 2** | **Ghép đôi (Match)** | `flame` / `sparkles` | Lối tắt vào ngay bộ thẻ vuốt Tinder (Tương đương khi Lắc điện thoại). |
| **Center** | **Phát tín hiệu (+)** | `add` (FAB tròn phát sáng) | Mở nhanh Bottom Sheet đăng "Nguyện vọng tức thì" có hẹn giờ lên Map. |
| **Tab 4** | **Tin nhắn (Chat)** | `chatbubbles` | Danh sách hội thoại riêng tư, thông báo Match kép và tương tác ném POPO. |
| **Tab 5** | **Cá nhân (Profile)** | `person` | Hồ sơ đầy đủ như Tinder: Album ảnh, Bio, Tags sở thích, Điểm uy tín, Ghost Mode. |

---

## 4. QUY CHUẨN THIẾT KẾ CÁC THÀNH PHẦN CHÍNH (COMPONENT SPECIFICATIONS)

### 4.1. Bong bóng Nguyện vọng trên Bản đồ (NOW Thought Bubble)
- Nằm cách đỉnh đầu Avatar Pin **6px**.
- Nền trắng bóng viền phát sáng nhẹ, mũi nhọn chĩa xuống Avatar.
- Chứa: Icon thể loại (🍔, 🏸, ☕, 📚) + Tối đa 2 dòng chữ ngắn + Vòng viền đếm ngược thời gian bốc hơi.
- Chạm vào mở Card xem chi tiết và nút "Tham gia cùng".

### 4.2. Thẻ vuốt Tinder (Swipe Card Stack)
- Tỉ lệ khung hình thẻ: Chiều rộng 92% màn hình, chiều cao 72% màn hình.
- Bo góc lớn: `borderRadius: 24px`, đổ bóng sâu `shadowRadius: 16px`.
- Lớp Gradient đen phủ 30% ở phần đáy ảnh để nổi bật chữ Tên, Tuổi, Khoảng cách và Tags sở thích.
- Huy hiệu `LIKE` màu xanh lá góc trái và `NOPE` màu đỏ góc phải xoay nghiêng 15 độ khi kéo vuốt.

### 4.3. Hiệu ứng Chúc mừng Match Kép (It's a Match Modal)
- Nền tối mờ toàn phần `rgba(10, 12, 24, 0.92)`.
- Hai avatar của 2 người dùng bay từ hai bên vào giữa chạm nhau (BUMP) kèm rung máy.
- Pháo hoa nổ tung tỏa ra xung quanh.
- 3 nút bấm chứa câu mở lời AI (Ice-breakers) thông minh để gửi tin nhắn ngay lập tức.
