# 🎨 UI/UX Specification — Dự Án VIVU (Resend Dark Monochrome & Cyber Neon)

> **Phiên bản tài liệu**: 3.0 (Đồng bộ chuẩn hóa 100% theo giao diện thực tế)  
> **Ngôn ngữ thiết kế**: Resend Dark Monochrome & Cyber Neon (Dark Graphite `#07090E`, `#0E0E10`, `#121520`, `#151619`, `#1A1A1E`, Hyper Lime `#10FFA0`, Cyber Cyan `#00E5FF`, Sunset Pink `#FF2A85`)  
> **Quy chuẩn biểu tượng**: 100% Vector Bootstrap Icons (`bi bi-...`) — Tuyệt đối cấm Unicode Emoji (Rule 5)

---

## 1. TRIẾT LÝ THIẾT KẾ (DESIGN PHILOSOPHY)

VIVU Web App mang phong cách thiết kế **Resend Dark Monochrome & Cyber Neon HUD**, lấy cảm hứng từ các giao diện công nghệ tối giản cao cấp (Linear, Resend, Apple VisionOS, Zenly).

### 3 Trụ Cột Trải Nghiệm:
1. **Dark Monochrome Surface & Ultra-Thin Borders (Bề Mặt Than Chì & Viền Siêu Mỏng)**:
   - Sử dụng nền than chì sâu thẳm `#07090E` và `#0E0E10`, kết hợp các thẻ card `#121520`, `#151619`, `#1A1A1E`.
   - Đường viền siêu mảnh `border-white/10` và `border-white/15` mang lại cảm giác sắc nét, tinh xảo, chống chói mắt khi sử dụng ban đêm.
2. **Neon Accents Đột Phá & Độ Tương Phản Form Nhập Liệu Cao (Rule 12)**:
   - Mọi trường nhập liệu form (`input`, `textarea`, `select`) đều dùng nền tối `#151619` hoặc `#1A1A1E`, chữ trắng `text-white font-medium`, placeholder xám `#8E8E93`, triệt tiêu hoàn toàn lỗi trùng màu chữ.
   - Các điểm nhấn neon phát sáng: Hyper Lime (`#10FFA0`: Trạng thái Online, Laser Ring), Cyber Cyan (`#00E5FF`: Primary Action, Bản đồ), Sunset Pink (`#FF2A85`: Story & Reactions), Amber Gold (`#F59E0B`: Cảnh báo, VIP).
3. **Công Thái Học Cảm Ứng Di Động (Mobile-First Touch Ergonomics)**:
   - Mục tiêu chạm (touch target) tối thiểu 44x44px.
   - Đảo nổi Dynamic Island ở đỉnh đầu và thanh điều hướng Bottom Dock 5 tab ở chân trang với safe-area padding cho iPhone và Android.

---

## 2. HỆ THỐNG MÀU SẮC & DESIGN TOKENS

### 2.1 Bảng màu Nền & Bề Mặt (Surfaces)
| Token Name | Mã Hex / Class Tailwind | Vị trí áp dụng |
|---|---|---|
| `--color-bg-base` | `#07090E` / `bg-[#07090E]` | Nền viewport gốc toàn bộ ứng dụng |
| `--color-surface-panel` | `#0E0E10` / `bg-[#0E0E10]` | Nền thanh Bottom Dock, Messenger Drawer, Sheet |
| `--color-surface-card` | `#121520` / `bg-[#121520]` | Nền card nội dung, danh sách bạn bè, bento widget |
| `--color-surface-input` | `#151619` / `bg-[#151619]` | Nền ô nhập liệu input, textarea, form chat (Rule 12) |
| `--color-surface-modal` | `#1A1A1E` / `bg-[#1A1A1E]` | Nền các hộp thoại modal, popup xác nhận |
| `--color-border-subtle` | `rgba(255, 255, 255, 0.10)` | Đường viền siêu mỏng `border-white/10` |
| `--color-border-focus` | `rgba(16, 255, 160, 0.40)` | Viền khi focus vào ô input (`focus:border-[#10FFA0]`) |

