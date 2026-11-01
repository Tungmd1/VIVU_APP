# Cấu hình đăng nhập Google và Facebook cho VIVU

VIVU đã gọi `supabase.auth.signInWithOAuth()` từ các nút Google/Facebook. Supabase Auth là broker OAuth: trình duyệt không được chứa Google Client Secret, Facebook App Secret hoặc Supabase service-role key.

## 1. Cấu hình biến môi trường frontend

Sao chép `frontend/.env.example` thành `frontend/.env`, rồi điền `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` (hoặc publishable key) lấy từ Supabase Dashboard → Project Settings → API. Các giá trị `VITE_*` là cấu hình client công khai; không đặt secret provider hoặc service-role key ở đây.

Chạy Vite cục bộ từ thư mục `frontend`:

```sh
npm run dev
```

Chạy Docker từ thư mục gốc repository để Compose đọc file env đúng chỗ và build lại frontend với cấu hình Supabase:

```sh
docker compose --env-file frontend/.env -f infra/docker/docker-compose.yml up --build
```

Các biến Vite được nhúng lúc build. Thay đổi env khi chạy Docker cần build lại image frontend.

## 2. Bật Google trong Supabase

1. Trong Google Cloud Console, tạo OAuth Client ID loại Web application và cấu hình consent screen.
2. Trong Authorized redirect URIs của Google, thêm chính xác callback hiển thị tại Supabase Dashboard → Authentication → Sign In / Providers → Google. Callback thường có dạng `https://<project-ref>.supabase.co/auth/v1/callback`.
3. Bật Google provider trong Supabase và nhập Google Client ID/Client Secret ở đó.

## 3. Bật Facebook trong Supabase

1. Tạo ứng dụng Facebook Developer, thêm sản phẩm Facebook Login và cấu hình quyền `public_profile` cùng `email`.
2. Trong Valid OAuth Redirect URIs của Facebook, thêm chính xác callback hiển thị ở Supabase Dashboard → Authentication → Sign In / Providers → Facebook. Callback thường có dạng `https://<project-ref>.supabase.co/auth/v1/callback`.
3. Bật Facebook provider trong Supabase và nhập Facebook App ID/App Secret ở đó.
4. Khi Facebook app ở Development mode, chỉ tài khoản có vai trò/tester trong app mới đăng nhập được. Muốn phục vụ công khai cần hoàn tất cấu hình và xét duyệt theo yêu cầu của Meta.

## 4. Cấu hình địa chỉ quay về VIVU

Trong Supabase Dashboard → Authentication → URL Configuration:

- Đặt Site URL thành origin production ổn định của VIVU.
- Thêm `http://localhost:5173/` cho local development.
- Thêm origin production chính xác của ứng dụng.
- Với Cloudflare Quick Tunnel có hostname thay đổi, có thể tạm thêm wildcard giới hạn như `https://*.trycloudflare.com/**` khi thử nghiệm. Đây là cấu hình development; production nên dùng hostname ổn định và redirect URL chính xác.

VIVU chuyển người dùng về `window.location.origin`. Nếu origin không nằm trong Redirect URLs allow list, Supabase sẽ từ chối hoặc chuyển về Site URL mặc định.

## 5. Luồng đăng nhập

1. Người dùng bấm Google hoặc Facebook.
2. Supabase chuyển trình duyệt tới provider.
3. Provider trả kết quả về callback Supabase.
4. Supabase chuyển người dùng về origin VIVU đã được allow-list.
5. Supabase JS khôi phục session; `useAuth` nhận session qua `onAuthStateChange`.

Nếu bị lỗi, kiểm tra lần lượt: biến Vite có giá trị thật và frontend đã được build lại; provider đã bật và có đúng Client ID/Secret; callback Supabase được khai báo chính xác bên Google/Facebook; origin VIVU có trong Supabase Redirect URLs; tài khoản Facebook có quyền test nếu app đang ở Development mode.