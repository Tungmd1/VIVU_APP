# 🗂️ Cấu Trúc Dự Án — VIVU Web App V2.0

---

## 1. TỔNG QUAN KIẾN TRÚC TOÀN HỆ THỐNG

Dự án VIVU là nền tảng **Mạng xã hội Không gian Thời gian thực (Spatial Social Network)**, được kiến trúc theo chuẩn fullstack chuyên nghiệp với sự phân định rõ ràng giữa Client, Server, Hạ tầng và Tài liệu đặc tả:

```
vivudemo1/
├── frontend/                           # [CLIENT] Web App SPA (React 18 + Vite + Tailwind)
│   ├── public/                         # Tài nguyên tĩnh (favicon, marker assets)
│   ├── src/
│   │   ├── assets/                     # Hero banners, vector logos
│   │   ├── components/                 # Các module thành phần giao diện
│   │   │   ├── auth/                   # Luồng xác thực, Google/Facebook OAuth, Quên mật khẩu
│   │   │   ├── bump/                   # Va chạm không gian 3D kết bạn (Spatial Shake-to-Bump)
│   │   │   ├── chat/                   # Hộp thư, chat 1-1, chat nhóm, bình chọn poll, gọi thoại
│   │   │   ├── circle/                 # Quản lý nhóm bạn bè tùy chỉnh (Custom Circles 2-Tier)
│   │   │   ├── common/                 # ErrorBoundary, VivuLogo, MobileQrModal, NotificationBell
│   │   │   ├── friends/                # Quản lý bạn bè, tìm kiếm theo mã VU-XXXX, chấp nhận kết bạn
│   │   │   ├── layout/                 # Unified Dynamic Island, BottomDock, User Location Sheet, Friend Detail
│   │   │   ├── map/                    # Mapbox GL JS 3D, Teardrop Pins, Radar, Navigation Banner, Right Action Stack
│   │   │   ├── profile/                # Hồ sơ cá nhân, đổi avatar, Ghost mode, App lock
│   │   │   └── story/                  # Story Studio, Camera, Music Picker, Interactive Story Modal
│   │   ├── hooks/                      # Custom React Hooks
│   │   │   ├── useAuth.js              # Quản lý phiên làm việc, profile, đăng xuất
│   │   │   ├── useGeolocation.js       # Multi-tier GPS, IP Fallback, Anti-Jitter Filter
│   │   │   ├── useProximityDetector.js # Cảm biến gia tốc rung lắc kết bạn Proximity Bump
│   │   │   └── useSocket.js            # Kênh kết nối Socket.IO thời gian thực
│   │   ├── services/                   # Dịch vụ giao tiếp dữ liệu
│   │   │   ├── apiClient.js            # Axios client định tuyến tương đối /api
│   │   │   ├── authService.js          # Logic xác thực và lưu token an toàn
│   │   │   ├── sharedStoreService.js   # Đồng bộ state giữa các phân hệ
│   │   │   ├── supabaseClient.js       # Client kết nối Supabase Cloud (khi kích hoạt)
│   │   │   └── vivuBackendService.js   # Service tích hợp dữ liệu
│   │   ├── utils/
│   │   │   └── safeStorage.js          # Wrapper localStorage an toàn chống crash Safari/Private
│   │   ├── App.jsx                     # Shell điều phối trạng thái cấp cao (< 450 dòng)
│   │   ├── index.css                   # Định nghĩa theme Resend Dark Monochrome & animations
│   │   └── main.jsx                    # Điểm nạp React DOM vào index.html
│   ├── package.json
│   └── vite.config.js                  # Cấu hình proxy /api -> backend, allowedHosts: true
│
├── backend/                            # [SERVER] API Server Node.js + Express + Socket.IO
│   ├── data/
│   │   └── vivu_database.json          # Cơ sở dữ liệu bền vững JSON lưu trên đĩa
│   ├── src/
│   │   ├── controllers/                # Tầng điều khiển nghiệp vụ (Business Logic)
│   │   │   ├── authController.js       # Đăng ký, đăng nhập, mã VU-XXXX, cập nhật avatar
│   │   │   ├── chatController.js       # Hộp thư, danh sách tin nhắn, đánh dấu đã đọc
│   │   │   ├── circleController.js     # Nhóm: Tạo, phân quyền owner/member, thêm bạn trực tiếp
│   │   │   ├── friendController.js     # Kết bạn 1-1, tìm kiếm, chấp nhận/từ chối
│   │   │   ├── gpsController.js        # Cập nhật vị trí GPS, lấy danh sách bạn online
│   │   │   └── storyController.js      # Đăng story beacon, tự động hết hạn 3 giờ
│   │   ├── middlewares/
│   │   │   └── errorHandler.js         # Bắt lỗi toàn cục, trả về chuẩn JSON an toàn
│   │   ├── routes/                     # Định tuyến REST API
│   │   │   ├── apiRoutes.js            # Gom cụm routes, health-check, /api/tunnel
│   │   │   ├── authRoutes.js           # /api/auth/*
│   │   │   ├── chatRoutes.js           # /api/chat/*
│   │   │   ├── circleRoutes.js         # /api/circles/*
│   │   │   ├── friendRoutes.js         # /api/friends/*
│   │   │   ├── gpsRoutes.js            # /api/gps/*
│   │   │   ├── notificationRoutes.js   # /api/notifications/*
│   │   │   └── storyRoutes.js          # /api/stories/*
│   │   ├── services/                   # Tầng dịch vụ lõi (Core Services)
│   │   │   ├── dbService.js            # Dual-mode DB Engine (Supabase + Local fallback)
│   │   │   ├── dbStore.js              # Động cơ lưu trữ bền vững JSON, ghi nguyên tử, Sanitizer
│   │   │   ├── notificationService.js  # Quản lý hàng đợi thông báo
│   │   │   └── socketService.js        # Khởi tạo Socket.IO, GPS peer broadcast, Spatial Bump
│   │   └── server.js                   # Khởi chạy Express HTTP & Socket.IO server (Port 5000)
│   ├── tests/                          # Bộ kiểm thử tự động Jest / Supertest (15 test suites)
│   │   ├── auth.test.js
│   │   ├── chat.test.js
│   │   ├── circle.test.js
│   │   ├── friend.test.js
│   │   └── story.test.js
│   ├── package.json
│   └── .env.example
│
├── infra/                              # [DEVOPS & CLOUD] Hạ tầng, CSDL & Mạng công khai
│   ├── docker/
│   │   ├── Dockerfile.frontend         # Docker image Frontend (Nginx Alpine)
│   │   ├── Dockerfile.backend          # Docker image Backend (Node.js Alpine)
│   │   ├── docker-compose.yml          # Điều phối song song 2 container frontend & backend
│   │   └── nginx.conf                  # Nginx Reverse Proxy điều phối /api sang backend
│   ├── supabase/
│   │   ├── migrations/                 # Script SQL migrations PostGIS
│   │   │   ├── 20261024_init_vivu_schema.sql
│   │   │   └── 20261028_upgrade_custom_circles.sql
│   │   └── seeds/
│   │       └── initial_seed.sql        # Dữ liệu tài khoản & địa điểm mẫu
│   ├── cloudflared.exe                 # Binary Cloudflare Tunnel cho Windows
│   ├── tunnel_url.txt                  # Tệp lưu URL công khai HTTPS đang hoạt động
│   └── README.md                       # Hướng dẫn khởi chạy hệ thống
│
├── scripts/                            # [AUTOMATION & TOOLS] Kịch bản hỗ trợ vận hành
│   ├── start-tunnel.js                 # Tự động khởi động Cloudflare Tunnel và sync URL
│   └── list_stitch_screens.js          # Kịch bản tra cứu & nạp màn hình từ Google Stitch AI MCP
│
└── docs/                               # [SPECIFICATIONS] Toàn bộ tài liệu đặc tả hệ thống
    ├── README.md                       # Mục lục tổng thể tài liệu
    ├── SRS.md                          # Đặc tả yêu cầu phần mềm chính thức (V2.0)
    ├── UI_UX_Spec.md                   # Đặc tả thiết kế giao diện & trải nghiệm (V2.0)
    ├── Database_Spec.md                # Đặc tả cơ sở dữ liệu & Persistent Engine (V2.0)
    ├── API_Spec.md                     # Đặc tả API REST & Sự kiện Socket.IO (V2.0)
    ├── Algorithm_Spec.md               # Đặc tả thuật toán không gian & khử nhiễu (V2.0)
    ├── Diagrams_Spec.md                # Đặc tả sơ đồ kiến trúc & luồng Mermaid (V2.0)
    ├── Project_Structure.md            # Sơ đồ cấu trúc cây thư mục (V2.0)
    └── Progress.md                     # Bảng trạng thái tính năng & checklist hoàn thiện
```

