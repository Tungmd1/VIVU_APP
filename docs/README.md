# 📚 Bộ Tài Liệu Đặc Tả Kỹ Thuật — Dự Án VIVU V2.0

Chào mừng bạn đến với bộ tài liệu đặc tả chính thức của nền tảng **VIVU — Mạng Xã Hội Bản Đồ Không Gian & Lên Lịch Hẹn Thời Gian Thực**.

Toàn bộ tài liệu trong thư mục này đã được đồng bộ hóa 100% với mã nguồn thực tế của hệ thống (phiên bản V2.0).

---

## 📑 MỤC LỤC TÀI LIỆU CHÍNH THỨC

| STT | Tài liệu | Đường dẫn | Mô tả nội dung | Phiên bản |
| :---: | :--- | :--- | :--- | :---: |
| 1 | **Yêu Cầu Phần Mềm (SRS)** | [SRS.md](file:///c:/Đức%20Tùng/DACN/vivudemo1/docs/SRS.md) | Yêu cầu chức năng, phi chức năng, kiến trúc Fullstack Dual-Mode, Dynamic Island, Spatial Bump 3D, Custom Circles. | **v2.0** |
| 2 | **Thiết Kế UI/UX** | [UI_UX_Spec.md](file:///c:/Đức%20Tùng/DACN/vivudemo1/docs/UI_UX_Spec.md) | Hệ màu Resend Dark Monochrome (`#0E0E10`, `#151619`), Cyber-Solar Hologram, Mapbox 3D, 100% Bootstrap Icons (Anti-Emoji). | **v2.0** |
| 3 | **Cơ Sở Dữ Liệu** | [Database_Spec.md](file:///c:/Đức%20Tùng/DACN/vivudemo1/docs/Database_Spec.md) | Schema 8 thực thể dữ liệu, PostGIS GIST Index, Persistent JSON Engine (`dbStore.js`), Atomic write & Sanitizer dọn khách `client-xxx`. | **v2.0** |
| 4 | **Giao Tiếp API & Realtime** | [API_Spec.md](file:///c:/Đức%20Tùng/DACN/vivudemo1/docs/API_Spec.md) | 7 nhóm Express REST endpoints (`/api/*`), Socket.IO realtime events, Vite Reverse Proxy, Cloudflare Tunnel sync. | **v2.0** |
| 5 | **Thuật Toán & Không Gian** | [Algorithm_Spec.md](file:///c:/Đức%20Tùng/DACN/vivudemo1/docs/Algorithm_Spec.md) | Phân tán hướng tròn (Radial Offset $\ge 200$m), Shake-to-Bump ($> 18$m/s² + $< 15$m), Anti-Jitter ($> 8$m), Camera Clamping ($\ge 15.0$). | **v2.0** |
| 6 | **Sơ Đồ Hệ Thống (Diagrams)**| [Diagrams_Spec.md](file:///c:/Đức%20Tùng/DACN/vivudemo1/docs/Diagrams_Spec.md) | Sơ đồ Mermaid Fullstack Architecture, 4 luồng tuần tự (Sequence Diagrams) và cấu trúc phân rã component React. | **v2.0** |
| 7 | **Cấu Trúc Dự Án** | [Project_Structure.md](file:///c:/Đức%20Tùng/DACN/vivudemo1/docs/Project_Structure.md)| Cây thư mục chi tiết phân hệ `frontend/`, `backend/`, `infra/`, `scripts/`, `docs/` và quy chuẩn giao tiếp phụ thuộc. | **v2.0** |
| 8 | **Tiến Độ & Trạng Thái** | [Progress.md](file:///c:/Đức%20Tùng/DACN/vivudemo1/docs/Progress.md) | Bảng theo dõi tiến độ phát triển 8 giai đoạn, tình trạng test suites (15/15 passed) và checklist bàn giao. | **v2.0** |

---

## 🛠️ TÀI LIỆU HỖ TRỢ VẬN HÀNH

- **[OAUTH_SETUP.md](file:///c:/Đức%20Tùng/DACN/vivudemo1/docs/OAUTH_SETUP.md)**: Hướng dẫn cấu hình Google & Facebook OAuth trên Supabase Auth và biến môi trường Vite.
- **[AGENTS.md](file:///c:/Đức%20Tùng/DACN/vivudemo1/docs/AGENTS.md)**: Quy tắc làm việc và quy chuẩn vận hành của AI Coding Assistant trong dự án.
- **[GEMINI.md](file:///c:/Đức%20Tùng/DACN/vivudemo1/GEMINI.md)**: Tổng hợp 26 quy tắc cốt lõi (Learned Rules & Behavioral Invariants) của hệ thống VIVU.

---

## ⚡ MA TRẬN CÔNG NGHỆ (TECH STACK MATRIX)

| Thành phần | Công nghệ chính | Phiên bản | Vai trò |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React + Vite | React 18, Vite 5 | SPA render nhanh, HMR, hỗ trợ PWA mobile |
| **Bản đồ 3D** | Mapbox GL JS | 3.33+ | Render vector tiles, nghiêng 3D 35°, camera fitBounds |
| **Icon Vector** | Bootstrap Icons | 1.11+ | 100% Vector icons chuẩn thẩm mỹ (Zero Unicode Emoji) |
| **Backend API** | Node.js + Express | Express 4.19+ | RESTful API, xác thực, phân quyền nhóm 2 tầng |
| **Realtime Engine** | Socket.IO | 4.7+ | WebSocket hai chiều, phát sóng GPS, chat, Bump 3D |
| **Local Database** | Persistent JSON Engine | v2.0 | Ghi đĩa nguyên tử an toàn (`vivu_database.json`) |
| **Cloud Database** | Supabase (PostgreSQL 15) | PostGIS 3.3+ | Điện toán không gian địa lý, GIST index, RLS |
| **AI Tooling** | Google Stitch AI | MCP Protocol | Sinh mã component và quản lý Design System |
| **Mạng Công Khai** | Cloudflare Tunnel | cloudflared | Public URL HTTPS tức thì không cần mở port modem |

---

## 🛡️ CÁC BẤT BIẾN AN TOÀN HỆ THỐNG (SYSTEM INVARIANTS)

1. **Zero-Flash Direct Guest Map (Rule 22)**: Bất kỳ ai mở link web app đều được vào thẳng bản đồ 3D với tư cách Khách trải nghiệm tức thì (`VU-XXXX`), không bao giờ bị chặn cứng bởi màn hình đăng nhập.
2. **Dual-Mode Self-Healing (Rule 4)**: Ứng dụng tự động chuyển đổi trong suốt giữa Supabase Cloud và Local JSON Database mà không bao giờ báo lỗi đỏ hay gián đoạn trải nghiệm người dùng.
3. **Anti-Emoji Mandate (Rule 5)**: Nghiêm cấm 100% việc chèn ký tự Unicode Emoji vào giao diện; toàn bộ biểu tượng sử dụng vector Bootstrap Icons.
4. **Spatial Radial Dispersion (Rule 16)**: Tự động phân tán các ghim có cự ly $< 60$m ra bán kính $\ge 200$m để đảm bảo khoảng cách hiển thị $\ge 60$px, chống đè lấp tầm nhìn.
5. **Verified Location Lock (Rule 20)**: IP Geolocation ngầm bị cấm ghi đè lên tọa độ GPS đã xác thực của người dùng.

