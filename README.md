# Durian QR — Frontend

Quản lý tình trạng cây sầu riêng qua mã QR. FE dựng theo `instruction/05_FRONTEND.md`.

## Chạy

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # tsc -b + vite build
npm run lint
```

Biến môi trường (`.env`, mẫu ở `.env.example`):

| Biến | Ý nghĩa |
|---|---|
| `VITE_API_URL` | Base URL API thật (mock chưa dùng tới) |
| `VITE_PUBLIC_URL` | Domain nhúng vào mã QR: `<VITE_PUBLIC_URL>/tree/<code>` |
| `VITE_MOCK_ERRORS` | `1` = mock ném lỗi ngẫu nhiên để test error state |

## Tài khoản demo (mock, chưa có backend)

| Vai trò | Tài khoản | Mật khẩu |
|---|---|---|
| Quản lý | `quanly` | `quanly123` |
| Nhân công | `nhancong` | `nhancong123` |
| Khách xem | `khachxem` | `khachxem123` |

## SPA fallback — bắt buộc (09_DECISIONS D2)

QR trỏ tới path thật `/tree/<code>`. Hosting **phải** rewrite mọi path về `index.html`,
nếu không tem QR đã in sẽ 404.

- Netlify / Cloudflare Pages: đã có sẵn `public/_redirects`.
- Nginx: `try_files $uri /index.html;`
- Vercel: thêm rewrite `/(.*)` → `/index.html`.

**Kiểm tra fallback trên môi trường thật trước khi in tem hàng loạt.**

## Dữ liệu

Toàn bộ dữ liệu đi qua `src/services/*.service.ts`, hiện trả mock (30 cây seed).
Nối API thật = sửa thân hàm service, giữ nguyên signature; component không đổi.

## Trang dev

`/dev/ui` (chỉ bản dev): liệt kê mọi variant component + self-check cho
`utils/coords.ts`, `utils/geo.ts`, `utils/health-score.ts`.
