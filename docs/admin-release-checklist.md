# Admin Release Checklist

Ngày cập nhật: 2026-06-02

## 1. Build/test

| Check | Command | Expected |
|---|---|---|
| Frontend typecheck | `npx tsc --noEmit` | Pass |
| Frontend lint | `npm run lint` | Pass |
| Frontend build | `npm run build` | Pass |
| Backend tests | `mvn test` | Pass; integration skip phải ghi rõ lý do |
| Backend package | `mvn package` | Pass |

## 2. Migration

| Check | Expected |
|---|---|
| Flyway chạy V21 | `booking_disputes` có field case management |
| Constraint status mới | Cho phép NEW/ASSIGNED/INVESTIGATING/... |
| Timeline table | `booking_dispute_timeline_events` tồn tại |
| Internal notes table | `admin_internal_notes` tồn tại |
| Index SLA/owner | Query operations/complaints không scan nặng |
| Flyway chạy V22 | `admin_risk_flags` tồn tại, index theo entity/active |

## 3. Permission smoke

| Role | Must pass | Must fail |
|---|---|---|
| finance_admin | payment/refund/payout | tutor approve, settings |
| tutor_admin | tutor/request/booking/class/session | refund, payout approve nếu không finance |
| support_admin | complaint manage, contacts, messages | refund, settings, tutor approve |
| verification_admin | verification review/file | finance, settings |
| tutor_admin/support_admin | CRM note/risk flag | finance/settings |

## 4. Admin UI smoke

| Route | Expected |
|---|---|
| `/admin/operations` | Work items, filters, pagination, quick actions |
| `/admin/complaints` | Filters, SLA/priority/risk, owner actions |
| `/admin/complaints/[id]` | Header, related card, timeline, notes, resolution |
| `/admin/students/[id]` | CRM profile, history, notes, risk flags |
| `/admin/parents/[id]` | CRM profile, refund/risk context |
| `/admin/tutors/[id]` | CRM tutor, eligibility, verification, payout/session context |
| `/admin/settings` | Operations settings, key/value, master data CRUD |
| `/admin/audit-logs` | Sensitive actions traceable |

## 5. Finance safety

| Check | Expected |
|---|---|
| Refund | Only `payments.refund`; reason/audit |
| Payout approve/reject | Only `payouts.approve/reject`; bank guard |
| Complaint resolution refund | Does not mutate payment directly |
| Audit | actor, role, resource, reason/metadata present |

## 6. Security

| Check | Expected |
|---|---|
| `/api/v1/admin/**` | Requires admin role |
| Sensitive settings | Raw secret not returned/exported |
| Private files | No public raw URL |
| Error response | No stack trace |
| Invalid transition | Business error, no state mutation |

## 7. Release note

Before deploy, record:

| Item | Value |
|---|---|
| FE commit | TBD |
| BE commit | TBD |
| Migration applied | V21, V22 |
| Test result | TBD |
| Demo seed guide | `docs/admin-demo-seed.md` |
| Known TODO | Settings/master data import dry-run, report export drill-down nếu cần production BI |
