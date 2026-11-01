# Quy Tắc Phát Triển Dự Án VIVU (Learned Rules & Behavioral Invariants)

Tài liệu này ghi lại các quy tắc cốt lõi được đúc kết từ quá trình phát triển dự án VIVU Web App:

---

## 1. Vận Hành Dev Server & Phục Hồi Tiến Trình
- **Nguyên tắc**: Khi nhận được thông báo môi trường nền khởi động lại (`server restart`), tiến trình nền `npm run dev` sẽ bị dừng.
- **Quy tắc bắt buộc**: Phải kiểm tra ngay tình trạng server bằng `manage_task` hoặc `curl.exe` và tự động khởi động lại `npm.cmd run dev` (với `IsDaemon: true`) để đảm bảo địa chỉ `http://localhost:5173/` luôn hoạt động liên tục, không gây hiểu lầm là ứng dụng bị nghẽn.

---

## 2. Kiểm Thử Cú Pháp JSX & Tránh Lỗi Build
- **Nguyên tắc**: Các file component lớn (như `App.jsx`) chứa nhiều khối điều kiện rendering (`{isCondition && (`). Việc mở/đóng thiếu thẻ `</div>` hoặc `)}` có thể làm hỏng toàn bộ build.
- **Quy tắc bắt buộc**: Sau mỗi lần chỉnh sửa lớn trên JSX:
  1. Luôn chạy `npm.cmd run build` trong thư mục `frontend/` để đảm bảo 0 lỗi cú pháp trước khi bàn giao cho người dùng.
  2. Tuyệt đối không thay thế đại trà bằng regex làm mất các thẻ đóng lồng nhau.

---

## 3. Tương Tác Marker Đa Tầng Trên Mapbox GL JS (Dual-Click Delegation)
- **Nguyên tắc**: Ghim Giọt Nước (Teardrop Marker) hoặc các marker custom trên bản đồ Mapbox chứa nhiều thành phần con tương tác độc lập (ví dụ: thân giọt nước để mở Sheet chi tiết, nút con `+ Đăng Story` để mở Modal tạo).
- **Quy tắc bắt buộc**: Sử dụng kỹ thuật Event Delegation chính xác:
  ```javascript
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    if (e.target.closest('#btn-quick-create-story')) {
      openCreateModal();
    } else {
      openUserMenu();
    }
  });
  ```

---

## 4. Kiến Trúc Dual-Mode Cho Backend (Supabase Cloud & Local Fallback)
- **Nguyên tắc**: Ứng dụng VIVU phải luôn hoạt động mượt mà trong cả 2 trường hợp:
  1. Khi đã cấu hình `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` trong `.env`: Đọc/ghi trực tiếp vào Supabase Cloud và kích hoạt Realtime Pub/Sub.
  2. Khi chưa có key hoặc offline: Tự động fallback sang Local Storage / State mà không bao giờ báo lỗi đỏ hay crash ứng dụng.

---

## 5. Quy Chuẩn Thẩm Mỹ VIVU & Anti-Emoji
- **100% Bootstrap Icons**: Tuyệt đối không sử dụng ký tự Unicode Emoji trong toàn bộ ứng dụng. Tất cả biểu tượng phải dùng font vector Bootstrap Icons (`bi bi-...`).
- **Ghim Giọt Nước VIVU**: Luôn neo chóp nhọn vào mặt đất (`anchor: 'bottom'`) để tâm GPS cắm chuẩn xác vào mặt đường khi xoay/nghiêng bản đồ 3D.

---

## 6. Phân Hệ Độc Lập Frontend - Backend - Infra
- **Nguyên tắc**: Tách bạch 3 phân hệ theo chuẩn fullstack:
  - `frontend/`: Ứng dụng Web App React + Vite.
  - `backend/`: API Server Node.js / Express (Layered: routes, controllers, services).
  - `infra/`: Cấu hình hạ tầng, Docker Compose, Nginx Reverse Proxy, Migrations & Seeds Supabase PostGIS.

---

## 7. Module Hóa Component & Chống File Đơn Khối (Anti-Monolith)
- **Nguyên tắc**: Không để file JSX vượt quá 450 dòng.
- **Quy tắc bắt buộc**: Bóc tách theo feature modules (`components/map/`, `components/story/`, `components/chat/`, `components/circle/`, `components/layout/`). File `App.jsx` chỉ đóng vai trò Shell điều phối trạng thái cấp cao.

---

## 8. Quy Chuẩn Đăng Khoảnh Khắc Story & Tâm Trạng Nhanh (Story Studio & Quick Status)
- **Nguyên tắc**: Tối giản và tập trung vào trải nghiệm chia sẻ khoảnh khắc thực tế gắn tọa độ GPS và âm nhạc, loại bỏ hoàn toàn tính năng tạo kèo/rủ đi chơi rườm rà.
- **Quy tắc bắt buộc**:
  1. Khi người dùng bấm nút (+) tạo bài đăng: Mở trực tiếp Story Studio Modal (`StoryStudioModal.jsx`).
     - Cho phép chụp ảnh/tải ảnh, chèn nhãn dán Meme Messenger, gắn nhạc nền thịnh hành (nghe thử thật), chọn dải màu gradient và hẹn giờ tự hủy từ 1h đến 24h.
     - Sau khi đăng: Tự động cắm ghim Story tại tọa độ GPS của người dùng trên Mapbox 3D (`myActiveStory`), hiển thị bong bóng trạng thái nổi bật trên đầu ghim "BẠN".
  2. Cập nhật tâm trạng nhanh (Custom Status): Người dùng có thể nhập ghi chú trạng thái 60 ký tự trực tiếp trên ghim giọt nước thông qua `UserLocationSheet.jsx` hoặc trang cá nhân.
  3. Tuyệt đối không dùng Unicode Emoji, 100% dùng Bootstrap Icons.

---

## 9. Quy Chuẩn Đồng Bộ Thành Viên Nhóm Lên Bản Đồ (Group-to-Map Member Spatial Sync)
- **Nguyên tắc**: Tính nhất quán 1:1 giữa danh sách thành viên trong Chat và số lượng giọt nước trên Bản đồ 3D.
- **Quy tắc bắt buộc**:
  1. Khi chọn lọc theo Nhóm trên bản đồ (`viewMode === circleId`): Chỉ hiển thị đúng $N$ giọt nước đại diện cho $N$ thành viên của nhóm đó (gồm 1 giọt nước của chính Bạn + $N-1$ giọt nước của các bạn bè trong `circle.memberIds`).
  2. Luôn tự động kích hoạt `map.fitBounds` bao trọn vị trí không gian của toàn bộ thành viên nhóm để người dùng có cái nhìn tổng quan ngay lập tức.

---

## 10. Quy Chuẩn Luồng Xác Thực Đăng Ký - Đăng Nhập (Registration-to-Login Flow)
- **Nguyên tắc**: Khi người dùng hoàn tất tạo tài khoản ở form Đăng Ký (Register), hệ thống TUYỆT ĐỐI KHÔNG tự động đăng nhập (No Auto-Login).
- **Quy tắc bắt buộc**:
  1. Khi đăng ký thành công: Lập tức chuyển hướng về Tab "Đăng Nhập" (`authMode === 'LOGIN'`).
  2. Tự động điền trước (pre-fill) địa chỉ email người dùng vừa đăng ký vào ô input Email của form Đăng Nhập.
  3. Hiển thị thông báo xác nhận thành công (Success Banner) yêu cầu người dùng nhập mật khẩu vừa tạo để chủ động đăng nhập vào ứng dụng.
  4. Chỉ khi người dùng bấm "Đăng Nhập" và xác thực thành công mới cấp phiên làm việc (Session) và mở khóa giao diện chính của VIVU.

---

