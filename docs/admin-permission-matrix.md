# Admin Permission Matrix

Ngày cập nhật: 2026-06-02

## 1. Role summary

| Role | Được làm | Không được làm |
|---|---|---|
| `admin` | Tất cả | Không |
| `system_admin` | Tất cả, gồm settings/master data/audit | Không |
| `finance_admin` | Payment, refund, payout, reports, operations | Tutor approval, settings, master data, complaint action ngoài finance |
| `tutor_admin` | Tutor, verification, matching, booking, class, session, CRM note/risk, reports, operations | Finance refund/payout, settings, tutor suspend |
| `support_admin` | User read, request/booking/class/session read, messages, notifications, contacts, reviews read, complaints manage, CRM note/risk, reports, operations | Finance action, tutor approval/suspend, settings |
| `verification_admin` | Verification review và private verification files | Finance, settings, tutor approval ngoài xác minh |

## 2. Module/action matrix

| Module/action | FE permission | BE permission | Endpoint | Allowed roles |
|---|---|---|---|---|
| Admin dashboard | admin role | admin role | `/api/v1/admin/**` | all admin roles |
| Operations read | `operations.read` | `operations.read` | `/api/v1/admin/operations/**` | admin, system, finance, tutor, support, verification |
| Work items read | `operations.read` | `operations.read` | `GET /api/v1/admin/operations/work-items` | all admin roles |
| Tutor list/detail | `tutors.read` | `tutors.read` | `GET /api/v1/admin/tutors/**` | admin, system, tutor |
| Tutor approve | `tutors.approve` | `tutors.approve` | `POST /api/v1/admin/tutors/{id}/approve` | admin, system, tutor |
| Tutor reject | `tutors.reject` | `tutors.reject` | `POST /api/v1/admin/tutors/{id}/reject` | admin, system, tutor |
| Tutor request update | `tutors.reject` | `tutors.request_more_documents` | `POST /api/v1/admin/tutors/{id}/request-update` | admin, system, tutor |
| Tutor suspend/reactivate | `tutors.suspend` | `tutors.suspend` | `POST /api/v1/admin/tutors/{id}/suspend`, `/reactivate` | admin, system |
| Verification read | `verifications.read` | `verifications.read` | `GET /api/v1/admin/verifications/**` | admin, system, tutor, verification |
| Verification review | `verifications.review` | `verifications.review`/`verifications.approve_document` | `POST /api/v1/admin/verifications/{id}/...` | admin, system, tutor, verification |
| Verification file | `files.view_verification` | `files.view_verification` | file private endpoints | admin, system, tutor, verification |
| Request read | `learning_requests.read` | `learning_requests.read` | `GET /api/v1/admin/learning-requests/**` | admin, system, tutor, support |
| Request manage | `learning_requests.manage` | `learning_requests.manage` | status/cancel endpoints | admin, system, tutor |
| Matching manage | `matching.manage` | `matching.manage` | matching/rematch endpoints | admin, system, tutor |
| Booking read | `bookings.read` | `bookings.read` | `GET /api/v1/admin/bookings/**` | admin, system, tutor, support |
| Booking manage | `bookings.manage` | `bookings.manage` | schedule/complete/cancel/convert/no-show | admin, system, tutor |
| Class read | `classes.read` | `classes.read` | `GET /api/v1/admin/classes/**` | admin, system, tutor, support |
| Class manage | `classes.manage` | `classes.manage` | class create/update/pause/complete/cancel | admin, system, tutor |
| Session read | `sessions.read` | `sessions.read` | `GET /api/v1/admin/sessions/**` | admin, system, tutor, support |
| Session manage | `sessions.manage` | `sessions.manage` | session complete/cancel/absent | admin, system, tutor |
| Payment read | `payments.read` | `payments.read` | `GET /api/v1/admin/payments/**`, transactions/webhooks/refunds | admin, system, finance |
| Payment mark paid | `payments.mark_paid` | `payments.mark_paid` | `POST /api/v1/admin/payments/{id}/mark-paid` | admin, system, finance |
| Payment mark failed | `payments.mark_failed` | `payments.mark_failed` | `POST /api/v1/admin/payments/{id}/mark-failed` | admin, system, finance |
| Refund | `payments.refund` | `payments.refund` | `POST /api/v1/admin/payments/{id}/refund` | admin, system, finance |
| Payout read | `payouts.read` | `payouts.read` | `GET /api/v1/admin/payouts/**` | admin, system, finance |
| Payout approve | `payouts.approve` | `payouts.approve` | `POST /api/v1/admin/payouts/{id}/approve` | admin, system, finance |
| Payout reject | `payouts.reject` | `payouts.reject` | `POST /api/v1/admin/payouts/{id}/reject` | admin, system, finance |
| Complaint read | `operations.read` | `operations.read` | `GET /api/v1/admin/disputes/**` | all admin roles |
| Complaint manage | `complaints.manage` | `complaints.manage` | `PATCH/POST /api/v1/admin/disputes/{id}/**` | admin, system, support |
| CRM detail read | `users.read`/`tutors.read` | `users.read`/`tutors.read` | `GET /api/v1/admin/users/{id}/crm`, `/tutors/{id}/crm` | user CRM: admin/system/support/tutor; tutor CRM: admin/system/tutor |
| CRM note/risk | `crm.manage` | `crm.manage` | `POST /notes`, `POST/DELETE /risk-flags` under user/tutor CRM | admin, system, tutor, support |
| Reports | `reports.read` | `reports.read` | `/api/v1/admin/reports/**` | all admin roles |
| Audit logs | `audit.read` | `audit.read` | `/api/v1/admin/audit-logs` | admin, system |
| Users read/manage | `users.read/users.manage` | `users.read/users.manage` | `/api/v1/admin/users/**` | read: admin/system/support/tutor; write: admin/system |
| Contacts | `contact_requests.manage` | `contact_requests.manage` | `/api/v1/admin/contact-requests/**` | admin, system, support |
| Conversations | `conversations.read` | `conversations.read` | `/api/v1/admin/conversations/**` | admin, system, support |
| Notifications send | `notifications.send` | `notifications.send` | `/api/v1/admin/notifications/send*` | admin, system, support |
| Reviews read/manage | `reviews.read/reviews.manage` | `reviews.read/reviews.manage` | `/api/v1/admin/reviews/**` | read: admin/system/support; write: admin/system |
| Settings read/update | `settings.read/settings.update` | `settings.read/settings.update` | `/api/v1/admin/settings`, `/system-settings/**` | read: admin/system; update: admin/system |
| Master data read/manage | `master_data.read/master_data.manage` | `master_data.read/master_data.manage` | `/api/v1/admin/master-data/**` | read/manage: admin/system |

## 3. Production guardrails

| Guardrail | Expected behavior |
|---|---|
| FE shows button but BE denies | FE permission matrix must be fixed; BE remains source of truth |
| FE hides button but BE allows | Tighten FE helper or docs; never loosen BE to match UI |
| Finance role | Cannot approve tutor, edit settings or manage master data |
| Support role | Can manage complaint cases, cannot refund or approve payout |
| Verification role | Can review verification, cannot edit settings or finance |
| Session endpoints | Must use `sessions.read/manage`, not `classes.read/manage` |
| CRM note/risk | `crm.manage` only; finance/verification must get 403 |

## 4. Tests to keep

Backend: `PermissionServiceTest`, security integration tests for sensitive endpoints. Frontend: run `npx tsc --noEmit` and `npm run lint`; add unit test runner later if the project introduces Vitest/Jest.
