import type {
  ApprovalStatus,
  BookingStatus,
  ClassStatus,
  LearningRequestStatus,
  PaymentStatus,
  PayoutStatus,
  SessionStatus,
  TeachingMode,
  TutorEarningStatus,
  UserStatus,
  VerificationStatus,
} from "@/types"

export type StatusKind =
  | "approval"
  | "booking"
  | "class"
  | "learningRequest"
  | "payment"
  | "payout"
  | "earning"
  | "session"
  | "teachingMode"
  | "user"
  | "verification"

type StatusValue =
  | ApprovalStatus
  | BookingStatus
  | ClassStatus
  | LearningRequestStatus
  | PaymentStatus
  | PayoutStatus
  | TutorEarningStatus
  | SessionStatus
  | TeachingMode
  | UserStatus
  | VerificationStatus
  | string

const labels: Record<StatusKind, Record<string, string>> = {
  approval: {
    pending: "Chờ duyệt",
    draft: "Bản nháp",
    need_update: "Cần bổ sung",
    approved: "Đã duyệt",
    rejected: "Bị từ chối",
    suspended: "Đã khóa",
    inactive: "Ngưng hoạt động",
  },
  booking: {
    pending: "Chờ xác nhận",
    assigned: "Đã gán gia sư",
    accepted: "Đã chấp nhận",
    rejected: "Đã từ chối",
    scheduled: "Đã lên lịch",
    completed: "Hoàn thành",
    no_show_student: "Học viên vắng",
    no_show_tutor: "Gia sư vắng",
    converted: "Đã chuyển lớp",
    cancelled: "Đã hủy",
    expired: "Quá hạn",
  },
  class: {
    trial: "Học thử",
    active: "Đang học",
    paused: "Tạm dừng",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
  },
  learningRequest: {
    new: "Yêu cầu mới",
    consulting: "Đang tư vấn",
    matched: "Đã ghép gia sư",
    trial_scheduled: "Đã hẹn học thử",
    trial_completed: "Đã học thử",
    active: "Đang học",
    rematch: "Cần ghép lại",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
  },
  payment: {
    pending: "Đang chờ",
    processing: "Đang xử lý",
    paid: "Đã thanh toán",
    completed: "Đã thanh toán",
    failed: "Thất bại",
    expired: "Hết hạn",
    refunded: "Đã hoàn tiền",
    partially_refunded: "Hoàn một phần",
    cancelled: "Đã hủy",
  },
  payout: {
    available: "Khả dụng",
    pending: "Chờ duyệt",
    processing: "Đang xử lý",
    approved: "Đã duyệt",
    paid: "Đã chi trả",
    completed: "Đã rút",
    rejected: "Bị từ chối",
  },
  verification: {
    draft: "Chưa xác thực",
    pending_review: "Đang chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Bị từ chối",
    need_more_info: "Cần bổ sung",
  },
  earning: {
    pending: "Đang chờ",
    available: "Khả dụng",
    payout_pending: "Đang chờ payout",
    paid: "Đã rút",
    cancelled: "Đã hủy",
  },
  session: {
    scheduled: "Đã lên lịch",
    upcoming: "Sắp tới",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    student_absent: "Học viên vắng",
    tutor_absent: "Gia sư vắng",
  },
  teachingMode: {
    online: "Online",
    offline: "Tại nhà",
    both: "Linh hoạt",
  },
  user: {
    active: "Đang hoạt động",
    inactive: "Tạm khóa",
    pending: "Chờ kích hoạt",
  },
}

const tones: Record<string, string> = {
  active: "success",
  accepted: "success",
  approved: "success",
  completed: "success",
  converted: "success",
  paid: "success",
  available: "success",
  online: "info",
  both: "info",
  consulting: "info",
  matched: "info",
  rematch: "warning",
  trial: "info",
  trial_scheduled: "info",
  trial_completed: "info",
  scheduled: "info",
  upcoming: "info",
  pending: "warning",
  pending_review: "warning",
  processing: "info",
  payout_pending: "warning",
  draft: "neutral",
  new: "warning",
  need_update: "warning",
  need_more_info: "warning",
  paused: "warning",
  offline: "neutral",
  inactive: "danger",
  cancelled: "danger",
  expired: "danger",
  failed: "danger",
  no_show_student: "danger",
  no_show_tutor: "danger",
  rejected: "danger",
  suspended: "danger",
  partially_refunded: "warning",
  refunded: "neutral",
  student_absent: "danger",
  tutor_absent: "danger",
}

export function getStatusLabel(kind: StatusKind, status?: StatusValue | null): string {
  if (!status) return "Chưa xác định"
  return labels[kind]?.[status] || String(status)
}

export function getStatusTone(status?: StatusValue | null): "danger" | "info" | "neutral" | "success" | "warning" {
  if (!status) return "neutral"
  return (tones[String(status)] as ReturnType<typeof getStatusTone>) || "neutral"
}
