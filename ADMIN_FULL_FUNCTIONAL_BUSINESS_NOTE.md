# Ghi chú đầy đủ chức năng và nghiệp vụ Admin

Ngày cập nhật: 2026-06-02

Phạm vi: màn admin frontend `H:\website-clone`, backend admin API `H:\backend`, các service API map giữa FE và BE, quyền RBAC, audit log và nghiệp vụ vận hành nền tảng Gia Sư Sư Phạm.

Mức xác nhận hiện tại:

| Hạng mục | Trạng thái |
|---|---|
| Frontend admin | Đã có route, UI, service/API client và permission guard theo source |
| Backend admin API | Đã có controller, service, RBAC, audit theo source |
| Build frontend | `npx tsc --noEmit` pass, `npm run lint` pass, `npm run build` pass |
| Build/test backend | `mvn package` pass, `mvn test` pass; integration Testcontainers bị skip do không có Docker |
| Runtime local | `/admin/settings` trả HTTP 200 tại `http://127.0.0.1:3000/admin/settings`; các route admin mới đã pass production build |
| E2E bằng tài khoản admin thật | Chưa xác minh đầy đủ từng workflow dữ liệu sống |

## 0. Bản cập nhật mới nhất của admin

Admin hiện đã được nâng thêm 3 mảng production-level quan trọng:

| Mảng | Đã nâng cấp | Ý nghĩa nghiệp vụ |
|---|---|---|
| Operations cockpit | Thêm endpoint `GET /api/v1/admin/operations/work-items`, UI lọc theo priority, module, status, SLA, owner, ngày tạo, quick action có confirm reason | Admin nhìn được việc nào gấp, việc nào quá SLA, việc nào rủi ro cao, không còn chỉ là tab danh sách cơ bản |
| Complaint case management | Thêm state machine case, owner, SLA, priority, risk, timeline, internal notes, resolution panel, trang detail `/admin/complaints/[id]` | Khiếu nại trở thành một case xử lý thật, có lịch sử, người phụ trách và kết luận rõ |
| Permission FE/BE | Đồng bộ `sessions.read/manage`, đổi dispute write từ `admin.full_access` sang `complaints.manage`, support admin được xử lý complaint nhưng không được finance/settings | Tránh lệch quyền giữa frontend và backend, giảm tình huống FE cho bấm nhưng BE chặn hoặc BE mở quá rộng |

Các API/action mới đã có:

| API | Mục đích |
|---|---|
| `GET /api/v1/admin/operations/work-items` | Gom toàn bộ việc cần xử lý trong ngày theo SLA/priority/risk |
| `POST /api/v1/admin/disputes/{id}/assign` | Assign owner cho complaint case |
| `POST /api/v1/admin/disputes/{id}/notes` | Thêm internal note, không public cho user |
| `POST /api/v1/admin/disputes/{id}/timeline` | Thêm timeline event thủ công |
| `POST /api/v1/admin/disputes/{id}/resolve` | Resolve case với `resolutionType` và `resolutionNote` |
| `POST /api/v1/admin/disputes/{id}/close` | Close case sau khi xử lý xong |
| `POST /api/v1/admin/disputes/{id}/escalate` | Escalate case, đẩy priority/risk lên `CRITICAL` |
| `PATCH /api/v1/admin/disputes/{id}` | Cập nhật trạng thái case theo state machine mới |

## 1. Vai trò của khu admin

Khu admin hiện không còn là một màn cấu hình cơ bản. Nó đang đóng vai trò back-office vận hành toàn bộ marketplace gia sư:

| Nhóm nghiệp vụ | Admin đang làm |
|---|---|
| Điều hành nền tảng | Theo dõi dashboard, hàng đợi vận hành, rủi ro booking, rủi ro verification, payout, payment, dispute |
| Quản lý gia sư | Duyệt hồ sơ, yêu cầu bổ sung, từ chối, suspend/reactivate, xem chi tiết, kiểm tra giấy tờ |
| Quản lý yêu cầu học | Theo dõi learning request, matching gia sư, assign tutor, rematch, cancel |
| Quản lý booking/lớp/buổi học | Điều phối booking học thử, chuyển booking thành lớp, quản lý lớp và session |
| Tài chính | Theo dõi payment, mark paid/failed, refund, payout approve/reject, kiểm soát ledger |
| CSKH/support | Xử lý liên hệ, tin nhắn, thông báo, đánh giá, khiếu nại |
| Báo cáo/audit | Xem báo cáo vận hành, báo cáo finance, audit log hành động admin |
| Quản lý hệ thống | Cài đặt vận hành, key/value hệ thống, master data CRUD nâng cao |

Nguyên tắc triển khai: frontend giúp admin thao tác đúng và nhìn đúng dữ liệu; backend là nguồn sự thật cuối cùng cho quyền, trạng thái, tiền, dữ liệu nhạy cảm và audit log.

## 2. Role và quyền admin

Admin hiện có phân quyền hạt nhỏ ở frontend, đồng thời backend vẫn enforce bằng RBAC/security.

| Role | Vai trò nghiệp vụ | Module chính | Ghi chú |
|---|---|---|---|
| `admin` | Super admin | Tất cả | Có toàn quyền đọc/ghi, finance, settings, master data, audit |
| `system_admin` | Quản trị hệ thống | Tất cả | Hiện được cấp toàn quyền như admin để xử lý cấu hình sâu |
| `finance_admin` | Tài chính | Payments, payouts, reports, operations | Không quản lý tutor/settings/master data |
| `tutor_admin` | Vận hành gia sư/lớp | Tutors, verifications, requests, matching, bookings, classes, sessions, reports, operations | Không xử lý finance sâu |
| `support_admin` | CSKH/case support | Users read, requests/bookings/classes/sessions read, conversations, notifications, contacts, reviews read, complaints manage, reports, operations | Được xử lý complaint case; không được refund, approve payout, approve tutor hoặc sửa settings |
| `verification_admin` | Xác minh hồ sơ | Verifications, verification files, reports, operations | Tập trung giấy tờ, xác thực danh tính/bằng cấp |

Các nhóm permission chính:

| Nhóm permission | Dùng cho |
|---|---|
| `tutors.*` | Đọc, duyệt, từ chối, suspend gia sư |
| `verifications.*`, `files.view_verification` | Xem/duyệt hồ sơ xác minh và file riêng tư |
| `learning_requests.*`, `matching.*` | Quản lý yêu cầu học, matching, assign tutor |
| `bookings.*`, `classes.*`, `sessions.*` | Điều phối booking, lớp, buổi học |
| `payments.*`, `payouts.*` | Quản trị thu tiền, hoàn tiền, chi trả tutor |
| `reports.read`, `operations.read`, `audit.read` | Báo cáo, cockpit vận hành, nhật ký |
| `users.*`, `conversations.read`, `notifications.*`, `contact_requests.manage` | CSKH và user support |
| `reviews.*`, `complaints.manage` | Quản trị đánh giá/khiếu nại |
| `settings.*`, `master_data.*` | Cấu hình hệ thống và danh mục lõi |

## 3. Bản đồ module admin

