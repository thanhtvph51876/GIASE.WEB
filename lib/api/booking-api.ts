import type { PublicTrialBookingRequestResult, TrialBooking, TrialBookingFormData } from "@/types"
import { apiPageRequest, apiRequest, type PageRequestParams } from "./client"
import { mapBooking, mapList } from "./mappers"

function bookingSchedulePayload(data: unknown) {
  if (data && typeof data === "object" && "schedule" in data) {
    const schedule = (data as { schedule?: unknown }).schedule
    if (schedule && typeof schedule === "object") {
      return { ...(data as Record<string, unknown>), ...(schedule as Record<string, unknown>) }
    }
  }
  return data
}

export const bookingApi = {
  async list() {
    return mapList(await apiRequest<TrialBooking[]>("/bookings"), mapBooking)
  },
  async tutorList() {
    return mapList(await apiRequest<TrialBooking[]>("/tutor/bookings"), mapBooking)
  },
  async adminList(params?: PageRequestParams) {
    return (await this.adminListPage(params)).items
  },
  adminListPage(params?: PageRequestParams) {
    return apiPageRequest<TrialBooking>("/admin/bookings", { params }, mapBooking)
  },
  async adminGet(id: string) {
    return mapBooking(await apiRequest<TrialBooking>(`/admin/bookings/${id}`))
  },
  async get(id: string) {
    return mapBooking(await apiRequest<TrialBooking>(`/bookings/${id}`))
  },
  async create(tutorId: string, data: TrialBookingFormData, learningRequestId?: string) {
    return mapBooking(await apiRequest<TrialBooking>("/bookings", { method: "POST", body: { tutorId, ...data, learningRequestId } }))
  },
  async createPublicTrialRequest(tutorId: string, data: TrialBookingFormData) {
    return apiRequest<PublicTrialBookingRequestResult>("/public/trial-booking-requests", {
      method: "POST",
      auth: false,
      body: {
        tutorId,
        studentName: data.studentName,
        parentName: data.parentName,
        phone: data.phone,
        email: data.email,
        subject: data.subject,
        grade: data.grade,
        preferredSchedule: data.preferredTime,
        note: data.message,
      },
    })
  },
  async accept(id: string, schedule?: unknown) {
    return mapBooking(await apiRequest<TrialBooking>(`/tutor/bookings/${id}/accept`, { method: "POST", body: schedule || {} }))
  },
  async reject(id: string, reason: string) {
    return mapBooking(await apiRequest<TrialBooking>(`/tutor/bookings/${id}/reject`, { method: "POST", body: { reason } }))
  },
  async update(id: string, data: Partial<TrialBooking>) {
    const status = data.status
    if (status === "cancelled") {
      return mapBooking(await apiRequest<TrialBooking>(`/bookings/${id}/cancel`, {
        method: "POST",
        body: { reason: data.rejectReason || data.resultNote },
      }))
    }
    return mapBooking(await apiRequest<TrialBooking>(`/admin/bookings/${id}/schedule`, { method: "POST", body: bookingSchedulePayload(data) }))
  },
  async schedule(id: string, data: unknown) {
    return mapBooking(await apiRequest<TrialBooking>(`/admin/bookings/${id}/schedule`, { method: "POST", body: bookingSchedulePayload(data) }))
  },
  async adminAssignTutor(id: string, tutorId: string) {
    return mapBooking(await apiRequest<TrialBooking>(`/admin/bookings/${id}/assign-tutor`, { method: "POST", body: { tutorId } }))
  },
  async complete(id: string, resultNote?: string) {
    return mapBooking(await apiRequest<TrialBooking>(`/admin/bookings/${id}/complete`, { method: "POST", body: { resultNote } }))
  },
  async adminMarkNoShowStudent(id: string, note?: string) {
    return mapBooking(await apiRequest<TrialBooking>(`/admin/bookings/${id}/mark-no-show-student`, { method: "POST", body: { note } }))
  },
  async adminMarkNoShowTutor(id: string, note?: string) {
    return mapBooking(await apiRequest<TrialBooking>(`/admin/bookings/${id}/mark-no-show-tutor`, { method: "POST", body: { note } }))
  },
  async convertToClass(id: string, data?: unknown) {
    return apiRequest(`/admin/bookings/${id}/convert-to-class`, { method: "POST", body: data || {} })
  },
  async adminCancel(id: string, reason?: string) {
    return mapBooking(await apiRequest<TrialBooking>(`/admin/bookings/${id}/cancel`, { method: "POST", body: { reason } }))
  },
}
