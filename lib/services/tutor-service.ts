import type { Tutor, TutorApprovalEligibility, TutorDocument, TutorFilters, TutorRegistrationFormData, TutorSortBy, User } from "@/types"
import { tutorApi } from "@/lib/api/tutor-api"
import { ApiClientError } from "@/lib/api/client"

class TutorService {
  private favoriteIdsByUser = new Map<string, string[]>()

  async getTutors(filters?: TutorFilters, sortBy: TutorSortBy = "best_match"): Promise<Tutor[]> {
    return tutorApi.getTutors(filters, sortBy)
  }

  async getAllTutors(): Promise<Tutor[]> {
    return tutorApi.getAllTutors()
  }

  async getFeaturedTutors(limit: number = 3): Promise<Tutor[]> {
    const tutors = await this.getTutors({ verified: true }, "rating_desc")
    return tutors.slice(0, limit)
  }

  filterTutors(tutors: Tutor[], filters: TutorFilters): Tutor[] {
    return tutors.filter((tutor) => {
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase()
        const matches =
          tutor.fullName.toLowerCase().includes(keyword) ||
          tutor.subjects.some((subject) => subject.toLowerCase().includes(keyword)) ||
          tutor.locations.some((location) => location.toLowerCase().includes(keyword))
        if (!matches) return false
      }
      if (filters.subject && !tutor.subjects.includes(filters.subject)) return false
      if (filters.grade && !tutor.grades.includes(filters.grade)) return false
      if (filters.location && !tutor.locations.includes(filters.location)) return false
      if (filters.teachingMode && tutor.teachingModes !== "both" && tutor.teachingModes !== filters.teachingMode) return false
      if (filters.minPrice && tutor.pricePerHour < filters.minPrice) return false
      if (filters.maxPrice && tutor.pricePerHour > filters.maxPrice) return false
      if (filters.minRating && tutor.rating < filters.minRating) return false
      if (filters.verified !== undefined && tutor.verified !== filters.verified) return false
      if (filters.gender && tutor.gender !== filters.gender) return false
      return true
    })
  }

  sortTutors(tutors: Tutor[], sortBy: TutorSortBy): Tutor[] {
    const sorted = [...tutors]
    if (sortBy === "rating_desc") return sorted.sort((a, b) => b.rating - a.rating)
    if (sortBy === "price_asc") return sorted.sort((a, b) => a.pricePerHour - b.pricePerHour)
    if (sortBy === "price_desc") return sorted.sort((a, b) => b.pricePerHour - a.pricePerHour)
    if (sortBy === "experience_desc") return sorted.sort((a, b) => b.experienceYears - a.experienceYears)
    if (sortBy === "newest") return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return sorted
  }

  async getTutorById(id: string): Promise<Tutor | null> {
    try {
      return await tutorApi.getTutorById(id)
    } catch {
      return null
    }
  }

  async createTutorProfile(data: TutorRegistrationFormData, _userId: string) {
    try {
      const tutor = await tutorApi.createTutorProfile(data)
      await tutorApi.submitForReview()
      return { success: true, tutor }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể tạo hồ sơ gia sư" }
    }
  }

  async updateTutorProfile(_id: string, data: Partial<Tutor>) {
    try {
      const tutor = await tutorApi.updateTutorProfile(_id, data)
      return { success: true, tutor }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể cập nhật hồ sơ gia sư" }
    }
  }

  async getTutorByUserId(userId: string): Promise<Tutor | null> {
    try {
      return await tutorApi.getTutorByUserId(userId)
    } catch {
      return null
    }
  }

  async getPendingTutors(): Promise<Tutor[]> {
    const tutors = await this.getAllTutors()
    return tutors.filter((tutor) =>
      ["submitted", "pending", "pending_verification", "needs_more_documents", "need_update", "verified"].includes(tutor.approvalStatus)
    )
  }

  async getApprovalEligibility(id: string): Promise<TutorApprovalEligibility> {
    return tutorApi.approvalEligibility(id)
  }

  async getMyApprovalEligibility(): Promise<TutorApprovalEligibility> {
    return tutorApi.myApprovalEligibility()
  }

  async approveTutor(id: string) {
    return this.wrapTutor(() => tutorApi.approveTutor(id))
  }

  async rejectTutor(id: string, reason: string) {
    return this.wrapTutor(() => tutorApi.rejectTutor(id, reason))
  }

  async requestTutorUpdate(id: string, note: string, _actor?: User | null) {
    return this.wrapTutor(() => tutorApi.requestTutorUpdate(id, note))
  }

  async suspendTutor(id: string, reason: string, _actor?: User | null) {
    return this.wrapTutor(() => tutorApi.suspendTutor(id, reason))
  }

  async reactivateTutor(id: string, _actor?: User | null) {
    return this.wrapTutor(() => tutorApi.reactivateTutor(id))
  }

  async submitForReview(_id: string) {
    return this.wrapTutor(() => tutorApi.submitForReview())
  }

  async uploadDocument(
    _tutorId: string,
    file: { name: string; size: number; type: string },
    type: TutorDocument["type"] = "other"
  ) {
    if (typeof File === "undefined" || !(file instanceof File)) {
      return { success: false, error: "Vui lòng chọn file thật để upload" }
    }
    try {
      const document = await tutorApi.uploadDocument(file, type)
      return { success: true, document }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Upload thất bại" }
    }
  }

  async reviewDocument(
    _tutorId: string,
    documentId: string,
    status: TutorDocument["status"],
    note?: string
  ) {
    try {
      const path =
        status === "approved"
          ? `/admin/tutor-documents/${documentId}/approve`
          : `/admin/tutor-documents/${documentId}/reject`
      const { apiRequest } = await import("@/lib/api/client")
      const document = await apiRequest<TutorDocument>(path, { method: "POST", body: { note } })
      return { success: true, document }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể duyệt giấy tờ" }
    }
  }

  getFavoriteTutorIds(userId: string): string[] {
    return this.favoriteIdsByUser.get(userId) || []
  }

  async toggleFavorite(userId: string, tutorId: string): Promise<{ isFavorite: boolean }> {
    const currentIds = this.favoriteIdsByUser.get(userId) || (await tutorApi.favoriteTutorIds())
    const result = currentIds.includes(tutorId)
      ? await tutorApi.removeFavoriteTutor(tutorId)
      : await tutorApi.addFavoriteTutor(tutorId)
    this.favoriteIdsByUser.set(userId, result.ids || [])
    return { isFavorite: result.isFavorite }
  }

  async getFavoriteTutors(userId: string): Promise<Tutor[]> {
    const tutors = await tutorApi.favoriteTutors()
    this.favoriteIdsByUser.set(userId, tutors.map((tutor) => tutor.id))
    return tutors
  }

  private async wrapTutor(action: () => Promise<Tutor>) {
    try {
      const tutor = await action()
      return { success: true, tutor }
    } catch (error) {
      return { success: false, error: this.formatError(error) }
    }
  }

  private formatError(error: unknown) {
    if (error instanceof ApiClientError) {
      const details = error.details as { reasons?: string[] } | { eligibility?: { reasons?: string[] } } | undefined
      const directReasons = details && "reasons" in details ? details.reasons : undefined
      const nestedReasons = details && "eligibility" in details ? details.eligibility?.reasons : undefined
      const reasons = directReasons || nestedReasons || []
      return reasons.length ? `${error.message} (${reasons.join(", ")})` : error.message
    }
    return error instanceof Error ? error.message : "Thao tác thất bại"
  }
}

export const tutorService = new TutorService()
