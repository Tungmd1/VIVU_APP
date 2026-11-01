# 📊 Đặc Tả Sơ Đồ Hệ Thống (Diagrams Spec) — Dự Án VIVU V2.0

---

## 1. SYSTEM ARCHITECTURE DIAGRAM (KIẾN TRÚC TỔNG THỂ FULLSTACK)

```mermaid
graph TB
    subgraph CLIENT["📱 CLIENT WEB APP (React 18 + Vite)"]
        UI["UI Layer: Resend Dark Monochrome & Cyber-Solar Hologram\n(Dynamic Island, 100% Bootstrap Icons, Action Sheets)"]
        MAP_ENG["Map Engine: Mapbox GL JS 3D\n(Navigation Day Style, Teardrop Pins, Radar Circle, Polyline)"]
        GPS["GPS Module: Multi-Tier Location Engine\n(HTML5 GPS -> IP Geolocation -> Cache Storage)"]
        SENSOR["Sensor Engine: DeviceMotion Accelerometer\n(Shake-to-Bump Detection > 18 m/s²)"]
        SOCKET_CLIENT["Socket.IO Client\n(Realtime GPS, Chat, Groups, Bump Events)"]
    end

    subgraph PROXY_TUNNEL["🌐 REVERSE PROXY & TUNNELING"]
        VITE_PROXY["Vite Server Proxy (/api)\n(Allowed Hosts: true, LAN & Cloud Auto-Routing)"]
        CF_TUNNEL["Cloudflare Tunnel (cloudflared)\n(Public HTTPS Domain Sync via /api/tunnel)"]
    end

    subgraph BACKEND["⚡ BACKEND API SERVER (Node.js + Express + Socket.IO)"]
        EXPRESS["Express Router (/api/*)\n(Auth, Circles, Friends, Stories, Chat, Notifications)"]
        SOCKET_SRV["Socket.IO Engine (Port 5000)\n(Rooms, Peer Broadcast, Spatial Proximity Matching)"]
        SANITIZER["DB Sanitizer & Expiry Guard\n(Cleans Guest IDs client-xxx, Expire Stories > 3h)"]
    end

    subgraph DATA_STORAGE["🗄️ DUAL-MODE DATA STORAGE"]
        LOCAL_DB["Persistent Local JSON DB Engine\n(backend/data/vivu_database.json, Atomic Write)"]
        CLOUD_DB["Supabase Cloud (PostgreSQL 15 + PostGIS)\n(Spatial Tables, GIST Index, Row Level Security)"]
    end

    subgraph EXTERNAL["🔌 EXTERNAL SERVICES & AI ENGINE"]
        MAPBOX_API["Mapbox Directions & Vector Tiles API"]
        STITCH_MCP["Google Stitch AI MCP Server\n(Design System & Screen Generator via MCP Protocol)"]
    end

    GPS --> UI
    SENSOR --> UI
    UI --> MAP_ENG
    UI --> SOCKET_CLIENT
    
    UI -->|API Requests| VITE_PROXY
    VITE_PROXY --> EXPRESS
    CF_TUNNEL --> EXPRESS
    SOCKET_CLIENT <==>|WebSocket Realtime| SOCKET_SRV
    
    EXPRESS --> SANITIZER
    SOCKET_SRV --> SANITIZER
    SANITIZER --> LOCAL_DB
    EXPRESS -.->|Optional Cloud| CLOUD_DB
    
    MAP_ENG -->|Vector Tiles & Routes| MAPBOX_API
    UI -.->|MCP Integration| STITCH_MCP
```

---

## 2. SEQUENCE DIAGRAMS (LUỒNG NGHIỆP VỤ CỐT LÕI)

