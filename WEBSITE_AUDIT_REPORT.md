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

## Cập nhật hotfix - Admin report 500

Ngày cập nhật: 2026-05-30

Lỗi production thấy trên console:

| Endpoint | Lỗi | Nguyên nhân khả dĩ | Hotfix |
|---|---|---|---|
| `/api/v1/admin/reports/request-trends` | 500 Internal Server Error | Report mapper dùng `Map.of(...)`; nếu DB production có dữ liệu cũ/null hoặc query report lỗi phụ thì backend ném exception và làm admin dashboard fail | Backend report service dùng query null-safe, `safeReport(...)` log warning và trả dataset rỗng thay vì 500 |

File đã sửa:

| File | Sửa gì | Vì sao |
|---|---|---|
| `H:\backend\src\main\java\com\example\tutorplatform\admin\AdminReportService.java` | Null-safe mapper, `coalesce(...)`, `safeReport(...)`, logging warning | Không để widget báo cáo phụ làm endpoint admin 500 |
| `lib/api/admin-api.ts` | Đổi report fetch từ `Promise.all` sang `Promise.allSettled` | Một report API lỗi không làm toàn bộ dashboard/admin reports sập |

Validation hotfix:

| Command | Kết quả |
|---|---|
| `npm run lint` | Pass |
| `H:\backend\.\mvnw.cmd -DskipTests package` | Pass |
| `npx tsc --noEmit` | Pass |

## Cập nhật chuyên sâu - Nghiệp vụ admin dưới góc BE + DEV

Ngày cập nhật: 2026-05-30  
Phạm vi soi kỹ: `app/admin/**`, `lib/hooks/use-admin.ts`, `lib/hooks/use-learning-requests.ts`, `lib/services/**`, `lib/api/**`, backend `SecurityConfig`, `AdminPermissionInterceptor`, `PermissionService`, `StatusTransitionPolicy`, `LearningRequestService`, `BookingWorkflowService`, `TrialBookingService`, `ClassSessionService`, `PaymentService`, `VerificationController`, `AdminOperationService`.

### Nguyên tắc phân vai

| Vai | Trách nhiệm đúng | Không được để vai này làm |
|---|---|---|
| Backend | Source of truth cho RBAC, ownership, status transition, transaction, audit log, notification, ledger, file private policy | Không phụ thuộc vào disabled button hoặc filter FE để bảo vệ dữ liệu |
| Frontend admin | Hiển thị queue, gợi ý thao tác, validate nhập liệu cơ bản, confirm action nguy hiểm, refresh/error state, điều hướng theo role | Không tự quyết định quyền, không tự chuyển trạng thái trái state machine, không tự tính tiền/payout để backend tin |
| Service/hook FE | Chuẩn hóa mutation, toast, optimistic/refresh, mapping API, tái sử dụng workflow | Không tạo business rule song song khác backend nếu backend đã có endpoint chuyên trách |

### Ma trận role admin đang có trên BE

| Role | Quyền BE chính | Module admin nên hiện trên FE | Ghi chú DEV |
|---|---|---|---|
| `admin`, `system_admin` | `*` | Tất cả module | Full quyền vận hành, cấu hình, audit |
| `finance_admin` | `payments.*`, `payouts.*`, `reports.read`, `operations.read` | Operations, Payments, Payouts, Reports | Không nên thấy Tutor/Request/Class action nếu API sẽ 403 |
| `tutor_admin` | Tutor, verification, learning requests, matching, bookings, classes, reports, operations | Tutors, Tutor approvals, Verifications, Requests, Bookings, Classes, Sessions, Reports, Operations | Role vận hành marketplace chính |
| `support_admin` | users read, learning request read, booking/class read, conversations read, notifications, contact requests, reviews, reports, operations | Students/Parents, Requests read-only, Bookings/Classes read-only, Messages, Notifications, Contacts, Reviews, Reports, Operations | FE cần chế độ read-only rõ, không chỉ ẩn menu |
| `verification_admin` | `verifications.*`, `files.view_verification`, reports, operations | Verifications, Reports, Operations | Không nên gọi `/admin/tutors/*/approve` nếu role chỉ xác thực giấy tờ |

