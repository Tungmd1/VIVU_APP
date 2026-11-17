# BỘ QUY CHUẨN LẬP TRÌNH VÀ HƯỚNG DẪN KỸ THUẬT DỰ ÁN VIVU
## (VIVU Engineering Guidelines & Coding Standards)
### Tài liệu Kỹ thuật Phục vụ Báo cáo Đồ án Chuyên ngành (DACN)
**Chuyên ngành**: Kỹ thuật Phần mềm / Công nghệ Thông tin  
**Dự án**: Mạng xã hội Bản đồ Thời gian thực VIVU (Realtime Social Map Platform)  
**Phiên bản**: 1.0.0  
**Ngày ban hành**: Tháng 11/2026  
**Chủ quản**: Ban Kỹ thuật Dự án VIVU (VIVU Engineering Team)

---

## MỤC LỤC CHI TIẾT

1. [Phần 1: Tổng Quan và Thông Tin Tài Liệu](#phần-1-tổng-quan-và-thông-tin-tài-liệu)
   - 1.1. Mục đích tài liệu (Purpose & Scope)
   - 1.2. Đối tượng thụ hưởng (Target Audience)
   - 1.3. Ngăn xếp công nghệ mục tiêu (Target Technology Stack)
   - 1.4. Lịch sử phiên bản (Version & Revision History)
2. [Phần 2: Quy Chuẩn Chung & Quy Ước Đặt Tên (General Standards & Naming Conventions)](#phần-2-quy-chuẩn-chung--quy-ước-đặt-tên)
   - 2.1. Quy chuẩn mã hóa và định dạng tệp tin (File Encoding & Formatting)
   - 2.2. Ma trận quy ước đặt tên tổng thể (Global Naming Matrix)
   - 2.3. Quy chuẩn chú thích và tài liệu hóa mã nguồn (Documentation & JSDoc)
   - 2.4. Mã minh họa đối chiếu Quy ước Đặt tên (DO vs DON'T)
3. [Phần 3: Quy Chuẩn Frontend (React 19 & Tailwind CSS)](#phần-3-quy-chuẩn-frontend-react-19--tailwind-css)
   - 3.1. Kiến trúc thành phần (Component Architecture)
   - 3.2. Quy chuẩn React Hooks & Quản lý State
   - 3.3. Quy chuẩn Tailwind CSS & Thiết kế Giao diện (UI/UX)
   - 3.4. Tích hợp Bản đồ số (Leaflet & Mapbox GL) & Đồ họa 3D (Three.js)
   - 3.5. Quản lý Hệ thống Âm thanh & Tải tài nguyên (Web Audio API & Asset Loading)
   - 3.6. Mã minh họa đối chiếu Frontend (DO vs DON'T)
4. [Phần 4: Quy Chuẩn Backend (Node.js ESM, Express & Storage)](#phần-4-quy-chuẩn-backend-nodejs-esm-express--storage)
   - 4.1. Cấu trúc Module Node.js ESM (ECMAScript Modules)
   - 4.2. Kiến trúc 3 tầng chuẩn (Three-Tier Layered Architecture)
   - 4.3. Kiểm soát luồng bất đồng bộ (Asynchronous Control Flow)
   - 4.4. Cơ chế lưu trữ In-Memory & File Persistence `vivu_database.json`
   - 4.5. Mã minh họa đối chiếu Backend (DO vs DON'T)
5. [Phần 5: Quy Chuẩn Realtime với Socket.IO](#phần-5-quy-chuẩn-realtime-với-socketio)
   - 5.1. Quy ước định danh sự kiện thời gian thực (Event Naming Convention)
   - 5.2. Kiểm soát phạm vi phát sóng (Broadcast Scoping)
   - 5.3. Quản lý Vòng đời Kết nối (Connection Lifecycle Management)
   - 5.4. Chống trùng lặp thông điệp (Message Idempotency)
   - 5.5. Mã minh họa đối chiếu Socket.IO (DO vs DON'T)
6. [Phần 6: Quy Chuẩn Xử Lý Lỗi & Hệ Thống Ghi Nhật Ký (Error Handling & Logging)](#phần-6-quy-chuẩn-xử-lý-lỗi--hệ-thống-ghi-nhật-ký)
   - 6.1. Định dạng phản hồi API chuẩn hóa (Unified API Response Schema)
   - 6.2. Quy chuẩn Mã trạng thái HTTP (HTTP Status Code Standards)
   - 6.3. Kiến trúc bắt lỗi giao diện Frontend (Frontend Error Boundary)
   - 6.4. Quy chuẩn Ghi nhật ký Hệ thống (Structured Logging Guidelines)
   - 6.5. Mã minh họa đối chiếu Error Handling & Logging (DO vs DON'T)
7. [Phần 7: Quy Chuẩn Bảo Mật & Tối Ưu Hiệu Năng (Security & Performance Guidelines)](#phần-7-quy-chuẩn-bảo-mật--tối-ưu-hiệu-năng)
   - 7.1. Tối ưu nén ảnh phía Client (Client-Side Image Compression)
   - 7.2. Kiểm tra và làm sạch dữ liệu đầu vào (Input Validation & Sanitization)
   - 7.3. Cấu hình CORS & Quản lý Biến môi trường
   - 7.4. Kiểm soát cách ly người dùng khách (Guest Users Isolation)
   - 7.5. Thuật toán lọc trôi GPS & Tiết kiệm năng lượng thiết bị
   - 7.6. Mã minh họa đối chiếu Bảo mật & Hiệu năng (DO vs DON'T)
8. [Phần 8: Quy Trình Kiểm Thử & Đảm Bảo Chất Lượng (QA & Code Review Checklist)](#phần-8-quy-trình-kiểm-thử--đảm-bảo-chất-lượng)
   - 8.1. Tiêu chuẩn viết kiểm thử đơn vị & tích hợp (Unit & Integration Tests)
   - 8.2. Bảng kiểm tra đánh giá mã nguồn (PR Review Checklist 10 điểm)
   - 8.3. Kết luận và định hướng phát triển

---

## PHẦN 1: TỔNG QUAN VÀ THÔNG TIN TÀI LIỆU

### 1.1. Mục đích tài liệu (Purpose & Scope)
Tài liệu **Quy chuẩn Lập trình và Hướng dẫn Kỹ thuật VIVU** (*VIVU Coding Standards & Engineering Guidelines*) được thiết lập nhằm xây dựng một hệ thống quy tắc lập trình nghiêm ngặt, thống nhất và đạt tiêu chuẩn công nghiệp cho toàn bộ các thành viên tham gia phát triển dự án VIVU. 

Mục tiêu cụ thể:
1. Đảm bảo chất lượng mã nguồn (Code Quality), tính đồng nhất cú pháp, khả năng mở rộng (Scalability) và bảo trì lâu dài (Maintainability) của hệ thống.
2. Thiết lập quy chuẩn kỹ thuật chính thức phục vụ nội dung chuyên môn của **Báo cáo Đồ án Chuyên ngành (DACN)** và **Khóa luận Tốt nghiệp**.
3. Ngăn ngừa triệt để các lỗi rò rỉ bộ nhớ (Memory Leaks), nghẽn luồng sự kiện (Event Loop Blocking), xung đột tệp tin hệ điều hành (File Locking), và nguy cơ mất an toàn thông tin (Security Vulnerabilities).

### 1.2. Đối tượng thụ hưởng (Target Audience)
- **Sinh viên thực hiện đề tài / Nhóm phát triển**: Tuân thủ tuyệt đối các quy định khi lập trình, tái cấu trúc hoặc sửa lỗi mã nguồn.
- **Giảng viên hướng dẫn & Hội đồng chấm bảo vệ**: Cơ sở đối chiếu, thẩm định và đánh giá tính chuyên nghiệp, kỷ luật kỹ thuật và độ hoàn thiện của sản phẩm phần mềm.
- **Kỹ sư thẩm định mã nguồn (Peer Reviewer & Code Reviewer)**: Sử dụng làm khung tiêu chuẩn trong quy trình kiểm duyệt Pull Request (PR).

### 1.3. Ngăn xếp công nghệ mục tiêu (Target Technology Stack)

| Thành phần | Công nghệ / Thư viện | Phiên bản | Vai trò kiến trúc |
|---|---|---|---|
| **Frontend Framework** | React | `^19.3.1` | Thư viện giao diện chính, render declarative UI với React 19 Concurrent Features. |
| **Frontend Runtime** | React DOM | `^19.3.1` | Cầu nối ánh xạ cây React Virtual DOM sang trình duyệt. |
| **Build Tool** | Vite | `^8.3.4` | Bộ công cụ phát triển và đóng gói bundle siêu tốc dựa trên Rollup & esbuild. |
| **CSS Utility Framework** | Tailwind CSS | `^3.4.19` / `^4.3.3` | Khung định kiểu utility-first, xây dựng giao diện Cyberpunk/Glassmorphism. |
| **Icon System** | Bootstrap Icons | `^1.13.2` | Hệ thống biểu tượng vector toàn dự án (chuẩn hóa `bi bi-*`). |
| **Map Rendering Engine** | Leaflet | `^1.9.4` | Lớp bản đồ 2D Google Hybrid Maps tối ưu hiệu năng Zero-Crash trên thiết bị yếu. |
| **3D Map Perspective** | Mapbox GL JS | `^3.33.0` | Động cơ dựng bản đồ 3D góc nghiêng (Pitch 32°, Bearing -5°). |
| **3D WebGL Graphics** | Three.js | `^0.186.1` | Dựng phối cảnh cụng ly cocktail 3D tương tác chân thực và hào quang hologram. |
| **Animation Engines** | Motion / GSAP | Motion `^14.7.1`<br>GSAP `^3.15.0` | Hiệu ứng chuyển động mượt mà cho Island và hạt ánh sáng Cyberpunk. |
| **Visual Effects** | Canvas Confetti | `^1.9.4` | Hiệu ứng pháo hoa giấy khi kết bạn thành công và hoàn thành tương tác. |
| **Audio Engine** | Web Audio API | Trình duyệt native | Tạo âm thanh tương tác procedural (tâm trạng Chibi, radar, cụng ly thủy tinh). |
| **Backend Runtime** | Node.js | `>= 20.0.0` | Nền tảng thực thi JavaScript phía máy chủ theo chuẩn ECMAScript Modules (ESM). |
| **Web Application Server** | Express | `^4.21.2` | Khung điều hướng HTTP RESTful API và gắn kết Socket.IO server. |
| **Realtime Gateway** | Socket.IO | `^4.8.4` | Cổng giao tiếp thời gian thực hai chiều Full-Duplex qua WebSocket và Polling. |
| **Primary Persistence** | In-Memory + JSON Store | Bản địa (`dbStore.js`) | CSDL tệp nguyên tử `vivu_database.json` tự phục hồi (`.bak`) và chống lỗi `EBUSY`. |
| **Cloud DB Fallback** | Supabase JS Client | `^2.49.1` | Kết nối cơ sở dữ liệu đám mây PostgreSQL/PostGIS khi có cấu hình môi trường. |
| **Testing Engine** | Node.js Test Runner | Native (`node --test`) | Khung kiểm thử tự động toàn diện 74/74 ca kiểm thử backend đạt 100% tỷ lệ đỗ. |

### 1.4. Lịch sử phiên bản (Version & Revision History)

| Phiên bản | Ngày cập nhật | Tác giả | Ghi chú nội dung thay đổi |
|---|---|---|---|
| `1.0.0` | 16/11/2026 | Ban Kỹ thuật VIVU | Hoàn thiện bản chuẩn mực hóa toàn diện cho báo cáo đồ án tốt nghiệp chuyên ngành (DACN). |

---

## PHẦN 2: QUY CHUẨN CHUNG & QUY ƯỚC ĐẶT TÊN

### 2.1. Quy chuẩn mã hóa và định dạng tệp tin (File Encoding & Formatting)
Mọi tệp tin trong toàn bộ kho mã nguồn VIVU bắt buộc phải tuân theo các thông số cấu hình sau:
1. **Bảng mã ký tự (Encoding)**: `UTF-8 without BOM`. Tuyệt đối không lưu tệp dưới bảng mã Windows-1252, ANSI hoặc UTF-16.
2. **Thụt lề (Indentation)**: Bắt buộc sử dụng đúng **2 dấu cách (2 spaces)**. Nghiêm cấm dùng ký tự Tab (`\t`) để tránh xô lệch giao diện giữa các môi trường IDE khác nhau.
3. **Ký tự ngắt dòng (Line Endings)**: Sử dụng chuẩn **LF (Unix-style `\n`)**. Cấu hình bắt buộc trong tệp `.gitattributes` tại thư mục gốc:
   ```gitattributes
   * text=auto eol=lf
   *.js text eol=lf
   *.jsx text eol=lf
   *.json text eol=lf
   *.md text eol=lf
   ```
4. **Dấu chấm phẩy (Semicolons)**: **Bắt buộc sử dụng dấu chấm phẩy kết thúc câu lệnh (Explicit Semicolons)**. Nghiêm cấm phụ thuộc vào cơ chế tự động chèn dấu chấm phẩy của JavaScript (Automatic Semicolon Insertion - ASI) do tiềm ẩn nguy cơ sinh lỗi ngữ nghĩa nghiêm trọng khi làm việc với IIFE hoặc destructuring.
5. **Độ dài dòng tối đa (Max Line Length)**: Khuyến nghị trong khoảng **100 đến 120 ký tự**. Khi vượt quá, bắt buộc phải xuống dòng và căn lề rõ ràng.
6. **Dòng trống cuối tệp (Trailing Newline)**: Mọi tệp tin bắt buộc phải kết thúc bằng duy nhất một dòng trống cuối tệp (single newline).

### 2.2. Ma trận quy ước đặt tên tổng thể (Global Naming Matrix)

| Danh mục | Quy ước (Convention) | Định dạng hợp lệ | Ví dụ chuẩn trong VIVU |
|---|---|---|---|
| **Thư mục (Directories)** | `kebab-case` hoặc `lowercase` | `^[a-z0-9-]+$` | `components/map/`, `components/chat/`, `controllers/`, `services/` |
| **Tệp React Component** | `PascalCase.jsx` | `^[A-Z][a-zA-Z0-9]+\.jsx$` | `GoogleMapView.jsx`, `SpatialBumpModal3D.jsx`, `MessengerActiveRoom.jsx` |
| **Tệp Tiện ích / Service** | `camelCase.js` | `^[a-z][a-zA-Z0-9]+\.js$` | `useGeolocation.js`, `imageCompressor.js`, `dbService.js`, `socketService.js` |
| **Tệp Cấu hình / Dữ liệu** | `camelCase.js` hoặc `kebab-case.json` | Tùy biến chuẩn | `chibiMascotData.js`, `trendingSongs.js`, `vivu_database.json` |
| **Tệp Kiểm thử (Tests)** | `*.test.js` | `^[a-zA-Z0-9_.]+\.test\.js$` | `friendship.test.js`, `authController.test.js`, `circleLifecycle.test.js` |
| **Tên Biến & Thuộc tính** | `camelCase` | `^[a-z][a-zA-Z0-9]+$` | `currentUserId`, `activeConversationId`, `isLiveLocation` |
| **Biến Logic (Boolean)** | Tiền tố `is`, `has`, `should`, `can` | `^(is\|has\|should\|can)[A-Z][a-zA-Z0-9]+$` | `isOnline`, `hasReplied`, `shouldAutoPlay`, `canManageCircle` |
| **Tên Hàm & Phương thức** | `camelCase` (Bắt đầu bằng động từ) | `^[a-z][a-zA-Z0-9]+$` | `calculateHaversineDistance()`, `sendMessage()`, `handleAcceptFriend()` |
| **Hằng số & Biến môi trường** | `UPPER_SNAKE_CASE` | `^[A-Z0-9_]+$` | `MAX_MESSAGE_LENGTH`, `INITIAL_DB`, `CORS_ORIGIN`, `EARTH_RADIUS_KM` |
| **Lớp (Classes)** | `PascalCase` | `^[A-Z][a-zA-Z0-9]+$` | `WebAudioStoryPlayer`, `ErrorBoundary`, `SocketNotificationManager` |
| **React Hooks tùy biến** | Tiền tố `use` + `PascalCase` | `^use[A-Z][a-zA-Z0-9]+$` | `useGeolocation`, `useSocket`, `useProximityDetector`, `useWindowDimensions` |
| **Sự kiện Socket.IO** | `<domain>:<action>` (`kebab-case`) | `^[a-z]+:[a-z0-9_-]+$` | `chat:send`, `gps:peer-update`, `spatial:bump-trigger`, `circle:member_joined` |
| **Lớp định kiểu CSS** | Tailwind utilities hoặc `kebab-case` | `^[a-z0-9-]+$` | `backdrop-blur-md`, `zenly-marker-pulse`, `cyber-glow-border` |

### 2.3. Quy chuẩn chú thích và tài liệu hóa mã nguồn (Documentation & JSDoc)
Mọi hàm nghiệp vụ (Service), Controller và Custom Hook bắt buộc phải được tài liệu hóa bằng chuẩn cú pháp **JSDoc**.
- Khai báo rõ ràng mục đích của hàm.
- Liệt kê đầy đủ kiểu dữ liệu và mô tả của từng tham số `@param`.
- Khai báo kiểu dữ liệu trả về `@returns`.
- Liệt kê các lỗi có thể nảy sinh `@throws`.
- **Nguyên tắc chú thích**: Chú thích giải thích **TẠI SAO (Why)** lại viết giải thuật như vậy (đặc thù thiết bị, giải quyết vấn đề hệ điều hành, tối ưu phần cứng), không lặp lại **LÀM GÌ (What)** khi mã nguồn đã thể hiện rõ ràng.
- **Nghiêm cấm Dead Code**: Không lưu lại mã nguồn cũ đã bị vô hiệu hóa dưới dạng comment (`// code cũ`). Sử dụng Git History để quản lý phiên bản lịch sử.

### 2.4. Mã minh họa đối chiếu Quy ước Đặt tên (DO vs DON'T)

```javascript
// ❌ DON'T: Đặt tên cẩu thả, thiếu kiểu boolean, không dùng semicolon, comment lặp lại mã nguồn
const user_data = { n: "Đức Tùng", a: 22 }
let flag = true // cờ kiểm tra
function get_data(x, y) {
  return x + y // trả về tổng
}
const max = 100

// ✅ DO: Đặt tên chuẩn mực, camelCase, boolean có tiền tố, hằng số rõ ràng kèm JSDoc
const MAX_MESSAGE_LENGTH = 2000;

/**
 * Tính toán khoảng cách địa lý giữa 2 điểm toạ độ WGS-84 theo công thức Haversine.
 * @param {number} latitude1 - Vĩ độ điểm thứ nhất (đơn vị: degrees).
 * @param {number} longitude1 - Kinh độ điểm thứ nhất (đơn vị: degrees).
 * @param {number} latitude2 - Vĩ độ điểm thứ hai (đơn vị: degrees).
 * @param {number} longitude2 - Kinh độ điểm thứ hai (đơn vị: degrees).
 * @returns {number} Khoảng cách thực tế giữa 2 điểm tính bằng mét (m).
 */
export function calculateHaversineDistance(latitude1, longitude1, latitude2, longitude2) {
  const EARTH_RADIUS_METERS = 6371000;
  const toRadians = (degree) => (degree * Math.PI) / 180;

  const deltaLatitude = toRadians(latitude2 - latitude1);
  const deltaLongitude = toRadians(longitude2 - longitude1);

  const halfChordLengthSquared =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos(toRadians(latitude1)) *
      Math.cos(toRadians(latitude2)) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2);

  const angularDistanceRadians = 2 * Math.atan2(Math.sqrt(halfChordLengthSquared), Math.sqrt(1 - halfChordLengthSquared));
  return Math.round(EARTH_RADIUS_METERS * angularDistanceRadians);
}
```

---

## PHẦN 3: QUY CHUẨN FRONTEND (REACT 19 & TAILWIND CSS)

### 3.1. Kiến trúc thành phần (Component Architecture)
1. **Cấu trúc thư mục module hóa**: Toàn bộ UI component phải được gom nhóm theo phân hệ chức năng trong `src/components/<module>/`:
   - `components/map/`: Bản đồ Leaflet, Mapbox, Markers, Radar.
   - `components/chat/`: Hộp thư, phòng trò chuyện, thẻ bình chọn, vị trí trực tiếp.
   - `components/story/`: Studio chụp ảnh BeReal, xem story toàn màn hình, bộ lọc.
   - `components/profile/`: Tủ đồ ghim, thông tin cá nhân, cài đặt bảo mật.
   - `components/friends/`: Danh sách bạn bè, tìm kiếm mã `VU-XXXX`, radar lân cận.
   - `components/circle/`: Quản lý nhóm riêng tư, phân quyền Trưởng nhóm.
   - `components/bump/`: Cụng ly 3D Three.js và banner gia tốc kế.
   - `components/common/`: Modal dùng chung, nút tương tác, ErrorBoundary.
2. **Mô hình Container vs Presentation**:
   - **Container Component (Smart)**: Chịu trách nhiệm nạp dữ liệu (fetch API), đăng ký sự kiện Socket.IO, quản lý logic điều hướng.
   - **Presentation Component (Dumb/Pure)**: Thuần túy nhận dữ liệu qua `props`, không gọi API trực tiếp, kích hoạt hành động thông qua các hàm callback (`onSelect`, `onClose`, `onVote`).
3. **Giới hạn kích thước tệp tin (File Size Boundary)**: Mỗi tệp Component không được vượt quá **450 dòng mã**. Khi một file có xu hướng phình to, bắt buộc phải bóc tách thành các Sub-components nguyên tử đặt trong cùng thư mục module.
4. **Quy chuẩn nhận Props**: Bắt buộc giải nén (destructuring) ngay tại tham số hàm component, đồng thời cung cấp giá trị mặc định (default values) tường minh. Hạn chế tối đa hiện tượng truyền qua nhiều tầng (Prop Drilling vượt quá 3 cấp).

### 3.2. Quy chuẩn React Hooks & Quản lý State
1. **Tuân thủ Tuyệt đối Quy tắc Hooks (Rules of Hooks)**:
   - Chỉ gọi Hooks ở cấp cao nhất (top-level) của React Function Component hoặc Custom Hook.
   - Nghiêm cấm đặt Hook bên trong khối lệnh điều kiện (`if`), vòng lặp (`for`/`while`), hoặc hàm lồng nhau.
2. **Quy chuẩn `useState` & Derived State**:
   - **Tuyệt đối không lưu State thừa (Redundant State)**: Nếu một giá trị có thể suy ra dễ dàng từ các state hoặc props hiện có, hãy tính toán trực tiếp trong chu kỳ render hoặc bọc trong `useMemo`.
   - **Cập nhật Functional Updates**: Khi state mới phụ thuộc vào state trước đó, bắt buộc sử dụng cú pháp hàm `setCount(prev => prev + 1)` để loại bỏ lỗi bất đồng bộ.
3. **Quy chuẩn `useEffect` & Dọn dẹp Tài nguyên (Cleanup)**:
   - **Bắt buộc hàm Cleanup**: Mọi `useEffect` có thiết lập Event Listener (`window.addEventListener`), Bộ đếm giờ (`setInterval`, `setTimeout`), Kết nối Socket, hoặc Web Audio Context đều bắt buộc phải trả về hàm dọn dẹp (`return () => { ... }`).
   - **Mảng phụ thuộc (Dependency Array)**: Khai báo trung thực và đầy đủ toàn bộ biến và hàm được sử dụng bên trong Effect. Không dùng comment `eslint-disable react-hooks/exhaustive-deps` để che giấu dependency bị thiếu, tránh gây lỗi Stale Closures (đóng gói dữ liệu cũ).
4. **Tối ưu hóa Hiệu năng với `useCallback` & `useMemo`**:
   - Sử dụng `useCallback` cho mọi hàm callback được truyền xuống danh sách phần tử lớn (như danh sách Marker bản đồ `GoogleMapView` hoặc danh sách tin nhắn chat `MessengerActiveRoom`) nhằm tránh tái tạo tham chiếu hàm làm kích hoạt re-render hàng loạt.
   - Sử dụng `useMemo` cho các phép toán nặng (như tính toán khoảng cách Haversine toàn bộ danh sách người dùng hoặc lọc danh sách theo bán kính Radar).
5. **Sử dụng `useRef` cho DOM và Giá trị Tham chiếu Ổn định**:
   - Sử dụng `useRef` để nắm giữ DOM canvas (Three.js WebGL, Map container), thẻ Audio/Video, hoặc mã định danh timer.
   - `useRef` không làm kích hoạt re-render khi giá trị `.current` thay đổi.

### 3.3. Quy chuẩn Tailwind CSS & Thiết kế Giao diện (UI/UX)
1. **Thứ tự sắp xếp Utility Classes chuẩn công nghiệp**:
   Để đảm bảo tính nhất quán trên toàn bộ các tệp `.jsx`, các lớp Tailwind CSS phải được sắp xếp theo trình tự 6 bước:
   `Layout` $\rightarrow$ `Box Model` $\rightarrow$ `Typography` $\rightarrow$ `Visual / Colors` $\rightarrow$ `Pseudo-classes / Interactive` $\rightarrow$ `Responsive Breakpoints`.
   *Ví dụ chuẩn*:
   ```jsx
   <div className="flex items-center justify-between w-full p-4 text-sm font-semibold text-white bg-slate-900/80 rounded-2xl border border-white/10 shadow-lg hover:border-cyan-400/50 transition-all sm:p-6" />
   ```
2. **Quy chuẩn Kính mờ Sang trọng (Glassmorphism Standards)**:
   - Sử dụng kết hợp `backdrop-blur-md` hoặc `backdrop-blur-xl`.
   - Nền bán trong suốt: Nền tối dùng `bg-slate-950/80` hoặc `bg-slate-900/70`, nền sáng dùng `bg-white/75`.
   - Đường viền tinh tế: Bắt buộc đính kèm viền bán trong suốt `border border-white/10` hoặc `border-white/15` để tạo cảm giác nổi khối 3D.
3. **Quy chuẩn Hệ thống Biểu tượng (Icon Standards)**:
   - **100% sử dụng Bootstrap Icons** thông qua thẻ vector: `<i className="bi bi-{icon-name}"></i>`.
   - **Nghiêm cấm** cài đặt hoặc pha trộn thư viện icon khác (như Lucide React, FontAwesome) để ngăn chặn hiện tượng phình to kích thước gói bundle.
4. **Đóng gói Thành phần Giao diện Nguyên tử (Atomic Components)**:
   - Các nút bấm tương tác phải kế thừa từ `VivuButton` để đảm bảo bo tròn mềm mại (`rounded-full`), tích hợp hiệu ứng tia sáng hạt GSAP (`cyberSplash`) và trạng thái loading chuẩn hóa.

### 3.4. Tích hợp Bản đồ số (Leaflet & Mapbox GL) & Đồ họa 3D (Three.js)
1. **Vòng đời và Giải phóng Bản đồ Leaflet (`GoogleMapView.jsx`)**:
   - Khi Component unmount, bắt buộc phải gọi `map.remove()` và xóa sạch các layer marker `markersLayerRef.current.clearLayers()`.
   - Kiểm tra `if (mapInstanceRef.current) return;` trước khi khởi tạo bản đồ mới nhằm triệt tiêu lỗi tạo chồng chéo nhiều instance trên cùng một phần tử DOM (`Map container is already initialized`).
2. **Vòng đời và Giải phóng Bản đồ Mapbox GL (`MapboxCanvas.jsx`)**:
   - Khi unmount, gọi `map.remove()`, dọn sạch các sự kiện lắng nghe chuột và hủy animation frame.
3. **Quản lý Bộ nhớ Đồ họa WebGL Three.js (`SpatialBumpModal3D.jsx`)**:
   WebGL Context trên thiết bị di động có giới hạn cực kỳ khắt khe (thường chỉ cho phép tối đa 8-16 context đồng thời). Để triệt tiêu rò rỉ bộ nhớ VRAM:
   - Hủy vòng lặp render: `cancelAnimationFrame(animationFrameId)`.
   - Giải phóng tài nguyên hình học: `geometry.dispose()`.
   - Giải phóng vật liệu: `material.dispose()`.
   - Giải phóng bộ kết xuất: `renderer.dispose()` và gỡ bỏ `renderer.domElement` khỏi cây DOM.

### 3.5. Quản lý Hệ thống Âm thanh & Tải tài nguyên (Web Audio API & Asset Loading)
1. **Mô hình Singleton cho Web Audio Context**:
   - Trình duyệt hiện đại giới hạn số lượng `AudioContext` hoạt động đồng thời (tối đa 6 context trên Chrome). Do đó, toàn bộ ứng dụng phải dùng chung một instance duy nhất qua lớp `WebAudioStoryPlayer` hoặc `audioContextManager.js`.
   - Khởi tạo ở trạng thái `suspended`, chỉ kích hoạt `audioContext.resume()` sau khi người dùng có tương tác đầu tiên (User Gesture: Click, Tap) nhằm tuân thủ chính sách Autoplay Policy của trình duyệt.
2. **Tải lười (Lazy Loading) các Phân hệ Nặng**:
   - Các modal đồ họa nặng và hiếm khi mở lập tức (như `SpatialBumpModal3D`, `PinWardrobeModal`, `StoryStudioModal`) bắt buộc phải được nạp lười thông qua `React.lazy()` kết hợp `<Suspense fallback={<LoadingSpinner />}>`.

### 3.6. Mã minh họa đối chiếu Frontend (DO vs DON'T)

```jsx
// ❌ DON'T: Quản lý state luộm thuộm, useEffect thiếu cleanup, leak Leaflet map và Three.js
import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import * as THREE from 'three';

export function BadMapComponent({ peerList }) {
  // Sai: Lưu state dư thừa có thể suy ra từ peerList
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    setOnlineCount(peerList.filter(p => p.is_online).length);
  }, [peerList]);

  useEffect(() => {
    // Sai: Khởi tạo Leaflet không kiểm tra tồn tại và không dọn dẹp khi unmount
    const map = L.map('map-container').setView([10.762622, 106.660172], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Sai: Khởi tạo Three.js không hủy animation loop, không dispose VRAM
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer();
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();
    // Không có return cleanup function -> Gây Crash WebGL và Memory Leak
  }, []);

  return <div id="map-container" className="w-full h-96" />;
}

// ✅ DO: Chuẩn hóa React 19, tính Derived State, dọn dẹp Leaflet, WebGL VRAM triệt để
import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import L from 'leaflet';
import * as THREE from 'three';

export function GoodMapComponent({ peerList, onSelectPeer }) {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const animationFrameRef = useRef(null);
  const threeRendererRef = useRef(null);

  // Tính toán Derived State trực tiếp không cần useState bổ sung
  const onlineCount = useMemo(() => {
    return peerList.filter((peer) => Boolean(peer.is_online)).length;
  }, [peerList]);

  const handleMarkerClick = useCallback((peerId) => {
    if (typeof onSelectPeer === 'function') {
      onSelectPeer(peerId);
    }
  }, [onSelectPeer]);

  // Vòng đời khởi tạo và dọn dẹp Leaflet bản đồ
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const mapInstance = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([10.762622, 106.660172], 15);

      L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}').addTo(mapInstance);
      leafletMapRef.current = mapInstance;
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Vòng đời khởi tạo và dọn dẹp Three.js WebGL
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    threeRendererRef.current = renderer;

    const renderLoop = () => {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    return () => {
      // Dọn dẹp Animation Frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      // Dọn dẹp tài nguyên hình học & vật liệu VRAM
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      threeRendererRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-full h-96 overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-slate-950/80 backdrop-blur-xl">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 z-10 px-4 py-2 rounded-full bg-slate-900/80 border border-white/10 text-xs font-semibold text-cyan-400">
        <i className="bi bi-broadcast mr-1.5" />
        Đang trực tuyến: {onlineCount}
      </div>
    </div>
  );
}
```

---

## PHẦN 4: QUY CHUẨN BACKEND (NODE.JS ESM, EXPRESS & STORAGE)

### 4.1. Cấu trúc Module Node.js ESM (ECMAScript Modules)
1. **Khai báo chuẩn ESM**: Trong tệp `backend/package.json`, bắt buộc thiết lập thuộc tính `"type": "module"`.
2. **Cú pháp Xuất / Nhập (Import / Export)**:
   - Tuyệt đối cấm sử dụng cú pháp CommonJS cổ điển (`require()`, `module.exports`).
   - Bắt buộc dùng cú pháp ES6 chuẩn: `import { func } from './module.js'` và `export const func = () => {}`.
3. **Bắt buộc hậu tố mở rộng `.js` trong Relative Imports**:
   Trong môi trường Node.js ESM nguyên bản (Native ESM), cơ chế phân giải đường dẫn bắt buộc phải có đuôi tệp tin rõ ràng. Ví dụ:
   - `import { dbService } from '../services/dbService.js';` *(ĐÚNG)*
   - `import { dbService } from '../services/dbService';` *(SAI - Gây lỗi `ERR_MODULE_NOT_FOUND` ngay lập tức).*

### 4.2. Kiến trúc 3 tầng chuẩn (Three-Tier Layered Architecture)
Mã nguồn Backend VIVU được phân tầng nghiêm ngặt nhằm đảm bảo tính đơn nhiệm (Single Responsibility Principle):
```
      HTTP / Socket Clients
              │
              ▼
   ┌──────────────────────┐
   │ 1. Routing Layer     │  src/routes/*.js
   │    - Map URL & Verb  │  - Gắn middleware xác thực
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ 2. Controller Layer  │  src/controllers/*.js
   │    - Validate Params │  - Kiểm tra Authorization
   │    - HTTP Statuses   │  - Định dạng chuẩn phản hồi API
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ 3. Service Layer     │  src/services/*.js
   │    - Business Rules  │  - dbService.js, socketService.js
   │    - Data Store I/O  │  - dbStore.js (Atomic JSON & In-Memory)
   └──────────────────────┘
```

1. **Routing Layer (`src/routes/`)**: Chỉ làm nhiệm vụ điều phối đường dẫn, đăng ký phương thức HTTP (`GET`, `POST`, `PUT`, `DELETE`), gắn middleware bảo mật và chuyển tiếp tới Controller tương ứng.
2. **Controller Layer (`src/controllers/`)**: Tiếp nhận `req`, trích xuất dữ liệu từ `req.body`, `req.params`, `req.query`, thẩm định kiểu dữ liệu, xác minh quyền truy cập (Authorization), gọi hàm nghiệp vụ từ Service Layer, và trả về mã trạng thái HTTP chuẩn kèm dữ liệu.
3. **Service Layer (`src/services/`)**: Nắm giữ toàn bộ nghiệp vụ cốt lõi (Business Logic). Tương tác trực tiếp với bộ nhớ In-Memory, phát sự kiện Socket.IO, ghi nhận thông báo tập trung và thực hiện lưu trữ xuống đĩa cứng.

### 4.3. Kiểm soát luồng bất đồng bộ (Asynchronous Control Flow)
1. **Chuẩn hóa `async/await`**: 100% các thao tác đọc/ghi tệp, gọi CSDL hoặc tương tác mạng phải sử dụng cú pháp `async/await`.
2. **Triệt tiêu Callback Hell và Unhandled Rejections**:
   - Tuyệt đối cấm sử dụng các callback lồng nhau.
   - Bắt buộc phải bọc các lời gọi bất đồng bộ trong khối `try/catch` hoặc thông qua một bộ bọc middleware bất đồng bộ (`asyncHandler`).
   - Mọi lỗi phát sinh phải được chuyển tiếp tới middleware xử lý lỗi tập trung thông qua `next(error)`.

### 4.4. Cơ chế lưu trữ In-Memory & File Persistence `vivu_database.json`
VIVU áp dụng mô hình lưu trữ Hybrid: Tốc độ phản hồi cực nhanh nhờ lưu trữ In-Memory trên RAM kết hợp cơ chế lưu bền vững xuống tệp `backend/data/vivu_database.json`. Để đảm bảo toàn vẹn dữ liệu trong môi trường thực tế, hệ thống bắt buộc phải tuân thủ 4 nguyên tắc sau:

1. **Nguyên tắc Ghi đĩa Nguyên tử (Atomic Write via `.tmp` File)**:
   - **Tuyệt đối cấm ghi đè trực tiếp** lên tệp `vivu_database.json` bằng cờ `fs.writeFileSync(..., 'w')`. Nếu tiến trình máy chủ bị tắt đột ngột (mất điện, kill process) giữa lúc đang ghi, tệp tin sẽ bị cắt cụt (truncated) và vỡ toàn bộ cấu trúc JSON.
   - **Quy trình chuẩn**:
     - Bước 1: Tuần tự hóa đối tượng CSDL thành chuỗi JSON hợp lệ.
     - Bước 2: Ghi dữ liệu vào một tệp tạm thời duy nhất: `vivu_database.json.tmp.{PID}.{Date.now()}`.
     - Bước 3: Đảm bảo dữ liệu đã xả hoàn toàn xuống đĩa cứng vật lý bằng `fs.promises.fsync()` hoặc đóng file an toàn.
     - Bước 4: Thực hiện thao tác tráo đổi nguyên tử `fs.promises.rename(tempFile, targetFile)`. Thao tác đổi tên trên cùng phân vùng đĩa là nguyên tử (Atomic Operation) ở cấp độ nhân hệ điều hành.
2. **Cơ chế Sao lưu Tự phục hồi (Self-Healing Backup via `.bak`)**:
   - Trước mỗi lần đồng bộ xuống đĩa, hệ thống duy trì một bản sao lưu `vivu_database.json.bak`.
   - Trong quá trình nạp dữ liệu khi khởi động máy chủ (`dbStore.init()`): Nếu tệp chính `vivu_database.json` bị lỗi cú pháp `JSON.parse` (do byte rỗng `\u0000` hoặc hỏng cấu trúc), hệ thống sẽ tự động bắt ngoại lệ và nạp thay thế từ tệp `vivu_database.json.bak`.
3. **Xử lý Xung đột Khóa tệp trên Hệ điều hành Windows (`EBUSY` Retry Loop)**:
   - Trên hệ điều hành Windows, các tiến trình kiểm tra virus (Windows Defender), indexing của Windows Search, hoặc IDE thường xuyên khóa tạm thời các tệp tin đang mở, gây ra lỗi mã `EBUSY: resource busy or locked`.
   - **Giải pháp bắt buộc**: Triển khai vòng lặp thử lại (Retry Loop) tối thiểu 3 lần kết hợp khoảng chờ ngắn (Backoff Delay từ 50ms - 100ms) trước khi đưa ra kết luận lỗi.
4. **Quy chuẩn Thao tác Dữ liệu Trong Bộ nhớ In-Memory**:
   - Sử dụng các hàm biến đổi dữ liệu thuần túy (Immutable/Pure functions) khi xử lý các mảng thực thể (`filter`, `map`, `find`).
   - Kiểm tra kỹ lưỡng giá trị `null` hoặc `undefined` trước khi truy xuất các thuộc tính lồng nhau.
   - **Bộ lọc Khách vãng lai (Guest Cleanup)**: Định kỳ thanh lọc hoặc chặn hoàn toàn việc lưu trữ vĩnh viễn các bản ghi có mã người dùng bắt đầu bằng tiền tố `client-xxx` để ngăn chặn hiện tượng rò rỉ và làm phình bộ nhớ RAM.

### 4.5. Mã minh họa đối chiếu Backend (DO vs DON'T)

```javascript
// ❌ DON'T: Ghi file đè trực tiếp gây hỏng CSDL, không bắt lỗi EBUSY, trộn lẫn Route và Logic
import fs from 'fs';
import express from 'express';
const router = express.Router();

router.post('/messages', (req, res) => {
  // Sai: Logic nghiệp vụ đặt ngay trong route, không có Controller/Service
  const rawData = fs.readFileSync('./data/vivu_database.json', 'utf8');
  const db = JSON.parse(rawData);
  
  db.messages.push(req.body); // Sai: Không validate, không kiểm tra client_msg_id

  // Nguy hiểm chết người: Ghi đè trực tiếp. Nếu máy chủ sập ngay lúc này, tệp JSON rỗng 0 bytes!
  fs.writeFileSync('./data/vivu_database.json', JSON.stringify(db));
  res.send({ status: 'ok' });
});

// ✅ DO: Phân tách 3 tầng chuẩn mực, ghi đĩa nguyên tử kèm cơ chế Backoff Retry chống lỗi EBUSY
// File: src/services/dbStore.js
import fs from 'node:fs/promises';
import path from 'node:path';

const DB_PATH = path.resolve('data/vivu_database.json');
const BAK_PATH = path.resolve('data/vivu_database.json.bak');

/**
 * Ghi dữ liệu CSDL xuống đĩa cứng nguyên tử (Atomic Write) với vòng lặp thử lại chống EBUSY trên Windows.
 * @param {object} databaseState - Đối tượng dữ liệu CSDL toàn hệ thống.
 * @returns {Promise<boolean>} Kết quả thực thi thành công.
 */
export async function saveDatabaseAtomic(databaseState) {
  const serializedData = JSON.stringify(databaseState, null, 2);
  const tempFilePath = `${DB_PATH}.tmp.${process.pid}.${Date.now()}`;
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 60;

  try {
    // 1. Ghi toàn bộ dữ liệu ra tệp tạm thời
    await fs.writeFile(tempFilePath, serializedData, 'utf8');

    // 2. Tạo bản sao lưu dự phòng .bak nếu file chính đang tồn tại
    try {
      await fs.copyFile(DB_PATH, BAK_PATH);
    } catch (err) {
      // Bỏ qua nếu file chính chưa từng tồn tại ở lần chạy đầu tiên
    }

    // 3. Thực hiện hoán đổi nguyên tử với cơ chế thử lại nếu bị Windows khóa file (EBUSY)
    let renameSuccess = false;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await fs.rename(tempFilePath, DB_PATH);
        renameSuccess = true;
        break;
      } catch (renameError) {
        if (renameError.code === 'EBUSY' && attempt < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
        } else {
          throw renameError;
        }
      }
    }

    return renameSuccess;
  } catch (error) {
    console.error(`[DB_STORE_ERROR] Lưu đĩa thất bại: ${error.message}`);
    // Đảm bảo dọn dẹp file tạm nếu quá trình thất bại
    await fs.unlink(tempFilePath).catch(() => {});
    throw error;
  }
}
```

---

## PHẦN 5: QUY CHUẨN REALTIME VỚI SOCKET.IO

### 5.1. Quy ước định danh sự kiện thời gian thực (Event Naming Convention)
Mọi tên sự kiện Socket.IO trong toàn bộ dự án VIVU bắt buộc phải tuân theo cấu trúc phân cấp hai phần ngăn cách bởi dấu hai chấm:
$$\mathbf{<\text{domain}>:<\text{action}>}$$
- Trong đó:
  - `<domain>` đại diện cho phân hệ nghiệp vụ: `gps`, `chat`, `spatial`, `circle`, `friend`, `notification`, `stories`, `user`.
  - `<action>` đại diện cho hành động hoặc trạng thái: `update`, `send`, `message`, `read`, `trigger`, `member_joined`, `peer-update`.
- Nghiêm cấm đặt tên sự kiện vô tổ chức như `newMsg`, `UPDATE_LOC`, `dataEvent`.

### 5.2. Kiểm soát phạm vi phát sóng (Broadcast Scoping)
Để tối ưu hóa băng thông mạng và bảo vệ tính riêng tư của người dùng, lập trình viên phải lựa chọn chính xác 1 trong 4 phương thức phát sóng sau:

| Phương thức phát sóng | Cú pháp chuẩn | Mục đích áp dụng | Ngữ cảnh thực tế trong VIVU |
|---|---|---|---|
| **Targeted Emit** | `io.to(socketId).emit(...)`<br>hoặc hàm `emitToUser(userId, ...)` | Gửi riêng tư tới một người dùng cụ thể trên tất cả các socket đang mở của họ. | Gửi tin nhắn chat riêng (`chat:message`), lời mời kết bạn (`friend-request:incoming`), thông báo mới (`notification:new`). |
| **Room Broadcast** | `io.to(roomId).emit(...)` | Phát sóng tới toàn bộ các thành viên đã tham gia vào một phòng trò chuyện hoặc nhóm riêng. | Thông báo trong Vòng kết nối nhóm (`circle:member_joined`, `circle:disbanded`), bình chọn trong nhóm. |
| **Peer Broadcast** | `socket.broadcast.emit(...)` | Phát sóng tới tất cả mọi client đang kết nối trên toàn mạng, **ngoại trừ** chính client vừa phát sự kiện. | Cập nhật vị trí di chuyển (`gps:peer-update`), thông báo người dùng vừa trực tuyến (`user:online`). |
| **Global Multicast** | `io.emit(...)` | Phát sóng toàn cầu tới tất cả mọi client không phân biệt (bao gồm cả người gửi). | Thông báo story đôi vừa sinh ra sau khi cụng ly (`stories:new`), người dùng ngắt kết nối hoàn toàn (`user:offline`). |

### 5.3. Quản lý Vòng đời Kết nối (Connection Lifecycle Management)
1. **Xác thực Handshake (Handshake Authentication)**:
   - Khi client khởi tạo kết nối, bắt buộc phải truyền mã định danh qua `socket.handshake.auth.userId`.
   - Nếu `userId` bị thiếu hoặc không hợp lệ, máy chủ lập tức từ chối kết nối và đóng socket:
     ```javascript
     if (!socket.handshake.auth?.userId) {
       socket.disconnect(true);
       return;
     }
     ```
2. **Quản lý Đa Thiết Bị / Đa Tab (Multi-Device Map)**:
   - Một người dùng có thể mở VIVU trên nhiều tab trình duyệt hoặc vừa mở trên máy tính vừa mở trên điện thoại.
   - Máy chủ quản lý danh sách socket thông qua cấu trúc dữ liệu:
     `const userSockets = new Map<string, Set<string>>();`
   - Khi một socket ngắt kết nối (`disconnect`), máy chủ xóa `socket.id` khỏi tập hợp `Set`. **Chỉ khi kích thước của tập hợp bằng 0**, người dùng mới chính thức được coi là Offline và máy chủ mới phát sự kiện `user:offline`.
3. **Quản lý Tham gia / Rời phòng (Room Cleanup)**:
   - Khi tham gia hội thoại hoặc nhóm: `socket.join(conversationId)`.
   - Khi rời nhóm: `socket.leave(conversationId)`.
4. **Xử lý Thoát Ứng dụng An toàn (Graceful Disconnection)**:
   - Phía Client: Khi người dùng đóng tab hoặc tải lại trang, lắng nghe sự kiện `pagehide` và phát tín hiệu qua `navigator.sendBeacon('/api/gps/offline', payload)` nhằm bảo đảm lệnh cập nhật Offline luôn đến được máy chủ ngay cả khi tiến trình JavaScript của tab đã bị trình duyệt tiêu diệt.

### 5.4. Chống trùng lặp thông điệp (Message Idempotency)
Để loại trừ hiện tượng tin nhắn bị gửi lặp do độ trễ mạng hoặc việc người dùng bấm nút gửi liên tiếp:
- Mỗi tin nhắn gửi đi bắt buộc phải mang một mã định danh ngẫu nhiên duy nhất phía client: `client_msg_id` (sinh ra bằng `crypto.randomUUID()`).
- Máy chủ kiểm tra nếu `client_msg_id` đã tồn tại trong cuộc trò chuyện trong vòng 60 giây gần nhất, lập tức bỏ qua thao tác chèn mới và chỉ trả về bản ghi tin nhắn sẵn có.

### 5.5. Mã minh họa đối chiếu Socket.IO (DO vs DON'T)

```javascript
// ❌ DON'T: Đặt tên sự kiện tùy tiện, phát sóng bừa bãi toàn server, leak memory khi ngắt kết nối
io.on('connection', (socket) => {
  // Sai: Không kiểm tra auth, ai cũng kết nối được
  socket.on('send_msg', (data) => {
    // Nguy hiểm: Tin nhắn riêng tư 1-1 lại broadcast toàn bộ người dùng trong hệ thống!
    io.emit('new_msg', data);
  });
});

// ✅ DO: Đặt tên chuẩn <domain>:<action>, quản lý đa thiết bị theo Set, phát sóng đúng đối tượng
// File: src/services/socketService.js
const userSockets = new Map(); // userId -> Set<socketId>

export function registerSocketHandlers(io, socket) {
  const userId = socket.handshake.auth?.userId;
  if (!userId) {
    socket.disconnect(true);
    return;
  }

  // Đăng ký socket vào danh sách quản lý
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
    // Thông báo cho các peer khác biết người này vừa online
    socket.broadcast.emit('user:online', { userId, timestamp: Date.now() });
  }
  userSockets.get(userId).add(socket.id);

  // Xử lý gửi tin nhắn chuẩn mực
  socket.on('chat:send', async (payload) => {
    const { recipientId, conversationId, text, clientMsgId } = payload;
    if (!recipientId || !text?.trim()) return;

    // Lưu tin nhắn an toàn qua Service
    const savedMessage = await dbService.sendMessage({
      senderId: userId,
      recipientId,
      conversationId,
      text: text.trim(),
      clientMsgId
    });

    // Phát riêng cho người nhận nếu họ đang online
    const recipientSocketSet = userSockets.get(recipientId);
    if (recipientSocketSet) {
      recipientSocketSet.forEach((sockId) => {
        io.to(sockId).emit('chat:message', savedMessage);
      });
    }

    // Phản hồi xác nhận thành công cho người gửi
    socket.emit('chat:sent', { success: true, message: savedMessage });
  });

  // Dọn dẹp an toàn khi socket ngắt kết nối
  socket.on('disconnect', () => {
    const userSocketSet = userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.delete(socket.id);
      if (userSocketSet.size === 0) {
        userSockets.delete(userId);
        // Đánh dấu offline trong DB và phát thông báo toàn map
        dbService.setUserOffline(userId);
        io.emit('user:offline', { userId, timestamp: Date.now() });
      }
    }
  });
}
```

---

## PHẦN 6: QUY CHUẨN XỬ LÝ LỖI & HỆ THỐNG GHI NHẬT KÝ (ERROR HANDLING & LOGGING)

### 6.1. Định dạng phản hồi API chuẩn hóa (Unified API Response Schema)
100% các RESTful API endpoints trong dự án VIVU bắt buộc phải trả về dữ liệu có cấu trúc JSON đồng nhất theo định dạng dưới đây:

#### 1. Định dạng Phản hồi Thành công (Success Response):
```json
{
  "success": true,
  "data": {
    "userId": "usr_94821a",
    "userCode": "VU-2048",
    "fullName": "Mai Đức Tùng",
    "isOnline": true
  },
  "message": "Cập nhật hồ sơ cá nhân thành công."
}
```

#### 2. Định dạng Phản hồi Thất bại (Error Response):
```json
{
  "success": false,
  "error": {
    "code": "CIRCLE_FORBIDDEN_ACCESS",
    "message": "Bạn không có quyền thực hiện thao tác này trong nhóm riêng.",
    "details": {
      "circleId": "circle-8472",
      "requiredRole": "owner",
      "currentRole": "member"
    }
  }
}
```

### 6.2. Quy chuẩn Mã trạng thái HTTP (HTTP Status Code Standards)

| Mã HTTP | Tên chuẩn | Ý nghĩa nghiệp vụ trong VIVU | Ví dụ ngữ cảnh kích hoạt |
|---|---|---|---|
| **`200 OK`** | Thành công chuẩn | Yêu cầu đọc (`GET`) hoặc cập nhật (`PUT`/`POST`) dữ liệu thành công. | Lấy danh sách bạn bè, cập nhật tọa độ GPS, đổi mật khẩu. |
| **`201 Created`** | Khởi tạo thành công | Một bản ghi thực thể mới đã được tạo lập bền vững trong hệ thống. | Đăng ký tài khoản mới, gửi tin nhắn mới, đăng Story định vị, tạo nhóm Circle. |
| **`400 Bad Request`** | Yêu cầu không hợp lệ | Thiếu trường bắt buộc, dữ liệu sai định dạng hoặc vượt quá giới hạn. | Thiếu email khi đăng nhập, tin nhắn dài quá 2000 ký tự, tọa độ GPS không hợp lệ. |
| **`401 Unauthorized`** | Chưa xác thực | Người dùng chưa đăng nhập hoặc token xác thực không hợp lệ / hết hạn. | Truy cập API yêu cầu xác thực nhưng thiếu token hoặc header Authorization. |
| **`403 Forbidden`** | Bị từ chối truy cập | Đã xác thực danh tính nhưng không có quyền thực thi nghiệp vụ này. | Thành viên thường cố tình xóa nhóm Circle, người lạ gửi tin khi cài `friends_only`. |
| **`404 Not Found`** | Không tìm thấy | Tài nguyên yêu cầu không tồn tại trong cơ sở dữ liệu. | Tìm kiếm `userId` không tồn tại, xem chi tiết story đã bị xóa hoặc hết hạn. |
| **`409 Conflict`** | Xung đột tài nguyên | Dữ liệu gửi lên vi phạm ràng buộc duy nhất hoặc trạng thái xung đột. | Đăng ký bằng email đã có tài khoản, gửi lời mời kết bạn khi đã là bạn bè. |
| **`500 Internal Error`** | Lỗi máy chủ nội bộ | Lỗi ngoại lệ chưa được kiểm soát phát sinh từ tầng code hoặc hệ thống. | Lỗi phân tích cú pháp CSDL, lỗi hỏng phần cứng đĩa cứng chưa kịp bắt. |

### 6.3. Kiến trúc bắt lỗi giao diện Frontend (Frontend Error Boundary)
Để ngăn chặn hoàn toàn hiện tượng "Màn hình trắng chết chóc" (White Screen of Death) khi một component con phát sinh lỗi render JavaScript:
1. **Bao bọc toàn cục (`main.jsx`)**: Thành phần `<ErrorBoundary>` bao bọc bên ngoài toàn bộ cây component của `<App />`.
2. **Bao bọc các phân hệ nhạy cảm**: Tách riêng Error Boundary cho các thành phần đồ họa cao như `GoogleMapView`, `MapboxCanvas`, và `SpatialBumpModal3D`.
3. **Hiển thị Giao diện Dự phòng (Fallback UI)**: Cung cấp thông báo lỗi thân thiện bằng Tiếng Việt kèm nút bấm "Tải lại ứng dụng" (`window.location.reload()`) và nút "Xóa bộ nhớ đệm phục hồi" (`localStorage.clear()`).

### 6.4. Quy chuẩn Ghi nhật ký Hệ thống (Structured Logging Guidelines)
1. **Phân cấp 4 Mức độ Ghi nhật ký**:
   - `DEBUG`: Dành riêng cho quá trình phát triển nội bộ (chi tiết payload, bước trung gian).
   - `INFO`: Ghi nhận các sự kiện hoạt động thông thường (máy chủ khởi động, client kết nối socket, người dùng đăng nhập thành công).
   - `WARN`: Cảnh báo nguy cơ tiềm ẩn (tệp backup `.bak` được kích hoạt, thử lại lần 2 khi ghi đĩa, tọa độ GPS bị nhảy vọt).
   - `ERROR`: Lỗi nghiêm trọng ảnh hưởng trực tiếp tới luồng nghiệp vụ (không thể lưu file, ngoại lệ kết nối socket).
2. **Cấu trúc Nhật ký Chuẩn mực**:
   `[ISO_TIMESTAMP] [LOG_LEVEL] [MODULE_NAME] Message - Details`
   *Ví dụ*: `[2026-11-16T06:00:00.123Z] [INFO] [AUTH] User VU-2048 logged in successfully from 127.0.0.1`
3. **Tuyệt đối Bảo mật Thông tin (Sanitization of Logs)**:
   - Nghiêm cấm ghi log chứa mật khẩu người dùng (`password`), mã token xác thực (`Authorization: Bearer ...`), hoặc chuỗi Base64 đầy đủ của hình ảnh vào màn hình console hoặc tệp nhật ký.

### 6.5. Mã minh họa đối chiếu Error Handling & Logging (DO vs DON'T)

```javascript
// ❌ DON'T: Trả về status 200 cho lỗi, format response lộn xộn, log bừa bãi mật khẩu
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  console.log("Đăng nhập với password: " + password); // Rò rỉ bảo mật nghiêm trọng!
  const user = findUser(email, password);
  if (!user) {
    // Sai lầm: Trả về HTTP 200 nhưng bên trong ghi status: false
    return res.status(200).send("User không tồn tại!");
  }
  res.send(user);
});

// ✅ DO: Chuẩn hóa HTTP Status Code, format JSON thống nhất, middleware xử lý lỗi tập trung
// File: src/controllers/authController.js
export async function handleLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'AUTH_MISSING_CREDENTIALS',
          message: 'Vui lòng cung cấp đầy đủ email và mật khẩu đăng nhập.'
        }
      });
    }

    const authResult = await dbService.authenticateUser(email, password);
    if (!authResult.success) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Email hoặc mật khẩu không chính xác.'
        }
      });
    }

    // Ghi log bảo mật có cấu trúc (không bao gồm password)
    console.info(`[${new Date().toISOString()}] [INFO] [AUTH] Đăng nhập thành công cho người dùng: ${email}`);

    return res.status(200).json({
      success: true,
      data: authResult.data,
      message: 'Đăng nhập thành công.'
    });
  } catch (error) {
    // Chuyển tiếp tới error handling middleware tập trung
    next(error);
  }
}
```

---

## PHẦN 7: QUY CHUẨN BẢO MẬT & TỐI ƯU HIỆU NĂNG (SECURITY & PERFORMANCE GUIDELINES)

### 7.1. Tối ưu nén ảnh phía Client (Client-Side Image Compression)
Một trong những nguyên nhân hàng đầu gây sập trình duyệt di động là việc người dùng tải lên các bức ảnh gốc chụp từ camera điện thoại (dung lượng từ 5MB - 15MB, độ phân giải 4000x3000px). Khi chuyển thành chuỗi Base64, kích thước tăng thêm 33%, gây tràn bộ nhớ RAM (Heap Out of Memory) và lỗi vượt hạn ngạch LocalStorage (`QuotaExceededError: Failed to execute 'setItem' on 'Storage'`).

**Quy chuẩn bắt buộc (`imageCompressor.js`)**:
1. Toàn bộ ảnh đại diện (Avatar) và ảnh tải lên trước khi truyền qua Socket hoặc HTTP phải được nén trực tiếp trên trình duyệt qua HTML5 Canvas.
2. **Kích thước tối đa**: Co về kích thước chuẩn **256x256 pixels** (đối với avatar) hoặc **1080x1920 pixels** (đối với Story 24h).
3. **Định dạng & Chất lượng**: Sử dụng định dạng `image/jpeg` với chất lượng nén từ **0.82 đến 0.85**.
4. **Giới hạn dung lượng**: Đảm bảo tệp sau nén có kích thước nhỏ hơn **35KB** (đối với avatar), giảm tải đến 98% băng thông mạng.

### 7.2. Kiểm tra và làm sạch dữ liệu đầu vào (Input Validation & Sanitization)
1. **Kiểm tra Phía Máy chủ (Server-side Validation)**: Tuyệt đối không tin tưởng bất kỳ dữ liệu nào gửi lên từ Client. Mọi tham số đều phải được kiểm tra kiểu dữ liệu, độ dài và tính hợp lệ tại Controller.
2. **Giới hạn Độ dài Chuỗi Ký tự**:
   - Tên người dùng (`fullName`): Tối đa 50 ký tự.
   - Dòng trạng thái / Bio: Tối đa 300 ký tự.
   - Tin nhắn trò chuyện (`text`): Tối đa 2000 ký tự.
3. **Phòng chống Tấn công XSS (Cross-Site Scripting)**:
   - Làm sạch các thẻ HTML độc hại (`<script>`, `<iframe>`, `javascript:`) trước khi lưu trữ hoặc phát sóng.
   - Tận dụng cơ chế tự động escape ký tự của React JSX khi hiển thị nội dung ra giao diện.

### 7.3. Cấu hình CORS & Quản lý Biến môi trường
1. **Cấu hình CORS Nghiêm ngặt**:
   - Sử dụng biến môi trường `CORS_ORIGIN` để định rõ các tên miền được phép truy cập (ví dụ: `http://localhost:5173`, `https://vivu.example.com`).
   - Tuyệt đối cấm cấu hình `origin: '*'` kết hợp `credentials: true` trong môi trường triển khai Production.
2. **Quản lý Bảo mật qua Biến Môi trường (`.env`)**:
   - Mọi thông tin khóa bí mật (Secret Keys, Supabase Tokens, Mapbox Access Tokens) bắt buộc phải đặt trong tệp `.env`.
   - Đảm bảo tệp `.env` đã được đưa vào `.gitignore` để ngăn chặn rò rỉ lên các kho lưu trữ mã nguồn công khai.

### 7.4. Kiểm soát cách ly người dùng khách (Guest Users Isolation)
Khi người dùng truy cập webapp mà chưa đăng ký tài khoản, hệ thống có thể tạm thời cấp phát định danh vãng lai dạng `client-{UUID}`.
- **Quy tắc cách ly**: Các tài khoản khách `client-xxx` chỉ tồn tại trong phiên duyệt web hiện tại.
- **Chặn ghi đĩa**: Tầng Service `dbStore.js` kiểm tra và loại bỏ hoàn toàn các bản ghi mang tiền tố `client-` trước khi ghi xuống `vivu_database.json`, ngăn chặn hoàn toàn việc rác dữ liệu làm phình CSDL.

### 7.5. Thuật toán lọc trôi GPS & Tiết kiệm năng lượng thiết bị
Cảm biến GPS trên thiết bị di động thường xuyên bị nhiễu do thời tiết hoặc nhà cao tầng, gây hiện tượng vị trí bị nhảy liên tục dù người dùng đang đứng yên (Micro-drift).
- **Bộ lọc Ngưỡng tối thiểu (Micro-Drift Threshold Filter)**: Áp dụng trong `useGeolocation.js`. Chỉ cập nhật và phát sóng vị trí mới nếu khoảng cách di chuyển thực tế theo công thức Haversine lớn hơn **8 mét**:
  $$\Delta d = \text{Haversine}(\text{lat}_{\text{new}}, \text{lng}_{\text{new}}, \text{lat}_{\text{old}}, \text{lng}_{\text{old}}) \ge 8\text{m}$$
- **Bộ lọc Tọa độ Ảo**: Kiểm tra và loại bỏ hoàn toàn các tọa độ mặc định giả lập của trình duyệt (ví dụ tọa độ cứng Đà Nẵng `16.0544, 108.2022`).
- **Tối ưu Tần số Đồng bộ**: Khoảng thời gian phát tín hiệu GPS qua Socket tối thiểu là **5 giây / lần**, tránh làm cạn kiệt pin của thiết bị người dùng.

### 7.6. Mã minh họa đối chiếu Bảo mật & Hiệu năng (DO vs DON'T)

```javascript
// ❌ DON'T: Gửi trực tiếp ảnh nguyên bản 10MB Base64, không sanitize tin nhắn, spam GPS
export function BadUploadAvatar({ file }) {
  const reader = new FileReader();
  reader.onload = (e) => {
    // Nguy hiểm: Chuỗi Base64 dài hàng triệu ký tự gây đơ trình duyệt và crash LocalStorage
    localStorage.setItem('user_avatar', e.target.result);
    socket.emit('update_avatar', { avatar: e.target.result });
  };
  reader.readAsDataURL(file);
}

// ✅ DO: Nén ảnh Canvas 256x256 JPEG (~30KB), lọc trôi GPS Haversine 8m
// File: src/utils/imageCompressor.js
export async function compressAvatar(file, maxDimension = 256, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Tệp tải lên không phải là định dạng hình ảnh hợp lệ.'));
    }

    const imageElement = new Image();
    const objectUrl = URL.createObjectURL(file);

    imageElement.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Tính toán tỷ lệ co ảnh giữ nguyên tỷ lệ khung hình
      let width = imageElement.width;
      let height = imageElement.height;

      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(imageElement, 0, 0, width, height);

      // Xuất chuỗi Base64 JPEG chất lượng cao với dung lượng siêu nhỏ (~20-30KB)
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    imageElement.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Không thể tải và phân tích dữ liệu hình ảnh.'));
    };

    imageElement.src = objectUrl;
  });
}
```

---

## PHẦN 8: QUY TRÌNH KIỂM THỬ & ĐẢM BẢO CHẤT LƯỢNG (QA & CODE REVIEW CHECKLIST)

### 8.1. Tiêu chuẩn viết kiểm thử đơn vị & tích hợp (Unit & Integration Tests)
Mọi chức năng nghiệp vụ mới hoặc sửa đổi trong hệ thống VIVU đều bắt buộc phải đi kèm ca kiểm thử tự động đạt các chuẩn mực sau:
1. **Khung kiểm thử**: Sử dụng bộ kiểm thử nguyên bản của Node.js (`node --test`).
2. **Quy ước đặt tên tệp kiểm thử**: Tệp kiểm thử đặt trong thư mục `backend/tests/` với hậu tố `*.test.js` (ví dụ `friendship.test.js`, `circleLifecycle.test.js`).
3. **Mô hình Cấu trúc Ba Bước (Arrange - Act - Assert - AAA)**:
   - **Arrange**: Chuẩn bị dữ liệu đầu vào, trạng thái mock hoặc bản ghi thử nghiệm.
   - **Act**: Kích hoạt hàm nghiệp vụ hoặc lời gọi API cần kiểm thử.
   - **Assert**: So sánh kết quả thực tế với giá trị kỳ vọng một cách nghiêm ngặt (`assert.strictEqual`, `assert.deepStrictEqual`).
4. **Độ bao phủ tối thiểu (Coverage)**:
   - Đạt 100% tỷ lệ vượt qua trên toàn bộ **74 ca kiểm thử hiện tại** của hệ thống.
   - Bao phủ các tình huống biên (Edge Cases): ID không tồn tại, gửi dữ liệu rỗng, chia sẻ vị trí quá hạn, giải tán nhóm khi chỉ còn 1 thành viên.

### 8.2. Bảng kiểm tra đánh giá mã nguồn (PR Review Checklist 10 điểm)
Trước khi một nhánh tính năng được phép sáp nhập (Merge) vào nhánh chính (`main`), người thực hiện kiểm duyệt mã nguồn (Reviewer) bắt buộc phải đối chiếu và đánh dấu đạt đủ **10 tiêu chí vàng**:

| STT | Tiêu chí đánh giá (Review Criteria) | Câu hỏi kiểm tra thẩm định | Trạng thái |
|:---:|---|---|:---:|
| **1** | **Quy ước đặt tên & Cấu trúc tệp** | Các tệp React component có viết `PascalCase.jsx` không? Hằng số có viết `UPPER_SNAKE_CASE` không? Component có dưới 450 dòng không? | [ ] |
| **2** | **Giải phóng Bộ nhớ (Memory Cleanup)** | `useEffect` có return hàm cleanup không? Bản đồ Leaflet/Mapbox và Three.js WebGL VRAM có được `.dispose()` và `.remove()` khi unmount không? | [ ] |
| **3** | **An toàn GPS & Khử trôi** | Có sử dụng bộ lọc Haversine 8m không? Tuyệt đối không gán cứng tọa độ mặc định Đà Nẵng? | [ ] |
| **4** | **Chuẩn hóa Xử lý Lỗi & HTTP** | Mọi lời gọi bất đồng bộ có bọc trong `try/catch` không? Mã HTTP (200, 201, 400, 401, 403, 404, 500) có phản ánh đúng ngữ cảnh không? | [ ] |
| **5** | **Thẩm định & Làm sạch Dữ liệu** | Dữ liệu đầu vào phía server có được validate kiểu và độ dài không? Có phòng chống tấn công XSS? | [ ] |
| **6** | **Ghi đĩa Nguyên tử & EBUSY Retry** | Thao tác ghi file CSDL có thông qua tệp `.tmp` và đổi tên atomic không? Có vòng lặp retry 3 lần chống khóa file trên Windows? | [ ] |
| **7** | **Chuẩn hóa Socket.IO** | Sự kiện có đặt tên theo dạng `<domain>:<action>` không? Có chọn đúng phạm vi phát sóng (targeted/room/broadcast/multicast)? | [ ] |
| **8** | **Nén ảnh Phía Client** | Ảnh đại diện và ảnh tải lên có được nén qua Canvas 256x256 JPEG (~30KB) trước khi gửi đi không? | [ ] |
| **9** | **Bảo mật Nhật ký (No Leaks in Logs)** | Không để sót `console.log` rác? Không ghi mật khẩu, token xác thực hoặc chuỗi Base64 thô vào log? | [ ] |
| **10** | **Kiểm thử Tự động Đạt 100%** | Toàn bộ 74 bài kiểm thử backend (`npm test`) có chạy qua 100% (0 failures) không? Linter (`npm run lint`) có đạt 0 lỗi không? | [ ] |

### 8.3. Quy chuẩn Quản lý Tài nguyên & Chống Sập Trình Duyệt Di Động (Mobile Browser Anti-Crash & Resource Protocol)
Khi phát triển các tính năng tương tác thời gian thực trên môi trường di động (iOS Safari, Android Chrome, WebView), bắt buộc tuân thủ 4 nguyên tắc kỹ thuật phòng chống crash ứng dụng:

1. **Singleton Web AudioContext Engine**:
   - iOS WebKit áp đặt giới hạn cứng tối đa 6 đối tượng `AudioContext` hoạt động đồng thời. Bất kỳ hàm phát âm thanh nào (chuông, tactile click, shutter sound, beacon) tuyệt đối không được gọi `new AudioContext()`.
   - Bắt buộc dùng `getSharedAudioContext()` từ `utils/audioContextManager.js` để tái sử dụng một AudioContext duy nhất trên toàn ứng dụng.
2. **Tiết lưu Cảm biến Chuyển động Phần cứng (Motion Sensor Throttling)**:
   - Trên các thiết bị có tần số quét cao (90Hz / 120Hz ProMotion), sự kiện `devicemotion` kích hoạt 60 - 120 lần/giây.
   - Bắt buộc áp dụng bộ lọc thời gian (Throttle tối thiểu 100ms / 10Hz) trước khi tính toán gia tốc `deltaX + deltaY + deltaZ`, giảm 90% tải CPU và bảo vệ thiết bị không bị hệ điều hành tắt do quá nhiệt hoặc tiêu thụ năng lượng vượt ngưỡng.
3. **Giãn chu kỳ Polling & Chế độ Ngủ Thông minh (Adaptive Polling & Smart Sleep)**:
   - Khi WebSocket (Socket.IO) đang ở trạng thái kết nối (`isSocketConnected = true`), giãn chu kỳ polling (nhịp tim GPS giãn lên 8s, quét tin nhắn lên 5s) để chống nghẽn hàng đợi mạng.
   - Toàn bộ các vòng lặp polling phải kiểm tra `if (document.hidden) return;` để dừng ngay lập tức mọi request ngầm khi người dùng khóa màn hình hoặc chuyển ứng dụng, tránh tràn RAM do rò rỉ bộ nhớ.
4. **Giao thức Đường Hầm Bền Vững (Persistent Tunnel Protocol)**:
   - Khi kết nối qua Cloudflare Tunnel trên mạng di động 4G/5G, bắt buộc sử dụng giao thức `--protocol http2` (TCP port 443) thay vì UDP/QUIC mặc định nhằm ngăn chặn việc nhà mạng ngắt kết nối sau 30-60 giây nhàn rỗi.

---

## PHẦN 9: KẾT LUẬN VÀ ĐỊNH HƯỚNG PHÁT TRIỂN

Bộ quy chuẩn lập trình **VIVU Coding Standards & Engineering Guidelines** là kim chỉ nam kỹ thuật xuyên suốt quá trình thiết kế, triển khai và bảo trì sản phẩm mạng xã hội bản đồ VIVU. Việc tuân thủ nghiêm ngặt các tiêu chuẩn này không chỉ đảm bảo ứng dụng vận hành mượt mà, ổn định và an toàn trên đa dạng thiết bị, mà còn thể hiện phương pháp luận kỹ thuật bài bản, tính kỷ luật chuyên nghiệp của một đồ án tốt nghiệp đại học đạt chuẩn công nghiệp cao.

Trong các giai đoạn phát triển tiếp theo khi mở rộng quy mô hệ thống phục vụ hàng trăm nghìn người dùng đồng thời, các tiêu chuẩn này sẽ tiếp tục là nền tảng để nhóm chuyển dịch kiến trúc dữ liệu sang cụm cơ sở dữ liệu phân tán PostgreSQL/PostGIS kết hợp Redis Pub/Sub một cách trơn tru và nhất quán.

---
*Tài liệu được biên soạn và bảo hộ bởi Ban Kỹ thuật Dự án VIVU. Mọi sự sửa đổi nội dung phải được thông qua sự đồng thuận của nhóm phát triển và Giảng viên hướng dẫn đồ án.*
