import { apiRequest } from "./client"

export const contactApi = {
  create(data: unknown) {
    return apiRequest("/contact-requests", { method: "POST", body: data, auth: false })
  },
  list() {
    return apiRequest("/admin/contact-requests")
  },
  updateStatus(id: string, status: string, meta?: Record<string, unknown>) {
    return apiRequest(`/admin/contact-requests/${id}/status`, { method: "PATCH", body: { status, ...meta } })
  },
}