Nhận xét: BE đã enforce granular RBAC bằng `AdminPermissionInterceptor`; FE `app/admin/layout.tsx` hiện chỉ check `canAccessAdmin(user)` nên các sub-role vẫn nhìn thấy toàn bộ menu và dễ bấm vào màn sẽ bị API 403. Cần bổ sung permission map FE để menu, landing page và action button khớp với BE.

### Ma trận module admin

| Màn admin | FE/hook/service | API chính | Rule BE bắt buộc | Gap DEV còn lại |
|---|---|---|---|---|
| `/admin` | `useAdminDashboard()` gom stats, reports, tutors, requests, sessions, classes, bookings, reviews | `/admin/reports/*`, `/admin/tutors`, `/admin/learning-requests`, `/admin/bookings`, `/admin/classes`, `/admin/reviews` | Admin role + permissions từng endpoint | Dashboard tổng sẽ lỗi với sub-role thiếu quyền; nên tách dashboard theo role hoặc dùng `allSettled`/permission-aware widgets |
| `/admin/operations` | `useAdminOperations()` | `/admin/operations/*`, `/admin/disputes` | `operations.read` | Tốt về đọc queue; thiếu action owner, SLA deadline, priority score thống nhất |
| `/admin/tutors` | `useAllTutors`, `useTutorApprovalEligibilityMap`, `useTutorApprovalActions`, `adminService`, `tutorService` | `/admin/tutors`, approve/reject/request-update/suspend/reactivate, tutor-document review | Tutor phải đạt eligibility, document/commitment/risk hợp lệ, audit + notify | Action nguy hiểm chưa confirm đồng đều; sub-role permission chưa chặn ở UI |
| `/admin/tutor-approvals` | Pending tutors + eligibility panel | `/admin/tutors/*/approval-eligibility`, approve/reject/request-update | Không duyệt nếu thiếu identity/certificate/commitment hoặc duplicate/risk cao | Lý do từ chối dùng state chung cho nhiều dialog; cần per-row form state |
| `/admin/verifications` | `useAdminVerifications`, `fileApi.getFileBlob` | `/admin/verifications`, approve/reject/need-more-info, `/files/{id}` | Duplicate file không được approve; private file policy; audit + notify | Thiếu preview cam kết/PDF, thiếu checklist "đủ điều kiện duyệt tutor" ngay cạnh verification |
| `/admin/learning-requests`, `/admin/requests` | `useAdminLearningRequests`, `workflowService.assignTutorToRequest`, `matchingService` | `/admin/learning-requests`, status, assign-tutor-with-booking, matching-tutors | Status transition policy; tutor phải approved; assign tạo booking idempotent | FE đang tính matching local thay vì dùng `/admin/learning-requests/{id}/matching-tutors`; cần dùng score/reasons từ BE để tránh lệch |
| `/admin/bookings` | `bookingService.getAllBookings`, complete/convert/cancel | `/admin/bookings/*` | Booking status policy, schedule conflict, convert idempotency | Button luôn hiện dù status không hợp lệ; thiếu schedule/reschedule form; cần confirm + reason khi hủy |
| `/admin/classes` | `useClasses`, `workflowService.resolveTrialResult` | `/admin/classes`, `/admin/sessions`, request status | Class transition trial -> active/cancelled, request transition, audit | Đã sửa FE workflow để khi học thử phù hợp thì class cũng chuyển `active`; `scheduleText` vẫn chưa có field lưu ở BE |
| `/admin/sessions` | `scheduleService.updateSessionStatus` | `/admin/sessions/{id}/complete/cancel/mark-*` | Session transition; complete tạo payment/earning theo BE | Button luôn hiện; cần disable theo status và hiển thị payment phát sinh sau complete |
| `/admin/payments` | `paymentService` | `/admin/payments`, mark-paid, mark-failed, refund, transactions, webhooks, refunds | Permission payments.*, reason bắt buộc mark-paid, amount/currency/order verify, idempotent webhook, ledger refund | UI cần reason/amount/refund modal thay vì default reason; cần dual confirmation khi refund |
| `/admin/payouts` | `payoutService` | `/admin/payouts`, approve/reject | Permission payouts.*, lock earning qua `payout_earning_items`, approve/reject ledger đúng | UI thiếu bank verification, dual control, reason bắt buộc có nội dung thật |
| `/admin/reports` | `useAdminDashboard().reports` | `/admin/reports/*` | `reports.read`; report API đã được hotfix null-safe | Thiếu export CSV/XLSX/PDF, date range, filter role/subdomain |
| `/admin/audit-logs` | `useAuditLogs` | `/admin/audit-logs` | `audit.read` | Tốt cho filter cơ bản; cần detail metadata, IP/requestId, before/after diff |
| `/admin/settings` | `settingsService` | `/admin/settings` | `settings.read/update` | UI chưa guard theo role; thay đổi nguy hiểm cần confirm và audit reason |
| `/admin/students`, `/admin/parents` | `useAdminStudents` | `/admin/users`, `/admin/student-profiles`, `/admin/parent-profiles` | `users.read/manage` | Hiện chỉ list account; thiếu detail, lock/unlock, ownership/profiles |
| `/admin/contacts` | `contactService` | `/admin/contact-requests/*` | `contact_requests.manage` | Cần assignee/SLA/call note; hiện chỉ đổi status |
| `/admin/messages` | `messageService.getConversations(user.id)` | `/conversations` hiện lấy conversation của chính admin | BE có `/admin/conversations` | Màn admin messages đang dùng endpoint user conversation, chưa phải toàn hệ thống |
| `/admin/notifications` | Re-export notification page của student | `/notifications` | User notification owner | Chưa phải console gửi/xem notification toàn hệ thống dù BE có `/admin/notifications/send` |
| `/admin/complaints` | Empty state | `/admin/disputes` ở operations | `operations.read` | Chưa nối complaint/dispute queue thành màn xử lý thật |