### 2.2 Bảng màu Điểm Nhấn (Neon Accents)
| Tên màu | Mã Hex | Ý nghĩa & Vị trí hiển thị |
|---|---|---|
| **Hyper Lime** | `#10FFA0` | Chấm Online, vòng hào quang laser người dùng, thanh tiến trình đang xem, viền radar |
| **Cyber Cyan** | `#00E5FF` | Nút hành động chính (Primary CTA), ghim vị trí, liên kết chỉ đường |
| **Sunset Pink** | `#FF2A85` | Nút chụp nhanh Quick Snap, ghim khoảnh khắc Story, hiệu ứng pháo hoa |
| **Solar Amber** | `#F59E0B` | Bộ đếm thời gian tự hủy story, cảnh báo kề cận < 60m |
| **Rose Laser** | `#EF4444` | Nút Xóa Story vĩnh viễn, Hủy kết bạn, Đăng xuất |

### 2.3 Phông Chữ & Typography
- **Font tiêu đề & nút nhấn**: `"Outfit"`, sans-serif (`font-bold`, `tracking-wide`).
- **Font nội dung tiếng Việt**: `"Be Vietnam Pro"`, sans-serif (`font-sans`, hiển thị dấu tiếng Việt sắc nét).
- **Font mã số & dữ liệu GPS**: `"JetBrains Mono"`, monospace (`font-mono`, hiển thị mã `VU-XXXX`, tọa độ, khoảng cách km, thời gian).

---

## 3. ĐẶC TẢ CHI TIẾT CÁC MÀN HÌNH CHỦ ĐẠO

### 3.1 Màn Hình Bản Đồ Xã Hội 3D (Map Canvas & Dynamic Island)
1. **Dynamic Island Đỉnh Màn Hình (`UnifiedDynamicIsland.jsx`)**:
   - Vị trí: `top-3.5 left-1/2 -translate-x-1/2 z-40`, nền kính than chì mờ `bg-black/75 backdrop-blur-xl border border-white/15 rounded-full`.
   - Avatar góc trái: Bo tròn viền nhịp thở Hyper Lime `#10FFA0` kèm mã định danh `VU-XXXX`.
   - Dropdown thanh trượt bán kính Radar (0.5km - 15km) kèm các nút chọn nhanh (1km, 3km, 5km, 10km, Tất cả).
   - Chuông thông báo: Icon chuông `bi bi-bell-fill` kèm badge đếm số lượng chưa đọc.
   - Nút Bạn bè: Hiển thị tổng số lượng bạn bè trực tuyến và lời mời kết bạn đang chờ.
2. **Ghim Lăng Kính Wireframe 3D Marker Pin (`MapboxCanvas.jsx`)**:
   - **Ghim "BẠN"**: Bo viền Hyper Lime `#10FFA0`, vòng tròn Laser Cyan phát xung tiếp đất (Ground Ripple).
   - **Bong bóng trạng thái**: Hiển thị ảnh Meme sticker, tên bài hát đang phát (kèm nút Play/Pause), caption ngắn. Chạm vào bong bóng mở trực tiếp trình xem Story.
   - **Tách cụm Radial Dispersion (Rule 16)**: Khi $\ge 2$ tài khoản đứng cùng tọa độ (< 60m), tự động tách vòng tròn bán kính $\ge 200$m kèm nhãn `[GẦN BẠN]`.
3. **Cụm Nút Công Cụ Nổi Góc Phải (Floating FAB Stack)**:
   - Nút Phóng to / Thu nhỏ bản đồ.
   - Nút Định vị GPS (Bay về tâm giọt nước "BẠN" ở góc cận cảnh `zoom: 16.2`, `pitch: 35`).
   - Nút Mở bảng kết bạn nhanh.

