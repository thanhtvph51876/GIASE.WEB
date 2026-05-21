# Changelog

## MVP security hardening

- Backend is the source of truth for roles, verification, private file access, assignment, payment, earning and payout status.
- Refresh tokens are stored hashed in the database, rotated on refresh and revoked on logout. The frontend no longer persists tokens in browser storage in production; production should move refresh tokens to HttpOnly Secure SameSite cookies.
- Private uploads now validate size, extension, content type and magic bytes, store SHA-256 metadata, purpose, owner and visibility, and route all downloads through authorization checks.
- Student/tutor verification now has upload, agreement signing, submit and admin review APIs with audit logs.
- Public learning request APIs return only anonymous fields; admin/student APIs remain private.
- Admin assign tutor with booking now has a dedicated transaction-safe endpoint.
- Session completion and payment/earning creation are idempotency guarded; payout flow uses backend-owned transitions.
- Notifications now support real read, read-all, delete and clear endpoints.

## Production TODO

- Replace in-memory rate limiting with Redis or gateway/WAF-backed rate limits.
- Move refresh token delivery to HttpOnly Secure SameSite cookies and enforce HTTPS-only deployment.
- Replace local filesystem private uploads with S3/MinIO private object storage and signed short-lived URLs.
- Add real OCR, face matching and liveness checks behind `OcrService`, `FraudRiskService` and `DuplicateDocumentService`.
- Integrate real payment gateways and production webhook signature verification keys.
- Add monitoring, backups, alerting, security event retention and data access reporting.
- If legacy databases already contain duplicate payments/earnings/webhook transaction IDs, clean them before enabling unique indexes skipped by the safe migration guard.