## 11. Quy Chuẩn An Toàn Toạ Độ GPS & Chống Crash Màn Hình Trắng
- **Nguyên tắc**: Toàn bộ dự án VIVU thống nhất chuẩn toạ độ không gian GPS theo cặp thuộc tính rút gọn: `{ lat, lng }`.
- **Quy tắc bắt buộc**:
  1. Khi truy cập và hiển thị toạ độ số (`.toFixed()`): Bắt buộc kiểm tra nullish coalescing đa tầng kèm dự phòng an toàn:
     ```javascript
     const lat = location?.lat ?? location?.latitude ?? 10.7769;
     const lng = location?.lng ?? location?.longitude ?? 106.7009;
     const display = `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
     ```
  2. Tuyệt đối không gọi trực tiếp `.toFixed()` trên thuộc tính chưa được fallback số để ngăn ngừa 100% lỗi runtime crash giao diện.

---

## 12. Quy Chuẩn Độ Tương Phản Màu Sắc Form Nhập Liệu & Đồng Bộ Theme Resend Dark
- **Nguyên tắc**: Tuyệt đối không để xảy ra hiện tượng chữ và nền bị trùng màu (text invisibility) khi gõ phím trên bất kỳ form nào của ứng dụng.
- **Quy tắc bắt buộc**:
  1. Mọi trường nhập liệu (`<input>`, `<textarea>`, `<select>`) bắt buộc phải khai báo tường minh cặp thuộc tính tương phản:
     - Nền: `bg-[#151619]` hoặc `bg-[#1A1A1E]`
     - Viền: `border border-white/10 focus:border-white/40 focus:ring-1 focus:ring-white/20`
     - Màu chữ hiển thị: `text-white font-medium`
     - Placeholder: `placeholder-[#8E8E93]`
     - Icon đính kèm: `text-[#8E8E93]`
  2. Tuyệt đối không sử dụng class nền sáng (`bg-white`, `bg-vivu-ivory`) lồng bên trong theme Dark Monochrome mà không kiểm tra độ tương phản của chữ.

---

## 13. Quy Chuẩn Định Vị Không Gian Đa Tầng & Chống Mất Ghim Marker (Multi-Tier Location Engine)
- **Nguyên tắc**: Ứng dụng VIVU không bao giờ để giọt nước của người dùng bị kẹt vô cớ ở tọa độ mẫu mặc định khi người dùng ở vị trí địa lý khác.
- **Quy tắc bắt buộc**:
  1. **Kiến trúc định vị 3 tầng (Multi-Tier)**:
     - Tầng 1: HTML5 Geolocation API (`navigator.geolocation`) với `enableHighAccuracy: true` và `watchPosition`.
     - Tầng 2: Nếu Tầng 1 lỗi (bị chặn quyền, timeout, không có phần cứng) -> Tự động chuyển tiếp sang **IP Geolocation** để xác định ngay Tỉnh/Thành phố thực tế của người dùng.
     - Tầng 3: Lưu và đọc tọa độ thành công gần nhất từ `localStorage` (`vivu_user_real_location`) để khi tải lại trang ghim xuất hiện tức thì.
  2. **An toàn vòng đời Marker Mapbox**:
     - Khi map re-render hoặc switch tab, luôn đảm bảo `userMarkerRef.current` được kiểm tra tính hiện diện trong DOM canvas (`map.getContainer().contains(markerEl)`). Nếu bị ngắt kết nối, phải tự động tái gắn (`.addTo(mapRef.current)`).
     - Khi component map unmount, phải dọn dẹp sạch sẽ: `userMarkerRef.current?.remove(); userMarkerRef.current = null;`.

---

## 14. Quy Chuẩn Định Tuyến API Động Mạng Cục Bộ (Dynamic LAN API Routing)
- **Nguyên tắc**: Ứng dụng VIVU hỗ trợ truy cập đa thiết bị (máy tính PC & điện thoại di động) qua mạng Wi-Fi LAN nội bộ.
- **Quy tắc bắt buộc**:
  1. Tuyệt đối không hardcode `http://localhost:5000` trong các client API service (`apiClient.js`).
  2. Bắt buộc sử dụng hàm động nhận diện `window.location.hostname` (`http://${window.location.hostname}:5000/api`) để khi truy cập bằng điện thoại qua `192.168.1.x:5173`, request tự động gửi về đúng IP máy chủ backend.

---

## 15. Quy Chuẩn Đồng Bộ Không Gian Đa Thiết Bị (Cross-Device Realtime GPS Sync)
- **Nguyên tắc**: Hai hay nhiều thiết bị khi mở VIVU đồng thời ở gần nhau phải nhìn thấy giọt nước của nhau di chuyển trên bản đồ.
- **Quy tắc bắt buộc**:
  1. Mỗi thiết bị duy trì định danh duy nhất (`currentUserId`), phát sóng định kỳ (Heartbeat 3.5s) tọa độ `{ lat, lng }`, tên hiển thị, avatar và status lên backend.
  2. Kéo danh sách người dùng online (`apiClient.getProfiles()`), lọc bỏ chính mình (`p.id !== currentUserId`).
  3. Bắt buộc map tọa độ thực `realLat, realLng` vào cả 2 mảng `friends` và `stories` để dù người dùng đang ở tab **"Xã Hội"** hay **"Bạn Bè"** đều cắm ghim giọt nước của nick đối phương trên Mapbox 3D.

---

## 16. Quy Chuẩn Tự Động Tách Cụm Giọt Nước Không Gian (Spatial Marker Dispersion Invariant)
- **Nguyên tắc**: Khi 2 hay nhiều nick có tọa độ GPS trùng khít (hoặc cự ly < 60m, ví dụ cùng bấm "📍 Đà Nẵng" hoặc cùng ngồi chung phòng/quán cafe), tuyệt đối không để các giọt nước và bong bóng trạng thái đè lấp lên nhau che mất tầm nhìn.
- **Quy tắc bắt buộc**:
  1. Áp dụng thuật toán phân tán hướng tròn (Radial Offset $\ge 200$m, khoảng $0.0020^\circ$ theo hash ID của đối phương) trên `MapboxCanvas.jsx` để đảm bảo khoảng cách hiển thị trên màn hình điện thoại $\ge 60$px, không bị khung radar $256$px và bong bóng chữ $220$px của ghim "BẠN" che khuất.
  2. Bổ sung nhãn nhận diện `[GẦN BẠN]` và nâng `z-index: 30` cho ghim đối phương để đảm bảo luôn tương tác và chạm mở hồ sơ được.
  3. Đảm bảo người dùng luôn nhìn thấy giọt nước của chính mình ("BẠN") ở trung tâm và các giọt nước của bạn bè kề bên rõ ràng, độc lập.

---

## 17. Quy Chuẩn Định Danh Hội Thoại 1-1 Đa Thiết Bị (Direct Conversation Canonical ID)
- **Nguyên tắc**: Luồng tin nhắn giữa 2 người dùng bất kỳ phải đồng bộ 1:1 nhất quán qua mọi thiết bị (PC, Laptop, Điện thoại).
- **Quy tắc bắt buộc**:
  1. Luôn định danh ID hội thoại trực tiếp theo chuẩn: `conv-direct-` + `[userIdA, userIdB].sort().join('--')`.
  2. Bất kể thiết bị nào gửi tin nhắn, backend đều lưu vào cùng một conversationId và thiết bị đối phương polling 1.5s nhận được tức thì.

---

## 18. Quy Chuẩn Dự Phòng Camera Thiết Bị Di Động Mạng LAN (Mobile Media Capture Insecure Origin Fallback)
- **Nguyên tắc**: Trình duyệt di động khi truy cập qua HTTP LAN không an toàn (non-HTTPS) sẽ cấm WebRTC MediaStream, không được để giao diện rơi vào trạng thái màn hình đen.
- **Quy tắc bắt buộc**:
  1. Khi gọi `getUserMedia`, bắt buộc bọc trong `try-catch`. Nếu thất bại, kích hoạt cờ `cameraError = true` và hiển thị giao diện thông minh kèm nút mở máy ảnh.
  2. Bố trí thẻ ẩn `<input ref={nativeCameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" />` trong DOM.
  3. Khi stream bị lỗi hoặc người dùng bấm chụp, tự động kích hoạt `nativeCameraInputRef.current.click()` để gọi ứng dụng Camera gốc của thiết bị, sau đó đọc file ảnh qua `FileReader` và chuyển tiếp mượt mà vào màn hình chỉnh sửa & đăng Story.

---

## 19. Quy Chuẩn Phân Tầng Âm Thanh Web Audio API & Thông Báo Tin Nhắn Đến (Multi-Tier Audio Chime & Global Inbox Notification)
- **Nguyên tắc**: Ứng dụng VIVU phân định rạch ròi giữa âm thanh radar phát hiện bài đăng và âm thanh tin nhắn trò chuyện; người nhận phải nhận được thông báo dù đang ở bất kỳ tab nào.
- **Quy tắc bắt buộc**:
  1. Khởi tạo 2 bộ dao động sóng âm riêng biệt qua Web Audio API:
     - **Radar Story Alert**: Nốt trung trầm D5 (587.3Hz) -> A5 (880Hz), ngân dài 0.5s.
     - **Chat Message Toast**: Nốt bổng Pop-Chime E6 (1318.5Hz) -> A6 (1760Hz), dứt khoát 0.2s.
---

## 20. Quy Chuẩn Khóa Vị Trí Xác Thực & Chống Rung Lắc Cảm Biến Không Gian (Spatial Verified Anchor & Anti-Jitter Filter)
- **Nguyên tắc**: Không bao giờ để tiến trình IP Geolocation ngầm ghi đè lên tọa độ đã xác thực của người dùng (từ GPS, từ cache, hoặc do người dùng đã chọn), và không để micro-drift cảm biến gây giật lắc giao diện.
- **Quy tắc bắt buộc**:
  1. Khi thiết bị đã có tọa độ hợp lệ, `fetchIpLocation` bị cấm ghi đè. Chỉ dò IP khi thiết bị hoàn toàn chưa có bất kỳ vị trí nào.
  2. Áp dụng bộ lọc khoảng cách (Haversine $> 8$m) để loại bỏ rung lắc micro-drift vài mét khi người dùng đứng yên hoặc ở trong nhà.
  3. Nút định vị GPS trên bản đồ chỉ điều khiển camera `flyTo` về tâm giọt nước của Bạn, không gọi ngầm lệnh dò IP làm lệch tọa độ.

---

## 21. Quy Chuẩn Đồng Bộ Trực Tiếp Thẻ IMG Trong Marker DOM Mapbox (Direct Marker DOM Image Synchronization)
- **Nguyên tắc**: Khi avatar người dùng thay đổi, ghim giọt nước trên canvas Mapbox phải đổi ảnh tức thì mà không cần khởi tạo lại marker hay reload trang.
- **Quy tắc bắt buộc**:
  1. Trong nhánh cập nhật của marker ref (`else` branch), bắt buộc truy xuất thẻ `img` (`el.querySelector('img')`) và gán `img.src = safeAvatar`.
  2. Trên giao diện di động, các nút hành động như "Đặt avatar" phải luôn hiển thị (không dùng class ẩn phụ thuộc chuột hover `opacity-0 group-hover`).

---

## 22. Quy Chuẩn Vào Thẳng Bản Đồ Chế Độ Khách & Chống Chớp Đen Màn Hình (Zero-Flash Direct Guest Map Invariant)
- **Nguyên tắc**: Ứng dụng VIVU tuyệt đối không bao giờ được phép chặn cứng toàn bộ màn hình bằng một cổng xác thực đen ngòm khiến thiết bị di động mới mở link bị chớp giật hoặc màn hình đen.
- **Quy tắc bắt buộc**:
  1. **Khách trải nghiệm tức thì (Direct Guest Mode)**: Bất kỳ thiết bị nào (máy tính hay điện thoại qua mạng LAN) khi mở link web app phải được đưa thẳng vào Bản đồ 3D ngay lập tức. Thiết bị được tự động cấp định danh `currentUserId` tạm thời (`client-xxx`), cắm ghim giọt nước "BẠN" tại tọa độ GPS/IP và phát sóng đồng bộ với các thiết bị khác kề bên.
  2. **Form Đăng Nhập Không Xâm Lấn**: Form Đăng nhập / Đăng ký chỉ hiển thị dưới dạng Modal lớp phủ khi người dùng chủ động bấm trong tab **"Tôi"** (Hồ sơ) hoặc **"Cài đặt"**, không bao giờ unmount Bản đồ 3D.
  3. **Bọc An Toàn Toàn Cục**:
     - Toàn bộ ứng dụng React phải được bọc trong `ErrorBoundary` để nếu có lỗi runtime xảy ra sẽ hiển thị giao diện phục hồi tao nhã, không bao giờ để rơi vào màn hình đen của thẻ `#root`.
     - Toàn bộ thao tác truy xuất `localStorage` phải thông qua tiện ích `safeStorage` bọc `try...catch` để an toàn 100% trên Safari Private Browsing và trình duyệt di động hạn chế bộ nhớ.

---

## 23. Quy Chuẩn Tách Biệt Định Danh Khách Đa Thiết Bị & Giao Thức Kết Bạn 1-1 (Cross-Device Client Identity & Friendship Protocol Invariant)
- **Nguyên tắc**: Hai thiết bị độc lập cùng mở VIVU (kể cả khi chưa đăng nhập) không bao giờ bị loại trừ hoặc ẩn khỏi bản đồ của nhau do trùng tên hiển thị mặc định; trạng thái kết bạn và ảnh đại diện phải đồng bộ ngay tức thì.
- **Quy tắc bắt buộc**:
  1. **Tách biệt định danh khách (Unique Guest Identity)**: Mỗi thiết bị tự động được cấp mã số định danh 4 chữ số `currentUserCode` (`VU-XXXX`) và tên mặc định `VIVU Explorer #${userCode}` thay vì cùng mang tên chung `'Bạn (Tôi)'`.
  2. **Bộ lọc chủ sở hữu an toàn (ID-Only Ownership Filter)**: Hàm `isOwnerItem` trên Mapbox Canvas và `syncHeartbeat` chỉ so sánh `p.id === currentUserId`, cấm kiểm tra theo chuỗi `'Bạn (Tôi)'` để không vô tình lọc bỏ các thiết bị khác trong cùng mạng LAN.
  3. **Đồng bộ hóa ảnh đại diện đa phân hệ (Multi-Module Avatar Sync)**: Khi người dùng cập nhật avatar trong hồ sơ, hệ thống phát sóng ngay qua `updateGps` và cập nhật đồng thời vào các mảng `friends`, `stories`, `conversations` và ghim giọt nước "BẠN" để toàn bộ ứng dụng đổi ảnh tức thì không cần tải lại trang.
  4. **Giao thức kết bạn 1-1 toàn vẹn (Full-Cycle Friendship Protocol)**:
     - Hỗ trợ tìm kiếm theo Mã số người dùng (`VU-XXXX`), Tên, hoặc SĐT.
     - Cung cấp đầy đủ vòng đời: Gửi yêu cầu -> Nhận thông báo thời gian thực (Realtime Toast + Pop Chime) -> Chấp nhận / Từ chối / Hủy yêu cầu -> Cập nhật danh sách bạn bè đồng bộ 2 chiều tức thì.

---

## 24. Quy Chuẩn Giới Hạn Góc Nhìn Camera & Chống Zoom Out Toàn Cảnh Vô Cớ (Spatial Camera Clamping & Anti-Outerspace Invariant)
- **Nguyên tắc**: Camera bản đồ mạng xã hội VIVU tuyệt đối không bao giờ được phép tự ý phóng xa ra toàn cảnh quốc gia hoặc góc nhìn vũ trụ (zoom < 14.5) khi người dùng thao tác chuyển tab hoặc lọc dữ liệu.
- **Quy tắc bắt buộc**:
  1. **Lọc bán kính lân cận trước khi tính Bounds (Local Radius Filter)**:
     - Khi chuyển sang tab "Bạn Bè" (`activeTab === 'friends'`) hoặc nhóm riêng: Chỉ tính toán bounding box cho các bạn bè nằm trong phạm vi lân cận hợp lý (`distKm <= 5km` hoặc bán kính `radarDistance`).
     - Tuyệt đối không đưa tọa độ của các bạn bè ở tỉnh/thành phố khác vào hàm `bounds.extend`.
  2. **Khóa chặn mức phóng tối thiểu (Strict minZoom Clamping)**:
     - Sử dụng `map.cameraForBounds(bounds, { maxZoom: 16.5 })` để tính toán trước góc máy, và bắt buộc kẹp mức zoom tối thiểu:
       `const safeZoom = Math.max(camera.zoom, 15.0);`
     - Nếu không có bạn bè nào ở gần hoặc tất cả bạn bè ở xa: Tự động `flyTo` mượt mà về tâm giọt nước của Bạn ở mức zoom cận cảnh (`zoom: 16.2`, `pitch: 32-35`).
  3. **Tách biệt luồng Tab Transition và Polling Heartbeat**:
     - Hoạt cảnh camera chỉ được kích hoạt một lần duy nhất khi `activeTab` thực sự thay đổi (sử dụng `prevActiveTabRef`).
     - Nghiêm cấm đặt lệnh điều khiển camera (`flyTo`, `fitBounds`) chạy tự do bên trong các effect phản ứng theo mảng dữ liệu polling định kỳ (3.5s) để người dùng tự do cuộn/phóng to bản đồ mà không bị giật giật kéo góc nhìn.

---

## 25. Quy Chuẩn Hợp Nhất Đường Dẫn Reverse Proxy Cho Public Tunnel & Chống Lỗi Mixed Content (Unified Reverse Proxy & Tunnel Invariant)
- **Nguyên tắc**: Khi chia sẻ ứng dụng VIVU qua đường link công khai (Cloudflare Tunnel, ngrok, HTTPS tunnel), tuyệt đối không để xảy ra lỗi Mixed Content (gọi API HTTP trong trang HTTPS) và không phụ thuộc vào việc phải mở nhiều cổng (Vite 5173 và Node 5000) cùng lúc.
- **Quy tắc bắt buộc**:
  1. **Hợp nhất cổng qua Reverse Proxy (Vite server.proxy)**: Cổng frontend (Vite 5173) cấu hình proxy đường dẫn `/api` sang backend (Node.js 5000) kèm `changeOrigin: true` và `ws: true`.
  2. **Cho phép Host lạ (Vite server.allowedHosts)**: Bắt buộc bật `allowedHosts: true` trong `vite.config.js` để tránh bị Vite chặn khi nhận request từ domain ngẫu nhiên (`*.trycloudflare.com`, `*.loca.lt`).
  3. **Đường dẫn tương đối cho API Client**: `apiClient.js` sử dụng đường dẫn tương đối `/api` (same-origin), tự động tương thích 100% với cả localhost, IP mạng LAN và domain HTTPS công khai mà không vi phạm chính sách bảo mật CORS/Mixed Content.
  4. **Kênh Đồng Bộ Trực Tiếp Link Public Tunnel**: Backend cung cấp endpoint `/api/tunnel` để tiến trình runner cập nhật URL công khai và frontend tự động lấy hiển thị lên mã QR kết nối thiết bị di động.

---

## 26. Quy Chuẩn Lưu Trữ Dữ Liệu Bền Vững & Cô Lập Tài Khoản Tuyệt Đối (Database Persistence & Zero-Leak Auth Isolation Invariant)
- **Nguyên tắc**: Tuyệt đối không lưu dữ liệu người dùng tạm thời trong biến RAM Node.js dẫn đến mất tài khoản khi khởi động lại server; dữ liệu tài khoản A tuyệt đối không được phép rò rỉ sang tài khoản B.
- **Quy tắc bắt buộc**:
  1. **Lưu trữ dữ liệu bền vững xuống đĩa cứng (File-backed Database)**: Mọi thao tác ghi dữ liệu (đăng ký tài khoản, gửi tin nhắn, cập nhật profile, kết bạn) bắt buộc phải được ghi nguyên tử (atomic write) vào `backend/data/vivu_database.json` qua `dbStore.persist()`, tự động nạp lại khi server khởi động.
  2. **Cô lập định danh tài khoản (Scoped Identity)**: Mã người dùng `currentUserCode` và ảnh `currentUserAvatar` bắt buộc phải đọc trực tiếp từ tài khoản đang đăng nhập (`user.user_metadata.user_code`, `user.user_metadata.avatar_url`), nghiêm cấm đọc từ cache toàn cục chưa xác thực.
  3. **Reset sạch trạng thái khi chuyển đổi tài khoản (Full State Reset)**: Khi `user?.id` thay đổi (đăng xuất hoặc đăng nhập tài khoản khác), frontend bắt buộc reset 100% các state (`friends = []`, `stories = []`, `conversations = []`, `activeConversationId = null`) và xóa sạch các key cache trong `localStorage` qua `signOut()`.
  4. **Phân định rạch ròi giữa Bạn Bè và Mọi Người Xung Quanh**: Mảng `friends` CHỈ chứa những người bạn đã được chấp nhận kết bạn (`apiClient.getFriendsList(currentUserId)`). Những người dùng online khác xung quanh chỉ hiển thị ở tab Xã Hội (`stories`), tuyệt đối không được tự động chèn vào danh sách bạn bè.

---

## 27. Quy Chuẩn Chỉ Lưu Trữ & Hiển Thị Tài Khoản Đã Xác Thực (Strict Authenticated-Only Invariant)
- **Nguyên tắc**: Cơ sở dữ liệu và bản đồ mạng xã hội VIVU tuyệt đối không lưu trữ hoặc hiển thị các tài khoản Khách vãng lai (`client-xxx`).
- **Quy tắc bắt buộc**:
  1. **Chặn ghi dữ liệu khách vào Database**:
     - Các endpoint ghi dữ liệu (`/api/gps/update`, `/api/stories`, `/api/chat/send`, `/api/friends/request`) bắt buộc phải kiểm tra sự tồn tại của `userId` trong bảng tài khoản thật `users`.
     - Nếu `userId` là định danh tạm (`client-xxx`) hoặc chưa đăng ký, backend tuyệt đối không ghi bản ghi vào `vivu_database.json`.
  2. **Chỉ hiển thị người dùng thật trên Bản đồ**:
     - Danh sách lân cận (`getProfiles()`) và các ghim giọt nước trên Mapbox canvas chỉ kết xuất những tài khoản đã đăng ký (`user-xxx`).
     - Người dùng chưa đăng nhập chỉ được xem bản đồ cục bộ tại máy mình, không phát sóng GPS lên server và không xuất hiện trên bản đồ của người khác.
  3. **Tự động thanh lọc an toàn & Bảo tồn vị trí (Database Sanitizer & Location Retention)**:
     - Khi khởi động server hoặc khi nạp database, hệ thống chỉ lọc bỏ các session rác khách vãng lai (`client-xxx`).
     - Tuyệt đối KHÔNG xóa bỏ profile của tài khoản đã đăng ký (`user-xxx`) khỏi database khi họ tạm thời không gửi heartbeat. Vị trí cuối cùng được lưu giữ bền vững trong 24 giờ.
     - Ngưỡng xác định trực tuyến (`is_online = true`) được mở rộng an toàn lên 120 giây (2 phút) để chịu được độ trễ khi trình duyệt điện thoại/laptop đưa tab vào chế độ ngủ (Tab Throttling).

---

## 28. Quy Chuẩn Chống Lặp Render Avatar & Khóa Cố Định Danh Tính Khách (Anti-Avatar-Loop & Stable Identity Invariant)
- **Nguyên tắc**: Khi người dùng chưa đăng nhập, hệ thống tuyệt đối không được tự động sinh mã khách ngẫu nhiên (`Math.random()`) hay xoá ghi liên tục vào `localStorage` gây vòng lặp render vô tận (infinite re-render loop) làm avatar và danh tính nhấp nháy liên tục.
- **Quy tắc bắt buộc**:
  1. **Danh tính tĩnh khi chưa đăng nhập**:
     - `currentUserId = user?.id || null;`
     - Khi chưa đăng nhập (`!user`): `currentUserId = null`, `currentUserCode = null`, `currentUserName = 'Khách VIVU'`.
     - `currentUserAvatar`: Sử dụng URL ảnh cố định tĩnh (`https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`), tuyệt đối không dùng Dicebear URL có tham số seed động ngẫu nhiên khiến trình duyệt tải ảnh mới liên tục trên mỗi nhịp render.
  2. **Cấm gọi lệnh xóa localStorage trong vòng đời lặp lại**:
     - Nghiêm cấm đặt `localStorage.removeItem()` bên trong các hook chạy tuần hoàn hoặc effect phản ứng (`syncHeartbeat`, render body). Thao tác dọn dẹp chỉ được gọi đúng 1 lần duy nhất trong sự kiện người dùng chủ động bấm Đăng xuất (`signOut()`).
  3. **Đồng bộ hóa 2 chiều cho cập nhật hồ sơ (Full-Stack Profile Sync)**:
     - Mọi thao tác chỉnh sửa hồ sơ (Tên, Avatar, Bio, Tuổi, Nghề nghiệp, Sở thích tags, Ảnh gallery) bắt buộc phải gọi endpoint `/api/auth/profile` để cập nhật đồng thời cả 2 bảng `users` và `profiles` trong `vivu_database.json`, đảm bảo các thiết bị khác nhận được thông tin mới tức thì.

---

## 29. Quy Chuẩn Đồng Bộ Không Gian Đa Thiết Bị & Chống Tự Hủy Dữ Liệu (Cross-Device Presence & Anti-Purge Invariant)
- **Nguyên tắc**: Hai thiết bị độc lập cùng đăng nhập tài khoản thật tại cùng một địa điểm GPS phải luôn tìm thấy nhau trên bản đồ 3D; không bao giờ để độ trễ tab trình duyệt xóa mất profile của thiết bị đối phương.
- **Quy tắc bắt buộc**:
  1. **Bảo tồn vị trí tài khoản đăng ký (Zero Profile Purge)**:
     - Hàm `getProfiles()` của Backend chỉ tính toán cờ động `is_online: ageMs < 120000` và `last_seen_text`, nghiêm cấm gán `inMemoryStore.profiles = activeProfiles` làm mất dữ liệu của người dùng trên đĩa cứng.
  2. **Đánh thức GPS tức thì khi vào Foreground (Instant Visibility Wakeup)**:
     - Frontend bắt buộc đăng ký bộ lắng nghe `visibilitychange` (`!document.hidden`) và `window.addEventListener('focus')` để ngay khi người dùng mở lại tab hoặc mở sáng màn hình điện thoại, ứng dụng kích hoạt phát sóng `updateGps` và kéo danh sách peers tức thì.
  3. **Phân tán giọt nước khi toạ độ trùng khít (Spatial Radial Dispersion)**:
     - Khi 2 tài khoản có khoảng cách < 35m (hoặc cùng bấm Đà Nẵng / cùng phòng), Mapbox canvas tự động dịch chuyển giọt nước đối phương theo góc hướng tròn bán kính ~28m để 2 giọt nước của Bạn và Bạn bè đứng kề cạnh nhau tự nhiên, hiển thị rõ tên và mã số định danh `VU-XXXX`.
  4. **Nút bao quát thiết bị toàn cảnh (`#btn-fit-all-peers`)**:
     - Luôn duy trì nút bấm góc dưới bản đồ để người dùng chỉ cần 1 click là camera tự động `fitBounds` bao trọn vị trí không gian của cả 2 thiết bị.

---

## 30. Quy Chuẩn Hợp Nhất Giọt Nước Bản Đồ & Chống Tách Đôi Marker Khi Đăng Story (Unified User-Story Teardrop Invariant)
- **Nguyên tắc**: Mỗi tài khoản người dùng chỉ có DUY NHẤT một giọt nước đại diện trên Bản đồ 3D (Single Spatial Identity). Bất kể người dùng đăng bao nhiêu bài Story hay khoảnh khắc, không bao giờ được phép sinh ra giọt nước thứ 2 độc lập cho cùng một tài khoản.
- **Quy tắc bắt buộc**:
  1. **Định danh chủ sở hữu Story (Story Host Linking)**:
     - Khi gọi `apiClient.createStory()`, bắt buộc phải truyền `host_id: currentUserId` và `user_code: currentUserCode`.
     - Backend `dbService.createStory()` bắt buộc phải lưu trường `host_id` và `user_code` vào bản ghi Story trong `vivu_database.json`.
  2. **Hợp nhất dữ liệu hiển thị (Presence-Story Data Merging)**:
     - Khi đồng bộ dữ liệu vào Mapbox (`App.jsx` và `MapboxCanvas.jsx`), nếu một người dùng có bài Story thật, hệ thống phải tự động gộp (merge) Story đó vào chính đối tượng người dùng đó (`item.activeStory`), thay vì thêm 2 phần tử rời rạc vào danh sách marker.
  3. **Nâng cấp giao diện Giọt Nước (Story Ring & Enhanced Bubble)**:
     - Khi người dùng có Story hoạt động: Avatar trong giọt nước được bao bọc bởi Vòng phát sáng Story (`Story Ring` chuyển sắc rực rỡ phong cách Messenger/Instagram: `from-pink-500 via-rose-500 to-amber-400 ring-2 animate-pulse`).
     - Bong bóng phía trên giọt nước hiển thị icon loại Story (ảnh, video, nhạc) kèm tiêu đề Story.
  4. **Phân định tương tác (Dual-Click Delegation)**:
     - Chạm vào Bong bóng Story (hoặc Story Ring): Mở Modal xem Story toàn màn hình (`onOpenStoryDetail`).
     - Chạm vào thân Giọt Nước hoặc Avatar: Mở Bảng thông tin cá nhân (Profile Sheet) để chat/kết bạn.
     - Chạm vào nút Trái Tim: Thả cảm xúc nhanh (`quickReact`).

---

## 31. Quy Chuẩn WebSocket Realtime & Biến Mất Marker Tức Thì Khi Thoát Link (Instant Disconnect & WebSocket Realtime Invariant)
- **Nguyên tắc**: Không phụ thuộc vào HTTP Polling tuần hoàn 3.5s gây trễ để biết một người dùng đã thoát khỏi trang hay di chuyển. Khi một bên đóng tab hoặc mất mạng, giọt nước của họ phải biến mất tức thì trên bản đồ của đối phương.
- **Quy tắc bắt buộc**:
  1. **Khởi tạo Socket.IO trên HTTP Server**: Backend sử dụng `http.createServer(app)` kết hợp `new Server(httpServer)`. Vite proxy bắt buộc chuyển tiếp cả đường dẫn `'/socket.io'` sang backend cổng 5000 với cờ `ws: true`.
  2. **Tín hiệu ngắt kết nối tức thì (Instant Disconnect Handshake)**:
     - Client bắt sự kiện `beforeunload` và `pagehide` trên trình duyệt để chủ động emit `user:going-offline`.
     - Server khi phát hiện socket `disconnect` (hoặc nhận `user:going-offline`) sẽ lập tức broadcast sự kiện `user:offline` tới tất cả các client đang kết nối.
     - Phía người dùng còn lại: khi nhận `user:offline`, lọc bỏ ngay ID đối phương khỏi `nearbyOnlinePeers` và xóa giọt nước/bong bóng (`live-peer-${userId}`) khỏi Mapbox canvas trong vòng < 200ms.

---

## 32. Quy Chuẩn Vòng Đời Kết Bạn 2 Chiều & Khay Thông Báo Tập Trung (Two-Way Friendship & Centralized Notification Invariant)
- **Nguyên tắc**: Khi A gửi yêu cầu kết bạn cho B, chỉ B nhận được lời mời trong mục Thông báo; chỉ khi B bấm "Chấp nhận" thì cả A và B mới chính thức trở thành bạn bè và cả 2 bên cùng nhận được thông báo xác nhận thành công tức thì.
- **Quy tắc bắt buộc**:
  1. **Tạo và phát thông báo đa kênh**:
     - Khi A gửi yêu cầu: Hệ thống tạo bản ghi `notifications` (loại `friend_request`), lưu vào `dbStore.notifications` và emit realtime `notification:new` + `friend-request:incoming` tới riêng tài khoản B.
     - Thiết bị B phát chuông thông báo (Ding-Dong sound), hiển thị Toast nổi và tăng badge đỏ trên Chuông thông báo.
  2. **Duyệt lời mời trực tiếp trong Khay Thông Báo (Notification Drawer)**:
     - Bảng `NotificationDrawer` cung cấp nút "Chấp nhận" và "Từ chối" trực quan ngay trên từng card thông báo.
     - Khi B bấm "Chấp nhận": Gọi `acceptFriendRequest`, tạo quan hệ bạn bè 2 chiều `fs-[A]--[B]`, tạo và gửi notification loại `friend_accepted` ("Kết bạn thành công!") cho cả A và B, bắn pháo hoa confetti, phát âm thanh chúc mừng và cập nhật danh sách bạn bè 2 chiều trên bản đồ.

---

## 33. Quy Chuẩn Hiển Thị Toàn Vẹn Ảnh Story & Thời Hạn Tự Động (Full-Frame Media Contain & Auto-Expire Invariant)
- **Nguyên tắc**: Ảnh Story khi xem tuyệt đối không được phép bị cắt xén làm mất đầu, mất mặt hoặc mất bố cục của ảnh; người dùng được quyền chọn thời hạn Story tự biến mất sau 1h, 3h, 6h hoặc 24h.
- **Quy tắc bắt buộc**:
  1. **Hiển thị ảnh toàn vẹn (Object-Contain + Blurred Backdrop)**:
     - Cấm dùng `aspect-video max-h-52 object-cover` cố định gây cắt cúp ảnh chân dung (portrait).
     - Bắt buộc áp dụng cơ chế 2 lớp: Lớp nền dùng chính ảnh đó phóng to `scale-110 blur-2xl opacity-40 object-cover`, lớp trên hiển thị ảnh gốc với `object-contain max-h-[60vh]` giữ nguyên 100% tỉ lệ khung hình.
  2. **Thời hạn hiển thị linh hoạt (Expiry Options)**:
     - Khi đăng Story trong `StoryStudioModal`, cung cấp 4 mốc thời gian: 1 giờ, 3 giờ, 6 giờ, 24 giờ.
     - Bản ghi Story lưu trữ `expiry_hours` và `expires_at` dạng ISO timestamp.
     - Backend `getStories()` và Frontend `liveStories` tự động lọc bỏ các Story có `expires_at < now` và dọn dẹp khỏi cơ sở dữ liệu.
     - Giao diện xem Story hiển thị đồng hồ đếm lùi thời gian còn lại thực tế (`formatRemainingTime`).

---

## 34. Quy Chuẩn Đồng Bộ Trạng Thái Ngoại Tuyến Tức Thì & Chống Giữ Online Ảo (Instant Zero-Delay Offline & Anti-Ghost-Presence Invariant)
- **Nguyên tắc**: Khi một tài khoản thoát khỏi ứng dụng (đăng xuất, đóng tab, vuốt tắt trình duyệt, hoặc khóa màn hình điện thoại), giọt nước trực tuyến của họ phải lập tức biến mất khỏi bản đồ của đối phương, không được tồn tại online ảo.
- **Quy tắc bắt buộc**:
  1. **Chặn phát sóng ngầm khi tab ẩn (Visibility Throttling Interceptor)**:
     - Khi `document.hidden === true`: `syncHeartbeat` lập tức `return` ngưng gửi tọa độ, đồng thời gọi `navigator.sendBeacon('/api/gps/offline')` và `socket.emit('user:going-offline')`.
     - Khi `document.hidden === false`: Ứng dụng tự động kích hoạt `syncHeartbeat` để online trở lại ngay lập tức.
  2. **Endpoint và Ngưỡng Ngoại Tuyến Cấp Tốc (Zero-Delay Offline Endpoint)**:
     - Backend cung cấp endpoint `POST /api/gps/offline`: Đặt `is_online = false`, lùi `last_seen_at` về quá khứ và broadcast sự kiện `user:offline` tới tất cả các client.
     - Hàm `getProfiles()` siết chặt ngưỡng trực tuyến: `is_online = (p.is_online !== false && ageMs < 15000)`.
  3. **Lọc chặt chẽ Online Peers tại Frontend**:
     - `otherProfiles` trong `syncHeartbeat` bắt buộc lọc: `p.is_online === true`.
     - Khi người dùng offline: Chỉ xóa giọt nước GPS trực tuyến (`live-peer-${userId}`), bảo toàn các bài đăng Story hợp lệ (`story-xxx`) còn hạn trên bản đồ.

---

## 35. Quy Chuẩn Phân Lớp Không Gian Theo Mục Xã Hội & Bạn Bè (Tab-Isolated Spatial Presence & Offline Friends Stealth Mode)
- **Nguyên tắc**: 
  1. **Mục Xã Hội (`activeTab === 'social'` / Khám phá công cộng)**: Chỉ hiển thị giọt nước của người dùng khi họ ĐANG ONLINE thực sự (`is_online === true`). Nếu một người dùng có bài đăng Story còn hạn nhưng đang OFFLINE thì giọt nước và Story của họ VẪN ẨN hoàn toàn khỏi bản đồ Xã Hội. Khi người đó mở ứng dụng online trở lại (và Story vẫn còn hạn) thì giọt nước và Story mới hiển thị trở lại cho đến khi hết hạn.
  2. **Mục Bạn Bè (`activeTab === 'friends'` / Mối quan hệ cá nhân)**: Khi bạn bè offline, VẪN HIỂN THỊ giọt nước lẫn Story của họ trên bản đồ nhưng giọt nước sẽ được chuyển sang **CHẾ ĐỘ ẨN** (Stealth / Dimmed Mode). Các bạn bè khác VẪN CÓ THỂ BẤM VÀO XEM bình thường (xem Story toàn màn hình hoặc xem trang cá nhân bạn bè).
- **Quy tắc bắt buộc**:
  1. **Bộ Lọc Tab Xã Hội (Social Tab Strict Online Filter)**:
     - Trong `MapboxCanvas.jsx`: Khi `activeTab !== 'friends'`, biến `withoutMe` bắt buộc loại bỏ mọi phần tử có `item.isOnline === false`.
     - Trong `App.jsx`: `setStories` chỉ thêm hoặc duy trì Story từ backend nếu người tạo Story đang online (`activePeerIds.has(rs.host_id)`). Khi người dùng disconnect, loại bỏ toàn bộ `live-peer-${userId}` và `story` của user đó khỏi state `stories`.
  2. **Chế Độ Ẩn Ở Tab Bạn Bè (Friends Stealth / Dimmed Mode Marker)**:
     - Khi `item.isOnline === false`:
       - Marker container nhận class mờ nhạt: `opacity-65 grayscale-[60%] hover:opacity-100 hover:grayscale-0 transition-all duration-300`.
       - Thân SVG Giọt nước mang tone xám khói sang trọng (`fill="#222326" stroke="#4A4C52"`).
       - Bong bóng trạng thái hiển thị chấm xám `bg-neutral-500` và badge `OFFLINE`.
       - Vòng Story trên avatar hiển thị viền tối mờ tinh tế (`ring-1 ring-rose-500/30`), không nhấp nháy chuyển động gắt.
       - Bảo toàn 100% khả năng tương tác Click Delegation: Bấm vào bong bóng/avatar mở Story Viewer; bấm vào thân giọt nước mở Profile bạn bè.
  3. **Thuật Toán Tự Động Hết Hạn Story Dự Phòng (Story Expiry Fallback Calculation)**:
     - Mọi truy vấn Story (`getStories()`) bắt buộc tính hạn `expires_at`: Nếu chưa có trường `expires_at`, tự động suy luận từ `created_at + (expiry_hours || 3) * 3600000`. Tuyệt đối không giữ Story mồ côi vĩnh viễn trong cơ sở dữ liệu.

---

## 36. Quy Chuẩn Bảo Toàn Menu Đáy Đa Màn Hình, Định Vị HTTPS Di Động & Luồng Kết Bạn/Tin Nhắn Bền Vững (Persistent Multi-Screen Dock, Mobile HTTPS Geolocation & Friendship/Chat Invariant)
- **Nguyên tắc**: Thanh menu điều hướng đáy (VivuBottomDock) không bao giờ bị biến mất đột ngột khi chuyển hướng; định vị di động không bị nhảy sai trạm ISP khi truy cập HTTP; toàn bộ giao thức kết bạn và nhắn tin phải được lưu trữ bền vững và tuân thủ chặt chẽ quyền truy cập.
- **Quy tắc bắt buộc**:
  1. **Bảo Toàn Menu Đáy Toàn Cục (Persistent Bottom Dock)**:
     - Render <VivuBottomDock /> cố định ở mọi màn hình và mọi tab.
     - Ô nhập tin nhắn và khay công cụ chat trong MessengerChatView.jsx bố trí khoảng đệm pb-24 sm:pb-24 để nổi thanh thoát ngay trên menu đáy, không đè lấp lẫn nhau.
  2. **An Toàn Định Vị Di Động Mạng LAN (Mobile LAN IP Geo Shielding)**:
     - Trình duyệt di động cấm navigator.geolocation trên HTTP LAN.
     - Cấm gọi IP Geolocation khi đang truy cập HTTP LAN để ngăn chặn việc trạm phát sóng ISP dịch chuyển vị trí người dùng ra Hà Nội hoặc TP.HCM.
     - Tự động khôi phục tọa độ GPS đã lưu trong hồ sơ tài khoản ngay khi đăng nhập, và hiển thị gợi ý chuyển sang link HTTPS Cloudflare Tunnel để nhận quyền GPS phần cứng chính xác.
  3. **Giao Thức Kết Bạn 4 Trạng Thái Toàn Vẹn (Full-Cycle Friendship Protocol)**:
     - 4 trạng thái bắt buộc: none -> pending_sent / pending_received -> friends.
     - Chặn tuyệt đối tự kết bạn với chính mình và chặn gửi lời mời trùng chiều.
     - Người nhận có quyền Chấp nhận / Từ chối; Người gửi có quyền Thu hồi lời mời khi còn pending. Người gửi không thể tự chấp nhận lời mời của mình.
     - Hai người gửi lời mời đồng thời tự động trở thành bạn bè không tạo bản ghi trùng.
  4. **Nhắn Tin Bền Vững & Phân Tuyến Hộp Thư (Persistent Messaging & Stranger Inbox Routing)**:
     - Từ chối tin nhắn rỗng sau khi trim; giới hạn tối đa 2000 ký tự.
     - Chống gửi trùng lặp tin nhắn qua client_msg_id.
     - Phân định rõ ràng 3 tab hộp thư: Tất cả, Nhóm, Người lạ (isStranger: true).
     - Đánh dấu đã đọc (read) tức thì khi mở cuộc trò chuyện.

---

## 37. Quy Chuẩn Chống Thông Báo Trùng & Đồng Bộ Trạng Thái Đa Thiết Bị (Notification Idempotency, Aggregation & Multi-Device Sync Invariant)
- **Nguyên tắc**: Mỗi sự kiện nghiệp vụ chỉ tạo đúng một thông báo hợp lệ cho đúng người nhận, dù client retry, worker retry, realtime reconnect hay người dùng mở nhiều thiết bị. Trạng thái đọc/chưa đọc và xóa thông báo phải đồng bộ nhất quán 100% trên toàn bộ thiết bị.
- **Quy tắc bắt buộc**:
  1. **Khóa Chống Trùng Tất Định (Deterministic Idempotency Key)**:
     - Tin nhắn mới: notif-conv-- gộp theo từng hội thoại. Theo dõi last_processed_message_id để loại bỏ việc lặp sự kiện và chống tăng đúp unread_count khi reconnect.
     - Lời mời kết bạn: notif-freq--.
     - Kết bạn thành công: notif-faccept--.
  2. **Dọn Dẹp Triệt Để Khi Từ Chối / Thu Hồi (Strict Cleanup On Rejection / Cancellation)**:
     - Khi lời mời kết bạn bị từ chối hoặc người gửi thu hồi, bản ghi thông báo tương ứng bị xóa sạch khỏi dbStore.data.notifications và phát tín hiệu notification:deleted để biến mất khỏi khay thông báo trên mọi thiết bị.
  3. **Đồng Bộ Đọc Đa Thiết Bị (Multi-Device Read Sync)**:
     - Mở cuộc trò chuyện trên bất kỳ thiết bị nào sẽ đánh dấu đã đọc thông báo gộp (read: true, unread_count: 0) và phát tín hiệu notification:sync tới tất cả socket của tài khoản đó.
  4. **Hợp Nhất Idempotent Phía Client (Client-Side Map Merge)**:
     - State notifications tại frontend bắt buộc dùng Map theo notif.id để merge dữ liệu, tính unreadNotificationsCount trực tiếp từ danh sách thực tế, không cộng dồn số học đơn thuần.

---

## 38. Quy Chuẩn Cổng Điều Khoản Vị Trí, Triệt Tiêu Toạ Độ Mặc Định & Phân Quyền Hộp Thư Bền Vững (Location Consent Gate, Zero-Default Coordinates & Persistent Inbox Permissions Invariant)
- **Nguyên tắc**: Ứng dụng VIVU không bao giờ cắm giọt nước ở tọa độ mặc định (Đà Nẵng) khi chưa có vị trí thật; bắt buộc qua cổng kiểm soát 2 bước (Điều khoản + Quyền GPS) sau khi đăng nhập; hội thoại bạn bè phải nằm trong mục "Tất cả" và phân quyền tin nhắn phải được bảo vệ cấp máy chủ (Server-side Enforcement).
- **Quy tắc bắt buộc**:
  1. **Cổng Kiểm Soát Điều Khoản & GPS 2 Bước (Two-Step Location Consent Gate)**:
     - Sau khi đăng nhập, tài khoản bắt buộc hoàn thành:
       - Bước 1: Đọc và chấp thuận Điều khoản & Chính sách minh bạch dữ liệu vị trí VIVU (Mục đích, Dữ liệu thu thập, Ai nhìn thấy, Tần suất cập nhật, Cách dừng chia sẻ). Lưu phiên bản điều khoản và thời gian đồng ý.
       - Bước 2: Cho phép trình duyệt truy cập chip GPS phần cứng (`navigator.geolocation.getCurrentPosition`).
     - Nếu từ chối một trong hai bước hoặc thu hồi quyền: Chặn toàn bộ các chức năng chính, dừng gửi cập nhật GPS, xóa toạ độ cũ khỏi bộ nhớ và hiển thị màn hình hướng dẫn cấp lại quyền hoặc đăng xuất.
  2. **Triệt Tiêu Hoàn Toàn Toạ Độ Mặc Định (Zero-Default / Anti-DaNang Invariant)**:
     - Nghiêm cấm fallback về bất kỳ tọa độ hardcode nào (như Đà Nẵng 16.0544, 108.2022) khi chưa lấy được vị trí hoặc khi đang kết nối HTTP LAN.
     - Khi chưa có GPS: Đặt `location = null` và không render giọt nước giả trên bản đồ.
     - Xóa bỏ toàn bộ toạ độ Đà Nẵng mẫu trong database và bộ nhớ cache `localStorage`.
  3. **Hộp Thư Hợp Nhất & Thăng Hạng Bạn Bè (Unified Persistent Inbox & Friendship Auto-Promotion)**:
     - Backend cung cấp endpoint chuẩn `GET /api/chat/conversations/:userId` truy vấn trực tiếp từ cơ sở dữ liệu bền vững.
     - Khi hai người đã là Bạn bè: Hội thoại luôn mang cờ `isStranger: false, isFriend: true` và bắt buộc hiển thị trong mục **"Tất cả"**, tuyệt đối không xếp vào "Tin nhắn rác" hay "Người lạ".
     - Khi nhận tin từ người chưa kết bạn: Xếp vào tab **"Người lạ"** (`isStranger: true`). Khi đối phương trả lời tin nhắn hoặc chấp nhận kết bạn, hội thoại lập tức thăng hạng sang **"Tất cả"** (`isStranger: false`).
     - Tải lại trang (reload) hoặc đăng nhập trên thiết bị khác vẫn bảo toàn 100% danh sách hội thoại từ server.
  4. **Phân Quyền Nhóm & Cài Đặt Riêng Tư Tin Nhắn (Circle & Message Privacy Enforcement)**:
     - Nhóm (Circle): Chỉ thành viên trong `circle.member_ids` mới có quyền đọc và gửi tin nhắn. Người ngoài gọi API sẽ bị từ chối với mã lỗi `403 Forbidden`.
     - Quyền nhận tin: Hỗ trợ cấu hình `message_privacy` trong Cài đặt:
       - `everyone` (Mọi người): Cho phép người lạ gửi tin nhắn chờ vào tab "Người lạ".
       - `friends_only` (Chỉ bạn bè): Chặn người lạ gửi tin nhắn ở cấp độ backend với mã lỗi `403 Forbidden: Người dùng này chỉ nhận tin nhắn từ bạn bè`.

---

## 39. Quy Chuẩn Phòng Ngừa Lỗi Hook Undeclared & An Toàn Tọa Độ Bản Đồ Tuyệt Đối (Zero-Crash Hook Import & Map Coordinate Guard Invariant)
- **Nguyên tắc**: Ứng dụng VIVU tuyệt đối không để xảy ra ReferenceError runtime do thiếu hook import hay lỗi Invalid LngLat làm kích hoạt ErrorBoundary.
- **Quy tắc bắt buộc**:
  1. **Khởi Tạo Toàn Diện Hook React**: Mọi hook (useCallback, useMemo, useState, useEffect, useRef, useContext) khi được sử dụng trong bất kỳ file JSX nào bắt buộc phải được khai báo tường minh trong import { ... } from 'react'.
  2. **Bộ Lọc Số Học Không Gian An Toàn (isFinite Coordinate Guard)**: Mọi tọa độ khi truyền vào Mapbox Marker.setLngLat([lng, lat]) hoặc bounds.extend([lng, lat]) phải được bảo vệ bằng kiểm tra nghiêm ngặt:
     if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) return;
  3. **Minh Bạch Thông Điệp ErrorBoundary**: Component ErrorBoundary bắt buộc hiển thị hộp chi tiết lỗi (error.message) để quá trình kiểm thử hoặc vận hành thực tế nhận diện nguyên nhân gốc ngay lập tức.