### State machine nghiệp vụ cần giữ đồng nhất

| Entity | Trạng thái chính | Chuyển trạng thái hợp lệ trên BE | FE cần làm gì |
|---|---|---|---|
| Tutor profile | `draft`, `submitted`, `pending`, `pending_verification`, `needs_more_documents`, `verified`, `approved`, `rejected`, `suspended`, `inactive` | `StatusTransitionPolicy.requireTutor` + eligibility service | Disable/ẩn action sai trạng thái, hiển thị checklist thiếu gì trước khi duyệt |
| Verification | `draft`, `pending_review`, `approved`, `rejected`, `need_more_info` | Duplicate/risk/agreement rules trong `VerificationController` | Bắt reason cho reject/need-more-info, mở file private bằng Authorization |
| Learning request | `new`, `consulting`, `matching`, `waiting_tutor_proposal`, `proposal_received`, `waiting_parent_confirmation`, `matched`, `trial_scheduled`, `trial_completed`, `active`, `rematch`, `converted_to_class`, `cancelled`, `completed`, `expired`, `closed` | `StatusTransitionPolicy.requireLearningRequest` | Không cho admin chọn mọi status tùy tiện; action nên là "tư vấn", "match", "gán", "rematch", "hủy" thay vì select thô |
| Trial booking | `requested`, `parent_confirmed`, `tutor_confirmed`, `pending`, `assigned`, `accepted`, `scheduled`, `completed`, `converted`, `converted_to_class`, `rejected`, `cancelled*`, `no_show*`, `expired` | `StatusTransitionPolicy.requireBooking`, conflict schedule | Button theo trạng thái; complete chỉ khi scheduled; convert chỉ khi completed |
| Class | `trial`, `active`, `paused`, `completed`, `cancelled` | Trial -> active/cancelled; active -> paused/completed/cancelled | Khi admin xác nhận học thử phù hợp, phải update cả request và class |
| Session | `scheduled`, `upcoming`, `completed`, `cancelled`, `student_absent`, `tutor_absent` | scheduled/upcoming -> completed/cancelled/absent | Complete session có hậu quả tài chính, cần confirm |
| Payment | `pending`, `processing`, `paid`, `completed`, `failed`, `expired`, `cancelled`, `refunded`, `partially_refunded` | Webhook/manual theo `PaymentService`, amount/currency/order verified | Manual paid/refund phải có reason rõ, hiển thị webhook/transaction trước khi thao tác |
| Payout | `pending`, `processing`, `approved`, `paid`, `completed`, `rejected` | Ledger lock/release qua earning items | Approve/reject cần kiểm tra bank + dual approval trước production |

