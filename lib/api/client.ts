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
const TOKEN_STORAGE_MODE = process.env.NEXT_PUBLIC_AUTH_TOKEN_STORAGE || "local"
const PERSIST_BROWSER_TOKENS = TOKEN_STORAGE_MODE !== "memory"
const API_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS || 15000)
export const AUTH_EXPIRED_EVENT = "giasusp:auth-expired"
export const API_ERROR_EVENT = "giasusp:api-error"
let memoryAccessToken: string | null = null
let memoryRefreshToken: string | null = null
let refreshPromise: Promise<boolean> | null = null

if (process.env.NODE_ENV !== "production" && !process.env.NEXT_PUBLIC_API_BASE_URL) {
  console.warn(
    "NEXT_PUBLIC_API_BASE_URL is not configured. Falling back to http://localhost:8080/api/v1."
  )
}

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
    return localStorage.getItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN)
  },
  set refreshToken(token: string | null) {
    if (typeof window === "undefined") return
    memoryRefreshToken = token
    if (!PERSIST_BROWSER_TOKENS) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN)
      return
    }
    if (token) localStorage.setItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN, token)
    else localStorage.removeItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN)
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

export function getApiBaseUrl() {
  return API_BASE_URL
}

export function isAuthApiError(error: unknown) {
  return error instanceof ApiClientError && (error.status === 401 || error.status === 403)
}

export function isTransientApiError(error: unknown) {
  return error instanceof ApiClientError && (error.status === 0 || error.status >= 500)
}

function emitAuthExpired() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT))
}

function emitApiError(error: ApiClientError, path: string) {
  if (typeof window === "undefined") return
  if (![0, 403].includes(error.status) && error.status < 500) return
  window.dispatchEvent(
    new CustomEvent(API_ERROR_EVENT, {
      detail: {
        code: error.code,
        status: error.status,
        message: error.message,
        path,
      },
    })
  )
}

function toNetworkError(error: unknown) {
  const aborted = error instanceof Error && error.name === "AbortError"
  return new ApiClientError(
    aborted
      ? "Backend phản hồi quá lâu. Vui lòng thử lại sau."
      : "Không thể kết nối tới backend. Vui lòng kiểm tra API server hoặc thử lại sau.",
    aborted ? "API_TIMEOUT" : "NETWORK_ERROR",
    0,
    { apiBaseUrl: API_BASE_URL }
  )
}

async function fetchWithTimeout(url: string, init: RequestInit) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS)
  try {
    return await fetch(url, { credentials: "include", ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise
  refreshPromise = doRefreshAccessToken().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

async function doRefreshAccessToken() {
  const refreshToken = tokenStore.refreshToken
  const headers = new Headers()
  headers.set("Content-Type", "application/json")
  try {
    const response = await fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      credentials: "include",
      headers,
      body: refreshToken ? JSON.stringify({ refreshToken }) : JSON.stringify({}),
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

  const url = buildUrl(path, options.params)
  let response: Response
  try {
    response = await fetchWithTimeout(url, requestInit)
  } catch (error) {
    const apiError = toNetworkError(error)
    emitApiError(apiError, path)
    throw apiError
  }

  if (response.status === 401 && options.auth !== false && (await refreshAccessToken())) {
    headers.set("Authorization", `Bearer ${tokenStore.accessToken}`)
    try {
      response = await fetchWithTimeout(url, requestInit)
    } catch (error) {
      const apiError = toNetworkError(error)
      emitApiError(apiError, path)
      throw apiError
    }
  }

  let envelope: ApiEnvelope<T>
  try {
    envelope = await parseEnvelope<T>(response)
  } catch (error) {
    const apiError = new ApiClientError(
      "Backend trả về phản hồi không hợp lệ.",
      "INVALID_API_RESPONSE",
      response.status || 500,
      { apiBaseUrl: API_BASE_URL }
    )
    emitApiError(apiError, path)
    throw apiError
  }

  if (!response.ok || !envelope.success) {
    const message = envelope.error?.message || "Không thể kết nối tới backend"
    const apiError = new ApiClientError(message, envelope.error?.code, response.status, envelope.error?.details)
    if (response.status === 401 && options.auth !== false) {
      tokenStore.clear()
      emitAuthExpired()
    } else {
      emitApiError(apiError, path)
    }
    throw apiError
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
