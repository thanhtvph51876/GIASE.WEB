import type {
  BookingStatus,
  ClassStatus,
  LearningRequestStatus,
  Payment,
  Payout,
  SessionStatus,
  Tutor,
  TutorApprovalEligibility,
  User,
  UserVerification,
} from "@/types"
import { canPerformAdminAction, type AdminActionKey } from "./admin-permissions"

export type AdminEntityType =
  | "tutor"
  | "verification"
  | "learning_request"
  | "booking"
  | "class"
  | "session"
  | "payment"
  | "payout"
  | "contact"
  | "review"
  | "settings"

export interface AdminActionAvailability {
  key: AdminActionKey
  allowed: boolean
  reason?: string
}

interface ActionContext {
  eligibility?: TutorApprovalEligibility
  refundableAmount?: number
  bankInfoVerified?: boolean
}

const tutorApprovalStatuses = new Set(["submitted", "pending", "pending_verification", "verified"])
const tutorRejectStatuses = new Set(["submitted", "pending", "pending_verification", "verified", "need_update", "needs_more_documents"])
const tutorSuspendStatuses = new Set(["approved"])
const verificationReviewStatuses = new Set(["pending_review", "need_more_info"])
const bookingCompleteStatuses = new Set(["scheduled"])
const bookingConvertStatuses = new Set(["completed"])
const bookingScheduleStatuses = new Set(["requested", "parent_confirmed", "tutor_confirmed", "reschedule_requested", "pending", "assigned", "accepted"])
const bookingCancelStatuses = new Set(["requested", "parent_confirmed", "tutor_confirmed", "reschedule_requested", "pending", "assigned", "accepted", "scheduled"])
const classActiveStatuses = new Set(["trial"])
const sessionMutationStatuses = new Set(["scheduled", "upcoming"])
const refundablePaymentStatuses = new Set(["paid", "completed", "partially_refunded"])
const manualPaymentStatuses = new Set(["pending", "processing", "failed", "expired"])
const payoutDecisionStatuses = new Set(["pending", "processing", "approved"])

