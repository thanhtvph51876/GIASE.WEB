import { apiRequest } from "./client"

export const settingsApi = {
  get() {
    return apiRequest("/admin/settings")
  },
  update(data: unknown) {
    return apiRequest("/admin/settings", { method: "PATCH", body: data })
  },
}
