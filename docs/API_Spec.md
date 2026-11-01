# 🔌 Đặc Tả API & Realtime — Dự Án VIVU (Express REST & Socket.IO V2.0)

---

## 1. TỔNG QUAN KIẾN TRÚC GIAO TIẾP

Hệ thống VIVU Web App sử dụng kiến trúc giao tiếp hợp nhất 3 lớp:
1. **Express RESTful API (`/api/*`)**: Xử lý toàn bộ logic xác thực, quản lý nhóm bạn bè, tin nhắn, câu chuyện cắm ghim và thông báo.
2. **Socket.IO Realtime Engine**: Kênh truyền phát hai chiều siêu tốc (WebSocket với polling fallback), truyền phát tọa độ GPS động, tin nhắn trò chuyện, tương tác nhóm tức thời và tính năng chạm điện thoại kết bạn (Spatial Bump 3D).
3. **Mapbox & Cloudflare Tunnel Proxy**: Định tuyến cuộc gọi qua Reverse Proxy của Vite (`/api`), tương thích 100% với mạng LAN nội bộ, localhost và đường link công khai Cloudflare Tunnel mà không vi phạm lỗi Mixed Content.

### Cấu trúc Base URLs & Headers
```http
Client Endpoint:       /api (Relative Path - Tự động định tuyến qua Vite Reverse Proxy)
Direct Backend:        http://localhost:5000/api hoặc http://<LAN_IP>:5000/api
WebSocket Server:      ws://localhost:5000 (Socket.IO v4+)
Public Tunnel:         https://<subdomain>.trycloudflare.com/api

Headers chuẩn cho mọi yêu cầu JSON:
Content-Type: application/json
Accept: application/json
```

---

## 2. NHÓM API HỆ THỐNG & ĐỒNG BỘ MẠNG (SYSTEM & TUNNEL)

### 2.1 Kiểm tra trạng thái máy chủ (Health Check)
- **Method**: `GET`
- **Endpoint**: `/api/health`
- **Response `200 OK`**:
```json
{
  "status": "ok",
  "service": "vivu-backend",
  "cloudDbConnected": false,
  "timestamp": "2026-10-28T10:15:30.120Z"
}
```

### 2.2 Lấy và cập nhật link Public Tunnel
- **Method**: `GET /api/tunnel` & `POST /api/tunnel`
- **Mô tả**: Đồng bộ hóa đường link HTTPS công khai Cloudflare Tunnel giữa script runner và giao diện Web App để tạo mã QR kết nối tức thì trên điện thoại.
- **Request Body (POST)**: `{"url": "https://roster-glasgow-toys-pas.trycloudflare.com"}`
- **Response `200 OK`**: `{"success": true, "url": "https://roster-glasgow-toys-pas.trycloudflare.com"}`

---

## 3. NHÓM API XÁC THỰC & HỒ SƠ (AUTHENTICATION & PROFILE)

### 3.1 Đăng ký tài khoản mới (Register)
- **Method**: `POST`
- **Endpoint**: `/api/auth/register`
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "Đức Tùng",
  "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "user": {
    "id": "usr-882194819",
    "email": "user@example.com",
    "user_code": "VU-4091",
    "name": "Đức Tùng",
    "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
  }
}
```

### 3.2 Đăng nhập (Login)
- **Method**: `POST`
- **Endpoint**: `/api/auth/login`
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "token": "vivu-jwt-token-string",
  "user": {
    "id": "usr-882194819",
    "email": "user@example.com",
    "user_code": "VU-4091",
    "name": "Đức Tùng",
    "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
  }
}
```

### 3.3 Cập nhật hồ sơ & Avatar (Update Profile)
- **Method**: `POST`
- **Endpoint**: `/api/auth/profile`
- **Request Body**:
```json
{
  "userId": "usr-882194819",
  "name": "Đức Tùng (Dev)",
  "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
  "bio": "Đam mê bản đồ 3D và giao diện Resend Dark"
}
```
- **Response `200 OK`**: `{"success": true, "profile": { ... }}`

---

## 4. NHÓM API ĐỊNH VỊ GPS & BẢN ĐỒ LÂN CẬN (GPS & PROFILES)

### 4.1 Cập nhật tọa độ GPS thiết bị (Heartbeat GPS)
- **Method**: `POST`
- **Endpoint**: `/api/gps/update`
- **Request Body**:
```json
{
  "userId": "usr-882194819",
  "lat": 10.7769,
  "lng": 106.7009,
  "customStatus": "Đang cafe bệt Nhà Thờ Đức Bà",
  "name": "Đức Tùng",
  "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
  "userCode": "VU-4091"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": "usr-882194819",
    "lat": 10.7769,
    "lng": 106.7009,
    "last_seen_at": "2026-10-28T10:20:00.000Z"
  }
}
```

