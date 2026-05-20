import type { Notification } from "@/types"
import { apiRequest } from "./client"
import { mapList, mapNotification } from "./mappers"

export const notificationApi = {
  async list() {
    return mapList(await apiRequest<Notification[]>("/notifications"), mapNotification)
  },
  async unreadCount() {
    const data = await apiRequest<{ count: number }>("/notifications/unread-count")
    return data.count
  },
  read(id: string) {
    return apiRequest(`/notifications/${id}/read`, { method: "POST" })
  },
  readAll() {
    return apiRequest("/notifications/read-all", { method: "POST" })
  },
  send(data: Partial<Notification>) {
    return apiRequest("/admin/notifications/send", { method: "POST", body: data })
  },
}
