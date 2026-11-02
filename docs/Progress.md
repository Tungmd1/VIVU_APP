# Tiến Độ Dự Án — VIVU Web App V3.0

---

## 1. THÔNG TIN DỰ ÁN

| Thông tin | Chi tiết |
| :--- | :--- |
| **Tên dự án** | VIVU — Mạng Xã Hội Bản Đồ Không Gian Thời Gian Thực (Spatial Social Network) |
| **Nền tảng** | Web App SPA (React 19 + Vite + Tailwind CSS + Mapbox GL JS 3D) |
| **Backend & Realtime** | Node.js Express REST API + Socket.IO Engine (Port 5000) |
| **Cơ sở dữ liệu** | Dual-Mode: Supabase PostGIS Cloud + Local JSON Persistence Engine (`dbStore.js`) |
| **Phong cách UI/UX** | Resend Dark Monochrome (`#07090E`, `#121520`, `#151619`) + Cyber Neon (`#10FFA0`, `#00E5FF`, `#FF2A85`) |
| **AI Tooling** | Google Stitch AI MCP Server (`https://stitch.googleapis.com/mcp`) |
| **Trạng thái hệ thống** | Vận hành ổn định: Build 0 lỗi, Backend REST + Socket.IO hoạt động liên tục |

---

## 2. TỔNG QUAN CÁC GIAI ĐOẠN PHÁT TRIỂN (ROADMAP)

```
Giai đoạn 1: Nền tảng Kiến trúc Fullstack & CSDL Dual-Mode       [██████████] 100% (Hoàn thành)
Giai đoạn 2: Định vị GPS Đa tầng & Mapbox GL JS 3D Canvas        [██████████] 100% (Hoàn thành)
Giai đoạn 3: Phân luồng Bài đăng Story Beacons & Tự hết hạn      [██████████] 100% (Hoàn thành)
Giai đoạn 4: Hộp thư Trò chuyện Realtime & Bong bóng Trạng thái   [██████████] 100% (Hoàn thành)
Giai đoạn 5: Nhóm Tùy Chỉnh (Custom Circles 2-Tier Permissions)  [██████████] 100% (Hoàn thành)
Giai đoạn 6: Chạm Điện Thoại Kết Bạn (Spatial Bump 3D)           [██████████] 100% (Hoàn thành)
Giai đoạn 7: Nâng cấp Giao diện Resend Dark & Dynamic Island     [██████████] 100% (Hoàn thành)
Giai đoạn 8: Tích hợp Google Stitch AI MCP & Đồng bộ Đặc tả      [██████████] 100% (Hoàn thành)
Giai đoạn 9: Module hóa Component & Chống File Đơn Khối          [██████████] 100% (Hoàn thành)
Giai đoạn 10: Multi-Story, Lightbox, Xóa Bài, Kho Lưu Trữ & Tin Nổi Bật [██████████] 100% (Hoàn thành)
```

---

## 3. CHI TIẾT TỪNG PHÂN HỆ TÍNH NĂNG

### Giai đoạn 1: Kiến trúc Fullstack & Dual-Mode Persistence (ĐÃ HOÀN THÀNH)
- [x] **[ARCH-01]** Thiết lập máy chủ Express REST API và Socket.IO tại `backend/src/server.js`.
- [x] **[ARCH-02]** Xây dựng động cơ lưu trữ bền vững `dbStore.js` với cơ chế ghi tệp nguyên tử (Atomic write via temp file) lưu trữ tại `backend/data/vivu_database.json`.
- [x] **[ARCH-03]** Tích hợp bộ lọc **Sanitizer Engine**: Tự động thanh lọc các ID khách tạm `client-xxx` khi máy chủ khởi động lại, bảo toàn tuyệt đối tài khoản đã đăng ký.
- [x] **[ARCH-04]** Cấu hình Vite Reverse Proxy định tuyến `/api` sang backend và mở `allowedHosts: true` cho phép chia sẻ qua Cloudflare Tunnel.
- [x] **[ARCH-05]** Viết 15 bộ kiểm thử tự động (Jest & Supertest) bao phủ toàn bộ API `auth`, `circles`, `chat`, `friends`, `stories` (15/15 test suites passed).

---

### Giai đoạn 2: Định Vị GPS Đa Tầng & Bản Đồ 3D (ĐÃ HOÀN THÀNH)
- [x] **[GPS-01]** Xây dựng kiến trúc định vị 3 tầng (Multi-Tier Location Engine): HTML5 GPS độ chính xác cao -> IP Geolocation -> Bộ nhớ cache `vivu_user_real_location`.
- [x] **[GPS-02]** Triển khai bộ lọc khử nhiễu **Anti-Jitter Filter (> 8m)** và cơ chế **Khóa vị trí xác thực (Verified Anchor)** chống drift.
- [x] **[GPS-03]** Tích hợp Mapbox GL JS 3D Canvas với góc nghiêng phối cảnh 32-35 độ và tòa nhà 3D chân thực.
- [x] **[GPS-04]** Ghim Giọt Nước VIVU cắm chuẩn chóp nhọn vào mặt đường (`anchor: 'bottom'`) kết hợp vòng radar phát hiện lân cận.
- [x] **[GPS-05]** Triển khai thuật toán **Phân tán hướng tròn (Radial Offset >= 200m)** khi các người dùng ngồi gần nhau (< 60m), chống đè lấp ghim.

