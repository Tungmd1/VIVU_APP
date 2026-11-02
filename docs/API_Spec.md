# Đặc Tả Kỹ Thuật API & Realtime — Dự Án VIVU (Express REST & Socket.IO V3.0)

---

## 1. TỔNG QUAN KIẾN TRÚC GIAO TIẾP

Hệ thống VIVU Web App triển khai kiến trúc giao tiếp hợp nhất 3 lớp thời gian thực:
1. **Express RESTful API (`/api/*`)**: Xử lý toàn bộ logic nghiệp vụ bao gồm xác thực tài khoản, quản lý Story khoảnh khắc, xóa bài đăng, tương tác bình chọn/hỏi đáp, quản lý nhóm bạn bè (Circles), kết bạn 1-1, tin nhắn trò chuyện và thông báo toàn cục.
2. **Socket.IO Realtime Engine**: Kênh truyền phát hai chiều qua WebSocket (với Polling fallback), truyền phát tọa độ GPS động không rung lắc, phát sóng trạng thái online/offline, tin nhắn trò chuyện kèm Pop-Chime Web Audio, tương tác nhóm tức thời và tính năng chạm điện thoại kết bạn (Spatial Bump 3D).
3. **Mapbox & Unified Reverse Proxy**: Định tuyến cuộc gọi qua Reverse Proxy của Vite (`/api`), tương thích 100% với localhost, mạng LAN nội bộ và đường link công khai Cloudflare Tunnel mà không vi phạm chính sách bảo mật Mixed Content.

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
  "timestamp": "2026-11-03T01:00:00.000Z"
}
```

### 2.2 Lấy và cập nhật link Public Tunnel
- **Method**: `GET /api/tunnel` & `POST /api/tunnel`
- **Mô tả**: Đồng bộ hóa đường link HTTPS công khai Cloudflare Tunnel giữa script runner và giao diện Web App để tạo mã QR kết nối tức thì trên điện thoại di động.
- **Request Body (POST)**: `{"url": "https://til-heritage-smooth-platforms.trycloudflare.com"}`
- **Response `200 OK`**: `{"success": true, "url": "https://til-heritage-smooth-platforms.trycloudflare.com"}`

---

## 3. NHÓM API XÁC THỰC & HỒ SƠ (AUTHENTICATION & PROFILE)

### 3.1 Đăng ký tài khoản mới (Register)
- **Method**: `POST`
- **Endpoint**: `/api/auth/register`
- **Nguyên tắc**: Không tự động đăng nhập khi đăng ký thành công (No Auto-Login — Rule 10).
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
  "name": "Đức Tùng",
  "avatar": "data:image/jpeg;base64,...",
  "bio": "Đam mê bản đồ 3D và giao diện Resend Dark"
}
```
- **Response `200 OK`**: `{"success": true, "profile": { ... }}`

### 3.4 Quên mật khẩu & Đặt lại (Mock Password Reset)
- **Method**: `POST`
- **Endpoint**: `/api/auth/reset-password-mock`
- **Request Body**: `{"email": "user@example.com", "newPassword": "NewPassword123"}`
- **Response `200 OK`**: `{"success": true, "message": "Đặt lại mật khẩu thành công"}`

