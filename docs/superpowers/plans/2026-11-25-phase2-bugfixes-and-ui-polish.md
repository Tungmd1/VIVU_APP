# VIVU Phase 2 Bugfixes & UI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate all 9 concrete bugs uncovered by live headless Edge CDP testing and static/CSS audit across Chat Live Location, Tailwind v3 compiled styles, Call UI & 2-way WebRTC video, Story-to-Profile navigation, Circle pending confirmation UX, and Saved Places in-app map routing.

**Architecture:** Fix root-cause prop/socket wiring between `App.jsx`, `MessengerChatView.jsx`, `MessengerActiveRoom.jsx`, and `chatController.js`; replace Tailwind v4-only utilities with Tailwind `3.4.17`-compatible arbitrary classes verified against `frontend/dist/assets/tailwind.css`; restructure `MessengerActiveCallModal.jsx` to a non-overlapping 3-tier flex layout with 50/50 split toggle and muted video element for reliable mobile autoplay; close upstream modals on deep-link navigation; and debounce/distance-gate OSRM re-routing in `VivuMapView.jsx`.

**Tech Stack:** React 19 + Vite + `scripts/build-frontend.js` (Tailwind CSS `3.4.17` + `esbuild-wasm`), Node.js Express + Socket.IO, Leaflet, WebRTC, Bootstrap Icons.

**Spec:** User requirements & live audit findings from `c:\Đức Tùng\DACN\vivudemo1`.

## Global Constraints

- **Zero External Maps:** Zero links or redirects to `maps.google.com`, `google.com/maps`, or `openstreetmap.org/directions`.
- **100% Bootstrap Icons:** Use `bi bi-*` classes only; zero raw UI emojis.
- **Tailwind CSS v3.4.17 Compatibility:** Every spacing, color, gradient, and `z-[...]` class used in JSX MUST compile into `frontend/dist/assets/tailwind.css` via `scripts/build-frontend.js` (no uncompiled `w-13`, `w-18`, `top-18`, `bg-radial`, or `z-65`).
- **Component Size:** Every modified JSX component MUST stay `< 450` lines (`MessengerActiveCallModal.jsx` `< 360` lines).
- **Vietnamese UI Copy:** All user-facing labels, buttons, empty states, and toasts in Vietnamese.

## Review Focus

- **Opening Chat Room With Live/Static Location Message:** `MessengerActiveRoom` renders `ChatMessageBubble` and `LiveLocationCard` without throwing `ReferenceError`, and clicking "Dừng Chia Sẻ Vị Trí" updates both sender and receiver UI in real time.
- **Receiving Live Location While Sender Moves:** When Peer A moves while Peer B has chat open or navigates to Peer A, incoming `chat:message` and `chat:live_location_update` preserve `speed`, `lat`, `lng`, `isLiveLocation`, and `NavigationBanner` shows the target sender's live speed rather than the viewer's stationary `0 km/h`.
- **Story -> Profile -> "Chỉ đường" Deep Link:** Clicking "Chỉ đường" inside `UserProfileViewModal` when opened from `StoryViewerModal` closes both modals cleanly and reveals the live map + `NavigationBanner` instead of trapping the user under `StoryViewerModal`.
- **Pending Circle Validation & Notification Tap:** Clicking the body of a `pending` `group_invite` notification does NOT navigate into an inactive chat room; server `400` validation errors on `POST /api/circles` are surfaced cleanly rather than masked as fake offline `pending_confirmation` circles.
- **Mobile 390x844 Call Overlay & Production CSS:** In compiled `frontend/dist/assets/tailwind.css`, active call buttons, incoming call Accept/Reject buttons, and `NavigationBanner` keep exact pixel dimensions and non-overlapping geometry on `390x844`, and `remoteVideo` plays without browser unmuted-autoplay blocking.

---

### Task 1: Fix Chat Room Crash (`onStopLiveLocation`), Real-Time Live Location & Speed Sync

**Files:**
- Modify: `backend/src/controllers/chatController.js:72-133`
- Modify: `frontend/src/App.jsx:1281-1472, 1833-1850, 3416-3512, 4575-4667`
- Modify: `frontend/src/components/chat/MessengerChatView.jsx:36-54, 194-221`
- Modify: `frontend/src/components/chat/MessengerActiveRoom.jsx:21-48, 163-190, 221-235`
- Modify: `frontend/src/components/chat/LiveLocationCard.jsx:122-141`
- Modify: `frontend/src/components/chat/ChatMessageBubble.jsx:190-210`
- Test: `backend/tests/location_and_inbox_permissions.test.js`