---

## 40. Quy Chuẩn Tạo Nhóm Trực Tiếp & Tối Giản Quyền Riêng Tư (Direct Member Enrollment & Streamlined Group Creation Invariant)
- **Nguyên tắc**: Tính năng tạo nhóm (Custom Circles) tập trung vào trải nghiệm mượt mà, trực quan; loại bỏ các cấu hình quyền riêng tư rườm rà không cần thiết và cho phép chọn thêm bạn bè trực tiếp ngay trong modal tạo nhóm và modal quản trị.
- **Quy tắc bắt buộc**:
  1. **Tối Giản Quyền Riêng Tư (Streamlined Group Privacy)**: Mặc định tất cả các nhóm người dùng tạo là riêng tư an toàn (`privacy: 'private'`). Loại bỏ hoàn toàn công tắc chọn Công khai / Riêng tư ở form tạo nhóm để tránh gây hoang mang và hiểu nhầm về quyền riêng tư.
  2. **Thêm Thành Viên Trực Tiếp (Direct Member Enrollment)**:
     - Form tạo nhóm (`CreateCircleModal.jsx`) tích hợp danh sách bạn bè với ô checkbox nhiều lựa chọn và ô tìm kiếm nhanh.
     - Khi bấm "Tạo Nhóm", danh sách bạn bè đã chọn được gửi qua payload `initial_members: string[]`.
     - Backend tự động thêm các bạn bè này vào mảng `circle.members` với vai trò `role: 'member'` và trạng thái `status: 'accepted'`, đồng thời đưa vào `circle.member_ids` ngay lập tức mà không cần trải qua bước phê duyệt phức tạp.
  3. **Hệ Thống Phân Quyền 2 Tầng Chặt Chẽ (2-Tier Circle Permission)**:
     - **Quản trị viên (Owner)**: Người tạo nhóm (`owner_id`) có toàn quyền chỉnh sửa thông tin nhóm, thêm bạn bè trực tiếp qua `POST /api/circles/:id/add-members`, xóa thành viên qua `POST /api/circles/:id/kick`, hoặc giải tán nhóm qua `DELETE /api/circles/:id`.
     - **Thành viên (Member)**: Có quyền xem danh sách thành viên, đọc và gửi tin nhắn trong nhóm, lọc vị trí nhóm trên bản đồ, và tự nguyện rời nhóm qua `POST /api/circles/:id/leave`.
  4. **Kiểm Tra Quyền Đồng Bộ Hai Đầu (Frontend & Backend Enforcement)**:
     - Giao diện: Ẩn nút "Xóa nhóm", "Đổi tên" và "Đuổi thành viên" đối với thành viên thường; chỉ hiển thị nút "Rời nhóm".
     - Backend: Xác thực quyền chủ sở hữu (`circle.owner_id === userId`) trên tất cả các API sửa đổi, trả về `403 Forbidden` nếu vi phạm.