---

## 2. QUY CHUẨN GIAO TIẾP VÀ LUỒNG PHỤ THUỘC (DEPENDENCY FLOW)

1. **Client -> Vite Proxy -> Backend**:
   - Mọi request HTTP từ trình duyệt gửi về `/api/*` được Vite proxy sang `http://localhost:5000/api`.
   - Giúp Web App chạy thông suốt trên cả `localhost`, IP mạng LAN (`192.168.1.x`) và đường link HTTPS Cloudflare Tunnel mà không bị chặn CORS hay lỗi bảo mật Mixed Content.
2. **Client <==> Socket.IO Server**:
   - Kết nối hai chiều qua WebSocket tại cổng `5000`.
   - Vận chuyển các gói tin tọa độ GPS, tin nhắn chat tức thời, và các sự kiện rung lắc kết bạn `spatial:bump`.
3. **Backend -> Persistent DB Engine**:
   - `dbService.js` chuyển tiếp các thao tác dữ liệu sang `dbStore.js`.
   - Dữ liệu được ghi nguyên tử (atomic rename qua tệp tạm) xuống đĩa cứng `backend/data/vivu_database.json`, đảm bảo an toàn 100% khi tắt hoặc khởi động lại máy chủ.
4. **Google Stitch AI MCP Integration**:
   - Kết nối trực tiếp với MCP Server của Google Stitch (`https://stitch.googleapis.com/mcp`) để trích xuất Design System và sinh mã màn hình giao diện tự động.

