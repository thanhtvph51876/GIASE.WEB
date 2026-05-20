import type { TrialBooking, TrialBookingFormData } from "@/types"
import { apiRequest } from "./client"
import { mapBooking, mapList } from "./mappers"

export const bookingApi = {
  async list() {
    return mapList(await apiRequest<TrialBooking[]>("/bookings"), mapBooking)
  },
  async tutorList() {
    return mapList(await apiRequest<TrialBooking[]>("/tutor/bookings"), mapBooking)
  },
  async adminList() {
    return mapList(await apiRequest<TrialBooking[]>("/admin/bookings"), mapBooking)
  },
  async get(id: string) {
    return mapBooking(await apiRequest<TrialBooking>(`/bookings/${id}`))
  },
  async create(tutorId: string, data: TrialBookingFormData, learningRequestId?: string) {
    return mapBooking(await apiRequest<TrialBooking>("/bookings", { method: "POST", body: { tutorId, ...data, learningRequestId } }))
  },
  async accept(id: string, schedule?: unknown) {
    return mapBooking(await apiRequest<TrialBooking>(`/tutor/bookings/${id}/accept`, { method: "POST", body: schedule || {} }))
  },
  async reject(id: string, reason: string) {
    return mapBooking(await apiRequest<TrialBooking>(`/tutor/bookings/${id}/reject`, { method: "POST", body: { reason } }))
  },
  async update(id: string, data: Partial<TrialBooking>) {
    const status = data.status
    if (status === "cancelled") return mapBooking(await apiRequest<TrialBooking>(`/bookings/${id}/cancel`, { method: "POST" }))
    return mapBooking(await apiRequest<TrialBooking>(`/admin/bookings/${id}/schedule`, { method: "POST", body: data }))
  },
  async schedule(id: string, data: unknown) {
    return mapBooking(await apiRequest<TrialBooking>(`/admin/bookings/${id}/schedule`, { method: "POST", body: data }))
  },
  async complete(id: string, resultNote?: string) {
    return mapBooking(await apiRequest<TrialBooking>(`/admin/bookings/${id}/complete`, { method: "POST", body: { resultNote } }))
  },
  async convertToClass(id: string, data?: unknown) {
    return apiRequest(`/admin/bookings/${id}/convert-to-class`, { method: "POST", body: data || {} })
  },
}
