# Báo cáo audit website Gia Sư Sư Phạm

Ngày audit: 2026-05-30  
Phạm vi kiểm tra: source frontend `H:\website-clone`, backend `H:\backend`, runtime local `http://127.0.0.1:3000`.  
Giới hạn kiểm tra: chưa có URL production và tài khoản test thật; backend local `http://localhost:8080/api/v1/health` không truy cập được vì Docker/PostgreSQL/backend chưa chạy. Các kết luận E2E được đánh dấu theo mức "qua source" hoặc "chưa xác minh runtime".

## 0. Tóm tắt điều hành

| Hạng mục | Kết quả |
|---|---|
| Mức hiện tại | MVP/Closed Beta về source, chưa production-ready vì backend/runtime chưa ổn định |
| Frontend | Rất rộng: 109 `page.tsx`, UI đầy đủ, Tailwind/shadcn/Radix, RHF/Zod |
| Backend | Có thật: Spring Boot, 15 controller, 14 migrations, auth/JWT/refresh, RBAC, payment, verification, admin ops |
| Điểm mạnh | Phủ module marketplace rất rộng: tutor, student/parent, admin, booking, class/session, payment/payout, audit |
| Điểm yếu nguy hiểm | Không test được E2E do backend local down; production URL/env chưa xác nhận; nhiều route có UI nhưng phụ thuộc API |
| Rủi ro bảo mật còn lại | Token browser storage ở demo; Swagger permitAll; cần HttpOnly cookie/CSRF, monitoring, production gateway thật |
| Ưu tiên ngay | Bật backend + seed + test E2E core workflows; fix production base URL; harden auth/session/cookie |

## Phần 1 - Quét toàn bộ website

### 1.1 Inventory kỹ thuật

| Nhóm | Số lượng | Ghi chú |
|---|---:|---|
| App Router pages | 109 | `app/**/page.tsx` |
| Layouts | 4 | root, admin, dashboard student/parent/tutor |
| API modules FE | 21 | `lib/api/*.ts` |
| Service modules FE | 28 | `lib/services/*.ts` |
| Backend controllers | 15 | Auth, Platform, Payment, Verification, Parent, Tutor, Admin Ops... |
| DB migrations | 14 | Schema, payment, security hardening, marketplace upgrade, payout ledger |

### 1.2 Bảng route hiện có