---

### Giai đoạn 3: Đăng Khoảnh Khắc Story Studio (ĐÃ HOÀN THÀNH)
- [x] **[POST-01]** Xây dựng Story Studio Modal (`StoryStudioModal.jsx`):
  - Hỗ trợ tải ảnh hoặc chụp trực tiếp từ camera thiết bị.
  - Chèn nhãn dán Meme Messenger (Cần Cafe Gấp, 10 Điểm Ko Nhưng, Hết Cứu, Chill Đêm, Năng Lượng 100%...).
  - Đính kèm nhạc nền thịnh hành (nghe thử bài hát thật qua Web Audio API).
  - Chọn dải màu nền gradient phong phú và hẹn giờ tự hủy từ 1h đến 24h.
- [x] **[POST-02]** Động cơ **Bulletproof Auto-Expiry**: Tự động dọn dẹp và ẩn các story sau mốc thời gian hết hạn kể từ khi đăng tải.
- [x] **[POST-03]** Tương tác Story không gian (`StoryInteractiveModal.jsx`): Thả tim/reaction, nghe nhạc nền, và kết nối trò chuyện trực tiếp từ ghim trên bản đồ 3D.
- [x] **[POST-04]** Tích hợp camera chụp ảnh dự phòng cho thiết bị di động truy cập qua mạng LAN HTTP (`capture="environment"` fallback).

---

### Giai đoạn 4: Hộp Thư Trò Chuyện & Bong Bóng Trạng Thái (ĐÃ HOÀN THÀNH)
- [x] **[CHAT-01]** Xây dựng phòng chat thời gian thực qua Socket.IO: Nhận gửi tin nhắn tức thời, chỉ báo đang nhập (typing indicator).
- [x] **[CHAT-02]** Định danh cuộc trò chuyện trực tiếp 1-1 theo chuẩn chính tắc: `conv-direct-idA--idB`.
- [x] **[CHAT-03]** Hệ thống âm thanh Web Audio API phân tầng:
  - **Radar Alert**: D5 (587.3Hz) -> A5 (880Hz), ngân dài 0.5s khi phát hiện bài đăng mới.
  - **Chat Pop-Chime**: E6 (1318.5Hz) -> A6 (1760Hz), dứt khoát 0.2s khi có tin nhắn mới.
- [x] **[CHAT-04]** Thông báo Popup Toast toàn cục trên mọi màn hình khi có tin nhắn hoặc lời mời mới.

---

### Giai đoạn 5: Nhóm Tùy Chỉnh (Custom Circles 2-Tier Permissions) (ĐÃ HOÀN THÀNH)
- [x] **[CIRCLE-01]** Rà soát và tái cấu trúc toàn diện tính năng tạo nhóm:
  - Mặc định riêng tư an toàn, loại bỏ các cài đặt rườm rà.
  - Chức năng **Thêm bạn bè trực tiếp** khi tạo nhóm và trong giao diện quản trị nhóm.
- [x] **[CIRCLE-02]** Hệ thống phân quyền 2 tầng chặt chẽ (2-Tier Permissions):
  - **Quản trị viên (Owner)**: Quyền sửa thông tin, thêm/đuổi thành viên, giải tán nhóm.
  - **Thành viên (Member)**: Quyền xem thành viên, trò chuyện, định vị và tự rời nhóm.
- [x] **[CIRCLE-03]** Đồng bộ không gian 1:1 lên Mapbox 3D (`viewMode === circleId`): Lọc chính xác $N$ giọt nước thành viên nhóm và tự động `fitBounds` bao trọn vị trí.

---

### Giai đoạn 6: Chạm Điện Thoại Kết Bạn (Spatial Bump 3D) (ĐÃ HOÀN THÀNH)
- [x] **[BUMP-01]** Bắt sự kiện gia tốc kế `devicemotion` với ngưỡng kích hoạt $> 18.0 \text{ m/s}^2$.
- [x] **[BUMP-02]** Khớp cặp không gian thời gian trên Socket.IO: Cự ly Haversine $< 15$m và thời gian lệch $< 2.5$s.
- [x] **[BUMP-03]** Giao diện Modal Hologram 3D Cyber-Solar với hiệu ứng Wireframe cụm ly và tự động tạo Story Đôi (Joint Story).

---

