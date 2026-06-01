# Admin Production Ready Checklist

Ngày cập nhật: 2026-06-01

Mục tiêu: đồng bộ các màn admin frontend với backend API thật, giảm query chậm khi dữ liệu lớn, bỏ các luồng xử lý giả ở frontend và ghi rõ các điểm cần kiểm tra trước deploy.

## 1. Nâng cấp đã làm

### Backend

- Thêm phân trang cho các danh sách admin nặng: users, student/parent profiles, tutors, learning requests, bookings, classes, sessions, reviews, conversations, notifications, payments, payouts, contacts, audit logs.
- Thêm index hiệu năng cho các queue/list/report admin trong `V19__admin_query_performance_indexes.sql`.
- Thêm cache ngắn hạn cho các widget vận hành/report admin để giảm truy vấn lặp.
- Giảm N+1 ở danh sách lớp bằng query đếm session theo lớp.
- Thêm endpoint gửi thông báo hàng loạt:
  - `POST /api/v1/admin/notifications/send-bulk`
  - Backend tự resolve user active theo `targetRole` hoặc `userIds`, insert bằng batch.
  - Permission hiện đi qua rule `notifications.send` vì path bắt đầu bằng `/admin/notifications/send`.
- Nâng cấp contact admin:
  - Lưu người tiếp nhận bằng `contact_requests.assigned_to`.
  - Lưu `handled_at`, `handler_note`.
  - Response trả thêm `handledById`, `handledBy`, `handledAt`, `handlerNote`.
  - Audit log khi admin cập nhật trạng thái contact.
- Thêm migration `V20__admin_contact_and_notification_bulk.sql`.

### Frontend

- Trang `/admin/notifications` không còn gửi từng notification bằng `Promise.all` theo từng user khi chọn role.
- Thêm `notificationApi.sendBulk()` và `notificationService.sendAdminBulkNotification()`.
- Trang `/admin/contacts` không còn tự gán người xử lý giả từ frontend; lấy người xử lý thật do backend trả về.
- Bổ sung type cho `ContactRequest`: `handledById`, `handledBy`, `handledAt`, `handlerNote`.
- Bổ sung status helper dùng chung cho contact/review/dispute:
  - `getContactStatusLabel`
  - `getReviewStatusLabel`
  - `getDisputeStatusLabel`
- Trang `/admin/reviews` và `/admin/complaints` dùng nhãn trạng thái thống nhất hơn.
- Thêm API pagination helper `apiPageRequest()` để giữ metadata `pagination` từ backend.
- Thêm UI pagination dùng chung `components/admin/admin-pagination.tsx`.
- Bổ sung pagination UI cho các list admin lớn: payments, payouts, audit logs, learning requests, bookings, classes, sessions, tutors, verifications, contacts, reviews, students, parents, messages, notifications, complaints.
- Căn lại permission FE với backend cho `payments.mark_paid`, `payments.mark_failed`, `matching.manage`, `reviews.manage`.

## 2. Map Admin FE -> BE

