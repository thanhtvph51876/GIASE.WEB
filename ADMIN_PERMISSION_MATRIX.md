# Admin Permission Matrix

Ngày cập nhật: 2026-06-01

Phạm vi: ma trận này mô tả quyền admin đang được frontend dùng trong `lib/admin/admin-permissions.ts` và backend chặn bằng `PermissionService` + `AdminPermissionInterceptor`.

## 1. Vai trò admin

| Role | Mục đích | Phạm vi chính |
|---|---|---|
| `admin` | Super admin vận hành toàn hệ thống | Toàn quyền |
| `system_admin` | Quản trị hệ thống/cấu hình | Toàn quyền |
| `finance_admin` | Tài chính, đối soát tiền, payout | Payments, payouts, reports, operations |
| `tutor_admin` | Vận hành gia sư, matching, lớp/buổi học | Tutors, verifications, requests, bookings, classes |
| `support_admin` | CSKH và hỗ trợ vận hành | Users read, contacts, messages, notifications, review read |
| `verification_admin` | Xác thực hồ sơ/giấy tờ | Verifications, verification files |

## 2. Module access FE

| Module FE | Route | Quyền đọc | Quyền xử lý |
|---|---|---|---|
| Tổng quan | `/admin` | Có admin role | Theo từng widget |
| Vận hành | `/admin/operations` | `operations.read` | Theo route chi tiết |
| Quản lý gia sư | `/admin/tutors` | `tutors.read` | `tutors.approve`, `tutors.reject`, `tutors.suspend` |
| Duyệt hồ sơ | `/admin/tutor-approvals` | `tutors.read` | `tutors.approve`, `tutors.reject` |
| Xác thực giấy tờ | `/admin/verifications` | `verifications.read` | `verifications.review` |
| Yêu cầu tìm gia sư | `/admin/learning-requests` | `learning_requests.read` | `learning_requests.manage`, `matching.manage` |
| Booking học thử | `/admin/bookings` | `bookings.read` | `bookings.manage` |
| Lớp học | `/admin/classes` | `classes.read` | `classes.manage` |
| Buổi học | `/admin/sessions` | `sessions.read` | `sessions.manage` |
| Thanh toán | `/admin/payments` | `payments.read` | `payments.manage`, `payments.mark_paid`, `payments.mark_failed`, `payments.refund` |
| Payout | `/admin/payouts` | `payouts.read` | `payouts.approve`, `payouts.reject` |
| Báo cáo | `/admin/reports` | `reports.read` | Read-only MVP |
| Nhật ký | `/admin/audit-logs` | `audit.read` | Read-only |
| Học sinh | `/admin/students` | `users.read` | `users.manage` |
| Phụ huynh | `/admin/parents` | `users.read` | `users.manage` |
| Liên hệ | `/admin/contacts` | `contact_requests.manage` | `contact_requests.manage` |
| Tin nhắn | `/admin/messages` | `conversations.read` | Read-only MVP |
| Thông báo | `/admin/notifications` | `notifications.read`, `notifications.send` | `notifications.send` |
| Đánh giá | `/admin/reviews` | `reviews.read` | `reviews.manage` |
| Cài đặt | `/admin/settings` | `settings.read` | `settings.update` |
| Khiếu nại | `/admin/complaints` | `operations.read` | FE dùng `complaints.manage`, BE hiện yêu cầu `admin.full_access` khi update dispute |

## 3. Quyền theo role FE

| Role | Có thể xem | Có thể xử lý |
|---|---|---|
| `admin` | Tất cả module | Tất cả action |
| `system_admin` | Tất cả module | Tất cả action |
| `finance_admin` | Payments, payouts, reports, operations | Mark paid, mark failed, refund, approve/reject payout |
| `tutor_admin` | Tutors, verifications, requests, bookings, classes, sessions, reports, operations | Duyệt gia sư, xác thực, matching, booking, class/session |
| `support_admin` | Users, requests, bookings, classes, sessions, messages, notifications, contacts, reviews, reports, operations | Gửi notification, xử lý contact |
| `verification_admin` | Verifications, reports, operations | Review/approve/reject verification |

## 4. Điểm backend cần chú ý

| Backend route | Backend permission |
|---|---|
| `POST /admin/payments/{id}/mark-paid` | `payments.mark_paid` |
| `POST /admin/payments/{id}/mark-failed` | `payments.mark_failed` |
| `POST /admin/payments/{id}/refund` | `payments.refund` |
| `POST /admin/payouts/{id}/approve` | `payouts.approve` |
| `POST /admin/payouts/{id}/reject` | `payouts.reject` |
| `POST/PATCH /admin/reviews/{id}/*` | `reviews.manage` |
| `PATCH /admin/disputes/{id}` | `admin.full_access` |
| `POST /admin/notifications/send*` | `notifications.send` |
| `/admin/contact-requests*` | `contact_requests.manage` |

## 5. Chênh lệch đã xử lý

- FE đã tách `payment.markPaid` sang `payments.mark_paid` và `payment.markFailed` sang `payments.mark_failed` để khớp backend.
- FE đã tách `learningRequest.assign` và `learningRequest.rematch` sang `matching.manage`.
- FE đã guard action review bằng `reviews.manage`, nên support admin chỉ đọc review theo backend hiện tại.
- FE đã guard action complaint bằng `complaints.manage`. Backend vẫn yêu cầu `admin.full_access` cho `PATCH /admin/disputes/{id}`, vì vậy role thường không thể update dispute cho tới khi backend được cấp rule riêng.

## 6. TODO quyền sau MVP

- Nếu muốn `support_admin` xử lý khiếu nại, cần quyết định rõ permission backend mới, ví dụ `complaints.manage`, rồi map interceptor cho `PATCH /admin/disputes/{id}` thay vì `admin.full_access`.
- Nếu muốn support được ẩn/flag review, cần cấp `reviews.manage` ở backend và FE. Hiện tại đang giữ read-only để an toàn.
- `sessions.manage` ở FE đang tồn tại độc lập, backend hiện gom `/admin/sessions` vào `classes.manage`; nếu cần tách role chi tiết hơn thì backend cần permission riêng.