### 3.5 Đồng bộ đăng nhập mạng xã hội (OAuth)
- **Method**: `POST /api/auth/google`, `POST /api/auth/facebook`, `POST /api/auth/oauth/sync`
- **Mô tả**: Tiếp nhận token OAuth của bên thứ ba, tự động liên kết hoặc tạo người dùng mới với mã `user_code` định dạng `VU-XXXX`.

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
    "last_seen_at": "2026-11-03T01:00:00.000Z"
  }
}
```

### 4.2 Lấy danh sách hồ sơ người dùng trực tuyến
- **Method**: `GET`
- **Endpoint**: `/api/gps/profiles`
- **Response `200 OK`**: Mảng các hồ sơ người dùng trực tuyến kèm tọa độ GPS thực tế để cắm ghim giọt nước trên canvas Mapbox.

### 4.3 Đặt trạng thái Offline
- **Method**: `POST`
- **Endpoint**: `/api/gps/offline`
- **Request Body**: `{"userId": "usr-882194819"}`
- **Response `200 OK`**: `{"success": true}`

---

## 5. NHÓM API BÀI ĐĂNG STORY KHOẢNH KHẮC (STORIES)

### 5.1 Lấy danh sách Story đang hoạt động
- **Method**: `GET`
- **Endpoint**: `/api/stories`
- **Query Params**: `?privacy=public` (tùy chọn)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
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
      "expiry_hours": 3,
      "expires_at": "2026-11-03T04:00:00.000Z",
      "privacy": "public",
      "created_at": "2026-11-03T01:00:00.000Z"
    }
  ]
}
```

### 5.2 Đăng Story khoảnh khắc mới (Story Studio Pro)
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
  "privacy": "public",
  "interactive_widget": {
    "type": "poll",
    "question": "Chiều nay đi cafe hay trà đá?",
    "options": ["Cafe bệt", "Trà đá vỉa hè"]
  }
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "id": "story-1730592000000",
    "title": "Chill chiều hoàng hôn",
    "created_at": "2026-11-03T01:00:00.000Z"
  }
}
```

### 5.3 Xóa Story bài đăng (Story Deletion — Rule 29 & Rule 30)
- **Method**: `DELETE`
- **Endpoint**: `/api/stories/:storyId`
- **Query Params hoặc Body**: `userId`, `userCode`
- **Xác thực quyền**: Chỉ chính chủ (`host_id === userId` hoặc `user_code === userCode`) mới được xóa Story.
- **Cơ chế đồng bộ**:
  - Xóa khỏi bộ nhớ RAM (`dbStore.stories`) và ghi đè bền vững xuống file `backend/data/vivu_database.json`.
  - Nếu Story đã xóa là Story duy nhất hoặc Story cuối cùng đang hiển thị, hệ thống tự động gỡ bỏ bong bóng trạng thái trên đầu ghim "BẠN".
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "deletedStoryId": "story-1730592000000",
    "activeCount": 2,
    "remainingStories": [ ... ]
  }
}
```

### 5.4 Bình chọn thăm dò ý kiến (Vote Poll)
- **Method**: `POST`
- **Endpoint**: `/api/stories/:storyId/poll-vote`
- **Request Body**: `{"pollId": "poll-01", "optionIndex": 0, "userId": "usr-882194819"}`
- **Response `200 OK`**: `{"success": true, "data": { ... }}`

### 5.5 Trả lời câu hỏi Q&A (Reply QA)
- **Method**: `POST`
- **Endpoint**: `/api/stories/:storyId/qa-reply`
- **Request Body**: `{"qaId": "qa-01", "prompt": "Hỏi tôi đi", "text": "Quán này ở đâu thế?", "user": "Đức Tùng"}`
- **Response `200 OK`**: `{"success": true, "data": { ... }}`

### 5.6 Thả cảm xúc Story (React)
- **Method**: `POST`
- **Endpoint**: `/api/stories/:storyId/react`
- **Request Body**: `{"reactionType": "heart", "userId": "usr-882194819"}`
- **Response `200 OK`**: `{"success": true, "data": { ... }}`

---

## 6. NHÓM API NHÓM BẠN BÈ TÙY CHỈNH (CUSTOM CIRCLES)

### 6.1 Lấy danh sách nhóm
- **Method**: `GET`
- **Endpoint**: `/api/circles`
- **Response `200 OK`**: Mảng các nhóm người dùng đã tham gia.

