# 📈 Tiến Độ Dự Án — VIVU Web App V2.0

---

## 1. THÔNG TIN DỰ ÁN

| Thông tin | Chi tiết |
| :--- | :--- |
| **Tên dự án** | VIVU — Mạng Xã Hội Bản Đồ Không Gian & Lên Lịch Hẹn Thời Gian Thực |
| **Nền tảng** | Web App SPA (React 18 + Vite + Tailwind CSS + Mapbox GL JS 3D) |
| **Backend & Realtime** | Node.js Express REST API + Socket.IO (Port 5000) |
| **Cơ sở dữ liệu** | Dual-Mode: Supabase PostGIS Cloud + Local JSON Persistence Engine (`dbStore.js`) |
| **Phong cách UI/UX** | Resend Dark Monochrome (`#0E0E10`, `#151619`) + Cyber-Solar Hologram 3D |
| **AI Tooling** | Google Stitch AI MCP Server (`https://stitch.googleapis.com/mcp`) |
| **Trạng thái hệ thống** | Vận hành ổn định: 15/15 Test Suites Passed, 52/52 Tests, Build 0 Lỗi |

---

## 2. TỔNG QUAN CÁC GIAI ĐOẠN PHÁT TRIỂN (ROADMAP)

```
Giai đoạn 1: Nền tảng Kiến trúc Fullstack & CSDL Dual-Mode       [██████████] 100% (Hoàn thành)
Giai đoạn 2: Định vị GPS Đa tầng & Mapbox GL JS 3D Canvas        [██████████] 100% (Hoàn thành)
Giai đoạn 3: Phân luồng Bài đăng Story Beacons & Tự hết hạn      [██████████] 100% (Hoàn thành)
Giai đoạn 4: Hộp thư Trò chuyện Realtime & Bong bóng Trạng thái   [██████████] 100% (Hoàn thành)
Giai đoạn 5: Nhóm Tùy Chỉnh (Custom Circles 2-Tier Permissions)  [██████████] 100% (Hoàn thành)
Giai đoạn 6: Chạm Điện Thoại Kết Bạn (Spatial Shake-to-Bump 3D)  [██████████] 100% (Hoàn thành)
Giai đoạn 7: Nâng cấp Giao diện Cyber-Solar & Dynamic Island     [██████████] 100% (Hoàn thành)
Giai đoạn 8: Tích hợp Google Stitch AI MCP & Đồng bộ Đặc tả      [██████████] 100% (Hoàn thành)
Giai đoạn 9: Tái Lập Giao Diện Luminous Solar-Cyber HUD (White)   [██████████] 100% (Hoàn thành)
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
- [x] **[GPS-03]** Tích hợp Mapbox GL JS 3D Canvas với phong cách Navigation Day sáng rõ, dễ đọc tên đường.
- [x] **[GPS-04]** Ghim Giọt Nước VIVU cắm chuẩn chóp nhọn vào mặt đường (`anchor: 'bottom'`) kết hợp vòng radar phát hiện lân cận.
- [x] **[GPS-05]** Triển khai thuật toán **Phân tán hướng tròn (Radial Offset $\ge 200$m)** khi các người dùng ngồi gần nhau (< 60m), chống đè lấp ghim.

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
  - Loại bỏ hoàn toàn lựa chọn Công khai / Riêng tư phức tạp gây hiểu nhầm (mặc định riêng tư an toàn).
  - Bổ sung chức năng **Thêm bạn bè trực tiếp** khi tạo nhóm và trong giao diện quản trị nhóm.
- [x] **[CIRCLE-02]** Hệ thống phân quyền 2 tầng chặt chẽ (2-Tier Permissions):
  - **Quản trị viên (Owner)**: Quyền sửa thông tin, thêm/đuổi thành viên, giải tán nhóm.
  - **Thành viên (Member)**: Quyền xem thành viên, trò chuyện, định vị và tự rời nhóm.
- [x] **[CIRCLE-03]** Đồng bộ không gian 1:1 lên Mapbox 3D (`viewMode === circleId`): Lọc chính xác $N$ giọt nước thành viên nhóm và tự động `fitBounds` bao trọn vị trí.

---

### Giai đoạn 6: Chạm Điện Thoại Kết Bạn (Spatial Shake-to-Bump 3D) (ĐÃ HOÀN THÀNH)
- [x] **[BUMP-01]** Bắt sự kiện gia tốc kế `devicemotion` với ngưỡng kích hoạt $> 18.0 \text{ m/s}^2$.
- [x] **[BUMP-02]** Khớp cặp không gian thời gian trên Socket.IO: Cự ly Haversine $< 15$m và thời gian lệch $< 2.5$s.
- [x] **[BUMP-03]** Giao diện Modal Hologram 3D Cyber-Solar với hiệu ứng Wireframe khối cầu và rung haptic trên thiết bị di động.

---

### Giai đoạn 7: Nâng Cấp Giao Diện Cyber-Solar & Dynamic Island (ĐÃ HOÀN THÀNH)
- [x] **[UI-01]** Chuyển đổi toàn diện sang phong cách Resend Dark Monochrome (`#0E0E10`, `#151619`, `#1A1A1E`) kết hợp điểm nhấn Cyan điện `#00F5FF` và Tím Neon `#A855F7`.
- [x] **[UI-02]** Xây dựng thanh điều hướng nổi thông minh **Dynamic Island** ở đỉnh màn hình: chứa thanh chỉnh bán kính Radar, chuông thông báo, mã người dùng `VU-XXXX`.
- [x] **[UI-03]** Chuẩn hóa 100% Bootstrap Icons vector font, tuyệt đối không dùng Unicode Emoji.
- [x] **[UI-04]** Đảm bảo độ tương phản màu sắc form nhập liệu (`text-white font-medium` trên nền `#151619`), chống tuyệt đối lỗi tàng hình chữ.

