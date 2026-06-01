import type {
  ApprovalStatus,
  BookingStatus,
  ClassStatus,
  ContactRequestStatus,
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
  | "contact"
  | "dispute"
  | "learningRequest"
  | "payment"
  | "payout"
  | "review"
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
  | ContactRequestStatus
  | string

const labels: Record<StatusKind, Record<string, string>> = {
  approval: {
    draft: "Bản nháp",
    submitted: "Đã gửi hồ sơ",
    pending: "Chờ duyệt",
    pending_verification: "Chờ xác thực giấy tờ",
    need_update: "Cần bổ sung",
    needs_more_documents: "Cần bổ sung giấy tờ",
    verified: "Đã xác thực giấy tờ",
    approved: "Đã duyệt",
    rejected: "Bị từ chối",
    suspended: "Đã khóa",
    inactive: "Ngưng hoạt động",
  },
  booking: {
    requested: "Chờ xác nhận",
    parent_confirmed: "Phụ huynh đã xác nhận",
    tutor_confirmed: "Gia sư đã xác nhận",
    reschedule_requested: "Đề nghị đổi lịch",
    pending: "Chờ xác nhận",
    assigned: "Đã gán gia sư",
    accepted: "Đã chấp nhận",
    rejected: "Đã từ chối",
    scheduled: "Đã lên lịch",
    completed: "Hoàn thành",
    no_show_student: "Học viên vắng",
    no_show_parent: "Phụ huynh/học viên vắng",
    no_show_tutor: "Gia sư vắng",
    converted: "Đã chuyển lớp",
    converted_to_class: "Đã chuyển lớp",
    cancelled: "Đã hủy",
    cancelled_by_parent: "Phụ huynh đã hủy",
    cancelled_by_tutor: "Gia sư đã hủy",
    cancelled_by_student: "Học viên đã hủy",
    expired: "Quá hạn",
  },
  class: {
    trial: "Học thử",
    active: "Đang học",
    paused: "Tạm dừng",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
  },
  contact: {
    new: "Mới",
    contacted: "Đã liên hệ",
    resolved: "Đã xử lý",
    ignored: "Bỏ qua",
  },
  dispute: {
    OPEN: "Mới mở",
    open: "Mới mở",
    IN_REVIEW: "Đang xử lý",
    in_review: "Đang xử lý",
    RESOLVED: "Đã xử lý",
    resolved: "Đã xử lý",
    REJECTED: "Từ chối",
    rejected: "Từ chối",
  },
  learningRequest: {
    draft: "Bản nháp",
    submitted: "Đã gửi yêu cầu",
    new: "Yêu cầu mới",
    consulting: "Đang tư vấn",
    matching: "Đang tìm gia sư",
    waiting_tutor_proposal: "Chờ proposal gia sư",
    proposal_received: "Đã có proposal",
    waiting_parent_confirmation: "Chờ phụ huynh xác nhận",
    matched: "Đã ghép gia sư",
    trial_scheduled: "Đã hẹn học thử",
    trial_completed: "Đã học thử",
    active: "Đang học",
    rematch: "Cần ghép lại",
    converted_to_class: "Đã chuyển lớp",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    expired: "Quá hạn",
    closed: "Đã đóng",
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
  review: {
    visible: "Đang hiển thị",
    hidden: "Đã ẩn",
    flagged: "Bị gắn cờ",
    published: "Đã đăng",
    pending: "Chờ duyệt",
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
  teachingMode: {},
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
  verified: "success",
  completed: "success",
  converted: "success",
  paid: "success",
  available: "success",
  online: "info",
  both: "info",
  consulting: "info",
  matched: "info",
  matching: "info",
  proposal_received: "info",
  waiting_parent_confirmation: "warning",
  waiting_tutor_proposal: "warning",
  converted_to_class: "success",
  parent_confirmed: "info",
  tutor_confirmed: "info",
  requested: "warning",
  reschedule_requested: "warning",
  rematch: "warning",
  trial: "info",
  trial_scheduled: "info",
  trial_completed: "info",
  scheduled: "info",
  upcoming: "info",
  pending: "warning",
  pending_verification: "warning",
  pending_review: "warning",
  submitted: "warning",
  processing: "info",
  payout_pending: "warning",
  draft: "neutral",
  new: "warning",
  contacted: "info",
  ignored: "neutral",
  OPEN: "warning",
  open: "warning",
  IN_REVIEW: "info",
  in_review: "info",
  RESOLVED: "success",
  resolved: "success",
  REJECTED: "danger",
  need_update: "warning",
  needs_more_documents: "warning",
  need_more_info: "warning",
  paused: "warning",
  offline: "neutral",
  inactive: "danger",
  cancelled: "danger",
  expired: "danger",
  failed: "danger",
  no_show_student: "danger",
  no_show_parent: "danger",
  no_show_tutor: "danger",
  cancelled_by_parent: "danger",
  cancelled_by_tutor: "danger",
  cancelled_by_student: "danger",
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

export function getContactStatusLabel(status?: ContactRequestStatus | null): string {
  return getStatusLabel("contact", status)
}

export function getReviewStatusLabel(status?: string | null): string {
  return getStatusLabel("review", status)
}

export function getDisputeStatusLabel(status?: string | null): string {
  return getStatusLabel("dispute", status)
}
