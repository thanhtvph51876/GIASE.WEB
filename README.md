# Tutor Platform Fullstack MVP

Next.js frontend + Java Spring Boot backend + PostgreSQL.

> Repo frontend hiện nằm ở `H:\website-clone`; backend Spring Boot đang là repo sibling ở `H:\backend`.

## Run

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- Health: `http://localhost:8080/api/v1/health`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`

Nếu lệnh trên báo không kết nối được `dockerDesktopLinuxEngine`, hãy mở Docker Desktop trước rồi chạy lại.

## Local Frontend

```bash
npm install
npm run dev
```

`.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_API_TIMEOUT_MS=15000
NEXT_PUBLIC_AUTH_TOKEN_STORAGE=local
```

Kiểm tra frontend:

```bash
npx tsc --noEmit
npm run build
```

## Local Backend

```bash
cd ..\backend
mvn spring-boot:run
```

Trên Windows:

```powershell
cd H:\backend
mvn spring-boot:run
```

Kiểm tra backend:

```bash
mvn test
mvn -DskipTests package
```

Xem thêm `H:\backend\README.md` và `H:\backend\API_CONTRACT.md`. Private uploads đi qua `/api/v1/files/{fileId}`, không publish `/uploads/**`.

## Demo Seed Data

Docker compose bật seed demo bằng biến `SEED_DATA_ENABLED=true` mặc định cho local demo. Tắt seed khi dùng dữ liệu thật:

```bash
SEED_DATA_ENABLED=false docker compose up --build
```

Tài khoản demo do backend seeder tạo:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `Admin123!` |
| Student | `student@example.com` | `Student123!` |
| Parent | `parent@example.com` | `Parent123!` |
| Tutor approved | `tutor@example.com` | `Tutor123!` |
| Tutor pending | `tutor_pending@example.com` | `Tutor123!` |

## Real Data Mode

- Business preloaded records have been removed from the backend source.
- Create real users through the registration flow or admin APIs.
- Auth reset and email verification tokens are persisted in DB and queued in `auth_email_outbox` for an email sender.
- Payment defaults to sandbox gateway mode with `bank_qr` as the default gateway; connect real gateway adapters before switching to `PAYMENT_MODE=production`.

## API Integration Notes

- Frontend chỉ dùng browser storage cho token ở development. Production giữ token trong memory và cần chuyển refresh token sang HttpOnly Secure SameSite cookie trước khi public launch.
- Dữ liệu nghiệp vụ chính đi qua `lib/api/*` và backend `/api/v1`.
- Backend là nguồn sự thật cho role, ownership, trạng thái, payment, payout, notification và audit.