### 2.1 Luồng Định Vị Không Gian Đa Tầng & Khởi Động Bản Đồ (Multi-Tier Location Engine)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant App as Web App (Frontend)
    participant GPS as HTML5 Geolocation API
    participant IP_GEO as IP Geolocation Fallback
    participant Map as Mapbox GL JS 3D Canvas
    participant Backend as Node.js Express Server
    participant Socket as Socket.IO Realtime

    User->>App: Mở ứng dụng VIVU
    App->>App: Cấp phát tạm thời currentUserId & currentUserCode (VU-XXXX)
    App->>GPS: Yêu cầu định vị GPS thiết bị (enableHighAccuracy: true)
    
    alt GPS Thành công
        GPS-->>App: Trả về tọa độ chính xác [Lat, Lng]
    else GPS Bị chặn / Lỗi phần cứng
        App->>IP_GEO: Gọi IP Geolocation API
        IP_GEO-->>App: Trả về tọa độ Tỉnh/Thành phố
    end

    App->>App: Lưu cache vào localStorage ('vivu_user_real_location')
    App->>Map: map.flyTo(center: [Lng, Lat], zoom: 16.2, pitch: 35)
    App->>Map: Cắm ghim giọt nước "BẠN" tại tâm mặt đường (anchor: 'bottom')
    
    App->>Socket: emit('gps:update', { lat, lng, name, avatar, userCode })
    Socket-->>Backend: Lưu tọa độ vào DB & Broadcast 'gps:peer-update'
    Backend-->>App: Nhận danh sách bạn bè & Story beacons lân cận
    App->>Map: Cắm ghim phân tán hướng tròn (Radial Offset) cho các bạn bè kề bên
```

---

### 2.2 Luồng Tạo Nhóm & Quản Lý Thành Viên Trực Tiếp (Custom Circles 2-Tier)

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Người tạo nhóm (Admin)
    actor Member as Bạn bè (Thành viên)
    participant UI as Giao diện VIVU
    participant API as Express API (/api/circles)
    participant DB as Persistent DB Engine
    participant Socket as Socket.IO Engine
    participant Map as Mapbox 3D Canvas

    Owner->>UI: Bấm Tab "Nhóm" -> Chọn "+ Tạo nhóm mới"
    UI->>Owner: Mở CreateCircleModal (Tên, Mô tả, Icon, Chọn bạn bè từ danh sách)
    Owner->>UI: Nhập tên "Team Phượt Đà Lạt", tick chọn 2 người bạn và bấm "Tạo Nhóm"
    
    UI->>API: POST /api/circles { name, description, privacy: 'private', owner_id, initial_members }
    API->>DB: Lưu nhóm mới: Owner gán role 'owner', bạn bè gán role 'member', status 'accepted'
    API->>Socket: emit('circle:created', newCircle) & Gửi thông báo đến Member
    API-->>UI: Trả về dữ liệu nhóm thành công
    
    UI->>Map: Điều hướng sang view nhóm (viewMode = circleId)
    UI->>Map: Lọc đúng N giọt nước thành viên nhóm trên Mapbox
    UI->>Map: Kích hoạt map.fitBounds bao trọn vị trí không gian của nhóm (zoom >= 15.0)
    
    Member->>UI: Nhận thông báo "Bạn đã được thêm vào nhóm Team Phượt Đà Lạt"
    Member->>UI: Chạm thông báo -> Vào thẳng khung Chat nhóm và xem vị trí các thành viên
```

---

### 2.3 Luồng Chạm Điện Thoại Kết Bạn Siêu Tốc (Spatial Shake-to-Bump 3D)

```mermaid
sequenceDiagram
    autonumber
    actor UserA as Người dùng A
    actor UserB as Người dùng B (Cự ly < 15m)
    participant SensorA as Cảm biến A (devicemotion)
    participant SensorB as Cảm biến B (devicemotion)
    participant Socket as Socket.IO Proximity Engine
    participant DB as Persistent DB Engine

    Note over UserA, UserB: Hai người đứng đối diện nhau (< 15 mét) và cụng điện thoại
    UserA->>SensorA: Lắc điện thoại
    SensorA->>UserA: Phát hiện gia tốc cực đại > 18 m/s²
    UserA->>Socket: emit('spatial:bump-candidate', { userId: 'A', lat, lng, time })

    UserB->>SensorB: Lắc điện thoại
    SensorB->>UserB: Phát hiện gia tốc cực đại > 18 m/s²
    UserB->>Socket: emit('spatial:bump-candidate', { userId: 'B', lat, lng, time })

    Socket->>Socket: Kiểm tra điều kiện: |timeA - timeB| < 2.5s AND Haversine(A, B) < 15m
    Socket->>DB: Tự động ghi nhận quan hệ bạn bè (Friendship) giữa A và B
    
    Socket-->>UserA: emit('spatial:bump-matched', { matchedUser: B })
    Socket-->>UserB: emit('spatial:bump-matched', { matchedUser: A })

    par Phản hồi người dùng A
        UserA->>UserA: Kích hoạt rung Haptic + Chuông Pop-Chime + Mở Hologram 3D Modal
    and Phản hồi người dùng B
        UserB->>UserB: Kích hoạt rung Haptic + Chuông Pop-Chime + Mở Hologram 3D Modal
    end
```