| Nhóm trang | URL/Route | Mô tả | Trạng thái | Ghi chú |
|---|---|---|---|---|
| Public | `/` | Trang chủ, hero, stats, tutor/request links | Đã hoạt động UI | Runtime local 200; API stats phụ thuộc backend |
| Public | `/login` | Đăng nhập | Đã hoạt động UI | Runtime local 200; submit cần backend |
| Public | `/register` | Đăng ký theo role | Đã hoạt động UI | RHF/Zod; submit cần backend |
| Public | `/forgot-password`, `/reset-password`, `/verify-email` | Auth recovery/email | Có UI + logic API | Cần backend/email outbox |
| Public | `/tutors`, `/tutors/[id]`, `/tutors/[id]/booking` | List/detail/booking gia sư | Có UI + API | List public, detail/booking cần dữ liệu backend |
| Public | `/register-student`, `/register-tutor` | Form đăng ký học/làm gia sư | Có UI + validation | Submit cần backend; tutor register cần user/tutor role |
| Public | `/learning-requests` | Feed lớp cần gia sư | Có UI + API | Public feed đã tách PII qua backend |
| Public | `/contact`, `/how-it-works` | Liên hệ/quy trình | Đã hoạt động UI | Contact submit cần backend |
| Public payment | `/payments`, `/payments/success`, `/payments/failed`, `/payments/pending`, `/payments/history` | Payment status/history | Có UI | Cần login/API |
| Shared dashboard | `/dashboard`, `/profile`, `/settings`, `/notifications` | Dashboard chung, profile, settings, notifications | Cần đăng nhập | Client guard; backend protected |
| Shared dashboard | `/dashboard/bookings`, `/dashboard/classes`, `/dashboard/classes/[id]`, `/dashboard/messages`, `/dashboard/payments`, `/dashboard/requests`, `/dashboard/schedule`, `/dashboard/favorites` | User dashboard module | Có UI + API | Một số màn trùng với student/parent/tutor |
| Student | `/dashboard/student`, `/dashboard/student/bookings`, `/dashboard/student/classes`, `/dashboard/student/classes/[id]`, `/dashboard/student/favorites`, `/dashboard/student/messages`, `/dashboard/student/notifications`, `/dashboard/student/payments`, `/dashboard/student/profile`, `/dashboard/student/requests`, `/dashboard/student/schedule`, `/dashboard/student/settings`, `/dashboard/student/verification` | Khu vực học sinh | Có UI + API | Cần tài khoản student để verify E2E |
| Parent | `/dashboard/parent`, `/dashboard/parent/payments`, `/dashboard/parent/proposals`, `/dashboard/parent/schedule`, `/dashboard/parent/students` | Khu vực phụ huynh | Có UI + API | Parent service có ownership backend |
| Tutor dashboard | `/dashboard/tutor`, `/dashboard/tutor/bookings`, `/dashboard/tutor/classes`, `/dashboard/tutor/classes/[id]`, `/dashboard/tutor/earnings`, `/dashboard/tutor/messages`, `/dashboard/tutor/notifications`, `/dashboard/tutor/profile`, `/dashboard/tutor/requests`, `/dashboard/tutor/reviews`, `/dashboard/tutor/schedule`, `/dashboard/tutor/settings`, `/dashboard/tutor/students`, `/dashboard/tutor/verification` | Khu vực gia sư chuẩn | Có UI + API | Cần tutor role; verification/earnings phụ thuộc backend |
| Tutor legacy/alias | `/tutor/dashboard`, `/tutor/bookings`, `/tutor/classes`, `/tutor/classes/[id]`, `/tutor/earnings`, `/tutor/messages`, `/tutor/notifications`, `/tutor/onboarding`, `/tutor/profile`, `/tutor/requests`, `/tutor/reviews`, `/tutor/schedule`, `/tutor/settings`, `/tutor/students` | Route tutor song song | Có UI nhưng phân mảnh | Nên chuẩn hóa redirect về `/dashboard/tutor/*` |
| Classes public/shared | `/classes`, `/classes/[id]`, `/classes/[id]/sessions` | Lớp học/buổi học | Cần đăng nhập | Cần kiểm tra ownership runtime |
| Admin core | `/admin`, `/admin/operations`, `/admin/reports`, `/admin/settings`, `/admin/audit-logs` | Tổng quan/vận hành/báo cáo/cấu hình/audit | Có UI + API | Admin layout client guard; backend RBAC |
| Admin tutor | `/admin/tutors`, `/admin/tutors/[id]`, `/admin/tutor-approvals`, `/admin/verifications` | Quản lý/duyệt/xác minh tutor | Có UI + API | Đã có eligibility gate backend |
| Admin request | `/admin/requests`, `/admin/requests/[id]`, `/admin/learning-requests` | Learning requests + matching | Có UI + API | Có matching tutors endpoint |
| Admin booking/class | `/admin/bookings`, `/admin/bookings/[id]`, `/admin/classes`, `/admin/classes/[id]`, `/admin/sessions` | Booking/class/session operations | Có UI + API | Cần test E2E |
| Admin finance | `/admin/payments`, `/admin/payouts` | Payment/payout | Có UI + API | Backend có transactions/webhook/ledger |
| Admin user/support | `/admin/students`, `/admin/parents`, `/admin/messages`, `/admin/notifications`, `/admin/contacts`, `/admin/complaints`, `/admin/reviews` | User/support/review/dispute | Có UI + API | Complaints/disputes cần kiểm chứng dữ liệu |

### 1.3 Điều hướng

| Hạng mục | Hiện trạng | Vấn đề |
|---|---|---|
| Header public | Có nav desktop/mobile: home, tutors, register-student, register-tutor, how-it-works, contact | Tốt |
| Footer | Có link services/support/contact | Facebook placeholder `https://facebook.com`; thiếu điều khoản/chính sách |
| Admin sidebar | Rộng, đủ module | Không có breadcrumb; nhiều module cần role granular trong UI |
| Dashboard role layout | Có layout riêng cho student/parent/tutor | Tồn tại route alias `/tutor/*` gây trùng luồng |
| Route guard | Client guard trong layout; backend guard qua SecurityConfig/RBAC | SSR trả 200 cho protected page rồi client redirect; chấp nhận với SPA nhưng SEO/log không rõ |