---

## 41. Quy Chuẩn Tích Hợp Google Stitch AI MCP Server Tự Tạo Giao Diện (Stitch AI MCP Integration Protocol)
- **Nguyên tắc**: Tận dụng tối đa sức mạnh của Google Stitch AI qua giao thức MCP (Model Context Protocol) để thiết kế, đồng bộ Design System và sinh mã màn hình giao diện trực tiếp cho Web App VIVU mà không phụ thuộc vào thao tác thủ công.
- **Quy tắc bắt buộc**:
  1. **Cấu Hình & Kết Nối An Toàn (MCP Server Handshake)**:
     - Cấu hình server tại endpoint: `https://stitch.googleapis.com/mcp` kèm header xác thực `X-Goog-Api-Key`.
     - Kiểm tra kết nối trước khi thực thi bằng kịch bản kiểm tra `scripts/list_stitch_screens.js`.
  2. **Chuẩn Hóa Tham Số Định Danh (Pure Numeric Project ID)**:
     - Khi gọi các công cụ MCP như `list_screens`, `get_screen`, `download_file`, bắt buộc truyền `projectId` dưới dạng chuỗi ID số thuần túy (ví dụ: `'1265892556556108154'`), tuyệt đối không gửi tiền tố `'projects/'` để tránh lỗi `400 INVALID_ARGUMENT`.
  3. **Tải Về & Tích Hợp Song Song (Parallel Screen & Asset Ingestion)**:
     - Tải song song mã HTML của màn hình và ảnh chụp mẫu (`screen.png`).
     - Lưu trữ tệp thiết kế vào thư mục `stitch_exports/<screen_name>/` và ảnh chụp minh chứng vào `docs/images/stitch_screens/<screen_name>.png`.
  4. **Ánh Xạ Chuẩn Hóa Vào React SPA (Design-to-Component Mapping)**:
     - Trích xuất bảng màu, phông chữ và bóng đổ từ `DESIGN.md` của Stitch để đồng bộ vào `src/index.css` và `tailwind.config.js`.
     - Chuyển đổi mã HTML Stitch sang component React JSX chuẩn thẩm mỹ Resend Dark Monochrome kết hợp Cyber-Solar Hologram và 100% Bootstrap Icons (Anti-Emoji).


