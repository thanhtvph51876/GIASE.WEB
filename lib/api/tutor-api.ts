import type { Tutor, TutorApprovalEligibility, TutorDocument, TutorFilters, TutorRegistrationFormData, TutorSortBy } from "@/types"
import { apiPageRequest, apiRequest, type PageRequestParams, uploadFile } from "./client"
import { mapList, mapTutor, mapTutorDocument } from "./mappers"

export const tutorApi = {
  async getTutors(filters?: TutorFilters, sortBy: TutorSortBy = "best_match") {
    return (await this.getTutorsPage(filters, sortBy, { page: 1, pageSize: 100 })).items
  },
  getTutorsPage(filters?: TutorFilters, sortBy: TutorSortBy = "best_match", params: PageRequestParams = {}) {
    return apiPageRequest<Tutor>("/tutors", {
      auth: false,
      params: {
        page: params.page || 1,
        pageSize: params.pageSize || 24,
        q: filters?.keyword,
        subject: filters?.subject,
        gradeLevelId: filters?.grade,
        province: filters?.location,
        learningMode: filters?.teachingMode,
        minRate: filters?.minPrice,
        maxRate: filters?.maxPrice,
        minRating: filters?.minRating,
        verified: filters?.verified,
        gender: filters?.gender,
        sort: sortBy,
      },
    }, mapTutor)
  },
  async getAllTutors(params?: PageRequestParams) {
    return (await this.getAllTutorsPage(params)).items
  },
  getAllTutorsPage(params?: PageRequestParams) {
    return apiPageRequest<Tutor>("/admin/tutors", { params }, mapTutor)
  },
  async getTutorById(id: string) {
    return mapTutor(await apiRequest<Tutor>(`/tutors/${id}`, { auth: false }))
  },
  async getTutorByUserId(userId: string) {
    const data = await apiRequest<Tutor>("/tutor/profile")
    return data?.userId === userId ? mapTutor(data) : null
  },
  async getMyProfile() {
    return mapTutor(await apiRequest<Tutor>("/tutor/profile"))
  },
  async myApprovalEligibility() {
    return apiRequest<TutorApprovalEligibility>("/tutor/approval-eligibility")
  },
  async createTutorProfile(data: TutorRegistrationFormData) {
    return mapTutor(await apiRequest<Tutor>("/tutor/profile", { method: "PATCH", body: data }))
  },
  async updateTutorProfile(_id: string, data: Partial<Tutor>) {
    return mapTutor(await apiRequest<Tutor>("/tutor/profile", { method: "PATCH", body: data }))
  },
  async submitForReview() {
    return mapTutor(await apiRequest<Tutor>("/tutor/profile/submit", { method: "POST" }))
  },
  async documents() {
    return mapList(await apiRequest<TutorDocument[]>("/tutor/documents"), mapTutorDocument)
  },
  async uploadDocument(file: File, type: TutorDocument["type"] = "other") {
    const uploaded = await uploadFile(file)
    return mapTutorDocument(
      await apiRequest<TutorDocument>("/tutor/documents", {
        method: "POST",
        body: { ...uploaded, type },
      })
    )
  },
  async favoriteTutors() {
    return mapList(await apiRequest<Tutor[]>("/favorites/tutors"), mapTutor)
  },
  async favoriteTutorIds() {
    const result = await apiRequest<{ ids: string[] }>("/favorites/tutors/ids")
    return result.ids || []
  },
  async addFavoriteTutor(id: string) {
    return apiRequest<{ isFavorite: boolean; ids: string[] }>(`/favorites/tutors/${id}`, { method: "POST" })
  },
  async removeFavoriteTutor(id: string) {
    return apiRequest<{ isFavorite: boolean; ids: string[] }>(`/favorites/tutors/${id}`, { method: "DELETE" })
  },
  async approveTutor(id: string) {
    return mapTutor(await apiRequest<Tutor>(`/admin/tutors/${id}/approve`, { method: "POST" }))
  },
  async rejectTutor(id: string, reason: string) {
    return mapTutor(await apiRequest<Tutor>(`/admin/tutors/${id}/reject`, { method: "POST", body: { reason } }))
  },
  async requestTutorUpdate(id: string, note: string) {
    return mapTutor(await apiRequest<Tutor>(`/admin/tutors/${id}/request-update`, { method: "POST", body: { note } }))
  },
  async suspendTutor(id: string, reason: string) {
    return mapTutor(await apiRequest<Tutor>(`/admin/tutors/${id}/suspend`, { method: "POST", body: { reason } }))
  },
  async reactivateTutor(id: string) {
    return mapTutor(await apiRequest<Tutor>(`/admin/tutors/${id}/reactivate`, { method: "POST" }))
  },
  async approvalEligibility(id: string) {
    return apiRequest<TutorApprovalEligibility>(`/admin/tutors/${id}/approval-eligibility`)
  },
}
