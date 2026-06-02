# Admin Business Flow

Ngày cập nhật: 2026-06-02

Tài liệu này mô tả nghiệp vụ admin production-level cho Gia Sư Sư Phạm. Backend là nguồn sự thật cho quyền, trạng thái, tiền, file nhạy cảm và audit; frontend là lớp hiển thị, lọc, confirm reason và giảm thao tác sai.

## 1. Tutor lifecycle

| Giai đoạn | Trạng thái chính | Admin xử lý | Audit bắt buộc |
|---|---|---|---|
| Tutor đăng ký | `draft`, `submitted`, `pending` | Xem hồ sơ, yêu cầu bổ sung nếu thiếu | Có khi đổi trạng thái |
| Chờ xác minh | `pending_verification`, `needs_more_documents` | Review giấy tờ, kiểm tra risk/duplicate | Có |
| Đủ điều kiện | `verified` | Approve nếu backend eligibility pass | Có, kèm eligibility snapshot |
| Không đạt | `rejected`, `need_update` | Reject/request update, ghi lý do | Có |
| Đang hoạt động | `approved` | Theo dõi quality, booking, review, complaint | Có khi can thiệp |
| Rủi ro | `suspended` | Suspend/reactivate có lý do | Có |

## 2. Verification lifecycle

| Giai đoạn | Trạng thái | Admin xử lý |
|---|---|---|
| Chờ duyệt | `pending_review` | Xem file private nếu có quyền |
| Cần bổ sung | `need_more_info` | Ghi lý do, yêu cầu user upload lại |
| Hợp lệ | `approved` | Cho phép dùng trong eligibility |
| Không hợp lệ | `rejected` | Ghi lý do, giữ audit |

File verification private không được public URL trần. Role cần `files.view_verification`.

## 3. Learning request lifecycle

| Giai đoạn | Trạng thái | Admin xử lý |
|---|---|---|
| Tạo mới | `new`, `submitted` | Kiểm tra nhu cầu, môn, khu vực, lịch |
| Matching | `matching`, `waiting_tutor_proposal` | Xem gợi ý tutor, proposal count, SLA |
| Ghép được | `proposal_received`, `matched` | Assign tutor hoặc tạo booking |
| Cần ghép lại | `rematch` | Rematch khi tutor/booking không phù hợp |
| Kết thúc | `cancelled`, `closed`, `converted_to_class` | Không thao tác lại trừ flow hợp lệ |

SLA gợi ý: request chưa match quá 12 giờ là high risk.

## 4. Booking to class

| Giai đoạn | Trạng thái | Admin xử lý |
|---|---|---|
| Booking tạo | `requested`, `pending`, `assigned` | Assign/schedule tutor |
| Đã xác nhận/lên lịch | `parent_confirmed`, `tutor_confirmed`, `scheduled` | Theo dõi sắp diễn ra, confirm hai bên |
| Sau học thử | `completed` | Convert sang class hoặc rematch/cancel |
| Rủi ro | `no_show_student`, `no_show_parent`, `no_show_tutor` | Điều tra no-show, refund/rematch nếu cần |
| Kết thúc | `converted`, `converted_to_class`, `cancelled`, `expired` | Ghi audit/ledger liên quan nếu có |

## 5. Class/session to payout

| Giai đoạn | Entity | Admin xử lý |
|---|---|---|
| Lớp trial/active | Class | Active/pause/complete/cancel theo state machine |
| Buổi học | Session | Complete/cancel/student absent/tutor absent |
| Thu nhập tutor | Earning | Sinh từ session/payment nếu backend đủ điều kiện |
| Payout | Payout | Finance/admin approve/reject, kiểm tra bank và earning |

Session action dùng `sessions.manage`, không dùng nhầm `classes.manage`.

## 6. Payment/refund

| Giai đoạn | Trạng thái | Admin xử lý |
|---|---|---|
| Chờ gateway | `pending`, `processing` | Theo dõi webhook, quá 30 phút đưa vào operations |
| Thành công | `paid`, `completed` | Ghi nhận paid hoặc đối soát |
| Lỗi | `failed`, `expired` | Mark failed/retry/cancel theo chứng từ |
| Hoàn tiền | `refunded`, `partially_refunded` | Chỉ role có `payments.refund` được refund |

Complaint resolution kiểu refund chỉ ghi kết luận case; tiền phải xử lý qua payment refund flow.

## 7. Complaint/dispute lifecycle

State machine production:

`NEW -> ASSIGNED -> INVESTIGATING -> WAITING_PARENT/WAITING_TUTOR -> PROPOSED_RESOLUTION -> RESOLVED -> CLOSED`

Nhánh đặc biệt:

| Nhánh | Dùng khi |
|---|---|
| `ESCALATED` | Quá SLA, rủi ro cao, cần cấp cao xử lý |
| `REJECTED` | Khiếu nại không đủ căn cứ |

Mỗi case có owner, priority, risk level, SLA, related entity, reporter/target, timeline, internal notes và resolution. Nếu resolution yêu cầu refund/suspend/cancel thì phải mở module tương ứng và có quyền riêng.

## 8. Operations cockpit

`/admin/operations` dùng endpoint `/admin/operations/work-items` để gom việc cần xử lý:

| Queue | SLA/risk |
|---|---|
| Tutor pending approval | >24h warning, >48h critical |
| Verification pending/need more info | >24h warning/high |
| Learning request unmatched | >12h high |
| Request matching fail | không có proposal sau 12h |
| Booking upcoming/overdue/no-show | sắp diễn ra, quá giờ, no-show |
| Payment pending/reconciliation/refund | pending >30m, failed/expired, refund pending |
| Payout pending | >48h high |
| Tutor quality warning | rating thấp, response thấp, no-show |
| Complaint open/over SLA | chưa owner hoặc quá SLA |

## 9. Settings/master data

System settings hỗ trợ key/value string/number/boolean/json, sensitive masking, history, import/export. Master data hỗ trợ subjects/locations/certificates CRUD, active/hidden, usage check, bulk enable/disable và audit before/after.

Import production cần dry-run trước apply; export không được lộ secret raw value.
