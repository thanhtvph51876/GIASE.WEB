import type { Class as LearningClass, ClassSession, LearningRequest, TrialBooking, User } from "@/types"
import { bookingService } from "./booking-service"
import { classService } from "./class-service"
import { learningRequestService } from "./learning-request-service"
import { scheduleService } from "./schedule-service"

export interface TrialScheduleInput {
  date: string
  startTime: string
  endTime: string
  mode: string
  location?: string
  note?: string
}

export interface TrialResultInput {
  result: "active" | "rematch" | "cancelled"
  note?: string
  scheduleText?: string
  feePerSession?: number
}

function ensureSchedule(schedule: TrialScheduleInput): void {
  if (!schedule.date || !schedule.startTime || !schedule.endTime) {
    throw new Error("Vui lòng chọn đầy đủ ngày, giờ bắt đầu và giờ kết thúc.")
  }
  if (schedule.mode === "offline" && !schedule.location?.trim()) {
    throw new Error("Vui lòng nhập địa điểm học offline.")
  }
  const start = new Date(`${schedule.date}T${schedule.startTime}:00`)
  const end = new Date(`${schedule.date}T${schedule.endTime}:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    throw new Error("Giờ kết thúc phải sau giờ bắt đầu.")
  }
}

class WorkflowService {
  async assignTutorToRequest(requestId: string, tutorId: string, _admin?: User | null): Promise<{ request: LearningRequest; booking: TrialBooking }> {
    const result = await learningRequestService.assignTutorWithBooking(requestId, tutorId)
    if (!result.success || !result.request || !result.booking) throw new Error(result.error || "Không thể gán gia sư.")
    return {
      request: result.request,
      booking: result.booking,
    }
  }

  async acceptTrialBooking(
    bookingId: string,
    _tutorId: string,
    selectedSchedule: TrialScheduleInput,
    _actor?: User | null
  ): Promise<{ booking: TrialBooking }> {
    ensureSchedule(selectedSchedule)
    const result = await bookingService.acceptBooking(bookingId, selectedSchedule)
    if (!result.success || !result.booking) throw new Error(result.error || "Không thể chấp nhận booking.")
    return { booking: result.booking }
  }

  async rejectTrialBooking(bookingId: string, _tutorId: string, reason: string, _actor?: User | null): Promise<TrialBooking> {
    const result = await bookingService.rejectBooking(bookingId, reason)
    if (!result.success || !result.booking) throw new Error(result.error || "Không thể từ chối booking.")
    return result.booking
  }

  async completeSession(sessionId: string, _actor?: User | null): Promise<ClassSession> {
    const result = await scheduleService.completeSession(sessionId)
    if (!result.success || !result.session) throw new Error(result.error || "Không thể hoàn thành buổi học.")
    return result.session
  }

  async activateLearningRequest(requestId: string, _actor?: User | null): Promise<{ request: LearningRequest; class?: LearningClass | null }> {
    const result = await learningRequestService.updateRequestStatus(requestId, "active")
    if (!result.success || !result.request) throw new Error(result.error || "Không thể kích hoạt yêu cầu.")
    return { request: result.request, class: null }
  }

  async resolveTrialResult(
    requestId: string,
    classId: string,
    input: TrialResultInput,
    actor?: User | null
  ): Promise<{ request: LearningRequest; class?: LearningClass | null }> {
    if (input.result === "active") return this.activateLearningRequest(requestId, actor)
    const requestStatus = input.result === "cancelled" ? "cancelled" : "consulting"
    const [requestResult, classResult] = await Promise.all([
      learningRequestService.updateRequestStatus(requestId, requestStatus),
      classService.updateClassStatus(classId, "cancelled", input.note),
    ])
    if (!requestResult.success || !requestResult.request) throw new Error(requestResult.error || "Không thể cập nhật kết quả học thử.")
    return { request: requestResult.request, class: classResult.class || null }
  }
}

export const workflowService = new WorkflowService()
