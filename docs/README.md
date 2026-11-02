# Bộ Tài Liệu Đặc Tả Kỹ Thuật — Dự Án VIVU V3.0

Chào mừng bạn đến với bộ tài liệu đặc tả chính thức của nền tảng **VIVU — Mạng Xã Hội Bản Đồ Không Gian Thời Gian Thực (Spatial Social Network)**.

Toàn bộ tài liệu trong thư mục này đã được đồng bộ hóa 100% với mã nguồn thực tế của hệ thống (phiên bản V3.0). Toàn bộ các đặc tả cũ không tồn tại trong dự án (như luồng hẹn hò phức tạp, tạo kèo rườm rà) đã được thanh lọc toàn diện.

---

## 1. MỤC LỤC TÀI LIỆU CHÍNH THỨC

| STT | Tài liệu | Đường dẫn | Mô tả nội dung | Phiên bản |
| :---: | :--- | :--- | :--- | :---: |
| 1 | **Yêu Cầu Phần Mềm (SRS)** | [SRS.md](file:///c:/Đức%20Tùng/DACN/vivudemo1/docs/SRS.md) | Yêu cầu chức năng, phi chức năng, Story Studio Pro, Multi-Story Segmented Viewer, Lightbox Fullscreen, Story Delete 2 cấp độ, Kho lưu trữ & Tin nổi bật, Dynamic Island, Spatial Bump 3D. | **v3.0** |
| 2 | **Thiết Kế UI/UX** | [UI_UX_Spec.md](file:///c:/Đức%20Tùng/DACN/vivudemo1/docs/UI_UX_Spec.md) | Hệ màu Resend Dark Monochrome (`#07090E`, `#121520`, `#151619`), Cyber Neon, Mapbox 3D, 100% Bootstrap Icons (Anti-Emoji), Story Studio, Segmented Bars, Lightbox, Highlights. | **v3.0** |
| 3 | **Cơ Sở Dữ Liệu** | [Database_Spec.md](file:///c:/Đức%20Tùng/DACN/vivudemo1/docs/Database_Spec.md) | Dual-Mode: Supabase PostGIS + Persistent JSON Engine (`dbStore.js`), Client LocalStorage Schemas (`vivu_user_story_archive`, `vivu_user_highlights`), RLS Policies. | **v3.0** |
| 4 | **Giao Tiếp API & Realtime** | [API_Spec.md](file:///c:/Đức%20Tùng/DACN/vivudemo1/docs/API_Spec.md) | REST API (`/api/*`), Xóa Story (`DELETE /api/stories/:storyId`), Poll & QA, Socket.IO realtime events, Vite Reverse Proxy, Cloudflare Tunnel sync. | **v3.0** |
| 5 | **Thuật Toán & Không Gian** | [Algorithm_Spec.md](file:///c:/Đức%20Tùng/DACN/vivudemo1/docs/Algorithm_Spec.md) | Phân tán hướng tròn (Radial Offset >= 200m), Shake-to-Bump (> 18m/s² + < 15m), Anti-Jitter (> 8m), Camera Clamping (minZoom >= 15.0). | **v2.0** |
| 6 | **Sơ Đồ Hệ Thống (Diagrams)**| [Diagrams_Spec.md](file:///c:/Đức%20Tùng/DACN/vivudemo1/docs/Diagrams_Spec.md) | Sơ đồ Mermaid Fullstack Architecture, các luồng tuần tự (Sequence Diagrams) và phân rã component React. | **v2.0** |
| 7 | **Cấu Trúc Dự Án** | [Project_Structure.md](file:///c:/Đức%20Tùng/DACN/vivudemo1/docs/Project_Structure.md)| Cây thư mục chi tiết phân hệ `frontend/`, `backend/`, `infra/`, `scripts/`, `docs/`, module hóa story (`camera/`, `editor/`, `viewer/`) và profile. | **v3.0** |
| 8 | **Tiến Độ & Trạng Thái** | [Progress.md](file:///c:/Đức%20Tùng/DACN/vivudemo1/docs/Progress.md) | Bảng theo dõi tiến độ 10 giai đoạn hoàn thiện, Multi-Story, Lightbox Fullscreen, Story Delete, Kho Lưu Trữ & Tin Nổi Bật. | **v3.0** |

---

## 2. TÀI LIỆU HỖ TRỢ VẬN HÀNH

- **[OAUTH_SETUP.md](file:///c:/Đức%20Tùng/DACN/vivudemo1/docs/OAUTH_SETUP.md)**: Hướng dẫn cấu hình Google & Facebook OAuth trên Supabase Auth và biến môi trường Vite.
- **[AGENTS.md](file:///c:/Đức%20Tùng/DACN/vivudemo1/docs/AGENTS.md)**: Quy tắc làm việc và quy chuẩn vận hành của AI Coding Assistant trong dự án.
- **[GEMINI.md](file:///c:/Đức%20Tùng/DACN/vivudemo1/GEMINI.md)**: Tổng hợp 26 quy tắc cốt lõi (Learned Rules & Behavioral Invariants) của hệ thống VIVU.

---

## 3. MA TRẬN CÔNG NGHỆ (TECH STACK MATRIX)

| Thành phần | Công nghệ chính | Phiên bản | Vai trò |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React + Vite | React 19, Vite 5 | SPA render siêu tốc, HMR, hỗ trợ PWA mobile |
| **Bản đồ 3D** | Mapbox GL JS | 3.33+ | Render vector tiles, nghiêng 3D 32-35°, camera fitBounds |
| **Icon Vector** | Bootstrap Icons | 1.11+ | 100% Vector icons chuẩn thẩm mỹ (Zero Unicode Emoji) |
| **Backend API** | Node.js + Express | Express 4.19+ | RESTful API, xác thực, quản lý Story, xóa bài, nhóm 2 tầng |
| **Realtime Engine** | Socket.IO | 4.7+ | WebSocket hai chiều, phát sóng GPS, chat, Bump 3D |
| **Local Database** | Persistent JSON Engine | v3.0 | Ghi đĩa nguyên tử an toàn (`vivu_database.json`) |
| **Cloud Database** | Supabase (PostgreSQL 15) | PostGIS 3.3+ | Điện toán không gian địa lý, GIST index, RLS |
| **AI Tooling** | Google Stitch AI | MCP Protocol | Sinh mã component và quản lý Design System |
| **Mạng Công Khai** | Cloudflare Tunnel | cloudflared | Public URL HTTPS tức thì không cần mở port modem |

---

## 4. CÁC BẤT BIẾN AN TOÀN HỆ THỐNG (SYSTEM INVARIANTS)

1. **Zero-Flash Direct Guest Map (Rule 22)**: Bất kỳ ai mở link web app đều được vào thẳng bản đồ 3D với tư cách Khách trải nghiệm tức thì (`VU-XXXX`), không bao giờ bị chặn cứng bởi màn hình đăng nhập.
2. **Dual-Mode Self-Healing (Rule 4)**: Ứng dụng tự động chuyển đổi trong suốt giữa Supabase Cloud và Local JSON Database mà không bao giờ báo lỗi đỏ hay gián đoạn trải nghiệm người dùng.
3. **Anti-Emoji Mandate (Rule 5)**: Nghiêm cấm 100% việc chèn ký tự Unicode Emoji vào giao diện; toàn bộ biểu tượng sử dụng vector Bootstrap Icons.
4. **Spatial Radial Dispersion (Rule 16)**: Tự động phân tán các ghim có cự ly < 60m ra bán kính >= 200m để đảm bảo khoảng cách hiển thị >= 60px, chống đè lấp tầm nhìn.
5. **Verified Location Lock (Rule 20)**: IP Geolocation ngầm bị cấm ghi đè lên tọa độ GPS đã xác thực của người dùng.
6. **Multi-Story Segmented Progression (Rule 28)**: Trình phát Story tự động gom các bài đăng còn hạn của cùng tác giả thành các thanh phân đoạn, chạm lùi/tiến trực quan.
7. **Bulletproof Story Deletion (Rule 29 & 30)**: Xóa Story hai cấp độ linh hoạt, đồng bộ tức thì trên bản đồ và trong cơ sở dữ liệu đĩa cứng.
