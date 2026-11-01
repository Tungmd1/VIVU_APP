# 📏 Quy Tắc Coding — Dự Án VIVU

> **Mọi thành viên trong nhóm đều phải đọc và tuân thủ tài liệu này trước khi bắt đầu code.**

---

## 1. NGUYÊN TẮC CỐT LÕI

```
Code chạy đúng > Code đẹp > Code nhanh
Kiểm thử ngay > Kiểm thử sau > Không kiểm thử ❌
Backup trước khi fix > Fix mù > Xóa đi làm lại ❌
```

---

## 2. QUY TRÌNH BẮT BUỘC KHI THỰC HIỆN CHỨC NĂNG

### 2.1 Workflow tổng quát

```
┌─────────────────────────────────────────────────────────────────┐
│                    FEATURE DEVELOPMENT CYCLE                     │
└─────────────────────────────────────────────────────────────────┘

[1. Đọc đặc tả]
    ↓
[2. Tạo branch feature/ten-chuc-nang]
    ↓
[3. Code implementation]
    ↓
[4. Viết test cases] ← BẮT BUỘC, không skip
    ↓
[5. Chạy test]
    ↓ PASS?
   YES → [6. Code review (tự review)]
            ↓
          [7. Commit + PR]
   NO  → [8. Phân tích lỗi] ← Xem mục 4
            ↓
          [9. Lập phương án backup]
            ↓
          [10. Fix → quay lại bước 5]
```

### 2.2 Định nghĩa "Hoàn thành một chức năng"

Một chức năng chỉ được coi là **HOÀN THÀNH** khi đáp ứng đủ **TẤT CẢ** tiêu chí sau:

- [ ] Code đã được implement đầy đủ theo đặc tả SRS
- [ ] Đã viết test cases (unit test + integration test tối thiểu)
- [ ] Tất cả test cases PASS
- [ ] Không có `console.log` / `print` debug còn sót
- [ ] Không có code bị comment out vô nghĩa
- [ ] API endpoint đã test thủ công bằng Postman/Insomnia
- [ ] Giao diện đã check trên ít nhất 2 trình duyệt / 2 kích thước màn hình
- [ ] Đã cập nhật `Progress.md` (đánh tick task tương ứng)
- [ ] Commit message rõ ràng (xem mục 6)

---

## 3. QUY TẮC KIỂM THỬ (TESTING)

### 3.1 Cấp độ kiểm thử bắt buộc

| Loại test | Áp dụng cho | Tool | Bắt buộc? |
|-----------|------------|------|-----------|
| **Unit Test** | Service, Utils, Algorithms | Jest (BE/FE), pytest (AI) | ✅ Bắt buộc |
| **Integration Test** | API endpoints | Jest + Supertest | ✅ Bắt buộc |
| **Manual API Test** | Mỗi endpoint mới | Postman | ✅ Bắt buộc |
| **UI Smoke Test** | Mỗi màn hình mới | Thủ công + checklist | ✅ Bắt buộc |
| **E2E Test** | Critical flows | Playwright (nếu có thời gian) | ⚠️ Khuyến nghị |

### 3.2 Checklist kiểm thử Backend (mỗi API mới)

```
API Testing Checklist — điền vào trước khi merge:

Endpoint: _______________

✅ HAPPY PATH:
  [ ] Request đúng format → Response 200/201 đúng format
  [ ] Data trả về đúng theo spec
  [ ] Pagination hoạt động (nếu có)

✅ AUTHENTICATION:
  [ ] Gọi không có token → 401 Unauthorized
  [ ] Gọi với token hết hạn → 401 + message rõ ràng
  [ ] Gọi với token của user khác role → 403 Forbidden

✅ VALIDATION:
  [ ] Bỏ trống field bắt buộc → 422 + error message
  [ ] Sai kiểu dữ liệu → 422 + error message
  [ ] Giá trị vượt giới hạn → 422 + error message

✅ EDGE CASES:
  [ ] ID không tồn tại → 404 Not Found
  [ ] Tạo trùng dữ liệu unique → 409 Conflict
  [ ] Empty list → [] (không phải null)

✅ SECURITY:
  [ ] SQL Injection test (nếu dùng raw query)
  [ ] XSS test (với string input)
  [ ] Rate limiting hoạt động
```

### 3.3 Checklist kiểm thử Frontend (mỗi màn hình mới)