---

### 3.2 Phân Hệ Story Studio (Soạn Thảo Khoảnh Khắc)
1. **Khung Ảnh Camera Pro & Dual Cam PIP (`StoryStudioModal.jsx`)**:
   - Khung hình 9:16 chuẩn Story điện thoại.
   - Hỗ trợ **Dual Camera**: Khung ảnh lớn (Camera sau) + Khung ảnh nhỏ PIP tròn/bo góc (Camera trước). Chạm vào khung nhỏ để hoán đổi góc máy.
   - Nút chụp ảnh vật lý tròn lớn viền neon `#FF2A85`.
2. **Thanh Công Cụ Chỉnh Sửa Chuyên Nghiệp**:
   - **Tab Nhạc (`TrendingMusicSelector.jsx`)**: Danh sách bài hát thịnh hành, chạm để nghe thử thật qua Web Audio API.
   - **Tab Sticker Meme (`MemeStickerPicker.jsx`)**: Kho sticker meme phong cách Messenger.
   - **Tab Chữ & Màu Nền**: Chọn dải gradient nền phong phú (Midnight, Ocean, Cyber, Sunset, Neon Mint).
   - **Tab Hẹn Giờ Tự Hủy**: Chọn thời gian tự biến mất: 1h, 3h, 6h, 12h, 24h.

---

### 3.3 Phân Hệ Trình Xem Multi-Story & Fullscreen Lightbox
1. **Trình Xem Story Phân Đoạn (`StoryViewerModal.jsx`)**:
   - **Segmented Bars trên đỉnh**: $N$ vạch ngang đại diện cho $N$ story của cùng tác giả; vạch đang xem phát sáng Hyper Lime `#10FFA0`.
   - **Điều hướng cảm ứng**: Chạm nửa trái lùi story; chạm nửa phải tiến story tiếp theo. Có 2 nút mũi tên điều hướng nổi bật ở 2 bên mép màn hình.
   - **Không tự động tắt**: Loại bỏ hoàn toàn bộ đếm 7 giây tự đóng ngoài ý muốn, cho phép người dùng thoải mái thưởng thức.
2. **Chế Độ Xem Full Màn Hình Lightbox (`StoryFullscreenLightbox.jsx`)**:
   - Chạm 1 lần vào ảnh hoặc bấm nút phóng to (`bi bi-arrows-fullscreen`): Mở giao diện tràn viền 100% viewport trên nền đen mờ 95%.
   - Công cụ: Nút Zoom In (`+`), Zoom Out (`-`), Đặt lại tỷ lệ (`1:1`), kéo pan ảnh khi phóng to, và phím `ESC` để đóng nhanh.
3. **Xóa Story 2 Chế Độ**:
   - Khi chủ bài đăng bấm biểu tượng Thùng rác (`bi bi-trash3`): Mở popup lựa chọn thông minh:
     - **Gỡ khỏi Bản đồ (Lưu vào Kho Lưu Trữ)**: Gỡ ngay khỏi bản đồ 3D nhưng bảo lưu trong hồ sơ cá nhân.
     - **Xóa vĩnh viễn tất cả**: Loại bỏ hoàn toàn cả trên bản đồ, máy chủ và trong kho lưu trữ.

---

### 3.4 Phân Hệ Hồ Sơ Cá Nhân (Profile, Highlights & Archive)
1. **Giao Diện Hồ Sơ Cá Nhân (`ProfilePageView.jsx`)**:
   - **Avatar Chuẩn Mực**: Nền trắng sạch sẽ kèm icon người xám (`bi bi-person-fill`) nếu chưa có avatar thật, loại bỏ hoàn toàn avatar giả định.
   - **Thông Tin Thực Tế**: Họ tên, Mã người dùng `VU-XXXX`, Tuổi, Nghề nghiệp, Số điện thoại, Tiểu sử Bio.
   - **Nút Đăng Xuất**: Nền `bg-rose-500/10 text-rose-400 border border-rose-500/30` kèm hộp thoại xác nhận an toàn.
