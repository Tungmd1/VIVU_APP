# Live Location Sharing Rewrite & Presence Resilience Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the Live Location Sharing experience with an immersive full-screen tracking mode (only Map, 2 Waterdrops, Distance, Speed, and Exit button, hiding all menus/icons) and eliminate false offline detections on stationary mobile devices.

**Architecture:** 
1. Real-time Socket.IO socket stream for instantaneous coordinate updates (`live_location:update`), decoupled from disk-write bottlenecks.
2. Connection-aware presence checking in `dbService` using `isUserSocketConnected(userId)` so connected stationary devices are always online.
3. Remove mobile `pagehide` beacon offline firing in `useSocket.js` and allow periodic location refreshing when stationary in `useGeolocation.js`.
4. Dedicated `LiveLocationTrackingView.jsx` component that takes over the screen, auto-hiding `VivuBottomDock`, `UnifiedDynamicIsland`, and `RightActionStack`, with camera auto-follow/fit-bounds controls and Screen Wake Lock toggle.

**Tech Stack:** React, Leaflet, Tailwind CSS v3, Socket.IO, Screen Wake Lock API, Node.js, Express.

---

## Global Constraints
- Must adhere to Rule 5 (100% Bootstrap Icons), Rule 7 (< 450 lines per module), and Rule 12 (Dark Monochrome design with neon cyan/green accents).
- Windows PowerShell compatibility (no `&&` in shell commands).
- Full backward compatibility with existing chat message schemas and E2E test suites.

---

## Tasks

### Task 1: Backend Presence Hardening & Live Location Socket Relay
**Files:**
- Modify: `backend/src/services/socketService.js`
- Modify: `backend/src/services/dbService.js`
- Test: `backend/tests/live_presence_and_tracking.test.js`

- [ ] Add `isUserSocketConnected(userId)` to `backend/src/services/socketService.js`.
- [ ] Add socket handlers for `live_location:update` relaying live coordinates immediately to recipient/room in `socketService.js`.
- [ ] Update `dbService.js` presence calculations (`lines 53, 326, 780, 1398, 1587, 1740`) to consider active socket connections and increase stationary age threshold.
- [ ] Write unit/integration test in `backend/tests/live_presence_and_tracking.test.js` verifying stationary connected users stay online and live socket messages relay instantaneously.
- [ ] Run test and verify pass.

### Task 2: Frontend Geolocation & Socket Disconnect Resilience
**Files:**
- Modify: `frontend/src/hooks/useSocket.js`
- Modify: `frontend/src/hooks/useGeolocation.js`

- [ ] In `frontend/src/hooks/useSocket.js`, remove `pagehide` listener triggering `handleBeforeUnload` with offline beacon to prevent sleep/dim dimming from marking user offline.
- [ ] Ensure `visibilitychange` reconnects socket and requests fresh presence when waking from sleep.
- [ ] In `frontend/src/hooks/useGeolocation.js`, update distance check (`dist < 8`) so stationary phones still refresh timestamp and emit location state every 3.5s.

### Task 3: Immersive Live Location Tracking Component
**Files:**
- Create: `frontend/src/components/map/LiveLocationTrackingView.jsx`
- Modify: `frontend/src/components/chat/LiveLocationCard.jsx`
- Modify: `frontend/src/components/chat/ChatMessageBubble.jsx`
- Modify: `frontend/src/components/chat/MessengerActiveRoom.jsx`
- Modify: `frontend/src/components/chat/MessengerChatView.jsx`

- [ ] Create `LiveLocationTrackingView.jsx` with full-screen Leaflet map, You Waterdrop (cyan pulse), Target Waterdrop (green pulse), glowing distance connector beam line.
- [ ] Implement Top HUD Pill: Exit button, Target profile & Live badge, and Screen Wake Lock toggle switch (`navigator.wakeLock`).
- [ ] Implement Bottom Stats HUD Card: Large Distance display, Speed display, Camera controls (Follow Target, Fit Bounds, Center Me).
- [ ] Implement "Đối phương đã dừng chia sẻ" notification overlay with last seen coordinates and "Quay lại" button.
- [ ] Wire click on `LiveLocationCard.jsx` to trigger `onOpenLiveTracking(msg)` up through the chat tree.

### Task 4: Application-Level Menu Hiding & State Integration
**Files:**
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/components/map/VivuMapView.jsx`

- [ ] Add `activeLiveTrackingSession` state and handlers in `frontend/src/App.jsx`.
- [ ] Conditionally suppress `VivuBottomDock`, `UnifiedDynamicIsland`, `TopAppLogo`, and `RightActionStack` when `activeLiveTrackingSession` is active.
- [ ] Handle real-time socket events `live_location:update` in `App.jsx` to continuously update target coordinates in `activeLiveTrackingSession`.
- [ ] Wire Exit button to clear `activeLiveTrackingSession` and restore all menus/icons instantly.

### Task 5: End-to-End Verification & Build
- [ ] Build frontend bundle with `cd frontend; npm run build`.
- [ ] Run automated E2E tests: `node tests/e2e/run_all_e2e.js --tier=1`.
- [ ] Verify clean git status and commit changes.
