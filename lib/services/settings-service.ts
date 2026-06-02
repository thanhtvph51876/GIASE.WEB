import type { SystemSetting, User } from "@/types"
import { settingsApi } from "@/lib/api/settings-api"

const defaultSettings: SystemSetting = {
  id: "system",
  bookingEnabled: true,
  tutorRegistrationEnabled: true,
  autoMatchingEnabled: true,
  commissionRate: 0.15,
  trialLessonPolicy: "Học thử 1 buổi, có thể chuyển thành lớp chính thức sau khi hoàn tất.",
  maintenanceMode: false,
  notificationSettings: {
    email: false,
    inApp: true,
    paymentAlerts: true,
    reviewAlerts: true,
  },
  updatedAt: "",
}

function mapSettings(value: unknown): SystemSetting {
  const raw = value && typeof value === "object" ? (value as Partial<SystemSetting>) : {}
  return {
    ...defaultSettings,
    ...raw,
    commissionRate:
      typeof raw.commissionRate === "number"
        ? raw.commissionRate
        : Number(raw.commissionRate ?? defaultSettings.commissionRate),
    notificationSettings: {
      ...defaultSettings.notificationSettings,
      ...(raw.notificationSettings || {}),
    },
  }
}

class SettingsService {
  async getSettings(): Promise<SystemSetting> {
    return this.loadSettings()
  }

  async loadSettings(): Promise<SystemSetting> {
    return mapSettings(await settingsApi.get())
  }

  async updateSettings(data: Partial<SystemSetting>, _actor?: User | null): Promise<{ success: boolean; settings: SystemSetting }> {
    const settings = mapSettings(await settingsApi.update(data))
    return { success: true, settings }
  }

  async getSystemSettings() {
    return settingsApi.systemList()
  }

  async upsertSystemSetting(input: { key: string; value: string; description?: string; type?: string; isSensitive?: boolean }, _actor?: User | null) {
    const payload = {
      key: input.key.trim(),
      value: parseSettingValue(input.value, input.type),
      description: input.description?.trim() || undefined,
      valueType: input.type || "string",
      isSensitive: Boolean(input.isSensitive),
    }
    if (!payload.key) throw new Error("Thiếu key cấu hình")
    return settingsApi.systemCreate(payload)
  }

  async updateSystemSetting(key: string, input: { value: string; description?: string; type?: string; isSensitive?: boolean; skipValue?: boolean }, _actor?: User | null) {
    return settingsApi.systemUpdate(key, {
      ...(input.skipValue ? {} : { value: parseSettingValue(input.value, input.type) }),
      description: input.description?.trim() || undefined,
      valueType: input.type || "string",
      isSensitive: Boolean(input.isSensitive),
    })
  }

  async getSystemSettingHistory(key: string) {
    if (!key.trim()) throw new Error("Thiếu key cấu hình")
    return settingsApi.systemHistory(key.trim())
  }

  async deleteSystemSetting(key: string, _actor?: User | null) {
    if (!key.trim()) throw new Error("Thiếu key cấu hình")
    return settingsApi.systemDelete(key.trim())
  }
}

export const settingsService = new SettingsService()

function parseSettingValue(value: string, type?: string) {
  if (type === "number") return Number(value)
  if (type === "boolean") return value === "true"
  if (type === "json") {
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }
  return value
}
