# 🧠 Đặc Tả Thuật Toán & Xử Lý Không Gian — Dự Án VIVU V2.0

---

## 1. TỔNG QUAN HỆ THỐNG THUẬT TOÁN

Trong VIVU Web App, các thuật toán không chỉ giải quyết bài toán hiển thị bản đồ mà còn đóng vai trò cốt lõi trong việc tính toán không gian thời gian thực, khử nhiễu cảm biến, tương tác chạm điện thoại kết bạn (Spatial Bump 3D), và tự động phân tán chống đè ghim:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   BỘ THUẬT TOÁN KHÔNG GIAN VIVU V2.0                   │
├──────────────────────────┬─────────────────────────────────────────────┤
│ 1. Radial Dispersion     │ Tự động phân tán ghim theo hướng tròn       │
│                          │ khi tọa độ GPS bị trùng khít (< 60m)        │
│ 2. Proximity Bump 3D     │ Phát hiện va chạm điện thoại kết bạn        │
│                          │ (Gia tốc kế > 18 m/s² + Cự ly < 15m)        │
│ 3. Anti-Jitter Filter    │ Bộ lọc khử rung lắc vi sai (> 8m) và        │
│                          │ Khóa vị trí xác thực (Anti-Drift)           │
│ 4. Camera Clamping       │ Khóa biên độ góc nhìn chống zoom out        │
│                          │ toàn cảnh vô cớ (minZoom >= 15.0)           │
│ 5. Haversine & Midpoint  │ Tính cự ly địa cầu và trọng tâm điểm hẹn    │
│ 6. Beacon Auto-Expiry    │ Động cơ tự động thanh lọc Story hết hạn     │
└──────────────────────────┴─────────────────────────────────────────────┘
```

---

## 2. THUẬT TOÁN PHÂN TÁN HƯỚNG TRÒN KHÔNG GIAN (SPATIAL RADIAL DISPERSION — RULE 16)

### 2.1 Vấn đề thực tế
Khi hai hay nhiều người dùng ở cùng một địa điểm (ví dụ: cùng ngồi chung phòng làm việc, quán cafe, hoặc cùng chọn vị trí trung tâm thành phố), tọa độ GPS đo được sẽ trùng khít hoặc chỉ cách nhau dưới 60 mét. Nếu cắm ghim trực tiếp:
- Khung radar phát hiện $256$px của ghim "BẠN" sẽ đè lấp hoàn toàn ghim đối phương.
- Bong bóng thông tin $220$px bị chồng chéo, người dùng không thể bấm chọn hoặc xem hồ sơ của bạn bè.

### 2.2 Công thức phân tán hướng tròn (Deterministic Hash-based Radial Offset)
Để đảm bảo các ghim luôn tách rời nhau một khoảng thị giác $\ge 60$px trên màn hình mà vị trí tương đối vẫn ổn định (deterministic), hệ thống băm chuỗi ID của đối phương thành góc phân tán $\theta$:

$$\text{hash} = \sum_{i=0}^{k-1} \text{charCodeAt}(id[i]) \times 31^{k - 1 - i}$$

$$\theta = (\text{hash} \pmod{360}) \times \frac{\pi}{180} \quad (\text{radian})$$

$$R_{\text{offset}} \approx 0.0020^\circ \quad (\approx 220\text{ mét thực địa})$$

$$\Delta\text{lat} = R_{\text{offset}} \times \cos(\theta)$$

$$\Delta\text{lng} = \frac{R_{\text{offset}} \times \sin(\theta)}{\cos(\text{lat}_{\text{rad}})}$$

$$\text{lat}_{\text{render}} = \text{lat}_{\text{real}} + \Delta\text{lat}$$
$$\text{lng}_{\text{render}} = \text{lng}_{\text{real}} + \Delta\text{lng}$$

### 2.3 Hiệu quả thực tế
- Các ghim tự động bung ra xung quanh theo hình nan hoa tròn với bán kính an toàn.
- Ghim đối phương được gán nhãn `[GẦN BẠN]` và nâng `z-index: 30`, đảm bảo luôn chạm mở hồ sơ được 100%.

---

## 3. THUẬT TOÁN CHẠM ĐIỆN THOẠI KẾT BẠN (SPATIAL SHAKE-TO-BUMP 3D)

### 3.1 Cơ chế hoạt động
Mô phỏng trải nghiệm kết bạn thế hệ mới: Hai người dùng đứng đối diện nhau, cầm điện thoại và cụng nhẹ vào nhau để kết bạn tức thì thông qua mạng Socket.IO và cảm biến phần cứng:

```
[Thiết bị A] --(Lắc mạnh)--> [Gia tốc > 18m/s²] --+
                                                    |
                                                    v
