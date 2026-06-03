# Full System Review - Gia Su Platform

Ngay cap nhat: 2026-06-03

Pham vi ra soat:

- Frontend: `app`, `components`, `lib`, `types`
- Backend: `H:\backend\src\main\java\com\example\tutorplatform`
- Tai lieu nghiep vu hien co: `ADMIN_FULL_FUNCTIONAL_BUSINESS_NOTE.md`
- Kieu ra soat: static source review + map route/API/service/state/permission. Chua phai E2E live voi tai khoan that.

Ghi chu quan trong: tai lieu nay co muc tieu phu kin toan bo chuc nang va logic thay duoc trong source hien tai. Nhung cac ket luan ve "chay dung tren du lieu that" van can xac nhan bang smoke test/E2E, dac biet voi payment gateway, webhook, RBAC theo token that, file private va Docker/Testcontainers.

## 1. Tong Quan He Thong

He thong la mot tutor marketplace gom 3 tang van hanh:

1. Public website: thu lead, cho khach tim gia su, xem chi tiet gia su, gui yeu cau hoc, dat hoc thu, lien he.
2. Dashboard theo vai tro: student, parent, tutor quan ly workflow cua minh.
3. Admin back-office: van hanh toan bo vong doi tu tutor onboarding, verification, matching, booking, class/session, payment, payout, complaint, support, report, audit, settings.

Stack frontend:

- Next.js 16, React 19, TypeScript.
- UI: Tailwind, Radix/shadcn style components, lucide icons.
- Data: custom API client, service layer, hooks, local auth context.
- State UX: loading, empty, error, retry duoc dung o nhieu page, dac biet public route Phase 1.

Stack backend:

- Spring Boot Java.
- REST API theo prefix `/api/v1`.
- Security: JWT, role guard, admin permission interceptor.
- Data access: `DbService` + `JdbcTemplate`.
- Nghiep vu: service rieng cho auth, learning request, booking, class/session, payment, finance, verification, operations, reports, master data.
- State control: `StatusTransitionPolicy`.

## 2. Nguoi Dung Va Vai Tro

### 2.1 Guest/Public User

Phuc vu:

- Khach chua dang nhap.
- Phu huynh/hoc sinh dang tim gia su.
- Gia su tiem nang tim hieu quy trinh dang ky.

Lam duoc:

- Xem homepage.
- Xem danh sach gia su public.
- Loc/tim/sap xep gia su theo keyword, mon, lop, khu vuc, hinh thuc, gia, rating, verified, gender.
- Xem chi tiet gia su.
- Xem review cua gia su.
- Dat booking/request hoc thu tu profile gia su.
- Tao learning request public.
- Gui contact request.
- Xem cac trang noi dung/phap ly/chinh sach.
- Dang nhap, dang ky, quen mat khau, reset password, verify email.

### 2.2 Student

Phuc vu:

- Hoc sinh co tai khoan.
- Nguoi hoc tu quan ly yeu cau, booking, lop, lich, thanh toan.

Lam duoc:

- Xem dashboard tong quan.
- Tao va theo doi learning request.
- Xem chi tiet request, booking, class, session, payment lien quan.
- Tim va luu gia su yeu thich.
- Dat hoc thu.
- Xem lich hoc.
- Upload/xac minh the hoc sinh va selfie.
- Ky agreement neu workflow yeu cau.
- Xem va tao review sau session.
- Quan ly message/notification/profile/settings.

### 2.3 Parent

Phuc vu:

- Phu huynh quan ly con/hoc vien.

Lam duoc:

- Xem dashboard phu huynh.
- Quan ly ho so con.
- Xem proposal gia su gui.
- Accept/reject proposal.
- Xem lich hoc cua con.
- Xem/payment cho hoc phi.
- Xem message, notification, settings.
- Quan ly request/booking giua parent-student theo backend parent endpoints.

### 2.4 Tutor

Phuc vu:

- Gia su dang ky, hoan thien ho so, nhan lead, day hoc, nhan thu nhap.

Lam duoc:

- Dashboard tong quan.
- Tao/cap nhat profile tutor.
- Submit profile for review.
- Upload document.
- Upload verification document, ky tutor agreement, submit verification.
- Xem eligibility de duoc duyet.
- Xem lead/request phu hop.
- Gui proposal cho request.
- Sua/rut proposal.
- Xem booking can xu ly.
- Accept/reject booking.
- Quan ly classes, sessions, schedule.
- Complete/cancel session.
- Xem hoc sinh, reviews.
- Xem earnings/payments/payouts.
- Request payout.
- Xem message/notification/settings.

### 2.5 Admin Roles

Role admin:

- `admin`
- `system_admin`
- `finance_admin`
- `tutor_admin`
- `support_admin`
- `verification_admin`

Phuc vu:

- Van hanh toan bo back-office marketplace.
- Tach quyen theo domain de tranh finance/support/verification lam viec ngoai pham vi.

## 3. Frontend Route Inventory

### 3.1 Public Routes

| Route | Phuc vu | Chuc nang |
|---|---|---|
| `/` | Guest | Homepage, featured tutors, stats, CTA |
| `/about` | Guest | Gioi thieu nen tang |
| `/how-it-works` | Guest | Quy trinh hoat dong |
| `/process` | Guest | Quy trinh san xuat/van hanh public UX |
| `/tutors` | Guest/student/parent | Danh sach gia su, filter, sort, favorite/compare action |
| `/tutors/[id]` | Guest/student/parent | Chi tiet gia su, review tab, CTA booking |
| `/tutors/[id]/booking` | Guest/student/parent | Form dat hoc thu/tao yeu cau lien quan tutor |
| `/learning-requests` | Guest/tutor | Public learning request board |
| `/contact` | Guest | Form lien he co validation, retry/fallback |
| `/register` | Guest | Dang ky tai khoan student/parent/tutor |
| `/register-student` | Guest/student/parent | Tao learning request/nhu cau hoc |
| `/register-tutor` | Guest/tutor | Dang ky/vao onboarding tutor |
| `/login` | Guest | Dang nhap, redirect theo role |
| `/forgot-password` | Guest | Gui forgot password |
| `/reset-password` | Guest | Reset password bang token |
| `/verify-email` | Guest/user | Verify email bang token |
| `/terms` | Guest | Dieu khoan |
| `/privacy` | Guest | Quyen rieng tu |
| `/safety` | Guest | An toan |
| `/student-parent-policy` | Guest | Chinh sach hoc sinh/phu huynh |
| `/tutor-agreement` | Tutor/guest | Thoa thuan gia su |
| `/refund-policy` | Guest | Chinh sach hoan tien |
| `/complaint-policy` | Guest | Chinh sach khieu nai |
| `/robots.ts` | SEO | Robots |
| `/sitemap.ts` | SEO | Sitemap |
| `/error.tsx` | All | Global error boundary |

### 3.2 General Auth/User Routes

| Route | Chuc nang |
|---|---|
| `/dashboard` | Router dashboard theo role |
| `/profile` | Profile chung, redirect login neu chua auth |
| `/settings` | Router settings theo role |
| `/notifications` | Alias/notification chung |
| `/payments` | Payment hub/alias |
| `/payments/history` | Payment history alias |
| `/payments/success` | Payment success result |
| `/payments/pending` | Payment pending result |
| `/payments/failed` | Payment failed result |
| `/classes` | Classes alias |
| `/classes/[id]` | Class detail alias |
| `/classes/[id]/sessions` | Session alias |

