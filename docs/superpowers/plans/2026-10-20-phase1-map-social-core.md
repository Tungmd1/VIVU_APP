# Phase 1: Map Core & Social Drop (Giọt Nước) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng nền tảng Frontend hoàn chỉnh cho VIVU theo chuẩn Stitch Design System (`DESIGN.md`), tập trung vào tính năng tâm điểm: Bản đồ số tương tác (Map Screen), Giọt nước đại diện (Water Drop Marker với chuyển động cinematic spring + ripple), Popup thao tác nhanh (Quick-action popup với đầy đủ emoji reaction), Thanh điều hướng Bottom Bar chuẩn Stitch, và các màn hình cơ bản (Auth, Profile drawer).

**Architecture:** 
- Frontend SPA với React 18 + Vite, thiết kế giao diện thuần CSS Tokens chuẩn hóa theo [DESIGN.md](file:///c:/Đức Tùng/DACN/vivudemo1/DESIGN.md).
- Kiến trúc module hóa cao: Design System (`tokens.css`, `base.css`) -> Atom Components (`WaterDropMarker`, `Button`, `Input`) -> Molecules (`QuickActionPopup`, `EmojiPicker`, `BottomNav`) -> Organisms & Pages (`MapPage`, `AuthModal`, `ProfileSheet`).
- Mock state & real-time simulation engine để test toàn diện cả tương tác marker, thả cảm xúc đa dạng, di chuyển vị trí trên bản đồ, và popup chi tiết người dùng.

**Tech Stack:** React 18, Vite, Vanilla CSS Modules/Custom Properties, Vitest, Testing Library, Lucide React (hoặc SVG custom Stitch), Google Fonts (Be Vietnam Pro, Outfit, JetBrains Mono).

---

### Task 1: Setup HTML, Design Tokens & Global CSS (Stitch Theme)

**Files:**
- Create: `frontend/index.html`
- Create: `frontend/src/styles/tokens.css`
- Create: `frontend/src/styles/index.css`
- Create: `frontend/src/test-setup.js`

- [ ] **Step 1: Create test-setup.js for Vitest**
- [ ] **Step 2: Create tokens.css containing the exact colors, typography and spring variables from DESIGN.md**
- [ ] **Step 3: Create index.css with reset, utility classes, and typography configurations**
- [ ] **Step 4: Create index.html with Be Vietnam Pro, Outfit, JetBrains Mono font imports and root div**

---

### Task 2: Mock Data & Store Engine for Map & Users

**Files:**
- Create: `frontend/src/services/mockData.js`
- Create: `frontend/src/store/mapStore.js`
- Test: `frontend/src/store/mapStore.test.js`

- [ ] **Step 1: Write test for mapStore state updates (selecting user, sending emoji reaction, updating filter)**
- [ ] **Step 2: Implement mockData.js with rich Vietnamese user profiles and GPS coordinates in Hanoi & HCMC**
- [ ] **Step 3: Implement mapStore.js with custom Hook / lightweight reactive store**
- [ ] **Step 4: Run test to verify mapStore operations pass**

---

### Task 3: WaterDropMarker Component (Giọt Nước Đại Diện)

**Files:**
- Create: `frontend/src/components/map/WaterDropMarker.jsx`
- Create: `frontend/src/components/map/WaterDropMarker.css`
- Test: `frontend/src/components/map/WaterDropMarker.test.jsx`

- [ ] **Step 1: Write unit test for WaterDropMarker (renders avatar, online pulse, click handler, size variance)**
- [ ] **Step 2: Implement WaterDropMarker with SVG teardrop geometry, avatar mask, perpetual float animation, and Sky Pulse ripple**
- [ ] **Step 3: Verify component renders correctly and animations follow DESIGN.md timing (2.4s float loop)**

---

### Task 4: QuickActionPopup & Full Emoji Reaction Strip

**Files:**
- Create: `frontend/src/components/map/QuickActionPopup.jsx`
- Create: `frontend/src/components/map/QuickActionPopup.css`
- Test: `frontend/src/components/map/QuickActionPopup.test.jsx`

- [ ] **Step 1: Write test for QuickActionPopup (action triggers, emoji reaction selection, dismiss on click outside)**
- [ ] **Step 2: Implement QuickActionPopup with 2x2 grid (Nhắn tin, Xem hồ sơ, Thả cảm xúc, Mời hẹn) and floating emoji bar**
- [ ] **Step 3: Implement reaction bubble burst animation when an emoji is sent**

---

### Task 5: Bottom Navigation Bar & Top Map Header

**Files:**
- Create: `frontend/src/components/common/BottomNav.jsx`
- Create: `frontend/src/components/common/BottomNav.css`
- Create: `frontend/src/components/common/Header.jsx`
- Create: `frontend/src/components/common/Header.css`
- Test: `frontend/src/components/common/BottomNav.test.jsx`

- [ ] **Step 1: Write test for BottomNav tab switching**
- [ ] **Step 2: Implement BottomNav floating pill with 5 tabs (Bản đồ, Tin nhắn, Ghép đôi, Lịch hẹn, Cá nhân)**
- [ ] **Step 3: Implement Header with search bar, distance filter radius badge, and safety status badge**

---

### Task 6: Interactive Map Screen Integration (MapPage)

**Files:**
- Create: `frontend/src/pages/Map/MapPage.jsx`
- Create: `frontend/src/pages/Map/MapPage.css`
- Create: `frontend/src/pages/Auth/AuthModal.jsx`
- Create: `frontend/src/pages/Auth/AuthModal.css`
- Create: `frontend/src/pages/Profile/ProfileDrawer.jsx`
- Create: `frontend/src/pages/Profile/ProfileDrawer.css`
- Create: `frontend/src/App.jsx`
- Create: `frontend/src/main.jsx`

- [ ] **Step 1: Implement MapPage combining radar grid, interactive panning, WaterDropMarkers, QuickActionPopup, and live reaction particle overlay**
- [ ] **Step 2: Implement AuthModal with glassmorphism, login/register tabs, and Google/FB OAuth buttons**
- [ ] **Step 3: Implement ProfileDrawer showing full user profile, bio, hobbies, and safe zone configuration**
- [ ] **Step 4: Assemble everything into App.jsx with tab switching and modal controls**