### Vấn đề nghiệp vụ ưu tiên

| Ưu tiên | Vấn đề | Tác động | Hướng xử lý |
|---|---|---|---|
| P0 | Backend runtime/local chưa ổn định nên chưa E2E được admin thật | Không xác minh được luồng duyệt, match, payment, payout | Bật Docker/Postgres/backend seed và chạy kịch bản admin end-to-end |
| P0 | FE admin chưa permission-aware theo granular role BE | Sub-role thấy sai màn, dễ gặp 403 hoặc thao tác nhầm | Thêm `hasAdminPermission(role, permission)`, lọc sidebar, guard page/action |
| P1 | Admin dashboard tổng gọi nhiều endpoint ngoài quyền sub-role | Finance/verification/support admin có thể fail widget | Dashboard theo role hoặc widget fetch bằng `allSettled` + permission map |
| P1 | Matching FE tính local, BE có endpoint matching riêng | Score/reason có thể lệch dữ liệu thật DB | Dùng `/admin/learning-requests/{id}/matching-tutors` làm nguồn chính |
| P1 | Action nguy hiểm thiếu confirm/reason thống nhất | Dễ khóa tutor, refund, payout, cancel sai | Dùng `ConfirmReasonDialog` cho suspend/reject/refund/payout/cancel/no-show |
| P1 | Một số admin pages còn dùng endpoint user thường | Messages/notifications chưa đúng vai admin console | Đổi sang `/admin/conversations`, `/admin/notifications/send` và queue toàn hệ thống |
| P1 | Button admin chưa disable theo state machine | Admin bấm action sai status sẽ nhận lỗi backend | Tạo helper `allowedAdminActions(entity, status, role)` từ policy đã biết |
| P2 | Báo cáo thiếu export/date range | Vận hành khó báo cáo khách hàng/nội bộ | CSV/XLSX/PDF export + filter thời gian |
| P2 | Audit chưa có detail metadata/requestId/IP | Điều tra sự cố chậm | Audit detail drawer + before/after diff + request id |

### Fix đã thực hiện trong lượt này

