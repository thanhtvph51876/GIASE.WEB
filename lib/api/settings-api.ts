import { apiRequest } from "./client"

export const settingsApi = {
  get() {
    return apiRequest("/admin/settings")
  },
  update(data: unknown) {
    return apiRequest("/admin/settings", { method: "PATCH", body: data })
  },
  systemList() {
    return apiRequest<Array<Record<string, unknown>>>("/admin/system-settings")
  },
  systemCreate(data: unknown) {
    return apiRequest<Record<string, unknown>>("/admin/system-settings", { method: "POST", body: data })
  },
  systemUpdate(key: string, data: unknown) {
    return apiRequest<Record<string, unknown>>(`/admin/system-settings/${encodeURIComponent(key)}`, { method: "PATCH", body: data })
  },
  systemHistory(key: string) {
    return apiRequest<Array<Record<string, unknown>>>(`/admin/system-settings/${encodeURIComponent(key)}/history`)
  },
  systemDelete(key: string) {
    return apiRequest<Record<string, unknown>>(`/admin/system-settings/${encodeURIComponent(key)}`, { method: "DELETE" })
  },
}
