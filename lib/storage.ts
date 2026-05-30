// ============================================
// LOCAL STORAGE HELPER
// Abstraction layer for localStorage operations
// Easy to replace with API calls later
// ============================================

const isBrowser = typeof window !== "undefined"

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    if (!isBrowser) return defaultValue
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },

  set<T>(key: string, value: T): void {
    if (!isBrowser) return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error)
    }
  },

  remove(key: string): void {
    if (!isBrowser) return
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  },

  clear(): void {
    if (!isBrowser) return
    try {
      localStorage.clear()
    } catch (error) {
      console.error("Error clearing localStorage:", error)
    }
  },
}

// ============================================
// STORAGE KEYS
// Centralized key management
// ============================================

export const STORAGE_KEYS = {
  // Auth
  AUTH_TOKEN: "giasusp_auth_token",
  AUTH_REFRESH_TOKEN: "giasusp_refresh_token",
  AUTH_USER: "giasusp_auth_user",

  // User preferences
  THEME: "giasusp_theme",
  REMEMBERED_EMAIL: "giasusp_remembered_email",
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