**Interfaces:**
- Consumes: `apiClient.stopLiveLocation(messageId, userId)`, `apiClient.updateGps(..., accuracy, timestamp, speed)`, socket events `chat:live_location_update`, `chat:live_location_stopped`
- Produces: `handleStopLiveLocation(messageId: string) => Promise<void>`, `onStartNavigation({ realLat, realLng, lat, lng, name, targetUserId, speed })`

- [x] **Step 1: Write failing backend test for group `chat:message` broadcast and `stopLiveLocation` socket notification**

Add test assertions in `backend/tests/location_and_inbox_permissions.test.js` verifying:
1) `chatController.stopLiveLocation` emits `chat:live_location_stopped` to conversation peer(s).
2) `chatController.sendMessage` for `circle-...` emits `chat:message` to accepted `circle.member_ids` except sender.
3) Sending a live location message with `speed: 22.5` preserves `speed`, `is_live_location`, `live_expires_at` in `getMessages()`.

- [x] **Step 2: Run backend test to confirm failure**

Run: `cmd /c "cd backend && node --test tests/location_and_inbox_permissions.test.js"`
Expected: FAIL because `stopLiveLocation` and group `sendMessage` do not emit socket events.

- [x] **Step 3: Implement backend socket emits in `backend/src/controllers/chatController.js`**

Update `sendMessage` (around line 73) to emit `chat:message` to other `circle.member_ids` when `targetConvId.startsWith('circle-')`. Update `stopLiveLocation` (around line 124) to emit `chat:live_location_stopped` (`{ messageId: updatedMsg.id, conversationId: updatedMsg.conversation_id, live_status: 'stopped', stopped_at: updatedMsg.stopped_at }`) to peer/group members.

- [x] **Step 4: Fix frontend crash and wire end-to-end live location + speed in Chat & `App.jsx`**

1. In `MessengerActiveRoom.jsx`: accept `onStopLiveLocation` prop and `userSpeed` prop; define local fallback `handleStopShare = async (msgId) => { if (onStopLiveLocation) return onStopLiveLocation(msgId); await apiClient.stopLiveLocation(msgId, currentUserId); }`; pass `onStopShare={handleStopShare}` at line 231 instead of undefined `onStopLiveLocation`. In `handleStartLiveLocation`, attach `speed: Number(userSpeed || 0)`.
2. In `MessengerChatView.jsx`: accept and forward `onStopLiveLocation` and `userSpeed` to `MessengerActiveRoom`.
3. In `App.jsx`:
   - Pass `location?.speed` as the 17th argument (`speed`) to `apiClient.updateGps(...)` in `syncHeartbeat` (`line 1833`) AND add an immediate throttled effect on `[location?.lat, location?.lng, location?.speed]` when `location?.speed != null`.
   - In `handleSendMessage` (`line 3416`): accept and preserve `speed`, `liveExpiresAt`/`live_expires_at` in both `newMsg` and `apiClient.sendMessage({...})`.
   - In `handleChatMessage` (`line 1281`): preserve `sender_id: msg.sender`, `isLocation`, `is_location`, `isLiveLocation`, `is_live_location`, `live_status`, `live_expires_at`, `speed`.
   - Add `handleLiveLocationUpdate` (`chat:live_location_update`) and `handleLiveLocationStopped` (`chat:live_location_stopped`) listeners on `socket`, updating matching message coordinates/speed/status inside `conversations` AND updating `navTarget` if currently navigating to `msg.sender` / `targetUserId`.
   - Add `handleStopLiveLocation(messageId)` updating local `conversations` (`live_status: 'stopped'`) and calling `apiClient.stopLiveLocation(messageId, currentUserId)`. Pass to `MessengerChatView`.
4. In `LiveLocationCard.jsx` & `ChatMessageBubble.jsx`: pass `targetUserId: msg.sender_id || (isMe ? currentUserId : activeConversation?.friendId)` and `speed: msg.speed` to `onStartNavigation`.

- [x] **Step 5: Run backend test & headless Edge CDP test on Chat Room**

Run: `cmd /c "cd backend && npm test"` and verify opening chat conversation in Edge CDP yields `recoveryScreenShown: false` and `consoleErrors: []`.
Expected: PASS 100%.

---

### Task 2: Fix Tailwind v3 Compiled CSS Utilities (`w-13`, `w-18`, `top-18`, `bg-radial`)

