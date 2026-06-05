import type { Notification } from "@/types"
import { apiPageRequest, apiRequest, type PageRequestParams } from "./client"
import { mapNotification } from "./mappers"

export const notificationApi = {
  async list(params?: PageRequestParams) {
    return (await this.listPage(params)).items
  },
  listPage(params?: PageRequestParams) {
    return apiPageRequest<Notification>("/notifications", { params }, mapNotification)
  },
  async adminList(params?: PageRequestParams) {
    return (await this.adminListPage(params)).items
  },
  adminListPage(params?: PageRequestParams) {
    return apiPageRequest<Notification>("/admin/notifications", { params }, mapNotification)
  },
  async unreadCount() {
    const data = await apiRequest<{ count: number }>("/notifications/unread-count")
    return data.count
  },
  read(id: string) {
    return apiRequest(`/notifications/${id}/read`, { method: "PATCH" })
  },
  readAll() {
    return apiRequest("/notifications/read-all", { method: "PATCH" })
  },
  delete(id: string) {
    return apiRequest(`/notifications/${id}`, { method: "DELETE" })
  },
  clear() {
    return apiRequest("/notifications", { method: "DELETE" })
  },
  send(data: Partial<Notification>) {
    return apiRequest("/admin/notifications/send", { method: "POST", body: data })
  },
  sendBulk(data: Partial<Notification> & { targetRole?: string; userIds?: string[] }) {
    return apiRequest<{ sent: boolean; count: number; targetRole?: string; recipientIds?: string[] }>("/admin/notifications/send-bulk", {
      method: "POST",
      body: data,
    })
  },
}