### 4.2 Lấy danh sách hồ sơ người dùng trực tuyến
- **Method**: `GET`
- **Endpoint**: `/api/gps/profiles`
- **Response `200 OK`**: Trả về danh sách người dùng đang hoạt động kèm tọa độ GPS thực, phục vụ cắm ghim giọt nước trên Mapbox Canvas.

---

## 5. NHÓM API BÀI ĐĂNG STORY KHOẢNH KHẮC (STORIES)

### 5.1 Lấy danh sách Story đang hoạt động
- **Method**: `GET`
- **Endpoint**: `/api/stories`
- **Query Params**: `?privacy=public` (tùy chọn)
- **Response `200 OK`**:
```json
[
  {
    "id": "story-1730107200000",
    "host_id": "usr-882194819",
    "user_code": "VU-4091",
    "host_name": "Đức Tùng",
    "host_avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    "category": "moment",
    "title": "Chill chiều hoàng hôn bờ hồ",
    "description": "Không khí mát mẻ, ngắm phố phường lên đèn",
    "address": "Vị trí GPS của Bạn",
    "image": "data:image/jpeg;base64,...",
    "music": "Vạn Lần Để Dành Cho Em - Vũ",
    "meme": "Chill Đêm Một Mình",
    "bg_gradient": "from-[#0A0A0C] via-[#1A1A24] to-[#251A30]",
    "lat": 10.7780,
    "lng": 106.7015,
    "lat_offset": 0.00045,
    "lng_offset": -0.00032,
    "expiry_hours": 3,
    "expires_at": "2026-10-28T13:30:00.000Z",
    "privacy": "public",
    "created_at": "2026-10-28T10:30:00.000Z"
  }
]
```

### 5.2 Đăng Story khoảnh khắc mới
- **Method**: `POST`
- **Endpoint**: `/api/stories`
- **Request Body**:
```json
{
  "host_id": "usr-882194819",
  "user_code": "VU-4091",
  "host_name": "Đức Tùng",
  "host_avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
  "category": "moment",
  "title": "Chill chiều hoàng hôn",
  "description": "Khoảnh khắc dạo phố cuối tuần",
  "image": "data:image/jpeg;base64,...",
  "music": "Vạn Lần Để Dành Cho Em",
  "meme": "Chill Đêm Một Mình",
  "bg_gradient": "from-[#0A0A0C] via-[#1A1A24] to-[#251A30]",
  "lat": 10.7769,
  "lng": 106.7009,
  "expiry_hours": 3,
  "privacy": "public"
}
```
- **Response `201 Created`**: `{"success": true, "story": { ... }}`

---

## 6. NHÓM API NHÓM BẠN BÈ TÙY CHỈNH (CUSTOM CIRCLES)

### 6.1 Lấy danh sách nhóm
- **Method**: `GET`
- **Endpoint**: `/api/circles`
- **Response `200 OK`**: Mảng các nhóm người dùng đã tham gia.

