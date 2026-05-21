import type { LearningRequest, LearningRequestStatus, StudentRegistrationFormData, TrialBooking } from "@/types"
import { apiRequest } from "./client"
import { mapBooking, mapLearningRequest, mapList } from "./mappers"

interface AssignTutorResponse {
  learningRequest?: LearningRequest
  booking?: TrialBooking
}

export const learningRequestApi = {
  async list() {
    return mapList(await apiRequest<LearningRequest[]>("/learning-requests"), mapLearningRequest)
  },
  async studentList() {
    return mapList(await apiRequest<LearningRequest[]>("/student/learning-requests/me"), mapLearningRequest)
  },
  async publicList() {
    return mapList(await apiRequest<LearningRequest[]>("/public/learning-requests", { auth: false }), mapLearningRequest)
  },
  async adminList() {
    return mapList(await apiRequest<LearningRequest[]>("/admin/learning-requests"), mapLearningRequest)
  },
  async get(id: string) {
    return mapLearningRequest(await apiRequest<LearningRequest>(`/learning-requests/${id}`))
  },
  async create(data: StudentRegistrationFormData) {
    return mapLearningRequest(await apiRequest<LearningRequest>("/learning-requests", { method: "POST", body: data }))
  },
  async createStudent(data: StudentRegistrationFormData) {
    return mapLearningRequest(await apiRequest<LearningRequest>("/student/learning-requests", { method: "POST", body: data }))
  },
  async createPublic(data: StudentRegistrationFormData) {
    return mapLearningRequest(await apiRequest<LearningRequest>("/public/learning-requests", { method: "POST", body: data, auth: false }))
  },
  async update(id: string, data: Partial<LearningRequest>) {
    return mapLearningRequest(await apiRequest<LearningRequest>(`/learning-requests/${id}`, { method: "PATCH", body: data }))
  },
  async updateStatus(id: string, status: LearningRequestStatus) {
    return mapLearningRequest(await apiRequest<LearningRequest>(`/admin/learning-requests/${id}/status`, { method: "PATCH", body: { status } }))
  },
  async assignTutor(id: string, tutorId: string) {
    const result = await apiRequest<AssignTutorResponse | LearningRequest>(`/admin/learning-requests/${id}/assign-tutor`, { method: "POST", body: { tutorId } })
    const payload = result as AssignTutorResponse
    return mapLearningRequest(payload.learningRequest || result)
  },
  async assignTutorWithBooking(id: string, tutorId: string) {
    const result = await apiRequest<AssignTutorResponse>(`/admin/learning-requests/${id}/assign-tutor-with-booking`, { method: "POST", body: { tutorId } })
    return {
      learningRequest: mapLearningRequest(result.learningRequest),
      booking: result.booking ? mapBooking(result.booking) : undefined,
    }
  },
  async cancel(id: string) {
    return mapLearningRequest(await apiRequest<LearningRequest>(`/learning-requests/${id}/cancel`, { method: "POST" }))
  },
  matchingTutors(id: string) {
    return apiRequest(`/admin/learning-requests/${id}/matching-tutors`)
  },
}