## Phần 2 - Chức năng hiện có

| Module | Chức năng | Đã có UI | Đã có logic | Đã gọi API | Có lỗi | Ghi chú |
|---|---|---:|---:|---:|---|---|
| Auth | Register/login/logout/me | Có | Có | Có | Backend down runtime | JWT + refresh token backend |
| Auth | Forgot/reset/verify email | Có | Có | Có | Email sender chưa production | Token persisted + outbox |
| Auth | Refresh token | Không UI | Có | Có | FE còn browser storage | Backend rotate/reuse detection |
| User/Profile | Xem/sửa profile | Có | Có | Có | Chưa test runtime | `/users/me`, `/users/me/profile` |
| Tutor | Profile/update/submit | Có | Có | Có | Cần E2E | `/tutor/profile`, submit |
| Tutor | Upload document | Có | Có | Có | Cần upload runtime | Private file backend |
| Tutor | Verification + agreement | Có | Có | Có | PDF cam kết chưa thấy endpoint rõ | Có hash/IP/user-agent/agreement rows |
| Tutor | Leads/proposals | Có | Có | Có | Cần data | TutorProposalController |
| Tutor | Bookings/classes/sessions | Có | Có | Có | Cần E2E | Accept/reject/complete |
| Tutor | Earnings/payout | Có | Có | Có | Cần E2E | Ledger/payout item locks |
| Student/Parent | Tạo learning request | Có | Có | Có | Backend down runtime | Public + authenticated paths |
| Student/Parent | Tutor search/filter/favorite | Có | Có | Có | Favorite cần login | Public tutors + favorite API |
| Student/Parent | Booking | Có | Có | Có | Cần E2E | BookingWorkflowService |
| Student/Parent | Classes/session/review | Có | Có | Có | Cần completed session | Review locked to completed session |
| Student/Parent | Payment | Có | Có | Có | Cần payment data | Status/checkout/receipt |
| Admin | Dashboard/report | Có | Có | Có | Cần admin login | Reports + operations |
| Admin | Tutor approve/reject/update/suspend | Có | Có | Có | Cần admin login | Eligibility blocks approve |
| Admin | Matching | Có | Có | Có | Cần data | Matching tutors endpoint |
| Admin | Booking schedule/complete/convert | Có | Có | Có | Cần E2E | Workflow service |
| Admin | Payment mark paid/refund | Có | Có | Có | Cần gateway simulation | Audit + amount checks |
| Admin | Payout approve/reject | Có | Có | Có | Cần payout data | Audit + payout_earning_items |
| Admin | Verification review | Có | Có | Có | Cần files | Private files through `/api/v1/files` |
| System | Notification/message | Có | Có | Có | Cần E2E | Ownership checks in backend |
| System | File upload | Có | Có | Có | Upload runtime chưa test | Private visibility supported |
| System | Search/filter | Có nhiều màn | Có | Có | Pagination chưa đồng đều | Public tutors page rich filters |
| System | Export | Không rõ | Chưa thấy | Chưa thấy | Thiếu | Cần thêm CSV/XLSX cho admin reports |

## Phần 3 - Phân tích theo role

| Role | Chức năng đã có | Chức năng thiếu | Lỗi/rủi ro | Nâng cấp đề xuất |
|---|---|---|---|---|
| Guest | Home, tutors list/detail, register, contact, public learning request, register-student/tutor UI | Terms/privacy, public FAQ sâu, live support | Submit không test được khi backend down | Thêm demo mode/seed backend stable, legal pages |
| Student | Dashboard, requests, favorites, booking, classes, payments, messages, verification, review | Hoàn thiện assignment/material/progress sâu | Cần E2E role + ownership | Test full journey request -> booking -> class -> review |
| Parent | Manage students, proposals, schedule, payments | Multi-child UX còn cần polish; guardianship flows cần test | Parent/student ownership phức tạp | Parent command center + child switcher tốt hơn |
| Tutor | Profile, verification, leads/proposals, booking, classes, earnings/payout, reviews | Onboarding checklist rõ ràng; PDF commitment xem/tải | Route trùng `/tutor/*` và `/dashboard/tutor/*` | Chuẩn hóa một dashboard, onboarding state machine |
| Admin | Users, tutors, requests, matching, bookings, classes, sessions, payments, payouts, verifications, reports, audit, operations | Export, bulk actions, granular UI by admin role | Admin có nhiều action nguy hiểm thiếu confirm đồng đều | Today Action Queue + confirm dialog + audit detail |