### 6.2 Tạo nhóm mới (Thêm trực tiếp thành viên & Phân quyền Owner - Rule 27)
- **Method**: `POST`
- **Endpoint**: `/api/circles`
- **Request Body**:
```json
{
  "name": "Team Phượt Đà Lạt",
  "description": "Lên kế hoạch săn mây cuối tuần",
  "avatar": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=150",
  "member_ids": ["usr-friend-01", "usr-friend-02"]
}
```
  "owner_id": "usr-882194819",
  "initial_members": ["usr-123456", "usr-789012"]
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "id": "circle-1730108500000",
    "name": "Team Phượt Đà Lạt",
    "description": "Lên kế hoạch săn mây cuối tuần",
    "privacy": "private",
    "owner_id": "usr-882194819",
    "members": [
      { "user_id": "usr-882194819", "role": "owner", "status": "accepted", "joined_at": "..." },
      { "user_id": "usr-123456", "role": "member", "status": "accepted", "joined_at": "..." },
      { "user_id": "usr-789012", "role": "member", "status": "accepted", "joined_at": "..." }
    ],
    "member_ids": ["usr-882194819", "usr-123456", "usr-789012"],
    "created_at": "2026-10-28T10:40:00.000Z"
  }
}
```

### 6.3 Thêm thành viên trực tiếp vào nhóm
- **Method**: `POST`
- **Endpoint**: `/api/circles/:id/add-members`
- **Request Body**: `{"userId": "usr-882194819", "memberIds": ["usr-999999"]}`
- **Response `200 OK`**: `{"success": true, "circle": { ... }, "addedCount": 1}`

### 6.4 Rời nhóm hoặc Xóa thành viên
- **Rời nhóm**: `POST /api/circles/:id/leave` (Body: `{"userId": "usr-123456"}`)
- **Đuổi thành viên (Owner only)**: `POST /api/circles/:id/kick` (Body: `{"ownerId": "usr-882194819", "targetUserId": "usr-123456"}`)
- **Giải tán nhóm (Owner only)**: `DELETE /api/circles/:id` (Query/Header: `ownerId=usr-882194819`)

---

## 7. NHÓM API KẾT BẠN 1-1 (FRIENDSHIP PROTOCOL)

### 7.1 Tìm kiếm bạn bè
- **Method**: `GET`
- **Endpoint**: `/api/friends/search`
- **Query Params**: `?q=VU-4091` hoặc `?q=Tùng`

### 7.2 Gửi yêu cầu kết bạn
- **Method**: `POST`
- **Endpoint**: `/api/friends/request`
- **Request Body**: `{"senderId": "usr-882194819", "receiverId": "usr-123456"}`

### 7.3 Chấp nhận / Từ chối / Hủy lời mời
- **Chấp nhận**: `POST /api/friends/accept` (Body: `{"requestId": "freq-xxx", "userId": "usr-123456"}`)
- **Từ chối**: `POST /api/friends/reject` (Body: `{"requestId": "freq-xxx", "userId": "usr-123456"}`)
- **Hủy yêu cầu đã gửi**: `POST /api/friends/cancel` (Body: `{"senderId": "usr-882194819", "receiverId": "usr-123456"}`)
- **Hủy kết bạn**: `POST /api/friends/unfriend` (Body: `{"userId": "usr-882194819", "friendId": "usr-123456"}`)

---

## 8. NHÓM API TRÒ CHUYỆN (CHAT & MESSAGING)

### 8.1 Lấy hộp thư đến (Inbox)
- **Method**: `GET`
- **Endpoint**: `/api/chat/inbox/:userId`
- **Response `200 OK`**: Danh sách tất cả các hội thoại 1-1 và hội thoại nhóm kèm tin nhắn cuối cùng và số tin chưa đọc.

### 8.2 Lấy danh sách tin nhắn của hội thoại
- **Method**: `GET`
- **Endpoint**: `/api/chat/:conversationId/messages`
- **Response `200 OK`**: Danh sách tin nhắn sắp xếp theo thứ tự thời gian tăng dần.

### 8.3 Gửi tin nhắn mới (Fallback HTTP)
- **Method**: `POST`
- **Endpoint**: `/api/chat/messages`
- **Request Body**:
```json
{
  "conversation_id": "conv-direct-usr-123456--usr-882194819",
  "sender": "usr-882194819",
  "sender_name": "Đức Tùng",
  "sender_avatar": "https://...",
  "text": "Mình đang ở gần quán rồi nhé!"
}
```

---

## 9. ĐẶC TẢ SỰ KIỆN THỜI GIAN THỰC (SOCKET.IO REALTIME EVENTS)

Hệ thống sử dụng thư viện Socket.IO để trao đổi dữ liệu tức thì thay vì polling định kỳ:

### 9.1 Bảng sự kiện Socket.IO

| Tên sự kiện | Chiều | Payload | Mô tả |
| :--- | :--- | :--- | :--- |
| `connection` | Client -> Server | `auth: { userId }` | Bắt tay kết nối, xác định danh tính socket |
| `user:online` | Server -> Broadcast | `{ userId, timestamp }` | Báo cho bạn bè biết người này đã online |
| `gps:update` | Client -> Server | `{ lat, lng, customStatus, avatar, name }` | Gửi tọa độ GPS thực tế của thiết bị |
| `gps:peer-update` | Server -> Broadcast | `{ id, lat, lng, full_name, avatar, user_code }` | Phát sóng tọa độ cho các máy khác vẽ lại marker |
| `chat:send` | Client -> Server | `{ conversationId, text, senderId, senderName }` | Gửi tin nhắn tức thì |
| `chat:receive` | Server -> Room/Peer | `{ id, conversationId, sender, text, timestamp }` | Nhận tin nhắn mới (kèm âm thanh Pop-Chime) |
| `chat:typing` | Client <-> Server | `{ conversationId, userId, isTyping }` | Báo đối phương đang nhập văn bản |
| `circle:member-added` | Server -> Target | `{ circleId, circleName, addedBy }` | Nhận thông báo được thêm vào nhóm mới |
| `spatial:bump-candidate` | Client -> Server | `{ userId, lat, lng, timestamp }` | Báo rung lắc điện thoại ở cự ly < 15m |
| `spatial:bump-matched` | Server -> Both Clients| `{ matchedUser, pairId }` | Kích hoạt hiệu ứng kết bạn 3D Hologram |
| `disconnect` | Server -> Broadcast | `{ userId }` | Đóng kết nối khi tắt tab |