---

## 42. Quy Chuẩn Hiển Thị Khoảnh Khắc Trên Bản Đồ (Map-First Spatial Post Invariant)
- **Nguyên tắc**: Trải nghiệm xem khoảnh khắc (Story/Meme/Status/Music) diễn ra trực tiếp ngay trên mặt bản đồ (Map-First), không bắt người dùng phải ấn mở popup/modal mới đọc được nội dung; loại bỏ hoàn toàn các thanh trạng thái gợi ý mặc định gây rườm rà.
- **Quy tắc bắt buộc**:
  1. **Ẩn Trạng Thái Mặc Định Khi Chưa Đăng Bài (Zero-Clutter Idle Pin)**:
     - Khi người dùng chưa đăng Story/trạng thái (`!activeStory`): Giọt nước không hiển thị bất kỳ thanh gợi ý nào (xóa bỏ hoàn toàn thanh `♫ Đang vivu dạo phố` và nút `+ Đăng`).
     - Giữ không gian bản đồ tinh gọn, sạch sẽ, tập trung trọn vẹn vào định vị và bạn bè.
  2. **Hiển Thị Trực Tiếp Nội Dung Sau Khi Đăng (Direct Spatial Reveal)**:
     - **Meme**: Hiển thị ảnh Meme nổi thẳng phía trên chóp giọt nước kèm viền bo tròn và mũi nhọn chỉ xuống tâm GPS; người khác nhìn thấy ngay mà không cần ấn vào.
     - **Trạng thái / Chữ**: Hiển thị trong ô bong bóng phong cách tin nhắn Messenger (`bg-[#0A8395] text-white rounded-2xl rounded-br-xs`) dễ đọc ngay trên bản đồ.
     - **Âm nhạc**: Chỉ nhạc mới cần ấn vào để nghe. Tích hợp nút `#btn-play-marker-music` hoặc `#btn-play-peer-music` trực tiếp trên ghim giọt nước để nghe thử và dừng nhạc ngay trên bản đồ.
  3. **Không Mở Modal Khi Bấm Giọt Nước (Modal-Free Map Interaction)**:
     - Thao tác chạm vào thân giọt nước hoặc avatar của bạn không mở bất kỳ popup/modal nào để tránh làm vướng tầm nhìn; chỉ tương tác phát/dừng nhạc khi bấm đúng nút play.
  4. **Bộ Công Cụ Tạo Khoảnh Khắc 3 Trụ Cột (Story - Meme - Nhạc)**:
     - Dấu cộng (+) tập trung đúng 3 tính năng cốt lõi: Story (ảnh/camera), Meme (nhãn dán thịnh hành & tải ảnh riêng từ máy), Nhạc (danh sách tuyển chọn & dán đường link MP3 riêng).