## Phần 4 - Kiểm tra luồng nghiệp vụ chính

| Luồng | Bước | Kết quả hiện tại | Lỗi | Thiếu | Đề xuất nâng cấp |
|---|---|---|---|---|---|
| Guest/User tạo nhu cầu học | Form public `/register-student`, `/learning-requests` | UI + Zod + API | Chưa submit runtime do backend down | Test admin thấy request | Bật seed + E2E test request create |
| Tutor đăng ký/submit | Register + profile + verification | UI/API có | Cần login tutor/backend | Onboarding checklist thống nhất | Gộp register-tutor với onboarding protected |
| Admin duyệt tutor | Pending list, eligibility, approve/reject/update | Backend có check giấy tờ/cam kết | Cần admin login/files | PDF commitment hiển thị rõ | Admin approval detail page với checklist + file preview |
| Matching | Admin request, matching tutors, score | API endpoint có | Chưa test data | Lý do matching cần hiển thị nhất quán | Match score + explanation + SLA badge |
| Booking học thử | Create, accept/reject, schedule, no-show | API có | Chưa test E2E | Confirm dialog/notification | State machine + timeline booking |
| Convert booking thành class | Admin convert endpoint | API có | Chưa test E2E | Conflict schedule đầy đủ | Check overlap tutor/student, log reschedule |
| Session/review | Session complete/cancel/absent/review | API có | Chưa test E2E | Student absence UX | Review only after completed session already enforced |
| Payment/payout | Checkout, webhook, mark paid/refund, earning, payout | Backend khá mạnh | Cần gateway simulation test | Provider thật | Payment reconciliation test suite |
| Verification/cam kết | Upload/sign/submit/admin review | API có hash/IP/user-agent | PDF endpoint chưa rõ | PDF private file | Sinh PDF signed commitment + admin preview |

## Phần 5 - UI/UX

| Màn hình | Vấn đề UI/UX | Mức độ | Cách nâng cấp |
|---|---|---|---|
| Toàn site | UI sạch, đồng nhất, nhiều empty/loading/error state | Tốt | Giữ design system, giảm route trùng |
| Public home/tutors | Tốt, filter tutor giàu tính năng | Trung bình | Khi backend down nên có demo fallback hoặc thông báo rõ API |
| Forms | Dễ dùng, validate rõ | Tốt | Thêm chống double submit đồng đều |
| Admin | Sidebar đủ module | Trung bình | Thêm breadcrumb, role-based menu, action queue ưu tiên |
| Admin tables | Nhiều màn dùng list/card; pagination chưa đồng đều | Trung bình | Chuẩn hóa table/search/filter/pagination |
| Dangerous actions | Duyệt, khóa, refund, payout có nơi thiếu confirm | Cao | AlertDialog confirm + reason bắt buộc |
| Mobile | Header mobile có menu; dashboard mobile cần test thực tế | Trung bình | QA responsive từng breakpoint |
| Errors | Đã có ErrorState ở nhiều màn; vừa thêm `app/error.tsx` | Tốt hơn | Thêm retry + request id từ backend |

## Phần 6 - Form và validation