| File | Sửa | Lý do |
|---|---|---|
| `lib/services/workflowService.ts` | Khi admin resolve học thử `active`, FE service cập nhật cả `learning_request` sang `active` và `class` sang `active`; nếu có `feePerSession` thì gửi kèm về backend | Trước đó màn admin classes chỉ đổi request, còn lớp học thử có thể vẫn ở trạng thái `trial` |
| `lib/helpers/status-helpers.ts` | Bổ sung nhãn/tone cho các status learning request backend đang dùng: `submitted`, `matching`, `waiting_tutor_proposal`, `proposal_received`, `waiting_parent_confirmation`, `converted_to_class`, `expired`, `closed` | Tránh admin nhìn thấy raw status và giúp UI khớp state machine BE |
| `lib/admin/admin-permissions.ts` | Thêm permission map granular cho `admin/system_admin/finance_admin/tutor_admin/support_admin/verification_admin`, module map và action permission helper | Sidebar/page/action dùng chung một nguồn quyền, không hard-code role rải rác |
| `lib/admin/admin-actions.ts` | Thêm helper `getAdminActionAvailability`/`allowedAdminActions` theo permission + state machine cho tutor, verification, request, booking, class, session, payment, payout | Button sai quyền/sai trạng thái bị disable kèm lý do trước khi gọi backend |
| `app/admin/layout.tsx` | Sidebar lọc theo permission, hiện badge `Chỉ xem`, direct route thiếu quyền render 403 đẹp trước khi mount page | Sub-role không thấy module ngoài quyền và không gọi API ngoài quyền khi nhập URL trực tiếp |
| `components/admin/admin-permission-guard.tsx`, `components/admin/admin-action-button.tsx`, `components/admin/ConfirmReasonDialog.tsx` | Thêm page guard, action button có tooltip lý do, dialog confirm/reason/typed confirmation dùng chung | Chuẩn hóa UX cho 403 và action nguy hiểm |
| `lib/hooks/use-admin.ts`, `app/admin/page.tsx` | Dashboard permission-aware, fetch widget theo quyền và dùng `Promise.allSettled` | Finance/verification/support admin không bị sập dashboard vì endpoint ngoài quyền |
| `app/admin/tutors/page.tsx`, `app/admin/tutor-approvals/page.tsx`, `app/admin/verifications/page.tsx` | Gắn action guard, eligibility/duplicate check và per-row confirm reason | Không approve/reject/request-update lẫn state giữa rows, verification duplicate không duyệt được |
| `app/admin/learning-requests/page.tsx`, `lib/services/learning-request-service.ts` | Matching dùng `/admin/learning-requests/{id}/matching-tutors`, hiển thị score/reasons backend | Tránh lệch score local và giữ assign tutor qua workflow idempotent backend |
| `app/admin/bookings/page.tsx`, `app/admin/classes/page.tsx`, `app/admin/sessions/page.tsx` | Booking/session/class actions disable theo state machine và confirm reason cho complete/cancel/no-show | Giảm thao tác sai trạng thái; complete session có cảnh báo hậu quả tài chính |
| `app/admin/payments/page.tsx`, `app/admin/payouts/page.tsx`, `lib/api/payment-api.ts`, `lib/services/payment-service.ts`, `lib/services/payout-service.ts` | Manual paid/refund/payout approve/reject dùng reason, typed confirmation và bank/status guard | Finance action có reason/audit payload, refund/payout không chạy ngay khi click |
| `app/admin/messages/page.tsx`, `app/admin/notifications/page.tsx`, `lib/api/message-api.ts`, `lib/services/message-service.ts`, `lib/api/notification-api.ts`, `lib/services/notification-service.ts` | Messages dùng `/admin/conversations`; notifications là admin console dùng `/admin/notifications` và `/admin/notifications/send` | Không dùng inbox/thông báo user thường cho màn admin |
| `app/admin/reports/page.tsx`, `app/admin/audit-logs/page.tsx`, `app/admin/settings/page.tsx`, `app/admin/complaints/page.tsx`, `docs/ADMIN_E2E_SECURITY_TEST_PLAN.md` | Thêm filter/export CSV reports, audit detail metadata, settings guard reason, complaints đọc `/admin/disputes`, test plan theo role/security | Hoàn thiện P2 nền tảng và acceptance test cho rollout production |

Validation lượt này:

| Command | Kết quả |
|---|---|
| `npm run lint` | Pass |
| `npx tsc --noEmit` | Pass |

### Checklist acceptance cho admin production

| Luồng | Điều kiện pass |
|---|---|
| Admin role | Mỗi sub-role chỉ thấy menu/action có quyền; direct route không gọi API ngoài quyền |
| Duyệt tutor | Không approve nếu thiếu identity/certificate/commitment hoặc duplicate/risk cao; reject/request-update có reason và audit |
| Match request | BE trả danh sách gia sư kèm score/reason; assign tạo booking học thử idempotent; học viên/gia sư nhận notification |
| Booking | Schedule validate offline location, end sau start, không trùng lịch; complete/convert chỉ khi đúng status |
| Trial result | Active chuyển request + class active; rematch hủy trial class và đưa request về consulting/rematch; cancelled ghi lý do |
| Session/payment | Complete session tạo/đánh dấu payment/earning đúng; review chỉ sau session completed |
| Payment | Manual paid/refund có reason; webhook signature invalid không đổi payment; amount mismatch không tạo earning |
| Payout | Payout approve chỉ mark earning đã lock trong payout đó; reject release đúng earning |
| Audit | Mọi action nhạy cảm có actor, role, entity, before/after hoặc note, timestamp, metadata điều tra |
| Error UX | API 401 logout/redirect; 403 hiện không có quyền; 5xx/network giữ session và hiện retry |