---

## 43. Quy Chuẩn Hồ Sơ Vết Chân Không Gian & Địa Điểm Gắn Sao (Spatial Taste Profile & Starred Check-in Invariant)
- **Nguyên tắc**: Trang cá nhân VIVU phải phản ánh chân thực gu sống và sở thích của người dùng thông qua bản đồ không gian và các địa điểm đã ghé thăm kèm đánh giá sao.
- **Quy tắc bắt buộc**:
  1. **Bản đồ thu nhỏ & Dải thẻ ảnh (Photo-First Mini Map)**:
     - Tích hợp một bản đồ thu nhỏ tương tác hiển thị ghim giọt nước các địa điểm check-in/gắn sao của người dùng.
     - Dải thẻ ảnh cuộn ngang bên dưới hiển thị ảnh thực tế, tên quán, nhãn gu thể loại (Cà phê, Rooftop chill, Ẩm thực, Camping...) và thanh chấm sao 1-5★.
  2. **Hệ thống Danh hiệu Hộ Chiếu Vết Chân (Taste Passport Badges)**:
     - Tự động phân tích các địa điểm được đánh giá cao (>= 4 sao) để trao tặng danh hiệu nhận diện gu (ví dụ: *Thánh Cà Phê 5★*, *Thợ Săn Hoàng Hôn*, *Chuyên Gia Ẩm Thực Đêm*).
  3. **Liên kết không gian ngược về Bản đồ lớn (Spatial Re-entry)**:
     - Bấm vào bất kỳ địa điểm gắn sao nào trên trang cá nhân đều cung cấp tùy chọn "Dẫn đường đến đây", tự động chuyển về Mapbox 3D chính và camera `flyTo` đến tọa độ đó kèm đường đi.
  4. **Bảo toàn Quy chuẩn VIVU**:
     - 100% Bootstrap Icons (sử dụng `bi bi-star-fill`, `bi bi-cup-hot-fill`... tuyệt đối không dùng Emoji).
     - Toàn bộ nút bấm tuân thủ hệ thống bo tròn `rounded-pill`, màu Hồng Neon `#FF2A85` & Xanh Cyan `#00E5FF`, kích hoạt hiệu ứng Cyber Splash khi tương tác.