**Files:**
- Modify: `frontend/src/components/call/MessengerActiveCallModal.jsx:92, 236, 250, 264`
- Modify: `frontend/src/components/call/MessengerIncomingCallModal.jsx:63, 75`
- Modify: `frontend/src/components/map/NavigationBanner.jsx:47`
- Modify: `frontend/src/components/map/mapMarkerHelpers.js:275`
- Modify: `frontend/src/components/chat/VivuStickerKeyboard.jsx:99`
- Test: `scripts/build-frontend.js` & CSS selector audit

**Interfaces:**
- Produces: Valid Tailwind CSS `3.4.17` arbitrary rules in `frontend/dist/assets/tailwind.css`

- [x] **Step 1: Replace Tailwind v4-only classes with v3.4.17 arbitrary utilities**

1. `MessengerActiveCallModal.jsx`: `w-13 h-13` -> `w-[52px] h-[52px]`; `bg-radial` -> `bg-gradient-to-b`.
2. `MessengerIncomingCallModal.jsx`: `w-18 h-18` -> `w-[72px] h-[72px]`.
3. `NavigationBanner.jsx`: `top-18` -> `top-[68px] sm:top-[76px]`.
4. `mapMarkerHelpers.js` & `VivuStickerKeyboard.jsx`: `w-13 h-13` -> `w-[52px] h-[52px]`, `sm:w-18 sm:h-18` -> `sm:w-[72px] sm:h-[72px]`.

- [x] **Step 2: Build frontend and assert CSS selectors exist in `frontend/dist/assets/tailwind.css`**

Run: `cmd /c "cd frontend && npm run build"` then `node -e "const fs=require('fs'); const css=fs.readFileSync('frontend/dist/assets/tailwind.css','utf8'); for(const k of ['w-\\[52px\\]','w-\\[72px\\]','top-\\[68px\\]','z-\\[90\\]']) console.log(k, new RegExp(k).test(css));"`
Expected: Every key logs `true`.

---

### Task 3: Upgrade Call UI Layout (Zero Overlap + Split View) & Reliable 2-Way Video Autoplay

**Files:**
- Modify: `frontend/src/components/call/MessengerActiveCallModal.jsx:1-285` (keep `< 360` lines)
- Modify: `frontend/src/services/webrtcManager.js:65-105, 187-220`

**Interfaces:**
- Consumes: `localStream: MediaStream | null`, `remoteStream: MediaStream | null`, `remoteMediaState: { isMuted: boolean, isVideoOff: boolean }`
- Produces: Non-overlapping 3-tier layout + `isDualSplit` 50/50 mode + persistent multi-track `MediaStream` emission

- [x] **Step 1: Upgrade `webrtcManager.js` multi-track `MediaStream` persistence & `switchCamera()` state refresh**

1. Maintain `this.remoteRawStream = new MediaStream()` per `PeerConnection`; inside `ontrack`, replace any stale track of the same `kind` or add the new `event.track` into `this.remoteRawStream`, then pass `new MediaStream(this.remoteRawStream.getTracks())` to `onRemoteStream` so audio and video arriving asynchronously in separate streams never clobber one another.
2. In `switchCamera()`, return `new MediaStream(this.localStream.getTracks())` so `useWebRTCCall` triggers React `<video>` re-attachment.

- [x] **Step 2: Restructure `MessengerActiveCallModal.jsx` to 3-tier flex layout + Split View + muted remote `<video>`**

1. Add `muted` attribute to `<video ref={remoteVideoRef}>` (audio continues playing via `<audio ref={remoteAudioRef} autoPlay playsInline>`), preventing browser unmuted `<video>` autoplay blocking and audio echo.
2. Replace floating `top-20` PIP + overlapping trays with 3-tier layout (`TopHeader shrink-0` -> `StageArea flex-1 min-h-0 relative` -> `BottomControls shrink-0`):
   - Include a **"Chia đôi"** (`bi-layout-split`) toggle button in `TopHeader` to switch between PIP overlay (anchored cleanly inside `StageArea` corners `top-3 right-3` or bottom-right, never colliding with TopBar or BottomDock) and equal 50/50 stacked/side-by-side 2-way video tiles (`grid-cols-1 sm:grid-cols-2 grid-rows-2 sm:grid-rows-1`).
   - Show explicit mute/camera-off badge for remote peer from `remoteMediaState`.

- [x] **Step 3: Build & test in headless Edge CDP (`--use-fake-device-for-media-stream`)**

Verify `backend` WebRTC tests pass (`cmd /c "cd backend && npm test"`) and inspect `MessengerActiveCallModal.jsx` line count `< 360` + zero geometry overlaps at `390x844` and `1280x800`.