```
UI Testing Checklist:

Màn hình: _______________

✅ CHỨC NĂNG:
  [ ] Tất cả button/link hoạt động đúng
  [ ] Form validation hiển thị đúng error
  [ ] Loading state hiển thị khi đang gọi API
  [ ] Error state hiển thị khi API lỗi (không crash)
  [ ] Success state hiển thị sau action thành công

✅ RESPONSIVE:
  [ ] Mobile 375px — hiển thị đúng, không bị tràn
  [ ] Mobile 428px — hiển thị đúng
  [ ] Tablet 768px — hiển thị đúng (nếu có)
  [ ] Desktop 1280px — hiển thị đúng

✅ DARK/LIGHT MODE:
  [ ] Chuyển Dark Mode — không bị màu lạ
  [ ] Chuyển Light Mode — không bị màu lạ

✅ ANIMATION:
  [ ] Animation không bị giật lag
  [ ] Transition vào/ra màn hình mượt mà

✅ NETWORK:
  [ ] Thử offline → hiển thị thông báo lỗi phù hợp (không crash)
  [ ] Thử slow network → loading hiển thị đúng

✅ TRÌNH DUYỆT:
  [ ] Chrome — OK
  [ ] Firefox — OK (hoặc ghi chú nếu có khác biệt)
```

### 3.4 Checklist kiểm thử AI Service

```
AI Testing Checklist:

Model/Algorithm: _______________

✅ UNIT TEST:
  [ ] Input bình thường → output đúng format và range
  [ ] Input rỗng/null → không crash, trả về graceful error
  [ ] Input cực trị (max values) → xử lý được

✅ PERFORMANCE:
  [ ] Thời gian xử lý 1 request < 2 giây
  [ ] Thời gian xử lý batch 1000 users < 60 giây

✅ ACCURACY (với matching/suggestion):
  [ ] Không gợi ý người đã bị block
  [ ] Không gợi ý người đã match rồi
  [ ] Score trong range [0.0, 1.0]
  [ ] Có ít nhất N kết quả cho user có đủ data
```

---

## 4. KHI PHÁT HIỆN LỖI — QUY TRÌNH XỬ LÝ

### 4.1 Phân loại lỗi

| Loại | Mô tả | Thời gian fix |
|------|-------|--------------|
| 🔴 **CRITICAL** | App crash, mất dữ liệu, security breach | Fix ngay, dừng mọi việc khác |
| 🟠 **HIGH** | Chức năng chính không hoạt động | Fix trong 24h |
| 🟡 **MEDIUM** | Chức năng phụ lỗi, có workaround | Fix trong sprint hiện tại |
| 🟢 **LOW** | UI bug, typo, cải thiện nhỏ | Fix khi có thời gian |

### 4.2 Quy trình phân tích lỗi (BẮTBUỘC trước khi fix)

```
BƯỚC 1: REPRODUCE (Tái hiện lỗi)
  → Lỗi xảy ra trong điều kiện nào?
  → Có tái hiện được không? (% reproducibility)
  → Logs/error message cụ thể là gì?
  → Môi trường: dev/staging/prod?

BƯỚC 2: ISOLATE (Khoanh vùng)
  → Lỗi xảy ra ở tầng nào? (FE/BE/AI/DB/Network?)
  → Code/function/line cụ thể nào gây ra?
  → Có liên quan đến thay đổi gần nhất không?
    → git log --oneline -10  (xem 10 commit gần nhất)
    → git bisect để tìm commit gây lỗi

BƯỚC 3: ROOT CAUSE (Nguyên nhân gốc)
  → Tại sao lỗi này xảy ra?
  → Đây là lỗi logic, lỗi data, hay lỗi infrastructure?

BƯỚC 4: IMPACT ASSESSMENT (Đánh giá tầm ảnh hưởng)
  → Bao nhiêu user bị ảnh hưởng?
  → Dữ liệu có bị corrupt không?
  → Có cascade sang chức năng khác không?
```

### 4.3 Lập phương án BACKUP (bắt buộc khi lỗi MEDIUM trở lên)

**Template phương án backup** (điền vào file `docs/bug-[date]-[id].md`):

```markdown
## Lỗi: [Mô tả ngắn]
**Phát hiện**: [ngày giờ]
**Severity**: 🔴/🟠/🟡/🟢
**Reproduce**: [Cách tái hiện]
**Root cause**: [Nguyên nhân gốc]

## Phương án sửa chính (Plan A)
Mô tả: ...
Rủi ro: ...
Thời gian ước tính: ...

## Phương án dự phòng (Plan B) — nếu Plan A thất bại
Mô tả: ...
Điều kiện chuyển sang Plan B: ...

## Phương án tạm thời (Workaround) — dùng khi chưa fix xong
Mô tả: ...
Hướng dẫn user: ...

## Rollback plan — nếu fix làm mọi thứ tệ hơn
Câu lệnh rollback: git revert [commit] / restore backup DB
```

