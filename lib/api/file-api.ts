import { ApiClientError, tokenStore } from "./client"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (process.env.NODE_ENV === "production" ? "" : "http://localhost:8080/api/v1")

function fileUrl(fileIdOrPath: string) {
  if (!API_BASE_URL) {
    throw new ApiClientError("NEXT_PUBLIC_API_BASE_URL chưa được cấu hình cho production.", "API_BASE_URL_MISSING", 500)
  }
  const origin = API_BASE_URL.replace(/\/api\/v1\/?$/, "")
  if (fileIdOrPath.startsWith("http")) return fileIdOrPath
  if (fileIdOrPath.startsWith("/api/v1/")) return `${origin}${fileIdOrPath}`
  const id = fileIdOrPath.split("/").filter(Boolean).at(-1) || fileIdOrPath
  return `${API_BASE_URL}/files/${id}`
}

export const fileApi = {
  async getFileBlob(fileIdOrPath: string) {
    const headers = new Headers()
    if (tokenStore.accessToken) headers.set("Authorization", `Bearer ${tokenStore.accessToken}`)
    const response = await fetch(fileUrl(fileIdOrPath), { headers })
    if (!response.ok) {
      let message = response.status === 403 ? "Bạn không có quyền xem file này" : "Không thể mở file."
      try {
        const payload = await response.json()
        message = payload?.error?.message || message
      } catch {
        // Non-JSON file errors keep the status-based message above.
      }
      throw new ApiClientError(message, response.status === 403 ? "FORBIDDEN" : "FILE_ERROR", response.status)
    }
    return response.blob()
  },
}
