import { apiRequest } from "@/lib/api/client"

export interface TrialBookingPayload {
  proposalId: string
  scheduledStartTime?: string
  scheduledEndTime?: string
  learningMode?: string
  location?: string
  meetingUrl?: string
  note?: string
}

class TrialBookingService {
  create(payload: TrialBookingPayload) {
    return apiRequest<Record<string, unknown>>("/trial-bookings", { method: "POST", body: payload })
  }

  get(id: string) {
    return apiRequest<Record<string, unknown>>(`/trial-bookings/${id}`)
  }

  confirm(id: string, payload?: Record<string, unknown>) {
    return apiRequest<Record<string, unknown>>(`/trial-bookings/${id}/confirm`, { method: "POST", body: payload || {} })
  }

  cancel(id: string, reason: string, note?: string) {
    return apiRequest<Record<string, unknown>>(`/trial-bookings/${id}/cancel`, { method: "POST", body: { reason, note } })
  }

  markNoShow(id: string, actorType: "parent" | "student" | "tutor", note?: string) {
    return apiRequest<Record<string, unknown>>(`/trial-bookings/${id}/mark-no-show`, {
      method: "POST",
      body: { actorType, note },
    })
  }

  complete(id: string, note?: string) {
    return apiRequest<Record<string, unknown>>(`/trial-bookings/${id}/complete`, { method: "POST", body: { note } })
  }

  convertToClass(id: string) {
    return apiRequest<Record<string, unknown>>(`/trial-bookings/${id}/convert-to-class`, { method: "POST" })
  }
}

export const trialBookingService = new TrialBookingService()