1. **Client -> Vite Proxy -> Backend**:
   - Mọi request HTTP từ trình duyệt gửi về `/api/*` được Vite proxy sang `http://localhost:5000/api`.
   - Giúp Web App chạy thông suốt trên cả `localhost`, IP mạng LAN (`192.168.1.x`) và đường link HTTPS Cloudflare Tunnel mà không bị chặn CORS hay lỗi bảo mật Mixed Content.
2. **Client <==> Socket.IO Server**:
   - Kết nối hai chiều qua WebSocket tại cổng `5000`.
   - Vận chuyển các gói tin tọa độ GPS, tin nhắn chat tức thời, và các sự kiện rung lắc kết bạn `spatial:bump`.
3. **Backend -> Persistent DB Engine**:
   - `dbService.js` chuyển tiếp các thao tác dữ liệu sang `dbStore.js`.
   - Dữ liệu được ghi nguyên tử (atomic rename qua tệp tạm) xuống đĩa cứng `backend/data/vivu_database.json`, đảm bảo an toàn 100% khi tắt hoặc khởi động lại máy chủ.
4. **Google Stitch AI MCP Integration**:
   - Kết nối trực tiếp với MCP Server của Google Stitch (`https://stitch.googleapis.com/mcp`) để trích xuất Design System và sinh mã màn hình giao diện tự động.

