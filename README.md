# Tutor Platform Fullstack MVP

Next.js frontend + Java Spring Boot backend + PostgreSQL.

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
```

Kiểm tra frontend:

```bash
npx tsc --noEmit
npm run build
```

## Local Backend

```bash
cd backend
./mvnw spring-boot:run
```

Trên Windows:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Kiểm tra backend:

```bash
./mvnw clean test
./mvnw clean package
```

Xem thêm [backend/README.md](backend/README.md) và [backend/API_CONTRACT.md](backend/API_CONTRACT.md). Private uploads đi qua `/api/v1/files/{fileId}`, không publish `/uploads/**`.

## Real Data Mode

- Business preloaded records have been removed from the backend source.
- Create real users through the registration flow or admin APIs.
- Auth reset and email verification tokens are persisted in DB and queued in `auth_email_outbox` for an email sender.
- Payment defaults to sandbox gateway mode with `bank_qr` as the default gateway; connect real gateway adapters before switching to `PAYMENT_MODE=production`.

## API Integration Notes

- Frontend chỉ lưu `accessToken`/`refreshToken` và UI preference trong localStorage.
- Dữ liệu nghiệp vụ chính đi qua `lib/api/*` và backend `/api/v1`.
- Backend là nguồn sự thật cho role, ownership, trạng thái, payment, payout, notification và audit.