### 6.2 Tạo nhóm mới (Thêm trực tiếp thành viên & Phân quyền Owner — Rule 27)
- **Method**: `POST`
- **Endpoint**: `/api/circles`
- **Request Body**:
```json
{
  "name": "Team Phượt Đà Lạt",
  "description": "Lên kế hoạch săn mây cuối tuần",
  "avatar": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=150",
  "owner_id": "usr-882194819",
  "member_ids": ["usr-friend-01", "usr-friend-02"]
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
      { "user_id": "usr-friend-01", "role": "member", "status": "accepted", "joined_at": "..." },
      { "user_id": "usr-friend-02", "role": "member", "status": "accepted", "joined_at": "..." }
    ],
    "member_ids": ["usr-882194819", "usr-friend-01", "usr-friend-02"],
    "created_at": "2026-11-03T01:00:00.000Z"
  }
}
```

### 6.3 Thêm thành viên trực tiếp vào nhóm
- **Method**: `POST`
- **Endpoint**: `/api/circles/:id/add-members`
- **Request Body**: `{"userId": "usr-882194819", "memberIds": ["usr-friend-03"]}`
- **Response `200 OK`**: `{"success": true, "circle": { ... }, "addedCount": 1}`

### 6.4 Rời nhóm, Đuổi thành viên & Giải tán nhóm
- **Rời nhóm**: `POST /api/circles/:id/leave` (Body: `{"userId": "usr-friend-01"}`)
- **Đuổi thành viên (Chỉ Owner)**: `POST /api/circles/:id/kick` (Body: `{"ownerId": "usr-882194819", "targetUserId": "usr-friend-01"}`)
- **Giải tán nhóm (Chỉ Owner)**: `DELETE /api/circles/:id` (Query/Header: `ownerId=usr-882194819`)

---

## 7. NHÓM API KẾT BẠN 1-1 (FRIENDSHIP PROTOCOL)

### 7.1 Tìm kiếm bạn bè
- **Method**: `GET`
- **Endpoint**: `/api/friends/search`
- **Query Params**: `?q=VU-4091` hoặc `?q=Tùng`

### 7.2 Gửi yêu cầu kết bạn
- **Method**: `POST`
- **Endpoint**: `/api/friends/request`
- **Request Body**: `{"senderId": "usr-882194819", "receiverId": "usr-friend-02"}`

### 7.3 Chấp nhận / Từ chối / Hủy lời mời / Hủy kết bạn
- **Chấp nhận**: `POST /api/friends/accept` (Body: `{"requestId": "freq-xxx", "userId": "usr-friend-02"}`)
- **Từ chối**: `POST /api/friends/reject` (Body: `{"requestId": "freq-xxx", "userId": "usr-friend-02"}`)
- **Hủy yêu cầu đã gửi**: `POST /api/friends/cancel` (Body: `{"requestId": "freq-xxx", "userId": "usr-882194819"}`)
- **Hủy kết bạn**: `POST /api/friends/unfriend` (Body: `{"userId": "usr-882194819", "targetUserId": "usr-friend-02"}`)

### 7.4 Lấy danh sách bạn bè & Lời mời
- **Lấy danh sách bạn bè**: `GET /api/friends/list/:userId`
- **Lấy danh sách lời mời**: `GET /api/friends/requests/:userId`

---

## 8. NHÓM API TRÒ CHUYỆN (CHAT & MESSAGING)

### 8.1 Lấy hộp thư đến (Inbox)
- **Method**: `GET`
- **Endpoint**: `/api/chat/inbox/:userId`
- **Response `200 OK`**: Danh sách tất cả hội thoại 1-1 và hội thoại nhóm kèm tin nhắn cuối và số tin chưa đọc.

### 8.2 Lấy danh sách tin nhắn hội thoại
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

### 8.4 Đánh dấu đã đọc
- **Method**: `POST`
- **Endpoint**: `/api/chat/messages/read`
- **Request Body**: `{"conversationId": "conv-direct-...", "userId": "usr-882194819"}`

---

## 9. NHÓM API THÔNG BÁO TOÀN CỤC (NOTIFICATIONS)

