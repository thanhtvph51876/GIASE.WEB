import type { Review } from "@/types"
import { apiPageRequest, apiRequest, type PageRequestParams } from "./client"
import { mapList, mapReview } from "./mappers"

export const reviewApi = {
  async list() {
    return mapList(await apiRequest<Review[]>("/reviews"), mapReview)
  },
  async adminList(params?: PageRequestParams) {
    return (await this.adminListPage(params)).items
  },
  adminListPage(params?: PageRequestParams) {
    return apiPageRequest<Review>("/admin/reviews", { params }, mapReview)
  },
  async byTutor(tutorId: string) {
    return mapList(await apiRequest<Review[]>(`/tutors/${tutorId}/reviews`, { auth: false }), mapReview)
  },
  async create(data: Partial<Review>) {
    return mapReview(await apiRequest<Review>("/reviews", { method: "POST", body: data }))
  },
  async status(id: string, status: "hide" | "show" | "flag") {
    return mapReview(await apiRequest<Review>(`/admin/reviews/${id}/${status}`, { method: "POST" }))
  },
}
