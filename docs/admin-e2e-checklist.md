# Admin E2E Checklist

Ngày cập nhật: 2026-06-02

Không fake pass. Nếu backend/local seed thiếu dữ liệu, ghi rõ blocker và tạo dữ liệu trước khi tick.

## 1. Accounts cần có

| Role | Email gợi ý | Dùng để test |
|---|---|---|
| `admin` | `admin@example.com` | Toàn quyền, audit, settings |
| `system_admin` | `system_admin@example.com` | Settings/master data/security |
| `finance_admin` | `finance_admin@example.com` | Payment/refund/payout |
| `tutor_admin` | `tutor_admin@example.com` | Tutor/request/booking/class/session/CRM tutor |
| `support_admin` | `support_admin@example.com` | Complaint/contact/message/CRM note/risk |
| `verification_admin` | `verification_admin@example.com` | Verification/file private |
| `student`/`parent`/`tutor` | seed hoặc register | Workflow end-to-end |

Chi tiết seed demo: `docs/admin-demo-seed.md`.

## 2. Tutor onboarding

| Step | Expected |
|---|---|
| Seed/register tutor | Tutor có profile `submitted`/`pending` |
| Upload verification docs | File private, status `pending_review` |
| Login verification/tutor admin | Chỉ thấy action đúng quyền |
| Approve/reject/need more info verification | Audit ghi actor/action/resource |
| Check tutor eligibility | Backend trả checklist/risk |
| Approve tutor | Tutor chuyển `approved`; user nhận notification |
| Try finance admin approve tutor | BE trả 403 |

## 3. Learning request to booking

| Step | Expected |
|---|---|
| Parent/student tạo request | Request xuất hiện admin queue |
| Operations work item | Có priority/SLA/recommended action |
| Admin xem matching tutors | Có score/reason nếu backend đủ data |
| Assign tutor hoặc assign with booking | Request status cập nhật, booking tạo nếu chọn flow booking |
| Rematch request | Status chuyển `rematch` hợp lệ |
| Audit | Có action assign/rematch/cancel |

## 4. Booking to class

| Step | Expected |
|---|---|
| Booking scheduled | Hiện ở `/admin/bookings` và operations upcoming |
| Booking quá giờ chưa xử lý | Hiện work item `BOOKING_OVERDUE` |
| Complete booking | Status `completed`, audit có reason |
| Convert to class | Class tạo/active hoặc trial theo backend |
| Invalid transition | Backend từ chối |

## 5. Session to payout

| Step | Expected |
|---|---|
| Class có session scheduled | Hiện `/admin/sessions` |
| Complete session | Session `completed`, earning sinh nếu đủ điều kiện |
| Payout pending | Hiện work item `PAYOUT_PENDING` |
| Finance approve payout | Payout status đúng, audit finance |
| Support approve payout | BE 403 |

## 6. Payment/refund

| Step | Expected |
|---|---|
| Payment pending >30m | Operations có `PAYMENT_PENDING_LONG` |
| Mark paid | Chỉ finance/admin/system làm được |
| Mark failed | Có reason/audit |
| Refund | Chỉ role có `payments.refund`; refund record đúng |
| Complaint refund resolution | Không tự sửa tiền, phải qua payment refund |

## 7. Complaint case management

| Step | Expected |
|---|---|
| Có booking dispute seed | `/admin/complaints` hiển thị case |
| Assign owner | Status `ASSIGNED`, owner là admin hiện tại, timeline/audit có |
| Add internal note | Note chỉ ở admin, không public |
| Investigating/waiting/proposed | State transition hợp lệ |
| Escalate | Status `ESCALATED`, priority/risk `CRITICAL` |
| Resolve | Status `RESOLVED`, resolutionType/note lưu |
| Close | Chỉ close sau state hợp lệ |
| Invalid transition | Backend trả lỗi business |

## 8. Settings/master data

| Step | Expected |
|---|---|
| Update operational settings | Confirm reason, maintenance cần typed confirmation |
| Sensitive key edit blank value | Không mất secret cũ |
| View history | Có audit history |
| Master data usage check | Hiện dependency trước khi ẩn |
| Bulk enable/disable | Có confirm reason/audit |
| Import dry-run | TODO nếu chưa hoàn thiện |

## 9. CRM detail nâng cao

| Step | Expected |
|---|---|
| Mở `/admin/students/[id]` | Có profile, request, booking, class, session, payment, refund, complaint |
| Mở `/admin/parents/[id]` | Có thông tin user/profile, risk flag payment/refund nếu có |
| Mở `/admin/tutors/[id]` | Có tutor profile, approval eligibility, verifications, earning, payout |
| Add internal note | Chỉ role có `crm.manage`, lưu `admin_internal_notes`, có audit |
| Add risk flag | Chỉ role có `crm.manage`, lưu `admin_risk_flags`, có audit |
| Resolve risk flag | Manual flag inactive, derived flag không resolve thủ công |
| Finance/verification thử add CRM note | Backend trả 403 |

## 10. Smoke routes

Mở các route admin chính với role phù hợp: `/admin`, `/admin/operations`, `/admin/complaints`, `/admin/settings`, `/admin/reports`, `/admin/audit-logs`, `/admin/tutors`, `/admin/verifications`, `/admin/learning-requests`, `/admin/bookings`, `/admin/classes`, `/admin/sessions`, `/admin/payments`, `/admin/payouts`.
