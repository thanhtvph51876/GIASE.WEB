# BE/FE Feature Mapping Checklist

Date: 2026-06-01

Scope: scan backend Spring endpoints under `H:\backend\src\main\java` and frontend API/service/page usage under `H:\website-clone`.

## Summary

BE and FE are not fully mapped yet.

- Backend exposes about 249 endpoint mappings.
- Frontend has about 180 API call sites.
- Core public/auth/admin operation flows are mostly present.
- Missing coverage is concentrated in admin master-data/system settings, tutor availability, dedicated student dashboard endpoints, some admin detail/action endpoints, and several report endpoints.

Some scanner misses are false positives because FE builds paths dynamically, for example `classApi` uses `role === "admin" ? "/admin/classes" : ...` and admin class status uses `/admin/classes/${id}/${action}`.

## Feature Matrix

| Module | Status | Notes |
|---|---:|---|
| Auth login/register/logout/me/reset/verify | Mostly mapped | `/auth/refresh` is handled internally in `lib/api/client.ts`; forgot/reset/verify pages exist. |
| User profile | Partial | FE updates `/users/me` and `/users/me/profile`, but does not clearly use BE `GET /users/me` and `GET /users/me/profile`. |
| Public stats | Mapped | `publicApi.stats()` maps `/public/stats`. |
| Public catalog/master data read | Mapped | FE uses `/master-data/*`. BE legacy `/catalog/subjects` and `/catalog/grade-levels` are not used. Decide deprecate or map. |
| Tutor search/detail/reviews | Mapped | `/tutors`, `/tutors/{id}`, `/tutors/{id}/reviews` covered. |
| Favorites | Mapped | List, ids, add, remove covered via `tutorApi`. |
| Tutor profile/documents/submit | Mostly mapped | Profile get/update/submit and upload/list documents covered. Missing delete document UI/API use. |
| Tutor availability | Missing | BE has GET/POST/PATCH/DELETE `/tutor/availability`; FE only shows checklist item, no CRUD client/UI. |
| Tutor performance | Mapped | `/tutor/performance` covered. |
| Tutor leads/proposals | Mapped | Leads, proposal create/update/withdraw covered. |
| Parent proposals | Mapped | List, accept, reject covered. |
| Parent students | Mapped | Parent student CRUD, dashboard, schedule, progress, payments covered. |
| Dedicated student dashboard | Missing/partial | BE has `/student/dashboard`, `/student/schedule`, `/student/classes`, `/student/assignments`, `/student/materials`, `/student/progress`, `/student/sessions/{id}/check-in`; FE mainly uses generic class/session services instead. |
| Learning requests | Mostly mapped | Public/student/admin list/create/update/assign/matching covered. Missing admin detail, admin cancel, rematch. |
| Bookings | Mostly mapped | User/tutor/admin list/create/accept/reject/schedule/complete/convert covered. Missing admin booking detail, assign tutor, no-show student/tutor, admin cancel. |
| Trial booking workflow controller | Mapped | `trial-booking-service.ts` covers create/get/confirm/cancel/no-show/complete/convert. |
| Classes/sessions | Mostly mapped | Student/tutor/admin list/detail/create/update/status routes mostly covered via dynamic `classApi`. Check UI for admin class sessions/detail completeness. |
| Reviews | Mostly mapped | List/create/admin list and status actions are available; service currently exposes hide path most directly. |
| Messages/conversations | Mostly mapped | User conversations/messages/create/mark-read and admin conversation list covered. Missing admin conversation detail. |
| Notifications | Mapped | User/admin list, unread count, read, read-all, delete, send covered. FE uses PATCH variants; BE also has POST aliases. |
| Payments | Mostly mapped | Settings, list, checkout, status, invoice, receipt, admin list/actions, transactions, webhooks list, refunds covered. Missing admin payment detail and payout detail. Payment webhook POST is BE-only by design. |
| Tutor payouts/earnings | Mapped | Tutor earnings, payouts, payout request covered. |
| Verification | Mapped | Student/tutor upload/me/sign/submit and admin list/detail/approve/reject/need-more-info covered. |
| Contact requests | Mapped | Public create, admin list/update status covered. |
| Admin reports | Partial | Dashboard maps overview, request trends, subject distribution, tutor status, funnel, teaching mode. Missing revenue, payment status distribution, low-rating alerts. |
| Admin operations | Mapped | Overview, matching queue, booking risk, verification risk, payment reconciliation, payout queue, tutor quality, disputes covered. |
| Admin users | Partial | FE maps `/admin/users`; missing user detail and status update. |
| Admin tutors | Mostly mapped | List, approve/reject/update/suspend/reactivate/eligibility covered. Missing use of admin tutor detail endpoint; FE often uses public tutor detail instead. |
| Admin tutor documents | Partial | Service has approve/reject dynamic path; check page coverage. Missing a dedicated review queue if expected. |
| Admin master data CRUD | Missing | BE has create/update/delete subjects, locations, certificates. FE only reads public master data. |
| Admin system settings | Missing | BE has `/admin/system-settings`; FE uses separate `/admin/settings` platform settings endpoint. |
| Upload/files | Mapped | Upload helper maps `/uploads`; file blob maps `/files/{id}`. |
| Health | Missing in FE | No FE health check call. Also consider permitAll in BE security if used by deployment. |

## Missing Endpoint Groups To Prioritize

### P0 - User-visible gaps

- Add `studentDashboardApi` for:
  - `GET /student/dashboard`
  - `GET /student/schedule`
  - `GET /student/classes`
  - `GET /student/assignments`
  - `GET /student/materials`
  - `GET /student/progress`
  - `POST /student/sessions/{sessionId}/check-in`
- Add tutor availability API + UI:
  - `GET /tutor/availability`
  - `POST /tutor/availability`
  - `PATCH /tutor/availability/{availabilityId}`
  - `DELETE /tutor/availability/{availabilityId}`
- Add admin master-data management UI/API:
  - subjects create/update/delete
  - locations create/update/delete
  - certificates create/update/delete
- Add admin report tabs for:
  - revenue
  - payment status distribution
  - low rating alerts

### P1 - Admin workflow completeness

- Admin learning request detail/cancel/rematch:
  - `GET /admin/learning-requests/{requestId}`
  - `POST /admin/learning-requests/{requestId}/cancel`
  - `POST /admin/learning-requests/{requestId}/rematch`
- Admin booking detail/admin cancel/assign/no-show:
  - `GET /admin/bookings/{bookingId}`
  - `POST /admin/bookings/{bookingId}/assign-tutor`
  - `POST /admin/bookings/{bookingId}/mark-no-show-student`
  - `POST /admin/bookings/{bookingId}/mark-no-show-tutor`
  - `POST /admin/bookings/{bookingId}/cancel`
- Admin user detail/status:
  - `GET /admin/users/{userId}`
  - `PATCH /admin/users/{userId}/status`
- Admin payment/payout detail:
  - `GET /admin/payments/{paymentId}`
  - `GET /admin/payouts/{payoutId}`
- Admin conversation detail:
  - `GET /admin/conversations/{conversationId}`

### P2 - Cleanup/contract decisions

- Decide whether `/catalog/subjects` and `/catalog/grade-levels` should be deprecated because FE already uses `/master-data/*`.
- Decide whether `GET /users/me` and `GET /users/me/profile` should be used by FE or removed in favor of `/auth/me`.
- Add a small FE health check only if product UX needs “backend waking up / offline” messaging.

