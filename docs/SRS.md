# 📋 SRS — Software Requirements Specification
# Dự án: VIVU — Nền tảng Web App Bản Đồ Xã Hội & Lên Lịch Hẹn Thời Gian Thực

> **Phiên bản tài liệu**: 2.0 (Cập nhật đồng bộ 100% theo mã nguồn thực tế)  
> **Trạng thái**: Đang vận hành (Active Living Document)  
> **Kiến trúc**: Fullstack Dual-Mode (React + Vite + Node.js Express + Mapbox GL JS + Supabase PostGIS + Stitch MCP)

---

## 1. GIỚI THIỆU & ĐỊNH HƯỚNG NỀN TẢNG

### 1.1 Mục đích tài liệu
Tài liệu này xác định chi tiết và chuẩn xác các yêu cầu kỹ thuật, kiến trúc hệ thống và chức năng của **VIVU** — nền tảng Web App mạng xã hội bản đồ thời gian thực (Map-Centric Social Web App). Ứng dụng tập trung vào trải nghiệm kết nối và gặp gỡ đời thực: **Đăng khoảnh khắc Story định vị không gian trên bản đồ 3D**, **Tìm kiếm & quét radar bạn bè quanh đây**, **Lắc điện thoại kết nối cự ly gần (Spatial Bump 3D)**, **Trò chuyện & bình chọn lịch hẹn trong Messenger**, và **Dẫn đường di chuyển thực tế qua Mapbox Directions**.

### 1.2 Phạm vi hệ thống & Định hướng nền tảng
- **Loại hình ứng dụng**: **Web App (Single Page Application — React + Vite)**, tối ưu hóa công thái học cảm ứng di động (Mobile-First Touch Ergonomics) và tương thích hoàn hảo trên màn hình máy tính (Desktop Multi-Column).
- **Trải nghiệm vào thẳng bản đồ (Zero-Flash Direct Guest Map — Rule 22)**: Bất kỳ thiết bị nào khi mở webapp đều vào thẳng Bản đồ 3D ngay lập tức, tự động cấp mã định danh `user_code` (`VU-XXXX`) và cắm ghim vị trí thật, không chặn cứng bằng màn hình đăng nhập.
- **Bản đồ là trung tâm (Map-Centric Architecture)**: 90% tương tác cốt lõi diễn ra trên canvas Mapbox 3D toàn màn hình hoặc qua các lớp phủ nổi (Dynamic Island, Floating Action Dock, Bottom Sheets).
- **Thẩm mỹ Resend Dark & Cyber-Solar Hologram**: Nền than chì sâu thẳm (`#0E0E10`, `#151619`), viền siêu mỏng `border-white/10`, màu nhấn công nghệ Cyber Cyan (`#00F0FF`), Hyper Lime (`#10FFA0`), Sunset Pink (`#FF2A85`) có tiết chế, và **100% Vector Bootstrap Icons (Anti-Emoji — Rule 5)**.

---

## 2. KIẾN TRÚC TỔNG THỂ HỆ THỐNG (FULLSTACK DUAL-MODE)

