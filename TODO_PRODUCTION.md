# TODO Production

- OCR thật cho giấy tờ xác thực.
- Face matching/liveness cho selfie.
- Payment gateway thật và verify signature theo từng cổng.
- Redis-backed rate limit thay cho in-memory bucket.
- S3/MinIO private object storage, presigned URL ngắn hạn nếu cần.
- Virus scan ClamAV cho upload.
- Monitoring Prometheus/Grafana.
- Log tập trung Loki/ELK.
- Backup/restore PostgreSQL định kỳ.
- CSRF hoàn chỉnh nếu chuyển refresh token sang HttpOnly cookie.
- Real email/SMS OTP.
- CAPTCHA thật cho auth/register-student/upload.
- Swagger chỉ bật dev hoặc internal/admin ở production.
- Session schedule conflict đầy đủ cho tutor và student, kèm reschedule log.