[Máy chủ VIVU] <---(Socket: spatial:bump-candidate)-+
      |
      +---> Kiểm tra: Haversine(A, B) < 15m  AND  |Time_A - Time_B| < 2.5s
      |
      +---> Khớp thành công! Phát sự kiện: spatial:bump-matched
      |
      v
[Cả 2 thiết bị] ---> Rung phản hồi (haptic) + Bật Hologram 3D + Kết bạn tức thì
```

### 3.2 Bộ lọc va chạm gia tốc kế (Accelerometer Peak Detection)
Lắng nghe sự kiện `devicemotion` trên trình duyệt di động:
$$\text{Acc}_{\text{total}} = \sqrt{a_x^2 + a_y^2 + a_z^2}$$

Ngưỡng kích hoạt:
$$\text{Acc}_{\text{total}} \ge 18.0 \text{ m/s}^2 \quad (\text{loại bỏ rung nhẹ khi đi bộ})$$

### 3.3 Điều kiện khớp nối cặp đôi (Bipartite Proximity Matching)
Máy chủ duy trì một hàng đợi cửa sổ trượt (Sliding Window $T = 2.5$ giây):
1. **Điều kiện thời gian**: $|\Delta t| \le 2500$ ms.
2. **Điều kiện không gian**: $\text{Haversine}(\text{User}_A, \text{User}_B) \le 15.0$ mét.
3. Khi thỏa mãn đồng thời cả hai, máy chủ tự động:
   - Tạo bản ghi `friendships` giữa A và B.
   - Gửi sự kiện `spatial:bump-matched` mang theo hồ sơ đối phương.
   - Kích hoạt âm thanh Pop-Chime và hoạt cảnh Hologram 3D trên màn hình.

---

## 4. THUẬT TOÁN KHỬ NHIỄU VÀ KHÓA VỊ TRÍ XÁC THỰC (ANTI-JITTER & VERIFIED ANCHOR — RULE 20)

### 4.1 Khử rung lắc cảm biến (Anti-Jitter Filter)
Tín hiệu GPS khi ở trong nhà thường xuyên nhảy qua lại trong phạm vi 3 - 6 mét. Nếu cập nhật liên tục sẽ làm giao diện bị rung giật:
- **Ngưỡng lọc cự ly**: Chỉ cập nhật và phát sóng tọa độ khi khoảng cách di chuyển thực tế vượt quá 8 mét:
  $$\text{Haversine}(\text{pos}_{\text{new}}, \text{pos}_{\text{current}}) > 8.0 \text{ mét}$$

### 4.2 Định vị 3 tầng tự phục hồi (Multi-Tier Location Engine — Rule 13)
1. **Tầng 1 (Độ chính xác cao)**: `navigator.geolocation.watchPosition` với cờ `enableHighAccuracy: true`.
2. **Tầng 2 (Dự phòng IP)**: Nếu Tầng 1 bị từ chối hoặc timeout, tự động chuyển tiếp sang IP Geolocation để định vị cấp Tỉnh/Thành phố.
3. **Tầng 3 (Bộ nhớ đệm)**: Đọc tọa độ thành công gần nhất từ `localStorage` (`vivu_user_real_location`) để ghim hiện diện ngay lập tức khi tải lại trang.

### 4.3 Khóa tọa độ xác thực (Verified Anchor Invariant)
Khi thiết bị đã có tọa độ hợp lệ từ GPS thực tế hoặc người dùng đã chủ động chọn, tiến trình IP Geolocation ngầm **bị cấm tuyệt đối** việc ghi đè lên tọa độ này, ngăn chặn tình trạng người dùng bị giật về tọa độ mặc định của nhà mạng.

---

## 5. THUẬT TOÁN GIỚI HẠN GÓC NHÌN CAMERA BẢN ĐỒ (SPATIAL CAMERA CLAMPING — RULE 24)

### 5.1 Vấn đề
Khi chuyển sang tab "Bạn Bè" hoặc nhóm riêng, nếu trong danh sách có 1 người bạn ở Hà Nội và 1 người bạn ở TP.HCM, hàm `map.fitBounds` mặc định sẽ lùi camera ra ngoài không gian (zoom < 6), khiến toàn bộ ghim xung quanh biến mất khỏi tầm mắt người dùng.

### 5.2 Thuật toán Lọc bán kính lân cận (Local Radius Filter)
Hệ thống chỉ đưa các tọa độ thỏa mãn điều kiện cự ly vào hộp bao `bounds`:
$$\text{distKm}(\text{User}_{\text{me}}, \text{Friend}_i) \le 5.0 \text{ km}$$

### 5.3 Kẹp mức thu phóng an toàn (Strict minZoom Clamping)
Tính toán góc máy trước bằng `cameraForBounds` và kẹp giới hạn:
$$\text{safeZoom} = \max(\text{calculatedZoom}, 15.0)$$
$$\text{finalZoom} = \min(\text{safeZoom}, 16.5)$$

Nếu không có bạn bè nào trong bán kính 5km, camera tự động `flyTo` mượt mà về tâm giọt nước của chính người dùng ở mức zoom cận cảnh $16.2$ và độ nghiêng 3D $35^\circ$.

---

## 6. THUẬT TOÁN TÍNH KHOẢNG CÁCH HAVERSINE & ĐIỂM HẸN TRUNG TÂM (MIDPOINT)

### 6.1 Công thức Haversine
Được thực thi trực tiếp tại client với độ phức tạp $\mathcal{O}(1)$:
$$a = \sin^2\left(\frac{\Delta \text{lat}}{2}\right) + \cos(\text{lat}_1) \cdot \cos(\text{lat}_2) \cdot \sin^2\left(\frac{\Delta \text{lng}}{2}\right)$$
$$c = 2 \cdot \text{atan2}(\sqrt{a}, \sqrt{1 - a})$$
$$d = R \cdot c \quad (R = 6,371 \text{ km})$$

### 6.2 Thuật toán Trọng tâm Điểm hẹn Nhóm (Group Centroid)
Tính toán điểm giao thoa tối ưu để các thành viên trong nhóm di chuyển cự ly tương đương nhau:
$$X = \frac{1}{N} \sum_{i=1}^N \cos(\text{lat}_i) \cdot \cos(\text{lng}_i)$$
$$Y = \frac{1}{N} \sum_{i=1}^N \cos(\text{lat}_i) \cdot \sin(\text{lng}_i)$$
$$Z = \frac{1}{N} \sum_{i=1}^N \sin(\text{lat}_i)$$
$$\text{Lng}_{\text{center}} = \text{atan2}(Y, X), \quad \text{Lat}_{\text{center}} = \text{atan2}(Z, \sqrt{X^2 + Y^2})$$

---

## 7. ĐỘNG CƠ TỰ ĐỘNG THANH LỌC BÀI ĐĂNG HẾT HẠN (AUTO-EXPIRE CLEANUP ENGINE)

- Mỗi bài đăng (Story Beacon) có thời gian sống (TTL) mặc định là **3 giờ** kể từ thời điểm tạo.
- Mỗi khi API `GET /api/stories` được gọi, động cơ so sánh `expires_at` với `new Date()`:
  - Tự động gạt bỏ các bản ghi đã quá hạn.
  - Kích hoạt lưu bền vững xuống file `vivu_database.json`.
  - Đảm bảo bản đồ không bao giờ chứa thông tin rác hay sự kiện đã kết thúc từ ngày hôm trước.
