# 🏗️ Phân Hệ Hạ Tầng & Triển Khai (Infra) — VIVU Web App

Thư mục `infra/` quản lý toàn bộ cấu hình hạ tầng, CSDL Supabase, containerization Docker và các kịch bản triển khai tự động.

---

## 1. Cấu Trúc Thư Mục
```
infra/
├── supabase/
│   ├── migrations/             # Các file di chuyển lược đồ SQL (PostGIS, RLS, Realtime)
│   │   └── 20261024_init_vivu_schema.sql
│   └── seeds/                  # Dữ liệu ban đầu (Profiles, Stories, Circles)
│       └── initial_seed.sql
├── docker/
│   ├── Dockerfile.frontend     # Đóng gói Frontend Vite + React sang Nginx Alpine
│   ├── Dockerfile.backend      # Đóng gói API Server Node.js / Express
│   ├── docker-compose.yml      # Orchestration toàn bộ hệ thống
│   └── nginx.conf              # Cấu hình reverse proxy và nén Gzip
└── README.md
```

---

## 2. Hướng Dẫn Khởi Chạy Nhanh Bằng Docker
```bash
# Di chuyển vào thư mục docker
cd infra/docker

# Khởi chạy toàn bộ hệ thống bằng Docker Compose
docker compose up -d --build
```
Ứng dụng sẽ hoạt động tại:
- Frontend: `http://localhost/`
- Backend API: `http://localhost:5000/api/health` hoặc qua reverse proxy `http://localhost/api/health`.

---

## 3. Quản Lý Cơ Sở Dữ Liệu Supabase
1. Mở Supabase Dashboard -> **SQL Editor**.
2. Chạy nội dung file `infra/supabase/migrations/20261024_init_vivu_schema.sql` để khởi tạo bảng và Realtime Pub/Sub.
3. Chạy `infra/supabase/seeds/initial_seed.sql` nếu muốn nạp dữ liệu mẫu ban đầu.