---

### 2.4 Luồng Đăng Khoảnh Khắc Story & Tương Tác Bản Đồ (Story Studio Lifecycle)

```mermaid
sequenceDiagram
    autonumber
    actor Host as Người đăng (Host)
    actor Peer as Bạn bè / Người quanh đây
    participant UI as Giao diện VIVU
    participant API as Express API (/api/stories)
    participant DB as Persistent DB Engine
    participant Map as Mapbox GL JS 3D Canvas

    Host->>UI: Bấm nút (+) trên Thanh Dock Đáy
    UI->>Host: Mở Story Studio Modal (Ảnh, Nhạc nền thịnh hành, Meme sticker, Gradient)
    Host->>UI: Chọn ảnh, bài hát yêu thích, hẹn giờ tự hủy (3 tiếng)
    Host->>UI: Bấm "Đăng Story"
    
    UI->>API: POST /api/stories { host_id, title, image, music, meme, lat, lng, expiry_hours: 3 }
    API->>DB: Lưu Story vào database kèm expires_at = NOW() + 3 giờ
    API-->>UI: Trả về Story vừa tạo
    
    UI->>Map: Cắm ghim Giọt nước với nhãn Story nổi bật tại tọa độ GPS
    Peer->>Map: Nhìn thấy ghim Story mới trên bản đồ
    Peer->>Map: Chạm vào ghim -> Mở StoryInteractiveModal
    Peer->>UI: Thả tim/reaction, nghe nhạc nền, hoặc bấm "Nhắn tin" -> Mở chat 1-1 với Host
    
    Note over API, DB: Sau 3 giờ, hệ thống Auto-Expire Engine tự động thanh lọc Story khỏi bản đồ
```

---

## 3. FRONTEND COMPONENT ARCHITECTURE (KIẾN TRÚC PHẦN MỀM GIAO DIỆN)

```mermaid
graph TD
    App[App.jsx - Shell điều phối trạng thái cấp cao]
    
    App --> Header[UnifiedDynamicIsland.jsx\nDynamic Island Glass, Radar Slider 0.5-15km, Notifications, User Code VU-XXXX]
    App --> MapCanvas[MapboxCanvas.jsx\nMapbox GL JS 3D, Teardrop Marker, Ground Ripple, Directions Polyline]
    App --> BottomDock[VivuBottomDock.jsx\n4 Tabs + FAB: Xã Hội, Bạn Bè, (+), Tin Nhắn, Tôi]
    
    App --> StoryStudio[StoryStudioModal.jsx\nĐăng ảnh, Nhạc nền thịnh hành, Meme sticker, Nền gradient]
    App --> StoryInteractive[StoryInteractiveModal.jsx\nXem Story tương tác, Nghe nhạc, Thả tim, Nhắn tin]
    App --> CreateCircle[CreateCircleModal.jsx\nTạo nhóm, Thêm bạn bè trực tiếp, Phân quyền Owner]
    App --> GroupMembers[GroupMembersModal.jsx\nQuản trị viên xóa thành viên / Thêm bạn bè / Xem trên Map]
    App --> BumpModal[SpatialBumpModal3D.jsx\nHiệu ứng Hologram 3D Chạm kết bạn cự ly gần < 15m]
    App --> ChatView[MessengerChatView.jsx\nTin nhắn 1-1 & Nhóm, Bình chọn Poll, Gọi thoại, Audio Chime]
    App --> FriendSheet[FriendDetailSheet.jsx\nChi tiết bạn bè, Pin, Khoảng cách, Chỉ đường Mapbox]
    App --> AuthModal[AuthGateView.jsx\nĐăng nhập / Đăng ký Modal lớp phủ không xâm lấn bản đồ]
```
