import type { BookingStatus, SessionStatus } from "@/types"

export type NormalizedBookingStatus =
  | "pending_confirmation"
  | "confirmed"
  | "scheduled"
  | "completed"
  | "converted_to_class"
  | "cancelled"
  | "rejected"
  | "no_show"
  | "expired"
  | "unknown"

const bookingLabels: Record<NormalizedBookingStatus, string> = {
  pending_confirmation: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  scheduled: "Đã lên lịch",
  completed: "Hoàn thành học thử",
  converted_to_class: "Đã chuyển thành lớp",
  cancelled: "Đã hủy",
  rejected: "Đã từ chối",
  no_show: "Vắng học thử",
  expired: "Quá hạn",
  unknown: "Chưa xác định",
}

const toneByStatus: Record<NormalizedBookingStatus, "danger" | "info" | "neutral" | "success" | "warning"> = {
  pending_confirmation: "warning",
  confirmed: "info",
  scheduled: "info",
  completed: "success",
  converted_to_class: "success",
  cancelled: "danger",
  rejected: "danger",
  no_show: "danger",
  expired: "danger",
  unknown: "neutral",
}

export function normalizeBookingStatus(status?: BookingStatus | string | null): NormalizedBookingStatus {
  const raw = String(status || "").toLowerCase()
  if (!raw) return "unknown"
  if (["requested", "pending", "assigned", "accepted", "parent_confirmed", "tutor_confirmed", "reschedule_requested"].includes(raw)) {
    return raw === "accepted" || raw === "parent_confirmed" || raw === "tutor_confirmed" ? "confirmed" : "pending_confirmation"
  }
  if (raw === "scheduled") return "scheduled"
  if (raw === "completed" || raw === "trial_completed") return "completed"
  if (raw === "converted" || raw === "converted_to_class") return "converted_to_class"
  if (raw === "rejected" || raw === "rejected_after_trial") return "rejected"
  if (raw === "expired") return "expired"
  if (raw.startsWith("no_show")) return "no_show"
  if (raw.startsWith("cancelled") || raw === "cancelled_by_student") return "cancelled"
  return "unknown"
}

export function getNormalizedBookingStatusLabel(status?: BookingStatus | string | null) {
  return bookingLabels[normalizeBookingStatus(status)]
}

export function getNormalizedBookingStatusTone(status?: BookingStatus | string | null) {
  return toneByStatus[normalizeBookingStatus(status)]
}

export function canCancelBooking(status?: BookingStatus | string | null) {
  return ["pending_confirmation", "confirmed", "scheduled"].includes(normalizeBookingStatus(status))
}

export function canConfirmBooking(status?: BookingStatus | string | null) {
  return ["pending_confirmation", "confirmed"].includes(normalizeBookingStatus(status))
}

export function canCompleteSession(status?: SessionStatus | string | null) {
  return ["upcoming", "scheduled"].includes(String(status || "").toLowerCase())
}