### 9.1 Lấy danh sách thông báo
- **Method**: `GET`
- **Endpoint**: `/api/notifications/:userId`
- **Response `200 OK`**: Mảng các thông báo sắp xếp mới nhất lên đầu (kết bạn, chấp nhận kết bạn, tin nhắn mới, story lân cận).

### 9.2 Đánh dấu đã đọc thông báo
- **Đánh dấu 1 thông báo**: `POST /api/notifications/:id/read`
- **Đánh dấu tất cả**: `POST /api/notifications/read-all` (Body: `{"userId": "usr-882194819"}`)

### 9.3 Xóa thông báo
- **Method**: `DELETE`
- **Endpoint**: `/api/notifications/:id`
- **Response `200 OK`**: `{"success": true}`

---

## 10. ĐẶC TẢ SỰ KIỆN THỜI GIAN THỰC (SOCKET.IO REALTIME EVENTS)

Hệ thống sử dụng WebSocket thông qua Socket.IO kết hợp fallback polling để đảm bảo độ trễ thấp (< 100ms):

| Tên sự kiện | Chiều | Payload | Mô tả |
| :--- | :--- | :--- | :--- |
| `connection` | Client -> Server | `auth: { userId }` | Bắt tay kết nối, xác thực định danh socket |
| `user:online` | Server -> Broadcast | `{ userId, timestamp }` | Thông báo trạng thái trực tuyến cho mọi client |
| `gps:update` | Client -> Server | `{ lat, lng, customStatus, avatar, name, userCode, phone }` | Gửi tọa độ GPS thực tế của thiết bị |
| `gps:peer-update` | Server -> Broadcast | `{ id, lat, lng, full_name, avatar, user_code, is_online }` | Phát sóng tọa độ thiết bị để tái vẽ marker Mapbox |
| `chat:send` | Client -> Server | `{ conversationId, text, senderId, senderName, recipientId }` | Gửi tin nhắn tức thì |
| `chat:message` | Server -> Peer | `{ id, conversationId, sender, text, timestamp }` | Chuyển tiếp tin nhắn kèm âm Pop-Chime |
| `chat:sent` | Server -> Sender | `{ success: true, message }` | Xác nhận gửi tin nhắn thành công |
| `spatial:bump-initiate` | Client -> Server | `{ targetUserId, senderName, lat, lng }` | Khởi tạo chạm máy cụm ly 3D khi cự ly < 15m |
| `spatial:bump-trigger` | Server -> Both Clients | `{ initiatorId, targetUserId, story, timestamp }` | Kích hoạt hiệu ứng kết bạn 3D Hologram và Story Đôi |
| `stories:request` / `stories:list` | Client <-> Server | Request / Danh sách stories | Đồng bộ danh sách Story thời gian thực |
| `stories:new` | Server -> Broadcast | `{ id, title, lat, lng, image, host_name }` | Thông báo có Story mới xuất hiện trên bản đồ |
| `friend:send-request` | Client -> Server | `{ targetUserId }` | Gửi yêu cầu kết bạn thời gian thực |
| `friend-request:incoming` | Server -> Receiver | `{ id, sender_id, sender_name, sender_avatar }` | Báo có lời mời kết bạn mới đến |
| `friend:accept-request` | Client -> Server | `{ requestId }` | Chấp nhận lời mời kết bạn |
| `friend:accepted` | Server -> Sender | `{ request, friendshipId }` | Thông báo lời mời kết bạn đã được chấp thuận |
| `friend:unfriend` | Client -> Server | `{ targetUserId }` | Hủy kết bạn thời gian thực |
| `notifications:request` / `notifications:list` | Client <-> Server | Request / Danh sách notifs | Đồng bộ trung tâm thông báo chuông |
| `user:going-offline` / `user:offline` | Client -> Server -> Broadcast | `{ userId, timestamp }` | Đóng kết nối khi tắt ứng dụng hoặc đóng tab |