### 4.4 Các backup plan phổ biến

#### Khi Google Maps API lỗi / vượt quota:
```
Plan A: Implement exponential backoff retry (3 lần, delay 1s, 2s, 4s)
Plan B: Chuyển sang Mapbox GL JS (đã chuẩn bị config sẵn)
Workaround: Hiển thị OpenStreetMap tĩnh, tắt real-time features
```

#### Khi WebSocket mất kết nối:
```
Plan A: Auto-reconnect với exponential backoff (Socket.io built-in)
Plan B: Polling HTTP mỗi 5 giây thay thế WebSocket
Workaround: Thông báo "Đang kết nối lại..." và disable realtime features
```

#### Khi AI Service không phản hồi:
```
Plan A: Circuit breaker pattern — sau 3 lần lỗi, dừng gọi 60s
Plan B: Fallback sang Simple Rule-Based Matching
         (random trong cùng tỉnh + cùng độ tuổi)
Workaround: Ẩn tab Matching, hiển thị "Tính năng tạm ngưng"
```

#### Khi Database lỗi / timeout:
```
Plan A: Retry query 2 lần với connection pool
Plan B: Read từ Redis cache (stale data có thể chấp nhận được)
Workaround: Hiển thị cached data + banner "Dữ liệu có thể chưa cập nhật"
Rollback: Restore từ backup PostgreSQL gần nhất
```

#### Khi Firebase RTDB lỗi:
```
Plan A: Retry connection Firebase SDK auto-handle
Plan B: Polling location từ REST API mỗi 30s
Workaround: Tắt real-time marker movement, chỉ hiển thị vị trí lúc mở app
```

---

## 5. QUY TẮC GIT & VERSION CONTROL

### 5.1 Branching Strategy (Git Flow)

```
main          ← Production only, chỉ merge từ release/*
develop       ← Integration branch, mọi feature merge vào đây
feature/*     ← Tính năng mới: feature/be-auth-jwt
bugfix/*      ← Sửa bug: bugfix/map-marker-not-appearing
hotfix/*      ← Hotfix production: hotfix/safety-mode-crash
release/*     ← Chuẩn bị release: release/v1.0
```

### 5.2 Naming Convention cho Branch

```
feature/[module]-[chức năng ngắn]
  Ví dụ:
  feature/be-auth-google-oauth
  feature/fe-map-water-drop-animation
  feature/ai-collaborative-filtering
  feature/mob-push-notification

bugfix/[module]-[mô tả ngắn]
  Ví dụ:
  bugfix/be-map-location-update-race-condition
  bugfix/fe-chat-scroll-jump
```

### 5.3 Commit Message Convention (Conventional Commits)

```
Format: <type>(<scope>): <subject>

Types:
  feat     ← Tính năng mới
  fix      ← Sửa lỗi
  test     ← Thêm/sửa test
  refactor ← Refactor (không thêm feature, không sửa bug)
  style    ← Format code, không thay đổi logic
  docs     ← Cập nhật tài liệu
  chore    ← Cấu hình, dependencies
  perf     ← Cải thiện hiệu năng

Scope: be | fe | mob | ai | db | infra | docs

Ví dụ:
  feat(be): add JWT refresh token endpoint
  feat(fe): implement water drop marker animation
  fix(ai): fix collaborative filtering nan score bug
  test(be): add unit tests for safety mode geofencing
  docs: update API spec for reactions endpoint
  chore(infra): add redis docker service to compose
```

### 5.4 Pull Request Rules

```
Trước khi tạo PR:
  [ ] Tất cả test PASS (chạy: npm test / pytest)
  [ ] Không có conflict với develop
  [ ] Đã tự review code của mình (đọc lại diff)
  [ ] PR description điền đầy đủ:
        - Chức năng đã làm gì
        - Cách test
        - Screenshots (nếu có UI)
        - Checklist testing đã tick

PR không được merge nếu:
  ✗ Còn TODO/FIXME/HACK chưa xử lý
  ✗ Có file .env hoặc credentials bị commit
  ✗ Tests fail
  ✗ Console.log/print debug còn sót
```

---

## 6. QUY TẮC CODE QUALITY

### 6.1 Không được làm (Anti-patterns)

