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
  CURRENT_USER: "giasusp_current_user",
  AUTH_TOKEN: "giasusp_auth_token",

  // Data
  USERS: "giasusp_users",
  TUTORS: "giasusp_tutors",
  LEARNING_REQUESTS: "giasusp_learning_requests",
  TRIAL_BOOKINGS: "giasusp_trial_bookings",
  CLASSES: "giasusp_classes",
  CLASS_SESSIONS: "giasusp_class_sessions",
  REVIEWS: "giasusp_reviews",
  PAYMENTS: "giasusp_payments",
  PAYOUTS: "giasusp_payouts",
  NOTIFICATIONS: "giasusp_notifications",
  CONVERSATIONS: "giasusp_conversations",
  MESSAGES: "giasusp_messages",
  AUDIT_LOGS: "giasusp_audit_logs",
  SETTINGS: "giasusp_settings",
  CONTACT_REQUESTS: "giasusp_contact_requests",
  TUTOR_DOCUMENTS: "giasusp_tutor_documents",
  STUDENT_PROFILES: "giasusp_student_profiles",
  PARENT_PROFILES: "giasusp_parent_profiles",

  // User preferences
  FAVORITE_TUTORS: "giasusp_favorite_tutors",
  TUTOR_FILTERS: "giasusp_tutor_filters",
  THEME: "giasusp_theme",
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
