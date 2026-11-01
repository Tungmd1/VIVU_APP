# Vivu Social Map Platform — Phase 1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Khởi tạo và xây dựng nền tảng vững chắc cho dự án VIVU theo đúng cấu trúc `Project_Structure.md`, đặc tả `SRS.md`, quy tắc `Coding_Rules.md` và thiết kế `DESIGN.md`: bao gồm Frontend React Vite hoàn chỉnh (kết hợp các màn hình tinh hoa từ Stitch) và Backend core API/WebSocket cho tọa độ giọt nước.

**Architecture:** 
- **Frontend (`frontend/`):** React 18 SPA với Vite, cấu trúc chuẩn hóa theo `Project_Structure.md` (`components/`, `pages/`, `store/`, `hooks/`, `services/`, `styles/`). Giao diện áp dụng phong cách Stitch Design với Tailwind CSS + Material Symbols, hỗ trợ chế độ bản đồ tương tác, giọt nước đại diện (Water Drop), bảng emoji phản hồi trực tiếp, và các màn hình phụ (Chat, Profile, Auth).
- **Backend (`backend/`):** Kiến trúc module hóa (NestJS / Node.js Express + Socket.io), quản lý xác thực JWT, danh mục người dùng, tọa độ GPS thời gian thực (geofence distance calculation theo công thức Haversine), và Socket gateway cho giọt nước trực tuyến.
- **Quy tắc phát triển:** Tuân thủ `Coding_Rules.md` — Mỗi chức năng đều có unit test tự động (Vitest / Jest), kiểm tra pass 100% trước khi đánh dấu hoàn thành và cập nhật `Progress.md`.

**Tech Stack:** React 18, Vite, Tailwind CSS, Zustand, Vitest, Testing Library, Socket.io, Node.js / NestJS.

---

### Task 1: Khởi tạo cấu trúc Frontend & Cấu hình môi trường

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/test-setup.js`
- Create: `frontend/src/styles/globals.css`

- [ ] **Step 1: Tạo package.json với React, Tailwind, Vitest và scripts chuẩn**
- [ ] **Step 2: Tạo vite.config.js hỗ trợ React và môi trường jsdom cho Vitest**
- [ ] **Step 3: Tạo index.html tích hợp Tailwind CDN với Stitch theme tokens và Google Fonts**
- [ ] **Step 4: Chạy `npm install` và kiểm tra cấu trúc**

---

### Task 2: Service dữ liệu & State Store (Map & Social Presence)

**Files:**
- Create: `frontend/src/services/mockData.js`
- Create: `frontend/src/store/mapStore.js`
- Create: `frontend/src/store/mapStore.test.js`

- [ ] **Step 1: Viết test cho mapStore (quản lý chọn giọt nước, chuyển tab, bắn hạt emoji, bật/tắt radar)**
- [ ] **Step 2: Viết mockData.js với dữ liệu người dùng Việt Nam thực tế, tọa độ GPS Hà Nội / TP.HCM**
- [ ] **Step 3: Cài đặt mapStore.js với Zustand / React State**
- [ ] **Step 4: Chạy test để đảm bảo 100% pass**

---

### Task 3: Linh hồn giao diện: Water Drop Marker & Radar Canvas

**Files:**
- Create: `frontend/src/components/map/WaterDropMarker.jsx`
- Create: `frontend/src/components/map/WaterDropMarker.test.jsx`
- Create: `frontend/src/pages/Map/MainMap.jsx`

- [ ] **Step 1: Viết test cho WaterDropMarker (hiển thị avatar, tên, cự ly, click handler)**
- [ ] **Step 2: Cài đặt WaterDropMarker chuẩn Stitch (dáng teardrop, hiệu ứng lơ lửng, vòng sóng radar)**
- [ ] **Step 3: Cài đặt MainMap kết hợp tương tác kéo thả bản đồ, bộ lọc bán kính, danh sách 18 bạn vi vu**
- [ ] **Step 4: Chạy test xác nhận thành công**

---

### Task 4: Quick Action Sheet & Full Emoji Reaction Strip

**Files:**
- Create: `frontend/src/components/map/QuickActionSheet.jsx`
- Create: `frontend/src/components/map/QuickActionSheet.test.jsx`

- [ ] **Step 1: Viết test cho QuickActionSheet (thao tác 2x2, dải emoji phản hồi, nút vẫy tay chào)**
- [ ] **Step 2: Cài đặt QuickActionSheet theo thiết kế màn hình Stitch (Linh Đan 22 tuổi, 94% hợp, emoji bay lơ lửng)**
- [ ] **Step 3: Chạy test xác nhận thành công**

---

### Task 5: Các màn hình chức năng & Thanh điều hướng Bottom Bar

**Files:**
- Create: `frontend/src/components/common/BottomNavBar.jsx`
- Create: `frontend/src/pages/Chat/ChatPage.jsx`
- Create: `frontend/src/pages/Profile/ProfilePage.jsx`
- Create: `frontend/src/pages/Auth/AuthPage.jsx`
- Create: `frontend/src/pages/Notifications/NotificationsPage.jsx`
- Create: `frontend/src/App.jsx`
- Create: `frontend/src/main.jsx`

- [ ] **Step 1: Cài đặt BottomNavBar chuẩn Stitch (Khám phá, Tin nhắn, Thông báo, Cá nhân)**
- [ ] **Step 2: Cài đặt ChatPage (tin nhắn realtime + banner khảo sát an toàn)**
- [ ] **Step 3: Cài đặt ProfilePage (hồ sơ Đức Tùng, mã PIN bảo mật, ranh giới Safe Zone)**
- [ ] **Step 4: Cài đặt AuthPage (đăng nhập / đăng ký với nền giọt nước phát sáng)**
- [ ] **Step 5: Tích hợp tất cả vào App.jsx và main.jsx**

---

### Task 6: Kiểm thử toàn diện & Khởi động dự án

- [ ] **Step 1: Chạy toàn bộ test suite (`npm test`) đảm bảo không có lỗi**
- [ ] **Step 2: Khởi động Vite dev server (`npm run dev`)**
- [ ] **Step 3: Kiểm tra HTTP status 200 OK và cập nhật Progress.md**
