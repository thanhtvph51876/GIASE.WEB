# FIX PLAN - Tutor Platform MVP/Closed Beta

Scope for this pass: audit repository and implement P0 first. P1/P2 are documented as next work unless already present in code.

## P0 Findings And Fix Plan

| Priority | Area | Finding | Related files | Fix | Tests |
|---|---|---|---|---|---|
| P0 | Private file / IDOR | Private files already route through `/api/v1/files/{fileId}`, but metadata was missing `deleted_at` and FE admin verification opened blobs ad hoc instead of a shared file API. | `FileController.java`, `FilePolicy.java`, `FileStorageService.java`, `app/admin/verifications/page.tsx`, `lib/api/client.ts` | Add migration metadata, keep path traversal checks, add `fileApi.getFileBlob`, use auth blob loading in admin verification. | Guest private file 401, other user 403, owner/admin 200, public file 200. |
| P0 | Verification | Upload creates `draft` correctly, but signing agreement should be enough to move to `pending_review`; current flow required a second submit call. | `VerificationController.java`, `verification-api.ts`, `use-verifications.ts`, student/tutor verification pages | Make signing agreement persist snapshot/hash/IP/user-agent and transition draft/need_more_info/rejected to `pending_review` idempotently. Keep submit endpoint for compatibility. | Upload not auto-approved; sign creates agreement and pending review; admin approve/reject only. |
| P0 | Learning requests public/admin split | Public GET strips PII, but guest submissions created by `/register-student` could appear in public feed because they were inserted as `new`. | `PlatformController.java`, `V8__p0_closed_beta_hardening.sql`, `learning-request-api.ts`, `use-learning-requests.ts` | Add `learning_requests.public_visible`; public feed only returns public-visible rows. Guest public POST creates admin-queue item with `public_visible=false`. | Guest submit succeeds; guest public response has no PII; guest admin endpoint 401/403. |
| P0 | Register-student | Page now calls service with no user id for guests, which maps to public endpoint. Backend still needed stricter public validation. | `app/register-student/page.tsx`, `learning-request-service.ts`, `PlatformController.java` | Validate public request contact/student/subject/grade/phone/email length/format enough for MVP. | Guest submit succeeds without login; admin sees full request. |
| P0 | Assign tutor with booking | Endpoint returns `{ learningRequest, booking }`, but did not honor `trialStartTime`, `trialEndTime`, `note`, or `createBooking`. | `PlatformController.java`, `learning-request-api.ts`, `workflowService.ts` | Handle optional schedule/note/createBooking in one transaction; keep idempotent existing-booking behavior. | Admin assign returns learningRequest and booking; FE does not crash. |
| P0 | Payment/session/webhook idempotency | Session complete is guarded by row lock and unique indexes; webhook duplicate handling had an edge case when event id is null and conflict is on gateway transaction id. | `PaymentService.java`, `V7__verification_public_requests_and_hardening.sql` | Resolve existing webhook row by event id, transaction id, or order id after `on conflict do nothing`. | Complete session twice creates one payment/earning; duplicate webhook returns OK. |

## P1 Findings To Implement Next

| Priority | Area | Finding | Related files | Fix | Tests |
|---|---|---|---|---|---|
| P1 | Dispute/no-show/cancellation | No full dispute table/API/dashboard yet. Some booking/session absent statuses exist, but no evidence upload, earning hold, or admin resolution flow. | `PlatformController.java`, migrations, dashboard/admin pages | Add `disputes`, user/admin APIs, evidence file policy, no-show endpoints, earning hold/release/refund rules. | Student/tutor no-show opens dispute; admin resolve updates payment/earning. |
| P1 | Review safety | Reviews require completed session and one review per session, but report endpoint/status name `reported` is not fully implemented. | `PlatformController.java`, `DbService.java`, admin reviews page | Add report endpoint, status `reported`, admin hide/unhide aliases, FE report action. | Unqualified/duplicate review blocked; hidden review not public. |
| P1 | Notification backend | Backend notification CRUD exists. Some FE business helper methods remain no-op because notifications should be created by backend actions. | `notification-service.ts`, `PlatformController.java` | Keep backend as source of truth; replace remaining helper no-ops with admin send or remove callers. | Read/delete/clear persists after refresh; user cannot delete another user's notifications. |
| P1 | Audit log | Audit table and many sensitive actions exist, but action names are mixed `dot.case` instead of a fixed enum. | `DbService.java`, services/controllers | Normalize action constants and include IP/user-agent for sensitive actions. | Sensitive actions create audit rows with expected action. |

## P2 Findings To Implement Next

| Priority | Area | Finding | Related files | Fix | Tests |
|---|---|---|---|---|---|
| P2 | Auth/session | Refresh token hash/rotation/reuse detection exists. Production still needs HttpOnly Secure SameSite cookie migration. | `AuthController.java`, `RefreshTokenService.java`, `client.ts` | Move refresh token to cookie, add CSRF/origin validation for writes. | Refresh rotation/reuse/logout tests. |
| P2 | Rate limit/CORS/Swagger | In-memory rate limiting exists for auth/public upload endpoints. Swagger is still dev-permitted. | `RateLimitFilter.java`, `SecurityConfig.java` | Env-gate Swagger; production Redis rate limit; stronger CSP. | 429 on abuse; production Swagger blocked. |
| P2 | Schedule conflict/reschedule | Booking schedule checks tutor sessions only. Class session create/update lacks full tutor/student overlap checks and change logs. | `PlatformController.java`, migrations | Add conflict checks for tutor and student, `session_change_logs`, reschedule reason. | Overlap returns 409/400; reschedule writes log. |
| P2 | Dashboard UX | Verification/payment/dashboard pages exist but dispute, payout review, audit insights are incomplete. | `app/dashboard/**`, `app/admin/**` | Add dispute, failed/manual payment, duplicate documents, audit dashboards. | Dashboard smoke/build tests. |

## Commands To Run

- Backend: `cd backend && mvn test`
- Backend package: `cd backend && mvn -DskipTests package`
- Frontend lint: `npm run lint`
- Frontend typecheck: `npx tsc --noEmit`
- Frontend build: `npm run build`