---

## 44. Quy Chuẩn Bất Khả Xâm Phạm Dữ Liệu Tài Khoản & Mật Khẩu Cá Nhân (Strict Account Credential Inviolability Invariant)
- **Nguyên tắc**: Dữ liệu tài khoản của người dùng (Email, Mật khẩu, ID cá nhân, Thông tin hồ sơ) là tài sản bất khả xâm phạm. AI TUYỆT ĐỐI KHÔNG ĐƯỢC PHÉP TỰ Ý SỬA ĐỔI, GHI ĐÈ, RESET, XOÁ HOẶC TẠO MẬT KHẨU MẪU nếu chưa có sự chỉ định và cho phép trực tiếp từ người dùng.
- **Quy tắc bắt buộc**:
  1. **Nghiêm Cấm Tự Ý Sửa Đổi Hoặc Đặt Lại Mật Khẩu**: Tuyệt đối không bao giờ tự ý gán mật khẩu mẫu (ví dụ: `password123`, `123456`) vào tài khoản cá nhân của người dùng trong mã nguồn hay cơ sở dữ liệu (`vivu_database.json`). Mọi thay đổi mật khẩu chỉ được thực hiện thông qua form thao tác của người dùng trên giao diện web app.
  2. **Nghiêm Cấm Tự Ý Xoá Tài Khoản Cá Nhân Đã Đăng Ký**: Cơ chế dọn dẹp hoặc thanh lọc dữ liệu (`sanitize`) chỉ được phép dọn các session khách vãng lai rác (`client-xxx`), nghiêm cấm mọi hành vi xoá bỏ tài khoản người dùng đã đăng ký hợp lệ.
  3. **Bảo Toàn Toàn Vẹn & Khách Quan Khi Debug**: Khi điều tra lỗi đăng nhập, chỉ kiểm tra luồng logic và báo cáo trạng thái thực tế, luôn tôn trọng mật khẩu gốc do người dùng tự đặt và bảo toàn 100% dữ liệu tài khoản qua mọi lần khởi động lại server (`server restart`).
