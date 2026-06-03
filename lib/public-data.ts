import { ApiClientError } from "@/lib/api/client"
import { mapLearningRequest, mapTutor } from "@/lib/api/mappers"
import type { Certificate, GradeLevel, LearningRequest, Location, Subject, TeachingModeOption, Tutor } from "@/types"

export const PUBLIC_DATA_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_PUBLIC_DATA_TIMEOUT_MS || 8000)

export interface NormalizedApiError {
  code: string
  message: string
  status?: number
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = PUBLIC_DATA_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiClientError("Backend phản hồi quá lâu. Vui lòng thử lại.", "API_TIMEOUT", 0)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

export function normalizeApiError(error: unknown, fallback = "Không thể tải dữ liệu. Vui lòng thử lại."): NormalizedApiError {
  if (error instanceof ApiClientError) {
    return {
      code: error.code || "API_ERROR",
      message: error.message || fallback,
      status: error.status,
    }
  }

  if (error instanceof Error) {
    return {
      code: error.name === "AbortError" ? "API_TIMEOUT" : "PUBLIC_DATA_ERROR",
      message: error.message || fallback,
    }
  }

  return {
    code: "PUBLIC_DATA_ERROR",
    message: fallback,
  }
}

export async function retryGet<T>(
  fetcher: () => Promise<T>,
  options: { retries?: number; delayMs?: number } = {}
): Promise<T> {
  const retries = options.retries ?? 1
  const delayMs = options.delayMs ?? 350
  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fetcher()
    } catch (error) {
      lastError = error
      const normalized = normalizeApiError(error)
      const canRetry = normalized.status === undefined || normalized.status === 0 || normalized.status >= 500
      if (!canRetry || attempt === retries) break
      await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)))
    }
  }

  throw lastError
}

export async function safeGetPublicData<T>(
  fetcher: () => Promise<T>,
  fallback: T,
  options: { retries?: number; label?: string } = {}
): Promise<{ data: T; error: NormalizedApiError | null }> {
  try {
    const data = await retryGet(fetcher, { retries: options.retries })
    return { data, error: null }
  } catch (error) {
    return {
      data: fallback,
      error: normalizeApiError(error, `${options.label || "Dữ liệu public"} chưa sẵn sàng. Vui lòng thử lại.`),
    }
  }
}

export function mapBackendTutorToViewModel(value: unknown): Tutor {
  return mapTutor(value)
}

export function mapBackendRequestToViewModel(value: unknown): LearningRequest {
  return mapLearningRequest(value)
}

export function withPublicTimeout<T>(promise: Promise<T>, label: string, timeoutMs = PUBLIC_DATA_TIMEOUT_MS): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} phản hồi quá lâu. Vui lòng thử lại.`))
    }, timeoutMs)
  })

  return Promise.race([promise, timeout]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId)
  })
}

export const fallbackSubjects: Subject[] = [
  { id: "fallback-math", name: "Toán", icon: "calculator", tutorCount: 0, isActive: true },
  { id: "fallback-english", name: "Tiếng Anh", icon: "language", tutorCount: 0, isActive: true },
  { id: "fallback-physics", name: "Vật lý", icon: "atom", tutorCount: 0, isActive: true },
  { id: "fallback-chemistry", name: "Hóa học", icon: "flask", tutorCount: 0, isActive: true },
  { id: "fallback-literature", name: "Ngữ văn", icon: "book", tutorCount: 0, isActive: true },
  { id: "fallback-biology", name: "Sinh học", icon: "leaf", tutorCount: 0, isActive: true },
  { id: "fallback-ielts", name: "IELTS", icon: "globe", tutorCount: 0, isActive: true },
  { id: "fallback-informatics", name: "Tin học", icon: "monitor", tutorCount: 0, isActive: true },
]

export const fallbackGrades: GradeLevel[] = [
  { id: "fallback-grade-1", name: "Lớp 1", group: "Tiểu học", isActive: true },
  { id: "fallback-grade-2", name: "Lớp 2", group: "Tiểu học", isActive: true },
  { id: "fallback-grade-3", name: "Lớp 3", group: "Tiểu học", isActive: true },
  { id: "fallback-grade-4", name: "Lớp 4", group: "Tiểu học", isActive: true },
  { id: "fallback-grade-5", name: "Lớp 5", group: "Tiểu học", isActive: true },
  { id: "fallback-grade-6", name: "Lớp 6", group: "THCS", isActive: true },
  { id: "fallback-grade-7", name: "Lớp 7", group: "THCS", isActive: true },
  { id: "fallback-grade-8", name: "Lớp 8", group: "THCS", isActive: true },
  { id: "fallback-grade-9", name: "Lớp 9", group: "THCS", isActive: true },
  { id: "fallback-grade-10", name: "Lớp 10", group: "THPT", isActive: true },
  { id: "fallback-grade-11", name: "Lớp 11", group: "THPT", isActive: true },
  { id: "fallback-grade-12", name: "Lớp 12", group: "THPT", isActive: true },
]

export const fallbackLocations: Location[] = [
  { id: "fallback-hcm", name: "TP. Hồ Chí Minh", fullPath: "TP. Hồ Chí Minh", type: "PROVINCE", isActive: true },
  { id: "fallback-hanoi", name: "Hà Nội", fullPath: "Hà Nội", type: "PROVINCE", isActive: true },
  { id: "fallback-danang", name: "Đà Nẵng", fullPath: "Đà Nẵng", type: "PROVINCE", isActive: true },
  { id: "fallback-online", name: "Online toàn quốc", fullPath: "Online toàn quốc", type: "ONLINE", isActive: true },
]

export const fallbackTeachingModes: TeachingModeOption[] = [
  { id: "fallback-online-mode", name: "Online", code: "ONLINE", value: "online", label: "Online", isActive: true },
  { id: "fallback-offline-mode", name: "Offline", code: "OFFLINE", value: "offline", label: "Offline", isActive: true },
  { id: "fallback-both-mode", name: "Online hoặc Offline", code: "HYBRID", value: "both", label: "Online hoặc Offline", isActive: true },
]

export const fallbackCertificates: Certificate[] = [
  { id: "fallback-student-card", name: "Thẻ sinh viên", code: "STUDENT_CARD", isActive: true },
  { id: "fallback-degree", name: "Bằng cấp/chứng chỉ", code: "DEGREE", isActive: true },
]

export const fallbackMasterDataCatalog = {
  subjects: fallbackSubjects,
  grades: fallbackGrades,
  locations: fallbackLocations,
  teachingModes: fallbackTeachingModes,
  certificates: fallbackCertificates,
}