### Giai đoạn 7: Nâng Cấp Giao Diện Resend Dark & Dynamic Island (ĐÃ HOÀN THÀNH)
- [x] **[UI-01]** Chuyển đổi toàn diện sang phong cách Resend Dark Monochrome (`#07090E`, `#121520`, `#151619`) kết hợp điểm nhấn Cyber Neon (`#10FFA0`, `#00E5FF`, `#FF2A85`).
- [x] **[UI-02]** Xây dựng thanh điều hướng nổi thông minh **Dynamic Island** ở đỉnh màn hình: chứa thanh chỉnh bán kính Radar, chuông thông báo, mã người dùng `VU-XXXX`.
- [x] **[UI-03]** Chuẩn hóa 100% Bootstrap Icons vector font, tuyệt đối không dùng Unicode Emoji.
- [x] **[UI-04]** Đảm bảo độ tương phản màu sắc form nhập liệu (`text-white font-medium` trên nền `#151619`), chống tuyệt đối lỗi tàng hình chữ.

---

### Giai đoạn 8: Tích Hợp Google Stitch AI MCP & Đồng Bộ Đặc Tả (ĐÃ HOÀN THÀNH)
- [x] **[STITCH-01]** Cấu hình và kết nối thành công Google Stitch AI MCP Server (`https://stitch.googleapis.com/mcp`).
- [x] **[STITCH-02]** Viết kịch bản `scripts/list_stitch_screens.js` tra cứu và nạp các màn hình thiết kế của dự án VIVU.
- [x] **[DOCS-SYNC]** Rà soát và cập nhật đồng bộ toàn bộ tài liệu đặc tả phiên bản V3.0 bám sát 100% mã nguồn thực tế, thanh lọc toàn diện các đặc tả cũ không tồn tại.

---

### Giai đoạn 9: Module Hóa Component & Chống File Đơn Khối (ĐÃ HOÀN THÀNH)
- [x] **[MOD-01]** Tách bạch `frontend/src/components/story/` thành 3 thư mục con chuyên biệt: `camera/`, `editor/`, `viewer/`.
- [x] **[MOD-02]** Tách `App.jsx` thành Shell điều phối trạng thái cấp cao (< 450 dòng), tuân thủ Rule 7 của dự án.
- [x] **[MOD-03]** Tách các component bảng điều khiển hồ sơ `ProfilePageView.jsx`, `ProfileHeroCard.jsx`, `ProfileBentoWidgets.jsx`.

---

### Giai đoạn 10: Multi-Story, Lightbox, Xóa Bài, Kho Lưu Trữ & Tin Nổi Bật (ĐÃ HOÀN THÀNH)
- [x] **[STORY-01]** Chức năng Xóa Story bài đăng 2 cấp độ:
  - Lựa chọn 1: "Gỡ khỏi Bản đồ" (giữ nguyên trong Kho lưu trữ cá nhân).
  - Lựa chọn 2: "Xóa vĩnh viễn" (gọi `DELETE /api/stories/:storyId`, xóa khỏi RAM và file JSON lưu trữ đĩa).
  - Tự động gỡ bong bóng trạng thái trên đầu ghim "BẠN" nếu là Story cuối cùng.
- [x] **[STORY-02]** Trình phát Multi-Story theo phân đoạn (`StoryViewerModal.jsx`):
  - Tự động gom toàn bộ các Story đang hoạt động của cùng một tác giả thành danh sách phân đoạn (Segmented progress bars).
  - Hỗ trợ chạm nửa trái lùi Story trước, chạm nửa phải xem Story tiếp theo, nhấn giữ để tạm dừng tiến trình thanh thời gian.
- [x] **[STORY-03]** Lightbox xem ảnh toàn màn hình (`StoryFullscreenLightbox.jsx`):
  - Chạm vào ảnh Story để phóng to toàn màn hình không bị che khuất bởi các widget.
  - Hỗ trợ công cụ Zoom In / Zoom Out / Reset 1:1, kéo lia ảnh (Pan/Drag) mượt mà và phím tắt ESC.
- [x] **[STORY-04]** Kho lưu trữ Story cá nhân (`vivu_user_story_archive_{userId}`):
  - Tự động lưu trữ vĩnh viễn tất cả bài đăng Story của người dùng kể từ lúc tạo tài khoản.
  - Tích hợp Tab Switcher ngay trên trang cá nhân: chuyển đổi mượt mà giữa "Thư Viện Ảnh Thật" và "Kho Lưu Trữ Story".
- [x] **[STORY-05]** Bộ sưu tập Tin Nổi Bật (`ProfileStoryHighlights.jsx`):
  - Cho phép người dùng bấm nút `(+) Mới` để chọn một hoặc nhiều Story từ Kho lưu trữ.
  - Đặt tiêu đề và tự động trích xuất ảnh bìa để ghim lên đầu trang cá nhân (chuẩn Highlight Reels).
- [x] **[STORY-06]** Tinh chỉnh thẩm mỹ Avatar cá nhân:
  - Khung ảnh đại diện tròn khi chưa có avatar hiển thị nền trắng phẳng tinh tế với vector người màu xám `bi bi-person-fill`.
  - Loại bỏ hoàn toàn các chữ hay icon rườm rà đè lên khung hình đại diện.