| FE route | Backend/API chính | Trạng thái |
|---|---|---|
| `/admin` | `/admin/reports/overview`, `/admin/operations/overview`, report widgets | Đã map API thật |
| `/admin/tutors` | `/admin/tutors`, approve/reject/request-update/suspend/reactivate | Đã map API thật |
| `/admin/tutor-approvals` | `/admin/tutors`, `/admin/tutor-documents/{id}/approve|reject` | Đã map API thật |
| `/admin/learning-requests`, `/admin/requests` | `/admin/learning-requests`, status, assign tutor, matching tutors, rematch, cancel | Đã map API thật |
| `/admin/bookings` | `/admin/bookings`, assign tutor, schedule, complete, no-show, convert, cancel | Đã map API thật |
| `/admin/classes` | `/admin/classes`, create/update/pause/complete/cancel | Đã map API thật |
| `/admin/sessions` | `/admin/sessions`, complete/cancel/mark absent | Đã map API thật |
| `/admin/payments` | `/admin/payments`, mark-paid, mark-failed, refund, transactions, webhooks, refunds | Đã map API thật |
| `/admin/payouts` | `/admin/payouts`, approve, reject, detail | Đã map API thật |
| `/admin/reports` | `/admin/reports/*` | Đã map API thật |
| `/admin/audit-logs` | `/admin/audit-logs` | Đã map API thật |
| `/admin/students` | `/admin/users`, `/admin/student-profiles`, `/admin/users/{id}/status` | Đã map API thật |
| `/admin/parents` | `/admin/users`, `/admin/parent-profiles`, `/admin/users/{id}/status` | Đã map API thật |
| `/admin/contacts` | `/admin/contact-requests`, `/admin/contact-requests/{id}/status` | Đã nâng cấp handler thật |
| `/admin/notifications` | `/admin/notifications`, `/admin/notifications/send`, `/admin/notifications/send-bulk` | Đã nâng cấp bulk |
| `/admin/reviews` | `/admin/reviews`, hide/show/flag | Đã map API thật |
| `/admin/messages` | `/admin/conversations`, `/admin/conversations/{id}` | Đã map API thật |
| `/admin/verifications` | `/admin/verifications`, approve/reject/need-more-info | Đã map API thật |
| `/admin/operations` | `/admin/operations/*` | Đã map API thật |
| `/admin/complaints` | `/admin/disputes`, `/admin/disputes/{id}` | Đã map API thật |
| `/admin/settings` | `/admin/settings`, `/admin/system-settings` | Đã map API thật |

## 3. Checklist production

- Chạy Flyway migration tới `V20`.
- Set `NEXT_PUBLIC_API_BASE_URL` ở môi trường production, không để fallback localhost.
- Đảm bảo admin roles có permission:
  - `notifications.send`
  - `contact_requests.manage`
  - `operations.read`
  - `admin.full_access` cho xử lý dispute nếu cần.
  - `reviews.manage` cho role được phép hide/show/flag review.
- Kiểm tra DB bằng dữ liệu lớn:
  - `/admin/notifications?page=1&pageSize=100`
  - `/admin/contact-requests?page=1&pageSize=100`
  - `/admin/classes?page=1&pageSize=100`
  - `/admin/reports/overview`
- Kiểm tra E2E bằng user admin thật:
  - gửi bulk notification theo role
  - cập nhật contact từ `new` sang `contacted/resolved`
  - lọc review theo tutor/class
  - mở complaint detail và update dispute status
  - duyệt/từ chối payout từ màn detail

## 4. Kết quả kiểm tra

- Frontend TypeScript: `npx tsc --noEmit --incremental false` pass.
- Frontend lint: `npm run lint` pass.
- Frontend production build: `npm run build` pass. Lần đầu bị `EPERM` khi unlink `.next`, chạy ngoài sandbox thì pass.
- Backend compile: `.\mvnw.cmd -DskipTests compile` pass.
- Backend test: `.\mvnw.cmd test` pass, trong đó 17 integration tests bị skip vì Docker/Testcontainers không khả dụng trên máy hiện tại.
- Backend package: `.\mvnw.cmd clean package` pass.
- Lưu ý repo backend: Maven để lại thay đổi build artifact trong `target/`; lệnh dọn `git restore --worktree target` chưa chạy được vì escalation bị từ chối bởi giới hạn usage môi trường.

## 5. Ghi chú rủi ro còn lại

- Search/filter sâu ở một số màn vẫn là TODO nếu cần tìm toàn DB: tutors, reviews, audit logs, contacts.
- `adminService.getAllUsers()` trong notification vẫn lấy page mặc định để chọn user thủ công; với dữ liệu rất lớn nên bổ sung server-side user search/autocomplete.
- `support_admin` hiện chỉ đọc review và complaint theo backend. Muốn support xử lý complaint cần đổi backend permission cho `PATCH /admin/disputes/{id}` từ `admin.full_access` sang permission riêng như `complaints.manage`.
- Cần test với database production-like để xác nhận query plan dùng đúng index mới.