---

### Task 4: Fix Story -> Profile Loading State, Fresh Action Props, and Modal Trap on "Chỉ đường"

**Files:**
- Modify: `frontend/src/components/profile/UserProfileViewModal.jsx:31-115, 245-315`
- Modify: `frontend/src/App.jsx:4180-4230`

**Interfaces:**
- Consumes: `apiClient.getUserProfile(targetUserId, currentUserId)`
- Produces: Unified `startNavigation(target)` closing Story/Profile/Places modals cleanly

- [x] **Step 1: Fix `UserProfileViewModal.jsx` loading state & pass `effectiveProfile`**

1. Track `isLoadingProfile` while `apiClient.getUserProfile` is in-flight (`targetUserId && !fetchedData`); display clean subtle placeholder instead of flashing `'Ngoại tuyến'` / `'Thành viên VIVU'` mockups before data arrives.
2. Check `effectiveProfile.author_is_online` in `isProfileOnline`.
3. Update `activeStory` check (line 107) to include `(effectiveProfile.image || effectiveProfile.dual_image || effectiveProfile.mediaUrl)`.
4. Pass `effectiveProfile` (instead of stale `profile` prop) to `onDirectChat`, `onToggleFriend`, and `onStartNavigation`.

- [x] **Step 2: Create unified `handleStartNavigation(target)` helper in `App.jsx`**

1. Close ALL blocking overlays: `setSelectedInteractiveStory(null)`, `setSelectedInteractiveStoryList([])`, `setSelectedUserProfile(null)`, `setSelectedGuestProfile(null)`, `setSelectedFriend(null)`, `setIsSavedPlacesOpen(false)`, `setActiveConversationId(null)`.
2. Resolve `targetUserId = target.targetUserId || target.hostId || target.host_id || target.sender_id || (target.id && !String(target.id).startsWith('story-') ? target.id : null)`. If matched in `nearbyOnlinePeers` or `liveFriends`, merge latest `lat`, `lng`, `speed`, `name` before calling `setNavTarget(...)` and `setIsNavigationActive(true)`.
3. Keep `navTarget` synced automatically in an effect whenever `isNavigationActive` and `navTarget?.targetUserId` receives live `gps:peer-update` / `nearbyOnlinePeers` changes, and pass `targetSpeed` separately from viewer `location?.speed` to `NavigationBanner`.

- [x] **Step 3: Re-run headless Edge CDP Flow 1**

Verify clicking "Chỉ đường" inside `UserProfileViewModal` (opened from `StoryViewerModal`) yields `storyStillTrappingScreen: false` and `navBannerVisible: true`.

---

### Task 5: Polish Pending Circle UX & Server Error Handling

**Files:**
- Modify: `frontend/src/services/apiClient.js:587-617`
- Modify: `frontend/src/components/common/NotificationDrawer.jsx:224-229`
- Modify: `frontend/src/App.jsx:3654-3702`

**Interfaces:**
- Produces: Strict HTTP vs network fallback distinction in `apiClient.createCircle`; safe click handling on `group_invite` notifications

- [x] **Step 1: Fix `apiClient.createCircle` error masking**

Separate HTTP non-OK response (`res.ok === false` -> throw `serverErr` without fallback) from genuine network `fetch` exception so validation failures from `circleController.createCircle` display real error messages inside `CreateCircleModal`.

- [x] **Step 2: Fix `NotificationDrawer.jsx` pending `group_invite` click & `App.jsx` optimistic notification update**

1. In `NotificationDrawer.jsx:224-229`: only call `onOpenConversation(circleId)` and `onClose()` when `notif.status === 'accepted'`; if `notif.status === 'pending'`, keep drawer open so the user taps "Tham gia nhóm" or "Từ chối".
2. In `App.jsx:3654-3702`: inside `handleAcceptGroupInvite` and `handleRejectGroupInvite`, immediately update `notifications` item `status` (`accepted` / `declined`) and `read: true` (and remove rejected pending circle from `customCircles` if present).

---

### Task 6: Polish Saved Places Distance List, Map Navigation Stability & Speed Distinction

**Files:**
- Modify: `frontend/src/components/places/SavedPlacesDrawer.jsx:9-25, 175-192`
- Modify: `frontend/src/components/map/VivuMapView.jsx:605-695`
- Modify: `frontend/src/components/map/NavigationBanner.jsx:1-131`
- Modify: `frontend/src/App.jsx:4040-4065, 4104-4120, 4981-5010`

