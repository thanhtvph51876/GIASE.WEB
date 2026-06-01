import type { ContactRequest } from "@/types"
import { apiPageRequest, apiRequest, type PageRequestParams } from "./client"

export const contactApi = {
  create(data: unknown) {
    return apiRequest("/contact-requests", { method: "POST", body: data, auth: false })
  },
  async list(params?: PageRequestParams) {
    return (await this.listPage(params)).items
  },
  listPage(params?: PageRequestParams) {
    return apiPageRequest<ContactRequest>("/admin/contact-requests", { params })
  },
  updateStatus(id: string, status: string, meta?: Record<string, unknown>) {
    return apiRequest(`/admin/contact-requests/${id}/status`, { method: "PATCH", body: { status, ...meta } })
  },
}
