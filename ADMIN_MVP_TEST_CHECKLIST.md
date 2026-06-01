# Admin MVP Test Checklist

Ngày cập nhật: 2026-06-01

Checklist này dùng để test thủ công sau khi migrate DB và chạy backend/frontend với dữ liệu thật hoặc dữ liệu seed đủ lớn.

## 1. Chuẩn bị

| Việc cần làm | Kỳ vọng |
|---|---|
| Chạy migration tới `V20` | Có index `V19`, cột/index contact `V20` |
| Set `NEXT_PUBLIC_API_BASE_URL` | Production không fallback localhost |
| Login bằng `admin` hoặc `system_admin` | Vào được toàn bộ `/admin` |
| Login bằng role hẹp | Menu/action bị ẩn hoặc disabled đúng quyền |
| Mở DevTools Network | API list có `page`, `pageSize`, trả `pagination` |

## 2. Test hiệu năng list lớn

| Module | URL/API cần kiểm | Kỳ vọng |
|---|---|---|
| Users | `/admin/users?page=1&pageSize=50&role=student` | Có pagination, không tải toàn bộ users |
| Tutors | `/admin/tutors?page=1&pageSize=50` | Trả 50 bản ghi/page |
| Learning requests | `/admin/learning-requests?page=1&pageSize=50` | Không timeout khi nhiều request |
| Bookings | `/admin/bookings?page=1&pageSize=50` | Có nút trang trước/sau |
| Classes | `/admin/classes?page=1&pageSize=50` | Không N+1 session count |
| Sessions | `/admin/sessions?page=1&pageSize=50` | List ổn định khi nhiều buổi học |
| Payments | `/admin/payments?page=1&pageSize=50` | Không tải transaction/refund toàn bộ |
| Payouts | `/admin/payouts?page=1&pageSize=50` | Duyệt từ detail, có phân trang |
| Notifications | `/admin/notifications?page=1&pageSize=50` | Log notification phân trang |
| Audit logs | `/admin/audit-logs?page=1&pageSize=50` | Không quét toàn bộ audit log |
| Complaints | `/admin/disputes?page=1&pageSize=50` | Có pagination metadata |

## 3. Test quyền

| Role | Test | Kỳ vọng |
|---|---|---|
| `finance_admin` | Mark paid/failed/refund payment, approve/reject payout | Thành công nếu dữ liệu hợp lệ |
| `finance_admin` | Duyệt gia sư hoặc xác thực giấy tờ | Bị chặn |
| `tutor_admin` | Assign/rematch learning request, xử lý booking/class | Thành công nếu dữ liệu hợp lệ |
| `tutor_admin` | Mark paid/refund | Bị chặn |
| `support_admin` | Xử lý contact, gửi notification | Thành công |
| `support_admin` | Hide/flag review | Nút không khả dụng hoặc backend 403 |
| `support_admin` | Update complaint/dispute | Không khả dụng theo FE hiện tại |
| `verification_admin` | Approve/reject verification | Thành công |
| `verification_admin` | Payment/payout action | Bị chặn |

## 4. Test nghiệp vụ chính

| Luồng | Các bước | Kỳ vọng |
|---|---|---|
| Matching | Mở yêu cầu mới, xem matching tutors, assign tutor | Request cập nhật tutor, audit không lỗi |
| Rematch | Chọn request đã gán, rematch với lý do | Request quay lại trạng thái cần xử lý |
| Booking học thử | Schedule, no-show, complete, convert to class | Trạng thái booking/lớp cập nhật đúng |
| Class/session | Pause/complete/cancel class; complete/cancel session | Trạng thái không lệch payment/earning |
| Payment | Mark paid, mark failed, refund với lý do | Backend ghi trạng thái và audit |
| Payout | Mở detail trước khi duyệt/từ chối | Admin có đủ thông tin trước action |
| Contact | Gán trạng thái contacted/resolved với note | Lưu `handledBy`, `handledAt`, `handlerNote` |
| Notification | Gửi bulk theo role | Backend tạo notification bằng batch, không `Promise.all` per user |
| Review | Lọc theo tutor/class trên page, hide/show/flag | Chỉ role có `reviews.manage` thao tác được |
| Complaint | Xem detail dispute, link sang payment/booking/class liên quan | Role thường chỉ đọc, super admin update được nếu backend cho phép |

## 5. Test lỗi/chống timeout

| Tình huống | Kỳ vọng |
|---|---|
| Backend chậm hơn `NEXT_PUBLIC_API_TIMEOUT_MS` | FE báo "Backend phản hồi quá lâu" |
| Backend trả 403 | Action hiện lỗi rõ, không mất dữ liệu local |
| Backend trả response không JSON | FE báo phản hồi không hợp lệ |
| Production thiếu `NEXT_PUBLIC_API_BASE_URL` | FE báo config thiếu thay vì gọi localhost |
| Page rỗng | Empty state hiển thị, pagination không vỡ layout |

## 6. Lệnh kiểm tra kỹ thuật

| Khu vực | Lệnh |
|---|---|
| Frontend typecheck | `npx tsc --noEmit --incremental false` |
| Frontend lint | `npm run lint` |
| Frontend build | `npm run build` |
| Backend compile | `.\mvnw.cmd -DskipTests compile` |
| Backend test | `.\mvnw.cmd test` |
| Backend package | `.\mvnw.cmd clean package` |

## 7. TODO sau MVP

- Thêm server-side search/filter sâu cho tutors, reviews, audit logs, contacts nếu cần tìm toàn DB theo từ khóa.
- Tách permission backend riêng cho `sessions.manage` nếu không muốn dùng chung `classes.manage`.
- Quyết định quyền xử lý complaint cho support admin trước khi đổi backend từ `admin.full_access` sang `complaints.manage`.
- Thêm E2E tự động bằng Playwright khi có môi trường seed ổn định.