2. **Hàng Tin Nổi Bật (Highlights — `ProfileStoryHighlights.jsx`)**:
   - Nút `(+) Mới` viền nét đứt: Mở modal tạo nhóm tin nổi bật (nhập tiêu đề, chọn ảnh bìa).
   - Danh sách vòng tròn Highlights viền gradient năng động (`#10FFA0` -> `#00E5FF` -> `#FF2A85`): Chạm vào mở xem chuỗi story theo từng phân đoạn.
   - Picker chọn ảnh từ Kho Lưu Trữ: Cho phép chọn ảnh đã lưu trữ làm ảnh bìa chỉ với 1 chạm.
3. **Tab Switcher Phân Vùng Media**:
   - **Tab Thư Viện Ảnh** (`bi bi-images`): Quản lý các ảnh đời thường do người dùng tự đăng tải lên hồ sơ.
   - **Tab Kho Lưu Trữ** (`bi bi-archive-fill`): Tập hợp ảnh/video từ Story đã đăng, hỗ trợ xem phóng to, xóa vĩnh viễn khỏi kho.

---

### 3.5 Phân Hệ Trò Chuyện Messenger & Custom Circles
1. **Khung Chat Messenger Hiện Đại (`MessengerChatView.jsx`)**:
   - Danh sách hội thoại trực tiếp 1-1 và hội thoại nhóm.
   - Bong bóng tin nhắn tương phản cao: Tin của mình nền `#00E5FF text-[#08202E] font-medium`, tin đối phương nền `#1A1A1E text-white border border-white/10`.
2. **Widget Bình Chọn (Interactive Poll Widget)**:
   - Thẻ bình chọn trực tiếp trong khung chat, hiển thị số phiếu bầu và tiến độ % thời gian thực.
3. **Thẻ Chốt Lịch Trình (Confirmed Itinerary Card)**:
   - Hiển thị địa điểm hẹn, thời gian, kèm nút "Xem trên Map" và "Chỉ đường" liên kết sang Mapbox Directions.
4. **Quản Lý Nhóm Riêng (`CircleManagementModal.jsx`)**:
   - Thêm bạn bè trực tiếp vào nhóm ngay khi tạo (Rule 27).
   - Menu quản trị: Đổi tên nhóm, thêm thành viên, kick thành viên, giải tán nhóm (Trưởng nhóm) / Tự rời nhóm (Thành viên).
   - Khi chọn xem nhóm: Bản đồ tự động lọc đúng $N$ thành viên nhóm đó kèm `fitBounds` bao trọn (Rule 9).

---

## 4. QUY CHUẨN ĐỒNG BỘ THIẾT KẾ (DESIGN INVARIANTS)

1. **Quy chuẩn Anti-Emoji (Rule 5)**: 100% sử dụng Bootstrap Icons vector (`bi bi-...`), cấm ký tự Unicode Emoji trong toàn bộ ứng dụng.
2. **Quy chuẩn Form Tương Phản (Rule 12)**: Mọi ô input đều dùng nền tối `#151619` hoặc `#1A1A1E`, chữ trắng `text-white font-medium`, placeholder `#8E8E93`.
3. **Quy chuẩn Ghim Giọt Nước (Rule 5)**: Chóp nhọn cắm chuẩn xác vào mặt đất (`anchor: 'bottom'`) để tâm GPS cắm chuẩn xác vào tim đường khi xoay/nghiêng 3D.
4. **Quy chuẩn Âm Thanh Đa Tầng (Rule 19)**: Phân biệt rõ âm thanh Radar phát hiện khoảnh khắc (D5 -> A5) và âm thanh tin nhắn đến Pop-Chime (E6 -> A6).