| Form | Field | Validate hiện tại | Lỗi | Cần nâng cấp |
|---|---|---|---|---|
| Login | email/password | Zod email, password min 8 | Backend down chưa submit | Rate limit UX, lockout message |
| Register | fullName/email/phone/password/role | Zod + backend validation | Password chỉ min length | Strength meter, confirm password |
| Forgot/reset | email/token/password | API + basic checks | Email sender chưa thật | Expired token UI rõ hơn |
| Learning request | student/phone/email/grade/subject/mode | Zod + backend public validation | Runtime chưa test | SLA/status after submit |
| Tutor profile | profile/academic/teaching | Zod khá đầy đủ | Upload file tách riêng | Draft autosave, submit checklist |
| Booking | student/contact/subject/grade/time | Zod | Runtime chưa test | Availability picker thật |
| Verification upload | file/document/agreement | Backend multipart + duplicate | FE file type/size cần rõ hơn | MIME/size client validation + progress |
| Payment | checkout gateway | Backend controls amount | Runtime chưa test | Gateway status polling/timeout |
| Settings/admin actions | settings/status/reason | Một số form thủ công | Confirm/reason chưa đồng đều | Chuẩn hóa mutation form + audit reason |

## Phần 7 - Bảo mật cơ bản

| Hạng mục bảo mật | Hiện trạng | Rủi ro | Mức độ | Cách sửa |
|---|---|---|---|---|
| Admin route | FE guard + backend `/api/v1/admin/**` RBAC | SSR page 200 rồi redirect client | Trung bình | Middleware server-side redirect optional |
| Ownership | Backend kiểm tra nhiều service: booking/payment/message/file/request | Cần test IDOR tự động | Cao | Integration test User A/B mỗi resource |
| Tutor booking | Backend check tutorId current user | Cần E2E | Cao | Test tutor khác 403 |
| Student payment | `FinanceService` kiểm tra user/admin | Cần E2E | Cao | Test payment other user 403 |
| Private file | `/uploads` không public; `/api/v1/files/{id}` policy | GET files permitAll nhưng policy xử lý | Cao | Presigned/private storage + audit |
| Token storage | FE demo dùng localStorage; có memory mode | XSS lấy token | Cao | HttpOnly Secure SameSite cookie + CSRF |
| Logout/refresh | Backend revoke/rotate refresh token | FE cần cookie migration | Trung bình | Cookie refresh endpoint |
| Role/status update | Backend admin endpoints | Cần kiểm tra body mass assignment | Cao | DTO whitelist + tests |
| Rate limit | In-memory auth/public/upload | Không scale multi-instance | Trung bình | Redis rate limiter |
| Audit log | Rất nhiều admin/sensitive actions có audit | Action enum chưa chuẩn tuyệt đối | Trung bình | Chuẩn hóa action enum + request id |
| Payment amount | Backend checks payment amount/currency/order id | Provider mô phỏng | Cao | Gateway thật + signature secret env |
| Webhook | Verify signature/idempotency tables | Simulated adapters | Cao | Real VNPay/MoMo/PayOS/Stripe adapters |
| Swagger | PermitAll hiện tại | Lộ API docs production | Trung bình | Tắt/guard Swagger production |

## Phần 8 - API và data flow

| API | Method | Mục đích | Auth | Permission | Vấn đề | Đề xuất |
|---|---|---|---|---|---|---|
| `/auth/*` | POST/GET | login/register/me/refresh/logout | Mixed | User | FE token storage chưa ideal | Cookie + CSRF |
| `/tutors`, `/tutors/{id}` | GET | Public tutor search/detail | Public | Public | Cần pagination/filter ổn định | Server pagination + cache |
| `/tutor/profile/*` | GET/PATCH/POST | Tutor profile/submit | Tutor | Owner | Cần onboarding UX | State machine |
| `/tutor/verifications/*` | POST/GET | Upload/sign/submit docs | Tutor | Owner | PDF commitment chưa rõ | PDF private file |
| `/student/learning-requests`, `/public/learning-requests` | GET/POST | Request học | Auth/Public | Owner/Public | Public PII cần luôn strip | E2E + anti-spam |
| `/admin/learning-requests/*` | GET/PATCH/POST | Admin manage/match | Admin | RBAC | Status update cần action endpoint | Giữ action endpoints + audit reason |
| `/bookings`, `/tutor/bookings`, `/admin/bookings` | GET/POST | Booking workflow | Auth | Owner/Admin | Many statuses | Central status transition tests |
| `/classes`, `/sessions`, `/admin/classes` | GET/POST/PATCH | Class/session | Auth | Owner/Admin | Conflict checks chưa đầy đủ | Overlap checks tutor+student |
| `/reviews`, `/admin/reviews` | GET/POST | Review | Auth/Public | Owner/Admin | Report flow còn nhẹ | Report/moderation workflow |
| `/payments/*` | GET/POST | Checkout/status/invoice | Auth | Owner/Admin | Runtime chưa test | Reconciliation dashboard |
| `/payments/webhooks/{gateway}` | POST | Gateway webhook | Public endpoint | Signature | Provider mô phỏng | Real gateway adapter |
| `/tutor/payouts`, `/admin/payouts` | GET/POST | Payout | Auth/Admin | Owner/RBAC | Runtime chưa test | Ledger tests |
| `/notifications`, `/conversations` | GET/POST/PATCH | Notification/message | Auth | Owner | Websocket/realtime chưa thấy | Realtime optional |
| `/admin/operations/*` | GET | Ops queues | Admin | operations.read | Có queue cơ bản | Today action priority scoring |
| `/uploads`, `/files/{id}` | POST/GET | Private/public files | Auth/Public policy | Owner/Admin | Local storage | S3/MinIO private + AV scan |