Ứng dụng vận hành theo mô hình kiến trúc 3 phân hệ độc lập:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT WEB APP (frontend/)                      │
│      React 19 + Vite + Tailwind CSS v4 + Motion + Mapbox GL JS        │
│                                                                        │
│  [Unified Dynamic Island]       [Mapbox 3D Hologram Canvas]            │
│  - Co giãn đàn hồi sự kiện       - Ghim lăng kính Wireframe 3D         │
│  - Thanh trượt radar 0.5-15km    - Tia laser & sóng radar tiếp đất     │
│  - Chuông báo & Friends Pill     - Tách cụm Radial Dispersion (Rule 16)│
│                                                                        │
│  [Spatial Bump Modal 3D]        [Messenger & Group Chat View]          │
│  - Quét cự ly gần < 15m          - Chat 1-1 định danh canonical ID     │
│  - Cảm biến lắc điện thoại       - Chat nhóm & Tin nhắn hệ thống       │
│  - Âm thanh Pop-Chime riêng biệt - Bình chọn Poll & Chốt lịch trình    │
│                                                                        │
│  [Story Studio & Viewer]        [Custom Circles Group Management]      │
│  - Đăng bài gắn vị trí GPS       - Phân quyền Trưởng nhóm / Thành viên │
│  - Hẹn giờ tự hủy 1h - 24h       - Thêm trực tiếp thành viên (Rule 27) │
│  - Nhạc nền & Meme Sticker       - Lọc không gian 1:1 Mapbox (Rule 9)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / WebSocket (Reverse Proxy /api)
┌───────────────────────────────────▼────────────────────────────────────┐
│                        API SERVER (backend/)                           │
│             Node.js + Express + Socket.IO (Port 5000)                  │
│                                                                        │
│  - REST Controllers: Auth, Circles, Friends, Messages, Stories, Notifs │
│  - Realtime Engine: Socket.IO Server (GPS broadcast, Chat, Circles)    │
│  - Persistence Engine (dbStore.js): Local JSON Database (Zero-Leak)    │
│  - Reverse Proxy LAN / Cloudflare Public Tunnel Integration            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Dual-Mode Fallback / Cloud Sync
┌───────────────────────────────────▼────────────────────────────────────┐
│                    CLOUD & EXTERNAL INTEGRATIONS                       │
│  - Supabase Cloud: PostgreSQL 15 + PostGIS (ST_DWithin, ST_Distance)   │
│  - Mapbox APIs: Vector Tiles v11 + Directions API v5 (Lộ trình di chuyển)│
│  - Google Stitch AI: MCP Server (Streamable HTTP https://stitch.googleapis.com/mcp)│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. CÁC PHÂN HỆ CHỨC NĂNG CỐT LÕI

### 3.1 Phân hệ Bản Đồ Không Gian 3D (Mapbox GL JS)
1. **Ghim Lăng Kính Hologram Wireframe 3D**:
   - Khung hình học xoay 45 độ, phát quang viền laser neon (Cyan: Online, Pink: Story, Amber: Kề cận < 60m).
   - Chóp nhọn cắm chuẩn xác vào mặt đường (`anchor: 'bottom'` — Rule 5).
   - Cột tia laser thẳng đứng và đĩa sóng radar đồng tâm tiếp đất (Ground Ripple).
2. **Bộ Nhớ Đệm Marker Tức Thời (`Map<id, Marker>`)**:
   - Cập nhật tọa độ in-place qua `marker.setLngLat(coords)` trong các chu kỳ polling GPS 3.5s.
   - Triệt tiêu hoàn toàn hiện tượng tạo/hủy DOM marker gây chớp nháy và hao pin thiết bị.
3. **Tự Động Tách Cụm Giọt Nước Trùng Tọa Độ (Radial Dispersion — Rule 16)**:
   - Khi 2 hay nhiều người dùng đứng cùng tọa độ (< 60m), hệ thống tự động phân tán hướng tròn bán kính $\ge 200$m theo hash ID đối phương, gắn nhãn `[GẦN BẠN]` và nâng `z-index: 30` đảm bảo không bị đè lấp.
4. **Bộ Lọc Chống Rung Lắc Cảm Biến (Anti-Jitter Filter — Rule 20)**:
   - Bỏ qua dịch chuyển micro-drift < 8m khi người dùng ở trong nhà hoặc đứng yên.
5. **Khóa Chặn Camera (Spatial Camera Clamping — Rule 24)**:
   - Nghiêm cấm camera tự ý zoom out ra vũ trụ (< 14.5); tự động kẹp góc zoom cận cảnh `zoom: 16.2`, `pitch: 35` mượt mà về tâm người dùng.

---

### 3.2 Phân hệ Đảo Nổi VIVU (Unified Dynamic Island)
1. **Thiết kế Kính Lỏng (Liquid Glassmorphism)**:
   - Nằm chính giữa đỉnh màn hình, viền ánh sáng quét liên tục **Border Beam**.
2. **Hợp nhất đa tính năng**:
   - **Avatar người dùng**: Viền sáng nhịp thở Hyper Lime.
   - **Trình chọn bán kính Radar**: Menu dropdown trực quan kèm thanh trượt mượt mà (0.5km - 15km) và các nút preset nhanh (1km, 3km, 5km, 10km, Tất cả).
   - **Chuông Thông Báo**: Huy hiệu số lượng chưa đọc, mở Drawer tương tác 2 chiều.
   - **Nút Bạn Bè**: Hiển thị số lượng bạn bè và yêu cầu kết bạn đang chờ.
3. **Hiệu ứng Biến Hình Đàn Hồi (Elastic Morphing)**:
   - Tự động co giãn bung rộng khi có tin nhắn mới hoặc phát hiện bạn bè gần < 15m, tự thu gọn sau 4 giây.

---

### 3.3 Phân hệ Kết Nối Không Gian Siêu Gần (Spatial Bump 3D)
1. **Nhận Diện Cự Ly Siêu Gần (< 15m)**:
   - Tự động tính toán khoảng cách Haversine giữa tọa độ GPS của người dùng với các peer trực tuyến.
2. **Cảm Biến Lắc Điện Thoại (Shake-to-Bump)**:
   - Sử dụng Web DeviceMotionEvent API đo gia tốc chuyển động. Khi phát hiện thao tác chạm nhẹ hoặc lắc điện thoại trong phạm vi < 15m, modal tương tác 3D mở ra tức thì.
3. **Hiệu ứng Cụm Ly 3D & Pop-Chime**:
   - Hai giọt nước va chạm đàn hồi 3D, kích hoạt pháo hoa giấy Confetti và phát âm thanh Pop-Chime Web Audio API tần số cao (E6 -> A6) dứt khoát 0.2s.

---

### 3.4 Phân hệ Đăng Khoảnh Khắc (Story Studio & Interactive Stories)
1. **Giao Diện Soạn Thảo Đa Phương Tiện (Story Studio Modal)**:
   - Đăng tải hình ảnh (từ Camera thiết bị hoặc thư viện ảnh cá nhân).
   - Chèn nhãn dán Meme Messenger (Cần Cafe Gấp, 10 Điểm Ko Nhưng, Hết Cứu, Chill Đêm, Năng Lượng 100%...).
   - Đính kèm âm nhạc thịnh hành (nghe thử bài hát thật qua Web Audio API với danh sách Trending Songs).
   - Lựa chọn màu nền Gradient phong phú (Midnight, Ocean, Sunset, Cyber, Neon Mint).
   - Hẹn giờ tự hủy linh hoạt: 1 giờ, 3 giờ, 6 giờ, 24 giờ.
2. **Cắm Ghim & Tương Tác Không Gian (Spatial Interactive Story)**:
   - Story được cắm ghim trực tiếp tại tọa độ GPS của người dùng trên Bản đồ 3D.
   - Khi hết hạn, Story tự động biến mất khỏi bản đồ mà không cần tải lại trang (Auto-Expiry Engine).
   - Người dùng khác chạm vào ghim để mở Thẻ tương tác (`StoryInteractiveModal.jsx`): Xem ảnh/caption, nghe nhạc nền, thả cảm xúc tim/reaction, và kích hoạt nhắn tin trò chuyện hoặc chỉ đường trực tiếp.
3. **Cập Nhật Trạng Thái Nhanh (Custom Status)**:
   - Nhập ghi chú trạng thái ngắn 60 ký tự trực tiếp trên ghim giọt nước "BẠN", hiển thị trên bản đồ và trong danh sách Bạn bè.

---

### 3.5 Phân hệ Tin Nhắn Messenger & Lên Lịch Hẹn
1. **Định Danh Hội Thoại 1-1 Chuẩn Hóa (Canonical ID — Rule 17)**:
   - ID hội thoại trực tiếp tuân thủ: `conv-direct-` + `[userIdA, userIdB].sort().join('--')`, đảm bảo đồng bộ nhất quán 100% qua mọi thiết bị.
2. **Phòng Chat Nhóm Đầy Đủ Tính Năng**:
   - Tin nhắn văn bản, thả tim tức thì, gửi ảnh, tin nhắn hệ thống thông báo biến động nhóm.
3. **Widget Bình Chọn Lịch Hẹn (Interactive Poll Widget)**:
   - Mở bình chọn địa điểm / thời gian ngay trong khung chat, hiển thị thanh tiến độ phiếu bầu thời gian thực.
4. **Thẻ Chốt Lịch Trình (Confirmed Itinerary Card)**:
   - Thẻ lịch trình cố định kèm nút "Xem trên Map" và "Chỉ đường" liên kết trực tiếp sang Mapbox.

---

### 3.6 Phân hệ Quản Lý Nhóm Riêng (Custom Circles — Rules 9 & 27)
1. **Tạo Nhóm Trực Tiếp & Tối Giản Quyền Riêng Tư (Rule 27)**:
   - Người tạo nhóm đặt tên, ảnh đại diện, mô tả và chọn bạn bè muốn thêm.
   - Các bạn bè được chọn sẽ được **thêm trực tiếp vào nhóm ngay khi bấm Tạo nhóm** (`member_ids` với trạng thái `accepted`), nhóm có hiệu lực tức thì.
   - Xóa bỏ phân cấp phức tạp Công khai / Riêng tư; mọi nhóm mặc định là nhóm riêng bảo mật của các thành viên.
2. **Phân Quyền 2 Tầng Chặt Chẽ**:
   - **Trưởng nhóm (owner)**: Có toàn quyền đổi tên/mô tả, thêm thành viên, xóa thành viên (`kick`), hoặc giải tán nhóm (`disband`).
   - **Thành viên (member)**: Xem thông tin, trò chuyện, thêm bạn bè vào nhóm, tự rời nhóm (`leave`).
3. **Đồng Bộ Không Gian Lên Bản Đồ 3D (Rule 9)**:
   - Khi chọn xem nhóm trên bản đồ: Bản đồ lọc hiển thị đúng các giọt nước của thành viên nhóm + Bạn, tự động `fitBounds` căn góc máy bao trọn và hiển thị thanh nổi thoát lọc `[Nhóm: {tên} • {N} thành viên] [✕]`.

---

### 3.7 Phân hệ Kết Nối Google Stitch AI (Design-to-Code MCP — Rule 28)
1. **Giao Thức MCP Streamable HTTP**:
   - Kết nối trực tiếp máy chủ Stitch AI `https://stitch.googleapis.com/mcp` qua API Key và file cấu hình `mcp_config.json`.
2. **Bộ Công Cụ Tự Động Hóa Thiết Kế**:
   - `list_projects`, `list_screens`: Duyệt danh sách màn hình đã thiết kế trong project Stitch.
   - `download_file`: Tải mã HTML/CSS và ảnh chụp màn hình trực tiếp về workspace.
   - `generate_screen_from_text`: Sinh màn hình giao diện mới từ text prompt.
   - Agent tự động refactor mã nguồn Stitch thành React Component chuẩn JSX cho VIVU.

---

## 4. QUY CHUẨN KỸ THUẬT & YÊU CẦU PHI CHỨC NĂNG

| Tiêu chuẩn | Yêu cầu kỹ thuật bắt buộc |
|---|---|
| **Module Hóa Component (Rule 7)** | Mọi file JSX tuyệt đối không vượt quá **450 dòng**, bóc tách logic theo feature components. |
| **Độ Tương Phản Màu Sắc (Rule 12)** | Mọi trường nhập liệu form (`input`, `textarea`, `select`) phải dùng nền `#151619` hoặc `#1A73E8`, viền `border-white/10`, chữ `text-white font-medium` chống trùng màu chữ. |
| **An Toàn Tọa Độ GPS (Rule 11)** | Luôn áp dụng nullish coalescing đa tầng: `location?.lat ?? location?.latitude ?? 10.7769`. |
| **Anti-Emoji Mandate (Rule 5)** | 100% biểu tượng trong ứng dụng dùng font vector Bootstrap Icons (`bi bi-...`), cấm ký tự Unicode Emoji. |
| **Hiệu Năng & Độ Trễ** | Mapbox render 60fps; Heartbeat định vị GPS 3.5s; Polling tin nhắn 1.5s; Socket.IO độ trễ < 50ms. |
| **Kiểm Thử Tự Động** | 100% test suites backend (52/52 tests) phải PASS; `npm run build` frontend hoàn thành 0 lỗi cú pháp. |
