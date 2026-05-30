import type { Notification } from "@/types"
import { apiRequest } from "./client"
import { mapList, mapNotification } from "./mappers"

export const notificationApi = {
  async list() {
    return mapList(await apiRequest<Notification[]>("/notifications"), mapNotification)
  },
  async adminList() {
    return mapList(await apiRequest<Notification[]>("/admin/notifications"), mapNotification)
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
}
