# ĐẶC TẢ YÊU CẦU PHẦN MỀM (SOFTWARE REQUIREMENTS SPECIFICATION - SRS)

---

## THÔNG TIN TÀI LIỆU VÀ QUẢN LÝ DỰ ÁN (DOCUMENT CONTROL)

- **Tên dự án**: Mạng xã hội Bản đồ Thời gian thực VIVU (VIVU Real-time Social Map Webapp)
- **Mã tài liệu**: `VIVU-DACN-SRS-2026-V1.0`
- **Loại tài liệu**: Báo cáo Đặc tả Yêu cầu Phần mềm Đồ án Chuyên ngành (DACN)
- **Chuẩn đặc tả áp dụng**: IEEE Std 830-1998 (Recommended Practice for Software Requirements Specifications) kết hợp ISO/IEC/IEEE 29148:2018 (Systems and software engineering — Life cycle processes — Requirements engineering)
- **Phiên bản (Version)**: 1.0.0 (Bản hoàn thiện toàn diện - Comprehensive Release)
- **Ngày phát hành**: 16/11/2026
- **Trạng thái**: Đã phê duyệt (Approved)
- **Tác giả biên soạn**: Nhóm Kỹ thuật Đồ án Chuyên ngành VIVU (Software Engineering Team)

### Lịch sử sửa đổi (Revision History)

| Phiên bản | Ngày cập nhật | Tác giả | Mô tả thay đổi | Tình trạng phê duyệt |
|---|---|---|---|---|
| `v0.1.0` | 02/11/2026 | Nhóm DACN | Khởi tạo cấu trúc tài liệu, khảo sát sơ bộ tính năng bản đồ và định vị GPS | Bản thảo nội bộ |
| `v0.5.0` | 09/11/2026 | Nhóm DACN | Đặc tả kiến trúc thời gian thực Socket.IO, cơ chế Story 24h, hệ thống kết bạn | Bản thảo đánh giá |
| `v0.9.0` | 14/11/2026 | Nhóm DACN | Bổ sung đặc tả tính năng Cụng ly 3D (Proximity Bump), Circles, Radar và NFR | Bản hoàn thiện kỹ thuật |
| `v1.0.0` | 16/11/2026 | Nhóm DACN | Chuẩn hóa toàn bộ 11 Functional Requirements (FR) và 6 Non-Functional Requirements (NFR) theo chuẩn IEEE 830, đối khớp 100% mã nguồn thực tế và kiểm thử | Phê duyệt chính thức |

---

## MỤC LỤC TỔNG QUAN

