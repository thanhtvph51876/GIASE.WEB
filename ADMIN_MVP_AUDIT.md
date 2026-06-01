# Admin MVP Audit

Ngày audit: 2026-06-01

Phạm vi: `app/admin/**`, API client/service liên quan và backend admin endpoints.

| Module | Route | FE API đang gọi | BE API thật | Tình trạng | Đã sửa | TODO |
|---|---|---|---|---|---|---|
| Dashboard | `/admin` | reports, operations, core services | `/admin/reports/*`, `/admin/operations/*` | API thật | Đã dùng service thật, không mock production | Widget phụ vẫn lấy page mặc định |
| Operations | `/admin/operations` | `adminOperationService.*` | `/admin/operations/*` | API thật | Có queue vận hành thật | Pagination queue chi tiết chưa tách từng tab |
| Tutors | `/admin/tutors` | `tutorService`, `adminService` | `/admin/tutors`, approve/reject/update/suspend/reactivate | API thật | Thêm pagination metadata qua `useAllTutors` | Search backend cho tutor admin cần mở rộng nếu muốn tìm toàn DB |
| Tutor approvals | `/admin/tutor-approvals` | tutor approval hooks | `/admin/tutors`, `/admin/tutor-documents/*` | API thật | Có eligibility + confirm dialog | Dùng list page mặc định |
| Verifications | `/admin/verifications` | `verificationService.adminListPage` | `/admin/verifications`, approve/reject/need-more-info | API thật | Thêm pagination, filter status/type giữ page reset | Cần test file private thực tế |
| Learning requests | `/admin/learning-requests`, `/admin/requests` | `useAdminLearningRequests` | `/admin/learning-requests`, assign/rematch/cancel/status | API thật | Thêm pagination qua hook | Search/filter nâng cao cần BE filter |
| Bookings | `/admin/bookings` | `bookingService.getAllBookingsPage` | `/admin/bookings`, schedule/complete/no-show/convert/cancel | API thật | Thêm pagination | Gán tutor hiện nhập Tutor ID thủ công |
| Classes | `/admin/classes` | `useClasses({role:"admin"})` | `/admin/classes`, pause/complete/cancel/sessions | API thật | Thêm pagination | Session preview lấy từ operations page mặc định |
| Sessions | `/admin/sessions` | `scheduleService.getAllSessionsPage` | `/admin/sessions`, complete/cancel/mark absent | API thật | Thêm pagination | Status filter UI chưa thêm |
| Payments | `/admin/payments` | `paymentService.getAllPaymentsPage`, tx/webhook/refund APIs | `/admin/payments`, mark-paid/mark-failed/refund | API thật | Thêm pagination cho payments, action UX đủ confirm/reason | Transactions/webhooks/refunds chưa phân trang UI |
| Payouts | `/admin/payouts` | `payoutService.getAllPayoutsPage` | `/admin/payouts`, approve/reject/detail | API thật | Thêm pagination, detail trước khi duyệt/từ chối | Cần test earning lock thực tế |
| Reports | `/admin/reports` | `adminApi.reports` | `/admin/reports/*` | API thật | Không mock | Report export chưa trong MVP |
| Audit logs | `/admin/audit-logs` | `auditLogService.getAllLogsPage` | `/admin/audit-logs` | API thật | Thêm pagination metadata | Filter hiện là client-side trong page hiện tại |
| Students | `/admin/students` | `adminService.getUsersPage({role:"student"})` | `/admin/users?role=student` | API thật | Thêm backend role/status/search filter + pagination | Detail profile học sinh sâu hơn chưa nối |
| Parents | `/admin/parents` | `adminService.getUsersPage({role:"parent"})` | `/admin/users?role=parent` | API thật | Thêm backend role/status/search filter + pagination | Detail profile phụ huynh sâu hơn chưa nối |
| Contacts | `/admin/contacts` | `contactService.getAllContactRequestsPage` | `/admin/contact-requests`, update status | API thật | Thêm pagination + handler thật từ BE | Status filter hiện client-side trên page |
| Messages | `/admin/messages` | `messageService.getAdminConversationsPage` | `/admin/conversations` | API thật | Thêm pagination | Màn detail conversation riêng chưa mở sâu |
| Notifications | `/admin/notifications` | `notificationService.getAdminNotificationsPage`, send/bulk | `/admin/notifications`, `/send`, `/send-bulk` | API thật | Bulk send một request, pagination log | User search server-side chưa có |
| Reviews | `/admin/reviews` | `reviewService.getAllReviewsPage` | `/admin/reviews`, hide/show/flag | API thật | Thêm pagination + action guard theo `reviews.manage` | Support admin hiện read-only theo BE |
| Complaints | `/admin/complaints` | `adminOperationService.disputesPage` | `/admin/disputes`, patch dispute | API thật | Thêm BE pagination cho disputes + FE pagination | Support admin hiện read-only; write cần BE cấp quyền riêng |
| Settings | `/admin/settings` | `settingsService` | `/admin/settings`, `/admin/system-settings` | API thật | Confirm/update UX đang có | Master data CRUD phụ thuộc endpoint hiện có |

## Mock/data hardcode

- Không thấy mock data production trong các luồng admin chính đã rà.
- Các fallback còn lại là empty/loading/error state.
- `apply_white_dynamic.js`, `update_theme.js` là script ngoài admin runtime, đã sửa để lint pass.

## Pagination đã thêm trong lượt này

- Payments, payouts, audit logs, learning requests, bookings, classes, sessions, tutors, verifications, contacts, reviews, students, parents, messages, notifications, complaints.
- API helper mới giữ `pagination` từ backend: `apiPageRequest`.

## Ghi chú

- Backend hiện hỗ trợ `page/pageSize` cho đa số list admin. Một số filter/search nâng cao vẫn cần bổ sung sau MVP nếu muốn tìm toàn DB thay vì lọc trong page hiện tại.