**Interfaces:**
- Consumes: `calculateHaversineMeters`, `formatExactDistance` from `frontend/src/utils/mapNavigationUtils.js`

- [x] **Step 1: Show exact distance per card in `SavedPlacesDrawer.jsx` & interactive popup on map pins**

1. Accept `userLat`, `userLng` props in `SavedPlacesDrawer.jsx` and pass them from `App.jsx:4981`. Render distance badge (`formatExactDistance`) on each saved place row.
2. In `VivuMapView.jsx:615`, bind click handler / Leaflet popup to each saved place pin showing name + distance + a button calling `onStartNavigation?.(place)` inside the VIVU map.

- [x] **Step 2: Gate OSRM re-fetch & initial `fitBounds` in `VivuMapView.jsx` and refine `NavigationBanner.jsx`**

1. In `VivuMapView.jsx`: track `lastNavRouteKeyRef` (`${navTargetId}:${navTravelMode}`) and `lastFetchedEndpointsRef` (`startLat, startLng, endLat, endLng`). Only auto-`fitBounds` when route key changes (`!alreadyFitted`), and only re-fetch OSRM when endpoints moved `> 25m`.
2. In `App.jsx:4043`: hide `coLocatedPeer` banner when `isNavigationActive` is true so it does not visually stack behind `NavigationBanner`.
3. In `NavigationBanner.jsx`: distinguish `Tốc độ người gửi` (`navTarget.targetUserId` / `navTarget.speed != null`) vs `Tốc độ của bạn` (`userSpeed`) so navigating to a stationary saved place vs a moving chat user displays clear, accurate speed semantics.

- [x] **Step 3: Full Verification Pass (Backend + Build + CSS Selector Check + E2E + Live Edge CDP)**

Run:
1. `cmd /c "cd backend && npm test"` -> Expected: 159+/159+ PASS.
2. `cmd /c "cd frontend && npm run build"` -> Expected: 0 errors + CSS selectors `w-[52px]`, `w-[72px]`, `top-[68px]`, `z-[90]` verified present.
3. `cmd /c "node tests/e2e/run_all_e2e.js --tier=all"` -> Expected: 22/22 PASS.
4. `node C:\Users\DELL\.gemini\antigravity\brain\c15b84d6-898b-4227-b6bf-c449e41b7dbd\scratch\live_cdp_full_audit.mjs` (plus chat live location & dual-user verification) -> Expected: 0 runtime crashes (`recoveryScreenShown: false`), `storyStillTrappingScreen: false`, `overlapsDynamicIsland: false`, `hasRouteSvg: true`, `hasExternalMapLink: false`.

---

## Plan Self-Review

- **Spec coverage:** Every single bug found in our audit (1: `onStopLiveLocation` crash + live socket fields; 2: Tailwind v3 missing classes; 3: Call layout overlap + muted video autoplay + `switchCamera` MediaStream ref + multi-track `ontrack`; 4: `StoryViewerModal` trap + `effectiveProfile` + loading state; 5: `NotificationDrawer` pending `group_invite` click + `apiClient` error masking + `group` socket chat; 6: `VivuMapView` `fitBounds`/OSRM throttle + `SavedPlacesDrawer` distance + `NavigationBanner` speed label) maps 1:1 to Tasks 1–6.
- **Type & Interface consistency:** `targetUserId`, `onStopLiveLocation`, `userSpeed`, `formatExactDistance`, `MapNavigationLayerManager`, and `chat:live_location_update` / `chat:live_location_stopped` match across all tasks.

---

**Plan complete and saved to [2026-11-25-phase2-bugfixes-and-ui-polish.md](file:///c:/%C4%90%E1%BB%A9c%20T%C3%B9ng/DACN/vivudemo1/docs/superpowers/plans/2026-11-25-phase2-bugfixes-and-ui-polish.md). Please review the plan. Which execution approach would you prefer?**

- **Subagent-driven** - A fresh subagent implements each task and a fresh reviewer checks it before the next one starts, then a whole-branch review at the end. Most thorough; costs a fresh context per task and per review.
- **Native** - I implement every task myself in this session, the way this harness runs work, then one fresh reviewer on the most capable model checks the whole branch. Cheapest and fastest; no independent review until the end.

For this plan I recommend **Native**, because Tasks 1, 4, 5, and 6 touch shared state and Socket.IO handlers inside `frontend/src/App.jsx` where sequential same-file edits avoid merge conflicts and keep feedback tight. Does the plan capture what you want, and which approach should we use?