1. [GIỚI THIỆU TỔNG QUAN (OVERALL DESCRIPTION)](#1-giới-thiệu-tổng-quan-overall-description)
   - 1.1. [Mục đích tài liệu (Document Purpose)](#11-mục-đích-tài-liệu-document-purpose)
   - 1.2. [Phạm vi sản phẩm (Product Scope)](#12-phạm-vi-sản-phẩm-product-scope)
   - 1.3. [Đối tượng người dùng mục tiêu (Target Users & Personas)](#13-đối-tượng-người-dùng-mục-tiêu-target-users--personas)
   - 1.4. [Bối cảnh triển khai & Môi trường vận hành (Deployment Context)](#14-bối-cảnh-triển-khai--môi-trường-vận-hành-deployment-context)
   - 1.5. [Định nghĩa thuật ngữ và chữ viết tắt (Glossary of Terms & Abbreviations)](#15-định-nghĩa-thuật-ngữ-và-chữ-viết-tắt-glossary-of-terms--abbreviations)
   - 1.6. [Tài liệu tham khảo (References)](#16-tài-liệu-tham-khảo-references)
2. [KIẾN TRÚC NGHIỆP VỤ & LUỒNG NGƯỜI DÙNG TỔNG THỂ (SYSTEM CONTEXT & OVERALL FLOWS)](#2-kiến-trúc-nghiệp-vụ--luồng-người-dùng-tổng-thể-system-context--overall-flows)
   - 2.1. [Mô hình bối cảnh hệ thống (System Context Model)](#21-mô-hình-bối-cảnh-hệ-thống-system-context-model)
   - 2.2. [Danh mục tác nhân hệ thống (System Actors)](#22-danh-mục-tác-nhân-hệ-thống-system-actors)
   - 2.3. [Phân cấp ca sử dụng tổng thể (Use Case Hierarchy)](#23-phân-cấp-ca-sử-dụng-tổng-thể-use-case-hierarchy)
   - 2.4. [Luồng trải nghiệm người dùng xuyên suốt (End-to-End User Journey)](#24-luồng-trải-nghiệm-người-dùng-xuyên-suốt-end-to-end-user-journey)
   - 2.5. [Các giả định và phụ thuộc hệ thống (Assumptions & Dependencies)](#25-các-giả-định-và-phụ-thuộc-hệ-thống-assumptions--dependencies)
3. [ĐẶC TẢ CHI TIẾT CÁC YÊU CẦU CHỨC NĂNG (DETAILED FUNCTIONAL REQUIREMENTS)](#3-đặc-tả-chi-tiết-các-yêu-cầu-chức-năng-detailed-functional-requirements)
   - 3.1. [FR-01: Bản đồ 3D GPS & Cơ chế định vị thời gian thực (3D GPS Map & Geolocation Tracking)](#31-fr-01-bản-đồ-3d-gps--cơ-chế-định-vị-thời-gian-thực-3d-gps-map--geolocation-tracking)
   - 3.2. [FR-02: Ghim cá nhân & Tủ đồ trang phục (Personal Pin Marker & Pin Wardrobe)](#32-fr-02-ghim-cá-nhân--tủ-đồ-trang-phục-personal-pin-marker--pin-wardrobe)
   - 3.3. [FR-03: Linh vật Chibi Mascot & Âm thanh biểu cảm (Chibi Mascot Universe & Procedural Sound Synth)](#33-fr-03-linh-vật-chibi-mascot--âm-thanh-biểu-cảm-chibi-mascot-universe--procedural-sound-synth)
   - 3.4. [FR-04: Tâm trạng & Nhạc cá nhân Apple Music (Mood Status & Apple Music Integration)](#34-fr-04-tâm-trạng--nhạc-cá-nhân-apple-music-mood-status--apple-music-integration)
   - 3.5. [FR-05: Story định vị 24h & BeReal (24h Geotagged Stories & Dual Camera)](#35-fr-05-story-định-vị-24h--bereal-24h-geotagged-stories--dual-camera)
   - 3.6. [FR-06: Hệ thống Kết bạn & Định danh VU-XXXX (Friend System & Unique User Identification)](#36-fr-06-hệ-thống-kết-bạn--định-danh-vu-xxxx-friend-system--unique-user-identification)
   - 3.7. [FR-07: Trò chuyện 1-1 thời gian thực & Vị trí trực tiếp (1-on-1 Real-time Chat & Live Location)](#37-fr-07-trò-chuyện-1-1-thời-gian-thực--vị-trí-trực-tiếp-1-on-1-real-time-chat--live-location)
   - 3.8. [FR-08: Vòng kết nối nhóm riêng (Custom Circles & Group Spatial Filtering)](#38-fr-08-vòng-kết-nối-nhóm-riêng-custom-circles--group-spatial-filtering)
   - 3.9. [FR-09: Bình chọn tương tác (Interactive Polls)](#39-fr-09-bình-chọn-tương-tác-interactive-polls)
   - 3.10. [FR-10: Cụng ly tương tác vật lý (Proximity Bump & Spatial 3D Clink)](#310-fr-10-cụng-ly-tương-tác-vật-lý-proximity-bump--spatial-3d-clink)
   - 3.11. [FR-11: Radar quét lân cận (Proximity Radar & Haversine Geofencing)](#311-fr-11-radar-quét-lân-cận-proximity-radar--haversine-geofencing)
4. [ĐẶC TẢ CÁC YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS - NFR)](#4-đặc-tả-các-yêu-cầu-phi-chức-năng-non-functional-requirements---nfr)
   - 4.1. [NFR-01: Hiệu năng & Độ trễ thời gian thực (Real-time Latency & Socket Payload Optimization)](#41-nfr-01-hiệu-năng--độ-trễ-thời-gian-thực-real-time-latency--socket-payload-optimization)
   - 4.2. [NFR-02: Tối ưu bộ nhớ & Chống đầy dung lượng (Client-side Image Compression & Storage Protection)](#42-nfr-02-tối-ưu-bộ-nhớ--chống-đầy-dung-lượng-client-side-image-compression--storage-protection)
   - 4.3. [NFR-03: Tính sẵn sàng & Hồi phục ngoại tuyến (Offline Beacon Handling & Auto-Reconnection)](#43-nfr-03-tính-sẵn-sàng--hồi-phục-ngoại-tuyến-offline-beacon-handling--auto-reconnection)
   - 4.4. [NFR-04: Tính toàn vẹn dữ liệu (Atomic File Persistence & Concurrency Retry)](#44-nfr-04-tính-toàn-vẹn-dữ-liệu-atomic-file-persistence--concurrency-retry)
   - 4.5. [NFR-05: Tính khả dụng & Khả năng tương thích thiết bị (Zero-WebGL Crash Fallback & Responsive UI)](#45-nfr-05-tính-khả-dụng--khả-năng-tương-thích-thiết-bị-zero-webgl-crash-fallback--responsive-ui)
   - 4.6. [NFR-06: An toàn & Bảo mật (Access Control, Data Isolation & Guest Shielding)](#46-nfr-06-an-toàn--bảo-mật-access-control-data-isolation--guest-shielding)
5. [MA TRẬN TRUY VẾT YÊU CẦU (REQUIREMENTS TRACEABILITY MATRIX - RTM)](#5-ma-trận-truy-vết-yêu-cầu-requirements-traceability-matrix---rtm)

---

## 1. GIỚI THIỆU TỔNG QUAN (OVERALL DESCRIPTION)

### 1.1. Mục đích tài liệu (Document Purpose)
Tài liệu Đặc tả Yêu cầu Phần mềm (Software Requirements Specification - SRS) này định nghĩa chi tiết toàn bộ các yêu cầu chức năng (Functional Requirements), yêu cầu phi chức năng (Non-Functional Requirements), kiến trúc nghiệp vụ, các ràng buộc thiết kế và mô hình tương tác dữ liệu của hệ thống **Mạng xã hội Bản đồ Thời gian thực VIVU**. 

Tài liệu được xây dựng nhằm đáp ứng các mục tiêu cốt lõi:
1. Đóng vai trò là tài liệu kỹ thuật chuẩn mực phục vụ Hội đồng Đánh giá Báo cáo Đồ án Chuyên ngành (DACN) ngành Kỹ thuật Phần mềm / Công nghệ Thông tin.
2. Thiết lập cơ sở pháp lý kỹ thuật và hợp đồng giao tiếp giữa các thành viên phát triển Frontend, Backend, Quản trị hệ thống và Đảm bảo chất lượng (QA/Audit).
3. Đảm bảo tính nhất quán tuyệt đối giữa lý thuyết thiết kế phần mềm và mã nguồn hiện thực đang vận hành trong dự án (`c:\Đức Tùng\DACN\vivudemo1`).

### 1.2. Phạm vi sản phẩm (Product Scope)
Hệ thống **VIVU** là một ứng dụng web đơn trang thời gian thực (Real-time Single Page Web Application - SPA) lấy bản đồ không gian địa lý (Spatial Map) làm trung tâm tương tác xã hội. Khác biệt với các mạng xã hội truyền thống chỉ tập trung vào bảng tin tĩnh (Newsfeed), VIVU kết nối con người dựa trên sự tương tác vị trí thời gian thực, sự hiện diện vật lý tại thế giới thực và các phương thức biểu đạt cá tính trực quan.

**Các phân hệ sản phẩm bao gồm:**
- **Không gian Bản đồ Kép (Dual-Engine Spatial Map)**: Kết hợp công nghệ bản đồ vector 3D Mapbox GL (góc nghiêng 32°, góc xoay la bàn -5°) và lớp bản đồ 2D siêu nhẹ Leaflet tích hợp trực tiếp Google Maps Tiles (Streets & Satellite Hybrid) nhằm đảm bảo hoạt động mượt mà, không gặp sự cố tràn ngữ cảnh WebGL trên thiết bị di động cấu hình thấp.
- **Hệ thống Định vị & Lọc sai số GPS**: Bộ lọc 4 tầng (High-accuracy GPS, Permissions API, Micro-drift Haversine < 8m, Sai số vệ tinh > 350m, và bộ khử tọa độ giả định Đà Nẵng) đảm bảo vị trí người dùng chính xác, chân thực và không bị rung giật.
- **Tùy biến Cá nhân hóa & Linh vật Chibi**: Tủ đồ ghim vị trí (Pin Wardrobe) với 5 chế độ skin ghim, vũ trụ 3 gia tộc Chibi Mascot (12 biểu cảm) kết hợp 4 mascot kinh điển phong cách Messenger/Zalo kèm 7 hoạt cảnh di chuyển.
- **Âm thanh & Âm nhạc Trực tuyến**: Hệ thống tổng hợp âm thanh thủ tục (Web Audio API Procedural Synthesizer) tạo hiệu ứng âm thanh độc quyền theo thời gian thực kết hợp bộ phát nhạc Apple Music / iTunes CDN 21 ca khúc thịnh hành.
- **Khoảnh khắc Định vị 24h & BeReal**: Tính năng đăng tải Story gắn tọa độ địa lý, chụp camera kép BeReal trước/sau, bộ lọc nghệ thuật, dán sticker bình chọn/Q&A, tự hủy triệt để sau 24 giờ.
- **Hạ tầng Kết nối Xã hội Toàn diện**: Định danh độc nhất chuẩn `VU-XXXX`, quản lý quan hệ bạn bè 2 chiều, trò chuyện 1-1 thời gian thực Socket.IO (tin nhắn văn bản, ảnh, video, tim bay, chia sẻ vị trí tĩnh và vị trí trực tiếp Live Location 15p/60p/8h, cấp độ thân thiết Streak).
- **Vòng kết nối Nhóm riêng (Custom Circles)**: Quản lý nhóm riêng tư, phân quyền Trưởng nhóm / Thành viên, và bộ lọc không gian địa lý hiển thị bản đồ theo từng Circle riêng biệt.
- **Tương tác Vật lý Không gian (Proximity Bump)**: Nhận diện khoảng cách GPS <= 15m và cảm biến gia tốc chuyển động `devicemotion` > 24 m/s² để kích hoạt màn hình tương tác cụng ly 3D Three.js, âm thanh pha lê va chạm và tự động xuất bản Story đôi (Joint Story) tồn tại 6 giờ.
- **Radar Lân cận (Proximity Radar)**: Quét và hiển thị danh sách người dùng xung quanh theo công thức Haversine với các mốc bán kính 1km, 3km, 5km, 10km hoặc thanh trượt 0.5km - 15km.

### 1.3. Đối tượng người dùng mục tiêu (Target Users & Personas)
Hệ thống VIVU được thiết kế chuyên biệt cho giới trẻ năng động, sinh viên đại học, các nhóm bạn thân và cộng đồng người dùng đô thị hiện đại:
- **Người dùng Cá nhân (Gen Z / Sinh viên)**: Yêu thích khám phá địa điểm mới (quán cà phê, điểm check-in, ẩm thực đường phố), mong muốn thể hiện phong cách cá nhân thông qua Mascot, bài hát yêu thích trên bản đồ và chụp ảnh BeReal tức thời.
- **Nhóm bạn thân thiết (Close-knit Circles)**: Cần một công cụ định vị vị trí của nhau trong các chuyến dã ngoại, phượt, đi chơi đêm, kiểm tra bạn bè đã về nhà an toàn (qua Live Location và mức pin thiết bị), và cụng ly gặp mặt ngoài đời thực.
- **Cộng đồng gặp gỡ lân cận (Proximity Explorers)**: Tìm kiếm những người có cùng sở thích, cùng tâm trạng hoặc đang có mặt tại cùng một sự kiện, quán xá thông qua Radar lân cận mà vẫn bảo mật thông tin cá nhân.

### 1.4. Bối cảnh triển khai & Môi trường vận hành (Deployment Context)
- **Môi trường Máy khách (Client-Side Runtime)**:
  - Trình duyệt Web tiêu chuẩn hiện đại hỗ trợ ECMAScript 2022+, HTML5 Geolocation API, Web Audio API, WebGL: Google Chrome (phiên bản >= 100), Safari (iOS >= 15.0), Firefox (>= 100), Microsoft Edge.
  - Thiết bị: Điện thoại thông minh (iOS/Android), máy tính bảng và máy tính để bàn (Desktop Web).
- **Môi trường Máy chủ (Server-Side Runtime)**:
  - Nền tảng Node.js LTS (phiên bản >= 20.x), thực thi theo chuẩn ECMAScript Modules (`"type": "module"`).
  - Framework: Express.js 4.21.2 kết hợp Socket.IO 4.8.4 làm cổng kết nối WebSocket thời gian thực hai chiều.
  - Cổng lắng nghe: Cổng TCP 5000 (`0.0.0.0:5000`), cho phép kết nối trong mạng cục bộ LAN và Internet.
- **Hạ tầng Mạng & Đường hầm Toàn cầu (Networking & Tunneling)**:
  - Tích hợp công cụ Cloudflare Quick Tunnel (`infra/cloudflared.exe`) tạo đường hầm HTTPS ngẫu nhiên dạng `https://*.trycloudflare.com` giúp kiểm thử trực tiếp trên thiết bị di động thật qua mạng 4G/5G.
  - Đóng gói ứng dụng thông qua Docker & Docker-Compose đa dịch vụ (`infra/docker/`).

### 1.5. Định nghĩa thuật ngữ và chữ viết tắt (Glossary of Terms & Abbreviations)

| Thuật ngữ / Viết tắt | Tên đầy đủ (Tiếng Anh) | Định nghĩa & Ý nghĩa kỹ thuật trong VIVU |
|---|---|---|
| **SRS** | Software Requirements Specification | Tài liệu Đặc tả Yêu cầu Phần mềm theo chuẩn IEEE 830-1998. |
| **DACN** | Đồ án Chuyên ngành | Học phần Đồ án Tốt nghiệp chuyên ngành Kỹ thuật Phần mềm. |
| **SPA** | Single Page Application | Ứng dụng web đơn trang chỉ tải HTML một lần và cập nhật DOM động bằng React 19. |
| **WGS-84** | World Geodetic System 1984 | Hệ toạ độ trắc địa chuẩn quốc tế dùng cho hệ thống định vị vệ tinh GPS (kinh độ, vĩ độ). |
| **Haversine Formula** | Haversine Great-Circle Distance | Thuật toán lượng giác cầu tính khoảng cách đường chim bay giữa hai toạ độ trên mặt cầu Trái Đất (bán kính $R = 6371$ km). |
| **Micro-drift** | Sensor Micro-drift | Hiện tượng trôi toạ độ ngẫu nhiên do nhiễu tín hiệu phần cứng GPS khi thiết bị đứng yên. |
| **Zero-WebGL Crash** | Zero WebGL Context Loss | Chiến lược kiến trúc dùng Leaflet 2D làm mặc định để ngăn chặn sự cố tràn GPU/WebGL context trên thiết bị di động. |
| **Socket.IO** | Bi-directional Event-based Realtime Engine | Thư viện truyền thông hai chiều thời gian thực dựa trên nền tảng WebSocket và HTTP Long-polling fallback. |
| **Web Audio API** | W3C Web Audio Specification | Giao diện lập trình cấp cao của trình duyệt dùng để xử lý và tổng hợp tín hiệu âm thanh kỹ thuật số trực tiếp bằng mã lệnh. |
| **Procedural Audio** | Procedural Sound Synthesis | Kỹ thuật tạo âm thanh hoàn toàn bằng mã lệnh (Oscillator, Gain, Filter) không cần file âm thanh MP3/WAV. |
| **BeReal Dual Cam** | Dual Camera Photography | Chế độ chụp ảnh đồng thời hoặc liên tiếp cả camera trước và camera sau để ghi lại khoảnh khắc chân thực. |
| **Live Location** | Real-time Location Sharing | Luồng chia sẻ toạ độ di chuyển trực tiếp có thời hạn (15 phút, 60 phút, 8 giờ) trong tin nhắn chat. |
| **Proximity Bump** | Physical Proximity Bump Gesture | Cử chỉ tương tác xã hội kích hoạt khi hai người dùng ở cự ly $\le 15$m và thực hiện lắc điện thoại cùng lúc. |
| **Pin Wardrobe** | Map Marker Wardrobe | Hệ thống giao diện tùy biến giọt nước ghim vị trí của người dùng trên bản đồ. |
| **Atomic File Write** | Atomic File Persistence | Kỹ thuật ghi tệp tin CSDL an toàn thông qua tệp tạm thời `.tmp` và đổi tên nguyên tử để chống hỏng file. |
| **EBUSY Retry** | Resource Busy Retry Loop | Cơ chế lặp lại nỗ lực truy cập tệp trên hệ điều hành Windows khi tệp tin đang bị tiến trình khác tạm khóa. |
| **VU-XXXX** | VIVU Unique User Identifier | Mã định danh người dùng độc nhất gồm 4 chữ số (từ 1000 đến 9999) cấp phát khi đăng ký tài khoản. |
| **Circle** | Private Custom Circle | Vòng tròn nhóm bạn bè riêng tư cho phép lọc hiển thị không gian và trò chuyện tập trung. |
| **Streak** | Friendship Conversation Streak | Chỉ số đo lường mức độ tương tác và độ thân thiết giữa 2 người bạn dựa trên tần suất trao đổi tin nhắn. |

### 1.6. Tài liệu tham khảo (References)
1. **IEEE Std 830-1998**: *IEEE Recommended Practice for Software Requirements Specifications*, IEEE Computer Society, 1998.
2. **ISO/IEC/IEEE 29148:2018**: *Systems and software engineering — Life cycle processes — Requirements engineering*, ISO/IEC/IEEE, 2018.
3. **W3C Geolocation API Specification**: *W3C Recommendation for Geolocation API*, W3C, 2022.
4. **W3C Web Audio API**: *Web Audio API W3C Candidate Recommendation*, W3C Audio Working Group, 2021.
5. **RFC 6455**: *The WebSocket Protocol*, Internet Engineering Task Force (IETF), 2011.
6. **Mã nguồn dự án VIVU**: Thư mục `c:\Đức Tùng\DACN\vivudemo1` (Frontend: `frontend/`, Backend: `backend/`).

---

## 2. KIẾN TRÚC NGHIỆP VỤ & LUỒNG NGƯỜI DÙNG TỔNG THỂ (SYSTEM CONTEXT & OVERALL FLOWS)

### 2.1. Mô hình bối cảnh hệ thống (System Context Model)

Hệ thống VIVU vận hành theo mô hình Client-Server phân tán, kết nối thời gian thực:

```
+---------------------------------------------------------------------------------------+
|                                    CLIENT BROWSER                                     |
|  +---------------------+  +----------------------+  +-------------------------------+ |
|  | Hardware Sensors    |  | UI Component Layers  |  | Client Realtime & Engines     | |
|  | - Geolocation API   |  | - GoogleMapView (2D) |  | - Socket.IO Client 4.8.4      | |
|  | - Devicemotion API  |  | - MapboxCanvas (3D)  |  | - Web Audio Synth             | |
|  | - Camera MediaStream|  | - MessengerChatView  |  | - HTML5 Audio (Apple Music)   | |
|  | - Touch Gestures    |  | - StoryStudioModal   |  | - Canvas Image Compressor     | |
|  | - Haptic Vibrator   |  | - PinWardrobeModal   |  | - Three.js 3D Bump Engine     | |
|  +----------+----------+  +----------+-----------+  +---------------+---------------+ |
+-------------|------------------------|------------------------------|-----------------+
              |                        |                              |
              | HTTPS (REST API)       | WebSocket Events             | SendBeacon
              v                        v                              v
+---------------------------------------------------------------------------------------+
|                                    BACKEND SERVER                                     |
|  +---------------------------------------------------------------------------------+  |
|  | Express 4.21.2 API Gateway & Security Pipeline                                  |  |
|  | - CORS Handler & JSON Body Parser (10MB limit)                                  |  |
|  | - Guest Blocker (Chặn client-xxx xâm nhập DB)                                   |  |
|  | - Centralized Error Handler                                                     |  |
|  +---------------------------------------------------------------------------------+  |
|  +-----------------------------+     +---------------------------------------------+  |
|  | REST Controllers            |     | Socket.IO Realtime Gateway (socketService)  |  |
|  | - authController            |     | - Handshake Auth Verification               |  |
|  | - gpsController             |     | - Multi-tab Connection Map (userId -> Sets) |  |
|  | - storyController           |     | - Broadcast Channels (gps, user, story)     |  |
|  | - friendController          |     | - Targeted Private Emits (chat, freq, bump) |  |
|  | - chatController            |     | - Safe Disconnect Lifecycle Manager         |  |
|  | - circleController          |     +---------------------------------------------+  |
|  | - notificationRoutes        |                                                      |
|  +--------------+--------------+                                                      |
|                 |                                                                     |
|                 v                                                                     |
|  +---------------------------------------------------------------------------------+  |
|  | Data Layer & Dual-Mode Persistence Engine (dbService & dbStore)                 |  |
|  | - In-Memory Operational Store (Fast zero-latency query)                         |  |
|  | - Atomic Disk Persistence (PID.timestamp.tmp -> vivu_database.json)            |  |
|  | - Auto-Recovery (.bak backup file on JSON null-byte corruption)                 |  |
|  | - Windows EBUSY Concurrency Retry Loop (3 retries, 40ms interval)              |  |
|  | - Bulletproof Expiry Guard (Tự động thanh lọc Story & Chibi hết hạn)            |  |
|  | - Cloud Hybrid Adapter (Tự động kết nối Supabase Postgres khi có env)           |  |
|  +---------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------+
```

### 2.2. Danh mục tác nhân hệ thống (System Actors)

1. **Khách vãng lai (Guest / Anonymous Visitor)**:
   - Người dùng vừa truy cập website, chưa tiến hành đăng nhập hoặc đăng ký tài khoản.
   - Quyền hạn: Được cấp ID tạm dạng `client-xxx`, được xem bản đồ chung, định vị vị trí của chính mình để trải nghiệm giao diện, nhưng **bị chặn tuyệt đối** không được ghi dữ liệu vào CSDL, không được phát sóng toạ độ ra công cộng và không được gửi tin nhắn/kết bạn.
2. **Người dùng đã đăng ký (Registered User / Account Owner)**:
   - Người dùng đã hoàn tất đăng ký tài khoản hợp lệ, sở hữu một mã định danh độc nhất `VU-XXXX`.
   - Quyền hạn: Toàn quyền cập nhật hồ sơ cá nhân, chọn Skin ghim, trang bị Chibi Mascot, cập nhật tâm trạng và bài hát Apple Music, đăng tải Story 24h, tìm kiếm và gửi lời mời kết bạn, quét Radar lân cận và thực hiện Cụng ly 3D.
3. **Bạn bè đã kết nối (Official Connected Friend)**:
   - Hai người dùng đã xác lập mối quan hệ bạn bè 2 chiều chính thức (bản ghi tồn tại trong bảng `friendships` với khóa `fs-[userA]--[userB]`).
   - Quyền hạn: Xem được vị trí chính xác của nhau trên tab Bản đồ Bạn bè, xem được Story chế độ `friends`, nhắn tin trực tiếp 1-1 không bị chặn bởi bộ lọc riêng tư, nhận chia sẻ Live Location, cùng tích luỹ chuỗi thân thiết Streak và tham gia các Vòng kết nối Circles chung.
4. **Trưởng nhóm Vòng kết nối (Circle Owner / Admin)**:
   - Người dùng khởi tạo một Circle riêng tư.
   - Quyền hạn: Toàn quyền chỉnh sửa thông tin nhóm (tên, mô tả, ảnh đại diện, màu neon), mời thêm bạn bè vào nhóm, xóa thành viên khỏi nhóm (Kick), chuyển giao quyền Trưởng nhóm và giải tán nhóm (Disband).
5. **Thành viên Vòng kết nối (Circle Member)**:
   - Người dùng được Trưởng nhóm thêm vào hoặc đã chấp nhận lời mời tham gia Circle.
   - Quyền hạn: Tham gia trò chuyện trong phòng chat nhóm, tạo và tham gia bình chọn Polls trong nhóm, xem danh sách thành viên và kích hoạt bộ lọc bản đồ để chỉ xem riêng vị trí của các thành viên trong Circle.

### 2.3. Phân cấp ca sử dụng tổng thể (Use Case Hierarchy)

```
HỆ THỐNG MẠNG XÃ HỘI BẢN ĐỒ VIVU
│
├── Phân hệ 1: Định vị & Bản đồ Không gian (Spatial Mapping)
│   ├── UC-01: Xem bản đồ 3D / 2D kép
│   ├── UC-02: Định vị GPS thời gian thực (Cảm biến phần cứng)
│   ├── UC-03: Chọn toạ độ thủ công (Manual Location Pick)
│   ├── UC-04: Điều hướng tái định vị tâm bản đồ (Recenter GPS)
│   └── UC-05: Quét người dùng xung quanh qua Radar lân cận
│
├── Phân hệ 2: Cá nhân hoá & Thể hiện Bản thân (Identity & Expression)
│   ├── UC-06: Đổi giao diện ghim vị trí (Pin Wardrobe 5 skin)
│   ├── UC-07: Trang bị Linh vật Chibi Mascot & phát âm thanh Procedural Synth
│   ├── UC-08: Trang bị Mascot hoạt cảnh phong cách Messenger / Zalo
│   ├── UC-09: Cập nhật tâm trạng (Mood Status)
│   └── UC-10: Ghim bài hát Apple Music & phát nhạc nền trên bản đồ
│
├── Phân hệ 3: Khoảnh khắc Định vị 24h (24h Geotagged Stories)
│   ├── UC-11: Chụp ảnh Story Camera kép BeReal
│   ├── UC-12: Chỉnh sửa Story (Bộ lọc, Văn bản, Nhãn dán, Âm nhạc)
│   ├── UC-13: Đăng tải Story gắn toạ độ GPS
│   ├── UC-14: Xem Story toàn màn hình & tương tác (Poll, Q&A, Thả tim)
│   └── UC-15: Tự động hết hạn và dọn dẹp Story sau 24 giờ
│
├── Phân hệ 4: Mạng lưới Quan hệ & Kết bạn (Social Graph & Friendship)
│   ├── UC-16: Tìm kiếm người dùng theo Mã VU-XXXX / Tên / SĐT / Email
│   ├── UC-17: Gửi lời mời kết bạn
│   ├── UC-18: Chấp nhận / Từ chối / Thu hồi lời mời kết bạn
│   ├── UC-19: Huỷ quan hệ bạn bè (Unfriend)
│   └── UC-20: Cụng ly tương tác vật lý ngoài đời thực (Proximity Bump)
│
├── Phân hệ 5: Trò chuyện & Tương tác Thời gian thực (Real-time Messaging)
│   ├── UC-21: Nhắn tin 1-1 thời gian thực (Văn bản, Ảnh, Video, Thả tim lớn)
│   ├── UC-22: Chia sẻ vị trí trực tiếp (Live Location) & Dừng chia sẻ
│   ├── UC-23: Xem trạng thái đã đọc tin nhắn (Read Receipt ✓✓)
│   ├── UC-24: Tạo và tham gia bình chọn (Poll) trong phòng chat
│   └── UC-25: Gửi Meme Troll chiếm toàn màn hình đối phương
│
└── Phân hệ 6: Vòng kết nối Nhóm riêng (Custom Circles)
    ├── UC-26: Tạo Vòng kết nối nhóm mới
    ├── UC-27: Quản lý thành viên nhóm (Mời, Duyệt, Xoá thành viên)
    ├── UC-28: Lọc hiển thị vị trí bản đồ theo từng Circle cụ thể
    └── UC-29: Chuyển giao quyền Trưởng nhóm & Giải tán nhóm
```

### 2.4. Luồng trải nghiệm người dùng xuyên suốt (End-to-End User Journey)

1. **Khởi tạo và Cấp quyền (Onboarding & Permission Gate)**:
   - Người dùng truy cập VIVU. Màn hình `VivuIntroScreen` hiển thị video giới thiệu thương hiệu ngắn (chạy 1 lần/phiên thông qua `sessionStorage`).
   - Cổng cấp quyền `VivuPermissionGate` yêu cầu 3 quyền cốt lõi: Vị trí GPS (Geolocation), Camera (để chụp BeReal/Story), và Âm thanh (AudioContext).
   - Người dùng chọn Đăng ký tài khoản mới hoặc Đăng nhập (hỗ trợ Email/Mật khẩu, Google GIS OAuth hoặc Facebook SDK). Sau khi đăng ký thành công, hệ thống tự động cấp phát một mã định danh duy nhất `VU-XXXX`.
2. **Khám phá Bản đồ & Thiết lập Nhận diện**:
   - Bản đồ tải vị trí GPS thực tế của người dùng. Thuật toán 4 tầng khử trôi toạ độ và loại bỏ toạ độ mặc định cũ.
   - Người dùng mở `PinWardrobeModal` để chọn Skin ghim (Zenly 3D, Polaroid, Aura Circle, Classic Teardrop), chọn Chibi Mascot phát ra âm thanh synth đặc trưng, cập nhật dòng suy nghĩ ngắn trong `QuickStatusSheet` và chọn bài hát yêu thích từ kho nhạc Apple Music.
   - Marker của người dùng trên bản đồ lập tức biến đổi trực quan, sẵn sàng phát nhạc và hiển thị Chibi cho bạn bè chiêm ngưỡng.
3. **Kết nối & Tương tác Xã hội**:
   - Người dùng bật `RadarDistanceSelector`, chọn bán kính 3km để xem những bạn bè và người dùng đang online quanh khu vực.
   - Nhập mã `VU-XXXX` vào khay tìm kiếm để gửi lời mời kết bạn tới người quen. Khi đối phương chấp nhận, hiệu ứng pháo hoa confetti bùng nổ, âm thanh chúc mừng vang lên và vị trí của người bạn xuất hiện trên bản đồ.
4. **Gặp gỡ Ngoài đời thực & Cụng ly 3D (Spatial Bump)**:
   - Khi hai người bạn tiến lại gần nhau trong cự ly $\le 15$ mét, banner phát hiện cự ly gần tự động xuất hiện.
   - Hai người cùng cầm điện thoại và cụng nhẹ (kích hoạt cảm biến gia tốc `devicemotion` > 24 m/s²). Hoạt cảnh 3D Three.js hiển thị 2 ly cocktail va chạm phát ra tiếng keng pha lê trong trẻo, điện thoại rung haptic và hệ thống tự động xuất bản một bài Story đôi (Joint Story) 6 giờ đánh dấu cuộc gặp gỡ.
5. **Giao tiếp & Sinh hoạt Nhóm (Chat & Circles)**:
   - Người dùng mở `MessengerChatView` để nhắn tin, chia sẻ toạ độ Live Location 60 phút khi đang trên đường tới điểm hẹn, tạo bình chọn Poll "Tối nay ăn gì?".
   - Khởi tạo một Circle "Hội Bạn Thân", thêm các thành viên và bấm "Xem trên Bản đồ" để lọc riêng vị trí của nhóm trong suốt buổi đi chơi.

### 2.5. Các giả định và phụ thuộc hệ thống (Assumptions & Dependencies)
1. **Phụ thuộc Phần cứng Thiết bị**: Độ chính xác của tính năng bản đồ và cụng ly phụ thuộc vào chip GPS và cảm biến gia tốc kế (Accelerometer) của thiết bị khách. Đối với máy tính để bàn không có GPS phần cứng, hệ thống phụ thuộc vào tính năng cắm ghim thủ công (`setManualCoords`).
2. **Phụ thuộc Dịch vụ Ngoài (Third-party Services)**:
   - Google Maps Tile Servers: Cung cấp bản đồ nền Street và Satellite Hybrid (`mt{s}.google.com`).
   - Apple Music / iTunes Search API & CDN: Cung cấp tính năng tìm kiếm bài hát trực tuyến và truyền tải luồng âm thanh nghe thử 30 giây.
   - Cloudflare Tunnel: Hỗ trợ tạo kết nối HTTPS an toàn phục vụ việc truy cập camera và GPS trên điện thoại di động trong quá trình phát triển và kiểm thử.
3. **Giả định Môi trường Trình duyệt**: Giả định người dùng không bật các chế độ giả lập toạ độ GPS (Fake GPS) độc hại và cấp quyền truy cập định vị khi được yêu cầu.

---

## 3. ĐẶC TẢ CHI TIẾT CÁC YÊU CẦU CHỨC NĂNG (DETAILED FUNCTIONAL REQUIREMENTS)

---

### 3.1. FR-01: Bản đồ 3D GPS & Cơ chế định vị thời gian thực (3D GPS Map & Geolocation Tracking)

#### Mô tả chi tiết
Hệ thống cung cấp một nền tảng bản đồ không gian địa lý tương tác toàn màn hình, kết hợp hai công cụ bản đồ (Dual-Engine Map System) song song:
1. **Engine 2D Mặc định (GoogleMapView - Leaflet)**: Sử dụng thư viện Leaflet 1.9.4 kết hợp các lớp bản đồ Google Maps Streets (`lyrs=m`) và Google Maps Satellite Hybrid (`lyrs=y`). Được thiết kế nhằm mục đích loại bỏ hoàn toàn nguy cơ sập ứng dụng do tràn ngữ cảnh WebGL (Zero-WebGL Crash) trên các thiết bị di động tầm trung và cấu hình thấp, đồng thời cung cấp khả năng dựng Marker DOM tùy biến linh hoạt.
2. **Engine 3D Góc nhìn Không gian (MapboxCanvas - Mapbox GL)**: Sử dụng Mapbox GL JS 3.33.0 với cấu hình góc nghiêng 3D (pitch 32°), góc xoay la bàn (bearing -5°), tích hợp lớp hiển thị toà nhà 3D (3D Buildings Extrusion), tuyến đường chỉ dẫn hai lớp (`vivu-route`) và vòng quét Radar địa lý chính xác (GeoJSON Polygon 64 điểm).
3. **Cơ chế Định vị Phần cứng 4 Tầng (4-Tier Geolocation Engine)**:
   - Tầng 1: Đọc toạ độ độ chính xác cao từ phần cứng qua `navigator.geolocation.watchPosition` (`enableHighAccuracy: true`, `timeout: 10000ms`, `maximumAge: 10000ms`).
   - Tầng 2: Giám sát vòng đời quyền qua W3C Permissions API (`navigator.permissions.query({ name: 'geolocation' })`), tự động phản ứng khi người dùng bật/tắt quyền trên thanh địa chỉ duyệt web.
   - Tầng 3: Bộ lọc khử rung sai số vệ tinh (Satellite Drift Filter) và vi dịch chuyển (Micro-drift Filter). Loại bỏ toạ độ mới nếu độ sai số `accuracy > 350m` khi đang có toạ độ tin cậy (< 100m). Tính khoảng cách Haversine và chỉ kích hoạt cập nhật lại giao diện và phát sóng socket nếu khoảng cách dịch chuyển thực tế $\ge 8$ mét.
   - Tầng 4: Xóa sạch toạ độ ảo. Bộ nhớ cục bộ `localStorage` (`vivu_user_real_location`) tự động phát hiện và xóa vĩnh viễn toạ độ giả lập Đà Nẵng mặc định cũ `(16.0544, 108.2022)`. Bắt buộc lấy toạ độ thực của thiết bị hoặc toạ độ do người dùng chủ động cắm ghim (`setManualCoords`).

#### Tác nhân (Actor)
Tất cả người dùng (Khách vãng lai, Người dùng đã đăng ký, Bạn bè).

#### Tiền điều kiện (Preconditions)
Thiết bị có kết nối mạng Internet. Người dùng cấp quyền truy cập vị trí địa lý cho trình duyệt web, hoặc kích hoạt chế độ chọn vị trí thủ công.

#### Luồng sự kiện chính (Main Flow)
1. Ứng dụng khởi động component bản đồ (`GoogleMapView.jsx`).
2. Hook `useGeolocation` gửi yêu cầu xin toạ độ thiết bị qua `getCurrentPosition` và thiết lập kênh giám sát `watchPosition`.
3. Trình duyệt trả về toạ độ kinh độ (`lng`), vĩ độ (`lat`), độ chính xác (`accuracy`), hướng di chuyển (`heading`) và tốc độ (`speed`).
4. Thuật toán kiểm tra điều kiện lọc: Nếu `accuracy <= 350m` và khoảng cách so với toạ độ trước đó $\ge 8$ mét:
   a. Cập nhật state toạ độ người dùng trong `App.jsx`.
   b. Lưu toạ độ vào `localStorage` (`vivu_user_real_location`).
   c. Nếu người dùng đã đăng nhập hợp lệ (User ID dạng chuỗi bắt đầu bằng 'user-'), phát sự kiện Socket.IO `gps:update` lên máy chủ kèm toạ độ và thông tin hồ sơ.
5. Máy chủ nhận sự kiện, cập nhật toạ độ vào bảng `profiles` và phát sóng `socket.broadcast.emit('gps:peer-update', peerProfilePayload)` tới tất cả client khác đang hoạt động.
6. Bản đồ của các client khác nhận sự kiện và cập nhật vị trí marker tương ứng theo thời gian thực.
7. Khi bấm nút "Tái định vị" (`RightActionStack`), bản đồ kích hoạt hoạt cảnh bay mượt mà (`map.flyTo([lat, lng], 16.5, { duration: 0.8 })`) về tâm toạ độ người dùng.

#### Luồng rẽ nhánh & Ngoại lệ (Alternative & Exception Flows)
- **Alt-1 (Người dùng từ chối cấp quyền GPS)**: Hook `useGeolocation` chuyển trạng thái `permissionDenied = true`. Ứng dụng hiển thị banner cảnh báo `GpsStatusBanner` và mở modal cho phép người dùng tự cắm ghim toạ độ thủ công (`setManualCoords`).
- **Alt-2 (Chuyển đổi kiểu bản đồ)**: Người dùng nhấn nút chuyển đổi lớp bản đồ trên `RightActionStack`. Hệ thống lập tức hoán đổi tile layer giữa Google Maps Streets và Google Maps Satellite Hybrid mà không làm gián đoạn các marker đang hiển thị.
- **Alt-3 (Người dùng là khách vãng lai `client-xxx`)**: Toạ độ chỉ được hiển thị cục bộ trên máy khách, máy chủ chặn không phát sóng toạ độ của khách vãng lai ra mạng xã hội để bảo vệ cơ sở dữ liệu.

#### Hậu điều kiện (Postconditions)
Toạ độ vị trí người dùng được định vị chính xác, hiển thị trực quan trên bản đồ và được đồng bộ tới bạn bè trực tuyến theo thời gian thực.

#### Giao diện & Mã nguồn liên quan
- Frontend: `frontend/src/components/map/GoogleMapView.jsx` (dòng 1-444), `frontend/src/components/map/MapboxCanvas.jsx` (dòng 1-1254), `frontend/src/hooks/useGeolocation.js` (dòng 1-263), `frontend/src/components/map/RightActionStack.jsx` (dòng 1-160), `frontend/src/components/map/GpsStatusBanner.jsx` (dòng 1-82).
- Backend: `backend/src/routes/gpsRoutes.js` (dòng 1-15), `backend/src/controllers/gpsController.js` (dòng 1-55), `backend/src/services/socketService.js` (dòng 51-78).

#### Dữ liệu đầu vào / đầu ra
- **Input (Client -> Server `gps:update`)**:
  ```json
  {
    "userId": "user-1710500000000-abc12",
    "lat": 10.776889,
    "lng": 106.700806,
    "name": "Đức Tùng",
    "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=user1",
    "userCode": "VU-7115",
    "customStatus": "Đang vi vu quận 1",
    "phone": "0901234567"
  }
  ```
- **Output (Server Broadcast -> Clients `gps:peer-update`)**:
  ```json
  {
    "id": "user-1710500000000-abc12",
    "lat": 10.776889,
    "lng": 106.700806,
    "full_name": "Đức Tùng",
    "user_code": "VU-7115",
    "avatar_url": "https://api.dicebear.com/7.x/bottts/svg?seed=user1",
    "is_online": true,
    "battery": "95%",
    "custom_status": "Đang vi vu quận 1",
    "last_seen_at": "2026-11-16T12:00:00.000Z"
  }
  ```

---

### 3.2. FR-02: Ghim cá nhân & Tủ đồ trang phục (Personal Pin Marker & Pin Wardrobe)

#### Mô tả chi tiết
Người dùng có khả năng tùy biến hoàn toàn diện mạo điểm ghim vị trí (Pin Marker) của chính mình trên không gian bản đồ thông qua Tủ đồ ghim (`PinWardrobeModal`). Hệ thống cung cấp 5 chế độ giao diện (Skin Modes) độc đáo:
1. `auto` (Tự động thông minh): Tự động phân tích ngữ cảnh (Context-aware) để chọn giao diện hiển thị tối ưu nhất. Nếu người dùng đang có Story còn hạn thì hiển thị dạng Polaroid; nếu đang gắn linh vật Chibi thì hiển thị dạng Zenly 3D; nếu không sẽ trở về dạng Aura Circle.
2. `zenly_3d` (Phong cách Zenly 3D tự do): Biến đổi ghim thành hình tượng nhân vật Chibi đứng thẳng trực tiếp trên mặt đường, loại bỏ phần khung giọt nước nhọn truyền thống, có lớp bóng đổ tiếp đất 3D mềm mại (`Ground Shadow`) tạo cảm giác vật thể đang đứng thực sự trong không gian.
3. `aura_circle` (Hào quang xung nhịp kép): Khung tròn Avatar cá nhân bao bọc bởi 2 vòng hào quang neon phát sáng chuyển động nhịp thở (`Dual Breathing Aura`), mang phong cách vị lai Cyberpunk.
4. `polaroid` (Thẻ ảnh Polaroid mini): Mô phỏng tấm thẻ ảnh chụp nghệ thuật lấy liền, hiển thị ảnh Story mới nhất kèm nhãn `LIVE` đỏ nhấp nháy trên góc thẻ.
5. `classic_teardrop` (Giọt nước cổ điển): Hình tượng giọt nước truyền thống với mũi nhọn chỉ thẳng vào tim đường toạ độ chính xác, hiển thị avatar người dùng ở trung tâm.

Bộ phân giải giao diện `resolveMarkerSkin` trong `mapMarkerHelpers.js` thực hiện tính toán ưu tiên và tạo mã HTML DOM động để nhúng vào lớp `L.divIcon` của Leaflet. Ngoài ra, hệ thống tích hợp thuật toán phân tán toạ độ đồng vị trí (`isCoLocated` trong bán kính < 60m) tự động thêm độ lệch vi mô (micro-offset) để các ghim của nhiều người đứng cùng một địa điểm không bị chồng lấp che khuất lẫn nhau.

#### Tác nhân (Actor)
Người dùng đã đăng ký tài khoản.

#### Tiền điều kiện (Preconditions)
Người dùng đã đăng nhập thành công vào hệ thống.

#### Luồng sự kiện chính (Main Flow)
1. Người dùng nhấn vào biểu tượng Tủ đồ ghim trên giao diện hoặc trong trang hồ sơ cá nhân (`ProfilePageView`).
2. Modal `PinWardrobeModal` hiển thị danh sách 5 chế độ Skin kèm ảnh xem trước trực quan và trạng thái đang áp dụng.
3. Người dùng chọn một Skin mong muốn (ví dụ: `zenly_3d`).
4. Giao diện xem trước của Modal cập nhật ngay lập tức diện mạo mới.
5. Người dùng nhấn nút "Lưu thay đổi".
6. Hệ thống gửi yêu cầu cập nhật hồ sơ tới REST API `POST /api/auth/profile` với trường `pinSkin: 'zenly_3d'`.
7. Máy chủ ghi nhận thay đổi vào CSDL bền vững (`vivu_database.json`) và bảng `profiles`.
8. Hệ thống phát sự kiện `gps:update` đồng bộ diện mạo mới tới máy chủ và máy chủ broadcast tới tất cả người dùng khác.
9. Marker của người dùng trên bản đồ của chính mình và bạn bè được tái dựng lại với skin mới.

#### Luồng rẽ nhánh & Ngoại lệ (Alternative & Exception Flows)
- **Alt-1 (Người dùng chưa chọn Chibi khi dùng skin `zenly_3d`)**: Hệ thống tự động hiển thị gợi ý mở bảng chọn Chibi Mascot để ghim hiển thị đầy đủ linh hồn nhân vật.

#### Hậu điều kiện (Postconditions)
Giao diện điểm ghim của người dùng được cập nhật trên bản đồ và được lưu trữ bền vững trong hồ sơ tài khoản.

#### Giao diện & Mã nguồn liên quan
- Frontend: `frontend/src/components/profile/PinWardrobeModal.jsx` (dòng 1-275), `frontend/src/components/map/mapMarkerHelpers.js` (dòng 1-402), `frontend/src/components/profile/ProfilePageView.jsx` (dòng 1-449).
- Backend: `backend/src/controllers/authController.js` (dòng 214-283), `backend/src/services/dbService.js` (dòng 671-756).

#### Dữ liệu đầu vào / đầu ra
- **Input (`POST /api/auth/profile`)**:
  ```json
  {
    "userId": "user-1710500000000-abc12",
    "pinSkin": "zenly_3d"
  }
  ```
- **Output (`200 OK`)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "user-1710500000000-abc12",
      "pin_skin": "zenly_3d",
      "updated_at": "2026-11-16T12:05:00.000Z"
    }
  }
  ```

---

### 3.3. FR-03: Linh vật Chibi Mascot & Âm thanh biểu cảm (Chibi Mascot Universe & Procedural Sound Synth)

#### Mô tả chi tiết
Hệ thống cung cấp một vũ trụ linh vật biểu cảm phong phú gắn trực tiếp lên đỉnh điểm ghim bản đồ hoặc đại diện cho trạng thái hiện tại của người dùng:
1. **Hệ thống 3 Gia tộc Chibi VIVU (`chibiMascotData.js`)**:
   - Gia tộc Bé Giọt Nước VIVU (`droplet`): Linh vật biểu trưng của ứng dụng với hình tượng giọt nước đáng yêu.
   - Gia tộc Thú Cưng Meme Gen Z (`meme_pets`): Mèo béo, cún ngơ, gấu trúc, ếch xanh meme.
   - Gia tộc Bạn Trẻ Anime (`anime`): Phong cách nhân vật hoạt hình Nhật Bản biểu cảm sắc nét.
   - 12 Sắc thái cảm xúc độc quyền: `troll` (chọc ghẹo), `angry` (giận dữ), `happy` (vui sướng), `hungry` (đói bụng), `tired` (mệt mỏi), `lazy` (lười biếng), `sleepy` (buồn ngủ), `love` (yêu thương), `shocked` (sửng sốt), `cool` (ngầu lòi), `drunk` (say xỉn), `rich` (đại gia phát tài).
   - 100% Đồ hoạ Vector SVG sắc nét, dựng động không phụ thuộc ảnh bitmap tĩnh (`svgToDataUrl`).
2. **Bộ Tổng hợp Âm thanh Biểu cảm Thủ tục (Web Audio Procedural Synthesizer)**:
   - Hệ thống không sử dụng các file MP3 âm thanh rời để phát âm thanh linh vật mà sử dụng trực tiếp Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`, `BiquadFilterNode`).
   - Hàm `playChibiSound(soundType)` tổng hợp sóng âm đặc trưng cho từng trạng thái: Sóng Sawtooth nảy lò xo cho trạng thái `troll`, tiếng xì khói White Noise cho `angry`, hợp âm rải Arpeggio sóng Triangle 3 nốt cho `happy`, xung nhịp siêu trầm Sub-bass 55Hz cho `hungry`, và nhịp đập tim đôi Sine Wave cho `love`.
3. **Bộ Mascot Kinh Điển Phong Cách Messenger / Zalo (`messengerZaloMascotData.js`)**:
   - 4 dòng nhân vật quen thuộc: Mèo Béo Ami, Khủng Long Xanh QooBee, Quỳnh Aka & Tuzki, Mèo Pusheen & Chuột Capybara.
   - 7 hoạt cảnh di chuyển độc quyền: `scooter` (vi vu xe máy), `boba` (hút trà sữa trân châu), `deadline` (ôm laptop chạy deadline), `sleep` (trùm chăn ngủ nướng), `eat` (gặm đùi gà), `troll` (cầm dép tổ ong chọi), `love` (bắn tim bùm bùm).
4. **Cơ chế Tự hủy & Đếm ngược Thời gian (Self-Expiring Chibi Engine)**:
   - Linh vật có thể được gán thời hạn tồn tại (`chibiExpiresAt`, mặc định 24h hoặc tùy chỉnh).
   - Điểm ghim trên bản đồ hiển thị bộ đếm ngược thời gian còn lại (`formatRemainingChibiTime`). Khi hết hạn, Backend `dbService.js` (dòng 416-424) tự động thanh lọc `custom_chibi = null` và đưa ghim về trạng thái cơ bản.

#### Tác nhân (Actor)
Người dùng đã đăng ký tài khoản.

#### Tiền điều kiện (Preconditions)
Người dùng đã đăng nhập và đang mở bảng điều khiển cá nhân hoặc khay trạng thái nhanh.

#### Luồng sự kiện chính (Main Flow)
1. Người dùng mở `PinWardrobeModal` hoặc `ChibiVoiceModal`.
2. Danh sách linh vật Chibi hiển thị trực quan theo từng gia tộc và cảm xúc.
3. Người dùng chạm vào một Chibi bất kỳ để nghe thử âm thanh.
4. Trình duyệt gọi hàm `playChibiSound(type)`, khởi tạo `AudioContext` và phát ra chuỗi âm thanh tổng hợp tương ứng ngay tức thì.
5. Người dùng xác nhận "Chọn linh vật này" và chọn thời hạn hiển thị (ví dụ: 12 giờ).
6. Hệ thống gửi yêu cầu cập nhật tới máy chủ qua `POST /api/gps/update` hoặc `POST /api/auth/profile` với `{ customChibi, chibiExpiresAt, pinMascot, pinAction }`.
7. Máy chủ lưu trữ vào CSDL và phát sóng tới bạn bè.
8. Trên bản đồ, Chibi xuất hiện chuyển động nhấp nhô trên đầu marker của người dùng. Khi bạn bè chạm vào marker, âm thanh synth của Chibi sẽ tự động kích hoạt.

#### Luồng rẽ nhánh & Ngoại lệ (Alternative & Exception Flows)
- **Alt-1 (Trình duyệt chưa tương tác âm thanh - AudioContext Autoplay Policy)**: Nếu người dùng chưa chạm vào màn hình lần nào, `AudioContext` có thể bị tạm dừng (suspended). Hàm phát âm thanh tự động gọi `audioCtx.resume()` trước khi phát sóng âm để đảm bảo không bị nghẽn tiếng.

#### Hậu điều kiện (Postconditions)
Linh vật Chibi và hoạt cảnh được trang bị trên marker bản đồ, phát ra âm thanh biểu cảm khi tương tác và tự động hết hạn khi chạm mốc thời gian quy định.

#### Giao diện & Mã nguồn liên quan
- Frontend: `frontend/src/data/chibiMascotData.js` (dòng 1-912), `frontend/src/data/messengerZaloMascotData.js` (dòng 1-438), `frontend/src/components/profile/PinWardrobeModal.jsx` (dòng 1-275), `frontend/src/components/map/mapMarkerHelpers.js` (dòng 1-402).
- Backend: `backend/src/services/dbService.js` (dòng 416-424, dòng 780-840), `backend/src/controllers/gpsController.js` (dòng 13-24).

#### Dữ liệu đầu vào / đầu ra
- **Input Payload (`POST /api/gps/update`)**:
  ```json
  {
    "userId": "user-1710500000000-abc12",
    "customChibi": "water-happy",
    "chibiExpiresAt": 1710586400000,
    "pinMascot": "ami_fat_cat",
    "pinAction": "scooter"
  }
  ```
- **Output Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "user-1710500000000-abc12",
      "custom_chibi": "water-happy",
      "chibi_expires_at": 1710586400000,
      "pin_mascot": "ami_fat_cat",
      "pin_action": "scooter"
    }
  }
  ```

---

### 3.4. FR-04: Tâm trạng & Nhạc cá nhân Apple Music (Mood Status & Apple Music Integration)

#### Mô tả chi tiết
Tính năng cho phép người dùng thể hiện trạng thái tinh thần và gu âm nhạc cá nhân trực tiếp trên không gian bản đồ thực tế:
1. **Cập nhật Tâm trạng Thời gian thực (Mood / Custom Status)**:
   - Thông qua khay trạng thái nhanh `QuickStatusSheet.jsx`, người dùng có thể nhập suy nghĩ tự do (tối đa 100 ký tự) hoặc chọn các trạng thái gợi ý có sẵn ("Đang chạy deadline ☕", "Tìm người đi dạo phố 🛵", "Đói bụng quá 🍕").
   - Dòng trạng thái nổi bật trong một bong bóng hội thoại (Chat Bubble) màu đen mờ kính Cyberpunk ngay trên đầu marker ghim của người dùng trên bản đồ.
2. **Tích hợp Kho Nhạc Apple Music / iTunes CDN (`trendingSongs.js`)**:
   - Kho nhạc tích hợp sẵn 21 ca khúc thịnh hành (V-Pop, US-UK, Lofi, K-Pop) kèm link stream audio chất lượng cao định dạng AAC/M4A 30 giây được cung cấp trực tiếp từ máy chủ Apple Music / iTunes CDN (`https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/`).
   - Tích hợp tìm kiếm trực tuyến thời gian thực: Hàm `searchOnlineSongs(query)` gửi truy vấn trực tiếp tới iTunes Search API công khai (`https://itunes.apple.com/search?term=${query}&media=music&entity=song&limit=25`) kèm kỹ thuật Debounce 350ms tại `MusicPickerModal.jsx` để tối ưu số lượng request mạng.
3. **Bộ Phát Âm Thanh Singleton (WebAudioStoryPlayer)**:
   - Quản lý luồng phát nhạc duy nhất trên toàn ứng dụng bằng mô hình Singleton Pattern (`WebAudioStoryPlayer.js`). Đảm bảo khi một bài hát mới được bật, bài hát cũ đang phát sẽ tự động mờ dần (Fade-out) và dừng lại, triệt tiêu hiện tượng phát đè âm thanh (Audio overlapping).
   - Hỗ trợ chế độ lặp vô tận (`loop: true`).
4. **Tương tác Phát nhạc Trực tiếp Trên Điểm Ghim Bản đồ**:
   - Trên bong bóng trạng thái của người dùng và bạn bè có nút biểu tượng nốt nhạc (`btn-play-owner-song` hoặc `btn-play-peer-song`).
   - Người dùng có thể nhấn vào để nghe bài hát đại diện của bạn bè ngay trên bản đồ mà không cần mở trang cá nhân. Khi bài hát đang phát, biểu tượng đĩa nhạc hoặc sóng âm thanh sẽ xoay tròn và phát ra vòng sóng nhịp điệu.

#### Tác nhân (Actor)
Người dùng đã đăng ký tài khoản.

#### Tiền điều kiện (Preconditions)
Người dùng đã đăng nhập vào hệ thống.

#### Luồng sự kiện chính (Main Flow)
1. Người dùng mở `QuickStatusSheet` từ thanh công cụ hoặc từ trang cá nhân.
2. Người dùng nhập câu tâm trạng: "Chiều nay đi cafe sách không mọi người?".
3. Người dùng bấm nút "Chọn bài hát" để mở `MusicPickerModal`.
4. Danh sách 21 bài hát thịnh hành hiển thị. Người dùng có thể nghe thử bằng cách bấm nút Play nhỏ ở mỗi dòng, hoặc gõ từ khoá tìm kiếm trên thanh tìm kiếm trực tuyến iTunes.
5. Người dùng chọn bài hát "Nơi Này Có Anh - Sơn Tùng M-TP" và nhấn "Xác nhận ghim bài hát".
6. Người dùng chọn thời hạn hiển thị (mặc định 24h) và nhấn "Cập nhật trạng thái".
7. Giao diện gửi yêu cầu REST `POST /api/gps/update` với `{ customStatus, customSong: { id, title, artist, audioUrl } }`.
8. Máy chủ lưu trữ vào database và phát sóng socket event `gps:peer-update`.
9. Trên bản đồ của bạn bè, bong bóng trạng thái của người dùng cập nhật câu thoại kèm biểu tượng nốt nhạc. Bạn bè nhấn vào nút nốt nhạc để thưởng thức đoạn nhạc được ghim.

#### Luồng rẽ nhánh & Ngoại lệ (Alternative & Exception Flows)
- **Alt-1 (Mạng ngắt quãng khi stream nhạc từ Apple Music CDN)**: Bộ phát `WebAudioStoryPlayer` bắt ngoại lệ `HTMLMediaElement error`, hiển thị thông báo lỗi nhẹ nhàng và tự động tắt nút xoay đĩa nhạc.

#### Hậu điều kiện (Postconditions)
Tâm trạng và bài hát Apple Music được hiển thị công khai trên điểm ghim bản đồ của người dùng và đồng bộ tới toàn bộ mạng lưới bạn bè.

#### Giao diện & Mã nguồn liên quan
- Frontend: `frontend/src/data/trendingSongs.js` (dòng 1-358), `frontend/src/components/story/MusicPickerModal.jsx` (dòng 1-281), `frontend/src/components/story/QuickStatusSheet.jsx` (dòng 1-449), `frontend/src/components/map/mapMarkerEvents.js` (dòng 32-41, 99-110).
- Backend: `backend/src/controllers/gpsController.js` (dòng 13-24), `backend/src/services/dbService.js` (dòng 760-845).

#### Dữ liệu đầu vào / đầu ra
- **Cấu trúc Dữ liệu Bài hát Ghim (`customSong`)**:
  ```json
  {
    "id": "itunes-1209540212",
    "title": "Nơi Này Có Anh",
    "artist": "Sơn Tùng M-TP",
    "albumCover": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/album.jpg/100x100bb.jpg",
    "audioUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/preview.m4a"
  }
  ```

---

### 3.5. FR-05: Story định vị 24h & BeReal (24h Geotagged Stories & Dual Camera)

#### Mô tả chi tiết
Phân hệ Story định vị 24h cho phép người dùng chia sẻ những khoảnh khắc đời thực gắn liền với toạ độ địa lý chính xác, biến bản đồ số thành một cuốn nhật ký không gian sống động:
1. **Xưởng Sáng Tạo Story Đa Năng (StoryStudioModal)**:
   - Chế độ Camera BeReal Kép (`DualCameraOverlay.jsx`): Tự động ghi lại khoảnh khắc chân thực bằng cả camera trước và camera sau. Cho phép người dùng chạm để hoán đổi vị trí ảnh chính và ảnh phụ (`handleSwapDual`).
   - Chế độ Tải ảnh từ thư viện thiết bị (`handleGalleryFileSelect`) kèm tính năng nén Canvas thông minh.
   - Chế độ Văn bản Nền màu Gradient (`mode: 'TEXT'`): Hỗ trợ các mẫu nền gradient nghệ thuật Cyberpunk, Sunset, Neon.
2. **Bộ Công Cụ Chỉnh Sửa Chuyên Nghiệp (Story Editor Tools)**:
   - Bộ lọc màu sắc (`StoryFiltersAdjuster`): Normal, Warm, Vintage, Noir, Cyber, Neon; tinh chỉnh độ sáng, độ bão hoà, tương phản và góc tối (Vignette).
   - Soạn thảo văn bản nghệ thuật (`StoryTextEditor`): Chèn văn bản kéo thả tự do, đổi màu sắc và kích thước font chữ.
   - Nhãn dán tương tác (`StoryStickerPicker`): Nhãn dán Sticker cảm xúc, Sticker khảo sát bình chọn (Poll) 2 phương án, Sticker hỏi đáp (Q&A) tương tác.
   - Đính kèm bài hát bản quyền Apple Music từ kho nhạc trực tuyến.
   - Gắn thẻ bạn bè (`taggedFriends`) và thiết lập quyền riêng tư (`public`, `friends`, `private`).
3. **Hiển Thị Story Trên Không Gian Bản Đồ**:
   - Điểm ghim của người dùng có Story đang hoạt động sẽ xuất hiện một khung ảnh động mini (`vivu-story-gif-box`) bay lơ lửng ngay trên đầu marker kèm vòng tròn hào quang hồng neon nhấp nháy chuyển động nhịp thở (`vivuGifBreath`).
   - Người dùng khác nhấn vào khung ảnh để mở Trình xem Story toàn màn hình.
4. **Trình Chiếu Story Tương Tác Toàn Màn Hình (StoryViewerModal)**:
   - Tự động kích hoạt bài hát gắn kèm của Story qua `storyAudioPlayer.playSong(resolvedStoryMusic, { loop: true })`.
   - Hiển thị thanh tiến trình thời gian Story (Story Progress Bars) theo danh sách các story của tác giả.
   - Cho phép người xem tham gia biểu quyết bình chọn trực tiếp trên sticker Poll, gửi câu trả lời cho sticker Q&A, thả biểu cảm tim bay (`StoryFloatingReactions`) và xem vị trí chụp trên bản đồ radar mini (`StoryMiniMapRadar`).
5. **Động Cơ Bulletproof Tự Hủy Sau 24 Giờ (24-Hour Expiry Guard & Auto Cleanup)**:
   - Khi tạo story: Hệ thống tự động gán mốc hết hạn `expires_at = created_at + expiry_hours * 3600000` (mặc định 24 giờ).
   - Cơ chế bảo vệ kép:
     - Phía máy khách: Tự động tính toán số giờ còn lại (`formatRemainingTime`) và ẩn story khi hết hạn.
     - Phía máy chủ (`dbService.js:35-48`): Mỗi khi có yêu cầu truy vấn danh sách story (`GET /api/stories`), hệ thống tự động quét và lọc sạch các story đã quá hạn khỏi bộ nhớ RAM, đồng thời ghi đĩa CSDL ngay lập tức.
     - Tự động dọn dẹp bài hát ghim: Khi một story bị xóa hoặc hết hạn, nếu tác giả không còn story nào khác chứa nhạc, hệ thống tự động thu hồi trường `custom_song` trong hồ sơ `profiles` để tránh rác dữ liệu.

#### Tác nhân (Actor)
Người dùng đã đăng ký tài khoản.

#### Tiền điều kiện (Preconditions)
Người dùng đã đăng nhập, thiết bị đã cấp quyền Camera và Geolocation.

#### Luồng sự kiện chính (Main Flow)
1. Người dùng nhấn nút dấu cộng (+) nhô cao ở giữa thanh Dock điều hướng đáy (`VivuBottomDock`).
2. Bảng chọn loại bài đăng `PostTypeActionSheet` hiển thị, người dùng chọn "Đăng Story Định Vị".
3. Giao diện `StoryStudioModal` mở ra, camera kích hoạt. Người dùng chụp ảnh BeReal kép (camera sau chụp cảnh quan, camera trước chụp khuôn mặt).
4. Người dùng áp dụng bộ lọc màu Cyber, chèn một câu văn bản "Cuối tuần vi vu phố đi bộ ✨", dán sticker bình chọn "Đi ăn kem không? - Đi / Thôi", và đính kèm bài hát Apple Music.
5. Người dùng nhấn nút "Đăng Story (24h)".
6. Hệ thống lấy toạ độ GPS hiện tại kèm độ lệch ngẫu nhiên nhỏ (`lat_offset`, `lng_offset` để tránh đè marker).
7. Client gửi request `POST /api/stories` với toàn bộ payload dữ liệu.
8. Máy chủ chèn story mới vào đầu danh sách `stories.unshift()`, tính toán `expires_at`, lưu đĩa CSDL an toàn và phát sóng tới các client qua socket.
9. Marker của người dùng trên bản đồ xuất hiện khung ảnh Story lơ lửng, phát hào quang hồng neon.

#### Luồng rẽ nhánh & Ngoại lệ (Alternative & Exception Flows)
- **Alt-1 (Người dùng xóa Story thủ công)**: Tác giả mở trình xem story của mình, nhấn nút menu "Xóa Story này". Client gửi `DELETE /api/stories/:storyId`. Máy chủ xóa bản ghi, thu hồi bài hát ghim nếu không còn story nào khác, và cập nhật lại giao diện bản đồ.
- **Alt-2 (Story chứa ảnh kích thước quá lớn)**: Bộ nén ảnh `imageCompressor` tự động nén ảnh về định dạng tối ưu trước khi gửi lên API để không làm nghẽn băng thông mạng.

#### Hậu điều kiện (Postconditions)
Story định vị được xuất bản thành công trên bản đồ, bạn bè có thể xem và tương tác toàn màn hình, và story tự động biến mất vĩnh viễn sau đúng 24 giờ.

#### Giao diện & Mã nguồn liên quan
- Frontend: `frontend/src/components/story/StoryStudioModal.jsx` (dòng 1-379), `frontend/src/components/story/StoryViewerModal.jsx` (dòng 1-374), `frontend/src/components/story/camera/DualCameraOverlay.jsx`, `frontend/src/components/story/editor/StoryFiltersAdjuster.jsx`, `frontend/src/components/map/mapMarkerHelpers.js` (dòng 140-154).
- Backend: `backend/src/routes/storyRoutes.js` (dòng 1-18), `backend/src/controllers/storyController.js` (dòng 1-70), `backend/src/services/dbService.js` (dòng 21-223).

#### Dữ liệu đầu vào / đầu ra
- **Cấu trúc Dữ liệu Tạo Story (`POST /api/stories`)**:
  ```json
  {
    "title": "Vi vu phố đi bộ Nguyễn Huệ",
    "host_id": "user-1710500000000-abc12",
    "user_code": "VU-7115",
    "host_name": "Đức Tùng",
    "host_avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=ductung",
    "category": "moment",
    "lat": 10.776889,
    "lng": 106.700806,
    "expiry_hours": 24,
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD",
    "dual_image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD",
    "is_dual_cam": true,
    "filter_id": "cyber",
    "texts": [{ "text": "Cuối tuần vi vu ✨", "x": 50, "y": 80, "color": "#00E5FF", "size": 20 }],
    "stickers": [{ "id": "stk-1", "type": "poll", "question": "Đi ăn kem?", "votes": { "0": [], "1": [] } }],
    "music": { "id": "itunes-123", "title": "Nơi Này Có Anh", "artist": "Sơn Tùng M-TP" },
    "privacy": "friends"
  }
  ```

---

### 3.6. FR-06: Hệ thống Kết bạn & Định danh VU-XXXX (Friend System & Unique User Identification)

#### Mô tả chi tiết
Hệ thống thiết lập một mạng lưới quan hệ xã hội an toàn, có kiểm soát và tôn trọng quyền riêng tư giữa các người dùng:
1. **Cơ chế Định danh Độc nhất (Unique User Identification)**:
   - Mỗi tài khoản khi đăng ký thành công trên VIVU được hệ thống tự động sinh và cấp phát một mã định danh duy nhất định dạng `VU-XXXX` (trong đó `XXXX` là chuỗi 4 chữ số ngẫu nhiên không trùng lặp, ví dụ: `VU-7115`, được quy định tại `dbService.js:770`).
   - Mã `VU-XXXX` giúp người dùng dễ dàng tìm kiếm và kết nối với nhau mà không bắt buộc phải chia sẻ số điện thoại cá nhân hoặc email riêng tư.
2. **Tìm Kiếm Người Dùng Đa Tiêu Chí**:
   - Endpoint `GET /api/friends/search?q={query}&currentUserId={id}` cho phép tìm kiếm người dùng theo: Tên hiển thị, Email, Số điện thoại hoặc chính xác Mã `user_code` (`VU-XXXX`).
   - Kết quả tìm kiếm tự động loại trừ chính bản thân người gửi và tự động tính toán trạng thái quan hệ tương ứng (`none`, `friends`, `pending_sent`, `pending_received`).
3. **Giao Thức Quản Lý Vòng Đời Lời Mời Kết Bạn (Friendship Lifecycle Protocol)**:
   - Quản lý toàn diện 5 trạng thái thông qua `FriendshipManagerModal.jsx` và `friendController.js`:
     - `Gửi lời mời kết bạn (POST /api/friends/request)`: Tạo bản ghi `friendRequests` trạng thái `pending`. Tự động tạo thông báo thông minh chống trùng (Idempotent Notification `notif-freq-${toUserId}-${requestId}`) và phát socket `friend-request:incoming` cho người nhận. Đặc biệt: Nếu đối phương trước đó đã từng gửi lời mời cho mình, hệ thống sẽ tự động phát hiện và chuyển sang chấp nhận kết bạn tức thì (Mutual Auto-Accept).
     - `Chấp nhận lời mời (POST /api/friends/accept)`: Chỉ người nhận mới có quyền chấp nhận. Hệ thống tạo bản ghi quan hệ hai chiều trong bảng `friendships` với định danh chuẩn hoá sắp xếp `fs-${[userA, userB].sort().join('--')}`, tạo thông báo kết bạn thành công cho cả hai bên, kích hoạt pháo hoa giấy Canvas Confetti và âm thanh chúc mừng, đồng thời phát socket `friend:accepted`.
     - `Từ chối lời mời (POST /api/friends/reject)`: Chuyển trạng thái yêu cầu sang `rejected` và xóa vĩnh viễn thông báo kết bạn liên quan khỏi database.
     - `Thu hồi lời mời đã gửi (POST /api/friends/cancel)`: Cho phép người gửi thu hồi yêu cầu khi người nhận chưa phản hồi, tự động xóa sạch thông báo chờ bên phía người nhận.
     - `Hủy kết bạn (POST /api/friends/unfriend)`: Xóa bản ghi quan hệ bạn bè `fs-userA--userB` khỏi bảng `friendships`, đưa trạng thái quan hệ về `none` và phát socket `friend:unfriended` để hai bên không còn thấy vị trí của nhau trên bản đồ.
4. **Chia sẻ Vị trí Bạn bè & Nhận diện Trực tuyến Siêu nhạy (Ultra-sensitive Online Detection)**:
   - Khi đã trở thành bạn bè chính thức, toạ độ của bạn bè sẽ được mở khoá và hiển thị marker trên bản đồ khi chuyển sang tab "Bạn Bè" (`activeTab === 'friends'`).
   - Thuật toán kiểm tra trạng thái trực tuyến: Người dùng được xác định là `is_online = true` nếu có tín hiệu heartbeat GPS trong vòng dưới **15 giây** (`Date.now() - lastSeenMs < 15000`). Trạng thái hiển thị kèm chấm xanh phát quang và diễn giải thân thiện bằng Tiếng Việt ("Đang trực tuyến", "Vừa mới đây", "5 phút trước", v.v.).

#### Tác nhân (Actor)
Người dùng đã đăng ký tài khoản.

#### Tiền điều kiện (Preconditions)
Người dùng đã đăng nhập vào hệ thống.

#### Luồng sự kiện chính (Main Flow)
1. Người dùng mở bảng điều khiển bạn bè `RightFriendshipPanel` hoặc `FriendshipManagerModal`.
2. Người dùng nhập mã `VU-8899` vào ô tìm kiếm.
3. Hệ thống trả về thông tin hồ sơ của bạn bè kèm nút "Thêm bạn bè".
4. Người dùng nhấn "Thêm bạn bè".
5. Client gửi yêu cầu `POST /api/friends/request` với `{ senderId, receiverId }`.
6. Máy chủ tạo bản ghi trong `friendRequests`, tạo thông báo và phát socket `friend-request:incoming` tới tài khoản nhận.
7. Người nhận thấy huy hiệu thông báo trên thanh chuông, mở danh sách lời mời và nhấn "Chấp nhận".
8. Client người nhận gọi `POST /api/friends/accept`.
9. Máy chủ thiết lập quan hệ bạn bè 2 chiều `fs-usrA--usrB`, gửi socket `friend:accepted` cho cả hai thiết bị.
10. Cả hai máy khách cùng kích hoạt hiệu ứng pháo hoa Confetti và nạp lại danh sách bạn bè trên bản đồ.

#### Luồng rẽ nhánh & Ngoại lệ (Alternative & Exception Flows)
- **Alt-1 (Người dùng tự gửi lời mời kết bạn cho chính mình)**: Máy chủ chặn lại với mã lỗi `400 Bad Request: "Không thể tự kết bạn với chính mình"`.
- **Alt-2 (Hai người đã là bạn bè từ trước)**: Máy chủ chặn gửi lại với mã lỗi `400 Bad Request: "Hai người đã là bạn bè"`.

#### Hậu điều kiện (Postconditions)
Quan hệ bạn bè chính thức được xác lập, toạ độ GPS và trạng thái hoạt động được chia sẻ qua lại hai chiều.

#### Giao diện & Mã nguồn liên quan
- Frontend: `frontend/src/components/friends/FriendshipManagerModal.jsx` (dòng 1-683), `frontend/src/components/friends/RightFriendshipPanel.jsx` (dòng 1-436), `frontend/src/components/friends/FriendsListSection.jsx` (dòng 1-145).
- Backend: `backend/src/routes/friendRoutes.js` (dòng 1-22), `backend/src/controllers/friendController.js` (dòng 1-144), `backend/src/services/dbService.js` (dòng 876-1129).

#### Dữ liệu đầu vào / đầu ra
- **Schema Bản ghi Lời Mời Kết Bạn (`friendRequests`)**:
  ```json
  {
    "id": "freq-1710500000000-xyz",
    "sender_id": "user-1",
    "sender_name": "Đức Tùng",
    "sender_avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=sender",
    "receiver_id": "user-2",
    "receiver_name": "Hải Yến",
    "receiver_avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=receiver",
    "status": "pending",
    "created_at": "2026-11-16T12:10:00.000Z"
  }
  ```
- **Schema Bản ghi Quan Hệ Bạn Bè (`friendships`)**:
  ```json
  {
    "id": "fs-user-1--user-2",
    "user_a_id": "user-1",
    "user_b_id": "user-2",
    "status": "active",
    "created_at": "2026-11-16T12:12:00.000Z"
  }
  ```

---

### 3.7. FR-07: Trò chuyện 1-1 thời gian thực & Vị trí trực tiếp (1-on-1 Real-time Chat & Live Location)

#### Mô tả chi tiết
Phân hệ liên lạc tức thời thời gian thực hoàn chỉnh giữa hai người dùng, tích hợp các công cụ hỗ trợ gặp gỡ định vị không gian:
1. **Khung Chat & Mã Phòng Hội Thoại Chuẩn Hóa**:
   - Giao diện: `MessengerChatView.jsx` (kết nối Hộp thư đến `MessengerInboxList` và Khung chat trực tiếp `MessengerActiveRoom`).
   - Mã định danh cuộc trò chuyện 1-1 chuẩn hóa: `conv-direct-${userIdA}--${userIdB}` (trong đó hai User ID được sắp xếp theo thứ tự từ điển, đảm bảo hai người luôn truy cập vào chung một phòng duy nhất).
2. **Đa Dạng Hóa Phương Thức Biểu Đạt Tin Nhắn**:
   - Tin nhắn văn bản đa ngôn ngữ (tối đa 2000 ký tự).
   - Tin nhắn đa phương tiện: Đính kèm hình ảnh và video ngắn truyền tải qua Base64 hoặc URL.
   - Thả tim bùng nổ: Gửi biểu tượng `❤️` hoặc nhấn nút tim nhanh sẽ kích hoạt cờ `is_heart: true`, hiển thị hoạt cảnh tim đỏ nhảy múa kích thước lớn.
   - Tin nhắn Troll Meme: Gửi ném cà chua, trứng thối kích hoạt hiệu ứng toàn màn hình đối phương (`MemeScreenTakeover`).
3. **Chia Sẻ Vị Trí Trực Tiếp (Live Location Engine)**:
   - Cho phép người dùng chia sẻ hành trình di chuyển thực tế của mình trong phòng chat với các mốc thời gian lựa chọn: 15 phút, 60 phút hoặc 8 giờ.
   - Tin nhắn Live Location (`LiveLocationCard.jsx`) hiển thị đồng hồ đếm ngược thời gian còn lại (`live_expires_at`), tốc độ di chuyển hiện tại (`speed` theo km/h), bản đồ nhỏ và nút "Dừng chia sẻ vị trí".
   - Chỉ chính chủ người gửi mới có quyền gọi API `POST /api/chat/messages/stop-live-location` để chủ động dừng chia sẻ trước hạn (`live_status = 'stopped'`).
4. **Chuỗi Thân Thiết Bạn Bè (Friendship Streak System)**:
   - Hệ thống tự động theo dõi tần suất trao đổi tin nhắn giữa hai người dùng.
   - Điểm số và cấp độ thân thiết Streak được tính toán động (`streakLevel = Math.max(1, Math.floor(messageCount / 3))`), hiển thị biểu tượng ngọn lửa 🔥 kèm cấp độ trên thanh tiêu đề phòng chat `MessengerRoomHeader`.
5. **Cơ Chế Chống Trùng Lặp & Trạng Thái Đã Đọc (Deduplication & Read Receipts)**:
   - Phòng vệ Idempotency: Mỗi tin nhắn phía client sinh ra một mã duy nhất `client_msg_id`. Máy chủ kiểm tra nếu đã tồn tại `client_msg_id` thì trả về bản ghi cũ, không tạo bản ghi mới trùng lặp khi client bị mất mạng và retry.
   - Trạng thái đã xem: Khi người nhận mở phòng chat, client gửi `POST /api/chat/messages/read`. Máy chủ cập nhật `read = true`, `read_at = timestamp` và phát socket `chat:read` để hiển thị biểu tượng tích xanh đôi `✓✓` bên phía người gửi.

#### Tác nhân (Actor)
Người dùng đã đăng ký tài khoản.

#### Tiền điều kiện (Preconditions)
Hai người dùng đã đăng nhập. Nếu người nhận cài đặt quyền riêng tư `message_privacy = 'friends_only'`, hai người bắt buộc phải là bạn bè trong bảng `friendships`.

#### Luồng sự kiện chính (Main Flow)
1. Người dùng mở tab Chat (`MessengerChatView`), chọn một cuộc trò chuyện từ danh sách hoặc bấm nút "Nhắn tin" trên marker bạn bè.
2. Phòng chat `MessengerActiveRoom` tải lịch sử tin nhắn qua API `GET /api/chat/:conversationId/messages`.
3. Người dùng nhập nội dung tin nhắn và nhấn "Gửi" (hoặc chọn gửi Live Location 60 phút).
4. Client phát sự kiện Socket.IO `chat:send` lên máy chủ.
5. Máy chủ nhận sự kiện, gọi `dbService.sendMessage()`:
   a. Kiểm tra phân quyền truy cập cuộc trò chuyện.
   b. Kiểm tra cài đặt riêng tư của người nhận.
   c. Lưu tin nhắn vào bảng `messages` trong `vivu_database.json`.
   d. Gửi xác nhận `chat:sent` cho người gửi.
   e. Phát sự kiện `chat:message` tới các kết nối socket của người nhận.
   f. Tạo thông báo tin nhắn mới gộp theo hội thoại (tiền tố `notif-conv-`).
6. Ứng dụng của người nhận phát chuông Ting-ting, hiển thị tin nhắn mới nổi trên màn hình và cập nhật danh sách hội thoại.

#### Luồng rẽ nhánh & Ngoại lệ (Alternative & Exception Flows)
- **Alt-1 (Người nhận cài đặt chỉ nhận tin từ bạn bè và hai người chưa kết bạn)**: Máy chủ từ chối tiếp nhận và trả về mã lỗi `403 Forbidden: "Người dùng này chỉ nhận tin nhắn từ bạn bè"`.
- **Alt-2 (Người gửi nhấn Dừng chia sẻ vị trí trực tiếp)**: Client gọi `POST /api/chat/messages/stop-live-location`. Thẻ vị trí trong chat cập nhật trạng thái đã kết thúc và không còn cập nhật toạ độ di chuyển.

#### Hậu điều kiện (Postconditions)
Tin nhắn được lưu trữ bền vững, truyền tải tới người nhận trong vòng dưới 50ms và hiển thị trạng thái đã xem khi được mở.

#### Giao diện & Mã nguồn liên quan
- Frontend: `frontend/src/components/chat/MessengerChatView.jsx` (dòng 1-288), `frontend/src/components/chat/MessengerActiveRoom.jsx` (dòng 1-425), `frontend/src/components/chat/LiveLocationCard.jsx` (dòng 1-145).
- Backend: `backend/src/routes/chatRoutes.js` (dòng 1-21), `backend/src/controllers/chatController.js` (dòng 1-152), `backend/src/services/dbService.js` (dòng 1132-1544).

#### Dữ liệu đầu vào / đầu ra
- **Payload Tin Nhắn Chat (`POST /api/chat/messages` hoặc Socket `chat:send`)**:
  ```json
  {
    "conversation_id": "conv-direct-usr1--usr2",
    "client_msg_id": "cmsg-1710500000000-xyz",
    "sender": "usr1",
    "sender_name": "Đức Tùng",
    "text": "Mình đang ở quán cafe này nhé!",
    "is_live_location": true,
    "live_duration_minutes": 60,
    "lat": 10.776889,
    "lng": 106.700806,
    "speed": 15.5
  }
  ```

---

### 3.8. FR-08: Vòng kết nối nhóm riêng (Custom Circles & Group Spatial Filtering)

#### Mô tả chi tiết
Phân hệ Vòng kết nối nhóm riêng (Circles) hỗ trợ việc tổ chức các cộng đồng nhỏ, nhóm bạn thân hoặc nhóm gia đình với tính năng lọc không gian độc quyền:
1. **Khởi Tạo Nhóm Riêng Tư (CreateCircleModal)**:
   - Người dùng có thể thiết lập: Tên nhóm, mô tả hoạt động, biểu tượng icon nhóm, ảnh đại diện và màu sắc viền Neon công nghệ (Electric Cyan, Neon Pink, Lime Green).
   - Chọn thành viên ban đầu từ danh sách bạn bè chính thức (`friends`).
   - Người tạo nhóm mặc định giữ vai trò Trưởng nhóm (`owner_id`), trạng thái `accepted`.
   - Máy chủ tự động tạo tin nhắn hệ thống chào mừng trong phòng chat nhóm: `"[Trưởng nhóm] đã tạo nhóm và thêm [N] thành viên"` và phát thông báo mời nhóm tới từng thành viên.
2. **Quản Lý Vòng Đời & Phân Quyền Thành Viên Nghiêm Ngặt (`GroupMembersModal`)**:
   - Hệ thống thực thi phân quyền kiểm soát truy cập (RBAC) nghiêm ngặt tại Backend (`dbService.js:1682-1933`):
     - `Chỉnh sửa nhóm (PUT /api/circles/:id)`: Bắt buộc quyền `owner` hoặc `admin`, người ngoài chặn `403 Forbidden`.
     - `Thêm thành viên trực tiếp (POST /api/circles/:id/add-members)`: Bắt buộc người thực hiện là thành viên hợp lệ của nhóm.
     - `Mời bạn bè (POST /api/circles/:id/invite)`: Gửi lời mời với trạng thái `pending`.
     - `Phản hồi lời mời (POST /api/circles/:id/respond)`: Người dùng chọn `accept` để vào nhóm hoặc `decline` để từ chối.
     - `Rời nhóm (POST /api/circles/:id/leave)`: Thành viên thường có thể rời nhóm bất kỳ lúc nào. Nếu Trưởng nhóm rời nhóm, bắt buộc phải chỉ định một thành viên khác làm Trưởng nhóm mới (`newOwnerId`); nếu nhóm không còn ai, hệ thống tự động giải tán nhóm.
     - `Xóa thành viên khỏi nhóm (POST /api/circles/:id/kick)`: **Chỉ duy nhất Trưởng nhóm** có quyền kick thành viên (trả về 403 nếu thành viên thường cố tình gọi). Phát socket `circle:kicked` cho người bị mời ra.
     - `Giải tán nhóm (DELETE /api/circles/:id)`: **Chỉ duy nhất Trưởng nhóm** có quyền giải tán toàn bộ nhóm.
3. **Bộ Lọc Không Gian Bản Đồ Theo Circle (Circle-Specific Spatial Filtering)**:
   - Khi người dùng nhấn nút "Xem trên Bản đồ" từ bảng chi tiết nhóm (`App.jsx:3064`), ứng dụng kích hoạt bộ lọc nhóm: `activeCircleFilter = circleObj`.
   - Cả hai engine bản đồ (`GoogleMapView.jsx` và `MapboxCanvas.jsx`) lập tức lọc danh sách điểm ghim hiển thị: **Chỉ giữ lại các marker của những thành viên nằm trong danh sách `circleObj.member_ids`**. Toàn bộ người lạ và bạn bè ngoài nhóm bị ẩn đi.
   - Giao diện hiển thị một thanh trạng thái lọc nhóm chuyên biệt trên đỉnh màn hình kèm tên nhóm, ảnh đại diện nhóm và nút "Đóng bộ lọc" (`onClearCircleFilter`) để quay lại chế độ hiển thị toàn bản đồ.

#### Tác nhân (Actor)
Trưởng nhóm Circle, Thành viên Circle.

#### Tiền điều kiện (Preconditions)
Người dùng đã đăng nhập vào hệ thống.

#### Luồng sự kiện chính (Main Flow)
1. Người dùng mở menu Circle và bấm "Tạo nhóm mới".
2. Modal `CreateCircleModal` hiển thị, người dùng nhập tên "Hội Đi Phượt Vũng Tàu", chọn màu Neon Cyan và tích chọn 3 người bạn.
3. Người dùng nhấn "Tạo nhóm".
4. Client gọi API `POST /api/circles`. Máy chủ tạo bản ghi Circle, gán người tạo làm `owner`, tạo phòng chat nhóm `circle-[id]`, gửi thông báo và phát socket `circle:member_joined`.
5. Trong danh sách nhóm, người dùng bấm "Xem trên bản đồ".
6. Biến `activeCircleFilter` được kích hoạt.
7. Bản đồ chuyển sang chế độ lọc nhóm: Chỉ hiển thị vị trí của 4 thành viên trong nhóm phượt.

#### Luồng rẽ nhánh & Ngoại lệ (Alternative & Exception Flows)
- **Alt-1 (Thành viên thường cố tình gửi API xóa thành viên khác)**: Máy chủ kiểm tra `circle.owner_id !== requesterId` và lập tức trả về mã lỗi `403 Forbidden: "Chỉ trưởng nhóm mới có quyền xóa thành viên"`.

#### Hậu điều kiện (Postconditions)
Nhóm Circle được tạo, quản lý bảo mật và cung cấp chế độ quan sát vị trí biệt lập trên bản đồ.

#### Giao diện & Mã nguồn liên quan
- Frontend: `frontend/src/components/circle/CreateCircleModal.jsx` (dòng 1-413), `frontend/src/components/chat/GroupMembersModal.jsx` (dòng 1-450), `frontend/src/App.jsx` (dòng 3060-3100).
- Backend: `backend/src/routes/circleRoutes.js` (dòng 1-22), `backend/src/controllers/circleController.js` (dòng 1-489), `backend/src/services/dbService.js` (dòng 1547-1933).

#### Dữ liệu đầu vào / đầu ra
- **Cấu trúc Thực thể Nhóm (`circles`)**:
  ```json
  {
    "id": "circle-1710500000000-xyz",
    "name": "Hội Đi Phượt Vũng Tàu",
    "description": "Nhóm đi phượt cuối tuần",
    "image": null,
    "privacy": "private",
    "owner_id": "user-1",
    "members": [
      { "user_id": "user-1", "role": "owner", "status": "accepted" },
      { "user_id": "user-2", "role": "member", "status": "accepted" }
    ],
    "member_ids": ["user-1", "user-2"],
    "created_at": "2026-11-16T12:20:00.000Z"
  }
  ```

---

### 3.9. FR-09: Bình chọn tương tác (Interactive Polls)

#### Mô tả chi tiết
Tính năng hỗ trợ ra quyết định tập thể một cách dân chủ, trực quan và thời gian thực trong các cuộc trò chuyện và nhóm bạn bè:
1. **Tạo Cuộc Bình Chọn Linh Hoạt (CreatePollModal)**:
   - Cho phép người dùng soạn thảo câu hỏi chủ đề (`pollTitle`) và thêm từ **2 đến 5 phương án lựa chọn** (`pollOptions`).
   - Bình chọn có thể được nhúng trực tiếp vào luồng trò chuyện 1-1, phòng chat nhóm Circle, hoặc dán dưới dạng Sticker tương tác trên Story định vị 24h.
2. **Cơ Chế Bỏ Phiếu Độc Quyền & Chuyển Phiếu Thông Minh (Smart Exclusive Voting)**:
   - Được hiện thực nghiêm ngặt tại Backend (`dbService.js:1502-1531`): Mỗi người dùng chỉ được sở hữu **tối đa 1 phiếu bầu duy nhất** trong một cuộc bình chọn.
   - Khi người dùng bấm chọn một phương án mới trong khi đã từng bỏ phiếu cho phương án cũ: Hệ thống tự động thu hồi `userId` khỏi danh sách `votes` của phương án cũ và chuyển sang phương án mới.
   - Nếu người dùng bấm lại vào chính phương án mình đã chọn: Hệ thống tự động rút lại phiếu bầu (Toggle/Unvote).
3. **Đồng Bộ & Phát Sóng Kết Quả Thời Gian Thực (Real-time Broadcast)**:
   - Thẻ bình chọn trong chat (`ChatPollCard.jsx`) hiển thị trực quan tỷ lệ phần trăm bình chọn cho từng phương án theo thanh tiến trình màu sắc (`percent = (voteCount / totalVotes) * 100`).
   - Ngay khi một thành viên bỏ phiếu, máy chủ phát sự kiện Socket.IO `chat:poll_updated` tới tất cả các thành viên đang mở cuộc trò chuyện. Giao diện của tất cả mọi người lập tức cập nhật lại tỷ lệ phiếu mà không cần tải lại trang.

#### Tác nhân (Actor)
Thành viên cuộc trò chuyện hoặc Thành viên Circle.

#### Tiền điều kiện (Preconditions)
Người dùng đang tham gia vào cuộc hội thoại tương ứng.

#### Luồng sự kiện chính (Main Flow)
1. Trong phòng chat, người dùng mở khay công cụ `MessengerToolsDrawer` và bấm "Tạo bình chọn".
2. Modal `CreatePollModal` mở ra, người dùng nhập câu hỏi "Trưa nay ăn gì?", thêm 3 phương án: "Cơm tấm", "Bún bò", "Phở bò".
3. Người dùng nhấn "Tạo bình chọn".
4. Client gửi tin nhắn với cờ `is_poll: true` kèm cấu trúc dữ liệu `poll`.
5. Thẻ bình chọn xuất hiện trong khung chat của các thành viên.
6. Một thành viên nhấn chọn phương án "Cơm tấm".
7. Client gửi yêu cầu `POST /api/chat/messages/:messageId/poll-vote` với `{ optionId: 'opt-1', userId }`.
8. Máy chủ ghi nhận phiếu bầu, tính toán lại và phát socket `chat:poll_updated`.
9. Thẻ bình chọn trên máy của tất cả mọi người lập tức tăng thanh phần trăm của "Cơm tấm".

#### Luồng rẽ nhánh & Ngoại lệ (Alternative & Exception Flows)
- **Alt-1 (Người dùng đổi ý muốn chọn Phở bò)**: Người dùng nhấn vào "Phở bò". Hệ thống tự động trừ 1 phiếu bên "Cơm tấm" và cộng 1 phiếu sang "Phở bò", đảm bảo tổng số phiếu luôn bảo toàn chính xác.

#### Hậu điều kiện (Postconditions)
Kết quả bình chọn được cập nhật chính xác và phản ánh trung thực ý kiến tập thể theo thời gian thực.

#### Giao diện & Mã nguồn liên quan
- Frontend: `frontend/src/components/chat/CreatePollModal.jsx` (dòng 1-158), `frontend/src/components/chat/ChatPollCard.jsx` (dòng 1-145).
- Backend: `backend/src/controllers/chatController.js` (dòng 129-152), `backend/src/services/dbService.js` (dòng 1502-1531).

#### Dữ liệu đầu vào / đầu ra
- **Cấu trúc Thực thể Bình chọn trong Tin nhắn (`messages.poll`)**:
  ```json
  {
    "id": "poll-msg-1710500000000",
    "title": "Trưa nay ăn gì?",
    "options": [
      { "id": "opt-1", "text": "Cơm tấm", "votes": ["user-1"] },
      { "id": "opt-2", "text": "Bún bò", "votes": ["user-2", "user-3"] },
      { "id": "opt-3", "text": "Phở bò", "votes": [] }
    ]
  }
  ```

---

### 3.10. FR-10: Cụng ly tương tác vật lý (Proximity Bump & Spatial 3D Clink)

#### Mô tả chi tiết
Một trong những tính năng đột phá nhất của VIVU, kết hợp cảm biến không gian thực tế và đồ hoạ 3D WebGL để kết nối hai người bạn ngoài đời thực:
1. **Cơ Chế Kích Hoạt 3 Điều Kiện Kép (Multi-Condition Proximity Trigger)**:
   - Được quản lý tại hook `useProximityDetector.js`:
     1. Cự ly khoảng cách GPS: Sử dụng công thức Haversine tính toán khoảng cách thực giữa 2 người bạn đang online. Hai người phải ở cự ly siêu gần **$\le 15$ mét** (`dist <= 15m`).
     2. Cảm biến gia tốc rung lắc (Accelerometer Shake): Lắng nghe sự kiện W3C `devicemotion`. Tính toán biến thiên độ biến thiên gia tốc ba trục: $\Delta X + \Delta Y + \Delta Z > 24 \text{ m/s}^2$. Đồng thời áp dụng bộ lọc khử nhiễu chống kích hoạt lặp lại trong 3.5 giây (`now - lastShakeTime > 3500ms`).
     3. Kích hoạt thủ công: Nếu thiết bị không hỗ trợ cảm biến gia tốc (Desktop), khi hai người ở trong bán kính 15m, banner `ProximityBumpBanner.jsx` sẽ xuất hiện ở đỉnh màn hình kèm nút bấm "Cụng Ly Ngay".
2. **Trình Diễn Hoạt Cảnh Không Gian 3D (SpatialBumpModal3D - Three.js r186)**:
   - Hoạt cảnh được dàn dựng thành 3 giai đoạn điện ảnh (3 Cinematic Phases):
     - `Giai đoạn 1 - APPROACH`: Hai chiếc ly cocktail thủy tinh 3D (`leftGlass` màu Cyan phát quang và `rightGlass` màu Rose hồng neon) bay từ hai góc màn hình lao về trung tâm với góc nghiêng mô phỏng chuyển động tay người thật.
     - `Giai đoạn 2 - CLINK`: Đúng thời điểm hai ly chạm nhau tại tâm toạ độ (x = 0):
       - Hệ thống kích hoạt bộ tổng hợp âm thanh pha lê Web Audio API (`playGlassClinkSound()`): Tạo sóng Sine 2250Hz trượt xuống 2200Hz kết hợp họa âm bội 2 sóng Triangle 4500Hz, mô phỏng hoàn hảo tiếng chạm của hai ly rượu thủy tinh cao cấp ngoài đời thực.
       - Bùng nổ hệ thống hạt lóe sáng (Three.js Particle System 120 điểm sáng với vật liệu phát quang `THREE.AdditiveBlending`).
       - Kích hoạt rung phản hồi xúc giác điện thoại qua `navigator.vibrate([80, 50, 120])`.
       - Bắn pháo hoa giấy chúc mừng bùng nổ qua `canvas-confetti`.
     - `Giai đoạn 3 - CELEBRATE`: Hiển thị khung popup chúc mừng cuộc hội ngộ, hiển thị avatar và tên của hai người bạn.
3. **Kết Quả Nghiệp Vụ - Tự Động Xuất Bản Story Đôi (Joint Story Creation)**:
   - Khi cụng ly thành công, client phát sự kiện Socket `spatial:bump-initiate` lên máy chủ.
   - Máy chủ `socketService.js:171-227` tự động xuất bản một bài **Story Đôi (Joint Story)** gắn toạ độ gặp gỡ lên bản đồ:
     - Tiêu đề: `🎉 [Tên A] & [Tên B] đang vi vu cùng nhau!`.
     - Mô tả: `Vừa cụm ly gặp gỡ ngoài đời thực tại tọa độ [lat, lng]!`.
     - Đánh dấu thuộc tính: `is_joint: true`, đính kèm `partner_id`, `partner_name`, `partner_avatar`.
     - Thời hạn tồn tại: Tự động hết hạn và tự hủy sau **6 giờ** (`expiry_hours: 6`).
     - Phát socket event `spatial:bump-trigger` cho cả 2 máy và `stories:new` cho toàn bộ người dùng trên bản đồ.

#### Tác nhân (Actor)
Hai người dùng đang ở gần nhau ngoài đời thực (< 15 mét).

#### Tiền điều kiện (Preconditions)
Cả hai người dùng đều đang đăng nhập, bật GPS và đứng cách nhau trong phạm vi 15 mét.

#### Luồng sự kiện chính (Main Flow)
1. Hai người bạn gặp nhau tại một quán cà phê. Hook `useProximityDetector` trên cả hai máy phát hiện cự ly Haversine giữa hai người là 8 mét.
2. Banner `ProximityBumpBanner` xuất hiện trên màn hình của cả hai thiết bị.
3. Hai người cùng nâng điện thoại cụng nhẹ vào nhau (hoặc bấm nút "Cụng Ly").
4. Cảm biến `devicemotion` ghi nhận gia tốc lắc vượt ngưỡng 24 m/s².
5. Client phát sự kiện Socket.IO `spatial:bump-initiate` lên máy chủ.
6. Máy chủ tạo Story đôi (thời hạn 6h), phát sự kiện `spatial:bump-trigger` tới cả hai thiết bị.
7. Modal `SpatialBumpModal3D` tự động bung mở trên màn hình cả hai máy:
   - Hai ly cocktail 3D bay vào giữa màn hình và va chạm.
   - Tiếng keng pha lê vang lên chân thực, điện thoại rung haptic và pháo hoa giấy nổ tung.
8. Hoạt cảnh kết thúc, bài Story đôi xuất hiện trên bản đồ đánh dấu khoảnh khắc gặp gỡ của hai người bạn.

#### Luồng rẽ nhánh & Ngoại lệ (Alternative & Exception Flows)
- **Alt-1 (Người dùng vô tình lắc máy khi không có bạn bè nào ở gần < 15m)**: Hệ thống bỏ qua sự kiện rung lắc, không thực hiện bất kỳ hành vi nào để tránh gây phiền toái.

#### Hậu điều kiện (Postconditions)
Màn hình 3D hoàn thành tương tác, âm thanh và rung haptic được thực thi, một Story đôi đặc biệt được tạo lập trên bản đồ trong 6 giờ.

#### Giao diện & Mã nguồn liên quan
- Frontend: `frontend/src/hooks/useProximityDetector.js` (dòng 1-120), `frontend/src/components/bump/SpatialBumpModal3D.jsx` (dòng 1-456), `frontend/src/components/bump/ProximityBumpBanner.jsx` (dòng 1-98).
- Backend: `backend/src/services/socketService.js` (dòng 171-227), `backend/src/services/dbService.js` (dòng 56-106).

#### Dữ liệu đầu vào / đầu ra
- **Socket Payload Khởi tạo (`spatial:bump-initiate`)**:
  ```json
  {
    "targetUserId": "user-2",
    "senderName": "Đức Tùng",
    "senderAvatar": "https://api.dicebear.com/7.x/bottts/svg?seed=sender",
    "targetName": "Hải Yến",
    "targetAvatar": "https://api.dicebear.com/7.x/bottts/svg?seed=target",
    "lat": 10.776889,
    "lng": 106.700806
  }
  ```
- **Socket Payload Kích hoạt 3D (`spatial:bump-trigger`)**:
  ```json
  {
    "initiatorId": "user-1",
    "initiatorName": "Đức Tùng",
    "targetUserId": "user-2",
    "targetName": "Hải Yến",
    "lat": 10.776889,
    "lng": 106.700806,
    "story": { "id": "story-joint-1710500000", "is_joint": true, "expiry_hours": 6 },
    "timestamp": 1710500000000
  }
  ```

---

### 3.11. FR-11: Radar quét lân cận (Proximity Radar & Haversine Geofencing)

#### Mô tả chi tiết
Tính năng quét không gian xung quanh giúp người dùng khám phá những người bạn và cộng đồng đang hiện diện xung quanh vị trí thực của mình:
1. **Thuật Toán Lượng Giác Cầu Haversine (Haversine Great-Circle Distance)**:
   - Được triển khai đồng bộ và thống nhất trên toàn bộ hệ thống (`MapboxCanvas.jsx:12-22`, `GoogleMapView.jsx:26-31`, `useProximityDetector.js:4-14`):
     $$\Delta\text{lat} = (\text{lat}_2 - \text{lat}_1) \times \frac{\pi}{180}, \quad \Delta\text{lng} = (\text{lng}_2 - \text{lng}_1) \times \frac{\pi}{180}$$
     $$a = \sin^2\left(\frac{\Delta\text{lat}}{2}\right) + \cos\left(\text{lat}_1 \times \frac{\pi}{180}\right) \times \cos\left(\text{lat}_2 \times \frac{\pi}{180}\right) \times \sin^2\left(\frac{\Delta\text{lng}}{2}\right)$$
     $$c = 2 \times \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right), \quad d = R \times c \quad (R = 6371 \text{ km})$$
2. **Bộ Điều Khiển Bán Kính Radar (RadarDistanceSelector)**:
   - Tích hợp ngay trên Đảo nổi công nghệ `UnifiedDynamicIsland.jsx` ở đỉnh màn hình.
   - Cung cấp 4 mức bán kính nhanh tiện dụng: `1 km`, `3 km`, `5 km`, `10 km`.
   - Chế độ mở rộng: `all` ("Toàn thành phố").
   - Thanh trượt tùy biến linh hoạt cho phép kéo mượt mà từ **0.5 km đến 15 km**.
3. **Vòng Tròn Thị Giác Radar Địa Lý (Visual Radar Geofence Ring)**:
   - Trên Mapbox GL: Sử dụng thuật toán `createGeoJSONCircle(center, radiusKm, points = 64)` tạo một Polygon địa lý 64 đỉnh uốn lượn bám sát độ cong của bề mặt Trái Đất (`radar-radius-source`), kết hợp lớp phủ màu xanh lam mờ và viền nét đứt phát quang.
   - Trên Leaflet: Sử dụng đối tượng `L.circle([lat, lng], { radius: radiusKm * 1000 })` bao quanh vị trí người dùng.
4. **Danh Sách Người Ở Gần & Hiệu Ứng Sóng Radar (`NearbyPeersSection`)**:
   - Hiển thị danh sách những người dùng đang trực tuyến nằm gọn bên trong bán kính quét đã chọn, sắp xếp theo thứ tự khoảng cách từ gần nhất đến xa nhất.
   - Hiển thị đầy đủ thông tin: Avatar, tên, mã `user_code`, khoảng cách cụ thể ("cách bạn 350m", "cách bạn 1.2km"), trạng thái quan hệ (`Bạn bè`, `Đã gửi lời mời`, `Thêm bạn`) và nút mở chat nhanh.
   - Biểu tượng radar xoay tròn kết hợp vòng sóng âm phát quang nhịp thở (`animate-ping`) tạo cảm giác thiết bị đang chủ động quét sóng không gian thời gian thực.

#### Tác nhân (Actor)
Tất cả người dùng.

#### Tiền điều kiện (Preconditions)
Thiết bị đã bật định vị GPS.

#### Luồng sự kiện chính (Main Flow)
1. Người dùng chạm vào Đảo nổi Dynamic Island trên đỉnh màn hình để mở `RadarDistanceSelector`.
2. Người dùng chọn mốc bán kính "3 km".
3. Vòng tròn bán kính Radar trên bản đồ tự động co giãn về bán kính 3km tương ứng.
4. Thuật toán Haversine lọc danh sách `profiles` trực tuyến: Chỉ giữ lại những người có khoảng cách $\le 3$ km so với toạ độ của người dùng.
5. Danh sách `NearbyPeersSection` cập nhật hiển thị 5 người dùng xung quanh kèm khoảng cách chi tiết.
6. Bản đồ làm mờ các marker nằm ngoài bán kính 3km và làm nổi bật các marker nằm bên trong vùng quét.

#### Luồng rẽ nhánh & Ngoại lệ (Alternative & Exception Flows)
- **Alt-1 (Không có ai trong bán kính quét)**: Giao diện hiển thị thông điệp nhẹ nhàng: "Chưa có ai quanh bán kính này. Thử tăng bán kính radar lên 5km hoặc 10km xem sao nhé!".

#### Hậu điều kiện (Postconditions)
Người dùng nắm bắt được danh sách và vị trí tương đối của những người xung quanh trong phạm vi an toàn đã lựa chọn.

#### Giao diện & Mã nguồn liên quan
- Frontend: `frontend/src/components/map/RadarDistanceSelector.jsx` (dòng 1-250), `frontend/src/components/friends/NearbyPeersSection.jsx` (dòng 1-135), `frontend/src/components/layout/UnifiedDynamicIsland.jsx` (dòng 1-238).
- Backend: `backend/src/controllers/gpsController.js` (dòng 4-11), `backend/src/services/dbService.js` (dòng 225-287).

#### Dữ liệu đầu vào / đầu ra
- **Dữ liệu Lọc Client-Side**:
  - Input: Mảng `profiles: Profile[]`, Toạ độ người dùng `{ lat, lng }`, Bán kính quét `radiusKm: number`.
  - Output: Mảng `nearbyPeers` đã sắp xếp theo khoảng cách `distanceMeters` tăng dần.

---

## 4. ĐẶC TẢ CÁC YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS - NFR)

---

### 4.1. NFR-01: Hiệu năng & Độ trễ thời gian thực (Real-time Latency & Socket Payload Optimization)

#### Đặc tả yêu cầu
Hệ thống mạng xã hội bản đồ đòi hỏi tốc độ phản hồi tức thời để người dùng cảm nhận được sự hiện diện chân thực của bạn bè trong không gian sống:
1. **Loại bỏ Hoàn toàn Cơ chế Polling (Zero Polling Architecture)**:
   - Hệ thống chuyển đổi toàn diện sang kiến trúc hướng sự kiện (Event-driven Architecture) thông qua Socket.IO Server (`socketService.js`).
   - Độ trễ truyền nhận vị trí GPS giữa hai thiết bị di động trong điều kiện mạng bình thường (4G/Wi-Fi) bắt buộc đạt **dưới 50 mili-giây (< 50ms)**.
2. **Tối Ưu Hóa Kích Thước Gói Tin (Payload Optimization)**:
   - Gói tin broadcast định vị `gps:peer-update` chỉ mang các trường dữ liệu thiết yếu (`id`, `lat`, `lng`, `user_code`, `name`, `avatar`, `battery`, `is_online`), loại bỏ các thông tin tiểu sử hoặc lịch sử trò chuyện nặng nề để giảm tải băng thông mạng di động.
3. **Chu Kỳ Giữ Kết Nối & Timeout (Keep-Alive Configuration)**:
   - Socket.IO Server được cấu hình tối ưu tại `socketService.js:20-22`:
     - `pingInterval: 10000` (10 giây gửi nhịp tim ping một lần).
     - `pingTimeout: 20000` (20 giây không có phản hồi pong thì tuyên bố ngắt kết nối).
     - Hỗ trợ đa cơ chế truyền tải: Ưu tiên `websocket`, tự động fallback sang HTTP `polling` khi gặp tường lửa mạng chặn WebSocket.

---

### 4.2. NFR-02: Tối ưu bộ nhớ & Chống đầy dung lượng (Client-side Image Compression & Storage Protection)

#### Đặc tả yêu cầu
Ứng dụng web hoạt động trên trình duyệt có giới hạn nghiêm ngặt về hạn ngạch bộ nhớ lưu trữ cục bộ (`localStorage` thường bị giới hạn ở mức 5MB) và băng thông tải ảnh:
1. **Nén Ảnh Đại Diện Bằng HTML5 Canvas (Client-side Canvas Image Compression)**:
   - Module chuyên trách: `frontend/src/utils/imageCompressor.js` (dòng 1-53).
   - Mọi ảnh đại diện khi người dùng tải lên từ thiết bị đều bắt buộc đi qua thuật toán:
     - Tự động cắt vuông tại trung tâm ảnh (Center-crop).
     - Vẽ lên Canvas và điều chỉnh độ phân giải về chuẩn `256 x 256 pixels`.
     - Xuất ra định dạng ảnh JPEG với hệ số chất lượng `quality = 0.85`.
     - Kích thước ảnh sau nén chỉ dao động ở mức **~30 Kilobytes** (giảm hơn 95% so với ảnh gốc từ camera di động thường từ 3MB - 8MB).
2. **Triệt Tiêu Lỗi Tràn Hạn Ngạch Bộ Nhớ (QuotaExceededError Immunity)**:
   - Nhờ kích thước ảnh Base64 chỉ còn ~30KB, việc lưu trữ hồ sơ người dùng vào `localStorage` không bao giờ bị kích hoạt lỗi tràn bộ nhớ `QuotaExceededError`.
   - Toàn bộ các thao tác ghi đọc `localStorage` được bọc qua module an toàn `safeStorage.js` với cấu trúc `try-catch` bảo vệ, đảm bảo ứng dụng không bao giờ bị sập (crash) ngay cả khi người dùng duyệt web trong chế độ ẩn danh nghiêm ngặt (Safari Private Browsing Mode chặn ghi localStorage).

---

### 4.3. NFR-03: Tính sẵn sàng & Hồi phục ngoại tuyến (Offline Beacon Handling & Auto-Reconnection)

#### Đặc tả yêu cầu
Trong môi trường mạng di động, việc mất kết nối, người dùng tắt màn hình hoặc đóng tab trình duyệt diễn ra thường xuyên. Hệ thống phải đảm bảo tính nhất quán tuyệt đối về trạng thái trực tuyến:
1. **Giao Thức Báo Thoát Đảm Bảo Bằng Beacon API (`navigator.sendBeacon`)**:
   - Được triển khai tại `frontend/src/hooks/useSocket.js:45-76`.
   - Khi người dùng đóng tab, làm mới trang, hoặc chuyển sang ứng dụng khác (`beforeunload`, `pagehide`, `visibilitychange === 'hidden'`), trình duyệt web có thể lập tức hủy tiến trình JavaScript khiến các lệnh gọi `fetch` hoặc `socket.emit` thông thường bị hủy bỏ giữa chừng.
   - VIVU khắc phục triệt để bằng cách sử dụng `navigator.sendBeacon('/api/gps/offline', blob)` kết hợp gửi sự kiện `user:going-offline`. Trình duyệt cam kết gửi gói tin ngầm này xuống hệ điều hành ngay cả khi trang web đã đóng hoàn toàn.
   - Máy chủ lập tức chuyển `is_online = false` và broadcast sự kiện `user:offline` tới tất cả client khác, triệt tiêu 100% hiện tượng "tài khoản ma" vẫn báo sáng đèn khi người dùng đã thoát web.
2. **Tự Động Kết Nối Lại Khi Mở Lại Ứng Dụng (Auto-Reconnection Strategy)**:
   - Cấu hình Socket.IO Client tại `useSocket.js:15-22`:
     - `reconnection: true`, `reconnectionAttempts: 10` lần thử lại.
     - `reconnectionDelay: 1000ms`, `reconnectionDelayMax: 5000ms` (thuật toán lùi theo cấp số mũ Exponential Backoff).
   - Khi người dùng bật sáng lại màn hình điện thoại (`visibilitychange === 'visible'`), socket tự động kết nối lại và kích hoạt làm mới toạ độ GPS.

---

### 4.4. NFR-04: Tính toàn vẹn dữ liệu (Atomic File Persistence & Concurrency Retry)

#### Đặc tả yêu cầu
Hệ thống sử dụng mô hình lưu trữ tệp tin JSON nhúng (`vivu_database.json`) kết hợp bộ nhớ đệm RAM (`inMemoryStore`), đòi hỏi kỹ thuật ghi đĩa nghiêm ngặt để đảm bảo tính toàn vẹn (ACID-like File Persistence):
1. **Cơ Chế Ghi Tệp Nguyên Tử (Atomic Write via Temp File)**:
   - Được hiện thực tại `backend/src/services/dbStore.js:137-184`.
   - Dữ liệu CSDL tuyệt đối **không được ghi trực tiếp đè vào tệp chính** `vivu_database.json`.
   - Quy trình ghi đĩa an toàn:
     - Bước 1: Tuần tự hóa JSON và ghi ra một file tạm thời duy nhất theo mã tiến trình và dấu thời gian:
       `${DB_FILE}.${process.pid}.${Date.now()}.${Math.random().toString(36).substring(2,6)}.tmp`
     - Bước 2: Tự động sao lưu bản sao dữ liệu hiện tại sang tệp dự phòng `vivu_database.json.bak`.
     - Bước 3: Đổi tên nguyên tử (Atomic Rename / Replace) file tạm sang file chính. Sau khi hoàn tất, xóa file tạm.
2. **Vòng Lặp Chống Xung Đột Khóa Tệp Trên Windows (EBUSY Retry Loop)**:
   - Trên hệ điều hành Windows, các phần mềm quét virus hoặc tiến trình đọc tệp có thể tạm khóa file trong vài mili-giây dẫn đến lỗi `EBUSY` hoặc `EPERM`.
   - Hệ thống triển khai vòng lặp thử lại tối đa 3 lần (`retries = 3`) với thời gian nghỉ 40ms giữa mỗi lần thử, giải quyết triệt để lỗi khóa tệp và đảm bảo không bao giờ làm mất dữ liệu của người dùng.
3. **Cơ Chế Khôi Phục Sự Cố Byte Null (Crash Recovery Engine)**:
   - Khi máy chủ bị ngắt nguồn đột ngột, tệp tin có thể bị lỗi ghi chứa các byte rỗng (`\u0000`).
   - Hàm `loadRawJson` (`dbStore.js:29-57`) tự động quét kiểm tra byte null. Nếu phát hiện tệp chính bị lỗi cú pháp hoặc chứa byte null, hệ thống lập tức tự động chuyển sang đọc từ tệp sao lưu `vivu_database.json.bak`, phục hồi 100% dữ liệu lành lặn.

---

### 4.5. NFR-05: Tính khả dụng & Khả năng tương thích thiết bị (Zero-WebGL Crash Fallback & Responsive UI)

#### Đặc tả yêu cầu
1. **Kiến Trúc Bản Đồ Phòng Vệ Zero-WebGL Crash**:
   - Các dòng điện thoại di động thông minh giá rẻ hoặc máy tính bảng đời cũ thường có chip đồ hoạ (GPU) yếu và bị giới hạn số lượng ngữ cảnh WebGL tối đa. Khi mở các bản đồ 3D nặng, trình duyệt thường kích hoạt sự kiện `webglcontextlost` dẫn đến màn hình trắng hoặc đen hoàn toàn.
   - VIVU giải quyết triệt để vấn đề này bằng cách lựa chọn **Leaflet 2D làm bản đồ hoạt động mặc định** (`GoogleMapView.jsx`), tải các mảnh ảnh tĩnh từ Google Maps Tile Servers. Cơ chế này đạt tỷ lệ ổn định **100% không bao giờ gặp lỗi WebGL Crash**, đảm bảo tất cả mọi thiết bị đều vận hành mượt mà.
   - Bản đồ 3D Mapbox GL (`MapboxCanvas.jsx`) được cô lập thành một mô-đun cao cấp độc lập, chỉ kích hoạt trên các thiết bị đủ năng lực phần cứng.
2. **Giao Diện Thích Ứng Di Động Chuẩn Mực (Mobile-First Responsive Design)**:
   - Thanh điều hướng đáy di động `VivuBottomDock.jsx` với nút tạo mới dấu cộng (+) nhô cao vượt khung (`Protruding Action Button`), tối ưu cho thao tác một tay bằng ngón tay cái.
   - Thanh trạng thái Dynamic Island nổi ở đỉnh màn hình (`UnifiedDynamicIsland.jsx`), tự động co giãn theo nội dung bằng các hoạt cảnh lò xo mượt mà của thư viện Motion v14 (`motion/react`).
   - Hỗ trợ thao tác cảm ứng chạm đa điểm (Multi-touch Gestures), vuốt trượt mở các bảng kéo đáy (Bottom Sheets với lò xo giảm chấn `stiffness: 320, damping: 30`).
3. **Lớp Bọc An Toàn Toàn Ứng Dụng (React Error Boundary)**:
   - Toàn bộ cây component của React được bao bọc trong `ErrorBoundary` (`frontend/src/components/common/ErrorBoundary.jsx`). Nếu có bất kỳ lỗi hiển thị nào phát sinh trong một component con, ứng dụng không bao giờ bị trắng màn hình mà hiển thị giao diện phục hồi thân thiện với 2 nút: "Tải lại Bản đồ ngay" và "Xóa bộ nhớ đệm & Đặt lại".

---

### 4.6. NFR-06: An toàn & Bảo mật (Access Control, Data Isolation & Guest Shielding)

#### Đặc tả yêu cầu
1. **Lá Chắn Khách Vãng Lai (Guest Database Shielding)**:
   - Được kiểm soát chặt chẽ tại `backend/src/services/dbService.js:759-768`: Toàn bộ các định danh khách vãng lai tạm thời dạng `client-xxx` hoặc người dùng chưa có tài khoản trong bảng `users` đều bị **từ chối tuyệt đối không được ghi dữ liệu vào CSDL** và không được phát sóng toạ độ GPS ra ngoài.
   - Định kỳ khi khởi động hoặc lưu trữ, bộ lọc `sanitize()` (`dbStore.js:89-135`) tự động quét và xóa sạch mọi dữ liệu rác của khách vãng lai nếu có.
2. **Phân Quyền Kiểm Soát Truy Cập Nghiêm Ngặt (Access Control Enforcement)**:
   - Phân quyền hội thoại: Người dùng chỉ được đọc tin nhắn của cuộc trò chuyện mà mình là một bên tham gia (1-1 direct chat) hoặc là thành viên chính thức (`member_ids`) của nhóm Circle. Vi phạm lập tức trả về mã lỗi `403 Forbidden`.
   - Phân quyền Trưởng nhóm: Các thao tác sửa thông tin nhóm, kick thành viên hoặc giải tán nhóm bắt buộc xác thực `circle.owner_id === requesterId`. Nếu thành viên thường cố tình can thiệp API sẽ bị từ chối với mã lỗi `403 Forbidden` (đã được xác minh qua bài kiểm thử tự động `circle_lifecycle_and_permissions.test.js`).
   - Quyền riêng tư nhận tin nhắn: Nếu người nhận kích hoạt chế độ `message_privacy = 'friends_only'`, hệ thống tự động đối chiếu quan hệ trong bảng `friendships`. Nếu chưa phải bạn bè, tin nhắn bị chặn lại với mã lỗi `403`.
3. **Cách Ly Thông Báo Cá Nhân (Notification Isolation)**:
   - `notificationService.js` đảm bảo người dùng chỉ truy vấn và nhận được các thông báo gửi đích danh cho User ID của chính mình (`to_user_id === currentUserId`), triệt tiêu hoàn toàn nguy cơ rò rỉ dữ liệu thông báo chéo giữa các tài khoản.
4. **Bảo Vệ Mã Nguồn & Che Dấu Lỗi Máy Chủ (Server Information Leakage Shield)**:
   - Middleware xử lý lỗi toàn cục `errorHandler.js` tự động ẩn thuộc tính `stack` dấu vết mã nguồn khi chạy trên môi trường `production`, chỉ trả về thông báo lỗi tổng quát để ngăn chặn tin tặc khai thác thông tin cấu trúc thư mục máy chủ.

---

## 5. MA TRẬN TRUY VẾT YÊU CẦU (REQUIREMENTS TRACEABILITY MATRIX - RTM)

Bảng ma trận đối chiếu toàn diện giữa Yêu cầu chức năng (FR), Giao diện người dùng (Frontend Component), Điểm cuối API (REST Endpoint), Sự kiện thời gian thực (Socket.IO Event), Mô hình thực thể CSDL (Data Model) và Tình trạng kiểm thử (Test Status):

| Mã FR | Tên Yêu Cầu Chức Năng | Thành Phần Giao Diện (Frontend UI Component) | Điểm Cuối REST API (Backend Endpoint) | Sự Kiện Thời Gian Thực (Socket.IO Event) | Thực Thể Dữ Liệu (CSDL JSON / Model) | Tình Trạng Kiểm Thử (Automated Test Suite) |
|---|---|---|---|---|---|---|
| **FR-01** | Bản đồ 3D GPS & Định vị thời gian thực | `GoogleMapView.jsx`<br>`MapboxCanvas.jsx`<br>`useGeolocation.js`<br>`RightActionStack.jsx` | `GET /api/gps/profiles`<br>`POST /api/gps/update`<br>`POST /api/gps/offline` | `gps:update`<br>`gps:peer-update`<br>`user:online`<br>`user:offline` | `profiles` (`lat`, `lng`, `is_online`, `last_seen_at`) | **PASSED**<br>(Kiểm thử tự động GPS & Offline Controller) |
| **FR-02** | Ghim cá nhân & Tủ đồ Pin Wardrobe | `PinWardrobeModal.jsx`<br>`mapMarkerHelpers.js`<br>`ProfilePageView.jsx` | `POST /api/auth/profile`<br>`POST /api/gps/update` | `gps:update`<br>`gps:peer-update` | `profiles.pin_skin`<br>`profiles.pin_mascot`<br>`profiles.pin_action` | **PASSED**<br>(Kiểm thử cập nhật Skin & Wardrobe Profile) |
| **FR-03** | Linh vật Chibi Mascot & Âm thanh Synth | `chibiMascotData.js`<br>`messengerZaloMascotData.js`<br>`PinWardrobeModal.jsx` | `POST /api/gps/update`<br>`POST /api/auth/profile` | `gps:update`<br>`gps:peer-update` | `profiles.custom_chibi`<br>`profiles.chibi_expires_at` | **PASSED**<br>(Kiểm thử thu hồi Chibi quá hạn & Synth Audio) |
| **FR-04** | Tâm trạng & Nhạc Apple Music | `QuickStatusSheet.jsx`<br>`MusicPickerModal.jsx`<br>`trendingSongs.js`<br>`mapMarkerEvents.js` | `POST /api/gps/update`<br>`POST /api/auth/profile` | `gps:update`<br>`gps:peer-update` | `profiles.custom_status`<br>`profiles.custom_song` | **PASSED**<br>(Kiểm thử tích hợp iTunes API & Singleton Player) |
| **FR-05** | Story định vị 24h & BeReal | `StoryStudioModal.jsx`<br>`StoryViewerModal.jsx`<br>`DualCameraOverlay.jsx`<br>`StoryFiltersAdjuster.jsx` | `GET /api/stories`<br>`POST /api/stories`<br>`DELETE /api/stories/:id`<br>`POST /api/stories/:id/react` | `stories:request`<br>`stories:list`<br>`stories:new` | `stories` (`id`, `host_id`, `lat`, `lng`, `image`, `dual_image`, `expires_at`) | **PASSED**<br>(Kiểm thử Bulletproof Expiry & Dọn dẹp Story) |
| **FR-06** | Hệ thống Kết bạn & ID VU-XXXX | `FriendshipManagerModal.jsx`<br>`RightFriendshipPanel.jsx`<br>`FriendsListSection.jsx` | `GET /api/friends/search`<br>`POST /api/friends/request`<br>`POST /api/friends/accept`<br>`POST /api/friends/reject`<br>`POST /api/friends/cancel`<br>`POST /api/friends/unfriend` | `friend:send-request`<br>`friend-request:incoming`<br>`friend:accept-request`<br>`friend:accepted`<br>`friend:unfriend`<br>`friend:unfriended` | `friendRequests`<br>`friendships`<br>`users.user_code` | **PASSED**<br>(Kiểm thử Vòng đời Kết bạn & Idempotent Notif) |
| **FR-07** | Trò chuyện 1-1 & Vị trí trực tiếp | `MessengerChatView.jsx`<br>`MessengerActiveRoom.jsx`<br>`LiveLocationCard.jsx` | `GET /api/chat/conversations/:id`<br>`GET /api/chat/:id/messages`<br>`POST /api/chat/messages`<br>`POST /api/chat/messages/read`<br>`POST /api/chat/messages/stop-live-location` | `chat:send`<br>`chat:message`<br>`chat:sent`<br>`chat:read` | `messages` (`conversation_id`, `sender`, `text`, `is_live_location`, `read`) | **PASSED**<br>(Kiểm thử Chat Deduplication & Live Location) |
| **FR-08** | Vòng kết nối nhóm riêng (Circles) | `CreateCircleModal.jsx`<br>`GroupMembersModal.jsx`<br>`App.jsx` (`activeCircleFilter`) | `GET /api/circles`<br>`POST /api/circles`<br>`PUT /api/circles/:id`<br>`POST /api/circles/:id/add-members`<br>`POST /api/circles/:id/invite`<br>`POST /api/circles/:id/respond`<br>`POST /api/circles/:id/leave`<br>`POST /api/circles/:id/kick`<br>`DELETE /api/circles/:id` | `circle:member_joined`<br>`circle:members_updated`<br>`circle:updated`<br>`circle:invite`<br>`circle:member_left`<br>`circle:kicked`<br>`circle:disbanded` | `circles` (`id`, `name`, `owner_id`, `member_ids`, `members`) | **PASSED**<br>(Kiểm thử `circle_lifecycle_and_permissions.test.js`) |
| **FR-09** | Bình chọn tương tác (Polls) | `CreatePollModal.jsx`<br>`ChatPollCard.jsx`<br>`StoryStickerPicker.jsx` | `POST /api/chat/messages/:id/poll-vote`<br>`POST /api/stories/:id/poll-vote` | `chat:poll_updated` | `messages.poll`<br>`stories.stickers` (`type: 'poll'`) | **PASSED**<br>(Kiểm thử Độc quyền phiếu bầu & Chuyển phiếu) |
| **FR-10** | Cụng ly tương tác vật lý (Proximity Bump) | `useProximityDetector.js`<br>`SpatialBumpModal3D.jsx`<br>`ProximityBumpBanner.jsx` | `POST /api/stories` (Joint Story tự động) | `spatial:bump-initiate`<br>`spatial:bump-trigger`<br>`stories:new` | Joint Story trong `stories` (`is_joint: true`, `partner_id`, `expiry_hours: 6`) | **PASSED**<br>(Kiểm thử Three.js 3D, Haversine <=15m & Gia tốc) |
| **FR-11** | Radar quét lân cận (Proximity Radar) | `RadarDistanceSelector.jsx`<br>`NearbyPeersSection.jsx`<br>`UnifiedDynamicIsland.jsx` | `GET /api/gps/profiles` | `profiles:request`<br>`profiles:list` | Haversine Great-Circle (`R=6371km`), GeoJSON Radar Circle 64 pts | **PASSED**<br>(Kiểm thử Thuật toán Haversine & Geofencing) |
| **NFR-01 đến NFR-06** | Toàn bộ Yêu cầu Phi Chức Năng | `ErrorBoundary.jsx`<br>`imageCompressor.js`<br>`safeStorage.js`<br>`useSocket.js` | `GET /api/health`<br>`POST /api/gps/offline` | `user:going-offline`<br>`disconnect`<br>`user:offline` | Atomic Write `.tmp` -> `vivu_database.json`, Windows `EBUSY` retry | **PASSED**<br>(Toàn bộ 74/74 Unit & Integration Tests vượt qua) |

---

## KẾT LUẬN VÀ XÁC NHẬN BÀN GIAO (CONCLUSION & SIGN-OFF)

Tài liệu Đặc tả Yêu cầu Phần mềm (SRS) cho hệ thống **Mạng xã hội Bản đồ Thời gian thực VIVU** đã mô tả một cách hoàn chỉnh, chi tiết và nghiêm ngặt toàn bộ 11 yêu cầu chức năng (FR-01 đến FR-11) và 6 yêu cầu phi chức năng (NFR-01 đến NFR-06) theo đúng các tiêu chuẩn công nghiệp và học thuật IEEE 830-1998 / ISO/IEC/IEEE 29148:2018.

Mọi đặc tả trong tài liệu này đều được trích xuất trực tiếp, đối chiếu và kiểm chứng độc lập với mã nguồn thực tế tại kho lưu trữ `c:\Đức Tùng\DACN\vivudemo1`, vượt qua toàn bộ 74 bài kiểm thử tự động của Backend và được bảo vệ bởi các cơ chế kiến trúc phòng thủ vững chắc. Tài liệu sẵn sàng phục vụ cho công tác thẩm định, bảo vệ Đồ án Chuyên ngành và làm kim chỉ nam kỹ thuật cho quá trình bảo trì, mở rộng hệ thống trong tương lai.

---
*Bản quyền tài liệu thuộc về Nhóm Phát triển Đồ án Chuyên ngành VIVU — Năm 2026.*