## Phần 9 - Admin dashboard

| Admin module | Hiện có | Thiếu | Rủi ro vận hành | Nâng cấp |
|---|---|---|---|---|
| Overview | Stats/reports API | Today priority sorting | Admin không biết việc đầu tiên | Today Action Queue |
| Matching Queue | Có `/operations/matching-queue` | SLA scoring rõ | Request quá SLA bị chìm | SLA badge + assignment priority |
| Booking Risk | Có booking-risk | Risk reason rõ | No-show/cancel không nổi bật | Risk tags + owner assignee |
| Verification Queue | Có verification-risk | PDF commitment preview | Duyệt thiếu giấy tờ nếu UI bypass | Checklist + hard block |
| Payment Reconciliation | Có payment queue/transactions/webhooks | Aging/pending lâu | Payment pending lâu không alert | Aging buckets + alert |
| Payout Queue | Có payout queue | Bank validation | Payout sai/trùng | Approval workflow + dual control |
| Tutor Quality | Có low quality queue | Quality score trend | Tutor thấp chất lượng không xử lý | Tutor scorecard |
| Reports | Revenue/funnel/distribution | Export/scheduled report | Khó báo cáo khách hàng | CSV/XLSX/PDF export |
| Audit | Có audit logs | Filter/search/detail IP/request id | Điều tra chậm | Structured audit viewer |

## Phần 10 - Tổng hợp website đang có gì

| Nhóm | Đã hoàn thiện | Đang dở | Chưa có | Ưu tiên |
|---|---|---|---|---|
| Frontend public | Home, auth UI, tutor list/detail, register forms | API error/demo data | Legal pages | P1 |
| Dashboard user | Student/parent/tutor dashboards | Route trùng, E2E chưa test | Realtime | P1 |
| Admin | Rất nhiều module + ops queues | Confirm/pagination/export | Full today queue | P1 |
| Backend auth/security | JWT/refresh/RBAC/rate limit/audit | Cookie/CSRF/Swagger prod | Redis limiter | P0/P2 |
| Marketplace workflow | Request/matching/booking/class/session/review | Need E2E hardening | Some conflict logs | P0/P1 |
| Verification | Upload/sign/admin review/eligibility | PDF private commitment | OCR/liveness thật | P1/P2 |
| Payment/payout | Transactions/webhooks/ledger/payout items | Real gateway | Dual approval | P1/P2 |
| Monitoring | Basic health only | Request ID/log JSON/Sentry | Alerts | P0/P2 |

## Phần 11 - Roadmap nâng cấp

### Giai đoạn 1 - Sửa lỗi nghiêm trọng

| Task | Mức ưu tiên | File/khu vực ảnh hưởng | Output mong muốn | Cách test |
|---|---|---|---|---|
| Bật backend + Postgres + health | P0 | `H:\backend`, Docker/Postgres/env | `/api/v1/health` UP | curl health |
| Fix production API base URL | P0 | Vercel/env, `.env.local` | FE gọi backend thật, không localhost | Network tab |
| Seed demo data | P0 | `DataSeeder`, `SEED_DATA_ENABLED` | Có admin/tutor/student/request/booking/payment | Login demo |
| Session không logout khi API down | P0 | `lib/api/client.ts`, auth context | Token chỉ clear khi 401 | Tắt backend sau login |
| Error/loading/empty state core screens | P0 | dashboards/admin pages | Không blank page | Manual QA |

