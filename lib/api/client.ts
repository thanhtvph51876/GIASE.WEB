import { STORAGE_KEYS } from "@/lib/storage"

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE"

interface ApiEnvelope<T> {
  success: boolean
  data?: T
  message?: string
  pagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  params?: Record<string, unknown>
  headers?: HeadersInit
  auth?: boolean
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1"
const PERSIST_BROWSER_TOKENS = process.env.NODE_ENV !== "production"
let memoryAccessToken: string | null = null
let memoryRefreshToken: string | null = null

export const tokenStore = {
  get accessToken() {
    if (typeof window === "undefined") return null
    if (!PERSIST_BROWSER_TOKENS) return memoryAccessToken
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
  },
  set accessToken(token: string | null) {
    if (typeof window === "undefined") return
    memoryAccessToken = token
    if (!PERSIST_BROWSER_TOKENS) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      return
    }
    if (token) localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
    else localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  },
  get refreshToken() {
    if (typeof window === "undefined") return null
    if (!PERSIST_BROWSER_TOKENS) return memoryRefreshToken
    return localStorage.getItem("giasusp_refresh_token")
  },
  set refreshToken(token: string | null) {
    if (typeof window === "undefined") return
    memoryRefreshToken = token
    if (!PERSIST_BROWSER_TOKENS) {
      localStorage.removeItem("giasusp_refresh_token")
      return
    }
    if (token) localStorage.setItem("giasusp_refresh_token", token)
    else localStorage.removeItem("giasusp_refresh_token")
  },
  clear() {
    this.accessToken = null
    this.refreshToken = null
  },
}

export class ApiClientError extends Error {
  code: string
  status: number
  details?: unknown

  constructor(message: string, code = "API_ERROR", status = 500, details?: unknown) {
    super(message)
    this.name = "ApiClientError"
    this.code = code
    this.status = status
    this.details = details
  }
}

function buildUrl(path: string, params?: Record<string, unknown>) {
  const url = new URL(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`)
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return
    url.searchParams.set(key, String(value))
  })
  return url.toString()
}

async function refreshAccessToken() {
  const refreshToken = tokenStore.refreshToken
  if (!refreshToken) return false
  try {
    const response = await fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
    if (!response.ok) return false
    const envelope = (await response.json()) as ApiEnvelope<{
      accessToken: string
      refreshToken?: string
    }>
    if (!envelope.success || !envelope.data?.accessToken) return false
    tokenStore.accessToken = envelope.data.accessToken
    if (envelope.data.refreshToken) tokenStore.refreshToken = envelope.data.refreshToken
    return true
  } catch {
    return false
  }
}

async function parseEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  const contentType = response.headers.get("content-type") || ""
  if (!contentType.includes("application/json")) {
    const text = await response.text()
    return {
      success: response.ok,
      data: text as T,
      error: response.ok ? undefined : { code: "HTTP_ERROR", message: text },
    }
  }
  return response.json()
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData
  if (!isFormData && options.body !== undefined) headers.set("Content-Type", "application/json")
  if (options.auth !== false && tokenStore.accessToken) {
    headers.set("Authorization", `Bearer ${tokenStore.accessToken}`)
  }

  const requestInit: RequestInit = {
    method: options.method || "GET",
    headers,
    body:
      options.body === undefined
        ? undefined
        : isFormData
          ? (options.body as FormData)
          : JSON.stringify(options.body),
  }

  let response = await fetch(buildUrl(path, options.params), requestInit)
  if (response.status === 401 && options.auth !== false && (await refreshAccessToken())) {
    headers.set("Authorization", `Bearer ${tokenStore.accessToken}`)
    response = await fetch(buildUrl(path, options.params), requestInit)
  }

  const envelope = await parseEnvelope<T>(response)
  if (!response.ok || !envelope.success) {
    const message = envelope.error?.message || "Không thể kết nối tới backend"
    throw new ApiClientError(message, envelope.error?.code, response.status, envelope.error?.details)
  }
  return envelope.data as T
}

export async function uploadFile(file: File, options?: { visibility?: "public" | "private"; purpose?: string }) {
  const form = new FormData()
  form.append("file", file)
  if (options?.visibility) form.append("visibility", options.visibility)
  if (options?.purpose) form.append("purpose", options.purpose)
  return apiRequest<{
    id: string
    fileId: string
    fileName: string
    originalFileName: string
    fileUrl: string
    fileSize: number
    mimeType: string
    visibility: "public" | "private"
    purpose?: string
    sha256Hash?: string
    duplicateFile?: boolean
    riskScore?: number
  }>("/uploads", { method: "POST", body: form })
}

export function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return "Có lỗi xảy ra, vui lòng thử lại"
}