---

### Giai đoạn 8: Tích Hợp Google Stitch AI MCP & Đồng Bộ Đặc Tả (ĐÃ HOÀN THÀNH)
- [x] **[STITCH-01]** Cấu hình và kết nối thành công Google Stitch AI MCP Server (`https://stitch.googleapis.com/mcp`).
- [x] **[STITCH-02]** Viết kịch bản `scripts/list_stitch_screens.js` tra cứu và nạp các màn hình thiết kế của dự án VIVU.
- [x] **[DOCS-SYNC]** Rà soát và cập nhật đồng bộ toàn bộ tài liệu đặc tả:
  - `docs/SRS.md` -> V2.0
  - `docs/UI_UX_Spec.md` -> V3.0 (Luminous Solar-Cyber HUD)
  - `docs/Database_Spec.md` -> V2.0
  - `docs/API_Spec.md` -> V2.0
  - `docs/Algorithm_Spec.md` -> V2.0
  - `docs/Diagrams_Spec.md` -> V2.0
  - `docs/Project_Structure.md` -> V2.0
  - `docs/Progress.md` -> V2.0
  - `docs/README.md` -> V2.0
  - `docs/DESIGN.md` & `docs/Tokens_Spec.md` -> Bản chuẩn từ `get_design.md`

---

### Giai đoạn 9: Tái Thiết Lập Giao Diện Luminous Solar-Cyber HUD (ĐÃ HOÀN THÀNH)
- [x] **[HUD-01]** Nạp toàn bộ CSS Design Tokens trong `frontend/src/index.css`: Bảng màu nền `#FAFAFF`, card `#FFFFFF`, kính lỏng `rgba(255,255,255,0.88)` kèm viền Cyan `rgba(0,229,255,0.30)`, chữ Deep Slate `#131315`.
- [x] **[HUD-02]** Màn hình 1 (Bản đồ Radar 3D): Cập nhật `UnifiedDynamicIsland.jsx`, `VivuBottomDock.jsx`, `RightActionStack.jsx`, `GpsStatusBanner.jsx`, `ProximityBumpBanner.jsx`, `MapboxCanvas.jsx` (Ghim Teardrop, Avatar Hyper Lime halo, Bong bóng trạng thái trắng kính).
- [x] **[HUD-03]** Màn hình 2 (Hộp thư Messenger): Module hóa thành `MessengerInboxList.jsx`, `MessengerActiveRoom.jsx`, `MessengerChatView.jsx` (Rule 7 < 450 dòng), Nút 2.1 Back, Nút 2.2 "+ Tạo Nhóm", Nút 2.3 Bộ lọc 3 tab, Nút 2.4 Xóa chat, Nút 2.5 Phím tắt Poll, Nút 2.6 Phím tắt Lịch trình.
- [x] **[HUD-04]** Màn hình 3 (Kết nối Bạn bè): Cập nhật `FriendshipManagerModal.jsx` và `RightFriendshipPanel.jsx`, Nút 3.1 Copy mã lưới, Nút 3.2 Đóng trang, Nút 3.3 Chấp nhận kết bạn, Nút 3.4 Từ chối kết bạn.
- [x] **[HUD-05]** Màn hình 4 (Hồ sơ Cá nhân): Cập nhật `ProfilePageView.jsx` và `TinderProfileCard.jsx`, Nút 4.1 Sửa nick, Nút 4.2 Đổi nick, Nút 4.3 Bánh răng cài đặt, Nút 4.4 / 4.5 Nút nổi trên cover, Nút 4.6 Gửi tâm trạng, Nút 4.7 Thêm ảnh, Nút 4.8 Ô tải ảnh 72x72, Nút 4.10 Mã QR Radar, Nút 4.11 Chia sẻ hồ sơ.
- [x] **[HUD-06]** Kiểm thử toàn diện: Frontend build 0 lỗi JSX (1.3s), Backend pass 52/52 tests (15 suites).