### 3.3 Student Dashboard Routes

| Route | Chuc nang |
|---|---|
| `/dashboard/student` | Overview student: requests, sessions, favorites, notifications, classes, recommended tutors, verification |
| `/dashboard/student/requests` | Danh sach learning request cua student, filter status |
| `/dashboard/student/requests/[id]` | Chi tiet request, bookings, classes, payments, cancel request |
| `/dashboard/student/bookings` | Booking hoc thu cua student, status/CTA |
| `/dashboard/student/classes` | Lop hoc cua student |
| `/dashboard/student/classes/[id]` | Chi tiet lop va sessions |
| `/dashboard/student/schedule` | Lich hoc, review sau session |
| `/dashboard/student/payments` | Thanh toan, checkout gateway, filter status |
| `/dashboard/student/favorites` | Gia su da luu |
| `/dashboard/student/messages` | Tin nhan |
| `/dashboard/student/notifications` | Thong bao |
| `/dashboard/student/profile` | Ho so student |
| `/dashboard/student/settings` | Cai dat student |
| `/dashboard/student/verification` | Upload/xac minh student card/selfie/agreement |

Guard:

- Layout chi cho `student`.
- Neu `parent` vao student dashboard thi redirect sang `/dashboard/parent`.
- Role khac bi forbidden.

### 3.4 Parent Dashboard Routes

| Route | Chuc nang |
|---|---|
| `/dashboard/parent` | Overview parent |
| `/dashboard/parent/students` | Quan ly ho so con |
| `/dashboard/parent/proposals` | Xem proposal tu tutor, accept/reject |
| `/dashboard/parent/schedule` | Lich hoc cua con |
| `/dashboard/parent/payments` | Thanh toan |
| `/dashboard/parent/messages` | Tin nhan |
| `/dashboard/parent/notifications` | Thong bao |
| `/dashboard/parent/settings` | Cai dat |

Guard:

- Layout chi cho `parent`.
- Role khac bi forbidden.

### 3.5 Tutor Dashboard Routes

Co 2 nhom alias: `/dashboard/tutor/*` la nhom chinh; `/tutor/*` la alias/route cu hoac workspace tuong ung.

| Route | Chuc nang |
|---|---|
| `/dashboard/tutor` | Overview tutor |
| `/dashboard/tutor/profile` | Ho so gia su |
| `/dashboard/tutor/verification` | Verification/agreement/documents |
| `/dashboard/tutor/leads` | Lead phu hop |
| `/dashboard/tutor/proposals` | Proposal da gui |
| `/dashboard/tutor/requests` | Booking/request can xu ly |
| `/dashboard/tutor/bookings` | Booking cua tutor |
| `/dashboard/tutor/classes` | Lop dang day |
| `/dashboard/tutor/classes/[id]` | Chi tiet lop |
| `/dashboard/tutor/schedule` | Lich day/session |
| `/dashboard/tutor/students` | Hoc sinh cua tutor |
| `/dashboard/tutor/earnings` | Thu nhap, payout request |
| `/dashboard/tutor/reviews` | Reviews |
| `/dashboard/tutor/messages` | Tin nhan |
| `/dashboard/tutor/notifications` | Thong bao |
| `/dashboard/tutor/settings` | Cai dat |
| `/tutor/onboarding` | Onboarding tutor |
| `/tutor/dashboard` | Alias dashboard tutor |
| `/tutor/profile` | Alias profile |
| `/tutor/requests` | Alias requests |
| `/tutor/bookings` | Alias bookings |
| `/tutor/classes` | Alias classes |
| `/tutor/classes/[id]` | Alias class detail |
| `/tutor/schedule` | Alias schedule |
| `/tutor/students` | Alias students |
| `/tutor/earnings` | Alias earnings |
| `/tutor/reviews` | Alias reviews |
| `/tutor/messages` | Alias messages |
| `/tutor/notifications` | Alias notifications |
| `/tutor/settings` | Alias settings |

Guard:

- Layout chi cho `tutor`.
- Role khac bi forbidden.

### 3.6 Admin Routes

| Route | Chuc nang |
|---|---|
| `/admin` | Dashboard/KPI admin |
| `/admin/operations` | Operations cockpit, work-items, SLA, filters, quick actions |
| `/admin/tutors` | Danh sach gia su, approve/reject/suspend/reactivate |
| `/admin/tutors/[id]` | CRM/detail gia su |
| `/admin/tutor-approvals` | Hang doi duyet ho so gia su |
| `/admin/verifications` | Duyet verification, xem file private |
| `/admin/learning-requests` | Request list, matching, assign |
| `/admin/requests` | Alias/admin request list |
| `/admin/requests/[id]` | Request detail |
| `/admin/bookings` | Booking hoc thu admin |
| `/admin/bookings/[id]` | Booking detail |
| `/admin/classes` | Lop hoc admin |
| `/admin/classes/[id]` | Class detail admin |
| `/admin/sessions` | Session admin |
| `/admin/payments` | Payment admin, mark paid/failed/refund |
| `/admin/payouts` | Payout admin, approve/reject |
| `/admin/reports` | Bao cao overview/trend/funnel/revenue |
| `/admin/audit-logs` | Audit log |
| `/admin/students` | Quan ly hoc sinh |
| `/admin/students/[id]` | CRM hoc sinh |
| `/admin/parents` | Quan ly phu huynh |
| `/admin/parents/[id]` | CRM phu huynh |
| `/admin/contacts` | Contact request queue |
| `/admin/messages` | Conversation admin |
| `/admin/notifications` | Gui notification don/bulk |
| `/admin/reviews` | Duyet/an/hien/flag review |
| `/admin/complaints` | Complaint/dispute list |
| `/admin/complaints/[id]` | Complaint case detail: owner, timeline, note, resolution |
| `/admin/settings` | Operational settings, system key/value, master data CRUD |

Guard:

- Admin layout yeu cau user logged in.
- `canAccessAdmin` yeu cau role admin granular.
- Sidebar chi hien module co permission.
- Module hien tai neu khong du quyen thi render forbidden state.

## 4. Frontend Service/API/Hook Inventory

### 4.1 API Client

File: `lib/api/client.ts`

Chuc nang:

- Lay `NEXT_PUBLIC_API_BASE_URL`, dev fallback `http://localhost:8080/api/v1`.
- Production khong co base URL se throw `API_BASE_URL_MISSING`.
- Timeout mac dinh `NEXT_PUBLIC_API_TIMEOUT_MS` hoac 15000 ms.
- Ho tro `GET/POST/PATCH/PUT/DELETE`.
- Tu dong set JSON headers, FormData khong set content-type.
- Token storage local/memory theo `NEXT_PUBLIC_AUTH_TOKEN_STORAGE`.
- Refresh access token khi response 401.
- Emit `AUTH_EXPIRED_EVENT` khi session het han.
- Emit `API_ERROR_EVENT` cho network/403/5xx.
- Parse API envelope `{success,data,error,pagination}`.
- `apiPageRequest` normalize pagination.
- `uploadFile` POST `/uploads`.

Rui ro/luu y:

- Refresh call hien khong dung timeout helper; neu backend treo o `/auth/refresh`, can review tiep neu can hardening absolute.
- Local token storage mac dinh la localStorage, can can nhac security/XSS neu production yeu cau cookie-only.

### 4.2 Auth

Files:

- `lib/api/auth-api.ts`
- `lib/services/auth-service.ts`
- `lib/contexts/auth-context.tsx`
- `lib/hooks/use-auth.ts`

API:

- `POST /auth/login`
- `POST /auth/register`
- `GET /auth/me`
- `PATCH /users/me`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/verify-email`

Logic:

- Load current user khi app mount.
- Login/register persist token + user.
- Logout clear session.
- Update profile sync state.
- Toast error/success.
- Auth expired event clear session.

### 4.3 Tutor/Public Tutor

Files:

- `lib/api/tutor-api.ts`
- `lib/services/tutor-service.ts`
- `lib/hooks/use-tutors.ts`
- `components/tutor/tutor-card.tsx`

API:

- `GET /tutors`
- `GET /tutors/{id}`
- `GET /favorites/tutors`
- `GET /favorites/tutors/ids`
- `POST /favorites/tutors/{id}`
- `DELETE /favorites/tutors/{id}`
- `GET /tutor/profile`
- `PATCH /tutor/profile`
- `POST /tutor/profile/submit`
- `GET /tutor/approval-eligibility`
- `GET /tutor/documents`
- `POST /tutor/documents`
- Admin tutor actions listed in admin section.

Logic:

- Public tutor list maps filters to API params.
- Sort BE-supported: `best_match`, `rating_desc`, `price_asc`, `price_desc`, `experience_desc`, `newest`.
- `useTutorDetail` phan biet 404 not found vs server/network.
- Featured tutors lay tu list public.
- Favorite state cache theo user.
- Upload tutor document can File object.

### 4.4 Learning Requests

Files:

- `lib/api/learning-request-api.ts`
- `lib/services/learning-request-service.ts`
- `lib/hooks/use-learning-requests.ts`
- `lib/services/matching-service.ts`

API:

- `GET /learning-requests`
- `GET /public/learning-requests`
- `POST /public/learning-requests`
- `GET /student/learning-requests/me`
- `POST /student/learning-requests`
- `POST /learning-requests`
- `GET /learning-requests/{id}`
- `PATCH /learning-requests/{id}`
- `POST /learning-requests/{id}/cancel`
- `GET /admin/learning-requests`
- `GET /admin/learning-requests/{id}`
- `PATCH /admin/learning-requests/{id}/status`
- `POST /admin/learning-requests/{id}/assign-tutor`
- `POST /admin/learning-requests/{id}/assign-tutor-with-booking`
- `GET /admin/learning-requests/{id}/matching-tutors`
- `POST /admin/learning-requests/{id}/rematch`
- `POST /admin/learning-requests/{id}/cancel`

Logic:

- Guest tao public request khong can auth.
- Student tao request co auth.
- Admin update status theo state policy backend.
- Assign tutor chi cho tutor approved.
- Assign with booking co idempotency de tranh tao booking trung.
- Rematch clear assigned tutor va dua ve trang thai rematch.
- Matching FE fallback tinh score theo subject/grade/location/fee/schedule; backend co matching endpoint rieng.

### 4.5 Booking/Trial Booking

Files:

- `lib/api/booking-api.ts`
- `lib/services/booking-service.ts`
- `lib/services/trial-booking-service.ts`
- `lib/services/workflowService.ts`
- `lib/hooks/use-bookings.ts`

API:

- `GET /bookings`
- `POST /bookings`
- `GET /bookings/{id}`
- `POST /bookings/{id}/cancel`
- `GET /tutor/bookings`
- `POST /tutor/bookings/{id}/accept`
- `POST /tutor/bookings/{id}/reject`
- `GET /admin/bookings`
- `GET /admin/bookings/{id}`
- `POST /admin/bookings/{id}/assign-tutor`
- `POST /admin/bookings/{id}/schedule`
- `POST /admin/bookings/{id}/complete`
- `POST /admin/bookings/{id}/mark-no-show-student`
- `POST /admin/bookings/{id}/mark-no-show-tutor`
- `POST /admin/bookings/{id}/convert-to-class`
- `POST /admin/bookings/{id}/cancel`
- Standalone trial booking controller: `POST /trial-bookings`, `GET /trial-bookings/{id}`, `/confirm`, `/cancel`, `/mark-no-show`, `/complete`, `/convert-to-class`.

Logic:

- Student/parent co the tao booking voi tutor.
- Tutor accept booking co schedule payload.
- Tutor reject booking can reason.
- Admin schedule/assign/complete/no-show/cancel/convert.
- Workflow service validate schedule: date, startTime, endTime, offline location, end after start.

### 4.6 Classes/Sessions/Schedule

Files:

- `lib/api/class-api.ts`
- `lib/services/class-service.ts`
- `lib/services/schedule-service.ts`
- `lib/hooks/use-classes.ts`
- `lib/hooks/use-schedule.ts`

API:

- `GET /classes`
- `GET /classes/{id}`
- `GET /classes/{id}/sessions`
- `GET /tutor/classes`
- `GET /tutor/classes/{id}`
- `GET /tutor/sessions`
- `GET /sessions`
- `GET /sessions/{id}`
- `POST /tutor/sessions/{id}/complete`
- `POST /tutor/sessions/{id}/cancel`
- `GET /admin/classes`
- `GET /admin/classes/{id}`
- `POST /admin/classes`
- `PATCH /admin/classes/{id}`
- `POST /admin/classes/{id}/pause`
- `POST /admin/classes/{id}/complete`
- `POST /admin/classes/{id}/cancel`
- `GET /admin/classes/{id}/sessions`
- `POST /admin/classes/{id}/sessions`
- `GET /admin/sessions`
- `PATCH /admin/sessions/{id}`
- `POST /admin/sessions/{id}/complete`
- `POST /admin/sessions/{id}/cancel`
- `POST /admin/sessions/{id}/mark-student-absent`
- `POST /admin/sessions/{id}/mark-tutor-absent`

Logic:

- Class status: `trial`, `active`, `paused`, `completed`, `cancelled`.
- Session status: `scheduled`, `upcoming`, `completed`, `cancelled`, `student_absent`, `tutor_absent`.
- Completing session backend co the tao payment/earning idempotently theo service.

### 4.7 Payment, Refund, Payout, Earnings

Files:

- `lib/api/payment-api.ts`
- `lib/api/earning-api.ts`
- `lib/services/payment-service.ts`
- `lib/services/payout-service.ts`
- `lib/hooks/use-payments.ts`
- `lib/hooks/use-tutor-earnings.ts`

API:

- `GET /payments/settings`
- `GET /payments`
- `GET /payments/{id}`
- `POST /payments/{id}/create-checkout`
- `GET /payments/{id}/status`
- `GET /payments/{id}/invoice`
- `GET /payments/{id}/receipt`
- `POST /payments/webhooks/{gateway}`
- `GET /tutor/earnings`
- `GET /tutor/payments`
- `GET /tutor/payouts`
- `POST /tutor/payouts`
- `GET /admin/payments`
- `GET /admin/payments/{id}`
- `POST /admin/payments/{id}/mark-paid`
- `POST /admin/payments/{id}/mark-failed`
- `POST /admin/payments/{id}/refund`
- `GET /admin/payment-transactions`
- `GET /admin/payment-webhook-events`
- `GET /admin/refunds`
- `GET /admin/payouts`
- `GET /admin/payouts/{id}`
- `POST /admin/payouts/{id}/approve`
- `POST /admin/payouts/{id}/reject`

Logic:

- Payment gateway settings doc tu backend/system settings.
- Checkout tra ve checkout URL/QR info.
- Webhook public permitAll nhung gateway service verify payload/signature.
- Admin mark paid/failed/refund co permission rieng.
- Tutor payout request yeu cau verified/agreement theo backend finance.
- Payout allocate/lock earnings, approve chuyen earning paid, reject release earning ve available.

Payment gateway:

- `mock`
- `bank_qr`
- `momo`
- `vnpay`
- `payos`
- `stripe`

Production guard:

- Backend co `PaymentGatewayFactory` chan real mode neu adapter that chua cau hinh.

### 4.8 Verification/File

Files:

- `lib/api/verification-api.ts`
- `lib/services/verification-service.ts`
- `lib/hooks/use-verifications.ts`
- `lib/api/file-api.ts`

API:

- `POST /student/verifications/student-card/upload`
- `POST /student/verifications/{id}/selfie/upload`
- `GET /student/verifications/me`
- `POST /student/verifications/{id}/agreement/sign`
- `POST /student/verifications/{id}/submit`
- `POST /tutor/verifications/document/upload`
- `GET /verification/terms/tutor`
- `GET /tutor/verifications/me`
- `POST /tutor/verifications/{id}/agreement/sign`
- `POST /tutor/verifications/{id}/submit`
- `GET /admin/verifications`
- `GET /admin/verifications/{id}`
- `POST /admin/verifications/{id}/approve`
- `POST /admin/verifications/{id}/reject`
- `POST /admin/verifications/{id}/need-more-info`
- `GET /files/{fileId}`
- `POST /uploads`

Logic:

- Upload multipart.
- Student card/selfie flow rieng.
- Tutor document/agreement/submit flow rieng.
- Admin review approve/reject/need more info.
- File endpoint GET permitAll o security, nhung `FilePolicy` enforce quyen/ownership.

### 4.9 Message/Notification/Review/Contact

Messages:

- `GET /conversations`
- `POST /conversations`
- `GET /conversations/{id}`
- `GET /conversations/{id}/messages`
- `POST /conversations/{id}/messages`
- `POST /conversations/{id}/mark-read`
- `GET /admin/conversations`
- `GET /admin/conversations/{id}`

Notifications:

- `GET /notifications`
- `GET /notifications/unread-count`
- `PATCH`/`POST /notifications/{id}/read`
- `PATCH`/`POST /notifications/read-all`
- `DELETE /notifications/{id}`
- `DELETE /notifications`
- `GET /admin/notifications`
- `POST /admin/notifications/send`
- `POST /admin/notifications/send-bulk`

Reviews:

- `GET /reviews`
- `POST /reviews`
- `GET /tutors/{id}/reviews`
- `GET /admin/reviews`
- `POST /admin/reviews/{id}/hide`
- `POST /admin/reviews/{id}/show`
- `POST /admin/reviews/{id}/flag`

Contacts:

- `POST /contact-requests`
- `GET /admin/contact-requests`
- `PATCH /admin/contact-requests/{id}/status`

Logic:

- Review create tu student schedule/session UI.
- Admin review moderation co hide/show/flag.
- Contact request public khong can auth, admin xu ly status/note/handler.
- Notification co read/unread, clear, bulk send theo role/user.

### 4.10 Admin Services

Files:

- `lib/api/admin-api.ts`
- `lib/services/admin-service.ts`
- `lib/services/admin-operation-service.ts`
- `lib/services/audit-log-service.ts`
- `lib/api/settings-api.ts`
- `lib/services/settings-service.ts`
- `lib/api/master-data-api.ts`
- `lib/services/master-data-service.ts`
- `lib/admin/admin-permissions.ts`
- `lib/admin/admin-actions.ts`

Admin API groups:

- Users/CRM: `/admin/users`, `/admin/users/{id}`, `/admin/users/{id}/crm`, notes, risk flags, status.
- Tutor CRM: `/admin/tutors/{id}/crm`, notes, risk flags.
- Reports: `/admin/reports/*`.
- Audit: `/admin/audit-logs`.
- Operations: `/admin/operations/*`.
- Disputes/complaints: `/admin/disputes/*`.
- Settings: `/admin/settings`, `/admin/system-settings/*`, `/admin/master-data/*`.

### 4.11 Shared Components

UI primitives:

- Accordion, alert, alert dialog.
- Aspect ratio, avatar, badge, breadcrumb.
- Button, button group.
- Calendar, carousel, chart.
- Checkbox, command, context menu.
- Dialog, drawer, dropdown menu.
- Field, form, input, input group, input OTP.
- Hover card, item, kbd, label.
- Menubar, navigation menu.
- Pagination, popover, progress, radio group.
- Resizable panels, scroll area, select, separator.
- Sheet, sidebar, skeleton, slider, spinner.
- Status badge, switch, table, tabs, textarea.
- Toast, toaster, sonner, toggle, toggle group, tooltip.
- `use-mobile`, `use-toast`.

Domain/shared components:

- `components/platform/operational-components.tsx`: PageHero, DashboardMetricCard, EmptyState, ErrorState, LoadingSkeleton, EntityCard, InsightPanel, PublicDataNotice, badges/timeline/payment helpers.
- `components/tutor/tutor-card.tsx`: card hien thi gia su public/dashboard.
- `components/layout/header.tsx`: navigation/header public.
- `components/layout/footer.tsx`: footer dung contact/site config.
- `components/layout/scroll-reveal-provider.tsx`: reveal/scroll interaction.
- `components/notifications/notification-menu.tsx`: unread/menu notifications.
- `components/auth/route-guard.tsx`: route guard chung.
- `components/auth/login-required-dialog.tsx`: dialog yeu cau login.
- `components/payment/payment-trust-ui.tsx`: trust/info cho payment.
- `components/admin/admin-action-button.tsx`: action button co permission/busy/reason pattern.
- `components/admin/admin-crm-detail.tsx`: CRM detail user/tutor.
- `components/admin/admin-permission-guard.tsx`: forbidden/read-only guard UI.
- `components/admin/admin-pagination.tsx`: pagination admin.
- `components/admin/tutor-approval-eligibility.tsx`: checklist eligibility tutor.
- `components/dashboard/confirm-reason-dialog.tsx` va `components/admin/ConfirmReasonDialog.tsx`: confirm action co reason.
- `components/legal/legal-page.tsx`: render legal/policy pages.

### 4.12 Shared Config, Helpers, Data

Config/data:

- `lib/site-config.ts`: cau hinh site/contact/SEO chung.
- `lib/config/site.ts`: export config route/config layer.
- `lib/public-data.ts`: fallback/public copy/data cho public UX.
- `lib/legal-content.ts`: noi dung legal/policy pages.
- `lib/constants.ts`: constants dung chung.
- `lib/storage.ts`: storage keys.
- `lib/utils.ts`: className/utils.

Helpers:

- `lib/helpers/tutor-helpers.ts`: tutor formatting/derived helpers.
- `lib/helpers/status-helpers.ts`: status label/variant.
- `lib/helpers/booking-status.ts`: booking status copy/logic.
- `lib/helpers/audit-helpers.ts`: audit formatting.
- `lib/helpers/format-helpers.ts`: date/money/text formatting.
- `lib/helpers/icon-helpers.tsx`: icon mapping.

Types:

- `types/index.ts`: toan bo type domain: user, tutor, learning request, booking, class, session, review, message, conversation, payment, earning, payout, verification, notification, audit, CRM, system setting, contact, filters/sort, dashboard stats, form data.

## 5. Backend Controller Inventory

### 5.0 HealthController

Base: `/api/v1`

Endpoint:

- `GET /health`

Logic:

- Tra `{status: "UP"}` trong API envelope de kiem tra backend alive.

### 5.1 AuthController

Base: `/api/v1/auth`

Endpoints:

- `POST /register`
- `POST /login`
- `POST /refresh`
- `POST /logout`
- `GET /me`
- `POST /forgot-password`
- `POST /reset-password`
- `POST /verify-email`

Logic:

- Register/login tra auth payload.
- Refresh token renew access.
- Logout revoke/clear refresh.
- Forgot/reset/verify email co endpoint rieng.

### 5.2 PlatformController

Base: `/api/v1`

Nhom public/catalog:

- `GET /catalog/subjects`
- `GET /catalog/grade-levels`
- `GET /public/stats`
- `GET /tutors`
- `GET /tutors/{id}`
- `GET /public/learning-requests`
- `POST /public/learning-requests`
- `POST /public/trial-booking-requests`
- `POST /contact-requests`

Nhom current user:

- `GET /users/me`
- `PATCH /users/me`
- `GET /users/me/profile`
- `PATCH /users/me/profile`

Nhom favorites:

- `GET /favorites/tutors`
- `GET /favorites/tutors/ids`
- `POST /favorites/tutors/{tutorId}`
- `DELETE /favorites/tutors/{tutorId}`

Nhom tutor:

- `GET /tutor/profile`
- `GET /tutor/approval-eligibility`
- `PATCH /tutor/profile`
- `POST /tutor/profile/submit`
- `GET /tutor/documents`
- `POST /tutor/documents`
- `DELETE /tutor/documents/{documentId}`
- `GET /tutor/availability`
- `POST /tutor/availability`
- `PATCH /tutor/availability/{availabilityId}`
- `DELETE /tutor/availability/{availabilityId}`

Nhom learning request:

- `GET /learning-requests`
- `GET /student/learning-requests/me`
- `POST /student/learning-requests`
- `POST /learning-requests`
- `GET /learning-requests/{requestId}`
- `PATCH /learning-requests/{requestId}`
- `POST /learning-requests/{requestId}/cancel`
- Admin endpoints nhu muc 4.4.

Nhom booking/class/session/review/message/notification/finance/admin:

- Da liet ke chi tiet tai muc 4.

### 5.3 MasterDataController

Base: `/api/v1/master-data`

Public read endpoints:

- `/locations`
- `/subject-categories`
- `/subjects`
- `/education-levels`
- `/grades`
- `/languages`
- `/certificates`
- `/teaching-modes`
- `/cancellation-policies`

### 5.4 AdminMasterDataController

Base: `/api/v1/admin`

Endpoints:

- `GET /master-data/subjects`
- `GET /master-data/locations`
- `GET /master-data/certificates`
- `GET /master-data/{kind}/{id}/usage`
- `POST /master-data/{kind}/bulk-status`
- `POST /master-data/subjects`
- `PATCH /master-data/subjects/{id}`
- `DELETE /master-data/subjects/{id}`
- `POST /master-data/locations`
- `PATCH /master-data/locations/{id}`
- `DELETE /master-data/locations/{id}`
- `POST /master-data/certificates`
- `PATCH /master-data/certificates/{id}`
- `DELETE /master-data/certificates/{id}`
- `GET /system-settings`
- `GET /system-settings/{key}/history`
- `POST /system-settings`
- `PATCH /system-settings/{key}`
- `DELETE /system-settings/{key}`

### 5.5 AdminOperationController

Base: `/api/v1/admin`

Endpoints:

- `GET /operations/overview`
- `GET /operations/matching-queue`
- `GET /operations/booking-risk`
- `GET /operations/verification-risk`
- `GET /operations/payment-reconciliation`
- `GET /operations/payout-queue`
- `GET /operations/tutor-quality`
- `GET /operations/work-items`
- `GET /disputes`
- `GET /disputes/{id}`
- `PATCH /disputes/{id}`
- `POST /disputes/{id}/assign`
- `POST /disputes/{id}/notes`
- `POST /disputes/{id}/timeline`
- `POST /disputes/{id}/resolve`
- `POST /disputes/{id}/close`
- `POST /disputes/{id}/escalate`

### 5.6 VerificationController

Base: `/api/v1`

Endpoints da liet ke tai muc 4.8.

Backend services:

- `OcrService`
- `FraudRiskService`
- `DuplicateDocumentService`
- `TutorApprovalEligibilityService`
- `VerificationTerms`

### 5.7 PaymentController

Base: `/api/v1`

Endpoints:

- `GET /payments/settings`
- `POST /payments/{paymentId}/create-checkout`
- `GET /payments/{paymentId}/status`
- `GET /payments/{paymentId}/invoice`
- `GET /payments/{paymentId}/receipt`
- `POST /payments/webhooks/{gateway}`
- `GET /admin/payment-transactions`
- `GET /admin/payment-webhook-events`
- `GET /admin/refunds`

### 5.8 ParentStudentController

Base: `/api/v1/parent`

Endpoints:

- `POST /students`
- `GET /students`
- `GET /students/{studentId}`
- `PATCH /students/{studentId}`
- `GET /students/{studentId}/dashboard`
- `GET /students/{studentId}/schedule`
- `GET /students/{studentId}/progress`
- `GET /students/{studentId}/payments`

### 5.9 StudentDashboardController

Base: `/api/v1/student`

Endpoints:

- `GET /dashboard`
- `GET /schedule`
- `GET /classes`
- `GET /assignments`
- `GET /materials`
- `GET /progress`
- `POST /sessions/{sessionId}/check-in`

### 5.10 Tutor Controllers

TutorLeadController:

- `GET /api/v1/tutor/leads`
- `GET /api/v1/tutor/leads/{requestId}`

TutorPerformanceController:

- `GET /api/v1/tutor/performance`

TutorProposalController:

- `GET /tutor/proposals`
- `POST /tutor/leads/{requestId}/proposals`
- `PATCH /tutor/proposals/{proposalId}`
- `POST /tutor/proposals/{proposalId}/withdraw`
- `GET /parent/proposals`
- `POST /parent/proposals/{proposalId}/accept`
- `POST /parent/proposals/{proposalId}/reject`

### 5.11 TrialBookingController

Base: `/api/v1/trial-bookings`

Endpoints:

- `POST /`
- `GET /{id}`
- `POST /{id}/confirm`
- `POST /{id}/cancel`
- `POST /{id}/mark-no-show`
- `POST /{id}/complete`
- `POST /{id}/convert-to-class`

### 5.12 FileController

Base: `/api/v1/files`

Endpoints:

- `GET /{fileId}`

Logic:

- Security permitAll cho GET, nhung FilePolicy kiem tra public/private/owner/admin permission.

### 5.13 Backend Infrastructure Classes

Config/infrastructure:

- `TutorPlatformApplication`: Spring Boot entrypoint.
- `SecurityConfig`: JWT filter, CORS, route-level role guard.
- `WebConfig`: web/interceptor config, gan admin permission interceptor.
- `OpenApiConfig`: OpenAPI/Swagger config.
- `AppProperties`: typed application properties.
- `ProductionProviderGuard`: guard production provider/config rui ro.
- `RateLimitFilter`: rate-limit/security filter.
- `JwtService`: issue/parse/validate JWT.
- `JwtAuthenticationFilter`: doc JWT tu request va set authentication.
- `SecurityUtils`: lay current user/roles.
- `GlobalExceptionHandler`: normalize exception thanh API error envelope.
- `ApiResponse`, `ApiError`, `PageMetadata`: response envelope/pagination.
- `BusinessException`, `ForbiddenException`, `NotFoundException`: domain exceptions.
- `DataSeeder`: seed roles/users/tutors/verifications/requests/bookings/payments/payouts/messages/notifications/audit/demo data.

## 6. Backend Business Logic

### 6.1 LearningRequestService

Dang xu ly:

- List request theo user/tutor/admin/public.
- Public create request.
- Authenticated create request.
- Create request gan tutor neu phu hop.
- Normalize payload tu nhieu key FE.
- Cancel request.
- Admin update status.
- Admin assign tutor, chi chap nhan tutor `approved`.
- Admin assign tutor with booking, co logic idempotency tranh duplicate booking.
- Admin matching tutors.
- Admin rematch, clear assigned tutor.
- Audit cac action quan trong.

State policy:

- `draft -> submitted/cancelled`
- `submitted -> matching/waiting_tutor_proposal/proposal_received/matched/cancelled/expired`
- `new -> consulting/matching/waiting_tutor_proposal/proposal_received/matched/cancelled/expired/closed`
- `consulting -> matching/proposal_received/matched/cancelled/expired/closed`
- `matching -> waiting_tutor_proposal/proposal_received/matched/rematch/cancelled/expired/closed`
- `waiting_tutor_proposal -> proposal_received/waiting_parent_confirmation/matched/rematch/cancelled/expired/closed`
- `proposal_received -> waiting_parent_confirmation/matched/rematch/cancelled/expired/closed`
- `waiting_parent_confirmation -> matched/trial_scheduled/rematch/cancelled/expired/closed`
- `matched -> trial_scheduled/rematch/cancelled/expired/closed`
- `trial_scheduled -> trial_completed/rematch/cancelled`
- `trial_completed -> active/converted_to_class/rematch/cancelled/closed`
- `active -> completed/cancelled/closed`
- `rematch -> matching/waiting_tutor_proposal/matched/cancelled/expired/closed`
- `converted_to_class -> completed/closed`

### 6.2 BookingWorkflowService/TrialBookingService

Dang xu ly:

- Student/parent create direct booking.
- Create from accepted proposal.
- Confirm/cancel/no-show/complete/convert.
- Tutor accept/reject.
- Admin assign tutor/schedule/complete/no-show/cancel/convert.
- Validate offline location.
- Audit action.
- Business exceptions cho proposal chua accept, offline thieu location, invalid status...

Booking state policy:

- `requested -> parent_confirmed/tutor_confirmed/scheduled/reschedule_requested/cancelled_by_parent/cancelled_by_tutor/cancelled/expired`
- `parent_confirmed -> tutor_confirmed/scheduled/reschedule_requested/cancelled_by_parent/cancelled_by_tutor/cancelled/expired`
- `tutor_confirmed -> parent_confirmed/scheduled/reschedule_requested/cancelled_by_parent/cancelled_by_tutor/cancelled/expired`
- `reschedule_requested -> parent_confirmed/tutor_confirmed/scheduled/cancelled_by_parent/cancelled_by_tutor/cancelled/expired`
- `pending -> assigned/accepted/scheduled/cancelled/expired`
- `assigned -> accepted/rejected/scheduled/cancelled`
- `accepted -> scheduled/cancelled`
- `scheduled -> completed/no_show_student/no_show_parent/no_show_tutor/cancelled_by_parent/cancelled_by_tutor/cancelled`
- `completed -> converted/converted_to_class/rejected_after_trial/cancelled`
- `rejected -> assigned`
- `cancelled_by_parent -> reschedule_requested`
- `cancelled_by_tutor -> reschedule_requested`

### 6.3 ClassSessionService

Dang xu ly:

- List classes/sessions theo student/tutor/admin.
- Create/update class admin.
- Pause/complete/cancel class.
- Create/update session.
- Complete/cancel session.
- Mark student absent/tutor absent.
- Khi session complete, backend co logic tao payment/earning lien quan.

Class state:

- `trial -> active/cancelled`
- `active -> paused/completed/cancelled`
- `paused -> active/cancelled`

Session state:

- `scheduled -> completed/cancelled/student_absent/tutor_absent`
- `upcoming -> completed/cancelled/student_absent/tutor_absent`

### 6.4 PaymentService/FinanceService

Dang xu ly:

- User payment list/detail.
- Payment settings.
- Create checkout theo gateway.
- Payment status.
- Invoice/receipt.
- Webhook verify/process.
- Admin list/detail payments.
- Mark paid/failed.
- Refund.
- Admin payment transactions/webhook events/refunds.
- Tutor earnings.
- Tutor payout request.
- Admin payout list/detail/approve/reject.
- Ledger/earning allocation.

Payment state:

- `pending -> processing/paid/failed/expired/cancelled`
- `processing -> paid/failed/expired`
- `paid -> refunded/partially_refunded`
- `failed -> pending`
- `expired -> pending`
- `partially_refunded -> refunded`

Payout state:

- `pending -> processing/approved/paid/completed/rejected`
- `approved -> paid/rejected`
- `processing -> paid/completed/rejected`

Finance controls:

- Tutor payout can bi chan neu chua co approved verification/agreement.
- Amount phai > 0 va khong vuot available balance.
- Approve payout lock/mark earning paid.
- Reject payout release earning ve available.
- Reason bat buoc voi reject/mark/refund theo service.

### 6.5 Verification/Tutor Approval

Tutor state:

- `draft -> submitted/pending/pending_verification`
- `submitted -> pending_verification/needs_more_documents/verified/approved/rejected`
- `pending -> pending_verification/needs_more_documents/verified/approved/rejected/need_update`
- `pending_verification -> needs_more_documents/verified/approved/rejected/need_update`
- `need_update -> pending/pending_verification/rejected`
- `needs_more_documents -> pending_verification/rejected`
- `verified -> approved/rejected/pending_verification`
- `rejected -> pending`
- `approved -> pending_verification/suspended/inactive`
- `suspended -> approved/inactive`
- `inactive -> approved`

Tutor approval eligibility:

- Profile submitted.
- Identity approved.
- Certificate approved.
- Commitment signed.
- Commitment version valid.
- Duplicate document check.
- Risk score acceptable.

### 6.6 Proposal Logic

Dang xu ly:

- Tutor xem lead.
- Tutor tao proposal cho learning request.
- Tutor update proposal.
- Tutor withdraw proposal.
- Parent xem proposal.
- Parent accept/reject proposal.
- Trial booking service co logic chi tao booking tu proposal da accepted.

### 6.7 Admin Operations Logic

Work item sources:

- Tutor pending approval.
- Verification risk.
- Learning request unmatched.
- Matching waiting/fail.
- Booking upcoming/overdue/no-show.
- Payment pending/failed/expired.
- Refund pending.
- Payout pending.
- Tutor quality risk.
- Complaint open/overdue.

Work item ranking:

- Sap xep theo priority/risk/overdue/time.
- Co recommended action va detail link.

### 6.8 Complaint/Dispute Logic

Backend supports:

- List dispute co pagination/status/priority.
- Detail dispute.
- Update status/priority/risk/resolution.
- Assign owner.
- Add internal note.
- Add timeline event.
- Resolve.
- Close.
- Escalate.
- Audit before/after.

### 6.9 Supporting Backend Services

Data and persistence:

- `DbService`: central query/mapping/audit helper; public tutor list/detail; admin list/page; sort whitelist for tutor list; current user/tutor helpers.
- `CatalogQueryService`: catalog/public query support.
- `MasterDataService`: read master data public/admin, active-only filters.
- `AdminSettingsService`: operational settings and system settings handling.
- `AdminReportService`: overview/trends/funnel/revenue/distributions/low rating alerts.
- `AdminReportRefreshService`: refresh materialized report views sau startup hoac theo trigger.

Communication:

- `NotificationService`: user/admin notification send/read/delete/bulk.
- `ConversationService`: conversations/messages/mark-read/admin conversations.
- `ContactRequestService`: public contact create, admin list/status.

Files:

- `UploadApplicationService`: upload metadata, visibility, hash/risk/duplicate.
- `FileStorageService`: luu/lay binary file.
- `FilePolicy`: decide file access theo public/private/owner/admin permission.

Tutor and verification:

- `TutorApprovalEligibilityService`: eligibility checklist/risk for approval.
- `OcrService`: OCR extraction placeholder/service layer.
- `FraudRiskService`: tinh risk score verification.
- `DuplicateDocumentService`: duplicate file/document detection.
- `TutorLeadController` + related service/query: expose leads cho tutor.
- `TutorPerformanceController`: expose tutor performance summary.

Finance:

- `EarningLedgerService`: ledger/earning support khi session/payment/payout thay doi.
- `PaymentGatewayFactory`: chon gateway, doc setting, chan production khi chua co adapter.
- Gateway implementations: mock va simulated bank_qr/momo/vnpay/payos/stripe.

Case fields:

- related type/id.
- reporter/target.
- priority/risk.
- SLA due.
- assigned admin.
- internal notes.
- timeline events.
- resolution type/note.

## 7. RBAC, Permission, Security

### 7.1 Backend SecurityConfig

Permit public:

- OPTIONS all.
- Swagger/docs.
- `POST /api/v1/auth/register`, login, refresh, forgot/reset/verify email.
- `POST /api/v1/payments/webhooks/**`.
- `POST /api/v1/public/learning-requests`.
- `POST /api/v1/public/trial-booking-requests`.
- `GET /api/v1/files/**` with FilePolicy later.
- `GET /api/v1/tutors/**`, `/catalog/**`, `/public/**`, `/master-data/**`.
- `POST /api/v1/contact-requests`.

Role guards:

- `/api/v1/admin/**`: ADMIN, FINANCE_ADMIN, TUTOR_ADMIN, SUPPORT_ADMIN, VERIFICATION_ADMIN, SYSTEM_ADMIN.
- `/api/v1/tutor/**`: TUTOR.
- Other authenticated routes require token.

### 7.2 AdminPermissionInterceptor

Backend granular permission examples:

- Payment mark paid: `payments.mark_paid`
- Payment mark failed: `payments.mark_failed`
- Refund: `payments.refund`
- Payment read: `payments.read`
- Tutor document review: `tutor_documents.review`
- Tutor suspend/reactivate: `tutors.suspend`
- Tutor approve: `tutors.approve`
- Tutor reject: `tutors.reject`
- Tutor request update: `tutors.request_more_documents`
- Tutor read/manage.
- User/student/parent profile read/manage.
- Complaints manage for dispute writes.
- Operations read for operation/dispute read.

### 7.3 Frontend Admin Permissions

Modules:

- dashboard
- operations
- tutors
- tutorApprovals
- verifications
- learningRequests
- bookings
- classes
- sessions
- payments
- payouts
- reports
- auditLogs
- students
- parents
- contacts
- messages
- notifications
- reviews
- settings
- complaints

Frontend helpers:

- `getAdminPermissions`
- `hasAdminPermission`
- `hasAnyAdminPermission`
- `hasAllAdminPermissions`
- `canAccessAdminModule`
- `canManageAdminModule`
- `canRunAdminAction`
- `getAdminModuleForPath`
- `isAdminModuleReadOnly`

### 7.4 Permission Matrix By Role

| Role | Quyen chinh |
|---|---|
| `admin` | Full |
| `system_admin` | Full/system-deep |
| `finance_admin` | Payments, payouts, reports, operations |
| `tutor_admin` | Tutors, verifications, learning requests, matching, bookings, classes, sessions, reports, operations |
| `support_admin` | Users read, CRM/support, contacts, conversations, notifications, complaints, read bookings/classes/sessions/reviews |
| `verification_admin` | Verifications, files, tutor document review, reports, operations |

## 8. Forms And Validation

Central validation file: `lib/validations/index.ts`

Schemas:

- Login: email + password min 8.
- Register: fullName, email, phone, password, role.
- Student step 1: studentName, parentName, phone, email optional, grade.
- Student step 2: subject, goal, teachingMode, location optional, preferredSchedule optional, expectedFee positive optional, note optional.
- Tutor personal: fullName, email, phone, gender, avatar.
- Tutor academic: studentCode, university, faculty, major, yearOfStudy 1..6 optional.
- Tutor teaching: subjects, grades, experienceYears, pricePerHour, teachingModes, locations, availableSlots.
- Tutor profile: bio min 50, teachingMethod min 30.
- Trial booking: studentName, parentName, phone, email optional, subject, grade, preferredTime, message.
- Review: rating 1..5, content min 10.
- Profile update: fullName optional, phone optional, avatar optional.

Rui ro can follow-up:

- Online/offline location business rule duoc FE xu ly o public register-student va workflow schedule; nen dam bao backend cung validate offline location cho moi endpoint tao/schedule booking/request.
- Mot so status type la `string`, khong strongly typed het o FE, nen logic UI can than khi backend them status moi.

## 9. End-to-End Workflow Map

### 9.1 Public Lead To Request

1. Guest vao `/register-student` hoac `/learning-requests`.
2. FE validate form.
3. FE goi `POST /public/learning-requests`.
4. Backend tao learning request public, status ban dau.
5. Admin thay request trong `/admin/learning-requests` va `/admin/operations`.
6. Admin matching/assign/rematch/cancel.

### 9.2 Tutor Discovery To Booking

1. Guest/student vao `/tutors`.
2. FE goi `GET /tutors` voi filters/sort.
3. Guest vao `/tutors/[id]`.
4. FE goi `GET /tutors/{id}` va `GET /tutors/{id}/reviews`.
5. User dat hoc thu o `/tutors/[id]/booking`.
6. FE goi booking/request API.
7. Booking vao tutor/admin dashboard.

### 9.3 Student Request To Admin Matching

1. Student tao learning request.
2. Backend luu request theo user.
3. Student theo doi `/dashboard/student/requests`.
4. Admin xem matching tutors.
5. Admin assign tutor hoac assign with booking.
6. Student thay request/booking update.

### 9.4 Tutor Lead To Parent Proposal

1. Tutor xem `/dashboard/tutor/leads`.
2. FE goi `/tutor/leads`.
3. Tutor gui proposal.
4. Parent xem `/dashboard/parent/proposals`.
5. Parent accept/reject.
6. Accepted proposal co the tao trial booking.

### 9.5 Booking To Class/Session

1. Booking created/scheduled.
2. Tutor accept/reject hoac admin schedule.
3. Booking completed.
4. Admin convert-to-class.
5. Class active/trial.
6. Sessions duoc tao.
7. Tutor/admin complete session.
8. Payment/earning duoc tao neu backend flow kich hoat.

### 9.6 Payment To Payout

1. Payment pending/processing duoc tao.
2. Student goi checkout.
3. Gateway/webhook hoac admin mark paid cap nhat payment.
4. Session/class/payment lien ket earning cho tutor.
5. Tutor request payout.
6. Finance/admin approve/reject payout.
7. Ledger/earning status update.

### 9.7 Complaint/Support

1. Case dispute/complaint xuat hien tu booking dispute hoac seed/backend data.
2. Admin/support xem `/admin/complaints`.
3. Admin assign owner.
4. Add note/timeline.
5. Investigate/wait parent/wait tutor/proposed resolution.
6. Resolve/close/escalate.
7. Audit log ghi hanh dong.

## 10. Gaps, Rui Ro, Can Test Live

### Critical

Khong thay critical source-level moi trong lan ra soat nay, nhung co cac vung phai live test truoc production.

### High

1. Payment gateway production:
   - Backend co simulated/mock gateway va production guard.
   - Can xac nhan gateway that da co adapter/cau hinh neu deploy production co thu tien that.

2. E2E RBAC:
   - Static permission FE/BE co map.
   - Can login bang tung role that de xac nhan sidebar/action/backend 403 khop nhau.

3. File private:
   - GET files permitAll trong SecurityConfig, dua vao FilePolicy.
   - Can test file public/private/owner/admin/no-token bang du lieu that.

4. Runtime data integrity:
   - Nhieu flow cross-module: request -> booking -> class -> session -> payment -> payout.
   - Can E2E de dam bao ID/link/status map dung o tat ca man.

### Medium

1. Mot so FE page dashboard/admin van dung local loading state, can tiep tuc audit tung page neu muc tieu la tat ca page deu co loading/error/retry chuan nhu public Phase 1.
2. Mot so type status la `string`, co the khong bat loi compile khi backend them status moi.
3. Refresh token call chua thay dung `fetchWithTimeout`; nen hardening API client tiep neu can.
4. Parent/student backend controllers co endpoints dashboard/progress/material/assignment nhung FE hien dung nhieu API chung; can test map co day du du lieu thuc hay moi la placeholder/data summary.
5. `/trial-bookings` standalone va `/bookings` platform cung ton tai, can xac dinh canonical API de tranh double workflow.

### Low

1. Mot so alias route `/tutor/*`, `/classes/*`, `/payments/*` can document ro de tranh team sua nham route cu.
2. Search/filter/pagination o mot so admin page co the con client-side sau khi fetch page hien tai, can can nhac server-side neu data lon.
3. Export/import moi manh o settings/master data; cac module khac co the chua co export.

## 11. QA Checklist Khong Bo Sot

### Public QA

- Homepage load thanh cong.
- Missing backend hien fallback/error dung.
- `/tutors` search/filter/sort dung voi BE.
- `/tutors/[id]` 404 hien not found, 5xx hien error/retry.
- Review tab co loading/error/retry/empty/success.
- Booking form validate phone/email/required fields.
- Register student online/offline location dung.
- Contact form validate, retry last payload.
- Metadata/sitemap/robots co route public quan trong.
- Mobile khong vo layout tren homepage, tutor list, tutor detail, booking, contact, register.

### Auth QA

- Register student/parent/tutor.
- Login role student -> `/dashboard/student`.
- Login parent -> `/dashboard/parent`.
- Login tutor -> `/dashboard/tutor`.
- Login admin role -> `/admin`.
- Forgot/reset/verify email.
- Token expired triggers logout/toast.
- 403 triggers no-permission UX.

### Student QA

- Tao learning request.
- Xem list/detail request.
- Cancel request.
- Dat booking.
- Xem booking list.
- Xem class/detail/session.
- Checkout payment.
- Tao review sau session.
- Favorite/unfavorite tutor.
- Notification read/read-all/delete.
- Message send/read.
- Verification student card/selfie/agreement/submit.

### Parent QA

- Tao/sua profile con.
- Xem proposal.
- Accept proposal.
- Reject proposal.
- Xem schedule/progress/payments cua con.
- Message/notification/settings.

### Tutor QA

- Hoan thien profile.
- Submit for review.
- Upload document.
- Upload verification.
- Sign agreement.
- Xem eligibility.
- Xem leads.
- Create/update/withdraw proposal.
- Accept booking.
- Reject booking.
- Xem classes/sessions.
- Complete session.
- Cancel session.
- Xem earnings.
- Request payout.
- Xem reviews/message/notification.

### Admin QA

- Role matrix cho admin/system/finance/tutor/support/verification.
- Dashboard overview.
- Operations work-items filters: search, priority, module, status, SLA, assigned, date, pagination.
- Quick actions: complete booking, rematch request, approve payout, assign complaint.
- Tutors approve/reject/request update/suspend/reactivate.
- Approval eligibility.
- Verification approve/reject/need more info.
- Learning request update status/assign/assign with booking/matching/rematch/cancel.
- Booking assign/schedule/complete/no-show/cancel/convert.
- Class create/update/pause/complete/cancel.
- Session create/update/complete/cancel/mark absent.
- Payment list/detail/checkout status/mark paid/mark failed/refund.
- Payout approve/reject.
- Reports overview/trends/funnel/revenue/distributions.
- Audit logs actor/action/resource/metadata.
- Students/parents/tutors CRM detail notes/risk flags.
- Contact request status/note.
- Conversation admin read.
- Notification send single/bulk.
- Reviews hide/show/flag.
- Complaint assign/update/note/timeline/resolve/close/escalate.
- Settings update with reason.
- Maintenance typed confirmation.
- System settings CRUD/history/import/export/sensitive preserve.
- Master data subject/location/certificate create/update/duplicate/toggle/delete/bulk/usage/export.

## 12. Release Readiness Checklist

Must pass:

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- Backend wrapper tests.
- Backend package.
- DB migration applied.
- Seed/demo roles verified.
- No build artifacts dirty.
- Env vars configured:
  - `NEXT_PUBLIC_API_BASE_URL`
  - `NEXT_PUBLIC_API_TIMEOUT_MS`
  - `NEXT_PUBLIC_AUTH_TOKEN_STORAGE`
  - Backend JWT secrets.
  - Payment gateway mode/secrets.
  - File storage config.
- CORS origin production set.
- Swagger disabled or protected if needed.
- Payment real adapter configured if real payments.
- Webhook signature tested.
- Private file access tested.
- Admin role accounts tested.

## 13. Ket Luan

He thong hien da co day du cac module can thiet cho mot nen tang gia su end-to-end:

- Public acquisition.
- Auth va profile.
- Student/parent/tutor dashboards.
- Tutor onboarding/verification/approval.
- Learning request/matching/proposal.
- Booking/class/session.
- Payment/refund/earning/payout.
- Review/message/notification/contact.
- Admin operations/complaint/reports/audit/settings/master data.
- RBAC va state transition policy.

Muc do hoan thien ve source: cao, da co workflow that va BE/FE map ro.

Muc do can xac nhan truoc production: E2E live data, gateway thật, file private, RBAC theo tung role va cross-module data integrity.