### Giai đoạn 2 - Làm chắc workflow

| Task | Mức ưu tiên | File/khu vực ảnh hưởng | Output mong muốn | Cách test |
|---|---|---|---|---|
| Tutor onboarding checklist | P1 | tutor pages/services | Biết thiếu gì trước submit | Tutor E2E |
| Verification + commitment PDF | P1 | VerificationController, admin UI | PDF private, hash, IP, UA | Admin preview |
| Learning request SLA | P1 | requests/admin ops | SLA/priority rõ | Create request |
| Matching explanation | P1 | matching service/UI | Score + lý do | Assign tutor |
| Booking/class/session state machine | P1 | booking/class services | Không đi sai trạng thái | State tests |

### Giai đoạn 3 - Payment/payout

| Task | Mức ưu tiên | File/khu vực ảnh hưởng | Output mong muốn | Cách test |
|---|---|---|---|---|
| Gateway thật | P1 | payment gateway adapters | Signature thật | Webhook test |
| Payment reconciliation | P1 | admin payments | Pending lâu nổi bật | Aging queue |
| Refund ledger correctness | P1 | PaymentService, ledger | Earning giảm đúng | Unit/integration |
| Payout dual control | P2 | FinanceService/admin | Approve an toàn | Payout E2E |

### Giai đoạn 4 - Admin operations

| Task | Mức ưu tiên | File/khu vực ảnh hưởng | Output mong muốn | Cách test |
|---|---|---|---|---|
| Today Action Queue | P1 | AdminOperationService/UI | Admin biết làm gì trước | Seed queue |
| Booking Risk Queue | P1 | ops service | Risk reason + deadline | No-show/cancel data |
| Verification Queue | P1 | ops + verification | Pending/duplicate/high risk | Upload duplicate |
| Tutor Quality Queue | P2 | reports/ops | Low quality trend | Low reviews |

### Giai đoạn 5 - Production-ready

| Task | Mức ưu tiên | File/khu vực ảnh hưởng | Output mong muốn | Cách test |
|---|---|---|---|---|
| Sentry FE/BE | P0 | Next/Spring Boot | Error tracking | Throw test error |
| Structured JSON logs + request id | P0 | backend filter/logging | Trace được request | Log inspection |
| CI/CD | P1 | GitHub Actions | test/build tự động | PR checks |
| Backup/restore | P1 | Postgres infra | Restore drill | Backup test |
| Security hardening | P1 | auth/cors/swagger/csp | Cookie/CSRF/Swagger guarded | Security tests |
| Performance | P2 | API pagination/cache | Fast admin lists | Load test |

## Phần 12 - Kết luận Senior

| Câu hỏi | Kết luận |
|---|---|
| Website đang ở mức nào? | Source ở mức MVP/Closed Beta; runtime hiện chưa production-ready vì backend chưa chạy/test E2E |
| Điểm mạnh nhất | Coverage module rất rộng, backend đã có nhiều hardening thật hơn một prototype |
| Điểm yếu nguy hiểm nhất | Không có môi trường backend ổn định để kiểm thử luồng thật; session/payment/verification đều phụ thuộc điều này |
| 5 thứ cần sửa đầu tiên | Backend health/env, seed demo, session/cookie, E2E workflow request->booking->class->payment, admin operation priority |
| Muốn demo khách hàng | Cần backend stable + seed + tài khoản admin/tutor/student + checklist demo scripted |
| Muốn chạy thật | Paid backend hosting, DB managed, gateway thật, monitoring, backup, legal/privacy, support process |
| Muốn uy tín | Verification PDF, private file, audit visible, tutor quality score, payment reconciliation minh bạch |
| Muốn scale | Tách queue/background jobs, Redis rate limit/cache, object storage, CI/CD, observability, pagination/indexing |

## Phụ lục - Kiểm tra runtime đã thực hiện

