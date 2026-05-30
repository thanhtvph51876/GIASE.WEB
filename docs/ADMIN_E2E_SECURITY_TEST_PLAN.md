# Admin E2E + Security Test Plan

Mục tiêu: xác minh Admin Console khớp granular RBAC backend, không gọi API ngoài quyền khi truy cập trực tiếp, và các action nhạy cảm luôn có confirm + reason.

## Role Matrix

| Role | Menu phải thấy | Menu không được thấy |
|---|---|---|
| `system_admin` / `admin` | Tất cả module admin | Không có |
| `finance_admin` | Operations, Payments, Payouts, Reports | Tutors, Tutor Approvals, Verifications, Requests, Bookings, Classes, Sessions, Audit, Settings |
| `tutor_admin` | Operations, Tutors, Tutor Approvals, Verifications, Requests, Bookings, Classes, Sessions, Reports | Payments, Payouts, Audit, Settings |
| `support_admin` | Operations, Students, Parents, Requests read-only, Bookings read-only, Classes read-only, Messages, Notifications, Contacts, Reviews, Reports | Payments, Payouts, Tutor approval actions, Audit, Settings |
| `verification_admin` | Operations, Verifications, Reports | Tutor approve action, Requests, Bookings, Classes, Payments, Payouts |

## E2E Flows

1. `system_admin`
   - Login, vào `/admin`.
   - Thấy toàn bộ sidebar.
   - Mở được tutors, verifications, learning requests, bookings, classes, sessions, payments, payouts, reports, audit logs, settings.

2. `finance_admin`
   - Login, vào `/admin`.
   - Chỉ thấy operations/payments/payouts/reports.
   - Truy cập trực tiếp `/admin/tutors` hiển thị 403 đẹp.
   - Network assertion: không có request tới `/admin/tutors`.
   - Refund payment mở dialog, bắt reason và typed confirmation.
   - Approve payout mở dialog, chặn payout thiếu thông tin ngân hàng.

3. `tutor_admin`
   - Thấy tutors, approvals, verifications, requests, bookings, classes, sessions, reports, operations.
   - Tutor đủ eligibility mới enable Approve.
   - Tutor thiếu commitment/certificate hiển thị disabled reason.
   - Matching request gọi `/admin/learning-requests/{id}/matching-tutors`.
   - Complete session mở confirm vì có hậu quả tài chính.

4. `support_admin`
   - Thấy students/parents, requests, bookings, classes, messages, notifications, contacts, reviews, reports, operations.
   - Requests/bookings/classes hiển thị chế độ chỉ xem hoặc action disabled.
   - Không có button refund, payout approve, tutor approve.

5. `verification_admin`
   - Thấy verifications/reports/operations.
   - Review giấy tờ bằng file endpoint có Authorization.
   - Duplicate document không enable approve.
   - Truy cập trực tiếp `/admin/payments` hiển thị 403 đẹp và không gọi payments API.

6. State machine
   - Booking complete chỉ enable khi `scheduled`.
   - Booking convert chỉ enable khi `completed`.
   - Session complete/cancel/absent chỉ enable khi `scheduled` hoặc `upcoming`.
   - Payment refund chỉ enable khi `paid`, `completed`, `partially_refunded`.
   - Payout approve/reject chỉ enable khi `pending`, `processing`, `approved`.

7. Audit
   - Reject tutor, refund payment, approve payout đều gửi reason.
   - Audit detail drawer hiển thị actor, role, action, entity, requestId/IP/userAgent nếu backend trả metadata.

## Security Assertions

| Case | Assertion |
|---|---|
| Direct route thiếu quyền | Render 403 trước khi mount page data hook |
| Sidebar theo role | Không render link ngoài permission map |
| Dashboard sub-role | Widget thiếu quyền không fetch endpoint liên quan |
| Action disabled | Click không gọi API khi thiếu permission hoặc sai status |
| 401 | Clear session và thông báo phiên hết hạn |
| 403 | Hiển thị không có quyền, không retry spam |
| 409/422 | Hiển thị reason backend, giữ page/session |
| 5xx/network | Giữ session, cho phép retry |

## Playwright Implementation Notes

Repo hiện chưa cài Playwright hoặc test runner E2E. Khi bổ sung dependency, tạo fixture login theo role, intercept `page.on("request")`, và assert forbidden route không phát sinh request tới endpoint bị cấm.
