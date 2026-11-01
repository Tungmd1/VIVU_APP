# 🤖 Project Rules & Workflow Instructions — VIVU

## 1. Skill Invocation & Transparency
- BẮT BUỘC: Mỗi khi sử dụng hoặc kích hoạt một skill (ví dụ: `stitch-design-taste`, `writing-plans`, `design-taste-frontend`, `building-data-apps`...), agent phải in ngay ở đầu phản hồi dòng thông báo:
  `[KÍCH HOẠT SKILL: <Tên Skill>] - <Mục đích thực hiện>`
- Luôn đặt cờ `IsSkillFile: true` khi gọi công cụ `view_file` trên các file SKILL.md để IDE hiển thị huy hiệu skill.

## 2. Google Stitch UI Integration Protocol (https://stitch.withgoogle.com/)
- Dự án ưu tiên sử dụng thiết kế xuất từ Google Stitch làm tiêu chuẩn giao diện.
- Khi người dùng cung cấp file zip xuất từ Stitch:
  - Tự động giải nén và phân loại từng màn hình vào `stitch_exports/`.
  - Tự động lưu trữ ảnh `screen.png` vào `docs/images/stitch_screens/` để phục vụ báo cáo.
  - Tích hợp chuẩn xác vào React SPA với Tailwind CSS và Material Symbols, tuyệt đối không hạ cấp thành các component sơ sài.

## 3. Anti-Slop & Design Taste (`design-taste-frontend`)
- Không sử dụng font generic (Inter/system-ui). Dùng font chủ đạo `Be Vietnam Pro`, `Outfit`, `JetBrains Mono`.
- Không dùng emoji trong text nhãn UI hoặc nút điều hướng. Emoji chỉ dùng cho tương tác cảm xúc xã hội giữa các giọt nước.
- Dùng hình ảnh thật của bối cảnh phố cổ Hà Nội / Hồ Gươm, không dùng ảnh placeholder xám rỗng.
- Chuyển động lơ lửng vô tận (perpetual float) và vòng sóng radar nhẹ nhàng, tinh tế.

## 4. Strict TDD & Quality Gate (Coding_Rules.md)
- Mọi chức năng mới đều phải có unit test (Vitest) kiểm thử tự động.
- 100% tests phải PASS trước khi đánh dấu hoàn thành và cập nhật Progress.md.
- Luôn xác nhận an toàn trước khi thực hiện xóa file diện rộng.

## 5. CSS ↔ Docs Sync Rule
- BẮT BUỘC: Mỗi khi `globals.css` hoặc bất kỳ file CSS/token nào thay đổi
  (thêm keyframe, utility class, màu sắc, glassmorphism token...), agent phải
  đề xuất cập nhật `docs/UI_UX_Spec.md` tương ứng (mục Animation, Design Tokens).
- Không được coi một CSS change là "hoàn thành" nếu chưa có bản cập nhật docs
  đi kèm (hoặc người dùng explicitly bỏ qua bước này).
- Ngược lại: nếu spec thay đổi animation/màu sắc trong docs, agent phải kiểm tra
  xem `globals.css` đã được cập nhật chưa và đề xuất nếu chưa.

## 6. Dynamic Device GPS & Anti-Hardcoded Locations
- BẮT BUỘC: Không được hardcode tọa độ người dùng cố định vào một địa điểm tĩnh (như Nhà Thờ Lớn Hà Nội).
- Bản đồ và store phải tích hợp `useGeolocation` lấy vị trí GPS thời gian thực từ thiết bị người dùng (`navigator.geolocation`).
- Khi người dùng cấp quyền, bản đồ phải tự động bay (`flyTo`) đến vị trí thật của người dùng và đồng bộ On-Demand lên Backend / Supabase.
- Khi người dùng từ chối cấp quyền hoặc môi trường test không có GPS, hiển thị banner nhắc nhở cấp quyền và cho phép người dùng tự ghim vị trí hoặc chọn thành phố, tuyệt đối không âm thầm gán vị trí giả định.

## 7. Google Stitch MCP Automated Ingestion Protocol
- Khi người dùng cung cấp API Key hoặc cấu hình Stitch MCP Server (`https://stitch.googleapis.com/mcp`):
  - Agent tự động kết nối qua JSON-RPC tool `tools/call`.
  - Tự động gọi `list_screens` (lưu ý: truyền `projectId` dưới dạng chuỗi ID số thuần túy, không có tiền tố `projects/`).
  - Gọi `download_file` tải song song mã nguồn HTML và ảnh chụp base64.
  - Phân loại màn hình vào `stitch_exports/<screen_name>/` và copy ảnh trực tiếp vào `docs/images/stitch_screens/<screen_name>.png`.
  - Đồng bộ bảng màu và token giao diện từ `DESIGN.md` vào `tailwind.config`, `index.html` và `globals.css`.

## 8. Jagat / Zenly Privacy Gate & Freshness Protocol
- Store bản đồ (`mapStore.js`) phải kiểm tra `locationSharing.enabled` và `temporaryHideUntil` trước khi broadcast GPS lên Supabase / Backend.
- Markers trên bản đồ phải phản ánh đúng độ tươi dữ liệu vị trí:
  - `fresh` (< 5 phút): Marker sáng rõ, radar kích hoạt.
  - `stale` (5 phút - 2 giờ): Hiển thị nhãn thời gian trễ ("15p trước", "1h trước").
  - `offline` (> 2 giờ): Mờ 50%, sắc thái xám nhẹ, tắt sóng radar.

## 9. Stitch Auth & Dual-Layer Authentication Resiliency
- Thành phần xác thực phải bám sát mẫu thiết kế `screen_auth_login`: Frosted Aero Glass, chuyển tab linh hoạt Đăng Nhập/Đăng Ký, biometric button FaceID/Vân tay và bộ 3 mạng xã hội Google/Apple/Facebook.
- Gọi trực tiếp NestJS endpoint `/auth/login` và `/auth/register` đồng thời cung cấp tầng fallback mock dữ liệu để vượt qua 100% các bài test Vitest tự động và môi trường demo ngoại tuyến.

## 10. Anti-Emoji Mandate & Bootstrap Icons Standard
- BẮT BUỘC: Tuyệt đối không dùng ký tự Unicode Emoji (`☕, 🍲, 🎬, ⚡, 🎧, 💬, 🚀, ❤️, 👨‍👩‍👧, 👥, 🌐...`) trong giao diện người dùng (thanh menu, button, badge, pin bản đồ, thông báo).
- Bắt buộc sử dụng vector icon của **Bootstrap Icons** (`bi bi-...`) để đảm bảo thẩm mỹ hiện đại, đồng bộ và chuyên nghiệp theo phong cách High-End UI.

## 11. Brand Identity Invariant (VIVU-First)
- Tên thương hiệu và toàn bộ mã nguồn (file, component, store, database) đều mang tên **VIVU** (ví dụ: `VivuBottomDock`, `VivuMapCanvas`).
- "Jagat" hay "Zenly" chỉ là ứng dụng tham khảo ý tưởng UX, tuyệt đối không dùng làm tên định danh trong mã nguồn.