| URL local | Kết quả |
|---|---|
| `/` | 200 OK |
| `/login` | 200 OK |
| `/register` | 200 OK |
| `/forgot-password` | 200 OK |
| `/tutors` | 200 OK |
| `/register-student` | 200 OK |
| `/register-tutor` | 200 OK |
| `/learning-requests` | 200 OK |
| `/contact` | 200 OK |
| `/how-it-works` | 200 OK |
| `/admin` | 200 OK SSR shell, client cần auth để vào |
| `/dashboard*` | 200 OK SSR shell, client cần auth |
| Backend `/api/v1/health` | Không kết nối được |

## Cập nhật Phase 1 - Stabilize runtime/session/demo

Ngày cập nhật: 2026-05-30

| Nhóm | Đã làm | File/khu vực | Cách test | Rủi ro còn lại |
|---|---|---|---|---|
| Frontend env/API | Thêm `.env.example`, timeout, cảnh báo thiếu API base URL, `credentials: include`, refresh token single-flight | `.env.example`, `lib/api/client.ts` | `npm run lint`, `npx tsc --noEmit` | Production vẫn cần backend cookie HttpOnly hoàn chỉnh |
| Session/error | Không clear session khi network/5xx, chỉ hết phiên khi 401 hợp lệ; emit toast lỗi API | `lib/services/auth-service.ts`, `lib/contexts/auth-context.tsx` | Tắt backend rồi gọi API phải hiện toast, không blank page | Cần E2E sau khi backend chạy |
| Error boundary | Thêm global app error boundary | `app/error.tsx` | Runtime crash test | Cần bổ sung request id hiển thị đồng đều |
| Admin tutors | Thêm loading/error/empty state quanh màn quản lý tutor | `app/admin/tutors/page.tsx` | Mở `/admin/tutors` khi API down | Cần áp dụng mẫu này cho toàn bộ admin pages |
| Route trùng | Redirect tập trung legacy `/tutor/*` sang `/dashboard/tutor/*`, không ảnh hưởng `/tutors` | `proxy.ts` | Mở `/tutor/profile` phải 301 sang `/dashboard/tutor/profile` | Các file legacy vẫn còn nhưng không còn là route chính |
| Legal/trust | Thêm 7 trang pháp lý và link footer | `app/terms`, `app/privacy`, `app/refund-policy`, `app/tutor-agreement`, `app/student-parent-policy`, `app/complaint-policy`, `app/safety`, `components/layout/footer.tsx` | Mở từng route public | Nội dung là bản vận hành ban đầu, cần legal review trước production |
| Frontend headers | Thêm security headers cơ bản | `next.config.mjs` | `npm run build`/response headers | Chưa thêm CSP nghiêm ngặt vì cần QA asset/script trước |
| Docker CORS/seed | Sửa env CORS đúng key backend đọc, bật seed demo local qua env | `docker-compose.yml` | `docker compose up --build` khi Docker chạy | Chưa verify runtime vì Docker Desktop/Postgres chưa chạy |
| Backend env | Thêm `.env.example` backend | `H:\backend\.env.example` | Đối chiếu `application.yml` | Không dùng secret mẫu cho production |
| Backend seed | Mở rộng seed: 20 student/parent tổng, 30 requests, verification docs/agreements/commitments, complaint/dispute samples | `H:\backend\src\main\java\com\example\tutorplatform\seed\DataSeeder.java` | `.\mvnw.cmd -DskipTests package`, `.\mvnw.cmd test` | Seeder chỉ chạy khi DB trống và `SEED_DATA_ENABLED=true` |
| Backend Swagger | Swagger chỉ public ở local/dev; production cần admin/system admin | `H:\backend\src\main\java\com\example\tutorplatform\config\SecurityConfig.java` | Backend test/build pass | Cần runtime test với `APP_ENV=production` |

Validation đã chạy:

| Command | Kết quả |
|---|---|
| `npm run lint` | Pass |
| `npx tsc --noEmit` | Pass |
| `NEXT_DIST_DIR=.next-codex-phase1c npm run build` | Fail do Windows EPERM khi rename `server-reference-manifest.json`, sau bước compile start; không phát hiện lỗi TypeScript |
| `H:\backend\.\mvnw.cmd -DskipTests package` | Pass |
| `H:\backend\.\mvnw.cmd test` | Build success, 10 tests chạy pass, 16 integration tests skip do Docker/Testcontainers chưa có Docker runtime |
