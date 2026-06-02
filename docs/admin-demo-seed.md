# Admin Demo Seed

Ngày cập nhật: 2026-06-02

Seeder chỉ chạy khi database rỗng và `seed.enabled=true`. Mật khẩu demo dùng đúng như bảng dưới.

## 1. Admin accounts

| Role | Email | Password | Phạm vi test |
|---|---|---|---|
| `admin` | `admin@example.com` | `Admin123!` | Toàn quyền |
| `system_admin` | `system_admin@example.com` | `Admin123!` | Settings, master data, audit |
| `finance_admin` | `finance_admin@example.com` | `Admin123!` | Payment, refund, payout |
| `tutor_admin` | `tutor_admin@example.com` | `Admin123!` | Tutor onboarding, request, booking, class, session, CRM tutor |
| `support_admin` | `support_admin@example.com` | `Admin123!` | Complaint, contact, conversation, CRM note/risk |
| `verification_admin` | `verification_admin@example.com` | `Admin123!` | Verification files |

## 2. User/tutor demo

| Nhóm | Email | Password | Dữ liệu |
|---|---|---|---|
| Student | `student@example.com` | `Student123!` | Profile, request, booking, class, payment, CRM |
| Parent | `parent@example.com` | `Parent123!` | Profile, request, refund pending, CRM |
| Tutor approved | `tutor@example.com` | `Tutor123!` | Tutor approved, rating, class/session/payout |
| Tutor pending | `tutor_pending@example.com` | `Tutor123!` | Hồ sơ chờ duyệt |
| Tutor need update | `tutor_need_update@example.com` | `Tutor123!` | Hồ sơ cần bổ sung |
| Tutor suspended | `tutor_suspended@example.com` | `Tutor123!` | Hồ sơ tạm khóa/risk critical |

## 3. Seed coverage

| Mảng | Có dữ liệu |
|---|---|
| Roles | `admin`, `system_admin`, `finance_admin`, `tutor_admin`, `support_admin`, `verification_admin` |
| Tutor statuses | `approved`, `pending`, `need_update`, `rejected`, `suspended` |
| Verifications | `pending_review`, `approved`, `rejected`, `need_more_info`; có cả `student_card`, `tutor_identity`, `tutor_certificate` |
| Requests | `new`, `consulting`, `matched`, `trial_scheduled`, `trial_completed`, `active`, `rematch`, `cancelled`, `completed` |
| Bookings | `pending`, `assigned`, `accepted`, `scheduled`, `completed`, `rejected`, `cancelled`, `converted` |
| Classes/sessions | Lớp `active/paused`, session `scheduled/completed/cancelled` |
| Payments/refunds | Payment `pending/paid/partially_refunded/refunded`; refund `pending/succeeded` |
| Payouts | `pending`, `completed`, `rejected` |
| Complaints | Legacy `OPEN/IN_REVIEW` và case mới `NEW/ASSIGNED/INVESTIGATING/WAITING_PARENT/PROPOSED_RESOLUTION/ESCALATED/CLOSED` |
| CRM | Internal notes, manual risk flags, derived risk flags từ status/complaint/refund |
| Audit | Audit seed chung và audit theo từng admin role |

## 4. Demo route nhanh

| Route | Kiểm tra |
|---|---|
| `/admin/students` → CRM | Xem request/booking/class/payment/refund/complaint/note/risk |
| `/admin/parents` → CRM | Xem refund pending và risk payment review |
| `/admin/tutors` → CRM | Xem eligibility, verification, session, earning, payout, complaint |
| `/admin/complaints` | Lọc state mới, assign, note, resolve, close |
| `/admin/payments` | Mark paid/failed/refund theo quyền finance |
| `/admin/payouts` | Approve/reject theo quyền finance |
| `/admin/audit-logs` | Kiểm actor/role/action từ seed và thao tác thật |

## 5. Lưu ý

Complaint resolution chỉ lưu kết luận case. Nếu cần refund, phải qua `/admin/payments/{id}/refund`; nếu cần khóa/mở tutor, phải qua action tutor riêng. Đây là rule cố ý để support không mutate finance/tutor trực tiếp.