| Module | Route | Quyền đọc/ghi | Nghiệp vụ chính | API/BE đang map |
|---|---|---|---|---|
| Dashboard | `/admin` | Admin role bất kỳ | Tổng quan KPI, trạng thái nền tảng, lối vào nhanh các module | Admin summary/report APIs |
| Operations | `/admin/operations` | `operations.read` | SLA cockpit xử lý work items: tutor pending, verification, matching, booking, payment, refund, payout, tutor quality, complaint | `/admin/operations/*`, đặc biệt `/admin/operations/work-items` |
| Gia sư | `/admin/tutors`, `/admin/tutors/[id]` | `tutors.read`, ghi qua `tutors.approve/reject/suspend` | Quản lý danh sách, chi tiết, trạng thái hồ sơ gia sư | Admin tutor APIs |
| Duyệt hồ sơ | `/admin/tutor-approvals` | `tutors.read`, ghi qua approve/reject | Duyệt tutor pending, kiểm tra điều kiện đủ trước khi approve | Admin tutor approval APIs |
| Xác thực giấy tờ | `/admin/verifications` | `verifications.read/review`, `files.view_verification` | Duyệt tài liệu, approve/reject/need more info | Verification admin APIs, private file API |
| Learning requests | `/admin/learning-requests`, `/admin/requests`, `/admin/requests/[id]` | `learning_requests.read/manage`, `matching.*` | Quản lý yêu cầu tìm gia sư, matching, assign, rematch, cancel | Learning request/matching APIs |
| Booking | `/admin/bookings`, `/admin/bookings/[id]` | `bookings.read/manage` | Điều phối booking học thử, lịch, complete, cancel, convert | Booking admin APIs |
| Lớp học | `/admin/classes`, `/admin/classes/[id]` | `classes.read/manage` | Quản lý lớp sau booking, active/pause/complete/cancel | Class admin APIs |
| Buổi học | `/admin/sessions` | `sessions.read/manage` | Quản lý session, complete/cancel/absent | Session/admin class APIs |
| Payments | `/admin/payments` | `payments.read/manage/mark_paid/mark_failed/refund` | Đối soát thanh toán, mark paid/failed, refund | Payment admin APIs, webhook/transaction/refund data |
| Payouts | `/admin/payouts` | `payouts.read/approve/reject` | Duyệt chi trả tutor, kiểm tra earning/bank/ledger | Payout admin APIs |
| Reports | `/admin/reports` | `reports.read` | Báo cáo tổng quan, trend, subject, tutor, funnel, teaching mode, export CSV | Reports APIs |
| Audit logs | `/admin/audit-logs` | `audit.read` | Tra cứu nhật ký hành động admin, metadata, actor, resource | Audit log APIs |
| Students | `/admin/students` | `users.read/manage` | Quản lý người dùng học sinh ở mức admin | User/admin APIs |
| Parents | `/admin/parents` | `users.read/manage` | Quản lý phụ huynh, quan hệ với học sinh | Parent/user admin APIs |
| Contacts | `/admin/contacts` | `contact_requests.manage` | Xử lý yêu cầu liên hệ, trạng thái, note xử lý | Contact admin APIs |
| Messages | `/admin/messages` | `conversations.read` | Xem hội thoại phục vụ hỗ trợ | Conversation/message APIs |
| Notifications | `/admin/notifications` | `notifications.read/send` | Gửi thông báo đơn lẻ/hàng loạt, theo role/user | Notification admin APIs |
| Reviews | `/admin/reviews` | `reviews.read/manage` | Quản trị đánh giá, ẩn/hiện/flag nếu có quyền | Review admin APIs |
| Complaints | `/admin/complaints`, `/admin/complaints/[id]` | Đọc qua `operations.read`, ghi qua `complaints.manage` | Case management: owner, SLA, priority/risk, timeline, internal notes, resolution, escalate/resolve/close | `/admin/disputes/*` |
| Settings | `/admin/settings` | `settings.read/update`, `master_data.read/manage` | Cài đặt vận hành, key/value, master data CRUD nâng cao | Settings/master-data admin APIs |

## 4. Nghiệp vụ chi tiết từng module

### 4.1 Dashboard `/admin`

Mục đích: cho admin nhìn nhanh tình trạng toàn hệ thống.

Admin đang dùng màn này để:

| Chức năng | Ý nghĩa nghiệp vụ |
|---|---|
| Xem KPI tổng quan | Nhìn số lượng user/tutor/request/booking/payment hoặc thống kê tương ứng |
| Điều hướng nhanh | Nhảy sang module đang cần xử lý |
| Hiển thị theo quyền | Admin role khác nhau chỉ thấy module được cấp quyền |
| Tải dữ liệu chịu lỗi | Các request summary dùng kiểu tải độc lập; một nhóm dữ liệu lỗi không nhất thiết làm sập toàn màn |

### 4.2 Operations `/admin/operations`

Mục đích: cockpit trung tâm để admin biết hôm nay phải xử lý việc gì trước, việc nào quá SLA, việc nào rủi ro cao và việc nào có thể xử lý nhanh ngay từ một màn.

Operations hiện không chỉ là các tab queue rời rạc. Backend đã có endpoint chuẩn `GET /api/v1/admin/operations/work-items` để tính work item từ dữ liệu thật hiện có.

Mỗi work item có các field nghiệp vụ:

| Field | Ý nghĩa |
|---|---|
| `module` | Module xử lý: tutors, verifications, learningRequests, bookings, payments, payouts, complaints... |
| `itemType` | Loại việc: `TUTOR_PENDING_APPROVAL`, `BOOKING_OVERDUE`, `COMPLAINT_SLA_OVERDUE`... |
| `title` | Tên hiển thị để admin nhận diện nhanh |
| `status` | Trạng thái hiện tại của entity |
| `priority` | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `riskLevel` | Mức rủi ro nghiệp vụ, cũng là `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `slaDueAt` | Hạn SLA cần xử lý |
| `overdue` | Đã quá SLA hay chưa |
| `recommendedAction` | Hành động hệ thống khuyến nghị |
| `detailHref` | Link tới màn xử lý chi tiết |
| `assignedAdmin`/`assignedAdminId` | Người phụ trách nếu work item có owner |
| `relatedType`/`relatedId` | Entity liên quan để trace sang booking/payment/tutor/request... |

Các queue nghiệp vụ đã được gom vào work-items:

| Queue | Admin xử lý gì |
|---|---|
| Tutor pending approval | Tutor ở `submitted`, `pending`, `pending_verification`, `verified`, `need_update`, `needs_more_documents`; SLA 24h, quá 48h thành critical |
| Verification pending/need more info | Hồ sơ xác minh pending lâu, duplicate file hoặc risk score cao |
| Learning request unmatched | Request chưa có tutor, chưa match, hoặc vẫn ở trạng thái matching/waiting proposal |
| Request matching fail | Request matching quá 12h mà chưa có proposal |
| Booking upcoming | Booking `scheduled` sắp diễn ra trong 24h |
| Booking overdue | Booking đã qua giờ nhưng chưa complete/cancel |
| Booking no-show risk | Booking có trạng thái no-show hoặc có record no-show gần đây |
| Payment pending long | Payment `pending/processing` quá 30 phút |
| Payment reconciliation | Payment `failed/expired` cần kiểm tra gateway/webhook hoặc hỗ trợ khách |
| Refund pending | Refund `pending/processing` cần finance theo dõi |
| Payout pending | Payout chờ duyệt, thiếu thông tin bank hoặc quá SLA 48h |
| Tutor quality warning | Tutor rating thấp, response rate thấp, cancelled/no-show nhiều |
| Complaint open | Case complaint chưa đóng, cần assign/điều tra/resolve |
| Complaint SLA overdue | Case quá SLA, được đẩy `CRITICAL` |

Bộ lọc UI đang có:

| Filter | Dùng để |
|---|---|
| Search | Tìm theo title, module, item type, status, priority, risk, recommended action, owner |
| Priority | Lọc `LOW/MEDIUM/HIGH/CRITICAL` |
| Module | Lọc theo module xử lý |
| Status | Lọc trạng thái entity |
| SLA | Lọc quá SLA/chưa quá SLA |
| Assigned to me | Lọc case/work item đang assign cho admin hiện tại |
| Created date | Lọc theo ngày tạo |
| Pagination | Chia trang 20 item/lần để màn không quá tải |

Quick actions đang có trên operations:

| Quick action | Điều kiện quyền | Gọi nghiệp vụ |
|---|---|---|
| Mark booking completed | `bookings.manage` | `bookingService.completeTrial`, ghi kết quả booking |
| Rematch request | `matching.manage` | `learningRequestService.rematchRequest` |
| Approve payout | `payouts.approve` | `payoutService.approvePayout` |
| Nhận complaint case | `complaints.manage` | `adminOperationService.assignDispute` |

Tất cả quick action đều có confirm reason ở frontend và backend vẫn kiểm tra quyền lần nữa. Nếu không đủ quyền, nút bị disable hoặc backend trả 403.

### 4.3 Quản lý gia sư `/admin/tutors`

Mục đích: quản trị vòng đời tutor từ đăng ký đến hoạt động.

Chức năng đang có:

| Chức năng | Nghiệp vụ |
|---|---|
| Danh sách tutor | Xem tutor theo trạng thái, dữ liệu hồ sơ, thông tin liên quan |
| Chi tiết tutor | Xem profile, năng lực, giấy tờ, trạng thái vận hành |
| Approve | Chuyển tutor đủ điều kiện sang trạng thái được phép hoạt động |
| Reject | Từ chối hồ sơ không đạt, bắt buộc có lý do |
| Request update | Yêu cầu tutor bổ sung/chỉnh sửa hồ sơ |
| Suspend | Tạm khóa tutor khỏi vận hành do rủi ro/chính sách |
| Reactivate | Mở lại tutor sau khi xử lý xong vấn đề |
| Guard theo quyền | Chỉ role có `tutors.approve/reject/suspend` mới được thao tác |

Luồng nghiệp vụ:

1. Tutor đăng ký và cập nhật hồ sơ.
2. Tutor gửi xác minh/giấy tờ nếu cần.
3. Admin kiểm tra hồ sơ, giấy tờ, trạng thái đủ điều kiện.
4. Nếu đạt, admin approve để tutor tham gia marketplace.
5. Nếu thiếu, admin request update.
6. Nếu không đạt, admin reject và ghi lý do.
7. Nếu tutor đang hoạt động nhưng vi phạm/rủi ro, admin suspend.
8. Mọi hành động quan trọng được ghi audit.

### 4.4 Duyệt hồ sơ `/admin/tutor-approvals`

Mục đích: tách riêng hàng đợi tutor cần duyệt.

Chức năng đang có:

| Chức năng | Nghiệp vụ |
|---|---|
| Xem hồ sơ pending | Admin tập trung vào các tutor chờ duyệt |
| Eligibility gate | Backend kiểm tra điều kiện đủ trước khi approve |
| Approve nhanh | Duyệt hồ sơ hợp lệ |
| Reject/request update | Từ chối hoặc yêu cầu bổ sung có lý do |
| Confirm reason | Thao tác nhạy cảm có dialog xác nhận/lý do |

Điểm quan trọng: approve tutor không chỉ là đổi status ở UI. Backend phải xác nhận hồ sơ đủ điều kiện, giúp tránh duyệt nhầm tutor chưa có thông tin bắt buộc.

### 4.5 Xác thực giấy tờ `/admin/verifications`

Mục đích: xử lý giấy tờ định danh/bằng cấp/chứng chỉ.

Chức năng đang có:

| Chức năng | Nghiệp vụ |
|---|---|
| Danh sách verification | Xem hồ sơ xác minh theo loại/trạng thái |
| Xem file riêng tư | Chỉ role có `files.view_verification` được xem tài liệu |
| Approve | Xác nhận giấy tờ hợp lệ |
| Reject | Từ chối giấy tờ không hợp lệ, có lý do |
| Need more info | Yêu cầu bổ sung thông tin/tài liệu |
| Audit | Lưu actor, action, resource, metadata |

Luồng nghiệp vụ:

1. Tutor upload giấy tờ/xác minh.
2. Verification admin xem thông tin và file private.
3. Admin approve nếu hợp lệ, reject nếu sai, hoặc yêu cầu bổ sung.
4. Kết quả verification ảnh hưởng đến eligibility khi duyệt tutor.

### 4.6 Learning requests `/admin/learning-requests`, `/admin/requests`

Mục đích: quản lý nhu cầu học và điều phối gia sư phù hợp.

Chức năng đang có:

| Chức năng | Nghiệp vụ |
|---|---|
| Danh sách yêu cầu | Xem yêu cầu học từ học sinh/phụ huynh |
| Chi tiết request | Xem môn, lớp, khu vực, lịch, mode học, ngân sách, trạng thái |
| Matching tutors | Backend trả danh sách tutor phù hợp kèm score/reason |
| Assign tutor | Chọn tutor phù hợp và tạo/đẩy sang booking |
| Rematch | Mở lại tìm kiếm nếu tutor không phù hợp hoặc booking fail |
| Cancel | Hủy request khi khách không còn nhu cầu hoặc sai dữ liệu |
| Permission guard | Ghi cần `learning_requests.manage` hoặc `matching.manage` |

Luồng nghiệp vụ:

1. Student/parent tạo yêu cầu tìm gia sư.
2. Admin xem queue request cần xử lý.
3. Hệ thống gợi ý tutor dựa trên môn, địa điểm, hình thức học, lịch, điều kiện khác.
4. Admin chọn tutor và assign.
5. Request chuyển sang trạng thái đã match/đang booking.
6. Nếu thất bại, admin rematch.
7. Nếu nhu cầu kết thúc, admin cancel và ghi lý do.

### 4.7 Booking `/admin/bookings`

Mục đích: điều phối booking học thử hoặc buổi đầu.

Chức năng đang có:

| Chức năng | Nghiệp vụ |
|---|---|
| Danh sách/chi tiết booking | Theo dõi lịch, tutor, learner, trạng thái, payment liên quan |
| Schedule | Sắp lịch hoặc cập nhật lịch booking |
| Complete | Xác nhận booking đã hoàn tất |
| No-show/absent handling | Ghi nhận trường hợp không tham gia nếu luồng hỗ trợ |
| Convert | Chuyển booking thành lớp chính thức |
| Cancel | Hủy booking có lý do |
| Confirm reason | Các hành động rủi ro có xác nhận/lý do |

Luồng nghiệp vụ:

1. Request được assign tutor hoặc user tạo booking.
2. Admin kiểm tra thời gian/tutor/student/payment.
3. Booking được schedule.
4. Sau học thử, admin complete hoặc xử lý hủy/no-show.
5. Nếu học thử thành công, admin convert sang class.
6. Nếu không phù hợp, request có thể quay lại rematch.

### 4.8 Classes `/admin/classes`

Mục đích: quản lý lớp chính thức sau booking.

Chức năng đang có:

| Chức năng | Nghiệp vụ |
|---|---|
| Danh sách lớp | Xem lớp theo trạng thái, tutor, học sinh, lịch học |
| Chi tiết lớp | Xem thông tin lớp, booking gốc, session liên quan |
| Active/pause/complete/cancel | Quản lý vòng đời lớp |
| Trial result handling | Xử lý kết quả học thử để active/rematch/cancel |
| Permission guard | Cần `classes.manage` cho thao tác ghi |

Luồng nghiệp vụ:

1. Booking thành công được chuyển thành lớp.
2. Lớp có tutor, learner, môn học, lịch học, chính sách thanh toán.
3. Admin can thiệp khi cần pause/cancel/complete.
4. Session của lớp tạo dữ liệu học tập và tài chính.

### 4.9 Sessions `/admin/sessions`

Mục đích: quản lý từng buổi học trong lớp.

Chức năng đang có:

| Chức năng | Nghiệp vụ |
|---|---|
| Danh sách session | Theo dõi buổi học theo thời gian/trạng thái |
| Complete | Xác nhận buổi học đã diễn ra |
| Cancel | Hủy buổi học |
| Mark student absent | Ghi học sinh vắng |
| Mark tutor absent | Ghi tutor vắng |
| Tác động tài chính | Session hoàn tất/vắng/hủy có thể ảnh hưởng payment/payout |

Điểm đã đồng bộ: frontend dùng `sessions.read/manage`, backend interceptor cũng đã tách `/admin/sessions/**` sang `sessions.read/manage` thay vì gom nhầm vào `classes.read/manage`. `tutor_admin` có quyền quản lý session, `support_admin` chỉ đọc session.

### 4.10 Payments `/admin/payments`

Mục đích: đối soát và xử lý thanh toán.

Chức năng đang có:

| Chức năng | Nghiệp vụ |
|---|---|
| Danh sách payment | Xem payment theo trạng thái, user, booking/class, số tiền |
| Mark paid | Xác nhận payment đã thanh toán khi cần đối soát thủ công |
| Mark failed | Ghi nhận payment thất bại |
| Refund | Hoàn tiền theo quyền `payments.refund` |
| Xem transaction/webhook/refund | Theo dõi dấu vết thanh toán và phản hồi gateway |
| Confirm reason | Thao tác tài chính cần lý do/xác nhận |

Luồng nghiệp vụ:

1. Payment được tạo khi user đặt lịch/mua buổi/lớp.
2. Gateway hoặc admin cập nhật trạng thái.
3. Nếu webhook lệch hoặc thiếu, finance admin đối soát thủ công.
4. Nếu cần hoàn tiền, admin tạo refund.
5. Payment/refund ảnh hưởng ledger và payout.

### 4.11 Payouts `/admin/payouts`

Mục đích: duyệt chi trả cho tutor.

Chức năng đang có:

| Chức năng | Nghiệp vụ |
|---|---|
| Danh sách payout | Xem payout chờ duyệt/đã xử lý |
| Chi tiết payout | Kiểm tra tutor, earning, ngân hàng, số tiền |
| Approve | Duyệt chi trả nếu hợp lệ |
| Reject | Từ chối payout có lý do |
| Ledger awareness | Payout liên quan earning/ledger/payment đã ghi nhận |

Luồng nghiệp vụ:

1. Session/payment tạo earning cho tutor.
2. Payout được tạo hoặc đưa vào hàng đợi.
3. Finance admin kiểm tra bank info, số tiền, trạng thái earning.
4. Admin approve để chi trả hoặc reject để xử lý lại.
5. Mọi thao tác tài chính cần audit.

### 4.12 Reports `/admin/reports`

Mục đích: đọc sức khỏe hệ thống.

Chức năng đang có:

| Báo cáo | Ý nghĩa |
|---|---|
| Overview | Tổng quan user, tutor, request, booking, payment |
| Trends | Xu hướng theo thời gian |
| Subject | Nhu cầu theo môn học |
| Tutor | Hiệu suất/đóng góp của tutor |
| Funnel | Phễu từ request đến booking/lớp |
| Teaching mode | Online/offline/hybrid hoặc mode tương ứng |
| Export CSV | Xuất dữ liệu báo cáo để kiểm tra ngoài hệ thống |

### 4.13 Audit logs `/admin/audit-logs`

Mục đích: truy vết hành động admin.

Chức năng đang có:

| Chức năng | Nghiệp vụ |
|---|---|
| Danh sách audit | Xem actor, action, resource, thời gian |
| Metadata | Xem dữ liệu before/after hoặc thông tin liên quan |
| Filter/search ở UI | Hỗ trợ điều tra nhanh theo nguồn dữ liệu có sẵn |
| Ghi log backend | Hành động admin quan trọng ghi audit ở backend |

Nhóm action đã được tăng audit trong đợt nâng cấp:

| Nhóm action | Metadata ghi thêm |
|---|---|
| Master data create/update/delete | `before`, `after`, `usage`, kind/id |
| Master data bulk status | `ids`, `isActive`, `affected` |
| System setting create/update/delete | `key`, `before`, `after`, `changedFields` |
| Sensitive setting | Value nhạy cảm được sanitize, không phơi raw value trong audit |

### 4.14 Students và Parents

Mục đích: support và quản lý user học sinh/phụ huynh.

Chức năng đang có:

| Module | Admin làm gì |
|---|---|
| `/admin/students` | Xem/quản lý danh sách học sinh, hỗ trợ trạng thái user |
| `/admin/parents` | Xem/quản lý phụ huynh, quan hệ phụ huynh-học sinh nếu backend có dữ liệu |

Nghiệp vụ: admin dùng để hỗ trợ booking, payment, request và liên hệ khách hàng. Đây chưa phải CRM sâu, nhưng đã có mặt trong admin để tra cứu và xử lý vận hành.

### 4.15 Contacts `/admin/contacts`

Mục đích: xử lý form liên hệ từ website.

Chức năng đang có:

| Chức năng | Nghiệp vụ |
|---|---|
| Xem danh sách contact | Nhận yêu cầu từ khách hàng |
| Cập nhật trạng thái | Ghi nhận mới/đang xử lý/đã xử lý hoặc trạng thái tương ứng |
| Ghi note xử lý | Lưu nội dung xử lý nội bộ |
| handledBy/handledAt | Theo dõi ai xử lý và xử lý lúc nào |

### 4.16 Messages `/admin/messages`

Mục đích: hỗ trợ vận hành hội thoại.

Chức năng đang có:

| Chức năng | Nghiệp vụ |
|---|---|
| Xem conversation | Admin/support đọc hội thoại để hỗ trợ |
| Điều tra theo booking/request/class | Dùng hội thoại để hiểu tranh chấp hoặc lỗi vận hành |
| Guard quyền | Cần `conversations.read` |

### 4.17 Notifications `/admin/notifications`

Mục đích: gửi thông báo vận hành.

Chức năng đang có:

| Chức năng | Nghiệp vụ |
|---|---|
| Xem thông báo | Theo dõi notification đã có |
| Gửi thông báo | Gửi message tới user hoặc nhóm user |
| Target theo role/user | Phục vụ thông báo bảo trì, payment, booking, policy |
| Guard quyền | Cần `notifications.send` để gửi |

### 4.18 Reviews `/admin/reviews`

Mục đích: quản trị đánh giá để bảo vệ chất lượng marketplace.

Chức năng đang có:

| Chức năng | Nghiệp vụ |
|---|---|
| Danh sách review | Xem đánh giá tutor/lớp |
| Quản lý review | Ẩn/hiện/flag nếu có quyền |
| Support role đọc | `support_admin` hiện chủ yếu đọc review |
| Tutor quality | Review là đầu vào cho vận hành chất lượng tutor |

### 4.19 Complaints `/admin/complaints`

Mục đích: xử lý complaint/dispute như một case management thật, không còn chỉ là danh sách khiếu nại.

Chức năng đang có:

| Chức năng | Nghiệp vụ |
|---|---|
| Danh sách complaint case | Xem toàn bộ case từ `/admin/disputes`, có pagination |
| Filter/search | Lọc theo status, priority, SLA overdue, owner, text search |
| Priority/risk badge | Hiển thị `LOW/MEDIUM/HIGH/CRITICAL` để biết mức nghiêm trọng |
| SLA overdue badge | Cảnh báo case quá hạn xử lý |
| Assign owner | Admin/support nhận xử lý case; ghi timeline và audit |
| Escalate | Đẩy case sang `ESCALATED`, priority/risk thành `CRITICAL` |
| Resolve nhanh | Resolve case đơn giản từ list nếu trạng thái hợp lệ |
| Detail page | `/admin/complaints/[id]` hiển thị header case, related entity, reporter/target, timeline, notes, resolution |
| Internal notes | Admin thêm ghi chú nội bộ, `INTERNAL_ONLY`, không public cho user |
| Timeline events | Lưu lịch sử status change, assign owner, note, manual event |
| Resolution panel | Chọn `resolutionType`, nhập `resolutionNote`, resolve/close case |
| Link entity liên quan | Mở booking/payment/payout/class/session/tutor/user liên quan |
| Permission guard | Đọc qua `operations.read`, ghi qua `complaints.manage` |

State machine complaint đang hỗ trợ:

| Trạng thái | Ý nghĩa |
|---|---|
| `NEW` | Case mới, chưa có owner |
| `ASSIGNED` | Đã assign người phụ trách |
| `INVESTIGATING` | Đang điều tra |
| `WAITING_PARENT` | Đang chờ phụ huynh/học sinh phản hồi |
| `WAITING_TUTOR` | Đang chờ gia sư phản hồi |
| `PROPOSED_RESOLUTION` | Đã có phương án xử lý đề xuất |
| `RESOLVED` | Đã xử lý xong về nghiệp vụ |
| `CLOSED` | Đóng case, không còn follow-up |
| `ESCALATED` | Case nghiêm trọng/quá SLA, cần cấp cao hoặc xử lý gấp |
| `REJECTED` | Khiếu nại không đủ căn cứ hoặc không hợp lệ |

Resolution type đang có:

| Resolution type | Ý nghĩa nghiệp vụ |
|---|---|
| `NO_ACTION` | Không cần hành động thêm |
| `WARNING` | Cảnh báo user/tutor |
| `REFUND` | Hoàn tiền toàn phần, nhưng tiền phải xử lý qua payment refund flow |
| `PARTIAL_REFUND` | Hoàn tiền một phần, vẫn phải qua payment refund flow |
| `COMPENSATION` | Bồi hoàn/hỗ trợ ngoài luồng tiền chính |
| `TUTOR_SUSPENDED` | Kết luận cần suspend tutor, nhưng suspend phải làm qua tutor flow với quyền `tutors.suspend` |
| `BOOKING_CANCELLED` | Kết luận cần hủy booking |
| `CLASS_CANCELLED` | Kết luận cần hủy lớp |
| `OTHER` | Kết luận khác |

Điểm an toàn quan trọng:

| Quy tắc | Lý do |
|---|---|
| Complaint resolution refund không tự sửa tiền | Tránh support tự mutate payment; refund phải qua role có `payments.refund` |
| Complaint resolution suspend không tự khóa tutor | Suspend phải qua tutor module và quyền `tutors.suspend` |
| Status transition kiểm tra ở backend | Không cho chuyển trạng thái sai workflow |
| Assign/note/resolve/close/escalate đều audit | Điều tra được ai làm gì, khi nào, vì sao |
| Support admin được xử lý case nhưng không được finance/settings | Đúng nghiệp vụ CSKH, không vượt quyền tài chính/hệ thống |

## 5. Màn quản lý hệ thống nâng cao `/admin/settings`

Đây là phần vừa được nâng cấp mạnh nhất. Màn này hiện có 3 tab lớn.

### 5.1 Tab Vận hành

Mục đích: chỉnh cấu hình nền tảng đang ảnh hưởng trực tiếp đến booking, đăng ký tutor, matching và notification.

| Cấu hình | Ý nghĩa nghiệp vụ |
|---|---|
| `bookingEnabled` | Bật/tắt khả năng tạo booking học thử mới |
| `tutorRegistrationEnabled` | Bật/tắt cổng đăng ký gia sư |
| `autoMatchingEnabled` | Bật/tắt gợi ý matching từ backend |
| `maintenanceMode` | Đưa hệ thống vào trạng thái bảo trì |
| `commissionRate` | Tỷ lệ hoa hồng nền tảng |
| `trialLessonPolicy` | Chính sách học thử |
| `notificationSettings.email` | Bật/tắt cảnh báo qua email |
| `notificationSettings.inApp` | Bật/tắt thông báo in-app |
| `notificationSettings.paymentAlerts` | Bật/tắt cảnh báo thanh toán |
| `notificationSettings.reviewAlerts` | Bật/tắt cảnh báo đánh giá |

Kiểm soát an toàn:

| Cơ chế | Tác dụng |
|---|---|
| Chỉ role có `settings.update` mới sửa được | Tránh support/finance/tutor admin đổi cấu hình hệ thống |
| Dialog lý do khi lưu | Bắt admin ghi lý do để audit |
| `maintenanceMode` cần typed confirmation `MAINTENANCE` | Tránh bật bảo trì nhầm |
| Backend audit | Ghi actor và metadata thay đổi |

### 5.2 Tab Key/value system settings

Mục đích: quản lý cấu hình động dạng key/value, dùng cho các service cần cấu hình linh hoạt mà không sửa code.

Chức năng CRUD nâng cao:

| Chức năng | Đang làm gì |
|---|---|
| List key/value | Tải toàn bộ `/admin/system-settings` |
| Search | Tìm theo key, mô tả, value |
| Filter type | Lọc `string`, `number`, `boolean`, `json` |
| Create key | Tạo key mới, validate key không rỗng |
| Update key | Sửa value, type, mô tả, sensitive flag |
| Duplicate key | Nhân bản key để tạo cấu hình tương tự |
| Delete key | Xóa key có confirm reason |
| History | Xem lịch sử thay đổi của từng key |
| Import JSON | Import nhiều setting từ file JSON |
| Export JSON | Xuất toàn bộ settings ra JSON |
| Sensitive value | Value nhạy cảm không hiển thị raw value từ backend |
| Preserve sensitive value | Khi sửa key sensitive mà để trống value, FE gửi `skipValue` để không ghi đè mất secret |

Kiểu dữ liệu hỗ trợ:

| Type | Cách parse |
|---|---|
| `string` | Giữ nguyên text |
| `number` | Chuyển sang số |
| `boolean` | `true`/`false` |
| `json` | Parse JSON nếu hợp lệ; fallback text nếu lỗi parse |

Backend endpoints đã map:

| Endpoint | Mục đích |
|---|---|
| `GET /api/v1/admin/system-settings` | Danh sách key/value |
| `POST /api/v1/admin/system-settings` | Tạo/upsert key |
| `PATCH /api/v1/admin/system-settings/{key}` | Cập nhật key |
| `GET /api/v1/admin/system-settings/{key}/history` | Lịch sử/audit key |
| `DELETE /api/v1/admin/system-settings/{key}` | Xóa key |

### 5.3 Tab Danh mục hệ thống CRUD

Mục đích: quản lý master data lõi đang được public site, tutor profile, learning request và matching dùng chung.

Danh mục đang CRUD:

| Danh mục | Dùng ở đâu | Field nghiệp vụ |
|---|---|---|
| Subjects | Tìm gia sư, learning request, tutor profile, báo cáo subject | Tên, mã, nhóm môn, mô tả, active, cờ học thuật/ngoại ngữ/luyện thi/kỹ năng |
| Locations | Địa điểm học, tìm kiếm, request, tutor service area | Tên, mã, loại `PROVINCE`/`WARD`/`SPECIAL_ZONE`, parent, full path, active |
| Certificates | Hồ sơ/chứng chỉ tutor, xác minh năng lực | Tên, mã, mô tả, language liên quan, active |

Chức năng CRUD nâng cao:

| Chức năng | Đang làm gì |
|---|---|
| List active/inactive | Admin thấy cả danh mục đang dùng và đang ẩn |
| Search | Tìm theo tên, mã, mô tả, metadata |
| Filter status | Lọc tất cả/đang dùng/đang ẩn |
| Create | Tạo item mới theo schema từng loại |
| Update | Sửa item hiện có |
| Duplicate | Nhân bản item để tạo biến thể nhanh |
| Toggle active | Bật/tắt từng item |
| Soft delete | Xóa mềm bằng cách ẩn khỏi lựa chọn mới, giữ dữ liệu lịch sử |
| Bulk enable/disable | Chọn nhiều item rồi bật/ẩn hàng loạt |
| Usage check | Kiểm tra dependency trước khi ẩn/xóa |
| Export JSON | Xuất danh mục hiện tại |
| Confirm reason | Xóa/bulk update cần lý do |
| Audit metadata | Backend log before/after/usage/affected |

Backend endpoints đã map:

| Endpoint | Mục đích |
|---|---|
| `GET /api/v1/admin/master-data/subjects` | List subject admin, có inactive |
| `GET /api/v1/admin/master-data/locations` | List location admin, có inactive |
| `GET /api/v1/admin/master-data/certificates` | List certificate admin, có inactive |
| `POST /api/v1/admin/master-data/{kind}` | Tạo item |
| `PATCH /api/v1/admin/master-data/{kind}/{id}` | Sửa item |
| `DELETE /api/v1/admin/master-data/{kind}/{id}` | Xóa mềm/ẩn item |
| `GET /api/v1/admin/master-data/{kind}/{id}/usage` | Kiểm tra nơi đang tham chiếu |
| `POST /api/v1/admin/master-data/{kind}/bulk-status` | Bật/tắt hàng loạt |

Tác động nghiệp vụ của master data:

| Thay đổi | Ảnh hưởng |
|---|---|
| Ẩn môn học | Môn đó không còn dùng cho lựa chọn mới, nhưng request/lớp cũ vẫn giữ dữ liệu |
| Thêm môn học | Public search, tutor profile, learning request có thể dùng môn mới |
| Ẩn location | Tránh user chọn địa điểm không còn phục vụ |
| Sửa full path/parent location | Ảnh hưởng hiển thị địa chỉ, filter khu vực |
| Thêm certificate | Tutor có thể khai báo/chứng minh chứng chỉ mới |
| Ẩn certificate | Không dùng cho hồ sơ mới nhưng lịch sử vẫn giữ |

## 6. State machine nghiệp vụ chính

### 6.1 Tutor lifecycle

| Trạng thái/nhánh | Ý nghĩa | Admin action |
|---|---|---|
| Draft/profile incomplete | Tutor chưa đủ hồ sơ | Yêu cầu bổ sung |
| Pending approval | Chờ admin duyệt | Approve/reject/request update |
| Approved/active | Được tham gia marketplace | Theo dõi chất lượng, có thể suspend |
| Rejected | Không đạt | Ghi lý do, có thể cho submit lại tùy backend |
| Suspended | Tạm khóa vận hành | Reactivate sau khi xử lý |

### 6.2 Verification lifecycle

| Trạng thái/nhánh | Ý nghĩa | Admin action |
|---|---|---|
| Pending | Hồ sơ/tài liệu chờ duyệt | Review |
| Approved | Tài liệu hợp lệ | Dùng cho eligibility |
| Rejected | Tài liệu không hợp lệ | Ghi lý do |
| Need more info | Thiếu thông tin | Yêu cầu tutor bổ sung |

### 6.3 Learning request lifecycle

| Trạng thái/nhánh | Ý nghĩa | Admin action |
|---|---|---|
| New/open | Khách có nhu cầu tìm gia sư | Xem chi tiết, matching |
| Matching | Đang tìm tutor phù hợp | Xem score/reason, chọn tutor |
| Assigned/booked | Đã chọn tutor hoặc tạo booking | Theo dõi booking |
| Rematch | Tutor/booking không phù hợp | Tìm tutor khác |
| Cancelled | Nhu cầu hủy/kết thúc | Ghi lý do |

### 6.4 Booking -> class lifecycle

| Giai đoạn | Ý nghĩa | Admin action |
|---|---|---|
| Booking created | Đã có booking học thử | Kiểm tra lịch/tutor/student |
| Scheduled | Đã chốt lịch | Theo dõi diễn ra |
| Completed | Học thử xong | Convert thành lớp hoặc đóng |
| Cancelled/no-show | Không diễn ra | Cancel/rematch/refund nếu cần |
| Converted | Thành lớp chính thức | Quản lý ở module classes |

### 6.5 Payment/payout lifecycle

| Giai đoạn | Ý nghĩa | Admin action |
|---|---|---|
| Payment pending | Chờ thanh toán/gateway | Theo dõi webhook |
| Paid | Đã thu tiền | Ghi nhận ledger/booking/class |
| Failed | Thanh toán lỗi | Mark failed hoặc yêu cầu thanh toán lại |
| Refunded | Hoàn tiền | Finance admin xử lý refund |
| Earning ready | Tutor có earning | Đưa vào payout |
| Payout pending | Chờ duyệt chi trả | Approve/reject |
| Payout approved/rejected | Đã xử lý | Audit và ledger theo backend |

### 6.6 Complaint/dispute lifecycle

Luồng chuẩn:

1. Case được tạo từ booking dispute hoặc dữ liệu liên quan.
2. Case ở `NEW`, có SLA mặc định 48h nếu chưa set.
3. Admin/support nhận case, chuyển `ASSIGNED`.
4. Người phụ trách điều tra, chuyển `INVESTIGATING`.
5. Nếu thiếu thông tin, chuyển `WAITING_PARENT` hoặc `WAITING_TUTOR`.
6. Khi có phương án, chuyển `PROPOSED_RESOLUTION`.
7. Nếu xử lý xong, chuyển `RESOLVED` và ghi `resolutionType/resolutionNote`.
8. Sau khi không còn follow-up, chuyển `CLOSED`.
9. Nếu case quá SLA/rủi ro cao, chuyển `ESCALATED`.
10. Nếu không đủ căn cứ, chuyển `REJECTED`.

Các field case production:

| Field | Ý nghĩa |
|---|---|
| `relatedType`, `relatedId` | Entity liên quan: booking, class, session, payment, payout, review, user, tutor |
| `reporterType`, `reporterId` | Ai gửi khiếu nại |
| `targetUserId` | Người bị khiếu nại hoặc đối tượng liên quan |
| `priority`, `riskLevel` | Mức ưu tiên và rủi ro |
| `slaDueAt`, `overdue` | SLA và trạng thái quá hạn |
| `assignedAdminId` | Owner xử lý |
| `resolutionType`, `resolutionNote` | Kết luận xử lý |
| `internalNotes`/`admin_internal_notes` | Ghi chú nội bộ |
| `booking_dispute_timeline_events` | Timeline thao tác |

## 7. Map FE/BE quan trọng

| Mảng | FE file chính | BE/API |
|---|---|---|
| Permission admin | `lib/admin/admin-permissions.ts` | Backend Security/RBAC/interceptor |
| Admin action guard | `lib/admin/admin-actions.ts` | Backend trạng thái + quyền |
| Settings | `app/admin/settings/page.tsx`, `lib/services/settings-service.ts`, `lib/api/settings-api.ts` | `/admin/settings`, `/admin/system-settings/*` |
| Master data | `app/admin/settings/page.tsx`, `lib/services/master-data-service.ts`, `lib/api/master-data-api.ts` | `/admin/master-data/*` |
| Operations cockpit | `app/admin/operations/page.tsx`, `lib/services/admin-operation-service.ts`, `lib/hooks/use-admin.ts` | `/admin/operations/overview`, `/admin/operations/work-items`, queue APIs cũ |
| Complaint case | `app/admin/complaints/page.tsx`, `app/admin/complaints/[id]/page.tsx`, `lib/services/admin-operation-service.ts` | `/admin/disputes`, `/admin/disputes/{id}`, `/assign`, `/notes`, `/timeline`, `/resolve`, `/close`, `/escalate` |
| Tutors/approval | `app/admin/tutors/*`, `app/admin/tutor-approvals/page.tsx` | Admin tutor endpoints |
| Verification | `app/admin/verifications/page.tsx`, verification/file services | Verification admin endpoints |
| Requests/matching | `app/admin/learning-requests/page.tsx`, `app/admin/requests/*` | Learning request/matching endpoints |
| Booking/class/session | `app/admin/bookings/*`, `app/admin/classes/*`, `app/admin/sessions/page.tsx` | Booking/class/session admin endpoints |
| Finance | `app/admin/payments/page.tsx`, `app/admin/payouts/page.tsx` | Payment/payout admin endpoints |
| Reports/audit | `app/admin/reports/page.tsx`, `app/admin/audit-logs/page.tsx` | Reports/audit endpoints |

## 8. Kiểm soát an toàn và audit

Các thao tác admin nhạy cảm hiện có nhiều lớp kiểm soát:

| Lớp | Đang làm gì |
|---|---|
| UI permission | Ẩn/disable thao tác nếu role không đủ quyền |
| Action availability | Kiểm tra action có hợp lệ với module/trạng thái hiện tại |
| Confirm reason dialog | Bắt nhập lý do cho thao tác nhạy cảm |
| Typed confirmation | Dùng với thao tác nguy hiểm như maintenance mode |
| Backend RBAC | Backend là lớp chặn cuối cùng |
| Audit log | Ghi actor/action/resource/metadata |
| Sensitive masking | Không trả/lộ secret value trong UI/audit |
| Soft delete master data | Không phá dữ liệu lịch sử khi danh mục đang có tham chiếu |
| Usage check | Cho admin biết item có dependency trước khi ẩn |
| SLA/risk/priority | Operations và complaint hiển thị việc gấp, việc quá hạn, việc rủi ro cao |
| State machine complaint | Backend kiểm tra transition complaint, không cho đổi trạng thái tùy tiện |
| Internal notes | Note complaint là nội bộ admin, không public cho user |
| Finance guard trong complaint | Resolution refund chỉ ghi kết luận, tiền vẫn phải xử lý qua payment refund flow |

Các action complaint/case đã audit:

| Action | Audit/action nghiệp vụ |
|---|---|
| Assign owner | `admin.dispute.assign`, có before/after và reason |
| Status update | `admin.dispute.update`, có timeline status change |
| Add internal note | `admin.dispute.note`, có metadata độ dài note, note lưu nội bộ |
| Add timeline event | `admin.dispute.timeline`, ghi event type |
| Resolve/close/escalate | Gọi qua dispute update, có reason và before/after |

## 9. Những gì đã là bản nâng cao

So với CRUD cơ bản, admin hiện đã có các phần nâng cao sau:

| Nâng cao | Ví dụ cụ thể |
|---|---|
| CRUD có nghiệp vụ | Master data có active/soft delete/usage, không xóa cứng mù |
| Bulk action | Bật/tắt nhiều danh mục cùng lúc |
| Import/export | System settings import/export JSON, master data export |
| History | Xem lịch sử từng system setting |
| Audit metadata before/after | Backend ghi dữ liệu trước/sau thay đổi |
| Sensitive secret handling | Không show raw secret, sửa sensitive không làm mất value cũ |
| Typed confirmation | Maintenance mode cần gõ xác nhận |
| Permission granular | Role finance/tutor/support/verification khác nhau |
| Cross-module workflow | Request -> matching -> booking -> class -> session -> payment/payout |
| Finance controls | Mark paid/failed/refund/payout approve/reject có quyền riêng |
| Operations SLA cockpit | Work item có priority/risk/SLA/overdue/recommended action/link chi tiết |
| Complaint case management | Owner, timeline, internal note, resolution, state machine, escalate/resolve/close |
| Permission FE/BE parity | `sessions.manage` và `complaints.manage` đã đồng bộ giữa UI/backend interceptor |
| Demo seed production | Có đủ role admin, tutor statuses, verification statuses, payment/refund, payout, complaint states, audit |
| CRM detail nâng cao | `/admin/students/[id]`, `/admin/parents/[id]`, `/admin/tutors/[id]` có history, notes, risk flags |
| CRM CRUD nâng cao | Add internal note, add/resolve manual risk flag, derived risk từ backend |

## 10. Việc còn nên nâng tiếp

Các điểm sau chưa nên gọi là hoàn hảo production-level cho mọi case:

| Ưu tiên | Việc cần nâng |
|---|---|
| Cao | Chạy E2E bằng tài khoản admin thật cho tutor approval, matching, booking convert, payment refund, payout approve |
| Cao | Test complaint case bằng dữ liệu thật: assign, investigate, wait parent/tutor, proposed resolution, resolve, close, escalate |
| Trung bình | Viết Playwright/Cypress E2E tự động cho 6 flow admin thay vì checklist thủ công |
| Trung bình | Thêm saved filters, pagination sâu, export cho audit/contacts/tutors/reviews |
| Trung bình | Thêm dashboard alert theo SLA và cảnh báo realtime/websocket nếu backend hỗ trợ |
| Thấp | Thêm import master data có validate/dry-run thay vì chỉ export |

## 11. Kết luận

Admin hiện đang làm được đầy đủ các nhóm nghiệp vụ vận hành chính của một nền tảng gia sư: quản lý tutor, xác minh, request, matching, booking, class/session, payment, payout, support, reports, audit và quản lý hệ thống.

Phần vừa nâng cấp lên bản cao gồm 3 trụ cột: `/admin/settings` có quản lý system key/value và master data CRUD nâng cao; `/admin/operations` có SLA cockpit/work-items; `/admin/complaints` có case management thật với owner, timeline, note và resolution.

Điểm còn thiếu không phải là "chỉ có CRUD cơ bản", mà là cần tự động hóa E2E, report scheduling/export nâng cao và import dry-run cho settings/master data nếu muốn tiến thêm lên production BI/ops.

## 12. Tài liệu bàn giao mới

| Tài liệu | Mục đích |
|---|---|
| `docs/admin-business-flow.md` | Nghiệp vụ tutor, verification, request, booking, session, payout, payment/refund, complaint, operations, settings/master data |
| `docs/admin-permission-matrix.md` | Role/module/action/FE permission/BE permission/endpoint |
| `docs/admin-e2e-checklist.md` | Checklist demo và test workflow thật bằng dữ liệu local/seed |
| `docs/admin-release-checklist.md` | Checklist build, migration, permission, finance, security trước deploy |
| `docs/admin-demo-seed.md` | Tài khoản demo, mật khẩu, dữ liệu seed, route kiểm thử nhanh |

## 13. Checklist demo chức năng admin đang làm

| Demo | Route | Cần role | Kết quả cần thấy |
|---|---|---|---|
| Tổng quan admin | `/admin` | Admin role bất kỳ | KPI/module theo quyền |
| SLA cockpit | `/admin/operations` | `operations.read` | Work-items có priority/risk/SLA/filter/quick action |
| Case queue | `/admin/complaints` | `operations.read` | List case, filter status/priority/SLA/owner, action assign/escalate/resolve |
| Case detail | `/admin/complaints/[id]` | `operations.read`, ghi cần `complaints.manage` | Header case, related entity, reporter/target, timeline, notes, resolution panel |
| Duyệt tutor | `/admin/tutor-approvals`, `/admin/tutors/[id]` | `tutors.approve/reject` | Eligibility, approve/reject/request update |
| CRM học sinh | `/admin/students/[id]` | `users.read`, ghi cần `crm.manage` | Profile, request, booking, class, session, payment, refund, complaint, note, risk |
| CRM phụ huynh | `/admin/parents/[id]` | `users.read`, ghi cần `crm.manage` | Profile, refund/risk context, complaint, note, risk |
| CRM gia sư | `/admin/tutors/[id]` | `tutors.read`, ghi cần `crm.manage` | Tutor profile, eligibility, verification, session, earning, payout, complaint, note, risk |
| Xác minh giấy tờ | `/admin/verifications` | `verifications.review`, `files.view_verification` | Approve/reject/need more info, file private |
| Ghép gia sư | `/admin/learning-requests`, `/admin/requests/[id]` | `matching.manage` | Matching tutors, assign, assign with booking, rematch |
| Booking học thử | `/admin/bookings`, `/admin/bookings/[id]` | `bookings.manage` | Schedule, complete, no-show, convert, cancel |
| Lớp học | `/admin/classes`, `/admin/classes/[id]` | `classes.manage` | Active/pause/complete/cancel |
| Buổi học | `/admin/sessions` | `sessions.manage` | Complete/cancel/student absent/tutor absent |
| Thanh toán | `/admin/payments` | `payments.*` | Mark paid/failed, refund, transaction/webhook/refund |
| Payout | `/admin/payouts` | `payouts.approve/reject` | Approve/reject payout |
| Báo cáo | `/admin/reports` | `reports.read` | Overview, trends, funnel, revenue, subject/mode distribution |
| Audit | `/admin/audit-logs` | `audit.read` | Actor/action/resource/metadata |
| Liên hệ | `/admin/contacts` | `contact_requests.manage` | Update status/note xử lý |
| Tin nhắn | `/admin/messages` | `conversations.read` | Xem conversation hỗ trợ |
| Thông báo | `/admin/notifications` | `notifications.send` | Gửi thông báo đơn/bulk |
| Đánh giá | `/admin/reviews` | `reviews.read/manage` | Xem, hide/show/flag nếu có quyền |
| Cài đặt vận hành | `/admin/settings` tab Vận hành | `settings.update` | Booking/tutor registration/auto matching/maintenance/commission/policy/notification |
| Key/value hệ thống | `/admin/settings` tab Key/value | `settings.update` | CRUD key, type string/number/boolean/json, sensitive, history, import/export |
| Master data CRUD | `/admin/settings` tab Danh mục CRUD | `master_data.manage` | Subject/location/certificate create/update/duplicate/active/hidden/bulk/usage/export |

## 14. Kết quả kiểm thử gần nhất

| Lệnh | Kết quả |
|---|---|
| `npx tsc --noEmit` | Pass |
| `npm run lint` | Pass |
| `npm run build` | Pass, route mới `/admin/complaints/[id]`, `/admin/students/[id]`, `/admin/parents/[id]`, `/admin/tutors/[id]` đã được build |
| `.\mvnw.cmd test` | Pass: 28 tests, 0 fail/error, 17 integration tests skip vì không có Docker/Testcontainers |
| `.\mvnw.cmd package` | Pass |
| `git diff --check` | Pass, chỉ warning CRLF Windows |