```javascript
// ❌ KHÔNG commit console.log debug
console.log("test this value:", user);

// ❌ KHÔNG hard-code credentials
const apiKey = "AIzaSyABC123...";

// ❌ KHÔNG bỏ qua error
try {
  await riskyOperation();
} catch (e) {} // ← Error bị nuốt mất!

// ❌ KHÔNG dùng any trong TypeScript
function doSomething(data: any) { ... }

// ❌ KHÔNG viết function quá dài (> 50 lines)
// → Tách thành các function nhỏ hơn

// ❌ KHÔNG gọi API trong vòng lặp
for (const user of users) {
  await api.getProfile(user.id); // N+1 query!
}
```

### 6.2 Phải làm (Best practices)

```javascript
// ✅ Dùng logger thay console.log
logger.debug('Location updated', { userId, lat, lon });

// ✅ Tất cả secrets qua environment variables
const apiKey = process.env.GOOGLE_MAPS_API_KEY;

// ✅ Luôn handle error
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', { error: error.message });
  throw new InternalServerErrorException('Có lỗi xảy ra, vui lòng thử lại');
}

// ✅ TypeScript strict types
function processUser(user: UserEntity): UserResponseDto { ... }

// ✅ Batch API calls
const profiles = await api.getProfilesBatch(userIds); // 1 call

// ✅ Tên biến/function có nghĩa
const isUserInSafeZone = checkGeofence(userLocation, safeZonePolygon);
```

### 6.3 Cấu trúc file

```
Mỗi file chỉ làm 1 việc (Single Responsibility)
Độ dài file: tối đa 300 lines (nếu hơn, tách ra)
Độ dài function: tối đa 50 lines (nếu hơn, tách ra)
Import: sắp xếp theo thứ tự (external → internal → relative)
```

---

## 7. QUY TẮC BẢO MẬT

```
TUYỆT ĐỐI KHÔNG:
  ✗ Commit file .env lên git
  ✗ Hard-code API keys, passwords, tokens trong code
  ✗ Log dữ liệu nhạy cảm (mật khẩu, PIN, token)
  ✗ Expose stack trace cho client trong production
  ✗ Tin tưởng dữ liệu từ client mà không validate

BẮT BUỘC:
  ✅ Dùng .env.example (không có giá trị thật)
  ✅ Tất cả input từ client phải validate + sanitize
  ✅ Parameterized queries (không raw SQL với user input)
  ✅ HTTPS trong mọi môi trường ngoài localhost
  ✅ Kiểm tra authorization ở mỗi endpoint cần auth
```

---

## 8. QUY TẮC REVIEW CODE (Self-review trước PR)

Trước khi submit PR, đọc lại code của mình và trả lời:

```
□ Tôi có thể giải thích từng dòng code này làm gì không?
□ Code này có hoạt động đúng với edge cases không?
□ Nếu người khác đọc code này sau 6 tháng, họ có hiểu không?
□ Có cách nào đơn giản hơn để làm điều tương tự không?
□ Tôi đã test đủ các trường hợp chưa?
□ Có gì có thể gây lỗi trong production mà tôi bỏ qua không?
```

---

## 9. CẬP NHẬT TÀI LIỆU SAU KHI HOÀN THÀNH

Sau khi hoàn thành mỗi chức năng:

1. **Cập nhật `Progress.md`**: Đánh tick `[x]` task tương ứng, ghi ngày hoàn thành
2. **Cập nhật API Spec** nếu có thay đổi endpoint
3. **Cập nhật Database Spec** nếu có thay đổi schema
4. **Ghi chú Bug Tracker** nếu phát hiện và đã fix bug

---

## 10. CHECKLIST CUỐI SPRINT

Cuối mỗi sprint (2 tuần), cả nhóm kiểm tra:

```
□ Tất cả tasks sprint đã tick xong hoặc chuyển sang sprint sau
□ Progress.md đã cập nhật
□ Không có branch feature/bugfix cũ còn sót
□ Staging environment đang chạy ổn định
□ Không có test đang fail
□ Không có TODO/FIXME khẩn cấp bị bỏ quên
□ Backup database staging đã chạy
```

---

> 💡 **Lưu ý**: Quy tắc này được tạo ra để **bảo vệ cả nhóm**, không phải để gây khó dễ.  
> Nếu có quy tắc nào cần điều chỉnh cho phù hợp thực tế, hãy thảo luận và cập nhật file này.

---

*Phiên bản: 1.0 — Ngày: 2026-10-20*  
*Tác giả: Nhóm phát triển Vivu*