export function getAdminActionAvailability(
  user: User | null | undefined,
  entityType: AdminEntityType,
  actionKey: AdminActionKey,
  status?: string | null,
  entityData?: unknown,
  context: ActionContext = {}
): AdminActionAvailability {
  if (!canPerformAdminAction(user, actionKey)) {
    return { key: actionKey, allowed: false, reason: "Bạn không có quyền thực hiện thao tác này." }
  }

  if (entityType === "tutor") {
    const tutor = entityData as Tutor | undefined
    if (actionKey === "tutor.approve") {
      if (!tutorApprovalStatuses.has(String(status))) return { key: actionKey, allowed: false, reason: "Hồ sơ không ở trạng thái có thể duyệt." }
      if (context.eligibility && !context.eligibility.eligibleForApproval) return { key: actionKey, allowed: false, reason: "Backend báo hồ sơ chưa đủ điều kiện duyệt." }
    }
    if (actionKey === "tutor.reject" && !tutorRejectStatuses.has(String(status))) {
      return { key: actionKey, allowed: false, reason: "Hồ sơ không ở trạng thái có thể từ chối." }
    }
    if (actionKey === "tutor.suspend" && !tutorSuspendStatuses.has(String(status))) {
      return { key: actionKey, allowed: false, reason: "Chỉ khóa hồ sơ đã duyệt." }
    }
    if (actionKey === "tutor.reactivate" && status !== "suspended") {
      return { key: actionKey, allowed: false, reason: "Chỉ mở khóa hồ sơ đang bị khóa." }
    }
    if (actionKey === "tutor.requestUpdate" && tutor?.approvalStatus === "approved") {
      return { key: actionKey, allowed: false, reason: "Hồ sơ đã duyệt cần chuyển qua quy trình khóa hoặc xác thực lại." }
    }
  }

  if (entityType === "verification") {
    const verification = entityData as UserVerification | undefined
    if (!verificationReviewStatuses.has(String(status))) {
      return { key: actionKey, allowed: false, reason: "Hồ sơ xác thực không còn trong hàng chờ xử lý." }
    }
    if (actionKey === "verification.approve" && verification?.duplicateFile) {
      return { key: actionKey, allowed: false, reason: "Không thể duyệt giấy tờ bị đánh dấu trùng file." }
    }
  }

  if (entityType === "learning_request") {
    if (actionKey === "learningRequest.assign" && !["new", "consulting", "matching", "rematch", "proposal_received", "waiting_tutor_proposal"].includes(String(status))) {
      return { key: actionKey, allowed: false, reason: "Yêu cầu không ở trạng thái cần ghép gia sư." }
    }
    if (actionKey === "learningRequest.rematch" && !["matched", "trial_scheduled", "trial_completed", "active"].includes(String(status))) {
      return { key: actionKey, allowed: false, reason: "Chỉ rematch khi yêu cầu đã từng được ghép." }
    }
    if (actionKey === "learningRequest.cancel" && ["cancelled", "completed", "closed", "converted_to_class"].includes(String(status))) {
      return { key: actionKey, allowed: false, reason: "Yêu cầu đã ở trạng thái kết thúc." }
    }
  }

  if (entityType === "booking") {
    if (actionKey === "booking.schedule" && !bookingScheduleStatuses.has(String(status))) return { key: actionKey, allowed: false, reason: "Booking không thể xếp lịch ở trạng thái này." }
    if (actionKey === "booking.complete" && !bookingCompleteStatuses.has(String(status))) return { key: actionKey, allowed: false, reason: "Chỉ hoàn tất booking đã lên lịch." }
    if (actionKey === "booking.convert" && !bookingConvertStatuses.has(String(status))) return { key: actionKey, allowed: false, reason: "Chỉ chuyển lớp sau khi học thử hoàn tất." }
    if (actionKey === "booking.cancel" && !bookingCancelStatuses.has(String(status))) return { key: actionKey, allowed: false, reason: "Booking không thể hủy ở trạng thái này." }
  }

  if (entityType === "class") {
    if (actionKey === "learningRequest.update" && !classActiveStatuses.has(String(status))) return { key: actionKey, allowed: false, reason: "Chỉ xử lý kết quả học thử cho lớp trial." }
  }

  if (entityType === "session") {
    if (!sessionMutationStatuses.has(String(status))) return { key: actionKey, allowed: false, reason: "Buổi học không còn ở trạng thái có thể cập nhật." }
  }

  if (entityType === "payment") {
    const payment = entityData as Payment | undefined
    if (actionKey === "payment.markPaid" && !manualPaymentStatuses.has(String(status))) return { key: actionKey, allowed: false, reason: "Thanh toán không thể đối soát paid thủ công ở trạng thái này." }
    if (actionKey === "payment.markFailed" && !manualPaymentStatuses.has(String(status))) return { key: actionKey, allowed: false, reason: "Thanh toán không thể báo lỗi ở trạng thái này." }
    if (actionKey === "payment.refund") {
      if (!refundablePaymentStatuses.has(String(status))) return { key: actionKey, allowed: false, reason: "Chỉ hoàn tiền giao dịch đã thanh toán." }
      if ((context.refundableAmount ?? payment?.amount ?? 0) <= 0) return { key: actionKey, allowed: false, reason: "Không còn số tiền khả dụng để hoàn." }
    }
  }

  if (entityType === "payout") {
    const payout = entityData as Payout | undefined
    if ((actionKey === "payout.approve" || actionKey === "payout.reject") && !payoutDecisionStatuses.has(String(status))) {
      return { key: actionKey, allowed: false, reason: "Payout không ở trạng thái chờ xử lý." }
    }
    if (actionKey === "payout.approve" && !context.bankInfoVerified && (!payout?.bankName || !payout?.bankAccount)) {
      return { key: actionKey, allowed: false, reason: "Payout thiếu thông tin ngân hàng." }
    }
  }

  return { key: actionKey, allowed: true }
}

export function allowedAdminActions(
  entityType: AdminEntityType,
  status: LearningRequestStatus | BookingStatus | ClassStatus | SessionStatus | string | null | undefined,
  user: User | null | undefined,
  entityData?: unknown,
  context?: ActionContext
) {
  const actionsByEntity: Record<AdminEntityType, AdminActionKey[]> = {
    tutor: ["tutor.approve", "tutor.reject", "tutor.requestUpdate", "tutor.suspend", "tutor.reactivate"],
    verification: ["verification.approve", "verification.reject", "verification.needMoreInfo"],
    learning_request: ["learningRequest.update", "learningRequest.assign", "learningRequest.rematch", "learningRequest.cancel"],
    booking: ["booking.schedule", "booking.complete", "booking.convert", "booking.cancel"],
    class: ["learningRequest.update"],
    session: ["session.complete", "session.cancel", "session.markAbsent"],
    payment: ["payment.markPaid", "payment.markFailed", "payment.refund"],
    payout: ["payout.approve", "payout.reject"],
    contact: [],
    review: ["review.manage"],
    settings: ["settings.update"],
  }

  return actionsByEntity[entityType].map((action) =>
    getAdminActionAvailability(user, entityType, action, status, entityData, context)
  )
}
